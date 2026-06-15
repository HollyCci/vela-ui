import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NumberStepper from './index';

// @number-flow/react 注册自定义元素并使用 ResizeObserver / 动画，jsdom 无布局。
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

const Parts = () => (
  <NumberStepper.Group>
    <NumberStepper.DecrementButton />
    <NumberStepper.Value />
    <NumberStepper.IncrementButton />
  </NumberStepper.Group>
);

// 不含 NumberStepper.Value 的组合：用于会触发"值变更 -> 重渲染"的交互测试。
// @number-flow/react 的自定义元素在 jsdom 下不会被升级，更新时 getSnapshotBeforeUpdate
// 会抛 `this.el?.willUpdate is not a function`，故交互测试改用这个不含 NumberFlow 的组合，
// 通过无障碍 spinbutton 的 aria-valuenow 验证步进行为。
const PartsNoFlow = () => (
  <NumberStepper.Group>
    <NumberStepper.DecrementButton />
    <NumberStepper.IncrementButton />
  </NumberStepper.Group>
);

describe('NumberStepper', () => {
  it('renders root with number-stepper class and a spinbutton', () => {
    const { container } = render(
      <NumberStepper aria-label="数量" defaultValue={5} minValue={0} maxValue={20}>
        <Parts />
      </NumberStepper>,
    );
    expect(container.querySelector('.number-stepper')).toBeInTheDocument();
    const spin = screen.getByRole('spinbutton');
    expect(spin).toHaveAttribute('data-slot', 'number-stepper-input');
    expect(spin).toHaveAttribute('aria-valuenow', '5');
  });

  it('renders increment and decrement buttons with size modifier classes', () => {
    render(
      <NumberStepper aria-label="数量" size="lg" defaultValue={1}>
        <Parts />
      </NumberStepper>,
    );
    const buttons = screen.getAllByRole('button');
    const dec = buttons.find((b) =>
      b.className.includes('number-stepper__decrement-button'),
    );
    const inc = buttons.find((b) =>
      b.className.includes('number-stepper__increment-button'),
    );
    expect(dec).toHaveClass('number-stepper__decrement-button--lg');
    expect(inc).toHaveClass('number-stepper__increment-button--lg');
  });

  it('exposes aria value bounds on the spinbutton', () => {
    render(
      <NumberStepper aria-label="数量" defaultValue={3} minValue={0} maxValue={9}>
        <Parts />
      </NumberStepper>,
    );
    const spin = screen.getByRole('spinbutton');
    expect(spin).toHaveAttribute('aria-valuemin', '0');
    expect(spin).toHaveAttribute('aria-valuemax', '9');
    expect(spin).toHaveAttribute('aria-valuenow', '3');
  });

  it('increments value via the increment button (spinbutton aria-valuenow)', async () => {
    const user = userEvent.setup();
    render(
      <NumberStepper aria-label="数量" defaultValue={5} minValue={0} maxValue={20}>
        <PartsNoFlow />
      </NumberStepper>,
    );
    const spin = screen.getByRole('spinbutton');
    expect(spin).toHaveAttribute('aria-valuenow', '5');
    const incBtn = screen
      .getAllByRole('button')
      .find((b) => b.className.includes('number-stepper__increment-button'))!;
    await user.click(incBtn);
    expect(spin).toHaveAttribute('aria-valuenow', '6');
  });

  it('renders the label and description', () => {
    render(
      <NumberStepper
        aria-label="数量"
        label="每日单词"
        description="0-20 之间"
        defaultValue={5}
      >
        <Parts />
      </NumberStepper>,
    );
    expect(screen.getByText('每日单词')).toHaveAttribute('data-slot', 'label');
    expect(screen.getByText('0-20 之间')).toHaveAttribute('data-slot', 'description');
  });

  it('reflects disabled state on the spinbutton', () => {
    render(
      <NumberStepper aria-label="禁用" defaultValue={3} isDisabled>
        <Parts />
      </NumberStepper>,
    );
    expect(screen.getByRole('spinbutton')).toBeDisabled();
  });
});
