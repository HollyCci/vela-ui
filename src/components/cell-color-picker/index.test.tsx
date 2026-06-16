import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import CellColorPicker, { parseCellColor } from './index';

const renderPicker = (props: Record<string, unknown> = {}) =>
  render(
    <CellColorPicker {...props}>
      <CellColorPicker.Trigger>
        <CellColorPicker.Label>Accent</CellColorPicker.Label>
        <CellColorPicker.ValueDisplay />
        <CellColorPicker.Swatch />
      </CellColorPicker.Trigger>
    </CellColorPicker>,
  );

describe('CellColorPicker', () => {
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

  it('parseCellColor parses a hex string into a Color and round-trips to uppercase hex', () => {
    const color = parseCellColor('#3b82f6');
    expect(color.toString('hex').toUpperCase()).toBe('#3B82F6');
  });

  it('renders trigger button + label + value-display + swatch with data-slots', () => {
    const { container } = renderPicker({ defaultValue: '#3B82F6' });
    expect(container.querySelector('[data-slot="cell-color-picker-trigger"]')).toHaveClass(
      'cell-color-picker__trigger',
    );
    expect(container.querySelector('[data-slot="cell-color-picker-label"]')).toHaveTextContent(
      'Accent',
    );
    expect(
      container.querySelector('[data-slot="cell-color-picker-value-display"]'),
    ).toBeInTheDocument();
    // RAC Button renders a real <button>
    expect(screen.getByRole('button', { name: /Accent/ })).toBeInTheDocument();
  });

  it('ValueDisplay shows the current color as uppercase hex from picker state', () => {
    const { container } = renderPicker({ defaultValue: '#ff5733' });
    expect(
      container.querySelector('[data-slot="cell-color-picker-value-display"]'),
    ).toHaveTextContent('#FF5733');
  });

  it('default variant applies --default modifier on the trigger', () => {
    const { container } = renderPicker({ defaultValue: '#3B82F6' });
    expect(container.querySelector('[data-slot="cell-color-picker-trigger"]')).toHaveClass(
      'cell-color-picker__trigger--default',
    );
  });

  it('secondary variant applies --secondary modifier on the trigger', () => {
    const { container } = renderPicker({ defaultValue: '#22C55E', variant: 'secondary' });
    expect(container.querySelector('[data-slot="cell-color-picker-trigger"]')).toHaveClass(
      'cell-color-picker__trigger--secondary',
    );
  });

  it('disabled trigger renders a disabled button', () => {
    const { container } = render(
      <CellColorPicker defaultValue="#EF4444">
        <CellColorPicker.Trigger isDisabled>
          <CellColorPicker.Label>Disabled</CellColorPicker.Label>
          <CellColorPicker.ValueDisplay />
          <CellColorPicker.Swatch />
        </CellColorPicker.Trigger>
      </CellColorPicker>,
    );
    const button = container.querySelector('[data-slot="cell-color-picker-trigger"]');
    expect(button).toBeDisabled();
  });

  it('has no axe a11y violations', async () => {
    const { container } = renderPicker({ defaultValue: '#3B82F6' });
    expect(await axe(container)).toHaveNoViolations();
  });
});
