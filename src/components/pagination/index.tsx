'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

export type PaginationSize = 'sm' | 'md' | 'lg';

export type PaginationProps = Omit<HTMLAttributes<HTMLElement>, 'onChange'> & {
  /** 总页数 */
  count: number;
  /** 当前页（从 1 开始） */
  page: number;
  onPageChange?: (page: number) => void;
  size?: PaginationSize;
  /** 左侧摘要文案，如「共 128 条」 */
  summary?: ReactNode;
};

type PageButtonProps = {
  page: number;
  isActive: boolean;
  onSelect?: (page: number) => void;
};

const PageButton = ({ page, isActive, onSelect }: PageButtonProps) => {
  const handleClick = () => {
    onSelect?.(page);
  };

  return (
    <li className="pagination__item">
      <button
        type="button"
        className="pagination__link"
        data-active={isActive || undefined}
        aria-current={isActive ? 'page' : undefined}
        aria-label={`第 ${page} 页`}
        onClick={handleClick}
      >
        {page}
      </button>
    </li>
  );
};

PageButton.displayName = 'Pagination.PageButton';

type NavButtonProps = {
  label: string;
  targetPage: number;
  isDisabled: boolean;
  onSelect?: (page: number) => void;
  children: ReactNode;
};

const NavButton = ({ label, targetPage, isDisabled, onSelect, children }: NavButtonProps) => {
  const handleClick = () => {
    onSelect?.(targetPage);
  };

  return (
    <li className="pagination__item">
      <button
        type="button"
        className="pagination__link pagination__link--nav"
        aria-label={label}
        disabled={isDisabled}
        onClick={handleClick}
      >
        {children}
      </button>
    </li>
  );
};

NavButton.displayName = 'Pagination.NavButton';

/** 计算需要展示的页码序列，null 表示省略号 */
const getPageItems = (count: number, page: number): Array<number | null> => {
  if (count <= 7) {
    return Array.from({ length: count }, (_, index) => index + 1);
  }
  const start = Math.max(2, page - 1);
  const end = Math.min(count - 1, page + 1);
  const items: Array<number | null> = [1];
  if (start > 2) items.push(null);
  for (let current = start; current <= end; current += 1) {
    items.push(current);
  }
  if (end < count - 1) items.push(null);
  items.push(count);
  return items;
};

const Pagination = forwardRef<HTMLElement, PaginationProps>(
  ({ count, page, onPageChange, size = 'md', summary, className, ...rest }, ref) => {
    const pageItems = getPageItems(count, page).map((item, index) =>
      item === null ? (
        // eslint-disable-next-line react/no-array-index-key
        <li key={`ellipsis-${index}`} className="pagination__item">
          <span className="pagination__ellipsis" aria-hidden="true">
            …
          </span>
        </li>
      ) : (
        <PageButton key={item} page={item} isActive={item === page} onSelect={onPageChange} />
      ),
    );

    return (
      <nav
        ref={ref}
        aria-label="分页"
        className={clsx('pagination', size !== 'md' && `pagination--${size}`, className)}
        {...rest}
      >
        {summary !== undefined && <div className="pagination__summary">{summary}</div>}
        <ul className="pagination__content" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          <NavButton label="上一页" targetPage={page - 1} isDisabled={page <= 1} onSelect={onPageChange}>
            ‹ 上一页
          </NavButton>
          {pageItems}
          <NavButton
            label="下一页"
            targetPage={page + 1}
            isDisabled={page >= count}
            onSelect={onPageChange}
          >
            下一页 ›
          </NavButton>
        </ul>
      </nav>
    );
  },
);

Pagination.displayName = 'Pagination';

export default Pagination;
