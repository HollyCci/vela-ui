'use client';

import {
  forwardRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import clsx from 'clsx';
import { VISUALLY_HIDDEN } from '../_internal/visually-hidden';

export type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'checked' | 'defaultChecked' | 'onChange' | 'children'
> & {
  isSelected?: boolean;
  defaultSelected?: boolean;
  onSelectedChange?: (isSelected: boolean) => void;
  isIndeterminate?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  variant?: 'default' | 'secondary';
  description?: ReactNode;
  children?: ReactNode;
};

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      isSelected,
      defaultSelected = false,
      onSelectedChange,
      isIndeterminate = false,
      isInvalid = false,
      isDisabled = false,
      variant = 'default',
      description,
      children,
      className,
      ...rest
    },
    ref,
  ) => {
    const [innerSelected, setInnerSelected] = useState(defaultSelected);
    const selected = isSelected ?? innerSelected;

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (isSelected === undefined) setInnerSelected(event.target.checked);
      onSelectedChange?.(event.target.checked);
    };

    return (
      <label
        className={clsx('checkbox', variant === 'secondary' && 'checkbox--secondary', className)}
        data-selected={selected || undefined}
        data-indeterminate={isIndeterminate || undefined}
        data-invalid={isInvalid || undefined}
        data-disabled={isDisabled || undefined}
      >
        <input
          ref={ref}
          type="checkbox"
          style={VISUALLY_HIDDEN}
          checked={selected}
          onChange={handleChange}
          disabled={isDisabled}
          aria-invalid={isInvalid || undefined}
          {...rest}
        />
        <span className="checkbox__control" aria-hidden="true">
          <span className="checkbox__indicator">
            {isIndeterminate ? (
              <svg
                data-slot="checkbox-default-indicator--indeterminate"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M5 12h14" />
              </svg>
            ) : (
              <svg
                data-slot="checkbox-default-indicator--checkmark"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="24"
                strokeDashoffset={selected ? 0 : 24}
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            )}
          </span>
        </span>
        {(children !== undefined || description !== undefined) && (
          <span className="checkbox__content">
            {children !== undefined && (
              <span className="label" data-slot="label">
                {children}
              </span>
            )}
            {description !== undefined && (
              <span className="description" data-slot="description">
                {description}
              </span>
            )}
          </span>
        )}
      </label>
    );
  },
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
