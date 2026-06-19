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
  ColorField,
  ColorPickerStateContext,
  Input,
  parseColor,
  type ButtonProps,
  type Color,
  type ColorFieldProps,
  type InputProps,
} from 'react-aria-components';
import clsx from 'clsx';

export type CellColorPickerVariant = 'default' | 'secondary';
export type CellColor = Color;
export const parseCellColor = parseColor;

/**
 * 参考 API：根无独立 DOM 元素（OSS 在内部渲染 .color-picker div，data-slot 固定为
 * "color-picker"，与快照一致），故不提供 style 透传；variant 落在 Trigger 修饰类上。
 */
export type CellColorPickerProps = Omit<ColorPickerProps, 'className' | 'variant'> & {
  variant?: CellColorPickerVariant;
  className?: string;
  /**
   * 整个单元格取色器是否禁用。RAC ColorPicker 自身不接受 isDisabled（仅做颜色同步），
   * 故由根经 context 同时下发给 Trigger 与 Area/Slider/SwatchPicker/Field 子件，使整格 inert。
   */
  isDisabled?: boolean;
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

export type CellColorPickerFieldProps = Omit<ColorFieldProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type CellColorPickerFieldInputProps = Omit<InputProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

type CellColorPickerContextValue = {
  variant: CellColorPickerVariant;
  isDisabled: boolean;
};

/** Trigger 需要根据根组件 variant 渲染修饰类；isDisabled 同时下发给触发器与面板子件 */
const CellColorPickerContext = createContext<CellColorPickerContextValue>({
  variant: 'default',
  isDisabled: false,
});

/**
 * 可见的整行单元格按钮（参考 API "Wraps RAC Button"，不走 OSS ColorPicker.Trigger，
 * 快照中无 color-picker__trigger 类）；isDisabled、aria-expanded、按压/聚焦 data 属性由 RAC 提供。
 */
const Trigger = ({ className, isDisabled, ...rest }: CellColorPickerTriggerProps) => {
  const { variant, isDisabled: rootDisabled } = useContext(CellColorPickerContext);

  return (
    <Button
      data-slot="cell-color-picker-trigger"
      // 根 isDisabled 或触发器自身 isDisabled 任一为真即禁用
      isDisabled={rootDisabled || isDisabled}
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

/** 参考实现默认 placement 为 'bottom end'（OSS 默认是 'bottom left'） */
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

const AreaRoot = ({ className, isDisabled, ...rest }: CellColorPickerAreaProps) => {
  const { isDisabled: rootDisabled } = useContext(CellColorPickerContext);

  return (
    <ColorArea
      data-slot="cell-color-picker-area"
      // 根禁用时面板内交互件一并 inert，匹配 HeroUI disabled 变体
      isDisabled={rootDisabled || isDisabled}
      className={clsx('cell-color-picker__area', className)}
      {...rest}
    />
  );
};
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
  const { isDisabled: rootDisabled } = useContext(CellColorPickerContext);
  const sliderProps = {
    ...props,
    // 根禁用时滑轨一并 inert
    isDisabled: rootDisabled || props.isDisabled,
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

const SwatchPickerItem = ({
  className,
  isDisabled,
  ...rest
}: CellColorPickerSwatchPickerItemProps) => {
  const { isDisabled: rootDisabled } = useContext(CellColorPickerContext);

  return (
    <ColorSwatchPicker.Item
      data-slot="cell-color-picker-swatch-picker-item"
      // RAC ColorSwatchPicker 根不支持 isDisabled（仅逐项可禁用），故根禁用经 context 下发到每个 Item
      isDisabled={rootDisabled || isDisabled}
      className={clsx('cell-color-picker__swatch-picker-item', className)}
      {...rest}
    />
  );
};
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
  // RAC ColorSwatchPicker 根不支持 isDisabled，禁用由各 Item 经 context 承接（见 SwatchPickerItem）
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

const FieldInput = ({ className, ...rest }: CellColorPickerFieldInputProps) => (
  <Input className={clsx('cell-color-picker__field-input', className)} {...rest} />
);
FieldInput.displayName = 'CellColorPicker.Field.Input';

/**
 * 包装 RAC ColorField，覆盖 HeroUI format/input 变体：用户可直接键入 hex 值。
 * ColorPicker 通过 ColorFieldContext 向其下发 {value,onChange}，故置于取色器内即与当前色双向同步；
 * 根禁用时一并 inert。默认渲染内置 Input，children 可覆盖以自定义结构。
 */
const FieldRoot = ({
  className,
  isDisabled,
  children,
  ...rest
}: CellColorPickerFieldProps) => {
  const { isDisabled: rootDisabled } = useContext(CellColorPickerContext);

  return (
    <ColorField
      data-slot="cell-color-picker-field"
      isDisabled={rootDisabled || isDisabled}
      className={clsx('cell-color-picker__field', className)}
      {...rest}
    >
      {children ?? <FieldInput />}
    </ColorField>
  );
};
FieldRoot.displayName = 'CellColorPicker.Field';

const Field = Object.assign(FieldRoot, {
  Input: FieldInput,
});

/**
 * 包装 OSS ColorPicker 的单元格取色器（参考 API "wraps ColorPicker"）：点击触发弹出
 * 取色面板、受控 value/onChange（Color 或 hex 字符串）均由底座（RAC ColorPicker +
 * DialogTrigger）提供。isDisabled 经 context 下发给触发器及面板各交互件。
 */
const CellColorPickerRoot = ({
  variant = 'default',
  className,
  isDisabled = false,
  ...rest
}: CellColorPickerProps) => (
  <CellColorPickerContext.Provider value={{ variant, isDisabled }}>
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
  Field,
});

export default CellColorPicker;
