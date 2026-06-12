import { forwardRef, type HTMLAttributes } from 'react';
import clsx from 'clsx';

export type TextShimmerProps = HTMLAttributes<HTMLSpanElement>;

const TextShimmer = forwardRef<HTMLSpanElement, TextShimmerProps>(
  ({ className, ...rest }, ref) => (
    <span ref={ref} className={clsx('text-shimmer', className)} {...rest} />
  ),
);

TextShimmer.displayName = 'TextShimmer';

export default TextShimmer;
