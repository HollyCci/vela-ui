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
        className={clsx(
          'button',
          `button--${variant}`,
          size !== 'md' && `button--${size}`,
          isIconOnly && 'button--icon-only',
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
