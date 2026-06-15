import {
  forwardRef,
  useId,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import clsx from 'clsx';

export type TagSize = 'sm' | 'md' | 'lg';
export type TagVariant = 'default' | 'surface';

export type TagProps = HTMLAttributes<HTMLDivElement> & {
  size?: TagSize;
  variant?: TagVariant;
  isSelected?: boolean;
  isDisabled?: boolean;
  onRemove?: () => void;
};

const Tag = forwardRef<HTMLDivElement, TagProps>(
  (
    {
      size = 'md',
      variant = 'default',
      isSelected = false,
      isDisabled = false,
      onRemove,
      className,
      children,
      onClick,
      onKeyDown,
      ...rest
    },
    ref,
  ) => {
    const isInteractive = onClick !== undefined && !isDisabled;

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (!isInteractive || event.defaultPrevented) return;
      if (event.key === 'Enter' || event.key === ' ') {
        // Space would otherwise scroll the page; mirror native button activation.
        if (event.key === ' ') event.preventDefault();
        onClick?.(event as unknown as MouseEvent<HTMLDivElement>);
      }
    };

    return (
      <div
        ref={ref}
        className={clsx('tag', `tag--${size}`, `tag--${variant}`, className)}
        data-selected={isSelected || undefined}
        data-disabled={isDisabled || undefined}
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        aria-pressed={isInteractive ? isSelected : undefined}
        aria-disabled={isDisabled || undefined}
        onClick={isDisabled ? undefined : onClick}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {children}
        {onRemove !== undefined && (
          <button
            type="button"
            className="tag__remove-button"
            aria-label="移除"
            onClick={onRemove}
            disabled={isDisabled}
          >
            <svg
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
        )}
      </div>
    );
  },
);

Tag.displayName = 'Tag';

export type TagGroupProps = HTMLAttributes<HTMLDivElement> & {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode;
};

export const TagGroup = forwardRef<HTMLDivElement, TagGroupProps>(
  ({ label, description, errorMessage, className, children, ...rest }, ref) => {
    const labelId = useId();
    return (
    <div
      ref={ref}
      className={clsx('tag-group', className)}
      role="group"
      aria-labelledby={label !== undefined ? labelId : undefined}
      {...rest}
    >
      {label !== undefined && (
        <span id={labelId} className="label" data-slot="label">
          {label}
        </span>
      )}
      <div className="tag-group__list">{children}</div>
      {description !== undefined && (
        <span className="description" data-slot="description">
          {description}
        </span>
      )}
      {errorMessage !== undefined && (
        <span className="description" data-slot="error-message">
          {errorMessage}
        </span>
      )}
    </div>
    );
  },
);

TagGroup.displayName = 'TagGroup';

export default Tag;
