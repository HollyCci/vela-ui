'use client';

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  isValidElement,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  OverlayArrow,
  Popover,
  type OverlayArrowProps,
  type PopoverProps,
} from 'react-aria-components';
import clsx from 'clsx';

export type HoverCardProps = {
  /** 受控打开状态 */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** hover 后延迟打开毫秒数（原站默认 700） */
  openDelay?: number;
  /** 指针/焦点离开后延迟关闭毫秒数（原站默认 300） */
  closeDelay?: number;
  children?: ReactNode;
};

export type HoverCardTriggerProps = HTMLAttributes<HTMLSpanElement>;

export type HoverCardContentProps = Omit<
  PopoverProps,
  'isOpen' | 'triggerRef' | 'className' | 'style'
> & {
  className?: string;
  style?: CSSProperties;
};

export type HoverCardArrowProps = Omit<OverlayArrowProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

type FocusableElementProps = {
  contentEditable?: boolean | 'true' | 'false' | 'plaintext-only';
  disabled?: boolean;
  href?: string;
  tabIndex?: number;
};

type HoverCardContextValue = {
  isOpen: boolean;
  triggerRef: RefObject<HTMLSpanElement | null>;
  scheduleOpen: () => void;
  scheduleClose: () => void;
  cancelClose: () => void;
  openNow: () => void;
  closeNow: () => void;
};

const HoverCardContext = createContext<HoverCardContextValue | null>(null);

const useHoverCardContext = (part: string): HoverCardContextValue => {
  const ctx = useContext(HoverCardContext);
  if (ctx === null) throw new Error(`${part} 必须在 <HoverCard> 内使用`);
  return ctx;
};

const naturallyFocusableTags = new Set(['button', 'input', 'select', 'textarea', 'iframe']);

const hasFocusableChild = (children: ReactNode): boolean => {
  if (!isValidElement<FocusableElementProps>(children)) return false;
  const { contentEditable, disabled, href, tabIndex } = children.props;
  if (typeof tabIndex === 'number') return tabIndex >= 0;
  if (disabled) return false;
  if (contentEditable === true || contentEditable === 'true' || contentEditable === 'plaintext-only') {
    return true;
  }
  if (typeof children.type !== 'string') return false;
  if (children.type === 'a' || children.type === 'area') return typeof href === 'string';
  return naturallyFocusableTags.has(children.type);
};

const Trigger = forwardRef<HTMLSpanElement, HoverCardTriggerProps>(
  (
    {
      className,
      onPointerEnter,
      onPointerLeave,
      onFocus,
      onBlur,
      onKeyDown,
      tabIndex,
      children,
      ...rest
    },
    forwardedRef,
  ) => {
    const { triggerRef, scheduleOpen, scheduleClose, openNow, closeNow } =
      useHoverCardContext('HoverCard.Trigger');
    const resolvedTabIndex = tabIndex ?? (hasFocusableChild(children) ? undefined : 0);

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
      if (event.pointerType !== 'touch') scheduleOpen();
    };
    const handlePointerLeave = (event: ReactPointerEvent<HTMLSpanElement>) => {
      onPointerLeave?.(event);
      if (event.pointerType !== 'touch') scheduleClose();
    };
    // 仅键盘聚焦（focus-visible）立即打开；鼠标点击产生的 focus 不触发，避免绕过 openDelay
    const handleFocus = (event: ReactFocusEvent<HTMLSpanElement>) => {
      onFocus?.(event);
      if (event.target.matches(':focus-visible')) openNow();
    };
    const handleBlur = (event: ReactFocusEvent<HTMLSpanElement>) => {
      onBlur?.(event);
      scheduleClose();
    };
    const handleKeyDown = (event: ReactKeyboardEvent<HTMLSpanElement>) => {
      onKeyDown?.(event);
      if (event.key === 'Escape') closeNow();
      if (event.defaultPrevented) return;
      if (event.key === 'Enter' || event.key === ' ') {
        if (event.key === ' ' && event.target === event.currentTarget) event.preventDefault();
        openNow();
      }
    };

    return (
      <span
        ref={handleRef}
        data-slot="hover-card-trigger"
        className={clsx('hover-card__trigger', className)}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        tabIndex={resolvedTabIndex}
        {...rest}
      >
        {children}
      </span>
    );
  },
);
Trigger.displayName = 'HoverCard.Trigger';

/**
 * 包装 RAC Popover：data-entering/exiting/placement 由 RAC 自动输出（值为 "true"，
 * 与 hover-card.css 的 [data-entering=true] 等选择器匹配），进出场动画与卸载时机由 RAC 接管。
 */
const Content = forwardRef<HTMLElement, HoverCardContentProps>(
  (
    {
      placement = 'top',
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
    const { isOpen, triggerRef, scheduleClose, cancelClose, openNow, closeNow } =
      useHoverCardContext('HoverCard.Content');
    const popoverRef = useRef<HTMLElement | null>(null);

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

    // 指针移入浮层视为继续 hover，取消延迟关闭
    const handlePointerEnter = (event: ReactPointerEvent<HTMLDivElement>) => {
      onPointerEnter?.(event);
      if (event.pointerType !== 'touch') cancelClose();
    };
    const handlePointerLeave = (event: ReactPointerEvent<HTMLDivElement>) => {
      onPointerLeave?.(event);
      if (event.pointerType !== 'touch') scheduleClose();
    };

    // 焦点 Tab 进浮层（如卡片内链接）时同样阻止延迟关闭；focus 事件无法经 Popover props 透传，挂原生监听
    useEffect(() => {
      if (!isOpen) return undefined;
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
    }, [isOpen, cancelClose, scheduleClose]);

    return (
      <Popover
        ref={handleRef}
        data-slot="hover-card-content"
        triggerRef={triggerRef}
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
        isNonModal={isNonModal}
        placement={placement}
        offset={offset}
        className={clsx('hover-card__content', className)}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        {...rest}
      >
        {children}
      </Popover>
    );
  },
);
Content.displayName = 'HoverCard.Content';

/** RAC 文档约定的默认箭头形状；fill 由 .hover-card__arrow svg 规则提供 */
const DEFAULT_ARROW = (
  <svg width={12} height={12} viewBox="0 0 12 12" aria-hidden="true">
    <path d="M0 0 L6 6 L12 0" />
  </svg>
);

/** 包装 RAC OverlayArrow：data-placement 由 RAC 自动输出，CSS 据此旋转箭头 */
const Arrow = forwardRef<HTMLDivElement, HoverCardArrowProps>(
  ({ className, children, ...rest }, ref) => (
    <OverlayArrow
      ref={ref}
      data-slot="hover-card-arrow"
      className={clsx('hover-card__arrow', className)}
      {...rest}
    >
      {children ?? DEFAULT_ARROW}
    </OverlayArrow>
  ),
);
Arrow.displayName = 'HoverCard.Arrow';

/**
 * 根组件：不渲染 DOM，仅管理 hover 状态、打开/关闭延迟与 context。
 * 触发器与浮层间 8px 间隙的穿越依赖 closeDelay 兜底（移入浮层会取消关闭）。
 */
const HoverCardRoot = ({
  open,
  defaultOpen = false,
  onOpenChange,
  openDelay = 700,
  closeDelay = 300,
  children,
}: HoverCardProps) => {
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

  const contextValue = useMemo<HoverCardContextValue>(
    () => ({ isOpen, triggerRef, scheduleOpen, scheduleClose, cancelClose, openNow, closeNow }),
    [isOpen, scheduleOpen, scheduleClose, cancelClose, openNow, closeNow],
  );

  return <HoverCardContext.Provider value={contextValue}>{children}</HoverCardContext.Provider>;
};
HoverCardRoot.displayName = 'HoverCard';

const HoverCard = Object.assign(HoverCardRoot, { Trigger, Content, Arrow });

export default HoverCard;
