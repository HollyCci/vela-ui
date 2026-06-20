'use client';

import {
  forwardRef,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
} from 'react';
import clsx from 'clsx';

export type ItemCardVariant = 'default' | 'secondary' | 'tertiary' | 'outline' | 'transparent';

export type ItemCardPressEvent =
  | ReactMouseEvent<HTMLDivElement>
  | ReactKeyboardEvent<HTMLDivElement>;

/**
 * 自定义渲染函数，替换默认的 div 根元素（参考 API：DOMRenderFunction）。
 * 接收已解析好的全部 DOM props（含类名、data 属性、交互事件处理器），
 * 调用方需把它们透传到自定义根元素，方可保留按下/选中/键盘交互与样式。
 */
export type ItemCardRenderFunction = (props: HTMLAttributes<HTMLDivElement>) => ReactElement;

export type ItemCardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: ItemCardVariant;
  /** 自定义渲染函数，替换默认的 div 根元素（参考 API：DOMRenderFunction）。 */
  render?: ItemCardRenderFunction;
  isPressable?: boolean;
  onPress?: (event: ItemCardPressEvent) => void;
  isSelected?: boolean;
  defaultSelected?: boolean;
  onSelectedChange?: (isSelected: boolean) => void;
};

type SectionProps = HTMLAttributes<HTMLDivElement>;
// 参考版 Title / Description 渲染为 <span>（而非 div）。span 无 a11y 冲突，故照参考对齐。
type SpanSectionProps = HTMLAttributes<HTMLSpanElement>;

const INTERACTIVE_SELECTOR = [
  'a[href]',
  'button',
  'input',
  'label',
  'select',
  'textarea',
  'summary',
  '[role="button"]',
  '[role="link"]',
  '[role="checkbox"]',
  '[role="switch"]',
  '[role="radio"]',
  '[role="menuitem"]',
  '[role="tab"]',
  '[tabindex]:not([tabindex="-1"])',
  '[data-item-card-ignore-press]',
].join(',');

const isInteractiveChildEvent = (
  event: Pick<ItemCardPressEvent | ReactPointerEvent<HTMLDivElement>, 'currentTarget' | 'target'>,
) => {
  if (!(event.target instanceof Element)) return false;

  const interactive = event.target.closest(INTERACTIVE_SELECTOR);
  return (
    interactive !== null &&
    interactive !== event.currentTarget &&
    event.currentTarget.contains(interactive)
  );
};

const ItemCardRoot = forwardRef<HTMLDivElement, ItemCardProps>(
  (
    {
      variant = 'default',
      className,
      render,
      isPressable,
      onPress,
      isSelected,
      defaultSelected,
      onSelectedChange,
      role,
      tabIndex,
      onClick,
      onFocus,
      onBlur,
      onKeyDown,
      onKeyUp,
      onPointerDown,
      onPointerUp,
      onPointerLeave,
      onPointerCancel,
      'aria-pressed': ariaPressed,
      ...rest
    },
    ref,
  ) => {
    const [innerSelected, setInnerSelected] = useState(defaultSelected ?? false);
    const [isPressed, setPressed] = useState(false);
    const [isFocusVisible, setFocusVisible] = useState(false);
    const pressedKeyRef = useRef<string | null>(null);
    const isSelectable =
      isSelected !== undefined || onSelectedChange !== undefined || defaultSelected !== undefined;
    const selected = isSelected ?? innerSelected;
    const isInteractionEnabled =
      isPressable === true ||
      (isPressable !== false && (onPress !== undefined || isSelectable));

    const updateSelected = (nextSelected: boolean) => {
      if (isSelected === undefined) setInnerSelected(nextSelected);
      onSelectedChange?.(nextSelected);
    };

    const triggerPress = (event: ItemCardPressEvent) => {
      onPress?.(event);
      if (event.defaultPrevented || !isSelectable) return;
      updateSelected(!selected);
    };

    const handleClick = (event: ReactMouseEvent<HTMLDivElement>) => {
      onClick?.(event);
      if (
        event.defaultPrevented ||
        !isInteractionEnabled ||
        isInteractiveChildEvent(event)
      ) {
        return;
      }

      triggerPress(event);
    };

    const handleFocus = (event: ReactFocusEvent<HTMLDivElement>) => {
      onFocus?.(event);
      if (isInteractionEnabled) setFocusVisible(event.target.matches(':focus-visible'));
    };

    const handleBlur = (event: ReactFocusEvent<HTMLDivElement>) => {
      onBlur?.(event);
      pressedKeyRef.current = null;
      setPressed(false);
      setFocusVisible(false);
    };

    const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (
        event.defaultPrevented ||
        event.repeat ||
        !isInteractionEnabled ||
        isInteractiveChildEvent(event) ||
        (event.key !== 'Enter' && event.key !== ' ')
      ) {
        return;
      }

      event.preventDefault();
      pressedKeyRef.current = event.key;
      setPressed(true);
    };

    const handleKeyUp = (event: ReactKeyboardEvent<HTMLDivElement>) => {
      onKeyUp?.(event);
      const isActiveKey = pressedKeyRef.current === event.key;
      if (isActiveKey) {
        pressedKeyRef.current = null;
        setPressed(false);
      }

      if (
        event.defaultPrevented ||
        !isInteractionEnabled ||
        isInteractiveChildEvent(event) ||
        !isActiveKey
      ) {
        return;
      }

      event.preventDefault();
      triggerPress(event);
    };

    const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
      onPointerDown?.(event);
      if (
        event.defaultPrevented ||
        !isInteractionEnabled ||
        isInteractiveChildEvent(event) ||
        (event.pointerType === 'mouse' && event.button !== 0)
      ) {
        return;
      }

      setPressed(true);
    };

    const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
      onPointerUp?.(event);
      setPressed(false);
    };

    const handlePointerLeave = (event: ReactPointerEvent<HTMLDivElement>) => {
      onPointerLeave?.(event);
      setPressed(false);
    };

    const handlePointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
      onPointerCancel?.(event);
      setPressed(false);
    };

    const resolvedRole = role ?? (isInteractionEnabled ? 'button' : undefined);

    const domProps: HTMLAttributes<HTMLDivElement> = {
      ...rest,
      role: resolvedRole,
      tabIndex: tabIndex ?? (isInteractionEnabled ? 0 : undefined),
      'aria-pressed':
        resolvedRole !== undefined
          ? (ariaPressed ?? (isSelectable ? selected : undefined))
          : undefined,
      'data-slot': 'item-card',
      'data-react-aria-pressable': isInteractionEnabled ? 'true' : undefined,
      'data-pressable': isInteractionEnabled || undefined,
      'data-pressed': isPressed || undefined,
      'data-selected': selected || undefined,
      'data-focus-visible': isFocusVisible || undefined,
      className: clsx('item-card', `item-card--${variant}`, className),
      onClick: handleClick,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      onKeyUp: handleKeyUp,
      onPointerDown: handlePointerDown,
      onPointerUp: handlePointerUp,
      onPointerLeave: handlePointerLeave,
      onPointerCancel: handlePointerCancel,
    } as HTMLAttributes<HTMLDivElement>;

    // 参考 API：render(DOMRenderFunction) 替换默认 div 根元素，并接收全部解析后的 DOM props。
    // ref 仅透传给默认 div（与 drop-zone 的 render 约定一致）。
    if (render !== undefined) {
      return render(domProps);
    }

    return <div ref={ref} {...domProps} />;
  },
);
ItemCardRoot.displayName = 'ItemCard';

const Icon = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    data-slot="item-card-icon"
    aria-hidden="true"
    className={clsx('item-card__icon', className)}
    {...rest}
  />
));
Icon.displayName = 'ItemCard.Icon';

const Content = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('item-card__content', className)} {...rest} />
));
Content.displayName = 'ItemCard.Content';

// 参考版 Title 渲染为 <span>。
const Title = forwardRef<HTMLSpanElement, SpanSectionProps>(({ className, ...rest }, ref) => (
  <span ref={ref} className={clsx('item-card__title', className)} {...rest} />
));
Title.displayName = 'ItemCard.Title';

// 参考版 Description 渲染为 <span>。
const Description = forwardRef<HTMLSpanElement, SpanSectionProps>(({ className, ...rest }, ref) => (
  <span ref={ref} className={clsx('item-card__description', className)} {...rest} />
));
Description.displayName = 'ItemCard.Description';

const Action = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('item-card__action', className)} {...rest} />
));
Action.displayName = 'ItemCard.Action';

const ItemCard = Object.assign(ItemCardRoot, { Icon, Content, Title, Description, Action });

export default ItemCard;
