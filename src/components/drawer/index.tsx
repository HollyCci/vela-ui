'use client';

import type { CSSProperties, HTMLAttributes } from 'react';
import {
  Drawer as HeroDrawer,
  type DrawerBackdropProps as HeroDrawerBackdropProps,
  type DrawerCloseTriggerProps as HeroDrawerCloseTriggerProps,
  type DrawerContentProps as HeroDrawerContentProps,
  type DrawerDialogProps as HeroDrawerDialogProps,
  type DrawerHandleProps as HeroDrawerHandleProps,
  type DrawerHeadingProps as HeroDrawerHeadingProps,
  type DrawerRootProps as HeroDrawerRootProps,
} from '@heroui/react';
import clsx from 'clsx';

export type DrawerPlacement = NonNullable<HeroDrawerContentProps['placement']>;
export type DrawerBackdrop = NonNullable<HeroDrawerBackdropProps['variant']>;

export type DrawerProps = Omit<HeroDrawerRootProps, 'children' | 'className' | 'style' | 'onOpenChange'> & {
  isOpen?: boolean;
  onClose?: () => void;
  onOpenChange?: HeroDrawerRootProps['onOpenChange'];
  placement?: DrawerPlacement;
  backdrop?: DrawerBackdrop;
  hasHandle?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: HeroDrawerRootProps['children'];
};

export type DrawerBackdropProps = Omit<HeroDrawerBackdropProps, 'className' | 'style' | 'variant'> & {
  variant?: DrawerBackdrop;
  className?: string;
  style?: CSSProperties;
};
export type DrawerContentProps = Omit<HeroDrawerContentProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};
export type DrawerDialogProps = Omit<HeroDrawerDialogProps, 'className' | 'style'> & {
  placement?: DrawerPlacement;
  className?: string;
  style?: CSSProperties;
};
export type DrawerHeaderProps = HTMLAttributes<HTMLDivElement>;
export type DrawerHeadingProps = HeroDrawerHeadingProps;
export type DrawerBodyProps = HTMLAttributes<HTMLDivElement>;
export type DrawerFooterProps = HTMLAttributes<HTMLDivElement>;
export type DrawerHandleProps = Omit<HeroDrawerHandleProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};
export type DrawerCloseTriggerProps = Omit<HeroDrawerCloseTriggerProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

const DrawerRoot = ({
  isOpen,
  onClose,
  onOpenChange,
  placement = 'right',
  backdrop = 'opaque',
  hasHandle = false,
  className,
  style,
  children,
  ...rest
}: DrawerProps) => {
  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange?.(nextOpen);
    if (!nextOpen) onClose?.();
  };

  return (
    <HeroDrawer data-slot="drawer" isOpen={isOpen} onOpenChange={handleOpenChange} {...rest}>
      <Backdrop variant={backdrop}>
        <Content placement={placement}>
          <HeroDrawer.Dialog
            data-slot="drawer-dialog"
            aria-modal="true"
            className={clsx(placement === 'top' && 'drawer__dialog--top', className)}
            style={style}
          >
            {hasHandle && (
              <Handle />
            )}
            {children}
            {onClose !== undefined && (
              <CloseTrigger aria-label="关闭" />
            )}
          </HeroDrawer.Dialog>
        </Content>
      </Backdrop>
    </HeroDrawer>
  );
};
DrawerRoot.displayName = 'Drawer';

const Backdrop = ({ className, variant = 'opaque', ...rest }: DrawerBackdropProps) => (
  <HeroDrawer.Backdrop data-slot="drawer-backdrop" variant={variant} className={className} {...rest} />
);
Backdrop.displayName = 'Drawer.Backdrop';

const Content = ({ className, ...rest }: DrawerContentProps) => (
  <HeroDrawer.Content data-slot="drawer-content" className={className} {...rest} />
);
Content.displayName = 'Drawer.Content';

const Dialog = ({ className, placement = 'right', ...rest }: DrawerDialogProps) => (
  <HeroDrawer.Dialog
    data-slot="drawer-dialog"
    aria-modal="true"
    className={clsx(placement === 'top' && 'drawer__dialog--top', className)}
    {...rest}
  />
);
Dialog.displayName = 'Drawer.Dialog';

const Header = ({ className, ...rest }: DrawerHeaderProps) => (
  <HeroDrawer.Header data-slot="drawer-header" className={className} {...rest} />
);
Header.displayName = 'Drawer.Header';

const Heading = ({ className, ...rest }: DrawerHeadingProps) => (
  <HeroDrawer.Heading
    data-slot="drawer-heading"
    className={className}
    {...rest}
  />
);
Heading.displayName = 'Drawer.Heading';

const Body = ({ className, ...rest }: DrawerBodyProps) => (
  <HeroDrawer.Body data-slot="drawer-body" className={className} {...rest} />
);
Body.displayName = 'Drawer.Body';

const Footer = ({ className, ...rest }: DrawerFooterProps) => (
  <HeroDrawer.Footer data-slot="drawer-footer" className={className} {...rest} />
);
Footer.displayName = 'Drawer.Footer';

const Handle = ({ className, ...rest }: DrawerHandleProps) => (
  <HeroDrawer.Handle data-slot="drawer-handle" className={className} {...rest} />
);
Handle.displayName = 'Drawer.Handle';

const CloseTrigger = ({ className, ...rest }: DrawerCloseTriggerProps) => (
  <HeroDrawer.CloseTrigger data-slot="drawer-close-trigger" className={className} {...rest} />
);
CloseTrigger.displayName = 'Drawer.CloseTrigger';

const Drawer = Object.assign(DrawerRoot, {
  Backdrop,
  Content,
  Dialog,
  Header,
  Heading,
  Body,
  Footer,
  Handle,
  CloseTrigger,
});

export default Drawer;
