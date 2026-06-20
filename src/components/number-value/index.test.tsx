import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import NumberValue from './index';

describe('NumberValue', () => {
  it('formats the value into the value slot', () => {
    const { container } = render(<NumberValue value={1234.5} locale="en-US" />);
    const root = container.querySelector('[data-slot="number-value"]');
    expect(root).toHaveClass('number-value');
    expect(root!.tagName).toBe('SPAN');
    const valueSlot = root!.querySelector('[data-slot="number-value-value"]');
    expect(valueSlot).toHaveClass('number-value__value');
    expect(valueSlot).toHaveTextContent('1,234.5');
  });

  it('honors Intl format options such as percent', () => {
    render(<NumberValue value={0.42} locale="en-US" formatOptions={{ style: 'percent' }} />);
    expect(screen.getByText('42%')).toHaveAttribute('data-slot', 'number-value-value');
  });

  it('supports the flattened style/currency props (reference API)', () => {
    render(<NumberValue value={1234} locale="en-US" style="currency" currency="USD" />);
    expect(screen.getByText('$1,234.00')).toHaveAttribute('data-slot', 'number-value-value');
  });

  it('supports flattened notation/percent/signDisplay/fraction-digit props', () => {
    const { container } = render(
      <NumberValue value={0.033} locale="en-US" style="percent" maximumFractionDigits={1} />,
    );
    expect(container.querySelector('[data-slot="number-value-value"]')).toHaveTextContent('3.3%');

    const { container: c2 } = render(
      <NumberValue value={42} locale="en-US" signDisplay="always" />,
    );
    expect(c2.querySelector('[data-slot="number-value-value"]')).toHaveTextContent('+42');

    const { container: c3 } = render(
      <NumberValue value={1234567} locale="en-US" notation="compact" maximumFractionDigits={1} />,
    );
    expect(c3.querySelector('[data-slot="number-value-value"]')).toHaveTextContent('1.2M');
  });

  it('lets formatOptions override the flattened props', () => {
    const { container } = render(
      <NumberValue value={0.5} locale="en-US" style="percent" formatOptions={{ style: 'decimal' }} />,
    );
    // formatOptions.style=decimal wins over flattened style=percent.
    expect(container.querySelector('[data-slot="number-value-value"]')).toHaveTextContent('0.5');
  });

  it('renders prefix and suffix slots when provided via convenience props', () => {
    const { container } = render(<NumberValue value={5} locale="en-US" prefix="$" suffix="USD" />);
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

  it('renders NumberValue.Prefix / NumberValue.Suffix sub-components as spans', () => {
    const { container } = render(
      <NumberValue value={5} locale="en-US">
        <NumberValue.Prefix>$</NumberValue.Prefix>
        <NumberValue.Suffix>USD</NumberValue.Suffix>
      </NumberValue>,
    );
    const prefix = container.querySelector('[data-slot="number-value-prefix"]');
    const suffix = container.querySelector('[data-slot="number-value-suffix"]');
    expect(prefix).not.toBeNull();
    expect(prefix!.tagName).toBe('SPAN');
    expect(prefix).toHaveClass('number-value__prefix');
    expect(prefix).toHaveTextContent('$');
    expect(suffix!.tagName).toBe('SPAN');
    expect(suffix).toHaveClass('number-value__suffix');
    expect(suffix).toHaveTextContent('USD');
    // value slot still present alongside sub-components.
    expect(container.querySelector('[data-slot="number-value-value"]')).toHaveTextContent('5');
  });

  it('supports a render-function child receiving the formatted string', () => {
    const { container } = render(
      <NumberValue value={1234.5} locale="en-US">
        {(formatted) => <em data-testid="custom">[{formatted}]</em>}
      </NumberValue>,
    );
    expect(screen.getByTestId('custom')).toHaveTextContent('[1,234.5]');
    // render function replaces the default value slot.
    expect(container.querySelector('[data-slot="number-value-value"]')).toBeNull();
  });

  it('has no axe a11y violations', async () => {
    const { container } = render(
      <NumberValue value={1234.5} locale="en-US">
        <NumberValue.Prefix>$</NumberValue.Prefix>
        <NumberValue.Suffix>USD</NumberValue.Suffix>
      </NumberValue>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('NumberValue animate', () => {
  // @number-flow/react 注册自定义元素并使用 ResizeObserver / 动画，jsdom 无布局。
  beforeEach(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });

  it('renders the final formatted value through the animated value slot', () => {
    const { container } = render(<NumberValue value={1234.5} locale="en-US" animate />);
    const valueSlot = container.querySelector('[data-slot="number-value-value"]');
    expect(valueSlot).not.toBeNull();
    // 动画节点仍带同样的 class/data-slot，且经同一套 Intl 格式化输出 1,234.5。
    expect(valueSlot).toHaveClass('number-value__value');
    expect(valueSlot).toHaveTextContent('1,234.5');
  });

  it('honors flattened format props on the animated path', () => {
    const { container } = render(
      <NumberValue value={0.42} locale="en-US" style="percent" animate />,
    );
    const valueSlot = container.querySelector('[data-slot="number-value-value"]');
    expect(valueSlot).toHaveTextContent('42%');
  });

  it('keeps prefix/suffix slots alongside the animated value', () => {
    const { container } = render(
      <NumberValue value={5} locale="en-US" prefix="$" suffix="USD" animate />,
    );
    expect(container.querySelector('[data-slot="number-value-prefix"]')).toHaveTextContent('$');
    expect(container.querySelector('[data-slot="number-value-suffix"]')).toHaveTextContent('USD');
    expect(container.querySelector('[data-slot="number-value-value"]')).toHaveTextContent('5');
  });
});
