import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PromptInput from './index';

// TextArea 用 ResizeObserver 做自适应高度；getComputedStyle 在 jsdom 返回空值，
// measure 仍可跑（scrollHeight=0），不影响行为断言。mock ResizeObserver 防止报错。
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

describe('PromptInput', () => {
  it('renders root with data-slot/status/variant', () => {
    render(
      <PromptInput status="ready" variant="primary">
        <PromptInput.Shell>
          <PromptInput.TextArea />
        </PromptInput.Shell>
      </PromptInput>,
    );
    const root = document.querySelector('[data-slot="prompt-input"]');
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute('data-status', 'ready');
    expect(root).toHaveAttribute('data-variant', 'primary');
    expect(root).toHaveClass('prompt-input');
  });

  // 回归：<PromptInput.Action tooltip="发送"> 渲染的按钮 aria-label === '发送'
  // （string tooltip 回填为 aria-label，无障碍名不丢）。
  it('regression: Action with string tooltip backfills aria-label', () => {
    render(
      <PromptInput>
        <PromptInput.Toolbar>
          <PromptInput.Action tooltip="发送" />
        </PromptInput.Toolbar>
      </PromptInput>,
    );
    const btn = screen.getByRole('button', { name: '发送' });
    expect(btn).toHaveAttribute('aria-label', '发送');
    expect(btn).toHaveAttribute('data-slot', 'prompt-input-action');
  });

  it('Action without tooltip still renders a button (no aria-label injected)', () => {
    render(
      <PromptInput>
        <PromptInput.Toolbar>
          <PromptInput.Action aria-label="附件" />
        </PromptInput.Toolbar>
      </PromptInput>,
    );
    const btn = screen.getByRole('button', { name: '附件' });
    expect(btn).toHaveAttribute('data-slot', 'prompt-input-action');
  });

  it('TextArea is controlled by root context: typing fires onValueChange', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <PromptInput onValueChange={onValueChange}>
        <PromptInput.Shell>
          <PromptInput.TextArea />
        </PromptInput.Shell>
      </PromptInput>,
    );
    const textarea = screen.getByRole('textbox', { name: 'Message input' });
    await user.type(textarea, 'hi');
    expect(onValueChange).toHaveBeenCalled();
    expect(onValueChange).toHaveBeenLastCalledWith('hi');
  });

  it('Enter submits non-empty value; Shift+Enter does not', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <PromptInput defaultValue="" onSubmit={onSubmit}>
        <PromptInput.Shell>
          <PromptInput.TextArea />
        </PromptInput.Shell>
      </PromptInput>,
    );
    const textarea = screen.getByRole('textbox', { name: 'Message input' });
    await user.type(textarea, 'hello');

    // Shift+Enter inserts newline, does not submit
    await user.keyboard('{Shift>}{Enter}{/Shift}');
    expect(onSubmit).not.toHaveBeenCalled();

    // Enter submits
    await user.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalledWith(expect.stringContaining('hello'));
  });

  it('Send button is disabled when value empty, enabled once non-empty', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <PromptInput defaultValue="" status="ready" onSubmit={onSubmit}>
        <PromptInput.Shell>
          <PromptInput.TextArea />
          <PromptInput.Toolbar>
            <PromptInput.ToolbarEnd>
              <PromptInput.Send />
            </PromptInput.ToolbarEnd>
          </PromptInput.Toolbar>
        </PromptInput.Shell>
      </PromptInput>,
    );
    const send = screen.getByRole('button', { name: 'Send message' });
    expect(send).toBeDisabled();

    await user.type(screen.getByRole('textbox', { name: 'Message input' }), 'x');
    expect(send).not.toBeDisabled();

    await user.click(send);
    expect(onSubmit).toHaveBeenCalledWith('x');
  });

  it('Send shows stop label and calls onStop while streaming', async () => {
    const user = userEvent.setup();
    const onStop = vi.fn();
    render(
      <PromptInput status="streaming" onStop={onStop}>
        <PromptInput.Shell>
          <PromptInput.Send />
        </PromptInput.Shell>
      </PromptInput>,
    );
    const send = screen.getByRole('button', { name: 'Stop generating' });
    expect(send).toHaveAttribute('data-status', 'streaming');
    await user.click(send);
    expect(onStop).toHaveBeenCalledTimes(1);
  });
});
