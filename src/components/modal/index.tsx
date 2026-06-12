import { forwardRef, type HTMLAttributes, type MouseEventHandler } from 'react';
import clsx from 'clsx';
import Button from '../button';

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
    if (!isOpen) return null;
    return (
      <div className={clsx('modal__backdrop', `modal__backdrop--${backdrop}`)}>
        <div className={clsx('modal__container', size === 'full' && 'modal__container--full')}>
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
