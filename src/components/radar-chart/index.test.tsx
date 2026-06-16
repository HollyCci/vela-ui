import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import RadarChart from './index';

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
  { subject: 'Speed', score: 80 },
  { subject: 'Quality', score: 65 },
  { subject: 'Coverage', score: 90 },
];

describe('RadarChart', () => {
  it('has no axe a11y violations', async () => {
    const { container } = render(
      <RadarChart data={DATA} height={280} width={360}>
        <RadarChart.Grid gridType="polygon" />
        <RadarChart.AngleAxis dataKey="subject" />
        <RadarChart.Radar name="Score" dataKey="score" />
        <RadarChart.Tooltip content={<RadarChart.TooltipContent />} />
      </RadarChart>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
