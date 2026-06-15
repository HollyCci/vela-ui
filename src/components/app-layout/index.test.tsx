import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
});
