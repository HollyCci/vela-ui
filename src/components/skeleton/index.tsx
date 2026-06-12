import { forwardRef, type HTMLAttributes } from 'react';
import clsx from 'clsx';

export type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  animation?: 'pulse' | 'shimmer';
};

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ animation = 'pulse', className, ...rest }, ref) => (
    <div ref={ref} aria-hidden className={clsx('skeleton', `skeleton--${animation}`, className)} {...rest} />
  ),
);

Skeleton.displayName = 'Skeleton';

export default Skeleton;
