import { forwardRef, useId, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

export type MeterColor = 'default' | 'accent' | 'success' | 'warning' | 'danger';
export type MeterSize = 'sm' | 'md' | 'lg';

export type MeterProps = HTMLAttributes<HTMLDivElement> & {
  value: number;
  minValue?: number;
  maxValue?: number;
  label?: ReactNode;
  /** 自定义右侧输出文案，默认显示百分比 */
  valueLabel?: ReactNode;
  isShowValue?: boolean;
  color?: MeterColor;
  size?: MeterSize;
  isDisabled?: boolean;
};

const Meter = forwardRef<HTMLDivElement, MeterProps>(
  (
    {
      value,
      minValue = 0,
      maxValue = 100,
      label,
      valueLabel,
      isShowValue = true,
      color = 'accent',
      size = 'md',
      isDisabled = false,
      className,
      ...rest
    },
    ref,
  ) => {
    const range = maxValue - minValue;
    const percent = range > 0 ? Math.min(100, Math.max(0, ((value - minValue) / range) * 100)) : 0;
    const output = valueLabel ?? `${Math.round(percent)}%`;
    const labelId = useId();

    return (
      <div
        ref={ref}
        role="meter"
        aria-valuemin={minValue}
        aria-valuemax={maxValue}
        aria-valuenow={value}
        aria-valuetext={valueLabel != null ? String(valueLabel) : undefined}
        aria-labelledby={label !== undefined ? labelId : undefined}
        data-disabled={isDisabled || undefined}
        className={clsx(
          'meter',
          color !== 'accent' && `meter--${color}`,
          size !== 'md' && `meter--${size}`,
          className,
        )}
        {...rest}
      >
        {label !== undefined && (
          <span id={labelId} data-slot="label">
            {label}
          </span>
        )}
        {isShowValue && <span className="meter__output">{output}</span>}
        <div className="meter__track">
          <div className="meter__fill" style={{ width: `${percent}%` }} />
        </div>
      </div>
    );
  },
);

Meter.displayName = 'Meter';

export default Meter;
