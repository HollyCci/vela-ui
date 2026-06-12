import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
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
};

/** 与原站 DOM 一致：始终带尺寸修饰符，并带 react-aria 的 data 标记 */
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
      ...rest
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        data-slot="button"
        data-rac=""
        data-react-aria-pressable="true"
        className={clsx(
          'button',
          isIconOnly && 'button--icon-only',
          `button--${size}`,
          `button--${variant}`,
          isFullWidth && 'button--full-width',
          className,
        )}
        {...rest}
      >
        {prefix}
        {children}
        {suffix}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
