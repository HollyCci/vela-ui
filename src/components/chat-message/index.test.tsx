import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import ChatMessage from './index';

describe('ChatMessage', () => {
  it('has no axe a11y violations', async () => {
    const { container } = render(
      <>
        <ChatMessage variant="user">How tall is Mount Everest?</ChatMessage>
        <ChatMessage variant="assistant" avatar={<span aria-hidden="true">AI</span>}>
          Mount Everest is about 8,849 meters tall.
        </ChatMessage>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
