import { forwardRef, type HTMLAttributes } from 'react';
import clsx from 'clsx';

export type ChipColor = 'default' | 'accent' | 'success' | 'warning' | 'danger';
export type ChipVariant = 'primary' | 'soft' | 'tertiary';
export type ChipSize = 'sm' | 'md' | 'lg';

export type ChipProps = HTMLAttributes<HTMLSpanElement> & {
  color?: ChipColor;
  variant?: ChipVariant;
  size?: ChipSize;
};

/** 与参考实现一致：chip chip--<color> chip--<size> chip--<variant>，文本包在 chip__label */
const Chip = forwardRef<HTMLSpanElement, ChipProps>(
  ({ color = 'default', variant = 'primary', size = 'md', className, children, ...rest }, ref) => (
    <span
      ref={ref}
      data-slot="chip"
      className={clsx('chip', `chip--${color}`, `chip--${size}`, `chip--${variant}`, className)}
      {...rest}
    >
      <span className="chip__label" data-slot="chip-label">
        {children}
      </span>
    </span>
  ),
);

Chip.displayName = 'Chip';

export default Chip;
