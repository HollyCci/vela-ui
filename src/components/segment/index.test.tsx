import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Segment from './index';

const RANGES = [
  { id: 'day', label: '日' },
  { id: 'week', label: '周' },
  { id: 'month', label: '月' },
];

const renderSegment = (props?: Record<string, unknown>) =>
  render(
    <Segment aria-label="统计周期" {...props}>
      {RANGES.map((r) => (
        <Segment.Item key={r.id} id={r.id}>
          {r.label}
        </Segment.Item>
      ))}
    </Segment>,
  );

describe('Segment', () => {
  it('renders a single-select group with the data-slot', () => {
    renderSegment({ defaultSelectedKey: 'day' });
    const group = document.querySelector('[data-slot="segment"]');
    expect(group).not.toBeNull();
    expect(group).toHaveAttribute('data-separators', 'true');
    expect(group).toHaveClass('segment');
  });

  it('default selected item is pressed/selected', () => {
    renderSegment({ defaultSelectedKey: 'week' });
    const week = screen.getByRole('radio', { name: '周' });
    expect(week).toHaveAttribute('aria-checked', 'true');
    const day = screen.getByRole('radio', { name: '日' });
    expect(day).toHaveAttribute('aria-checked', 'false');
  });

  it('onSelectionChange fires with the clicked single key', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderSegment({ defaultSelectedKey: 'day', onSelectionChange });

    await user.click(screen.getByRole('radio', { name: '月' }));
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenCalledWith('month');
  });

  it('controlled selectedKey reflects in aria-checked after rerender', () => {
    const { rerender } = renderSegment({ selectedKey: 'day', onSelectionChange: () => undefined });
    expect(screen.getByRole('radio', { name: '日' })).toHaveAttribute('aria-checked', 'true');

    rerender(
      <Segment aria-label="统计周期" selectedKey="month" onSelectionChange={() => undefined}>
        {RANGES.map((r) => (
          <Segment.Item key={r.id} id={r.id}>
            {r.label}
          </Segment.Item>
        ))}
      </Segment>,
    );
    expect(screen.getByRole('radio', { name: '月' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: '日' })).toHaveAttribute('aria-checked', 'false');
  });

  it('ghost variant + size add modifier classes', () => {
    renderSegment({ defaultSelectedKey: 'day', variant: 'ghost', size: 'lg' });
    const group = document.querySelector('[data-slot="segment"]');
    expect(group).toHaveClass('segment--lg');
    expect(group).toHaveClass('segment--ghost');
  });

  it('showSeparators=false flips the data attribute', () => {
    renderSegment({ defaultSelectedKey: 'day', showSeparators: false });
    expect(document.querySelector('[data-slot="segment"]')).toHaveAttribute('data-separators', 'false');
  });
});
