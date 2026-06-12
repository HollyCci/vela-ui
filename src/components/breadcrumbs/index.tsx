import { forwardRef, type AnchorHTMLAttributes, type HTMLAttributes } from 'react';
import clsx from 'clsx';

export type BreadcrumbsProps = HTMLAttributes<HTMLOListElement>;

export type BreadcrumbItemProps = Omit<HTMLAttributes<HTMLLIElement>, 'children'> & {
  label: string;
  href?: string;
  isCurrent?: boolean;
  linkProps?: AnchorHTMLAttributes<HTMLAnchorElement>;
};

const SeparatorIcon = () => (
  <svg
    className="breadcrumbs__separator"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Item = forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ label, href, isCurrent = false, linkProps, className, ...rest }, ref) => (
    <li ref={ref} className={clsx('breadcrumbs__item', className)} {...rest}>
      <a
        className="breadcrumbs__link"
        href={isCurrent ? undefined : href}
        data-current={isCurrent || undefined}
        aria-current={isCurrent ? 'page' : undefined}
        {...linkProps}
      >
        {label}
      </a>
      {!isCurrent && <SeparatorIcon />}
    </li>
  ),
);
Item.displayName = 'Breadcrumbs.Item';

const BreadcrumbsRoot = forwardRef<HTMLOListElement, BreadcrumbsProps>(
  ({ className, children, ...rest }, ref) => (
    <nav aria-label="面包屑">
      <ol
        ref={ref}
        className={clsx('breadcrumbs', className)}
        style={{ listStyle: 'none', margin: 0, padding: 0 }}
        {...rest}
      >
        {children}
      </ol>
    </nav>
  ),
);
BreadcrumbsRoot.displayName = 'Breadcrumbs';

const Breadcrumbs = Object.assign(BreadcrumbsRoot, { Item });

export default Breadcrumbs;
