import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import CellColorPicker, { parseCellColor } from './index';

const renderPicker = (props: Record<string, unknown> = {}) =>
  render(
    <CellColorPicker {...props}>
      <CellColorPicker.Trigger>
        <CellColorPicker.Label>Accent</CellColorPicker.Label>
        <CellColorPicker.ValueDisplay />
        <CellColorPicker.Swatch />
      </CellColorPicker.Trigger>
    </CellColorPicker>,
  );

describe('CellColorPicker', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: false,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
      }),
    );
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });

  it('parseCellColor parses a hex string into a Color and round-trips to uppercase hex', () => {
    const color = parseCellColor('#3b82f6');
    expect(color.toString('hex').toUpperCase()).toBe('#3B82F6');
  });

  it('renders trigger button + label + value-display + swatch with data-slots', () => {
    const { container } = renderPicker({ defaultValue: '#3B82F6' });
    expect(container.querySelector('[data-slot="cell-color-picker-trigger"]')).toHaveClass(
      'cell-color-picker__trigger',
    );
    expect(container.querySelector('[data-slot="cell-color-picker-label"]')).toHaveTextContent(
      'Accent',
    );
    expect(
      container.querySelector('[data-slot="cell-color-picker-value-display"]'),
    ).toBeInTheDocument();
    // RAC Button renders a real <button>
    expect(screen.getByRole('button', { name: /Accent/ })).toBeInTheDocument();
  });

  it('ValueDisplay shows the current color as uppercase hex from picker state', () => {
    const { container } = renderPicker({ defaultValue: '#ff5733' });
    expect(
      container.querySelector('[data-slot="cell-color-picker-value-display"]'),
    ).toHaveTextContent('#FF5733');
  });

  it('default variant applies --default modifier on the trigger', () => {
    const { container } = renderPicker({ defaultValue: '#3B82F6' });
    expect(container.querySelector('[data-slot="cell-color-picker-trigger"]')).toHaveClass(
      'cell-color-picker__trigger--default',
    );
  });

  it('secondary variant applies --secondary modifier on the trigger', () => {
    const { container } = renderPicker({ defaultValue: '#22C55E', variant: 'secondary' });
    expect(container.querySelector('[data-slot="cell-color-picker-trigger"]')).toHaveClass(
      'cell-color-picker__trigger--secondary',
    );
  });

  it('disabled trigger renders a disabled button', () => {
    const { container } = render(
      <CellColorPicker defaultValue="#EF4444">
        <CellColorPicker.Trigger isDisabled>
          <CellColorPicker.Label>Disabled</CellColorPicker.Label>
          <CellColorPicker.ValueDisplay />
          <CellColorPicker.Swatch />
        </CellColorPicker.Trigger>
      </CellColorPicker>,
    );
    const button = container.querySelector('[data-slot="cell-color-picker-trigger"]');
    expect(button).toBeDisabled();
  });

  it('root isDisabled disables the trigger button without a per-trigger flag', () => {
    const { container } = render(
      <CellColorPicker defaultValue="#EF4444" isDisabled>
        <CellColorPicker.Trigger>
          <CellColorPicker.Label>Disabled</CellColorPicker.Label>
          <CellColorPicker.ValueDisplay />
          <CellColorPicker.Swatch />
        </CellColorPicker.Trigger>
      </CellColorPicker>,
    );
    expect(
      container.querySelector('[data-slot="cell-color-picker-trigger"]'),
    ).toBeDisabled();
  });

  it('root isDisabled propagates to Area and Slider children (data-disabled)', () => {
    const { container } = render(
      <CellColorPicker defaultValue="#3B82F6" isDisabled>
        <CellColorPicker.Area
          colorSpace="hsb"
          xChannel="saturation"
          yChannel="brightness"
        >
          <CellColorPicker.Area.Thumb />
        </CellColorPicker.Area>
        <CellColorPicker.Slider aria-label="Hue" channel="hue" colorSpace="hsb">
          <CellColorPicker.Slider.Track>
            <CellColorPicker.Slider.Thumb />
          </CellColorPicker.Slider.Track>
        </CellColorPicker.Slider>
      </CellColorPicker>,
    );
    // RAC marks disabled ColorArea / ColorSlider with data-disabled="true".
    // (HeroUI's ColorArea wrapper overrides data-slot to "color-area",
    //  so we match on our own modifier class instead.)
    expect(container.querySelector('.cell-color-picker__area')).toHaveAttribute(
      'data-disabled',
      'true',
    );
    expect(
      container.querySelector('[data-slot="cell-color-picker-slider"]'),
    ).toHaveAttribute('data-disabled', 'true');
  });

  it('root isDisabled propagates to SwatchPicker items (aria-disabled)', () => {
    const { container } = render(
      <CellColorPicker defaultValue="#3B82F6" isDisabled>
        <CellColorPicker.SwatchPicker aria-label="Presets">
          <CellColorPicker.SwatchPicker.Item color="#22C55E">
            <CellColorPicker.SwatchPicker.Swatch />
          </CellColorPicker.SwatchPicker.Item>
        </CellColorPicker.SwatchPicker>
      </CellColorPicker>,
    );
    // RAC ColorSwatchPicker only supports per-item disable, so the root forwards
    // disabled to each item via context -> data-disabled / aria-disabled
    const item = container.querySelector(
      '[data-slot="cell-color-picker-swatch-picker-item"]',
    );
    expect(item).toHaveAttribute('data-disabled', 'true');
    expect(item).toHaveAttribute('aria-disabled', 'true');
  });

  it('SwatchPicker items are not disabled when root is enabled', () => {
    const { container } = render(
      <CellColorPicker defaultValue="#3B82F6">
        <CellColorPicker.SwatchPicker aria-label="Presets">
          <CellColorPicker.SwatchPicker.Item color="#22C55E">
            <CellColorPicker.SwatchPicker.Swatch />
          </CellColorPicker.SwatchPicker.Item>
        </CellColorPicker.SwatchPicker>
      </CellColorPicker>,
    );
    expect(
      container.querySelector('[data-slot="cell-color-picker-swatch-picker-item"]'),
    ).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('children stay interactive when root is not disabled', () => {
    const { container } = render(
      <CellColorPicker defaultValue="#3B82F6">
        <CellColorPicker.Slider aria-label="Hue" channel="hue" colorSpace="hsb">
          <CellColorPicker.Slider.Track>
            <CellColorPicker.Slider.Thumb />
          </CellColorPicker.Slider.Track>
        </CellColorPicker.Slider>
      </CellColorPicker>,
    );
    expect(
      container.querySelector('[data-slot="cell-color-picker-slider"]'),
    ).not.toHaveAttribute('data-disabled', 'true');
  });

  it('SwatchPicker item selects a color when the picker is enabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <CellColorPicker defaultValue="#3B82F6" onChange={onChange}>
        <CellColorPicker.SwatchPicker aria-label="Presets">
          <CellColorPicker.SwatchPicker.Item color="#22C55E">
            <CellColorPicker.SwatchPicker.Swatch />
          </CellColorPicker.SwatchPicker.Item>
        </CellColorPicker.SwatchPicker>
      </CellColorPicker>,
    );
    const item = container.querySelector(
      '[data-slot="cell-color-picker-swatch-picker-item"]',
    ) as HTMLElement;
    await user.click(item);
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls.at(-1)?.[0].toString('hex')).toBe('#22C55E');
  });

  it('Field renders a hex text input that updates the picker value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <CellColorPicker defaultValue="#3B82F6" onChange={onChange}>
        <CellColorPicker.ValueDisplay />
        <CellColorPicker.Field aria-label="Hex">
          <CellColorPicker.Field.Input />
        </CellColorPicker.Field>
      </CellColorPicker>,
    );
    const input = screen.getByRole('textbox', { name: 'Hex' });
    // ColorField inside ColorPicker syncs via ColorFieldContext, so it reflects current color
    expect(input).toHaveValue('#3B82F6');

    await user.clear(input);
    await user.type(input, '#22C55E');
    await user.tab();

    expect(onChange).toHaveBeenCalled();
    const last = onChange.mock.calls.at(-1)?.[0];
    expect(last.toString('hex')).toBe('#22C55E');
    expect(
      document.querySelector('[data-slot="cell-color-picker-value-display"]'),
    ).toHaveTextContent('#22C55E');
  });

  it('root isDisabled disables the Field hex input', () => {
    render(
      <CellColorPicker defaultValue="#3B82F6" isDisabled>
        <CellColorPicker.Field aria-label="Hex">
          <CellColorPicker.Field.Input />
        </CellColorPicker.Field>
      </CellColorPicker>,
    );
    expect(screen.getByRole('textbox', { name: 'Hex' })).toBeDisabled();
  });

  it('has no axe a11y violations', async () => {
    const { container } = renderPicker({ defaultValue: '#3B82F6' });
    expect(await axe(container)).toHaveNoViolations();
  });
});
