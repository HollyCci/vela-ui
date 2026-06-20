'use client';

import { forwardRef, useId, type HTMLAttributes, type ReactNode } from 'react';
import { Area, AreaChart as RechartsAreaChart, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';
import Card, { type CardProps } from '../card';
import NumberValue, { type NumberValueProps } from '../number-value';
import TrendChip, { type TrendChipProps } from '../trend-chip';
import ProgressBar, { type ProgressBarColor } from '../progress-bar';
import Button, { type ButtonProps } from '../button';
import Separator, { type SeparatorProps } from '../separator';

export type KpiStatus = 'success' | 'warning' | 'danger';

const STATUS_TO_COLOR: Record<KpiStatus, ProgressBarColor> = {
  success: 'success',
  warning: 'warning',
  danger: 'danger',
};

type SectionProps = HTMLAttributes<HTMLDivElement>;

/** 根：包 HeroUI Card（对齐 Pro「Wraps HeroUI Card」），叠加 .kpi 布局 */
export type KpiProps = CardProps;
const KpiRoot = forwardRef<HTMLDivElement, KpiProps>(({ className, ...rest }, ref) => (
  <Card ref={ref} data-slot="kpi" className={clsx('kpi', className)} {...rest} />
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

export type KpiIconProps = SectionProps & { status?: KpiStatus };
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

/** 指标标签。Pro 文档标 <dt>，但其布局把 Title 放 Header、Value 放 Content，无法组成合法 <dl>
 *  （dt/dd 脱离 dl 会触发 axe 违规），故用 div 保 a11y 干净。 */
const Title = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('kpi__title', className)} {...rest} />
));
Title.displayName = 'Kpi.Title';

/**
 * 大号数值：对齐 Pro 包 NumberValue。提供 value 时走 NumberValue 格式化路径，children 为渲染函数
 * 时收 formatted 字符串；二者皆无则回退直渲 children（兼容旧调用点）。
 * （Pro 文档标 <dd>，同 Title 原因用 div 保 a11y 干净。）
 */
export type KpiValueProps = Omit<NumberValueProps, 'value' | 'children'> & {
  value?: number;
  className?: string;
  children?: ReactNode | ((formatted: string) => ReactNode);
};
const Value = forwardRef<HTMLDivElement, KpiValueProps>(
  ({ value, className, children, ...numberValueProps }, ref) => {
    let content: ReactNode;
    if (typeof children === 'function') {
      const formatted =
        value === undefined
          ? ''
          : new Intl.NumberFormat(numberValueProps.locale, numberValueProps.formatOptions).format(value);
      content = children(formatted);
    } else if (value !== undefined) {
      content = <NumberValue value={value} {...numberValueProps} />;
    } else {
      content = children;
    }
    return (
      <div ref={ref} className={clsx('kpi__value', className)}>
        {content}
      </div>
    );
  },
);
Value.displayName = 'Kpi.Value';

/**
 * 趋势徽标：对齐 Pro 包 TrendChip。提供 value 时渲染 TrendChip（支持其全部 props）；
 * 否则回退为承载 children 的 span（兼容旧调用点）。
 */
export type KpiTrendProps = Omit<TrendChipProps, 'value'> & {
  value?: TrendChipProps['value'];
  children?: ReactNode;
};
const Trend = forwardRef<HTMLSpanElement, KpiTrendProps>((props, ref) => {
  if (props.value !== undefined) {
    const { className, children: _children, ...trendChipProps } = props;
    return (
      <TrendChip
        ref={ref}
        value={props.value}
        className={clsx('kpi__trend', className)}
        {...trendChipProps}
      />
    );
  }
  return (
    <span ref={ref} className={clsx('kpi__trend', props.className)}>
      {props.children}
    </span>
  );
});
Trend.displayName = 'Kpi.Trend';

/**
 * 进度条：对齐 Pro 的 value(0-100) + status，自渲 ProgressBar；提供 children 时回退直渲。
 */
export type KpiProgressProps = SectionProps & {
  value?: number;
  status?: KpiStatus;
};
const Progress = forwardRef<HTMLDivElement, KpiProgressProps>(
  ({ value, status = 'success', className, children, ...rest }, ref) => (
    <div ref={ref} className={clsx('kpi__progress', className)} {...rest}>
      {value !== undefined ? (
        <ProgressBar value={value} color={STATUS_TO_COLOR[status]} />
      ) : (
        children
      )}
    </div>
  ),
);
Progress.displayName = 'Kpi.Progress';

/**
 * 迷你走势图：对齐 Pro 的 Recharts area sparkline（data/dataKey/color/fillColor/height/strokeWidth）；
 * 提供 children 时回退直渲。
 */
export type KpiChartProps = Omit<SectionProps, 'color'> & {
  data?: Array<Record<string, number | string>>;
  dataKey?: string;
  color?: string;
  fillColor?: string;
  height?: number;
  strokeWidth?: number;
  children?: ReactNode;
};
const Chart = forwardRef<HTMLDivElement, KpiChartProps>(
  (
    { data, dataKey = 'value', color = 'currentColor', fillColor, height = 80, strokeWidth = 2, className, children, ...rest },
    ref,
  ) => {
    const gradientId = useId();
    return (
      <div ref={ref} className={clsx('kpi__chart', className)} {...rest}>
        {data ? (
          <ResponsiveContainer width="100%" height={height}>
            <RechartsAreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={fillColor ?? color} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={fillColor ?? color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={strokeWidth}
                fill={`url(#${gradientId})`}
                dot={false}
                isAnimationActive={false}
              />
            </RechartsAreaChart>
          </ResponsiveContainer>
        ) : (
          children
        )}
      </div>
    );
  },
);
Chart.displayName = 'Kpi.Chart';

const ThreeDotIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="12" cy="5" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="12" cy="19" r="1.6" />
  </svg>
);

/** 操作按钮：对齐 Pro 包 Button（ghost 图标钮），默认三点图标，children 可替换图标 */
export type KpiActionsProps = ButtonProps;
const Actions = forwardRef<HTMLButtonElement, KpiActionsProps>(
  ({ children, className, 'aria-label': ariaLabel, ...rest }, ref) => (
    <Button
      ref={ref}
      variant="ghost"
      size="sm"
      isIconOnly
      aria-label={ariaLabel ?? 'More options'}
      className={clsx('kpi__actions', className)}
      {...rest}
    >
      {children ?? <ThreeDotIcon />}
    </Button>
  ),
);
Actions.displayName = 'Kpi.Actions';

/** 出血分隔线：对齐 Pro 包 HeroUI Separator */
const KpiSeparator = forwardRef<HTMLDivElement, SeparatorProps>(({ className, ...rest }, ref) => (
  <Separator ref={ref} className={clsx('kpi__separator', className)} {...rest} />
));
KpiSeparator.displayName = 'Kpi.Separator';

const Footer = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('kpi__footer', className)} {...rest} />
));
Footer.displayName = 'Kpi.Footer';

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
