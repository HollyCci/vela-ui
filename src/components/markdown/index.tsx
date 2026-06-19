'use client';

import {
  createElement,
  forwardRef,
  memo,
  useMemo,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import clsx from 'clsx';
import CodeBlock from '../code-block';

type MarkdownElementName =
  | 'a'
  | 'blockquote'
  | 'br'
  | 'code'
  | 'del'
  | 'em'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'hr'
  | 'input'
  | 'li'
  | 'ol'
  | 'p'
  | 'pre'
  | 'strong'
  | 'table'
  | 'tbody'
  | 'td'
  | 'th'
  | 'thead'
  | 'tr'
  | 'ul';

export type MarkdownComponentProps = Record<string, unknown> & {
  children?: ReactNode;
};

export type MarkdownComponent = ElementType<MarkdownComponentProps>;

/** react-markdown compatible component overrides for common markdown elements. */
export type MarkdownComponents = Partial<Record<MarkdownElementName, MarkdownComponent>> &
  Record<string, MarkdownComponent | undefined>;

export type MarkdownProps = Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'style' | 'children'> & {
  /** Markdown source text. */
  children?: string;
  /** Component overrides for rendered markdown elements. */
  components?: Partial<MarkdownComponents>;
  /**
   * 流式追加中：尾部渲染闪烁 caret 占位，根类切换为 --streaming（Streamdown 风格，参考 API，默认 false）。
   * 未闭合代码围栏仍按既有逻辑兜底渲染。
   */
  isStreaming?: boolean;
  /** Stable block-key seed. */
  id?: string;
  className?: string;
  style?: CSSProperties;
};

type ParsedBlock = { kind: 'content'; source: string; node: ReactNode } | { kind: 'empty' };
type MarkdownSegment = { kind: 'text'; lines: string[] } | { kind: 'code'; language: string; code: string };
type MarkdownRenderContext = { components?: Partial<MarkdownComponents> };
type TableAlignment = 'center' | 'left' | 'right';

let markdownIdSeed = 0;

const renderElement = (
  context: MarkdownRenderContext,
  name: MarkdownElementName,
  props: MarkdownComponentProps = {},
  children?: ReactNode,
) => {
  const Component = context.components?.[name];

  if (Component !== undefined) {
    return createElement(Component, children === undefined ? props : { ...props, children });
  }

  return createElement(name, props, children);
};

const normalizeFenceLanguage = (info: string) => {
  const language = info.trim().split(/\s+/)[0]?.replace(/^language-/, '').toLowerCase();
  return language || 'plaintext';
};

const sanitizeHref = (href: string) => {
  const trimmed = href.trim();

  if (
    /^(?:https?:|mailto:|tel:)/i.test(trimmed) ||
    /^(?:#|\/(?!\/)|\.{1,2}\/)/.test(trimmed) ||
    !/^[A-Za-z][\w+.-]*:/.test(trimmed)
  ) {
    return trimmed;
  }

  return '#';
};

const parseInline = (text: string, context: MarkdownRenderContext, keyPrefix = 'inline'): ReactNode[] => {
  const nodes: ReactNode[] = [];
  const pattern =
    /(`[^`\n]+`)|(\*\*[^*\n]+\*\*|__[^_\n]+__)|(~~[^~\n]+~~)|(\[[^\]\n]+\]\(([^)\s]+)(?:\s+"([^"]*)")?\))|(\*[^*\n]+\*|_[^_\n]+_)/g;
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    const elementKey = `${keyPrefix}-${key++}`;

    if (token.startsWith('`')) {
      nodes.push(
        renderElement(
          context,
          'code',
          { key: elementKey, className: 'markdown__inline-code', 'data-slot': 'markdown-inline-code' },
          token.slice(1, -1),
        ),
      );
    } else if (token.startsWith('**') || token.startsWith('__')) {
      nodes.push(
        renderElement(
          context,
          'strong',
          { key: elementKey },
          parseInline(token.slice(2, -2), context, `${elementKey}-strong`),
        ),
      );
    } else if (token.startsWith('~~')) {
      nodes.push(
        renderElement(
          context,
          'del',
          { key: elementKey },
          parseInline(token.slice(2, -2), context, `${elementKey}-del`),
        ),
      );
    } else if (token.startsWith('[')) {
      const linkMatch = /^\[([^\]\n]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/.exec(token);

      if (linkMatch !== null) {
        const linkProps: MarkdownComponentProps = {
          key: elementKey,
          href: sanitizeHref(linkMatch[2]),
        };

        if (linkMatch[3] !== undefined) {
          linkProps.title = linkMatch[3];
        }

        nodes.push(
          renderElement(
            context,
            'a',
            linkProps,
            parseInline(linkMatch[1], context, `${elementKey}-link`),
          ),
        );
      } else {
        nodes.push(token);
      }
    } else {
      nodes.push(
        renderElement(
          context,
          'em',
          { key: elementKey },
          parseInline(token.slice(1, -1), context, `${elementKey}-em`),
        ),
      );
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
};

const renderParagraphChildren = (lines: string[], context: MarkdownRenderContext) => {
  const children: ReactNode[] = [];

  lines.forEach((line, index) => {
    const hasHardBreak = /(?: {2}|\\)$/.test(line);
    const cleanLine = hasHardBreak ? line.replace(/(?: {2}|\\)$/, '') : line;

    children.push(...parseInline(cleanLine, context, `p-${index}`));

    if (index < lines.length - 1) {
      children.push(hasHardBreak ? renderElement(context, 'br', { key: `br-${index}` }) : ' ');
    }
  });

  return children;
};

const renderFencedCode = (context: MarkdownRenderContext, languageInfo: string, code: string): ReactNode => {
  const language = normalizeFenceLanguage(languageInfo);

  if (context.components?.pre !== undefined) {
    return renderElement(
      context,
      'pre',
      { 'data-language': language },
      renderElement(
        context,
        'code',
        { className: `language-${language}`, 'data-language': language },
        code,
      ),
    );
  }

  return (
    <CodeBlock>
      <CodeBlock.Header>
        <span className="text-muted text-xs uppercase">{language.toUpperCase()}</span>
        <CodeBlock.CopyButton code={code} />
      </CodeBlock.Header>
      <CodeBlock.Code code={code} language={language} />
    </CodeBlock>
  );
};

const splitTableRow = (line: string) => {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  const cells: string[] = [];
  let current = '';
  let isEscaped = false;

  for (const char of trimmed) {
    if (isEscaped) {
      current += char;
      isEscaped = false;
      continue;
    }

    if (char === '\\') {
      isEscaped = true;
      continue;
    }

    if (char === '|') {
      cells.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
};

const getTableAlignment = (cell: string): TableAlignment | undefined => {
  const trimmed = cell.trim();
  const starts = trimmed.startsWith(':');
  const ends = trimmed.endsWith(':');

  if (starts && ends) return 'center';
  if (ends) return 'right';
  if (starts) return 'left';
  return undefined;
};

const isTableSeparator = (line: string) => {
  const cells = splitTableRow(line);
  return cells.length > 1 && cells.every((cell) => /^:?-{3,}:?$/.test(cell.trim()));
};

const renderTable = (lines: string[], context: MarkdownRenderContext) => {
  const headerCells = splitTableRow(lines[0]);
  const alignments = splitTableRow(lines[1]).map(getTableAlignment);
  const rows = lines.slice(2).filter((line) => line.includes('|')).map(splitTableRow);

  return renderElement(context, 'table', {}, [
    renderElement(
      context,
      'thead',
      { key: 'thead' },
      renderElement(
        context,
        'tr',
        {},
        headerCells.map((cell, index) => {
          const props: MarkdownComponentProps = { key: index };

          if (alignments[index] !== undefined) {
            props.style = { textAlign: alignments[index] };
          }

          return renderElement(context, 'th', props, parseInline(cell, context, `th-${index}`));
        }),
      ),
    ),
    rows.length > 0
      ? renderElement(
          context,
          'tbody',
          { key: 'tbody' },
          rows.map((row, rowIndex) =>
            renderElement(
              context,
              'tr',
              { key: rowIndex },
              headerCells.map((_, cellIndex) => {
                const props: MarkdownComponentProps = { key: cellIndex };

                if (alignments[cellIndex] !== undefined) {
                  props.style = { textAlign: alignments[cellIndex] };
                }

                return renderElement(
                  context,
                  'td',
                  props,
                  parseInline(row[cellIndex] ?? '', context, `td-${rowIndex}-${cellIndex}`),
                );
              }),
            ),
          ),
        )
      : null,
  ]);
};

const renderListItem = (line: string, markerPattern: RegExp, context: MarkdownRenderContext, index: number) => {
  const rawContent = line.replace(markerPattern, '');
  const task = /^\[([ xX])\]\s+/.exec(rawContent);
  const children: ReactNode[] = [];
  const content = task === null ? rawContent : rawContent.slice(task[0].length);

  if (task !== null) {
    const checked = task[1].toLowerCase() === 'x';
    children.push(
      renderElement(context, 'input', {
        key: 'checkbox',
        type: 'checkbox',
        checked,
        disabled: true,
        readOnly: true,
        'aria-label': checked ? 'Completed task' : 'Pending task',
      }),
      ' ',
    );
  }

  children.push(...parseInline(content, context, `li-${index}`));

  return renderElement(context, 'li', { key: index }, children);
};

const parseContentBlock = (raw: string, context: MarkdownRenderContext): ReactNode => {
  const lines = raw.split('\n');
  const first = lines[0];
  const trimmedFirst = first.trim();

  const heading = /^(#{1,6})\s+(.*)$/.exec(trimmedFirst);

  if (heading !== null && lines.length === 1) {
    const level = heading[1].length as 1 | 2 | 3 | 4 | 5 | 6;
    return renderElement(
      context,
      `h${level}`,
      {},
      parseInline(heading[2], context, `h${level}`),
    );
  }

  if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmedFirst) && lines.length === 1) {
    return renderElement(context, 'hr');
  }

  if (lines.length >= 2 && lines[0].includes('|') && isTableSeparator(lines[1])) {
    return renderTable(lines, context);
  }

  if (lines.every((line) => /^>\s?/.test(line))) {
    const quoteLines = lines.map((line) => line.replace(/^>\s?/, ''));
    return renderElement(
      context,
      'blockquote',
      {},
      renderElement(context, 'p', {}, renderParagraphChildren(quoteLines, context)),
    );
  }

  if (lines.every((line) => /^\s*[-*+]\s+/.test(line))) {
    return renderElement(
      context,
      'ul',
      {},
      lines.map((line, index) => renderListItem(line, /^\s*[-*+]\s+/, context, index)),
    );
  }

  if (lines.every((line) => /^\s*\d+[.)]\s+/.test(line))) {
    const start = Number(/^\s*(\d+)/.exec(first)?.[1] ?? '1');
    const props: MarkdownComponentProps = {};

    if (start > 1) {
      props.start = start;
    }

    return renderElement(
      context,
      'ol',
      props,
      lines.map((line, index) => renderListItem(line, /^\s*\d+[.)]\s+/, context, index)),
    );
  }

  return renderElement(context, 'p', {}, renderParagraphChildren(lines, context));
};

const parseSegments = (source: string): MarkdownSegment[] => {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const segments: MarkdownSegment[] = [];
  let textBuffer: string[] = [];
  let isInFence = false;
  let fenceMarker: '```' | '~~~' = '```';
  let fenceLanguage = '';
  let fenceBody: string[] = [];

  const flushText = () => {
    if (textBuffer.length === 0) return;
    segments.push({ kind: 'text', lines: textBuffer });
    textBuffer = [];
  };

  const flushFence = () => {
    segments.push({ kind: 'code', language: fenceLanguage, code: fenceBody.join('\n') });
    isInFence = false;
    fenceLanguage = '';
    fenceBody = [];
  };

  for (const line of lines) {
    if (isInFence) {
      const isClosingFence =
        (fenceMarker === '```' && /^```\s*$/.test(line)) ||
        (fenceMarker === '~~~' && /^~~~\s*$/.test(line));

      if (isClosingFence) {
        flushFence();
      } else {
        fenceBody.push(line);
      }

      continue;
    }

    const fenceOpen = /^(```|~~~)\s*(.*)$/.exec(line);

    if (fenceOpen !== null) {
      flushText();
      isInFence = true;
      fenceMarker = fenceOpen[1] as '```' | '~~~';
      fenceLanguage = fenceOpen[2].trim();
      fenceBody = [];
      continue;
    }

    if (line.trim() === '') {
      flushText();
      continue;
    }

    textBuffer.push(line);
  }

  flushText();

  if (isInFence) {
    flushFence();
  }

  return segments;
};

const parseBlocks = (source: string, context: MarkdownRenderContext): ParsedBlock[] => {
  const blocks: ParsedBlock[] = [];

  parseSegments(source).forEach((segment, index) => {
    if (index > 0) {
      blocks.push({ kind: 'empty' });
    }

    if (segment.kind === 'code') {
      blocks.push({
        kind: 'content',
        // 围栏块以语言+正文作稳定签名，token 追加时未变化的块跳过重渲染
        source: `\`\`\`${segment.language}\n${segment.code}`,
        node: renderFencedCode(context, segment.language, segment.code),
      });
      return;
    }

    const text = segment.lines.join('\n');
    blocks.push({ kind: 'content', source: text, node: parseContentBlock(text, context) });
  });

  return blocks;
};

/**
 * 单个块容器：以稳定块源 source 作 memo 边界，流式追加 token 时未变化的块跳过重渲染。
 * node 由 source 派生，因此 source 相等即可视为同一渲染结果。
 */
type MarkdownBlockProps = { source: string; node: ReactNode };

const MarkdownBlock = memo(
  ({ node }: MarkdownBlockProps) => (
    <div data-slot="markdown-block" className="markdown__block">
      {node}
    </div>
  ),
  (prev, next) => prev.source === next.source,
);
MarkdownBlock.displayName = 'MarkdownBlock';

/**
 * Markdown root: renders local markdown into the prose container used by AI components.
 * Fenced code defaults to CodeBlock so language labels and copy stay available.
 * isStreaming 为真时尾部追加闪烁 caret 并切根类 --streaming（Streamdown 风格）。
 */
const Markdown = forwardRef<HTMLDivElement, MarkdownProps>(
  ({ children = '', components, isStreaming = false, id, className, ...rest }, ref) => {
    const seed = useMemo(() => id ?? `markdown-${++markdownIdSeed}`, [id]);
    const blocks = useMemo(() => parseBlocks(children, { components }), [children, components]);

    return (
      <div
        ref={ref}
        data-slot="markdown"
        data-streaming={isStreaming ? 'true' : undefined}
        className={clsx('markdown', isStreaming && 'markdown--streaming', className)}
        {...rest}
      >
        {blocks.map((block, index) =>
          block.kind === 'content' ? (
            <MarkdownBlock
              // eslint-disable-next-line react/no-array-index-key -- 解析块按位置渲染，index 稳定
              key={`${seed}-${index}`}
              source={block.source}
              node={block.node}
            />
          ) : (
            <div
              // eslint-disable-next-line react/no-array-index-key -- 解析块按位置渲染，index 稳定
              key={`${seed}-${index}`}
              data-slot="markdown-block"
              className="markdown__block"
            />
          ),
        )}
        {isStreaming ? (
          <span data-slot="markdown-caret" className="markdown__caret" aria-hidden="true" />
        ) : null}
      </div>
    );
  },
);
Markdown.displayName = 'Markdown';

export default Markdown;
