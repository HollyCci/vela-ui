'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
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

/** 排序状态信息，传给 header 渲染函数（参考 API） */
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

export type DataGridExpandedKeys = 'all' | Iterable<Key>;

export type DataGridExpandableRowRenderProps<TRow> = {
  row: TRow;
  rowKey: Key;
  isExpanded: boolean;
};

export type DataGridColumnWidths = Record<string, number>;

export type DataGridColumnResizeEvent<TRow> = {
  columnId: string;
  column: DataGridColumn<TRow>;
  width: number;
  previousWidth: number;
};

export type DataGridVirtualRange = {
  startIndex: number;
  endIndex: number;
  visibleStartIndex: number;
  visibleEndIndex: number;
  total: number;
};

export type DataGridCellEditCommitReason = 'enter' | 'blur' | 'programmatic';
export type DataGridCellEditCancelReason = 'escape' | 'programmatic';

export type DataGridCellEditorInputProps = InputHTMLAttributes<HTMLInputElement> & {
  ref: (node: HTMLInputElement | null) => void;
};

export type DataGridCellEditorProps<TRow> = {
  row: TRow;
  rowKey: Key;
  column: DataGridColumn<TRow>;
  rawValue: unknown;
  value: string;
  error?: string;
  setValue: (value: string) => void;
  commit: (value?: string) => void;
  cancel: () => void;
  inputProps: DataGridCellEditorInputProps;
};

export type DataGridCellEditEvent<TRow> = {
  row: TRow;
  rowKey: Key;
  column: DataGridColumn<TRow>;
  columnId: string;
  previousValue: unknown;
  value: unknown;
  inputValue: string;
  reason: DataGridCellEditCommitReason;
};

type DataGridDragPoint = Pick<MouseEvent | PointerEvent, 'clientX' | 'clientY'>;
type DataGridPinnedStyle = CSSProperties & {
  '--data-grid-pinned-offset'?: string;
};
type DataGridRootStyle = CSSProperties & {
  '--data-grid-scroll-left'?: string;
  '--data-grid-scroll-max-left'?: string;
};
type DataGridDragOverlayStyle = CSSProperties & {
  '--data-grid-drag-x'?: string;
  '--data-grid-drag-y'?: string;
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
const DEFAULT_COLUMN_RESIZE_MIN_WIDTH = 56;
const DEFAULT_COLUMN_RESIZE_MAX_WIDTH = 640;
const VIRTUAL_TOP_SPACER_KEY = '__data-grid_virtual_top_spacer__';
const VIRTUAL_BOTTOM_SPACER_KEY = '__data-grid_virtual_bottom_spacer__';
const DRAG_HANDLE_COLUMN_ID = '__data-grid_drag_handle_column__';
const SELECTION_COLUMN_ID = '__data-grid_selection_column__';

export type DataGridColumn<TRow> = {
  /** 唯一列标识，同时作为排序 key（参考 API，必填） */
  id: string;
  /** 列头内容：字符串/节点/渲染函数（收到 { sortDirection }） */
  header: ReactNode | ((info: DataGridSortInfo) => ReactNode);
  /** 默认渲染/排序读取的字段名 */
  accessorKey?: keyof TRow & string;
  /** 自定义单元格渲染，收到完整行与列定义 */
  cell?: (item: TRow, column: DataGridColumn<TRow>) => ReactNode;
  /** 是否允许编辑：true 或按行动态判断 */
  editable?: boolean | ((item: TRow, column: DataGridColumn<TRow>) => boolean);
  /** 自定义编辑器；不传时渲染内置 input */
  editor?: (props: DataGridCellEditorProps<TRow>) => ReactNode;
  /** 将输入字符串转为提交值；可 throw 以阻止提交并显示错误态 */
  parse?: (value: string, item: TRow, column: DataGridColumn<TRow>) => unknown;
  /** 将原始值格式化为展示文本与编辑初值 */
  format?: (value: unknown, item: TRow, column: DataGridColumn<TRow>) => string;
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
  /** 允许被 DataGrid 的列宽手柄拖拽调整；未配置时跟随 enableColumnResizing */
  resizable?: boolean;
  /** 列宽拖拽最小宽度（px） */
  minWidth?: number;
  /** 列宽拖拽最大宽度（px） */
  maxWidth?: number;
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
  /** 行数据数组（参考 API） */
  data: TRow[];
  /** 列定义（参考 API） */
  columns: DataGridColumn<TRow>[];
  /** 提取行唯一 key（参考 API） */
  getRowId: (item: TRow) => Key;
  /** 无障碍标签（参考实现要求必填） */
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
  /** 展开的行 key（传 "all" 展开所有可展开行） */
  expandedKeys?: DataGridExpandedKeys;
  /** 默认展开的行 key */
  defaultExpandedKeys?: Iterable<Key>;
  /** 展开状态变化回调 */
  onExpandedChange?: (keys: Set<Key>) => void;
  /** 判断一行是否可展开；默认 renderExpandedContent 存在时所有行可展开 */
  isRowExpandable?: (item: TRow) => boolean;
  /** 渲染展开行内容；组件负责展开按钮、aria-expanded 与跨列行 */
  renderExpandedContent?: (
    item: TRow,
    props: DataGridExpandableRowRenderProps<TRow>,
  ) => ReactNode;
  /** 展开按钮所在列；默认第一列 */
  expandColumnId?: string;
  /** 启用列宽拖拽调整 */
  enableColumnResizing?: boolean;
  /** 受控列宽（px） */
  columnWidths?: DataGridColumnWidths;
  /** 默认列宽（px） */
  defaultColumnWidths?: DataGridColumnWidths;
  /** 列宽拖拽变化回调 */
  onColumnResize?: (event: DataGridColumnResizeEvent<TRow>) => void;
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
  /** 可编辑单元格提交回调；调用方据 rowKey/columnId/value 写回 data */
  onCellEdit?: (event: DataGridCellEditEvent<TRow>) => void;
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

/** 升序图标，data-direction=descending 时 CSS 旋转 180°（与参考实现快照一致） */
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

const stringifyCellValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  return String(value);
};

const formatCellValue = <TRow,>(
  item: TRow,
  column: DataGridColumn<TRow>,
  value = readValue(item, column),
): string => (column.format ? column.format(value, item, column) : stringifyCellValue(value));

const renderCell = <TRow,>(item: TRow, column: DataGridColumn<TRow>): ReactNode => {
  if (column.cell) {
    return column.cell(item, column);
  }
  const value = readValue(item, column);
  return column.format ? formatCellValue(item, column, value) : value === '' ? '' : stringifyCellValue(value);
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

/** 选择 checkbox（参考实现在选择列/行内用 slot="selection" 的 OSS Checkbox） */
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

type DataGridDragHandleProps = ButtonHTMLAttributes<HTMLButtonElement>;

const DataGridDragHandle = ({ className, ...rest }: DataGridDragHandleProps) => (
  <button
    type="button"
    aria-label="拖拽排序"
    className={clsx('data-grid__drag-handle', className)}
    data-slot="data-grid-drag-handle"
    {...rest}
  >
    <DragHandleIcon />
  </button>
);
DataGridDragHandle.displayName = 'DataGrid.DragHandle';

const TreeToggleIcon = ({ expanded }: { expanded: boolean }) => (
  <svg
    aria-hidden="true"
    className="data-grid__tree-toggle-icon"
    data-expanded={expanded || undefined}
    fill="none"
    height="16"
    viewBox="0 0 16 16"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 3.75 10.25 8 6 12.25"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
    />
  </svg>
);
TreeToggleIcon.displayName = 'DataGrid.TreeToggleIcon';

const toKeySet = (keys: DataGridExpandedKeys | Iterable<Key> | undefined, allKeys: Key[]) => {
  if (keys === 'all') return new Set(allKeys);
  return new Set(keys ?? []);
};

const getExpandedRowKey = (rowKey: Key) => `__data-grid_expanded_${String(rowKey)}`;

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
  expandedKeys,
  defaultExpandedKeys,
  onExpandedChange,
  isRowExpandable,
  renderExpandedContent,
  expandColumnId,
  enableColumnResizing = false,
  columnWidths,
  defaultColumnWidths,
  onColumnResize,
  virtualized = false,
  virtualRowHeight = DEFAULT_VIRTUAL_ROW_HEIGHT,
  virtualOverscan = DEFAULT_VIRTUAL_OVERSCAN,
  virtualMaxHeight = DEFAULT_VIRTUAL_MAX_HEIGHT,
  onVirtualRangeChange,
  sortDescriptor,
  defaultSortDescriptor,
  onSortChange,
  onCellEdit,
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
  const [dragOverlayPoint, setDragOverlayPoint] = useState<{ x: number; y: number } | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    key: Key;
    position: DataGridRowReorderPosition;
  } | null>(null);
  const [internalExpandedKeys, setInternalExpandedKeys] = useState<Set<Key>>(
    () => new Set(defaultExpandedKeys ?? []),
  );
  const [internalColumnWidths, setInternalColumnWidths] = useState<DataGridColumnWidths>(
    () => ({ ...(defaultColumnWidths ?? {}) }),
  );
  const draggedKeyRef = useRef<Key | null>(null);
  const dropTargetRef = useRef<{
    key: Key;
    position: DataGridRowReorderPosition;
  } | null>(null);
  const rowDragCleanupRef = useRef<(() => void) | null>(null);
  const previousColumnWidthsRef = useRef<DataGridColumnWidths>({});
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const onVirtualRangeChangeRef = useRef(onVirtualRangeChange);
  const editingCellRef = useRef<{ rowKey: Key; columnId: string } | null>(null);
  const editInputValueRef = useRef('');
  const editInputRef = useRef<HTMLInputElement | null>(null);
  const skipNextBlurCommitRef = useRef(false);
  const [editingCell, setEditingCellState] = useState<{ rowKey: Key; columnId: string } | null>(
    null,
  );
  const [editInputValue, setEditInputValueState] = useState('');
  const [editError, setEditError] = useState<string | undefined>(undefined);
  const [virtualScrollTop, setVirtualScrollTop] = useState(0);
  const [virtualViewportHeight, setVirtualViewportHeight] = useState(
    typeof virtualMaxHeight === 'number' ? virtualMaxHeight : DEFAULT_VIRTUAL_MAX_HEIGHT,
  );
  const [horizontalScrollLeft, setHorizontalScrollLeft] = useState(0);
  const [horizontalScrollMaxLeft, setHorizontalScrollMaxLeft] = useState(0);

  // 受控排序：外部提供 sortDescriptor → 不在本地重排，交由调用方处理（服务端排序）
  const isControlledSort = sortDescriptor !== undefined;
  const isControlledExpanded = expandedKeys !== undefined;
  const isControlledColumnWidths = columnWidths !== undefined;
  const activeSort = sortDescriptor ?? internalSortDescriptor;
  const withSelection = showSelectionCheckboxes && selectionMode !== 'none';
  const withRowReordering = enableRowReordering && onRowReorder !== undefined;
  const withDragHandles = withRowReordering && showRowDragHandles;
  const withExpandableRows = renderExpandedContent !== undefined;
  const activeExpandColumnId = expandColumnId ?? columns[0]?.id;
  const activeColumnWidths = columnWidths ?? internalColumnWidths;
  const getColumnWidth = (column: DataGridColumn<TRow>): ColumnWidth | undefined =>
    activeColumnWidths[column.id] ?? column.width;
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
    leftOffsetParts.push(toCssLength(getColumnWidth(column)));
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
    rightOffsetParts.push(toCssLength(getColumnWidth(column)));
  }
  const safeVirtualRowHeight = Math.max(1, virtualRowHeight);
  const safeVirtualOverscan = Math.max(0, Math.floor(virtualOverscan));
  onVirtualRangeChangeRef.current = onVirtualRangeChange;
  const handleSortChange = (descriptor: SortDescriptor) => {
    if (!isControlledSort) setInternalSortDescriptor(descriptor);
    onSortChange?.(descriptor);
  };

  const setEditingCell = (next: { rowKey: Key; columnId: string } | null) => {
    editingCellRef.current = next;
    setEditingCellState(next);
  };

  const setEditInputValue = (value: string) => {
    editInputValueRef.current = value;
    setEditInputValueState(value);
  };

  const isColumnEditable = (item: TRow, column: DataGridColumn<TRow>) =>
    typeof column.editable === 'function' ? column.editable(item, column) : column.editable === true;

  const getColumnLabel = (column: DataGridColumn<TRow>) => {
    if (typeof column.header === 'string' || typeof column.header === 'number') {
      return String(column.header);
    }
    return column.id;
  };

  const isEditingCell = (rowKey: Key, column: DataGridColumn<TRow>) =>
    editingCell?.rowKey === rowKey && editingCell.columnId === column.id;

  const focusEditorInput = () => {
    window.setTimeout(() => {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }, 0);
  };

  const startCellEdit = (item: TRow, rowKey: Key, column: DataGridColumn<TRow>) => {
    if (!isColumnEditable(item, column)) return;
    setEditError(undefined);
    setEditInputValue(formatCellValue(item, column));
    setEditingCell({ rowKey, columnId: column.id });
    focusEditorInput();
  };

  const cancelCellEdit = (_reason: DataGridCellEditCancelReason) => {
    if (editingCellRef.current === null) return;
    skipNextBlurCommitRef.current = true;
    setEditingCell(null);
    setEditError(undefined);
  };

  const commitCellValue = (
    item: TRow,
    rowKey: Key,
    column: DataGridColumn<TRow>,
    reason: DataGridCellEditCommitReason,
    value: string,
  ) => {
    const previousValue = readValue(item, column);
    let nextValue: unknown;

    try {
      nextValue = column.parse ? column.parse(value, item, column) : value;
    } catch (error) {
      setEditInputValue(value);
      setEditingCell({ rowKey, columnId: column.id });
      setEditError(error instanceof Error ? error.message : '请输入有效值');
      focusEditorInput();
      return false;
    }

    if (!Object.is(previousValue, nextValue)) {
      onCellEdit?.({
        row: item,
        rowKey,
        column,
        columnId: column.id,
        previousValue,
        value: nextValue,
        inputValue: value,
        reason,
      });
    }

    return true;
  };

  const commitCellEdit = (
    item: TRow,
    rowKey: Key,
    column: DataGridColumn<TRow>,
    reason: DataGridCellEditCommitReason,
    value = editInputValueRef.current,
  ) => {
    const activeCell = editingCellRef.current;
    if (
      activeCell === null ||
      activeCell.rowKey !== rowKey ||
      activeCell.columnId !== column.id
    ) {
      return;
    }

    if (!commitCellValue(item, rowKey, column, reason, value)) return;

    setEditingCell(null);
    setEditError(undefined);
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
  const activeExpandedKeys = isControlledExpanded
    ? toKeySet(expandedKeys, sortedKeys)
    : internalExpandedKeys;
  const expandedRowKeys = withExpandableRows
    ? sortedKeys
        .filter((key) => activeExpandedKeys.has(key))
        .map((key) => getExpandedRowKey(key))
    : [];
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
        ...expandedRowKeys,
      ]
    : expandedRowKeys.length > 0
      ? [...(disabledKeys === undefined ? [] : Array.from(disabledKeys)), ...expandedRowKeys]
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

  const isExpandableRow = (item: TRow) =>
    withExpandableRows && (isRowExpandable === undefined || isRowExpandable(item));

  const setExpandedKeys = (next: Set<Key>) => {
    if (!isControlledExpanded) setInternalExpandedKeys(next);
    onExpandedChange?.(next);
  };

  const toggleRowExpanded = (item: TRow, rowKey: Key) => {
    if (!isExpandableRow(item)) return;
    const next = new Set(activeExpandedKeys);
    if (next.has(rowKey)) next.delete(rowKey);
    else next.add(rowKey);
    setExpandedKeys(next);
  };

  const removeRowDragListeners = () => {
    rowDragCleanupRef.current?.();
    rowDragCleanupRef.current = null;
  };

  const clampColumnWidth = (column: DataGridColumn<TRow>, width: number) => {
    const minWidth = column.minWidth ?? DEFAULT_COLUMN_RESIZE_MIN_WIDTH;
    const maxWidth = column.maxWidth ?? DEFAULT_COLUMN_RESIZE_MAX_WIDTH;
    return Math.min(Math.max(Math.round(width), minWidth), maxWidth);
  };

  const handleColumnResize = (widths: Map<Key, ColumnWidth>) => {
    const nextWidths: DataGridColumnWidths = {};

    widths.forEach((width, key) => {
      const columnId = String(key);
      const column = columns.find((candidate) => candidate.id === columnId);
      if (column === undefined || typeof width !== 'number') return;
      nextWidths[columnId] = clampColumnWidth(column, width);
    });

    const entries = Object.entries(nextWidths);
    if (entries.length === 0) return;

    if (!isControlledColumnWidths) {
      setInternalColumnWidths((current) => ({ ...current, ...nextWidths }));
    }

    for (const [columnId, width] of entries) {
      const column = columns.find((candidate) => candidate.id === columnId);
      if (column === undefined) continue;
      const configuredWidth = activeColumnWidths[columnId] ?? column.width;
      const previousWidth =
        previousColumnWidthsRef.current[columnId] ??
        (typeof configuredWidth === 'number' ? configuredWidth : width);

      if (previousWidth !== width) {
        onColumnResize?.({ column, columnId, previousWidth, width });
      }
    }

    previousColumnWidthsRef.current = {
      ...previousColumnWidthsRef.current,
      ...nextWidths,
    };
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
    setDragOverlayPoint({ x: point.clientX, y: point.clientY });
    setActiveDropTarget(resolveDropTarget(point));
  };

  const clearDragState = () => {
    removeRowDragListeners();
    draggedKeyRef.current = null;
    dropTargetRef.current = null;
    setDraggedKey(null);
    setDragOverlayPoint(null);
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

  const startRowDrag = (key: Key, point: DataGridDragPoint) => {
    if (!withRowReordering || draggedKeyRef.current !== null) return;
    draggedKeyRef.current = key;
    setDraggedKey(key);
    setDragOverlayPoint({ x: point.clientX, y: point.clientY });
    setActiveDropTarget(null);
    installRowDragListeners();
  };

  const handleRowPointerDown = (key: Key, event: ReactPointerEvent<HTMLElement>) => {
    if (!withRowReordering) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    startRowDrag(key, event);
  };

  const handleRowMouseDown = (key: Key, event: ReactMouseEvent<HTMLElement>) => {
    if (!withRowReordering || event.button !== 0) return;
    event.preventDefault();
    startRowDrag(key, event);
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

  const renderDataGridRows = (item: TRow): ReactNode[] => {
    const rowKey = getRowId(item);
    const isDragging = draggedKey === rowKey;
    const isDropTarget = dropTarget?.key === rowKey;
    const isExpandable = isExpandableRow(item);
    const isExpanded = isExpandable && activeExpandedKeys.has(rowKey);
    const expandedContent =
      isExpanded && renderExpandedContent !== undefined
        ? renderExpandedContent(item, { row: item, rowKey, isExpanded })
        : null;
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

    const rows: ReactNode[] = [
      <Table.Row
        id={rowKey}
        key={rowKey}
        aria-expanded={isExpandable ? isExpanded : undefined}
        data-row-expanded={isExpanded || undefined}
        {...rowDragProps}
      >
        {withDragHandles && (
          <Table.Cell
            className="data-grid__drag-handle-cell"
            data-pinned={dragHandlePinnedMeta?.side}
            data-pinned-boundary={dragHandlePinnedMeta?.boundary}
            style={getPinnedStyle(dragHandlePinnedMeta)}
          >
            <DataGridDragHandle
              onClick={(event) => event.stopPropagation()}
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
          const isEditable = isColumnEditable(item, column);
          const isEditing = isEditingCell(rowKey, column);
          const rawValue = readValue(item, column);

          const handleCellClick = (event: ReactMouseEvent<HTMLElement>) => {
            if (!isEditable || isEditing) return;
            event.stopPropagation();
            startCellEdit(item, rowKey, column);
          };

          const handleCellKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
            if (!isEditable || isEditing) return;
            if (event.key !== 'Enter' && event.key !== 'F2') return;
            event.preventDefault();
            event.stopPropagation();
            startCellEdit(item, rowKey, column);
          };

          const handleEditorKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
            event.stopPropagation();

            if (event.key === 'Enter') {
              event.preventDefault();
              commitCellEdit(item, rowKey, column, 'enter', event.currentTarget.value);
              return;
            }

            if (event.key === 'Escape') {
              event.preventDefault();
              cancelCellEdit('escape');
            }
          };

          const handleEditorBlur = () => {
            if (skipNextBlurCommitRef.current) {
              skipNextBlurCommitRef.current = false;
              return;
            }
            commitCellEdit(item, rowKey, column, 'blur');
          };

          const editorInputProps: DataGridCellEditorInputProps = {
            ref: (node) => {
              editInputRef.current = node;
            },
            'aria-invalid': editError !== undefined || undefined,
            'aria-label': `编辑 ${getColumnLabel(column)}`,
            autoFocus: true,
            className: 'data-grid__cell-editor-input',
            title: editError,
            value: editInputValue,
            onBlur: handleEditorBlur,
            onChange: (event) => {
              setEditError(undefined);
              setEditInputValue(event.currentTarget.value);
            },
            onClick: (event) => event.stopPropagation(),
            onKeyDown: handleEditorKeyDown,
          };

          const editorNode = column.editor ? (
            column.editor({
              row: item,
              rowKey,
              column,
              rawValue,
              value: editInputValue,
              error: editError,
              setValue: (value) => {
                setEditError(undefined);
                setEditInputValue(value);
              },
              commit: (value) => commitCellEdit(item, rowKey, column, 'programmatic', value),
              cancel: () => cancelCellEdit('programmatic'),
              inputProps: editorInputProps,
            })
          ) : (
            <input {...editorInputProps} />
          );
          const inlineInputValue = formatCellValue(item, column, rawValue);
          const handleInlineEditorKey = (event: ReactKeyboardEvent<HTMLInputElement>) => {
            event.stopPropagation();

            if (event.key === 'Enter') {
              event.preventDefault();
              commitCellValue(item, rowKey, column, 'enter', event.currentTarget.value);
              event.currentTarget.blur();
              return;
            }

            if (event.key === 'Escape') {
              event.preventDefault();
              event.currentTarget.value = inlineInputValue;
              event.currentTarget.blur();
            }
          };
          const inlineEditorNode = (
            <input
              key={`${String(rowKey)}:${column.id}:${inlineInputValue}`}
              aria-label={`编辑 ${getColumnLabel(column)}`}
              className="data-grid__cell-editor-input data-grid__cell-editor-input--preview"
              defaultValue={inlineInputValue}
              onBlur={(event) => {
                commitCellValue(item, rowKey, column, 'blur', event.currentTarget.value);
              }}
              onClick={(event) => event.stopPropagation()}
              onKeyDown={handleInlineEditorKey}
              onKeyUp={handleInlineEditorKey}
            />
          );
          const cellNode = isEditing ? (
            editorNode
          ) : isEditable && column.editor === undefined ? (
            inlineEditorNode
          ) : isEditable ? (
            <button
              type="button"
              aria-label={`编辑 ${getColumnLabel(column)}`}
              className="data-grid__editable-cell-trigger"
              onClick={handleCellClick}
              onKeyDown={handleCellKeyDown}
            >
              {renderCell(item, column)}
            </button>
          ) : (
            renderCell(item, column)
          );
          const shouldRenderExpander = withExpandableRows && column.id === activeExpandColumnId;
          const renderedCellNode = shouldRenderExpander ? (
            <span className="data-grid__tree-cell">
              {isExpandable ? (
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  aria-label={isExpanded ? '收起行' : '展开行'}
                  className="data-grid__tree-toggle"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleRowExpanded(item, rowKey);
                  }}
                >
                  <TreeToggleIcon expanded={isExpanded} />
                </button>
              ) : (
                <span aria-hidden="true" className="data-grid__tree-toggle-spacer" />
              )}
              <span className="data-grid__tree-content">{cellNode}</span>
            </span>
          ) : (
            cellNode
          );

          return (
            <Table.Cell
              key={column.id}
              data-align={column.align !== 'start' ? column.align : undefined}
              data-editable={isEditable || undefined}
              data-editing={isEditing || undefined}
              data-pinned={pinnedMeta?.side}
              data-pinned-boundary={pinnedMeta?.boundary}
              className={clsx(column.cellClassName, isEditable && 'data-grid__editable-cell')}
              style={getPinnedStyle(pinnedMeta)}
              onClick={handleCellClick}
            >
              {renderedCellNode}
            </Table.Cell>
          );
        })}
      </Table.Row>,
    ];

    if (expandedContent !== null && expandedContent !== undefined) {
      rows.push(
        <Table.Row
          id={getExpandedRowKey(rowKey)}
          key={getExpandedRowKey(rowKey)}
          className="data-grid__expanded-row"
          data-expanded-content="true"
        >
          <Table.Cell colSpan={tableColumnCount} className="data-grid__expanded-cell">
            {expandedContent}
          </Table.Cell>
        </Table.Row>,
      );
    }

    return rows;
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

  const draggedRow =
    draggedKey === null ? undefined : sortedData.find((item) => getRowId(item) === draggedKey);
  const dragLabelColumn = columns.find((column) => column.isRowHeader) ?? columns[0];
  const dragOverlayLabel =
    draggedRow !== undefined && dragLabelColumn !== undefined
      ? formatCellValue(draggedRow, dragLabelColumn)
      : '正在移动行';
  const dragOverlayStyle: DataGridDragOverlayStyle | undefined =
    dragOverlayPoint === null
      ? undefined
      : {
          '--data-grid-drag-x': `${dragOverlayPoint.x}px`,
          '--data-grid-drag-y': `${dragOverlayPoint.y}px`,
        };

  const tableContent = (
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
          const isColumnResizable = enableColumnResizing && column.resizable !== false;
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
              data-resizable={isColumnResizable || undefined}
              width={getColumnWidth(column) ?? (pinnedMeta ? DEFAULT_PINNED_COLUMN_WIDTH : undefined)}
              minWidth={column.minWidth ?? DEFAULT_COLUMN_RESIZE_MIN_WIDTH}
              maxWidth={column.maxWidth ?? DEFAULT_COLUMN_RESIZE_MAX_WIDTH}
              className={clsx(column.headerClassName, isColumnResizable && 'data-grid__resizable-column')}
              style={getPinnedStyle(pinnedMeta)}
            >
              <span data-slot="data-grid-sort-header">
                {headerNode}
                {column.allowsSorting && sortDirection !== undefined && (
                  <SortIcon direction={sortDirection} />
                )}
              </span>
              {isColumnResizable && (
                <Table.ColumnResizer
                  aria-label={`调整 ${getColumnLabel(column)} 列宽`}
                  className="data-grid__column-resizer"
                />
              )}
            </Table.Column>
          );
        })}
      </Table.Header>
      {isVirtualized ? (
        <Table.Body className="data-grid__virtual-body" renderEmptyState={renderEmptyState}>
          {renderVirtualSpacerRow(VIRTUAL_TOP_SPACER_KEY, virtualTopSpacer)}
          {virtualRows.flatMap((item) => renderDataGridRows(item))}
          {renderVirtualSpacerRow(VIRTUAL_BOTTOM_SPACER_KEY, virtualBottomSpacer)}
        </Table.Body>
      ) : (
        <Table.Body renderEmptyState={renderEmptyState}>
          {virtualRows.flatMap((item) => renderDataGridRows(item))}
        </Table.Body>
      )}
    </Table.Content>
  );

  const scrollContainerProps = {
    ref: scrollContainerRef,
    className: clsx('data-grid__scroll-container', scrollContainerClassName),
    'data-virtualized': isVirtualized || undefined,
    style: virtualScrollContainerStyle,
  };

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
      {enableColumnResizing ? (
        <Table.ResizableContainer {...scrollContainerProps} onResize={handleColumnResize}>
          {tableContent}
        </Table.ResizableContainer>
      ) : (
        <Table.ScrollContainer {...scrollContainerProps}>{tableContent}</Table.ScrollContainer>
      )}
      {dragOverlayPoint !== null && draggedKey !== null && (
        <div
          aria-hidden="true"
          className="data-grid__drag-overlay"
          data-drop-position={dropTarget?.position}
          style={dragOverlayStyle}
        >
          <DragHandleIcon />
          <span className="data-grid__drag-overlay-label">{dragOverlayLabel}</span>
        </div>
      )}
    </Table.Root>
  );
}
DataGrid.displayName = 'DataGrid';

export default DataGrid;
