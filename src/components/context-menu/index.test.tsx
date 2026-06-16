import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import ContextMenu from './index';

const renderMenu = (
  props: Partial<React.ComponentProps<typeof ContextMenu>> = {},
  onAction = vi.fn(),
) =>
  render(
    <ContextMenu {...props}>
      <ContextMenu.Trigger>
        <div>在此处右键</div>
      </ContextMenu.Trigger>
      <ContextMenu.Popover>
        <ContextMenu.Menu aria-label="操作" onAction={onAction}>
          <ContextMenu.Item id="back" textValue="后退">
            后退
          </ContextMenu.Item>
          <ContextMenu.Item id="forward" textValue="前进" isDisabled>
            前进
          </ContextMenu.Item>
          <ContextMenu.Item id="reload" textValue="重新加载">
            重新加载
          </ContextMenu.Item>
        </ContextMenu.Menu>
      </ContextMenu.Popover>
    </ContextMenu>,
  );

const rightClick = (el: Element) =>
  fireEvent.contextMenu(el, { clientX: 20, clientY: 20 });

describe('ContextMenu', () => {
  it('renders the trigger region with context-menu__trigger class', () => {
    renderMenu();
    const trigger = screen.getByText('在此处右键').closest('[data-slot="context-menu-trigger"]');
    expect(trigger).not.toBeNull();
    expect(trigger).toHaveClass('context-menu__trigger');
  });

  it('does not show menu items before a right-click', () => {
    renderMenu();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.queryByText('后退')).not.toBeInTheDocument();
  });

  it('opens the menu at the cursor on contextmenu (right-click)', async () => {
    renderMenu();
    const trigger = screen.getByText('在此处右键');
    rightClick(trigger);

    const menu = await screen.findByRole('menu');
    expect(menu).toBeInTheDocument();
    expect(screen.getByText('后退')).toBeInTheDocument();
    expect(screen.getAllByRole('menuitem')).toHaveLength(3);
  });

  it('contextmenu event default is prevented (suppresses native menu)', () => {
    renderMenu();
    const trigger = screen.getByText('在此处右键');
    const evt = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    Object.defineProperty(evt, 'clientX', { value: 20 });
    Object.defineProperty(evt, 'clientY', { value: 20 });
    trigger.dispatchEvent(evt);
    expect(evt.defaultPrevented).toBe(true);
  });

  it('does not open when isDisabled', () => {
    renderMenu({ isDisabled: true });
    rightClick(screen.getByText('在此处右键'));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('reports onOpenChange(true) when opened via right-click', () => {
    const onOpenChange = vi.fn();
    renderMenu({ onOpenChange });
    rightClick(screen.getByText('在此处右键'));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('controlled open renders the popover content', async () => {
    renderMenu({ open: true });
    expect(await screen.findByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('重新加载')).toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    renderMenu();
    rightClick(screen.getByText('在此处右键'));
    await screen.findByRole('menu');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('selecting an enabled item fires onAction and closes the menu', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    renderMenu({}, onAction);
    rightClick(screen.getByText('在此处右键'));
    await screen.findByRole('menu');

    await user.click(screen.getByText('重新加载'));
    expect(onAction).toHaveBeenCalledWith('reload');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('disabled item is marked aria-disabled and does not fire onAction', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    renderMenu({}, onAction);
    rightClick(screen.getByText('在此处右键'));
    await screen.findByRole('menu');

    const disabled = screen.getByText('前进').closest('[role="menuitem"]');
    expect(disabled).toHaveAttribute('aria-disabled', 'true');
    await user.click(screen.getByText('前进'));
    expect(onAction).not.toHaveBeenCalled();
  });

  it('has no axe a11y violations', async () => {
    // open 受控直接挂载浮层：Menu 带 aria-label="操作"，menuitem 有文本（含禁用项）。
    // 浮层经 RAC Popover portal，对 document.body 跑 axe 覆盖触发区 + 菜单。
    renderMenu({ open: true });
    await screen.findByRole('menu');
    // 关闭页面级 region 规则：context-menu 触发区文本未被 landmark 包裹，孤立测试缺页面容器，
    // 这是页面结构最佳实践（消费方页面的事），非组件自身缺陷。
    //
    // 预期此断言【失败】(aria-dialog-name)：ContextMenu.Popover 渲染裸 RAC <Popover>，
    // 内含可聚焦的 Menu，RAC 自动给浮层加 role="dialog" 但无 aria-label/aria-labelledby/title，
    // axe 命中 "ARIA dialog nodes should have an accessible name"。
    // 这是组件源码的真实可访问名缺陷（showcase demo 与本测试用法一致，均未给 Popover 名）——
    // 按铁律不改组件源码，保留断言让其失败、由主控集中在 context-menu/index.tsx 修复
    //（给 ContextMenuPopover 的 RAC Popover 补 aria-label，或与内层 Menu 的标签关联）。
    expect(
      await axe(document.body, { rules: { region: { enabled: false } } }),
    ).toHaveNoViolations();
  });
});
