import { forwardRef, type InputHTMLAttributes } from 'react';
import clsx from 'clsx';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  variant?: 'default' | 'secondary';
  isFullWidth?: boolean;
  isInvalid?: boolean;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ variant = 'default', isFullWidth = false, isInvalid = false, className, ...rest }, ref) => (
    <input
      ref={ref}
      className={clsx(
        'input',
        variant === 'secondary' && 'input--secondary',
        isFullWidth && 'input--full-width',
        className,
      )}
      data-invalid={isInvalid || undefined}
      aria-invalid={isInvalid || undefined}
      {...rest}
    />
  ),
);

Input.displayName = 'Input';

export default Input;
