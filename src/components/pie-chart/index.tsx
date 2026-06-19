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
  Sector,
  Tooltip,
  Legend,
  type PieSectorDataItem,
} from 'recharts';
import ChartTooltip from '../chart-tooltip';

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

/** 预置的 recharts tooltip content 渲染器，输出参考实现 chart-tooltip BEM 结构 */
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
    <ChartTooltip className={className}>
      {label !== undefined && label !== null && (
        <ChartTooltip.Header>
          {labelFormatter ? labelFormatter(label) : label}
        </ChartTooltip.Header>
      )}
      {payload.map((entry, index) => (
        <ChartTooltip.Item
          key={String(entry.dataKey ?? entry.name ?? index)}
          indicator={indicator}
          indicatorColor={resolveColor(entry)}
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
TooltipContent.displayName = 'PieChart.TooltipContent';

/** 悬停扇区向外扩张的像素值，对齐 HeroUI Pro 的 active slice 高亮 */
const ACTIVE_SLICE_EXPAND = 6;

/**
 * 预置的 active-shape 渲染器：悬停时把扇区外半径放大一圈。
 * recharts 3.x 由内部 tooltip 高亮态驱动 isActive（需图表内存在 Tooltip），
 * 透传给 <PieChart.Pie activeShape={...}> 即可获得 hover 扩张，无需手动 activeIndex。
 */
function ActiveSliceShape({ outerRadius = 0, ...rest }: Partial<PieSectorDataItem>) {
  return <Sector {...rest} outerRadius={outerRadius + ACTIVE_SLICE_EXPAND} />;
}
ActiveSliceShape.displayName = 'PieChart.ActiveShape';

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
  Sector,
  Tooltip,
  Legend,
  TooltipContent,
  ActiveShape: ActiveSliceShape,
});

export default PieChart;
