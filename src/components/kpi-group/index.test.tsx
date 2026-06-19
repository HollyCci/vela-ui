import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import KpiGroup from './index';
import Kpi from '../kpi';

/** 与 sidebar 测试一致：jsdom 无 matchMedia，按断点命中与否打桩 */
function stubMatchMedia(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    })),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('KpiGroup', () => {
  it('renders role=group with default horizontal modifier and data-slot', () => {
    render(
      <KpiGroup>
        <Kpi>
          <Kpi.Value>1</Kpi.Value>
        </Kpi>
      </KpiGroup>,
    );
    const group = screen.getByRole('group');
    expect(group).toHaveAttribute('data-slot', 'kpi-group');
    expect(group).toHaveClass('kpi-group', 'kpi-group--horizontal');
  });

  it('applies the vertical orientation modifier', () => {
    render(
      <KpiGroup orientation="vertical">
        <Kpi>
          <Kpi.Value>1</Kpi.Value>
        </Kpi>
      </KpiGroup>,
    );
    expect(screen.getByRole('group')).toHaveClass('kpi-group--vertical');
  });

  it('renders multiple Kpi children plus decorative separators', () => {
    render(
      <KpiGroup>
        <Kpi>
          <Kpi.Title>A</Kpi.Title>
        </Kpi>
        <KpiGroup.Separator />
        <Kpi>
          <Kpi.Title>B</Kpi.Title>
        </Kpi>
      </KpiGroup>,
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    const sep = document.querySelector('[data-slot="kpi-group-separator"]') as HTMLElement;
    // 装饰性：aria-hidden，且不暴露 separator 角色
    expect(sep).toHaveAttribute('aria-hidden', 'true');
    expect(sep).toHaveClass('kpi-group__separator');
  });

  it('collapses horizontal layout below the mobile breakpoint via data-collapsed', () => {
    stubMatchMedia(true);
    render(
      <KpiGroup>
        <Kpi>
          <Kpi.Value>1</Kpi.Value>
        </Kpi>
      </KpiGroup>,
    );
    const group = screen.getByRole('group');
    // orientation 类名保持权威不变，仅靠 data-collapsed 接管堆叠
    expect(group).toHaveClass('kpi-group--horizontal');
    expect(group).toHaveAttribute('data-collapsed', 'true');
  });

  it('keeps horizontal layout above the breakpoint (no data-collapsed)', () => {
    stubMatchMedia(false);
    render(
      <KpiGroup>
        <Kpi>
          <Kpi.Value>1</Kpi.Value>
        </Kpi>
      </KpiGroup>,
    );
    expect(screen.getByRole('group')).not.toHaveAttribute('data-collapsed');
  });

  it('does not auto-collapse an explicit vertical group', () => {
    stubMatchMedia(true);
    render(
      <KpiGroup orientation="vertical">
        <Kpi>
          <Kpi.Value>1</Kpi.Value>
        </Kpi>
      </KpiGroup>,
    );
    expect(screen.getByRole('group')).not.toHaveAttribute('data-collapsed');
  });

  it('respects collapseBelow={false} to opt out of auto-collapse', () => {
    stubMatchMedia(true);
    render(
      <KpiGroup collapseBelow={false}>
        <Kpi>
          <Kpi.Value>1</Kpi.Value>
        </Kpi>
      </KpiGroup>,
    );
    expect(screen.getByRole('group')).not.toHaveAttribute('data-collapsed');
  });

  it('has no axe a11y violations', async () => {
    // RAC Group(role=group) 配可访问名（aria-label）
    const { container } = render(
      <KpiGroup aria-label="Key metrics">
        <Kpi>
          <Kpi.Title>Learners</Kpi.Title>
          <Kpi.Value>1,286</Kpi.Value>
        </Kpi>
        <KpiGroup.Separator />
        <Kpi>
          <Kpi.Title>Completion</Kpi.Title>
          <Kpi.Value>72%</Kpi.Value>
        </Kpi>
      </KpiGroup>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
