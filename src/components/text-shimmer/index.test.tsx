import type { CSSProperties } from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import TextShimmer from './index';

describe('TextShimmer', () => {
  it('has no axe a11y violations', async () => {
    const { container } = render(<TextShimmer>Thinking…</TextShimmer>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('renders a resolved --shimmer-angle so the gradient stays valid', () => {
    // 运行时规则无 var() 兜底，组件必须自带 --shimmer-angle 否则文字透明不可见
    const { getByText } = render(<TextShimmer>Thinking…</TextShimmer>);
    const span = getByText('Thinking…');
    expect(span.style.getPropertyValue('--shimmer-angle')).toBe('0deg');
  });

  it('preserves user-supplied style overrides', () => {
    // 兜底默认在前展开，用户传入的 style 应可覆盖
    const { getByText } = render(
      <TextShimmer style={{ '--shimmer-angle': '45deg' } as CSSProperties}>
        Thinking…
      </TextShimmer>,
    );
    const span = getByText('Thinking…');
    expect(span.style.getPropertyValue('--shimmer-angle')).toBe('45deg');
  });
});
