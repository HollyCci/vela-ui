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

  it('renders root as div[data-slot="line-chart"] (Pro renders-as contract)', () => {
    const { container } = render(<LineChart data={DATA} height={220} width={400} />);
    const root = container.querySelector('[data-slot="line-chart"]');
    expect(root).not.toBeNull();
    expect(root?.tagName).toBe('DIV');
    expect(root).toHaveClass('line-chart');
  });

  it('forwards native div attributes and merges className onto the root', () => {
    const { container } = render(
      <LineChart data={DATA} height={220} width={400} className="extra" id="lc" role="img" />,
    );
    const root = container.querySelector('[data-slot="line-chart"]');
    expect(root).toHaveClass('line-chart');
    expect(root).toHaveClass('extra');
    expect(root).toHaveAttribute('id', 'lc');
    expect(root).toHaveAttribute('role', 'img');
  });

  it('exposes the documented Pro sub-component surface', () => {
    // Pro API Reference: Line / XAxis / YAxis / Grid / Tooltip / TooltipContent.
    // Recharts re-exports are forwardRef/memo objects, so assert presence not callability.
    expect(LineChart.Line).toBeDefined();
    expect(LineChart.XAxis).toBeDefined();
    expect(LineChart.YAxis).toBeDefined();
    expect(LineChart.Grid).toBeDefined();
    expect(LineChart.Tooltip).toBeDefined();
    expect(LineChart.TooltipContent).toBeTypeOf('function');
  });
});
