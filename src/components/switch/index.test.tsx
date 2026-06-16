import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import Switch from './index';

describe('Switch', () => {
  it('renders with role="switch" and BEM class', () => {
    render(<Switch>通知</Switch>);
    const input = screen.getByRole('switch');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'checkbox');
    expect(input.closest('label')).toHaveClass('switch');
    expect(screen.getByText('通知')).toBeInTheDocument();
  });

  it('applies non-default size class', () => {
    render(<Switch size="lg">大</Switch>);
    expect(screen.getByRole('switch').closest('label')).toHaveClass('switch--lg');
  });

  it('does not add a size modifier class for md (default)', () => {
    render(<Switch size="md">中</Switch>);
    const label = screen.getByRole('switch').closest('label') as HTMLLabelElement;
    expect(label).toHaveClass('switch');
    expect(label.className).not.toContain('switch--md');
  });

  // 回归：style 落在可见 <label>，而隐藏 <input> 仍保留 VISUALLY_HIDDEN(position:absolute) 且不含 marginTop
  it('[regression] style lands on visible <label>, not on the visually-hidden <input>', () => {
    render(<Switch style={{ marginTop: 9 }}>开关</Switch>);
    const input = screen.getByRole('switch') as HTMLInputElement;
    const label = input.closest('label') as HTMLLabelElement;

    expect(label.style.marginTop).toBe('9px');
    // 隐藏 input 仍是 VISUALLY_HIDDEN（margin:-1 => -1px），未被用户的 9px 覆盖
    expect(input.style.position).toBe('absolute');
    expect(input.style.marginTop).not.toBe('9px');
    expect(input.style.marginTop).toBe('-1px');
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
    expect(input.closest('label')).toHaveAttribute('data-selected', 'true');
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
    expect(input.closest('label')).toHaveAttribute('data-disabled', 'true');
  });

  it('has no axe a11y violations', async () => {
    const { container } = render(<Switch>开启邮件通知</Switch>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
