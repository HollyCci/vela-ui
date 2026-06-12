import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

export type InlineSelectProps = HTMLAttributes<HTMLDivElement> & {
  value?: ReactNode;
  isOpen?: boolean;
  isDisabled?: boolean;
  onTriggerClick?: () => void;
  /** 静态弹层内容（复杂浮层仅做静态结构） */
  popover?: ReactNode;
};

const InlineSelect = forwardRef<HTMLDivElement, InlineSelectProps>(
  (
    { value, isOpen = false, isDisabled = false, onTriggerClick, popover, className, ...rest },
    ref,
  ) => (
    <div ref={ref} className={clsx('inline-select', className)} {...rest}>
      <button
        type="button"
        className="inline-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={onTriggerClick}
        disabled={isDisabled}
      >
        <span className="inline-select__value">{value}</span>
        <svg
          className="inline-select__indicator"
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
        <div className="inline-select__popover" role="listbox">
          {popover}
        </div>
      )}
    </div>
  ),
);

InlineSelect.displayName = 'InlineSelect';

export default InlineSelect;
