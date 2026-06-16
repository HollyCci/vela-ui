import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import AreaChart from './index';

// recharts ResponsiveContainer 依赖 ResizeObserver；jsdom 未实现，mock 防报错。
// 无布局下 ResponsiveContainer 测量为 0，图表 SVG 不渲染，axe 仅检查根容器结构。
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
  { month: 'Jan', desktop: 120 },
  { month: 'Feb', desktop: 180 },
  { month: 'Mar', desktop: 150 },
];

describe('AreaChart', () => {
  it('has no axe a11y violations', async () => {
    const { container } = render(
      <AreaChart data={DATA} height={220} width={400}>
        <AreaChart.Grid vertical={false} />
        <AreaChart.XAxis dataKey="month" />
        <AreaChart.YAxis />
        <AreaChart.Tooltip content={<AreaChart.TooltipContent indicator="dot" />} />
        <AreaChart.Area dataKey="desktop" name="Desktop" />
      </AreaChart>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
