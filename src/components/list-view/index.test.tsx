import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ListView from './index';

const FILES = [
  { id: '1', name: 'Project proposal.pdf' },
  { id: '2', name: 'Q4 report.xlsx' },
  { id: '3', name: 'Design assets.zip' },
];

const renderList = (props?: Record<string, unknown>) =>
  render(
    <ListView aria-label="Files" items={FILES} {...props}>
      {(file: { id: string; name: string }) => (
        <ListView.Item id={file.id} textValue={file.name}>
          <ListView.ItemContent>
            <ListView.Title>{file.name}</ListView.Title>
          </ListView.ItemContent>
        </ListView.Item>
      )}
    </ListView>,
  );

describe('ListView', () => {
  it('renders a grid with rows and BEM class + data-slot', () => {
    renderList();
    const grid = screen.getByRole('grid', { name: 'Files' });
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass('list-view', 'list-view--primary');
    expect(grid).toHaveAttribute('data-slot', 'list-view');
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getByText('Project proposal.pdf')).toBeInTheDocument();
  });

  it('applies the secondary variant modifier class', () => {
    renderList({ variant: 'secondary' });
    expect(screen.getByRole('grid')).toHaveClass('list-view--secondary');
  });

  // 回归：行点击 -> 单选回调，且回调收到所选 key
  it('fires onSelectionChange with the clicked row key (single selection)', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderList({ selectionMode: 'single', onSelectionChange });

    const rows = screen.getAllByRole('row');
    await user.click(within(rows[1]).getByText('Q4 report.xlsx'));

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    const selection = onSelectionChange.mock.calls[0][0] as Set<string>;
    expect(Array.from(selection)).toEqual(['2']);
  });

  // 回归：多选模式下行被点击进入选中态（aria-selected）
  it('marks a row selected after click in multiple mode', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderList({ selectionMode: 'multiple', onSelectionChange });

    const rows = screen.getAllByRole('row');
    await user.click(within(rows[0]).getByText('Project proposal.pdf'));

    expect(onSelectionChange).toHaveBeenCalled();
    const selection = onSelectionChange.mock.calls.at(-1)?.[0] as Set<string>;
    expect(Array.from(selection)).toContain('1');
  });

  // 回归：受控 defaultSelectedKeys 初始即选中对应行
  it('honors defaultSelectedKeys (controlled initial selection)', () => {
    renderList({ selectionMode: 'single', defaultSelectedKeys: ['3'] });
    const selectedRow = screen
      .getAllByRole('row')
      .find((row) => row.getAttribute('aria-selected') === 'true');
    expect(selectedRow).toBeDefined();
    expect(within(selectedRow as HTMLElement).getByText('Design assets.zip')).toBeInTheDocument();
  });

  it('disables rows listed in disabledKeys', () => {
    renderList({ selectionMode: 'single', disabledKeys: ['2'] });
    const disabledRow = screen
      .getAllByRole('row')
      .find((row) => within(row).queryByText('Q4 report.xlsx'));
    expect(disabledRow).toHaveAttribute('aria-disabled', 'true');
  });
});
