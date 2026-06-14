'use client';

import type { CSSProperties, ReactNode } from 'react';
import {
  TooltipRoot as HeroTooltipRoot,
  TooltipTrigger as HeroTooltipTrigger,
  TooltipContent as HeroTooltipContent,
  TooltipArrow as HeroTooltipArrow,
  type TooltipRootProps as HeroTooltipRootProps,
  type TooltipContentProps as HeroTooltipContentProps,
  type TooltipArrowProps as HeroTooltipArrowProps,
} from '@heroui/react';

export type TooltipPlacement = HeroTooltipContentProps['placement'];

export type TooltipProps = HeroTooltipRootProps & {
  /** 便捷用法：直接传提示内容（内部渲染 Trigger + Content）；省略则用 compound 子组件自行组合 */
  content?: ReactNode;
  /** 仅 content 便捷用法生效；compound 用法请放到 Tooltip.Content 上 */
  placement?: TooltipPlacement;
  showArrow?: boolean;
  offset?: number;
};

export type TooltipTriggerProps = {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export type TooltipContentProps = Omit<HeroTooltipContentProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type TooltipArrowProps = Omit<HeroTooltipArrowProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

/** OSS 输出 div[data-slot=tooltip-trigger].tooltip__trigger，RAC Focusable 注入 hover/focus 触发 */
const Trigger = (props: TooltipTriggerProps) => <HeroTooltipTrigger {...props} />;
Trigger.displayName = 'Tooltip.Trigger';

/** OSS 输出 .tooltip 基类；data-placement / data-entering / data-exiting 由 RAC Tooltip 提供 */
const Content = ({ className, style, ...rest }: TooltipContentProps) => (
  <HeroTooltipContent className={className} style={style} {...rest} />
);
Content.displayName = 'Tooltip.Content';

/** OSS 输出 svg[data-slot=overlay-arrow]，朝向旋转由复刻 CSS 按 data-placement 完成 */
const Arrow = ({ className, style, ...rest }: TooltipArrowProps) => (
  <HeroTooltipArrow className={className} style={style} {...rest} />
);
Arrow.displayName = 'Tooltip.Arrow';

/**
 * 基于 @heroui/react Tooltip（RAC TooltipTrigger 底座）：
 * 真实 hover / focus 触发、delay / closeDelay、isOpen 受控均由 RAC 提供。
 * 传 content 时走便捷用法（children 即触发器）；否则按 compound 组合。
 */
const TooltipBase = ({
  content,
  placement,
  showArrow = false,
  offset,
  children,
  ...rest
}: TooltipProps) => {
  if (content === undefined) {
    return <HeroTooltipRoot {...rest}>{children}</HeroTooltipRoot>;
  }

  return (
    <HeroTooltipRoot {...rest}>
      <Trigger>{children}</Trigger>
      <Content offset={offset} placement={placement} showArrow={showArrow}>
        {showArrow && <Arrow />}
        {content}
      </Content>
    </HeroTooltipRoot>
  );
};
TooltipBase.displayName = 'Tooltip';

const Tooltip = Object.assign(TooltipBase, { Trigger, Content, Arrow });

export default Tooltip;
