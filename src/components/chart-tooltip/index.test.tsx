import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import ChartTooltip from './index';

describe('ChartTooltip', () => {
  it('has no axe a11y violations', async () => {
    const { container } = render(
      <ChartTooltip>
        <ChartTooltip.Header>March</ChartTooltip.Header>
        <ChartTooltip.Item
          indicator="dot"
          indicatorColor="var(--chart-1)"
          label="Desktop"
          value={150}
        />
        <ChartTooltip.Item
          indicator="line"
          indicatorColor="var(--chart-2)"
          label="Mobile"
          value={90}
        />
      </ChartTooltip>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
