import type { CSSProperties, HTMLAttributes } from 'react';
import {
  Modal as HeroModal,
  type ModalBackdropProps as HeroModalBackdropProps,
  type ModalCloseTriggerProps as HeroModalCloseTriggerProps,
  type ModalContainerProps as HeroModalContainerProps,
  type ModalDialogProps as HeroModalDialogProps,
  type ModalHeadingProps as HeroModalHeadingProps,
  type ModalIconProps as HeroModalIconProps,
  type ModalRootProps as HeroModalRootProps,
} from '@heroui/react';
import clsx from 'clsx';

export type ModalSize = NonNullable<HeroModalContainerProps['size']>;
export type ModalPlacement = NonNullable<HeroModalContainerProps['placement']>;
export type ModalBackdrop = NonNullable<HeroModalBackdropProps['variant']>;

export type ModalProps = Omit<HeroModalRootProps, 'children' | 'className' | 'style' | 'onOpenChange'> & {
  isOpen?: boolean;
  onClose?: () => void;
  onOpenChange?: HeroModalRootProps['onOpenChange'];
  size?: ModalSize;
  placement?: ModalPlacement;
  backdrop?: ModalBackdrop;
  className?: string;
  style?: CSSProperties;
  children?: HeroModalRootProps['children'];
};

export type ModalBackdropProps = Omit<HeroModalBackdropProps, 'className' | 'style' | 'variant'> & {
  variant?: ModalBackdrop;
  className?: string;
  style?: CSSProperties;
};
export type ModalContainerProps = Omit<HeroModalContainerProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};
export type ModalDialogProps = Omit<HeroModalDialogProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};
export type ModalHeaderProps = HTMLAttributes<HTMLDivElement>;
export type ModalHeadingProps = HeroModalHeadingProps;
export type ModalIconProps = HeroModalIconProps;
export type ModalBodyProps = HTMLAttributes<HTMLDivElement>;
export type ModalFooterProps = HTMLAttributes<HTMLDivElement>;
export type ModalCloseTriggerProps = Omit<HeroModalCloseTriggerProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

const ModalRoot = ({
  isOpen,
  onClose,
  onOpenChange,
  size = 'md',
  placement = 'auto',
  backdrop = 'opaque',
  className,
  style,
  children,
  ...rest
}: ModalProps) => {
  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange?.(nextOpen);
    if (!nextOpen) onClose?.();
  };

  return (
    <HeroModal data-slot="modal" isOpen={isOpen} onOpenChange={handleOpenChange} {...rest}>
      <Backdrop variant={backdrop}>
        <HeroModal.Container
          data-slot="modal-container"
          placement={placement}
          size={size}
          className={clsx(size === 'full' && 'modal__container--full')}
        >
          <HeroModal.Dialog
            data-slot="modal-dialog"
            aria-modal="true"
            className={className}
            style={style}
          >
            {children}
            {onClose !== undefined && (
              <CloseTrigger aria-label="关闭" />
            )}
          </HeroModal.Dialog>
        </HeroModal.Container>
      </Backdrop>
    </HeroModal>
  );
};
ModalRoot.displayName = 'Modal';

const Backdrop = ({ className, variant = 'opaque', ...rest }: ModalBackdropProps) => (
  <HeroModal.Backdrop data-slot="modal-backdrop" variant={variant} className={className} {...rest} />
);
Backdrop.displayName = 'Modal.Backdrop';

const Container = ({ className, size, ...rest }: ModalContainerProps) => (
  <HeroModal.Container
    data-slot="modal-container"
    size={size}
    className={clsx(size === 'full' && 'modal__container--full', className)}
    {...rest}
  />
);
Container.displayName = 'Modal.Container';

const Dialog = ({ className, ...rest }: ModalDialogProps) => (
  <HeroModal.Dialog data-slot="modal-dialog" aria-modal="true" className={className} {...rest} />
);
Dialog.displayName = 'Modal.Dialog';

const Header = ({ className, ...rest }: ModalHeaderProps) => (
  <HeroModal.Header data-slot="modal-header" className={className} {...rest} />
);
Header.displayName = 'Modal.Header';

const Heading = ({ className, ...rest }: ModalHeadingProps) => (
  <HeroModal.Heading
    data-slot="modal-heading"
    className={className}
    {...rest}
  />
);
Heading.displayName = 'Modal.Heading';

const Icon = ({ className, ...rest }: ModalIconProps) => (
  <HeroModal.Icon data-slot="modal-icon" className={className} {...rest} />
);
Icon.displayName = 'Modal.Icon';

const Body = ({ className, ...rest }: ModalBodyProps) => (
  <HeroModal.Body data-slot="modal-body" className={className} {...rest} />
);
Body.displayName = 'Modal.Body';

const Footer = ({ className, ...rest }: ModalFooterProps) => (
  <HeroModal.Footer data-slot="modal-footer" className={className} {...rest} />
);
Footer.displayName = 'Modal.Footer';

const CloseTrigger = ({ className, ...rest }: ModalCloseTriggerProps) => (
  <HeroModal.CloseTrigger data-slot="modal-close-trigger" className={className} {...rest} />
);
CloseTrigger.displayName = 'Modal.CloseTrigger';

const Modal = Object.assign(ModalRoot, {
  Backdrop,
  Container,
  Dialog,
  Header,
  Heading,
  Icon,
  Body,
  Footer,
  CloseTrigger,
});

export default Modal;
