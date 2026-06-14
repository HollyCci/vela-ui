'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { Button, type ButtonProps } from '@heroui/react';
import clsx from 'clsx';

export type CodeBlockProps = HTMLAttributes<HTMLDivElement>;

export type CodeBlockHeaderProps = HTMLAttributes<HTMLDivElement>;

export type CodeBlockCodeProps = HTMLAttributes<HTMLDivElement> & {
  /** 要渲染的代码（原站 API） */
  code: string;
  /** Shiki 语言 id（原站 API，默认 'plaintext'）；本仓不内置 Shiki，按基准快照渲染纯 pre>code */
  language?: string;
  /** Shiki 主题（原站 API，默认 'github-light'）；同上仅保留 API，暗色由 CSS 主题选择器接管 */
  theme?: string;
};

export type CodeBlockCopyButtonProps = Omit<ButtonProps, 'className' | 'style' | 'children'> & {
  /** 点击时写入剪贴板的代码（原站 API） */
  code: string;
  className?: string;
  style?: CSSProperties;
};

type CopyStatus = 'idle' | 'copied' | 'failed';
type TokenKind =
  | 'comment'
  | 'function'
  | 'keyword'
  | 'number'
  | 'operator'
  | 'plain'
  | 'property'
  | 'punctuation'
  | 'string'
  | 'variable';

type CodeToken = {
  kind: TokenKind;
  value: string;
};

type HighlightRule = {
  kind: TokenKind;
  pattern: RegExp;
};

const LANGUAGE_ALIASES: Record<string, string> = {
  bash: 'shell',
  cjs: 'javascript',
  js: 'javascript',
  jsx: 'javascript',
  mjs: 'javascript',
  sh: 'shell',
  shellscript: 'shell',
  ts: 'typescript',
  tsx: 'typescript',
  zsh: 'shell',
};

const TYPE_SCRIPT_RULES: HighlightRule[] = [
  { kind: 'comment', pattern: /^(?:\/\/.*|\/\*.*?\*\/)/ },
  { kind: 'string', pattern: /^`(?:\\.|[^`\\])*`|^'(?:\\.|[^'\\])*'|^"(?:\\.|[^"\\])*"/ },
  {
    kind: 'keyword',
    pattern:
      /^(?:abstract|as|async|await|boolean|break|case|catch|class|const|constructor|continue|debugger|default|delete|do|else|enum|export|extends|false|finally|for|from|function|get|if|implements|import|in|infer|instanceof|interface|let|new|null|number|object|of|private|protected|public|readonly|return|set|string|super|switch|this|throw|true|try|type|typeof|undefined|var|void|while|yield)\b/,
  },
  { kind: 'number', pattern: /^-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i },
  { kind: 'function', pattern: /^[A-Za-z_$][\w$]*(?=\s*\()/ },
  { kind: 'property', pattern: /^[A-Za-z_$][\w$]*(?=\s*:)/ },
  { kind: 'operator', pattern: /^(?:=>|===|!==|==|!=|<=|>=|\+\+|--|\|\||&&|\?\?|\+=|-=|\*=|\/=|[=+\-*/%<>!?:|&.]+)/ },
  { kind: 'punctuation', pattern: /^[{}()[\],;]/ },
];

const JSON_RULES: HighlightRule[] = [
  { kind: 'property', pattern: /^"(?:\\.|[^"\\])*"(?=\s*:)/ },
  { kind: 'string', pattern: /^"(?:\\.|[^"\\])*"/ },
  { kind: 'number', pattern: /^-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i },
  { kind: 'keyword', pattern: /^(?:true|false|null)\b/ },
  { kind: 'punctuation', pattern: /^[{}[\],:]/ },
];

const SHELL_RULES: HighlightRule[] = [
  { kind: 'comment', pattern: /^#.*/ },
  { kind: 'string', pattern: /^'(?:\\.|[^'\\])*'|^"(?:\\.|[^"\\])*"/ },
  { kind: 'variable', pattern: /^\$[A-Za-z_][\w]*|^\$\{[^}]+\}/ },
  { kind: 'keyword', pattern: /^(?:cat|cd|curl|echo|export|git|mkdir|node|npm|npx|pnpm|rm|yarn)\b/ },
  { kind: 'property', pattern: /^--?[\w-]+/ },
  { kind: 'number', pattern: /^-?\b\d+(?:\.\d+)?\b/ },
  { kind: 'operator', pattern: /^(?:&&|\|\||[|&;=<>])/ },
];

const normalizeLanguage = (language: string) => {
  const normalized = language.toLowerCase().replace(/^language-/, '');
  return LANGUAGE_ALIASES[normalized] ?? normalized;
};

const getHighlightRules = (language: string): HighlightRule[] => {
  const normalized = normalizeLanguage(language);

  if (normalized === 'json') return JSON_RULES;
  if (normalized === 'shell') return SHELL_RULES;
  if (normalized === 'javascript' || normalized === 'typescript') return TYPE_SCRIPT_RULES;

  return [];
};

const pushToken = (tokens: CodeToken[], token: CodeToken) => {
  const previous = tokens[tokens.length - 1];

  if (previous?.kind === token.kind) {
    previous.value += token.value;
    return;
  }

  tokens.push(token);
};

const tokenizeLine = (line: string, rules: HighlightRule[]) => {
  const tokens: CodeToken[] = [];
  let index = 0;

  while (index < line.length) {
    const rest = line.slice(index);
    const whitespaceMatch = /^\s+/.exec(rest);

    if (whitespaceMatch !== null) {
      pushToken(tokens, { kind: 'plain', value: whitespaceMatch[0] });
      index += whitespaceMatch[0].length;
      continue;
    }

    const matchedRule = rules
      .map((rule) => ({ rule, match: rule.pattern.exec(rest) }))
      .find(({ match }) => match !== null && match.index === 0);

    if (matchedRule !== undefined && matchedRule.match !== null && matchedRule.match[0].length > 0) {
      pushToken(tokens, { kind: matchedRule.rule.kind, value: matchedRule.match[0] });
      index += matchedRule.match[0].length;
      continue;
    }

    pushToken(tokens, { kind: 'plain', value: rest[0] });
    index += 1;
  }

  return tokens;
};

const renderToken = (token: CodeToken, index: number): ReactNode => {
  if (token.kind === 'plain') return token.value;

  return (
    <span key={index} className={`code-block__token code-block__token--${token.kind}`}>
      {token.value}
    </span>
  );
};

const renderCodeLine = (line: string, index: number, rules: HighlightRule[]) => {
  const tokens = tokenizeLine(line, rules);

  return (
    <span key={index} className="line code-block__line" data-line={index + 1}>
      {tokens.length > 0 ? tokens.map(renderToken) : '\u200B'}
    </span>
  );
};

/** 复制图标（与基准快照 SVG path 一致） */
const CopyIcon = () => (
  <svg className="size-3.5" fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
    <path
      clipRule="evenodd"
      d="M12 2.5H8A1.5 1.5 0 0 0 6.5 4v1H8a3 3 0 0 1 3 3v1.5h1A1.5 1.5 0 0 0 13.5 8V4A1.5 1.5 0 0 0 12 2.5M11 11h1a3 3 0 0 0 3-3V4a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3v1H4a3 3 0 0 0-3 3v4a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3zM4 6.5h4A1.5 1.5 0 0 1 9.5 8v4A1.5 1.5 0 0 1 8 13.5H4A1.5 1.5 0 0 1 2.5 12V8A1.5 1.5 0 0 1 4 6.5"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);
CopyIcon.displayName = 'CodeBlock.CopyIcon';

/** 复制成功对勾图标（成功态切换用，无快照基准） */
const CheckIcon = () => (
  <svg className="size-3.5" fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
    <path
      clipRule="evenodd"
      d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06l2.72 2.72 6.72-6.72a.75.75 0 0 1 1.06 0"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);
CheckIcon.displayName = 'CodeBlock.CheckIcon';

/** 复制失败提示图标（clipboard 被拦截或不可用时短暂展示） */
const ErrorIcon = () => (
  <svg className="size-3.5" fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
    <path
      clipRule="evenodd"
      d="M8 1.25a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5M6.22 5.72a.75.75 0 0 1 1.06 0L8 6.44l.72-.72a.75.75 0 1 1 1.06 1.06L9.06 7.5l.72.72a.75.75 0 1 1-1.06 1.06L8 8.56l-.72.72a.75.75 0 0 1-1.06-1.06l.72-.72-.72-.72a.75.75 0 0 1 0-1.06"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);
ErrorIcon.displayName = 'CodeBlock.ErrorIcon';

/** 基准快照中图标外层 Motion span 的终态内联样式（本仓无动画库，静态对齐） */
const ICON_MOTION_STYLE: CSSProperties = { filter: 'blur(0px)', opacity: 1, transform: 'none' };

const copyText = async (text: string) => {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText !== undefined) {
    await navigator.clipboard.writeText(text);
    return;
  }

  if (typeof document === 'undefined') {
    throw new Error('Clipboard API is unavailable');
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.inset = '0';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    if (!document.execCommand('copy')) {
      throw new Error('Copy command was rejected');
    }
  } finally {
    document.body.removeChild(textarea);
  }
};

const getCopyLabel = (status: CopyStatus, label: string) => {
  if (status === 'copied') return 'Copied';
  if (status === 'failed') return 'Copy failed';
  return label;
};

const getCopyIcon = (status: CopyStatus) => {
  if (status === 'copied') return <CheckIcon />;
  if (status === 'failed') return <ErrorIcon />;
  return <CopyIcon />;
};

const Header = forwardRef<HTMLDivElement, CodeBlockHeaderProps>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    data-slot="code-block-header"
    className={clsx('code-block__header', className)}
    {...rest}
  />
));
Header.displayName = 'CodeBlock.Header';

/** 代码滚动区：保留 pre>code 结构，同时按行和 token 渲染轻量语法高亮。 */
const Code = forwardRef<HTMLDivElement, CodeBlockCodeProps>(
  ({ code, language = 'plaintext', theme = 'github-light', className, ...rest }, ref) => {
    const normalizedLanguage = normalizeLanguage(language);
    const highlightRules = getHighlightRules(normalizedLanguage);

    return (
      <div
        ref={ref}
        data-slot="code-block-code"
        className={clsx('code-block__code', className)}
        {...rest}
      >
        <pre>
          <code data-language={normalizedLanguage} data-theme={theme}>
            {code.split('\n').map((line, index) => renderCodeLine(line, index, highlightRules))}
          </code>
        </pre>
      </div>
    );
  },
);
Code.displayName = 'CodeBlock.Code';

/**
 * 复制按钮：OSS Button ghost/sm/icon-only；navigator.clipboard 写入成功后
 * 切换对勾图标约 2 秒；失败时短暂展示失败图标。
 */
const CopyButton = ({
  code,
  className,
  'aria-label': ariaLabel = 'Copy code',
  onPress,
  ...rest
}: CodeBlockCopyButtonProps) => {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');
  const resetTimerRef = useRef<number | null>(null);

  const clearResetTimer = useCallback(() => {
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, []);

  useEffect(
    () => () => {
      clearResetTimer();
    },
    [clearResetTimer],
  );

  const showStatus = useCallback(
    (status: Exclude<CopyStatus, 'idle'>) => {
      setCopyStatus(status);
      clearResetTimer();
      resetTimerRef.current = window.setTimeout(() => {
        setCopyStatus('idle');
        resetTimerRef.current = null;
      }, 2000);
    },
    [clearResetTimer],
  );

  const handlePress = useCallback<NonNullable<ButtonProps['onPress']>>(
    (event) => {
      onPress?.(event);
      void copyText(code)
        .then(() => showStatus('copied'))
        .catch(() => showStatus('failed'));
    },
    [onPress, code, showStatus],
  );

  return (
    <Button
      data-slot="code-block-copy-button"
      data-copy-status={copyStatus}
      isIconOnly
      size="sm"
      variant="ghost"
      aria-label={getCopyLabel(copyStatus, ariaLabel)}
      className={clsx('code-block__copy-button', className)}
      onPress={handlePress}
      {...rest}
    >
      <span
        className="flex size-3.5 items-center justify-center"
        data-slot="code-block-copy-button-icon-motion"
        style={ICON_MOTION_STYLE}
      >
        {getCopyIcon(copyStatus)}
      </span>
    </Button>
  );
};
CopyButton.displayName = 'CodeBlock.CopyButton';

/** 代码块根容器（原站 API：仅原生 div props），语言标签/复制按钮由 Header 槽位组合 */
const CodeBlockRoot = forwardRef<HTMLDivElement, CodeBlockProps>(({ className, ...rest }, ref) => (
  <div ref={ref} data-slot="code-block" className={clsx('code-block', className)} {...rest} />
));
CodeBlockRoot.displayName = 'CodeBlock';

const CodeBlock = Object.assign(CodeBlockRoot, { Header, Code, CopyButton });

export default CodeBlock;
