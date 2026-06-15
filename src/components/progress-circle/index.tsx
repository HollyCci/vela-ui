import { forwardRef, type HTMLAttributes } from 'react';
import clsx from 'clsx';

export type ProgressCircleColor = 'default' | 'accent' | 'success' | 'warning' | 'danger';
export type ProgressCircleSize = 'sm' | 'md' | 'lg';

export type ProgressCircleProps = HTMLAttributes<HTMLDivElement> & {
  /** 当前值；缺省表示不确定进度（旋转动画） */
  value?: number;
  maxValue?: number;
  color?: ProgressCircleColor;
  size?: ProgressCircleSize;
  isDisabled?: boolean;
};

const RADIUS = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const ProgressCircle = forwardRef<HTMLDivElement, ProgressCircleProps>(
  (
    { value, maxValue = 100, color = 'accent', size = 'md', isDisabled = false, className, ...rest },
    ref,
  ) => {
    const isIndeterminate = value === undefined;
    const ratio = isIndeterminate
      ? 0.25
      : maxValue > 0
        ? Math.min(1, Math.max(0, value / maxValue))
        : 0;
    const dashOffset = CIRCUMFERENCE * (1 - ratio);

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={maxValue}
        aria-valuenow={isIndeterminate ? undefined : value}
        data-disabled={isDisabled || undefined}
        className={clsx(
          'progress-circle',
          color !== 'accent' && `progress-circle--${color}`,
          size !== 'md' && `progress-circle--${size}`,
          className,
        )}
        {...rest}
      >
        <svg className="progress-circle__track" viewBox="0 0 24 24" fill="none">
          <circle
            className="progress-circle__track-circle"
            cx="12"
            cy="12"
            r={RADIUS}
            strokeWidth="3"
          />
          <circle
            className="progress-circle__fill-circle"
            cx="12"
            cy="12"
            r={RADIUS}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 12 12)"
          />
        </svg>
      </div>
    );
  },
);

ProgressCircle.displayName = 'ProgressCircle';

export default ProgressCircle;
