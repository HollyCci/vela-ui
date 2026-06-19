import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

export type KpiStatus = 'success' | 'warning' | 'danger';

/** 趋势方向：上升/下降/持平，对齐 HeroUI Pro KPI.Trend 的语义 */
export type KpiTrendDirection = 'up' | 'down' | 'neutral';

export type KpiProps = HTMLAttributes<HTMLDivElement>;

type SectionProps = HTMLAttributes<HTMLDivElement>;

export type KpiIconProps = HTMLAttributes<HTMLDivElement> & {
  status?: KpiStatus;
};

export type KpiValueProps = HTMLAttributes<HTMLDivElement> & {
  /** 数值；提供时按 format 或 toLocaleString 渲染，否则回退到 children */
  value?: number;
  /** 自定义格式化器；优先于默认的 toLocaleString */
  format?: (value: number) => ReactNode;
};

export type KpiTrendProps = HTMLAttributes<HTMLDivElement> & {
  /** 趋势方向；设置 data-trend 并渲染方向箭头，children 仍照常渲染 */
  trend?: KpiTrendDirection;
};

/** 各方向对应的箭头字符，up/down 用三角，neutral 用横杠 */
const TREND_ARROW: Record<KpiTrendDirection, string> = {
  up: '▲',
  down: '▼',
  neutral: '—',
};

/** 方向对应的语义色，沿用主题色变量，无需新增 CSS */
const TREND_COLOR: Record<KpiTrendDirection, string> = {
  up: 'var(--success)',
  down: 'var(--danger)',
  neutral: 'var(--muted)',
};

const KpiRoot = forwardRef<HTMLDivElement, KpiProps>(({ className, ...rest }, ref) => (
  <div ref={ref} data-slot="kpi" className={clsx('kpi', className)} {...rest} />
));
KpiRoot.displayName = 'Kpi';

const Header = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('kpi__header', className)} {...rest} />
));
Header.displayName = 'Kpi.Header';

const Content = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('kpi__content', className)} {...rest} />
));
Content.displayName = 'Kpi.Content';

const Icon = forwardRef<HTMLDivElement, KpiIconProps>(({ status, className, ...rest }, ref) => (
  <div
    ref={ref}
    data-status={status}
    aria-hidden="true"
    className={clsx('kpi__icon', className)}
    {...rest}
  />
));
Icon.displayName = 'Kpi.Icon';

const Title = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('kpi__title', className)} {...rest} />
));
Title.displayName = 'Kpi.Title';

const Value = forwardRef<HTMLDivElement, KpiValueProps>(
  ({ value, format, className, children, ...rest }, ref) => {
    // 提供 value 时走格式化路径；否则保持 children 直通（向后兼容）
    const content =
      value === undefined ? children : format ? format(value) : value.toLocaleString();
    return (
      <div ref={ref} className={clsx('kpi__value', className)} {...rest}>
        {content}
      </div>
    );
  },
);
Value.displayName = 'Kpi.Value';

const Trend = forwardRef<HTMLDivElement, KpiTrendProps>(
  ({ trend, className, children, ...rest }, ref) => (
    <div ref={ref} data-trend={trend} className={clsx('kpi__trend', className)} {...rest}>
      {/* 有方向时前置一个 aria-hidden 箭头并按方向上色，仅作视觉提示，语义留给 children */}
      {trend ? (
        <span aria-hidden="true" style={{ color: TREND_COLOR[trend] }}>
          {TREND_ARROW[trend]}{' '}
        </span>
      ) : null}
      {children}
    </div>
  ),
);
Trend.displayName = 'Kpi.Trend';

const Progress = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('kpi__progress', className)} {...rest} />
));
Progress.displayName = 'Kpi.Progress';

const Chart = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('kpi__chart', className)} {...rest} />
));
Chart.displayName = 'Kpi.Chart';

const KpiSeparator = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    role="separator"
    className={clsx('kpi__separator', 'separator', 'separator--horizontal', className)}
    {...rest}
  />
));
KpiSeparator.displayName = 'Kpi.Separator';

const Footer = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('kpi__footer', className)} {...rest} />
));
Footer.displayName = 'Kpi.Footer';

const Actions = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('kpi__actions', className)} {...rest} />
));
Actions.displayName = 'Kpi.Actions';

const Kpi = Object.assign(KpiRoot, {
  Header,
  Content,
  Icon,
  Title,
  Value,
  Trend,
  Progress,
  Chart,
  Separator: KpiSeparator,
  Footer,
  Actions,
});

export default Kpi;
