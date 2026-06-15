import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  onEventSelect,
}: {
  selectedEventId: string | null;
  onEventSelect?: (id: string | null) => void;
}) {
  const agenda = useAgenda({
    events: EVENTS,
    defaultView: 'day',
    date: monday,
    selectedEventId,
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

describe('Agenda', () => {
  it('renders root with data-slot and data-view', () => {
    render(<UncontrolledAgenda />);
    const root = document.querySelector('[data-slot="agenda"]');
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute('data-view', 'day');
    expect(root).toHaveClass('agenda');
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
});
