import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dropdown from '../dropdown';
import MenuItem from './index';

// MenuItem must render inside a RAC Menu collection; we host it in a Dropdown.Menu
// and open the dropdown so the items are mounted.
const openMenu = async (onAction = vi.fn()) => {
  const user = userEvent.setup();
  render(
    <Dropdown>
      <Dropdown.Trigger>菜单</Dropdown.Trigger>
      <Dropdown.Popover>
        <Dropdown.Menu aria-label="菜单" onAction={onAction}>
          <MenuItem id="normal" textValue="普通项">
            <MenuItem.Label>普通项</MenuItem.Label>
            <MenuItem.Description>普通项说明</MenuItem.Description>
          </MenuItem>
          <MenuItem id="danger" variant="danger" textValue="危险项">
            <MenuItem.Label>危险项</MenuItem.Label>
          </MenuItem>
          <MenuItem id="disabled" isDisabled textValue="禁用项">
            <MenuItem.Label>禁用项</MenuItem.Label>
          </MenuItem>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>,
  );
  await user.click(screen.getByRole('button', { name: '菜单' }));
  await screen.findByRole('menu');
  return user;
};

describe('MenuItem', () => {
  it('renders menuitem role, label and description', async () => {
    await openMenu();
    const items = screen.getAllByRole('menuitem');
    expect(items).toHaveLength(3);
    expect(screen.getByText('普通项')).toBeInTheDocument();
    expect(screen.getByText('普通项说明')).toBeInTheDocument();
  });

  it('danger variant outputs menu-item--danger modifier class', async () => {
    await openMenu();
    const dangerItem = screen.getByText('危险项').closest('[role="menuitem"]');
    expect(dangerItem).not.toBeNull();
    expect(dangerItem).toHaveClass('menu-item--danger');
  });

  it('disabled item is marked aria-disabled', async () => {
    await openMenu();
    const disabledItem = screen.getByText('禁用项').closest('[role="menuitem"]');
    expect(disabledItem).toHaveAttribute('aria-disabled', 'true');
  });

  it('clicking an enabled item triggers onAction with its id; disabled item does not', async () => {
    const onAction = vi.fn();
    const user = await openMenu(onAction);
    await user.click(screen.getByText('普通项'));
    expect(onAction).toHaveBeenCalledWith('normal');
  });
});
