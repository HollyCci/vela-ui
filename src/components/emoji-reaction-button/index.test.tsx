import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import EmojiReactionButton from './index';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('EmojiReactionButton', () => {
  it('renders a toggle button with BEM class, size and data-slot', () => {
    render(
      <EmojiReactionButton size="lg" aria-label="like">
        <EmojiReactionButton.Emoji>👍</EmojiReactionButton.Emoji>
        <EmojiReactionButton.Count>3</EmojiReactionButton.Count>
      </EmojiReactionButton>,
    );
    const btn = screen.getByRole('button', { name: 'like' });
    expect(btn).toHaveClass('emoji-reaction-button');
    expect(btn).toHaveClass('emoji-reaction-button--lg');
    expect(btn).toHaveAttribute('data-slot', 'emoji-reaction-button');
    expect(
      btn.querySelector('[data-slot="emoji-reaction-button-emoji"]'),
    ).toHaveTextContent('👍');
    expect(
      btn.querySelector('[data-slot="emoji-reaction-button-count"]'),
    ).toHaveTextContent('3');
  });

  // 回归：isReadOnly 在 rerender 间 false→true 切换不得触发受控/非受控警告，data-readonly 正确
  it('toggling isReadOnly false→true does not emit a controlled/uncontrolled warning and sets data-readonly', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { rerender } = render(
      <EmojiReactionButton aria-label="react" defaultSelected isReadOnly={false} />,
    );
    let btn = screen.getByRole('button', { name: 'react' });
    expect(btn).not.toHaveAttribute('data-readonly');

    rerender(<EmojiReactionButton aria-label="react" defaultSelected isReadOnly />);
    btn = screen.getByRole('button', { name: 'react' });
    expect(btn).toHaveAttribute('data-readonly', 'true');

    // 断言 console.error 没有以 controlled/uncontrolled 相关信息被调用
    const controlledWarning = errorSpy.mock.calls.some((call) =>
      call.some(
        (arg) =>
          typeof arg === 'string' &&
          (/controlled/i.test(arg) || /uncontrolled/i.test(arg)),
      ),
    );
    expect(controlledWarning).toBe(false);
  });

  it('keeps onChange unwired and exposes readonly + selected display when isReadOnly', async () => {
    // 注意：只读靠 CSS pointer-events:none 屏蔽指针，jsdom 不执行该 CSS，
    // 故这里只断言「onChange 通道被切断」与「只读/选中态展示」，不验证指针被屏蔽。
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <EmojiReactionButton aria-label="locked" isReadOnly onChange={onChange} defaultSelected />,
    );
    const btn = screen.getByRole('button', { name: 'locked' });
    expect(btn).toHaveAttribute('data-readonly', 'true');
    // defaultSelected 原样透传 → 渲染为选中态展示
    expect(btn).toHaveAttribute('data-selected', 'true');
    expect(btn).toHaveAttribute('tabindex', '-1'); // excludeFromTabOrder
    await user.click(btn);
    // onChange 通道在只读时被置空，永不回调
    expect(onChange).not.toHaveBeenCalled();
  });

  it('fires onChange and toggles data-selected when interactive (uncontrolled)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EmojiReactionButton aria-label="toggle" onChange={onChange} />);
    const btn = screen.getByRole('button', { name: 'toggle' });
    await user.click(btn);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(btn).toHaveAttribute('data-selected', 'true');
  });

  it('has no axe a11y violations', async () => {
    // 按钮的可访问名由消费方提供（aria-label）；含 emoji + 计数完整结构
    const { container } = render(
      <EmojiReactionButton aria-label="点赞 3">
        <EmojiReactionButton.Emoji>👍</EmojiReactionButton.Emoji>
        <EmojiReactionButton.Count>3</EmojiReactionButton.Count>
      </EmojiReactionButton>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
