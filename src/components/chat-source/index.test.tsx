import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import ChatSource, { ChatSources } from './index';

describe('ChatSource', () => {
  it('has no axe a11y violations', async () => {
    const { container } = render(
      <>
        <ChatSource href="https://example.com" title="Example Source" />
        <ChatSource.Preview
          href="https://example.com/article"
          title="Example Article"
          description="A short description of the source."
        />
        <ChatSources defaultExpanded>
          <ChatSources.Trigger>3 sources</ChatSources.Trigger>
          <ChatSources.Content>
            <ChatSources.List>
              <ChatSource href="https://example.com" title="Example Source" />
            </ChatSources.List>
          </ChatSources.Content>
        </ChatSources>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('renders a navigable anchor trigger for the default url sourceType', () => {
    const { container } = render(<ChatSource href="https://example.com" title="Example Source" />);
    const anchor = container.querySelector('a.chat-source__trigger-link');
    expect(anchor).not.toBeNull();
    expect(anchor?.getAttribute('href')).toBe('https://example.com');
    expect(anchor?.getAttribute('target')).toBe('_blank');
    expect(anchor?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(container.querySelector('button.chat-source__trigger-link')).toBeNull();
  });

  it('falls back to the href domain when no title is provided', () => {
    const { container } = render(<ChatSource href="https://www.example.com/path" />);
    expect(container.querySelector('.chat-source__title')?.textContent).toBe('example.com');
  });

  it('renders a non-anchor button trigger for sourceType="document"', () => {
    const { container } = render(
      <ChatSource href="https://example.com/doc.pdf" title="Spec.pdf" sourceType="document" />,
    );
    // 文档来源不应是可导航锚点
    expect(container.querySelector('a')).toBeNull();
    const button = container.querySelector('button.chat-source__trigger-link');
    expect(button).not.toBeNull();
    expect(button?.getAttribute('href')).toBeNull();
    expect(button?.getAttribute('target')).toBeNull();
    // 文档图标取代 favicon/fallback
    expect(container.querySelector('.chat-source__document-icon')).not.toBeNull();
  });

  it('renders an <img> favicon via faviconUrl', () => {
    const { container } = render(
      <ChatSource href="https://example.com" title="Example" faviconUrl="https://example.com/favicon.ico" />,
    );
    const img = container.querySelector('img.chat-source__icon');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe('https://example.com/favicon.ico');
  });

  it('keeps the legacy iconSrc prop working as a faviconUrl alias', () => {
    const { container } = render(
      <ChatSource href="https://example.com" title="Example" iconSrc="https://example.com/legacy.ico" />,
    );
    expect(container.querySelector('img.chat-source__icon')?.getAttribute('src')).toBe(
      'https://example.com/legacy.ico',
    );
  });

  it('renders a custom fallback initial when no favicon is provided', () => {
    const { container } = render(
      <ChatSource href="https://example.com" title="Example" fallback="X" />,
    );
    const fallback = container.querySelector('.chat-source__icon-fallback');
    expect(fallback).not.toBeNull();
    expect(fallback?.textContent).toBe('X');
  });

  it('accepts custom children as the source composition', () => {
    const { container } = render(
      <ChatSource href="https://example.com" title="Example">
        <ChatSource.Trigger href="https://example.com">
          <ChatSource.Icon faviconUrl="https://example.com/f.ico" />
          <ChatSource.Title>Custom</ChatSource.Title>
        </ChatSource.Trigger>
      </ChatSource>,
    );
    expect(container.querySelector('.chat-source__title')?.textContent).toBe('Custom');
    expect(container.querySelector('img.chat-source__icon')).not.toBeNull();
  });

  it('does not leak a dead hover-card trigger slot (no real popover exists)', () => {
    const { container } = render(<ChatSource href="https://example.com" title="Example Source" />);
    expect(container.querySelector('.hover-card__trigger')).toBeNull();
    expect(container.querySelector('[data-slot="hover-card-trigger"]')).toBeNull();
  });
});

describe('ChatSource.Title', () => {
  it('renders as a <span>', () => {
    const { container } = render(<ChatSource.Title>Hello</ChatSource.Title>);
    expect(container.querySelector('span.chat-source__title')?.tagName).toBe('SPAN');
  });
});

describe('ChatSources (grouped disclosure)', () => {
  it('is collapsed by default and hides its content', () => {
    const { container } = render(
      <ChatSources>
        <ChatSources.Trigger>3 sources</ChatSources.Trigger>
        <ChatSources.Content>
          <ChatSources.List>
            <ChatSource href="https://example.com" title="Example" />
          </ChatSources.List>
        </ChatSources.Content>
      </ChatSources>,
    );
    const root = container.querySelector('.chat-sources');
    expect(root?.getAttribute('data-expanded')).toBe('false');
    const trigger = container.querySelector('button.chat-sources__trigger');
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    const content = container.querySelector('.chat-sources__content');
    expect(content?.hasAttribute('hidden')).toBe(true);
  });

  it('respects defaultExpanded', () => {
    const { container } = render(
      <ChatSources defaultExpanded>
        <ChatSources.Trigger>3 sources</ChatSources.Trigger>
        <ChatSources.Content>
          <ChatSources.List>
            <ChatSource href="https://example.com" title="Example" />
          </ChatSources.List>
        </ChatSources.Content>
      </ChatSources>,
    );
    expect(container.querySelector('.chat-sources')?.getAttribute('data-expanded')).toBe('true');
    expect(container.querySelector('button.chat-sources__trigger')?.getAttribute('aria-expanded')).toBe(
      'true',
    );
    expect(container.querySelector('.chat-sources__content')?.hasAttribute('hidden')).toBe(false);
  });

  it('wires the trigger aria-controls to the content id', () => {
    const { container } = render(
      <ChatSources defaultExpanded>
        <ChatSources.Trigger>sources</ChatSources.Trigger>
        <ChatSources.Content>
          <ChatSources.List />
        </ChatSources.Content>
      </ChatSources>,
    );
    const controls = container.querySelector('button.chat-sources__trigger')?.getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    expect(container.querySelector('.chat-sources__content')?.getAttribute('id')).toBe(controls);
  });

  it('renders the flex-wrapped source list', () => {
    const { container } = render(
      <ChatSources defaultExpanded>
        <ChatSources.Trigger>sources</ChatSources.Trigger>
        <ChatSources.Content>
          <ChatSources.List>
            <ChatSource href="https://a.com" title="A" />
            <ChatSource href="https://b.com" title="B" />
          </ChatSources.List>
        </ChatSources.Content>
      </ChatSources>,
    );
    expect(container.querySelector('.chat-sources__list')?.querySelectorAll('.chat-source').length).toBe(2);
  });

  it('has no axe a11y violations when expanded', async () => {
    const { container } = render(
      <ChatSources defaultExpanded>
        <ChatSources.Trigger>3 sources</ChatSources.Trigger>
        <ChatSources.Content>
          <ChatSources.List>
            <ChatSource href="https://example.com" title="Example" />
          </ChatSources.List>
        </ChatSources.Content>
      </ChatSources>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
