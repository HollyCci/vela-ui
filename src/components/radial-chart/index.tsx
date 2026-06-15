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
  RadialBarChart,
  RadialBar,
  Cell,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  Legend,
  Label,
  LabelList,
} from 'recharts';

type ChartDatum = Record<string, number | string>;
type RechartsRadialBarChartProps = ComponentProps<typeof RadialBarChart>;
type RadialChartLevelProps = Pick<
  RechartsRadialBarChartProps,
  | 'accessibilityLayer'
  | 'barCategoryGap'
  | 'barGap'
  | 'barSize'
  | 'cursor'
  | 'cx'
  | 'cy'
  | 'dataKey'
  | 'desc'
  | 'endAngle'
  | 'innerRadius'
  | 'margin'
  | 'maxBarSize'
  | 'outerRadius'
  | 'responsive'
  | 'reverseStackOrder'
  | 'stackOffset'
  | 'startAngle'
  | 'syncId'
  | 'syncMethod'
  | 'throttleDelay'
  | 'throttledEvents'
  | 'onClick'
  | 'onContextMenu'
  | 'onDoubleClick'
  | 'onMouseDown'
  | 'onMouseEnter'
  | 'onMouseLeave'
  | 'onMouseMove'
  | 'onMouseUp'
  | 'onTouchEnd'
  | 'onTouchMove'
  | 'onTouchStart'
>;
type RadialChartContainerProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'className' | 'style' | keyof RadialChartLevelProps
>;

export type RadialChartProps = RadialChartContainerProps & RadialChartLevelProps & {
  className?: string;
  style?: CSSProperties;
  /** 图表数据，每个对象对应一个同心环 */
  data: ChartDatum[];
  /** 图表高度（像素），默认 300 */
  height?: number;
  /** 图表宽度，像素或百分比字符串，默认 "100%" */
  width?: number | `${number}%`;
  /** 条带厚度（像素），默认 10 */
  barSize?: number;
  /** 条带区域内半径，默认 "30%" */
  innerRadius?: number | string;
  /** 条带区域外半径，默认 "80%" */
  outerRadius?: number | string;
  /** 起始角度（度），默认 90 */
  startAngle?: number;
  /** 结束角度（度），默认 -270 */
  endAngle?: number;
  /** recharts 子组件（RadialChart.Bar / RadialChart.AngleAxis 等） */
  children?: ReactNode;
};

/** recharts 内置 tooltip 项的运行时结构 */
type TooltipPayloadEntry = {
  name?: ReactNode;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
  payload?: ChartDatum & { fill?: string };
};

export type RadialChartTooltipContentProps = {
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

/** 取扇区颜色：radial 的 payload 把 fill 挂在内层 payload 上，回退到 entry.color */
function resolveColor(entry: TooltipPayloadEntry): string | undefined {
  return entry.payload?.fill ?? entry.color;
}

/** 预置的 recharts tooltip content 渲染器，输出参考实现 chart-tooltip BEM 结构 */
function TooltipContent({
  active,
  payload,
  label,
  indicator = 'dot',
  valueFormatter,
  labelFormatter,
  className,
}: RadialChartTooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div role="tooltip" className={clsx('chart-tooltip', className)}>
      {label !== undefined && label !== null && (
        <div className="chart-tooltip__header">
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      )}
      {payload.map((entry, index) => (
        <div className="chart-tooltip__item" key={String(entry.dataKey ?? entry.name ?? index)}>
          <span
            className={clsx('chart-tooltip__indicator', `chart-tooltip__indicator--${indicator}`)}
            style={{ backgroundColor: resolveColor(entry) }}
            aria-hidden="true"
          />
          <span className="chart-tooltip__label">{entry.name}</span>
          <span className="chart-tooltip__value">
            {valueFormatter && entry.value !== undefined
              ? valueFormatter(entry.value, entry)
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}
TooltipContent.displayName = 'RadialChart.TooltipContent';

const RadialChartRoot = forwardRef<HTMLDivElement, RadialChartProps>(
  (
    {
      className,
      style,
      accessibilityLayer,
      barCategoryGap,
      barGap,
      data,
      dataKey,
      desc,
      height = 300,
      width = '100%',
      barSize = 10,
      cursor,
      cx,
      cy,
      innerRadius = '30%',
      outerRadius = '80%',
      startAngle = 90,
      endAngle = -270,
      margin,
      maxBarSize,
      onClick,
      onContextMenu,
      onDoubleClick,
      onMouseDown,
      onMouseEnter,
      onMouseLeave,
      onMouseMove,
      onMouseUp,
      onTouchEnd,
      onTouchMove,
      onTouchStart,
      responsive,
      reverseStackOrder,
      stackOffset,
      syncId,
      syncMethod,
      throttleDelay,
      throttledEvents,
      children,
      ...rest
    },
    ref,
  ) => {
    const chartProps: RadialChartLevelProps = {
      accessibilityLayer,
      barCategoryGap,
      barGap,
      barSize,
      cursor,
      cx,
      cy,
      dataKey,
      desc,
      endAngle,
      innerRadius,
      margin,
      maxBarSize,
      onClick,
      onContextMenu,
      onDoubleClick,
      onMouseDown,
      onMouseEnter,
      onMouseLeave,
      onMouseMove,
      onMouseUp,
      onTouchEnd,
      onTouchMove,
      onTouchStart,
      outerRadius,
      responsive,
      reverseStackOrder,
      stackOffset,
      startAngle,
      syncId,
      syncMethod,
      throttleDelay,
      throttledEvents,
    };

    return (
      <div
        ref={ref}
        className={clsx('radial-chart', className)}
        style={style}
        data-slot="radial-chart"
        {...rest}
      >
        <ResponsiveContainer width={width} height={height}>
          <RadialBarChart data={data} {...chartProps}>
            {children}
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    );
  },
);
RadialChartRoot.displayName = 'RadialChart';

const RadialChart = Object.assign(RadialChartRoot, {
  Bar: RadialBar,
  Cell,
  AngleAxis: PolarAngleAxis,
  RadiusAxis: PolarRadiusAxis,
  Tooltip,
  Legend,
  Label,
  LabelList,
  TooltipContent,
});

export default RadialChart;
