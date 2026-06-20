'use client';

import {
  forwardRef,
  useId,
  useState,
  type HTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
} from 'react';
import clsx from 'clsx';
import CodeBlock from '../code-block';

/**
 * 线上 Pro 版的 AI-SDK 工具状态。preset 模式（提供 `toolName` + `state`）走这套语义。
 */
export type ChatToolState =
  | 'input-streaming'
  | 'input-available'
  | 'output-available'
  | 'output-error'
  | 'requires-action';

/**
 * Vela 既有的内部展示状态（驱动样式修饰类 / 状态指示器）。composable 调用点用 `status`。
 */
export type ChatToolStatus =
  | 'idle'
  | 'pending'
  | 'running'
  | 'streaming'
  | 'success'
  | 'error'
  | 'requires-action';

/** preset `state` → 内部 `status` 映射，对齐线上 Pro 的视觉语义。 */
const STATE_TO_STATUS: Record<ChatToolState, ChatToolStatus> = {
  'input-streaming': 'streaming',
  'input-available': 'running',
  'output-available': 'success',
  'output-error': 'error',
  'requires-action': 'requires-action',
};

export type ChatToolProps = Omit<HTMLAttributes<HTMLDivElement>, 'onApprove' | 'onReject'> & {
  /** 工具显示名（Pro preset 模式）；与 `triggerPrefix` 一起组成默认触发器文案。 */
  toolName?: string;
  /** AI-SDK 工具状态（Pro preset 模式）；提供时映射为内部 status。 */
  state?: ChatToolState;
  /** preset 模式下渲染在 `toolName` 前的标签（如 "Used tool: "）。 */
  triggerPrefix?: ReactNode;
  /** preset 模式下作为 JSON 渲染的工具输入。 */
  input?: unknown;
  /** preset 模式下作为 JSON 渲染的工具输出。 */
  output?: unknown;
  /** 预格式化的工具输入文本（流式部分 JSON 时优先于 `input`）。 */
  argsText?: string;
  /** `output-error` 状态下渲染的错误详情。 */
  errorText?: string;
  /** preset 审批操作：`requires-action` 状态下「同意」回调。 */
  onApprove?: () => void;
  /** preset 审批操作：`requires-action` 状态下「拒绝」回调。 */
  onReject?: () => void;
  /** composable 模式触发器主标签（Vela 既有 API，后向兼容）。 */
  label?: ReactNode;
  /** 内部展示状态（Vela 既有 API）；未提供 preset `state` 时使用。 */
  status?: ChatToolStatus;
  statusIcon?: ReactNode;
  statusLabel?: ReactNode;
  isExpanded?: boolean;
  defaultExpanded?: boolean;
  isExpandable?: boolean;
  onExpandedChange?: (isExpanded: boolean) => void;
  onToggle?: MouseEventHandler<HTMLButtonElement>;
};

export type ChatToolGroupProps = HTMLAttributes<HTMLDivElement> & {
  /** 分组头部标签；提供时渲染可展开的分组触发器，否则仅作共享容器 */
  label?: ReactNode;
  isExpanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (isExpanded: boolean) => void;
  onToggle?: MouseEventHandler<HTMLButtonElement>;
};

type SectionProps = HTMLAttributes<HTMLDivElement>;

export type ChatToolTriggerProps = HTMLAttributes<HTMLDivElement>;
export type ChatToolContentProps = HTMLAttributes<HTMLDivElement>;
export type ChatToolStatusIconProps = HTMLAttributes<HTMLSpanElement> & {
  /** 覆盖根 ChatTool 的状态（独立使用 StatusIcon 时）。 */
  status?: ChatToolStatus;
};

export type ChatToolArgsProps = SectionProps & {
  /** 作为 JSON 渲染的工具输入（Pro API）；提供时优先于 children。 */
  input?: unknown;
  /** 段标签（Pro API），默认 "参数"。 */
  label?: ReactNode;
};
export type ChatToolResultProps = SectionProps & {
  /** 作为 JSON 渲染的工具输出（Pro API）；提供时优先于 children。 */
  value?: unknown;
  /** 段标签（Pro API），默认 "结果"。 */
  label?: ReactNode;
};
export type ChatToolErrorProps = SectionProps & {
  /** 段标签（Pro API），默认 "错误"。 */
  label?: ReactNode;
};
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

/** 把任意 JSON 值格式化为紧凑单行字符串（preset 的 input/output 渲染）。 */
const toJsonText = (value: unknown): string => {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const JsonCode = ({ code }: { code: string }) => (
  <CodeBlock>
    <CodeBlock.Code code={code} language="json" />
  </CodeBlock>
);

const StatusIndicator = ({ status }: { status: ChatToolStatus }) => (
  <span className="chat-tool__status-indicator" data-status={status} aria-hidden="true" />
);
StatusIndicator.displayName = 'ChatTool.StatusIndicator';

/** 状态图标 slot（Pro 的 `ChatTool.StatusIcon`），composable 触发器内使用。 */
const StatusIcon = forwardRef<HTMLSpanElement, ChatToolStatusIconProps>(
  ({ status = 'idle', className, children, ...rest }, ref) => (
    <span ref={ref} className={clsx('chat-tool__status', className)} {...rest}>
      {children ?? <StatusIndicator status={status} />}
    </span>
  ),
);
StatusIcon.displayName = 'ChatTool.StatusIcon';

const ChatToolRoot = forwardRef<HTMLDivElement, ChatToolProps>(
  (
    {
      toolName,
      state,
      triggerPrefix,
      input,
      output,
      argsText,
      errorText,
      onApprove,
      onReject,
      label,
      status,
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

    // preset 模式：state 优先映射为内部 status；否则用既有 status（默认 idle）。
    const resolvedStatus: ChatToolStatus = state ? STATE_TO_STATUS[state] : status ?? 'idle';

    // 触发器主标签：composable `label` 优先；否则 preset 的 `triggerPrefix + toolName`。
    const triggerMain: ReactNode =
      label ??
      (toolName !== undefined ? (
        <>
          {triggerPrefix}
          {triggerPrefix !== undefined && triggerPrefix !== null && ' '}
          <strong className="chat-tool__tool-name">{toolName}</strong>
        </>
      ) : null);

    const triggerLabel = (
      <>
        <span className="chat-tool__trigger-label">{triggerMain}</span>
        <span className="chat-tool__status">
          {statusLabel !== undefined && <span className="chat-tool__status-label">{statusLabel}</span>}
          {statusIcon ?? <StatusIndicator status={resolvedStatus} />}
        </span>
      </>
    );

    const handleToggle: MouseEventHandler<HTMLButtonElement> = (event) => {
      const nextExpanded = !expanded;
      if (isExpanded === undefined) setInternalExpanded(nextExpanded);
      onExpandedChange?.(nextExpanded);
      onToggle?.(event);
    };

    // preset 内容：仅在未传 children 时由 input/output/errorText/审批回调自动拼装。
    const presetArgsText = argsText ?? (input !== undefined ? toJsonText(input) : undefined);
    const presetResultText = output !== undefined ? toJsonText(output) : undefined;
    const presetError = state === 'output-error' ? errorText : undefined;
    const hasApproval = state === 'requires-action' && (onApprove || onReject);
    const presetContent =
      children === undefined &&
      (presetArgsText !== undefined ||
        presetResultText !== undefined ||
        presetError !== undefined ||
        hasApproval) ? (
        <>
          {presetArgsText !== undefined && (
            <Args>
              <JsonCode code={presetArgsText} />
            </Args>
          )}
          {presetResultText !== undefined && (
            <Result>
              <JsonCode code={presetResultText} />
            </Result>
          )}
          {presetError !== undefined && <ErrorSection>{presetError}</ErrorSection>}
          {hasApproval && (
            <Approval
              actions={
                <>
                  {onReject && (
                    <button
                      type="button"
                      className="chat-tool__approval-reject"
                      onClick={onReject}
                    >
                      Reject
                    </button>
                  )}
                  {onApprove && (
                    <button
                      type="button"
                      className="chat-tool__approval-approve"
                      onClick={onApprove}
                    >
                      Approve
                    </button>
                  )}
                </>
              }
            />
          )}
        </>
      ) : null;

    return (
      <div
        ref={ref}
        className={clsx('chat-tool', STATUS_MODIFIERS[resolvedStatus], className)}
        data-status={resolvedStatus}
        data-state={state}
        aria-busy={RUNNING_STATUSES.has(resolvedStatus) || undefined}
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
          <div className="chat-tool__content-body">{children ?? presetContent}</div>
        </div>
      </div>
    );
  },
);
ChatToolRoot.displayName = 'ChatTool';

/**
 * 触发器 slot（Pro 的 `ChatTool.Trigger`）。
 * 注：root 已自带触发器；此 slot 供完全自定义触发器内容的 composable 写法用，
 * 渲染为容器 div（避免与 root 触发按钮造成 button 嵌套，对 Pro 的有意偏差）。
 */
const Trigger = forwardRef<HTMLDivElement, ChatToolTriggerProps>(
  ({ className, ...rest }, ref) => (
    <div ref={ref} className={clsx('chat-tool__trigger', className)} {...rest} />
  ),
);
Trigger.displayName = 'ChatTool.Trigger';

/** 展开内容容器 slot（Pro 的 `ChatTool.Content`）。 */
const Content = forwardRef<HTMLDivElement, ChatToolContentProps>(
  ({ className, ...rest }, ref) => (
    <div ref={ref} className={clsx('chat-tool__content-body', className)} {...rest} />
  ),
);
Content.displayName = 'ChatTool.Content';

const Args = forwardRef<HTMLDivElement, ChatToolArgsProps>(
  ({ input, label = '参数', className, children, ...rest }, ref) => (
    <div ref={ref} className={clsx('chat-tool__args', className)} {...rest}>
      {label !== undefined && label !== null && <div className="chat-tool__args-label">{label}</div>}
      {input !== undefined ? <JsonCode code={toJsonText(input)} /> : children}
    </div>
  ),
);
Args.displayName = 'ChatTool.Args';

const Result = forwardRef<HTMLDivElement, ChatToolResultProps>(
  ({ value, label = '结果', className, children, ...rest }, ref) => (
    <div ref={ref} className={clsx('chat-tool__result', className)} {...rest}>
      {label !== undefined && label !== null && (
        <div className="chat-tool__result-label">{label}</div>
      )}
      {value !== undefined ? <JsonCode code={toJsonText(value)} /> : children}
    </div>
  ),
);
Result.displayName = 'ChatTool.Result';

const ErrorSection = forwardRef<HTMLDivElement, ChatToolErrorProps>(
  ({ label = '错误', className, children, ...rest }, ref) => (
    <div ref={ref} className={clsx('chat-tool__error', className)} {...rest}>
      {label !== undefined && label !== null && (
        <div className="chat-tool__error-label">{label}</div>
      )}
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

const Group = forwardRef<HTMLDivElement, ChatToolGroupProps>(
  (
    {
      label,
      isExpanded,
      defaultExpanded = true,
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
    // 无 label 时仅作共享容器，始终展示子卡片
    const hasHeader = label !== undefined;
    const open = hasHeader ? expanded : true;

    const handleToggle: MouseEventHandler<HTMLButtonElement> = (event) => {
      const nextExpanded = !expanded;
      if (isExpanded === undefined) setInternalExpanded(nextExpanded);
      onExpandedChange?.(nextExpanded);
      onToggle?.(event);
    };

    return (
      <div ref={ref} className={clsx('chat-tool-group', className)} {...rest}>
        {hasHeader && (
          <div data-slot="disclosure-heading">
            <button
              type="button"
              className="chat-tool-group__trigger"
              data-expandable="true"
              aria-expanded={expanded}
              aria-controls={contentId}
              onClick={handleToggle}
            >
              <span className="chat-tool-group__trigger-label">{label}</span>
            </button>
          </div>
        )}
        <div
          id={contentId}
          className="chat-tool-group__content"
          data-expanded={open ? 'true' : 'false'}
          hidden={!open}
          aria-hidden={!open}
        >
          <div className="chat-tool-group__content-body">{children}</div>
        </div>
      </div>
    );
  },
);
Group.displayName = 'ChatTool.Group';

export { Group as ChatToolGroup };

const ChatTool = Object.assign(ChatToolRoot, {
  Trigger,
  StatusIcon,
  Content,
  Args,
  Result,
  Error: ErrorSection,
  Approval,
  Meta,
  Group,
});

export default ChatTool;
