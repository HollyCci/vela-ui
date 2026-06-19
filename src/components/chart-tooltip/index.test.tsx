import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import ChartTooltip from './index';

const PAYLOAD = [
  { name: 'Revenue', value: 5100, color: 'var(--chart-1)', dataKey: 'revenue' },
  { name: 'Profit', value: 3200, color: 'var(--chart-2)', dataKey: 'profit' },
];

describe('ChartTooltip', () => {
  it('has no axe a11y violations', async () => {
    const { container } = render(
      <ChartTooltip>
        <ChartTooltip.Header>March</ChartTooltip.Header>
        <ChartTooltip.Item
          indicator="dot"
          indicatorColor="var(--chart-1)"
          label="Desktop"
          value={150}
        />
        <ChartTooltip.Item
          indicator="line"
          indicatorColor="var(--chart-2)"
          label="Mobile"
          value={90}
        />
      </ChartTooltip>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  describe('Content (内容感知)', () => {
    it('renders nothing when inactive or payload empty', () => {
      const { container: inactive } = render(
        <ChartTooltip.Content active={false} payload={PAYLOAD} label="Mar" />,
      );
      expect(inactive).toBeEmptyDOMElement();

      const { container: empty } = render(
        <ChartTooltip.Content active payload={[]} label="Mar" />,
      );
      expect(empty).toBeEmptyDOMElement();
    });

    it('auto-renders header + an item per payload entry from active/payload', () => {
      const { container } = render(
        <ChartTooltip.Content active payload={PAYLOAD} label="Mar" indicator="line" />,
      );
      expect(container.querySelector('.chart-tooltip__header')?.textContent).toBe('Mar');
      const items = container.querySelectorAll('.chart-tooltip__item');
      expect(items).toHaveLength(2);
      expect(items[0].querySelector('.chart-tooltip__label')?.textContent).toBe('Revenue');
      expect(items[0].querySelector('.chart-tooltip__value')?.textContent).toBe('5100');
      expect(
        container.querySelector('.chart-tooltip__indicator--line'),
      ).not.toBeNull();
    });

    it('applies formatter / labelFormatter and respects hideLabel', () => {
      const { container } = render(
        <ChartTooltip.Content
          active
          payload={PAYLOAD}
          label="Mar"
          hideLabel
          formatter={(value, name) => `${name}: $${value}`}
          labelFormatter={(label) => `Report: ${label}`}
        />,
      );
      // hideLabel 时不渲染 header（labelFormatter 也就不应出现）
      expect(container.querySelector('.chart-tooltip__header')).toBeNull();
      const values = Array.from(container.querySelectorAll('.chart-tooltip__value')).map(
        (node) => node.textContent,
      );
      expect(values).toEqual(['Revenue: $5100', 'Profit: $3200']);
    });
  });
});
