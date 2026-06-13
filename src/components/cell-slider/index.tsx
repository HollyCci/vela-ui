import {
  createContext,
  forwardRef,
  useContext,
  type ComponentProps,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';
import {
  Slider,
  type SliderFillProps,
  type SliderOutputProps,
  type SliderProps,
  type SliderThumbProps,
  type SliderTrackProps,
} from '@heroui/react';
import clsx from 'clsx';

export type CellSliderVariant = 'default' | 'secondary';

/** 原站 API：恒为水平方向（orientation 移除）；variant 是 cell-slider 自己的视觉变体，落在 Track 修饰类上 */
export type CellSliderProps = Omit<
  SliderProps,
  'className' | 'style' | 'variant' | 'orientation'
> & {
  variant?: CellSliderVariant;
  className?: string;
  style?: CSSProperties;
};

export type CellSliderTrackProps = Omit<SliderTrackProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

/** OSS Slider.Fill 是泛型 DOM 组件，这里固定为 div（与快照一致） */
export type CellSliderFillProps = SliderFillProps<'div'> &
  Omit<ComponentProps<'div'>, keyof SliderFillProps<'div'>>;

export type CellSliderThumbProps = Omit<SliderThumbProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type CellSliderLabelProps = HTMLAttributes<HTMLSpanElement>;

export type CellSliderOutputProps = Omit<SliderOutputProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

/** Track 需要根据根组件 variant 渲染对应修饰类 */
const CellSliderContext = createContext<CellSliderVariant>('default');

/** 可见的整行单元格即滑轨；快照中 default 变体也带 --default 修饰类 */
const Track = ({ className, ...rest }: CellSliderTrackProps) => {
  const variant = useContext(CellSliderContext);

  return (
    <Slider.Track
      data-slot="cell-slider-track"
      className={clsx('cell-slider__track', `cell-slider__track--${variant}`, className)}
      {...rest}
    />
  );
};
Track.displayName = 'CellSlider.Track';

const Fill = ({ className, ...rest }: CellSliderFillProps) => (
  <Slider.Fill
    data-slot="cell-slider-fill"
    className={clsx('cell-slider__fill', className)}
    {...rest}
  />
);
Fill.displayName = 'CellSlider.Fill';

/** 透明命中区，可见指示条由 CSS ::after 伪元素渲染；拖拽态 data-dragging 由底座输出 */
const Thumb = ({ className, ...rest }: CellSliderThumbProps) => (
  <Slider.Thumb
    data-slot="cell-slider-thumb"
    className={clsx('cell-slider__thumb', className)}
    {...rest}
  />
);
Thumb.displayName = 'CellSlider.Thumb';

/** 原站 Label 是普通 span（绝对定位在左侧），不走 OSS Slider 的 label 槽 */
const Label = forwardRef<HTMLSpanElement, CellSliderLabelProps>(({ className, ...rest }, ref) => (
  <span
    ref={ref}
    data-slot="cell-slider-label"
    className={clsx('cell-slider__label', className)}
    {...rest}
  />
));
Label.displayName = 'CellSlider.Label';

/** 无 children 时 OSS 默认渲染当前值文本（与快照 "0.50"/"75" 一致） */
const Output = ({ className, ...rest }: CellSliderOutputProps) => (
  <Slider.Output
    data-slot="cell-slider-output"
    className={clsx('cell-slider__output', className)}
    {...rest}
  />
);
Output.displayName = 'CellSlider.Output';

/**
 * 包装 OSS Slider 的单元格滑杆（原站 API "wraps Slider"）：拖动、键盘调值、
 * 受控 value/onChange、minValue/maxValue/step、isDisabled（data-disabled 级联到各槽）
 * 均由底座提供。
 */
const CellSliderRoot = ({ variant = 'default', className, ...rest }: CellSliderProps) => (
  <CellSliderContext.Provider value={variant}>
    <Slider data-slot="cell-slider" className={clsx('cell-slider', className)} {...rest} />
  </CellSliderContext.Provider>
);
CellSliderRoot.displayName = 'CellSlider';

const CellSlider = Object.assign(CellSliderRoot, { Track, Fill, Thumb, Label, Output });

export default CellSlider;
