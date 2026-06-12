import { Children, Fragment, forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

export type KpiGroupOrientation = 'horizontal' | 'vertical';

export type KpiGroupProps = HTMLAttributes<HTMLDivElement> & {
  orientation?: KpiGroupOrientation;
  hasSeparator?: boolean;
  children: ReactNode;
};

const KpiGroup = forwardRef<HTMLDivElement, KpiGroupProps>(
  ({ orientation = 'horizontal', hasSeparator = true, className, children, ...rest }, ref) => {
    const items = Children.toArray(children);
    return (
      <div
        ref={ref}
        role="group"
        className={clsx('kpi-group', `kpi-group--${orientation}`, className)}
        {...rest}
      >
        {items.map((item, index) => (
          // eslint-disable-next-line react/no-array-index-key -- 静态切片，顺序稳定
          <Fragment key={index}>
            {index > 0 && hasSeparator && <div className="kpi-group__separator" role="separator" />}
            {item}
          </Fragment>
        ))}
      </div>
    );
  },
);

KpiGroup.displayName = 'KpiGroup';

export default KpiGroup;
