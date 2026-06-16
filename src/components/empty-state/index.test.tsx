import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import EmptyState from './index';

describe('EmptyState', () => {
  it('renders role=status with default size modifier', () => {
    render(
      <EmptyState>
        <EmptyState.Title>No results</EmptyState.Title>
      </EmptyState>,
    );
    const root = screen.getByRole('status');
    expect(root).toHaveClass('empty-state', 'empty-state--md');
    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('applies the size modifier class', () => {
    render(<EmptyState size="lg">x</EmptyState>);
    expect(screen.getByRole('status')).toHaveClass('empty-state--lg');
  });

  it('renders header/media/title/description/content slots', () => {
    render(
      <EmptyState>
        <EmptyState.Header>
          <EmptyState.Media variant="icon">icon</EmptyState.Media>
          <EmptyState.Title>Title</EmptyState.Title>
          <EmptyState.Description>Desc</EmptyState.Description>
        </EmptyState.Header>
        <EmptyState.Content>
          <button type="button">Refresh</button>
        </EmptyState.Content>
      </EmptyState>,
    );
    expect(document.querySelector('.empty-state__header')).toBeInTheDocument();
    expect(document.querySelector('.empty-state__title')).toHaveTextContent('Title');
    expect(document.querySelector('.empty-state__description')).toHaveTextContent('Desc');
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
  });

  it('Media reflects icon variant via data-variant and is aria-hidden', () => {
    render(<EmptyState.Media variant="icon">m</EmptyState.Media>);
    const media = document.querySelector('.empty-state__media') as HTMLElement;
    expect(media).toHaveAttribute('data-variant', 'icon');
    expect(media).toHaveAttribute('aria-hidden', 'true');
  });

  it('has no axe a11y violations', async () => {
    const { container } = render(
      <EmptyState>
        <EmptyState.Header>
          <EmptyState.Media variant="icon">icon</EmptyState.Media>
          <EmptyState.Title>No results found</EmptyState.Title>
          <EmptyState.Description>Try adjusting your filters.</EmptyState.Description>
        </EmptyState.Header>
        <EmptyState.Content>
          <button type="button">Clear filters</button>
        </EmptyState.Content>
      </EmptyState>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
