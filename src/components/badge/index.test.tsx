import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge, { BadgeAnchor } from './index';

describe('Badge', () => {
  it('renders default color/variant/size classes and data-slot', () => {
    render(<Badge>3</Badge>);
    const badge = screen.getByText('3').closest('[data-slot="badge"]');
    expect(badge).not.toBeNull();
    expect(badge).toHaveClass('badge', 'badge--default', 'badge--md', 'badge--primary');
  });

  it('wraps children in a labelled slot', () => {
    render(<Badge>9</Badge>);
    const label = screen.getByText('9');
    expect(label).toHaveClass('badge__label');
    expect(label).toHaveAttribute('data-slot', 'badge-label');
  });

  it('applies color, variant, size and placement modifiers', () => {
    const { container } = render(
      <Badge color="danger" variant="soft" size="lg" placement="top-left">
        x
      </Badge>,
    );
    const badge = container.querySelector('[data-slot="badge"]');
    expect(badge).toHaveClass(
      'badge--danger',
      'badge--top-left',
      'badge--lg',
      'badge--soft',
    );
  });

  it('omits the label span when there are no children', () => {
    const { container } = render(<Badge color="accent" />);
    const badge = container.querySelector('[data-slot="badge"]');
    expect(badge).not.toBeNull();
    expect(badge!.querySelector('.badge__label')).toBeNull();
  });

  it('BadgeAnchor renders children with its slot/class', () => {
    render(
      <BadgeAnchor>
        <span>child</span>
      </BadgeAnchor>,
    );
    const anchor = screen.getByText('child').closest('[data-slot="badge-anchor"]');
    expect(anchor).not.toBeNull();
    expect(anchor).toHaveClass('badge-anchor');
  });
});
