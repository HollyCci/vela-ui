import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import {
  Button,
  ScrollShadow,
  Separator,
  Tooltip,
  type ButtonProps as OssButtonProps,
  type ScrollShadowProps,
  type SeparatorProps,
} from '@heroui/react';
import {
  Button as RACButton,
  Tree,
  TreeItem,
  TreeItemContent,
  type ButtonProps as RACButtonProps,
  type TreeItemProps,
  type TreeProps,
} from 'react-aria-components';
import clsx from 'clsx';

export type SidebarSide = 'left' | 'right';
export type SidebarVariant = 'sidebar' | 'floating' | 'inset';
export type SidebarCollapsible = 'icon' | 'offcanvas' | 'none';
export type SidebarState = 'expanded' | 'collapsed';
export type SidebarGuideLines = boolean | 'hover';

/** Provider 下发的运行时状态与配置，所有子组件据此渲染 data-* 与受控行为 */
type SidebarContextValue = {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  isMobile: boolean;
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  side: SidebarSide;
  variant: SidebarVariant;
  collapsible: SidebarCollapsible;
  state: SidebarState;
  navigate?: (href: string) => void;
  reduceMotion: boolean;
  /** Group 通过 context 下发 closeMobileOnAction，MenuItem 按下后据此收起移动端 sheet */
  closeMobileOnAction: boolean;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

/** 原站 useSidebar：在 Provider 子树内做编程式控制（开合、移动端 sheet、读取 side/variant/collapsible） */
export const useSidebar = () => {
  const ctx = useContext(SidebarContext);
  if (ctx === null) {
    throw new Error('useSidebar must be used within <Sidebar.Provider>');
  }
  const { isOpen, setOpen, isMobile, isMobileOpen, setMobileOpen, toggleSidebar, side, variant, collapsible } = ctx;
  return { isOpen, setOpen, isMobile, isMobileOpen, setMobileOpen, toggleSidebar, side, variant, collapsible };
};

const MOBILE_BREAKPOINT = 768;
const SIDEBAR_COOKIE = 'sidebar_state';

/** 解析 "mod+b" 这类组合键串：mod=macOS Cmd / 其它 Ctrl */
const isApplePlatform = () =>
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform);

const matchesShortcut = (event: KeyboardEvent, combo: string): boolean => {
  const parts = combo.toLowerCase().split('+');
  const key = parts[parts.length - 1];
  const mods = new Set(parts.slice(0, -1));
  const apple = isApplePlatform();

  const needMeta = mods.has('meta') || mods.has('cmd') || (mods.has('mod') && apple);
  const needCtrl = mods.has('ctrl') || (mods.has('mod') && !apple);
  const needShift = mods.has('shift');
  const needAlt = mods.has('alt');

  if (event.metaKey !== needMeta) return false;
  if (event.ctrlKey !== needCtrl) return false;
  if (event.shiftKey !== needShift) return false;
  if (event.altKey !== needAlt) return false;
  return event.key.toLowerCase() === key;
};

export type SidebarProviderProps = Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'style'> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: SidebarSide;
  variant?: SidebarVariant;
  collapsible?: SidebarCollapsible;
  navigate?: (href: string) => void;
  reduceMotion?: boolean;
  /** "mod+b" 组合键，false/null 关闭快捷键 */
  toggleShortcut?: string | false | null;
  className?: string;
  style?: CSSProperties;
};

const Provider = forwardRef<HTMLDivElement, SidebarProviderProps>(
  (
    {
      open,
      defaultOpen = true,
      onOpenChange,
      side = 'left',
      variant = 'sidebar',
      collapsible = 'icon',
      navigate,
      reduceMotion = false,
      toggleShortcut = 'mod+b',
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const isControlled = open !== undefined;
    const isOpen = open ?? internalOpen;

    const setOpen = useCallback(
      (next: boolean) => {
        if (!isControlled) setInternalOpen(next);
        onOpenChange?.(next);
        // 非受控时写入 cookie，供 SSR 读取 defaultOpen 还原（原站行为）
        if (!isControlled && typeof document !== 'undefined') {
          document.cookie = `${SIDEBAR_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 7}`;
        }
      },
      [isControlled, onOpenChange],
    );

    const [isMobile, setIsMobile] = useState(false);
    const [isMobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
      const onChange = () => setIsMobile(mql.matches);
      onChange();
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    }, []);

    const toggleSidebar = useCallback(() => {
      if (isMobile) setMobileOpen(!isMobileOpen);
      else setOpen(!isOpen);
    }, [isMobile, isMobileOpen, isOpen, setOpen]);

    useEffect(() => {
      if (toggleShortcut === false || toggleShortcut === null || toggleShortcut === '') return undefined;
      const handleKeyDown = (event: KeyboardEvent) => {
        if (matchesShortcut(event, toggleShortcut)) {
          event.preventDefault();
          toggleSidebar();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggleShortcut, toggleSidebar]);

    const state: SidebarState = isOpen ? 'expanded' : 'collapsed';

    const contextValue = useMemo<SidebarContextValue>(
      () => ({
        isOpen,
        setOpen,
        toggleSidebar,
        isMobile,
        isMobileOpen,
        setMobileOpen,
        side,
        variant,
        collapsible,
        state,
        navigate,
        reduceMotion,
        closeMobileOnAction: true,
      }),
      [isOpen, setOpen, toggleSidebar, isMobile, isMobileOpen, side, variant, collapsible, state, navigate, reduceMotion],
    );

    return (
      <SidebarContext.Provider value={contextValue}>
        <div
          ref={ref}
          data-sidebar="provider"
          data-slot="sidebar-provider"
          data-state={state}
          className={clsx('sidebar__provider', className)}
          {...rest}
        >
          {children}
        </div>
      </SidebarContext.Provider>
    );
  },
);
Provider.displayName = 'Sidebar.Provider';

export type SidebarRootProps = Omit<HTMLAttributes<HTMLElement>, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

const SidebarRoot = forwardRef<HTMLElement, SidebarRootProps>(({ className, children, ...rest }, ref) => {
  const { side, variant, collapsible, state } = useSidebarContext();

  const aside = (
    <aside
      ref={ref}
      data-slot="sidebar"
      data-side={side}
      data-variant={variant}
      data-collapsible={collapsible}
      data-state={state}
      className={clsx('sidebar', `sidebar--${side}`, `sidebar--${variant === 'sidebar' ? 'default' : variant}`, className)}
      {...rest}
    >
      {children}
    </aside>
  );

  // offcanvas 模式用 wrapper 作为收起时宽度过渡到 0 的占位 spacer（原站 .sidebar__offcanvas-wrapper）
  if (collapsible === 'offcanvas') {
    return (
      <div className="sidebar__offcanvas-wrapper" data-side={side} data-state={state}>
        {aside}
      </div>
    );
  }
  return aside;
});
SidebarRoot.displayName = 'Sidebar';

/** 内部使用：必定在 Provider 内，返回完整 context */
const useSidebarContext = (): SidebarContextValue => {
  const ctx = useContext(SidebarContext);
  if (ctx === null) {
    throw new Error('Sidebar components must be used within <Sidebar.Provider>');
  }
  return ctx;
};

export type SidebarHeaderProps = HTMLAttributes<HTMLDivElement>;

const Header = forwardRef<HTMLDivElement, SidebarHeaderProps>(({ className, ...rest }, ref) => (
  <div ref={ref} data-slot="sidebar-header" className={clsx('sidebar__header', className)} {...rest} />
));
Header.displayName = 'Sidebar.Header';

export type SidebarContentProps = Omit<ScrollShadowProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

/** 中部可滚动区，包裹 OSS ScrollShadow 并隐藏滚动条（原站行为） */
const Content = forwardRef<HTMLDivElement, SidebarContentProps>(({ className, ...rest }, ref) => (
  <ScrollShadow
    ref={ref}
    hideScrollBar
    data-slot="sidebar-content"
    className={clsx('sidebar__content', className)}
    {...rest}
  />
));
Content.displayName = 'Sidebar.Content';

export type SidebarFooterProps = HTMLAttributes<HTMLDivElement>;

const Footer = forwardRef<HTMLDivElement, SidebarFooterProps>(({ className, ...rest }, ref) => (
  <div ref={ref} data-slot="sidebar-footer" className={clsx('sidebar__footer', className)} {...rest} />
));
Footer.displayName = 'Sidebar.Footer';

/** Group 通过 context 把 closeMobileOnAction 下发给内部所有 Menu/MenuItem */
const GroupContext = createContext<boolean>(true);

export type SidebarGroupProps = HTMLAttributes<HTMLDivElement> & {
  /** 组内菜单项被按下时是否自动收起移动端 sheet（默认 true，由后代继承） */
  closeMobileOnAction?: boolean;
};

const Group = forwardRef<HTMLDivElement, SidebarGroupProps>(
  ({ className, closeMobileOnAction = true, children, ...rest }, ref) => (
    <GroupContext.Provider value={closeMobileOnAction}>
      <div ref={ref} data-slot="sidebar-group" className={clsx('sidebar__group', className)} {...rest}>
        {children}
      </div>
    </GroupContext.Provider>
  ),
);
Group.displayName = 'Sidebar.Group';

export type SidebarGroupLabelProps = HTMLAttributes<HTMLDivElement>;

const GroupLabel = forwardRef<HTMLDivElement, SidebarGroupLabelProps>(({ className, ...rest }, ref) => (
  <div ref={ref} data-slot="sidebar-group-label" className={clsx('sidebar__group-label', className)} {...rest} />
));
GroupLabel.displayName = 'Sidebar.GroupLabel';

/** Menu 下发：菜单级 closeMobileOnAction（覆盖 group 级），供 MenuItem 收起 sheet */
const MenuContext = createContext<boolean>(true);

export type SidebarMenuProps<T extends object = object> = Omit<
  TreeProps<T>,
  | 'className'
  | 'style'
  | 'selectionMode'
  | 'selectionBehavior'
  | 'selectedKeys'
  | 'defaultSelectedKeys'
  | 'onSelectionChange'
  | 'disabledBehavior'
> & {
  /** 子菜单引导线：true 常显 / "hover" 悬停显 / false 不显（原站默认 true） */
  showGuideLines?: SidebarGuideLines;
  /** 覆盖 group 级的 closeMobileOnAction */
  closeMobileOnAction?: boolean;
  /** 仅本菜单禁用展开/收起动画（继承 Provider.reduceMotion） */
  reduceMotion?: boolean;
  className?: string;
  style?: CSSProperties;
};

/** 基于 RAC Tree 的树形菜单：键盘导航/typeahead/展开收起均由 RAC 自动提供 */
function MenuInner<T extends object>(
  { showGuideLines = true, closeMobileOnAction, className, children, ...rest }: SidebarMenuProps<T>,
) {
  const groupClose = useContext(GroupContext);
  const resolvedClose = closeMobileOnAction ?? groupClose;
  const guideLines = showGuideLines === true ? 'always' : showGuideLines === 'hover' ? 'hover' : undefined;

  return (
    <MenuContext.Provider value={resolvedClose}>
      <Tree
        data-slot="sidebar-menu"
        data-sidebar="menu"
        data-guide-lines={guideLines}
        className={clsx('sidebar__menu', className)}
        {...(rest as TreeProps<T>)}
      >
        {children}
      </Tree>
    </MenuContext.Provider>
  );
}
MenuInner.displayName = 'Sidebar.Menu';
const Menu = MenuInner as <T extends object>(props: SidebarMenuProps<T>) => ReactNode;

const isExternalHref = (href: string) => href.startsWith('http://') || href.startsWith('https://');

export type SidebarMenuItemProps = Omit<TreeItemProps, 'className' | 'style'> & {
  /** 标记为当前页（aria-current="page" + data-current 高亮） */
  isCurrent?: boolean;
  /** 客户端路由目标，经 Provider.navigate 跳转（RAC TreeItem 不能渲染为 <a>） */
  href?: string;
  /** 整页刷新跳转，跳过 navigate */
  forceReload?: boolean;
  /** 覆盖继承的 closeMobileOnAction（false 保持移动端 sheet 打开） */
  closeMobileOnAction?: boolean;
  className?: string;
  style?: CSSProperties;
};

const MenuItem = forwardRef<HTMLDivElement, SidebarMenuItemProps>(
  (
    { isCurrent = false, href, forceReload = false, closeMobileOnAction, onAction, className, children, ...rest },
    ref,
  ) => {
    const { navigate, isMobile, setMobileOpen } = useSidebarContext();
    const menuClose = useContext(MenuContext);
    const shouldClose = closeMobileOnAction ?? menuClose;

    const handleAction = useCallback(() => {
      onAction?.();
      if (isMobile && shouldClose) setMobileOpen(false);
      if (href === undefined) return;
      if (isExternalHref(href)) {
        window.open(href, '_blank', 'noopener,noreferrer');
        return;
      }
      if (forceReload || navigate === undefined) {
        window.location.href = href;
        return;
      }
      navigate(href);
    }, [onAction, isMobile, shouldClose, setMobileOpen, href, forceReload, navigate]);

    return (
      <TreeItem
        ref={ref}
        data-slot="sidebar-menu-item"
        data-current={isCurrent ? 'true' : undefined}
        data-href={href}
        aria-current={isCurrent ? 'page' : undefined}
        onAction={handleAction}
        className={clsx('sidebar__menu-item', className)}
        {...rest}
      >
        {children}
      </TreeItem>
    );
  },
);
MenuItem.displayName = 'Sidebar.MenuItem';

export type SidebarMenuItemContentProps = HTMLAttributes<HTMLDivElement>;

/** 包裹 RAC TreeItemContent：RAC 在此处理 chevron slot 与 row 渲染上下文 */
const MenuItemContent = ({ className, children, ...rest }: SidebarMenuItemContentProps) => (
  <TreeItemContent>
    <div data-slot="sidebar-menu-item-content" className={clsx('sidebar__menu-item-content', className)} {...rest}>
      {children}
    </div>
  </TreeItemContent>
);
MenuItemContent.displayName = 'Sidebar.MenuItemContent';

export type SidebarMenuIconProps = HTMLAttributes<HTMLSpanElement>;

const MenuIcon = forwardRef<HTMLSpanElement, SidebarMenuIconProps>(({ className, ...rest }, ref) => (
  <span ref={ref} data-slot="sidebar-menu-icon" className={clsx('sidebar__menu-icon', className)} {...rest} />
));
MenuIcon.displayName = 'Sidebar.MenuIcon';

export type SidebarMenuLabelProps = HTMLAttributes<HTMLSpanElement>;

/** 标签：内部文本套一层 sidebar__menu-label-text 以截断，并把尾随的 chevron/chip 留在外层 */
const MenuLabel = forwardRef<HTMLSpanElement, SidebarMenuLabelProps>(
  ({ className, children, ...rest }, ref) => (
    <span
      ref={ref}
      data-slot="sidebar-menu-label"
      data-sidebar="label"
      className={clsx('sidebar__menu-label', className)}
      {...rest}
    >
      <span className="sidebar__menu-label-text" data-slot="sidebar-menu-label-text">
        {children}
      </span>
    </span>
  ),
);
MenuLabel.displayName = 'Sidebar.MenuLabel';

export type SidebarMenuChipProps = HTMLAttributes<HTMLSpanElement>;

const MenuChip = forwardRef<HTMLSpanElement, SidebarMenuChipProps>(({ className, ...rest }, ref) => (
  <span ref={ref} data-slot="sidebar-menu-chip" className={clsx('sidebar__menu-chip', className)} {...rest} />
));
MenuChip.displayName = 'Sidebar.MenuChip';

export type SidebarMenuActionsProps = HTMLAttributes<HTMLDivElement>;

const MenuActions = forwardRef<HTMLDivElement, SidebarMenuActionsProps>(({ className, ...rest }, ref) => (
  <div ref={ref} data-slot="sidebar-menu-actions" className={clsx('sidebar__menu-actions', className)} {...rest} />
));
MenuActions.displayName = 'Sidebar.MenuActions';

export type SidebarMenuActionProps = Omit<RACButtonProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

const MenuAction = ({ className, ...rest }: SidebarMenuActionProps) => (
  <RACButton
    data-slot="sidebar-menu-action"
    className={clsx('sidebar__menu-action', className)}
    {...rest}
  />
);
MenuAction.displayName = 'Sidebar.MenuAction';

/** 默认 chevron 图标（展开时由 CSS 旋转 90°） */
const DefaultIndicator = () => (
  <svg
    fill="none"
    height="16"
    viewBox="0 0 16 16"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
    className="sidebar__menu-indicator"
    data-slot="sidebar-menu-indicator"
  >
    <path
      clipRule="evenodd"
      d="M5.47 13.03a.75.75 0 0 1 0-1.06L9.44 8 5.47 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export type SidebarMenuIndicatorProps = HTMLAttributes<HTMLElement> & {
  children?: ReactNode;
};

/** chevron 图标本体；放入 MenuTrigger（slot="chevron"）内部 */
const MenuIndicator = ({ children }: SidebarMenuIndicatorProps) => <>{children ?? <DefaultIndicator />}</>;
MenuIndicator.displayName = 'Sidebar.MenuIndicator';

export type SidebarMenuTriggerProps = Omit<RACButtonProps, 'className' | 'style' | 'slot'> & {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

/**
 * 展开/收起触发器：RAC Button slot="chevron"，TreeItemContent 会自动接管点击展开逻辑，
 * 并在无子项时隐藏（原站 CSS 据 [data-has-child-items] 控制）。缺省渲染默认 chevron。
 */
const MenuTrigger = ({ className, children, ...rest }: SidebarMenuTriggerProps) => (
  <RACButton
    slot="chevron"
    data-slot="sidebar-menu-trigger"
    className={clsx('sidebar__menu-trigger', className)}
    {...rest}
  >
    {children ?? <DefaultIndicator />}
  </RACButton>
);
MenuTrigger.displayName = 'Sidebar.MenuTrigger';

export type SidebarSubmenuProps = {
  children?: ReactNode;
};

/** 嵌套子项容器：RAC Tree 直接渲染子 TreeItem，这里仅作语义包装 */
const Submenu = ({ children }: SidebarSubmenuProps) => <>{children}</>;
Submenu.displayName = 'Sidebar.Submenu';

export type SidebarSeparatorProps = Omit<SeparatorProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

const SidebarSeparator = ({ className, ...rest }: SidebarSeparatorProps) => (
  <Separator data-slot="sidebar-separator" className={clsx('sidebar__separator', className)} {...rest} />
);
SidebarSeparator.displayName = 'Sidebar.Separator';

export type SidebarRailProps = Omit<HTMLAttributes<HTMLButtonElement>, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

/** 侧栏边缘条：点击切换开合，显示方向 resize 光标（原站行为） */
const Rail = forwardRef<HTMLButtonElement, SidebarRailProps>(({ className, onClick, ...rest }, ref) => {
  const { toggleSidebar } = useSidebarContext();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) toggleSidebar();
  };

  return (
    <button
      ref={ref}
      type="button"
      tabIndex={-1}
      aria-label="Toggle sidebar"
      data-slot="sidebar-rail"
      className={clsx('sidebar__rail', className)}
      onClick={handleClick}
      {...rest}
    />
  );
});
Rail.displayName = 'Sidebar.Rail';

export type SidebarTriggerProps = Omit<OssButtonProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

/** 开合按钮：OSS Button（variant="ghost" size="sm"），点击切换侧栏 */
const Trigger = ({ className, onPress, children, ...rest }: SidebarTriggerProps) => {
  const { toggleSidebar } = useSidebarContext();

  const handlePress: OssButtonProps['onPress'] = (event) => {
    onPress?.(event);
    toggleSidebar();
  };

  return (
    <Button
      data-slot="sidebar-trigger"
      variant="ghost"
      size="sm"
      isIconOnly
      className={className}
      onPress={handlePress}
      {...rest}
    >
      {children ?? <DefaultTriggerIcon />}
    </Button>
  );
};
Trigger.displayName = 'Sidebar.Trigger';

const DefaultTriggerIcon = () => (
  <svg fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg" className="size-4">
    <path
      clipRule="evenodd"
      d="M6 3.5h6A1.5 1.5 0 0 1 13.5 5v6a1.5 1.5 0 0 1-1.5 1.5H6zm-1.5 0H4A1.5 1.5 0 0 0 2.5 5v6A1.5 1.5 0 0 0 4 12.5h.5zM1 5a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export type SidebarMainProps = Omit<HTMLAttributes<HTMLElement>, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

const Main = forwardRef<HTMLElement, SidebarMainProps>(({ className, ...rest }, ref) => (
  <main ref={ref} data-slot="sidebar-main" className={clsx('sidebar__main', className)} {...rest} />
));
Main.displayName = 'Sidebar.Main';

export type SidebarTooltipProps = {
  content: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  closeDelay?: number;
  children: ReactNode;
};

/**
 * Tooltip：仅在侧栏收起时显示（原站行为）。展开时直接渲染 children，
 * 收起时包一层 OSS Tooltip（其 Trigger 即 children，触发器不另套 button）。
 */
const SidebarTooltip = ({ content, placement = 'right', delay, closeDelay, children }: SidebarTooltipProps) => {
  const { state } = useSidebarContext();
  if (state === 'expanded') return <>{children}</>;

  return (
    <Tooltip delay={delay} closeDelay={closeDelay}>
      {children}
      <Tooltip.Content placement={placement}>{content}</Tooltip.Content>
    </Tooltip>
  );
};
SidebarTooltip.displayName = 'Sidebar.Tooltip';

export type SidebarMobileBackdrop = 'blur' | 'opaque' | 'transparent';

export type SidebarMobileProps = {
  /** 移动端 sheet 遮罩样式（原站默认 blur） */
  backdrop?: SidebarMobileBackdrop;
  children?: ReactNode;
};

/**
 * 移动端 sheet 包装：桌面端不渲染任何东西；移动端把 children 包进一个从 side 滑入的抽屉容器，
 * 开合受 Provider 的 isMobileOpen 控制。底座样式由 .sidebar__mobile / .sidebar__mobile-sheet 提供。
 */
const Mobile = ({ backdrop = 'blur', children }: SidebarMobileProps) => {
  const { isMobile, isMobileOpen, setMobileOpen, side } = useSidebarContext();
  const titleId = useId();

  if (!isMobile) return null;

  const handleBackdropClick = () => setMobileOpen(false);

  return (
    <div
      data-slot="sidebar-mobile"
      data-state={isMobileOpen ? 'open' : 'closed'}
      data-side={side}
      data-backdrop={backdrop}
      className="sidebar__mobile"
      hidden={!isMobileOpen}
    >
      <div
        role="presentation"
        className="sidebar__mobile-backdrop"
        data-slot="sidebar-mobile-backdrop"
        onClick={handleBackdropClick}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-slot="sidebar-mobile-dialog"
        className="sidebar__mobile-dialog"
      >
        <div data-slot="sidebar-mobile-sheet" className="sidebar__mobile-sheet">
          {children}
        </div>
      </div>
    </div>
  );
};
Mobile.displayName = 'Sidebar.Mobile';

const Sidebar = Object.assign(SidebarRoot, {
  Provider,
  Header,
  Content,
  Footer,
  Group,
  GroupLabel,
  Menu,
  MenuItem,
  MenuItemContent,
  MenuIcon,
  MenuLabel,
  MenuChip,
  MenuActions,
  MenuAction,
  MenuTrigger,
  MenuIndicator,
  Submenu,
  Separator: SidebarSeparator,
  Rail,
  Trigger,
  Main,
  Tooltip: SidebarTooltip,
  Mobile,
});

export default Sidebar;
