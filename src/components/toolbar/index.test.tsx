import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import Toolbar from './index';

describe('Toolbar', () => {
  it('renders role=toolbar with default horizontal orientation', () => {
    render(
      <Toolbar>
        <button>A</button>
      </Toolbar>,
    );
    const bar = screen.getByRole('toolbar');
    expect(bar).toHaveAttribute('data-slot', 'toolbar');
    expect(bar).toHaveAttribute('aria-orientation', 'horizontal');
    expect(bar).toHaveClass('toolbar', 'toolbar--horizontal');
    expect(bar).not.toHaveClass('toolbar--attached');
  });

  it('renders children inside the toolbar', () => {
    render(
      <Toolbar>
        <button>Click</button>
      </Toolbar>,
    );
    expect(screen.getByRole('button', { name: 'Click' })).toBeInTheDocument();
  });

  it('applies vertical orientation and the attached modifier', () => {
    render(<Toolbar orientation="vertical" isAttached />);
    const bar = screen.getByRole('toolbar');
    expect(bar).toHaveAttribute('aria-orientation', 'vertical');
    expect(bar).toHaveClass('toolbar--vertical', 'toolbar--attached');
  });

  it('has no axe a11y violations', async () => {
    const { container } = render(
      <Toolbar aria-label="Text formatting">
        <button type="button" aria-label="Bold">
          B
        </button>
        <button type="button" aria-label="Italic">
          I
        </button>
      </Toolbar>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
