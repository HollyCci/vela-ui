import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Skeleton from './index';

describe('Skeleton', () => {
  it('renders with the default pulse animation and is aria-hidden', () => {
    const { container } = render(<Skeleton />);
    const el = container.querySelector('.skeleton');
    expect(el).not.toBeNull();
    expect(el).toHaveClass('skeleton', 'skeleton--pulse');
    expect(el).toHaveAttribute('aria-hidden');
  });

  it('applies the shimmer animation modifier', () => {
    const { container } = render(<Skeleton animation="shimmer" />);
    expect(container.querySelector('.skeleton')).toHaveClass('skeleton--shimmer');
  });

  it('merges custom className and forwards props', () => {
    const { container } = render(<Skeleton className="w-10" data-testid="sk" />);
    const el = container.querySelector('.skeleton');
    expect(el).toHaveClass('w-10');
    expect(el).toHaveAttribute('data-testid', 'sk');
  });
});
