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

  it('renders as the markdown root div with block wrappers', () => {
    const { container } = render(<Markdown>{SAMPLE}</Markdown>);
    const root = container.querySelector('[data-slot="markdown"]');
    expect(root).not.toBeNull();
    expect(root?.tagName).toBe('DIV');
    expect(root).toHaveClass('markdown');
    expect(container.querySelectorAll('[data-slot="markdown-block"]').length).toBeGreaterThan(0);
  });

  it('forwards className and native div attributes onto the root', () => {
    const { container } = render(
      <Markdown className="custom" id="seed" aria-label="answer">
        {SAMPLE}
      </Markdown>,
    );
    const root = container.querySelector('[data-slot="markdown"]');
    expect(root).toHaveClass('markdown', 'custom');
    expect(root).toHaveAttribute('aria-label', 'answer');
  });

  it('applies component overrides for rendered markdown elements', () => {
    const { container } = render(
      <Markdown components={{ a: ({ children, ...props }) => <a data-custom-link {...props}>{children}</a> }}>
        {'A [link](https://example.com).'}
      </Markdown>,
    );
    expect(container.querySelector('a[data-custom-link]')).not.toBeNull();
  });

  it('keeps the block list stable while a trailing token is appended', () => {
    const { container, rerender } = render(<Markdown>{SAMPLE}</Markdown>);
    const before = container.querySelectorAll('[data-slot="markdown-block"]');
    const blockCount = before.length;
    const firstBlock = before[0];

    rerender(<Markdown>{`${SAMPLE} 追加`}</Markdown>);
    const after = container.querySelectorAll('[data-slot="markdown-block"]');

    // 块数量不变，且未变化的首块为同一 DOM 节点（memo 跳过重渲染，参考版同款流式性能）
    expect(after.length).toBe(blockCount);
    expect(after[0]).toBe(firstBlock);
  });
});
