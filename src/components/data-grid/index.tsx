import { forwardRef, type ForwardedRef, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

export type DataGridAlign = 'left' | 'right' | 'center';

export type DataGridColumn<TRow> = {
  key: string;
  title: ReactNode;
  /** 单元格渲染，省略时按 key 读取行对象字段 */
  render?: (row: TRow) => ReactNode;
  align?: DataGridAlign;
  width?: number | string;
};

export type DataGridProps<TRow> = HTMLAttributes<HTMLDivElement> & {
  columns: DataGridColumn<TRow>[];
  rows: TRow[];
  /** 行唯一标识 */
  rowKey: (row: TRow) => string;
  /** 选中行 key 集合（仅展示态） */
  selectedKeys?: string[];
  /** 无数据时的提示文案 */
  emptyText?: ReactNode;
};

const cellContent = <TRow,>(row: TRow, column: DataGridColumn<TRow>): ReactNode => {
  if (column.render) {
    return column.render(row);
  }
  const value = (row as unknown as Record<string, unknown>)[column.key];
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }
  return String(value);
};

const DataGridInner = <TRow,>(
  {
    columns,
    rows,
    rowKey,
    selectedKeys = [],
    emptyText = '暂无数据',
    className,
    ...rest
  }: DataGridProps<TRow>,
  ref: ForwardedRef<HTMLDivElement>,
) => {
  const isEmpty = rows.length === 0;
  return (
    <div ref={ref} className={clsx('data-grid', className)} {...rest}>
      <div className="table__scroll-container">
        <table className="table__content">
          <thead className="table__header">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="table__column"
                  style={{ width: column.width, textAlign: column.align }}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="table__body">
            {rows.map((row) => {
              const key = rowKey(row);
              const isSelected = selectedKeys.includes(key);
              return (
                <tr
                  key={key}
                  className="table__row"
                  data-selected={isSelected || undefined}
                  aria-selected={isSelected || undefined}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="table__cell"
                      style={{ textAlign: column.align }}
                    >
                      {cellContent(row, column)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {isEmpty && <div className="data-grid__empty-state">{emptyText}</div>}
    </div>
  );
};

type DataGridComponent = <TRow>(
  props: DataGridProps<TRow> & { ref?: ForwardedRef<HTMLDivElement> },
) => ReactNode;

const DataGrid = forwardRef(DataGridInner) as DataGridComponent & { displayName?: string };
DataGrid.displayName = 'DataGrid';

export default DataGrid;
