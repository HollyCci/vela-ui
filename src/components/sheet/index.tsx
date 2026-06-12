import { forwardRef, type HTMLAttributes, type MouseEventHandler } from 'react';
import clsx from 'clsx';

export type SheetPlacement = 'left' | 'right' | 'top' | 'bottom';
export type SheetBackdrop = 'opaque' | 'blur' | 'transparent';

export type SheetProps = HTMLAttributes<HTMLDivElement> & {
  isOpen: boolean;
  onClose?: MouseEventHandler<HTMLButtonElement>;
  placement?: SheetPlacement;
  backdrop?: SheetBackdrop;
  isDetached?: boolean;
  hasHandle?: boolean;
};

type SectionProps = HTMLAttributes<HTMLDivElement>;

const SheetRoot = forwardRef<HTMLDivElement, SheetProps>(
  (
    {
      isOpen,
      onClose,
      placement = 'bottom',
      backdrop = 'opaque',
      isDetached = false,
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
        <div className={clsx('sheet__backdrop', `sheet__backdrop--${backdrop}`)} />
        <div
          className={clsx('sheet__content', `sheet__content--${placement}`)}
          data-sheet-detached={isDetached ? '' : undefined}
        >
          <div
            ref={ref}
            role="dialog"
            aria-modal="true"
            className={clsx('sheet__dialog', `sheet__dialog--${placement}`, className)}
            {...rest}
          >
            {hasHandle && (
              <div className="sheet__handle" aria-hidden="true">
                <span className="sheet__handle-bar" />
              </div>
            )}
            {children}
            {onClose !== undefined && (
              <button
                type="button"
                className="sheet__close-trigger"
                aria-label="关闭"
                onClick={onClose}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </>
    );
  },
);
SheetRoot.displayName = 'Sheet';

const Header = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('sheet__header', className)} {...rest} />
));
Header.displayName = 'Sheet.Header';

const Heading = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...rest }, ref) => (
    <h2 ref={ref} className={clsx('sheet__heading', className)} {...rest} />
  ),
);
Heading.displayName = 'Sheet.Heading';

const Body = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('sheet__body', className)} {...rest} />
));
Body.displayName = 'Sheet.Body';

const Footer = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('sheet__footer', className)} {...rest} />
));
Footer.displayName = 'Sheet.Footer';

const Sheet = Object.assign(SheetRoot, { Header, Heading, Body, Footer });

export default Sheet;
