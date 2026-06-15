import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import Kanban, { useKanban, useKanbanColumn } from './index';

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
