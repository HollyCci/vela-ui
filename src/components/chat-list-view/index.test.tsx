import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import ChatListView from './index';

const renderList = (props?: Partial<React.ComponentProps<typeof ChatListView>>) =>
  render(
    <ChatListView aria-label="Conversations" selectionMode="single" {...props}>
      <ChatListView.Item id="a" textValue="Alpha">
        <ChatListView.ItemContent>
          <ChatListView.Icon />
          <ChatListView.Text>
            <ChatListView.Title>Alpha</ChatListView.Title>
            <ChatListView.Preview>Last message A</ChatListView.Preview>
          </ChatListView.Text>
          <ChatListView.Meta>2h</ChatListView.Meta>
        </ChatListView.ItemContent>
      </ChatListView.Item>
      <ChatListView.Item id="b" textValue="Bravo">
        <ChatListView.ItemContent>
          <ChatListView.Text>
            <ChatListView.Title>Bravo</ChatListView.Title>
          </ChatListView.Text>
        </ChatListView.ItemContent>
      </ChatListView.Item>
    </ChatListView>,
  );

describe('ChatListView', () => {
  it('renders a RAC grid with density class and data-slot', () => {
    renderList();
    const grid = screen.getByRole('grid', { name: 'Conversations' });
    expect(grid).toHaveAttribute('data-slot', 'chat-list-view');
    expect(grid).toHaveClass('chat-list-view');
    expect(grid).toHaveClass('chat-list-view--comfortable');
    expect(grid).toHaveClass('list-view');
  });

  it('applies compact density modifier', () => {
    renderList({ density: 'compact' });
    expect(screen.getByRole('grid')).toHaveClass('chat-list-view--compact');
  });

  it('renders items as rows with titles', () => {
    renderList();
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(2);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Bravo')).toBeInTheDocument();
  });

  it('Icon falls back to default svg when no children given', () => {
    renderList();
    const icon = document.querySelector('[data-slot="chat-list-view-icon"]');
    expect(icon).toBeInTheDocument();
    expect(icon?.querySelector('svg')).toBeInTheDocument();
  });

  it('selecting an item fires onSelectionChange and marks row selected', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderList({ onSelectionChange });
    const rows = screen.getAllByRole('row');
    await user.click(rows[0]);
    expect(onSelectionChange).toHaveBeenCalled();
    expect(rows[0]).toHaveAttribute('data-selected', 'true');
  });

  it('has no axe a11y violations', async () => {
    const { container } = renderList();
    expect(await axe(container)).toHaveNoViolations();
  });
});
