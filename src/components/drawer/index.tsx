import type { CSSProperties, HTMLAttributes } from 'react';
import {
  Drawer as HeroDrawer,
  type DrawerBackdropProps as HeroDrawerBackdropProps,
  type DrawerContentProps as HeroDrawerContentProps,
  type DrawerHeadingProps as HeroDrawerHeadingProps,
  type DrawerRootProps as HeroDrawerRootProps,
} from '@heroui/react';
import clsx from 'clsx';

export type DrawerPlacement = NonNullable<HeroDrawerContentProps['placement']>;
export type DrawerBackdrop = NonNullable<HeroDrawerBackdropProps['variant']>;

export type DrawerProps = Omit<HeroDrawerRootProps, 'children' | 'className' | 'style' | 'onOpenChange'> & {
  isOpen: boolean;
  onClose?: () => void;
  placement?: DrawerPlacement;
  backdrop?: DrawerBackdrop;
  hasHandle?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: HeroDrawerRootProps['children'];
};

export type DrawerHeaderProps = HTMLAttributes<HTMLDivElement>;
export type DrawerHeadingProps = HeroDrawerHeadingProps;
export type DrawerBodyProps = HTMLAttributes<HTMLDivElement>;
export type DrawerFooterProps = HTMLAttributes<HTMLDivElement>;

const DrawerRoot = ({
  isOpen,
  onClose,
  placement = 'right',
  backdrop = 'opaque',
  hasHandle = false,
  className,
  style,
  children,
  ...rest
}: DrawerProps) => {
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) onClose?.();
  };

  return (
    <HeroDrawer data-slot="drawer" isOpen={isOpen} onOpenChange={handleOpenChange} {...rest}>
      <HeroDrawer.Backdrop
        data-slot="drawer-backdrop"
        variant={backdrop}
      >
        <HeroDrawer.Content
          data-slot="drawer-content"
          placement={placement}
        >
          <HeroDrawer.Dialog
            data-slot="drawer-dialog"
            aria-modal="true"
            className={clsx(placement === 'top' && 'drawer__dialog--top', className)}
            style={style}
          >
            {hasHandle && (
              <HeroDrawer.Handle data-slot="drawer-handle" />
            )}
            {children}
            {onClose !== undefined && (
              <HeroDrawer.CloseTrigger aria-label="关闭" />
            )}
          </HeroDrawer.Dialog>
        </HeroDrawer.Content>
      </HeroDrawer.Backdrop>
    </HeroDrawer>
  );
};
DrawerRoot.displayName = 'Drawer';

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

const Drawer = Object.assign(DrawerRoot, { Header, Heading, Body, Footer });

export default Drawer;
