import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressCircle from './index';

const CIRCUMFERENCE = 2 * Math.PI * 10;

describe('ProgressCircle', () => {
  // 回归：value=0 maxValue=0 时 fill circle 的 strokeDashoffset 不得为 NaN（除零守卫）
  it('does not produce NaN strokeDashoffset when value=0 maxValue=0', () => {
    const { container } = render(<ProgressCircle value={0} maxValue={0} />);
    const fillCircle = container.querySelector('.progress-circle__fill-circle') as SVGCircleElement;
    expect(fillCircle).toBeInTheDocument();
    const offset = fillCircle.getAttribute('stroke-dashoffset');
    expect(offset).not.toBeNull();
    expect(offset).not.toContain('NaN');
    expect(Number.isNaN(Number(offset))).toBe(false);
    // ratio=0 → offset = 整圆周长
    expect(Number(offset)).toBeCloseTo(CIRCUMFERENCE, 5);
  });

  it('renders progressbar role with BEM class', () => {
    render(<ProgressCircle value={50} maxValue={100} />);
    const el = screen.getByRole('progressbar');
    expect(el).toHaveClass('progress-circle');
    expect(el).toHaveAttribute('aria-valuenow', '50');
  });

  it('computes strokeDashoffset proportional to ratio', () => {
    const { container } = render(<ProgressCircle value={25} maxValue={100} />);
    const fillCircle = container.querySelector('.progress-circle__fill-circle') as SVGCircleElement;
    const offset = Number(fillCircle.getAttribute('stroke-dashoffset'));
    // ratio=0.25 → offset = circumference * 0.75
    expect(offset).toBeCloseTo(CIRCUMFERENCE * 0.75, 5);
  });

  it('clamps value above max to full ratio (offset≈0)', () => {
    const { container } = render(<ProgressCircle value={200} maxValue={100} />);
    const fillCircle = container.querySelector('.progress-circle__fill-circle') as SVGCircleElement;
    const offset = Number(fillCircle.getAttribute('stroke-dashoffset'));
    expect(offset).toBeCloseTo(0, 5);
  });

  it('indeterminate (no value) omits aria-valuenow and uses default 0.25 ratio', () => {
    const { container } = render(<ProgressCircle />);
    const el = screen.getByRole('progressbar');
    expect(el).not.toHaveAttribute('aria-valuenow');
    const fillCircle = container.querySelector('.progress-circle__fill-circle') as SVGCircleElement;
    const offset = Number(fillCircle.getAttribute('stroke-dashoffset'));
    expect(Number.isNaN(offset)).toBe(false);
    expect(offset).toBeCloseTo(CIRCUMFERENCE * 0.75, 5);
  });

  it('applies color and size modifier classes', () => {
    render(<ProgressCircle value={10} color="success" size="sm" />);
    const el = screen.getByRole('progressbar');
    expect(el).toHaveClass('progress-circle--success');
    expect(el).toHaveClass('progress-circle--sm');
  });
});
