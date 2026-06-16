import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import Sidebar from './index';

// Provider 在 effect 里调用 window.matchMedia；Sidebar.Content 包了 HeroUI ScrollShadow，
// 它在挂载时 new ResizeObserver。两者 jsdom 都未实现，需 mock。
beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    })),
  );
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

const renderSidebar = (providerProps?: Record<string, unknown>) =>
  render(
    <Sidebar.Provider {...providerProps}>
      <Sidebar>
        <Sidebar.Header>头部</Sidebar.Header>
        <Sidebar.Content>
          <Sidebar.Group>
            <Sidebar.GroupLabel>导航</Sidebar.GroupLabel>
            <Sidebar.Menu aria-label="导航">
              <Sidebar.MenuItem id="home" textValue="首页" isCurrent>
                <Sidebar.MenuItemContent>
                  <Sidebar.MenuLabel>首页</Sidebar.MenuLabel>
                </Sidebar.MenuItemContent>
              </Sidebar.MenuItem>
            </Sidebar.Menu>
          </Sidebar.Group>
        </Sidebar.Content>
        <Sidebar.Rail />
      </Sidebar>
      <Sidebar.Main>
        <Sidebar.Trigger />
      </Sidebar.Main>
    </Sidebar.Provider>,
  );

describe('Sidebar', () => {
  // 回归：<Sidebar.Trigger> 渲染的按钮有默认 aria-label(非空)
  it('regression: Trigger button has a non-empty default aria-label', () => {
    renderSidebar();
    const trigger = document.querySelector('[data-slot="sidebar-trigger"]');
    expect(trigger).not.toBeNull();
    expect(trigger).toHaveAttribute('aria-label');
    expect((trigger as HTMLElement).getAttribute('aria-label')?.trim()).toBeTruthy();
  });

  it('renders provider/aside with expanded state by default', () => {
    renderSidebar();
    const provider = document.querySelector('[data-slot="sidebar-provider"]');
    expect(provider).toHaveAttribute('data-state', 'expanded');
    const aside = document.querySelector('[data-slot="sidebar"]');
    expect(aside).toHaveAttribute('data-state', 'expanded');
    expect(aside).toHaveAttribute('data-side', 'left');
  });

  it('Trigger toggles controlled open via onOpenChange', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderSidebar({ open: true, onOpenChange });

    // Rail 与 Trigger 都用 "Toggle sidebar" 作 aria-label，按 data-slot 取 Trigger
    const trigger = document.querySelector('[data-slot="sidebar-trigger"]') as HTMLElement;
    await user.click(trigger);
    // 受控：点击只触发回调（请求收起），不自行改 state
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('non-controlled Trigger collapses provider state on click', async () => {
    const user = userEvent.setup();
    renderSidebar({ defaultOpen: true });
    const provider = document.querySelector('[data-slot="sidebar-provider"]');
    expect(provider).toHaveAttribute('data-state', 'expanded');

    const trigger = document.querySelector('[data-slot="sidebar-trigger"]') as HTMLElement;
    await user.click(trigger);
    expect(provider).toHaveAttribute('data-state', 'collapsed');
  });

  it('Rail exposes a labelled toggle button', () => {
    renderSidebar();
    const rail = document.querySelector('[data-slot="sidebar-rail"]');
    expect(rail).toHaveAttribute('aria-label', 'Toggle sidebar');
  });

  it('current MenuItem carries data-current=true', () => {
    // 注：RAC TreeItem 渲染为 role="row" 且不转发 aria-current，组件用 data-current 标记当前项
    renderSidebar();
    const current = document.querySelector('[data-slot="sidebar-menu-item"][data-current="true"]');
    expect(current).not.toBeNull();
  });

  // 回归（deferred a11y）：移动端抽屉打开后焦点移入对话框，关闭后还回触发按钮
  it('mobile drawer moves focus inside on open and restores it on close', async () => {
    // 模拟移动端视口：matchMedia(max-width:768) 命中
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: true,
        media: query,
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false,
      })),
    );
    const user = userEvent.setup();
    render(
      <Sidebar.Provider>
        <Sidebar.Mobile>
          <button type="button">抽屉内按钮</button>
        </Sidebar.Mobile>
        <Sidebar.Main>
          <Sidebar.Trigger />
        </Sidebar.Main>
      </Sidebar.Provider>,
    );

    const trigger = document.querySelector('[data-slot="sidebar-trigger"]') as HTMLElement;
    trigger.focus();
    await user.click(trigger); // 移动端 → 打开 sheet

    const dialog = document.querySelector('[data-slot="sidebar-mobile-dialog"]') as HTMLElement;
    expect(dialog).not.toBeNull();
    // 焦点已移入抽屉、离开触发按钮（jsdom 无布局，可聚焦项被可见性过滤掉时回退聚焦 dialog 容器本身；
    // 真实浏览器里会落到抽屉内首个可聚焦元素——此处只稳健断言"焦点在抽屉内、不再停留在 trigger"）
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(trigger).not.toHaveFocus();

    // Escape 关闭 → 焦点还回触发按钮
    await user.keyboard('{Escape}');
    expect(trigger).toHaveFocus();
  });

  it('has no axe a11y violations', async () => {
    const { container } = renderSidebar();
    expect(await axe(container)).toHaveNoViolations();
  });
});
