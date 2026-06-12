import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

export type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right';

export type PopoverProps = HTMLAttributes<HTMLDivElement> & {
  isOpen: boolean;
  trigger?: ReactNode;
  placement?: PopoverPlacement;
};

const PopoverRoot = forwardRef<HTMLDivElement, PopoverProps>(
  ({ isOpen, trigger, placement = 'bottom', className, children, ...rest }, ref) => (
    <div ref={ref} className={className} {...rest}>
      {trigger !== undefined && <span className="popover__trigger">{trigger}</span>}
      {isOpen && (
        <div className="popover" role="dialog" data-placement={placement}>
          <div className="popover__dialog">{children}</div>
        </div>
      )}
    </div>
  ),
);
PopoverRoot.displayName = 'Popover';

const Heading = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...rest }, ref) => (
    <h3 ref={ref} className={clsx('popover__heading', className)} {...rest} />
  ),
);
Heading.displayName = 'Popover.Heading';

const Popover = Object.assign(PopoverRoot, { Heading });

export default Popover;
