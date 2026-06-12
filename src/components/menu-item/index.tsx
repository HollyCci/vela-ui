import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

export type MenuItemSelectionMode = 'single' | 'multiple';

export type MenuItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  description?: ReactNode;
  isDanger?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
  hasSubmenu?: boolean;
  hasIndicator?: boolean;
  selectionMode?: MenuItemSelectionMode;
};

const MenuItem = forwardRef<HTMLButtonElement, MenuItemProps>(
  (
    {
      description,
      isDanger = false,
      isSelected = false,
      isDisabled = false,
      hasSubmenu = false,
      hasIndicator = false,
      selectionMode,
      className,
      children,
      type = 'button',
      ...rest
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      role="menuitem"
      data-slot="menu-item"
      className={clsx('menu-item', isDanger && 'menu-item--danger', className)}
      data-selected={isSelected ? 'true' : undefined}
      data-disabled={isDisabled ? 'true' : undefined}
      data-has-submenu={hasSubmenu ? 'true' : undefined}
      data-selection-mode={selectionMode === 'multiple' ? 'multiple' : undefined}
      aria-checked={selectionMode !== undefined ? isSelected : undefined}
      disabled={isDisabled}
      {...rest}
    >
      {hasIndicator && !hasSubmenu && (
        <span className="menu-item__indicator" aria-hidden="true">
          <svg
            data-slot="menu-item-indicator--checkmark"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            {isSelected && <path d="M2 6.5l2.5 2.5L10 3.5" />}
          </svg>
        </span>
      )}
      <span data-slot="label">{children}</span>
      {description !== undefined && <span data-slot="description">{description}</span>}
      {hasSubmenu && (
        <span className="menu-item__indicator menu-item__indicator--submenu" aria-hidden="true">
          <span data-slot="submenu-indicator">
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4.5 2.5L8 6l-3.5 3.5" />
            </svg>
          </span>
        </span>
      )}
    </button>
  ),
);

MenuItem.displayName = 'MenuItem';

export default MenuItem;
