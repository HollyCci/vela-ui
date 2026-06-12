import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

export type ToastColor = 'default' | 'accent' | 'success' | 'warning' | 'danger';
export type ToastPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end';

export type ToastProps = HTMLAttributes<HTMLDivElement> & {
  title: ReactNode;
  description?: ReactNode;
  indicator?: ReactNode;
  /** 标题/描述下方的操作区（如按钮） */
  action?: ReactNode;
  color?: ToastColor;
  placement?: ToastPlacement;
  isFrontmost?: boolean;
  onClose?: () => void;
};

const CloseIcon = () => (
  <svg
    data-slot="close-button-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
  </svg>
);

const Toast = forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      title,
      description,
      indicator,
      action,
      color = 'default',
      placement = 'bottom-end',
      isFrontmost = true,
      onClose,
      className,
      ...rest
    },
    ref,
  ) => (
    <div
      ref={ref}
      role="alert"
      data-frontmost={isFrontmost || undefined}
      className={clsx(
        'toast',
        `toast--${placement}`,
        color !== 'default' && `toast--${color}`,
        className,
      )}
      {...rest}
    >
      {indicator !== undefined && <span className="toast__indicator">{indicator}</span>}
      <div className="toast__content">
        <div className="toast__title">{title}</div>
        {description !== undefined && <div className="toast__description">{description}</div>}
      </div>
      {action !== undefined && <div className="toast__action">{action}</div>}
      {onClose !== undefined && (
        <button type="button" aria-label="关闭" className="toast__close-button" onClick={onClose}>
          <CloseIcon />
        </button>
      )}
    </div>
  ),
);

Toast.displayName = 'Toast';

export default Toast;
