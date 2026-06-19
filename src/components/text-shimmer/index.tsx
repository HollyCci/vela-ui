import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import clsx from 'clsx';

export type TextShimmerProps = HTMLAttributes<HTMLSpanElement>;

const TextShimmer = forwardRef<HTMLSpanElement, TextShimmerProps>(
  ({ className, style, ...rest }, ref) => (
    // 运行时 .text-shimmer 规则的 linear-gradient/tan() 直接引用 var(--shimmer-angle) 且无 var() 兜底，
    // 一旦该自定义属性未定义，整个 background 声明会在计算值阶段被丢弃，而 -webkit-text-fill-color:transparent
    // 与 background-clip:text 仍生效，导致文字完全透明（不可见）。故在此兜底 --shimmer-angle，
    // 用户传入的 style 在后展开以保留覆盖能力。
    <span
      ref={ref}
      data-slot="text-shimmer"
      className={clsx('text-shimmer', className)}
      style={{ '--shimmer-angle': '0deg', ...style } as CSSProperties}
      {...rest}
    />
  ),
);

TextShimmer.displayName = 'TextShimmer';

export default TextShimmer;
