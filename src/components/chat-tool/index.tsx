import {
  forwardRef,
  useId,
  useState,
  type HTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
} from 'react';
import clsx from 'clsx';

export type ChatToolStatus =
  | 'idle'
  | 'pending'
  | 'running'
  | 'streaming'
  | 'success'
  | 'error'
  | 'requires-action';

export type ChatToolProps = HTMLAttributes<HTMLDivElement> & {
  label: ReactNode;
  status?: ChatToolStatus;
  statusIcon?: ReactNode;
  statusLabel?: ReactNode;
  isExpanded?: boolean;
  defaultExpanded?: boolean;
  isExpandable?: boolean;
  onExpandedChange?: (isExpanded: boolean) => void;
  onToggle?: MouseEventHandler<HTMLButtonElement>;
};

type SectionProps = HTMLAttributes<HTMLDivElement>;

export type ChatToolArgsProps = SectionProps;
export type ChatToolResultProps = SectionProps;
export type ChatToolErrorProps = SectionProps;
export type ChatToolMetaProps = SectionProps;
export type ChatToolApprovalProps = SectionProps & {
  /** 审批操作区（按钮组等），提供时渲染在内容下方 */
  actions?: ReactNode;
};

const STATUS_MODIFIERS: Partial<Record<ChatToolStatus, string>> = {
  pending: 'chat-tool--pending',
  running: 'chat-tool--running',
  streaming: 'chat-tool--streaming',
  success: 'chat-tool--success',
  error: 'chat-tool--error',
  'requires-action': 'chat-tool--requires-action',
};

const RUNNING_STATUSES = new Set<ChatToolStatus>(['pending', 'running', 'streaming']);

const StatusIndicator = ({ status }: { status: ChatToolStatus }) => (
  <span className="chat-tool__status-indicator" data-status={status} aria-hidden="true" />
);
StatusIndicator.displayName = 'ChatTool.StatusIndicator';

const ChatToolRoot = forwardRef<HTMLDivElement, ChatToolProps>(
  (
    {
      label,
      status = 'idle',
      statusIcon,
      statusLabel,
      isExpanded,
      defaultExpanded = false,
      isExpandable = true,
      onExpandedChange,
      onToggle,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const contentId = useId();
    const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
    const expanded = isExpanded ?? internalExpanded;
    const triggerLabel = (
      <>
        <span className="chat-tool__trigger-label">{label}</span>
        <span className="chat-tool__status">
          {statusLabel !== undefined && <span className="chat-tool__status-label">{statusLabel}</span>}
          {statusIcon ?? <StatusIndicator status={status} />}
        </span>
      </>
    );

    const handleToggle: MouseEventHandler<HTMLButtonElement> = (event) => {
      const nextExpanded = !expanded;
      if (isExpanded === undefined) setInternalExpanded(nextExpanded);
      onExpandedChange?.(nextExpanded);
      onToggle?.(event);
    };

    return (
      <div
        ref={ref}
        className={clsx('chat-tool', STATUS_MODIFIERS[status], className)}
        data-status={status}
        aria-busy={RUNNING_STATUSES.has(status) || undefined}
        {...rest}
      >
        <div data-slot="disclosure-heading">
          {isExpandable ? (
            <button
              type="button"
              className="chat-tool__trigger"
              data-expandable="true"
              aria-expanded={expanded}
              aria-controls={contentId}
              onClick={handleToggle}
            >
              {triggerLabel}
            </button>
          ) : (
            <div className="chat-tool__trigger" data-expandable="false">
              {triggerLabel}
            </div>
          )}
        </div>
        <div
          id={contentId}
          className="chat-tool__content"
          data-expanded={expanded ? 'true' : 'false'}
          hidden={!expanded}
          aria-hidden={!expanded}
        >
          <div className="chat-tool__content-body">{children}</div>
        </div>
      </div>
    );
  },
);
ChatToolRoot.displayName = 'ChatTool';

const Args = forwardRef<HTMLDivElement, ChatToolArgsProps>(({ className, children, ...rest }, ref) => (
  <div ref={ref} className={clsx('chat-tool__args', className)} {...rest}>
    <div className="chat-tool__args-label">参数</div>
    {children}
  </div>
));
Args.displayName = 'ChatTool.Args';

const Result = forwardRef<HTMLDivElement, ChatToolResultProps>(({ className, children, ...rest }, ref) => (
  <div ref={ref} className={clsx('chat-tool__result', className)} {...rest}>
    <div className="chat-tool__result-label">结果</div>
    {children}
  </div>
));
Result.displayName = 'ChatTool.Result';

const ErrorSection = forwardRef<HTMLDivElement, ChatToolErrorProps>(
  ({ className, children, ...rest }, ref) => (
    <div ref={ref} className={clsx('chat-tool__error', className)} {...rest}>
      <div className="chat-tool__error-label">错误</div>
      {children}
    </div>
  ),
);
ErrorSection.displayName = 'ChatTool.Error';

const Approval = forwardRef<HTMLDivElement, ChatToolApprovalProps>(
  ({ actions, className, children, ...rest }, ref) => (
    <div ref={ref} className={clsx('chat-tool__approval', className)} {...rest}>
      {children}
      {actions !== undefined && <div className="chat-tool__approval-actions">{actions}</div>}
    </div>
  ),
);
Approval.displayName = 'ChatTool.Approval';

const Meta = forwardRef<HTMLDivElement, ChatToolMetaProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('chat-tool__meta', className)} {...rest} />
));
Meta.displayName = 'ChatTool.Meta';

const ChatTool = Object.assign(ChatToolRoot, {
  Args,
  Result,
  Error: ErrorSection,
  Approval,
  Meta,
});

export default ChatTool;
