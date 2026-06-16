import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import PromptSuggestion from './index';

describe('PromptSuggestion', () => {
  it('has no axe a11y violations', async () => {
    const { container } = render(
      <PromptSuggestion title="Try asking" description="Pick a prompt to get started">
        <PromptSuggestion.Items variant="pill">
          <PromptSuggestion.Item>Summarize this page</PromptSuggestion.Item>
          <PromptSuggestion.Item>Draft an email</PromptSuggestion.Item>
        </PromptSuggestion.Items>
        <PromptSuggestion.Items variant="card">
          <PromptSuggestion.CardItem description="Generate unit tests">
            Write tests
          </PromptSuggestion.CardItem>
        </PromptSuggestion.Items>
      </PromptSuggestion>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
