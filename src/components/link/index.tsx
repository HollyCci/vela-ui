import { forwardRef, type AnchorHTMLAttributes } from 'react';
import clsx from 'clsx';

export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  isDisabled?: boolean;
  /** 外链：自动 target=_blank 并显示外链箭头图标 */
  isExternal?: boolean;
};

const ExternalIcon = () => (
  <span className="link__icon" data-default-icon="true" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M7 17L17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ isDisabled = false, isExternal = false, className, children, ...rest }, ref) => (
    <a
      ref={ref}
      aria-disabled={isDisabled || undefined}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className={clsx('link', className)}
      {...rest}
    >
      {children}
      {isExternal && <ExternalIcon />}
    </a>
  ),
);

Link.displayName = 'Link';

export default Link;
