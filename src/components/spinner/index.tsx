import { forwardRef, type HTMLAttributes } from 'react';
import clsx from 'clsx';

export type SpinnerColor = 'accent' | 'current' | 'success' | 'warning' | 'danger';
export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

export type SpinnerProps = HTMLAttributes<HTMLSpanElement> & {
  color?: SpinnerColor;
  size?: SpinnerSize;
};

const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ color = 'accent', size = 'md', className, ...rest }, ref) => (
    <span
      ref={ref}
      role="progressbar"
      aria-label="加载中"
      className={clsx('spinner', `spinner--${color}`, size !== 'md' && `spinner--${size}`, className)}
      {...rest}
    />
  ),
);

Spinner.displayName = 'Spinner';

export default Spinner;
