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

  it('renders root as div.bar-chart with data-slot', () => {
    const { container } = render(
      <BarChart data={DATA} height={220} width={400}>
        <BarChart.Bar dataKey="units" name="Units" />
      </BarChart>,
    );
    const root = container.querySelector('.bar-chart');
    expect(root).not.toBeNull();
    expect(root?.tagName).toBe('DIV');
    expect(root?.getAttribute('data-slot')).toBe('bar-chart');
  });

  it('exposes exactly the reference API surface (no superset)', () => {
    // Reference (online Pro) BarChart re-exports: Bar / XAxis / YAxis / Grid /
    // Tooltip, plus the pre-built TooltipContent renderer. Nothing else.
    for (const key of ['Bar', 'XAxis', 'YAxis', 'Grid', 'Tooltip', 'TooltipContent']) {
      expect(key in BarChart).toBe(true);
      expect((BarChart as Record<string, unknown>)[key]).toBeDefined();
    }
    expect(typeof BarChart.TooltipContent).toBe('function');

    // Undocumented Recharts re-exports must NOT be part of the surface.
    for (const extra of [
      'Legend',
      'Brush',
      'ReferenceLine',
      'ReferenceArea',
      'ReferenceDot',
      'Cell',
      'Label',
      'LabelList',
    ]) {
      expect(extra in BarChart).toBe(false);
    }
  });
});
