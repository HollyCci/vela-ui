'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import {
  Button as ButtonPrimitive,
  composeRenderProps,
  type ButtonProps as AriaButtonProps,
} from 'react-aria-components';
import { buttonVariants } from '@heroui/styles';
import clsx from 'clsx';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'ghost'
  | 'outline'
  | 'danger'
  | 'danger-soft';

export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isIconOnly?: boolean;
  isFullWidth?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  /** react-aria 的按压事件；与 onClick 等价，二者可并存 */
  onPress?: () => void;
};

/**
 * 包裹 react-aria-components 的真实 Button（@heroui/styles 的 buttonVariants
 * 复用同一套 .button / .button--<variant> 类，匹配 CSS 分片）。
 * 真 a11y / 键盘 / 焦点 / 按压态来自 react-aria，不再手搓 data-rac 等假属性。
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isIconOnly = false,
      isFullWidth = false,
      prefix,
      suffix,
      className,
      children,
      type = 'button',
      // react-aria 用 isDisabled，桥接原生 disabled
      disabled,
      // react-aria 内部会 delete onClick，桥接为 onPress
      onClick,
      onPress,
      ...rest
    },
    ref,
  ) => {
    // react-aria 的 Button 会 delete onClick 并以 onPress 提供 PressEvent（无 stopPropagation/
    // preventDefault/currentTarget）。但旧契约里 ~70 处 onClick 依赖真实 MouseEvent（如 kanban 优先级
    // 按钮要 event.stopPropagation()）。故把消费者的 onClick 以原生 click 监听挂到真实 <button> 上，
    // 拿到真 MouseEvent；onPress 仍保留给按压语义。两者互不替代。
    const localRef = useRef<HTMLButtonElement | null>(null);
    const setRef = useCallback(
      (node: HTMLButtonElement | null) => {
        localRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );
    useEffect(() => {
      const node = localRef.current;
      if (!node || !onClick) return undefined;
      const handler = (event: MouseEvent) =>
        onClick(event as unknown as React.MouseEvent<HTMLButtonElement>);
      node.addEventListener('click', handler);
      return () => node.removeEventListener('click', handler);
    }, [onClick]);

    return (
      <ButtonPrimitive
        ref={setRef}
        type={type}
        data-slot="button"
        isDisabled={disabled}
        onPress={onPress ? () => onPress() : undefined}
        className={composeRenderProps(className, (resolved) =>
          clsx(
            buttonVariants({ variant, size, isIconOnly, fullWidth: isFullWidth }),
            resolved,
          ),
        )}
        // DOM 事件处理器在 react-aria 里以 Element 计型，运行时透传，这里收窄类型对齐
        {...(rest as Omit<AriaButtonProps, 'className' | 'children'>)}
      >
        {prefix}
        {children}
        {suffix}
      </ButtonPrimitive>
    );
  },
);

Button.displayName = 'Button';

export default Button;
