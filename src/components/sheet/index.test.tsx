import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sheet from './index';

// Sheet = OSS Drawer(RAC DialogTrigger/Modal) + motion 拖拽关闭。
// jsdom 无布局，拖拽手势不可测；只测 trigger 为单层 button、受控开合、结构 data-slot。
beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  // RAC overlay 可能用到 matchMedia
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
});

const SheetExample = (props?: React.ComponentProps<typeof Sheet>) => (
  <Sheet {...props}>
    <Sheet.Trigger>Open sheet</Sheet.Trigger>
    <Sheet.Content>
      <Sheet.Dialog>
        <Sheet.Header>
          <Sheet.Heading>Title</Sheet.Heading>
        </Sheet.Header>
        <Sheet.Body>Body content</Sheet.Body>
        <Sheet.Footer>
          <Sheet.Close>Done</Sheet.Close>
        </Sheet.Footer>
      </Sheet.Dialog>
    </Sheet.Content>
  </Sheet>
);

describe('Sheet', () => {
  // 回归相关：Trigger 直接渲染单个 OSS Button，不嵌套 button（避免 button-in-button 非法 DOM）。
  it('Trigger renders a single (non-nested) button', () => {
    render(<SheetExample />);
    const trigger = screen.getByRole('button', { name: 'Open sheet' });
    expect(trigger).toBeInTheDocument();
    // 触发器内部不应再嵌一层 <button>
    expect(trigger.querySelector('button')).toBeNull();
  });

  it('is closed initially (no dialog in the document)', () => {
    render(<SheetExample />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Body content')).not.toBeInTheDocument();
  });

  it('opens on trigger click and renders dialog content with sheet data-slots', async () => {
    const user = userEvent.setup();
    render(<SheetExample placement="bottom" />);
    await user.click(screen.getByRole('button', { name: 'Open sheet' }));

    await waitFor(() => {
      expect(screen.getByText('Body content')).toBeInTheDocument();
    });
    expect(document.querySelector('[data-slot="sheet-content"]')).toBeInTheDocument();
    expect(document.querySelector('[data-slot="sheet-dialog"]')).toBeInTheDocument();
    expect(document.querySelector('[data-slot="sheet-body"]')).toBeInTheDocument();
    // placement 修饰类下发到 content
    expect(document.querySelector('[data-slot="sheet-content"]')).toHaveClass(
      'sheet__content--bottom',
    );
  });

  it('controlled isOpen renders content immediately', () => {
    render(<SheetExample isOpen onOpenChange={() => {}} />);
    expect(screen.getByText('Body content')).toBeInTheDocument();
    const heading = document.querySelector('[data-slot="sheet-heading"]');
    expect(heading).toHaveTextContent('Title');
  });

  it('Close button (slot=close) fires onOpenChange(false)', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<SheetExample isOpen onOpenChange={onOpenChange} />);
    await user.click(screen.getByRole('button', { name: 'Done' }));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });
});
