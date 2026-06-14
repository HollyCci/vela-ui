'use client';

import {
  createContext,
  forwardRef,
  useContext,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';
import {
  ColorArea,
  ColorPicker,
  ColorSlider,
  ColorSwatch,
  ColorSwatchPicker,
  type ColorAreaProps,
  type ColorAreaThumbProps,
  type ColorPickerPopoverProps,
  type ColorPickerProps,
  type ColorSliderOutputProps,
  type ColorSliderProps,
  type ColorSliderThumbProps,
  type ColorSliderTrackProps,
  type ColorSwatchProps,
  type ColorSwatchPickerIndicatorProps,
  type ColorSwatchPickerItemProps,
  type ColorSwatchPickerProps,
  type ColorSwatchPickerSwatchProps,
} from '@heroui/react';
import {
  Button,
  ColorPickerStateContext,
  parseColor,
  type ButtonProps,
  type Color,
} from 'react-aria-components';
import clsx from 'clsx';

export type CellColorPickerVariant = 'default' | 'secondary';
export type CellColor = Color;
export const parseCellColor = parseColor;

/**
 * 原站 API：根无独立 DOM 元素（OSS 在内部渲染 .color-picker div，data-slot 固定为
 * "color-picker"，与快照一致），故不提供 style 透传；variant 落在 Trigger 修饰类上。
 */
export type CellColorPickerProps = Omit<ColorPickerProps, 'className' | 'variant'> & {
  variant?: CellColorPickerVariant;
  className?: string;
};

export type CellColorPickerTriggerProps = Omit<ButtonProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type CellColorPickerLabelProps = HTMLAttributes<HTMLSpanElement>;

export type CellColorPickerValueDisplayProps = HTMLAttributes<HTMLSpanElement>;

export type CellColorPickerSwatchProps = Omit<ColorSwatchProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type CellColorPickerPopoverProps = Omit<ColorPickerPopoverProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type CellColorPickerAreaProps = Omit<ColorAreaProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type CellColorPickerAreaThumbProps = Omit<
  ColorAreaThumbProps,
  'className' | 'style'
> & {
  className?: string;
  style?: CSSProperties;
};

export type CellColorPickerSliderProps = Omit<ColorSliderProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type CellColorPickerSliderOutputProps = Omit<
  ColorSliderOutputProps,
  'className' | 'style'
> & {
  className?: string;
  style?: CSSProperties;
};

export type CellColorPickerSliderTrackProps = Omit<
  ColorSliderTrackProps,
  'className' | 'style'
> & {
  className?: string;
  style?: CSSProperties;
};

export type CellColorPickerSliderThumbProps = Omit<
  ColorSliderThumbProps,
  'className' | 'style'
> & {
  className?: string;
  style?: CSSProperties;
};

export type CellColorPickerSwatchPickerProps = Omit<
  ColorSwatchPickerProps,
  'className' | 'style'
> & {
  className?: string;
  style?: CSSProperties;
};

export type CellColorPickerSwatchPickerItemProps = Omit<
  ColorSwatchPickerItemProps,
  'className' | 'style'
> & {
  className?: string;
  style?: CSSProperties;
};

export type CellColorPickerSwatchPickerSwatchProps = Omit<
  ColorSwatchPickerSwatchProps,
  'className' | 'style'
> & {
  className?: string;
  style?: CSSProperties;
};

export type CellColorPickerSwatchPickerIndicatorProps =
  ColorSwatchPickerIndicatorProps;

/** Trigger 需要根据根组件 variant 渲染对应修饰类 */
const CellColorPickerContext = createContext<CellColorPickerVariant>('default');

/**
 * 可见的整行单元格按钮（原站 API "Wraps RAC Button"，不走 OSS ColorPicker.Trigger，
 * 快照中无 color-picker__trigger 类）；isDisabled、aria-expanded、按压/聚焦 data 属性由 RAC 提供。
 */
const Trigger = ({ className, ...rest }: CellColorPickerTriggerProps) => {
  const variant = useContext(CellColorPickerContext);

  return (
    <Button
      data-slot="cell-color-picker-trigger"
      className={clsx(
        'cell-color-picker__trigger',
        `cell-color-picker__trigger--${variant}`,
        className,
      )}
      {...rest}
    />
  );
};
Trigger.displayName = 'CellColorPicker.Trigger';

const Label = forwardRef<HTMLSpanElement, CellColorPickerLabelProps>(
  ({ className, ...rest }, ref) => (
    <span
      ref={ref}
      data-slot="cell-color-picker-label"
      className={clsx('cell-color-picker__label', className)}
      {...rest}
    />
  ),
);
Label.displayName = 'CellColorPicker.Label';

/** 自动从 RAC ColorPicker state 读取当前色并以大写 hex 展示（如 #FF5733）；children 可覆盖 */
const ValueDisplay = forwardRef<HTMLSpanElement, CellColorPickerValueDisplayProps>(
  ({ className, children, ...rest }, ref) => {
    const state = useContext(ColorPickerStateContext);

    return (
      <span
        ref={ref}
        data-slot="cell-color-picker-value-display"
        className={clsx('cell-color-picker__value-display', className)}
        {...rest}
      >
        {children ?? (state ? state.color.toString('hex') : null)}
      </span>
    );
  },
);
ValueDisplay.displayName = 'CellColorPicker.ValueDisplay';

/** 包装 OSS ColorSwatch；无 color 时自动取 ColorPicker 当前色，data-slot 由 OSS 固定为 "color-swatch" */
const Swatch = ({ className, ...rest }: CellColorPickerSwatchProps) => (
  <ColorSwatch className={clsx('cell-color-picker__swatch', className)} {...rest} />
);
Swatch.displayName = 'CellColorPicker.Swatch';

/** 原站默认 placement 为 'bottom end'（OSS 默认是 'bottom left'） */
const Popover = ({ className, placement = 'bottom end', ...rest }: CellColorPickerPopoverProps) => (
  <ColorPicker.Popover
    placement={placement}
    className={clsx('cell-color-picker__popover', className)}
    {...rest}
  />
);
Popover.displayName = 'CellColorPicker.Popover';

const AreaThumb = ({ className, ...rest }: CellColorPickerAreaThumbProps) => (
  <ColorArea.Thumb className={clsx('cell-color-picker__area-thumb', className)} {...rest} />
);
AreaThumb.displayName = 'CellColorPicker.Area.Thumb';

const AreaRoot = ({ className, ...rest }: CellColorPickerAreaProps) => (
  <ColorArea
    data-slot="cell-color-picker-area"
    className={clsx('cell-color-picker__area', className)}
    {...rest}
  />
);
AreaRoot.displayName = 'CellColorPicker.Area';

const Area = Object.assign(AreaRoot, {
  Thumb: AreaThumb,
});

const SliderOutput = ({ className, ...rest }: CellColorPickerSliderOutputProps) => (
  <ColorSlider.Output className={clsx('cell-color-picker__slider-output', className)} {...rest} />
);
SliderOutput.displayName = 'CellColorPicker.Slider.Output';

const SliderTrack = ({ className, ...rest }: CellColorPickerSliderTrackProps) => (
  <ColorSlider.Track className={clsx('cell-color-picker__slider-track', className)} {...rest} />
);
SliderTrack.displayName = 'CellColorPicker.Slider.Track';

const SliderThumb = ({ className, ...rest }: CellColorPickerSliderThumbProps) => (
  <ColorSlider.Thumb className={clsx('cell-color-picker__slider-thumb', className)} {...rest} />
);
SliderThumb.displayName = 'CellColorPicker.Slider.Thumb';

const SliderRoot = (props: CellColorPickerSliderProps) => {
  const sliderProps = {
    ...props,
    'data-slot': 'cell-color-picker-slider',
    className: clsx('cell-color-picker__slider', props.className),
  } as ColorSliderProps & { 'data-slot': string };

  return <ColorSlider {...sliderProps} />;
};
SliderRoot.displayName = 'CellColorPicker.Slider';

const Slider = Object.assign(SliderRoot, {
  Output: SliderOutput,
  Track: SliderTrack,
  Thumb: SliderThumb,
});

const SwatchPickerItem = ({ className, ...rest }: CellColorPickerSwatchPickerItemProps) => (
  <ColorSwatchPicker.Item
    data-slot="cell-color-picker-swatch-picker-item"
    className={clsx('cell-color-picker__swatch-picker-item', className)}
    {...rest}
  />
);
SwatchPickerItem.displayName = 'CellColorPicker.SwatchPicker.Item';

const SwatchPickerSwatch = ({
  className,
  ...rest
}: CellColorPickerSwatchPickerSwatchProps) => (
  <ColorSwatchPicker.Swatch
    className={clsx('cell-color-picker__swatch-picker-swatch', className)}
    {...rest}
  />
);
SwatchPickerSwatch.displayName = 'CellColorPicker.SwatchPicker.Swatch';

const SwatchPickerIndicator = ({
  className,
  ...rest
}: CellColorPickerSwatchPickerIndicatorProps) => (
  <ColorSwatchPicker.Indicator
    data-slot="cell-color-picker-swatch-picker-indicator"
    className={clsx('cell-color-picker__swatch-picker-indicator', className)}
    {...rest}
  />
);
SwatchPickerIndicator.displayName = 'CellColorPicker.SwatchPicker.Indicator';

const SwatchPickerRoot = ({ className, ...rest }: CellColorPickerSwatchPickerProps) => (
  <ColorSwatchPicker
    data-slot="cell-color-picker-swatch-picker"
    className={clsx('cell-color-picker__swatch-picker', className)}
    {...rest}
  />
);
SwatchPickerRoot.displayName = 'CellColorPicker.SwatchPicker';

const SwatchPicker = Object.assign(SwatchPickerRoot, {
  Item: SwatchPickerItem,
  Swatch: SwatchPickerSwatch,
  Indicator: SwatchPickerIndicator,
});

/**
 * 包装 OSS ColorPicker 的单元格取色器（原站 API "wraps ColorPicker"）：点击触发弹出
 * 取色面板、受控 value/onChange（Color 或 hex 字符串）均由底座（RAC ColorPicker +
 * DialogTrigger）提供。
 */
const CellColorPickerRoot = ({
  variant = 'default',
  className,
  ...rest
}: CellColorPickerProps) => (
  <CellColorPickerContext.Provider value={variant}>
    <ColorPicker className={clsx('cell-color-picker', className)} {...rest} />
  </CellColorPickerContext.Provider>
);
CellColorPickerRoot.displayName = 'CellColorPicker';

const CellColorPicker = Object.assign(CellColorPickerRoot, {
  Trigger,
  Label,
  ValueDisplay,
  Swatch,
  Popover,
  Area,
  Slider,
  SwatchPicker,
});

export default CellColorPicker;
