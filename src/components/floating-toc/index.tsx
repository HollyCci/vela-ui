'use client';

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  Button as RACButton,
  Popover,
  type ButtonProps as RACButtonProps,
  type PopoverProps,
} from 'react-aria-components';
import clsx from 'clsx';

export type FloatingTocPlacement = 'left' | 'right';
export type FloatingTocTriggerMode = 'hover' | 'press';

export type FloatingTocItemData = {
  key: string;
  label?: ReactNode;
  level?: number;
  /** 目标章节元素 id；未传时使用 key */
  targetId?: string;
};

export type FloatingTocProps = {
  /** TOC 停靠在页面哪一侧（决定条形对齐与面板弹出方向），默认 right */
  placement?: FloatingTocPlacement;
  /** 触发方式：hover 悬停展开 / press 点击切换，默认 hover */
  triggerMode?: FloatingTocTriggerMode;
  /** 受控打开状态 */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** hover 后延迟打开毫秒数（参考实现默认 200） */
  openDelay?: number;
  /** 指针/焦点离开后延迟关闭毫秒数（参考实现默认 300） */
  closeDelay?: number;
  /** 用于 active scroll tracking 与 itemKey 自动跳转的目录数据 */
  items?: FloatingTocItemData[];
  /** 受控当前章节 key */
  activeKey?: string;
  /** 默认当前章节 key */
  defaultActiveKey?: string;
  /** 当前章节变化回调（点击 item 或滚动命中） */
  onActiveChange?: (key: string, item?: FloatingTocItemData) => void;
  /** 滚动容器元素 id；不传则跟踪 window viewport */
  targetId?: string;
  children?: ReactNode;
};

export type FloatingTocTriggerProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'>;

export type FloatingTocBarProps = HTMLAttributes<HTMLSpanElement> & {
  /** 高亮为当前激活章节 */
  active?: boolean;
  /** 绑定 FloatingToc.items 的 key，未显式传 active 时可自动高亮 */
  itemKey?: string;
  /** 层级（1 为顶级，层级越深条越短） */
  level?: number;
};

export type FloatingTocContentProps = Omit<
  PopoverProps,
  'isOpen' | 'triggerRef' | 'className' | 'style'
> & {
  className?: string;
  style?: CSSProperties;
};

export type FloatingTocItemProps = Omit<RACButtonProps, 'className' | 'style'> & {
  /** 高亮为当前激活章节 */
  active?: boolean;
  /** 绑定 FloatingToc.items 的 key，未显式传 active/onPress 时可自动追踪与滚动 */
  itemKey?: string;
  /** 层级（1 为顶级，层级越深缩进越大） */
  level?: number;
  className?: string;
  style?: CSSProperties;
};

type FloatingTocContextValue = {
  isOpen: boolean;
  placement: FloatingTocPlacement;
  triggerMode: FloatingTocTriggerMode;
  triggerRef: RefObject<HTMLButtonElement | null>;
  contentRef: RefObject<HTMLElement | null>;
  activeKey: string | undefined;
  itemsByKey: Map<string, FloatingTocItemData>;
  scheduleOpen: () => void;
  scheduleClose: () => void;
  cancelClose: () => void;
  openNow: () => void;
  closeNow: () => void;
  toggle: () => void;
  setActiveKey: (key: string) => void;
  scrollToItem: (key: string) => void;
};

const FloatingTocContext = createContext<FloatingTocContextValue | null>(null);

const useFloatingTocContext = (part: string): FloatingTocContextValue => {
  const ctx = useContext(FloatingTocContext);
  if (ctx === null) throw new Error(`${part} 必须在 <FloatingToc> 内使用`);
  return ctx;
};

/** 层级 > 1 时输出 --floating-toc-level 内联变量（快照中一级项不带该变量，CSS 默认值为 1） */
const withLevelVar = (
  level: number | undefined,
  style: CSSProperties | undefined,
): CSSProperties | undefined => {
  if (level === undefined || level <= 1) return style;
  return { ...style, ['--floating-toc-level' as string]: level };
};

const Trigger = forwardRef<HTMLButtonElement, FloatingTocTriggerProps>(
  (
    {
      className,
      onPointerDown,
      onPointerEnter,
      onPointerLeave,
      onClick,
      onFocus,
      onBlur,
      onKeyDown,
      'aria-label': ariaLabel = 'Table of contents',
      children,
      ...rest
    },
    forwardedRef,
  ) => {
    const {
      isOpen,
      placement,
      triggerMode,
      triggerRef,
      scheduleOpen,
      scheduleClose,
      openNow,
      closeNow,
    } = useFloatingTocContext('FloatingToc.Trigger');
    // CSS 的 :focus-visible:not(:focus) 永不命中，焦点环依赖 data-focus-visible=true
    const [isFocusVisible, setIsFocusVisible] = useState(false);

    const handleRef = useCallback(
      (node: HTMLButtonElement | null) => {
        triggerRef.current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef !== null) forwardedRef.current = node;
      },
      [forwardedRef, triggerRef],
    );

    const handlePointerEnter = (event: ReactPointerEvent<HTMLButtonElement>) => {
      onPointerEnter?.(event);
      if (triggerMode === 'hover' && event.pointerType !== 'touch') scheduleOpen();
    };
    const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
      onPointerDown?.(event);
      if (triggerMode !== 'press') return;
      event.preventDefault();
      event.stopPropagation();
      if (isOpen) {
        closeNow();
        window.setTimeout(closeNow, 0);
      } else {
        openNow();
      }
    };
    const handlePointerLeave = (event: ReactPointerEvent<HTMLButtonElement>) => {
      onPointerLeave?.(event);
      if (triggerMode === 'hover' && event.pointerType !== 'touch') scheduleClose();
    };
    const handleClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (triggerMode === 'press' && event.detail === 0) {
        if (isOpen) {
          closeNow();
          window.setTimeout(closeNow, 0);
        } else {
          openNow();
        }
      }
    };
    // 仅键盘聚焦立即打开（hover 模式）；鼠标点击产生的 focus 不触发
    const handleFocus = (event: ReactFocusEvent<HTMLButtonElement>) => {
      onFocus?.(event);
      const visible = event.target.matches(':focus-visible');
      setIsFocusVisible(visible);
      if (triggerMode === 'hover' && visible) openNow();
    };
    const handleBlur = (event: ReactFocusEvent<HTMLButtonElement>) => {
      onBlur?.(event);
      setIsFocusVisible(false);
      if (triggerMode === 'hover') scheduleClose();
    };
    const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event);
      if (event.key === 'Escape') {
        closeNow();
      }
    };

    return (
      <button
        ref={handleRef}
        type="button"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        data-slot="floating-toc-trigger"
        data-placement={placement}
        data-open={isOpen || undefined}
        data-focus-visible={isFocusVisible || undefined}
        className={clsx('floating-toc__trigger', className)}
        onPointerDown={handlePointerDown}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
Trigger.displayName = 'FloatingToc.Trigger';

/** 条形指示线：视觉由 ::after 绘制，宽度随 level 递减 */
const Bar = forwardRef<HTMLSpanElement, FloatingTocBarProps>(
  ({ active, itemKey, level, className, style, ...rest }, ref) => {
    const { activeKey, itemsByKey } = useFloatingTocContext('FloatingToc.Bar');
    const item = itemKey === undefined ? undefined : itemsByKey.get(itemKey);
    const resolvedLevel = level ?? item?.level;
    const resolvedActive = active ?? (itemKey !== undefined && itemKey === activeKey);

    return (
      <span
        ref={ref}
        data-slot="floating-toc-bar"
        data-active={resolvedActive || undefined}
        className={clsx('floating-toc__bar', className)}
        style={withLevelVar(resolvedLevel, style)}
        {...rest}
      />
    );
  },
);
Bar.displayName = 'FloatingToc.Bar';

/**
 * 包装 RAC Popover：data-entering/exiting/placement 由 RAC 自动输出（值为 "true"，
 * 与 floating-toc.css 的 [data-entering=true] 等选择器匹配）。
 */
const Content = forwardRef<HTMLElement, FloatingTocContentProps>(
  (
    {
      placement,
      offset = 8,
      isNonModal = true,
      onOpenChange,
      onPointerEnter,
      onPointerLeave,
      className,
      children,
      ...rest
    },
    forwardedRef,
  ) => {
    const {
      isOpen,
      placement: rootPlacement,
      triggerMode,
      triggerRef,
      contentRef,
      scheduleClose,
      cancelClose,
      openNow,
      closeNow,
    } = useFloatingTocContext('FloatingToc.Content');
    const popoverRef = useRef<HTMLElement | null>(null);

    // 面板弹向 TOC 停靠侧的对侧（参考实现：placement 未指定时由根 placement 推导）
    const resolvedPlacement = placement ?? (rootPlacement === 'right' ? 'left' : 'right');

    const handleRef = useCallback(
      (node: HTMLElement | null) => {
        popoverRef.current = node;
        contentRef.current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef !== null) forwardedRef.current = node;
      },
      [contentRef, forwardedRef],
    );

    // RAC 内部关闭请求（Escape / 点击外部）同步回根状态
    const handleOpenChange = (next: boolean) => {
      onOpenChange?.(next);
      if (next) openNow();
      else closeNow();
    };

    // hover 模式下指针移入面板视为继续 hover，取消延迟关闭
    const handlePointerEnter = (event: ReactPointerEvent<HTMLDivElement>) => {
      onPointerEnter?.(event);
      if (triggerMode === 'hover' && event.pointerType !== 'touch') cancelClose();
    };
    const handlePointerLeave = (event: ReactPointerEvent<HTMLDivElement>) => {
      onPointerLeave?.(event);
      if (triggerMode === 'hover' && event.pointerType !== 'touch') scheduleClose();
    };

    // 焦点 Tab 进面板（Item 按钮）时阻止延迟关闭；focus 事件无法经 Popover props 透传，挂原生监听
    useEffect(() => {
      if (!isOpen || triggerMode !== 'hover') return undefined;
      const el = popoverRef.current;
      if (el === null) return undefined;
      const handleFocusIn = () => cancelClose();
      const handleFocusOut = (event: FocusEvent) => {
        if (event.relatedTarget instanceof Node && el.contains(event.relatedTarget)) return;
        scheduleClose();
      };
      el.addEventListener('focusin', handleFocusIn);
      el.addEventListener('focusout', handleFocusOut);
      return () => {
        el.removeEventListener('focusin', handleFocusIn);
        el.removeEventListener('focusout', handleFocusOut);
      };
    }, [isOpen, triggerMode, cancelClose, scheduleClose]);

    return (
      <Popover
        ref={handleRef}
        data-slot="floating-toc-content"
        data-floating-toc-trigger-mode={triggerMode}
        data-floating-toc-root-placement={rootPlacement}
        triggerRef={triggerRef}
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
        isNonModal={isNonModal}
        placement={resolvedPlacement}
        offset={offset}
        className={clsx('floating-toc__content', className)}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        {...rest}
      >
        {children}
      </Popover>
    );
  },
);
Content.displayName = 'FloatingToc.Content';

/** 包装 RAC Button：data-hovered/pressed/focus-visible 由 RAC 自动输出，与 CSS 状态选择器匹配 */
const Item = forwardRef<HTMLButtonElement, FloatingTocItemProps>(
  ({ active, itemKey, level, className, style, onPress, children, ...rest }, ref) => {
    const { activeKey, itemsByKey, scrollToItem } = useFloatingTocContext('FloatingToc.Item');
    const item = itemKey === undefined ? undefined : itemsByKey.get(itemKey);
    const resolvedLevel = level ?? item?.level;
    const resolvedActive = active ?? (itemKey !== undefined && itemKey === activeKey);

    return (
      <RACButton
        ref={ref}
        data-slot="floating-toc-item"
        data-active={resolvedActive || undefined}
        className={clsx('floating-toc__item', className)}
        style={withLevelVar(resolvedLevel, style)}
        onPress={(event) => {
          onPress?.(event);
          if (itemKey !== undefined) scrollToItem(itemKey);
        }}
        {...rest}
      >
        {children ?? item?.label}
      </RACButton>
    );
  },
);
Item.displayName = 'FloatingToc.Item';

/** 根组件：不渲染 DOM，仅管理 open 状态、延迟与 context（参考实现快照中触发器直接位于页面流内） */
const FloatingTocRoot = ({
  placement = 'right',
  triggerMode = 'hover',
  open,
  defaultOpen = false,
  onOpenChange,
  openDelay = 200,
  closeDelay = 300,
  items = [],
  activeKey,
  defaultActiveKey,
  onActiveChange,
  targetId,
  children,
}: FloatingTocProps) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [internalActiveKey, setInternalActiveKey] = useState<string | undefined>(
    defaultActiveKey ?? items[0]?.key,
  );
  const isControlled = open !== undefined;
  const isControlledActive = activeKey !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const resolvedActiveKey = activeKey ?? internalActiveKey;
  const isOpenRef = useRef(isOpen);
  const activeKeyRef = useRef(resolvedActiveKey);
  isOpenRef.current = isOpen;
  activeKeyRef.current = resolvedActiveKey;
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const contentRef = useRef<HTMLElement | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemsByKey = useMemo(() => new Map(items.map((item) => [item.key, item])), [items]);

  const cancelOpen = useCallback(() => {
    if (openTimer.current !== null) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current !== null) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const setOpen = useCallback(
    (next: boolean) => {
      cancelOpen();
      cancelClose();
      if (isOpenRef.current === next) return;
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [cancelClose, cancelOpen, isControlled, onOpenChange],
  );

  const openNow = useCallback(() => setOpen(true), [setOpen]);
  const closeNow = useCallback(() => setOpen(false), [setOpen]);
  const toggle = useCallback(() => setOpen(!isOpenRef.current), [setOpen]);

  const setActive = useCallback(
    (next: string) => {
      if (activeKeyRef.current === next) return;
      const item = itemsByKey.get(next);
      activeKeyRef.current = next;
      if (!isControlledActive) setInternalActiveKey(next);
      onActiveChange?.(next, item);
    },
    [isControlledActive, itemsByKey, onActiveChange],
  );

  const scrollToItem = useCallback(
    (key: string) => {
      const item = itemsByKey.get(key);
      const target = document.getElementById(item?.targetId ?? key);
      const root = targetId === undefined ? null : document.getElementById(targetId);
      setActive(key);

      if (target === null) return;

      if (root !== null) {
        const rootRect = root.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        root.scrollTo({
          top: root.scrollTop + targetRect.top - rootRect.top,
          behavior: 'smooth',
        });
        return;
      }

      target.scrollIntoView({ block: 'start', behavior: 'smooth' });
    },
    [itemsByKey, setActive, targetId],
  );

  const scheduleOpen = useCallback(() => {
    cancelClose();
    if (isOpenRef.current || openTimer.current !== null) return;
    openTimer.current = setTimeout(() => {
      openTimer.current = null;
      setOpen(true);
    }, openDelay);
  }, [cancelClose, openDelay, setOpen]);

  const scheduleClose = useCallback(() => {
    cancelOpen();
    if (!isOpenRef.current || closeTimer.current !== null) return;
    closeTimer.current = setTimeout(() => {
      closeTimer.current = null;
      setOpen(false);
    }, closeDelay);
  }, [cancelOpen, closeDelay, setOpen]);

  // 卸载时清理未触发的延迟定时器
  useEffect(
    () => () => {
      cancelOpen();
      cancelClose();
    },
    [cancelClose, cancelOpen],
  );

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (triggerRef.current?.contains(target) || contentRef.current?.contains(target)) return;
      setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen, setOpen]);

  useEffect(() => {
    if (items.length === 0 || typeof document === 'undefined') return undefined;

    let frame = 0;
    let pollFrame = 0;
    let scrollTarget: HTMLElement | Window | null = null;

    const updateActiveFromScroll = () => {
      if (frame !== 0) return;
      const root = targetId === undefined ? null : document.getElementById(targetId);
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const rootRect = root?.getBoundingClientRect();
        const threshold = (rootRect?.top ?? 0) + 8;
        let activeItem: FloatingTocItemData | undefined;
        let nextItem: FloatingTocItemData | undefined;

        for (const item of items) {
          const target = document.getElementById(item.targetId ?? item.key);
          if (target === null) continue;
          const rect = target.getBoundingClientRect();
          if (rect.top <= threshold) {
            activeItem = item;
          } else if (nextItem === undefined) {
            nextItem = item;
          }
        }

        const next = activeItem ?? nextItem;
        if (next !== undefined) setActive(next.key);
      });
    };

    // 容器未挂载时不永久放弃:用 rAF 短轮询等待容器出现后再订阅
    const subscribe = () => {
      const root = targetId === undefined ? null : document.getElementById(targetId);
      if (targetId !== undefined && root === null) {
        pollFrame = window.requestAnimationFrame(subscribe);
        return;
      }
      pollFrame = 0;
      updateActiveFromScroll();
      scrollTarget = root ?? window;
      scrollTarget.addEventListener('scroll', updateActiveFromScroll, { passive: true });
      window.addEventListener('resize', updateActiveFromScroll);
    };

    subscribe();

    return () => {
      if (frame !== 0) window.cancelAnimationFrame(frame);
      if (pollFrame !== 0) window.cancelAnimationFrame(pollFrame);
      scrollTarget?.removeEventListener('scroll', updateActiveFromScroll);
      window.removeEventListener('resize', updateActiveFromScroll);
    };
  }, [items, setActive, targetId]);

  const contextValue = useMemo<FloatingTocContextValue>(
    () => ({
      isOpen,
      placement,
      triggerMode,
      triggerRef,
      contentRef,
      activeKey: resolvedActiveKey,
      itemsByKey,
      scheduleOpen,
      scheduleClose,
      cancelClose,
      openNow,
      closeNow,
      toggle,
      setActiveKey: setActive,
      scrollToItem,
    }),
    [
      isOpen,
      placement,
      triggerMode,
      contentRef,
      resolvedActiveKey,
      itemsByKey,
      scheduleOpen,
      scheduleClose,
      cancelClose,
      openNow,
      closeNow,
      toggle,
      setActive,
      scrollToItem,
    ],
  );

  return (
    <FloatingTocContext.Provider value={contextValue}>{children}</FloatingTocContext.Provider>
  );
};
FloatingTocRoot.displayName = 'FloatingToc';

const FloatingToc = Object.assign(FloatingTocRoot, { Trigger, Bar, Content, Item });

export default FloatingToc;
