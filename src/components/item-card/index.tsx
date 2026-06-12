import { forwardRef, type HTMLAttributes } from 'react';
import clsx from 'clsx';

export type ItemCardVariant = 'default' | 'secondary' | 'tertiary' | 'outline' | 'transparent';

export type ItemCardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: ItemCardVariant;
};

type SectionProps = HTMLAttributes<HTMLDivElement>;

const ItemCardRoot = forwardRef<HTMLDivElement, ItemCardProps>(
  ({ variant = 'default', className, ...rest }, ref) => (
    <div
      ref={ref}
      data-slot="item-card"
      className={clsx('item-card', `item-card--${variant}`, className)}
      {...rest}
    />
  ),
);
ItemCardRoot.displayName = 'ItemCard';

const Icon = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    data-slot="item-card-icon"
    aria-hidden="true"
    className={clsx('item-card__icon', className)}
    {...rest}
  />
));
Icon.displayName = 'ItemCard.Icon';

const Content = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('item-card__content', className)} {...rest} />
));
Content.displayName = 'ItemCard.Content';

const Title = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('item-card__title', className)} {...rest} />
));
Title.displayName = 'ItemCard.Title';

const Description = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('item-card__description', className)} {...rest} />
));
Description.displayName = 'ItemCard.Description';

const Action = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('item-card__action', className)} {...rest} />
));
Action.displayName = 'ItemCard.Action';

const ItemCard = Object.assign(ItemCardRoot, { Icon, Content, Title, Description, Action });

export default ItemCard;
