import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import ProgressBar from './index';

describe('ProgressBar', () => {
  // 回归：value=0 maxValue=0 时 fill 的 style.width 不得含 NaN（除零守卫）
  it('does not produce NaN width when value=0 maxValue=0', () => {
    const { container } = render(<ProgressBar value={0} maxValue={0} />);
    const fill = container.querySelector('.progress-bar__fill') as HTMLElement;
    expect(fill).toBeInTheDocument();
    expect(fill.style.width).not.toContain('NaN');
    expect(fill.style.width).toBe('0%');
  });

  // 回归：value=5 maxValue=0 时同样不得含 NaN
  it('does not produce NaN width when value=5 maxValue=0', () => {
    const { container } = render(<ProgressBar value={5} maxValue={0} />);
    const fill = container.querySelector('.progress-bar__fill') as HTMLElement;
    expect(fill.style.width).not.toContain('NaN');
    expect(fill.style.width).toBe('0%');
  });

  it('renders progressbar role with BEM class and computes width percent', () => {
    const { container } = render(<ProgressBar value={50} maxValue={100} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveClass('progress-bar');
    expect(bar).toHaveAttribute('aria-valuenow', '50');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    const fill = container.querySelector('.progress-bar__fill') as HTMLElement;
    expect(fill.style.width).toBe('50%');
  });

  it('clamps over-max value to 100% and renders rounded output label', () => {
    const { container } = render(<ProgressBar value={150} maxValue={100} />);
    const fill = container.querySelector('.progress-bar__fill') as HTMLElement;
    expect(fill.style.width).toBe('100%');
    expect(container.querySelector('.progress-bar__output')).toHaveTextContent('100%');
  });

  it('renders indeterminate (no value) without fill width and without aria-valuenow', () => {
    const { container } = render(<ProgressBar />);
    const bar = screen.getByRole('progressbar');
    expect(bar).not.toHaveAttribute('aria-valuenow');
    const fill = container.querySelector('.progress-bar__fill') as HTMLElement;
    // indeterminate 不写内联 width
    expect(fill.getAttribute('style')).toBeNull();
    // indeterminate 不显示输出文案
    expect(container.querySelector('.progress-bar__output')).toBeNull();
  });

  it('applies color/size modifier classes and label/disabled props', () => {
    const { container } = render(
      <ProgressBar value={30} color="danger" size="lg" label="上传" isDisabled />,
    );
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveClass('progress-bar--danger');
    expect(bar).toHaveClass('progress-bar--lg');
    expect(bar).toHaveAttribute('data-disabled', 'true');
    expect(container.querySelector('[data-slot="label"]')).toHaveTextContent('上传');
  });

  it('has no axe a11y violations', async () => {
    // progressbar 的可访问名由消费方提供：这里用 label（写入 aria-labelledby）
    const { container } = render(<ProgressBar value={60} label="上传进度" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
