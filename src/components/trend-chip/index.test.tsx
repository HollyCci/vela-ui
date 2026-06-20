import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import TrendChip from './index';

describe('TrendChip', () => {
  it('renders value inside a chip with success color for up trend', () => {
    const { container } = render(<TrendChip trend="up" value="12%" />);
    const chip = container.querySelector('[data-slot="chip"]');
    expect(chip).not.toBeNull();
    // up -> success color, default variant soft (Pro 默认)
    expect(chip).toHaveClass('chip--success', 'chip--soft');
    expect(screen.getByText('12%')).toHaveClass('trend-chip__value');
  });

  it('applies the base .trend-chip class and emits data-trend on the root', () => {
    const { container } = render(<TrendChip trend="down" value="3" />);
    const chip = container.querySelector('[data-slot="chip"]');
    expect(chip).toHaveClass('trend-chip');
    expect(chip).toHaveAttribute('data-trend', 'down');
  });

  it('maps down trend to danger color', () => {
    const { container } = render(<TrendChip trend="down" value="3" />);
    expect(container.querySelector('[data-slot="chip"]')).toHaveClass('chip--danger');
  });

  it('maps neutral trend to default color', () => {
    const { container } = render(<TrendChip trend="neutral" value="0" />);
    expect(container.querySelector('[data-slot="chip"]')).toHaveClass('chip--default');
  });

  it('defaults to the sm size class when size is omitted (Pro 默认)', () => {
    const { container } = render(<TrendChip trend="up" value="5" />);
    const chip = container.querySelector('[data-slot="chip"]');
    expect(chip).toHaveClass('chip--sm', 'trend-chip--sm');
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

  describe('compound (dot-notation) API — 对齐 Pro Anatomy', () => {
    it('renders TrendChip.Indicator / .Prefix / .Suffix as spans with the element classes', () => {
      const { container } = render(
        <TrendChip trend="up">
          <TrendChip.Prefix>$</TrendChip.Prefix>
          <TrendChip.Indicator>
            <svg data-testid="compound-icon" />
          </TrendChip.Indicator>
          <span className="trend-chip__value">1,234</span>
          <TrendChip.Suffix>vs LW</TrendChip.Suffix>
        </TrendChip>,
      );
      const prefix = container.querySelector('.trend-chip__prefix');
      const indicator = container.querySelector('.trend-chip__indicator');
      const suffix = container.querySelector('.trend-chip__suffix');
      expect(prefix?.tagName).toBe('SPAN');
      expect(indicator?.tagName).toBe('SPAN');
      expect(suffix?.tagName).toBe('SPAN');
      expect(indicator?.querySelector('[data-testid="compound-icon"]')).not.toBeNull();
      // 复合路径不传 value -> root 直渲 children，不再自动注入默认箭头
      expect(screen.getByText('1,234')).toHaveClass('trend-chip__value');
    });

    it('still applies trend color + data-trend on the root in compound usage', () => {
      const { container } = render(
        <TrendChip trend="down">
          <TrendChip.Indicator>
            <svg />
          </TrendChip.Indicator>
          <span className="trend-chip__value">-2.1%</span>
        </TrendChip>,
      );
      const chip = container.querySelector('[data-slot="chip"]');
      expect(chip).toHaveClass('trend-chip', 'chip--danger');
      expect(chip).toHaveAttribute('data-trend', 'down');
    });
  });

  it('has no axe a11y violations', async () => {
    const { container } = render(<TrendChip trend="up" value="12%" suffix="vs LW" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe a11y violations in compound usage', async () => {
    const { container } = render(
      <TrendChip trend="up">
        <TrendChip.Prefix>$</TrendChip.Prefix>
        <TrendChip.Indicator>
          <svg aria-hidden="true" />
        </TrendChip.Indicator>
        <span className="trend-chip__value">1,234</span>
        <TrendChip.Suffix>vs LW</TrendChip.Suffix>
      </TrendChip>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
