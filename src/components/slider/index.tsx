import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

export type SliderOrientation = 'horizontal' | 'vertical';

export type SliderProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  value?: number;
  minValue?: number;
  maxValue?: number;
  label?: ReactNode;
  formatValue?: (value: number) => string;
  orientation?: SliderOrientation;
  isDisabled?: boolean;
};

const defaultFormatValue = (value: number) => String(value);

const Slider = forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      value = 0,
      minValue = 0,
      maxValue = 100,
      label,
      formatValue = defaultFormatValue,
      orientation = 'horizontal',
      isDisabled = false,
      className,
      ...rest
    },
    ref,
  ) => {
    const range = maxValue - minValue;
    const ratio = range === 0 ? 0 : Math.min(Math.max((value - minValue) / range, 0), 1);
    const percent = `${ratio * 100}%`;
    const isHorizontal = orientation === 'horizontal';

    const fillStyle = isHorizontal
      ? { left: 0, width: percent }
      : { bottom: 0, height: percent };
    const thumbStyle = isHorizontal
      ? { left: percent, transform: 'translate(-50%, -50%)' }
      : { bottom: percent, transform: 'translate(-50%, 50%)' };

    return (
      <div
        ref={ref}
        className={clsx('slider', className)}
        data-orientation={orientation}
        data-disabled={isDisabled || undefined}
        {...rest}
      >
        {label !== undefined && (
          <span className="label" data-slot="label">
            {label}
          </span>
        )}
        <output className="slider__output">{formatValue(value)}</output>
        <div className="slider__track" data-fill-start={ratio > 0 || undefined}>
          <div className="slider__fill" style={fillStyle} />
          <div
            className="slider__thumb"
            style={thumbStyle}
            role="slider"
            aria-valuemin={minValue}
            aria-valuemax={maxValue}
            aria-valuenow={value}
            aria-orientation={orientation}
            aria-disabled={isDisabled || undefined}
            tabIndex={isDisabled ? undefined : 0}
            data-disabled={isDisabled || undefined}
          />
        </div>
      </div>
    );
  },
);

Slider.displayName = 'Slider';

export default Slider;
