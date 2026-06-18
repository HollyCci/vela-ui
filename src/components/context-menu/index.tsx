'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  Menu as HeroMenu,
  MenuItem as HeroMenuItem,
  MenuSection as HeroMenuSection,
  type MenuRootProps as HeroMenuRootProps,
  type MenuItemRootProps as HeroMenuItemRootProps,
  type MenuSectionRootProps as HeroMenuSectionRootProps,
} from '@heroui/react';
import {
  Popover,
  Separator,
  SubmenuTrigger,
  type PopoverProps,
  type SeparatorProps,
  type Placement,
  type SubmenuTriggerProps,
} from 'react-aria-components';
import clsx from 'clsx';

export type ContextMenuProps = {
  /** 受控开合 */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** 外部受控打开时使用的视口坐标锚点 */
  anchorPoint?: Point;
  /** 禁用后右键不再打开菜单 */
  isDisabled?: boolean;
  children?: ReactNode;
};

export type ContextMenuTriggerProps = Omit<HTMLAttributes<HTMLDivElement>, 'className'> & {
  className?: string;
  /** 触摸/鼠标长按打开菜单的延迟；传 -1 可关闭长按 */
  longPressDelay?: number;
};

export type ContextMenuPopoverProps = Omit<
  PopoverProps,
  'isOpen' | 'triggerRef' | 'children' | 'className' | 'style'
> & {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

export type ContextMenuMenuProps<T extends object = object> = Omit<
  HeroMenuRootProps<T>,
  'className' | 'style'
> & {
  /** 自定义关闭处理，缺省为关闭上下文菜单 */
  onClose?: () => void;
  className?: string;
  style?: CSSProperties;
};

export type ContextMenuItemProps = HeroMenuItemRootProps;
export type ContextMenuItemIndicatorProps = Parameters<typeof HeroMenuItem.Indicator>[0];
export type ContextMenuSubmenuIndicatorProps = Parameters<typeof HeroMenuItem.SubmenuIndicator>[0];
export type ContextMenuSectionProps = HeroMenuSectionRootProps;
export type ContextMenuSubmenuTriggerProps = SubmenuTriggerProps;

export type ContextMenuSubmenuPopoverProps = Omit<
  PopoverProps,
  'children' | 'className' | 'style'
> & {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

export type ContextMenuSeparatorProps = Omit<SeparatorProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

type Point = { x: number; y: number };
type AnchorSource = 'event' | 'fallback' | 'prop';

type ContextMenuContextValue = {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  isDisabled: boolean;
  /** 跟随鼠标坐标的虚拟锚点 div（0 尺寸绝对定位），RAC Popover 据此 triggerRef 定位 */
  anchorRef: RefObject<HTMLDivElement | null>;
  /** 触发区域，用于无事件坐标时回退到中心点定位 */
  triggerRef: RefObject<HTMLDivElement | null>;
  /** 把锚点 div 移动到光标坐标处（相对 Trigger 容器） */
  positionAnchor: (point: Point, source?: AnchorSource) => void;
};

const ContextMenuContext = createContext<ContextMenuContextValue | null>(null);

const useContextMenuContext = (): ContextMenuContextValue => {
  const ctx = useContext(ContextMenuContext);
  if (ctx === null) {
    throw new Error('ContextMenu 子组件必须渲染在 <ContextMenu> 内');
  }
  return ctx;
};

/** 0 尺寸光标锚点（不可交互、不占位），供 RAC Popover 通过 triggerRef 定位在鼠标坐标处 */
const VIRTUAL_ANCHOR_STYLE: CSSProperties = {
  position: 'absolute',
  width: 0,
  height: 0,
  pointerEvents: 'none',
};

/**
 * 上下文菜单根（参考 API）：管理开合与光标坐标。受控（open/onOpenChange）与非受控（defaultOpen）都支持，
 * 真正的右键拦截/定位在 Trigger，浮层在 Popover。
 */
const ContextMenuRoot = ({
  open,
  defaultOpen = false,
  onOpenChange,
  anchorPoint,
  isDisabled = false,
  children,
}: ContextMenuProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : uncontrolledOpen;

  const anchorRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const hasPositionedAnchorRef = useRef(false);
  const anchorSourceRef = useRef<AnchorSource | null>(null);

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  /** 锚点 div 相对 Trigger 容器绝对定位，故用相对父容器的偏移坐标 */
  const positionAnchor = useCallback((point: Point, source: AnchorSource = 'event') => {
    const anchor = anchorRef.current;
    if (anchor === null) return;
    const parent = anchor.offsetParent as HTMLElement | null;
    const rect = parent?.getBoundingClientRect();
    anchor.style.left = `${point.x - (rect?.left ?? 0)}px`;
    anchor.style.top = `${point.y - (rect?.top ?? 0)}px`;
    hasPositionedAnchorRef.current = true;
    anchorSourceRef.current = source;
  }, []);

  const positionAnchorAtTriggerCenter = useCallback(() => {
    const trigger = triggerRef.current;
    if (trigger === null) return;
    const rect = trigger.getBoundingClientRect();
    positionAnchor(
      {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      },
      'fallback',
    );
  }, [positionAnchor]);

  const ensureOpenAnchor = useCallback(() => {
    if (anchorPoint !== undefined && anchorSourceRef.current !== 'event') {
      positionAnchor(anchorPoint, 'prop');
      return;
    }
    if (!hasPositionedAnchorRef.current) {
      positionAnchorAtTriggerCenter();
    }
  }, [anchorPoint, positionAnchor, positionAnchorAtTriggerCenter]);

  const setContextMenuOpen = useCallback(
    (next: boolean) => {
      if (next) ensureOpenAnchor();
      setOpen(next);
      if (!next) {
        hasPositionedAnchorRef.current = false;
        anchorSourceRef.current = null;
      }
    },
    [ensureOpenAnchor, setOpen],
  );

  useEffect(() => {
    if (isOpen) {
      ensureOpenAnchor();
      return;
    }
    hasPositionedAnchorRef.current = false;
    anchorSourceRef.current = null;
  }, [ensureOpenAnchor, isOpen]);

  const value = useMemo<ContextMenuContextValue>(
    () => ({
      isOpen,
      setOpen: setContextMenuOpen,
      isDisabled,
      anchorRef,
      triggerRef,
      positionAnchor,
    }),
    [isOpen, setContextMenuOpen, isDisabled, positionAnchor],
  );

  return <ContextMenuContext.Provider value={value}>{children}</ContextMenuContext.Provider>;
};
ContextMenuRoot.displayName = 'ContextMenu';

/**
 * 右键目标区域：onContextMenu 阻止系统菜单、记录光标坐标并打开浮层。
 * 锚点 div 渲染在区域内、定位为鼠标坐标处的零尺寸点（Popover 的 triggerRef）。
 */
const LONG_PRESS_MOVE_TOLERANCE = 10;

const Trigger = ({
  className,
  children,
  onContextMenu,
  onPointerCancel,
  onPointerDown,
  onPointerLeave,
  onPointerMove,
  onPointerUp,
  onKeyDown,
  role = 'button',
  tabIndex = 0,
  longPressDelay = 550,
  ...rest
}: ContextMenuTriggerProps) => {
  const { isDisabled, setOpen, anchorRef, triggerRef, positionAnchor } = useContextMenuContext();
  const longPressTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const longPressPointRef = useRef<Point | null>(null);

  const clearLongPress = useCallback(() => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressPointRef.current = null;
  }, []);

  const openAtPoint = useCallback(
    (point: Point) => {
      positionAnchor(point);
      setOpen(true);
    },
    [positionAnchor, setOpen],
  );

  useEffect(() => clearLongPress, [clearLongPress]);

  const handleContextMenu = (event: ReactMouseEvent<HTMLDivElement>) => {
    onContextMenu?.(event);
    if (isDisabled || event.defaultPrevented) return;
    event.preventDefault();
    openAtPoint({ x: event.clientX, y: event.clientY });
  };

  const handlePointerDown: NonNullable<ContextMenuTriggerProps['onPointerDown']> = (event) => {
    onPointerDown?.(event);
    if (
      isDisabled ||
      event.defaultPrevented ||
      longPressDelay === undefined ||
      longPressDelay < 0 ||
      !event.isPrimary ||
      event.button !== 0
    ) {
      return;
    }

    const point = { x: event.clientX, y: event.clientY };
    clearLongPress();
    longPressPointRef.current = point;
    longPressTimerRef.current = window.setTimeout(() => {
      openAtPoint(point);
      clearLongPress();
    }, longPressDelay);
  };

  const handlePointerMove: NonNullable<ContextMenuTriggerProps['onPointerMove']> = (event) => {
    onPointerMove?.(event);
    const point = longPressPointRef.current;
    if (point === null) return;

    if (
      Math.abs(event.clientX - point.x) > LONG_PRESS_MOVE_TOLERANCE ||
      Math.abs(event.clientY - point.y) > LONG_PRESS_MOVE_TOLERANCE
    ) {
      clearLongPress();
    }
  };

  const handlePointerUp: NonNullable<ContextMenuTriggerProps['onPointerUp']> = (event) => {
    onPointerUp?.(event);
    clearLongPress();
  };

  const handlePointerLeave: NonNullable<ContextMenuTriggerProps['onPointerLeave']> = (event) => {
    onPointerLeave?.(event);
    clearLongPress();
  };

  const handlePointerCancel: NonNullable<ContextMenuTriggerProps['onPointerCancel']> = (event) => {
    onPointerCancel?.(event);
    clearLongPress();
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (isDisabled || event.defaultPrevented) {
      return;
    }

    const isContextMenuKey = event.key === 'ContextMenu' || event.key === 'Menu';
    const isShiftF10 = event.shiftKey && event.key === 'F10';
    if (!isContextMenuKey && !isShiftF10) {
      return;
    }

    event.preventDefault();
    setOpen(true);
  };

  return (
    <div
      ref={triggerRef}
      data-slot="context-menu-trigger"
      className={clsx('context-menu__trigger', className)}
      role={role}
      tabIndex={isDisabled ? undefined : tabIndex}
      aria-haspopup="menu"
      aria-disabled={isDisabled || undefined}
      onContextMenu={handleContextMenu}
      onKeyDown={handleKeyDown}
      onPointerCancel={handlePointerCancel}
      onPointerDown={handlePointerDown}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      {...rest}
    >
      {children}
      <div ref={anchorRef} aria-hidden="true" style={VIRTUAL_ANCHOR_STYLE} />
    </div>
  );
};
Trigger.displayName = 'ContextMenu.Trigger';

/**
 * 浮层（受控 RAC Popover）：triggerRef 指向光标锚点 div，isOpen/onOpenChange 受控；
 * Esc 与点击外部关闭、data-entering/data-exiting/data-placement 由底座输出，对齐参考实现动画。
 */
const ContextMenuPopover = ({
  offset = 2,
  placement = 'bottom start',
  className,
  style,
  children,
  ...rest
}: ContextMenuPopoverProps) => {
  const { isOpen, setOpen, anchorRef } = useContextMenuContext();

  return (
    <Popover
      aria-label="Context menu"
      isOpen={isOpen}
      onOpenChange={setOpen}
      triggerRef={anchorRef}
      offset={offset}
      placement={placement as Placement}
      className={clsx('context-menu__popover', className)}
      style={style}
      {...rest}
    >
      {children}
    </Popover>
  );
};
ContextMenuPopover.displayName = 'ContextMenu.Popover';

/**
 * 菜单列表（OSS Menu / RAC Menu）：选中项后自动关闭上下文菜单（onClose 缺省关闭浮层）。
 * 键盘导航、分组、危险项等由 OSS Menu 子组件输出类名提供。
 */
const ContextMenuMenu = <T extends object = object>({
  onClose,
  className,
  style,
  ...rest
}: ContextMenuMenuProps<T>) => {
  const { setOpen } = useContextMenuContext();
  const handleClose = onClose ?? (() => setOpen(false));

  return (
    <HeroMenu<T>
      data-slot="context-menu-menu"
      className={clsx('context-menu__menu', className)}
      style={style}
      onClose={handleClose}
      {...rest}
    />
  );
};
ContextMenuMenu.displayName = 'ContextMenu.Menu';

/** 菜单项（OSS MenuItem）：variant="danger" 输出 menu-item--danger，危险项天然对齐参考实现 CSS */
const Item = (props: ContextMenuItemProps) => <HeroMenuItem {...props} />;
Item.displayName = 'ContextMenu.Item';

const ItemIndicator = (props: ContextMenuItemIndicatorProps) => (
  <HeroMenuItem.Indicator {...props} />
);
ItemIndicator.displayName = 'ContextMenu.ItemIndicator';

/** 子菜单箭头（OSS MenuItem.SubmenuIndicator），仅在 SubmenuTrigger 内渲染 */
const SubmenuIndicator = (props: ContextMenuSubmenuIndicatorProps) => (
  <HeroMenuItem.SubmenuIndicator {...props} />
);
SubmenuIndicator.displayName = 'ContextMenu.SubmenuIndicator';

const ContextMenuSubmenuTrigger = (props: ContextMenuSubmenuTriggerProps) => (
  <SubmenuTrigger {...props} />
);
ContextMenuSubmenuTrigger.displayName = 'ContextMenu.SubmenuTrigger';

const ContextMenuSubmenuPopover = ({
  offset = 6,
  placement = 'right top',
  className,
  style,
  children,
  ...rest
}: ContextMenuSubmenuPopoverProps) => (
  <Popover
    offset={offset}
    placement={placement as Placement}
    className={clsx('context-menu__popover', className)}
    style={style}
    {...rest}
  >
    {children}
  </Popover>
);
ContextMenuSubmenuPopover.displayName = 'ContextMenu.SubmenuPopover';

const Section = (props: ContextMenuSectionProps) => <HeroMenuSection {...props} />;
Section.displayName = 'ContextMenu.Section';

const ContextMenuSeparator = ({ className, ...rest }: ContextMenuSeparatorProps) => (
  <Separator className={clsx('context-menu__separator', className)} {...rest} />
);
ContextMenuSeparator.displayName = 'ContextMenu.Separator';

/**
 * 右键上下文菜单（参考 API）：在 Trigger 区域 onContextMenu 阻止默认、于鼠标坐标处打开受控 RAC Popover，
 * 浮层内为 OSS Menu（键盘导航/分组/分隔线/危险项 variant=danger），Esc 与点击外部关闭。
 * 子菜单经 ContextMenu.SubmenuTrigger + ContextMenu.SubmenuPopover 组合。
 */
const ContextMenu = Object.assign(ContextMenuRoot, {
  Trigger,
  Popover: ContextMenuPopover,
  Menu: ContextMenuMenu,
  Item,
  ItemIndicator,
  SubmenuIndicator,
  SubmenuTrigger: ContextMenuSubmenuTrigger,
  SubmenuPopover: ContextMenuSubmenuPopover,
  Section,
  Separator: ContextMenuSeparator,
});

export default ContextMenu;
