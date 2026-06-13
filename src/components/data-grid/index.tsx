import { type CSSProperties, type ReactNode } from 'react';
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

export type DataGridVariant = 'primary' | 'secondary';
export type DataGridAlign = 'start' | 'center' | 'end';

/** 排序状态信息，传给 header 渲染函数（原站 API） */
export type DataGridSortInfo = {
  sortDirection?: SortDirection;
};

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

/** 选择 checkbox（原站在选择列/行内用 slot="selection" 的 OSS Checkbox） */
const DataGridSelectionCheckbox = () => (
  <Checkbox slot="selection">
    <Checkbox.Control>
      <Checkbox.Indicator />
    </Checkbox.Control>
  </Checkbox>
);
DataGridSelectionCheckbox.displayName = 'DataGrid.SelectionCheckbox';

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
  sortDescriptor,
  defaultSortDescriptor,
  onSortChange,
  onRowAction,
  disabledKeys,
  renderEmptyState,
  contentClassName,
  scrollContainerClassName,
  className,
  style,
  'aria-label': ariaLabel,
  ...rest
}: DataGridProps<TRow>) {
  // 受控排序：外部提供 sortDescriptor → 不在本地重排，交由调用方处理（服务端排序）
  const isControlledSort = sortDescriptor !== undefined;
  const activeSort = sortDescriptor ?? defaultSortDescriptor;
  const withSelection = showSelectionCheckboxes && selectionMode !== 'none';

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

  return (
    <Table.Root
      data-slot="data-grid"
      data-vertical-align={verticalAlign}
      variant={variant}
      className={clsx('data-grid', className)}
      style={style}
      {...rest}
    >
      <Table.ScrollContainer className={scrollContainerClassName}>
        <Table.Content
          aria-label={ariaLabel}
          className={contentClassName}
          selectionMode={selectionMode}
          selectedKeys={selectedKeys}
          defaultSelectedKeys={defaultSelectedKeys}
          onSelectionChange={onSelectionChange}
          sortDescriptor={sortDescriptor ?? defaultSortDescriptor}
          onSortChange={onSortChange}
          onRowAction={onRowAction}
          disabledKeys={disabledKeys}
        >
          <Table.Header>
            {withSelection && (
              <Table.Column className="data-grid__selection-column">
                {selectionMode === 'multiple' ? <DataGridSelectionCheckbox /> : null}
              </Table.Column>
            )}
            {columns.map((column) => {
              const isSorted = activeSort?.column === column.id;
              const sortDirection = isSorted ? activeSort?.direction : undefined;
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
                  width={column.width}
                  className={column.headerClassName}
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
          <Table.Body items={sortedData} renderEmptyState={renderEmptyState}>
            {(item: TRow) => (
              <Table.Row id={getRowId(item)}>
                {withSelection && (
                  <Table.Cell className="data-grid__selection-cell">
                    <DataGridSelectionCheckbox />
                  </Table.Cell>
                )}
                {columns.map((column) => (
                  <Table.Cell
                    key={column.id}
                    data-align={column.align !== 'start' ? column.align : undefined}
                    className={column.cellClassName}
                  >
                    {renderCell(item, column)}
                  </Table.Cell>
                ))}
              </Table.Row>
            )}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table.Root>
  );
}
DataGrid.displayName = 'DataGrid';

export default DataGrid;
