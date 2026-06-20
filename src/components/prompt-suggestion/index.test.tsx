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

  it('renders the title/description props through the header slots', () => {
    const { getByText } = render(
      <PromptSuggestion title="What can I help with?" description="Start from a suggested prompt." />,
    );
    const title = getByText('What can I help with?');
    const description = getByText('Start from a suggested prompt.');
    expect(title.tagName).toBe('H2');
    expect(title).toHaveClass('prompt-suggestion__title');
    expect(description.tagName).toBe('P');
    expect(description).toHaveClass('prompt-suggestion__description');
    expect(title.parentElement).toHaveClass('prompt-suggestion__header');
  });

  it('exposes composable Header/Title/Description slots matching the reference anatomy', () => {
    const { getByText } = render(
      <PromptSuggestion>
        <PromptSuggestion.Header>
          <PromptSuggestion.Title>What can I help with?</PromptSuggestion.Title>
          <PromptSuggestion.Description>Start from a suggested prompt.</PromptSuggestion.Description>
        </PromptSuggestion.Header>
        <PromptSuggestion.Items>
          <PromptSuggestion.Item>
            <PromptSuggestion.ItemTitle>Summarize this document</PromptSuggestion.ItemTitle>
            <PromptSuggestion.ItemDescription>
              Create a concise summary.
            </PromptSuggestion.ItemDescription>
          </PromptSuggestion.Item>
        </PromptSuggestion.Items>
      </PromptSuggestion>,
    );
    expect(getByText('What can I help with?').tagName).toBe('H2');
    expect(getByText('Start from a suggested prompt.').tagName).toBe('P');
    expect(getByText('Summarize this document')).toHaveClass('prompt-suggestion__item-label');
    expect(getByText('Create a concise summary.')).toHaveClass(
      'prompt-suggestion__item-description',
    );
  });

  it('Items renders a div carrying both the base and variant classes', () => {
    const { getByTestId } = render(
      <PromptSuggestion.Items data-testid="items" variant="card" />,
    );
    const items = getByTestId('items');
    expect(items.tagName).toBe('DIV');
    expect(items).toHaveClass('prompt-suggestion__items');
    expect(items).toHaveClass('prompt-suggestion__items--card');
  });

  it('Item renders a real button carrying both the base and variant classes', () => {
    const { getByRole } = render(<PromptSuggestion.Item>Ask</PromptSuggestion.Item>);
    const item = getByRole('button', { name: 'Ask' });
    expect(item).toHaveAttribute('type', 'button');
    expect(item).toHaveClass('prompt-suggestion__item');
    expect(item).toHaveClass('prompt-suggestion__item--pill');
  });

  it('exposes item slot sub-components (ItemMeta/ItemTags/ItemFooter)', () => {
    const { getByText } = render(
      <PromptSuggestion.Item>
        <PromptSuggestion.ItemTitle>Plan launch</PromptSuggestion.ItemTitle>
        <PromptSuggestion.ItemFooter>
          <PromptSuggestion.ItemTags>tag</PromptSuggestion.ItemTags>
          <PromptSuggestion.ItemMeta>2 min</PromptSuggestion.ItemMeta>
        </PromptSuggestion.ItemFooter>
      </PromptSuggestion.Item>,
    );
    expect(getByText('tag')).toHaveClass('prompt-suggestion__item-tags');
    expect(getByText('2 min')).toHaveClass('prompt-suggestion__item-meta');
    expect(getByText('tag').parentElement).toHaveClass('prompt-suggestion__item-footer');
  });
});
