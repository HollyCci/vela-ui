'use client';

import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import clsx from 'clsx';
import {
  ResponsiveContainer,
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import ChartTooltip from '../chart-tooltip';

type ChartDatum = Record<string, number | string>;

type ChartMargin = { top?: number; right?: number; bottom?: number; left?: number };

export type AreaChartProps = Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
  /** 图表数据：每条记录对应一个 x 轴刻度，字段为各系列数值 */
  data: ChartDatum[];
  /** 图表高度（像素），默认 300 */
  height?: number;
  /** 图表宽度，像素或百分比字符串，默认 "100%" */
  width?: number | `${number}%`;
  /** recharts 图表内边距 */
  margin?: ChartMargin;
  /** recharts 子组件（AreaChart.Area / AreaChart.XAxis 等） */
  children?: ReactNode;
};

const DEFAULT_MARGIN: ChartMargin = { top: 8, right: 8, bottom: 0, left: 0 };

/** recharts 内置 tooltip 项的运行时结构（不同图共用） */
type TooltipPayloadEntry = {
  name?: ReactNode;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
  payload?: ChartDatum;
};

export type AreaChartTooltipContentProps = {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: ReactNode;
  /** 指示器形态，默认 dot */
  indicator?: 'dot' | 'line';
  /** 数值格式化 */
  valueFormatter?: (value: number | string, entry: TooltipPayloadEntry) => ReactNode;
  /** 标签格式化 */
  labelFormatter?: (label: ReactNode) => ReactNode;
  className?: string;
};

/** 预置的 recharts tooltip content 渲染器，输出参考实现 chart-tooltip BEM 结构 */
function TooltipContent({
  active,
  payload,
  label,
  indicator = 'dot',
  valueFormatter,
  labelFormatter,
  className,
}: AreaChartTooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <ChartTooltip className={className}>
      {label !== undefined && label !== null && (
        <ChartTooltip.Header>
          {labelFormatter ? labelFormatter(label) : label}
        </ChartTooltip.Header>
      )}
      {payload.map((entry, index) => (
        <ChartTooltip.Item
          key={String(entry.dataKey ?? index)}
          indicator={indicator}
          indicatorColor={entry.color}
          label={entry.name}
          value={
            valueFormatter && entry.value !== undefined
              ? valueFormatter(entry.value, entry)
              : entry.value
          }
        />
      ))}
    </ChartTooltip>
  );
}
TooltipContent.displayName = 'AreaChart.TooltipContent';

const AreaChartRoot = forwardRef<HTMLDivElement, AreaChartProps>(
  (
    { className, style, data, height = 300, width = '100%', margin = DEFAULT_MARGIN, children, ...rest },
    ref,
  ) => (
    <div
      ref={ref}
      className={clsx('area-chart', className)}
      style={style}
      data-slot="area-chart"
      {...rest}
    >
      <ResponsiveContainer width={width} height={height}>
        <RechartsAreaChart data={data} margin={margin}>
          {children}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  ),
);
AreaChartRoot.displayName = 'AreaChart';

const AreaChart = Object.assign(AreaChartRoot, {
  Area,
  XAxis,
  YAxis,
  Grid: CartesianGrid,
  Tooltip,
  TooltipContent,
});

export default AreaChart;
