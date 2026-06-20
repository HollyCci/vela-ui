'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import NumberFlow, { type Format } from '@number-flow/react';
import clsx from 'clsx';

/** 参考实现的格式化样式枚举（对应 Intl.NumberFormatOptions['style']）。 */
export type NumberValueStyle = 'decimal' | 'currency' | 'percent' | 'unit';
/** 参考实现的记数法枚举（对应 Intl.NumberFormatOptions['notation']）。 */
export type NumberValueNotation = 'standard' | 'compact' | 'scientific' | 'engineering';
/** 参考实现的符号显示枚举（对应 Intl.NumberFormatOptions['signDisplay']）。 */
export type NumberValueSignDisplay = 'auto' | 'always' | 'exceptZero' | 'never';

/**
 * 参考实现把格式化常用项扁平到 root props 上，且 `style` 被用作「格式化样式」枚举，
 * 因此（与参考实现一致）root 排除原生 CSS `style` 属性 —— 行内样式请用 `className`。
 * children 排除是因为它有专属语义（Prefix/Suffix 子组件或 render 函数）。
 */
export type NumberValueProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  'children' | 'prefix' | 'style'
> & {
  /** 必填。要格式化的数值。 */
  value: number;
  /** 格式化样式（参考实现 `style`，默认 `'decimal'`）。 */
  style?: NumberValueStyle;
  /** 货币代码（如 `"USD"`）；`style="currency"` 时必填。 */
  currency?: string;
  /** 单位类型（如 `"degree"`）；`style="unit"` 时必填。 */
  unit?: string;
  /** 记数法（默认 `'standard'`）。 */
  notation?: NumberValueNotation;
  /** 控制何时显示符号。 */
  signDisplay?: NumberValueSignDisplay;
  /** 最小小数位数。 */
  minimumFractionDigits?: number;
  /** 最大小数位数。 */
  maximumFractionDigits?: number;
  /** 覆盖 locale。 */
  locale?: string;
  /** 直接透传给 Intl.NumberFormat 的完整配置（可覆盖上面的扁平项、或补充其它键）。 */
  formatOptions?: Intl.NumberFormatOptions;
  /**
   * 参考实现 children：Prefix/Suffix 子组件（ReactNode），或 render 函数
   * `(formatted: string) => ReactNode`（拿到格式化文本后自定义渲染）。
   */
  children?: ReactNode | ((formatted: string) => ReactNode);
  /** 数值前缀槽位（Vela 便捷 prop，参考实现 number-value__prefix），如标签/图标。 */
  prefix?: ReactNode;
  /** 数值后缀槽位（Vela 便捷 prop，参考实现 number-value__suffix），如单位/说明。 */
  suffix?: ReactNode;
  /**
   * 值变化时启用动画过渡（复用 number-stepper 同款 @number-flow/react，
   * 经同一套 Intl 格式化）。默认 false：直接渲染静态格式化文本，保持向后兼容。
   * 动画路径内部已遵循 prefers-reduced-motion。
   */
  animate?: boolean;
};

/** 把扁平的格式化 props 收敛成一份 Intl.NumberFormatOptions（formatOptions 优先覆盖）。 */
function resolveFormatOptions({
  style,
  currency,
  unit,
  notation,
  signDisplay,
  minimumFractionDigits,
  maximumFractionDigits,
  formatOptions,
}: Pick<
  NumberValueProps,
  | 'style'
  | 'currency'
  | 'unit'
  | 'notation'
  | 'signDisplay'
  | 'minimumFractionDigits'
  | 'maximumFractionDigits'
  | 'formatOptions'
>): Intl.NumberFormatOptions {
  const flattened: Intl.NumberFormatOptions = {};
  if (style !== undefined) flattened.style = style;
  if (currency !== undefined) flattened.currency = currency;
  if (unit !== undefined) flattened.unit = unit;
  if (notation !== undefined) flattened.notation = notation;
  if (signDisplay !== undefined) flattened.signDisplay = signDisplay;
  if (minimumFractionDigits !== undefined) flattened.minimumFractionDigits = minimumFractionDigits;
  if (maximumFractionDigits !== undefined) flattened.maximumFractionDigits = maximumFractionDigits;
  return { ...flattened, ...formatOptions };
}

/**
 * 与参考实现一致：root span[data-slot=number-value]，格式化结果包裹在
 * span.number-value__value[data-slot=number-value-value]；可选 prefix/suffix 槽位 +
 * children（Prefix/Suffix 子组件或 render 函数）。animate 开启时值节点改用
 * @number-flow/react 渲染滚动动画（同样的 data-slot/class）。
 */
const NumberValueRoot = forwardRef<HTMLSpanElement, NumberValueProps>(
  (
    {
      value,
      style,
      currency,
      unit,
      notation,
      signDisplay,
      minimumFractionDigits,
      maximumFractionDigits,
      locale,
      formatOptions,
      children,
      prefix,
      suffix,
      animate = false,
      className,
      ...rest
    },
    ref,
  ) => {
    const resolved = resolveFormatOptions({
      style,
      currency,
      unit,
      notation,
      signDisplay,
      minimumFractionDigits,
      maximumFractionDigits,
      formatOptions,
    });
    const formatted = new Intl.NumberFormat(locale, resolved).format(value);

    // render 函数 children：拿到格式化文本后完全自定义渲染（参考实现语义）。
    if (typeof children === 'function') {
      return (
        <span
          ref={ref}
          data-slot="number-value"
          className={clsx('number-value', className)}
          {...rest}
        >
          {children(formatted)}
        </span>
      );
    }

    return (
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
            format={resolved as Format}
          />
        ) : (
          <span className="number-value__value" data-slot="number-value-value">
            {formatted}
          </span>
        )}
        {suffix !== undefined && suffix !== null && (
          <span className="number-value__suffix" data-slot="number-value-suffix">
            {suffix}
          </span>
        )}
        {children}
      </span>
    );
  },
);

NumberValueRoot.displayName = 'NumberValue';

export type NumberValueAffixProps = HTMLAttributes<HTMLSpanElement> & {
  children?: ReactNode;
};

/** 数值前缀子组件（参考实现 NumberValue.Prefix），渲染 span.number-value__prefix。 */
const NumberValuePrefix = forwardRef<HTMLSpanElement, NumberValueAffixProps>(
  ({ className, children, ...rest }, ref) => (
    <span
      ref={ref}
      data-slot="number-value-prefix"
      className={clsx('number-value__prefix', className)}
      {...rest}
    >
      {children}
    </span>
  ),
);

NumberValuePrefix.displayName = 'NumberValue.Prefix';

/** 数值后缀子组件（参考实现 NumberValue.Suffix），渲染 span.number-value__suffix。 */
const NumberValueSuffix = forwardRef<HTMLSpanElement, NumberValueAffixProps>(
  ({ className, children, ...rest }, ref) => (
    <span
      ref={ref}
      data-slot="number-value-suffix"
      className={clsx('number-value__suffix', className)}
      {...rest}
    >
      {children}
    </span>
  ),
);

NumberValueSuffix.displayName = 'NumberValue.Suffix';

const NumberValue = Object.assign(NumberValueRoot, {
  Prefix: NumberValuePrefix,
  Suffix: NumberValueSuffix,
});

export default NumberValue;
