import {
  forwardRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import clsx from 'clsx';

export type NumberFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max' | 'step'
> & {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  minValue?: number;
  maxValue?: number;
  step?: number;
  variant?: 'default' | 'secondary';
  isFullWidth?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  label?: ReactNode;
  description?: ReactNode;
};

const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(
  (
    {
      value,
      defaultValue = 0,
      onValueChange,
      minValue = Number.MIN_SAFE_INTEGER,
      maxValue = Number.MAX_SAFE_INTEGER,
      step = 1,
      variant = 'default',
      isFullWidth = false,
      isInvalid = false,
      isDisabled = false,
      label,
      description,
      className,
      ...rest
    },
    ref,
  ) => {
    const [innerValue, setInnerValue] = useState(defaultValue);
    const currentValue = value ?? innerValue;

    const clamp = (next: number) => Math.min(Math.max(next, minValue), maxValue);

    const setValue = (next: number) => {
      const clamped = clamp(next);
      if (value === undefined) setInnerValue(clamped);
      onValueChange?.(clamped);
    };

    const handleDecrement = () => setValue(currentValue - step);
    const handleIncrement = () => setValue(currentValue + step);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      const parsed = Number(event.target.value);
      if (!Number.isNaN(parsed)) setValue(parsed);
    };

    return (
      <div
        className={clsx(
          'number-field',
          variant === 'secondary' && 'number-field--secondary',
          isFullWidth && 'number-field--full-width',
          className,
        )}
        data-invalid={isInvalid || undefined}
      >
        {label !== undefined && (
          <span className="label" data-slot="label">
            {label}
          </span>
        )}
        <div
          className={clsx(
            'number-field__group',
            isFullWidth && 'number-field__group--full-width',
          )}
          data-invalid={isInvalid || undefined}
          data-disabled={isDisabled || undefined}
        >
          <button
            type="button"
            className="number-field__decrement-button"
            aria-label="减少"
            onClick={handleDecrement}
            disabled={isDisabled || currentValue <= minValue}
          >
            <svg
              data-slot="number-field-decrement-button-icon"
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
          <input
            ref={ref}
            type="number"
            inputMode="numeric"
            className="number-field__input"
            data-slot="number-field-input"
            value={currentValue}
            onChange={handleChange}
            min={minValue}
            max={maxValue}
            step={step}
            disabled={isDisabled}
            aria-invalid={isInvalid || undefined}
            {...rest}
          />
          <button
            type="button"
            className="number-field__increment-button"
            aria-label="增加"
            onClick={handleIncrement}
            disabled={isDisabled || currentValue >= maxValue}
          >
            <svg
              data-slot="number-field-increment-button-icon"
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
        {description !== undefined && (
          <span className="description" data-slot="description">
            {description}
          </span>
        )}
      </div>
    );
  },
);

NumberField.displayName = 'NumberField';

export default NumberField;
