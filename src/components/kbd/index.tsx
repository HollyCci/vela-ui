import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

export type KbdProps = HTMLAttributes<HTMLElement> & {
  /** 修饰键缩写，如 ⌘ ⇧ */
  abbr?: ReactNode;
  /** abbr 的完整名称（参考实现为 abbr 标签的 title，如 Command） */
  abbrTitle?: string;
  isLight?: boolean;
};

const Kbd = forwardRef<HTMLElement, KbdProps>(
  ({ abbr, abbrTitle, isLight = false, className, children, ...rest }, ref) => (
    <kbd ref={ref} className={clsx('kbd', isLight && 'kbd--light', className)} {...rest}>
      {abbr !== undefined && (
        <abbr className="kbd__abbr" title={abbrTitle}>
          {abbr}
        </abbr>
      )}
      <span className="kbd__content">{children}</span>
    </kbd>
  ),
);

Kbd.displayName = 'Kbd';

export default Kbd;
