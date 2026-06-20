import {
  createContext,
  forwardRef,
  useContext,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import clsx from 'clsx';

export type ChartTooltipIndicator = 'dot' | 'line';

const IndicatorContext = createContext<ChartTooltipIndicator>('dot');

export type ChartTooltipProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * 控制可见性。为 false 时整个 tooltip 不渲染。
   * 对齐线上 Pro 版 ChartTooltip 的 `active`。
   */
  active?: boolean;
  /**
   * 各系列名旁颜色指示器的形态，向下传给省略 `indicator` 的 Item/Indicator。
   * 对齐线上 Pro 版 ChartTooltip 的 `indicator`，默认 `dot`。
   */
  indicator?: ChartTooltipIndicator;
};

export type ChartTooltipHeaderProps = HTMLAttributes<HTMLDivElement>;

export type ChartTooltipIndicatorProps = Omit<HTMLAttributes<HTMLSpanElement>, 'color'> & {
  /** 指示器形态，省略则继承 root 的 `indicator`（默认 dot）。 */
  indicator?: ChartTooltipIndicator;
  /** 指示器背景色（CSS 颜色值或 var(--xxx)）。对齐 Pro 的 `color`。 */
  color?: string;
};

export type ChartTooltipLabelProps = HTMLAttributes<HTMLSpanElement>;

export type ChartTooltipValueProps = HTMLAttributes<HTMLSpanElement>;

export type ChartTooltipItemProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * 便捷路径（后向兼容）：指示器形态。省略则继承 root 的 `indicator`。
   * 仅在提供了 `label`/`value` 便捷 props 时生效。
   */
  indicator?: ChartTooltipIndicator;
  /** 便捷路径（后向兼容）：指示器颜色（CSS 颜色值或 var(--xxx)）。 */
  indicatorColor?: string;
  /** 便捷路径（后向兼容）：系列名。提供后走「自动渲染 Indicator+Label+Value」路径。 */
  label?: ReactNode;
  /** 便捷路径（后向兼容）：系列值。提供后走「自动渲染 Indicator+Label+Value」路径。 */
  value?: ReactNode;
};

const ChartTooltipRoot = forwardRef<HTMLDivElement, ChartTooltipProps>(
  ({ active = true, indicator = 'dot', className, children, ...rest }, ref) => {
    if (!active) return null;
    return (
      <IndicatorContext.Provider value={indicator}>
        <div ref={ref} className={clsx('chart-tooltip', className)} {...rest}>
          {children}
        </div>
      </IndicatorContext.Provider>
    );
  },
);
ChartTooltipRoot.displayName = 'ChartTooltip';

const Header = forwardRef<HTMLDivElement, ChartTooltipHeaderProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('chart-tooltip__header', className)} {...rest} />
));
Header.displayName = 'ChartTooltip.Header';

const Indicator = forwardRef<HTMLSpanElement, ChartTooltipIndicatorProps>(
  ({ indicator, color, className, style, ...rest }, ref) => {
    const rootIndicator = useContext(IndicatorContext);
    const shape = indicator ?? rootIndicator;
    const mergedStyle: CSSProperties | undefined =
      color !== undefined ? { backgroundColor: color, ...style } : style;
    return (
      <span
        ref={ref}
        className={clsx(
          'chart-tooltip__indicator',
          `chart-tooltip__indicator--${shape}`,
          className,
        )}
        style={mergedStyle}
        aria-hidden="true"
        {...rest}
      />
    );
  },
);
Indicator.displayName = 'ChartTooltip.Indicator';

const Label = forwardRef<HTMLSpanElement, ChartTooltipLabelProps>(({ className, ...rest }, ref) => (
  <span ref={ref} className={clsx('chart-tooltip__label', className)} {...rest} />
));
Label.displayName = 'ChartTooltip.Label';

const Value = forwardRef<HTMLSpanElement, ChartTooltipValueProps>(({ className, ...rest }, ref) => (
  <span ref={ref} className={clsx('chart-tooltip__value', className)} {...rest} />
));
Value.displayName = 'ChartTooltip.Value';

const Item = forwardRef<HTMLDivElement, ChartTooltipItemProps>(
  ({ indicator, indicatorColor, label, value, className, children, ...rest }, ref) => {
    // 便捷路径（后向兼容）：提供了 label/value 时自动拼 Indicator+Label+Value。
    const isShorthand = label !== undefined || value !== undefined;
    return (
      <div ref={ref} className={clsx('chart-tooltip__item', className)} {...rest}>
        {isShorthand ? (
          <>
            {indicatorColor !== undefined && (
              <Indicator indicator={indicator} color={indicatorColor} />
            )}
            <Label>{label}</Label>
            <Value>{value}</Value>
          </>
        ) : (
          children
        )}
      </div>
    );
  },
);
Item.displayName = 'ChartTooltip.Item';

/** Recharts payload 单项（Content 回调入参） */
export type ChartTooltipPayloadItem = {
  name?: ReactNode;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
  payload?: Record<string, number | string>;
};

export type ChartTooltipContentProps = {
  /** Recharts 注入：是否激活（hover 中），未激活则不渲染。 */
  active?: boolean;
  /** Recharts 注入：当前数据点的各系列项。 */
  payload?: ChartTooltipPayloadItem[];
  /** Recharts 注入：当前数据点 label（如 x 轴分类值）。 */
  label?: number | string;
  /** 指示器形态，默认 dot。对齐 Pro 的 `indicator`。 */
  indicator?: ChartTooltipIndicator;
  /** 值格式化函数。对齐 Pro 的 `valueFormatter`。 */
  valueFormatter?: (value: number | string) => ReactNode;
  /** label 格式化函数。对齐 Pro 的 `labelFormatter`。 */
  labelFormatter?: (label: number | string) => ReactNode;
  /** 是否隐藏顶部 header 行。对齐 Pro 的 `hideHeader`，默认 false。 */
  hideHeader?: boolean;
  /**
   * @deprecated 用 `valueFormatter`（对齐 Pro）。仍接受 `(value, name)` 旧签名以兼容旧调用点。
   */
  formatter?: (value: number | string, name: ReactNode) => ReactNode;
  /**
   * @deprecated 用 `hideHeader`（对齐 Pro）。
   */
  hideLabel?: boolean;
};

/**
 * 内容感知的 tooltip 主体：直接消费 Recharts 的 active/payload/label，
 * 自动渲染 Header + 各系列 Item（Indicator+Label+Value），并应用 formatter/labelFormatter。
 * 各图表的 *.TooltipContent 复用此实现，避免重复。
 */
const Content = ({
  active,
  payload,
  label,
  indicator = 'dot',
  valueFormatter,
  labelFormatter,
  hideHeader,
  formatter,
  hideLabel,
}: ChartTooltipContentProps) => {
  if (!active || !payload || payload.length === 0) return null;
  const headerHidden = hideHeader ?? hideLabel ?? false;
  return (
    <ChartTooltipRoot indicator={indicator}>
      {!headerHidden && (
        <Header>{labelFormatter && label !== undefined ? labelFormatter(label) : label}</Header>
      )}
      {payload.map((item, index) => {
        let resolved: ReactNode = item.value;
        if (item.value !== undefined) {
          if (valueFormatter) resolved = valueFormatter(item.value);
          else if (formatter) resolved = formatter(item.value, item.name);
        }
        return (
          <Item key={item.dataKey ?? index}>
            {item.color !== undefined && <Indicator color={item.color} />}
            <Label>{item.name}</Label>
            <Value>{resolved}</Value>
          </Item>
        );
      })}
    </ChartTooltipRoot>
  );
};
Content.displayName = 'ChartTooltip.Content';

const ChartTooltip = Object.assign(ChartTooltipRoot, {
  Header,
  Item,
  Indicator,
  Label,
  Value,
  Content,
});

export default ChartTooltip;
