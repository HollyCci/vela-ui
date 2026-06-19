import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import Sheet, { resolveSnapPx, selectSnapTarget } from './index';

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

  // a11y：打开态扫描整个 document.body（覆盖 portal 内的 dialog/heading/close 等浮层内容）。
  // dialog 由 Heading 提供可访问名（RAC 自动 aria-labelledby），axe 应无违规。
  it('has no axe a11y violations (open state, portal content)', async () => {
    render(<SheetExample isOpen onOpenChange={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText('Body content')).toBeInTheDocument();
    });
    expect(await axe(document.body)).toHaveNoViolations();
  });
});

// 拖拽结束的「最近档」选择是纯几何计算（不依赖 jsdom 布局），直接对纯函数单测。
// 三档示例：[120, 320, 600]px；当前停在中间档（320），dimension=320。
describe('selectSnapTarget (drag-end nearest snap)', () => {
  const resolvedPx = [120, 320, 600];
  const base = {
    resolvedPx,
    dimension: 320,
    currentIndex: 1,
    directedSpeed: 0,
    closeThreshold: 0.3,
  };

  it('小幅拖动落回原档（投影尺寸最近的仍是当前档）', () => {
    // 向关闭方向移动 20px：投影尺寸 300，离 320 最近 → 仍是 index 1
    expect(selectSnapTarget({ ...base, directedTravel: 20 })).toBe(1);
  });

  it('单步：朝关闭方向中等拖动落到相邻更小一档', () => {
    // 向关闭方向 150px：投影 170，离 120 最近 → index 0
    expect(selectSnapTarget({ ...base, directedTravel: 150 })).toBe(0);
  });

  it('反向拖动放大落到更大一档', () => {
    // 反关闭方向（负位移）220px：投影 540，离 600 最近 → index 2
    expect(selectSnapTarget({ ...base, directedTravel: -220 })).toBe(2);
  });

  it('多档跳跃：一次长拖从最大档直接落到最小档（而非只退一档）', () => {
    // 从最大档(600, dimension=600)向关闭方向猛拖 500px：投影 100，离 120 最近 → index 0（跨两档）
    expect(
      selectSnapTarget({ ...base, dimension: 600, currentIndex: 2, directedTravel: 500 }),
    ).toBe(0);
  });

  it('高速度折算成额外位移，快速一甩跨多档', () => {
    // 从最大档轻拖 80px 但速度极高(4000px/s)：投影 = 600 - (80 + 4000*0.08) = 600-400=200 → 离 120 vs 320，
    // |200-120|=80 < |200-320|=120 → index 0（一甩跨两档）
    expect(
      selectSnapTarget({
        ...base,
        dimension: 600,
        currentIndex: 2,
        directedTravel: 80,
        directedSpeed: 4000,
      }),
    ).toBe(0);
  });

  it('已停在最小档继续朝关闭方向拖过阈值 → 关闭手势', () => {
    // 当前在最小档(120, dimension=120)，向关闭方向拖 100px：投影 20 < 120 - 120*0.3=84 → dismiss
    expect(
      selectSnapTarget({ ...base, dimension: 120, currentIndex: 0, directedTravel: 100 }),
    ).toBe('dismiss');
  });

  it('未停在最小档时不会关闭，只落到最近档', () => {
    // 在中间档大幅向关闭方向拖：落到最小档而不是关闭
    expect(selectSnapTarget({ ...base, directedTravel: 400 })).toBe(0);
  });
});

// snap point 解析到像素：number/px 直接取值，% 相对视口，其它单位按当前实测比例换算。
describe('resolveSnapPx', () => {
  it('裸数字按像素', () => {
    expect(resolveSnapPx(320, 1000)).toBe(320);
  });

  it('px 字符串解析为像素', () => {
    expect(resolveSnapPx('480px', 1000)).toBe(480);
  });

  it('百分比相对视口维度', () => {
    expect(resolveSnapPx('50%', 800)).toBe(400);
    expect(resolveSnapPx('75%', 800)).toBe(600);
  });

  it('其它单位（如 rem）按「当前实测像素 / 当前档数值」比例换算', () => {
    // 当前档 20(rem) 实测 320px → 每单位 16px；40rem → 640px
    expect(resolveSnapPx('40rem', 1000, { numeric: 20, px: 320 })).toBe(640);
  });
});
