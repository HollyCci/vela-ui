import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import ChainOfThought from './index';

describe('ChainOfThought', () => {
  it('has no axe a11y violations', async () => {
    const { container } = render(
      <ChainOfThought defaultExpanded>
        <ChainOfThought.Trigger>Reasoning</ChainOfThought.Trigger>
        <ChainOfThought.Content>
          <ChainOfThought.Steps>
            <ChainOfThought.Step label="Analyze">Read the question carefully</ChainOfThought.Step>
            <ChainOfThought.Step label="Answer">Provide the result</ChainOfThought.Step>
          </ChainOfThought.Steps>
        </ChainOfThought.Content>
      </ChainOfThought>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
