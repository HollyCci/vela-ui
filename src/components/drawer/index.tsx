import { forwardRef, type HTMLAttributes, type MouseEventHandler } from 'react';
import clsx from 'clsx';
import Button from '../button';

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
    if (!isOpen) return null;
    return (
      <>
        <div className={clsx('drawer__backdrop', `drawer__backdrop--${backdrop}`)} />
        <div className={clsx('drawer__content', `drawer__content--${placement}`)}>
          <div
            ref={ref}
            role="dialog"
            aria-modal="true"
            className={clsx('drawer__dialog', placement === 'top' && 'drawer__dialog--top', className)}
            data-placement={placement}
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
