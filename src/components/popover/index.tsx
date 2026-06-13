import { forwardRef, useEffect, useState, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

export type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right';

export type PopoverProps = HTMLAttributes<HTMLDivElement> & {
  isOpen: boolean;
  trigger?: ReactNode;
  placement?: PopoverPlacement;
};

/**
 * 复刻 RAC Popover 的进出场生命周期，驱动 popover.css 已有的 @keyframes enter/exit：
 * 打开时以 data-entering 挂载（keyframe 自动从偏移缩放态播放进场），enter 动画结束后清除该属性回到自然态；
 * 关闭时置 data-exiting 让 exit 缩放淡出反向播放，结束后卸载。缺这两个数据属性则气泡瞬现瞬隐、无进出场。
 * data-entering 须保留整段进场时长（删早了 animation 属性消失会截断动画），故进/出场均以 animationend 推进。
 * reduce-motion 下 animation 被置 none、animationend 不触发，用定时器兜底推进 phase。
 */
type OverlayPhase = 'entering' | 'open' | 'exiting';

const usePopoverPresence = (isOpen: boolean) => {
  const [phase, setPhase] = useState<OverlayPhase | null>(isOpen ? 'open' : null);

  useEffect(() => {
    if (isOpen) {
      setPhase('entering');
      const fallback = setTimeout(
        () => setPhase((prev) => (prev === 'entering' ? 'open' : prev)),
        350,
      );
      return () => clearTimeout(fallback);
    }
    let stillMounted = false;
    setPhase((prev) => {
      stillMounted = prev !== null;
      return stillMounted ? 'exiting' : null;
    });
    if (!stillMounted) return undefined;
    const fallback = setTimeout(() => setPhase((prev) => (prev === 'exiting' ? null : prev)), 350);
    return () => clearTimeout(fallback);
  }, [isOpen]);

  const handleAnimationEnd = () =>
    setPhase((prev) => {
      if (prev === 'entering') return 'open';
      if (prev === 'exiting') return null;
      return prev;
    });

  return { phase, isMounted: phase !== null, handleAnimationEnd };
};

const PopoverRoot = forwardRef<HTMLDivElement, PopoverProps>(
  ({ isOpen, trigger, placement = 'bottom', className, children, ...rest }, ref) => {
    const { phase, isMounted, handleAnimationEnd } = usePopoverPresence(isOpen);
    return (
      <div ref={ref} className={className} {...rest}>
        {trigger !== undefined && <span className="popover__trigger">{trigger}</span>}
        {isMounted && (
          <div
            className="popover"
            role="dialog"
            data-placement={placement}
            data-entering={phase === 'entering' || undefined}
            data-exiting={phase === 'exiting' || undefined}
            onAnimationEnd={handleAnimationEnd}
          >
            <div className="popover__dialog">{children}</div>
          </div>
        )}
      </div>
    );
  },
);
PopoverRoot.displayName = 'Popover';

const Heading = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...rest }, ref) => (
    <h3 ref={ref} className={clsx('popover__heading', className)} {...rest} />
  ),
);
Heading.displayName = 'Popover.Heading';

const Popover = Object.assign(PopoverRoot, { Heading });

export default Popover;
