import { forwardRef, type HTMLAttributes } from 'react';
import { SeparatorRoot } from '@heroui/react';

export type SeparatorProps = HTMLAttributes<HTMLDivElement> & {
  orientation?: 'horizontal' | 'vertical';
  color?: 'default' | 'secondary' | 'tertiary';
};

/**
 * 包装 @heroui/react 的真实 Separator（构建于 react-aria-components 之上，
 * 提供真实的 role/aria-orientation 语义）。heroui 的 separatorVariants 输出与本地
 * CSS 分片一致的类名：separator separator--<orientation> separator--<variant>。
 *
 * 契约保持：
 * - 本组件历史上用 color 命名分隔线配色，heroui 用 variant，二者都产出 separator--<value>，
 *   故将 color 映射到 heroui 的 variant，对外仍以 color 暴露。
 * - heroui/RAC 的 Separator 水平时渲染 <hr>（隐式 role=separator、不带 aria-orientation），
 *   垂直时渲染 <div>（显式 role=separator、aria-orientation=vertical），与原 facade 的
 *   data-orientation / data-slot / aria-orientation 行为一致。
 * - ref：SeparatorRoot 本身非 forwardRef，但它把 ref 透传给 RAC 的 Separator 基元
 *   （ComponentPropsWithRef，转发到真实 <hr>/<div> 元素），故 ref 落在真实 DOM 上，
 *   overlay 触发器的 triggerRef 仍可拿到节点。
 * - className 透传，本地 .separator / .separator--<variant> 分片继续生效。
 */
const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
  ({ orientation = 'horizontal', color = 'default', className, ...rest }, ref) => (
    <SeparatorRoot
      ref={ref}
      orientation={orientation}
      variant={color}
      className={className}
      {...rest}
    />
  ),
);

Separator.displayName = 'Separator';

export default Separator;
