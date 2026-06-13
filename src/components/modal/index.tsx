import {
  forwardRef,
  useEffect,
  useState,
  type HTMLAttributes,
  type MouseEventHandler,
} from 'react';
import clsx from 'clsx';
import Button from '../button';

/**
 * 复刻 RAC ModalOverlay 的进出场生命周期，驱动 modal.css 已有的 @keyframes enter/exit：
 * 打开时以 data-entering 挂载（keyframe 自动从偏移态播放进场），enter 动画结束后清除该属性回到自然态；
 * 关闭时置 data-exiting 让 exit 动画反向播放，结束后卸载。enter/exit 完全由这两个数据属性驱动，缺它们则瞬现瞬隐。
 * data-entering 须保留整段进场时长（删早了 animation 属性消失会截断动画），故进/出场均以 animationend 推进。
 * reduce-motion 下 animation 被置 none、animationend 不触发，用定时器兜底推进 phase。
 */
type OverlayPhase = 'entering' | 'open' | 'exiting';

const useOverlayPresence = (isOpen: boolean) => {
  const [phase, setPhase] = useState<OverlayPhase | null>(isOpen ? 'open' : null);

  useEffect(() => {
    if (isOpen) {
      setPhase('entering');
      // 兜底：reduce-motion 下进场 animation 被置 none，无 animationend，定时器把 entering 推进到 open
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
    // 兜底：reduce-motion 下退场 animation 被置 none，无 animationend，定时器保证卸载
    const fallback = setTimeout(() => setPhase((prev) => (prev === 'exiting' ? null : prev)), 350);
    return () => clearTimeout(fallback);
  }, [isOpen]);

  // 进场结束清 data-entering（回自然态），退场结束卸载；事件冒泡的子动画不改变非匹配 phase
  const handleAnimationEnd = () =>
    setPhase((prev) => {
      if (prev === 'entering') return 'open';
      if (prev === 'exiting') return null;
      return prev;
    });

  return { phase, isMounted: phase !== null, handleAnimationEnd };
};

export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'full';
export type ModalPlacement = 'auto' | 'top' | 'center' | 'bottom';
export type ModalBackdrop = 'opaque' | 'blur' | 'transparent';

export type ModalProps = HTMLAttributes<HTMLDivElement> & {
  isOpen: boolean;
  onClose?: MouseEventHandler<HTMLButtonElement>;
  size?: ModalSize;
  placement?: ModalPlacement;
  backdrop?: ModalBackdrop;
};

type SectionProps = HTMLAttributes<HTMLDivElement>;

const ModalRoot = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      size = 'md',
      placement = 'auto',
      backdrop = 'opaque',
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const { phase, isMounted, handleAnimationEnd } = useOverlayPresence(isOpen);
    if (!isMounted) return null;
    const entering = phase === 'entering' || undefined;
    const exiting = phase === 'exiting' || undefined;
    return (
      <div
        className={clsx('modal__backdrop', `modal__backdrop--${backdrop}`)}
        data-entering={entering}
        data-exiting={exiting}
      >
        <div
          className={clsx('modal__container', size === 'full' && 'modal__container--full')}
          data-entering={entering}
          data-exiting={exiting}
          onAnimationEnd={handleAnimationEnd}
        >
          <div
            ref={ref}
            role="dialog"
            aria-modal="true"
            className={clsx('modal__dialog', `modal__dialog--${size}`, className)}
            data-placement={placement}
            {...rest}
          >
            {children}
            {onClose !== undefined && (
              <Button
                variant="ghost"
                size="sm"
                isIconOnly
                className="modal__close-trigger"
                aria-label="关闭"
                onClick={onClose}
              >
                ✕
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  },
);
ModalRoot.displayName = 'Modal';

const Header = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('modal__header', className)} {...rest} />
));
Header.displayName = 'Modal.Header';

const Heading = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...rest }, ref) => (
    <h2 ref={ref} className={clsx('modal__heading', className)} {...rest} />
  ),
);
Heading.displayName = 'Modal.Heading';

const Icon = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('modal__icon', className)} {...rest} />
));
Icon.displayName = 'Modal.Icon';

const Body = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('modal__body', className)} {...rest} />
));
Body.displayName = 'Modal.Body';

const Footer = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('modal__footer', className)} {...rest} />
));
Footer.displayName = 'Modal.Footer';

const Modal = Object.assign(ModalRoot, { Header, Heading, Icon, Body, Footer });

export default Modal;
