import { forwardRef, type HTMLAttributes } from 'react';
import { SkeletonRoot } from '@heroui/react';

export type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  animation?: 'pulse' | 'shimmer';
};

/**
 * Wraps @heroui/react's real Skeleton (react-aria-components `dom.div` under the hood,
 * which forwards ref to the real element). HeroUI's `skeletonVariants` emit the exact
 * `skeleton` / `skeleton--<animation>` classes our CSS shard targets.
 *
 * Contract preserved: same `animation` prop ('pulse' | 'shimmer'), default 'pulse',
 * default `aria-hidden`, `HTMLAttributes<HTMLDivElement>` passthrough, ref to the DOM
 * element, and `displayName`. We map our `animation` -> heroui's `animationType` and
 * pass `ref`/`className` straight through (SkeletonRoot spreads them onto `dom.div`,
 * a real forwardRef primitive).
 */
const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(({ animation = 'pulse', ...rest }, ref) => (
  <SkeletonRoot ref={ref} animationType={animation} aria-hidden {...rest} />
));

Skeleton.displayName = 'Skeleton';

export default Skeleton;
