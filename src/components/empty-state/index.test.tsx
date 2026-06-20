import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import EmptyState from './index';

describe('EmptyState', () => {
  it('renders root div with default size modifier', () => {
    const { container } = render(
      <EmptyState>
        <EmptyState.Title>No results</EmptyState.Title>
      </EmptyState>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe('DIV');
    expect(root).toHaveClass('empty-state', 'empty-state--md');
    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('applies the size modifier class', () => {
    const { container } = render(<EmptyState size="lg">x</EmptyState>);
    expect(container.firstElementChild).toHaveClass('empty-state--lg');
  });

  it('supports a custom render function to override the root element', () => {
    render(
      <EmptyState
        render={(props) => (
          <section data-testid="custom-root" {...props}>
            <EmptyState.Title>Custom</EmptyState.Title>
          </section>
        )}
      />,
    );
    const root = screen.getByTestId('custom-root');
    expect(root.tagName).toBe('SECTION');
    expect(root).toHaveClass('empty-state', 'empty-state--md');
  });

  it('renders header/media/title/description/content slots with correct elements', () => {
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
    // 标题渲染为 <h3>，可由 role=heading (level 3) 触达，并保留 empty-state__title class
    const title = screen.getByRole('heading', { level: 3, name: 'Title' });
    expect(title).toHaveClass('empty-state__title');
    // 描述渲染为 <p>，对齐线上参考版语义
    const description = document.querySelector('.empty-state__description') as HTMLElement;
    expect(description.tagName).toBe('P');
    expect(description).toHaveTextContent('Desc');
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
  });

  it('Media defaults to data-variant="default" and reflects the icon variant', () => {
    const { rerender } = render(<EmptyState.Media>m</EmptyState.Media>);
    expect(document.querySelector('.empty-state__media')).toHaveAttribute('data-variant', 'default');
    rerender(<EmptyState.Media variant="icon">m</EmptyState.Media>);
    expect(document.querySelector('.empty-state__media')).toHaveAttribute('data-variant', 'icon');
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
