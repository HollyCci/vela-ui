import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

export type SegmentSize = 'sm' | 'md' | 'lg';
export type SegmentVariant = 'default' | 'ghost';

export type SegmentOption = {
  value: string;
  label: ReactNode;
  isDisabled?: boolean;
};

export type SegmentProps = Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> & {
  options: SegmentOption[];
  value: string;
  onChange?: (value: string) => void;
  size?: SegmentSize;
  variant?: SegmentVariant;
};

type SegmentItemProps = {
  option: SegmentOption;
  isSelected: boolean;
  size: SegmentSize;
  isGhost: boolean;
  onSelect?: (value: string) => void;
};

const SegmentItem = ({ option, isSelected, size, isGhost, onSelect }: SegmentItemProps) => {
  const handleClick = () => {
    if (!option.isDisabled) onSelect?.(option.value);
  };

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      className={clsx('segment__item', `segment__item--${size}`, isGhost && 'segment__item--ghost')}
      data-selected={isSelected || undefined}
      data-disabled={option.isDisabled || undefined}
      disabled={option.isDisabled}
      onClick={handleClick}
    >
      <span className="segment__separator" aria-hidden="true" />
      {isSelected && (
        <span
          className={clsx('segment__indicator', isGhost && 'segment__indicator--ghost')}
          aria-hidden="true"
        />
      )}
      {option.label}
    </button>
  );
};

SegmentItem.displayName = 'Segment.Item';

const Segment = forwardRef<HTMLDivElement, SegmentProps>(
  ({ options, value, onChange, size = 'md', variant = 'default', className, ...rest }, ref) => {
    const isGhost = variant === 'ghost';
    const items = options.map((option) => (
      <SegmentItem
        key={option.value}
        option={option}
        isSelected={option.value === value}
        size={size}
        isGhost={isGhost}
        onSelect={onChange}
      />
    ));

    return (
      <div
        ref={ref}
        role="radiogroup"
        className={clsx(
          'segment',
          size === 'sm' && 'segment--sm',
          isGhost && 'segment--ghost',
          className,
        )}
        {...rest}
      >
        {items}
      </div>
    );
  },
);

Segment.displayName = 'Segment';

export default Segment;
