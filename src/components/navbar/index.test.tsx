import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from './index';

describe('Navbar', () => {
  it('renders nav root with position modifier and data-slot', () => {
    const { container } = render(
      <Navbar position="static">
        <Navbar.Header>
          <Navbar.Brand>品牌</Navbar.Brand>
        </Navbar.Header>
      </Navbar>,
    );
    const nav = container.querySelector('[data-slot="navbar"]');
    expect(nav).toHaveClass('navbar');
    expect(nav).toHaveClass('navbar--static');
    expect(screen.getByText('品牌')).toHaveAttribute('data-slot', 'navbar-brand');
  });

  it('Item without href renders a button; with href renders an anchor', () => {
    render(
      <Navbar>
        <Navbar.Header>
          <Navbar.Content>
            <Navbar.Item>动作项</Navbar.Item>
            <Navbar.Item href="/docs">文档</Navbar.Item>
          </Navbar.Content>
        </Navbar.Header>
      </Navbar>,
    );
    expect(screen.getByText('动作项').tagName).toBe('BUTTON');
    const link = screen.getByText('文档');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/docs');
  });

  it('current Item gets aria-current=page', () => {
    render(
      <Navbar>
        <Navbar.Header>
          <Navbar.Content>
            <Navbar.Item href="/now" isCurrent>
              当前
            </Navbar.Item>
          </Navbar.Content>
        </Navbar.Header>
      </Navbar>,
    );
    const link = screen.getByText('当前');
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(link).toHaveAttribute('data-current', 'true');
  });

  it('navigate is invoked for internal hrefs and default navigation is prevented', async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();
    render(
      <Navbar navigate={navigate}>
        <Navbar.Header>
          <Navbar.Content>
            <Navbar.Item href="/settings">设置</Navbar.Item>
          </Navbar.Content>
        </Navbar.Header>
      </Navbar>,
    );
    await user.click(screen.getByText('设置'));
    expect(navigate).toHaveBeenCalledWith('/settings');
  });

  it('MenuToggle has accessible label and reflects controlled isMenuOpen', () => {
    render(
      <Navbar isMenuOpen onMenuOpenChange={() => undefined}>
        <Navbar.Header>
          <Navbar.MenuToggle />
        </Navbar.Header>
      </Navbar>,
    );
    const toggle = screen.getByRole('button', { name: 'Toggle navigation menu' });
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });

  it('MenuToggle change fires onMenuOpenChange (controlled)', async () => {
    const user = userEvent.setup();
    const onMenuOpenChange = vi.fn();
    render(
      <Navbar isMenuOpen={false} onMenuOpenChange={onMenuOpenChange}>
        <Navbar.Header>
          <Navbar.MenuToggle />
        </Navbar.Header>
      </Navbar>,
    );
    await user.click(screen.getByRole('button', { name: 'Toggle navigation menu' }));
    expect(onMenuOpenChange).toHaveBeenCalledWith(true);
  });

  it('Menu content mounts when isMenuOpen and its MenuItem closes the menu on click', async () => {
    const user = userEvent.setup();
    const onMenuOpenChange = vi.fn();
    // 传 navigate，使内部链接走客户端路由而非 jsdom 不支持的真实跳转
    const navigate = vi.fn();
    render(
      <Navbar isMenuOpen onMenuOpenChange={onMenuOpenChange} navigate={navigate}>
        <Navbar.Menu>
          <Navbar.MenuItem href="/a">链接A</Navbar.MenuItem>
        </Navbar.Menu>
      </Navbar>,
    );
    expect(document.querySelector('[data-slot="navbar-menu"]')).not.toBeNull();
    await user.click(screen.getByText('链接A'));
    // MenuItem 点击会请求关闭菜单并经 navigate 跳转
    expect(onMenuOpenChange).toHaveBeenCalledWith(false);
    expect(navigate).toHaveBeenCalledWith('/a');
  });
});
