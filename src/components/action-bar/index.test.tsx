import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActionBar from './index';

describe('ActionBar', () => {
  // 回归：isOpen=true 时渲染内容（toolbar + 子节点可见）
  it('renders content when isOpen is true', () => {
    render(
      <ActionBar isOpen>
        <ActionBar.Content>
          <button type="button">Delete</button>
        </ActionBar.Content>
      </ActionBar>,
    );
    expect(screen.getByRole('toolbar', { name: 'Actions' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    const root = document.querySelector('.action-bar');
    expect(root).toHaveAttribute('data-state', 'open');
  });

  // 回归：初始 isOpen=false 时完全不渲染（无 DOM）
  it('renders nothing when initially closed', () => {
    render(
      <ActionBar isOpen={false}>
        <ActionBar.Content>
          <button type="button">Delete</button>
        </ActionBar.Content>
      </ActionBar>,
    );
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
    expect(document.querySelector('.action-bar')).not.toBeInTheDocument();
  });

  // 回归：isOpen 由 true -> false 后，退场兜底计时器到期卸载 DOM
  it('unmounts after exit fallback when isOpen flips to false', () => {
    vi.useFakeTimers();
    try {
      const { rerender } = render(
        <ActionBar isOpen>
          <ActionBar.Content>
            <button type="button">Delete</button>
          </ActionBar.Content>
        </ActionBar>,
      );
      expect(document.querySelector('.action-bar')).toBeInTheDocument();

      rerender(
        <ActionBar isOpen={false}>
          <ActionBar.Content>
            <button type="button">Delete</button>
          </ActionBar.Content>
        </ActionBar>,
      );
      // closing 状态：仍在 DOM，data-state=closed
      expect(document.querySelector('.action-bar')).toHaveAttribute('data-state', 'closed');

      // 退场兜底计时器（300ms）到期后卸载
      act(() => {
        vi.advanceTimersByTime(350);
      });
      expect(document.querySelector('.action-bar')).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  // 回归：内部按钮点击触发回调
  it('fires inner button callback on click', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <ActionBar isOpen>
        <ActionBar.Content>
          <button type="button" onClick={onDelete}>
            Delete
          </button>
        </ActionBar.Content>
      </ActionBar>,
    );
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('uses a custom aria-label when provided', () => {
    render(
      <ActionBar isOpen aria-label="Bulk actions">
        <ActionBar.Label>Selected</ActionBar.Label>
      </ActionBar>,
    );
    expect(screen.getByRole('toolbar', { name: 'Bulk actions' })).toBeInTheDocument();
  });

  it('renders prefix/content/suffix section slots with BEM classes', () => {
    render(
      <ActionBar isOpen>
        <ActionBar.Prefix>
          <ActionBar.Label>Selected</ActionBar.Label>
        </ActionBar.Prefix>
        <ActionBar.Content>content</ActionBar.Content>
        <ActionBar.Suffix>suffix</ActionBar.Suffix>
      </ActionBar>,
    );
    expect(document.querySelector('.action-bar__prefix')).toBeInTheDocument();
    expect(document.querySelector('.action-bar__content')).toBeInTheDocument();
    expect(document.querySelector('.action-bar__suffix')).toBeInTheDocument();
    expect(document.querySelector('.action-bar__label')).toHaveTextContent('Selected');
  });
});
