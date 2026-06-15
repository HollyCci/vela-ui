import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Tag, { TagGroup } from './index';

describe('Tag', () => {
  it('renders with size and variant BEM classes', () => {
    render(
      <Tag size="lg" variant="surface" data-testid="t">
        标签
      </Tag>,
    );
    const tag = screen.getByTestId('t');
    expect(tag).toHaveClass('tag', 'tag--lg', 'tag--surface');
    expect(tag).toHaveTextContent('标签');
  });

  // round3 #4 回归：仅可交互(有 onClick)的 tag 进 tab 序并具 button 语义，纯展示/禁用态不可聚焦
  it('is focusable only when interactive (onClick), not display-only or disabled', () => {
    const { rerender } = render(<Tag data-testid="t">x</Tag>);
    // 纯展示型 tag（无 onClick）不应成为可聚焦死角
    expect(screen.getByTestId('t')).not.toHaveAttribute('tabindex');

    rerender(
      <Tag data-testid="t" onClick={() => {}}>
        x
      </Tag>,
    );
    const interactive = screen.getByTestId('t');
    expect(interactive).toHaveAttribute('tabindex', '0');
    expect(interactive).toHaveAttribute('role', 'button');

    rerender(
      <Tag data-testid="t" onClick={() => {}} isDisabled>
        x
      </Tag>,
    );
    const disabled = screen.getByTestId('t');
    expect(disabled).not.toHaveAttribute('tabindex');
    expect(disabled).toHaveAttribute('data-disabled', 'true');
  });

  // round3 #4 回归：可交互 tag 支持键盘 Enter/Space 激活
  it('activates onClick via keyboard Enter and Space when interactive', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Tag data-testid="t" onClick={onClick}>
        x
      </Tag>,
    );
    const tag = screen.getByTestId('t');
    tag.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('reflects isSelected via data-selected', () => {
    render(
      <Tag data-testid="t" isSelected>
        选中
      </Tag>,
    );
    expect(screen.getByTestId('t')).toHaveAttribute('data-selected', 'true');
  });

  // 回归：受控选中 onClick 切换 —— 点击触发 onClick，父级更新 isSelected 后 data-selected 同步切换
  it('[regression] controlled selection toggles on click', async () => {
    const user = userEvent.setup();

    const Controlled = () => {
      const [selected, setSelected] = useState(false);
      return (
        <Tag data-testid="t" isSelected={selected} onClick={() => setSelected((s) => !s)}>
          可切换
        </Tag>
      );
    };

    render(<Controlled />);
    const tag = screen.getByTestId('t');
    // 初始未选中
    expect(tag).not.toHaveAttribute('data-selected');
    // 第一次点击 -> 选中
    await user.click(tag);
    expect(tag).toHaveAttribute('data-selected', 'true');
    // 第二次点击 -> 取消选中
    await user.click(tag);
    expect(tag).not.toHaveAttribute('data-selected');
  });

  it('fires onClick callback', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Tag data-testid="t" onClick={onClick}>
        点我
      </Tag>,
    );
    await user.click(screen.getByTestId('t'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders a remove button when onRemove provided and fires it', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <Tag data-testid="t" onRemove={onRemove}>
        可移除
      </Tag>,
    );
    const removeBtn = within(screen.getByTestId('t')).getByRole('button', { name: '移除' });
    expect(removeBtn).toBeInTheDocument();
    await user.click(removeBtn);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('disables remove button when tag is disabled', () => {
    render(
      <Tag data-testid="t" isDisabled onRemove={() => {}}>
        x
      </Tag>,
    );
    expect(within(screen.getByTestId('t')).getByRole('button', { name: '移除' })).toBeDisabled();
  });

  it('does not render remove button without onRemove', () => {
    render(<Tag data-testid="t">无移除</Tag>);
    expect(within(screen.getByTestId('t')).queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('TagGroup', () => {
  it('renders as a group with label, description and error message slots', () => {
    render(
      <TagGroup label="标签组" description="说明" errorMessage="出错了">
        <Tag>A</Tag>
        <Tag>B</Tag>
      </TagGroup>,
    );
    const group = screen.getByRole('group');
    expect(group).toHaveClass('tag-group');
    expect(within(group).getByText('标签组')).toHaveAttribute('data-slot', 'label');
    expect(within(group).getByText('说明')).toHaveAttribute('data-slot', 'description');
    expect(within(group).getByText('出错了')).toHaveAttribute('data-slot', 'error-message');
    expect(within(group).getByText('A')).toBeInTheDocument();
    expect(within(group).getByText('B')).toBeInTheDocument();
  });
});
