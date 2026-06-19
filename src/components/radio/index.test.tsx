import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import Radio from './index';

describe('Radio', () => {
  it('renders as a radio with BEM class and label', () => {
    render(<Radio>选项 A</Radio>);
    const input = screen.getByRole('radio');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'radio');
    // 真 RAC DOM：.radio 是 RadioField <div> 包裹层；<label> 是 RadioButton(.radio__content)
    expect(input.closest('[data-slot="radio"]')).toHaveClass('radio');
    expect(screen.getByText('选项 A')).toHaveAttribute('data-slot', 'label');
  });

  it('renders description content', () => {
    render(<Radio description="说明文本">A</Radio>);
    expect(screen.getByText('说明文本')).toHaveAttribute('data-slot', 'description');
  });

  // 回归：style 落在可见的 .radio(RadioField) 包裹层，而真 input 由 RAC 包在 VisuallyHidden <span>
  // 内（position:absolute / margin:-1px），用户的 9px 不会污染隐藏 input
  it('[regression] style lands on visible .radio wrapper, not on the visually-hidden input', () => {
    render(<Radio style={{ marginTop: 9 }}>单选</Radio>);
    const input = screen.getByRole('radio') as HTMLInputElement;
    const root = input.closest('[data-slot="radio"]') as HTMLElement;
    const hiddenWrap = input.parentElement as HTMLElement;

    expect(root.style.marginTop).toBe('9px');
    // RAC 的 VisuallyHidden 包裹 span：position:absolute、margin:-1px，未被用户 9px 覆盖
    expect(hiddenWrap.style.position).toBe('absolute');
    expect(hiddenWrap.style.marginTop).toBe('-1px');
    expect(input.style.marginTop).not.toBe('9px');
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
    const root = input.closest('[data-slot="radio"]') as HTMLElement;
    expect(input).toBeDisabled();
    // RAC 在 field/group 层用 data-invalid 表达无效态（真状态），不再是 input 上的 aria-invalid 假属性
    expect(root).toHaveAttribute('data-invalid', 'true');
    expect(root).toHaveAttribute('data-disabled', 'true');
  });

  it('has no axe a11y violations', async () => {
    const { container } = render(
      <fieldset>
        <legend>选择难度</legend>
        <Radio name="difficulty" value="easy">
          简单
        </Radio>
        <Radio name="difficulty" value="hard" description="挑战模式">
          困难
        </Radio>
      </fieldset>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
