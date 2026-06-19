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

  // 内层真锚点渲染当前测试集合（href 公共渲染）
  const renderHrefSidebar = (
    itemProps?: Record<string, unknown>,
    providerProps?: Record<string, unknown>,
  ) =>
    render(
      <Sidebar.Provider {...providerProps}>
        <Sidebar>
          <Sidebar.Content>
            <Sidebar.Menu aria-label="导航">
              <Sidebar.MenuItem id="home" textValue="首页" href="/app/home" {...itemProps}>
                <Sidebar.MenuItemContent>
                  <Sidebar.MenuLabel>首页</Sidebar.MenuLabel>
                </Sidebar.MenuItemContent>
              </Sidebar.MenuItem>
            </Sidebar.Menu>
          </Sidebar.Content>
        </Sidebar>
      </Sidebar.Provider>,
    );

  // 真锚点：带 href 的项在内容区渲染真实 <a href>，承担原生新标签/复制链接/状态栏 URL
  it('renders a real <a href> for MenuItem with href', () => {
    renderHrefSidebar();
    const anchor = document.querySelector('a[data-slot="sidebar-menu-item-content"]');
    expect(anchor).not.toBeNull();
    expect(anchor).toHaveAttribute('href', '/app/home');
    // 锚点沿用同一 slot/class，原有布局/态样式不变
    expect(anchor).toHaveClass('sidebar__menu-item-content');
  });

  // 无 href 项仍渲染普通 <div>（向后兼容，不引入多余锚点）
  it('renders a plain <div> content for MenuItem without href', () => {
    renderSidebar();
    const content = document.querySelector('[data-slot="sidebar-menu-item-content"]');
    expect(content?.tagName).toBe('DIV');
    expect(document.querySelector('a[data-slot="sidebar-menu-item-content"]')).toBeNull();
  });

  // 普通左键激活：阻止整页跳转、仍经 onAction → navigate 走 SPA
  it('plain activation navigates via onAction/navigate (no full reload)', async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();
    const onAction = vi.fn();
    renderHrefSidebar({ onAction }, { navigate });

    const anchor = document.querySelector('a[data-slot="sidebar-menu-item-content"]') as HTMLElement;
    await user.click(anchor);

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('/app/home');
  });

  // 修饰键点击：交给浏览器原生（新标签等），不再命令式 navigate，避免双跳
  it('modifier-click falls through to the browser without client navigation', async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();
    renderHrefSidebar(undefined, { navigate });

    const anchor = document.querySelector('a[data-slot="sidebar-menu-item-content"]') as HTMLElement;
    // 按住 Meta(⌘) 点击 → "在新标签打开"语义，组件应放行不调 navigate
    await user.keyboard('{Meta>}');
    await user.click(anchor);
    await user.keyboard('{/Meta}');

    expect(navigate).not.toHaveBeenCalled();
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
