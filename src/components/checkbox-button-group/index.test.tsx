import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CheckboxButtonGroup from './index';

const renderGroup = (props: Record<string, unknown> = {}) =>
  render(
    <CheckboxButtonGroup aria-label="skills" {...props}>
      <CheckboxButtonGroup.Item value="reading">
        <CheckboxButtonGroup.Indicator />
        <CheckboxButtonGroup.ItemContent>Reading</CheckboxButtonGroup.ItemContent>
      </CheckboxButtonGroup.Item>
      <CheckboxButtonGroup.Item value="listening">
        <CheckboxButtonGroup.Indicator />
        <CheckboxButtonGroup.ItemContent>Listening</CheckboxButtonGroup.ItemContent>
      </CheckboxButtonGroup.Item>
    </CheckboxButtonGroup>,
  );

describe('CheckboxButtonGroup', () => {
  it('renders group + items with BEM classes and data-slots', () => {
    const { container } = renderGroup();
    expect(container.querySelector('[data-slot="checkbox-button-group"]')).toHaveClass(
      'checkbox-button-group',
    );
    expect(
      container.querySelectorAll('[data-slot="checkbox-button-group-item"]'),
    ).toHaveLength(2);
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
  });

  it('layout=grid adds the --grid modifier class', () => {
    const { container } = renderGroup({ layout: 'grid' });
    expect(container.querySelector('[data-slot="checkbox-button-group"]')).toHaveClass(
      'checkbox-button-group--grid',
    );
  });

  it('layout=flex (default) does not add the --grid modifier class', () => {
    const { container } = renderGroup();
    expect(container.querySelector('[data-slot="checkbox-button-group"]')).not.toHaveClass(
      'checkbox-button-group--grid',
    );
  });

  it('controlled multi-select: clicking items fires onChange with cumulative values', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderGroup({ value: ['reading'], onChange });

    const checkboxes = screen.getAllByRole('checkbox');
    // first item already checked via controlled value
    expect(checkboxes[0]).toBeChecked();
    await user.click(checkboxes[1]);
    expect(onChange).toHaveBeenCalledWith(['reading', 'listening']);
  });

  it('custom Indicator (with children) renders a data-custom span', () => {
    const { container } = render(
      <CheckboxButtonGroup aria-label="skills">
        <CheckboxButtonGroup.Item value="a">
          <CheckboxButtonGroup.Indicator>
            <span>✓</span>
          </CheckboxButtonGroup.Indicator>
          <CheckboxButtonGroup.ItemContent>A</CheckboxButtonGroup.ItemContent>
        </CheckboxButtonGroup.Item>
      </CheckboxButtonGroup>,
    );
    const indicator = container.querySelector('[data-slot="checkbox-button-group-indicator"]');
    expect(indicator?.tagName).toBe('SPAN');
    expect(indicator).toHaveAttribute('data-custom', 'true');
  });

  it('disabled group leaves items non-checkable', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderGroup({ isDisabled: true, onChange });

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toBeDisabled();
    await user.click(checkboxes[0]);
    expect(onChange).not.toHaveBeenCalled();
  });
});
