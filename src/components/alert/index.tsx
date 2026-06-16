import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

export type AlertColor = 'default' | 'accent' | 'success' | 'warning' | 'danger';

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  color?: AlertColor;
  title: ReactNode;
  description?: ReactNode;
  /** 自定义指示器；省略时按 color 显示默认状态图标，传 null 则不显示任何图标 */
  indicator?: ReactNode;
};

/**
 * 默认状态图标（占位用标准 Heroicons solid 路径，颜色继承 .alert--<color> 的 currentColor）。
 * 注：如需换用其它图标集，按 status 映射替换对应 glyph 即可，结构无需改。
 */
const DEFAULT_ICON_PATHS: Record<AlertColor, ReactNode> = {
  default: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z"
    />
  ),
  accent: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z"
    />
  ),
  success: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
    />
  ),
  warning: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
    />
  ),
  danger: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
    />
  ),
};

const DefaultAlertIcon = ({ color }: { color: AlertColor }) => (
  <svg data-slot="alert-default-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    {DEFAULT_ICON_PATHS[color]}
  </svg>
);
DefaultAlertIcon.displayName = 'Alert.DefaultIcon';

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ color = 'default', title, description, indicator, className, children, ...rest }, ref) => (
    <div ref={ref} role="alert" className={clsx('alert', `alert--${color}`, className)} {...rest}>
      {indicator !== null && (
        <span className="alert__indicator">{indicator ?? <DefaultAlertIcon color={color} />}</span>
      )}
      <div className="alert__content">
        <div className="alert__title">{title}</div>
        {description !== undefined && <div className="alert__description">{description}</div>}
        {children}
      </div>
    </div>
  ),
);

Alert.displayName = 'Alert';

export default Alert;
