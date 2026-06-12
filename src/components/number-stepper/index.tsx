import { forwardRef, useState, type HTMLAttributes } from 'react';
import clsx from 'clsx';

export type NumberStepperSize = 'sm' | 'md' | 'lg';

export type NumberStepperProps = Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'children'> & {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  minValue?: number;
  maxValue?: number;
  step?: number;
  size?: NumberStepperSize;
  isDisabled?: boolean;
  formatValue?: (value: number) => string;
};

const defaultFormatValue = (value: number) => String(value);

const NumberStepper = forwardRef<HTMLDivElement, NumberStepperProps>(
  (
    {
      value,
      defaultValue = 0,
      onValueChange,
      minValue = Number.MIN_SAFE_INTEGER,
      maxValue = Number.MAX_SAFE_INTEGER,
      step = 1,
      size = 'md',
      isDisabled = false,
      formatValue = defaultFormatValue,
      className,
      ...rest
    },
    ref,
  ) => {
    const [innerValue, setInnerValue] = useState(defaultValue);
    const currentValue = value ?? innerValue;

    const setValue = (next: number) => {
      const clamped = Math.min(Math.max(next, minValue), maxValue);
      if (value === undefined) setInnerValue(clamped);
      onValueChange?.(clamped);
    };

    const handleDecrement = () => setValue(currentValue - step);
    const handleIncrement = () => setValue(currentValue + step);

    return (
      <div ref={ref} className={clsx('number-stepper', className)} {...rest}>
        <div className={clsx('number-stepper__group', `number-stepper__group--${size}`)}>
          <button
            type="button"
            className={clsx(
              'number-stepper__decrement-button',
              `number-stepper__decrement-button--${size}`,
            )}
            aria-label="减少"
            onClick={handleDecrement}
            disabled={isDisabled || currentValue <= minValue}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
            </svg>
          </button>
          <span
            className={clsx('number-stepper__value', `number-stepper__value--${size}`)}
            role="status"
            aria-live="polite"
          >
            {formatValue(currentValue)}
          </span>
          <button
            type="button"
            className={clsx(
              'number-stepper__increment-button',
              `number-stepper__increment-button--${size}`,
            )}
            aria-label="增加"
            onClick={handleIncrement}
            disabled={isDisabled || currentValue >= maxValue}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
        <input
          type="number"
          className="number-stepper__input"
          value={currentValue}
          readOnly
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>
    );
  },
);

NumberStepper.displayName = 'NumberStepper';

export default NumberStepper;
