import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import { Group, type GroupProps } from 'react-aria-components';
import clsx from 'clsx';

export type KpiGroupOrientation = 'horizontal' | 'vertical';

export type KpiGroupProps = Omit<GroupProps, 'className' | 'style'> & {
  /** 布局方向（原站 API）：horizontal 等宽横排，vertical 纵向堆叠 */
  orientation?: KpiGroupOrientation;
  className?: string;
  style?: CSSProperties;
};

export type KpiGroupSeparatorProps = HTMLAttributes<HTMLSpanElement>;

/**
 * 基于 RAC Group 的 KPI 卡片布局容器（默认渲染 role="group"，与原站快照一致）。
 * 分隔线不自动插入，按原站 Anatomy 由使用方显式放置 <KpiGroup.Separator />。
 */
const KpiGroupRoot = forwardRef<HTMLDivElement, KpiGroupProps>(
  ({ orientation = 'horizontal', className, ...rest }, ref) => (
    <Group
      ref={ref}
      data-slot="kpi-group"
      className={clsx('kpi-group', `kpi-group--${orientation}`, className)}
      {...rest}
    />
  ),
);
KpiGroupRoot.displayName = 'KpiGroup';

/** 快照中分隔线是装饰性 span（aria-hidden），没有 role="separator" */
const Separator = forwardRef<HTMLSpanElement, KpiGroupSeparatorProps>(
  ({ className, ...rest }, ref) => (
    <span
      ref={ref}
      aria-hidden="true"
      data-slot="kpi-group-separator"
      className={clsx('kpi-group__separator', className)}
      {...rest}
    />
  ),
);
Separator.displayName = 'KpiGroup.Separator';

const KpiGroup = Object.assign(KpiGroupRoot, { Separator });

export default KpiGroup;
