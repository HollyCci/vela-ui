import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

afterEach(() => {
  // 清除按用例注入的 ResizeObserver stub，让“缺失环境”用例看到真实 jsdom（无 RO）
  vi.unstubAllGlobals();
});

describe('ChatConversation', () => {
  it('renders root viewport with role=log and data-slot', () => {
    render(
      <ChatConversation>
        <ChatConversation.Content>
          <div>Hi</div>
          <ChatConversation.ScrollAnchor />
        </ChatConversation.Content>
      </ChatConversation>,
    );
    const root = screen.getByRole('log');
    expect(root).toHaveAttribute('data-slot', 'chat-conversation');
    expect(root).toHaveClass('chat-conversation');
  });

  it('renders structural slots: content, scroll-anchor (messages are plain children, no wrapper)', () => {
    render(
      <ChatConversation>
        <ChatConversation.Content>
          <div>Hello</div>
          <div>World</div>
          <ChatConversation.ScrollAnchor />
        </ChatConversation.Content>
      </ChatConversation>,
    );
    const content = document.querySelector('[data-slot="chat-conversation-content"]');
    expect(content).toBeInTheDocument();
    expect(content).toHaveClass('chat-conversation__content');
    const anchor = document.querySelector('[data-slot="chat-conversation-scroll-anchor"]');
    expect(anchor).toBeInTheDocument();
    expect(anchor).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Hello')).toBeInTheDocument();
    // 参考版无 Messages/Message 包裹层：messages 直接作为 Content children，故无此类 data-slot。
    expect(
      document.querySelector('[data-slot="chat-conversation-messages"]'),
    ).not.toBeInTheDocument();
    expect(
      document.querySelector('[data-slot="chat-conversation-message"]'),
    ).not.toBeInTheDocument();
  });

  it('does not expose Messages / Message sub-components (parity with reference API)', () => {
    expect(
      (ChatConversation as unknown as Record<string, unknown>).Messages,
    ).toBeUndefined();
    expect(
      (ChatConversation as unknown as Record<string, unknown>).Message,
    ).toBeUndefined();
  });

  it('ScrollButton container reflects at-bottom state (hidden + disabled in jsdom)', () => {
    render(
      <ChatConversation>
        <ChatConversation.Content>
          <div>Hi</div>
          <ChatConversation.ScrollButton />
          <ChatConversation.ScrollAnchor />
        </ChatConversation.Content>
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

  it('wires a ResizeObserver on the viewport + content to keep at-bottom fresh on resize', () => {
    // jsdom 无 ResizeObserver：用可观测的 stub 注入，断言 effect 在可用时把它接到视口与内容节点上
    // （尺寸变化驱动贴底重评估 / 跟随，对照 MutationObserver 分支）。
    const instances: Array<{ cb: ResizeObserverCallback; observed: Element[]; disconnected: boolean }> =
      [];
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observed: Element[] = [];
        disconnected = false;
        constructor(public cb: ResizeObserverCallback) {
          instances.push(this);
        }
        observe(el: Element) {
          this.observed.push(el);
        }
        unobserve() {}
        disconnect() {
          this.disconnected = true;
        }
      },
    );

    const { unmount } = render(
      <ChatConversation>
        <ChatConversation.Content>
          <div>Hi</div>
          <ChatConversation.ScrollButton />
          <ChatConversation.ScrollAnchor />
        </ChatConversation.Content>
      </ChatConversation>,
    );

    expect(instances.length).toBe(1);
    const ro = instances[0];
    const viewport = screen.getByRole('log');
    const content = document.querySelector('[data-slot="chat-conversation-content"]');
    // 观测视口本身（容器 resize）与内层内容（内容撑高，如图片加载）。
    expect(ro.observed).toContain(viewport);
    expect(ro.observed).toContain(content);

    // 回调可被驱动（手动触发 resize 等价物）而不抛错——jsdom 下布局恒为 0 视为贴底，仅验证管线连通。
    expect(() => ro.cb([], ro as unknown as ResizeObserver)).not.toThrow();

    // 卸载时随 effect 清理一并断开。
    unmount();
    expect(ro.disconnected).toBe(true);
  });

  it('does not throw when ResizeObserver is unavailable (jsdom default)', () => {
    // 不注入 stub：确认 feature-detect 在缺失环境下静默跳过，不破坏挂载。
    expect(typeof ResizeObserver).toBe('undefined');
    expect(() =>
      render(
        <ChatConversation>
          <ChatConversation.Content>
            <div>Hi</div>
            <ChatConversation.ScrollAnchor />
          </ChatConversation.Content>
        </ChatConversation>,
      ),
    ).not.toThrow();
  });

  it('has no axe a11y violations', async () => {
    const { container } = render(
      <ChatConversation aria-label="Conversation">
        <ChatConversation.Content>
          <div>Hello</div>
          <div>World</div>
          <ChatConversation.ScrollButton />
          <ChatConversation.ScrollAnchor />
        </ChatConversation.Content>
      </ChatConversation>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
