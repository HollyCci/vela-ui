'use client';

import {
  forwardRef,
  type ComponentProps,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import clsx from 'clsx';
import {
  ResponsiveContainer,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  type TooltipContentProps,
  type TooltipPayloadEntry,
} from 'recharts';

/** 原站数据项：含 category 键与数值系列字段 */
export type RadarChartDatum = Record<string, number | string>;

export type RadarChartProps = Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'style'> & {
  /** 图表数据 */
  data?: RadarChartDatum[];
  /** 图表高度（px） */
  height?: number;
  /** 图表宽度，px 数字或百分比字符串 */
  width?: number | `${number}%`;
  /** recharts 子组件（Radar / Grid / AngleAxis / RadiusAxis / Tooltip） */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const RadarChartRoot = forwardRef<HTMLDivElement, RadarChartProps>(
  ({ data, height = 300, width = '100%', children, className, style, ...rest }, ref) => (
    <div
      ref={ref}
      className={clsx('radar-chart', className)}
      data-slot="radar-chart"
      style={style}
      {...rest}
    >
      <ResponsiveContainer width={width} height={height}>
        <RechartsRadarChart data={data}>{children}</RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  ),
);
RadarChartRoot.displayName = 'RadarChart';

/** PolarGrid 透传，默认 polygon 网格（原站为多边形同心网格） */
const Grid = (props: ComponentProps<typeof PolarGrid>) => <PolarGrid {...props} />;
Grid.displayName = 'RadarChart.Grid';

const AngleAxis = (props: ComponentProps<typeof PolarAngleAxis>) => <PolarAngleAxis {...props} />;
AngleAxis.displayName = 'RadarChart.AngleAxis';

const RadiusAxis = (props: ComponentProps<typeof PolarRadiusAxis>) => (
  <PolarRadiusAxis {...props} />
);
RadiusAxis.displayName = 'RadarChart.RadiusAxis';

const RadarSeries = (props: ComponentProps<typeof Radar>) => <Radar {...props} />;
RadarSeries.displayName = 'RadarChart.Radar';

const ChartTooltip = (props: ComponentProps<typeof Tooltip>) => <Tooltip {...props} />;
ChartTooltip.displayName = 'RadarChart.Tooltip';

export type RadarChartTooltipContentProps = Partial<
  TooltipContentProps<number | string, number | string>
> & {
  /** 隐藏头部标题行 */
  hideHeader?: boolean;
  /** 指示器形态 */
  indicator?: 'dot' | 'line';
  /** 头部标签格式化 */
  labelFormatter?: (label: number | string) => ReactNode;
  /** 系列值格式化 */
  valueFormatter?: (value: number | string) => ReactNode;
};

/** recharts payload 条目颜色：优先 color，回退 stroke/fill */
function resolveColor(entry: TooltipPayloadEntry): string | undefined {
  if (entry.color) return entry.color;
  const stroke = (entry as { stroke?: string }).stroke;
  if (stroke && stroke !== 'none') return stroke;
  return (entry as { fill?: string }).fill;
}

/** 直接渲染原站 .chart-tooltip BEM 结构的 recharts content；作为 RadarChart.Tooltip 的 content 传入 */
function TooltipContent({
  active,
  payload,
  label,
  hideHeader = false,
  indicator = 'dot',
  labelFormatter,
  valueFormatter,
}: RadarChartTooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div role="tooltip" className="chart-tooltip">
      {!hideHeader && label !== undefined && label !== '' && (
        <div className="chart-tooltip__header">{labelFormatter ? labelFormatter(label) : label}</div>
      )}
      {payload.map((entry, index) => {
        const color = resolveColor(entry);
        const value = entry.value;
        // recharts value 可能为数组，只对标量值应用 valueFormatter
        const renderedValue =
          valueFormatter && (typeof value === 'number' || typeof value === 'string')
            ? valueFormatter(value)
            : (value as ReactNode);
        return (
          <div className="chart-tooltip__item" key={`${entry.dataKey ?? entry.name ?? index}`}>
            <span
              className={clsx(
                'chart-tooltip__indicator',
                `chart-tooltip__indicator--${indicator}`,
              )}
              style={color !== undefined ? { backgroundColor: color } : undefined}
              aria-hidden="true"
            />
            <span className="chart-tooltip__label">{entry.name as ReactNode}</span>
            <span className="chart-tooltip__value">{renderedValue}</span>
          </div>
        );
      })}
    </div>
  );
}
TooltipContent.displayName = 'RadarChart.TooltipContent';

const RadarChart = Object.assign(RadarChartRoot, {
  Grid,
  AngleAxis,
  RadiusAxis,
  Radar: RadarSeries,
  Tooltip: ChartTooltip,
  TooltipContent,
});

export default RadarChart;
