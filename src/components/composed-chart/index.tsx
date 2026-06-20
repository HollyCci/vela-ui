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
  ComposedChart as RechartsComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import ChartTooltip, { type ChartTooltipContentProps } from '../chart-tooltip';

type ChartDatum = Record<string, number | string>;

type RechartsMargin = { top?: number; right?: number; bottom?: number; left?: number };

export type ComposedChartProps = Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
  /** 图表数据：每条记录是一组 series 字段的对象 */
  data: ChartDatum[];
  /** 图表高度（像素），默认 300 */
  height?: number;
  /** 图表宽度：像素数值或百分比字符串，默认 "100%" */
  width?: number | `${number}%`;
  /** Recharts 图表区域外边距 */
  margin?: RechartsMargin;
  /** Recharts 子组件（ComposedChart.Bar / ComposedChart.Line / ComposedChart.Area 等） */
  children?: ReactNode;
};

const DEFAULT_MARGIN: RechartsMargin = { top: 8, right: 8, bottom: 0, left: 0 };

const ComposedChartRoot = forwardRef<HTMLDivElement, ComposedChartProps>(
  (
    {
      className,
      data,
      height = 300,
      width = '100%',
      margin = DEFAULT_MARGIN,
      children,
      ...rest
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={clsx('composed-chart', className)}
      data-slot="composed-chart"
      {...rest}
    >
      <ResponsiveContainer width={width} height={height}>
        <RechartsComposedChart data={data} margin={margin}>
          {children}
        </RechartsComposedChart>
      </ResponsiveContainer>
    </div>
  ),
);
ComposedChartRoot.displayName = 'ComposedChart';

// 内容感知逻辑已提升到 ChartTooltip.Content（内容感知原语），此处直接复用避免重复。
// 对齐线上 Pro 版的 valueFormatter/labelFormatter/hideHeader；仍接受 deprecated 的
// formatter/hideLabel（ChartTooltip.Content 内部兜底），保住旧调用点。
export type ComposedChartTooltipContentProps = ChartTooltipContentProps;

const TooltipContent = (props: ComposedChartTooltipContentProps) => (
  <ChartTooltip.Content {...props} />
);
TooltipContent.displayName = 'ComposedChart.TooltipContent';

const ComposedChart = Object.assign(ComposedChartRoot, {
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  Grid: CartesianGrid,
  Tooltip,
  TooltipContent,
});

export default ComposedChart;
