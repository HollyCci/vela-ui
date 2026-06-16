import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import Kbd from './index';

describe('Kbd', () => {
  it('renders content inside a <kbd> with the base class', () => {
    render(<Kbd>K</Kbd>);
    const content = screen.getByText('K');
    expect(content).toHaveClass('kbd__content');
    const root = content.closest('kbd');
    expect(root).not.toBeNull();
    expect(root).toHaveClass('kbd');
  });

  it('does not render an abbr when none is provided', () => {
    const { container } = render(<Kbd>X</Kbd>);
    expect(container.querySelector('.kbd__abbr')).toBeNull();
  });

  it('renders the abbr with its title when provided', () => {
    render(
      <Kbd abbr="⌘" abbrTitle="Command">
        K
      </Kbd>,
    );
    const abbr = screen.getByText('⌘');
    expect(abbr.tagName.toLowerCase()).toBe('abbr');
    expect(abbr).toHaveClass('kbd__abbr');
    expect(abbr).toHaveAttribute('title', 'Command');
  });

  it('applies the light modifier', () => {
    const { container } = render(<Kbd isLight>K</Kbd>);
    expect(container.querySelector('kbd')).toHaveClass('kbd--light');
  });

  it('has no axe a11y violations', async () => {
    const { container } = render(
      <Kbd abbr="⌘" abbrTitle="Command">
        K
      </Kbd>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
