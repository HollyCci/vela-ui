import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';
import Chip, { type ChipVariant } from '../chip';

export type TrendDirection = 'up' | 'down' | 'neutral';
export type TrendChipSize = 'sm' | 'md' | 'lg';

export type TrendChipProps = Omit<HTMLAttributes<HTMLSpanElement>, 'color'> & {
  /** 趋势方向；控制默认箭头图标与配色（up→success、down→danger、neutral→default） */
  trend?: TrendDirection;
  /**
   * 数值文本。提供时走单组件路径：自动组合 indicator/prefix/value/suffix。
   * 不提供时走复合路径：直接渲染 children（含 TrendChip.Indicator/.Prefix/.Suffix）。
   */
  value?: ReactNode;
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

/** 趋势箭头图标槽。复合用法：<TrendChip.Indicator>{customSvg}</TrendChip.Indicator> */
export type TrendChipIndicatorProps = HTMLAttributes<HTMLSpanElement>;
const Indicator = forwardRef<HTMLSpanElement, TrendChipIndicatorProps>(
  ({ className, ...rest }, ref) => (
    <span ref={ref} className={clsx('trend-chip__indicator', className)} {...rest} />
  ),
);
Indicator.displayName = 'TrendChip.Indicator';

/** 数值前缀槽。复合用法：<TrendChip.Prefix>$</TrendChip.Prefix> */
export type TrendChipPrefixProps = HTMLAttributes<HTMLSpanElement>;
const Prefix = forwardRef<HTMLSpanElement, TrendChipPrefixProps>(({ className, ...rest }, ref) => (
  <span ref={ref} className={clsx('trend-chip__prefix', className)} {...rest} />
));
Prefix.displayName = 'TrendChip.Prefix';

/** 数值后缀槽。复合用法：<TrendChip.Suffix>vs LW</TrendChip.Suffix> */
export type TrendChipSuffixProps = HTMLAttributes<HTMLSpanElement>;
const Suffix = forwardRef<HTMLSpanElement, TrendChipSuffixProps>(({ className, ...rest }, ref) => (
  <span ref={ref} className={clsx('trend-chip__suffix', className)} {...rest} />
));
Suffix.displayName = 'TrendChip.Suffix';

const TrendChipRoot = forwardRef<HTMLSpanElement, TrendChipProps>(
  (
    { trend = 'up', value, icon, prefix, suffix, size = 'sm', variant = 'soft', className, children, ...rest },
    ref,
  ) => (
    <Chip
      ref={ref}
      color={TREND_COLOR[trend]}
      variant={variant}
      size={size}
      data-trend={trend}
      className={clsx('trend-chip', `trend-chip--${size}`, className)}
      {...rest}
    >
      {value !== undefined ? (
        <>
          {/* 提供 icon 时替换默认箭头，仍处于趋势色的指示槽内 */}
          <span className="trend-chip__indicator">{icon ?? TREND_ICON[trend]}</span>
          {prefix !== undefined && <span className="trend-chip__prefix">{prefix}</span>}
          <span className="trend-chip__value">{value}</span>
          {suffix !== undefined && <span className="trend-chip__suffix">{suffix}</span>}
        </>
      ) : (
        children
      )}
    </Chip>
  ),
);

TrendChipRoot.displayName = 'TrendChip';

/**
 * TrendChip — 软底趋势徽标（箭头 + 数值），按方向上色。
 *
 * 两种用法（对齐线上 Pro 版的复合 API，同时保留单组件 props 向后兼容）：
 * 1. 单组件（默认路径，原契约）：<TrendChip trend="up" value="+3.3%" suffix="vs LW" />
 * 2. 复合（点记法，对齐 Pro Anatomy）：
 *    <TrendChip trend="up"><TrendChip.Prefix>$</TrendChip.Prefix>
 *      <TrendChip.Indicator>{svg}</TrendChip.Indicator>
 *      <span className="trend-chip__value">1,234</span></TrendChip>
 *
 * 复合路径下不传 value，root 直渲 children；indicator 不再自动注入，由 TrendChip.Indicator 提供。
 */
const TrendChip = Object.assign(TrendChipRoot, {
  Indicator,
  Prefix,
  Suffix,
});

export default TrendChip;
