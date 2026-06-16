import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import LineChart from './index';

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
  { month: 'Mar', desktop: 150, mobile: 100 },
];

describe('LineChart', () => {
  it('has no axe a11y violations', async () => {
    const { container } = render(
      <LineChart data={DATA} height={220} width={400}>
        <LineChart.Grid vertical={false} />
        <LineChart.XAxis dataKey="month" />
        <LineChart.YAxis />
        <LineChart.Tooltip content={<LineChart.TooltipContent indicator="line" />} />
        <LineChart.Line dataKey="desktop" name="Desktop" />
        <LineChart.Line dataKey="mobile" name="Mobile" />
      </LineChart>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
