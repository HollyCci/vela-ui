import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

export type DropdownPlacement = 'top' | 'bottom' | 'left' | 'right';

export type DropdownProps = HTMLAttributes<HTMLDivElement> & {
  isOpen: boolean;
  trigger?: ReactNode;
  placement?: DropdownPlacement;
};

const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  ({ isOpen, trigger, placement = 'bottom', className, children, ...rest }, ref) => (
    <div ref={ref} className={clsx('dropdown', className)} {...rest}>
      {trigger !== undefined && <span className="dropdown__trigger">{trigger}</span>}
      {isOpen && (
        <div className="dropdown__popover" data-placement={placement}>
          <div className="dropdown__menu" role="menu" data-slot="dropdown-menu">
            {children}
          </div>
        </div>
      )}
    </div>
  ),
);

Dropdown.displayName = 'Dropdown';

export default Dropdown;
