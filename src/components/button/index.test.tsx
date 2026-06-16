import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import Button from './index';

describe('Button', () => {
  it('renders children with BEM class and data-slot', () => {
    render(<Button variant="primary">Click</Button>);
    const btn = screen.getByRole('button', { name: 'Click' });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveClass('button');
    expect(btn).toHaveAttribute('data-slot', 'button');
  });

  it('fires onClick', async () => {
    const user = userEvent.setup();
    let clicks = 0;
    render(<Button onClick={() => (clicks += 1)}>Go</Button>);
    await user.click(screen.getByRole('button', { name: 'Go' }));
    expect(clicks).toBe(1);
  });

  it('has no axe a11y violations', async () => {
    const { container } = render(<Button>Save changes</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
