import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import ChatSource from './index';

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
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('renders a navigable anchor for the default url sourceType', () => {
    const { container } = render(<ChatSource href="https://example.com" title="Example Source" />);
    const anchor = container.querySelector('a.chat-source__trigger-link');
    expect(anchor).not.toBeNull();
    expect(anchor?.getAttribute('href')).toBe('https://example.com');
    expect(anchor?.getAttribute('target')).toBe('_blank');
    expect(container.querySelector('button.chat-source__trigger-link')).toBeNull();
    expect(container.querySelector('[data-slot="chat-source"]')?.getAttribute('data-source-type')).toBe('url');
  });

  it('renders a non-anchor document card for sourceType="document"', () => {
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
    expect(container.querySelector('[data-slot="chat-source"]')?.getAttribute('data-source-type')).toBe('document');
  });

  it('surfaces confidence as a data attribute and a visible labeled marker', () => {
    const { container, getByText } = render(
      <ChatSource href="https://example.com" title="Example Source" confidence={0.9} />,
    );
    const root = container.querySelector('[data-slot="chat-source"]');
    expect(root?.getAttribute('data-confidence')).toBe('0.9');
    const marker = container.querySelector('[data-slot="chat-source-confidence"]');
    expect(marker).not.toBeNull();
    expect(marker?.getAttribute('data-confidence-level')).toBe('high');
    expect(getByText('高相关')).toBeTruthy();
  });

  it('omits confidence markup when no confidence is provided', () => {
    const { container } = render(<ChatSource href="https://example.com" title="Example Source" />);
    expect(container.querySelector('[data-slot="chat-source"]')?.getAttribute('data-confidence')).toBeNull();
    expect(container.querySelector('[data-slot="chat-source-confidence"]')).toBeNull();
  });

  it('does not leak a dead hover-card trigger slot (no real popover exists)', () => {
    const { container } = render(<ChatSource href="https://example.com" title="Example Source" />);
    // 不再渲染孤立的 hover-card__trigger 包裹，避免对外宣称不存在的浮层契约
    expect(container.querySelector('.hover-card__trigger')).toBeNull();
    expect(container.querySelector('[data-slot="hover-card-trigger"]')).toBeNull();
  });
});
