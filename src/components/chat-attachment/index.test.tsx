import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'vitest-axe';
import ChatAttachment, { ChatAttachmentInput, ChatAttachmentGroup } from './index';

describe('ChatAttachment', () => {
  it('has no axe a11y violations', async () => {
    const { container } = render(
      <>
        <ChatAttachment
          name="diagram.png"
          mediaType="image"
          src="https://example.com/diagram.png"
          onRemove={vi.fn()}
        />
        <ChatAttachment name="report.pdf" mimeType="application/pdf" />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('infers mediaType from mimeType and emits data-media-type', () => {
    const { rerender } = render(<ChatAttachment data-testid="att" name="a.pdf" mimeType="application/pdf" />);
    expect(screen.getByTestId('att').dataset.mediaType).toBe('document');

    rerender(<ChatAttachment data-testid="att" name="a.mp3" mimeType="audio/mpeg" />);
    expect(screen.getByTestId('att').dataset.mediaType).toBe('audio');

    rerender(<ChatAttachment data-testid="att" name="a.png" mimeType="image/png" />);
    expect(screen.getByTestId('att').dataset.mediaType).toBe('image');
  });

  it('emits data-media-type=unknown when neither mediaType nor mimeType is given', () => {
    render(<ChatAttachment data-testid="att" name="mystery" />);
    expect(screen.getByTestId('att').dataset.mediaType).toBe('unknown');
  });

  it('explicit mediaType wins over mimeType inference', () => {
    render(<ChatAttachment data-testid="att" name="x" mediaType="video" mimeType="application/pdf" />);
    expect(screen.getByTestId('att').dataset.mediaType).toBe('video');
  });

  it('maps the legacy kind prop to mediaType (file -> document)', () => {
    render(<ChatAttachment data-testid="att" name="x.pdf" kind="file" />);
    expect(screen.getByTestId('att').dataset.mediaType).toBe('document');
  });

  it('renders an <img> preview for image attachments with src', () => {
    render(<ChatAttachment name="shot.png" mediaType="image" src="https://example.com/shot.png" />);
    const img = screen.getByRole('img');
    expect(img.tagName).toBe('IMG');
    expect(img.getAttribute('src')).toBe('https://example.com/shot.png');
    expect(img).toHaveClass('chat-attachment__preview-image');
  });

  it('renders the default Remove button only when onRemove is provided', () => {
    const handleRemove = vi.fn();
    const { rerender } = render(<ChatAttachment name="x.pdf" onRemove={handleRemove} />);
    const button = screen.getByRole('button', { name: 'Remove attachment x.pdf' });
    expect(button.tagName).toBe('BUTTON');
    expect(button.dataset.slot).toBe('chat-attachment-remove');
    fireEvent.click(button);
    expect(handleRemove).toHaveBeenCalledTimes(1);

    rerender(<ChatAttachment name="x.pdf" />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders custom children instead of the default preview/remove', () => {
    render(
      <ChatAttachment name="custom" data-testid="att">
        <ChatAttachment.Preview mediaType="document" />
        <ChatAttachment.Remove aria-label="dismiss" />
      </ChatAttachment>,
    );
    // no auto name span when children override
    expect(screen.getByRole('button', { name: 'dismiss' })).toBeTruthy();
  });

  describe('Preview', () => {
    it('renders a video element for video mediaType with src', () => {
      const { container } = render(<ChatAttachment.Preview mediaType="video" src="https://example.com/v.mp4" />);
      expect(container.querySelector('video.chat-attachment__preview-video')).toBeTruthy();
    });

    it('renders a fallback span (with default icon) for document/audio/unknown', () => {
      const { container } = render(<ChatAttachment.Preview mediaType="document" />);
      const fallback = container.querySelector('.chat-attachment__preview-fallback');
      expect(fallback).toBeTruthy();
      expect(fallback?.querySelector('svg')).toBeTruthy();
    });

    it('honors a custom fallbackIcon', () => {
      const { container } = render(<ChatAttachment.Preview mediaType="document" fallbackIcon="PDF" />);
      expect(container.querySelector('.chat-attachment__preview-fallback')?.textContent).toBe('PDF');
    });

    it('renders children to fully replace preview content', () => {
      render(<ChatAttachment.Preview mediaType="image">custom node</ChatAttachment.Preview>);
      expect(screen.getByText('custom node')).toBeTruthy();
    });
  });

  describe('Remove', () => {
    it('wraps a real Button with the remove slot and forwards onRemove via click', () => {
      const handleRemove = vi.fn();
      render(<ChatAttachment.Remove aria-label="remove it" onRemove={handleRemove} />);
      const button = screen.getByRole('button', { name: 'remove it' });
      expect(button.dataset.slot).toBe('chat-attachment-remove');
      fireEvent.click(button);
      expect(handleRemove).toHaveBeenCalledTimes(1);
    });
  });

  describe('Input', () => {
    it('renders a real hidden multiple file input that accepts the given types', () => {
      render(<ChatAttachmentInput aria-label="选择附件" accept=".pdf,image/*" onFilesSelected={vi.fn()} />);

      const input = screen.getByLabelText('选择附件') as HTMLInputElement;
      expect(input.tagName).toBe('INPUT');
      expect(input.type).toBe('file');
      expect(input.multiple).toBe(true);
      expect(input.accept).toBe('.pdf,image/*');
      expect(input.dataset.slot).toBe('chat-attachment-input');
    });

    it('surfaces selected File objects via onFilesSelected and clears its value', () => {
      const handleSelect = vi.fn();
      render(<ChatAttachmentInput aria-label="选择附件" onFilesSelected={handleSelect} />);

      const input = screen.getByLabelText('选择附件') as HTMLInputElement;
      const file = new File(['hello'], 'notes.pdf', { type: 'application/pdf' });
      fireEvent.change(input, { target: { files: [file] } });

      expect(handleSelect).toHaveBeenCalledTimes(1);
      const selected = handleSelect.mock.calls[0][0] as File[];
      expect(Array.isArray(selected)).toBe(true);
      expect(selected[0]).toBe(file);
      expect(input.value).toBe('');
    });

    it('still supports the legacy onSelect alias', () => {
      const handleSelect = vi.fn();
      render(<ChatAttachment.Input aria-label="附件" onSelect={handleSelect} />);
      const input = screen.getByLabelText('附件') as HTMLInputElement;
      const file = new File(['x'], 'a.pdf', { type: 'application/pdf' });
      fireEvent.change(input, { target: { files: [file] } });
      expect(handleSelect).toHaveBeenCalledTimes(1);
    });

    it('does not call onFilesSelected when no file is chosen', () => {
      const handleSelect = vi.fn();
      render(<ChatAttachmentInput aria-label="选择附件" onFilesSelected={handleSelect} />);

      const input = screen.getByLabelText('选择附件') as HTMLInputElement;
      fireEvent.change(input, { target: { files: [] } });

      expect(handleSelect).not.toHaveBeenCalled();
    });

    it('renders a trigger via the render prop that opens the file dialog', () => {
      const clickSpy = vi
        .spyOn(HTMLInputElement.prototype, 'click')
        .mockImplementation(() => {});
      render(
        <ChatAttachmentInput
          aria-label="附件"
          onFilesSelected={vi.fn()}
          render={({ onPress }) => (
            <button type="button" onClick={onPress}>
              add
            </button>
          )}
        />,
      );
      fireEvent.click(screen.getByRole('button', { name: 'add' }));
      expect(clickSpy).toHaveBeenCalled();
      clickSpy.mockRestore();
    });

    it('Dropzone surfaces dropped files via onFilesSelected', () => {
      const handleSelect = vi.fn();
      render(
        <ChatAttachmentInput.Dropzone onFilesSelected={handleSelect} data-testid="dz">
          drop here
        </ChatAttachmentInput.Dropzone>,
      );
      const dz = screen.getByTestId('dz');
      const file = new File(['x'], 'a.pdf', { type: 'application/pdf' });
      fireEvent.drop(dz, { dataTransfer: { files: [file], types: ['Files'] } });
      expect(handleSelect).toHaveBeenCalledTimes(1);
      expect(handleSelect.mock.calls[0][0][0]).toBe(file);
    });
  });

  describe('Group', () => {
    it('renders list/listitem semantics with an accessible label', () => {
      render(
        <ChatAttachmentGroup label="附件分组">
          <ChatAttachment role="listitem" name="a.pdf" />
          <ChatAttachment role="listitem" name="b.pdf" />
        </ChatAttachmentGroup>,
      );

      const list = screen.getByRole('list', { name: '附件分组' });
      expect(list.dataset.slot).toBe('chat-attachment-group');
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });

    it('is also reachable as ChatAttachment.Group (back-compat)', () => {
      render(
        <ChatAttachment.Group label="g">
          <ChatAttachment role="listitem" name="a.pdf" />
        </ChatAttachment.Group>,
      );
      expect(screen.getByRole('list', { name: 'g' })).toBeTruthy();
    });
  });
});
