import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Select from './index';

const OPTIONS = [
  { id: 'created', label: 'By created' },
  { id: 'updated', label: 'By updated' },
  { id: 'name', label: 'By name' },
];

const renderSelect = (props: Record<string, unknown> = {}) =>
  render(
    <Select aria-label="sort" {...props}>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <Select.List>
          {OPTIONS.map((o) => (
            <Select.Item key={o.id} id={o.id} textValue={o.label}>
              {o.label}
              <Select.ItemIndicator />
            </Select.Item>
          ))}
        </Select.List>
      </Select.Popover>
    </Select>,
  );

describe('Select', () => {
  beforeEach(() => {
    // RAC overlays may probe matchMedia / ResizeObserver
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

  it('renders root with base class + data-slot and a trigger button', () => {
    const { container } = renderSelect();
    expect(container.querySelector('[data-slot="select"]')).toHaveClass('select');
    expect(screen.getByRole('button')).toHaveClass('select__trigger');
  });

  it('secondary variant + fullWidth add modifier classes', () => {
    const { container } = renderSelect({ variant: 'secondary', fullWidth: true });
    const root = container.querySelector('[data-slot="select"]') as HTMLElement;
    expect(root).toHaveClass('select--secondary');
    expect(root).toHaveClass('select--full-width');
  });

  it('opens the listbox and fires onSelectionChange when an item is chosen', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderSelect({ onSelectionChange });

    await user.click(screen.getByRole('button'));
    const listbox = await screen.findByRole('listbox');
    await user.click(within(listbox).getByRole('option', { name: 'By name' }));

    await waitFor(() => expect(onSelectionChange).toHaveBeenCalledWith('name'));
  });

  it('default indicator svg is rendered inside the trigger', () => {
    const { container } = renderSelect();
    // OSS Select.Indicator clones the child svg, applying class + data-slot="select-indicator".
    const indicator = container.querySelector('svg.select__indicator');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveAttribute('data-slot', 'select-indicator');
  });
});
