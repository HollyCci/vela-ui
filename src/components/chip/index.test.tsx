import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Chip from './index';

describe('Chip', () => {
  it('renders with default classes and data-slot', () => {
    render(<Chip>Tag</Chip>);
    const chip = screen.getByText('Tag').closest('[data-slot="chip"]');
    expect(chip).not.toBeNull();
    expect(chip).toHaveClass('chip', 'chip--default', 'chip--md', 'chip--primary');
  });

  it('wraps text in a labelled slot', () => {
    render(<Chip>Hello</Chip>);
    const label = screen.getByText('Hello');
    expect(label).toHaveClass('chip__label');
    expect(label).toHaveAttribute('data-slot', 'chip-label');
  });

  it('applies color, size and variant modifiers', () => {
    const { container } = render(
      <Chip color="success" size="sm" variant="tertiary">
        ok
      </Chip>,
    );
    const chip = container.querySelector('[data-slot="chip"]');
    expect(chip).toHaveClass('chip--success', 'chip--sm', 'chip--tertiary');
  });
});
