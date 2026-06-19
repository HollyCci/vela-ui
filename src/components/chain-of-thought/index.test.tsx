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

  it('omits data-status and renders a bare muted dot by default (backward compatible)', () => {
    const { container } = render(
      <ChainOfThought defaultExpanded>
        <ChainOfThought.Content>
          <ChainOfThought.Steps>
            <ChainOfThought.Step label="Analyze">Read the question</ChainOfThought.Step>
          </ChainOfThought.Steps>
        </ChainOfThought.Content>
      </ChainOfThought>,
    );
    const step = container.querySelector('[data-slot="chain-of-thought-step"]')!;
    expect(step.hasAttribute('data-status')).toBe(false);
    const indicator = container.querySelector('.chain-of-thought__step-indicator')!;
    expect(indicator.hasAttribute('data-status')).toBe(false);
    // 缺省指示节点为空圆点，无对勾
    expect(indicator.querySelector('[data-slot="chain-of-thought-step-check"]')).toBeNull();
    expect(indicator.textContent).toBe('');
  });

  it.each(['pending', 'active'] as const)(
    'reflects status=%s on step + indicator as a dot (no checkmark)',
    (status) => {
      const { container } = render(
        <ChainOfThought defaultExpanded>
          <ChainOfThought.Content>
            <ChainOfThought.Steps>
              <ChainOfThought.Step label="Step" status={status}>
                Body
              </ChainOfThought.Step>
            </ChainOfThought.Steps>
          </ChainOfThought.Content>
        </ChainOfThought>,
      );
      const step = container.querySelector('[data-slot="chain-of-thought-step"]')!;
      expect(step.getAttribute('data-status')).toBe(status);
      const indicator = container.querySelector('.chain-of-thought__step-indicator')!;
      expect(indicator.getAttribute('data-status')).toBe(status);
      expect(indicator.querySelector('[data-slot="chain-of-thought-step-check"]')).toBeNull();
    },
  );

  it('renders a checkmark indicator for status=complete', () => {
    const { container } = render(
      <ChainOfThought defaultExpanded>
        <ChainOfThought.Content>
          <ChainOfThought.Steps>
            <ChainOfThought.Step label="Done" status="complete">
              Body
            </ChainOfThought.Step>
          </ChainOfThought.Steps>
        </ChainOfThought.Content>
      </ChainOfThought>,
    );
    const step = container.querySelector('[data-slot="chain-of-thought-step"]')!;
    expect(step.getAttribute('data-status')).toBe('complete');
    const indicator = container.querySelector('.chain-of-thought__step-indicator')!;
    expect(indicator.getAttribute('data-status')).toBe('complete');
    const check = indicator.querySelector('[data-slot="chain-of-thought-step-check"]');
    expect(check).not.toBeNull();
    expect(check!.getAttribute('aria-hidden')).toBe('true');
  });
});
