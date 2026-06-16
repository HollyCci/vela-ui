import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import Modal from './index';

const renderModal = (props: Partial<React.ComponentProps<typeof Modal>> = {}) =>
  render(
    <Modal isOpen onClose={() => {}} {...props}>
      <Modal.Header>
        <Modal.Heading>确认提交</Modal.Heading>
      </Modal.Header>
      <Modal.Body>提交后将通知相关老师。</Modal.Body>
      <Modal.Footer>
        <button type="button">取消</button>
      </Modal.Footer>
    </Modal>,
  );

describe('Modal', () => {
  it('renders content (portal) with dialog role and data-slots when open', async () => {
    renderModal();
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('data-slot', 'modal-dialog');
    expect(screen.getByText('确认提交')).toBeInTheDocument();
    expect(screen.getByText('提交后将通知相关老师。')).toBeInTheDocument();
  });

  it('does not render dialog content when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}}>
        <Modal.Body>隐藏内容</Modal.Body>
      </Modal>,
    );
    expect(screen.queryByText('隐藏内容')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders auto close trigger (because onClose provided) and calls onClose on Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal({ onClose });
    await screen.findByRole('dialog');
    // an auto-injected close trigger labelled 关闭 exists
    expect(screen.getByRole('button', { name: '关闭' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('forwards onOpenChange(false) and onClose together when dismissed', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onClose = vi.fn();
    renderModal({ onOpenChange, onClose });
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onClose).toHaveBeenCalled();
  });

  it('applies full-size container modifier class', async () => {
    renderModal({ size: 'full' });
    const dialog = await screen.findByRole('dialog');
    const container = dialog.closest('[data-slot="modal-container"]');
    expect(container).not.toBeNull();
    expect(container).toHaveClass('modal__container--full');
  });

  it('has no axe a11y violations', async () => {
    // 打开态：dialog 由 Heading 提供可访问名，自动关闭按钮带 aria-label="关闭"。
    // portal 渲染到 document.body 之外，故对 document.body 跑 axe 以覆盖浮层内容。
    renderModal();
    await screen.findByRole('dialog');
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
