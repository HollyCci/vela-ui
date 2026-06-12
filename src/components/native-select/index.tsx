import { forwardRef, type ReactNode, type SelectHTMLAttributes } from 'react';
import clsx from 'clsx';

export type NativeSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  variant?: 'default' | 'secondary';
  isFullWidth?: boolean;
  isInvalid?: boolean;
  label?: ReactNode;
  description?: ReactNode;
};

const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  (
    {
      variant = 'default',
      isFullWidth = false,
      isInvalid = false,
      label,
      description,
      className,
      children,
      ...rest
    },
    ref,
  ) => (
    <div
      className={clsx(
        'native-select',
        variant === 'secondary' && 'native-select--secondary',
        isFullWidth && 'native-select--full-width',
        className,
      )}
      data-invalid={isInvalid || undefined}
    >
      {label !== undefined && (
        <span className="label" data-slot="label">
          {label}
        </span>
      )}
      <span
        className={clsx(
          'native-select__trigger',
          isFullWidth && 'native-select__trigger--full-width',
        )}
      >
        <select
          ref={ref}
          className="native-select__select"
          aria-invalid={isInvalid || undefined}
          {...rest}
        >
          {children}
        </select>
        <span className="native-select__indicator" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </span>
      {description !== undefined && (
        <span className="description" data-slot="description">
          {description}
        </span>
      )}
    </div>
  ),
);

NativeSelect.displayName = 'NativeSelect';

export default NativeSelect;
