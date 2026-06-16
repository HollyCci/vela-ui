import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import ChatSource from './index';

describe('ChatSource', () => {
  it('has no axe a11y violations', async () => {
    const { container } = render(
      <>
        <ChatSource href="https://example.com" title="Example Source" />
        <ChatSource.Preview
          href="https://example.com/article"
          title="Example Article"
          description="A short description of the source."
        />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
