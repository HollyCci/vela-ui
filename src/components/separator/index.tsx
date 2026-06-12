import { forwardRef, type HTMLAttributes } from 'react';
import clsx from 'clsx';

export type SeparatorProps = HTMLAttributes<HTMLDivElement> & {
  orientation?: 'horizontal' | 'vertical';
  color?: 'default' | 'secondary' | 'tertiary';
};

const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
  ({ orientation = 'horizontal', color = 'default', className, ...rest }, ref) => (
    <div
      ref={ref}
      role="separator"
      aria-orientation={orientation}
      className={clsx('separator', `separator--${orientation}`, `separator--${color}`, className)}
      {...rest}
    />
  ),
);

Separator.displayName = 'Separator';

export default Separator;
