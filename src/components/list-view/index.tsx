import {
  createContext,
  forwardRef,
  useContext,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';
import { Checkbox } from '@heroui/react';
import { ListLayout, Virtualizer } from '@heroui/react/rac';
import {
  GridList,
  GridListItem,
  type GridListProps,
  type GridListItemProps,
} from 'react-aria-components';
import clsx from 'clsx';

export type ListViewVariant = 'primary' | 'secondary';

export type ListViewProps<T extends object = object> = Omit<
  GridListProps<T>,
  'className' | 'style'
> & {
  /** 视觉变体：primary 灰底卡片包裹，secondary 透明分隔线（原站 API） */
  variant?: ListViewVariant;
  /** 大数据集行虚拟化（原站 API，基于 RAC Virtualizer + ListLayout） */
  virtualized?: boolean;
  /** 虚拟化估算行高 */
  rowHeight?: number;
  className?: string;
  style?: CSSProperties;
};

export type ListViewItemProps = Omit<GridListItemProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

type SectionProps = HTMLAttributes<HTMLDivElement>;
type TextProps = HTMLAttributes<HTMLSpanElement>;

/** Item 内自动渲染的选择 checkbox 需要感知列表变体（primary 用 secondary 色 checkbox） */
const ListViewVariantContext = createContext<ListViewVariant>('primary');

/**
 * 基于 RAC GridList 的交互列表：键盘导航、typeahead、单选/多选、禁用项均由 RAC 提供，
 * 选择启用（toggle 行为）时自动渲染 slot="selection" 的 OSS Checkbox，与原站行为一致。
 */
function ListViewRoot<T extends object>({
  variant = 'primary',
  virtualized = false,
  rowHeight = 48,
  className,
  ...rest
}: ListViewProps<T>) {
  const list = (
    <GridList
      data-slot="list-view"
      className={clsx('list-view', `list-view--${variant}`, className)}
      {...rest}
    />
  );

  return (
    <ListViewVariantContext.Provider value={variant}>
      {virtualized ? (
        <Virtualizer layout={ListLayout} layoutOptions={{ rowHeight }}>
          {list}
        </Virtualizer>
      ) : (
        list
      )}
    </ListViewVariantContext.Provider>
  );
}
ListViewRoot.displayName = 'ListView';

const Item = ({ className, children, ...rest }: ListViewItemProps) => {
  const variant = useContext(ListViewVariantContext);

  return (
    <GridListItem
      data-slot="list-view-item"
      className={clsx('list-view__item', className)}
      {...rest}
    >
      {(renderProps) => (
        <>
          {renderProps.selectionMode !== 'none' && renderProps.selectionBehavior === 'toggle' && (
            <div className="list-view__selection-cell" data-slot="list-view-selection-cell">
              <Checkbox slot="selection" variant={variant === 'primary' ? 'secondary' : undefined}>
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
              </Checkbox>
            </div>
          )}
          {typeof children === 'function' ? children(renderProps) : children}
        </>
      )}
    </GridListItem>
  );
};
Item.displayName = 'ListView.Item';

const SelectionCell = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    data-slot="list-view-selection-cell"
    className={clsx('list-view__selection-cell', className)}
    {...rest}
  />
));
SelectionCell.displayName = 'ListView.SelectionCell';

const ItemContent = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    data-slot="list-view-item-content"
    className={clsx('list-view__item-content', className)}
    {...rest}
  />
));
ItemContent.displayName = 'ListView.ItemContent';

const Title = forwardRef<HTMLSpanElement, TextProps>(({ className, ...rest }, ref) => (
  <span
    ref={ref}
    data-slot="list-view-title"
    className={clsx('list-view__title', className)}
    {...rest}
  />
));
Title.displayName = 'ListView.Title';

const Description = forwardRef<HTMLSpanElement, TextProps>(({ className, ...rest }, ref) => (
  <span
    ref={ref}
    data-slot="list-view-description"
    className={clsx('list-view__description', className)}
    {...rest}
  />
));
Description.displayName = 'ListView.Description';

const ItemAction = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    data-slot="list-view-item-action"
    className={clsx('list-view__item-action', className)}
    {...rest}
  />
));
ItemAction.displayName = 'ListView.ItemAction';

const ListViewEmptyState = forwardRef<HTMLDivElement, SectionProps>(
  ({ className, ...rest }, ref) => (
    <div
      ref={ref}
      data-slot="list-view-empty-state"
      className={clsx('list-view__empty-state', className)}
      {...rest}
    />
  ),
);
ListViewEmptyState.displayName = 'ListView.EmptyState';

const LoadMore = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    data-slot="list-view-load-more"
    className={clsx('list-view__load-more', className)}
    {...rest}
  />
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
