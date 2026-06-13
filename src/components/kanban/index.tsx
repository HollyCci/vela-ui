import {
  forwardRef,
  useCallback,
  useMemo,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { ScrollShadow } from '@heroui/react';
import {
  Button,
  DropIndicator,
  GridList,
  GridListItem,
  useDragAndDrop,
  useListData,
  type DropIndicatorProps,
  type GridListItemProps,
  type GridListProps,
  type Key,
  type ListData,
  type TextDropItem,
} from 'react-aria-components';
import clsx from 'clsx';

export type KanbanSize = 'sm' | 'md' | 'lg';

export type KanbanProps = Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'style'> & {
  /** 尺寸变体：控制列宽/列间距与卡片内边距字号（原站 API） */
  size?: KanbanSize;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

type SectionProps = HTMLAttributes<HTMLDivElement>;

export type KanbanColumnHeaderProps = HTMLAttributes<HTMLElement> & {
  title: ReactNode;
  /** 数量徽标文案 */
  count?: ReactNode;
  /** 列状态指示器颜色（CSS 颜色值或 var(--xxx)），省略且无 indicator 时渲染默认圆点 */
  indicatorColor?: string;
  /** 自定义指示器（如 icon），优先于 indicatorColor */
  indicator?: ReactNode;
  actions?: ReactNode;
};

export type KanbanCardListProps<T extends object = object> = Omit<
  GridListProps<T>,
  'className' | 'style'
> & {
  className?: string;
  style?: CSSProperties;
};

export type KanbanCardProps<T extends object = object> = Omit<
  GridListItemProps<T>,
  'className' | 'style'
> & {
  size?: KanbanSize;
  className?: string;
  style?: CSSProperties;
};

export type KanbanDropIndicatorProps = Omit<DropIndicatorProps, 'className' | 'style'> & {
  /** 占位高度（px），原站经 --kanban-drop-height 写入 */
  height?: number;
  className?: string;
  style?: CSSProperties;
};

const KanbanRoot = forwardRef<HTMLDivElement, KanbanProps>(
  ({ size = 'md', className, ...rest }, ref) => (
    <ScrollShadow
      ref={ref}
      orientation="horizontal"
      data-slot="kanban"
      className={clsx('kanban', `kanban--${size}`, className)}
      {...rest}
    />
  ),
);
KanbanRoot.displayName = 'Kanban';

const Column = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  ({ className, ...rest }, ref) => (
    <section ref={ref} data-slot="kanban-column" className={clsx('kanban__column', className)} {...rest} />
  ),
);
Column.displayName = 'Kanban.Column';

const ColumnHeader = forwardRef<HTMLElement, KanbanColumnHeaderProps>(
  ({ title, count, indicatorColor, indicator, actions, className, ...rest }, ref) => {
    const indicatorStyle: CSSProperties | undefined =
      indicatorColor !== undefined ? { backgroundColor: indicatorColor } : undefined;
    return (
      <header
        ref={ref}
        data-slot="kanban-column-header"
        className={clsx('kanban__column-header', className)}
        {...rest}
      >
        <span
          className="kanban__column-indicator"
          data-slot="kanban-column-indicator"
          style={indicatorStyle}
          aria-hidden="true"
        >
          {indicator}
        </span>
        <h3 className="kanban__column-title" data-slot="kanban-column-title">
          {title}
        </h3>
        {count !== undefined && (
          <span className="kanban__column-count" data-slot="kanban-column-count">
            {count}
          </span>
        )}
        {actions !== undefined && (
          <div className="kanban__column-actions" data-slot="kanban-column-actions">
            {actions}
          </div>
        )}
      </header>
    );
  },
);
ColumnHeader.displayName = 'Kanban.ColumnHeader';

const ColumnBody = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    data-slot="kanban-column-body"
    className={clsx('kanban__column-body', className)}
    {...rest}
  />
));
ColumnBody.displayName = 'Kanban.ColumnBody';

/** 列内卡片列表（RAC GridList）：键盘导航、选择、拖拽（dragAndDropHooks）均由 RAC 提供 */
function CardList<T extends object>({ className, ...rest }: KanbanCardListProps<T>) {
  return (
    <GridList
      data-slot="kanban-card-list"
      className={clsx('kanban__card-list', className)}
      {...rest}
    />
  );
}
CardList.displayName = 'Kanban.CardList';

/** 单张卡片（RAC GridListItem）：focus ring、拖拽 opacity、selected 态由 RAC data 属性驱动 */
function KanbanCard<T extends object>({ size = 'md', className, ...rest }: KanbanCardProps<T>) {
  return (
    <GridListItem
      data-slot="kanban-card"
      className={clsx('kanban__card', `kanban__card--${size}`, className)}
      {...rest}
    />
  );
}
KanbanCard.displayName = 'Kanban.Card';

/** 卡片内容包裹（原站 motion 容器位置），尺寸由 size 决定 */
export type KanbanCardContentProps = SectionProps & { size?: KanbanSize };

const CardContent = forwardRef<HTMLDivElement, KanbanCardContentProps>(
  ({ size = 'md', className, ...rest }, ref) => (
    <div
      ref={ref}
      data-slot="kanban-card-content"
      className={clsx('kanban__card-content', `kanban__card-content--${size}`, className)}
      {...rest}
    />
  ),
);
CardContent.displayName = 'Kanban.CardContent';

const GripVerticalIcon = () => (
  <svg
    aria-hidden="true"
    fill="none"
    height="16"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="9" cy="5" r="1" />
    <circle cx="9" cy="12" r="1" />
    <circle cx="9" cy="19" r="1" />
    <circle cx="15" cy="5" r="1" />
    <circle cx="15" cy="12" r="1" />
    <circle cx="15" cy="19" r="1" />
  </svg>
);
GripVerticalIcon.displayName = 'Kanban.GripVerticalIcon';

/** 拖拽手柄：slot="drag" 交给 RAC 做键盘可达拖拽；默认 sr-only，聚焦时显形 */
const DragHandle = forwardRef<HTMLButtonElement, Parameters<typeof Button>[0]>(
  ({ className, children, ...rest }, ref) => (
    <Button
      ref={ref}
      slot="drag"
      data-slot="kanban-drag-handle"
      className={clsx('kanban__drag-handle', className)}
      {...rest}
    >
      {children ?? <GripVerticalIcon />}
    </Button>
  ),
);
DragHandle.displayName = 'Kanban.DragHandle';

/** 拖拽落点指示线，height 经 --kanban-drop-height 控制占位高度（与原站一致） */
const KanbanDropIndicator = ({ height, className, style, ...rest }: KanbanDropIndicatorProps) => {
  const mergedStyle: CSSProperties | undefined =
    height !== undefined
      ? ({ ['--kanban-drop-height' as string]: `${height}px`, ...style } as CSSProperties)
      : style;
  return (
    <DropIndicator
      data-slot="kanban-drop-indicator"
      className={clsx('kanban__drop-indicator', className)}
      style={mergedStyle}
      {...rest}
    />
  );
};
KanbanDropIndicator.displayName = 'Kanban.DropIndicator';

const Empty = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} data-slot="kanban-empty" className={clsx('kanban__empty', className)} {...rest} />
));
Empty.displayName = 'Kanban.Empty';

const ScrollShadowWrapper = forwardRef<
  HTMLDivElement,
  Omit<Parameters<typeof ScrollShadow>[0], 'orientation'>
>(({ className, ...rest }, ref) => (
  <ScrollShadow
    ref={ref}
    orientation="vertical"
    data-slot="kanban-scroll-shadow"
    className={clsx('kanban__scroll-shadow', className)}
    {...rest}
  />
));
ScrollShadowWrapper.displayName = 'Kanban.ScrollShadow';

/* -------------------------------------------------------------------------------------------------
 * useKanban / useKanbanColumn —— 看板数据与拖拽 hooks（原站 API）
 * -----------------------------------------------------------------------------------------------*/

export type UseKanbanOptions<T> = {
  /** 初始全量卡片（原站 API） */
  initialItems: T[];
  /** 读取卡片所属列标识 */
  getColumn: (item: T) => string;
  /** 返回设到新列后的卡片副本 */
  setColumn: (item: T, column: string) => T;
  /** 跨列传递的拖拽类型 */
  dragType?: string;
  /** 卡片唯一 key，默认取 item.id */
  getKey?: (item: T) => Key;
};

export type UseKanbanReturn<T> = {
  /** 底层 RAC ListData，供高级操作 */
  list: ListData<T>;
  addItem: (item: T) => void;
  removeItem: (key: Key) => void;
  moveItem: (key: Key, toColumn: string) => void;
  updateItem: (key: Key, item: T) => void;
  getColumn: (item: T) => string;
  setColumn: (item: T, column: string) => T;
  dragType: string;
};

/** 管理整个看板的共享列表数据（原站 API） */
export function useKanban<T extends object>({
  initialItems,
  getColumn,
  setColumn,
  dragType = 'kanban-item-id',
  getKey,
}: UseKanbanOptions<T>): UseKanbanReturn<T> {
  const keyOf = useCallback(
    (item: T): Key => (getKey ? getKey(item) : (item as { id: Key }).id),
    [getKey],
  );

  const list = useListData<T>({
    initialItems,
    getKey: keyOf,
  });

  const moveItem = useCallback(
    (key: Key, toColumn: string) => {
      const item = list.getItem(key);
      if (item) {
        list.update(key, setColumn(item, toColumn));
      }
    },
    [list, setColumn],
  );

  const addItem = useCallback((item: T) => list.append(item), [list]);
  const removeItem = useCallback((key: Key) => list.remove(key), [list]);
  const updateItem = useCallback((key: Key, item: T) => list.update(key, item), [list]);

  return useMemo(
    () => ({
      list,
      addItem,
      removeItem,
      moveItem,
      updateItem,
      getColumn,
      setColumn,
      dragType,
    }),
    [list, addItem, removeItem, moveItem, updateItem, getColumn, setColumn, dragType],
  );
}

export type UseKanbanColumnReturn<T> = {
  /** 过滤到本列的卡片 */
  items: T[];
  /** 传给 Kanban.CardList 的 dragAndDropHooks */
  dragAndDropHooks: ReturnType<typeof useDragAndDrop>['dragAndDropHooks'];
};

/** 为单列提供过滤后的卡片与拖拽 hooks：列内排序 + 跨列投放（原站 API） */
export function useKanbanColumn<T extends object>(
  kanban: UseKanbanReturn<T>,
  column: string,
): UseKanbanColumnReturn<T> {
  const { list, getColumn, dragType } = kanban;

  const items = useMemo(
    () => list.items.filter((item) => getColumn(item) === column),
    [list.items, getColumn, column],
  );

  // 读取被拖卡片的 key：getItems 把每个 key 序列化进自定义 dragType
  const readKeys = useCallback(
    async (dropItems: readonly TextDropItem[]): Promise<Key[]> => {
      const texts = await Promise.all(
        dropItems
          .filter((item) => item.kind === 'text' && item.types.has(dragType))
          .map((item) => item.getText(dragType)),
      );
      return texts.filter((text): text is string => text.length > 0);
    },
    [dragType],
  );

  const { dragAndDropHooks } = useDragAndDrop({
    getItems: (keys) =>
      [...keys].map((key) => ({
        [dragType]: String(key),
        'text/plain': String(key),
      })),
    acceptedDragTypes: [dragType],
    // 同列重排：直接按落点位置移动
    onReorder: (event) => {
      if (event.target.dropPosition === 'before') {
        list.moveBefore(event.target.key, event.keys);
      } else if (event.target.dropPosition === 'after') {
        list.moveAfter(event.target.key, event.keys);
      }
    },
    // 跨列插入到两卡片之间：先改列归属，再移动到目标位置
    onInsert: async (event) => {
      const keys = await readKeys(event.items as TextDropItem[]);
      for (const key of keys) {
        kanban.moveItem(key, column);
      }
      if (event.target.dropPosition === 'before') {
        list.moveBefore(event.target.key, keys);
      } else if (event.target.dropPosition === 'after') {
        list.moveAfter(event.target.key, keys);
      }
    },
    // 投放到某卡片上：归入该卡片所在列并排到其后
    onItemDrop: async (event) => {
      const keys = await readKeys(event.items as TextDropItem[]);
      for (const key of keys) {
        kanban.moveItem(key, column);
      }
      list.moveAfter(event.target.key, keys);
    },
    // 投放到空列：仅改列归属
    onRootDrop: async (event) => {
      const keys = await readKeys(event.items as TextDropItem[]);
      for (const key of keys) {
        kanban.moveItem(key, column);
      }
    },
  });

  return { items, dragAndDropHooks };
}

const Kanban = Object.assign(KanbanRoot, {
  Column,
  ColumnHeader,
  ColumnBody,
  CardList,
  Card: KanbanCard,
  CardContent,
  DragHandle,
  DropIndicator: KanbanDropIndicator,
  Empty,
  ScrollShadow: ScrollShadowWrapper,
});

export default Kanban;
