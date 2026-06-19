import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import TrendChip from './index';

describe('TrendChip', () => {
  it('renders value inside a chip with success color for up trend', () => {
    const { container } = render(<TrendChip trend="up" value="12%" />);
    const chip = container.querySelector('[data-slot="chip"]');
    expect(chip).not.toBeNull();
    // up -> success color, default variant tertiary
    expect(chip).toHaveClass('chip--success', 'chip--tertiary');
    expect(screen.getByText('12%')).toHaveClass('trend-chip__value');
  });

  it('maps down trend to danger color', () => {
    const { container } = render(<TrendChip trend="down" value="3" />);
    expect(container.querySelector('[data-slot="chip"]')).toHaveClass('chip--danger');
  });

  it('maps neutral trend to default color', () => {
    const { container } = render(<TrendChip trend="neutral" value="0" />);
    expect(container.querySelector('[data-slot="chip"]')).toHaveClass('chip--default');
  });

  it('renders an indicator icon and the optional suffix', () => {
    const { container } = render(<TrendChip trend="up" value="5" suffix="vs LW" />);
    expect(container.querySelector('.trend-chip__indicator svg')).not.toBeNull();
    expect(screen.getByText('vs LW')).toHaveClass('trend-chip__suffix');
  });

  it('replaces the default indicator with a custom icon while keeping the trend color', () => {
    const { container } = render(
      <TrendChip trend="up" value="5" icon={<svg data-testid="custom-icon" />} />,
    );
    const indicator = container.querySelector('.trend-chip__indicator');
    // 默认箭头被自定义图标替换，趋势色仍由 chip--success 提供
    expect(indicator?.querySelector('[data-testid="custom-icon"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="chip"]')).toHaveClass('chip--success');
  });

  it('renders the optional prefix before the value', () => {
    render(<TrendChip trend="up" prefix="营收" value="18.2%" />);
    expect(screen.getByText('营收')).toHaveClass('trend-chip__prefix');
  });

  it('passes the size through to the size-specific class', () => {
    const { container } = render(<TrendChip trend="up" value="5" size="lg" />);
    const chip = container.querySelector('[data-slot="chip"]');
    expect(chip).toHaveClass('chip--lg', 'trend-chip--lg');
  });

  it('has no axe a11y violations', async () => {
    const { container } = render(<TrendChip trend="up" value="12%" suffix="vs LW" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
