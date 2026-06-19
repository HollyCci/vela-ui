import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import Switch from './index';

// 底座 = @heroui/react Switch（react-aria-components）：根为 <div.switch>，
// 隐藏 <input role="switch"> 位于可见 label.switch__content 内；.switch 类在根元素上。
const getRoot = (input: HTMLElement) => input.closest('.switch') as HTMLElement;

describe('Switch', () => {
  it('renders with role="switch" and BEM class', () => {
    render(<Switch>通知</Switch>);
    const input = screen.getByRole('switch');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'checkbox');
    expect(getRoot(input)).toHaveClass('switch');
    expect(screen.getByText('通知')).toBeInTheDocument();
  });

  it('applies non-default size class', () => {
    render(<Switch size="lg">大</Switch>);
    expect(getRoot(screen.getByRole('switch'))).toHaveClass('switch--lg');
  });

  it('uses the md size modifier for the default size', () => {
    render(<Switch size="md">中</Switch>);
    const root = getRoot(screen.getByRole('switch'));
    expect(root).toHaveClass('switch');
    expect(root).toHaveClass('switch--md');
  });

  // 回归：style 落在可见根 <div.switch>，而隐藏 <input> 仍在 react-aria VisuallyHidden
  // 包裹（position:absolute）内，不被用户的 9px 覆盖
  it('[regression] style lands on the visible root, not on the visually-hidden input', () => {
    render(<Switch style={{ marginTop: 9 }}>开关</Switch>);
    const input = screen.getByRole('switch') as HTMLInputElement;
    const root = getRoot(input);

    expect(root.style.marginTop).toBe('9px');
    // 隐藏 input 由 VisuallyHidden <span> 包裹（position:absolute），未被用户的 9px 覆盖
    const hiddenWrapper = input.parentElement as HTMLElement;
    expect(hiddenWrapper.style.position).toBe('absolute');
    expect(input.style.marginTop).not.toBe('9px');
  });

  it('toggles and fires onSelectedChange in uncontrolled mode', async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    render(<Switch onSelectedChange={onSelectedChange}>开</Switch>);
    const input = screen.getByRole('switch') as HTMLInputElement;
    expect(input.checked).toBe(false);
    await user.click(input);
    expect(onSelectedChange).toHaveBeenCalledWith(true);
    expect(input.checked).toBe(true);
    expect(getRoot(input)).toHaveAttribute('data-selected', 'true');
  });

  it('respects controlled isSelected', async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    render(
      <Switch isSelected onSelectedChange={onSelectedChange}>
        受控
      </Switch>,
    );
    const input = screen.getByRole('switch') as HTMLInputElement;
    expect(input.checked).toBe(true);
    await user.click(input);
    expect(onSelectedChange).toHaveBeenCalledWith(false);
    expect(input.checked).toBe(true);
  });

  it('reflects disabled state', () => {
    render(<Switch isDisabled>禁用</Switch>);
    const input = screen.getByRole('switch') as HTMLInputElement;
    expect(input).toBeDisabled();
    expect(getRoot(input)).toHaveAttribute('data-disabled', 'true');
  });

  it('has no axe a11y violations', async () => {
    const { container } = render(<Switch>开启邮件通知</Switch>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
