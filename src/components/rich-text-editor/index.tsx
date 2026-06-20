'use client';

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type HTMLAttributes,
  type InputEvent as ReactInputEvent,
  type KeyboardEvent,
  type MutableRefObject,
  type ReactNode,
  type Ref,
} from 'react';
import clsx from 'clsx';
import Popover from '../popover';
import Tooltip from '../tooltip';

export type RichTextEditorJSONContent = Record<string, unknown>;
export type RichTextEditorValue = RichTextEditorJSONContent | string;

/**
 * 内部命令并集（execCommand 引擎落地的全部命令）。包含线上 Pro 版的命令 token
 * （`code`/`codeBlock`/`heading-1/-2/-3`）以及本库历史 token（`heading1`/`heading2`/`paragraph`/
 * `removeFormat`/`undo`/`redo`），后者作为后向兼容别名保留，老调用点零破坏。
 */
export type RichTextEditorCommand =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'code'
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading-1'
  | 'heading-2'
  | 'heading-3'
  | 'bulletList'
  | 'orderedList'
  | 'blockquote'
  | 'codeBlock'
  | 'undo'
  | 'redo'
  | 'clearFormatting'
  | 'clearContent'
  | 'removeFormat';

/**
 * 对齐线上 Pro 版 `RichTextEditor.ToggleButton` 的 `command` 并集（标记/块级格式开关）。
 */
export type RichTextEditorToggleCommand =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'code'
  | 'blockquote'
  | 'bulletList'
  | 'orderedList'
  | 'codeBlock'
  | 'heading-1'
  | 'heading-2'
  | 'heading-3'
  // 后向兼容别名（本库历史 token）
  | 'heading1'
  | 'heading2'
  | 'paragraph';

/**
 * 对齐线上 Pro 版 `RichTextEditor.ActionButton` 的 `action` 并集（历史/格式动作）。
 */
export type RichTextEditorAction = 'undo' | 'redo' | 'clearFormatting' | 'clearContent';

export type RichTextEditorValueDetails = {
  html: string;
  text: string;
  characterCount: number;
};

export type RichTextEditorProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'className' | 'style' | 'onChange' | 'value' | 'defaultValue'
> & {
  value?: RichTextEditorValue;
  defaultValue?: RichTextEditorValue;
  onValueChange?: (value: RichTextEditorJSONContent, details: RichTextEditorValueDetails) => void;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  style?: CSSProperties;
};

export type RichTextEditorShellProps = HTMLAttributes<HTMLDivElement>;
export type RichTextEditorToolbarProps = HTMLAttributes<HTMLDivElement>;
export type RichTextEditorToolbarGroupProps = HTMLAttributes<HTMLDivElement>;
export type RichTextEditorContentProps = Omit<HTMLAttributes<HTMLDivElement>, 'contentEditable'> & {
  placeholder?: string;
};
export type RichTextEditorFooterProps = HTMLAttributes<HTMLDivElement>;
export type RichTextEditorBubbleMenuProps = HTMLAttributes<HTMLDivElement> & {
  /** 透传给内部菜单 toolbar 容器的 props，对齐线上 Pro 版 `toolbarProps`。 */
  toolbarProps?: RichTextEditorToolbarProps;
};
export type RichTextEditorFloatingMenuProps = HTMLAttributes<HTMLDivElement> & {
  /** 透传给内部菜单 toolbar 容器的 props，对齐线上 Pro 版 `toolbarProps`。 */
  toolbarProps?: RichTextEditorToolbarProps;
};
export type RichTextEditorSuggestionMenuProps = HTMLAttributes<HTMLDivElement>;

export type RichTextEditorToggleButtonProps = Omit<HTMLAttributes<HTMLButtonElement>, 'onClick'> & {
  /** 切换的标记/块级命令，并集对齐线上 Pro 版（`heading-1` 等）。 */
  command?: RichTextEditorToggleCommand;
  /** 悬浮提示，对齐线上 Pro 版 `tooltip`。 */
  tooltip?: ReactNode;
  /** @deprecated 历史别名，等价于按钮文案；请改用 children。 */
  label?: ReactNode;
};

export type RichTextEditorActionButtonProps = Omit<HTMLAttributes<HTMLButtonElement>, 'onClick'> & {
  /** 历史/格式动作，对齐线上 Pro 版 `action`。 */
  action?: RichTextEditorAction;
  /** 悬浮提示，对齐线上 Pro 版 `tooltip`。 */
  tooltip?: ReactNode;
  /** @deprecated 历史别名，与 `action` 等价（接受任意内部命令 token）。 */
  command?: RichTextEditorCommand;
  /** @deprecated 历史别名，等价于按钮文案；请改用 children。 */
  label?: ReactNode;
};

export type RichTextEditorCommandButtonProps = Omit<HTMLAttributes<HTMLButtonElement>, 'onClick'> & {
  /** 自定义命令回调，返回 void 或 boolean，对齐线上 Pro 版 `onCommand`。 */
  onCommand?: (editor: RichTextEditorController) => void | boolean;
  /** 受控激活态，布尔或基于 editor 的判定，对齐线上 Pro 版 `isActive`。 */
  isActive?: boolean | ((editor: RichTextEditorController) => boolean);
  /** 受控禁用态，布尔或基于 editor 的判定，对齐线上 Pro 版 `isDisabled`。 */
  isDisabled?: boolean | ((editor: RichTextEditorController) => boolean);
  /** 悬浮提示，对齐线上 Pro 版 `tooltip`。 */
  tooltip?: ReactNode;
  /** @deprecated 历史别名，等价于 `onCommand`（仅 void 返回）。 */
  command?: (editor: RichTextEditorController) => void;
  /** @deprecated 历史别名，等价于按钮文案；请改用 children。 */
  label?: ReactNode;
};

/** @deprecated 旧统一按钮 props 别名，保留以兼容老类型引用。 */
export type RichTextEditorButtonProps = RichTextEditorToggleButtonProps;

export type RichTextEditorLinkPopoverProps = {
  trigger?: ReactNode;
  className?: string;
};

export type RichTextEditorCharacterCountStats = {
  characters: number;
  words: number;
  maxLength?: number;
  isOverLimit: boolean;
};

export type RichTextEditorCharacterCountProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
  /** 是否统计词数，对齐线上 Pro 版 `showWords`（默认 false）。 */
  showWords?: boolean;
  /** 自定义渲染：ReactNode 或基于统计的渲染函数，对齐线上 Pro 版 `children`。 */
  children?: ReactNode | ((stats: RichTextEditorCharacterCountStats) => ReactNode);
  /** @deprecated 历史 prop：在字符数后附加 ` / max`；改用 children 渲染函数自定义。 */
  showMax?: boolean;
};

export type RichTextEditorController = {
  runCommand: (command: RichTextEditorCommand) => void;
  setLink: (href: string) => void;
  unsetLink: () => void;
  focus: () => void;
  html: string;
  text: string;
};

type RichTextEditorContextValue = RichTextEditorController & {
  isDisabled: boolean;
  isReadOnly: boolean;
  placeholder?: string;
  maxLength?: number;
  activeCommands: Set<RichTextEditorCommand>;
  isFocused: boolean;
  characterCount: number;
  setContentElement: (element: HTMLDivElement | null) => void;
  handleInput: () => void;
  handleSelectionChange: () => void;
};

const DEFAULT_HTML = '<p>Draft a launch note with clear sections, concise highlights, and next steps.</p>';

const RichTextEditorContext = createContext<RichTextEditorContextValue | null>(null);

const useRichTextEditorContext = () => {
  const context = useContext(RichTextEditorContext);
  if (context === null) {
    throw new Error('RichTextEditor components must be used within <RichTextEditor>');
  }
  return context;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const textFromHtml = (html: string) => {
  if (typeof document === 'undefined') return html.replace(/<[^>]+>/g, '');
  const element = document.createElement('div');
  element.innerHTML = html;
  return element.textContent ?? '';
};

const richValueToHtml = (value: RichTextEditorValue | undefined): string => {
  if (value === undefined) return DEFAULT_HTML;
  if (typeof value === 'string') return value;
  if (typeof value.html === 'string') return value.html;
  if (value.type === 'doc' && Array.isArray(value.content)) {
    return value.content
      .map((node) => {
        if (typeof node !== 'object' || node === null) return '';
        const block = node as Record<string, unknown>;
        const type = block.type;
        const text =
          typeof block.text === 'string'
            ? block.text
            : Array.isArray(block.content)
              ? block.content
                  .map((child) =>
                    typeof child === 'object' && child !== null && typeof (child as Record<string, unknown>).text === 'string'
                      ? (child as Record<string, string>).text
                      : '',
                  )
                  .join('')
              : '';
        const escaped = escapeHtml(text);
        if (type === 'heading') return `<h2>${escaped}</h2>`;
        if (type === 'blockquote') return `<blockquote>${escaped}</blockquote>`;
        if (type === 'codeBlock') return `<pre>${escaped}</pre>`;
        return `<p>${escaped}</p>`;
      })
      .join('');
  }
  return DEFAULT_HTML;
};

const htmlToJSON = (html: string): RichTextEditorJSONContent => ({
  type: 'doc',
  html,
  content: [
    {
      type: 'html',
      html,
      text: textFromHtml(html),
    },
  ],
});

const commandToExec = (command: RichTextEditorCommand): [string, string?] => {
  switch (command) {
    case 'strike':
      return ['strikeThrough'];
    case 'heading1':
    case 'heading-1':
      return ['formatBlock', 'H1'];
    case 'heading2':
    case 'heading-2':
      return ['formatBlock', 'H2'];
    case 'heading-3':
      return ['formatBlock', 'H3'];
    case 'paragraph':
      return ['formatBlock', 'P'];
    case 'bulletList':
      return ['insertUnorderedList'];
    case 'orderedList':
      return ['insertOrderedList'];
    case 'blockquote':
      return ['formatBlock', 'BLOCKQUOTE'];
    case 'code':
    case 'codeBlock':
      return ['formatBlock', 'PRE'];
    case 'clearFormatting':
    case 'removeFormat':
      return ['removeFormat'];
    case 'clearContent':
      // execCommand 无原生「清空文档」动作；root 的 runCommand 单独拦截处理。
      return ['removeFormat'];
    default:
      return [command];
  }
};

const commandLabel = (command: RichTextEditorCommand) => {
  const labels: Record<RichTextEditorCommand, string> = {
    bold: 'B',
    italic: 'I',
    underline: 'U',
    strike: 'S',
    code: '</>',
    paragraph: 'P',
    heading1: 'H1',
    heading2: 'H2',
    'heading-1': 'H1',
    'heading-2': 'H2',
    'heading-3': 'H3',
    bulletList: '•',
    orderedList: '1.',
    blockquote: '“”',
    codeBlock: '</>',
    undo: '↶',
    redo: '↷',
    clearFormatting: 'Tx',
    clearContent: '🗑',
    removeFormat: 'Tx',
  };
  return labels[command];
};

const queryCommand = (command: RichTextEditorCommand) => {
  if (typeof document === 'undefined') return false;
  if (
    command === 'heading1' ||
    command === 'heading2' ||
    command === 'heading-1' ||
    command === 'heading-2' ||
    command === 'heading-3' ||
    command === 'paragraph'
  ) {
    try {
      const block = String(document.queryCommandValue('formatBlock')).toLowerCase();
      if (command === 'heading1' || command === 'heading-1') return block === 'h1';
      if (command === 'heading2' || command === 'heading-2') return block === 'h2';
      if (command === 'heading-3') return block === 'h3';
      return block === 'p' || block === 'div';
    } catch {
      return false;
    }
  }
  const [exec] = commandToExec(command);
  try {
    return document.queryCommandState(exec);
  } catch {
    return false;
  }
};

/**
 * 把命令 token 归一到激活态判定用的规范键（Pro token 与历史别名互通）。
 * 例：`heading-1` 与 `heading1` 归一为同一键，确保 toggle 激活态在两种 token 下都点亮。
 */
const canonicalActiveKey = (command: RichTextEditorCommand): RichTextEditorCommand => {
  switch (command) {
    case 'heading-1':
      return 'heading1';
    case 'heading-2':
      return 'heading2';
    case 'code':
      return 'codeBlock';
    case 'clearFormatting':
      return 'removeFormat';
    default:
      return command;
  }
};

const assignRef = <T,>(ref: Ref<T> | undefined, value: T | null) => {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref && 'current' in ref) {
    (ref as MutableRefObject<T | null>).current = value;
  }
};

const RichTextEditorRoot = forwardRef<HTMLDivElement, RichTextEditorProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      isDisabled = false,
      isReadOnly = false,
      placeholder,
      maxLength,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const isControlled = value !== undefined;
    const [uncontrolledHtml, setUncontrolledHtml] = useState(() => richValueToHtml(defaultValue));
    const html = isControlled ? richValueToHtml(value) : uncontrolledHtml;
    const [activeCommands, setActiveCommands] = useState<Set<RichTextEditorCommand>>(new Set());
    const [isFocused, setFocused] = useState(false);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const lastSelectionRef = useRef<Range | null>(null);
    // 记录最近一次未超限的 HTML，超限时用它把 contentEditable 回滚到合法内容。
    const lastValidHtmlRef = useRef(html);
    lastValidHtmlRef.current = html;

    const emitChange = useCallback(
      (nextHtml: string) => {
        if (!isControlled) setUncontrolledHtml(nextHtml);
        const text = textFromHtml(nextHtml);
        onValueChange?.(htmlToJSON(nextHtml), {
          html: nextHtml,
          text,
          characterCount: text.length,
        });
      },
      [isControlled, onValueChange],
    );

    const handleSelectionChange = useCallback(() => {
      const element = contentRef.current;
      if (element === null || typeof document === 'undefined') return;
      const selection = document.getSelection();
      if (selection && selection.rangeCount > 0 && element.contains(selection.anchorNode)) {
        lastSelectionRef.current = selection.getRangeAt(0).cloneRange();
      }
      setActiveCommands(
        new Set(
          ([
            'bold',
            'italic',
            'underline',
            'strike',
            'heading1',
            'heading2',
            'bulletList',
            'orderedList',
            'blockquote',
          ] as RichTextEditorCommand[]).filter(queryCommand),
        ),
      );
    }, []);

    useEffect(() => {
      document.addEventListener('selectionchange', handleSelectionChange);
      return () => document.removeEventListener('selectionchange', handleSelectionChange);
    }, [handleSelectionChange]);

    const restoreSelection = useCallback(() => {
      const element = contentRef.current;
      if (element === null || typeof document === 'undefined') return;
      element.focus();
      const range = lastSelectionRef.current;
      if (range === null) return;
      const selection = document.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }, []);

    const syncFromDom = useCallback(() => {
      const element = contentRef.current;
      if (element === null) return;
      const nextHtml = element.innerHTML;
      // maxLength 是硬上限：当新纯文本长度超过上限时，把 DOM 回滚到上一份合法内容，
      // 既不提交超限内容，也不让 contentEditable 继续无限制增长（对齐 Tiptap CharacterCount limit）。
      if (maxLength !== undefined && textFromHtml(nextHtml).length > maxLength) {
        if (element.innerHTML !== lastValidHtmlRef.current) {
          element.innerHTML = lastValidHtmlRef.current;
        }
        handleSelectionChange();
        return;
      }
      emitChange(nextHtml);
      handleSelectionChange();
    }, [emitChange, handleSelectionChange, maxLength]);

    const runCommand = useCallback(
      (command: RichTextEditorCommand) => {
        if (isDisabled || isReadOnly || typeof document === 'undefined') return;
        // clearContent（Pro action）= 清空整篇文档；execCommand 无原生对应，直接重置 DOM。
        if (command === 'clearContent') {
          const element = contentRef.current;
          if (element !== null) {
            element.innerHTML = '<p></p>';
            syncFromDom();
          }
          return;
        }
        restoreSelection();
        const [exec, execValue] = commandToExec(command);
        document.execCommand(exec, false, execValue);
        syncFromDom();
      },
      [isDisabled, isReadOnly, restoreSelection, syncFromDom],
    );

    const setLink = useCallback(
      (href: string) => {
        if (href.trim() === '' || isDisabled || isReadOnly || typeof document === 'undefined') return;
        restoreSelection();
        document.execCommand('createLink', false, href.trim());
        syncFromDom();
      },
      [isDisabled, isReadOnly, restoreSelection, syncFromDom],
    );

    const unsetLink = useCallback(() => {
      if (isDisabled || isReadOnly || typeof document === 'undefined') return;
      restoreSelection();
      document.execCommand('unlink');
      syncFromDom();
    }, [isDisabled, isReadOnly, restoreSelection, syncFromDom]);

    const focus = useCallback(() => {
      contentRef.current?.focus();
    }, []);

    const contextValue = useMemo<RichTextEditorContextValue>(
      () => ({
        runCommand,
        setLink,
        unsetLink,
        focus,
        html,
        text: textFromHtml(html),
        characterCount: textFromHtml(html).length,
        isDisabled,
        isReadOnly,
        placeholder,
        maxLength,
        activeCommands,
        isFocused,
        setContentElement: (element) => {
          contentRef.current = element;
        },
        handleInput: syncFromDom,
        handleSelectionChange,
      }),
      [
        activeCommands,
        focus,
        handleSelectionChange,
        html,
        isDisabled,
        isFocused,
        isReadOnly,
        maxLength,
        placeholder,
        runCommand,
        setLink,
        syncFromDom,
        unsetLink,
      ],
    );

    return (
      <RichTextEditorContext.Provider value={contextValue}>
        <div
          ref={ref}
          data-slot="rich-text-editor"
          data-disabled={isDisabled ? 'true' : undefined}
          data-read-only={isReadOnly ? 'true' : undefined}
          data-focused={isFocused ? 'true' : undefined}
          className={clsx('rich-text-editor', className)}
          onFocus={() => setFocused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
          }}
          {...rest}
        >
          {children}
        </div>
      </RichTextEditorContext.Provider>
    );
  },
);
RichTextEditorRoot.displayName = 'RichTextEditor';

const Shell = forwardRef<HTMLDivElement, RichTextEditorShellProps>(({ className, ...rest }, ref) => (
  <div ref={ref} data-slot="rich-text-editor-shell" className={clsx('rich-text-editor__shell', className)} {...rest} />
));
Shell.displayName = 'RichTextEditor.Shell';

const Toolbar = forwardRef<HTMLDivElement, RichTextEditorToolbarProps>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    role="toolbar"
    data-slot="rich-text-editor-toolbar"
    className={clsx('rich-text-editor__toolbar', className)}
    {...rest}
  />
));
Toolbar.displayName = 'RichTextEditor.Toolbar';

const ToolbarGroup = forwardRef<HTMLDivElement, RichTextEditorToolbarGroupProps>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    role="group"
    data-slot="rich-text-editor-toolbar-group"
    className={clsx('rich-text-editor__toolbar-group', className)}
    {...rest}
  />
));
ToolbarGroup.displayName = 'RichTextEditor.ToolbarGroup';

const withTooltip = (tooltip: ReactNode, button: ReactNode) =>
  tooltip === undefined || tooltip === null ? (
    button
  ) : (
    <Tooltip content={tooltip}>{button}</Tooltip>
  );

const ToggleButton = forwardRef<HTMLButtonElement, RichTextEditorToggleButtonProps>(
  ({ command = 'bold', tooltip, label, children, className, ...rest }, ref) => {
    const editor = useRichTextEditorContext();
    const isActive = editor.activeCommands.has(canonicalActiveKey(command));

    const button = (
      <button
        ref={ref}
        type="button"
        data-slot="rich-text-editor-toggle-button"
        data-command={command}
        data-active={isActive ? 'true' : undefined}
        aria-pressed={isActive}
        disabled={editor.isDisabled || editor.isReadOnly}
        className={clsx('rich-text-editor__button', 'rich-text-editor__toggle-button', className)}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => editor.runCommand(command)}
        {...rest}
      >
        {children ?? label ?? commandLabel(command)}
      </button>
    );

    return withTooltip(tooltip, button);
  },
);
ToggleButton.displayName = 'RichTextEditor.ToggleButton';

const ActionButton = forwardRef<HTMLButtonElement, RichTextEditorActionButtonProps>(
  ({ action, command, tooltip, label, className, children, ...rest }, ref) => {
    const editor = useRichTextEditorContext();
    // action 优先（Pro 契约）；command 为历史别名。
    const resolved: RichTextEditorCommand | undefined = action ?? command;

    const button = (
      <button
        ref={ref}
        type="button"
        data-slot="rich-text-editor-action-button"
        data-action={action}
        data-command={command}
        disabled={editor.isDisabled}
        className={clsx('rich-text-editor__button', 'rich-text-editor__action-button', className)}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          if (resolved) editor.runCommand(resolved);
          else editor.focus();
        }}
        {...rest}
      >
        {children ?? label ?? (resolved ? commandLabel(resolved) : 'Action')}
      </button>
    );

    return withTooltip(tooltip, button);
  },
);
ActionButton.displayName = 'RichTextEditor.ActionButton';

const CommandButton = forwardRef<HTMLButtonElement, RichTextEditorCommandButtonProps>(
  ({ onCommand, command, isActive, isDisabled, tooltip, label, className, children, ...rest }, ref) => {
    const editor = useRichTextEditorContext();
    // onCommand 优先（Pro 契约）；command 为历史别名。
    const run = onCommand ?? command;

    const active = typeof isActive === 'function' ? isActive(editor) : isActive;
    const disabledFromProp = typeof isDisabled === 'function' ? isDisabled(editor) : isDisabled;
    const disabled = disabledFromProp ?? (editor.isDisabled || editor.isReadOnly);

    const button = (
      <button
        ref={ref}
        type="button"
        data-slot="rich-text-editor-command-button"
        data-active={active ? 'true' : undefined}
        aria-pressed={active === undefined ? undefined : active}
        disabled={disabled}
        className={clsx('rich-text-editor__button', 'rich-text-editor__command-button', className)}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => run?.(editor)}
        {...rest}
      >
        {children ?? label ?? 'Run'}
      </button>
    );

    return withTooltip(tooltip, button);
  },
);
CommandButton.displayName = 'RichTextEditor.CommandButton';

const LinkPopover = ({ trigger, className }: RichTextEditorLinkPopoverProps) => {
  const editor = useRichTextEditorContext();
  const [href, setHref] = useState('https://vela-ui.local/docs/rich-text-editor');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    editor.setLink(href);
  };

  return (
    <Popover
      className={clsx('rich-text-editor__link-popover', className)}
      placement="bottom"
      trigger={
        trigger ?? (
          <button
            type="button"
            className="rich-text-editor__button rich-text-editor__action-button"
            disabled={editor.isDisabled || editor.isReadOnly}
            onMouseDown={(event) => event.preventDefault()}
          >
            Link
          </button>
        )
      }
    >
      <form className="rich-text-editor__link-form" onSubmit={handleSubmit}>
        <label className="rich-text-editor__link-label" htmlFor="rich-text-editor-link">
          Link URL
        </label>
        <input
          id="rich-text-editor-link"
          className="rich-text-editor__link-input"
          value={href}
          onChange={(event) => setHref(event.target.value)}
        />
        <div className="rich-text-editor__link-actions">
          <button type="submit" className="rich-text-editor__button">
            Apply
          </button>
          <button type="button" className="rich-text-editor__button" onClick={editor.unsetLink}>
            Remove
          </button>
        </div>
      </form>
    </Popover>
  );
};
LinkPopover.displayName = 'RichTextEditor.LinkPopover';

const Content = forwardRef<HTMLDivElement, RichTextEditorContentProps>(
  ({ className, placeholder, onInput, onKeyDown, onMouseUp, onKeyUp, ...rest }, ref) => {
    const editor = useRichTextEditorContext();
    const elementRef = useRef<HTMLDivElement | null>(null);
    const editorRef = useRef(editor);
    editorRef.current = editor;

    const setRef = useCallback(
      (element: HTMLDivElement | null) => {
        elementRef.current = element;
        editorRef.current.setContentElement(element);
        if (element !== null && element.innerHTML !== editorRef.current.html) {
          element.innerHTML = editorRef.current.html;
        }
        assignRef(ref, element);
      },
      [ref],
    );

    useLayoutEffect(() => {
      const element = elementRef.current;
      if (element === null || element.innerHTML === editor.html) return;
      element.innerHTML = editor.html;
    }, [editor.html]);

    const handleInput = (event: ReactInputEvent<HTMLDivElement>) => {
      onInput?.(event);
      editor.handleInput();
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || event.metaKey || event.ctrlKey) return;
      if (event.key === 'Tab') {
        event.preventDefault();
        document.execCommand('insertText', false, '  ');
        editor.handleInput();
      }
    };

    return (
      <div
        ref={setRef}
        role="textbox"
        aria-multiline="true"
        data-slot="rich-text-editor-content"
        data-placeholder={placeholder ?? editor.placeholder}
        className={clsx('rich-text-editor__content', className)}
        contentEditable={!editor.isDisabled && !editor.isReadOnly}
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onMouseUp={(event) => {
          onMouseUp?.(event);
          editor.handleSelectionChange();
        }}
        onKeyUp={(event) => {
          onKeyUp?.(event);
          editor.handleSelectionChange();
        }}
        {...rest}
      />
    );
  },
);
Content.displayName = 'RichTextEditor.Content';

const BubbleMenu = forwardRef<HTMLDivElement, RichTextEditorBubbleMenuProps>(
  ({ className, toolbarProps, children, ...rest }, ref) => {
    const editor = useRichTextEditorContext();

    return (
      <div
        ref={ref}
        data-slot="rich-text-editor-bubble-menu"
        data-visible={editor.isFocused ? 'true' : undefined}
        className={clsx('rich-text-editor__bubble-menu', className)}
        {...rest}
      >
        {toolbarProps !== undefined ? (
          <div
            role="toolbar"
            data-slot="rich-text-editor-bubble-menu-toolbar"
            {...toolbarProps}
            className={clsx('rich-text-editor__bubble-menu-toolbar', toolbarProps.className)}
          >
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    );
  },
);
BubbleMenu.displayName = 'RichTextEditor.BubbleMenu';

const FloatingMenu = forwardRef<HTMLDivElement, RichTextEditorFloatingMenuProps>(
  ({ className, toolbarProps, children, ...rest }, ref) => (
    <div
      ref={ref}
      data-slot="rich-text-editor-floating-menu"
      className={clsx('rich-text-editor__floating-menu', className)}
      {...rest}
    >
      {toolbarProps !== undefined ? (
        <div
          role="toolbar"
          data-slot="rich-text-editor-floating-menu-toolbar"
          {...toolbarProps}
          className={clsx('rich-text-editor__floating-menu-toolbar', toolbarProps.className)}
        >
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  ),
);
FloatingMenu.displayName = 'RichTextEditor.FloatingMenu';

const SuggestionMenu = forwardRef<HTMLDivElement, RichTextEditorSuggestionMenuProps>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    data-slot="rich-text-editor-suggestion-menu"
    className={clsx('rich-text-editor__suggestion-menu', className)}
    {...rest}
  />
));
SuggestionMenu.displayName = 'RichTextEditor.SuggestionMenu';

const Footer = forwardRef<HTMLDivElement, RichTextEditorFooterProps>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    data-slot="rich-text-editor-footer"
    className={clsx('rich-text-editor__footer', className)}
    {...rest}
  />
));
Footer.displayName = 'RichTextEditor.Footer';

const countWords = (text: string) => {
  const trimmed = text.trim();
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length;
};

const CharacterCount = forwardRef<HTMLSpanElement, RichTextEditorCharacterCountProps>(
  ({ showWords = false, showMax = true, children, className, ...rest }, ref) => {
    const { characterCount, text, maxLength } = useRichTextEditorContext();
    const isOverLimit = maxLength !== undefined && characterCount > maxLength;
    const stats: RichTextEditorCharacterCountStats = {
      characters: characterCount,
      words: countWords(text),
      maxLength,
      isOverLimit,
    };

    let content: ReactNode;
    if (typeof children === 'function') {
      content = (children as (stats: RichTextEditorCharacterCountStats) => ReactNode)(stats);
    } else if (children !== undefined) {
      content = children;
    } else {
      content = (
        <>
          {characterCount}
          {showMax && maxLength !== undefined ? ` / ${maxLength}` : null}
          {showWords ? ` · ${stats.words} ${stats.words === 1 ? 'word' : 'words'}` : null}
        </>
      );
    }

    return (
      <span
        ref={ref}
        data-slot="rich-text-editor-character-count"
        data-over-limit={isOverLimit ? 'true' : undefined}
        className={clsx('rich-text-editor__character-count', className)}
        {...rest}
      >
        {content}
      </span>
    );
  },
);
CharacterCount.displayName = 'RichTextEditor.CharacterCount';

const RichTextEditor = Object.assign(RichTextEditorRoot, {
  Shell,
  Toolbar,
  ToolbarGroup,
  ToggleButton,
  ActionButton,
  CommandButton,
  LinkPopover,
  Content,
  BubbleMenu,
  FloatingMenu,
  SuggestionMenu,
  Footer,
  CharacterCount,
});

export default RichTextEditor;
