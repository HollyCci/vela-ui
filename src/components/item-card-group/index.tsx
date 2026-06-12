import { forwardRef, type HTMLAttributes } from 'react';
import clsx from 'clsx';

export type ItemCardGroupVariant = 'default' | 'secondary' | 'tertiary' | 'outline' | 'transparent';

export type ItemCardGroupLayout = 'list' | 'grid';

export type ItemCardGroupProps = HTMLAttributes<HTMLDivElement> & {
  variant?: ItemCardGroupVariant;
  layout?: ItemCardGroupLayout;
  /** grid 布局时的列数（CSS 变量 --item-card-group-columns，默认 2） */
  columns?: number;
};

type SectionProps = HTMLAttributes<HTMLDivElement>;

const ItemCardGroupRoot = forwardRef<HTMLDivElement, ItemCardGroupProps>(
  ({ variant = 'default', layout = 'list', columns, className, style, ...rest }, ref) => (
    <div
      ref={ref}
      role="group"
      className={clsx(
        'item-card-group',
        `item-card-group--${variant}`,
        `item-card-group--${layout}`,
        className,
      )}
      style={
        columns !== undefined
          ? { ...style, ['--item-card-group-columns' as string]: String(columns) }
          : style
      }
      {...rest}
    />
  ),
);
ItemCardGroupRoot.displayName = 'ItemCardGroup';

const Header = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    data-slot="item-card-group-header"
    className={clsx('item-card-group__header', className)}
    {...rest}
  />
));
Header.displayName = 'ItemCardGroup.Header';

const Title = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('item-card-group__title', className)} {...rest} />
));
Title.displayName = 'ItemCardGroup.Title';

const Description = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('item-card-group__description', className)} {...rest} />
));
Description.displayName = 'ItemCardGroup.Description';

const ItemCardGroup = Object.assign(ItemCardGroupRoot, { Header, Title, Description });

export default ItemCardGroup;
