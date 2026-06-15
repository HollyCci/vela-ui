import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AlertDialog from './index';

const renderAlert = (props: Partial<React.ComponentProps<typeof AlertDialog>> = {}) =>
  render(
    <AlertDialog {...props}>
      <AlertDialog.Trigger>删除记录</AlertDialog.Trigger>
      <AlertDialog.Backdrop isDismissable isKeyboardDismissDisabled={false}>
        <AlertDialog.Container size="xs">
          <AlertDialog.Dialog>
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>确认删除该辅导记录？</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>删除后无法恢复。</AlertDialog.Body>
            <AlertDialog.Footer>
              <button type="button">取消</button>
              <button type="button">确认删除</button>
            </AlertDialog.Footer>
            <AlertDialog.CloseTrigger aria-label="关闭" />
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>,
  );

describe('AlertDialog', () => {
  it('renders trigger; dialog content is not present until opened', () => {
    renderAlert();
    expect(screen.getByRole('button', { name: '删除记录' })).toBeInTheDocument();
    expect(screen.queryByText('确认删除该辅导记录？')).not.toBeInTheDocument();
  });

  it('opens the dialog (role=alertdialog) on trigger click', async () => {
    const user = userEvent.setup();
    renderAlert();
    await user.click(screen.getByRole('button', { name: '删除记录' }));

    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('确认删除该辅导记录？')).toBeInTheDocument();
    expect(screen.getByText('删除后无法恢复。')).toBeInTheDocument();
  });

  it('supports controlled isOpen and reports onOpenChange(false) when dismissed by Escape', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderAlert({ isOpen: true, onOpenChange });

    await screen.findByRole('alertdialog');
    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('renders a labelled close trigger inside the dialog', async () => {
    const user = userEvent.setup();
    renderAlert();
    await user.click(screen.getByRole('button', { name: '删除记录' }));
    await screen.findByRole('alertdialog');
    expect(screen.getByRole('button', { name: '关闭' })).toBeInTheDocument();
  });
});
