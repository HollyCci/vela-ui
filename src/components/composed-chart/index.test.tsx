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
});
