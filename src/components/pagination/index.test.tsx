import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import Pagination from './index';

describe('Pagination', () => {
  it('renders nav with aria-label and the active page marked', () => {
    render(<Pagination count={5} page={2} />);
    const nav = screen.getByRole('navigation', { name: '分页' });
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveClass('pagination');

    // 当前页按钮 aria-current=page + data-active
    const current = within(nav).getByRole('button', { name: '第 2 页' });
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current).toHaveAttribute('data-active', 'true');
  });

  // 回归：受控 onPageChange——点页码触发回调并能切换 active（配合受控 rerender）
  it('regression: controlled onPageChange fires with the clicked page and active follows after rerender', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const { rerender } = render(<Pagination count={5} page={1} onPageChange={onPageChange} />);

    // page=1 时第 1 页是 active
    expect(screen.getByRole('button', { name: '第 1 页' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: '第 3 页' })).not.toHaveAttribute('aria-current');

    await user.click(screen.getByRole('button', { name: '第 3 页' }));
    expect(onPageChange).toHaveBeenCalledTimes(1);
    expect(onPageChange).toHaveBeenCalledWith(3);

    // 受控：父组件据回调把 page 推到 3，active 跟随切换
    rerender(<Pagination count={5} page={3} onPageChange={onPageChange} />);
    expect(screen.getByRole('button', { name: '第 3 页' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: '第 1 页' })).not.toHaveAttribute('aria-current');
  });

  it('prev is disabled on first page and fires targetPage on next', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination count={5} page={1} onPageChange={onPageChange} />);

    const prev = screen.getByRole('button', { name: '上一页' });
    const next = screen.getByRole('button', { name: '下一页' });
    expect(prev).toBeDisabled();
    expect(next).not.toBeDisabled();

    await user.click(next);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('next is disabled on last page', () => {
    render(<Pagination count={5} page={5} />);
    expect(screen.getByRole('button', { name: '下一页' })).toBeDisabled();
  });

  it('renders ellipsis when count exceeds the inline window', () => {
    render(<Pagination count={20} page={10} />);
    // 省略号是 aria-hidden 的 span，断言其文本存在
    const ellipses = document.querySelectorAll('.pagination__ellipsis');
    expect(ellipses.length).toBeGreaterThan(0);
    // 首尾页恒在
    expect(screen.getByRole('button', { name: '第 1 页' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '第 20 页' })).toBeInTheDocument();
  });

  it('renders summary and size modifier class', () => {
    render(<Pagination count={3} page={1} size="sm" summary="共 3 条" />);
    expect(screen.getByText('共 3 条')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: '分页' })).toHaveClass('pagination--sm');
  });

  it('has no axe a11y violations', async () => {
    const { container } = render(<Pagination count={20} page={10} summary="共 200 条" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
