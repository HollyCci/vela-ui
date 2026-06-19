import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { BadgeRoot, BadgeAnchor as HeroBadgeAnchor } from '@heroui/react';

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

/**
 * 包装 @heroui/react 的真实 Badge（构建于 react-aria-components 之上），
 * heroui 的 badgeVariants 输出与本地 CSS 分片一致的类名：
 * badge badge--<color> [badge--<placement>] badge--<size> badge--<variant>。
 * heroui 默认会附加 placement="top-right"，但本组件保持原契约——仅在显式传入
 * placement 时才落 placement 类，避免无锚定徽标多出 badge--top-right。
 */
const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ color = 'default', variant = 'primary', size = 'md', placement, children, ...rest }, ref) => {
    return (
      <BadgeRoot
        ref={ref}
        color={color}
        variant={variant}
        size={size}
        {...(placement ? { placement } : {})}
        {...rest}
      >
        {children}
      </BadgeRoot>
    );
  },
);

Badge.displayName = 'Badge';

export type BadgeAnchorProps = HTMLAttributes<HTMLSpanElement> & { children: ReactNode };

export const BadgeAnchor = forwardRef<HTMLSpanElement, BadgeAnchorProps>(
  ({ children, ...rest }, ref) => (
    <HeroBadgeAnchor ref={ref} {...rest}>
      {children}
    </HeroBadgeAnchor>
  ),
);

BadgeAnchor.displayName = 'BadgeAnchor';

export default Badge;
