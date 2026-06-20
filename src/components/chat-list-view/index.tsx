'use client';

import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import {
  GridList,
  GridListItem,
  type GridListProps,
  type GridListItemProps,
} from 'react-aria-components';
import clsx from 'clsx';

export type ChatListViewDensity = 'comfortable' | 'compact';

export type ChatListViewProps<T extends object = object> = Omit<
  GridListProps<T>,
  'className' | 'style'
> & {
  /** 密度变体：comfortable 显示预览/元信息，compact 隐藏（线上 Pro 版 --compact 仅留标题） */
  density?: ChatListViewDensity;
  className?: string;
  style?: CSSProperties;
};

export type ChatListViewItemProps = Omit<GridListItemProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

type DivProps = HTMLAttributes<HTMLDivElement>;
type SpanProps = HTMLAttributes<HTMLSpanElement>;

export type ChatListViewIconProps = DivProps;
export type ChatListViewItemContentProps = DivProps;
export type ChatListViewMetaProps = DivProps;
export type ChatListViewTitleProps = SpanProps;
export type ChatListViewPreviewProps = SpanProps;

/**
 * 会话/消息列表：基于 RAC GridList，键盘导航与单选高亮（data-selected）由 RAC 提供。
 * 受控选中走 selectedKeys/onSelectionChange，复用 list-view--secondary 的选中态样式。
 *
 * 行结构与线上 Pro 版 Anatomy 逐字一致：
 *   <Item>
 *     <Icon />
 *     <ItemContent>           // 文本列：标题 + 预览
 *       <Title /> <Preview />
 *     </ItemContent>
 *     <Meta />                // 可选元信息（日期/未读数），ItemContent 的同级
 *   </Item>
 * Icon / Meta 是 ItemContent 的同级，由 .list-view__item（flex 行）排布。
 */
function ChatListViewRoot<T extends object>({
  density = 'comfortable',
  className,
  ...rest
}: ChatListViewProps<T>) {
  return (
    <GridList
      data-slot="chat-list-view"
      className={clsx(
        'list-view',
        'list-view--secondary',
        'chat-list-view',
        `chat-list-view--${density}`,
        className,
      )}
      {...rest}
    />
  );
}
ChatListViewRoot.displayName = 'ChatListView';

const Item = ({ className, ...rest }: ChatListViewItemProps) => (
  <GridListItem
    data-slot="chat-list-view-item"
    className={clsx('list-view__item', 'chat-list-view__item', className)}
    {...rest}
  />
);
Item.displayName = 'ChatListView.Item';

/** 默认会话图标（线上 Pro 版快照内联 SVG），未传 children 时回退渲染 */
const DEFAULT_ICON: ReactNode = (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="m4.843 10.944-.194 2.335a.204.204 0 0 0 .339.17l2.21-1.964.589.013L8 11.5c1.695 0 3.087-.44 4.02-1.177.89-.702 1.48-1.76 1.48-3.323s-.59-2.62-1.48-3.323C11.087 2.94 9.695 2.5 8 2.5s-3.087.44-4.02 1.177C3.09 4.38 2.5 5.437 2.5 7c0 1.648.656 2.742 1.648 3.448zm1.141 3.625 1.77-1.572Q7.875 13 8 13c3.866 0 7-2 7-6s-3.134-6-7-6-7 2-7 6c0 2.117.878 3.674 2.277 4.67l-.123 1.484a1.704 1.704 0 0 0 2.83 1.415"
      clipRule="evenodd"
    />
  </svg>
);

/** 行首图标槽：ItemContent 的同级（线上 Pro 版结构），未传 children 时回退默认图标 */
const Icon = forwardRef<HTMLDivElement, ChatListViewIconProps>(({ className, children, ...rest }, ref) => (
  <div
    ref={ref}
    data-slot="chat-list-view-icon"
    className={clsx('chat-list-view__icon', className)}
    {...rest}
  >
    {children ?? DEFAULT_ICON}
  </div>
));
Icon.displayName = 'ChatListView.Icon';

/**
 * 文本内容包裹：标题 + 预览（线上 Pro 版 .chat-list-view__item-content = "Row text content"）。
 * 复用 .chat-list-view__text 的纵向 flex 列布局（flex-direction:column / min-width:0），
 * 占据行内剩余空间（flex:1）以便标题/预览溢出省略。
 */
const ItemContent = forwardRef<HTMLDivElement, ChatListViewItemContentProps>(
  ({ className, style, ...rest }, ref) => (
    <div
      ref={ref}
      data-slot="chat-list-view-item-content"
      className={clsx('chat-list-view__item-content', 'chat-list-view__text', className)}
      style={{ flex: 1, ...style }}
      {...rest}
    />
  ),
);
ItemContent.displayName = 'ChatListView.ItemContent';

const Title = forwardRef<HTMLSpanElement, ChatListViewTitleProps>(({ className, ...rest }, ref) => (
  <span
    ref={ref}
    data-slot="chat-list-view-title"
    className={clsx('list-view__title', 'chat-list-view__title', className)}
    {...rest}
  />
));
Title.displayName = 'ChatListView.Title';

const Preview = forwardRef<HTMLSpanElement, ChatListViewPreviewProps>(({ className, ...rest }, ref) => (
  <span
    ref={ref}
    data-slot="chat-list-view-preview"
    className={clsx('list-view__description', 'chat-list-view__preview', className)}
    {...rest}
  />
));
Preview.displayName = 'ChatListView.Preview';

const Meta = forwardRef<HTMLDivElement, ChatListViewMetaProps>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    data-slot="chat-list-view-meta"
    className={clsx('list-view__item-action', 'chat-list-view__meta', className)}
    {...rest}
  />
));
Meta.displayName = 'ChatListView.Meta';

const ChatListView = Object.assign(ChatListViewRoot, {
  Item,
  Icon,
  ItemContent,
  Title,
  Preview,
  Meta,
});

export default ChatListView;
