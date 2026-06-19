import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'vitest-axe';
import ChatAttachment from './index';

describe('ChatAttachment', () => {
  it('has no axe a11y violations', async () => {
    const { container } = render(
      <>
        <ChatAttachment
          name="diagram.png"
          kind="image"
          src="https://example.com/diagram.png"
          onRemove={vi.fn()}
        />
        <ChatAttachment name="report.pdf" kind="file" />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  describe('Input', () => {
    it('renders a real hidden multiple file input that accepts the given types', () => {
      render(
        <ChatAttachment.Input aria-label="选择附件" accept=".pdf,image/*" onSelect={vi.fn()} />,
      );

      const input = screen.getByLabelText('选择附件') as HTMLInputElement;
      expect(input.tagName).toBe('INPUT');
      expect(input.type).toBe('file');
      expect(input.multiple).toBe(true);
      expect(input.accept).toBe('.pdf,image/*');
      expect(input.dataset.slot).toBe('chat-attachment-input');
    });

    it('surfaces selected File objects via onSelect and clears its value', () => {
      const handleSelect = vi.fn();
      render(<ChatAttachment.Input aria-label="选择附件" onSelect={handleSelect} />);

      const input = screen.getByLabelText('选择附件') as HTMLInputElement;
      const file = new File(['hello'], 'notes.pdf', { type: 'application/pdf' });
      fireEvent.change(input, { target: { files: [file] } });

      expect(handleSelect).toHaveBeenCalledTimes(1);
      const selected = handleSelect.mock.calls[0][0] as File[];
      expect(Array.isArray(selected)).toBe(true);
      expect(selected[0]).toBe(file);
      // 与 RAC FileTrigger 一致：选取后清空 value
      expect(input.value).toBe('');
    });

    it('does not call onSelect when no file is chosen', () => {
      const handleSelect = vi.fn();
      render(<ChatAttachment.Input aria-label="选择附件" onSelect={handleSelect} />);

      const input = screen.getByLabelText('选择附件') as HTMLInputElement;
      fireEvent.change(input, { target: { files: [] } });

      expect(handleSelect).not.toHaveBeenCalled();
    });
  });

  describe('Group', () => {
    it('renders list/listitem semantics with an accessible label', () => {
      render(
        <ChatAttachment.Group label="附件分组">
          <ChatAttachment role="listitem" name="a.pdf" />
          <ChatAttachment role="listitem" name="b.pdf" />
        </ChatAttachment.Group>,
      );

      const list = screen.getByRole('list', { name: '附件分组' });
      expect(list.dataset.slot).toBe('chat-attachment-group');
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });
  });
});
