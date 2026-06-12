import { forwardRef, type HTMLAttributes, type LiHTMLAttributes } from 'react';
import clsx from 'clsx';

export type ListViewVariant = 'primary' | 'secondary';

export type ListViewProps = HTMLAttributes<HTMLUListElement> & {
  variant?: ListViewVariant;
};

export type ListViewItemProps = LiHTMLAttributes<HTMLLIElement> & {
  isSelected?: boolean;
  isDisabled?: boolean;
};

type SectionProps = HTMLAttributes<HTMLDivElement>;

const ListViewRoot = forwardRef<HTMLUListElement, ListViewProps>(
  ({ variant = 'primary', className, ...rest }, ref) => (
    <ul
      ref={ref}
      role="listbox"
      className={clsx('list-view', `list-view--${variant}`, className)}
      {...rest}
    />
  ),
);
ListViewRoot.displayName = 'ListView';

const Item = forwardRef<HTMLLIElement, ListViewItemProps>(
  ({ isSelected = false, isDisabled = false, className, ...rest }, ref) => (
    <li
      ref={ref}
      role="option"
      aria-selected={isSelected}
      aria-disabled={isDisabled || undefined}
      data-selected={isSelected || undefined}
      className={clsx('list-view__item', className)}
      {...rest}
    />
  ),
);
Item.displayName = 'ListView.Item';

const SelectionCell = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('list-view__selection-cell', className)} {...rest} />
));
SelectionCell.displayName = 'ListView.SelectionCell';

const ItemContent = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('list-view__item-content', className)} {...rest} />
));
ItemContent.displayName = 'ListView.ItemContent';

const Title = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('list-view__title', className)} {...rest} />
));
Title.displayName = 'ListView.Title';

const Description = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('list-view__description', className)} {...rest} />
));
Description.displayName = 'ListView.Description';

const ItemAction = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('list-view__item-action', className)} {...rest} />
));
ItemAction.displayName = 'ListView.ItemAction';

const ListViewEmptyState = forwardRef<HTMLDivElement, SectionProps>(
  ({ className, ...rest }, ref) => (
    <div ref={ref} className={clsx('list-view__empty-state', className)} {...rest} />
  ),
);
ListViewEmptyState.displayName = 'ListView.EmptyState';

const LoadMore = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('list-view__load-more', className)} {...rest} />
));
LoadMore.displayName = 'ListView.LoadMore';

const ListView = Object.assign(ListViewRoot, {
  Item,
  SelectionCell,
  ItemContent,
  Title,
  Description,
  ItemAction,
  EmptyState: ListViewEmptyState,
  LoadMore,
});

export default ListView;
