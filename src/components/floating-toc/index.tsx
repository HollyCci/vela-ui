import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { Button, Popover, type ButtonProps, type PopoverProps } from 'react-aria-components';
import clsx from 'clsx';

export type FloatingTocPlacement = 'left' | 'right';
export type FloatingTocTriggerMode = 'hover' | 'press';

export type FloatingTocProps = {
  /** TOC 停靠在页面哪一侧（决定条形对齐与面板弹出方向），默认 right */
  placement?: FloatingTocPlacement;
  /** 触发方式：hover 悬停展开 / press 点击切换，默认 hover */
  triggerMode?: FloatingTocTriggerMode;
  /** 受控打开状态 */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** hover 后延迟打开毫秒数（原站默认 200） */
  openDelay?: number;
  /** 指针/焦点离开后延迟关闭毫秒数（原站默认 300） */
  closeDelay?: number;
  children?: ReactNode;
};

export type FloatingTocTriggerProps = HTMLAttributes<HTMLSpanElement>;

export type FloatingTocBarProps = HTMLAttributes<HTMLSpanElement> & {
  /** 高亮为当前激活章节 */
  active?: boolean;
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

export type FloatingTocItemProps = Omit<ButtonProps, 'className' | 'style'> & {
  /** 高亮为当前激活章节 */
  active?: boolean;
  /** 层级（1 为顶级，层级越深缩进越大） */
  level?: number;
  className?: string;
  style?: CSSProperties;
};

type FloatingTocContextValue = {
  isOpen: boolean;
  placement: FloatingTocPlacement;
  triggerMode: FloatingTocTriggerMode;
  triggerRef: RefObject<HTMLSpanElement | null>;
  scheduleOpen: () => void;
  scheduleClose: () => void;
  cancelClose: () => void;
  openNow: () => void;
  closeNow: () => void;
  toggle: () => void;
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

const Trigger = forwardRef<HTMLSpanElement, FloatingTocTriggerProps>(
  (
    {
      className,
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
      placement,
      triggerMode,
      triggerRef,
      scheduleOpen,
      scheduleClose,
      openNow,
      closeNow,
      toggle,
    } = useFloatingTocContext('FloatingToc.Trigger');
    // CSS 的 :focus-visible:not(:focus) 永不命中，焦点环依赖 data-focus-visible=true
    const [isFocusVisible, setIsFocusVisible] = useState(false);

    const handleRef = useCallback(
      (node: HTMLSpanElement | null) => {
        triggerRef.current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef !== null) forwardedRef.current = node;
      },
      [forwardedRef, triggerRef],
    );

    const handlePointerEnter = (event: ReactPointerEvent<HTMLSpanElement>) => {
      onPointerEnter?.(event);
      if (triggerMode === 'hover' && event.pointerType !== 'touch') scheduleOpen();
    };
    const handlePointerLeave = (event: ReactPointerEvent<HTMLSpanElement>) => {
      onPointerLeave?.(event);
      if (triggerMode === 'hover' && event.pointerType !== 'touch') scheduleClose();
    };
    const handleClick = (event: ReactMouseEvent<HTMLSpanElement>) => {
      onClick?.(event);
      if (triggerMode === 'press') toggle();
    };
    // 仅键盘聚焦立即打开（hover 模式）；鼠标点击产生的 focus 不触发
    const handleFocus = (event: ReactFocusEvent<HTMLSpanElement>) => {
      onFocus?.(event);
      const visible = event.target.matches(':focus-visible');
      setIsFocusVisible(visible);
      if (triggerMode === 'hover' && visible) openNow();
    };
    const handleBlur = (event: ReactFocusEvent<HTMLSpanElement>) => {
      onBlur?.(event);
      setIsFocusVisible(false);
      if (triggerMode === 'hover') scheduleClose();
    };
    const handleKeyDown = (event: ReactKeyboardEvent<HTMLSpanElement>) => {
      onKeyDown?.(event);
      if (event.key === 'Escape') {
        closeNow();
        return;
      }
      if (triggerMode === 'press' && (event.key === 'Enter' || event.key === ' ')) {
        // 阻止空格滚动页面
        event.preventDefault();
        toggle();
      }
    };

    return (
      <span
        ref={handleRef}
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        data-slot="floating-toc-trigger"
        data-placement={placement}
        data-focus-visible={isFocusVisible || undefined}
        className={clsx('floating-toc__trigger', className)}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {children}
      </span>
    );
  },
);
Trigger.displayName = 'FloatingToc.Trigger';

/** 条形指示线：视觉由 ::after 绘制，宽度随 level 递减 */
const Bar = forwardRef<HTMLSpanElement, FloatingTocBarProps>(
  ({ active, level, className, style, ...rest }, ref) => (
    <span
      ref={ref}
      data-slot="floating-toc-bar"
      data-active={active || undefined}
      className={clsx('floating-toc__bar', className)}
      style={withLevelVar(level, style)}
      {...rest}
    />
  ),
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
      scheduleClose,
      cancelClose,
      openNow,
      closeNow,
    } = useFloatingTocContext('FloatingToc.Content');
    const popoverRef = useRef<HTMLElement | null>(null);

    // 面板弹向 TOC 停靠侧的对侧（原站：placement 未指定时由根 placement 推导）
    const resolvedPlacement = placement ?? (rootPlacement === 'right' ? 'left' : 'right');

    const handleRef = useCallback(
      (node: HTMLElement | null) => {
        popoverRef.current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef !== null) forwardedRef.current = node;
      },
      [forwardedRef],
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
  ({ active, level, className, style, ...rest }, ref) => (
    <Button
      ref={ref}
      data-slot="floating-toc-item"
      data-active={active || undefined}
      className={clsx('floating-toc__item', className)}
      style={withLevelVar(level, style)}
      {...rest}
    />
  ),
);
Item.displayName = 'FloatingToc.Item';

/** 根组件：不渲染 DOM，仅管理 open 状态、延迟与 context（原站快照中触发器直接位于页面流内） */
const FloatingTocRoot = ({
  placement = 'right',
  triggerMode = 'hover',
  open,
  defaultOpen = false,
  onOpenChange,
  openDelay = 200,
  closeDelay = 300,
  children,
}: FloatingTocProps) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const contextValue = useMemo<FloatingTocContextValue>(
    () => ({
      isOpen,
      placement,
      triggerMode,
      triggerRef,
      scheduleOpen,
      scheduleClose,
      cancelClose,
      openNow,
      closeNow,
      toggle,
    }),
    [
      isOpen,
      placement,
      triggerMode,
      scheduleOpen,
      scheduleClose,
      cancelClose,
      openNow,
      closeNow,
      toggle,
    ],
  );

  return (
    <FloatingTocContext.Provider value={contextValue}>{children}</FloatingTocContext.Provider>
  );
};
FloatingTocRoot.displayName = 'FloatingToc';

const FloatingToc = Object.assign(FloatingTocRoot, { Trigger, Bar, Content, Item });

export default FloatingToc;
