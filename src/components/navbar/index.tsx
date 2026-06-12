import { forwardRef, type AnchorHTMLAttributes, type HTMLAttributes } from 'react';
import clsx from 'clsx';

export type NavbarVariant = 'sticky' | 'static' | 'floating';
export type NavbarSize = 'sm' | 'md' | 'lg';
export type NavbarMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

export type NavbarProps = HTMLAttributes<HTMLElement> & {
  variant?: NavbarVariant;
};

const NavbarRoot = forwardRef<HTMLElement, NavbarProps>(
  ({ variant = 'static', className, ...rest }, ref) => (
    <nav ref={ref} className={clsx('navbar', `navbar--${variant}`, className)} {...rest} />
  ),
);
NavbarRoot.displayName = 'Navbar';

export type NavbarHeaderProps = HTMLAttributes<HTMLDivElement> & {
  size?: NavbarSize;
  maxWidth?: NavbarMaxWidth;
};

const Header = forwardRef<HTMLDivElement, NavbarHeaderProps>(
  ({ size = 'md', maxWidth = 'lg', className, ...rest }, ref) => (
    <div
      ref={ref}
      className={clsx(
        'navbar__header',
        size !== 'md' && `navbar__header--${size}`,
        `navbar__header--max-${maxWidth}`,
        className,
      )}
      {...rest}
    />
  ),
);
Header.displayName = 'Navbar.Header';

type SectionProps = HTMLAttributes<HTMLDivElement>;

const Brand = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('navbar__brand', className)} {...rest} />
));
Brand.displayName = 'Navbar.Brand';

const Content = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('navbar__content', className)} {...rest} />
));
Content.displayName = 'Navbar.Content';

export type NavbarItemProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  isCurrent?: boolean;
  size?: NavbarSize;
};

const Item = forwardRef<HTMLAnchorElement, NavbarItemProps>(
  ({ isCurrent = false, size = 'md', className, children, ...rest }, ref) => (
    <a
      ref={ref}
      data-current={isCurrent || undefined}
      aria-current={isCurrent ? 'page' : undefined}
      className={clsx('navbar__item', size !== 'md' && `navbar__item--${size}`, className)}
      {...rest}
    >
      <span className="navbar__label">{children}</span>
    </a>
  ),
);
Item.displayName = 'Navbar.Item';

const Spacer = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('navbar__spacer', className)} aria-hidden="true" {...rest} />
));
Spacer.displayName = 'Navbar.Spacer';

export type NavbarSeparatorProps = HTMLAttributes<HTMLSpanElement>;

const NavbarSeparator = forwardRef<HTMLSpanElement, NavbarSeparatorProps>(
  ({ className, style, ...rest }, ref) => (
    <span
      ref={ref}
      role="separator"
      aria-orientation="vertical"
      className={clsx('navbar__separator', className)}
      style={{ borderLeftWidth: 1, borderLeftStyle: 'solid', ...style }}
      {...rest}
    />
  ),
);
NavbarSeparator.displayName = 'Navbar.Separator';

const Navbar = Object.assign(NavbarRoot, {
  Header,
  Brand,
  Content,
  Item,
  Spacer,
  Separator: NavbarSeparator,
});

export default Navbar;
