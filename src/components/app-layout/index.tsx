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
  type ReactElement,
  type ReactNode,
} from 'react';
import { Button, Tooltip, type ButtonProps } from '@heroui/react';
import clsx from 'clsx';
import Resizable from '../resizable';

export type AppLayoutSidebarSide = 'left' | 'right';
export type AppLayoutSidebarVariant = 'sidebar' | 'floating' | 'inset';
export type AppLayoutSidebarCollapsible = 'icon' | 'offcanvas' | 'none';
export type AppLayoutScrollMode = 'page' | 'content';
export type AppLayoutAsideMobile = 'hidden' | 'sheet';

/** 同时供 MenuToggle / AsideTrigger 的内部 Tooltip 透传（原站 AppLayoutTooltipProps） */
export type AppLayoutTooltipProps = {
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  closeDelay?: number;
  offset?: number;
  showArrow?: boolean;
  isDisabled?: boolean;
  className?: string;
};

export type AppLayoutProps = Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'style'> & {
  /** 满高侧栏区域内容（通常是 Sidebar + Sidebar.Mobile） */
  sidebar?: ReactNode;
  /** 渲染进 body 顶部 sticky header 行的导航条 */
  navbar?: ReactNode;
  /** 右侧可选 aside 面板内容（满高，移动端隐藏） */
  aside?: ReactNode;
  /** 主内容区，渲染在 <main> 内 */
  children?: ReactNode;
  /** navbar 下方第二条 sticky 行 */
  toolbar?: ReactNode;
  /** 固定在 body 列底部的行 */
  footer?: ReactNode;

  // —— 侧栏受控/非受控折叠（联动主内容宽度）——
  sidebarOpen?: boolean;
  defaultSidebarOpen?: boolean;
  onSidebarOpenChange?: (open: boolean) => void;
  sidebarSide?: AppLayoutSidebarSide;
  sidebarVariant?: AppLayoutSidebarVariant;
  sidebarCollapsible?: AppLayoutSidebarCollapsible;

  // —— 右侧 aside 受控/非受控 ——
  asideOpen?: boolean;
  defaultAsideOpen?: boolean;
  onAsideOpenChange?: (open: boolean) => void;
  /** 移动端（≤1024px）aside 行为：hidden 隐藏 / sheet 用 Sheet 呈现 */
  asideMobile?: AppLayoutAsideMobile;

  /** 客户端路由跳转，转发给内部 provider（供 children 中的导航项消费） */
  navigate?: (href: string) => void;
  /** 关闭嵌套侧栏展开动画（用户系统偏好仍尊重） */
  reduceMotion?: boolean;
  /** 切换侧栏的快捷键（原站默认 "mod+b"，false/null 关闭） */
  toggleShortcut?: string | false | null;
  /** 切换 aside 的快捷键（默认关闭） */
  asideToggleShortcut?: string | false | null;

  // —— 可调整尺寸（resizable）——
  sidebarResizable?: boolean;
  sidebarDefaultSize?: number;
  sidebarMinSize?: number;
  sidebarMaxSize?: number;
  asideResizable?: boolean;
  asideDefaultSize?: number;
  asideMinSize?: number;
  asideMaxSize?: number;
  resizableAutoSaveId?: string;

  /** page：window/body 滚动；content：仅主列滚动、外壳钉死视口 */
  scrollMode?: AppLayoutScrollMode;

  className?: string;
  style?: CSSProperties;
};

type AppLayoutContextValue = {
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  isAsideOpen: boolean;
  setAsideOpen: (open: boolean) => void;
  toggleAside: () => void;
  /** 是否存在 aside（决定 AsideTrigger 是否渲染语义） */
  hasAside: boolean;
  scrollMode: AppLayoutScrollMode;
  navigate?: (href: string) => void;
};

const AppLayoutContext = createContext<AppLayoutContextValue | null>(null);

/** 原站 API：在 AppLayout children 内读写 aside 状态；不在 AppLayout 内时返回 null */
export const useAppLayout = (): {
  isAsideOpen: boolean;
  setAsideOpen: (open: boolean) => void;
  toggleAside: () => void;
} | null => {
  const ctx = useContext(AppLayoutContext);
  if (ctx === null) return null;
  return {
    isAsideOpen: ctx.isAsideOpen,
    setAsideOpen: ctx.setAsideOpen,
    toggleAside: ctx.toggleAside,
  };
};

/** MobileAside 是 marker：被识别后从 children 中剔除，仅在 sheet 模式下注入 */
const MOBILE_ASIDE_TYPE = Symbol('AppLayout.MobileAside');

export type AppLayoutMobileAsideProps = {
  children?: ReactNode;
};

const MobileAside = (_props: AppLayoutMobileAsideProps): ReactElement | null => null;
MobileAside.displayName = 'AppLayout.MobileAside';
(MobileAside as unknown as { $$typeof: symbol }).$$typeof = MOBILE_ASIDE_TYPE;

/** 解析快捷键串（mod+b / ctrl+alt+k / shift+?），匹配按下返回 true */
const matchShortcut = (combo: string, event: KeyboardEvent): boolean => {
  const parts = combo.toLowerCase().split('+').map((p) => p.trim());
  const key = parts[parts.length - 1];
  const mods = new Set(parts.slice(0, -1));
  const wantMod = mods.has('mod');
  const wantCtrl = mods.has('ctrl');
  const wantAlt = mods.has('alt');
  const wantShift = mods.has('shift');
  const wantMeta = mods.has('meta') || mods.has('cmd');

  const modPressed = event.metaKey || event.ctrlKey;
  if (wantMod && !modPressed) return false;
  if (wantCtrl && !event.ctrlKey) return false;
  if (wantMeta && !event.metaKey) return false;
  if (wantAlt && !event.altKey) return false;
  if (wantShift && !event.shiftKey) return false;
  return event.key.toLowerCase() === key;
};

/** 受控/非受控开关 hook（侧栏与 aside 共用） */
const useControllableOpen = (
  controlled: boolean | undefined,
  defaultOpen: boolean,
  onChange: ((open: boolean) => void) | undefined,
): [boolean, (open: boolean) => void] => {
  const [internal, setInternal] = useState(defaultOpen);
  const open = controlled ?? internal;
  const set = useCallback(
    (next: boolean) => {
      if (controlled === undefined) setInternal(next);
      onChange?.(next);
    },
    [controlled, onChange],
  );
  return [open, set];
};

const isMobileAsideElement = (node: ReactNode): node is ReactElement<AppLayoutMobileAsideProps> => {
  if (node === null || typeof node !== 'object' || !('type' in node)) return false;
  const type = (node as ReactElement).type as unknown as { $$typeof?: symbol };
  return type !== undefined && type.$$typeof === MOBILE_ASIDE_TYPE;
};

/** 从 children 中分离出 MobileAside marker 的内容与其余主内容 */
const splitMobileAside = (
  children: ReactNode,
): { mobileAside: ReactNode; rest: ReactNode } => {
  let mobileAside: ReactNode = null;
  const rest: ReactNode[] = [];
  const walk = (nodes: ReactNode) => {
    if (Array.isArray(nodes)) {
      nodes.forEach(walk);
      return;
    }
    if (isMobileAsideElement(nodes)) {
      mobileAside = nodes.props.children;
      return;
    }
    rest.push(nodes);
  };
  walk(children);
  return { mobileAside, rest };
};

const AppLayoutRoot = forwardRef<HTMLDivElement, AppLayoutProps>(
  (
    {
      sidebar,
      navbar,
      aside,
      children,
      toolbar,
      footer,
      sidebarOpen,
      defaultSidebarOpen = true,
      onSidebarOpenChange,
      sidebarSide = 'left',
      sidebarVariant = 'sidebar',
      sidebarCollapsible = 'icon',
      asideOpen,
      defaultAsideOpen = true,
      onAsideOpenChange,
      asideMobile = 'hidden',
      navigate,
      reduceMotion = false,
      toggleShortcut = 'mod+b',
      asideToggleShortcut,
      sidebarResizable = false,
      sidebarDefaultSize = 18,
      sidebarMinSize = 12,
      sidebarMaxSize = 30,
      asideResizable = false,
      asideDefaultSize = 20,
      asideMinSize = 15,
      asideMaxSize = 40,
      resizableAutoSaveId,
      scrollMode = 'page',
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const [isSidebarOpen, setSidebarOpen] = useControllableOpen(
      sidebarOpen,
      defaultSidebarOpen,
      onSidebarOpenChange,
    );
    const [isAsideOpen, setAsideOpen] = useControllableOpen(
      asideOpen,
      defaultAsideOpen,
      onAsideOpenChange,
    );

    const toggleSidebar = useCallback(() => setSidebarOpen(!isSidebarOpen), [isSidebarOpen, setSidebarOpen]);
    const toggleAside = useCallback(() => setAsideOpen(!isAsideOpen), [isAsideOpen, setAsideOpen]);

    const hasSidebar = sidebar !== undefined && sidebar !== null;
    const hasAside = aside !== undefined && aside !== null;

    // icon-rail 不兼容自由缩放，回退到静态布局（原站约束）
    const resolvedSidebarResizable =
      hasSidebar && sidebarResizable && (sidebarCollapsible === 'offcanvas' || sidebarCollapsible === 'none');
    const resolvedAsideResizable = hasAside && asideResizable;
    const isResizable = resolvedSidebarResizable || resolvedAsideResizable;

    // 键盘快捷键：切换侧栏 / aside
    useEffect(() => {
      const handlers: Array<(event: KeyboardEvent) => void> = [];
      const handleKey = (event: KeyboardEvent) => {
        if (typeof toggleShortcut === 'string' && matchShortcut(toggleShortcut, event)) {
          event.preventDefault();
          toggleSidebar();
        }
        if (typeof asideToggleShortcut === 'string' && matchShortcut(asideToggleShortcut, event)) {
          event.preventDefault();
          toggleAside();
        }
      };
      if (
        typeof toggleShortcut === 'string' ||
        typeof asideToggleShortcut === 'string'
      ) {
        window.addEventListener('keydown', handleKey);
        handlers.push(handleKey);
      }
      return () => handlers.forEach((h) => window.removeEventListener('keydown', h));
    }, [toggleShortcut, asideToggleShortcut, toggleSidebar, toggleAside]);

    // 非受控时持久化 sidebar_state / aside_state cookie（原站行为）
    useEffect(() => {
      if (sidebarOpen !== undefined) return;
      document.cookie = `sidebar_state=${isSidebarOpen}; path=/; max-age=31536000`;
    }, [isSidebarOpen, sidebarOpen]);
    useEffect(() => {
      if (asideOpen !== undefined || !hasAside) return;
      document.cookie = `aside_state=${isAsideOpen}; path=/; max-age=31536000`;
    }, [isAsideOpen, asideOpen, hasAside]);

    const contextValue = useMemo<AppLayoutContextValue>(
      () => ({
        isSidebarOpen,
        setSidebarOpen,
        toggleSidebar,
        isAsideOpen,
        setAsideOpen,
        toggleAside,
        hasAside,
        scrollMode,
        navigate,
      }),
      [
        isSidebarOpen,
        setSidebarOpen,
        toggleSidebar,
        isAsideOpen,
        setAsideOpen,
        toggleAside,
        hasAside,
        scrollMode,
        navigate,
      ],
    );

    const { mobileAside, rest: mainChildren } = useMemo(
      () => splitMobileAside(children),
      [children],
    );

    const sidebarState = isSidebarOpen ? 'expanded' : 'collapsed';
    const expandedSidebarWidth =
      sidebarVariant === 'floating'
        ? 'calc(var(--sidebar-width) + var(--spacing) * 4)'
        : 'var(--sidebar-width)';
    const collapsedSidebarWidth =
      sidebarVariant === 'floating'
        ? 'calc(var(--sidebar-width-collapsed) + var(--spacing) * 4)'
        : 'var(--sidebar-width-collapsed)';

    // 折叠联动的 CSS 变量：侧栏区宽度随展开/折叠在展开宽与折叠宽之间切换
    const sidebarWidthVar =
      sidebarCollapsible === 'none'
        ? expandedSidebarWidth
        : sidebarCollapsible === 'offcanvas'
          ? isSidebarOpen
            ? expandedSidebarWidth
            : '0px'
          : isSidebarOpen
            ? expandedSidebarWidth
            : collapsedSidebarWidth;

    const rootStyle: CSSProperties = {
      display: 'flex',
      width: '100%',
      minHeight: '100svh',
      // 供主内容区/侧栏区联动的当前侧栏占位宽度
      ['--app-layout-sidebar-width' as string]: sidebarWidthVar,
      ...style,
    };

    const body = (
      <div className="app-layout__body" data-slot="app-layout-body">
        {navbar !== undefined && navbar !== null ? (
          <header className="app-layout__header" data-slot="app-layout-header">
            {navbar}
          </header>
        ) : null}
        {toolbar !== undefined && toolbar !== null ? (
          <div className="app-layout__toolbar" data-slot="app-layout-toolbar">
            {toolbar}
          </div>
        ) : null}
        <main
          className="app-layout__main"
          data-slot="app-layout-main"
          data-scroll-mode={scrollMode}
          aria-label={scrollMode === 'content' ? 'Scrollable main content' : undefined}
          tabIndex={scrollMode === 'content' ? 0 : undefined}
        >
          {mainChildren}
        </main>
        {footer !== undefined && footer !== null ? (
          <div className="app-layout__footer" data-slot="app-layout-footer">
            {footer}
          </div>
        ) : null}
      </div>
    );

    const asideRegion = hasAside ? (
      <aside
        className="app-layout__aside"
        data-slot="app-layout-aside"
        data-state={isAsideOpen ? 'open' : 'closed'}
      >
        <div>{aside}</div>
      </aside>
    ) : null;

    const sidebarRegion = hasSidebar ? (
      <div
        className="app-layout__sidebar"
        data-slot="app-layout-sidebar"
        data-state={sidebarState}
        data-side={sidebarSide}
        data-collapsible={sidebarCollapsible}
        data-variant={sidebarVariant}
      >
        <div className="app-layout__sidebar-inner" data-slot="app-layout-sidebar-inner">
          {sidebar}
        </div>
      </div>
    ) : null;

    const shouldRenderAsidePanel = hasAside && (!isResizable || isAsideOpen);
    const sidebarPanelSize = hasSidebar ? sidebarDefaultSize : 0;
    const asidePanelSize = shouldRenderAsidePanel ? asideDefaultSize : 0;
    const mainPanelDefaultSize = Math.max(1, 100 - sidebarPanelSize - asidePanelSize);

    // resizable 模式：走项目 Resizable 封装，保留 app-layout__resizable + *-panel 快照结构
    const inner = isResizable ? (
      <Resizable
        orientation="horizontal"
        autoSaveId={resizableAutoSaveId}
        className="app-layout__resizable"
        style={{ height: '100%', width: '100%', overflow: 'hidden', display: 'flex', flexFlow: 'row' }}
      >
        {hasSidebar ? (
          <Resizable.Panel
            id="app-layout-sidebar"
            data-testid="app-layout-sidebar"
            defaultSize={sidebarDefaultSize}
            minSize={resolvedSidebarResizable ? sidebarMinSize : undefined}
            maxSize={resolvedSidebarResizable ? sidebarMaxSize : undefined}
            disabled={!resolvedSidebarResizable}
            className="app-layout__sidebar-panel"
            data-state={sidebarState}
            data-side={sidebarSide}
            data-collapsible={sidebarCollapsible}
            data-variant={sidebarVariant}
          >
            {sidebar}
          </Resizable.Panel>
        ) : null}
        {hasSidebar && resolvedSidebarResizable ? <Resizable.Handle type="line" withIndicator /> : null}
        <Resizable.Panel
          id="app-layout-main"
          data-testid="app-layout-main"
          defaultSize={mainPanelDefaultSize}
          minSize={1}
          className="app-layout__main-panel"
        >
          {body}
        </Resizable.Panel>
        {shouldRenderAsidePanel && resolvedAsideResizable ? <Resizable.Handle type="line" withIndicator /> : null}
        {shouldRenderAsidePanel ? (
          <Resizable.Panel
            id="app-layout-aside"
            data-testid="app-layout-aside"
            defaultSize={asideDefaultSize}
            minSize={resolvedAsideResizable ? asideMinSize : undefined}
            maxSize={resolvedAsideResizable ? asideMaxSize : undefined}
            disabled={!resolvedAsideResizable}
            className="app-layout__aside-panel"
          >
            {aside}
          </Resizable.Panel>
        ) : null}
      </Resizable>
    ) : (
      <>
        {sidebarRegion}
        {body}
        {asideRegion}
      </>
    );

    const mobileSheetContent = mobileAside ?? aside;

    return (
      <AppLayoutContext.Provider value={contextValue}>
        <div
          ref={ref}
          data-app-layout=""
          data-scroll-mode={scrollMode}
          data-resizable={isResizable ? '' : undefined}
          data-sidebar-side={sidebarSide}
          data-sidebar-variant={sidebarVariant}
          data-sidebar-collapsible={sidebarCollapsible}
          data-sidebar-state={sidebarState}
          data-reduce-motion={reduceMotion ? '' : undefined}
          className={clsx('app-layout', className)}
          style={rootStyle}
          {...rest}
        >
          {inner}
          {asideMobile === 'sheet' && hasAside ? (
            <AppLayoutMobileAsideSheet>{mobileSheetContent}</AppLayoutMobileAsideSheet>
          ) : null}
        </div>
      </AppLayoutContext.Provider>
    );
  },
);
AppLayoutRoot.displayName = 'AppLayout';

/** 移动端 aside 以 sheet 呈现：受 aside 开合状态驱动（仅 ≤1024px 由 CSS 显示） */
const AppLayoutMobileAsideSheet = ({ children }: { children: ReactNode }): ReactElement | null => {
  const ctx = useContext(AppLayoutContext);
  if (ctx === null || !ctx.isAsideOpen) return null;
  return (
    <div className="app-layout__mobile-aside-sheet" data-slot="app-layout-mobile-aside-sheet">
      <div className="app-layout__mobile-aside-dialog" data-slot="app-layout-mobile-aside-dialog">
        <div className="app-layout__mobile-aside" data-slot="app-layout-mobile-aside">
          {children}
        </div>
      </div>
    </div>
  );
};
AppLayoutMobileAsideSheet.displayName = 'AppLayout.MobileAsideSheet';

const BarsIcon = (): ReactElement => (
  <svg
    fill="none"
    height="16"
    viewBox="0 0 16 16"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
    className="size-4"
  >
    <path
      clipRule="evenodd"
      d="M1.25 3.25A.75.75 0 0 1 2 2.5h12A.75.75 0 0 1 14 4H2a.75.75 0 0 1-.75-.75m0 4.75A.75.75 0 0 1 2 7.25h12a.75.75 0 0 1 0 1.5H2A.75.75 0 0 1 1.25 8M2 12a.75.75 0 0 0 0 1.5h12a.75.75 0 0 0 0-1.5z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

const LayoutSideContentRightIcon = (): ReactElement => (
  <svg
    fill="none"
    height="16"
    viewBox="0 0 16 16"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
    className="size-4"
  >
    <path
      clipRule="evenodd"
      d="M10 3.5H4A1.5 1.5 0 0 0 2.5 5v6A1.5 1.5 0 0 0 4 12.5h6zm1.5 0h.5A1.5 1.5 0 0 1 13.5 5v6a1.5 1.5 0 0 1-1.5 1.5h-.5zM15 5a3 3 0 0 0-3-3H4a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export type AppLayoutMenuToggleProps = Omit<
  ButtonProps,
  'className' | 'style' | 'children' | 'onPress' | 'isIconOnly' | 'variant' | 'size'
> & {
  children?: ReactNode;
  tooltip?: ReactNode;
  tooltipProps?: AppLayoutTooltipProps;
  className?: string;
  style?: CSSProperties;
};

/** 包裹按钮：tooltip 存在时套 OSS Tooltip（触发器直接渲染 OSS Button，不再额外包 button） */
const withTooltip = (
  trigger: ReactElement,
  tooltip: ReactNode,
  tooltipProps: AppLayoutTooltipProps | undefined,
  key: string,
): ReactElement => {
  if (tooltip === undefined || tooltip === null) return trigger;
  const { className: tipClassName, placement = 'bottom', ...tipRest } = tooltipProps ?? {};
  return (
    <Tooltip key={key} {...tipRest}>
      {trigger}
      <Tooltip.Content placement={placement} className={tipClassName}>
        {tooltip}
      </Tooltip.Content>
    </Tooltip>
  );
};

/** 移动端专用侧栏菜单开关（CSS 控制：≤768px 显示、桌面隐藏） */
const MenuToggle = forwardRef<HTMLButtonElement, AppLayoutMenuToggleProps>(
  ({ children, tooltip, tooltipProps, className, ...buttonRest }, ref) => {
    const ctx = useContext(AppLayoutContext);
    const id = useId();

    const handlePress = useCallback(() => {
      ctx?.setSidebarOpen(true);
    }, [ctx]);

    const button = (
      <Button
        ref={ref}
        data-slot="app-layout-menu-toggle"
        isIconOnly
        size="sm"
        variant="ghost"
        aria-label="Open navigation"
        onPress={handlePress}
        className={clsx('app-layout__menu-toggle', className)}
        {...buttonRest}
      >
        {children ?? <BarsIcon />}
      </Button>
    );

    return withTooltip(button, tooltip, tooltipProps, `menu-toggle-${id}`);
  },
);
MenuToggle.displayName = 'AppLayout.MenuToggle';

export type AppLayoutAsideTriggerProps = Omit<
  ButtonProps,
  'className' | 'style' | 'children' | 'onPress' | 'isIconOnly' | 'variant' | 'size'
> & {
  children?: ReactNode;
  closedTooltip?: ReactNode;
  openTooltip?: ReactNode;
  tooltipProps?: AppLayoutTooltipProps;
  className?: string;
  style?: CSSProperties;
};

/** 右侧 aside 开关：暴露 aria-expanded / data-state，≤1024px 由 CSS 隐藏 */
const AsideTrigger = forwardRef<HTMLButtonElement, AppLayoutAsideTriggerProps>(
  ({ children, closedTooltip, openTooltip, tooltipProps, className, ...buttonRest }, ref) => {
    const ctx = useContext(AppLayoutContext);
    const id = useId();
    const isOpen = ctx?.isAsideOpen ?? false;

    const handlePress = useCallback(() => {
      ctx?.toggleAside();
    }, [ctx]);

    const button = (
      <Button
        ref={ref}
        data-slot="app-layout-aside-trigger"
        data-state={isOpen ? 'open' : 'closed'}
        isIconOnly
        size="sm"
        variant="ghost"
        aria-label="Toggle aside panel"
        aria-expanded={isOpen}
        onPress={handlePress}
        className={clsx('app-layout__aside-trigger', className)}
        {...buttonRest}
      >
        {children ?? <LayoutSideContentRightIcon />}
      </Button>
    );

    const tooltip = isOpen ? openTooltip : closedTooltip;
    return withTooltip(button, tooltip, tooltipProps, `aside-trigger-${id}`);
  },
);
AsideTrigger.displayName = 'AppLayout.AsideTrigger';

const AppLayout = Object.assign(AppLayoutRoot, {
  MenuToggle,
  AsideTrigger,
  MobileAside,
});

export default AppLayout;
