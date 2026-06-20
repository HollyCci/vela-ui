import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import AppLayout from './index';

// AppLayout 的 resizable 路径会用到 Resizable（react-resizable-panels），
// 这些 smoke 测试只走非 resizable（静态）路径，规避布局相关依赖。
beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    })),
  );
  // react-resizable-panels（resizable 路径）依赖 ResizeObserver 测量；jsdom 未实现，mock 之。
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

describe('AppLayout', () => {
  it('renders root, body and main with the expected data-slots', () => {
    render(
      <AppLayout navbar={<div>导航</div>} sidebar={<div>侧栏</div>}>
        <p>主内容</p>
      </AppLayout>,
    );
    expect(document.querySelector('[data-app-layout]')).not.toBeNull();
    expect(document.querySelector('[data-slot="app-layout-body"]')).not.toBeNull();
    expect(document.querySelector('[data-slot="app-layout-main"]')).not.toBeNull();
    expect(screen.getByText('主内容')).toBeInTheDocument();
    expect(screen.getByText('导航')).toBeInTheDocument();
    expect(screen.getByText('侧栏')).toBeInTheDocument();
  });

  it('reflects sidebar state via data attributes (default open)', () => {
    render(
      <AppLayout sidebar={<div>侧栏</div>}>
        <p>x</p>
      </AppLayout>,
    );
    const root = document.querySelector('[data-app-layout]');
    expect(root).toHaveAttribute('data-sidebar-state', 'expanded');
    expect(root).toHaveAttribute('data-sidebar-side', 'left');
  });

  it('MenuToggle opens the sidebar (calls setSidebarOpen(true))', async () => {
    const user = userEvent.setup();
    const onSidebarOpenChange = vi.fn();
    render(
      <AppLayout
        sidebar={<div>侧栏</div>}
        sidebarOpen={false}
        onSidebarOpenChange={onSidebarOpenChange}
      >
        <AppLayout.MenuToggle />
      </AppLayout>,
    );
    await user.click(screen.getByRole('button', { name: 'Open navigation' }));
    expect(onSidebarOpenChange).toHaveBeenCalledWith(true);
  });

  it('renders the mobile sidebar inside a Sheet overlay when opened below the breakpoint', async () => {
    // 模拟移动端视口：matchMedia(max-width:768) 命中 → 侧栏改走 Sheet 覆盖层
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
      <AppLayout sidebar={<div>侧栏内容</div>}>
        <AppLayout.MenuToggle />
      </AppLayout>,
    );

    // 初始未打开：不存在 sheet 对话框
    expect(document.querySelector('[data-slot="app-layout-mobile-sidebar-dialog"]')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Open navigation' }));

    // 打开后：侧栏渲染进 Sheet 覆盖层（带遮罩 + 可关闭对话框），而非静态 sidebar div
    const dialog = document.querySelector('[data-slot="app-layout-mobile-sidebar-dialog"]');
    expect(dialog).not.toBeNull();
    expect(document.querySelector('[data-slot="app-layout-mobile-sidebar"]')).not.toBeNull();
    expect(screen.getByRole('dialog', { name: 'Navigation menu' })).toBeInTheDocument();
  });

  it('AsideTrigger toggles aside and exposes aria-expanded + data-state', async () => {
    const user = userEvent.setup();
    const onAsideOpenChange = vi.fn();
    render(
      <AppLayout
        aside={<div>侧面板</div>}
        asideOpen={false}
        onAsideOpenChange={onAsideOpenChange}
      >
        <AppLayout.AsideTrigger />
      </AppLayout>,
    );
    const trigger = screen.getByRole('button', { name: 'Toggle aside panel' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('data-state', 'closed');

    await user.click(trigger);
    expect(onAsideOpenChange).toHaveBeenCalledWith(true);
  });

  it('renders aside region with open data-state when aside provided', () => {
    render(
      <AppLayout aside={<div>侧面板</div>} defaultAsideOpen>
        <p>x</p>
      </AppLayout>,
    );
    const asideRegion = document.querySelector('[data-slot="app-layout-aside"]');
    expect(asideRegion).toHaveAttribute('data-state', 'open');
  });

  it('content scroll mode sets data-scroll-mode and accessible main label', () => {
    render(
      <AppLayout scrollMode="content">
        <p>x</p>
      </AppLayout>,
    );
    const main = document.querySelector('[data-slot="app-layout-main"]');
    expect(main).toHaveAttribute('data-scroll-mode', 'content');
    expect(main).toHaveAttribute('aria-label', 'Scrollable main content');
  });

  it('emits resize-behavior data attributes when resizable (default preserve-relative-size)', () => {
    render(
      <AppLayout
        sidebar={<div>侧栏</div>}
        aside={<div>侧面板</div>}
        sidebarCollapsible="none"
        sidebarResizable
        asideResizable
      >
        <p>x</p>
      </AppLayout>,
    );
    const root = document.querySelector('[data-app-layout]');
    expect(root).toHaveAttribute('data-sidebar-resize-behavior', 'preserve-relative-size');
    expect(root).toHaveAttribute('data-aside-resize-behavior', 'preserve-relative-size');
  });

  it('honours an explicit resize-behavior and omits the attribute when not resizable', () => {
    const { rerender } = render(
      <AppLayout
        sidebar={<div>侧栏</div>}
        sidebarCollapsible="none"
        sidebarResizable
        sidebarResizeBehavior="preserve-pixel-size"
      >
        <p>x</p>
      </AppLayout>,
    );
    expect(document.querySelector('[data-app-layout]')).toHaveAttribute(
      'data-sidebar-resize-behavior',
      'preserve-pixel-size',
    );

    // 未启用 resizable 时不应 emit 该属性
    rerender(
      <AppLayout sidebar={<div>侧栏</div>}>
        <p>x</p>
      </AppLayout>,
    );
    expect(document.querySelector('[data-app-layout]')).not.toHaveAttribute(
      'data-sidebar-resize-behavior',
    );
  });

  it('accepts string size props alongside numeric ones (number | string parity)', () => {
    // 不应抛错：字符串尺寸被归一为百分比数值喂给引擎
    render(
      <AppLayout
        sidebar={<div>侧栏</div>}
        sidebarCollapsible="none"
        sidebarResizable
        sidebarDefaultSize="22%"
        sidebarMinSize="10%"
        sidebarMaxSize="35%"
      >
        <p>x</p>
      </AppLayout>,
    );
    expect(document.querySelector('[data-app-layout]')).not.toBeNull();
  });

  it('has no axe a11y violations', async () => {
    const { container } = render(
      <AppLayout navbar={<div>导航</div>} sidebar={<div>侧栏</div>}>
        <AppLayout.MenuToggle />
        <p>主内容</p>
      </AppLayout>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
