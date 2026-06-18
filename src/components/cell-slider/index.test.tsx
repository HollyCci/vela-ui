import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import CellSlider from './index';

const renderSlider = (props: Record<string, unknown> = {}) =>
  render(
    <CellSlider aria-label="volume" minValue={0} maxValue={100} step={1} {...props}>
      <CellSlider.Track>
        <CellSlider.Fill />
        <CellSlider.Thumb />
        <CellSlider.Label>Volume</CellSlider.Label>
        <CellSlider.Output />
      </CellSlider.Track>
    </CellSlider>,
  );

describe('CellSlider', () => {
  beforeEach(() => {
    // RAC Slider reads layout via ResizeObserver
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });

  it('renders root + track + fill + thumb + label + output with data-slots', () => {
    const { container } = renderSlider({ defaultValue: 75 });
    expect(container.querySelector('[data-slot="cell-slider"]')).toHaveClass('cell-slider');
    expect(container.querySelector('[data-slot="cell-slider-track"]')).toHaveClass(
      'cell-slider__track',
    );
    expect(container.querySelector('[data-slot="cell-slider-fill"]')).toHaveClass(
      'cell-slider__fill',
    );
    expect(container.querySelector('[data-slot="cell-slider-thumb"]')).toHaveClass(
      'cell-slider__thumb',
    );
    expect(container.querySelector('[data-slot="cell-slider-label"]')).toHaveTextContent('Volume');
    // slider role provided by RAC
    expect(screen.getByRole('slider', { name: 'volume' })).toBeInTheDocument();
  });

  it('default variant applies --default modifier on the track', () => {
    const { container } = renderSlider({ defaultValue: 50 });
    expect(container.querySelector('[data-slot="cell-slider-track"]')).toHaveClass(
      'cell-slider__track--default',
    );
  });

  it('secondary variant applies --secondary modifier on the track', () => {
    const { container } = renderSlider({ defaultValue: 50, variant: 'secondary' });
    expect(container.querySelector('[data-slot="cell-slider-track"]')).toHaveClass(
      'cell-slider__track--secondary',
    );
  });

  it('forces horizontal orientation even when runtime props include orientation', () => {
    const { container } = renderSlider({
      defaultValue: 50,
      orientation: 'vertical',
    });
    expect(container.querySelector('[data-slot="cell-slider"]')).toHaveAttribute(
      'data-orientation',
      'horizontal',
    );
  });

  it('reflects controlled value on the range input and the output text', () => {
    const { container } = renderSlider({ value: 42 });
    // RAC renders the thumb as a native <input type="range"> (implicit role=slider)
    const slider = screen.getByRole('slider', { name: 'volume' }) as HTMLInputElement;
    expect(slider).toHaveValue('42');
    expect(slider).toHaveAttribute('aria-valuetext', '42');
    expect(container.querySelector('[data-slot="cell-slider-output"]')).toHaveTextContent('42');
  });

  it('keyboard arrow changes value and fires onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderSlider({ defaultValue: 50, onChange });

    const slider = screen.getByRole('slider', { name: 'volume' }) as HTMLInputElement;
    slider.focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalled();
    // step=1 from 50 -> 51
    expect(slider).toHaveValue('51');
  });

  it('disabled slider marks the thumb input disabled', () => {
    renderSlider({ defaultValue: 30, isDisabled: true });
    expect(screen.getByRole('slider', { name: 'volume' })).toBeDisabled();
  });

  it('has no axe a11y violations', async () => {
    const { container } = renderSlider({ defaultValue: 75 });
    expect(await axe(container)).toHaveNoViolations();
  });
});
