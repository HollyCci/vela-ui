import {
  forwardRef,
  useEffect,
  useState,
  type HTMLAttributes,
  type MouseEventHandler,
  type TransitionEvent as ReactTransitionEvent,
} from 'react';
import clsx from 'clsx';
import Button from '../button';

/**
 * 复刻 RAC ModalOverlay 的进出场生命周期：挂载即带 data-entering 让面板停在出场位（translate 100%），
 * rAF 后清除回归 0 触发 translate 滑入；关闭时置 data-exiting 让面板 translate 回出场位，
 * 过渡结束（onTransitionEnd）再卸载。drawer.css 的滑入/滑出与遮罩淡入淡出完全由这两个数据属性驱动。
 * 抽屉用的是 CSS transition（非 keyframe animation），故监听 transitionend；reduce-motion 下用定时器兜底卸载。
 */
type OverlayPhase = 'entering' | 'open' | 'exiting';

const useOverlayPresence = (isOpen: boolean) => {
  const [phase, setPhase] = useState<OverlayPhase | null>(isOpen ? 'open' : null);

  useEffect(() => {
    if (isOpen) {
      setPhase('entering');
      const raf = requestAnimationFrame(() => setPhase('open'));
      return () => cancelAnimationFrame(raf);
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

  const handleExitTransitionEnd = (event: ReactTransitionEvent<HTMLDivElement>) => {
    // 仅面板自身的 translate 过渡结束才卸载（忽略子元素冒泡与非 translate 属性）
    if (event.target !== event.currentTarget || event.propertyName !== 'translate') return;
    setPhase((prev) => (prev === 'exiting' ? null : prev));
  };

  return { phase, isMounted: phase !== null, handleExitTransitionEnd };
};

export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';
export type DrawerBackdrop = 'opaque' | 'blur' | 'transparent';

export type DrawerProps = HTMLAttributes<HTMLDivElement> & {
  isOpen: boolean;
  onClose?: MouseEventHandler<HTMLButtonElement>;
  placement?: DrawerPlacement;
  backdrop?: DrawerBackdrop;
  hasHandle?: boolean;
};

type SectionProps = HTMLAttributes<HTMLDivElement>;

const DrawerRoot = forwardRef<HTMLDivElement, DrawerProps>(
  (
    {
      isOpen,
      onClose,
      placement = 'right',
      backdrop = 'opaque',
      hasHandle = false,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const { phase, isMounted, handleExitTransitionEnd } = useOverlayPresence(isOpen);
    if (!isMounted) return null;
    const entering = phase === 'entering' || undefined;
    const exiting = phase === 'exiting' || undefined;
    return (
      <>
        <div
          className={clsx('drawer__backdrop', `drawer__backdrop--${backdrop}`)}
          data-entering={entering}
          data-exiting={exiting}
        />
        <div
          className={clsx('drawer__content', `drawer__content--${placement}`)}
          data-entering={entering}
          data-exiting={exiting}
        >
          <div
            ref={ref}
            role="dialog"
            aria-modal="true"
            className={clsx('drawer__dialog', placement === 'top' && 'drawer__dialog--top', className)}
            data-placement={placement}
            onTransitionEnd={handleExitTransitionEnd}
            {...rest}
          >
            {hasHandle && (
              <div className="drawer__handle" aria-hidden="true">
                <span data-slot="drawer-handle-bar" />
              </div>
            )}
            {children}
            {onClose !== undefined && (
              <Button
                variant="ghost"
                size="sm"
                isIconOnly
                className="drawer__close-trigger"
                aria-label="关闭"
                onClick={onClose}
              >
                ✕
              </Button>
            )}
          </div>
        </div>
      </>
    );
  },
);
DrawerRoot.displayName = 'Drawer';

const Header = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('drawer__header', className)} {...rest} />
));
Header.displayName = 'Drawer.Header';

const Heading = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...rest }, ref) => (
    <h2 ref={ref} className={clsx('drawer__heading', className)} {...rest} />
  ),
);
Heading.displayName = 'Drawer.Heading';

const Body = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('drawer__body', className)} {...rest} />
));
Body.displayName = 'Drawer.Body';

const Footer = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('drawer__footer', className)} {...rest} />
));
Footer.displayName = 'Drawer.Footer';

const Drawer = Object.assign(DrawerRoot, { Header, Heading, Body, Footer });

export default Drawer;
