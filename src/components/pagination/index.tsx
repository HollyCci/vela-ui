'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';
import {
  Pagination as HeroPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationSummary,
} from '@heroui/react';

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

const PageButton = ({ page, isActive, onSelect }: PageButtonProps) => (
  <PaginationItem>
    <PaginationLink
      isActive={isActive}
      aria-label={`第 ${page} 页`}
      onPress={() => onSelect?.(page)}
    >
      {page}
    </PaginationLink>
  </PaginationItem>
);

PageButton.displayName = 'Pagination.PageButton';

type NavButtonProps = {
  label: string;
  targetPage: number;
  isDisabled: boolean;
  direction: 'previous' | 'next';
  onSelect?: (page: number) => void;
  children: ReactNode;
};

const NavButton = ({ label, targetPage, isDisabled, direction, onSelect, children }: NavButtonProps) => {
  const NavLink = direction === 'previous' ? PaginationPrevious : PaginationNext;
  return (
    <PaginationItem>
      <NavLink aria-label={label} isDisabled={isDisabled} onPress={() => onSelect?.(targetPage)}>
        {children}
      </NavLink>
    </PaginationItem>
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

/**
 * 包裹 @heroui/react 的真实 Pagination 复合组件（其 Link/Previous/Next 基于
 * react-aria-components 的 Button，真 a11y / 键盘 / 焦点 / 按压态）。slots 复用
 * @heroui/styles 的 paginationVariants，输出 .pagination / .pagination__* 类匹配
 * CSS 分片。高层 count/page/onPageChange/summary 契约由本包装维持不变。
 */
const Pagination = forwardRef<HTMLElement, PaginationProps>(
  ({ count, page, onPageChange, size = 'md', summary, className, ...rest }, ref) => {
    const pageItems = getPageItems(count, page).map((item, index) =>
      item === null ? (
        // eslint-disable-next-line react/no-array-index-key
        <PaginationItem key={`ellipsis-${index}`}>
          <PaginationEllipsis />
        </PaginationItem>
      ) : (
        <PageButton key={item} page={item} isActive={item === page} onSelect={onPageChange} />
      ),
    );

    return (
      <HeroPagination
        ref={ref}
        aria-label="分页"
        size={size}
        className={clsx('pagination', className)}
        {...rest}
      >
        {summary !== undefined && <PaginationSummary>{summary}</PaginationSummary>}
        <PaginationContent>
          <NavButton
            label="上一页"
            direction="previous"
            targetPage={page - 1}
            isDisabled={page <= 1}
            onSelect={onPageChange}
          >
            ‹ 上一页
          </NavButton>
          {pageItems}
          <NavButton
            label="下一页"
            direction="next"
            targetPage={page + 1}
            isDisabled={page >= count}
            onSelect={onPageChange}
          >
            下一页 ›
          </NavButton>
        </PaginationContent>
      </HeroPagination>
    );
  },
);

Pagination.displayName = 'Pagination';

export default Pagination;
