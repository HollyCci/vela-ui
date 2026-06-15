'use client';

import {
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { ScrollShadow } from '@heroui/react';
import { Button } from 'react-aria-components';
import {
  Reorder,
  useDragControls,
  type DragControls,
  type PanInfo,
} from 'motion/react';
import clsx from 'clsx';

export type KanbanSize = 'sm' | 'md' | 'lg';

export type Key = string | number;

export type KanbanProps = Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'style'> & {
  /** 尺寸变体：控制列宽/列间距与卡片内边距字号（参考 API） */
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

/**
 * 列内卡片列表（Motion Reorder.Group）。沿用 RAC GridList 的渲染契约：
 * 传 items（本列卡片）与 children 渲染函数，列表内部遍历 items 调用 children(item)。
 * dragAndDropHooks 改由 useKanbanColumn 返回 Reorder 适配器（值/重排/跨列命中）。
 */
export type KanbanCardListProps<T extends object = object> = Omit<
  HTMLAttributes<HTMLDivElement>,
  'className' | 'style' | 'children' | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'
> & {
  'aria-label'?: string;
  /** 本列卡片（已按列过滤） */
  items?: Iterable<T>;
  /** 渲染单张卡片的函数（与 RAC GridList children 渲染函数一致） */
  children?: (item: T) => ReactNode;
  /** useKanbanColumn 返回的 Reorder 适配器，驱动列内重排与跨列命中 */
  dragAndDropHooks?: KanbanColumnDnd<T>;
  /** 列表为空时渲染（与 RAC renderEmptyState 一致） */
  renderEmptyState?: () => ReactNode;
  className?: string;
  style?: CSSProperties;
};

export type KanbanCardProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'className' | 'style' | 'id' | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'
> & {
  /** 卡片唯一标识；列表用它从 context 取回对应卡片对象作为 Reorder 值 */
  id: Key;
  /** 无障碍文本（沿用 RAC GridListItem 的 textValue 命名） */
  textValue?: string;
  size?: KanbanSize;
  className?: string;
  style?: CSSProperties;
};

export type KanbanDropIndicatorProps = Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'style'> & {
  /** 占位高度（px），参考实现经 --kanban-drop-height 写入 */
  height?: number;
  className?: string;
  style?: CSSProperties;
};

const KanbanSizeContext = createContext<KanbanSize>('md');

const KanbanRoot = forwardRef<HTMLDivElement, KanbanProps>(
  ({ size = 'md', className, children, ...rest }, ref) => (
    <KanbanSizeContext.Provider value={size}>
      <ScrollShadow
        ref={ref}
        orientation="horizontal"
        data-slot="kanban"
        className={clsx('kanban', `kanban--${size}`, className)}
        {...rest}
      >
        {children}
      </ScrollShadow>
    </KanbanSizeContext.Provider>
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

/* -------------------------------------------------------------------------------------------------
 * Card context —— Reorder.Group 把本列的卡片对象/适配器/列标识下传，
 * 让 Kanban.Card 仅凭 id 即可取回自身对应的 Reorder 值（value）与拖拽控制器。
 * -----------------------------------------------------------------------------------------------*/

type CardListContextValue<T extends object> = {
  /** id -> 卡片对象，供 Card 取回自身 Reorder 值 */
  itemMap: Map<Key, T>;
  dnd?: KanbanColumnDnd<T>;
  size: KanbanSize;
  /** 该列容器（用于跨列拖拽命中检测的兜底，不强制） */
  listRef: React.RefObject<HTMLDivElement | null>;
};

const CardListContext = createContext<CardListContextValue<object> | null>(null);

function useCardListContext<T extends object>(): CardListContextValue<T> | null {
  return useContext(CardListContext) as CardListContextValue<T> | null;
}

/**
 * 列内卡片列表：内层用 Motion Reorder.Group（as="div"，axis=y）真正承载重排。
 * onReorder 由 dragAndDropHooks（useKanbanColumn 适配器）提供：写回新顺序即触发
 * Reorder 自带的 FLIP 平滑过渡（其他卡片逐帧位移归位，非瞬移）。
 * 渲染契约与原 RAC GridList 保持一致：items + children(item) + renderEmptyState。
 */
function CardListImpl<T extends object>({
  items,
  children,
  dragAndDropHooks,
  renderEmptyState,
  className,
  'aria-label': ariaLabel,
  ...rest
}: KanbanCardListProps<T>) {
  const size = useContext(KanbanSizeContext);
  const listRef = useRef<HTMLDivElement | null>(null);

  const itemArray = useMemo<T[]>(() => (items ? Array.from(items) : []), [items]);

  const keyOf = dragAndDropHooks?.getKey;
  const itemMap = useMemo(() => {
    const map = new Map<Key, T>();
    for (const item of itemArray) {
      const key = keyOf ? keyOf(item) : (item as { id: Key }).id;
      map.set(key, item);
    }
    return map;
  }, [itemArray, keyOf]);

  const contextValue = useMemo<CardListContextValue<T>>(
    () => ({ itemMap, dnd: dragAndDropHooks, size, listRef }),
    [itemMap, dragAndDropHooks, size],
  );

  const isEmpty = itemArray.length === 0;
  const isDraggable = dragAndDropHooks !== undefined;

  const handleReorder = useCallback(
    (next: T[]) => {
      dragAndDropHooks?.onReorder?.(next);
    },
    [dragAndDropHooks],
  );

  const renderKey = useCallback(
    (item: T): Key => (keyOf ? keyOf(item) : (item as { id: Key }).id),
    [keyOf],
  );

  const body = isEmpty
    ? renderEmptyState?.()
    : itemArray.map((item) => {
        const child = children?.(item);
        if (!isValidElement(child)) {
          return child ?? null;
        }
        return cloneElement(child, { key: renderKey(item) });
      });

  const listProps = {
    ref: listRef,
    'data-slot': 'kanban-card-list',
    'data-empty': isEmpty ? 'true' : undefined,
    'data-kanban-column': dragAndDropHooks?.column,
    'aria-label': ariaLabel,
    role: 'list' as const,
    className: clsx('kanban__card-list', `kanban__card-list--${size}`, className),
    ...rest,
  };

  return (
    <CardListContext.Provider value={contextValue as unknown as CardListContextValue<object>}>
      {isDraggable ? (
        <Reorder.Group as="div" axis="y" values={itemArray} onReorder={handleReorder} {...listProps}>
          {body}
        </Reorder.Group>
      ) : (
        <div {...listProps}>{body}</div>
      )}
    </CardListContext.Provider>
  );
}
CardListImpl.displayName = 'Kanban.CardList';

const CardList = CardListImpl as typeof CardListImpl & { displayName?: string };

/* -------------------------------------------------------------------------------------------------
 * Card —— Reorder.Item（motion.div）。仅凭 id 从 CardListContext 取回自身 Reorder 值，
 * 由手柄（或整卡）经 dragControls 启动拖拽。拖拽结束做跨列命中检测。
 * -----------------------------------------------------------------------------------------------*/

type CardContextValue = {
  dragControls: DragControls | null;
  isDragging: boolean;
};

const CardContext = createContext<CardContextValue>({ dragControls: null, isDragging: false });

const CARD_DRAGGING = { boxShadow: '0 8px 24px -6px rgba(0,0,0,0.18)', zIndex: 1 } as const;
const CARD_TRANSITION = { type: 'spring', stiffness: 600, damping: 42 } as const;

function KanbanCardImpl<T extends object>({
  id,
  textValue,
  size,
  className,
  children,
  ...rest
}: KanbanCardProps) {
  const ctx = useCardListContext<T>();
  const dragControls = useDragControls();
  const [isDragging, setDragging] = useState(false);

  const value = ctx?.itemMap.get(id);
  const resolvedSize = size ?? ctx?.size ?? 'md';
  const dnd = ctx?.dnd;

  const handleDragStart = useCallback(() => {
    setDragging(true);
  }, []);

  const handleDragEnd = useCallback(
    (event: PointerEvent, info: PanInfo) => {
      setDragging(false);
      if (value !== undefined) {
        dnd?.onDragEnd?.(value, info, event);
      }
    },
    [dnd, value],
  );

  // 没有拖拽适配器时退化为真实静态列表，避免出现拖动但不写回的伪交互。
  if (ctx === null || value === undefined || dnd === undefined) {
    return (
      <div
        data-slot="kanban-card"
        data-key={id}
        aria-label={textValue}
        className={clsx('kanban__card', `kanban__card--${resolvedSize}`, className)}
        {...rest}
      >
        {children}
      </div>
    );
  }

  const cardContext: CardContextValue = { dragControls, isDragging };

  return (
    <CardContext.Provider value={cardContext}>
      <Reorder.Item
        as="div"
        value={value}
        data-slot="kanban-card"
        data-key={id}
        data-dragging={isDragging ? 'true' : undefined}
        aria-label={textValue}
        className={clsx('kanban__card', `kanban__card--${resolvedSize}`, className)}
        dragControls={dragControls}
        dragListener={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        whileDrag={CARD_DRAGGING}
        transition={CARD_TRANSITION}
        {...rest}
      >
        <div style={{ display: 'contents' }}>
          {children}
        </div>
      </Reorder.Item>
    </CardContext.Provider>
  );
}
KanbanCardImpl.displayName = 'Kanban.Card';

const KanbanCard = KanbanCardImpl as typeof KanbanCardImpl & { displayName?: string };

/** 卡片内容包裹（参考实现 motion 容器位置），尺寸由 size 决定 */
export type KanbanCardContentProps = SectionProps & { size?: KanbanSize };

const CardContent = forwardRef<HTMLDivElement, KanbanCardContentProps>(
  ({ size, className, ...rest }, ref) => {
    const ctxSize = useContext(KanbanSizeContext);
    const resolvedSize = size ?? ctxSize ?? 'md';
    return (
      <div
        ref={ref}
        data-slot="kanban-card-content"
        className={clsx('kanban__card-content', `kanban__card-content--${resolvedSize}`, className)}
        {...rest}
      />
    );
  },
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

/**
 * 拖拽手柄：按下经本卡 dragControls.start() 启动 Motion 拖拽
 * （Reorder.Item dragListener=false 时的唯一拖拽入口）；默认 sr-only，聚焦时显形（CSS 控制）。
 */
const DragHandle = forwardRef<HTMLButtonElement, Parameters<typeof Button>[0]>(
  ({ className, children, onPointerDown, ...rest }, ref) => {
    const { dragControls } = useContext(CardContext);

    const handlePointerDown = useCallback(
      (event: ReactPointerEvent<HTMLButtonElement>) => {
        onPointerDown?.(event);
        if (dragControls === null) {
          return;
        }
        // 把这次手势交给 Motion 拖拽，避免文本选区/滚动抢占
        event.preventDefault();
        dragControls.start(event);
      },
      [onPointerDown, dragControls],
    );

    return (
      <Button
        ref={ref}
        slot="drag"
        data-slot="kanban-drag-handle"
        className={clsx('kanban__drag-handle', className)}
        onPointerDown={handlePointerDown}
        {...rest}
      >
        {children ?? <GripVerticalIcon />}
      </Button>
    );
  },
);
DragHandle.displayName = 'Kanban.DragHandle';

/** 拖拽落点指示线，height 经 --kanban-drop-height 控制占位高度（与参考实现一致） */
const KanbanDropIndicator = ({ height, className, style, ...rest }: KanbanDropIndicatorProps) => {
  const mergedStyle: CSSProperties | undefined =
    height !== undefined
      ? ({ ['--kanban-drop-height' as string]: `${height}px`, ...style } as CSSProperties)
      : style;
  return (
    <div
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
 * useKanban / useKanbanColumn —— 看板数据与拖拽 hooks（参考 API，签名保持）
 * 数据层改为内部 useState 维护全量卡片（不再依赖 RAC useListData），但对外暴露
 * 与原先一致的 list/moveItem/...，保证 demo 读 kanban.list.items 等用法不变。
 * -----------------------------------------------------------------------------------------------*/

export type KanbanListData<T> = {
  items: T[];
  getItem: (key: Key) => T | undefined;
  append: (item: T) => void;
  remove: (key: Key) => void;
  update: (key: Key, item: T) => void;
  /** 按 keys 重排：把这些卡片移动到 targetKey 之前 */
  moveBefore: (targetKey: Key, keys: Iterable<Key>) => void;
  /** 按 keys 重排：把这些卡片移动到 targetKey 之后 */
  moveAfter: (targetKey: Key, keys: Iterable<Key>) => void;
  /** 用一列内的新顺序整体替换该列卡片在全量数组中的相对次序 */
  reorderColumn: (column: string, orderedKeys: Key[]) => void;
};

export type UseKanbanOptions<T> = {
  /** 初始全量卡片（参考 API） */
  initialItems: T[];
  /** 读取卡片所属列标识 */
  getColumn: (item: T) => string;
  /** 返回设到新列后的卡片副本 */
  setColumn: (item: T, column: string) => T;
  /** 跨列传递的拖拽类型（保留以兼容签名） */
  dragType?: string;
  /** 卡片唯一 key，默认取 item.id */
  getKey?: (item: T) => Key;
};

export type UseKanbanReturn<T> = {
  /** 全量卡片数据访问层（对外形态与原 RAC ListData 子集一致） */
  list: KanbanListData<T>;
  addItem: (item: T) => void;
  removeItem: (key: Key) => void;
  moveItem: (key: Key, toColumn: string) => void;
  updateItem: (key: Key, item: T) => void;
  getColumn: (item: T) => string;
  setColumn: (item: T, column: string) => T;
  getKey: (item: T) => Key;
  dragType: string;
};

/** 管理整个看板的共享列表数据（参考 API） */
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

  const [items, setItems] = useState<T[]>(initialItems);

  const getItem = useCallback(
    (key: Key) => items.find((item) => keyOf(item) === key),
    [items, keyOf],
  );

  const append = useCallback((item: T) => setItems((prev) => [...prev, item]), []);

  const remove = useCallback(
    (key: Key) => setItems((prev) => prev.filter((item) => keyOf(item) !== key)),
    [keyOf],
  );

  const update = useCallback(
    (key: Key, next: T) =>
      setItems((prev) => prev.map((item) => (keyOf(item) === key ? next : item))),
    [keyOf],
  );

  const moveRelative = useCallback(
    (targetKey: Key, keys: Iterable<Key>, after: boolean) => {
      const moving = new Set<Key>([...keys]);
      setItems((prev) => {
        const movedItems = prev.filter((item) => moving.has(keyOf(item)));
        if (movedItems.length === 0) {
          return prev;
        }
        const rest = prev.filter((item) => !moving.has(keyOf(item)));
        const targetIndex = rest.findIndex((item) => keyOf(item) === targetKey);
        if (targetIndex === -1) {
          return prev;
        }
        const insertAt = after ? targetIndex + 1 : targetIndex;
        return [...rest.slice(0, insertAt), ...movedItems, ...rest.slice(insertAt)];
      });
    },
    [keyOf],
  );

  const moveBefore = useCallback(
    (targetKey: Key, keys: Iterable<Key>) => moveRelative(targetKey, keys, false),
    [moveRelative],
  );
  const moveAfter = useCallback(
    (targetKey: Key, keys: Iterable<Key>) => moveRelative(targetKey, keys, true),
    [moveRelative],
  );

  // 用某列内的新 key 顺序，整体替换该列在全量数组里占据的那些“槽位”的次序
  const reorderColumn = useCallback(
    (column: string, orderedKeys: Key[]) => {
      setItems((prev) => {
        const byKey = new Map<Key, T>();
        for (const item of prev) {
          byKey.set(keyOf(item), item);
        }
        const ordered = orderedKeys
          .map((key) => byKey.get(key))
          .filter((item): item is T => item !== undefined);
        let cursor = 0;
        return prev.map((item) => {
          if (getColumn(item) === column) {
            const replacement = ordered[cursor];
            cursor += 1;
            return replacement ?? item;
          }
          return item;
        });
      });
    },
    [keyOf, getColumn],
  );

  const list = useMemo<KanbanListData<T>>(
    () => ({ items, getItem, append, remove, update, moveBefore, moveAfter, reorderColumn }),
    [items, getItem, append, remove, update, moveBefore, moveAfter, reorderColumn],
  );

  const moveItem = useCallback(
    (key: Key, toColumn: string) => {
      const item = getItem(key);
      if (item) {
        update(key, setColumn(item, toColumn));
      }
    },
    [getItem, update, setColumn],
  );

  const addItem = useCallback((item: T) => append(item), [append]);
  const removeItem = useCallback((key: Key) => remove(key), [remove]);
  const updateItem = useCallback((key: Key, item: T) => update(key, item), [update]);

  return useMemo(
    () => ({
      list,
      addItem,
      removeItem,
      moveItem,
      updateItem,
      getColumn,
      setColumn,
      getKey: keyOf,
      dragType,
    }),
    [list, addItem, removeItem, moveItem, updateItem, getColumn, setColumn, keyOf, dragType],
  );
}

/**
 * useKanbanColumn 返回的 Reorder 适配器（仍叫 dragAndDropHooks 以保 demo 签名不变）。
 * - getKey：把卡片对象映射回唯一 key
 * - onReorder：列内拖拽后 Reorder 回调新顺序，写回 list（触发 FLIP）
 * - onDragEnd：跨列命中检测，命中目标列则改卡片 status
 */
export type KanbanColumnDnd<T> = {
  /** 本列标识，用于在卡片列表 DOM 上打标，供跨列命中检测识别目标列 */
  column: string;
  getKey: (item: T) => Key;
  onReorder: (nextOrder: T[]) => void;
  onDragEnd: (item: T, info: PanInfo, event: PointerEvent) => void;
};

export type UseKanbanColumnReturn<T> = {
  /** 过滤到本列的卡片 */
  items: T[];
  /** 传给 Kanban.CardList 的 Reorder 适配器（沿用 dragAndDropHooks 名） */
  dragAndDropHooks: KanbanColumnDnd<T>;
};

/** 为单列提供过滤后的卡片与 Reorder 适配器：列内重排 + 跨列投放（参考 API 签名保持） */
export function useKanbanColumn<T extends object>(
  kanban: UseKanbanReturn<T>,
  column: string,
): UseKanbanColumnReturn<T> {
  const { list, getColumn, getKey } = kanban;

  const items = useMemo(
    () => list.items.filter((item) => getColumn(item) === column),
    [list.items, getColumn, column],
  );

  const onReorder = useCallback(
    (nextOrder: T[]) => {
      list.reorderColumn(column, nextOrder.map(getKey));
    },
    [list, column, getKey],
  );

  // 跨列命中：拖拽结束时按指针落点找命中的列容器（data-slot=kanban-column），
  // 命中且非本列则把卡片 status 改到该列；列内位置由 onReorder 已实时维护。
  const onDragEnd = useCallback(
    (item: T, info: PanInfo, event: PointerEvent) => {
      const point = info.point;
      // info.point 为 page 坐标（含文档滚动），getBoundingClientRect 为 viewport 坐标，
      // 命中前先把 page 坐标转 viewport（减去 window.scrollX/scrollY）；fallback 同用 pageX/pageY 保持坐标系一致。
      const x = (point?.x ?? event.pageX) - window.scrollX;
      const y = (point?.y ?? event.pageY) - window.scrollY;
      // 命中检测优先用每列卡片列表的几何范围（即便落点落在两卡片间隙也能命中），
      // 退化时再用 elementsFromPoint 沿堆叠链找列表元素。
      const lists = Array.from(
        document.querySelectorAll<HTMLElement>('[data-slot="kanban-card-list"][data-kanban-column]'),
      );
      let targetColumn: string | undefined;
      for (const listEl of lists) {
        const rect = listEl.getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
          targetColumn = listEl.dataset.kanbanColumn;
          break;
        }
      }
      if (targetColumn === undefined) {
        const hit = document
          .elementsFromPoint(x, y)
          .map((el) => (el as HTMLElement).closest?.('[data-slot="kanban-card-list"][data-kanban-column]'))
          .find((el): el is HTMLElement => el != null) as HTMLElement | null;
        targetColumn = hit?.dataset.kanbanColumn;
      }
      if (targetColumn && targetColumn !== column) {
        kanban.moveItem(getKey(item), targetColumn);
      }
    },
    [kanban, column, getKey],
  );

  return useMemo(
    () => ({ items, dragAndDropHooks: { column, getKey, onReorder, onDragEnd } }),
    [items, column, getKey, onReorder, onDragEnd],
  );
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
