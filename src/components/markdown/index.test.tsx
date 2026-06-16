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
});
