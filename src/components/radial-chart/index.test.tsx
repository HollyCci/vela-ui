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
});
