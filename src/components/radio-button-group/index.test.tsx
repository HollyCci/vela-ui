import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import RadioButtonGroup from './index';

const renderGroup = (props: Record<string, unknown> = {}) =>
  render(
    <RadioButtonGroup aria-label="cycle" {...props}>
      <RadioButtonGroup.Item value="weekly">
        <RadioButtonGroup.Indicator />
        <RadioButtonGroup.ItemContent>Weekly</RadioButtonGroup.ItemContent>
      </RadioButtonGroup.Item>
      <RadioButtonGroup.Item value="monthly">
        <RadioButtonGroup.Indicator />
        <RadioButtonGroup.ItemContent>Monthly</RadioButtonGroup.ItemContent>
      </RadioButtonGroup.Item>
    </RadioButtonGroup>,
  );

describe('RadioButtonGroup', () => {
  it('renders group + items with BEM classes and data-slots', () => {
    const { container } = renderGroup();
    expect(container.querySelector('[data-slot="radio-button-group"]')).toHaveClass(
      'radio-button-group',
    );
    expect(container.querySelectorAll('[data-slot="radio-button-group-item"]')).toHaveLength(2);
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });

  it('layout=grid adds the --grid modifier class', () => {
    const { container } = renderGroup({ layout: 'grid' });
    expect(container.querySelector('[data-slot="radio-button-group"]')).toHaveClass(
      'radio-button-group--grid',
    );
  });

  it('controlled single-select: clicking an item fires onChange with that value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderGroup({ value: 'weekly', onChange });

    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toBeChecked();
    await user.click(radios[1]);
    expect(onChange).toHaveBeenCalledWith('monthly');
  });

  it('single-select semantics: only one radio is checked at a time (uncontrolled)', async () => {
    const user = userEvent.setup();
    renderGroup({ defaultValue: 'weekly' });

    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toBeChecked();
    await user.click(radios[1]);
    expect(radios[0]).not.toBeChecked();
    expect(radios[1]).toBeChecked();
  });

  it('custom Indicator (with children) renders a data-custom span', () => {
    const { container } = render(
      <RadioButtonGroup aria-label="cycle">
        <RadioButtonGroup.Item value="a">
          <RadioButtonGroup.Indicator>
            <span>●</span>
          </RadioButtonGroup.Indicator>
          <RadioButtonGroup.ItemContent>A</RadioButtonGroup.ItemContent>
        </RadioButtonGroup.Item>
      </RadioButtonGroup>,
    );
    const indicator = container.querySelector('[data-slot="radio-button-group-indicator"]');
    expect(indicator?.tagName).toBe('SPAN');
    expect(indicator).toHaveAttribute('data-custom', 'true');
  });

  it('disabled group leaves radios non-selectable', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderGroup({ isDisabled: true, onChange });

    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toBeDisabled();
    await user.click(radios[0]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('has no axe a11y violations', async () => {
    const { container } = renderGroup();
    expect(await axe(container)).toHaveNoViolations();
  });
});
