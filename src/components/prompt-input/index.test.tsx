import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import PromptInput from './index';

/** 构造一个带 files 的 DataTransfer-like 对象（jsdom 不实现 DataTransfer.files 注入） */
const makeFileDataTransfer = (files: File[]) =>
  ({
    files,
    items: files.map((file) => ({ kind: 'file', type: file.type, getAsFile: () => file })),
    types: ['Files'],
  }) as unknown as DataTransfer;

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

  // Gap 修复（拖放放置区）：根传 onFilesDrop 时 Shell 接通原生文件拖放——
  // dragOver 设 data-dragging=true（命中 CSS 虚线高亮），drop 透传 File[] 给回调、并复位 data-dragging。
  it('Shell surfaces dropped files and toggles data-dragging when onFilesDrop is provided', () => {
    const onFilesDrop = vi.fn();
    render(
      <PromptInput onFilesDrop={onFilesDrop}>
        <PromptInput.Shell>
          <PromptInput.TextArea />
        </PromptInput.Shell>
      </PromptInput>,
    );
    const shell = document.querySelector('[data-slot="prompt-input-shell"]') as HTMLElement;
    expect(shell).not.toHaveAttribute('data-dragging');

    // 拖入文件高亮
    fireEvent.dragOver(shell, { dataTransfer: makeFileDataTransfer([]) });
    expect(shell).toHaveAttribute('data-dragging', 'true');

    // 离开复位
    fireEvent.dragLeave(shell, { dataTransfer: makeFileDataTransfer([]) });
    expect(shell).not.toHaveAttribute('data-dragging');

    // 放下：透传 File[] 并复位高亮
    const file = new File(['x'], 'note.pdf', { type: 'application/pdf' });
    fireEvent.dragOver(shell, { dataTransfer: makeFileDataTransfer([file]) });
    fireEvent.drop(shell, { dataTransfer: makeFileDataTransfer([file]) });
    expect(onFilesDrop).toHaveBeenCalledTimes(1);
    expect(onFilesDrop.mock.calls[0][0]).toHaveLength(1);
    expect(onFilesDrop.mock.calls[0][0][0].name).toBe('note.pdf');
    expect(shell).not.toHaveAttribute('data-dragging');
  });

  it('Shell does not bind drop / set data-dragging when onFilesDrop is absent', () => {
    render(
      <PromptInput>
        <PromptInput.Shell>
          <PromptInput.TextArea />
        </PromptInput.Shell>
      </PromptInput>,
    );
    const shell = document.querySelector('[data-slot="prompt-input-shell"]') as HTMLElement;
    fireEvent.dragOver(shell, { dataTransfer: makeFileDataTransfer([]) });
    expect(shell).not.toHaveAttribute('data-dragging');
  });

  // Gap 修复（键盘排序）：values+onReorder 同传时 Handle 支持方向键/Home/End 排序，
  // 经 onReorder 提交新顺序，边界自动夹取。可拖拽语义沿用 data-reorder-enabled
  //（底座 OSS Button 过滤 aria-roledescription/aria-keyshortcuts，保真铁律下不伪造）。
  it('Queue handle reorders by keyboard (Arrow / Home / End) and marks data-reorder-enabled', () => {
    const onReorder = vi.fn();
    const items = [
      { id: 1, text: '第一项' },
      { id: 2, text: '第二项' },
      { id: 3, text: '第三项' },
    ];
    render(
      <PromptInput>
        <PromptInput.Queue>
          <PromptInput.Queue.List values={items} onReorder={onReorder}>
            {items.map((item) => (
              <PromptInput.Queue.Item key={item.id} value={item}>
                <PromptInput.Queue.Item.Handle aria-label={`重排 ${item.text}`} />
                <PromptInput.Queue.Item.Body>
                  <PromptInput.Queue.Item.Content>{item.text}</PromptInput.Queue.Item.Content>
                </PromptInput.Queue.Item.Body>
              </PromptInput.Queue.Item>
            ))}
          </PromptInput.Queue.List>
        </PromptInput.Queue>
      </PromptInput>,
    );

    const firstHandle = screen.getByRole('button', { name: '重排 第一项' });
    expect(firstHandle).toHaveAttribute('data-reorder-enabled', 'true');

    // 第一项下移一位 → [2,1,3]
    fireEvent.keyDown(firstHandle, { key: 'ArrowDown' });
    expect(onReorder).toHaveBeenCalledTimes(1);
    expect(onReorder.mock.calls[0][0].map((entry: { id: number }) => entry.id)).toEqual([2, 1, 3]);

    // 第一项已在顶端：ArrowUp 不应再触发（边界夹取）
    onReorder.mockClear();
    fireEvent.keyDown(firstHandle, { key: 'ArrowUp' });
    expect(onReorder).not.toHaveBeenCalled();

    // End 把第一项移到末尾 → [2,3,1]
    fireEvent.keyDown(firstHandle, { key: 'End' });
    expect(onReorder).toHaveBeenCalledTimes(1);
    expect(onReorder.mock.calls[0][0].map((entry: { id: number }) => entry.id)).toEqual([2, 3, 1]);
  });

  it('Queue handle does not reorder by keyboard when reorder is not enabled', () => {
    const onKeyDown = vi.fn();
    render(
      <PromptInput>
        <PromptInput.Queue>
          <PromptInput.Queue.List>
            <PromptInput.Queue.Item>
              <PromptInput.Queue.Item.Handle aria-label="重排静态项" onKeyDown={onKeyDown} />
              <PromptInput.Queue.Item.Body>
                <PromptInput.Queue.Item.Content>静态项</PromptInput.Queue.Item.Content>
              </PromptInput.Queue.Item.Body>
            </PromptInput.Queue.Item>
          </PromptInput.Queue.List>
        </PromptInput.Queue>
      </PromptInput>,
    );
    const handle = screen.getByRole('button', { name: '重排静态项' });
    expect(handle).not.toHaveAttribute('data-reorder-enabled');
    // 未开启排序时仍透传用户的 onKeyDown（仅不做内置排序），保证向后兼容
    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    expect(onKeyDown).toHaveBeenCalled();
  });

  // 端到端：受控队列下方向键排序后 DOM 顺序真实变化（onReorder 驱动重渲染）。
  it('keyboard reorder updates rendered order in a controlled queue', () => {
    const ControlledQueue = () => {
      const [items, setItems] = useState([
        { id: 1, text: 'Alpha' },
        { id: 2, text: 'Beta' },
      ]);
      return (
        <PromptInput>
          <PromptInput.Queue>
            <PromptInput.Queue.List values={items} onReorder={setItems}>
              {items.map((item) => (
                <PromptInput.Queue.Item key={item.id} value={item}>
                  <PromptInput.Queue.Item.Handle aria-label={`重排 ${item.text}`} />
                  <PromptInput.Queue.Item.Body>
                    <PromptInput.Queue.Item.Content>{item.text}</PromptInput.Queue.Item.Content>
                  </PromptInput.Queue.Item.Body>
                </PromptInput.Queue.Item>
              ))}
            </PromptInput.Queue.List>
          </PromptInput.Queue>
        </PromptInput>
      );
    };
    render(<ControlledQueue />);

    const contentsBefore = Array.from(
      document.querySelectorAll('[data-slot="prompt-input-queue-item-content"]'),
    ).map((el) => el.textContent);
    expect(contentsBefore).toEqual(['Alpha', 'Beta']);

    fireEvent.keyDown(screen.getByRole('button', { name: '重排 Alpha' }), { key: 'ArrowDown' });

    const contentsAfter = Array.from(
      document.querySelectorAll('[data-slot="prompt-input-queue-item-content"]'),
    ).map((el) => el.textContent);
    expect(contentsAfter).toEqual(['Beta', 'Alpha']);
  });

  // 参考 API：root 区分 variant(surface: primary/secondary) 与 layout(stacked/compact/inline)。
  // 默认 variant='primary' / layout='stacked'，root emit data-variant + data-layout。
  it('defaults to data-variant=primary and data-layout=stacked', () => {
    render(
      <PromptInput>
        <PromptInput.Shell>
          <PromptInput.TextArea />
        </PromptInput.Shell>
      </PromptInput>,
    );
    const root = document.querySelector('[data-slot="prompt-input"]') as HTMLElement;
    expect(root).toHaveAttribute('data-variant', 'primary');
    expect(root).toHaveAttribute('data-layout', 'stacked');
    // surface 皮肤 class 跟随 variant
    const shell = document.querySelector('[data-slot="prompt-input-shell"]') as HTMLElement;
    expect(shell).toHaveClass('prompt-input__shell--primary');
  });

  it('layout="compact" sets data-layout while keeping surface variant', () => {
    render(
      <PromptInput layout="compact" variant="secondary">
        <PromptInput.Shell>
          <PromptInput.TextArea />
        </PromptInput.Shell>
      </PromptInput>,
    );
    const root = document.querySelector('[data-slot="prompt-input"]') as HTMLElement;
    expect(root).toHaveAttribute('data-layout', 'compact');
    expect(root).toHaveAttribute('data-variant', 'secondary');
    const shell = document.querySelector('[data-slot="prompt-input-shell"]') as HTMLElement;
    expect(shell).toHaveClass('prompt-input__shell--secondary');
  });

  it('layout="inline" drives inline skin: data-layout=inline, data-variant=inline, shell--inline', () => {
    render(
      <PromptInput layout="inline">
        <PromptInput.Shell>
          <PromptInput.TextArea />
        </PromptInput.Shell>
      </PromptInput>,
    );
    const root = document.querySelector('[data-slot="prompt-input"]') as HTMLElement;
    expect(root).toHaveAttribute('data-layout', 'inline');
    // CSS 整套 inline 皮肤仍由 data-variant=inline 驱动，故 inline 布局时该属性输出 inline
    expect(root).toHaveAttribute('data-variant', 'inline');
    const shell = document.querySelector('[data-slot="prompt-input-shell"]') as HTMLElement;
    expect(shell).toHaveClass('prompt-input__shell--inline');
  });

  // 向后兼容：废弃别名 variant="inline" 等价于 layout="inline"（旧调用点不破坏）。
  it('backward-compat: variant="inline" maps to layout="inline" (deprecated alias)', () => {
    render(
      <PromptInput variant="inline">
        <PromptInput.Shell>
          <PromptInput.TextArea />
        </PromptInput.Shell>
      </PromptInput>,
    );
    const root = document.querySelector('[data-slot="prompt-input"]') as HTMLElement;
    expect(root).toHaveAttribute('data-layout', 'inline');
    expect(root).toHaveAttribute('data-variant', 'inline');
    const shell = document.querySelector('[data-slot="prompt-input-shell"]') as HTMLElement;
    expect(shell).toHaveClass('prompt-input__shell--inline');
  });

  // explicit layout 优先于 variant 别名：variant="inline" + layout="stacked" → stacked 布局、primary surface。
  it('explicit layout prop wins over deprecated variant="inline" alias', () => {
    render(
      <PromptInput variant="inline" layout="stacked">
        <PromptInput.Shell>
          <PromptInput.TextArea />
        </PromptInput.Shell>
      </PromptInput>,
    );
    const root = document.querySelector('[data-slot="prompt-input"]') as HTMLElement;
    expect(root).toHaveAttribute('data-layout', 'stacked');
    expect(root).toHaveAttribute('data-variant', 'primary');
    const shell = document.querySelector('[data-slot="prompt-input-shell"]') as HTMLElement;
    expect(shell).toHaveClass('prompt-input__shell--primary');
  });

  it('has no axe a11y violations', async () => {
    const { container } = render(
      <PromptInput status="ready">
        <PromptInput.Shell>
          <PromptInput.TextArea />
          <PromptInput.Toolbar>
            <PromptInput.Action aria-label="Attach file" />
            <PromptInput.ToolbarEnd>
              <PromptInput.Send />
            </PromptInput.ToolbarEnd>
          </PromptInput.Toolbar>
        </PromptInput.Shell>
      </PromptInput>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
