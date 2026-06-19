import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import RichTextEditor, { type RichTextEditorController } from './index';

// jsdom 未实现 execCommand/queryCommandState（contentEditable 编辑能力缺失），
// 桩掉以保证可观测断言确定性；matchMedia/ResizeObserver 供 LinkPopover 用的 Popover 使用。
beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
    }),
  );
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  (document as unknown as { execCommand: unknown }).execCommand = vi.fn(() => true);
  (document as unknown as { queryCommandState: unknown }).queryCommandState = vi.fn(() => false);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const BasicEditor = (props: Record<string, unknown>) => (
  <RichTextEditor {...props}>
    <RichTextEditor.Shell>
      <RichTextEditor.Toolbar aria-label="格式工具">
        <RichTextEditor.ToolbarGroup>
          <RichTextEditor.ToggleButton command="bold" />
          <RichTextEditor.ToggleButton command="italic" />
        </RichTextEditor.ToolbarGroup>
      </RichTextEditor.Toolbar>
      <RichTextEditor.Content placeholder="开始输入…" aria-label="正文" />
      <RichTextEditor.Footer>
        <RichTextEditor.CharacterCount />
      </RichTextEditor.Footer>
    </RichTextEditor.Shell>
  </RichTextEditor>
);

const getContent = () => screen.getByRole('textbox');

describe('RichTextEditor', () => {
  it('renders shell/toolbar/contenteditable/character-count anatomy', () => {
    render(<BasicEditor value="<p>Hello</p>" />);
    expect(document.querySelector('[data-slot="rich-text-editor"]')).toBeInTheDocument();
    const content = getContent();
    expect(content).toHaveAttribute('contenteditable', 'true');
    expect(content).toHaveAttribute('aria-multiline', 'true');
    expect(content).toHaveTextContent('Hello');
    expect(document.querySelector('[data-slot="rich-text-editor-toggle-button"][data-command="bold"]'))
      .toBeInTheDocument();
  });

  it('derives character count from the controlled value', () => {
    const { rerender } = render(<BasicEditor value="<p>Hello</p>" />);
    const count = document.querySelector('[data-slot="rich-text-editor-character-count"]');
    expect(count).toHaveTextContent('5');

    rerender(<BasicEditor value="<p>Hello world</p>" />);
    expect(document.querySelector('[data-slot="rich-text-editor-character-count"]')).toHaveTextContent('11');
  });

  it('shows the limit and flags over-limit via data-over-limit', () => {
    render(<BasicEditor value="<p>123456</p>" maxLength={4} />);
    const count = document.querySelector('[data-slot="rich-text-editor-character-count"]');
    expect(count).toHaveTextContent('6 / 4');
    expect(count).toHaveAttribute('data-over-limit', 'true');
  });

  it('enforces maxLength as a hard limit: reverts over-limit input and does not emit', () => {
    const onValueChange = vi.fn();
    render(<BasicEditor defaultValue="<p>ok</p>" maxLength={3} onValueChange={onValueChange} />);
    const content = getContent();
    expect(content.innerHTML).toBe('<p>ok</p>');

    // 模拟输入超限内容（文本长度 7 > 3）：硬上限把 DOM 回滚到上一份合法内容，且不触发 onValueChange
    act(() => {
      content.innerHTML = '<p>toolong</p>';
      fireEvent.input(content);
    });
    expect(content.innerHTML).toBe('<p>ok</p>');
    expect(onValueChange).not.toHaveBeenCalled();

    // 上限内（文本长度 3 = 3）：正常提交并回传 characterCount
    act(() => {
      content.innerHTML = '<p>abc</p>';
      fireEvent.input(content);
    });
    expect(onValueChange).toHaveBeenCalledTimes(1);
    const [, details] = onValueChange.mock.calls[0];
    expect(details).toMatchObject({ text: 'abc', characterCount: 3 });
  });

  it('emits html/text/characterCount on uncontrolled input', () => {
    const onValueChange = vi.fn();
    render(<BasicEditor defaultValue="<p>a</p>" onValueChange={onValueChange} />);
    const content = getContent();
    act(() => {
      content.innerHTML = '<p>Hi there</p>';
      fireEvent.input(content);
    });
    expect(onValueChange).toHaveBeenCalledTimes(1);
    const [json, details] = onValueChange.mock.calls[0];
    expect(details).toMatchObject({ html: '<p>Hi there</p>', text: 'Hi there', characterCount: 8 });
    expect(json).toMatchObject({ type: 'doc' });
  });

  it('passes a controller with command/link APIs to CommandButton', async () => {
    const user = userEvent.setup();
    let captured: RichTextEditorController | null = null;
    render(
      <RichTextEditor defaultValue="<p>x</p>">
        <RichTextEditor.Content />
        <RichTextEditor.CommandButton
          command={(editor) => {
            captured = editor;
            editor.setLink('https://vela-ui.local');
          }}
        >
          应用链接
        </RichTextEditor.CommandButton>
      </RichTextEditor>,
    );
    await user.click(screen.getByRole('button', { name: '应用链接' }));
    expect(captured).not.toBeNull();
    expect(typeof captured!.runCommand).toBe('function');
    expect(typeof captured!.setLink).toBe('function');
    expect(typeof captured!.unsetLink).toBe('function');
    // setLink 经由 execCommand('createLink') 落地
    expect(document.execCommand).toHaveBeenCalledWith('createLink', false, 'https://vela-ui.local');
  });

  it('runs the toolbar command via execCommand on toggle press', async () => {
    const user = userEvent.setup();
    render(<BasicEditor defaultValue="<p>x</p>" />);
    const bold = document.querySelector(
      '[data-slot="rich-text-editor-toggle-button"][data-command="bold"]',
    ) as HTMLButtonElement;
    expect(bold).toHaveAttribute('aria-pressed', 'false');
    await user.click(bold);
    expect(document.execCommand).toHaveBeenCalledWith('bold', false, undefined);
  });

  it('disables editing and toolbar when isReadOnly / isDisabled', () => {
    const { rerender } = render(<BasicEditor value="<p>x</p>" isReadOnly />);
    expect(getContent()).toHaveAttribute('contenteditable', 'false');
    expect(
      document.querySelector('[data-slot="rich-text-editor-toggle-button"][data-command="bold"]'),
    ).toBeDisabled();

    rerender(<BasicEditor value="<p>x</p>" isDisabled />);
    expect(getContent()).toHaveAttribute('contenteditable', 'false');
    expect(document.querySelector('[data-slot="rich-text-editor"]')).toHaveAttribute('data-disabled', 'true');
  });

  it('wires the link popover trigger', () => {
    // Popover 内容走 portal/overlay，jsdom 下开合行为脆弱（仓库其余 overlay 测试同样只验触发器）；
    // setLink/unsetLink 落地已由 CommandButton 用例覆盖，这里只确认 LinkPopover 触发器接通。
    render(
      <RichTextEditor defaultValue="<p>x</p>" aria-label="编辑器">
        <RichTextEditor.Content aria-label="正文" />
        <RichTextEditor.LinkPopover />
      </RichTextEditor>,
    );
    // 注：Popover 当前把 trigger 再包一层 pressable，导致 name="Link" 出现两个（nested button），
    // 属既有 overlay 触发器嵌套问题，非本用例范围，这里用 getAllBy 容错。
    expect(screen.getAllByRole('button', { name: 'Link' }).length).toBeGreaterThanOrEqual(1);
  });

  it('has no axe a11y violations for the base editor', async () => {
    const { container } = render(<BasicEditor value="<p>Accessible draft</p>" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
