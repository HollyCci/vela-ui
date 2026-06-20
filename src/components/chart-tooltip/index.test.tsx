import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import ChartTooltip from './index';

const PAYLOAD = [
  { name: 'Revenue', value: 5100, color: 'var(--chart-1)', dataKey: 'revenue' },
  { name: 'Profit', value: 3200, color: 'var(--chart-2)', dataKey: 'profit' },
];

describe('ChartTooltip', () => {
  it('has no axe a11y violations (compound composition)', async () => {
    const { container } = render(
      <ChartTooltip>
        <ChartTooltip.Header>March</ChartTooltip.Header>
        <ChartTooltip.Item>
          <ChartTooltip.Indicator color="var(--chart-1)" />
          <ChartTooltip.Label>Desktop</ChartTooltip.Label>
          <ChartTooltip.Value>150</ChartTooltip.Value>
        </ChartTooltip.Item>
        <ChartTooltip.Item>
          <ChartTooltip.Indicator indicator="line" color="var(--chart-2)" />
          <ChartTooltip.Label>Mobile</ChartTooltip.Label>
          <ChartTooltip.Value>90</ChartTooltip.Value>
        </ChartTooltip.Item>
      </ChartTooltip>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  describe('root props (Pro: active / indicator)', () => {
    it('renders nothing when active=false', () => {
      const { container } = render(
        <ChartTooltip active={false}>
          <ChartTooltip.Header>Hidden</ChartTooltip.Header>
        </ChartTooltip>,
      );
      expect(container).toBeEmptyDOMElement();
    });

    it('root indicator cascades to indicators that omit their own shape', () => {
      const { container } = render(
        <ChartTooltip indicator="line">
          <ChartTooltip.Item>
            <ChartTooltip.Indicator color="var(--chart-1)" />
            <ChartTooltip.Label>Organic</ChartTooltip.Label>
            <ChartTooltip.Value>15,200</ChartTooltip.Value>
          </ChartTooltip.Item>
        </ChartTooltip>,
      );
      expect(container.querySelector('.chart-tooltip__indicator--line')).not.toBeNull();
      expect(container.querySelector('.chart-tooltip__indicator--dot')).toBeNull();
    });
  });

  describe('renders-as (Pro: Header div, Indicator/Label/Value span)', () => {
    it('uses the Pro element for each part', () => {
      const { container } = render(
        <ChartTooltip>
          <ChartTooltip.Header>March</ChartTooltip.Header>
          <ChartTooltip.Item>
            <ChartTooltip.Indicator color="var(--chart-1)" />
            <ChartTooltip.Label>Desktop</ChartTooltip.Label>
            <ChartTooltip.Value>150</ChartTooltip.Value>
          </ChartTooltip.Item>
        </ChartTooltip>,
      );
      expect(container.querySelector('.chart-tooltip')?.tagName).toBe('DIV');
      expect(container.querySelector('.chart-tooltip__header')?.tagName).toBe('DIV');
      expect(container.querySelector('.chart-tooltip__item')?.tagName).toBe('DIV');
      expect(container.querySelector('.chart-tooltip__indicator')?.tagName).toBe('SPAN');
      expect(container.querySelector('.chart-tooltip__label')?.tagName).toBe('SPAN');
      expect(container.querySelector('.chart-tooltip__value')?.tagName).toBe('SPAN');
    });
  });

  describe('Item shorthand path (backward-compat)', () => {
    it('auto-renders Indicator+Label+Value from convenience props', () => {
      const { container } = render(
        <ChartTooltip>
          <ChartTooltip.Item indicator="dot" indicatorColor="var(--chart-1)" label="Sales" value="458" />
        </ChartTooltip>,
      );
      expect(container.querySelector('.chart-tooltip__indicator--dot')?.tagName).toBe('SPAN');
      expect(container.querySelector('.chart-tooltip__label')?.textContent).toBe('Sales');
      expect(container.querySelector('.chart-tooltip__value')?.textContent).toBe('458');
    });
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
      expect(container.querySelector('.chart-tooltip__indicator--line')).not.toBeNull();
    });

    it('applies valueFormatter / labelFormatter and respects hideHeader (Pro API)', () => {
      const { container } = render(
        <ChartTooltip.Content
          active
          payload={PAYLOAD}
          label="Mar"
          hideHeader
          valueFormatter={(value) => `$${value}`}
          labelFormatter={(label) => `Report: ${label}`}
        />,
      );
      // hideHeader 时不渲染 header
      expect(container.querySelector('.chart-tooltip__header')).toBeNull();
      const values = Array.from(container.querySelectorAll('.chart-tooltip__value')).map(
        (node) => node.textContent,
      );
      expect(values).toEqual(['$5100', '$3200']);
    });

    it('keeps deprecated formatter(value,name) / hideLabel aliases working', () => {
      const { container } = render(
        <ChartTooltip.Content
          active
          payload={PAYLOAD}
          label="Mar"
          hideLabel
          formatter={(value, name) => `${name}: $${value}`}
        />,
      );
      expect(container.querySelector('.chart-tooltip__header')).toBeNull();
      const values = Array.from(container.querySelectorAll('.chart-tooltip__value')).map(
        (node) => node.textContent,
      );
      expect(values).toEqual(['Revenue: $5100', 'Profit: $3200']);
    });
  });
});
