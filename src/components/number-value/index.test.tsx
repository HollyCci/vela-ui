import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NumberValue from './index';

describe('NumberValue', () => {
  it('formats the value into the value slot', () => {
    const { container } = render(<NumberValue value={1234.5} locale="en-US" />);
    const root = container.querySelector('[data-slot="number-value"]');
    expect(root).toHaveClass('number-value');
    const valueSlot = root!.querySelector('[data-slot="number-value-value"]');
    expect(valueSlot).toHaveClass('number-value__value');
    expect(valueSlot).toHaveTextContent('1,234.5');
  });

  it('honors Intl format options such as percent', () => {
    render(<NumberValue value={0.42} locale="en-US" formatOptions={{ style: 'percent' }} />);
    expect(screen.getByText('42%')).toHaveAttribute('data-slot', 'number-value-value');
  });

  it('renders prefix and suffix slots when provided', () => {
    const { container } = render(
      <NumberValue value={5} locale="en-US" prefix="$" suffix="USD" />,
    );
    const prefix = container.querySelector('[data-slot="number-value-prefix"]');
    const suffix = container.querySelector('[data-slot="number-value-suffix"]');
    expect(prefix).toHaveTextContent('$');
    expect(prefix).toHaveClass('number-value__prefix');
    expect(suffix).toHaveTextContent('USD');
    expect(suffix).toHaveClass('number-value__suffix');
  });

  it('omits prefix/suffix slots when not provided', () => {
    const { container } = render(<NumberValue value={1} locale="en-US" />);
    expect(container.querySelector('[data-slot="number-value-prefix"]')).toBeNull();
    expect(container.querySelector('[data-slot="number-value-suffix"]')).toBeNull();
  });
});
