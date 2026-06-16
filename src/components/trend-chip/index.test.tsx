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
