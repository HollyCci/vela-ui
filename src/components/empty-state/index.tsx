import { forwardRef, type HTMLAttributes } from 'react';
import clsx from 'clsx';

export type EmptyStateSize = 'sm' | 'md' | 'lg';

export type EmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  size?: EmptyStateSize;
};

type SectionProps = HTMLAttributes<HTMLDivElement>;

export type EmptyStateHeaderProps = SectionProps;
export type EmptyStateTitleProps = SectionProps;
export type EmptyStateDescriptionProps = SectionProps;
export type EmptyStateContentProps = SectionProps;

export type EmptyStateMediaProps = HTMLAttributes<HTMLDivElement> & {
  /** variant="icon" 时渲染圆形图标底座（CSS [data-variant=icon]） */
  variant?: 'icon';
};

const EmptyStateRoot = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ size = 'md', className, ...rest }, ref) => (
    <div
      ref={ref}
      role="status"
      className={clsx('empty-state', `empty-state--${size}`, className)}
      {...rest}
    />
  ),
);
EmptyStateRoot.displayName = 'EmptyState';

const Header = forwardRef<HTMLDivElement, EmptyStateHeaderProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('empty-state__header', className)} {...rest} />
));
Header.displayName = 'EmptyState.Header';

const Media = forwardRef<HTMLDivElement, EmptyStateMediaProps>(
  ({ variant, className, ...rest }, ref) => (
    <div
      ref={ref}
      data-variant={variant}
      aria-hidden="true"
      className={clsx('empty-state__media', className)}
      {...rest}
    />
  ),
);
Media.displayName = 'EmptyState.Media';

const Title = forwardRef<HTMLDivElement, EmptyStateTitleProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('empty-state__title', className)} {...rest} />
));
Title.displayName = 'EmptyState.Title';

const Description = forwardRef<HTMLDivElement, EmptyStateDescriptionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('empty-state__description', className)} {...rest} />
));
Description.displayName = 'EmptyState.Description';

const Content = forwardRef<HTMLDivElement, EmptyStateContentProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('empty-state__content', className)} {...rest} />
));
Content.displayName = 'EmptyState.Content';

const EmptyState = Object.assign(EmptyStateRoot, { Header, Media, Title, Description, Content });

export default EmptyState;
