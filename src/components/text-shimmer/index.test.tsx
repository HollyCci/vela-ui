import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import TextShimmer from './index';

describe('TextShimmer', () => {
  it('has no axe a11y violations', async () => {
    const { container } = render(<TextShimmer>Thinking…</TextShimmer>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
