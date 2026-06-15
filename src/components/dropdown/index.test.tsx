import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dropdown from './index';
import MenuItem from '../menu-item';

const renderDropdown = (onAction = vi.fn()) =>
  render(
    <Dropdown>
      <Dropdown.Trigger>操作菜单</Dropdown.Trigger>
      <Dropdown.Popover placement="bottom">
        <Dropdown.Menu aria-label="操作菜单" onAction={onAction}>
          <MenuItem id="edit" textValue="编辑">
            <MenuItem.Label>编辑学员信息</MenuItem.Label>
          </MenuItem>
          <MenuItem id="export" textValue="导出">
            <MenuItem.Label>导出记录</MenuItem.Label>
          </MenuItem>
          <MenuItem id="delete" variant="danger" textValue="删除">
            <MenuItem.Label>删除学员</MenuItem.Label>
          </MenuItem>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>,
  );

describe('Dropdown', () => {
  it('renders trigger; menu items are not in DOM until opened', () => {
    renderDropdown();
    expect(screen.getByRole('button', { name: '操作菜单' })).toBeInTheDocument();
    expect(screen.queryByText('编辑学员信息')).not.toBeInTheDocument();
  });

  it('opens a menu (role=menu) with menuitems on trigger click', async () => {
    const user = userEvent.setup();
    renderDropdown();
    await user.click(screen.getByRole('button', { name: '操作菜单' }));

    const menu = await screen.findByRole('menu');
    expect(menu).toBeInTheDocument();
    expect(screen.getByText('编辑学员信息')).toBeInTheDocument();
    expect(screen.getAllByRole('menuitem')).toHaveLength(3);
  });

  it('fires onAction with the item id when an item is chosen', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    renderDropdown(onAction);
    await user.click(screen.getByRole('button', { name: '操作菜单' }));
    await screen.findByRole('menu');
    await user.click(screen.getByText('导出记录'));
    expect(onAction).toHaveBeenCalledWith('export');
  });

  it('trigger carries dropdown__trigger BEM class', () => {
    renderDropdown();
    expect(screen.getByRole('button', { name: '操作菜单' })).toHaveClass('dropdown__trigger');
  });
});
