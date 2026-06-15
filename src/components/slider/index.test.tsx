import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Slider from './index';

// HeroUI/RAC Slider observes track size; jsdom has no layout/ResizeObserver.
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

describe('Slider', () => {
  it('renders a slider group with the slider class and label', () => {
    const { container } = render(<Slider label="音量" defaultValue={40} />);
    const root = container.querySelector('.slider');
    expect(root).toBeInTheDocument();
    expect(screen.getByText('音量')).toHaveAttribute('data-slot', 'label');
  });

  it('renders a thumb input with the slider role and value/min/max bounds', () => {
    render(<Slider aria-label="音量" defaultValue={40} minValue={0} maxValue={100} />);
    // RAC 用 <input type="range"> 承载 thumb（隐式 role=slider）；当前值在 value/min/max 上
    const thumb = screen.getByRole('slider') as HTMLInputElement;
    expect(thumb.tagName).toBe('INPUT');
    expect(thumb.type).toBe('range');
    expect(thumb.value).toBe('40');
    expect(thumb.min).toBe('0');
    expect(thumb.max).toBe('100');
  });

  it('passes className through to the root', () => {
    const { container } = render(
      <Slider aria-label="x" defaultValue={10} className="custom-slider" />,
    );
    const root = container.querySelector('.slider');
    expect(root).toHaveClass('custom-slider');
  });

  it('sets data-has-marks when marks are provided', () => {
    const { container } = render(
      <Slider aria-label="x" defaultValue={50} marks={[0, 50, 100]} />,
    );
    expect(container.querySelector('.slider')).toHaveAttribute('data-has-marks', 'true');
  });

  it('renders an output reflecting the default value', () => {
    const { container } = render(<Slider aria-label="进度" defaultValue={75} />);
    const output = container.querySelector('.slider__output');
    expect(output).toBeInTheDocument();
    expect(output).toHaveTextContent('75');
  });

  it('reflects disabled state on the thumb', () => {
    render(<Slider aria-label="x" defaultValue={20} isDisabled />);
    const thumb = screen.getByRole('slider');
    expect(thumb).toBeDisabled();
  });

  it('increases value with ArrowRight key (keyboard, layout-independent)', () => {
    const onChange = vi.fn();
    render(
      <Slider
        aria-label="音量"
        defaultValue={40}
        minValue={0}
        maxValue={100}
        step={1}
        onChange={onChange}
      />,
    );
    const thumb = screen.getByRole('slider') as HTMLInputElement;
    thumb.focus();
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    fireEvent.keyUp(thumb, { key: 'ArrowRight' });
    expect(thumb.value).toBe('41');
    expect(onChange).toHaveBeenLastCalledWith(41);
  });
});
