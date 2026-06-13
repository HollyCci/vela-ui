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
import ChartTooltip from '../chart-tooltip';

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

/** Recharts payload 单项（tooltip content 回调入参） */
type TooltipPayloadItem = {
  name?: ReactNode;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
  payload?: ChartDatum;
};

export type ComposedChartTooltipContentProps = {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: ReactNode;
  /** 指示器形态，默认 dot */
  indicator?: 'dot' | 'line';
  /** 值格式化函数 */
  formatter?: (value: number | string, name: ReactNode) => ReactNode;
  /** label 格式化函数 */
  labelFormatter?: (label: ReactNode) => ReactNode;
  /** 是否隐藏顶部 label 行 */
  hideLabel?: boolean;
};

const TooltipContent = ({
  active,
  payload,
  label,
  indicator = 'dot',
  formatter,
  labelFormatter,
  hideLabel,
}: ComposedChartTooltipContentProps) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <ChartTooltip>
      {!hideLabel && (
        <ChartTooltip.Header>{labelFormatter ? labelFormatter(label) : label}</ChartTooltip.Header>
      )}
      {payload.map((item, index) => (
        <ChartTooltip.Item
          key={item.dataKey ?? index}
          indicator={indicator}
          indicatorColor={item.color}
          label={item.name}
          value={
            formatter && item.value !== undefined
              ? formatter(item.value, item.name)
              : item.value
          }
        />
      ))}
    </ChartTooltip>
  );
};
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
