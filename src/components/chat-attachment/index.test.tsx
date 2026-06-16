import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import ChatAttachment from './index';

describe('ChatAttachment', () => {
  it('has no axe a11y violations', async () => {
    const { container } = render(
      <>
        <ChatAttachment
          name="diagram.png"
          kind="image"
          src="https://example.com/diagram.png"
          onRemove={vi.fn()}
        />
        <ChatAttachment name="report.pdf" kind="file" />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
