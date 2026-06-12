import { forwardRef, type HTMLAttributes } from 'react';
import clsx from 'clsx';

export type ToolbarProps = HTMLAttributes<HTMLDivElement> & {
  orientation?: 'horizontal' | 'vertical';
  /** attached: 白底胶囊 + 浮层阴影 */
  isAttached?: boolean;
};

const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(
  ({ orientation = 'horizontal', isAttached = false, className, children, ...rest }, ref) => (
    <div
      ref={ref}
      role="toolbar"
      data-slot="toolbar"
      aria-orientation={orientation}
      className={clsx(
        'toolbar',
        `toolbar--${orientation}`,
        isAttached && 'toolbar--attached',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  ),
);

Toolbar.displayName = 'Toolbar';

export default Toolbar;
