import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import Agenda, { useAgenda, type AgendaEvent } from './index';

// jsdom 无布局/无 ResizeObserver；agenda 的拖拽/CurrentTimeIndicator 依赖布局，
// 这里只测渲染结构 / data-slot / 受控选中行为 / 回调，不碰像素几何。
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

// 固定锚点周一，事件落在该周，避免依赖系统当天导致可见性漂移
const monday = (() => {
  const d = new Date(2026, 5, 15); // 2026-06-15 是周一
  d.setHours(0, 0, 0, 0);
  return d;
})();

const at = (dayOffset: number, hour: number, minute = 0): Date => {
  const d = new Date(monday);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
};

const EVENTS: AgendaEvent[] = [
  { id: 'e1', title: 'Standup', start: at(0, 9, 0), end: at(0, 9, 30), color: '#06b6d4' },
  { id: 'e2', title: 'Design Review', start: at(0, 14, 0), end: at(0, 15, 0), color: '#3b82f6' },
];

// 受控 selectedEventId 的测试 harness：把 selectedEventId 作为 prop 注入 useAgenda
function ControlledAgenda({
  selectedEventId,
  onEventDelete,
  onEventSelect,
}: {
  selectedEventId: string | null;
  onEventDelete?: (id: string) => void;
  onEventSelect?: (id: string | null) => void;
}) {
  const agenda = useAgenda({
    events: EVENTS,
    defaultView: 'day',
    date: monday,
    selectedEventId,
    onEventDelete,
    onEventSelect,
  });
  return (
    <Agenda {...agenda}>
      <Agenda.Body>
        <Agenda.TimeGrid>
          {agenda.visibleDays.map((day) => (
            <Agenda.DayColumn key={day.toISOString()} date={day}>
              {agenda.getEventsForDay(day).map((event) => (
                <Agenda.Event key={event.id} event={event} />
              ))}
            </Agenda.DayColumn>
          ))}
        </Agenda.TimeGrid>
      </Agenda.Body>
    </Agenda>
  );
}

function UncontrolledAgenda() {
  const agenda = useAgenda({ events: EVENTS, defaultView: 'day', date: monday });
  return (
    <Agenda {...agenda}>
      <Agenda.Header>
        <Agenda.Heading />
        <Agenda.ViewSelector />
        <Agenda.Navigation>
          <Agenda.NavButton slot="previous" />
          <Agenda.TodayButton />
          <Agenda.NavButton slot="next" />
        </Agenda.Navigation>
      </Agenda.Header>
      <Agenda.Body>
        <Agenda.TimeGrid>
          {agenda.visibleDays.map((day) => (
            <Agenda.DayColumn key={day.toISOString()} date={day}>
              {agenda.getEventsForDay(day).map((event) => (
                <Agenda.Event key={event.id} event={event} />
              ))}
            </Agenda.DayColumn>
          ))}
        </Agenda.TimeGrid>
      </Agenda.Body>
    </Agenda>
  );
}

// 月视图 harness：同一天放多个单日事件，制造溢出以测 "N more" 浮层
const MONTH_EVENTS: AgendaEvent[] = [
  { id: 'm1', title: 'Office Hours', start: at(0, 9, 0), end: at(0, 9, 45), color: '#06b6d4' },
  { id: 'm2', title: 'Mentor Sync', start: at(0, 10, 0), end: at(0, 10, 45), color: '#8b5cf6' },
  { id: 'm3', title: 'Content QA', start: at(0, 11, 0), end: at(0, 12, 0), color: '#f59e0b' },
];

function MonthAgenda({ maxEvents = 1 }: { maxEvents?: number }) {
  const agenda = useAgenda({ events: MONTH_EVENTS, defaultView: 'month', date: monday });
  return (
    <Agenda {...agenda}>
      <Agenda.Body>
        <Agenda.MonthGrid>
          {agenda.visibleWeeks.map((week, weekIndex) => {
            const rowLayout = agenda.getMonthRowLayout(week);
            return (
              <Agenda.MonthRow
                // eslint-disable-next-line react/no-array-index-key -- 周序号在视图内稳定
                key={weekIndex}
                spanningRowCount={rowLayout.rowCount}
              >
                {week.map((day, colIndex) => (
                  <Agenda.MonthCell
                    key={day.toISOString()}
                    date={day}
                    maxEvents={maxEvents}
                    spanningRowCount={rowLayout.rowCountPerCol[colIndex] ?? 0}
                  >
                    {agenda.getPerCellEvents(day, week).map((event) => (
                      <Agenda.MonthEvent key={event.id} event={event} />
                    ))}
                  </Agenda.MonthCell>
                ))}
              </Agenda.MonthRow>
            );
          })}
        </Agenda.MonthGrid>
      </Agenda.Body>
    </Agenda>
  );
}

describe('Agenda', () => {
  it('renders root with data-slot and data-view', () => {
    render(<UncontrolledAgenda />);
    const root = document.querySelector('[data-slot="agenda"]');
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute('data-view', 'day');
    expect(root).toHaveClass('agenda');
  });

  // 渲染元素对齐 Pro：Header 渲染 div（Pro 文档为 div / "supports all HTML div props"），
  // 不是 <header>（<header> 会隐式成 banner landmark，Pro 没有该角色）。
  it('renders Header as a div (matches Pro renders-as, no banner landmark)', () => {
    render(<UncontrolledAgenda />);
    const header = document.querySelector('[data-slot="agenda-header"]');
    expect(header).toBeInTheDocument();
    expect(header?.tagName).toBe('DIV');
    expect(document.querySelector('header')).toBeNull();
    expect(screen.queryByRole('banner')).toBeNull();
  });

  it('renders events for the day as event slots', () => {
    render(<UncontrolledAgenda />);
    expect(screen.getByText('Standup')).toBeInTheDocument();
    expect(screen.getByText('Design Review')).toBeInTheDocument();
    const events = document.querySelectorAll('[data-slot="agenda-event"]');
    expect(events.length).toBe(2);
  });

  // 回归：selectedEventId={null} 受控生效——点击事件触发 onEventSelect，
  // 但因受控值仍为 null，DOM 选中态不自行改变（不退回非受控）。
  it('regression: controlled selectedEventId={null} does not self-update selection on click', async () => {
    const user = userEvent.setup();
    const onEventSelect = vi.fn();
    render(<ControlledAgenda selectedEventId={null} onEventSelect={onEventSelect} />);

    const standup = document.querySelector('[data-event-id="e1"]') as HTMLElement;
    expect(standup).not.toBeNull();
    // 初始无选中态
    expect(standup).not.toHaveAttribute('data-selected');

    await user.click(standup);

    // 回调被调用（点击意图传达给消费者）
    expect(onEventSelect).toHaveBeenCalledWith('e1');
    // 但受控值仍为 null，DOM 选中态不被组件私自改变
    expect(standup).not.toHaveAttribute('data-selected');
  });

  // 对照：受控值为某事件 id 时，对应事件渲染为 data-selected=true
  it('reflects controlled selectedEventId in data-selected', () => {
    const { rerender } = render(<ControlledAgenda selectedEventId="e2" onEventSelect={() => {}} />);
    const review = document.querySelector('[data-event-id="e2"]') as HTMLElement;
    expect(review).toHaveAttribute('data-selected', 'true');

    // 切换受控值，选中态随之迁移
    rerender(<ControlledAgenda selectedEventId="e1" onEventSelect={() => {}} />);
    expect(document.querySelector('[data-event-id="e1"]')).toHaveAttribute('data-selected', 'true');
    expect(document.querySelector('[data-event-id="e2"]')).not.toHaveAttribute('data-selected');
  });

  it('ViewSelector switches the view (uncontrolled)', async () => {
    const user = userEvent.setup();
    render(<UncontrolledAgenda />);
    const root = document.querySelector('[data-slot="agenda"]');
    expect(root).toHaveAttribute('data-view', 'day');
    // Segment 渲染 Month 选项；点击切到 month 视图
    await user.click(screen.getByText('Month'));
    expect(root).toHaveAttribute('data-view', 'month');
  });

  it('supports keyboard select and delete for timed events', async () => {
    const user = userEvent.setup();
    const onEventDelete = vi.fn();
    const onEventSelect = vi.fn();
    render(
      <ControlledAgenda
        selectedEventId={null}
        onEventDelete={onEventDelete}
        onEventSelect={onEventSelect}
      />,
    );

    const standup = document.querySelector('[data-event-id="e1"]') as HTMLElement;
    standup.focus();
    expect(standup).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(onEventSelect).toHaveBeenCalledWith('e1');

    await user.keyboard('{Delete}');
    expect(onEventDelete).toHaveBeenCalledWith('e1');
  });

  // 指针可达删除：点击事件弹出详情浮层，浮层内的 Delete 按钮调用 onEventDelete（保留键盘删除）
  it('opens an event-detail popover on click with a pointer-reachable Delete button', async () => {
    const user = userEvent.setup();
    const onEventDelete = vi.fn();
    render(
      <ControlledAgenda
        selectedEventId={null}
        onEventDelete={onEventDelete}
        onEventSelect={() => {}}
      />,
    );

    const standup = document.querySelector('[data-event-id="e1"]') as HTMLElement;
    expect(standup).not.toBeNull();
    // 浮层默认不挂载
    expect(document.querySelector('[data-slot="agenda-event-detail"]')).not.toBeInTheDocument();

    await user.click(standup);

    // 点击后浮层出现，承载删除按钮
    const detail = await screen.findByRole('button', { name: 'Delete' });
    expect(document.querySelector('[data-slot="agenda-event-detail"]')).toBeInTheDocument();
    expect(detail).toHaveAttribute('data-slot', 'agenda-event-delete');

    await user.click(detail);
    expect(onEventDelete).toHaveBeenCalledWith('e1');
  });

  // 月视图溢出："N more" chip 弹出剩余事件浮层（不再跳日视图）
  it('reveals hidden month events in a popover from the "N more" chip without switching to day view', async () => {
    const user = userEvent.setup();
    render(<MonthAgenda maxEvents={1} />);

    const root = document.querySelector('[data-slot="agenda"]');
    expect(root).toHaveAttribute('data-view', 'month');

    // 三个单日事件、maxEvents=1 → 至少一个 cell 出现溢出 chip
    const more = document.querySelector('[data-slot="agenda-month-cell-more"]') as HTMLElement;
    expect(more).not.toBeNull();
    expect(more).toHaveAttribute('aria-expanded', 'false');
    // 浮层默认不挂载
    expect(document.querySelector('[data-slot="agenda-month-overflow"]')).not.toBeInTheDocument();

    await user.click(more);

    // chip 展开浮层，列出被折叠的事件（MonthEvent 文案带时间前缀，用子串匹配）；视图仍为 month
    expect(await screen.findByText(/Content QA/)).toBeInTheDocument();
    const overflow = document.querySelector('[data-slot="agenda-month-overflow"]');
    expect(overflow).toBeInTheDocument();
    expect(overflow?.querySelector('[data-event-id="m3"]')).not.toBeNull();
    expect(more).toHaveAttribute('aria-expanded', 'true');
    expect(root).toHaveAttribute('data-view', 'month');
  });

  // a11y：完整周历（Header 含带 aria-label 的导航/视图选择器 + TimeGrid + 事件），axe 应无违规。
  it('has no axe a11y violations', async () => {
    const { container } = render(<UncontrolledAgenda />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
