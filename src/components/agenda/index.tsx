import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { Button } from '@heroui/react';
import type { Key } from 'react-aria-components';
import clsx from 'clsx';
import Segment from '../segment';

export type AgendaView = 'day' | 'week' | 'month';

/**
 * 事件数据。原站用 @internationalized/date 的 CalendarDateTime；本仓库未直接依赖该包，
 * 故 start/end 收窄为原生 Date（同样携带年月日时分），导航/视图切换交互不受影响。
 */
export type AgendaEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  /** 事件强调色，注入 --agenda-event-accent，并据此推导浅色背景 */
  color?: string;
  isAllDay?: boolean;
  isReadOnly?: boolean;
  status?: 'confirmed' | 'unconfirmed';
};

/** 全天事件在 AllDaySection 网格中的定位信息 */
export type AgendaAllDayLayoutItem = {
  event: AgendaEvent;
  colStart: number;
  colSpan: number;
  row: number;
};

/** 月视图跨天事件条定位信息 */
export type AgendaMonthSpanningItem = {
  event: AgendaEvent;
  colStart: number;
  colSpan: number;
  row: number;
};

export type AgendaMonthRowLayout = {
  items: AgendaMonthSpanningItem[];
  /** 该周内跨天条占用的最大行数（决定每个 cell 顶部留白） */
  rowCount: number;
  /** 每列各自被跨天条压住的行数（用于单 cell 留白） */
  rowCountPerCol: number[];
};

export type UseAgendaOptions = {
  /** 事件数组（原站 API，必填） */
  events: AgendaEvent[];
  defaultView?: AgendaView;
  view?: AgendaView;
  onViewChange?: (view: AgendaView) => void;
  defaultDate?: Date;
  date?: Date;
  onDateChange?: (date: Date) => void;
  /** 时间网格首个可见小时（含），默认 0 */
  startHour?: number;
  /** 时间网格末个可见小时（不含），默认 24 */
  endHour?: number;
  /** 单格时长（分钟），默认 60 */
  slotDuration?: number;
  /** 周视图列数（自定义天数），默认 7 */
  visibleDayCount?: number;
  onEventCreate?: (event: { start: Date; end: Date }) => void;
  onEventDelete?: (id: string) => void;
  onEventMove?: (id: string, start: Date, end: Date) => void;
  onEventResize?: (id: string, start: Date, end: Date) => void;
  onEventSelect?: (id: string | null) => void;
  selectedEventId?: string | null;
};

export type UseAgendaResult = {
  view: AgendaView;
  setView: (view: AgendaView) => void;
  date: Date;
  setDate: (date: Date) => void;
  /** 当前视图标题（如 "2026年6月"） */
  title: string;
  /** 视图首日（含），日/周以此为锚，月以含首周首日 */
  rangeStart: Date;
  startHour: number;
  endHour: number;
  slotDuration: number;
  /** 当前视图涉及的可见天（日=1，周=visibleDayCount） */
  visibleDays: Date[];
  /** 月视图的周（每周 7 天的数组） */
  visibleWeeks: Date[][];
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;
  goPrevious: () => void;
  goNext: () => void;
  goToday: () => void;
  /** 当天的定时（非全天）事件 */
  getEventsForDay: (day: Date) => AgendaEvent[];
  /** 当前视图可见天的全天事件网格布局 */
  allDayLayout: AgendaAllDayLayoutItem[];
  /** 某周跨天事件布局 */
  getMonthRowLayout: (week: Date[]) => AgendaMonthRowLayout;
  /** 月视图某 cell 的单日事件（含单日全天，不含跨天条） */
  getPerCellEvents: (day: Date, week: Date[]) => AgendaEvent[];
  onEventCreate?: (event: { start: Date; end: Date }) => void;
  onEventDelete?: (id: string) => void;
  onEventMove?: (id: string, start: Date, end: Date) => void;
  onEventResize?: (id: string, start: Date, end: Date) => void;
  onEventSelect?: (id: string | null) => void;
};

const MS_PER_DAY = 86_400_000;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, amount: number): Date {
  const next = startOfDay(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, date.getDate());
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** 以周一为起点（原站快照周首列为周一） */
function startOfWeek(date: Date): Date {
  const day = startOfDay(date);
  const weekday = (day.getDay() + 6) % 7; // 周一=0
  return addDays(day, -weekday);
}

function isWeekend(date: Date): boolean {
  const weekday = date.getDay();
  return weekday === 0 || weekday === 6;
}

function dayDiff(a: Date, b: Date): number {
  return Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / MS_PER_DAY);
}

/** 同一天内自午夜起的分钟偏移（跨天事件按所在天 clamp 到 [0, 1440]） */
function minutesFromMidnight(date: Date, day: Date): number {
  if (date.getTime() <= startOfDay(day).getTime()) return 0;
  const endOfDay = addDays(day, 1).getTime();
  if (date.getTime() >= endOfDay) return 24 * 60;
  return date.getHours() * 60 + date.getMinutes();
}

function useControllableState<T>(
  controlled: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
): [T, (value: T) => void] {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const isControlled = controlled !== undefined;
  const value = isControlled ? controlled : uncontrolled;
  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setUncontrolled(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );
  return [value, setValue];
}

/**
 * Agenda 状态/派生数据 hook（原站 API）。视图与焦点日期均支持受控/非受控；
 * 导航（前后/今天）与视图切换在此实现，事件数据可为内置静态。
 */
export function useAgenda(options: UseAgendaOptions): UseAgendaResult {
  const {
    events,
    defaultView = 'week',
    view: controlledView,
    onViewChange,
    defaultDate,
    date: controlledDate,
    onDateChange,
    startHour = 0,
    endHour = 24,
    slotDuration = 60,
    visibleDayCount = 7,
    onEventCreate,
    onEventDelete,
    onEventMove,
    onEventResize,
    onEventSelect,
    selectedEventId: controlledSelected,
  } = options;

  // 非受控初值在挂载后固定，避免每次渲染 today 变化
  const [fallbackDate] = useState(() => startOfDay(defaultDate ?? new Date()));

  const [view, setView] = useControllableState(controlledView, defaultView, onViewChange);
  const [date, setDateRaw] = useControllableState(controlledDate, fallbackDate, onDateChange);
  const [selectedEventId, setSelectedEventId] = useControllableState<string | null>(
    controlledSelected ?? undefined,
    null,
    onEventSelect,
  );

  const setDate = useCallback((next: Date) => setDateRaw(startOfDay(next)), [setDateRaw]);

  const locale = typeof navigator !== 'undefined' ? navigator.language : 'en-US';

  const title = useMemo(
    () => new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long' }).format(date),
    [locale, date],
  );

  const rangeStart = useMemo(() => {
    if (view === 'day') return startOfDay(date);
    if (view === 'week') return startOfWeek(date);
    return startOfWeek(new Date(date.getFullYear(), date.getMonth(), 1));
  }, [view, date]);

  const visibleDays = useMemo(() => {
    if (view === 'day') return [startOfDay(date)];
    const count = view === 'week' ? visibleDayCount : 7;
    return Array.from({ length: count }, (_, i) => addDays(rangeStart, i));
  }, [view, date, rangeStart, visibleDayCount]);

  const visibleWeeks = useMemo(() => {
    if (view !== 'month') return [];
    const month = date.getMonth();
    const weeks: Date[][] = [];
    let cursor = rangeStart;
    // 渲染覆盖当月的所有整周，直到越过当月最后一天
    do {
      weeks.push(Array.from({ length: 7 }, (_, i) => addDays(cursor, i)));
      cursor = addDays(cursor, 7);
    } while (cursor.getMonth() === month || cursor < new Date(date.getFullYear(), month + 1, 1));
    return weeks;
  }, [view, date, rangeStart]);

  const goPrevious = useCallback(() => {
    if (view === 'day') setDate(addDays(date, -1));
    else if (view === 'week') setDate(addDays(date, -visibleDayCount));
    else setDate(addMonths(date, -1));
  }, [view, date, visibleDayCount, setDate]);

  const goNext = useCallback(() => {
    if (view === 'day') setDate(addDays(date, 1));
    else if (view === 'week') setDate(addDays(date, visibleDayCount));
    else setDate(addMonths(date, 1));
  }, [view, date, visibleDayCount, setDate]);

  const goToday = useCallback(() => setDate(new Date()), [setDate]);

  const getEventsForDay = useCallback(
    (day: Date): AgendaEvent[] =>
      events
        .filter((event) => !event.isAllDay && isSameDay(event.start, day))
        .sort((a, b) => a.start.getTime() - b.start.getTime()),
    [events],
  );

  const allDayLayout = useMemo<AgendaAllDayLayoutItem[]>(() => {
    if (view === 'month' || visibleDays.length === 0) return [];
    const first = visibleDays[0];
    const last = visibleDays[visibleDays.length - 1];
    // 行内贪心打包：同一行内已占用区间不重叠
    const rows: Array<Array<[number, number]>> = [];
    const layout: AgendaAllDayLayoutItem[] = [];
    for (const event of events) {
      if (!event.isAllDay) continue;
      const colStart = Math.max(0, dayDiff(event.start, first));
      const colEnd = Math.min(visibleDays.length - 1, dayDiff(event.end, first));
      if (colEnd < 0 || colStart > visibleDays.length - 1) continue;
      if (event.end < first || event.start > last) continue;
      const colSpan = colEnd - colStart + 1;
      let row = rows.findIndex(
        (occupied) => !occupied.some(([s, e]) => colStart <= e && colEnd >= s),
      );
      if (row === -1) {
        row = rows.length;
        rows.push([]);
      }
      rows[row].push([colStart, colEnd]);
      layout.push({ event, colStart, colSpan, row });
    }
    return layout;
  }, [view, events, visibleDays]);

  const getMonthRowLayout = useCallback(
    (week: Date[]): AgendaMonthRowLayout => {
      const first = week[0];
      const last = week[week.length - 1];
      const rows: Array<Array<[number, number]>> = [];
      const items: AgendaMonthSpanningItem[] = [];
      for (const event of events) {
        const span = dayDiff(event.end, event.start) >= 1 || event.isAllDay;
        if (!span) continue;
        if (event.end < first || event.start > last) continue;
        const colStart = Math.max(0, dayDiff(event.start, first));
        const colEnd = Math.min(6, dayDiff(event.end, first));
        if (colEnd < colStart) continue;
        let row = rows.findIndex(
          (occupied) => !occupied.some(([s, e]) => colStart <= e && colEnd >= s),
        );
        if (row === -1) {
          row = rows.length;
          rows.push([]);
        }
        rows[row].push([colStart, colEnd]);
        items.push({ event, colStart, colSpan: colEnd - colStart + 1, row });
      }
      const rowCountPerCol = week.map(
        (_, col) =>
          items.filter((item) => col >= item.colStart && col < item.colStart + item.colSpan)
            .length,
      );
      return { items, rowCount: rows.length, rowCountPerCol };
    },
    [events],
  );

  const getPerCellEvents = useCallback(
    (day: Date): AgendaEvent[] =>
      events
        .filter((event) => {
          const span = dayDiff(event.end, event.start) >= 1 || event.isAllDay;
          return !span && isSameDay(event.start, day);
        })
        .sort((a, b) => a.start.getTime() - b.start.getTime()),
    [events],
  );

  return {
    view,
    setView,
    date,
    setDate,
    title,
    rangeStart,
    startHour,
    endHour,
    slotDuration,
    visibleDays,
    visibleWeeks,
    selectedEventId,
    setSelectedEventId,
    goPrevious,
    goNext,
    goToday,
    getEventsForDay,
    allDayLayout,
    getMonthRowLayout,
    getPerCellEvents,
    onEventCreate,
    onEventDelete,
    onEventMove,
    onEventResize,
    onEventSelect,
  };
}

type AgendaContextValue = UseAgendaResult & { locale: string };

const AgendaContext = createContext<AgendaContextValue | null>(null);

function useAgendaContext(): AgendaContextValue {
  const ctx = useContext(AgendaContext);
  if (ctx === null) throw new Error('Agenda subcomponents must be used within <Agenda>');
  return ctx;
}

export type AgendaProps = Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'style'> &
  UseAgendaResult & {
    className?: string;
    style?: CSSProperties;
  };

/** 根容器：写入 context 与 Motion provider（本仓库无 Motion，仅提供 context） */
const AgendaRoot = forwardRef<HTMLDivElement, AgendaProps>((props, ref) => {
  const {
    className,
    children,
    // 解构掉 hook 返回字段，剩余透传给 div
    view,
    setView,
    date,
    setDate,
    title,
    rangeStart,
    startHour,
    endHour,
    slotDuration,
    visibleDays,
    visibleWeeks,
    selectedEventId,
    setSelectedEventId,
    goPrevious,
    goNext,
    goToday,
    getEventsForDay,
    allDayLayout,
    getMonthRowLayout,
    getPerCellEvents,
    onEventCreate,
    onEventDelete,
    onEventMove,
    onEventResize,
    onEventSelect,
    ...rest
  } = props;

  const locale = typeof navigator !== 'undefined' ? navigator.language : 'en-US';

  const contextValue = useMemo<AgendaContextValue>(
    () => ({
      view,
      setView,
      date,
      setDate,
      title,
      rangeStart,
      startHour,
      endHour,
      slotDuration,
      visibleDays,
      visibleWeeks,
      selectedEventId,
      setSelectedEventId,
      goPrevious,
      goNext,
      goToday,
      getEventsForDay,
      allDayLayout,
      getMonthRowLayout,
      getPerCellEvents,
      onEventCreate,
      onEventDelete,
      onEventMove,
      onEventResize,
      onEventSelect,
      locale,
    }),
    [
      view,
      setView,
      date,
      setDate,
      title,
      rangeStart,
      startHour,
      endHour,
      slotDuration,
      visibleDays,
      visibleWeeks,
      selectedEventId,
      setSelectedEventId,
      goPrevious,
      goNext,
      goToday,
      getEventsForDay,
      allDayLayout,
      getMonthRowLayout,
      getPerCellEvents,
      onEventCreate,
      onEventDelete,
      onEventMove,
      onEventResize,
      onEventSelect,
      locale,
    ],
  );

  return (
    <AgendaContext.Provider value={contextValue}>
      <div
        ref={ref}
        data-slot="agenda"
        data-view={view}
        tabIndex={-1}
        className={clsx('agenda', view === 'month' && 'agenda--month', className)}
        {...rest}
      >
        {children}
      </div>
    </AgendaContext.Provider>
  );
});
AgendaRoot.displayName = 'Agenda';

export type AgendaSectionProps = HTMLAttributes<HTMLDivElement>;

const Header = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  ({ className, ...rest }, ref) => (
    <header
      ref={ref}
      data-slot="agenda-header"
      className={clsx('agenda__header', className)}
      {...rest}
    />
  ),
);
Header.displayName = 'Agenda.Header';

/** 当前月份/年份标题（如 "2026年6月"） */
const Heading = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...rest }, ref) => {
    const { title } = useAgendaContext();
    return (
      <h1
        ref={ref}
        data-slot="agenda-heading"
        className={clsx('agenda__heading', className)}
        {...rest}
      >
        {children ?? title}
      </h1>
    );
  },
);
Heading.displayName = 'Agenda.Heading';

export type AgendaViewSelectorProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const VIEW_LABELS: Record<AgendaView, string> = { day: 'Day', week: 'Week', month: 'Month' };

/** 视图切换分段控件（基于本仓库 Segment 组件，原站基于 HeroUI Segment） */
const ViewSelector = ({ size = 'sm', className }: AgendaViewSelectorProps) => {
  const { view, setView } = useAgendaContext();

  const handleSelectionChange = useCallback(
    (key: Key) => setView(key as AgendaView),
    [setView],
  );

  return (
    <Segment
      size={size}
      selectedKey={view}
      onSelectionChange={handleSelectionChange}
      aria-label="Select view"
      className={clsx('agenda__view-selector', className)}
    >
      {(Object.keys(VIEW_LABELS) as AgendaView[]).map((key) => (
        <Segment.Item key={key} id={key}>
          {VIEW_LABELS[key]}
        </Segment.Item>
      ))}
    </Segment>
  );
};
ViewSelector.displayName = 'Agenda.ViewSelector';

const Navigation = forwardRef<HTMLDivElement, AgendaSectionProps>(
  ({ className, ...rest }, ref) => (
    <div
      ref={ref}
      data-slot="agenda-navigation"
      className={clsx('agenda__navigation', className)}
      {...rest}
    />
  ),
);
Navigation.displayName = 'Agenda.Navigation';

const ChevronLeftIcon = () => (
  <svg fill="none" height="16" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);
ChevronLeftIcon.displayName = 'Agenda.ChevronLeftIcon';

const ChevronRightIcon = () => (
  <svg fill="none" height="16" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16">
    <path d="M9 18l6-6-6-6" />
  </svg>
);
ChevronRightIcon.displayName = 'Agenda.ChevronRightIcon';

export type AgendaNavButtonProps = {
  /** 导航方向（原站 API） */
  slot: 'previous' | 'next';
  className?: string;
};

/** 前/后导航按钮（基于 HeroUI Button）；点击触发 goPrevious/goNext */
const NavButton = ({ slot, className }: AgendaNavButtonProps) => {
  const { goPrevious, goNext } = useAgendaContext();
  const isPrevious = slot === 'previous';

  const handlePress = useCallback(() => {
    if (isPrevious) goPrevious();
    else goNext();
  }, [isPrevious, goPrevious, goNext]);

  return (
    <Button
      isIconOnly
      size="sm"
      variant="ghost"
      aria-label={isPrevious ? 'Previous' : 'Next'}
      onPress={handlePress}
      className={clsx('agenda__nav-button', className)}
    >
      {isPrevious ? <ChevronLeftIcon /> : <ChevronRightIcon />}
    </Button>
  );
};
NavButton.displayName = 'Agenda.NavButton';

export type AgendaTodayButtonProps = {
  className?: string;
  children?: ReactNode;
};

/** 跳转今天按钮（基于 HeroUI Button） */
const TodayButton = ({ className, children = 'Today' }: AgendaTodayButtonProps) => {
  const { goToday } = useAgendaContext();
  return (
    <Button
      size="sm"
      variant="outline"
      onPress={goToday}
      className={clsx('agenda__today-button', className)}
    >
      {children}
    </Button>
  );
};
TodayButton.displayName = 'Agenda.TodayButton';

const Body = forwardRef<HTMLDivElement, AgendaSectionProps>(({ className, ...rest }, ref) => {
  const { view } = useAgendaContext();
  return (
    <div
      ref={ref}
      data-slot="agenda-body"
      className={clsx('agenda__body', view === 'month' && 'agenda__body--month', className)}
      {...rest}
    />
  );
});
Body.displayName = 'Agenda.Body';

/** 周/日视图列头：日期 + 星期名，今天/周末打 data 标记 */
const WeekHeader = forwardRef<HTMLDivElement, AgendaSectionProps>(
  ({ className, ...rest }, ref) => {
    const { visibleDays, locale } = useAgendaContext();
    const today = startOfDay(new Date());
    const nameFormat = useMemo(
      () => new Intl.DateTimeFormat(locale, { weekday: 'short' }),
      [locale],
    );

    return (
      <div
        ref={ref}
        data-slot="agenda-week-header"
        className={clsx('agenda__week-header', className)}
        {...rest}
      >
        {visibleDays.map((day) => {
          const isToday = isSameDay(day, today);
          return (
            <div
              key={day.toISOString()}
              data-slot="agenda-day-header"
              data-today={isToday ? 'true' : undefined}
              data-weekend={isWeekend(day) ? 'true' : undefined}
              className="agenda__day-header"
            >
              <span
                data-slot="agenda-day-header-name"
                data-today={isToday ? 'true' : undefined}
                className="agenda__day-header-name"
              >
                {nameFormat.format(day)}
              </span>
              <span
                data-slot="agenda-day-header-date"
                data-today={isToday ? 'true' : undefined}
                className="agenda__day-header-date"
              >
                {day.getDate()}
              </span>
            </div>
          );
        })}
      </div>
    );
  },
);
WeekHeader.displayName = 'Agenda.WeekHeader';

const ChevronDownIcon = () => (
  <svg fill="none" height="10" viewBox="0 0 10 10" width="10">
    <path
      d="M3 4l2 2 2-2"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </svg>
);
ChevronDownIcon.displayName = 'Agenda.ChevronDownIcon';

export type AgendaAllDaySectionProps = Omit<AgendaSectionProps, 'children'> & {
  /** 折叠时每天的事件计数标签（原站 API，默认 "N events"） */
  collapsedLabel?: (count: number) => string;
  children?: ReactNode;
};

/** 全天事件区：CSS grid 跨列，自带展开/折叠 toggle，折叠时显示每天计数 */
const AllDaySection = forwardRef<HTMLDivElement, AgendaAllDaySectionProps>(
  ({ className, collapsedLabel, children, ...rest }, ref) => {
    const { visibleDays, allDayLayout } = useAgendaContext();
    const [expanded, setExpanded] = useState(true);

    const handleToggle = useCallback(() => setExpanded((prev) => !prev), []);

    const counts = useMemo(() => {
      const result = visibleDays.map(() => 0);
      for (const item of allDayLayout) {
        for (let col = item.colStart; col < item.colStart + item.colSpan; col += 1) {
          if (col >= 0 && col < result.length) result[col] += 1;
        }
      }
      return result;
    }, [visibleDays, allDayLayout]);

    const labelFor = collapsedLabel ?? ((count: number) => `${count} events`);

    return (
      <div
        ref={ref}
        data-slot="agenda-all-day-section"
        data-expanded={expanded ? 'true' : undefined}
        className={clsx('agenda__all-day-section', className)}
        style={{
          gridTemplateColumns: `repeat(${visibleDays.length}, minmax(0px, 1fr))`,
        }}
        {...rest}
      >
        <div className="agenda__all-day-dividers">
          {visibleDays.map((day) => (
            <div
              key={day.toISOString()}
              data-weekend={isWeekend(day) ? 'true' : undefined}
              className="agenda__all-day-divider"
            />
          ))}
        </div>
        <button
          type="button"
          aria-label={expanded ? 'Collapse all-day events' : 'Expand all-day events'}
          data-expanded={expanded ? 'true' : undefined}
          onClick={handleToggle}
          className="agenda__all-day-toggle"
        >
          <ChevronDownIcon />
        </button>
        {expanded
          ? children
          : counts.map((count, col) => (
              <div
                // eslint-disable-next-line react/no-array-index-key -- 折叠摘要按列序号定位，列数稳定
                key={col}
                data-slot="agenda-all-day-summary"
                className="agenda__all-day-summary"
                style={{ gridColumn: `${col + 1} / span 1` }}
              >
                {count > 0 ? labelFor(count) : null}
              </div>
            ))}
      </div>
    );
  },
);
AllDaySection.displayName = 'Agenda.AllDaySection';

export type AgendaAllDayLabelProps = HTMLAttributes<HTMLSpanElement>;

const AllDayLabel = forwardRef<HTMLSpanElement, AgendaAllDayLabelProps>(
  ({ className, ...rest }, ref) => (
    <span
      ref={ref}
      data-slot="agenda-all-day-label"
      className={clsx('agenda__all-day-label', className)}
      {...rest}
    />
  ),
);
AllDayLabel.displayName = 'Agenda.AllDayLabel';

/** 事件强调色 + 浅色背景的内联变量（与原站事件卡片一致） */
function eventColorStyle(color?: string): CSSProperties {
  if (color === undefined) return {};
  return {
    ['--agenda-event-accent' as string]: color,
    ['--agenda-event-color' as string]: `color-mix(in srgb, ${color} 15%, transparent)`,
  };
}

function accentStyle(color?: string): CSSProperties {
  if (color === undefined) return {};
  return { ['--agenda-event-accent' as string]: color };
}

export type AgendaAllDayEventProps = {
  event: AgendaEvent;
  /** 网格列起点（0 基） */
  colStart: number;
  colSpan: number;
  /** 堆叠行号（1 基对应 grid row） */
  row: number;
  className?: string;
};

const AllDayEvent = ({ event, colStart, colSpan, row, className }: AgendaAllDayEventProps) => {
  const { selectedEventId, setSelectedEventId } = useAgendaContext();

  const handleClick = useCallback(
    () => setSelectedEventId(event.id),
    [event.id, setSelectedEventId],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      data-slot="agenda-all-day-event"
      data-status={event.status ?? 'confirmed'}
      data-selected={selectedEventId === event.id ? 'true' : undefined}
      onClick={handleClick}
      className={clsx('agenda__all-day-event', className)}
      style={{
        gridArea: `${row + 1} / ${colStart + 1} / auto / span ${colSpan}`,
        ...accentStyle(event.color),
      }}
    >
      {event.title}
    </div>
  );
};
AllDayEvent.displayName = 'Agenda.AllDayEvent';

const TimeGrid = forwardRef<HTMLDivElement, AgendaSectionProps>(
  ({ className, children, ...rest }, ref) => {
    const { view } = useAgendaContext();
    const isDay = view === 'day';

    return (
      <div
        ref={ref}
        data-slot="agenda-time-grid"
        className={clsx(
          'agenda__time-grid',
          isDay ? 'agenda__time-grid--day' : 'agenda__time-grid--week',
          className,
        )}
        {...rest}
      >
        <TimeLabels />
        {children}
      </div>
    );
  },
);
TimeGrid.displayName = 'Agenda.TimeGrid';

/** 左侧小时标签列；首行（起始小时）按原站留空 */
const TimeLabels = () => {
  const { startHour, endHour, locale } = useAgendaContext();
  const hourFormat = useMemo(
    () => new Intl.DateTimeFormat(locale, { hour: 'numeric' }),
    [locale],
  );

  const hours = useMemo(
    () => Array.from({ length: endHour - startHour }, (_, i) => startHour + i),
    [startHour, endHour],
  );

  return (
    <div data-slot="agenda-time-labels" className="agenda__time-labels">
      {hours.map((hour, index) => (
        <div key={hour} data-slot="agenda-time-label" className="agenda__time-label">
          {index === 0 ? null : (
            <span>{hourFormat.format(new Date(2000, 0, 1, hour))}</span>
          )}
        </div>
      ))}
    </div>
  );
};
TimeLabels.displayName = 'Agenda.TimeLabels';

export type AgendaDayColumnProps = Omit<AgendaSectionProps, 'children'> & {
  date: Date;
  children?: ReactNode;
};

/** 一天的时间网格列：渲染逐小时 slot 行，事件作为绝对定位子元素叠加 */
const DayColumn = forwardRef<HTMLDivElement, AgendaDayColumnProps>(
  ({ date, className, children, ...rest }, ref) => {
    const { startHour, endHour } = useAgendaContext();
    const slotCount = endHour - startHour;
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate(),
    ).padStart(2, '0')}`;

    return (
      <div
        ref={ref}
        data-slot="agenda-day-column"
        data-date={dateKey}
        data-weekend={isWeekend(date) ? 'true' : undefined}
        className={clsx('agenda__day-column', className)}
        {...rest}
      >
        {Array.from({ length: slotCount }, (_, index) => (
          <div
            key={index}
            data-slot="agenda-time-slot"
            data-slot-index={index}
            data-last={index === slotCount - 1 ? 'true' : undefined}
            className="agenda__time-slot"
          />
        ))}
        {children}
      </div>
    );
  },
);
DayColumn.displayName = 'Agenda.DayColumn';

export type AgendaEventProps = {
  event: AgendaEvent;
  className?: string;
};

/** 定时事件卡片：依据起止时间在所在天列内绝对定位（top/height 按分钟换算 slot 高度） */
const Event = ({ event, className }: AgendaEventProps) => {
  const { selectedEventId, setSelectedEventId, startHour, slotDuration, locale } =
    useAgendaContext();

  const day = startOfDay(event.start);
  const startMin = minutesFromMidnight(event.start, day);
  const endMin = minutesFromMidnight(event.end, day);
  const top = ((startMin - startHour * 60) / slotDuration) * 60;
  const height = Math.max(20, ((endMin - startMin) / slotDuration) * 60);

  const timeFormat = useMemo(
    () => new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }),
    [locale],
  );

  const handleClick = useCallback(
    () => setSelectedEventId(event.id),
    [event.id, setSelectedEventId],
  );

  return (
    <div
      data-slot="agenda-event"
      data-event-id={event.id}
      data-status={event.status ?? 'confirmed'}
      data-readonly={event.isReadOnly ? 'true' : undefined}
      data-selected={selectedEventId === event.id ? 'true' : undefined}
      onClick={handleClick}
      className={clsx('agenda__event', className)}
      style={{ top, height, ...eventColorStyle(event.color) }}
    >
      <span data-slot="agenda-event-title" className="agenda__event-title">
        {event.title}
      </span>
      <span data-slot="agenda-event-time" className="agenda__event-time">
        {timeFormat.format(event.start)} – {timeFormat.format(event.end)}
      </span>
      {!event.isReadOnly && <div className="agenda__resize-handle" />}
    </div>
  );
};
Event.displayName = 'Agenda.Event';

/** 实时当前时间指示线：每分钟刷新，仅在覆盖今天时高亮对应列 */
const CurrentTimeIndicator = forwardRef<HTMLDivElement, AgendaSectionProps>(
  ({ className, ...rest }, ref) => {
    const { startHour, endHour, slotDuration, visibleDays, locale } = useAgendaContext();
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
      const timer = setInterval(() => setNow(new Date()), 60_000);
      return () => clearInterval(timer);
    }, []);

    const minutes = now.getHours() * 60 + now.getMinutes();
    const slotIndex = (minutes - startHour * 60) / slotDuration;
    const visible = minutes >= startHour * 60 && minutes <= endHour * 60;

    const todayCol = visibleDays.findIndex((day) => isSameDay(day, now));
    const colCount = visibleDays.length;

    const timeFormat = useMemo(
      () => new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: false }),
      [locale],
    );

    if (!visible || todayCol === -1) return null;

    return (
      <div
        ref={ref}
        data-slot="agenda-current-time-indicator"
        className={clsx('agenda__current-time-indicator', className)}
        style={{ top: `calc(var(--agenda-slot-height) * ${slotIndex})` }}
        {...rest}
      >
        <div className="agenda__current-time-label-wrap">
          <span data-slot="agenda-current-time-label" className="agenda__current-time-label">
            {timeFormat.format(now)}
          </span>
        </div>
        <div data-slot="agenda-current-time-line" className="agenda__current-time-track">
          <div className="agenda__current-time-line--faded" />
          <div
            className="agenda__current-time-line--active"
            style={{
              left: `${(todayCol / colCount) * 100}%`,
              width: `${(1 / colCount) * 100}%`,
            }}
          />
        </div>
      </div>
    );
  },
);
CurrentTimeIndicator.displayName = 'Agenda.CurrentTimeIndicator';

const MonthGrid = forwardRef<HTMLDivElement, AgendaSectionProps>(
  ({ className, children, ...rest }, ref) => {
    const { locale } = useAgendaContext();
    const nameFormat = useMemo(
      () => new Intl.DateTimeFormat(locale, { weekday: 'short' }),
      [locale],
    );
    // 周一为周首，给出 7 个工作日名占位
    const weekdayAnchor = startOfWeek(new Date(2024, 0, 1));
    const today = startOfDay(new Date());

    return (
      <div
        ref={ref}
        data-slot="agenda-month-grid"
        className={clsx('agenda__month-grid', className)}
        {...rest}
      >
        <div className="agenda__month-weekday-header">
          {Array.from({ length: 7 }, (_, i) => {
            const anchor = addDays(weekdayAnchor, i);
            return (
              <div
                key={i}
                data-today={anchor.getDay() === today.getDay() ? 'true' : undefined}
                className="agenda__month-weekday"
              >
                {nameFormat.format(anchor)}
              </div>
            );
          })}
        </div>
        {children}
      </div>
    );
  },
);
MonthGrid.displayName = 'Agenda.MonthGrid';

export type AgendaMonthRowProps = Omit<AgendaSectionProps, 'children'> & {
  /** 本周跨天条占用的最大行数（决定顶部留白变量） */
  spanningRowCount?: number;
  children?: ReactNode;
};

const MonthRow = forwardRef<HTMLDivElement, AgendaMonthRowProps>(
  ({ spanningRowCount = 0, className, children, style, ...rest }, ref) => (
    <div
      ref={ref}
      data-slot="agenda-month-row"
      className={clsx('agenda__month-row', className)}
      style={{
        ['--agenda-month-spanning-zone' as string]: `calc(${spanningRowCount} * (var(--agenda-month-event-height) + var(--agenda-month-event-gap)))`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  ),
);
MonthRow.displayName = 'Agenda.MonthRow';

export type AgendaMonthCellProps = Omit<AgendaSectionProps, 'children'> & {
  date: Date;
  /** 溢出前最多展示的事件数（原站 API，默认 2） */
  maxEvents?: number;
  /** 溢出链接文案（原站 API，默认 "N more"） */
  moreLabel?: (count: number) => string;
  /** 本列上方跨天条占用的行数 */
  spanningRowCount?: number;
  children?: ReactNode;
};

/** 月视图单元格：日期数字按钮（点击进入日视图），事件溢出折叠为 "N more" */
const MonthCell = forwardRef<HTMLDivElement, AgendaMonthCellProps>(
  (
    { date, maxEvents = 2, moreLabel, spanningRowCount = 0, className, children, style, ...rest },
    ref,
  ) => {
    const { date: focusedDate, setDate, setView } = useAgendaContext();
    const today = startOfDay(new Date());
    const isOutsideMonth = date.getMonth() !== focusedDate.getMonth();
    const firstOfMonth = date.getDate() === 1;
    const locale = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
    const monthDayFormat = useMemo(
      () => new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }),
      [locale],
    );

    const events = Array.isArray(children) ? children : children !== undefined ? [children] : [];
    const visibleEvents = events.slice(0, maxEvents);
    const overflow = events.length - visibleEvents.length;
    const labelFor = moreLabel ?? ((count: number) => `${count} more`);

    const handleDateClick = useCallback(() => {
      setDate(date);
      setView('day');
    }, [date, setDate, setView]);

    const handleMoreClick = useCallback(() => {
      setDate(date);
      setView('day');
    }, [date, setDate, setView]);

    return (
      <div
        ref={ref}
        data-slot="agenda-month-cell"
        data-weekend={isWeekend(date) ? 'true' : undefined}
        data-today={isSameDay(date, today) ? 'true' : undefined}
        data-outside-month={isOutsideMonth ? 'true' : undefined}
        className={clsx('agenda__month-cell', className)}
        style={{
          ['--agenda-month-spanning-zone' as string]: `calc(${spanningRowCount} * (var(--agenda-month-event-height) + var(--agenda-month-event-gap)))`,
          ...style,
        }}
        {...rest}
      >
        <button
          type="button"
          data-slot="agenda-month-cell-date"
          data-today={isSameDay(date, today) ? 'true' : undefined}
          onClick={handleDateClick}
          className="agenda__month-cell-date"
        >
          {firstOfMonth ? monthDayFormat.format(date) : date.getDate()}
        </button>
        {visibleEvents}
        {overflow > 0 && (
          <button
            type="button"
            data-slot="agenda-month-cell-more"
            onClick={handleMoreClick}
            className="agenda__month-cell-more"
          >
            {labelFor(overflow)}
          </button>
        )}
      </div>
    );
  },
);
MonthCell.displayName = 'Agenda.MonthCell';

export type AgendaMonthSpanningEventProps = {
  event: AgendaEvent;
  colStart: number;
  colSpan: number;
  row: number;
  className?: string;
};

/** 月视图跨天条：绝对定位横跨多列，top 按行号叠放 */
const MonthSpanningEvent = ({
  event,
  colStart,
  colSpan,
  row,
  className,
}: AgendaMonthSpanningEventProps) => {
  const { selectedEventId, setSelectedEventId } = useAgendaContext();

  const handleClick = useCallback(
    () => setSelectedEventId(event.id),
    [event.id, setSelectedEventId],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      data-slot="agenda-month-spanning-event"
      data-status={event.status ?? 'confirmed'}
      data-selected={selectedEventId === event.id ? 'true' : undefined}
      onClick={handleClick}
      className={clsx('agenda__month-spanning-event', className)}
      style={{
        position: 'absolute',
        left: `calc(${(colStart / 7) * 100}% + 2px)`,
        width: `calc(${(colSpan / 7) * 100}% - 4px)`,
        top: `calc(var(--agenda-month-date-offset) + ${row} * (var(--agenda-month-event-height) + var(--agenda-month-event-gap)))`,
        height: 'var(--agenda-month-event-height)',
        ...accentStyle(event.color),
      }}
    >
      {event.title}
    </div>
  );
};
MonthSpanningEvent.displayName = 'Agenda.MonthSpanningEvent';

export type AgendaMonthEventProps = {
  event: AgendaEvent;
  className?: string;
};

/** 月视图单日事件（cell 内流式排列） */
const MonthEvent = ({ event, className }: AgendaMonthEventProps) => {
  const { selectedEventId, setSelectedEventId, locale } = useAgendaContext();
  const timeFormat = useMemo(
    () => new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }),
    [locale],
  );

  const handleClick = useCallback(
    () => setSelectedEventId(event.id),
    [event.id, setSelectedEventId],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      data-slot="agenda-month-event"
      data-event-id={event.id}
      data-status={event.status ?? 'confirmed'}
      data-selected={selectedEventId === event.id ? 'true' : undefined}
      onClick={handleClick}
      className={clsx('agenda__month-event', className)}
      style={eventColorStyle(event.color)}
    >
      {event.isAllDay ? event.title : `${timeFormat.format(event.start)} ${event.title}`}
    </div>
  );
};
MonthEvent.displayName = 'Agenda.MonthEvent';

const Agenda = Object.assign(AgendaRoot, {
  Header,
  Heading,
  ViewSelector,
  Navigation,
  NavButton,
  TodayButton,
  Body,
  WeekHeader,
  AllDaySection,
  AllDayLabel,
  AllDayEvent,
  TimeGrid,
  DayColumn,
  Event,
  CurrentTimeIndicator,
  MonthGrid,
  MonthRow,
  MonthCell,
  MonthSpanningEvent,
  MonthEvent,
});

export default Agenda;
