import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import DropZone, { useDropZoneQueue, type DropZoneUploadQueueItem } from './index';

const makeFile = (name: string, type = 'application/pdf', bytes = 1024) =>
  new File([new Uint8Array(bytes)], name, { type });

// Headless probe to drive the queue API imperatively in tests.
const QueueProbe = ({ onReady }: { onReady: (api: ReturnType<typeof useDropZoneQueue>) => void }) => {
  const api = useDropZoneQueue();
  onReady(api);
  return <div data-testid="probe-count">{api.files.length}</div>;
};

describe('DropZone', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });

  it('renders root + area + label + trigger with data-slots and classes', () => {
    const { container } = render(
      <DropZone>
        <DropZone.Area>
          <DropZone.Icon />
          <DropZone.Label>Drop files</DropZone.Label>
          <DropZone.Description>PDF up to 20MB</DropZone.Description>
          <DropZone.Trigger />
          <DropZone.Input />
        </DropZone.Area>
      </DropZone>,
    );
    expect(container.querySelector('[data-slot="drop-zone"]')).toHaveClass('drop-zone');
    expect(container.querySelector('[data-slot="drop-zone-area"]')).toHaveClass('drop-zone__area');
    expect(container.querySelector('[data-slot="drop-zone-label"]')).toHaveTextContent('Drop files');
    expect(screen.getByRole('button', { name: 'Select files' })).toBeInTheDocument();
    // hidden file input
    const input = container.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('data-slot', 'drop-zone-input');
  });

  it('isDisabled marks root data-disabled/aria-disabled and disables input + trigger', () => {
    const { container } = render(
      <DropZone isDisabled>
        <DropZone.Area>
          <DropZone.Trigger />
          <DropZone.Input />
        </DropZone.Area>
      </DropZone>,
    );
    const root = container.querySelector('[data-slot="drop-zone"]') as HTMLElement;
    expect(root).toHaveAttribute('data-disabled', 'true');
    expect(root).toHaveAttribute('aria-disabled', 'true');
    expect(container.querySelector('input[type="file"]')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Select files' })).toBeDisabled();
  });

  it('selecting files via the hidden input calls onSelect and enqueues complete items (simulateUpload off)', () => {
    const onSelect = vi.fn();
    const onQueueChange = vi.fn();
    const { container } = render(
      <DropZone simulateUpload={false} onQueueChange={onQueueChange}>
        <DropZone.Area>
          <DropZone.Input onSelect={onSelect} />
        </DropZone.Area>
        <DropZone.FileQueue empty={<span data-testid="empty">No files</span>} />
      </DropZone>,
    );

    expect(screen.getByTestId('empty')).toBeInTheDocument();

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile('report.pdf');
    fireEvent.change(input, { target: { files: [file] } });

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onQueueChange).toHaveBeenCalled();
    const lastQueue = onQueueChange.mock.calls.at(-1)?.[0] as DropZoneUploadQueueItem[];
    expect(lastQueue).toHaveLength(1);
    expect(lastQueue[0]).toMatchObject({
      name: 'report.pdf',
      format: 'PDF',
      color: 'orange',
      status: 'complete',
      progress: 100,
    });

    // rendered file item + name + remove button
    expect(screen.getByText('report.pdf')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '移除 report.pdf' })).toBeInTheDocument();
  });

  it('input change clears value so the same file can be reselected', () => {
    const { container } = render(
      <DropZone simulateUpload={false}>
        <DropZone.Area>
          <DropZone.Input />
        </DropZone.Area>
      </DropZone>,
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile('a.pdf')] } });
    expect(input.value).toBe('');
  });

  it('root accept/maxSize are inherited by input and validate queued input files', () => {
    let api!: ReturnType<typeof useDropZoneQueue>;
    const { container } = render(
      <DropZone accept=".pdf,image/*" maxSize={2048} simulateUpload={false}>
        <QueueProbe onReady={(a) => (api = a)} />
        <DropZone.Area>
          <DropZone.Input />
        </DropZone.Area>
        <DropZone.FileQueue />
      </DropZone>,
    );

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toHaveAttribute('accept', '.pdf,image/*');

    fireEvent.change(input, {
      target: {
        files: [
          makeFile('ok.pdf', 'application/pdf', 1024),
          makeFile('large.png', 'image/png', 4096),
          makeFile('notes.txt', 'text/plain', 512),
        ],
      },
    });

    expect(api.files).toHaveLength(3);
    expect(api.files[0]).toMatchObject({ name: 'ok.pdf', status: 'complete', progress: 100 });
    expect(api.files[1]).toMatchObject({
      name: 'large.png',
      status: 'failed',
      color: 'red',
      progress: 0,
    });
    expect(api.files[1].error).toContain('文件大小不能超过');
    expect(api.files[2]).toMatchObject({
      name: 'notes.txt',
      status: 'failed',
      color: 'red',
      error: '不支持的文件类型：.pdf,image/*',
    });
  });

  it('disabled input does not enqueue files on change', () => {
    const onQueueChange = vi.fn();
    const { container } = render(
      <DropZone isDisabled simulateUpload={false} onQueueChange={onQueueChange}>
        <DropZone.Area>
          <DropZone.Input />
        </DropZone.Area>
      </DropZone>,
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile('a.pdf')] } });
    expect(onQueueChange).not.toHaveBeenCalled();
  });

  it('validateFile failure marks the item failed/red with the error message', () => {
    let api!: ReturnType<typeof useDropZoneQueue>;
    render(
      <DropZone simulateUpload={false} validateFile={() => 'too big'}>
        <QueueProbe onReady={(a) => (api = a)} />
      </DropZone>,
    );

    act(() => api.addFiles([{ name: 'huge.zip' }]));
    expect(api.files).toHaveLength(1);
    expect(api.files[0]).toMatchObject({
      name: 'huge.zip',
      format: 'ZIP',
      status: 'failed',
      color: 'red',
      error: 'too big',
      progress: 0,
    });
  });

  it('queue validation also applies to files added from a drop source', () => {
    let api!: ReturnType<typeof useDropZoneQueue>;
    render(
      <DropZone accept=".pdf" maxSize={1024} simulateUpload={false}>
        <QueueProbe onReady={(a) => (api = a)} />
      </DropZone>,
    );

    act(() => {
      api.addFiles(
        [
          { name: 'drop.pdf', type: 'application/pdf', size: 512 },
          { name: 'drop.txt', type: 'text/plain', size: 512 },
        ],
        { source: 'drop' },
      );
    });

    expect(api.files).toHaveLength(2);
    expect(api.files[0]).toMatchObject({ name: 'drop.pdf', source: 'drop', status: 'complete' });
    expect(api.files[1]).toMatchObject({
      name: 'drop.txt',
      source: 'drop',
      status: 'failed',
      error: '不支持的文件类型：.pdf',
    });
  });

  it('queue API: addFiles, removeFile, clearQueue update the rendered queue', () => {
    let api!: ReturnType<typeof useDropZoneQueue>;
    render(
      <DropZone simulateUpload={false}>
        <QueueProbe onReady={(a) => (api = a)} />
      </DropZone>,
    );

    act(() => api.addFiles([{ name: 'a.csv' }, { name: 'b.docx' }]));
    expect(api.files).toHaveLength(2);
    expect(api.files.map((f) => f.format)).toEqual(['CSV', 'DOCX']);
    // green for spreadsheet, blue for doc
    expect(api.files[0].color).toBe('green');
    expect(api.files[1].color).toBe('blue');

    const firstId = api.files[0].id;
    act(() => api.removeFile(firstId));
    expect(api.files.map((f) => f.name)).toEqual(['b.docx']);

    act(() => api.clearQueue());
    expect(api.files).toHaveLength(0);
  });

  it('replace option / replaceQueueOnAdd swaps the queue instead of appending', () => {
    let api!: ReturnType<typeof useDropZoneQueue>;
    render(
      <DropZone simulateUpload={false}>
        <QueueProbe onReady={(a) => (api = a)} />
      </DropZone>,
    );

    act(() => api.addFiles([{ name: 'old.pdf' }]));
    act(() => api.addFiles([{ name: 'new.pdf' }], { replace: true }));
    expect(api.files).toHaveLength(1);
    expect(api.files[0].name).toBe('new.pdf');
  });

  it('controlled queue renders provided items and FileQueue lists them', () => {
    const item: DropZoneUploadQueueItem = {
      id: 'x1',
      name: 'manual.pdf',
      size: 2048,
      type: 'application/pdf',
      format: 'PDF',
      color: 'orange',
      status: 'complete',
      progress: 100,
      canRetry: false,
      attempt: 1,
      source: 'api',
      createdAt: 0,
      updatedAt: 0,
    };
    render(
      <DropZone queue={[item]} onQueueChange={() => undefined}>
        <DropZone.FileQueue />
      </DropZone>,
    );
    const fileItem = screen.getByText('manual.pdf').closest('[data-slot="drop-zone-file-item"]');
    expect(fileItem).toHaveAttribute('data-status', 'complete');
  });

  it('failed item with canRetry renders a retry button that calls retryFile', async () => {
    const user = userEvent.setup();
    const onQueueChange = vi.fn();
    const failed: DropZoneUploadQueueItem = {
      id: 'f1',
      name: 'bad.doc',
      size: 1024,
      format: 'DOC',
      color: 'red',
      status: 'failed',
      progress: 100,
      error: '上传失败',
      canRetry: true,
      attempt: 1,
      source: 'api',
      createdAt: 0,
      updatedAt: 0,
    };
    render(
      <DropZone queue={[failed]} simulateUpload={false} onQueueChange={onQueueChange}>
        <DropZone.FileQueue />
      </DropZone>,
    );

    const retry = screen.getByRole('button', { name: '重试' });
    await user.click(retry);
    // retry transitions failed -> complete (simulateUpload off) and bumps attempt
    const next = onQueueChange.mock.calls.at(-1)?.[0] as DropZoneUploadQueueItem[];
    expect(next[0]).toMatchObject({ status: 'complete', attempt: 2 });
  });

  it('FileFormatIcon renders the format badge with the color data attribute', () => {
    const { container } = render(<DropZone.FileFormatIcon format="PDF" color="orange" />);
    const badge = container.querySelector('[data-slot="drop-zone-file-format-icon-badge"]');
    expect(badge).toHaveTextContent('PDF');
    expect(badge).toHaveAttribute('data-color', 'orange');
  });

  it('has no axe a11y violations', async () => {
    // RAC DropZone area is labelled by DropZone.Label (slot="label"); the visually-hidden
    // file input has no implicit label, so a consumer must supply aria-label (jsdom can't
    // see it's CSS-hidden, so axe would otherwise flag the missing field name).
    const { container } = render(
      <DropZone simulateUpload={false}>
        <DropZone.Area>
          <DropZone.Icon />
          <DropZone.Label>Drop files here</DropZone.Label>
          <DropZone.Description>PDF up to 20MB</DropZone.Description>
          <DropZone.Trigger />
          <DropZone.Input aria-label="Upload files" />
        </DropZone.Area>
        <DropZone.FileQueue empty={<span>No files</span>} />
      </DropZone>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  describe('simulated upload (fake timers)', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('advances progress over intervals and reaches complete', () => {
      let api!: ReturnType<typeof useDropZoneQueue>;
      render(
        <DropZone simulateUpload uploadInterval={100}>
          <QueueProbe onReady={(a) => (api = a)} />
        </DropZone>,
      );

      act(() => api.addFiles([{ name: 'video.mp4' }]));
      expect(api.files[0].status).toBe('uploading');
      const initialProgress = api.files[0].progress;
      expect(initialProgress).toBeLessThan(100);

      // run enough intervals to walk progress to 100
      act(() => {
        vi.advanceTimersByTime(100 * 20);
      });
      expect(api.files[0].status).toBe('complete');
      expect(api.files[0].progress).toBe(100);
    });

    it('shouldFailUpload turns a finished upload into a retryable failure', () => {
      let api!: ReturnType<typeof useDropZoneQueue>;
      render(
        <DropZone simulateUpload uploadInterval={100} shouldFailUpload={() => true}>
          <QueueProbe onReady={(a) => (api = a)} />
        </DropZone>,
      );

      act(() => api.addFiles([{ name: 'doc.pdf' }]));
      act(() => {
        vi.advanceTimersByTime(100 * 20);
      });
      expect(api.files[0].status).toBe('failed');
      expect(api.files[0].canRetry).toBe(true);
      expect(api.files[0].progress).toBe(100);
    });

    it('default FileQueue renders progress and retries a failed upload through queue state', () => {
      let api!: ReturnType<typeof useDropZoneQueue>;
      render(
        <DropZone
          simulateUpload
          uploadInterval={100}
          shouldFailUpload={(item) => item.attempt === 1}
        >
          <QueueProbe onReady={(a) => (api = a)} />
          <DropZone.FileQueue />
        </DropZone>,
      );

      act(() => api.addFiles([{ name: 'retry.pdf', type: 'application/pdf' }]));
      expect(screen.getByLabelText('retry.pdf 上传进度')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(100 * 20);
      });
      expect(api.files[0]).toMatchObject({ status: 'failed', canRetry: true, progress: 100 });
      expect(screen.getByRole('button', { name: '重试' })).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: '重试' }));
      expect(api.files[0]).toMatchObject({ status: 'uploading', attempt: 2, progress: 8 });
      expect(screen.getByLabelText('retry.pdf 上传进度')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(100 * 20);
      });
      expect(api.files[0]).toMatchObject({ status: 'complete', progress: 100, canRetry: false });
    });
  });
});
