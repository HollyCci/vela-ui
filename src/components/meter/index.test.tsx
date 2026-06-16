import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import Meter from './index';

describe('Meter', () => {
  // 回归：传 label 时 [role=meter] 有 aria-labelledby，且指向的元素文本=label
  it('wires aria-labelledby to the label element when label is provided', () => {
    render(<Meter value={40} label="磁盘占用" />);
    const meter = screen.getByRole('meter');
    const labelledBy = meter.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    const labelEl = document.getElementById(labelledBy as string);
    expect(labelEl).not.toBeNull();
    expect(labelEl).toHaveTextContent('磁盘占用');
    expect(labelEl).toHaveAttribute('data-slot', 'label');
  });

  it('omits aria-labelledby when no label is provided', () => {
    render(<Meter value={40} />);
    const meter = screen.getByRole('meter');
    expect(meter).not.toHaveAttribute('aria-labelledby');
  });

  it('renders meter role with class and aria value attributes', () => {
    render(<Meter value={40} minValue={0} maxValue={100} />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveClass('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '40');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '100');
  });

  it('computes fill width from min/max range and shows rounded output', () => {
    const { container } = render(<Meter value={75} minValue={50} maxValue={100} />);
    const fill = container.querySelector('.meter__fill') as HTMLElement;
    // (75-50)/(100-50) = 50%
    expect(fill.style.width).toBe('50%');
    expect(container.querySelector('.meter__output')).toHaveTextContent('50%');
  });

  it('does not produce NaN width when range is zero (min==max)', () => {
    const { container } = render(<Meter value={5} minValue={10} maxValue={10} />);
    const fill = container.querySelector('.meter__fill') as HTMLElement;
    expect(fill.style.width).not.toContain('NaN');
    expect(fill.style.width).toBe('0%');
  });

  it('supports custom valueLabel and color/size modifiers', () => {
    const { container } = render(
      <Meter value={20} valueLabel="低" color="warning" size="lg" />,
    );
    const meter = screen.getByRole('meter');
    expect(meter).toHaveClass('meter--warning');
    expect(meter).toHaveClass('meter--lg');
    expect(container.querySelector('.meter__output')).toHaveTextContent('低');
  });

  it('has no axe a11y violations', async () => {
    // meter 的可访问名由消费方提供：这里用 label（写入 aria-labelledby）
    const { container } = render(<Meter value={40} label="磁盘占用" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
