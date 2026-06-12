import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

export type BadgeColor = 'default' | 'accent' | 'success' | 'warning' | 'danger';
export type BadgeVariant = 'primary' | 'soft';
export type BadgeSize = 'sm' | 'md' | 'lg';
export type BadgePlacement = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  color?: BadgeColor;
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** 作为角标锚定在父元素上时的位置 */
  placement?: BadgePlacement;
};

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ color = 'default', variant = 'primary', size = 'md', placement, className, children, ...rest }, ref) => {
    return (
      <span
        ref={ref}
        className={clsx(
          'badge',
          `badge--${variant}`,
          `badge--${color}`,
          size !== 'md' && `badge--${size}`,
          placement && `badge--${placement}`,
          className,
        )}
        {...rest}
      >
        <span className="badge__label">{children}</span>
      </span>
    );
  },
);

Badge.displayName = 'Badge';

export type BadgeAnchorProps = HTMLAttributes<HTMLSpanElement> & { children: ReactNode };

export const BadgeAnchor = forwardRef<HTMLSpanElement, BadgeAnchorProps>(
  ({ className, children, ...rest }, ref) => (
    <span ref={ref} className={clsx('badge-anchor', className)} {...rest}>
      {children}
    </span>
  ),
);

BadgeAnchor.displayName = 'BadgeAnchor';

export default Badge;
