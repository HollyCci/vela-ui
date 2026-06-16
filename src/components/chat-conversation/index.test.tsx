import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import ChatConversation from './index';

// jsdom 无真实滚动：scrollTo/scrollIntoView 未实现，getBoundingClientRect/scrollHeight 全 0，
// 所以 computeAtBottom 永远判为贴底（distance<=threshold）。这里只测结构/aria/data-slot/初始贴底语义，
// 不断言依赖布局的滚动位置。
beforeEach(() => {
  // 防止 scrollIntoView / scrollTo 在 jsdom 抛错
  Element.prototype.scrollIntoView = vi.fn();
  // @ts-expect-error jsdom 未实现 scrollTo
  Element.prototype.scrollTo = vi.fn();
});

describe('ChatConversation', () => {
  it('renders root viewport with role=log and data-slot', () => {
    render(
      <ChatConversation>
        <ChatConversation.Content>
          <ChatConversation.Messages>
            <ChatConversation.Message key="m1">Hi</ChatConversation.Message>
          </ChatConversation.Messages>
          <ChatConversation.ScrollAnchor />
        </ChatConversation.Content>
      </ChatConversation>,
    );
    const root = screen.getByRole('log');
    expect(root).toHaveAttribute('data-slot', 'chat-conversation');
    expect(root).toHaveClass('chat-conversation');
  });

  it('renders structural slots: content, messages, message, scroll-anchor', () => {
    render(
      <ChatConversation>
        <ChatConversation.Content>
          <ChatConversation.Messages>
            <ChatConversation.Message key="m1">Hello</ChatConversation.Message>
            <ChatConversation.Message key="m2">World</ChatConversation.Message>
          </ChatConversation.Messages>
          <ChatConversation.ScrollAnchor />
        </ChatConversation.Content>
      </ChatConversation>,
    );
    expect(document.querySelector('[data-slot="chat-conversation-content"]')).toBeInTheDocument();
    expect(document.querySelector('[data-slot="chat-conversation-messages"]')).toBeInTheDocument();
    expect(document.querySelectorAll('[data-slot="chat-conversation-message"]').length).toBe(2);
    const anchor = document.querySelector('[data-slot="chat-conversation-scroll-anchor"]');
    expect(anchor).toBeInTheDocument();
    expect(anchor).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('ScrollButton container reflects at-bottom state (hidden + disabled in jsdom)', () => {
    render(
      <ChatConversation>
        <ChatConversation.Content>
          <ChatConversation.Messages>
            <ChatConversation.Message key="m1">Hi</ChatConversation.Message>
          </ChatConversation.Messages>
          <ChatConversation.ScrollAnchor />
        </ChatConversation.Content>
        <ChatConversation.ScrollButton />
      </ChatConversation>,
    );
    // jsdom 下 scrollHeight/clientHeight 为 0 → 视为贴底；容器为 hidden，按钮 disabled。
    const container = document.querySelector(
      '[data-slot="chat-conversation-scroll-button-container"]',
    );
    expect(container).toHaveAttribute('data-state', 'hidden');
    // Tooltip.Trigger 会再包一层 role=button 包裹，故直接按 data-slot 取真实 <button>
    const btn = document.querySelector(
      'button[data-slot="chat-conversation-scroll-button"]',
    ) as HTMLButtonElement;
    expect(btn).toBeInTheDocument();
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-label', 'Scroll to bottom');
  });

  it('throws if ScrollAnchor is used outside ChatConversation', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<ChatConversation.ScrollAnchor />)).toThrow(
      /必须在 <ChatConversation> 内使用/,
    );
    spy.mockRestore();
  });

  it('has no axe a11y violations', async () => {
    const { container } = render(
      <ChatConversation aria-label="Conversation">
        <ChatConversation.Content>
          <ChatConversation.Messages>
            <ChatConversation.Message key="m1">Hello</ChatConversation.Message>
            <ChatConversation.Message key="m2">World</ChatConversation.Message>
          </ChatConversation.Messages>
          <ChatConversation.ScrollAnchor />
        </ChatConversation.Content>
        <ChatConversation.ScrollButton />
      </ChatConversation>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
