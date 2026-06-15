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

/** 类名顺序与参考实现一致：badge badge--<color> [badge--<placement>] badge--<size> badge--<variant> */
const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ color = 'default', variant = 'primary', size = 'md', placement, className, children, ...rest }, ref) => {
    return (
      <span
        ref={ref}
        data-slot="badge"
        className={clsx(
          'badge',
          `badge--${color}`,
          placement && `badge--${placement}`,
          `badge--${size}`,
          `badge--${variant}`,
          className,
        )}
        {...rest}
      >
        {children !== undefined && children !== null && (
          <span className="badge__label" data-slot="badge-label">
            {children}
          </span>
        )}
      </span>
    );
  },
);

Badge.displayName = 'Badge';

export type BadgeAnchorProps = HTMLAttributes<HTMLSpanElement> & { children: ReactNode };

export const BadgeAnchor = forwardRef<HTMLSpanElement, BadgeAnchorProps>(
  ({ className, children, ...rest }, ref) => (
    <span ref={ref} data-slot="badge-anchor" className={clsx('badge-anchor', className)} {...rest}>
      {children}
    </span>
  ),
);

BadgeAnchor.displayName = 'BadgeAnchor';

export default Badge;
