'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import NumberFlow, { type Format } from '@number-flow/react';
import clsx from 'clsx';

export type NumberValueProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'prefix'> & {
  value: number;
  /** Intl.NumberFormat 配置，如 { style: 'percent' } */
  formatOptions?: Intl.NumberFormatOptions;
  locale?: string;
  /** 数值前缀槽位（参考实现 number-value__prefix），如标签/图标 */
  prefix?: ReactNode;
  /** 数值后缀槽位（参考实现 number-value__suffix），如单位/说明 */
  suffix?: ReactNode;
  /**
   * 值变化时启用动画过渡（复用 number-stepper 同款 @number-flow/react，
   * 经同一套 Intl 格式化）。默认 false：直接渲染静态格式化文本，保持向后兼容。
   * 动画路径内部已遵循 prefers-reduced-motion。
   */
  animate?: boolean;
};

/**
 * 与基准 DOM 一致：外层 span[data-slot=number-value]，格式化结果包裹在
 * span.number-value__value[data-slot=number-value-value]；可选 prefix/suffix 槽位。
 * 当 animate 开启时，值节点改用 @number-flow/react 渲染滚动动画（同样的 data-slot/class）。
 */
const NumberValue = forwardRef<HTMLSpanElement, NumberValueProps>(
  ({ value, formatOptions, locale, prefix, suffix, animate = false, className, ...rest }, ref) => (
    <span ref={ref} data-slot="number-value" className={clsx('number-value', className)} {...rest}>
      {prefix !== undefined && prefix !== null && (
        <span className="number-value__prefix" data-slot="number-value-prefix">
          {prefix}
        </span>
      )}
      {animate ? (
        <NumberFlow
          className="number-value__value"
          data-slot="number-value-value"
          value={value}
          locales={locale}
          format={formatOptions as Format}
        />
      ) : (
        <span className="number-value__value" data-slot="number-value-value">
          {new Intl.NumberFormat(locale, formatOptions).format(value)}
        </span>
      )}
      {suffix !== undefined && suffix !== null && (
        <span className="number-value__suffix" data-slot="number-value-suffix">
          {suffix}
        </span>
      )}
    </span>
  ),
);

NumberValue.displayName = 'NumberValue';

export default NumberValue;
