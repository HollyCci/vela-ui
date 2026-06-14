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
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Label,
  LabelList,
  Tooltip,
  Legend,
} from 'recharts';

type ChartDatum = Record<string, number | string>;
type RechartsPieChartProps = ComponentProps<typeof RechartsPieChart>;
type PieChartLevelProps = Pick<
  RechartsPieChartProps,
  | 'accessibilityLayer'
  | 'cursor'
  | 'cx'
  | 'cy'
  | 'data'
  | 'dataKey'
  | 'desc'
  | 'endAngle'
  | 'innerRadius'
  | 'margin'
  | 'outerRadius'
  | 'responsive'
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
type PieChartContainerProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'className' | 'style' | keyof PieChartLevelProps
>;

export type PieChartProps = PieChartContainerProps & PieChartLevelProps & {
  className?: string;
  style?: CSSProperties;
  /** 图表高度（像素），默认 300 */
  height?: number;
  /** 图表宽度，像素或百分比字符串，默认 "100%" */
  width?: number | `${number}%`;
  /** recharts 子组件（PieChart.Pie / PieChart.Tooltip 等） */
  children?: ReactNode;
};

/** recharts 内置 tooltip 项的运行时结构 */
type TooltipPayloadEntry = {
  name?: ReactNode;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
  payload?: ChartDatum & { fill?: string; payload?: ChartDatum };
};

export type PieChartTooltipContentProps = {
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

/** 取扇区颜色：pie 的 payload 把 fill 挂在内层 payload 上，回退到 entry.color */
function resolveColor(entry: TooltipPayloadEntry): string | undefined {
  return entry.payload?.fill ?? entry.color;
}

/** 预置的 recharts tooltip content 渲染器，输出原站 chart-tooltip BEM 结构 */
function TooltipContent({
  active,
  payload,
  label,
  indicator = 'dot',
  valueFormatter,
  labelFormatter,
  className,
}: PieChartTooltipContentProps) {
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
TooltipContent.displayName = 'PieChart.TooltipContent';

const PieChartRoot = forwardRef<HTMLDivElement, PieChartProps>(
  (
    {
      accessibilityLayer,
      className,
      cursor,
      cx,
      cy,
      data,
      dataKey,
      desc,
      endAngle,
      height = 300,
      innerRadius,
      margin,
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
      startAngle,
      style,
      syncId,
      syncMethod,
      throttleDelay,
      throttledEvents,
      width = '100%',
      children,
      ...rest
    },
    ref,
  ) => {
    const chartProps: PieChartLevelProps = {
      accessibilityLayer,
      cursor,
      cx,
      cy,
      data,
      dataKey,
      desc,
      endAngle,
      innerRadius,
      margin,
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
      startAngle,
      syncId,
      syncMethod,
      throttleDelay,
      throttledEvents,
    };

    return (
      <div
        ref={ref}
        className={clsx('pie-chart', className)}
        style={style}
        data-slot="pie-chart"
        {...rest}
      >
        <ResponsiveContainer width={width} height={height}>
          <RechartsPieChart {...chartProps}>{children}</RechartsPieChart>
        </ResponsiveContainer>
      </div>
    );
  },
);
PieChartRoot.displayName = 'PieChart';

const PieChart = Object.assign(PieChartRoot, {
  Pie,
  Cell,
  Label,
  LabelList,
  Tooltip,
  Legend,
  TooltipContent,
});

export default PieChart;
