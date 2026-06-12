import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

export type KanbanSize = 'sm' | 'md' | 'lg';

export type KanbanProps = HTMLAttributes<HTMLDivElement> & {
  size?: KanbanSize;
};

type SectionProps = HTMLAttributes<HTMLDivElement>;

export type KanbanColumnHeaderProps = HTMLAttributes<HTMLDivElement> & {
  title: ReactNode;
  /** 数量徽标文案 */
  count?: ReactNode;
  /** 列状态指示器颜色（CSS 颜色值或 var(--xxx)），省略则渲染默认圆点 */
  indicatorColor?: string;
  /** 自定义指示器（如 icon），优先于 indicatorColor */
  indicator?: ReactNode;
  actions?: ReactNode;
};

export type KanbanCardProps = HTMLAttributes<HTMLDivElement> & {
  size?: KanbanSize;
  isSelected?: boolean;
  isDisabled?: boolean;
};

export type KanbanCardListProps = HTMLAttributes<HTMLDivElement> & {
  isEmpty?: boolean;
};

const KanbanRoot = forwardRef<HTMLDivElement, KanbanProps>(
  ({ size = 'md', className, ...rest }, ref) => (
    <div ref={ref} className={clsx('kanban', `kanban--${size}`, className)} {...rest} />
  ),
);
KanbanRoot.displayName = 'Kanban';

const Column = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} role="group" className={clsx('kanban__column', className)} {...rest} />
));
Column.displayName = 'Kanban.Column';

const ColumnHeader = forwardRef<HTMLDivElement, KanbanColumnHeaderProps>(
  ({ title, count, indicatorColor, indicator, actions, className, ...rest }, ref) => {
    const indicatorStyle: CSSProperties | undefined =
      indicatorColor !== undefined ? { backgroundColor: indicatorColor } : undefined;
    return (
      <div ref={ref} className={clsx('kanban__column-header', className)} {...rest}>
        <span className="kanban__column-indicator" style={indicatorStyle} aria-hidden="true">
          {indicator}
        </span>
        <h3 className="kanban__column-title">{title}</h3>
        {count !== undefined && <span className="kanban__column-count">{count}</span>}
        {actions !== undefined && <div className="kanban__column-actions">{actions}</div>}
      </div>
    );
  },
);
ColumnHeader.displayName = 'Kanban.ColumnHeader';

const ColumnBody = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('kanban__column-body', className)} {...rest} />
));
ColumnBody.displayName = 'Kanban.ColumnBody';

const CardList = forwardRef<HTMLDivElement, KanbanCardListProps>(
  ({ isEmpty = false, className, ...rest }, ref) => (
    <div
      ref={ref}
      role="list"
      data-empty={isEmpty ? 'true' : undefined}
      className={clsx('kanban__card-list', className)}
      {...rest}
    />
  ),
);
CardList.displayName = 'Kanban.CardList';

const KanbanCard = forwardRef<HTMLDivElement, KanbanCardProps>(
  ({ size = 'md', isSelected = false, isDisabled = false, className, children, ...rest }, ref) => (
    <div
      ref={ref}
      role="listitem"
      tabIndex={isDisabled ? -1 : 0}
      aria-disabled={isDisabled || undefined}
      data-selected={isSelected || undefined}
      className={clsx('kanban__card', className)}
      {...rest}
    >
      <div className={clsx('kanban__card-content', `kanban__card-content--${size}`)}>
        {children}
      </div>
    </div>
  ),
);
KanbanCard.displayName = 'Kanban.Card';

const Empty = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('kanban__empty', className)} {...rest} />
));
Empty.displayName = 'Kanban.Empty';

const Kanban = Object.assign(KanbanRoot, {
  Column,
  ColumnHeader,
  ColumnBody,
  CardList,
  Card: KanbanCard,
  Empty,
});

export default Kanban;
