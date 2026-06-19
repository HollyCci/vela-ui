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
  title?: ReactNode;
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
  /** 允许整张卡片直接拖拽；DragHandle 仍可作为显式拖拽入口 */
  dragListener?: boolean;
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

export type KanbanColumnIndicatorProps = HTMLAttributes<HTMLSpanElement> & {
  color?: string;
};

const ColumnIndicator = forwardRef<HTMLSpanElement, KanbanColumnIndicatorProps>(
  ({ color, className, style, ...rest }, ref) => {
    const mergedStyle =
      color !== undefined ? ({ backgroundColor: color, ...style } as CSSProperties) : style;
    return (
      <span
        ref={ref}
        className={clsx('kanban__column-indicator', className)}
        data-slot="kanban-column-indicator"
        style={mergedStyle}
        aria-hidden="true"
        {...rest}
      />
    );
  },
);
ColumnIndicator.displayName = 'Kanban.ColumnIndicator';

const ColumnTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...rest }, ref) => (
    <h3
      ref={ref}
      className={clsx('kanban__column-title', className)}
      data-slot="kanban-column-title"
      {...rest}
    />
  ),
);
ColumnTitle.displayName = 'Kanban.ColumnTitle';

const ColumnCount = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...rest }, ref) => (
    <span
      ref={ref}
      className={clsx('kanban__column-count', className)}
      data-slot="kanban-column-count"
      {...rest}
    />
  ),
);
ColumnCount.displayName = 'Kanban.ColumnCount';

const ColumnActions = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...rest }, ref) => (
    <div
      ref={ref}
      className={clsx('kanban__column-actions', className)}
      data-slot="kanban-column-actions"
      {...rest}
    />
  ),
);
ColumnActions.displayName = 'Kanban.ColumnActions';

const ColumnHeader = forwardRef<HTMLElement, KanbanColumnHeaderProps>(
  ({ title, count, indicatorColor, indicator, actions, children, className, ...rest }, ref) => {
    return (
      <header
        ref={ref}
        data-slot="kanban-column-header"
        className={clsx('kanban__column-header', className)}
        {...rest}
      >
        {children ?? (
          <>
            <ColumnIndicator color={indicatorColor}>{indicator}</ColumnIndicator>
            {title !== undefined && <ColumnTitle>{title}</ColumnTitle>}
            {count !== undefined && <ColumnCount>{count}</ColumnCount>}
            {actions !== undefined && <ColumnActions>{actions}</ColumnActions>}
          </>
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
    role: 'group' as const,
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
  /** 键盘排序：抓取后方向键移动一格，返回是否真正发生移动（无 dnd 适配器时为 null） */
  onKeyboardMove: ((direction: KanbanKeyboardDirection) => boolean) | null;
};

const CardContext = createContext<CardContextValue>({
  dragControls: null,
  isDragging: false,
  onKeyboardMove: null,
});

const CARD_DRAGGING = { boxShadow: '0 8px 24px -6px rgba(0,0,0,0.18)', zIndex: 1 } as const;
const CARD_TRANSITION = { type: 'spring', stiffness: 600, damping: 42 } as const;

function KanbanCardImpl<T extends object>({
  id,
  textValue,
  size,
  dragListener = true,
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

  const handleKeyboardMove = useCallback(
    (direction: KanbanKeyboardDirection): boolean =>
      value !== undefined ? (dnd?.onKeyboardMove?.(value, direction) ?? false) : false,
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

  const cardContext: CardContextValue = {
    dragControls,
    isDragging,
    onKeyboardMove: handleKeyboardMove,
  };

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
        dragListener={dragListener}
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

export type KanbanCardActionsProps = SectionProps;

const CardActions = forwardRef<HTMLDivElement, KanbanCardActionsProps>(
  ({ className, ...rest }, ref) => (
    <div
      ref={ref}
      data-slot="kanban-card-actions"
      className={clsx('kanban__card-actions', className)}
      {...rest}
    />
  ),
);
CardActions.displayName = 'Kanban.CardActions';

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

const KEYBOARD_DIRECTIONS: Record<string, KanbanKeyboardDirection> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

/**
 * 拖拽手柄：
 * - 指针：按下经本卡 dragControls.start() 启动 Motion 拖拽（Reorder.Item dragListener=false 时的唯一入口）；
 * - 键盘：Space/Enter 抓取，方向键移动一格（复用 onKeyboardMove），Esc/再次 Space/Enter 落下。
 * 默认 sr-only，聚焦时显形（CSS 控制）。
 *
 * 注意：手柄渲染为 react-aria-components 的 Button，其 filterDOMProps 仅透传 data-* 与全局事件，
 * 会吞掉自定义 onKeyDown 与 aria-roledescription（已核对 RAC 源码）。因此键盘逻辑与
 * aria-roledescription/抓取态都挂在外层 wrapper（display:contents 不影响布局与既有
 * 后代选择器），按键在 capture 阶段拦截并 stopPropagation，避免被 Button 内部 usePress 当作点击。
 */
const DragHandle = forwardRef<HTMLButtonElement, Parameters<typeof Button>[0]>(
  ({ className, children, onPointerDown, ...rest }, ref) => {
    const { dragControls, onKeyboardMove } = useContext(CardContext);
    const [isGrabbed, setGrabbed] = useState(false);
    const [announcement, setAnnouncement] = useState('');

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

    // 键盘可达性：无 dnd 适配器（静态列表）时不接管按键，回退到 Button 默认行为。
    const keyboardEnabled = onKeyboardMove !== null;

    const handleKeyDownCapture = useCallback(
      (event: React.KeyboardEvent<HTMLSpanElement>) => {
        if (!keyboardEnabled) {
          return;
        }
        const { key } = event;
        if (key === ' ' || key === 'Enter') {
          // 抓取 / 落下，拦住 Button 内部 usePress 把它当点击
          event.preventDefault();
          event.stopPropagation();
          setGrabbed((grabbed) => {
            setAnnouncement(grabbed ? '已放下，拖拽结束' : '已抓取，使用方向键移动，按 Esc 取消');
            return !grabbed;
          });
          return;
        }
        if (key === 'Escape' && isGrabbed) {
          event.preventDefault();
          event.stopPropagation();
          setGrabbed(false);
          setAnnouncement('已取消拖拽');
          return;
        }
        const direction = KEYBOARD_DIRECTIONS[key];
        if (direction && isGrabbed) {
          // 抓取态下方向键移动一格；阻止页面滚动并避免冒泡到 Button
          event.preventDefault();
          event.stopPropagation();
          const moved = onKeyboardMove?.(direction) ?? false;
          setAnnouncement(moved ? '已移动卡片' : '已到边界，无法继续移动');
        }
      },
      [keyboardEnabled, isGrabbed, onKeyboardMove],
    );

    const handleBlur = useCallback(() => {
      // 焦点离开手柄时自动落下，避免遗留抓取态
      setGrabbed(false);
    }, []);

    return (
      <span
        style={{ display: 'contents' }}
        aria-roledescription={keyboardEnabled ? 'sortable' : undefined}
        onKeyDownCapture={handleKeyDownCapture}
        onBlur={handleBlur}
      >
        <Button
          ref={ref}
          slot="drag"
          data-slot="kanban-drag-handle"
          data-kanban-grabbed={isGrabbed ? 'true' : undefined}
          className={clsx('kanban__drag-handle', className)}
          onPointerDown={handlePointerDown}
          {...rest}
        >
          {children ?? <GripVerticalIcon />}
        </Button>
        {keyboardEnabled && (
          <span
            data-slot="kanban-drag-live"
            role="status"
            aria-live="assertive"
            aria-atomic="true"
            style={{
              position: 'absolute',
              width: 1,
              height: 1,
              margin: -1,
              padding: 0,
              border: 0,
              clip: 'rect(0 0 0 0)',
              clipPath: 'inset(50%)',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            {announcement}
          </span>
        )}
      </span>
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

/** 键盘拖拽方向：上下为列内移位，左右为跨列移动（参考 RAC 排序网格的方向语义） */
export type KanbanKeyboardDirection = 'up' | 'down' | 'left' | 'right';

/**
 * useKanbanColumn 返回的 Reorder 适配器（仍叫 dragAndDropHooks 以保 demo 签名不变）。
 * - getKey：把卡片对象映射回唯一 key
 * - onReorder：列内拖拽后 Reorder 回调新顺序，写回 list（触发 FLIP）
 * - onDragEnd：跨列命中检测 + 落点定位，命中目标列则改卡片 status 并精确插入
 * - onKeyboardMove：键盘排序（抓取后方向键移位），复用 list/moveItem 写回，返回播报文案
 */
export type KanbanColumnDnd<T> = {
  /** 本列标识，用于在卡片列表 DOM 上打标，供跨列命中检测识别目标列 */
  column: string;
  getKey: (item: T) => Key;
  onReorder: (nextOrder: T[]) => void;
  onDragEnd: (item: T, info: PanInfo, event: PointerEvent) => void;
  /** 键盘移动一格；返回是否真正发生移动（供调用方决定是否播报） */
  onKeyboardMove: (item: T, direction: KanbanKeyboardDirection) => boolean;
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

  // 键盘排序：抓取卡片后方向键移动一格。
  // - up/down：在本列内与相邻卡片交换位置（list.moveBefore / moveAfter）；
  // - left/right：跨到相邻列（列顺序按 DOM 中 data-kanban-column 列表的渲染次序），
  //   跨列时落到目标列列尾（无指针落点可参照，列尾为确定性结果）。
  // 返回是否真正发生移动，便于上层据此播报；不改 hook 签名，列顺序从 DOM 读取。
  const onKeyboardMove = useCallback(
    (item: T, direction: KanbanKeyboardDirection): boolean => {
      const movingKey = getKey(item);
      const columnItems = list.items.filter((it) => getColumn(it) === column);
      const index = columnItems.findIndex((it) => getKey(it) === movingKey);
      if (index === -1) {
        return false;
      }

      if (direction === 'up' || direction === 'down') {
        if (direction === 'up') {
          if (index === 0) {
            return false;
          }
          list.moveBefore(getKey(columnItems[index - 1]), [movingKey]);
        } else {
          if (index >= columnItems.length - 1) {
            return false;
          }
          list.moveAfter(getKey(columnItems[index + 1]), [movingKey]);
        }
        return true;
      }

      // 跨列：按 DOM 渲染次序取相邻列标识
      const columnOrder = Array.from(
        document.querySelectorAll<HTMLElement>('[data-slot="kanban-card-list"][data-kanban-column]'),
      )
        .map((el) => el.dataset.kanbanColumn)
        .filter((id): id is string => id !== undefined);
      const colIndex = columnOrder.indexOf(column);
      if (colIndex === -1) {
        return false;
      }
      const targetColumn =
        direction === 'left' ? columnOrder[colIndex - 1] : columnOrder[colIndex + 1];
      if (targetColumn === undefined) {
        return false;
      }
      kanban.moveItem(movingKey, targetColumn);
      const targetTail = list.items.filter(
        (it) => getColumn(it) === targetColumn && getKey(it) !== movingKey,
      );
      const lastItem = targetTail[targetTail.length - 1];
      if (lastItem) {
        list.moveAfter(getKey(lastItem), [movingKey]);
      }
      return true;
    },
    [kanban, list, column, getColumn, getKey],
  );

  // 跨列命中：拖拽结束时按指针落点找命中的列容器（data-slot=kanban-column），
  // 命中且非本列则把卡片 status 改到该列。跨列后再按落点 Y 命中目标列卡片的几何
  // 中线算出插入位置，把卡片精确落到该位置（而非一律落到列尾）；列内同列位置仍由
  // onReorder 实时维护。
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
      let targetListEl: HTMLElement | undefined;
      for (const listEl of lists) {
        const rect = listEl.getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
          targetListEl = listEl;
          break;
        }
      }
      if (targetListEl === undefined) {
        targetListEl =
          (document
            .elementsFromPoint(x, y)
            .map((el) => (el as HTMLElement).closest?.('[data-slot="kanban-card-list"][data-kanban-column]'))
            .find((el): el is HTMLElement => el != null) as HTMLElement | null) ?? undefined;
      }
      const targetColumn = targetListEl?.dataset.kanbanColumn;
      if (!targetColumn || targetColumn === column) {
        return;
      }
      const movingKey = getKey(item);
      kanban.moveItem(movingKey, targetColumn);

      // 跨列落点定位：按落点 Y 命中目标列内各卡片矩形中线，找出插入索引，
      // 再用 list.moveBefore / moveAfter 把卡片精确落到该位置（忽略被拖卡片自身）。
      const targetCards = Array.from(
        targetListEl!.querySelectorAll<HTMLElement>('[data-slot="kanban-card"]'),
      ).filter((el) => el.dataset.key !== String(movingKey));
      if (targetCards.length === 0) {
        return;
      }
      let beforeEl: HTMLElement | undefined;
      for (const cardEl of targetCards) {
        const rect = cardEl.getBoundingClientRect();
        if (y < rect.top + rect.height / 2) {
          beforeEl = cardEl;
          break;
        }
      }
      if (beforeEl) {
        const beforeKey = beforeEl.dataset.key;
        if (beforeKey !== undefined) {
          list.moveBefore(beforeKey, [movingKey]);
        }
      } else {
        const lastKey = targetCards[targetCards.length - 1]?.dataset.key;
        if (lastKey !== undefined) {
          list.moveAfter(lastKey, [movingKey]);
        }
      }
    },
    [kanban, list, column, getKey],
  );

  return useMemo(
    () => ({ items, dragAndDropHooks: { column, getKey, onReorder, onDragEnd, onKeyboardMove } }),
    [items, column, getKey, onReorder, onDragEnd, onKeyboardMove],
  );
}

const Kanban = Object.assign(KanbanRoot, {
  Column,
  ColumnHeader,
  ColumnIndicator,
  ColumnTitle,
  ColumnCount,
  ColumnActions,
  ColumnBody,
  CardList,
  Card: KanbanCard,
  CardContent,
  CardActions,
  DragHandle,
  DropIndicator: KanbanDropIndicator,
  Empty,
  ScrollShadow: ScrollShadowWrapper,
});

export default Kanban;
