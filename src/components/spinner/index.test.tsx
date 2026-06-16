import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import Spinner from './index';

describe('Spinner', () => {
  it('renders with default color/size classes and slots', () => {
    const { container } = render(<Spinner />);
    const root = container.querySelector('[data-slot="spinner"]');
    expect(root).not.toBeNull();
    expect(root).toHaveClass('spinner', 'spinner--accent', 'spinner--md');
    expect(root!.querySelector('svg[data-slot="spinner-icon"]')).not.toBeNull();
  });

  it('applies color and size modifiers', () => {
    const { container } = render(<Spinner color="danger" size="xl" />);
    const root = container.querySelector('[data-slot="spinner"]');
    expect(root).toHaveClass('spinner--danger', 'spinner--xl');
  });

  it('generates unique gradient ids per instance', () => {
    const { container } = render(
      <>
        <Spinner />
        <Spinner />
      </>,
    );
    const gradients = container.querySelectorAll('linearGradient');
    const ids = Array.from(gradients).map((g) => g.id);
    // 4 gradients total (2 per spinner), all ids distinct
    expect(ids).toHaveLength(4);
    expect(new Set(ids).size).toBe(4);
  });

  it('has no axe a11y violations', async () => {
    // 真实用法：spinner 作为加载指示，外层提供可访问的状态文本
    const { container } = render(
      <div role="status">
        <Spinner />
        <span>Loading…</span>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
