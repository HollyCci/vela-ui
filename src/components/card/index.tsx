import { forwardRef, type HTMLAttributes } from 'react';
import clsx from 'clsx';

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'secondary' | 'tertiary' | 'transparent';
};

export type CardSectionProps = HTMLAttributes<HTMLDivElement>;
type SectionProps = CardSectionProps;

const CardRoot = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', className, ...rest }, ref) => (
    <div ref={ref} className={clsx('card', `card--${variant}`, className)} {...rest} />
  ),
);
CardRoot.displayName = 'Card';

const Header = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('card__header', className)} {...rest} />
));
Header.displayName = 'Card.Header';

const Title = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('card__title', className)} {...rest} />
));
Title.displayName = 'Card.Title';

const Description = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('card__description', className)} {...rest} />
));
Description.displayName = 'Card.Description';

const Content = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('card__content', className)} {...rest} />
));
Content.displayName = 'Card.Content';

const Footer = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('card__footer', className)} {...rest} />
));
Footer.displayName = 'Card.Footer';

const Card = Object.assign(CardRoot, { Header, Title, Description, Content, Footer });

export default Card;
