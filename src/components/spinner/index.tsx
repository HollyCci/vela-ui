'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { Spinner as HeroSpinner } from '@heroui/react';

export type SpinnerColor = 'accent' | 'current' | 'success' | 'warning' | 'danger';
export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

export type SpinnerProps = HTMLAttributes<HTMLSpanElement> & {
  color?: SpinnerColor;
  size?: SpinnerSize;
};

/**
 * 包装 @heroui/react 的真实 Spinner（构建于 react-aria-components 之上）。
 * heroui 的 spinnerVariants 产出与样式分片一致的 .spinner / .spinner--<color> / .spinner--<size> 类，
 * 内部 SVG（双渐变弧线 + 每实例唯一 useId 渐变）也与原参考实现一致，故公共契约保持不变。
 */
const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ color = 'accent', size = 'md', className, ...rest }, ref) => (
    <HeroSpinner ref={ref} color={color} size={size} className={className} {...rest} />
  ),
);

Spinner.displayName = 'Spinner';

export default Spinner;
