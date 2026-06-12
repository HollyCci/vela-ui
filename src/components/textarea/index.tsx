import { forwardRef, type TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  variant?: 'default' | 'secondary';
  isFullWidth?: boolean;
  isInvalid?: boolean;
};

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ variant = 'default', isFullWidth = false, isInvalid = false, className, ...rest }, ref) => (
    <textarea
      ref={ref}
      className={clsx(
        'textarea',
        variant === 'secondary' && 'textarea--secondary',
        isFullWidth && 'textarea--full-width',
        className,
      )}
      data-invalid={isInvalid || undefined}
      aria-invalid={isInvalid || undefined}
      {...rest}
    />
  ),
);

Textarea.displayName = 'Textarea';

export default Textarea;
