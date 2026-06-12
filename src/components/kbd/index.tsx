import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

export type KbdProps = HTMLAttributes<HTMLElement> & {
  /** 修饰键缩写，如 ⌘ ⇧ */
  abbr?: ReactNode;
  isLight?: boolean;
};

const Kbd = forwardRef<HTMLElement, KbdProps>(
  ({ abbr, isLight = false, className, children, ...rest }, ref) => (
    <kbd ref={ref} className={clsx('kbd', isLight && 'kbd--light', className)} {...rest}>
      {abbr !== undefined && <abbr className="kbd__abbr">{abbr}</abbr>}
      <span className="kbd__content">{children}</span>
    </kbd>
  ),
);

Kbd.displayName = 'Kbd';

export default Kbd;
