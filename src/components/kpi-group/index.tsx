'use client';

import {
  forwardRef,
  useEffect,
  useState,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';
import { Group, type GroupProps } from 'react-aria-components';
import clsx from 'clsx';

export type KpiGroupOrientation = 'horizontal' | 'vertical';

/** 与 sidebar 一致的移动端断点：低于该宽度横排自动堆叠 */
const MOBILE_BREAKPOINT = 768;

export type KpiGroupProps = Omit<GroupProps, 'className' | 'style'> & {
  /** 布局方向（参考 API）：horizontal 等宽横排，vertical 纵向堆叠 */
  orientation?: KpiGroupOrientation;
  /**
   * 横排在移动端自动收起为纵向堆叠的断点（px，max-width）。
   * 传 false 关闭自动收起；orientation 显式为 vertical 时本就堆叠，不受影响。
   */
  collapseBelow?: number | false;
  className?: string;
  style?: CSSProperties;
};

export type KpiGroupSeparatorProps = HTMLAttributes<HTMLSpanElement>;

/**
 * 内部断点 hook：复用 sidebar 的 JS matchMedia 模式，监听 change + resize。
 * 返回当前视口是否低于断点（max-width 命中即为 true）。
 */
function useBelowBreakpoint(breakpoint: number | false): boolean {
  const [below, setBelow] = useState(false);

  useEffect(() => {
    if (breakpoint === false || typeof window === 'undefined' || !window.matchMedia) {
      setBelow(false);
      return undefined;
    }
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const onChange = () => setBelow(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    window.addEventListener('resize', onChange);
    return () => {
      mql.removeEventListener('change', onChange);
      window.removeEventListener('resize', onChange);
    };
  }, [breakpoint]);

  return below;
}

/**
 * 基于 RAC Group 的 KPI 卡片布局容器（默认渲染 role="group"，与参考实现快照一致）。
 * 分隔线不自动插入，按参考实现 Anatomy 由使用方显式放置 <KpiGroup.Separator />。
 *
 * 横排（horizontal）在移动端断点以下自动收起为纵向堆叠：orientation 类名保持权威不变，
 * 仅追加 data-collapsed 让 CSS 接管堆叠（实现 responsive-layout 契约）。
 */
const KpiGroupRoot = forwardRef<HTMLDivElement, KpiGroupProps>(
  ({ orientation = 'horizontal', collapseBelow = MOBILE_BREAKPOINT, className, ...rest }, ref) => {
    // 仅横排需要自动收起；vertical 显式权威，不参与
    const enableCollapse = orientation === 'horizontal' && collapseBelow !== false;
    const below = useBelowBreakpoint(enableCollapse ? collapseBelow : false);
    const collapsed = enableCollapse && below;

    return (
      <Group
        ref={ref}
        data-slot="kpi-group"
        data-collapsed={collapsed ? 'true' : undefined}
        className={clsx('kpi-group', `kpi-group--${orientation}`, className)}
        {...rest}
      />
    );
  },
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
