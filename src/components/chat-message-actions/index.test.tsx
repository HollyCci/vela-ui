import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatMessageActions from './index';

describe('ChatMessageActions', () => {
  it('renders root row with data-slot', () => {
    render(
      <ChatMessageActions>
        <ChatMessageActions.Action aria-label="Custom" />
      </ChatMessageActions>,
    );
    const root = document.querySelector('[data-slot="chat-message-actions"]');
    expect(root).toBeInTheDocument();
    expect(root).toHaveClass('chat-message-actions');
  });

  it('Action renders an OSS button with data-slot and forwards aria-label', () => {
    render(<ChatMessageActions.Action aria-label="More" />);
    const btn = screen.getByRole('button', { name: 'More' });
    expect(btn).toHaveAttribute('data-slot', 'chat-message-action');
    expect(btn).toHaveClass('chat-message__action');
  });

  describe('Copy', () => {
    let originalClipboard: PropertyDescriptor | undefined;

    // 只覆盖 navigator.clipboard，保留其余 navigator（userEvent.setup 依赖它），
    // 测试后恢复，避免污染其他用例。
    const setClipboard = (writeText: ReturnType<typeof vi.fn>) => {
      originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText },
      });
    };

    afterEach(() => {
      if (originalClipboard) {
        Object.defineProperty(navigator, 'clipboard', originalClipboard);
      } else {
        // @ts-expect-error 测试清理：删掉测试期间新增的 clipboard
        delete navigator.clipboard;
      }
      originalClipboard = undefined;
    });

    // 回归：点击复制按钮后，clipboard.writeText 被调用，状态切到 copied
    // （data-copy-status=copied 且 aria-label 变为 "Copied"）。
    // 用真实计时器 + 较长 timeout 避免在断言期间被重置回 idle。
    it('regression: copy click writes to clipboard and shows copied state', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      // userEvent.setup() 会替换 navigator.clipboard，故在其之后再装入我们的桩
      const user = userEvent.setup();
      setClipboard(writeText);
      render(<ChatMessageActions.Copy content="hello world" timeout={100000} />);

      const btn = screen.getByRole('button', { name: 'Copy' });
      expect(btn).toHaveAttribute('data-copy-status', 'idle');

      await user.click(btn);

      expect(writeText).toHaveBeenCalledWith('hello world');

      // 异步 then 把状态切到 copied
      await waitFor(() => {
        expect(btn).toHaveAttribute('data-copy-status', 'copied');
      });
      // aria-label 同步切到 "Copied"
      expect(btn).toHaveAccessibleName('Copied');
    });

    it('resets back to idle after timeout', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();
      setClipboard(writeText);
      render(<ChatMessageActions.Copy content="x" timeout={60} />);
      const btn = screen.getByRole('button', { name: 'Copy' });

      await user.click(btn);
      await waitFor(() => expect(btn).toHaveAttribute('data-copy-status', 'copied'));

      // 真实计时器走完短超时后回到 idle
      await waitFor(() => expect(btn).toHaveAttribute('data-copy-status', 'idle'));
    });

    // 失败态：clipboard.writeText 抛错时切到 failed 且 aria-label 为 "Copy failed"
    it('shows failed state when clipboard rejects', async () => {
      const writeText = vi.fn().mockRejectedValue(new Error('blocked'));
      const user = userEvent.setup();
      setClipboard(writeText);
      render(<ChatMessageActions.Copy content="x" timeout={100000} />);
      const btn = screen.getByRole('button', { name: 'Copy' });

      await user.click(btn);
      await waitFor(() => expect(btn).toHaveAttribute('data-copy-status', 'failed'));
      expect(btn).toHaveAccessibleName('Copy failed');
    });
  });

  it('ThumbsUp is a toggle button reflecting controlled selection via aria-pressed', () => {
    const { rerender } = render(<ChatMessageActions.ThumbsUp isSelected={false} />);
    const btn = screen.getByRole('button', { name: 'Good response' });
    expect(btn).toHaveAttribute('aria-pressed', 'false');

    rerender(<ChatMessageActions.ThumbsUp isSelected />);
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('ThumbsDown fires onChange when toggled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ChatMessageActions.ThumbsDown onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Bad response' }));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('Regenerate and Menu render with default aria-labels', () => {
    render(
      <>
        <ChatMessageActions.Regenerate />
        <ChatMessageActions.Menu />
      </>,
    );
    expect(screen.getByRole('button', { name: 'Regenerate' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'More actions' })).toBeInTheDocument();
  });
});
