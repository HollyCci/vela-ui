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
    // 根节点（react-aria CheckboxField）是带 .checkbox 类的 [data-slot="checkbox"] 容器
    const root = input.closest('[data-slot="checkbox"]');
    expect(root).toHaveClass('checkbox');
  });

  it('applies secondary variant class', () => {
    render(<Checkbox variant="secondary">x</Checkbox>);
    const root = screen.getByRole('checkbox').closest('[data-slot="checkbox"]');
    expect(root).toHaveClass('checkbox--secondary');
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

  // 回归：style 落在 .checkbox 根容器（react-aria CheckboxField），真 <input> 由底座
  // 包在 react-aria VisuallyHidden 的 <span>（position:absolute, margin:-1px）里，不承载用户 style
  it('[regression] style lands on the .checkbox root, input stays in a visually-hidden wrapper', () => {
    render(
      <Checkbox style={{ marginTop: 9 }} data-testid="cb">
        带样式
      </Checkbox>,
    );
    const input = screen.getByRole('checkbox') as HTMLInputElement;
    const root = input.closest('[data-slot="checkbox"]') as HTMLElement;
    const hiddenWrapper = input.parentElement as HTMLElement;

    // 根容器承载了用户传入的 marginTop
    expect(root.style.marginTop).toBe('9px');

    // 真 input 被底座 VisuallyHidden 包裹：包裹 <span> 为 position:absolute、margin:-1px，
    // 用户的 marginTop:9 未泄漏到隐藏控件
    expect(hiddenWrapper.style.position).toBe('absolute');
    expect(hiddenWrapper.style.marginTop).toBe('-1px');
    expect(input.style.marginTop).not.toBe('9px');
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

  // 事件模型桥接：旧契约 onClick / onPress 在点击真 <input> 时触发（底座偏好 onPress，这里桥接到原生 click）
  it('bridges onClick and onPress to the real input click', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onPress = vi.fn();
    render(
      <Checkbox onClick={onClick} onPress={onPress}>
        桥接
      </Checkbox>,
    );
    const input = screen.getByRole('checkbox') as HTMLInputElement;
    await user.click(input);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
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
