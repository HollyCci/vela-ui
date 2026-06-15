import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InlineSelect from './index';

const OPTIONS = [
  { id: 'created', label: 'By created' },
  { id: 'updated', label: 'By updated' },
  { id: 'name', label: 'By name' },
];

const renderInline = (props: Record<string, unknown> = {}) =>
  render(
    <InlineSelect aria-label="sort" {...props}>
      <InlineSelect.Trigger>
        <InlineSelect.Value />
        <InlineSelect.Indicator />
      </InlineSelect.Trigger>
      <InlineSelect.Popover>
        <InlineSelect.List>
          {OPTIONS.map((o) => (
            <InlineSelect.Item key={o.id} id={o.id} textValue={o.label}>
              {o.label}
              <InlineSelect.ItemIndicator />
            </InlineSelect.Item>
          ))}
        </InlineSelect.List>
      </InlineSelect.Popover>
    </InlineSelect>,
  );

describe('InlineSelect', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: false,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
      }),
    );
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });

  it('renders root + trigger with BEM classes and data-slots', () => {
    const { container } = renderInline();
    expect(container.querySelector('[data-slot="inline-select"]')).toHaveClass('inline-select');
    const trigger = container.querySelector('[data-slot="inline-select-trigger"]');
    expect(trigger).toHaveClass('inline-select__trigger');
    expect(container.querySelector('[data-slot="inline-select-value"]')).toHaveClass(
      'inline-select__value',
    );
  });

  it('opens listbox and fires onSelectionChange on item click', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderInline({ onSelectionChange });

    await user.click(screen.getByRole('button'));
    const listbox = await screen.findByRole('listbox');
    await user.click(within(listbox).getByRole('option', { name: 'By updated' }));

    await waitFor(() => expect(onSelectionChange).toHaveBeenCalledWith('updated'));
  });

  it('supports multiple selection mode (listbox is multi-selectable)', async () => {
    const user = userEvent.setup();
    renderInline({ selectionMode: 'multiple', defaultValue: ['created'] });

    await user.click(screen.getByRole('button'));
    const listbox = await screen.findByRole('listbox');
    expect(listbox).toHaveAttribute('aria-multiselectable', 'true');
  });

  it('disabled select keeps trigger non-interactive (listbox does not open)', async () => {
    const user = userEvent.setup();
    renderInline({ isDisabled: true, defaultValue: 'created' });

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    await user.click(button);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
