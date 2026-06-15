import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import KpiGroup from './index';
import Kpi from '../kpi';

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
});
