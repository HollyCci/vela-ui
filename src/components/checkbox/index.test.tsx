import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import Checkbox from './index';

describe('Checkbox', () => {
  it('renders as a checkbox with BEM class and label content', () => {
    render(<Checkbox>同意条款</Checkbox>);
    const input = screen.getByRole('checkbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'checkbox');
    // 可见标签内容渲染在 .label slot 上
    expect(screen.getByText('同意条款')).toHaveAttribute('data-slot', 'label');
    // 根节点是带 .checkbox 类的 <label>
    const label = input.closest('label');
    expect(label).toHaveClass('checkbox');
  });

  it('applies secondary variant class', () => {
    render(<Checkbox variant="secondary">x</Checkbox>);
    const label = screen.getByRole('checkbox').closest('label');
    expect(label).toHaveClass('checkbox--secondary');
  });

  // 回归：isIndeterminate 时原生 input.indeterminate 必须为 true
  it('[regression] sets native input.indeterminate === true when isIndeterminate', () => {
    render(<Checkbox isIndeterminate>部分选中</Checkbox>);
    const input = screen.getByRole('checkbox') as HTMLInputElement;
    expect(input.indeterminate).toBe(true);
    // data-indeterminate 反映在根 label 上，且渲染了 indeterminate 指示 svg
    expect(input.closest('label')).toHaveAttribute('data-indeterminate', 'true');
    expect(
      document.querySelector('[data-slot="checkbox-default-indicator--indeterminate"]'),
    ).toBeInTheDocument();
  });

  it('[regression] native input.indeterminate is false when not indeterminate', () => {
    render(<Checkbox>普通</Checkbox>);
    const input = screen.getByRole('checkbox') as HTMLInputElement;
    expect(input.indeterminate).toBe(false);
  });

  // 回归：style 落在可见 <label>，而隐藏 <input> 仍保留 VISUALLY_HIDDEN(position:absolute) 且不含 marginTop
  it('[regression] style lands on visible <label>, not on the visually-hidden <input>', () => {
    render(
      <Checkbox style={{ marginTop: 9 }} data-testid="cb">
        带样式
      </Checkbox>,
    );
    const input = screen.getByRole('checkbox') as HTMLInputElement;
    const label = input.closest('label') as HTMLLabelElement;

    // 可见 label 承载了用户传入的 marginTop
    expect(label.style.marginTop).toBe('9px');

    // 隐藏 input 仍是 VISUALLY_HIDDEN：position absolute；且未被用户的 marginTop:9 覆盖
    // （VISUALLY_HIDDEN 自带 margin:-1，序列化为 -1px，而非用户传入的 9px）
    expect(input.style.position).toBe('absolute');
    expect(input.style.marginTop).not.toBe('9px');
    expect(input.style.marginTop).toBe('-1px');
  });

  it('fires onSelectedChange and toggles in uncontrolled mode', async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    render(<Checkbox onSelectedChange={onSelectedChange}>勾选</Checkbox>);
    const input = screen.getByRole('checkbox') as HTMLInputElement;
    expect(input.checked).toBe(false);
    await user.click(input);
    expect(onSelectedChange).toHaveBeenCalledWith(true);
    expect(input.checked).toBe(true);
  });

  it('respects controlled isSelected (does not flip internally)', async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    render(
      <Checkbox isSelected onSelectedChange={onSelectedChange}>
        受控
      </Checkbox>,
    );
    const input = screen.getByRole('checkbox') as HTMLInputElement;
    expect(input.checked).toBe(true);
    await user.click(input);
    // 受控：回调被通知，但 DOM 保持父级传入的值
    expect(onSelectedChange).toHaveBeenCalledWith(false);
    expect(input.checked).toBe(true);
  });

  it('reflects disabled state', () => {
    render(<Checkbox isDisabled>禁用</Checkbox>);
    const input = screen.getByRole('checkbox') as HTMLInputElement;
    expect(input).toBeDisabled();
    expect(input.closest('label')).toHaveAttribute('data-disabled', 'true');
  });

  it('reflects invalid state via aria-invalid', () => {
    render(<Checkbox isInvalid>无效</Checkbox>);
    const input = screen.getByRole('checkbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.closest('label')).toHaveAttribute('data-invalid', 'true');
  });

  it('has no axe a11y violations', async () => {
    const { container } = render(<Checkbox>同意服务条款</Checkbox>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
