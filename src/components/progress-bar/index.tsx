import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

export type ProgressBarColor = 'default' | 'accent' | 'success' | 'warning' | 'danger';
export type ProgressBarSize = 'sm' | 'md' | 'lg';

export type ProgressBarProps = HTMLAttributes<HTMLDivElement> & {
  /** 当前值；缺省表示不确定进度（indeterminate） */
  value?: number;
  maxValue?: number;
  label?: ReactNode;
  /** 自定义右侧输出文案，默认显示百分比 */
  valueLabel?: ReactNode;
  isShowValue?: boolean;
  color?: ProgressBarColor;
  size?: ProgressBarSize;
  isDisabled?: boolean;
};

const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value,
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
    const isIndeterminate = value === undefined;
    const percent = isIndeterminate
      ? 0
      : maxValue > 0
        ? Math.min(100, Math.max(0, (value / maxValue) * 100))
        : 0;
    const output = valueLabel ?? `${Math.round(percent)}%`;

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={maxValue}
        aria-valuenow={isIndeterminate ? undefined : value}
        data-disabled={isDisabled || undefined}
        className={clsx(
          'progress-bar',
          color !== 'accent' && `progress-bar--${color}`,
          size !== 'md' && `progress-bar--${size}`,
          className,
        )}
        {...rest}
      >
        {label !== undefined && <span data-slot="label">{label}</span>}
        {isShowValue && !isIndeterminate && <span className="progress-bar__output">{output}</span>}
        <div className="progress-bar__track">
          <div
            className="progress-bar__fill"
            style={isIndeterminate ? undefined : { width: `${percent}%` }}
          />
        </div>
      </div>
    );
  },
);

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;
