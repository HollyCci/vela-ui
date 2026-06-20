import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import RadialChart from './index';

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
  { name: 'Q1', value: 80 },
  { name: 'Q2', value: 60 },
  { name: 'Q3', value: 40 },
];

describe('RadialChart', () => {
  it('has no axe a11y violations', async () => {
    const { container } = render(
      <RadialChart data={DATA} height={220} width={220} innerRadius="30%" outerRadius="100%">
        <RadialChart.Tooltip cursor={false} content={<RadialChart.TooltipContent />} />
        <RadialChart.Bar dataKey="value" background>
          <RadialChart.Cell fill="var(--chart-4)" />
          <RadialChart.Cell fill="var(--chart-3)" />
          <RadialChart.Cell fill="var(--chart-2)" />
        </RadialChart.Bar>
      </RadialChart>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('renders root as a div with data-slot="radial-chart"', () => {
    const { container } = render(<RadialChart data={DATA} height={120} width={120} />);
    const root = container.querySelector('[data-slot="radial-chart"]');
    expect(root).not.toBeNull();
    expect(root?.tagName).toBe('DIV');
    expect(root).toHaveClass('radial-chart');
  });

  it('forwards arbitrary native div attributes to the root', () => {
    const { container } = render(
      <RadialChart data={DATA} height={120} width={120} id="energy" aria-label="Energy rings" />,
    );
    const root = container.querySelector('#energy');
    expect(root).not.toBeNull();
    expect(root).toHaveAttribute('data-slot', 'radial-chart');
    expect(root).toHaveAttribute('aria-label', 'Energy rings');
  });

  // 子组件命名空间与线上参考版 1:1：仅暴露文档化的 5 个子组件。
  it('exposes exactly the documented sub-component namespace', () => {
    expect(RadialChart.Bar).toBeDefined();
    expect(RadialChart.Cell).toBeDefined();
    expect(RadialChart.AngleAxis).toBeDefined();
    expect(RadialChart.Tooltip).toBeDefined();
    expect(RadialChart.TooltipContent).toBeDefined();
  });

  // 参考版未文档化的 recharts 原语不应作为命名空间子组件暴露（避免 superset 漂移）。
  it('does not expose undocumented sub-components', () => {
    const ns = RadialChart as Record<string, unknown>;
    expect(ns.RadiusAxis).toBeUndefined();
    expect(ns.Legend).toBeUndefined();
    expect(ns.Label).toBeUndefined();
    expect(ns.LabelList).toBeUndefined();
  });
});
