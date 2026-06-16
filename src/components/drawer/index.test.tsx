import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import Drawer from './index';

const renderDrawer = (props: Partial<React.ComponentProps<typeof Drawer>> = {}) =>
  render(
    <Drawer isOpen onClose={() => {}} placement="right" {...props}>
      <Drawer.Header>
        <Drawer.Heading>学员详情</Drawer.Heading>
      </Drawer.Header>
      <Drawer.Body>这里展示学习进度。</Drawer.Body>
      <Drawer.Footer>
        <button type="button">关闭抽屉</button>
      </Drawer.Footer>
    </Drawer>,
  );

describe('Drawer', () => {
  it('renders content (portal) with dialog role and data-slot when open', async () => {
    renderDrawer();
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('data-slot', 'drawer-dialog');
    expect(screen.getByText('学员详情')).toBeInTheDocument();
    expect(screen.getByText('这里展示学习进度。')).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    render(
      <Drawer isOpen={false} onClose={() => {}}>
        <Drawer.Body>隐藏</Drawer.Body>
      </Drawer>,
    );
    expect(screen.queryByText('隐藏')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onClose and onOpenChange(false) on Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onOpenChange = vi.fn();
    renderDrawer({ onClose, onOpenChange });
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('renders auto close trigger when onClose provided', async () => {
    renderDrawer();
    await screen.findByRole('dialog');
    expect(screen.getByRole('button', { name: '关闭' })).toBeInTheDocument();
  });

  it('renders handle when hasHandle is set', async () => {
    renderDrawer({ hasHandle: true });
    const dialog = await screen.findByRole('dialog');
    expect(dialog.querySelector('[data-slot="drawer-handle"]')).not.toBeNull();
  });

  it('applies top placement modifier on dialog', async () => {
    renderDrawer({ placement: 'top' });
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveClass('drawer__dialog--top');
  });

  it('has no axe a11y violations', async () => {
    // 打开态：dialog 由 Heading 提供可访问名，自动关闭按钮带 aria-label="关闭"。
    // 浮层经 portal 渲染，对 document.body 跑 axe 覆盖抽屉内容。
    renderDrawer();
    await screen.findByRole('dialog');
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
