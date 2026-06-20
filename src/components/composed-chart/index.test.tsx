import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import ComposedChart from './index';

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

const DATA = [
  { month: 'Jan', desktop: 120, mobile: 80 },
  { month: 'Feb', desktop: 180, mobile: 120 },
];

const PAYLOAD = [
  { name: 'Desktop', value: 120, color: '#000', dataKey: 'desktop' },
  { name: 'Mobile', value: 80, color: '#888', dataKey: 'mobile' },
];

describe('ComposedChart', () => {
  it('has no axe a11y violations', async () => {
    const { container } = render(
      <ComposedChart data={DATA} height={240} width={400}>
        <ComposedChart.Grid vertical={false} />
        <ComposedChart.XAxis dataKey="month" />
        <ComposedChart.YAxis />
        <ComposedChart.Tooltip content={<ComposedChart.TooltipContent />} />
        <ComposedChart.Area dataKey="desktop" name="Desktop" />
        <ComposedChart.Bar dataKey="mobile" name="Mobile" />
        <ComposedChart.Line dataKey="desktop" name="Desktop trend" />
      </ComposedChart>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('renders root as div[data-slot=composed-chart] with className', () => {
    const { container } = render(
      <ComposedChart data={DATA} className="extra">
        <ComposedChart.Bar dataKey="desktop" />
      </ComposedChart>,
    );
    const root = container.querySelector('[data-slot="composed-chart"]');
    expect(root).not.toBeNull();
    expect(root?.tagName).toBe('DIV');
    expect(root).toHaveClass('composed-chart', 'extra');
  });

  it('TooltipContent renders header + series rows via ChartTooltip primitive', () => {
    const { container } = render(
      <ComposedChart.TooltipContent active payload={PAYLOAD} label="Jan" />,
    );
    expect(container.querySelector('.chart-tooltip')).not.toBeNull();
    expect(container.querySelector('.chart-tooltip__header')?.textContent).toBe('Jan');
    expect(container.querySelectorAll('.chart-tooltip__item')).toHaveLength(2);
    expect(container.textContent).toContain('Desktop');
    expect(container.textContent).toContain('120');
  });

  it('TooltipContent supports Pro-aligned valueFormatter/labelFormatter/hideHeader', () => {
    const { container } = render(
      <ComposedChart.TooltipContent
        active
        payload={PAYLOAD}
        label="Jan"
        hideHeader
        valueFormatter={(v) => `$${v}`}
        labelFormatter={(l) => `Month ${l}`}
      />,
    );
    // hideHeader 隐藏 header 行
    expect(container.querySelector('.chart-tooltip__header')).toBeNull();
    // valueFormatter 应用到值
    expect(container.textContent).toContain('$120');
    expect(container.textContent).toContain('$80');
  });

  it('TooltipContent keeps deprecated formatter (value, name) path for old call sites', () => {
    const { container } = render(
      <ComposedChart.TooltipContent
        active
        payload={PAYLOAD}
        label="Jan"
        formatter={(value) => `${value} u`}
      />,
    );
    expect(container.textContent).toContain('120 u');
  });

  it('TooltipContent renders nothing when inactive', () => {
    const { container } = render(
      <ComposedChart.TooltipContent active={false} payload={PAYLOAD} label="Jan" />,
    );
    expect(container.querySelector('.chart-tooltip')).toBeNull();
  });
});
