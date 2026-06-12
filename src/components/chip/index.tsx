import { forwardRef, type HTMLAttributes } from 'react';
import clsx from 'clsx';

export type ChipColor = 'default' | 'accent' | 'success' | 'warning' | 'danger';
export type ChipVariant = 'primary' | 'tertiary';
export type ChipSize = 'sm' | 'md' | 'lg';

export type ChipProps = HTMLAttributes<HTMLSpanElement> & {
  color?: ChipColor;
  variant?: ChipVariant;
  size?: ChipSize;
};

const Chip = forwardRef<HTMLSpanElement, ChipProps>(
  ({ color = 'default', variant = 'primary', size = 'md', className, children, ...rest }, ref) => (
    <span
      ref={ref}
      className={clsx('chip', `chip--${variant}`, `chip--${color}`, `chip--${size}`, className)}
      {...rest}
    >
      {children}
    </span>
  ),
);

Chip.displayName = 'Chip';

export default Chip;
