import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Radio from './index';

describe('Radio', () => {
  it('renders as a radio with BEM class and label', () => {
    render(<Radio>选项 A</Radio>);
    const input = screen.getByRole('radio');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'radio');
    expect(input.closest('label')).toHaveClass('radio');
    expect(screen.getByText('选项 A')).toHaveAttribute('data-slot', 'label');
  });

  it('renders description content', () => {
    render(<Radio description="说明文本">A</Radio>);
    expect(screen.getByText('说明文本')).toHaveAttribute('data-slot', 'description');
  });

  // 回归：style 落在可见 <label>，而隐藏 <input> 仍保留 VISUALLY_HIDDEN(position:absolute) 且不含 marginTop
  it('[regression] style lands on visible <label>, not on the visually-hidden <input>', () => {
    render(<Radio style={{ marginTop: 9 }}>单选</Radio>);
    const input = screen.getByRole('radio') as HTMLInputElement;
    const label = input.closest('label') as HTMLLabelElement;

    expect(label.style.marginTop).toBe('9px');
    // 隐藏 input 仍是 VISUALLY_HIDDEN（margin:-1 => -1px），未被用户的 9px 覆盖
    expect(input.style.position).toBe('absolute');
    expect(input.style.marginTop).not.toBe('9px');
    expect(input.style.marginTop).toBe('-1px');
  });

  it('selects on click and fires onSelectedChange (uncontrolled)', async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    render(<Radio onSelectedChange={onSelectedChange}>A</Radio>);
    const input = screen.getByRole('radio') as HTMLInputElement;
    expect(input.checked).toBe(false);
    await user.click(input);
    expect(onSelectedChange).toHaveBeenCalledWith(true);
    expect(input.checked).toBe(true);
    expect(input.closest('label')).toHaveAttribute('data-selected', 'true');
  });

  it('updates data-selected when the uncontrolled selection changes', async () => {
    const user = userEvent.setup();
    render(
      <Radio name="g" value="a">
        A
      </Radio>,
    );
    const a = screen.getByRole('radio') as HTMLInputElement;
    expect(a.closest('label')).not.toHaveAttribute('data-selected');
    await user.click(a);
    expect(a.checked).toBe(true);
    expect(a.closest('label')).toHaveAttribute('data-selected', 'true');
  });

  it('respects controlled isSelected (renders checked from prop)', () => {
    // 受控为 true：DOM 始终反映父级传入的值
    const { rerender } = render(<Radio isSelected>受控</Radio>);
    const input = screen.getByRole('radio') as HTMLInputElement;
    expect(input.checked).toBe(true);
    expect(input.closest('label')).toHaveAttribute('data-selected', 'true');
    // 父级翻转受控值 -> DOM 跟随
    rerender(<Radio isSelected={false}>受控</Radio>);
    expect(input.checked).toBe(false);
    expect(input.closest('label')).not.toHaveAttribute('data-selected');
  });

  it('reflects disabled and invalid states', () => {
    render(
      <Radio isDisabled isInvalid>
        禁用无效
      </Radio>,
    );
    const input = screen.getByRole('radio') as HTMLInputElement;
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.closest('label')).toHaveAttribute('data-disabled', 'true');
  });
});
