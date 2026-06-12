import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

export type AlertColor = 'default' | 'accent' | 'success' | 'warning' | 'danger';

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  color?: AlertColor;
  title: ReactNode;
  description?: ReactNode;
  indicator?: ReactNode;
};

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ color = 'default', title, description, indicator, className, children, ...rest }, ref) => (
    <div ref={ref} role="alert" className={clsx('alert', `alert--${color}`, className)} {...rest}>
      {indicator !== undefined && <span className="alert__indicator">{indicator}</span>}
      <div className="alert__content">
        <div className="alert__title">{title}</div>
        {description !== undefined && <div className="alert__description">{description}</div>}
        {children}
      </div>
    </div>
  ),
);

Alert.displayName = 'Alert';

export default Alert;
