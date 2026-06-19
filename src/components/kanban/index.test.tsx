import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { axe } from 'vitest-axe';
import type { PanInfo } from 'motion/react';
import Kanban, { useKanban, useKanbanColumn, type KanbanColumnDnd } from './index';

// Kanban 卡片用 motion Reorder（拖拽）；jsdom 无布局，跨列命中/拖拽不可测。
// 只测结构/data-slot/卡片渲染/列头，以及 useKanban 数据层（纯逻辑，jsdom-safe）。
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

type Task = { id: string; title: string; status: string };

const TASKS: Task[] = [
  { id: 't1', title: 'Alpha', status: 'todo' },
  { id: 't2', title: 'Bravo', status: 'todo' },
  { id: 't3', title: 'Charlie', status: 'done' },
];

const getColumn = (t: Task) => t.status;
const setColumn = (t: Task, column: string): Task => ({ ...t, status: column });

function StaticBoard() {
  return (
    <Kanban size="sm">
      <Kanban.Column>
        <Kanban.ColumnHeader title="To Do" count={2} indicatorColor="#f00" />
        <Kanban.ColumnBody>
          <Kanban.CardList aria-label="To Do" items={TASKS.filter((t) => t.status === 'todo')}>
            {(task: Task) => (
              <Kanban.Card id={task.id} textValue={task.title}>
                <Kanban.CardContent>{task.title}</Kanban.CardContent>
              </Kanban.Card>
            )}
          </Kanban.CardList>
        </Kanban.ColumnBody>
      </Kanban.Column>
    </Kanban>
  );
}

describe('Kanban', () => {
  it('renders root with data-slot and size class', () => {
    render(<StaticBoard />);
    const root = document.querySelector('[data-slot="kanban"]');
    expect(root).toBeInTheDocument();
    expect(root).toHaveClass('kanban');
    expect(root).toHaveClass('kanban--sm');
  });

  it('renders column header with title, count and indicator color', () => {
    render(<StaticBoard />);
    expect(screen.getByText('To Do')).toBeInTheDocument();
    const count = document.querySelector('[data-slot="kanban-column-count"]');
    expect(count).toHaveTextContent('2');
    const indicator = document.querySelector('[data-slot="kanban-column-indicator"]');
    expect(indicator).toHaveStyle({ backgroundColor: '#f00' });
  });

  it('renders cards from items (static list without dnd renders plain cards)', () => {
    render(<StaticBoard />);
    const cards = document.querySelectorAll('[data-slot="kanban-card"]');
    expect(cards.length).toBe(2);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Bravo')).toBeInTheDocument();
    // 无 dnd 适配器时退化为静态 div 卡片，带 data-key
    expect(document.querySelector('[data-slot="kanban-card"][data-key="t1"]')).toBeInTheDocument();
  });

  it('renders empty state when no items', () => {
    render(
      <Kanban>
        <Kanban.Column>
          <Kanban.ColumnBody>
            <Kanban.CardList
              aria-label="Empty"
              items={[]}
              renderEmptyState={() => <Kanban.Empty>Drop here</Kanban.Empty>}
            >
              {() => null}
            </Kanban.CardList>
          </Kanban.ColumnBody>
        </Kanban.Column>
      </Kanban>,
    );
    const list = document.querySelector('[data-slot="kanban-card-list"]');
    expect(list).toHaveAttribute('data-empty', 'true');
    expect(screen.getByText('Drop here')).toBeInTheDocument();
  });

  // a11y：列含表头 + 带 aria-label 的卡片列表 + 卡片（textValue 提供可访问名）。
  // 预期违规（待主控修组件源码，非本测试用法问题）：CardList 容器设了 role="list"，
  // 但其子 Card 渲染为普通 div（未设 role="listitem"），触发 axe aria-required-children
  // （"Certain ARIA roles must contain particular children"）。
  it('has no axe a11y violations', async () => {
    const { container } = render(<StaticBoard />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('useKanban data layer', () => {
  function setup() {
    const ref: { kanban: ReturnType<typeof useKanban<Task>> | null } = { kanban: null };
    function Probe() {
      ref.kanban = useKanban<Task>({ initialItems: TASKS, getColumn, setColumn });
      return null;
    }
    render(<Probe />);
    return ref;
  }

  it('moveItem changes the card column', () => {
    const ref = setup();
    act(() => ref.kanban!.moveItem('t1', 'done'));
    expect(ref.kanban!.list.getItem('t1')?.status).toBe('done');
  });

  it('addItem / removeItem mutate the list', () => {
    const ref = setup();
    act(() => ref.kanban!.addItem({ id: 't4', title: 'Delta', status: 'todo' }));
    expect(ref.kanban!.list.items.some((t) => t.id === 't4')).toBe(true);
    act(() => ref.kanban!.removeItem('t4'));
    expect(ref.kanban!.list.items.some((t) => t.id === 't4')).toBe(false);
  });

  it('useKanbanColumn filters items to its column', () => {
    const ref: { todo: Task[] | null } = { todo: null };
    function Probe() {
      const kanban = useKanban<Task>({ initialItems: TASKS, getColumn, setColumn });
      const { items } = useKanbanColumn(kanban, 'todo');
      ref.todo = items;
      return null;
    }
    render(<Probe />);
    expect(ref.todo?.map((t) => t.id)).toEqual(['t1', 't2']);
  });
});

/* -------------------------------------------------------------------------------------------------
 * 跨列落点定位 / 键盘排序：jsdom 无真实布局，故 onDragEnd 用 stub 的 getBoundingClientRect
 * 喂入卡片矩形，验证按落点 Y 命中中线算出的插入索引；键盘路径直接驱动 onKeyboardMove 与手柄按键。
 * -----------------------------------------------------------------------------------------------*/

const DND_TASKS: Task[] = [
  { id: 't1', title: 'Alpha', status: 'todo' },
  { id: 't2', title: 'Bravo', status: 'todo' },
  { id: 't3', title: 'Charlie', status: 'done' },
  { id: 't4', title: 'Delta', status: 'done' },
];

const boardOrder = (items: Task[]) =>
  ['todo', 'done']
    .map(
      (col) =>
        `${col}:${items
          .filter((t) => t.status === col)
          .map((t) => t.id)
          .join(',')}`,
    )
    .join('|');

type DndRefs = {
  kanban: ReturnType<typeof useKanban<Task>> | null;
  dnd: Record<string, KanbanColumnDnd<Task>>;
};

function DndColumn({
  kanban,
  column,
  refs,
}: {
  kanban: ReturnType<typeof useKanban<Task>>;
  column: string;
  refs: DndRefs;
}) {
  const { items, dragAndDropHooks } = useKanbanColumn(kanban, column);
  refs.dnd[column] = dragAndDropHooks;
  return (
    <Kanban.Column>
      <Kanban.ColumnHeader title={column} count={items.length} />
      <Kanban.ColumnBody>
        <Kanban.CardList aria-label={column} items={items} dragAndDropHooks={dragAndDropHooks}>
          {(task: Task) => (
            <Kanban.Card id={task.id} textValue={task.title} data-kanban-task-id={task.id}>
              <Kanban.CardContent>
                <Kanban.DragHandle aria-label={`drag ${task.title}`} />
                <span>{task.title}</span>
              </Kanban.CardContent>
            </Kanban.Card>
          )}
        </Kanban.CardList>
      </Kanban.ColumnBody>
    </Kanban.Column>
  );
}

function DndBoard({ refs }: { refs: DndRefs }) {
  const kanban = useKanban<Task>({ initialItems: DND_TASKS, getColumn, setColumn });
  refs.kanban = kanban;
  return (
    <Kanban>
      <DndColumn kanban={kanban} column="todo" refs={refs} />
      <DndColumn kanban={kanban} column="done" refs={refs} />
    </Kanban>
  );
}

function setupDnd() {
  const refs: DndRefs = { kanban: null, dnd: {} };
  render(<DndBoard refs={refs} />);
  return refs;
}

// 给指定列的列表容器与卡片打上 stub 矩形，让 onDragEnd 的几何命中可在 jsdom 下运行。
function stubColumnRects(column: string, listRect: DOMRect, cardRects: Record<string, DOMRect>) {
  const listEl = document.querySelector<HTMLElement>(
    `[data-slot="kanban-card-list"][data-kanban-column="${column}"]`,
  )!;
  listEl.getBoundingClientRect = () => listRect;
  for (const [key, rect] of Object.entries(cardRects)) {
    const cardEl = listEl.querySelector<HTMLElement>(`[data-slot="kanban-card"][data-key="${key}"]`);
    if (cardEl) {
      cardEl.getBoundingClientRect = () => rect;
    }
  }
}

const rect = (top: number, height: number): DOMRect =>
  ({ left: 100, right: 300, top, bottom: top + height, width: 200, height, x: 100, y: top, toJSON() {} }) as DOMRect;

const panInfo = (x: number, y: number): PanInfo =>
  ({ point: { x, y }, delta: { x: 0, y: 0 }, offset: { x: 0, y: 0 }, velocity: { x: 0, y: 0 } }) as PanInfo;

describe('Kanban cross-column drop insertion index', () => {
  it('inserts the dragged card at the hit-tested position within the target column (not just the end)', () => {
    const refs = setupDnd();
    // 目标列 done 的列表与两张卡片矩形：t3 在 [200,240)，t4 在 [240,280)
    stubColumnRects(
      'done',
      rect(190, 120),
      { t3: rect(200, 40), t4: rect(240, 40) },
    );
    // 落点 Y=210 落在 t3 中线(220)之前 → 应插到 t3 之前，即 done 首位
    act(() => {
      refs.dnd.todo!.onDragEnd(
        DND_TASKS[0],
        panInfo(200, 210),
        new MouseEvent('pointerup') as unknown as PointerEvent,
      );
    });
    expect(boardOrder(refs.kanban!.list.items)).toBe('todo:t2|done:t1,t3,t4');
  });

  it('inserts between target cards when the pointer is past the first card midline', () => {
    const refs = setupDnd();
    stubColumnRects(
      'done',
      rect(190, 120),
      { t3: rect(200, 40), t4: rect(240, 40) },
    );
    // 落点 Y=235 在 t3 中线(220)之后、t4 中线(260)之前 → 插到 t4 之前（t3 与 t4 之间）
    act(() => {
      refs.dnd.todo!.onDragEnd(
        DND_TASKS[0],
        panInfo(200, 235),
        new MouseEvent('pointerup') as unknown as PointerEvent,
      );
    });
    expect(boardOrder(refs.kanban!.list.items)).toBe('todo:t2|done:t3,t1,t4');
  });

  it('drops at the column end when the pointer is below all target cards', () => {
    const refs = setupDnd();
    stubColumnRects(
      'done',
      rect(190, 120),
      { t3: rect(200, 40), t4: rect(240, 40) },
    );
    // 落点 Y=300 在两张卡片之下 → 落到列尾
    act(() => {
      refs.dnd.todo!.onDragEnd(
        DND_TASKS[0],
        panInfo(200, 300),
        new MouseEvent('pointerup') as unknown as PointerEvent,
      );
    });
    expect(boardOrder(refs.kanban!.list.items)).toBe('todo:t2|done:t3,t4,t1');
  });
});

describe('Kanban keyboard reorder', () => {
  it('onKeyboardMove reorders within a column (down then up)', () => {
    const refs = setupDnd();
    act(() => {
      refs.dnd.todo!.onKeyboardMove(DND_TASKS[0], 'down');
    });
    expect(boardOrder(refs.kanban!.list.items)).toBe('todo:t2,t1|done:t3,t4');
    act(() => {
      // t1 现在在 todo 第二位，向上移回首位
      refs.dnd.todo!.onKeyboardMove(refs.kanban!.list.getItem('t1')!, 'up');
    });
    expect(boardOrder(refs.kanban!.list.items)).toBe('todo:t1,t2|done:t3,t4');
  });

  it('onKeyboardMove moves a card to the adjacent column (right)', () => {
    const refs = setupDnd();
    act(() => {
      refs.dnd.todo!.onKeyboardMove(DND_TASKS[0], 'right');
    });
    // t1 跨到 done 列尾
    expect(boardOrder(refs.kanban!.list.items)).toBe('todo:t2|done:t3,t4,t1');
  });

  it('onKeyboardMove returns false at boundaries', () => {
    const refs = setupDnd();
    let moved = true;
    act(() => {
      moved = refs.dnd.todo!.onKeyboardMove(DND_TASKS[0], 'up');
    });
    expect(moved).toBe(false);
    let movedLeft = true;
    act(() => {
      movedLeft = refs.dnd.todo!.onKeyboardMove(DND_TASKS[0], 'left');
    });
    expect(movedLeft).toBe(false);
    expect(boardOrder(refs.kanban!.list.items)).toBe('todo:t1,t2|done:t3,t4');
  });

  it('drag handle keyboard: Space grabs, ArrowDown moves, with live-region announcement', () => {
    const refs = setupDnd();
    const handle = document.querySelector<HTMLElement>(
      '[data-slot="kanban-card"][data-kanban-task-id="t1"] [data-slot="kanban-drag-handle"]',
    )!;
    // 抓取
    act(() => {
      handle.focus();
      fireEvent.keyDown(handle, { key: ' ' });
    });
    expect(handle).toHaveAttribute('data-kanban-grabbed', 'true');
    const live = document.querySelector('[data-slot="kanban-drag-live"]');
    expect(live).toHaveTextContent('已抓取');
    // 方向键移动一格（列内下移）
    act(() => {
      fireEvent.keyDown(handle, { key: 'ArrowDown' });
    });
    expect(boardOrder(refs.kanban!.list.items)).toBe('todo:t2,t1|done:t3,t4');
    // Esc 放下
    act(() => {
      fireEvent.keyDown(handle, { key: 'Escape' });
    });
    expect(handle).not.toHaveAttribute('data-kanban-grabbed');
  });
});
