import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

export type CellSelectProps = Omit<HTMLAttributes<HTMLDivElement>, 'popover'> & {
  label?: ReactNode;
  value?: ReactNode;
  variant?: 'default' | 'secondary';
  isOpen?: boolean;
  isDisabled?: boolean;
  onTriggerClick?: () => void;
  /** 静态弹层内容（复杂浮层仅做静态结构） */
  popover?: ReactNode;
};

const CellSelect = forwardRef<HTMLDivElement, CellSelectProps>(
  (
    {
      label,
      value,
      variant = 'default',
      isOpen = false,
      isDisabled = false,
      onTriggerClick,
      popover,
      className,
      ...rest
    },
    ref,
  ) => (
    <div ref={ref} className={clsx('cell-select', className)} {...rest}>
      <button
        type="button"
        className={clsx(
          'cell-select__trigger',
          variant === 'secondary' && 'cell-select__trigger--secondary',
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={onTriggerClick}
        disabled={isDisabled}
      >
        <span className="cell-select__label">{label}</span>
        <span className="cell-select__value">{value}</span>
        <svg
          className="cell-select__indicator"
          data-open={isOpen || undefined}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {isOpen && popover !== undefined && (
        <div className="cell-select__popover" role="listbox">
          {popover}
        </div>
      )}
    </div>
  ),
);

CellSelect.displayName = 'CellSelect';

export default CellSelect;
