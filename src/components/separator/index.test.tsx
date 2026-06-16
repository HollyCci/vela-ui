import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import Separator from './index';

describe('Separator', () => {
  it('renders a horizontal separator by default without aria-orientation', () => {
    render(<Separator />);
    const sep = screen.getByRole('separator');
    expect(sep).toHaveAttribute('data-slot', 'separator');
    expect(sep).toHaveAttribute('data-orientation', 'horizontal');
    expect(sep).not.toHaveAttribute('aria-orientation');
    expect(sep).toHaveClass('separator', 'separator--horizontal', 'separator--default');
  });

  it('sets aria-orientation only when vertical', () => {
    render(<Separator orientation="vertical" />);
    const sep = screen.getByRole('separator');
    expect(sep).toHaveAttribute('data-orientation', 'vertical');
    expect(sep).toHaveAttribute('aria-orientation', 'vertical');
    expect(sep).toHaveClass('separator--vertical');
  });

  it('applies the color modifier', () => {
    render(<Separator color="tertiary" />);
    expect(screen.getByRole('separator')).toHaveClass('separator--tertiary');
  });

  it('has no axe a11y violations', async () => {
    const { container } = render(
      <div>
        <p>Section one</p>
        <Separator />
        <p>Section two</p>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
