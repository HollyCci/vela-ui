import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import ChatMessage from './index';
import ChatMessageActions from '../chat-message-actions';
import Markdown from '../markdown';

let originalClipboard: PropertyDescriptor | undefined;
let didPatchClipboard = false;

const setClipboard = (writeText: ReturnType<typeof vi.fn>) => {
  originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
  didPatchClipboard = true;
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
};

describe('ChatMessage', () => {
  afterEach(() => {
    if (!didPatchClipboard) {
      return;
    }

    if (originalClipboard) {
      Object.defineProperty(navigator, 'clipboard', originalClipboard);
    } else {
      // @ts-expect-error Test cleanup for a clipboard property added during the test.
      delete navigator.clipboard;
    }
    originalClipboard = undefined;
    didPatchClipboard = false;
  });

  it('preserves the legacy variant API by rendering compound slots internally', () => {
    render(
      <>
        <ChatMessage variant="user" actions={<ChatMessage.Action data-testid="legacy-action" />}>
          How tall is Mount Everest?
        </ChatMessage>
        <ChatMessage variant="assistant" avatar={<span aria-hidden="true">AI</span>}>
          Mount Everest is about 8,849 meters tall.
        </ChatMessage>
      </>,
    );

    expect(document.querySelector('[data-slot="chat-message-user"]')).toHaveClass('chat-message--user');
    expect(document.querySelector('[data-slot="chat-message-bubble"]')).toHaveClass('chat-message__bubble');
    expect(document.querySelectorAll('[data-slot="chat-message-content"]')).toHaveLength(2);
    expect(document.querySelector('[data-slot="chat-message-assistant"]')).toHaveClass('chat-message--assistant');
    expect(document.querySelector('[data-slot="chat-message-avatar"]')).toHaveClass('chat-message__avatar');
    expect(document.querySelector('[data-slot="chat-message-body"]')).toHaveClass('chat-message__body');
    expect(screen.getByTestId('legacy-action')).toHaveAttribute('data-slot', 'chat-message-action');
  });

  it('composes assistant and user anatomy with markdown content and real copy actions', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    setClipboard(writeText);

    render(
      <>
        <ChatMessage.Assistant data-testid="assistant">
          <ChatMessage.Avatar alt="Assistant" fallback="AI" show />
          <ChatMessage.Body>
            <ChatMessage.Content>
              <Markdown>{'### Plan\n\n- Add `15 min` follow-up practice'}</Markdown>
            </ChatMessage.Content>
            <ChatMessage.Actions>
              <ChatMessageActions>
                <ChatMessageActions.Copy content="Plan: add 15 min follow-up practice" timeout={100000} />
              </ChatMessageActions>
            </ChatMessage.Actions>
          </ChatMessage.Body>
        </ChatMessage.Assistant>
        <ChatMessage.User data-testid="user">
          <ChatMessage.Bubble>
            <ChatMessage.Content>Hello</ChatMessage.Content>
          </ChatMessage.Bubble>
        </ChatMessage.User>
      </>,
    );

    expect(screen.getByTestId('assistant')).toHaveAttribute('data-slot', 'chat-message-assistant');
    expect(screen.getByTestId('user')).toHaveAttribute('data-slot', 'chat-message-user');
    expect(screen.getByText('15 min')).toHaveAttribute('data-slot', 'markdown-inline-code');

    const copy = screen.getByRole('button', { name: 'Copy' });
    await user.click(copy);

    expect(writeText).toHaveBeenCalledWith('Plan: add 15 min follow-up practice');
    await waitFor(() => expect(copy).toHaveAttribute('data-copy-status', 'copied'));
  });

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
