import {
  forwardRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import clsx from 'clsx';

export type SearchFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'defaultValue' | 'onChange'
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: 'default' | 'secondary';
  isFullWidth?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  label?: ReactNode;
  description?: ReactNode;
};

const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  (
    {
      value,
      defaultValue = '',
      onValueChange,
      variant = 'default',
      isFullWidth = false,
      isInvalid = false,
      isDisabled = false,
      label,
      description,
      className,
      ...rest
    },
    ref,
  ) => {
    const [innerValue, setInnerValue] = useState(defaultValue);
    const currentValue = value ?? innerValue;
    const isEmpty = currentValue.length === 0;

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (value === undefined) setInnerValue(event.target.value);
      onValueChange?.(event.target.value);
    };

    const handleClear = () => {
      if (value === undefined) setInnerValue('');
      onValueChange?.('');
    };

    return (
      <div
        className={clsx(
          'search-field',
          variant === 'secondary' && 'search-field--secondary',
          isFullWidth && 'search-field--full-width',
          className,
        )}
        data-empty={isEmpty || undefined}
        data-invalid={isInvalid || undefined}
      >
        {label !== undefined && (
          <span className="label" data-slot="label">
            {label}
          </span>
        )}
        <div
          className={clsx(
            'search-field__group',
            isFullWidth && 'search-field__group--full-width',
          )}
          data-invalid={isInvalid || undefined}
          data-disabled={isDisabled || undefined}
        >
          <svg
            className="search-field__search-icon"
            data-slot="search-field-search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            ref={ref}
            type="search"
            className="search-field__input"
            data-slot="search-field-input"
            value={currentValue}
            onChange={handleChange}
            disabled={isDisabled}
            aria-invalid={isInvalid || undefined}
            {...rest}
          />
          <button
            type="button"
            className="search-field__clear-button"
            data-slot="search-field-clear-button"
            aria-label="清空"
            onClick={handleClear}
            disabled={isDisabled}
            tabIndex={isEmpty ? -1 : undefined}
          >
            <svg
              data-slot="close-button-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        {description !== undefined && (
          <span className="description" data-slot="description">
            {description}
          </span>
        )}
      </div>
    );
  },
);

SearchField.displayName = 'SearchField';

export default SearchField;
