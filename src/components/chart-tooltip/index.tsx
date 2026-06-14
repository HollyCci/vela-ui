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

const ChartTooltip = Object.assign(ChartTooltipRoot, { Header, Item });

export default ChartTooltip;
