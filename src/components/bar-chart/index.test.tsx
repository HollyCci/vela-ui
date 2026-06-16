import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import BarChart from './index';

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
  { month: 'Jan', units: 320 },
  { month: 'Feb', units: 410 },
  { month: 'Mar', units: 280 },
];

describe('BarChart', () => {
  it('has no axe a11y violations', async () => {
    const { container } = render(
      <BarChart data={DATA} height={220} width={400}>
        <BarChart.Grid vertical={false} />
        <BarChart.XAxis dataKey="month" />
        <BarChart.YAxis />
        <BarChart.Tooltip content={<BarChart.TooltipContent indicator="dot" />} />
        <BarChart.Bar dataKey="units" name="Units" />
      </BarChart>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
