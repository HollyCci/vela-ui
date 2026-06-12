import { forwardRef, type HTMLAttributes, type MouseEventHandler } from 'react';
import clsx from 'clsx';
import Button from '../button';

export type AlertDialogSize = 'xs' | 'sm' | 'md' | 'lg' | 'cover';
export type AlertDialogPlacement = 'auto' | 'top' | 'center' | 'bottom';
export type AlertDialogBackdrop = 'opaque' | 'blur' | 'transparent';
export type AlertDialogIconColor = 'default' | 'accent' | 'success' | 'warning' | 'danger';

export type AlertDialogProps = HTMLAttributes<HTMLDivElement> & {
  isOpen: boolean;
  onClose?: MouseEventHandler<HTMLButtonElement>;
  size?: AlertDialogSize;
  placement?: AlertDialogPlacement;
  backdrop?: AlertDialogBackdrop;
};

type SectionProps = HTMLAttributes<HTMLDivElement>;

const AlertDialogRoot = forwardRef<HTMLDivElement, AlertDialogProps>(
  (
    {
      isOpen,
      onClose,
      size = 'sm',
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
      <div className={clsx('alert-dialog__backdrop', `alert-dialog__backdrop--${backdrop}`)}>
        <div className="alert-dialog__container">
          <div
            ref={ref}
            role="alertdialog"
            aria-modal="true"
            className={clsx('alert-dialog__dialog', `alert-dialog__dialog--${size}`, className)}
            data-placement={placement}
            {...rest}
          >
            {children}
            {onClose !== undefined && (
              <Button
                variant="ghost"
                size="sm"
                isIconOnly
                className="alert-dialog__close-trigger"
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
AlertDialogRoot.displayName = 'AlertDialog';

export type AlertDialogIconProps = SectionProps & {
  color?: AlertDialogIconColor;
};

const Icon = forwardRef<HTMLDivElement, AlertDialogIconProps>(
  ({ color = 'default', className, ...rest }, ref) => (
    <div
      ref={ref}
      className={clsx('alert-dialog__icon', `alert-dialog__icon--${color}`, className)}
      {...rest}
    />
  ),
);
Icon.displayName = 'AlertDialog.Icon';

const Header = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('alert-dialog__header', className)} {...rest} />
));
Header.displayName = 'AlertDialog.Header';

const Heading = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...rest }, ref) => (
    <h2 ref={ref} className={clsx('alert-dialog__heading', className)} {...rest} />
  ),
);
Heading.displayName = 'AlertDialog.Heading';

const Body = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('alert-dialog__body', className)} {...rest} />
));
Body.displayName = 'AlertDialog.Body';

const Footer = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('alert-dialog__footer', className)} {...rest} />
));
Footer.displayName = 'AlertDialog.Footer';

const AlertDialog = Object.assign(AlertDialogRoot, { Icon, Header, Heading, Body, Footer });

export default AlertDialog;
