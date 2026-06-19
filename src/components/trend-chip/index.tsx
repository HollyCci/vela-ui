import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';
import Chip, { type ChipVariant } from '../chip';

export type TrendDirection = 'up' | 'down' | 'neutral';
export type TrendChipSize = 'sm' | 'md' | 'lg';

export type TrendChipProps = Omit<HTMLAttributes<HTMLSpanElement>, 'color'> & {
  trend?: TrendDirection;
  value: ReactNode;
  /** 自定义指示图标，提供时替换默认的趋势箭头（仍沿用趋势色） */
  icon?: ReactNode;
  /** 数值前缀，渲染在 value 之前（如「营收」「目标」） */
  prefix?: ReactNode;
  suffix?: ReactNode;
  size?: TrendChipSize;
  variant?: ChipVariant;
};

const TREND_COLOR = {
  up: 'success',
  down: 'danger',
  neutral: 'default',
} as const;

const UpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M5 15l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const NeutralIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M5 12h14" strokeLinecap="round" />
  </svg>
);

const TREND_ICON = {
  up: <UpIcon />,
  down: <DownIcon />,
  neutral: <NeutralIcon />,
} as const;

const TrendChip = forwardRef<HTMLSpanElement, TrendChipProps>(
  (
    { trend = 'up', value, icon, prefix, suffix, size = 'md', variant = 'tertiary', className, ...rest },
    ref,
  ) => (
    <Chip
      ref={ref}
      color={TREND_COLOR[trend]}
      variant={variant}
      size={size}
      className={clsx(`trend-chip--${size}`, className)}
      {...rest}
    >
      {/* 提供 icon 时替换默认箭头，仍处于趋势色的指示槽内 */}
      <span className="trend-chip__indicator">{icon ?? TREND_ICON[trend]}</span>
      {prefix !== undefined && <span className="trend-chip__prefix">{prefix}</span>}
      <span className="trend-chip__value">{value}</span>
      {suffix !== undefined && <span className="trend-chip__suffix">{suffix}</span>}
    </Chip>
  ),
);

TrendChip.displayName = 'TrendChip';

export default TrendChip;
