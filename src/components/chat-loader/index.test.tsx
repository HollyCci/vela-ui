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
});
