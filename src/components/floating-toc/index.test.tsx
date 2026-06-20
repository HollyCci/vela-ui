import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import FloatingToc from './index';

const ITEMS = [
  { key: 'intro', label: '简介', level: 1 },
  { key: 'usage', label: '用法', level: 1 },
  { key: 'api', label: 'API', level: 2 },
];

beforeEach(() => {
  // 根的滚动跟踪 effect 用到 rAF（jsdom 有），但 scrollIntoView 未实现 -> mock
  // 这里跟踪 window viewport（无 targetId），无需 IntersectionObserver。
  Element.prototype.scrollIntoView = vi.fn();
});

describe('FloatingToc', () => {
  it('Trigger renders as a focusable span (matches reference renders-as) with data-slot', () => {
    render(
      <FloatingToc items={ITEMS}>
        <FloatingToc.Trigger />
      </FloatingToc>,
    );
    const trigger = document.querySelector('[data-slot="floating-toc-trigger"]');
    expect(trigger).not.toBeNull();
    // 参考版 Trigger renders-as span，仅 native span 属性；无 button/role/aria-label/aria-expanded
    expect(trigger?.tagName).toBe('SPAN');
    expect(trigger).toHaveAttribute('tabindex', '0');
    expect(trigger).not.toHaveAttribute('type');
    expect(trigger).not.toHaveAttribute('aria-label');
    expect(trigger).not.toHaveAttribute('aria-expanded');
    expect(trigger).not.toHaveAttribute('role');
  });

  it('Trigger placement reflects root placement', () => {
    render(
      <FloatingToc items={ITEMS} placement="left">
        <FloatingToc.Trigger />
      </FloatingToc>,
    );
    expect(document.querySelector('[data-slot="floating-toc-trigger"]')).toHaveAttribute(
      'data-placement',
      'left',
    );
  });

  it('Bar marks active when its itemKey matches the default active key', () => {
    render(
      <FloatingToc items={ITEMS} defaultActiveKey="usage">
        {ITEMS.map((it) => (
          <FloatingToc.Bar key={it.key} itemKey={it.key} />
        ))}
      </FloatingToc>,
    );
    const bars = document.querySelectorAll('[data-slot="floating-toc-bar"]');
    expect(bars[0]).not.toHaveAttribute('data-active');
    expect(bars[1]).toHaveAttribute('data-active', 'true');
  });

  it('Item click scrolls to target and reports active change', async () => {
    const user = userEvent.setup();
    const onActiveChange = vi.fn();
    // 提供目标 DOM，scrollToItem 才会找到 element
    render(
      <>
        <div id="usage">用法章节</div>
        <FloatingToc items={ITEMS} defaultActiveKey="intro" onActiveChange={onActiveChange}>
          <FloatingToc.Item itemKey="usage">用法</FloatingToc.Item>
        </FloatingToc>
      </>,
    );
    await user.click(screen.getByRole('button', { name: '用法' }));
    expect(onActiveChange).toHaveBeenCalled();
    expect(onActiveChange.mock.calls[0][0]).toBe('usage');
  });

  it('Item falls back to item label from items map', () => {
    render(
      <FloatingToc items={ITEMS}>
        <FloatingToc.Item itemKey="api" />
      </FloatingToc>,
    );
    expect(screen.getByRole('button', { name: 'API' })).toBeInTheDocument();
  });

  it('press triggerMode toggles open via the controlled callback', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <FloatingToc items={ITEMS} triggerMode="press" open={false} onOpenChange={onOpenChange}>
        <FloatingToc.Trigger />
      </FloatingToc>,
    );
    const trigger = document.querySelector<HTMLSpanElement>(
      '[data-slot="floating-toc-trigger"]',
    );
    expect(trigger).not.toBeNull();
    await user.click(trigger as HTMLSpanElement);
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('has no axe a11y violations (trigger + open content)', async () => {
    render(
      <FloatingToc items={ITEMS} triggerMode="press" open onOpenChange={() => undefined}>
        <FloatingToc.Trigger />
        <FloatingToc.Content>
          {ITEMS.map((it) => (
            <FloatingToc.Item key={it.key} itemKey={it.key} />
          ))}
        </FloatingToc.Content>
      </FloatingToc>,
    );
    // Content 经 RAC Popover 走 portal，断言整个 document.body 以覆盖浮层内容
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
