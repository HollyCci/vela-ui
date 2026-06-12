import { forwardRef, type HTMLAttributes } from 'react';
import clsx from 'clsx';

export type NumberValueProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
  value: number;
  /** Intl.NumberFormat 配置，如 { style: 'percent' } */
  formatOptions?: Intl.NumberFormatOptions;
  locale?: string;
};

const NumberValue = forwardRef<HTMLSpanElement, NumberValueProps>(
  ({ value, formatOptions, locale = 'zh-CN', className, ...rest }, ref) => (
    <span ref={ref} className={clsx('number-value', className)} {...rest}>
      {new Intl.NumberFormat(locale, formatOptions).format(value)}
    </span>
  ),
);

NumberValue.displayName = 'NumberValue';

export default NumberValue;
