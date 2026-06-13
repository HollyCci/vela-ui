import {
  forwardRef,
  useContext,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  Slider as HeroSlider,
  type SliderFillProps as HeroSliderFillProps,
  type SliderMarksProps as HeroSliderMarksProps,
  type SliderOutputProps as HeroSliderOutputProps,
  type SliderProps as HeroSliderProps,
  type SliderThumbProps as HeroSliderThumbProps,
  type SliderTrackProps as HeroSliderTrackProps,
} from '@heroui/react';
import {
  Label as AriaLabel,
  SliderStateContext,
  type LabelProps as AriaLabelProps,
  type SliderState,
} from 'react-aria-components';
import clsx from 'clsx';

export type SliderOrientation = 'horizontal' | 'vertical';

export type SliderOutputRender = (value: number, values: number[]) => ReactNode;

export type SliderMark = {
  value: number;
  label?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export type SliderProps = Omit<
  HeroSliderProps,
  'children' | 'className' | 'style' | 'value' | 'defaultValue' | 'onChange' | 'onChangeEnd'
> & {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  minValue?: number;
  maxValue?: number;
  step?: number;
  label?: ReactNode;
  formatValue?: (value: number) => string;
  output?: ReactNode | SliderOutputRender | false;
  marks?: readonly (number | SliderMark)[];
  orientation?: SliderOrientation;
  isDisabled?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: HeroSliderProps['children'];
};

export type SliderLabelProps = Omit<AriaLabelProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type SliderOutputProps = Omit<HeroSliderOutputProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type SliderTrackProps = Omit<HeroSliderTrackProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type SliderFillProps = HeroSliderFillProps<'div'> &
  Omit<ComponentProps<'div'>, keyof HeroSliderFillProps<'div'>>;

export type SliderThumbProps = Omit<HeroSliderThumbProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type SliderMarksProps = HeroSliderMarksProps<'div'> &
  Omit<ComponentProps<'div'>, keyof HeroSliderMarksProps<'div'>>;

export type SliderMarkProps = Omit<ComponentProps<'span'>, 'className' | 'style'> & {
  value: number;
  className?: string;
  style?: CSSProperties;
};

const formatOutputValue = (
  state: SliderState,
  formatValue: SliderProps['formatValue'],
  output: SliderProps['output'],
) => {
  const values = state.values;
  const firstValue = values[0] ?? 0;

  if (typeof output === 'function') return output(firstValue, values);
  if (output !== undefined && output !== false) return output;
  if (formatValue !== undefined) return values.map((item) => formatValue(item)).join(' – ');

  return values.map((_, index) => state.getThumbValueLabel(index)).join(' – ');
};

const Label = forwardRef<HTMLLabelElement, SliderLabelProps>(({ className, ...rest }, ref) => (
  <AriaLabel
    ref={ref}
    data-slot="label"
    className={clsx('label', className)}
    {...rest}
  />
));
Label.displayName = 'Slider.Label';

const Output = ({ className, ...rest }: SliderOutputProps) => (
  <HeroSlider.Output className={clsx('slider__output', className)} {...rest} />
);
Output.displayName = 'Slider.Output';

const Track = ({ className, ...rest }: SliderTrackProps) => (
  <HeroSlider.Track className={clsx('slider__track', className)} {...rest} />
);
Track.displayName = 'Slider.Track';

const Fill = ({ className, ...rest }: SliderFillProps) => (
  <HeroSlider.Fill className={clsx('slider__fill', className)} {...rest} />
);
Fill.displayName = 'Slider.Fill';

const Thumb = ({ className, ...rest }: SliderThumbProps) => (
  <HeroSlider.Thumb className={clsx('slider__thumb', className)} {...rest} />
);
Thumb.displayName = 'Slider.Thumb';

const Marks = ({ className, ...rest }: SliderMarksProps) => (
  <HeroSlider.Marks className={clsx('slider__marks', className)} {...rest} />
);
Marks.displayName = 'Slider.Marks';

const Mark = forwardRef<HTMLSpanElement, SliderMarkProps>(
  ({ value, className, style, children, ...rest }, ref) => {
    const state = useContext(SliderStateContext);
    const orientation = state?.orientation ?? 'horizontal';
    const percent = state === null ? 0 : state.getValuePercent(value) * 100;
    const placement =
      orientation === 'vertical'
        ? { bottom: `${percent}%`, transform: 'translate(-50%, 50%)' }
        : { left: `${percent}%`, transform: 'translate(-50%, 0)' };

    return (
      <span
        ref={ref}
        data-slot="slider-mark"
        data-orientation={orientation}
        className={clsx('slider__mark', className)}
        style={{ ...placement, ...style }}
        {...rest}
      >
        {children ?? state?.getFormattedValue(value) ?? value}
      </span>
    );
  },
);
Mark.displayName = 'Slider.Mark';

const renderMarks = (
  marks: NonNullable<SliderProps['marks']>,
  formatValue: SliderProps['formatValue'],
) =>
  marks.map((item, index) => {
    const mark = typeof item === 'number' ? { value: item } : item;
    const label = mark.label ?? (formatValue === undefined ? undefined : formatValue(mark.value));

    return (
      <Mark
        key={`${mark.value}-${index}`}
        value={mark.value}
        className={mark.className}
        style={mark.style}
      >
        {label}
      </Mark>
    );
  });

const SliderRoot = forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      onChangeEnd,
      minValue = 0,
      maxValue = 100,
      step = 1,
      label,
      formatValue,
      output,
      marks,
      orientation = 'horizontal',
      isDisabled = false,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const hasMarks = marks !== undefined && marks.length > 0;
    const handleChange =
      onChange === undefined
        ? undefined
        : (nextValue: number | number[]) => {
            if (typeof nextValue === 'number') onChange(nextValue);
          };
    const handleChangeEnd =
      onChangeEnd === undefined
        ? undefined
        : (nextValue: number | number[]) => {
            if (typeof nextValue === 'number') onChangeEnd(nextValue);
          };

    return (
      <HeroSlider
        {...rest}
        ref={ref}
        data-has-marks={hasMarks || undefined}
        className={clsx('slider', className)}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        onChangeEnd={handleChangeEnd}
        minValue={minValue}
        maxValue={maxValue}
        step={step}
        orientation={orientation}
        isDisabled={isDisabled}
      >
        {children !== undefined ? children : (
          <>
            {label !== undefined && <Label>{label}</Label>}
            {output !== false && (
              <Output>{({ state }) => formatOutputValue(state, formatValue, output)}</Output>
            )}
            <Track>
              <Fill />
              <Thumb />
            </Track>
            {hasMarks && <Marks>{renderMarks(marks, formatValue)}</Marks>}
          </>
        )}
      </HeroSlider>
    );
  },
);
SliderRoot.displayName = 'Slider';

const Slider = Object.assign(SliderRoot, {
  Label,
  Output,
  Track,
  Fill,
  Thumb,
  Marks,
  Mark,
});

export default Slider;
