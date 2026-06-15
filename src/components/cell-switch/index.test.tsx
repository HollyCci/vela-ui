import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CellSwitch from './index';

const renderSwitch = (props: Record<string, unknown> = {}) =>
  render(
    <CellSwitch aria-label="reminder" {...props}>
      <CellSwitch.Trigger>
        <CellSwitch.Label>Reminder</CellSwitch.Label>
        <CellSwitch.Control />
      </CellSwitch.Trigger>
    </CellSwitch>,
  );

describe('CellSwitch', () => {
  it('renders root + trigger + label + control with data-slots and classes', () => {
    const { container } = renderSwitch();
    expect(container.querySelector('[data-slot="cell-switch"]')).toHaveClass('cell-switch');
    expect(container.querySelector('[data-slot="cell-switch-trigger"]')).toHaveClass(
      'cell-switch__trigger',
    );
    expect(container.querySelector('[data-slot="cell-switch-label"]')).toHaveTextContent(
      'Reminder',
    );
    expect(container.querySelector('[data-slot="cell-switch-control"]')).toHaveClass(
      'cell-switch__control',
    );
    // role=switch is provided by the RAC/OSS Switch base
    expect(screen.getByRole('switch', { name: 'reminder' })).toBeInTheDocument();
  });

  it('default variant applies --default modifier on the trigger', () => {
    const { container } = renderSwitch();
    expect(container.querySelector('[data-slot="cell-switch-trigger"]')).toHaveClass(
      'cell-switch__trigger--default',
    );
  });

  it('secondary variant applies --secondary modifiers on root and control', () => {
    const { container } = renderSwitch({ variant: 'secondary' });
    expect(container.querySelector('[data-slot="cell-switch"]')).toHaveClass(
      'cell-switch--secondary',
    );
    expect(container.querySelector('[data-slot="cell-switch-control"]')).toHaveClass(
      'cell-switch__control--secondary',
    );
  });

  it('toggles and fires onChange when clicked (controlled selected reflects aria-checked)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderSwitch({ isSelected: true, onChange });

    const sw = screen.getByRole('switch', { name: 'reminder' });
    expect(sw).toBeChecked();
    await user.click(sw);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('disabled switch does not fire onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderSwitch({ isDisabled: true, onChange });

    const sw = screen.getByRole('switch', { name: 'reminder' });
    expect(sw).toBeDisabled();
    await user.click(sw);
    expect(onChange).not.toHaveBeenCalled();
  });
});
