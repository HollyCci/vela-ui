import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import ChatListView from './index';

const renderList = (props?: Partial<React.ComponentProps<typeof ChatListView>>) =>
  render(
    <ChatListView aria-label="Conversations" selectionMode="single" {...props}>
      <ChatListView.Item id="a" textValue="Alpha">
        <ChatListView.Icon />
        <ChatListView.ItemContent>
          <ChatListView.Title>Alpha</ChatListView.Title>
          <ChatListView.Preview>Last message A</ChatListView.Preview>
        </ChatListView.ItemContent>
        <ChatListView.Meta>2h</ChatListView.Meta>
      </ChatListView.Item>
      <ChatListView.Item id="b" textValue="Bravo">
        <ChatListView.ItemContent>
          <ChatListView.Title>Bravo</ChatListView.Title>
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

  it('matches the reference row anatomy: Icon is a sibling of ItemContent (not nested)', () => {
    renderList();
    const icon = document.querySelector('[data-slot="chat-list-view-icon"]')!;
    const content = document.querySelector('[data-slot="chat-list-view-item-content"]')!;
    // 行结构与线上 Pro 版 Anatomy 一致：Icon 与 ItemContent 同级，同一父 row
    expect(icon.parentElement).toBe(content.parentElement);
    expect(content.contains(icon)).toBe(false);
    // ItemContent 只承载文本（Title + Preview），无嵌套 Icon
    expect(content.querySelector('[data-slot="chat-list-view-icon"]')).toBeNull();
  });

  it('emits the reference CSS class contract and renders-as elements', () => {
    renderList();
    const content = document.querySelector('[data-slot="chat-list-view-item-content"]')!;
    expect(content).toHaveClass('chat-list-view__item-content');
    expect(content.tagName).toBe('DIV');

    const icon = document.querySelector('[data-slot="chat-list-view-icon"]')!;
    expect(icon).toHaveClass('chat-list-view__icon');
    expect(icon.tagName).toBe('DIV');

    const title = document.querySelector('[data-slot="chat-list-view-title"]')!;
    expect(title).toHaveClass('chat-list-view__title');
    expect(title.tagName).toBe('SPAN');

    const preview = document.querySelector('[data-slot="chat-list-view-preview"]')!;
    expect(preview).toHaveClass('chat-list-view__preview');
    expect(preview.tagName).toBe('SPAN');

    const meta = document.querySelector('[data-slot="chat-list-view-meta"]')!;
    expect(meta).toHaveClass('chat-list-view__meta');
    expect(meta.tagName).toBe('DIV');
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
