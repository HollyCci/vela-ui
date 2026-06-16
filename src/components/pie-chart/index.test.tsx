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
});
