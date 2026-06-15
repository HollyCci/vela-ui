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
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Brush,
  ReferenceLine,
  ReferenceArea,
  ReferenceDot,
  Cell,
  Label,
  LabelList,
} from 'recharts';

type ChartDatum = Record<string, number | string>;

type ChartMargin = { top?: number; right?: number; bottom?: number; left?: number };
type RechartsBarChartProps = ComponentProps<typeof RechartsBarChart>;
type BarChartLevelProps = Pick<
  RechartsBarChartProps,
  | 'accessibilityLayer'
  | 'barCategoryGap'
  | 'barGap'
  | 'barSize'
  | 'baseValue'
  | 'compact'
  | 'cursor'
  | 'dataKey'
  | 'desc'
  | 'layout'
  | 'maxBarSize'
  | 'responsive'
  | 'reverseStackOrder'
  | 'stackOffset'
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
type BarChartContainerProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'className' | 'style' | keyof BarChartLevelProps
>;

export type BarChartProps = BarChartContainerProps & BarChartLevelProps & {
  className?: string;
  style?: CSSProperties;
  /** 图表数据：每条记录对应一个分类，字段为各系列数值 */
  data: ChartDatum[];
  /** 图表高度（像素），默认 300 */
  height?: number;
  /** 图表宽度，像素或百分比字符串，默认 "100%" */
  width?: number | `${number}%`;
  /** 柱方向；"vertical" 即横向条形图，默认 "horizontal" */
  layout?: 'horizontal' | 'vertical';
  /** recharts 图表内边距 */
  margin?: ChartMargin;
  /** recharts 子组件（BarChart.Bar / BarChart.XAxis 等） */
  children?: ReactNode;
};

const DEFAULT_MARGIN: ChartMargin = { top: 8, right: 8, bottom: 0, left: 0 };

/** recharts 内置 tooltip 项的运行时结构 */
type TooltipPayloadEntry = {
  name?: ReactNode;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
  payload?: ChartDatum;
};

export type BarChartTooltipContentProps = {
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
}: BarChartTooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div role="tooltip" className={clsx('chart-tooltip', className)}>
      {label !== undefined && label !== null && (
        <div className="chart-tooltip__header">
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      )}
      {payload.map((entry, index) => (
        <div className="chart-tooltip__item" key={String(entry.dataKey ?? index)}>
          <span
            className={clsx('chart-tooltip__indicator', `chart-tooltip__indicator--${indicator}`)}
            style={{ backgroundColor: entry.color }}
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
TooltipContent.displayName = 'BarChart.TooltipContent';

const BarChartRoot = forwardRef<HTMLDivElement, BarChartProps>(
  (
    {
      accessibilityLayer,
      barCategoryGap,
      barGap,
      barSize,
      baseValue,
      className,
      compact,
      cursor,
      style,
      data,
      dataKey,
      desc,
      height = 300,
      width = '100%',
      layout = 'horizontal',
      margin = DEFAULT_MARGIN,
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
    const chartProps: BarChartLevelProps = {
      accessibilityLayer,
      barCategoryGap,
      barGap,
      barSize,
      baseValue,
      compact,
      cursor,
      dataKey,
      desc,
      layout,
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
    };

    return (
      <div
        ref={ref}
        className={clsx('bar-chart', className)}
        style={style}
        data-slot="bar-chart"
        {...rest}
      >
        <ResponsiveContainer width={width} height={height}>
          <RechartsBarChart data={data} margin={margin} {...chartProps}>
            {children}
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    );
  },
);
BarChartRoot.displayName = 'BarChart';

const BarChart = Object.assign(BarChartRoot, {
  Bar,
  XAxis,
  YAxis,
  Grid: CartesianGrid,
  Tooltip,
  Legend,
  Brush,
  ReferenceLine,
  ReferenceArea,
  ReferenceDot,
  Cell,
  Label,
  LabelList,
  TooltipContent,
});

export default BarChart;
