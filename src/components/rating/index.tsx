import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import clsx from 'clsx';

export type RatingSize = 'sm' | 'md' | 'lg';

export type RatingProps = Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> & {
  /** 当前评分，支持小数（只读半星展示） */
  value?: number;
  max?: number;
  size?: RatingSize;
  isReadOnly?: boolean;
  isDisabled?: boolean;
  onChange?: (value: number) => void;
};

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2.5l2.95 5.98 6.6.96-4.78 4.65 1.13 6.58L12 17.57l-5.9 3.1 1.13-6.58-4.78-4.65 6.6-.96L12 2.5z" />
  </svg>
);

type RatingItemProps = {
  index: number;
  size: RatingSize;
  isActive: boolean;
  /** 0–1 之间的部分填充比例（仅只读小数时使用） */
  partial?: number;
  isReadOnly: boolean;
  onSelect?: (value: number) => void;
};

const RatingItem = ({ index, size, isActive, partial, isReadOnly, onSelect }: RatingItemProps) => {
  const handleClick = () => {
    onSelect?.(index + 1);
  };

  const partialStyle =
    partial !== undefined
      ? ({ '--rating-partial': `${partial * 100}%` } as CSSProperties)
      : undefined;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isActive}
      aria-label={`${index + 1} 星`}
      className={clsx('rating__item', `rating__item--${size}`)}
      data-active={isActive || undefined}
      data-readonly={isReadOnly || undefined}
      tabIndex={isReadOnly ? -1 : 0}
      onClick={handleClick}
    >
      <span className="rating__icon">
        <StarIcon />
        {partial !== undefined && (
          <span className="rating__icon-partial" style={partialStyle}>
            <StarIcon />
          </span>
        )}
      </span>
    </button>
  );
};

RatingItem.displayName = 'Rating.Item';

const Rating = forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      value = 0,
      max = 5,
      size = 'md',
      isReadOnly = false,
      isDisabled = false,
      onChange,
      className,
      ...rest
    },
    ref,
  ) => {
    const items = Array.from({ length: max }, (_, index) => {
      const isActive = index < Math.floor(value);
      const fraction = value - index;
      const partial = !isActive && fraction > 0 && fraction < 1 ? fraction : undefined;
      return (
        <RatingItem
          key={index}
          index={index}
          size={size}
          isActive={isActive}
          partial={partial}
          isReadOnly={isReadOnly}
          onSelect={isReadOnly || isDisabled ? undefined : onChange}
        />
      );
    });

    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-label="评分"
        className={clsx('rating', `rating--${size}`, className)}
        data-readonly={isReadOnly || undefined}
        data-disabled={isDisabled || undefined}
        {...rest}
      >
        {items}
      </div>
    );
  },
);

Rating.displayName = 'Rating';

export default Rating;
