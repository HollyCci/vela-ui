import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CellSelect from './index';

const OPTIONS = [
  { id: 'morning', label: 'Morning' },
  { id: 'afternoon', label: 'Afternoon' },
  { id: 'evening', label: 'Evening' },
];

const renderCell = (props: Record<string, unknown> = {}) =>
  render(
    <CellSelect aria-label="slot" {...props}>
      <CellSelect.Trigger>
        <CellSelect.Label>Slot</CellSelect.Label>
        <CellSelect.Value />
        <CellSelect.Indicator />
      </CellSelect.Trigger>
      <CellSelect.Popover>
        <CellSelect.List>
          {OPTIONS.map((o) => (
            <CellSelect.Item key={o.id} id={o.id} textValue={o.label}>
              {o.label}
              <CellSelect.ItemIndicator />
            </CellSelect.Item>
          ))}
        </CellSelect.List>
      </CellSelect.Popover>
    </CellSelect>,
  );

describe('CellSelect', () => {
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
    const { container } = renderCell();
    expect(container.querySelector('[data-slot="cell-select"]')).toHaveClass('cell-select');
    expect(container.querySelector('[data-slot="cell-select-label"]')).toHaveClass(
      'cell-select__label',
    );
    expect(container.querySelector('[data-slot="cell-select-trigger"]')).toHaveClass(
      'cell-select__trigger',
    );
  });

  it('default variant applies the --default modifier on the trigger', () => {
    const { container } = renderCell();
    expect(container.querySelector('[data-slot="cell-select-trigger"]')).toHaveClass(
      'cell-select__trigger--default',
    );
  });

  it('secondary variant applies the --secondary modifier on the trigger', () => {
    const { container } = renderCell({ variant: 'secondary' });
    expect(container.querySelector('[data-slot="cell-select-trigger"]')).toHaveClass(
      'cell-select__trigger--secondary',
    );
  });

  it('opens listbox and fires onSelectionChange on item click', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderCell({ onSelectionChange });

    await user.click(screen.getByRole('button'));
    const listbox = await screen.findByRole('listbox');
    await user.click(within(listbox).getByRole('option', { name: 'Evening' }));

    await waitFor(() => expect(onSelectionChange).toHaveBeenCalledWith('evening'));
  });

  it('disabled select keeps the trigger disabled', async () => {
    const user = userEvent.setup();
    renderCell({ isDisabled: true, defaultValue: 'morning' });

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    await user.click(button);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
