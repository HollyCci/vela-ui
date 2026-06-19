import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

export type ChartTooltipIndicator = 'dot' | 'line';

export type ChartTooltipProps = HTMLAttributes<HTMLDivElement>;

export type ChartTooltipHeaderProps = HTMLAttributes<HTMLDivElement>;

export type ChartTooltipItemProps = HTMLAttributes<HTMLDivElement> & {
  /** 指示器形态，省略则不渲染指示器 */
  indicator?: ChartTooltipIndicator;
  /** 指示器颜色（CSS 颜色值或 var(--xxx)） */
  indicatorColor?: string;
  label: ReactNode;
  value: ReactNode;
};

const ChartTooltipRoot = forwardRef<HTMLDivElement, ChartTooltipProps>(
  ({ className, ...rest }, ref) => (
    <div ref={ref} role="tooltip" className={clsx('chart-tooltip', className)} {...rest} />
  ),
);
ChartTooltipRoot.displayName = 'ChartTooltip';

const Header = forwardRef<HTMLDivElement, ChartTooltipHeaderProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('chart-tooltip__header', className)} {...rest} />
));
Header.displayName = 'ChartTooltip.Header';

const Item = forwardRef<HTMLDivElement, ChartTooltipItemProps>(
  ({ indicator, indicatorColor, label, value, className, ...rest }, ref) => {
    const indicatorStyle: CSSProperties | undefined =
      indicatorColor !== undefined ? { backgroundColor: indicatorColor } : undefined;
    return (
      <div ref={ref} className={clsx('chart-tooltip__item', className)} {...rest}>
        {indicator !== undefined && (
          <span
            className={clsx('chart-tooltip__indicator', `chart-tooltip__indicator--${indicator}`)}
            style={indicatorStyle}
            aria-hidden="true"
          />
        )}
        <span className="chart-tooltip__label">{label}</span>
        <span className="chart-tooltip__value">{value}</span>
      </div>
    );
  },
);
Item.displayName = 'ChartTooltip.Item';

/** Recharts payload 单项（content 回调入参） */
export type ChartTooltipPayloadItem = {
  name?: ReactNode;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
  payload?: Record<string, number | string>;
};

export type ChartTooltipContentProps = {
  /** Recharts 注入：是否激活（hover 中），未激活则不渲染 */
  active?: boolean;
  /** Recharts 注入：当前数据点的各系列项 */
  payload?: ChartTooltipPayloadItem[];
  /** Recharts 注入：当前数据点 label（如 x 轴分类值） */
  label?: ReactNode;
  /** 指示器形态，默认 dot */
  indicator?: ChartTooltipIndicator;
  /** 值格式化函数 */
  formatter?: (value: number | string, name: ReactNode) => ReactNode;
  /** label 格式化函数 */
  labelFormatter?: (label: ReactNode) => ReactNode;
  /** 是否隐藏顶部 label 行 */
  hideLabel?: boolean;
};

/**
 * 内容感知的 tooltip 主体：直接消费 Recharts 的 active/payload/label，
 * 自动渲染 Header + 各系列 Item，并应用 formatter/labelFormatter。
 * 各图表的 *.TooltipContent 复用此实现，避免重复。
 */
const Content = ({
  active,
  payload,
  label,
  indicator = 'dot',
  formatter,
  labelFormatter,
  hideLabel,
}: ChartTooltipContentProps) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <ChartTooltipRoot>
      {!hideLabel && (
        <Header>{labelFormatter ? labelFormatter(label) : label}</Header>
      )}
      {payload.map((item, index) => (
        <Item
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
    </ChartTooltipRoot>
  );
};
Content.displayName = 'ChartTooltip.Content';

const ChartTooltip = Object.assign(ChartTooltipRoot, { Header, Item, Content });

export default ChartTooltip;
