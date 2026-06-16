import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import CodeBlock from './index';

describe('CodeBlock', () => {
  it('has no axe a11y violations', async () => {
    const { container } = render(
      <CodeBlock>
        <CodeBlock.Header>
          <span className="text-muted text-xs uppercase">TYPESCRIPT</span>
          <CodeBlock.CopyButton code="const x = 1;" />
        </CodeBlock.Header>
        <CodeBlock.Code code={'const x = 1;\nconsole.log(x);'} language="typescript" />
      </CodeBlock>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
