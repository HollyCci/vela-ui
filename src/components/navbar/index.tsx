'use client';

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type MouseEvent,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import { Separator, type SeparatorProps } from '@heroui/react';
import { ToggleButton, type ToggleButtonProps } from 'react-aria-components';
import clsx from 'clsx';

export type NavbarPosition = 'sticky' | 'static' | 'floating';
export type NavbarSize = 'sm' | 'md' | 'lg';
export type NavbarMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

export type NavbarProps = HTMLAttributes<HTMLElement> & {
  position?: NavbarPosition;
  size?: NavbarSize;
  maxWidth?: NavbarMaxWidth;
  /** 写入 --navbar-height 内联变量（参考实现默认 4rem） */
  height?: string;
  /** 下滑隐藏、上滑显示 */
  hideOnScroll?: boolean;
  /** hideOnScroll 监听的滚动容器，缺省为 window */
  parentRef?: RefObject<HTMLElement | null>;
  isMenuOpen?: boolean;
  defaultMenuOpen?: boolean;
  onMenuOpenChange?: (isOpen: boolean) => void;
  /** 移动端菜单打开时锁定 body 滚动 */
  shouldBlockScroll?: boolean;
  /** 客户端路由跳转函数，Item/MenuItem 的 href 经由它导航 */
  navigate?: (href: string) => void;
};

type NavbarContextValue = {
  size: NavbarSize;
  maxWidth: NavbarMaxWidth;
  height: string;
  isHidden: boolean;
  isMenuOpen: boolean;
  setMenuOpen: (isOpen: boolean) => void;
  navigate?: (href: string) => void;
};

const noop = () => undefined;

const NavbarContext = createContext<NavbarContextValue>({
  size: 'md',
  maxWidth: 'lg',
  height: '4rem',
  isHidden: false,
  isMenuOpen: false,
  setMenuOpen: noop,
});

/** 参考 API：在 Navbar 子树内读写菜单状态与滚动隐藏状态 */
export const useNavbar = () => {
  const { height, isHidden, isMenuOpen, setMenuOpen, navigate } = useContext(NavbarContext);
  return { height, isHidden, isMenuOpen, setMenuOpen, navigate };
};

/** 滚动方向判定阈值，过滤微小抖动 */
const SCROLL_DELTA_THRESHOLD = 10;

const NavbarRoot = forwardRef<HTMLElement, NavbarProps>(
  (
    {
      position = 'sticky',
      size = 'md',
      maxWidth = 'lg',
      height = '4rem',
      hideOnScroll = false,
      parentRef,
      isMenuOpen,
      defaultMenuOpen = false,
      onMenuOpenChange,
      shouldBlockScroll = true,
      navigate,
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) => {
    const [internalMenuOpen, setInternalMenuOpen] = useState(defaultMenuOpen);
    const menuOpen = isMenuOpen ?? internalMenuOpen;

    const setMenuOpen = useCallback(
      (next: boolean) => {
        if (isMenuOpen === undefined) setInternalMenuOpen(next);
        onMenuOpenChange?.(next);
      },
      [isMenuOpen, onMenuOpenChange],
    );

    const [isHidden, setIsHidden] = useState(false);
    const lastScrollTopRef = useRef(0);

    // 把滚动容器解析成真实元素并提升到 state：parentRef 指向的元素若在首个
    // effect 之后才挂载，这里会在该 commit 同步更新，驱动订阅 effect 重新订阅。
    const [scrollTarget, setScrollTarget] = useState<HTMLElement | null>(null);
    useLayoutEffect(() => {
      if (!hideOnScroll) {
        setScrollTarget(null);
        return;
      }
      setScrollTarget(parentRef?.current ?? null);
    });

    useEffect(() => {
      if (!hideOnScroll) {
        setIsHidden(false);
        return undefined;
      }
      const target: HTMLElement | Window = scrollTarget ?? window;
      const getScrollTop = () =>
        target instanceof Window ? target.scrollY : target.scrollTop;

      lastScrollTopRef.current = getScrollTop();
      const handleScroll = () => {
        const top = getScrollTop();
        const delta = top - lastScrollTopRef.current;
        if (Math.abs(delta) < SCROLL_DELTA_THRESHOLD) return;
        setIsHidden(delta > 0 && top > 0);
        lastScrollTopRef.current = top;
      };

      target.addEventListener('scroll', handleScroll, { passive: true });
      return () => target.removeEventListener('scroll', handleScroll);
    }, [hideOnScroll, scrollTarget]);

    // 菜单打开时锁定 body 滚动（参考实现默认行为，shouldBlockScroll=false 关闭）
    useEffect(() => {
      if (!shouldBlockScroll || !menuOpen) return undefined;
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }, [shouldBlockScroll, menuOpen]);

    const contextValue = useMemo<NavbarContextValue>(
      () => ({
        size,
        maxWidth,
        height,
        isHidden,
        isMenuOpen: menuOpen,
        setMenuOpen,
        navigate,
      }),
      [size, maxWidth, height, isHidden, menuOpen, setMenuOpen, navigate],
    );

    // 参考实现用 spring transform 隐藏；这里以内联 transform + transition 等效实现
    const rootStyle: CSSProperties = {
      '--navbar-height': height,
      ...(hideOnScroll
        ? {
            transform: isHidden ? 'translateY(-100%)' : 'none',
            transition: 'transform var(--navbar-transition-duration, 0.3s) ease',
          }
        : {}),
      ...style,
    } as CSSProperties;

    return (
      <nav
        ref={ref}
        data-slot="navbar"
        data-hidden={isHidden ? 'true' : undefined}
        data-menu-open={menuOpen ? 'true' : undefined}
        className={clsx('navbar', `navbar--${position}`, className)}
        style={rootStyle}
        {...rest}
      >
        <NavbarContext.Provider value={contextValue}>{children}</NavbarContext.Provider>
      </nav>
    );
  },
);
NavbarRoot.displayName = 'Navbar';

export type NavbarHeaderProps = HTMLAttributes<HTMLElement>;

const Header = forwardRef<HTMLElement, NavbarHeaderProps>(({ className, ...rest }, ref) => {
  const { size, maxWidth } = useContext(NavbarContext);

  return (
    <header
      ref={ref}
      data-slot="navbar-header"
      className={clsx(
        'navbar__header',
        `navbar__header--max-${maxWidth}`,
        `navbar__header--${size}`,
        className,
      )}
      {...rest}
    />
  );
});
Header.displayName = 'Navbar.Header';

export type NavbarBrandRenderProps = HTMLAttributes<HTMLElement> & { 'data-slot': string };

export type NavbarBrandProps = HTMLAttributes<HTMLDivElement> & {
  /** 多态：自定义渲染元素（如包一层路由 Link） */
  render?: (props: NavbarBrandRenderProps) => ReactElement;
};

const Brand = forwardRef<HTMLDivElement, NavbarBrandProps>(
  ({ render, className, ...rest }, ref) => {
    const brandProps = {
      'data-slot': 'navbar-brand',
      className: clsx('navbar__brand', className),
      ...rest,
    };
    if (render !== undefined) return render(brandProps);
    return <div ref={ref} {...brandProps} />;
  },
);
Brand.displayName = 'Navbar.Brand';

export type NavbarContentProps = HTMLAttributes<HTMLDivElement>;

const Content = forwardRef<HTMLDivElement, NavbarContentProps>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    data-slot="navbar-content"
    className={clsx('navbar__content', className)}
    {...rest}
  />
));
Content.displayName = 'Navbar.Content';

export type NavbarSpacerProps = HTMLAttributes<HTMLDivElement>;

const Spacer = forwardRef<HTMLDivElement, NavbarSpacerProps>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    aria-hidden="true"
    data-slot="navbar-spacer"
    className={clsx('navbar__spacer', className)}
    {...rest}
  />
));
Spacer.displayName = 'Navbar.Spacer';

export type NavbarLabelProps = HTMLAttributes<HTMLSpanElement>;

const Label = forwardRef<HTMLSpanElement, NavbarLabelProps>(({ className, ...rest }, ref) => (
  <span
    ref={ref}
    data-slot="navbar-label"
    className={clsx('navbar__label', className)}
    {...rest}
  />
));
Label.displayName = 'Navbar.Label';

export type NavbarSeparatorProps = Omit<SeparatorProps, 'className' | 'style' | 'orientation'> & {
  className?: string;
  style?: CSSProperties;
};

/** 包装 OSS Separator（orientation 固定 vertical），追加 navbar__separator 类 */
const NavbarSeparator = ({ className, ...rest }: NavbarSeparatorProps) => (
  <Separator
    orientation="vertical"
    data-slot="navbar-separator"
    className={clsx('navbar__separator', className)}
    {...rest}
  />
);
NavbarSeparator.displayName = 'Navbar.Separator';

const isExternalHref = (href: string) =>
  href.startsWith('http://') || href.startsWith('https://');

/** Item / MenuItem 共用的导航点击逻辑（外链新开、forceReload 整页刷新、navigate 客户端路由） */
const useNavbarItemPress = (
  href: string | undefined,
  forceReload: boolean,
  onClick: MouseEventHandler<HTMLElement> | undefined,
  shouldCloseMenu: boolean,
) => {
  const { navigate, setMenuOpen } = useContext(NavbarContext);

  return (event: MouseEvent<HTMLElement>) => {
    onClick?.(event);
    if (shouldCloseMenu) setMenuOpen(false);
    if (href === undefined || event.defaultPrevented) return;
    if (isExternalHref(href)) {
      event.preventDefault();
      window.open(href, '_blank', 'noopener,noreferrer');
      return;
    }
    if (forceReload) {
      event.preventDefault();
      window.location.href = href;
      return;
    }
    if (navigate !== undefined) {
      event.preventDefault();
      navigate(href);
    }
  };
};

export type NavbarItemRenderProps = {
  href?: string;
  className: string;
  style?: CSSProperties;
  children?: ReactNode;
  onClick: MouseEventHandler<HTMLElement>;
  'aria-current'?: 'page';
  'data-current'?: string;
  'data-slot': string;
};

export type NavbarItemProps = HTMLAttributes<HTMLElement> & {
  /** 提供时渲染 <a>，缺省渲染 <button type="button"> */
  href?: string;
  isCurrent?: boolean;
  /** 跳过 navigate 回调，用 window.location.href 整页跳转 */
  forceReload?: boolean;
  /** 多态：自定义渲染元素（如路由 Link） */
  render?: (props: NavbarItemRenderProps) => ReactElement;
};

const buildItemRenderProps = (
  blockName: 'navbar__item' | 'navbar__menu-item',
  slot: 'navbar-item' | 'navbar-menu-item',
  size: NavbarSize,
  props: Pick<NavbarItemProps, 'href' | 'isCurrent' | 'className' | 'style' | 'children'>,
  onClick: MouseEventHandler<HTMLElement>,
): NavbarItemRenderProps => ({
  href: props.href,
  className: clsx(blockName, `${blockName}--${size}`, props.className),
  style: props.style,
  children: props.children,
  onClick,
  'aria-current': props.isCurrent === true ? 'page' : undefined,
  'data-current': props.isCurrent === true ? 'true' : undefined,
  'data-slot': slot,
});

const Item = forwardRef<HTMLElement, NavbarItemProps>(
  (
    { href, isCurrent = false, forceReload = false, render, className, style, children, onClick, ...rest },
    ref,
  ) => {
    const { size } = useContext(NavbarContext);
    const handleClick = useNavbarItemPress(href, forceReload, onClick, false);
    const itemProps = buildItemRenderProps(
      'navbar__item',
      'navbar-item',
      size,
      { href, isCurrent, className, style, children },
      handleClick,
    );

    if (render !== undefined) return render(itemProps);
    if (href !== undefined) return <a ref={ref as Ref<HTMLAnchorElement>} {...itemProps} {...rest} />;
    return <button ref={ref as Ref<HTMLButtonElement>} type="button" {...itemProps} {...rest} />;
  },
);
Item.displayName = 'Navbar.Item';

export type NavbarMenuItemProps = NavbarItemProps;

const MenuItem = forwardRef<HTMLElement, NavbarMenuItemProps>(
  (
    { href, isCurrent = false, forceReload = false, render, className, style, children, onClick, ...rest },
    ref,
  ) => {
    const { size } = useContext(NavbarContext);
    // 与 Item 唯一的行为差异：按下后自动收起移动端菜单
    const handleClick = useNavbarItemPress(href, forceReload, onClick, true);
    const itemProps = buildItemRenderProps(
      'navbar__menu-item',
      'navbar-menu-item',
      size,
      { href, isCurrent, className, style, children },
      handleClick,
    );

    if (render !== undefined) return render(itemProps);
    if (href !== undefined) return <a ref={ref as Ref<HTMLAnchorElement>} {...itemProps} {...rest} />;
    return <button ref={ref as Ref<HTMLButtonElement>} type="button" {...itemProps} {...rest} />;
  },
);
MenuItem.displayName = 'Navbar.MenuItem';

export type NavbarMenuToggleProps = Omit<
  ToggleButtonProps,
  'className' | 'style' | 'children' | 'isSelected' | 'defaultSelected' | 'onChange'
> & {
  /** 读屏标签（参考实现默认 "Toggle navigation menu"） */
  srLabel?: string;
  /** 自定义图标；缺省为内置汉堡/关闭动画图标 */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const MenuToggle = forwardRef<HTMLButtonElement, NavbarMenuToggleProps>(
  ({ srLabel = 'Toggle navigation menu', className, children, ...rest }, ref) => {
    const { size, isMenuOpen, setMenuOpen } = useContext(NavbarContext);

    return (
      <ToggleButton
        ref={ref}
        data-slot="navbar-menu-toggle"
        aria-label={srLabel}
        isSelected={isMenuOpen}
        onChange={setMenuOpen}
        className={clsx('navbar__menu-toggle', `navbar__menu-toggle--${size}`, className)}
        {...rest}
      >
        {children ?? (
          <span data-slot="navbar-menu-toggle-icon" className="navbar__menu-toggle-icon" />
        )}
      </ToggleButton>
    );
  },
);
MenuToggle.displayName = 'Navbar.MenuToggle';

export type NavbarMenuProps = HTMLAttributes<HTMLDivElement>;

const MENU_TRANSITION_MS = 300;
const MENU_OPEN_HEIGHT = 'calc(100dvh - var(--navbar-height))';

/** 仅在 isMenuOpen 时挂载；height 0 ↔ calc(100dvh - 导航高度) 过渡，收起动画结束后卸载 */
const Menu = forwardRef<HTMLDivElement, NavbarMenuProps>(
  ({ className, style, children, ...rest }, ref) => {
    const { isMenuOpen } = useContext(NavbarContext);
    const [isPresent, setIsPresent] = useState(isMenuOpen);
    const innerRef = useRef<HTMLDivElement | null>(null);

    const setRefs = (node: HTMLDivElement | null) => {
      innerRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref !== null) ref.current = node;
    };

    useLayoutEffect(() => {
      const el = innerRef.current;
      if (isMenuOpen) {
        setIsPresent(true);
        if (el === null) return undefined;
        // 两阶段：先置收起态并强制 reflow，再切到目标值触发 height/opacity 过渡
        el.style.height = '0px';
        el.style.opacity = '0';
        void el.offsetHeight;
        el.style.height = MENU_OPEN_HEIGHT;
        el.style.opacity = '1';
        return undefined;
      }
      if (!isPresent) return undefined;
      if (el !== null) {
        el.style.height = '0px';
        el.style.opacity = '0';
      }
      const timer = setTimeout(() => setIsPresent(false), MENU_TRANSITION_MS);
      return () => clearTimeout(timer);
    }, [isMenuOpen, isPresent]);

    if (!isPresent) return null;

    return (
      <div
        ref={setRefs}
        data-slot="navbar-menu"
        className={clsx('navbar__menu', className)}
        style={{
          height: 0,
          opacity: 0,
          transition: `height ${MENU_TRANSITION_MS}ms ease, opacity ${MENU_TRANSITION_MS}ms ease`,
          ...style,
        }}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
Menu.displayName = 'Navbar.Menu';

const Navbar = Object.assign(NavbarRoot, {
  Header,
  Brand,
  Content,
  Item,
  Label,
  Separator: NavbarSeparator,
  Spacer,
  MenuToggle,
  Menu,
  MenuItem,
});

export default Navbar;
