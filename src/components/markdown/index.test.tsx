import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import Markdown from './index';

const SAMPLE = [
  '# Heading',
  '',
  'A paragraph with **bold**, _italic_, and a [link](https://example.com).',
  '',
  '- [x] Completed task',
  '- [ ] Pending task',
  '',
  '| Name | Value |',
  '| --- | --- |',
  '| Alpha | 1 |',
  '',
  '```ts',
  'const x: number = 1;',
  '```',
].join('\n');

describe('Markdown', () => {
  it('has no axe a11y violations', async () => {
    const { container } = render(<Markdown>{SAMPLE}</Markdown>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('renders the streaming caret slot only when isStreaming', () => {
    const idle = render(<Markdown>{SAMPLE}</Markdown>);
    expect(idle.container.querySelector('[data-slot="markdown-caret"]')).toBeNull();
    expect(idle.container.querySelector('[data-slot="markdown"]')).not.toHaveAttribute('data-streaming');

    const streaming = render(<Markdown isStreaming>{SAMPLE}</Markdown>);
    const caret = streaming.container.querySelector('[data-slot="markdown-caret"]');
    expect(caret).not.toBeNull();
    expect(caret).toHaveAttribute('aria-hidden', 'true');
    expect(streaming.container.querySelector('[data-slot="markdown"]')).toHaveAttribute(
      'data-streaming',
      'true',
    );
    expect(streaming.container.querySelector('[data-slot="markdown"]')).toHaveClass('markdown--streaming');
  });

  it('keeps the block list stable while a trailing token is appended', () => {
    const { container, rerender } = render(<Markdown isStreaming>{SAMPLE}</Markdown>);
    const before = container.querySelectorAll('[data-slot="markdown-block"]');
    const blockCount = before.length;
    const firstBlock = before[0];

    rerender(<Markdown isStreaming>{`${SAMPLE} 追加`}</Markdown>);
    const after = container.querySelectorAll('[data-slot="markdown-block"]');

    // 块数量不变，且未变化的首块为同一 DOM 节点（memo 跳过重渲染）
    expect(after.length).toBe(blockCount);
    expect(after[0]).toBe(firstBlock);
  });
});
