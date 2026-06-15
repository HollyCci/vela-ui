import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Link from './index';

describe('Link', () => {
  it('renders an anchor with the base class and href', () => {
    render(<Link href="/home">Home</Link>);
    const link = screen.getByRole('link', { name: 'Home' });
    expect(link).toHaveClass('link');
    expect(link).toHaveAttribute('href', '/home');
  });

  it('fires onClick when enabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Link href="#" onClick={onClick}>
        Go
      </Link>,
    );
    await user.click(screen.getByRole('link', { name: 'Go' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('adds external target/rel and an external icon when isExternal', () => {
    const { container } = render(
      <Link href="https://x.com" isExternal>
        Out
      </Link>,
    );
    const link = screen.getByRole('link', { name: /Out/ });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(container.querySelector('.link__icon[data-default-icon="true"]')).not.toBeNull();
  });

  it('when disabled: aria-disabled, no href, suppresses onClick and external bits', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { container } = render(
      <Link href="https://x.com" isExternal isDisabled onClick={onClick}>
        Nope
      </Link>,
    );
    // an <a> without href has no implicit "link" role, so query by text instead
    const link = screen.getByText('Nope');
    expect(link.tagName.toLowerCase()).toBe('a');
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).not.toHaveAttribute('href');
    expect(link).not.toHaveAttribute('target');
    expect(container.querySelector('.link__icon')).toBeNull();
    await user.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });
});
