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
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Brush,
  ReferenceLine,
  ReferenceArea,
  ReferenceDot,
  Label,
  LabelList,
} from 'recharts';
import ChartTooltip from '../chart-tooltip';

type ChartDatum = Record<string, number | string>;

type RechartsMargin = { top?: number; right?: number; bottom?: number; left?: number };
type RechartsLineChartProps = ComponentProps<typeof RechartsLineChart>;
type LineChartLevelProps = Pick<
  RechartsLineChartProps,
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
type LineChartContainerProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'className' | 'style' | keyof LineChartLevelProps
>;

export type LineChartProps = LineChartContainerProps & LineChartLevelProps & {
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
  /** Recharts 子组件（LineChart.Line / LineChart.XAxis 等） */
  children?: ReactNode;
};

const DEFAULT_MARGIN: RechartsMargin = { top: 8, right: 8, bottom: 0, left: 0 };

const LineChartRoot = forwardRef<HTMLDivElement, LineChartProps>(
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
      data,
      dataKey,
      desc,
      height = 300,
      layout,
      width = '100%',
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
      style,
      syncId,
      syncMethod,
      throttleDelay,
      throttledEvents,
      children,
      ...rest
    },
    ref,
  ) => {
    const chartProps: LineChartLevelProps = {
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
        className={clsx('line-chart', className)}
        style={style}
        data-slot="line-chart"
        {...rest}
      >
        <ResponsiveContainer width={width} height={height}>
          <RechartsLineChart data={data} margin={margin} {...chartProps}>
            {children}
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    );
  },
);
LineChartRoot.displayName = 'LineChart';

/** Recharts payload 单项（tooltip content 回调入参） */
type TooltipPayloadItem = {
  name?: ReactNode;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
  payload?: ChartDatum;
};

export type LineChartTooltipContentProps = {
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
}: LineChartTooltipContentProps) => {
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
TooltipContent.displayName = 'LineChart.TooltipContent';

const LineChart = Object.assign(LineChartRoot, {
  Line,
  XAxis,
  YAxis,
  Grid: CartesianGrid,
  Tooltip,
  Legend,
  Brush,
  ReferenceLine,
  ReferenceArea,
  ReferenceDot,
  Label,
  LabelList,
  TooltipContent,
});

export default LineChart;
