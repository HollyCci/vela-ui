import type { ReactElement } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import PieChart from './index';

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
  { browser: 'Chrome', visitors: 540 },
  { browser: 'Safari', visitors: 320 },
  { browser: 'Firefox', visitors: 140 },
];

/** 给定外半径渲染一个扇区，取回 path 的 d 属性用于比对 */
function renderSectorPath(node: ReactElement): string {
  const { container } = render(
    <svg>
      <g>{node}</g>
    </svg>,
  );
  return container.querySelector('path')?.getAttribute('d') ?? '';
}

describe('PieChart', () => {
  it('has no axe a11y violations', async () => {
    const { container } = render(
      <PieChart height={240} width={240}>
        <PieChart.Tooltip cursor={false} content={<PieChart.TooltipContent />} />
        <PieChart.Pie data={DATA} dataKey="visitors" nameKey="browser" />
      </PieChart>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('exposes a built-in active-shape renderer that expands the sector outer radius', () => {
    // active-shape 应比同参数的基础扇区半径更大（hover 扩张），对齐 HeroUI Pro
    const sectorProps = {
      cx: 100,
      cy: 100,
      innerRadius: 40,
      outerRadius: 80,
      startAngle: 0,
      endAngle: 90,
    };
    const baseline = renderSectorPath(<PieChart.Sector {...sectorProps} />);
    const active = renderSectorPath(<PieChart.ActiveShape {...sectorProps} />);

    expect(baseline).not.toBe('');
    expect(active).not.toBe('');
    // 扩张后的 path 与基础扇区不同，证明 outerRadius 被放大
    expect(active).not.toBe(baseline);
  });

  it('passes activeShape through to the recharts Pie without breaking the chart', () => {
    // activeShape 透传给 Pie，recharts 由内部 tooltip 高亮态驱动渲染（hover 时切到 active 扇区）
    // jsdom 无布局，断言到图表容器挂载这一可观测层级：透传不应抛错或丢失结构
    const { container } = render(
      <PieChart height={240} width={240}>
        <PieChart.Tooltip cursor={false} content={<PieChart.TooltipContent />} />
        <PieChart.Pie
          data={DATA}
          dataKey="visitors"
          nameKey="browser"
          activeShape={<PieChart.ActiveShape />}
        />
      </PieChart>,
    );
    expect(container.querySelector('[data-slot="pie-chart"]')).not.toBeNull();
    expect(container.querySelector('.recharts-wrapper')).not.toBeNull();
  });
});
