import { forwardRef, type HTMLAttributes, type ReactElement } from 'react';
import clsx from 'clsx';

export type EmptyStateSize = 'sm' | 'md' | 'lg';

/** 自定义渲染函数，替换默认的 div 根元素（参考 API：DOMRenderFunction） */
export type EmptyStateRenderFunction = (props: HTMLAttributes<HTMLDivElement>) => ReactElement;

export type EmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  /** 尺寸变体，控制内边距与间距。 */
  size?: EmptyStateSize;
  /** 自定义渲染函数，替换默认的 div 根元素（参考 API：DOMRenderFunction） */
  render?: EmptyStateRenderFunction;
};

type SectionProps = HTMLAttributes<HTMLDivElement>;

export type EmptyStateHeaderProps = SectionProps;
// 标题渲染为 <h3>，对齐线上参考版的标题语义（与 timeline/kanban 等同库组件一致）
export type EmptyStateTitleProps = HTMLAttributes<HTMLHeadingElement>;
// 描述渲染为 <p>，对齐线上参考版的语义
export type EmptyStateDescriptionProps = HTMLAttributes<HTMLParagraphElement>;
export type EmptyStateContentProps = SectionProps;

export type EmptyStateMediaVariant = 'default' | 'icon';

export type EmptyStateMediaProps = HTMLAttributes<HTMLDivElement> & {
  /** "icon" 时渲染圆形 muted 底座（CSS [data-variant=icon]）；默认 "default" 无底座。 */
  variant?: EmptyStateMediaVariant;
};

const EmptyStateRoot = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ size = 'md', render, className, ...rest }, ref) => {
    const domProps: HTMLAttributes<HTMLDivElement> = {
      className: clsx('empty-state', `empty-state--${size}`, className),
      ...rest,
    };
    return render !== undefined ? render(domProps) : <div ref={ref} {...domProps} />;
  },
);
EmptyStateRoot.displayName = 'EmptyState';

const Header = forwardRef<HTMLDivElement, EmptyStateHeaderProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('empty-state__header', className)} {...rest} />
));
Header.displayName = 'EmptyState.Header';

const Media = forwardRef<HTMLDivElement, EmptyStateMediaProps>(
  ({ variant = 'default', className, ...rest }, ref) => (
    <div
      ref={ref}
      data-variant={variant}
      className={clsx('empty-state__media', className)}
      {...rest}
    />
  ),
);
Media.displayName = 'EmptyState.Media';

const Title = forwardRef<HTMLHeadingElement, EmptyStateTitleProps>(({ className, ...rest }, ref) => (
  <h3 ref={ref} className={clsx('empty-state__title', className)} {...rest} />
));
Title.displayName = 'EmptyState.Title';

const Description = forwardRef<HTMLParagraphElement, EmptyStateDescriptionProps>(
  ({ className, ...rest }, ref) => (
    <p ref={ref} className={clsx('empty-state__description', className)} {...rest} />
  ),
);
Description.displayName = 'EmptyState.Description';

const Content = forwardRef<HTMLDivElement, EmptyStateContentProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('empty-state__content', className)} {...rest} />
));
Content.displayName = 'EmptyState.Content';

const EmptyState = Object.assign(EmptyStateRoot, { Header, Media, Title, Description, Content });

export default EmptyState;
