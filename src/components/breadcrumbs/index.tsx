import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import clsx from 'clsx';

export type BreadcrumbsProps = HTMLAttributes<HTMLOListElement> & {
  /**
   * Custom separator rendered between items. Mirrors the OSS HeroUI Breadcrumbs `separator`
   * contract: when a valid React element is provided it is cloned with the breadcrumbs
   * separator `className` + `data-slot="breadcrumbs-separator"` injected; a non-element node
   * (e.g. a string) is rendered as-is; when omitted the default chevron icon is used.
   */
  separator?: ReactNode;
};

export type BreadcrumbItemProps = Omit<HTMLAttributes<HTMLLIElement>, 'children'> & {
  label: string;
  href?: string;
  isCurrent?: boolean;
  /** Internal: set by Breadcrumbs based on position; the last item omits the separator. */
  isLast?: boolean;
  /** Internal: custom separator injected by Breadcrumbs root; falls back to the default icon. */
  separator?: ReactNode;
  linkProps?: AnchorHTMLAttributes<HTMLAnchorElement>;
};

const SeparatorIcon = () => (
  <svg
    className="breadcrumbs__separator"
    data-slot="breadcrumbs-separator"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Render the separator following the OSS HeroUI contract:
 * - no custom separator → default chevron icon;
 * - valid element → cloneElement injecting separator className + data-slot;
 * - any other node (string/number/fragment) → rendered verbatim.
 */
const renderSeparator = (separator: ReactNode): ReactNode => {
  if (separator === undefined || separator === null) {
    return <SeparatorIcon />;
  }

  if (isValidElement(separator)) {
    return cloneElement(
      separator as ReactElement<{ className?: string; 'data-slot'?: string }>,
      {
        className: clsx(
          'breadcrumbs__separator',
          (separator.props as { className?: string }).className,
        ),
        'data-slot': 'breadcrumbs-separator',
      },
    );
  }

  return separator;
};

const Item = forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  (
    { label, href, isCurrent = false, isLast = false, separator, linkProps, className, ...rest },
    ref,
  ) => (
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
      {!isLast && renderSeparator(separator)}
    </li>
  ),
);
Item.displayName = 'Breadcrumbs.Item';

const BreadcrumbsRoot = forwardRef<HTMLOListElement, BreadcrumbsProps>(
  ({ className, children, separator, ...rest }, ref) => {
    const items = Children.toArray(children);
    const lastIndex = items.length - 1;
    return (
      <nav aria-label="面包屑">
        <ol
          ref={ref}
          className={clsx('breadcrumbs', className)}
          style={{ listStyle: 'none', margin: 0, padding: 0 }}
          {...rest}
        >
          {items.map((child, index) =>
            isValidElement<BreadcrumbItemProps>(child)
              ? cloneElement(child, { isLast: index === lastIndex, separator })
              : child,
          )}
        </ol>
      </nav>
    );
  },
);
BreadcrumbsRoot.displayName = 'Breadcrumbs';

const Breadcrumbs = Object.assign(BreadcrumbsRoot, { Item });

export default Breadcrumbs;
