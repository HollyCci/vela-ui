import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import ChatLoader from './index';

describe('ChatLoader', () => {
  it('has no axe a11y violations', async () => {
    const { container } = render(
      <>
        <ChatLoader variant="dots" label="Loading response" />
        <ChatLoader variant="pulse" label="Loading" />
        <ChatLoader variant="spinner" label="Loading" />
        <ChatLoader variant="skeleton" label="Loading" />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('renders every sub-component as a div (Pro: supports native div props)', () => {
    const { getByTestId } = render(
      <>
        <ChatLoader.Dots data-testid="dots" />
        <ChatLoader.Pulse data-testid="pulse" />
        <ChatLoader.Spinner data-testid="spinner" />
        <ChatLoader.Skeleton data-testid="skeleton">
          <ChatLoader.SkeletonAvatar data-testid="avatar" />
          <ChatLoader.SkeletonBlock data-testid="block">
            <ChatLoader.SkeletonLine data-testid="line" />
          </ChatLoader.SkeletonBlock>
        </ChatLoader.Skeleton>
      </>,
    );
    for (const id of ['dots', 'pulse', 'spinner', 'skeleton', 'avatar', 'block', 'line']) {
      expect(getByTestId(id).tagName).toBe('DIV');
    }
  });

  it('forwards native div props onto the root element', () => {
    const { getByTestId } = render(
      <ChatLoader.Dots data-testid="dots" id="my-loader" className="extra" />,
    );
    const el = getByTestId('dots');
    expect(el).toHaveAttribute('id', 'my-loader');
    expect(el).toHaveClass('chat-loader__dots');
    expect(el).toHaveClass('extra');
  });

  it('exposes a status role with an accessible name via label', () => {
    const { getByRole } = render(<ChatLoader variant="dots" label="Loading response" />);
    expect(getByRole('status')).toHaveAttribute('aria-label', 'Loading response');
  });
});
