import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { Checkbox } from '@heroui/react';
import { Table, type TableColumnProps, type TableRootProps } from '@heroui/react/table';
import type {
  Key,
  Selection,
  SortDescriptor,
  SortDirection,
} from 'react-aria-components';
import clsx from 'clsx';

type ColumnWidth = TableColumnProps['width'];

export type DataGridKey = Key;
export type DataGridSelection = Selection;
export type DataGridSortDescriptor = SortDescriptor;
export type DataGridSortDirection = SortDirection;
export type DataGridVariant = 'primary' | 'secondary';
export type DataGridAlign = 'start' | 'center' | 'end';
export type DataGridPinnedSide = 'left' | 'right';

/** 排序状态信息，传给 header 渲染函数（原站 API） */
export type DataGridSortInfo = {
  sortDirection?: SortDirection;
};

export type DataGridRowReorderPosition = 'before' | 'after';

export type DataGridRowReorderEvent<TRow> = {
  draggedKey: Key;
  targetKey: Key;
  dropPosition: DataGridRowReorderPosition;
  orderedKeys: Key[];
  orderedRows: TRow[];
};

export type DataGridVirtualRange = {
  startIndex: number;
  endIndex: number;
  visibleStartIndex: number;
  visibleEndIndex: number;
  total: number;
};

type DataGridDragPoint = Pick<MouseEvent | PointerEvent, 'clientX' | 'clientY'>;
type DataGridPinnedStyle = CSSProperties & {
  '--data-grid-pinned-offset'?: string;
};
type DataGridRootStyle = CSSProperties & {
  '--data-grid-scroll-left'?: string;
  '--data-grid-scroll-max-left'?: string;
};
type DataGridPinnedMeta = {
  side: DataGridPinnedSide;
  offset: string;
  boundary?: 'start' | 'end';
};

const DEFAULT_VIRTUAL_ROW_HEIGHT = 45;
const DEFAULT_VIRTUAL_MAX_HEIGHT = 360;
const DEFAULT_VIRTUAL_OVERSCAN = 4;
const DEFAULT_PINNED_COLUMN_WIDTH = 160;
const VIRTUAL_TOP_SPACER_KEY = '__data-grid_virtual_top_spacer__';
const VIRTUAL_BOTTOM_SPACER_KEY = '__data-grid_virtual_bottom_spacer__';
const DRAG_HANDLE_COLUMN_ID = '__data-grid_drag_handle_column__';
const SELECTION_COLUMN_ID = '__data-grid_selection_column__';

export type DataGridColumn<TRow> = {
  /** 唯一列标识，同时作为排序 key（原站 API，必填） */
  id: string;
  /** 列头内容：字符串/节点/渲染函数（收到 { sortDirection }） */
  header: ReactNode | ((info: DataGridSortInfo) => ReactNode);
  /** 默认渲染/排序读取的字段名 */
  accessorKey?: keyof TRow & string;
  /** 自定义单元格渲染，收到完整行与列定义 */
  cell?: (item: TRow, column: DataGridColumn<TRow>) => ReactNode;
  /** 标记为行头列（无障碍） */
  isRowHeader?: boolean;
  /** 允许排序（点列头切换 aria-sort） */
  allowsSorting?: boolean;
  /** 自定义排序比较器，缺省走 locale 字符串比较 */
  sortFn?: (a: TRow, b: TRow) => number;
  /** 单元格对齐，end/center 通过 data-align 输出 */
  align?: DataGridAlign;
  /** 固定列方向，组件负责 th/td sticky offset 与边界阴影 */
  pin?: DataGridPinnedSide;
  /** 初始/受控列宽（px / % / fr） */
  width?: ColumnWidth;
  /** th 追加 className */
  headerClassName?: string;
  /** td 追加 className */
  cellClassName?: string;
};

export type DataGridVerticalAlign = 'top' | 'middle' | 'bottom';

export type DataGridProps<TRow extends object> = Omit<
  TableRootProps,
  'className' | 'style' | 'variant' | 'children'
> & {
  /** 行数据数组（原站 API） */
  data: TRow[];
  /** 列定义（原站 API） */
  columns: DataGridColumn<TRow>[];
  /** 提取行唯一 key（原站 API） */
  getRowId: (item: TRow) => Key;
  /** 无障碍标签（原站要求必填） */
  'aria-label'?: string;
  /** 视觉变体，透传给底座 Table */
  variant?: DataGridVariant;
  /** 单元格垂直对齐，输出 data-vertical-align */
  verticalAlign?: DataGridVerticalAlign;
  /** 选择模式 */
  selectionMode?: 'none' | 'single' | 'multiple';
  /** 受控选中行 key 集合 */
  selectedKeys?: Selection;
  /** 默认选中行 key 集合（非受控） */
  defaultSelectedKeys?: Selection;
  /** 选择变化回调 */
  onSelectionChange?: (keys: Selection) => void;
  /** 自动前置选择 checkbox 列 */
  showSelectionCheckboxes?: boolean;
  /** 启用行拖拽重排 */
  enableRowReordering?: boolean;
  /** 启用行重排时显示拖拽手柄列 */
  showRowDragHandles?: boolean;
  /** 行拖拽重排回调，调用方据 orderedKeys/orderedRows 写回 data */
  onRowReorder?: (orderedKeys: Key[], event: DataGridRowReorderEvent<TRow>) => void;
  /** 启用行窗口化渲染：组件内部按滚动位置渲染可见区，而不是调用方手动 slice */
  virtualized?: boolean;
  /** 虚拟化估算行高 */
  virtualRowHeight?: number;
  /** 虚拟化窗口上下额外渲染的行数 */
  virtualOverscan?: number;
  /** 虚拟化滚动容器最大高度 */
  virtualMaxHeight?: number | string;
  /** 虚拟化窗口变化回调，用于页脚状态或埋点 */
  onVirtualRangeChange?: (range: DataGridVirtualRange) => void;
  /** 受控排序描述 */
  sortDescriptor?: SortDescriptor;
  /** 默认排序描述（非受控） */
  defaultSortDescriptor?: SortDescriptor;
  /** 排序变化回调，受控/非受控均触发 */
  onSortChange?: (descriptor: SortDescriptor) => void;
  /** 行被触发（双击/Enter）回调 */
  onRowAction?: (key: Key) => void;
  /** 禁用行 key */
  disabledKeys?: Iterable<Key>;
  /** 空态渲染函数 */
  renderEmptyState?: () => ReactNode;
  /** 内层 <table> 追加 className（如 min-w-[1200px]） */
  contentClassName?: string;
  /** 滚动容器追加 className（如 max-h-[400px] overflow-y-auto） */
  scrollContainerClassName?: string;
  /** 滚动容器追加 style */
  scrollContainerStyle?: CSSProperties;
  className?: string;
  style?: CSSProperties;
};

/** 升序图标，data-direction=descending 时 CSS 旋转 180°（与原站快照一致） */
const SortIcon = ({ direction }: { direction: SortDirection }) => (
  <svg
    className="data-grid__sort-icon"
    data-direction={direction}
    data-slot="data-grid-sort-icon"
    fill="none"
    height="16"
    viewBox="0 0 16 16"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      clipRule="evenodd"
      d="M13.03 10.53a.75.75 0 0 1-1.06 0L8 6.56l-3.97 3.97a.75.75 0 1 1-1.06-1.06l4.5-4.5a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1 0 1.06"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);
SortIcon.displayName = 'DataGrid.SortIcon';

const collator =
  typeof Intl !== 'undefined' ? new Intl.Collator(undefined, { numeric: true }) : undefined;

const readValue = <TRow,>(item: TRow, column: DataGridColumn<TRow>): unknown =>
  column.accessorKey !== undefined
    ? (item as Record<string, unknown>)[column.accessorKey]
    : undefined;

const renderCell = <TRow,>(item: TRow, column: DataGridColumn<TRow>): ReactNode => {
  if (column.cell) {
    return column.cell(item, column);
  }
  const value = readValue(item, column);
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }
  return String(value);
};

const compareValues = (a: unknown, b: unknown): number => {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  const sa = a === null || a === undefined ? '' : String(a);
  const sb = b === null || b === undefined ? '' : String(b);
  return collator ? collator.compare(sa, sb) : sa.localeCompare(sb);
};

const toCssLength = (width: ColumnWidth | undefined, fallback = DEFAULT_PINNED_COLUMN_WIDTH) => {
  if (typeof width === 'number') return `${width}px`;
  if (typeof width === 'string' && width.length > 0) return width;
  return `${fallback}px`;
};

const sumCssLengths = (lengths: string[]) => {
  if (lengths.length === 0) return '0px';
  if (lengths.length === 1) return lengths[0];
  return `calc(${lengths.join(' + ')})`;
};

const getPinnedStyle = (meta: DataGridPinnedMeta | undefined): DataGridPinnedStyle | undefined =>
  meta === undefined ? undefined : { '--data-grid-pinned-offset': meta.offset };

/** 选择 checkbox（原站在选择列/行内用 slot="selection" 的 OSS Checkbox） */
const DataGridSelectionCheckbox = () => (
  <Checkbox slot="selection">
    <Checkbox.Control>
      <Checkbox.Indicator />
    </Checkbox.Control>
  </Checkbox>
);
DataGridSelectionCheckbox.displayName = 'DataGrid.SelectionCheckbox';

const DragHandleIcon = () => (
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
DragHandleIcon.displayName = 'DataGrid.DragHandleIcon';

type DataGridDragHandleProps = HTMLAttributes<HTMLSpanElement>;

const DataGridDragHandle = ({ className, ...rest }: DataGridDragHandleProps) => (
  <span
    aria-hidden="true"
    className={clsx('data-grid__drag-handle', className)}
    data-slot="data-grid-drag-handle"
    {...rest}
  >
    <DragHandleIcon />
  </span>
);
DataGridDragHandle.displayName = 'DataGrid.DragHandle';

const reorderRows = <TRow,>(
  rows: TRow[],
  keys: Key[],
  draggedKey: Key,
  targetKey: Key,
  dropPosition: DataGridRowReorderPosition,
) => {
  const fromIndex = keys.indexOf(draggedKey);
  const targetIndex = keys.indexOf(targetKey);
  if (fromIndex < 0 || targetIndex < 0 || draggedKey === targetKey) {
    return { orderedKeys: keys, orderedRows: rows };
  }

  const nextKeys = [...keys];
  const nextRows = [...rows];
  const [movedKey] = nextKeys.splice(fromIndex, 1);
  const [movedRow] = nextRows.splice(fromIndex, 1);
  let insertIndex = targetIndex + (dropPosition === 'after' ? 1 : 0);
  if (fromIndex < insertIndex) insertIndex -= 1;
  nextKeys.splice(insertIndex, 0, movedKey);
  nextRows.splice(insertIndex, 0, movedRow);
  return { orderedKeys: nextKeys, orderedRows: nextRows };
};

/**
 * 基于 OSS Table（内部 RAC Table）的数据网格：点击可排序列头由 RAC 在 ascending/descending
 * 间切换并输出 aria-sort + 触发 onSortChange；选择启用时 slot="selection" 的 OSS Checkbox 由 RAC
 * 驱动 selectedKeys。非受控排序在客户端按列 sortFn / locale 比较，受控排序仅回显外部 sortDescriptor。
 */
function DataGrid<TRow extends object>({
  data,
  columns,
  getRowId,
  variant = 'primary',
  verticalAlign = 'middle',
  selectionMode = 'none',
  selectedKeys,
  defaultSelectedKeys,
  onSelectionChange,
  showSelectionCheckboxes = false,
  enableRowReordering = false,
  showRowDragHandles = true,
  onRowReorder,
  virtualized = false,
  virtualRowHeight = DEFAULT_VIRTUAL_ROW_HEIGHT,
  virtualOverscan = DEFAULT_VIRTUAL_OVERSCAN,
  virtualMaxHeight = DEFAULT_VIRTUAL_MAX_HEIGHT,
  onVirtualRangeChange,
  sortDescriptor,
  defaultSortDescriptor,
  onSortChange,
  onRowAction,
  disabledKeys,
  renderEmptyState,
  contentClassName,
  scrollContainerClassName,
  scrollContainerStyle,
  className,
  style,
  'aria-label': ariaLabel,
  ...rest
}: DataGridProps<TRow>) {
  const [internalSortDescriptor, setInternalSortDescriptor] =
    useState<SortDescriptor | undefined>(defaultSortDescriptor);
  const [draggedKey, setDraggedKey] = useState<Key | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    key: Key;
    position: DataGridRowReorderPosition;
  } | null>(null);
  const draggedKeyRef = useRef<Key | null>(null);
  const dropTargetRef = useRef<{
    key: Key;
    position: DataGridRowReorderPosition;
  } | null>(null);
  const rowDragCleanupRef = useRef<(() => void) | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const onVirtualRangeChangeRef = useRef(onVirtualRangeChange);
  const [virtualScrollTop, setVirtualScrollTop] = useState(0);
  const [virtualViewportHeight, setVirtualViewportHeight] = useState(
    typeof virtualMaxHeight === 'number' ? virtualMaxHeight : DEFAULT_VIRTUAL_MAX_HEIGHT,
  );
  const [horizontalScrollLeft, setHorizontalScrollLeft] = useState(0);
  const [horizontalScrollMaxLeft, setHorizontalScrollMaxLeft] = useState(0);

  // 受控排序：外部提供 sortDescriptor → 不在本地重排，交由调用方处理（服务端排序）
  const isControlledSort = sortDescriptor !== undefined;
  const activeSort = sortDescriptor ?? internalSortDescriptor;
  const withSelection = showSelectionCheckboxes && selectionMode !== 'none';
  const withRowReordering = enableRowReordering && onRowReorder !== undefined;
  const withDragHandles = withRowReordering && showRowDragHandles;
  const isVirtualized = virtualized && data.length > 0;
  const leftPinnedColumns = columns.filter((column) => column.pin === 'left');
  const rightPinnedColumns = columns.filter((column) => column.pin === 'right');
  const hasLeftPinnedColumns = leftPinnedColumns.length > 0;
  const hasPinnedColumns = hasLeftPinnedColumns || rightPinnedColumns.length > 0;
  const shouldPinLeadingUtilityColumns = hasLeftPinnedColumns && (withDragHandles || withSelection);
  const leadingPinnedMeta = new Map<string, DataGridPinnedMeta>();
  const pinnedColumnMeta = new Map<string, DataGridPinnedMeta>();
  const leftOffsetParts: string[] = [];
  if (shouldPinLeadingUtilityColumns && withDragHandles) {
    leadingPinnedMeta.set(DRAG_HANDLE_COLUMN_ID, {
      side: 'left',
      offset: sumCssLengths(leftOffsetParts),
    });
    leftOffsetParts.push('var(--data-grid-drag-handle-column-width)');
  }
  if (shouldPinLeadingUtilityColumns && withSelection) {
    leadingPinnedMeta.set(SELECTION_COLUMN_ID, {
      side: 'left',
      offset: sumCssLengths(leftOffsetParts),
    });
    leftOffsetParts.push('var(--data-grid-selection-column-width)');
  }
  for (const column of columns) {
    if (column.pin !== 'left') continue;
    pinnedColumnMeta.set(column.id, {
      side: 'left',
      offset: sumCssLengths(leftOffsetParts),
      boundary: column.id === leftPinnedColumns[leftPinnedColumns.length - 1]?.id ? 'end' : undefined,
    });
    leftOffsetParts.push(toCssLength(column.width));
  }
  const rightOffsetParts: string[] = [];
  const firstRightPinnedId = rightPinnedColumns[0]?.id;
  for (const column of [...columns].reverse()) {
    if (column.pin !== 'right') continue;
    pinnedColumnMeta.set(column.id, {
      side: 'right',
      offset: sumCssLengths(rightOffsetParts),
      boundary: column.id === firstRightPinnedId ? 'start' : undefined,
    });
    rightOffsetParts.push(toCssLength(column.width));
  }
  const safeVirtualRowHeight = Math.max(1, virtualRowHeight);
  const safeVirtualOverscan = Math.max(0, Math.floor(virtualOverscan));
  onVirtualRangeChangeRef.current = onVirtualRangeChange;
  const handleSortChange = (descriptor: SortDescriptor) => {
    if (!isControlledSort) setInternalSortDescriptor(descriptor);
    onSortChange?.(descriptor);
  };

  const sortedData =
    isControlledSort || activeSort === undefined
      ? data
      : [...data].sort((a, b) => {
          const column = columns.find((col) => col.id === activeSort.column);
          if (!column) {
            return 0;
          }
          const result = column.sortFn
            ? column.sortFn(a, b)
            : compareValues(readValue(a, column), readValue(b, column));
          return activeSort.direction === 'descending' ? -result : result;
        });
  const sortedKeys = sortedData.map(getRowId);
  const virtualVisibleCount = isVirtualized
    ? Math.max(1, Math.ceil(virtualViewportHeight / safeVirtualRowHeight))
    : sortedData.length;
  const virtualVisibleStartIndex = isVirtualized
    ? Math.min(
        Math.max(0, Math.floor(virtualScrollTop / safeVirtualRowHeight)),
        Math.max(0, sortedData.length - 1),
      )
    : 0;
  const virtualStartIndex = isVirtualized
    ? Math.max(0, virtualVisibleStartIndex - safeVirtualOverscan)
    : 0;
  const virtualEndIndex = isVirtualized
    ? Math.min(
        sortedData.length,
        virtualVisibleStartIndex + virtualVisibleCount + safeVirtualOverscan,
      )
    : sortedData.length;
  const virtualRows = isVirtualized ? sortedData.slice(virtualStartIndex, virtualEndIndex) : sortedData;
  const virtualTopSpacer = isVirtualized ? virtualStartIndex * safeVirtualRowHeight : 0;
  const virtualBottomSpacer = isVirtualized
    ? Math.max(0, (sortedData.length - virtualEndIndex) * safeVirtualRowHeight)
    : 0;
  const tableColumnCount =
    columns.length + (withSelection ? 1 : 0) + (withDragHandles ? 1 : 0);
  const mergedDisabledKeys = isVirtualized
    ? [
        ...(disabledKeys === undefined ? [] : Array.from(disabledKeys)),
        VIRTUAL_TOP_SPACER_KEY,
        VIRTUAL_BOTTOM_SPACER_KEY,
      ]
    : disabledKeys;
  const virtualScrollContainerStyle: CSSProperties | undefined = isVirtualized
    ? {
        maxHeight: virtualMaxHeight,
        overflowY: 'auto',
        ...scrollContainerStyle,
      }
    : scrollContainerStyle;
  const virtualRange: DataGridVirtualRange = {
    startIndex: virtualStartIndex,
    endIndex: virtualEndIndex,
    visibleStartIndex: virtualVisibleStartIndex,
    visibleEndIndex: isVirtualized
      ? Math.min(sortedData.length, virtualVisibleStartIndex + virtualVisibleCount)
      : sortedData.length,
    total: sortedData.length,
  };
  const rootStyle: DataGridRootStyle | undefined = hasPinnedColumns
    ? {
        ...style,
        '--data-grid-scroll-left': `${horizontalScrollLeft}px`,
        '--data-grid-scroll-max-left': `${horizontalScrollMaxLeft}px`,
      }
    : style;

  const setActiveDropTarget = (
    next: { key: Key; position: DataGridRowReorderPosition } | null,
  ) => {
    dropTargetRef.current = next;
    setDropTarget((current) =>
      current?.key === next?.key && current?.position === next?.position ? current : next,
    );
  };

  const removeRowDragListeners = () => {
    rowDragCleanupRef.current?.();
    rowDragCleanupRef.current = null;
  };

  const getDropPosition = (
    point: DataGridDragPoint,
    row: HTMLElement,
  ): DataGridRowReorderPosition => {
    const rect = row.getBoundingClientRect();
    return point.clientY > rect.top + rect.height / 2 ? 'after' : 'before';
  };

  const resolveDropTarget = (point: DataGridDragPoint) => {
    const target = document
      .elementFromPoint(point.clientX, point.clientY)
      ?.closest<HTMLElement>('tr[data-row-reorderable=true]') ?? null;
    const targetKey = sortedKeys.find((key) => String(key) === target?.dataset.rowKey);

    if (target === null || targetKey === undefined || targetKey === draggedKeyRef.current) {
      return null;
    }

    return {
      key: targetKey,
      position: getDropPosition(point, target),
    };
  };

  const handleRowDragMove = (point: DataGridDragPoint) => {
    if (!withRowReordering || draggedKeyRef.current === null) return;
    setActiveDropTarget(resolveDropTarget(point));
  };

  const clearDragState = () => {
    removeRowDragListeners();
    draggedKeyRef.current = null;
    dropTargetRef.current = null;
    setDraggedKey(null);
    setDropTarget(null);
  };

  const finishRowDrag = () => {
    removeRowDragListeners();
    const activeDraggedKey = draggedKeyRef.current;
    const activeDropTarget = dropTargetRef.current;

    if (
      !withRowReordering ||
      activeDraggedKey === null ||
      activeDropTarget === null ||
      activeDropTarget.key === activeDraggedKey
    ) {
      clearDragState();
      return;
    }

    const { orderedKeys, orderedRows } = reorderRows(
      sortedData,
      sortedKeys,
      activeDraggedKey,
      activeDropTarget.key,
      activeDropTarget.position,
    );
    onRowReorder?.(orderedKeys, {
      draggedKey: activeDraggedKey,
      targetKey: activeDropTarget.key,
      dropPosition: activeDropTarget.position,
      orderedKeys,
      orderedRows,
    });
    clearDragState();
  };

  const installRowDragListeners = () => {
    removeRowDragListeners();

    const handlePointerMove = (event: PointerEvent) => {
      event.preventDefault();
      handleRowDragMove(event);
    };
    const handlePointerUp = (event: PointerEvent) => {
      event.preventDefault();
      finishRowDrag();
    };
    const handleMouseMove = (event: MouseEvent) => {
      event.preventDefault();
      handleRowDragMove(event);
    };
    const handleMouseUp = (event: MouseEvent) => {
      event.preventDefault();
      finishRowDrag();
    };

    document.addEventListener('pointermove', handlePointerMove, { passive: false });
    document.addEventListener('pointerup', handlePointerUp, { passive: false });
    document.addEventListener('pointercancel', handlePointerUp, { passive: false });
    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp, { passive: false });

    rowDragCleanupRef.current = () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  };

  const startRowDrag = (key: Key) => {
    if (!withRowReordering || draggedKeyRef.current !== null) return;
    draggedKeyRef.current = key;
    setDraggedKey(key);
    setActiveDropTarget(null);
    installRowDragListeners();
  };

  const handleRowPointerDown = (key: Key, event: ReactPointerEvent<HTMLElement>) => {
    if (!withRowReordering) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    startRowDrag(key);
  };

  const handleRowMouseDown = (key: Key, event: ReactMouseEvent<HTMLElement>) => {
    if (!withRowReordering || event.button !== 0) return;
    event.preventDefault();
    startRowDrag(key);
  };

  const handleRowPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    handleRowDragMove(event);
  };

  const handleRowPointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    finishRowDrag();
  };

  useEffect(
    () => () => {
      rowDragCleanupRef.current?.();
      rowDragCleanupRef.current = null;
    },
    [],
  );

  useEffect(() => {
    if (!isVirtualized && !hasPinnedColumns) {
      setVirtualScrollTop(0);
      setHorizontalScrollLeft(0);
      setHorizontalScrollMaxLeft(0);
      return;
    }

    const node = scrollContainerRef.current;
    if (!node) return;

    const updateScrollMetrics = () => {
      if (isVirtualized) {
        setVirtualScrollTop(node.scrollTop);
        setVirtualViewportHeight(node.clientHeight || DEFAULT_VIRTUAL_MAX_HEIGHT);
      } else {
        setVirtualScrollTop(0);
      }

      if (hasPinnedColumns) {
        setHorizontalScrollLeft(node.scrollLeft);
        setHorizontalScrollMaxLeft(Math.max(0, node.scrollWidth - node.clientWidth));
      } else {
        setHorizontalScrollLeft(0);
        setHorizontalScrollMaxLeft(0);
      }
    };

    updateScrollMetrics();
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateScrollMetrics) : null;
    resizeObserver?.observe(node);
    node.addEventListener('scroll', updateScrollMetrics, { passive: true });

    return () => {
      resizeObserver?.disconnect();
      node.removeEventListener('scroll', updateScrollMetrics);
    };
  }, [isVirtualized, hasPinnedColumns, virtualMaxHeight]);

  useEffect(() => {
    if (!isVirtualized) return;
    onVirtualRangeChangeRef.current?.(virtualRange);
  }, [
    isVirtualized,
    virtualRange.startIndex,
    virtualRange.endIndex,
    virtualRange.visibleStartIndex,
    virtualRange.visibleEndIndex,
    virtualRange.total,
  ]);

  const renderDataGridRow = (item: TRow) => {
    const rowKey = getRowId(item);
    const isDragging = draggedKey === rowKey;
    const isDropTarget = dropTarget?.key === rowKey;
    const dragHandlePinnedMeta = leadingPinnedMeta.get(DRAG_HANDLE_COLUMN_ID);
    const selectionPinnedMeta = leadingPinnedMeta.get(SELECTION_COLUMN_ID);
    const rowDragProps = withRowReordering
      ? {
          'data-row-reorderable': true,
          'data-row-key': String(rowKey),
          'data-dragging': isDragging || undefined,
          'data-drop-target': isDropTarget || undefined,
          'data-drop-position': isDropTarget ? dropTarget.position : undefined,
        }
      : {};

    return (
      <Table.Row id={rowKey} key={rowKey} {...rowDragProps}>
        {withDragHandles && (
          <Table.Cell
            className="data-grid__drag-handle-cell"
            data-pinned={dragHandlePinnedMeta?.side}
            data-pinned-boundary={dragHandlePinnedMeta?.boundary}
            style={getPinnedStyle(dragHandlePinnedMeta)}
          >
            <DataGridDragHandle
              onMouseDown={(event) => handleRowMouseDown(rowKey, event)}
              onPointerDown={(event) => handleRowPointerDown(rowKey, event)}
              onPointerMove={handleRowPointerMove}
              onPointerUp={handleRowPointerUp}
              onPointerCancel={clearDragState}
            />
          </Table.Cell>
        )}
        {withSelection && (
          <Table.Cell
            className="data-grid__selection-cell"
            data-pinned={selectionPinnedMeta?.side}
            data-pinned-boundary={selectionPinnedMeta?.boundary}
            style={getPinnedStyle(selectionPinnedMeta)}
          >
            <DataGridSelectionCheckbox />
          </Table.Cell>
        )}
        {columns.map((column) => {
          const pinnedMeta = pinnedColumnMeta.get(column.id);
          return (
            <Table.Cell
              key={column.id}
              data-align={column.align !== 'start' ? column.align : undefined}
              data-pinned={pinnedMeta?.side}
              data-pinned-boundary={pinnedMeta?.boundary}
              className={column.cellClassName}
              style={getPinnedStyle(pinnedMeta)}
            >
              {renderCell(item, column)}
            </Table.Cell>
          );
        })}
      </Table.Row>
    );
  };

  const renderVirtualSpacerRow = (id: string, height: number) =>
    height > 0 ? (
      <Table.Row
        id={id}
        key={id}
        aria-hidden="true"
        className="data-grid__virtual-spacer-row"
        data-virtual-spacer="true"
      >
        <Table.Cell
          colSpan={tableColumnCount}
          className="data-grid__virtual-spacer-cell"
          style={{ height }}
        />
      </Table.Row>
    ) : null;

  return (
    <Table.Root
      data-slot="data-grid"
      data-vertical-align={verticalAlign}
      data-virtualized={isVirtualized || undefined}
      data-virtual-start={isVirtualized ? virtualRange.startIndex : undefined}
      data-virtual-end={isVirtualized ? virtualRange.endIndex : undefined}
      data-virtual-total={isVirtualized ? virtualRange.total : undefined}
      variant={variant}
      className={clsx('data-grid', className)}
      style={rootStyle}
      {...rest}
    >
      <Table.ScrollContainer
        ref={scrollContainerRef}
        className={clsx('data-grid__scroll-container', scrollContainerClassName)}
        data-virtualized={isVirtualized || undefined}
        style={virtualScrollContainerStyle}
      >
        <Table.Content
          aria-label={ariaLabel}
          className={contentClassName}
          selectionMode={selectionMode}
          selectedKeys={selectedKeys}
          defaultSelectedKeys={defaultSelectedKeys}
          onSelectionChange={onSelectionChange}
          sortDescriptor={activeSort}
          onSortChange={handleSortChange}
          onRowAction={onRowAction}
          disabledKeys={mergedDisabledKeys}
        >
          <Table.Header>
            {withDragHandles && (
              <Table.Column
                className="data-grid__drag-handle-column"
                data-pinned={leadingPinnedMeta.get(DRAG_HANDLE_COLUMN_ID)?.side}
                data-pinned-boundary={leadingPinnedMeta.get(DRAG_HANDLE_COLUMN_ID)?.boundary}
                style={getPinnedStyle(leadingPinnedMeta.get(DRAG_HANDLE_COLUMN_ID))}
              >
                <span className="sr-only">拖拽排序</span>
              </Table.Column>
            )}
            {withSelection && (
              <Table.Column
                className="data-grid__selection-column"
                data-pinned={leadingPinnedMeta.get(SELECTION_COLUMN_ID)?.side}
                data-pinned-boundary={leadingPinnedMeta.get(SELECTION_COLUMN_ID)?.boundary}
                style={getPinnedStyle(leadingPinnedMeta.get(SELECTION_COLUMN_ID))}
              >
                {selectionMode === 'multiple' ? <DataGridSelectionCheckbox /> : null}
              </Table.Column>
            )}
            {columns.map((column) => {
              const isSorted = activeSort?.column === column.id;
              const sortDirection = isSorted ? activeSort?.direction : undefined;
              const pinnedMeta = pinnedColumnMeta.get(column.id);
              const headerNode =
                typeof column.header === 'function'
                  ? column.header({ sortDirection })
                  : column.header;
              return (
                <Table.Column
                  key={column.id}
                  id={column.id}
                  isRowHeader={column.isRowHeader}
                  allowsSorting={column.allowsSorting}
                  data-align={column.align !== 'start' ? column.align : undefined}
                  data-pinned={pinnedMeta?.side}
                  data-pinned-boundary={pinnedMeta?.boundary}
                  width={column.width ?? (pinnedMeta ? DEFAULT_PINNED_COLUMN_WIDTH : undefined)}
                  className={column.headerClassName}
                  style={getPinnedStyle(pinnedMeta)}
                >
                  <span data-slot="data-grid-sort-header">
                    {headerNode}
                    {column.allowsSorting && sortDirection !== undefined && (
                      <SortIcon direction={sortDirection} />
                    )}
                  </span>
                </Table.Column>
              );
            })}
          </Table.Header>
          {isVirtualized ? (
            <Table.Body className="data-grid__virtual-body" renderEmptyState={renderEmptyState}>
              {renderVirtualSpacerRow(VIRTUAL_TOP_SPACER_KEY, virtualTopSpacer)}
              {virtualRows.map((item) => renderDataGridRow(item))}
              {renderVirtualSpacerRow(VIRTUAL_BOTTOM_SPACER_KEY, virtualBottomSpacer)}
            </Table.Body>
          ) : (
            <Table.Body items={virtualRows} renderEmptyState={renderEmptyState}>
              {(item: TRow) => renderDataGridRow(item)}
            </Table.Body>
          )}
        </Table.Content>
      </Table.ScrollContainer>
    </Table.Root>
  );
}
DataGrid.displayName = 'DataGrid';

export default DataGrid;
