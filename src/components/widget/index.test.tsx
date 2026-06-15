import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Widget from './index';

describe('Widget', () => {
  it('renders root with data-slot and BEM class', () => {
    render(
      <Widget>
        <Widget.Title>Revenue</Widget.Title>
      </Widget>,
    );
    const root = document.querySelector('[data-slot="widget"]') as HTMLElement;
    expect(root).toBeInTheDocument();
    expect(root).toHaveClass('widget');
    expect(screen.getByText('Revenue')).toBeInTheDocument();
  });

  it('renders header/title/description/content/footer slots', () => {
    render(
      <Widget>
        <Widget.Header>
          <Widget.Title>Title</Widget.Title>
          <Widget.Description>Desc</Widget.Description>
        </Widget.Header>
        <Widget.Content>body</Widget.Content>
        <Widget.Footer>foot</Widget.Footer>
      </Widget>,
    );
    expect(document.querySelector('[data-slot="widget-header"]')).toBeInTheDocument();
    expect(document.querySelector('[data-slot="widget-title"]')).toHaveTextContent('Title');
    expect(document.querySelector('[data-slot="widget-description"]')).toHaveTextContent('Desc');
    expect(document.querySelector('[data-slot="widget-content"]')).toHaveTextContent('body');
    expect(document.querySelector('[data-slot="widget-footer"]')).toHaveTextContent('foot');
  });

  it('LegendItem renders a non-interactive div with colored dot + label by default', () => {
    render(
      <Widget.Legend>
        <Widget.LegendItem color="var(--chart-1)">Series A</Widget.LegendItem>
      </Widget.Legend>,
    );
    const item = document.querySelector('[data-slot="widget-legend-item"]') as HTMLElement;
    expect(item.tagName).toBe('DIV');
    expect(screen.getByText('Series A')).toBeInTheDocument();
    const dot = document.querySelector('[data-slot="widget-legend-item-dot"]') as HTMLElement;
    expect(dot.style.backgroundColor).toBe('var(--chart-1)');
  });

  it('LegendItem renders a real button and fires onClick when isPressable', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Widget.LegendItem color="var(--chart-2)" isPressable onClick={onClick}>
        Series B
      </Widget.LegendItem>,
    );
    const btn = screen.getByRole('button', { name: 'Series B' });
    expect(btn).toHaveAttribute('type', 'button');
    await user.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
