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

  it('renders the trigger as a button (参考版 Trigger renders-as button)', () => {
    const { container } = render(
      <ChainOfThought defaultExpanded>
        <ChainOfThought.Trigger>Thought for 2s</ChainOfThought.Trigger>
        <ChainOfThought.Content>
          <ChainOfThought.Steps>
            <ChainOfThought.Step>Body</ChainOfThought.Step>
          </ChainOfThought.Steps>
        </ChainOfThought.Content>
      </ChainOfThought>,
    );
    const trigger = container.querySelector('[data-slot="chain-of-thought-trigger"]')!;
    expect(trigger.tagName).toBe('BUTTON');
  });

  it('renders the step header (indicator + label) when label is provided', () => {
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
    expect(step.tagName).toBe('DIV');
    const indicator = container.querySelector('.chain-of-thought__step-indicator')!;
    expect(indicator).not.toBeNull();
    expect(indicator.getAttribute('aria-hidden')).toBe('true');
    const label = container.querySelector('.chain-of-thought__step-label')!;
    expect(label.textContent).toBe('Analyze');
    expect(container.querySelector('.chain-of-thought__step-content')!.textContent).toBe(
      'Read the question',
    );
  });

  it('renders body-only (no step header) when label is omitted (backward compatible)', () => {
    const { container } = render(
      <ChainOfThought defaultExpanded>
        <ChainOfThought.Content>
          <ChainOfThought.Steps>
            <ChainOfThought.Step>Body content only</ChainOfThought.Step>
          </ChainOfThought.Steps>
        </ChainOfThought.Content>
      </ChainOfThought>,
    );
    expect(container.querySelector('.chain-of-thought__step-header')).toBeNull();
    expect(container.querySelector('.chain-of-thought__step-indicator')).toBeNull();
    expect(container.querySelector('.chain-of-thought__step-content')!.textContent).toBe(
      'Body content only',
    );
  });

  it('applies the streaming root modifier when isStreaming is set', () => {
    const { container } = render(
      <ChainOfThought isStreaming defaultExpanded>
        <ChainOfThought.Trigger>Thinking…</ChainOfThought.Trigger>
        <ChainOfThought.Content>
          <ChainOfThought.Steps>
            <ChainOfThought.Step label="Analyze">Body</ChainOfThought.Step>
          </ChainOfThought.Steps>
        </ChainOfThought.Content>
      </ChainOfThought>,
    );
    const root = container.querySelector('[data-slot="chain-of-thought"]')!;
    expect(root.classList.contains('chain-of-thought--streaming')).toBe(true);
    expect(root.classList.contains('chain-of-thought--complete')).toBe(false);
  });
});
