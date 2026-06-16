import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import Card from './index';

describe('Card', () => {
  it('renders root with default variant class', () => {
    const { container } = render(<Card>body</Card>);
    const root = container.querySelector('.card');
    expect(root).toHaveClass('card', 'card--default');
    expect(root).toHaveTextContent('body');
  });

  it('applies the requested variant', () => {
    const { container } = render(<Card variant="secondary">x</Card>);
    expect(container.querySelector('.card')).toHaveClass('card--secondary');
  });

  it('renders all subsection slots with their BEM classes', () => {
    render(
      <Card>
        <Card.Header>
          <Card.Title>Title</Card.Title>
          <Card.Description>Desc</Card.Description>
        </Card.Header>
        <Card.Content>Content</Card.Content>
        <Card.Footer>Footer</Card.Footer>
      </Card>,
    );
    expect(screen.getByText('Title')).toHaveClass('card__title');
    expect(screen.getByText('Desc')).toHaveClass('card__description');
    expect(screen.getByText('Content')).toHaveClass('card__content');
    expect(screen.getByText('Footer')).toHaveClass('card__footer');
    expect(screen.getByText('Title').closest('.card__header')).not.toBeNull();
  });

  it('forwards arbitrary props to the root element', () => {
    const { container } = render(<Card data-testid="c" aria-label="my card" />);
    const root = container.querySelector('.card');
    expect(root).toHaveAttribute('data-testid', 'c');
    expect(root).toHaveAttribute('aria-label', 'my card');
  });

  it('has no axe a11y violations', async () => {
    const { container } = render(
      <Card>
        <Card.Header>
          <Card.Title>Monthly report</Card.Title>
          <Card.Description>Summary of this month</Card.Description>
        </Card.Header>
        <Card.Content>Revenue is up 12%.</Card.Content>
        <Card.Footer>
          <button type="button">View details</button>
        </Card.Footer>
      </Card>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
