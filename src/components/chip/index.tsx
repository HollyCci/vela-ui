import { forwardRef, type HTMLAttributes } from 'react';
import { ChipRoot } from '@heroui/react/chip';

export type ChipColor = 'default' | 'accent' | 'success' | 'warning' | 'danger';
export type ChipVariant = 'primary' | 'soft' | 'tertiary';
export type ChipSize = 'sm' | 'md' | 'lg';

export type ChipProps = HTMLAttributes<HTMLSpanElement> & {
  color?: ChipColor;
  variant?: ChipVariant;
  size?: ChipSize;
};

/**
 * 包装 @heroui/react 的真实 Chip（构建于 react-aria-components 之上），
 * heroui 的 chipVariants 输出与本地 CSS 分片一致的类名：
 * chip chip--<color> chip--<size> chip--<variant>，字符串文本由 ChipRoot 包进
 * chip__label。heroui 默认 variant=secondary 且 size 无默认，本组件保持原契约——
 * 显式落 color=default / variant=primary / size=md。onClick 等原生事件随 props
 * 透传到底层 dom.span，ref 经 React 19 props 透传至真实 DOM 元素。
 */
const Chip = forwardRef<HTMLSpanElement, ChipProps>(
  ({ color = 'default', variant = 'primary', size = 'md', className, children, ...rest }, ref) => (
    <ChipRoot
      ref={ref}
      color={color}
      variant={variant}
      size={size}
      className={className}
      {...rest}
    >
      {children}
    </ChipRoot>
  ),
);

Chip.displayName = 'Chip';

export default Chip;
