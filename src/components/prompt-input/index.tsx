import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type DragEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type LiHTMLAttributes,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  Button,
  ScrollShadow,
  Spinner,
  TextArea as HeroTextArea,
  Tooltip,
  type ButtonProps,
  type ScrollShadowProps,
  type TextAreaProps as HeroTextAreaProps,
} from '@heroui/react';
import clsx from 'clsx';

export type PromptInputSize = 'sm' | 'md' | 'lg';
export type PromptInputVariant = 'primary' | 'secondary' | 'inline';
export type PromptInputStatus = 'ready' | 'submitted' | 'streaming' | 'error';

export type PromptInputProps = Omit<HTMLAttributes<HTMLDivElement>, 'onSubmit'> & {
  /** 受控输入值；缺省时内部维护（原站 API） */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Enter 或发送按钮触发（仅 ready/error 且非空文本时调用） */
  onSubmit?: () => void;
  /** submitted/streaming 可停状态下发送按钮触发（原站 API） */
  onStop?: () => void;
  status?: PromptInputStatus;
  isDisabled?: boolean;
  /** submitted/streaming 期间禁用文本框（原站 API，默认 true） */
  lockInputOnRun?: boolean;
  /** 自适应高度上限（原站 API，默认 240） */
  maxHeight?: number | string;
  size?: PromptInputSize;
  variant?: PromptInputVariant;
};

export type PromptInputTextAreaProps = Omit<
  HeroTextAreaProps,
  'className' | 'style' | 'value' | 'defaultValue'
> & {
  /** 关闭自动高度调整（原站 API，默认 false） */
  disableAutosize?: boolean;
  className?: string;
  style?: CSSProperties;
};

export type PromptInputActionProps = Omit<ButtonProps, 'className' | 'style'> & {
  /** 提供时按钮包进 OSS Tooltip（原站 API） */
  tooltip?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export type PromptInputSendProps = Omit<ButtonProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type PromptInputSectionProps = HTMLAttributes<HTMLDivElement>;
export type PromptInputFooterProps = HTMLAttributes<HTMLParagraphElement>;

export type PromptInputQueueProps = HTMLAttributes<HTMLDivElement> & {
  /** 队列行尾操作按钮何时可见（原站 API，默认 hover） */
  actionsVisibility?: 'always' | 'hover';
};

export type PromptInputQueueListProps<T> = Omit<ScrollShadowProps, 'className' | 'style'> & {
  /** 受控队列值；与 onReorder 同传时启用拖拽排序（原站 API） */
  values?: T[];
  onReorder?: (values: T[]) => void;
  /** 拖拽排序轴向（原站 API，默认 y；本实现用原生 DnD，轴向仅作语义保留） */
  axis?: 'x' | 'y';
  className?: string;
  style?: CSSProperties;
};

export type PromptInputQueueItemProps<T> = Omit<LiHTMLAttributes<HTMLLIElement>, 'value'> & {
  /** values 中的对应项；启用拖拽排序时必传（原站 API，遮蔽 li 原生 value 属性） */
  value?: T;
};

export type PromptInputQueueButtonProps = Omit<ButtonProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type PromptInputQueueItemSlotProps = HTMLAttributes<HTMLDivElement>;
export type PromptInputQueueItemTextProps = HTMLAttributes<HTMLParagraphElement>;
export type PromptInputQueueItemIconProps = HTMLAttributes<HTMLSpanElement>;

export type PromptInputQueueItemAttachmentsOverflowProps = HTMLAttributes<HTMLSpanElement> & {
  /** 超出可见预览的附件数（原站 API） */
  hiddenCount?: number;
  /** 溢出文案中的名词（原站 API，默认 'files'） */
  noun?: string;
};

type PromptInputContextValue = {
  value: string;
  setValue: (value: string) => void;
  submit: () => void;
  stop: () => void;
  status: PromptInputStatus;
  isDisabled: boolean;
  lockInputOnRun: boolean;
  maxHeight: number | string;
  size: PromptInputSize;
  variant: PromptInputVariant;
  setExpanded: (expanded: boolean) => void;
};

const PromptInputContext = createContext<PromptInputContextValue>({
  value: '',
  setValue: () => undefined,
  submit: () => undefined,
  stop: () => undefined,
  status: 'ready',
  isDisabled: false,
  lockInputOnRun: true,
  maxHeight: 240,
  size: 'md',
  variant: 'primary',
  setExpanded: () => undefined,
});

type QueueListContextValue = {
  hasReorder: boolean;
  indexOf: (value: unknown) => number;
  /** 把 from 位置的项移动到 to（List 内部持有 T 类型，子项无需感知） */
  move: ((from: number, to: number) => void) | null;
  dragIndexRef: RefObject<number | null>;
};

const QueueListContext = createContext<QueueListContextValue>({
  hasReorder: false,
  indexOf: () => -1,
  move: null,
  dragIndexRef: { current: null },
});

/** 基准快照中 textarea 自带的工具类串（压平 OSS textarea 的边框/底色，使其融入 shell） */
const TEXTAREA_RESET_CLASSES =
  'border-0 bg-transparent shadow-none outline-none ring-0 hover:border-transparent hover:bg-transparent focus:border-transparent focus:bg-transparent focus:shadow-none focus:ring-0 focus-visible:ring-0 data-[focused=true]:border-transparent data-[hovered=true]:border-transparent data-[focused=true]:bg-transparent data-[hovered=true]:bg-transparent data-[focused=true]:shadow-none data-[focused=true]:ring-0';

/** 原站发送图标（与基准快照 SVG path 一致） */
const SendIcon = () => (
  <svg className="size-4" fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
    <path
      clipRule="evenodd"
      d="M8 14.75a.75.75 0 0 1-.75-.75V3.81L4.53 6.53a.75.75 0 0 1-1.06-1.06l4-4a.75.75 0 0 1 1.06 0l4 4a.75.75 0 0 1-1.06 1.06L8.75 3.81V14a.75.75 0 0 1-.75.75"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);
SendIcon.displayName = 'PromptInput.SendIcon';

/** streaming 可停状态的停止图标（圆角方块，无快照基准） */
const StopIcon = () => (
  <svg className="size-4" fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
    <rect fill="currentColor" height="9" rx="2" width="9" x="3.5" y="3.5" />
  </svg>
);
StopIcon.displayName = 'PromptInput.StopIcon';

/** error 状态图标（感叹号圆形，无快照基准；按钮底色由 CSS [data-status=error] 切 danger） */
const ErrorIcon = () => (
  <svg className="size-4" fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
    <path
      clipRule="evenodd"
      d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13M7.25 5.25a.75.75 0 0 1 1.5 0v3a.75.75 0 0 1-1.5 0zM8 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);
ErrorIcon.displayName = 'PromptInput.ErrorIcon';

/** 队列拖拽手柄默认图标（与基准快照 SVG path 一致） */
const GripIcon = () => (
  <svg aria-hidden="true" className="size-3.5" fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
    <path
      clipRule="evenodd"
      d="M7 3a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0M5.5 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m0-5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M7 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m3.5 1.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);
GripIcon.displayName = 'PromptInput.GripIcon';

/** 队列行默认文件图标（与基准快照 SVG path 一致） */
const QueueFileIcon = () => (
  <svg aria-hidden="true" className="size-3.5" fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
    <path
      clipRule="evenodd"
      d="M5 13.5h6a1.5 1.5 0 0 0 1.5-1.5V7.243a1.5 1.5 0 0 0-.44-1.061L8.819 2.939a1.5 1.5 0 0 0-1.06-.439H5A1.5 1.5 0 0 0 3.5 4v8A1.5 1.5 0 0 0 5 13.5m9-6.257a3 3 0 0 0-.879-2.122L9.88 1.88A3 3 0 0 0 7.757 1H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3zM5 8.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 5 8.25m.75 2.25a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);
QueueFileIcon.displayName = 'PromptInput.QueueFileIcon';

/** 队列行移除默认图标（与基准快照 SVG path 一致） */
const TrashIcon = () => (
  <svg className="size-3.5" fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
    <path
      clipRule="evenodd"
      d="M9 2H7a.5.5 0 0 0-.5.5V3h3v-.5A.5.5 0 0 0 9 2m2 1v-.5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2V3H2.251a.75.75 0 0 0 0 1.5h.312l.317 7.625A3 3 0 0 0 5.878 15h4.245a3 3 0 0 0 2.997-2.875l.318-7.625h.312a.75.75 0 0 0 0-1.5zm.936 1.5H4.064l.315 7.562A1.5 1.5 0 0 0 5.878 13.5h4.245a1.5 1.5 0 0 0 1.498-1.438zm-6.186 2v5a.75.75 0 0 0 1.5 0v-5a.75.75 0 0 0-1.5 0m3.75-.75a.75.75 0 0 1 .75.75v5a.75.75 0 0 1-1.5 0v-5a.75.75 0 0 1 .75-.75"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);
TrashIcon.displayName = 'PromptInput.TrashIcon';

/** 队列行 More 默认图标（与基准快照 SVG path 一致） */
const DotsIcon = () => (
  <svg className="size-3.5" fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
    <path
      clipRule="evenodd"
      d="M3 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M9.5 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);
DotsIcon.displayName = 'PromptInput.DotsIcon';

/** inline 变体的 Action/Send 固定 sm 尺寸（与基准快照一致），其余跟随根 size */
const useButtonSize = (): PromptInputSize => {
  const { size, variant } = useContext(PromptInputContext);
  return variant === 'inline' ? 'sm' : size;
};

const Shell = forwardRef<HTMLDivElement, PromptInputSectionProps>(({ className, ...rest }, ref) => {
  const { variant } = useContext(PromptInputContext);
  return (
    <div
      ref={ref}
      data-slot="prompt-input-shell"
      className={clsx('prompt-input__shell', `prompt-input__shell--${variant}`, className)}
      {...rest}
    />
  );
});
Shell.displayName = 'PromptInput.Shell';

const Content = forwardRef<HTMLDivElement, PromptInputSectionProps>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    data-slot="prompt-input-content"
    className={clsx('prompt-input__content', className)}
    {...rest}
  />
));
Content.displayName = 'PromptInput.Content';

const Attachments = forwardRef<HTMLDivElement, PromptInputSectionProps>(
  ({ className, ...rest }, ref) => (
    <div
      ref={ref}
      data-slot="prompt-input-attachments"
      className={clsx('prompt-input__attachments', className)}
      {...rest}
    />
  ),
);
Attachments.displayName = 'PromptInput.Attachments';

/**
 * 包装 OSS TextArea（RAC TextArea 底座）：值由根上下文受控；
 * 自适应高度（上限 maxHeight）、Enter 发送 / Shift+Enter 换行、运行中按 lockInputOnRun 锁定。
 */
const TextAreaSlot = ({
  disableAutosize = false,
  className,
  rows = 1,
  'aria-label': ariaLabel = 'Message input',
  disabled,
  onChange,
  onKeyDown,
  ref,
  ...rest
}: PromptInputTextAreaProps) => {
  const { value, setValue, submit, status, isDisabled, lockInputOnRun, maxHeight, setExpanded } =
    useContext(PromptInputContext);
  const innerRef = useRef<HTMLTextAreaElement | null>(null);

  const handleRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      innerRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref],
  );

  useEffect(() => {
    const el = innerRef.current;
    if (el === null || disableAutosize) {
      return;
    }
    el.style.height = 'auto';
    // 行数检测供 inline 变体 data-expanded 用：内容高（去内边距）超过 1.5 行视为折行
    const styles = window.getComputedStyle(el);
    const padding = Number.parseFloat(styles.paddingTop) + Number.parseFloat(styles.paddingBottom);
    const lineHeight =
      Number.parseFloat(styles.lineHeight) || Number.parseFloat(styles.fontSize) * 1.5 || 20;
    setExpanded(el.scrollHeight - padding >= lineHeight * 1.5);
    if (typeof maxHeight === 'number') {
      el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    } else {
      // 字符串上限（如 '50vh'）交给 CSS max-height 截断，高度仍跟随内容
      el.style.maxHeight = maxHeight;
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [value, disableAutosize, maxHeight, setExpanded]);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(event);
      setValue(event.target.value);
    },
    [onChange, setValue],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) {
        return;
      }
      // Enter 发送；Shift+Enter 换行；输入法合成中的 Enter 不触发
      if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
        event.preventDefault();
        submit();
      }
    },
    [onKeyDown, submit],
  );

  const isLocked = lockInputOnRun && (status === 'submitted' || status === 'streaming');

  return (
    <HeroTextArea
      ref={handleRef}
      data-slot="prompt-input-textarea"
      aria-label={ariaLabel}
      fullWidth
      variant="primary"
      rows={rows}
      className={clsx('prompt-input__textarea', TEXTAREA_RESET_CLASSES, className)}
      value={value}
      disabled={disabled === true || isDisabled || isLocked}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      {...rest}
    />
  );
};
TextAreaSlot.displayName = 'PromptInput.TextArea';

const Toolbar = forwardRef<HTMLDivElement, PromptInputSectionProps>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    data-slot="prompt-input-toolbar"
    className={clsx('prompt-input__toolbar', className)}
    {...rest}
  />
));
Toolbar.displayName = 'PromptInput.Toolbar';

const ToolbarStart = forwardRef<HTMLDivElement, PromptInputSectionProps>(
  ({ className, ...rest }, ref) => (
    <div
      ref={ref}
      data-slot="prompt-input-toolbar-start"
      className={clsx('prompt-input__toolbar-start', className)}
      {...rest}
    />
  ),
);
ToolbarStart.displayName = 'PromptInput.ToolbarStart';

const ToolbarEnd = forwardRef<HTMLDivElement, PromptInputSectionProps>(
  ({ className, ...rest }, ref) => (
    <div
      ref={ref}
      data-slot="prompt-input-toolbar-end"
      className={clsx('prompt-input__toolbar-end', className)}
      {...rest}
    />
  ),
);
ToolbarEnd.displayName = 'PromptInput.ToolbarEnd';

/** 工具栏动作按钮：OSS Button tertiary/icon-only；tooltip 提供时包 OSS Tooltip（与快照一致） */
const Action = ({ tooltip, size, variant = 'tertiary', isDisabled, ...rest }: PromptInputActionProps) => {
  const { isDisabled: rootDisabled } = useContext(PromptInputContext);
  const buttonSize = useButtonSize();

  const button = (
    <Button
      data-slot="prompt-input-action"
      isIconOnly
      size={size ?? buttonSize}
      variant={variant}
      isDisabled={isDisabled === true || rootDisabled}
      {...rest}
    />
  );

  if (tooltip === undefined) {
    return button;
  }

  return (
    <Tooltip>
      <Tooltip.Trigger>{button}</Tooltip.Trigger>
      <Tooltip.Content>{tooltip}</Tooltip.Content>
    </Tooltip>
  );
};
Action.displayName = 'PromptInput.Action';

/**
 * 发送按钮状态机（原站 API）：ready→发送箭头、submitted→Spinner、streaming→停止、error→错误图标；
 * 可停状态按下调 onStop，其余调 onSubmit；ready/error 且文本为空时禁用。
 */
const Send = ({
  className,
  size,
  variant = 'primary',
  isDisabled,
  onPress,
  children,
  'aria-label': ariaLabel,
  ...rest
}: PromptInputSendProps) => {
  const { value, status, isDisabled: rootDisabled, submit, stop } = useContext(PromptInputContext);
  const buttonSize = useButtonSize();
  const isStoppable = status === 'submitted' || status === 'streaming';

  const handlePress = useCallback<NonNullable<ButtonProps['onPress']>>(
    (event) => {
      onPress?.(event);
      if (isStoppable) {
        stop();
      } else {
        submit();
      }
    },
    [onPress, isStoppable, stop, submit],
  );

  let defaultIcon: ReactNode;
  switch (status) {
    case 'submitted':
      defaultIcon = <Spinner size="sm" />;
      break;
    case 'streaming':
      defaultIcon = <StopIcon />;
      break;
    case 'error':
      defaultIcon = <ErrorIcon />;
      break;
    default:
      defaultIcon = <SendIcon />;
  }

  return (
    <Button
      data-slot="prompt-input-send"
      data-status={status}
      isIconOnly
      size={size ?? buttonSize}
      variant={variant}
      className={clsx('prompt-input__send', className)}
      aria-label={ariaLabel ?? (isStoppable ? 'Stop generating' : 'Send message')}
      isDisabled={
        isDisabled === true || rootDisabled || (!isStoppable && value.trim().length === 0)
      }
      onPress={handlePress}
      {...rest}
    >
      {children ?? defaultIcon}
    </Button>
  );
};
Send.displayName = 'PromptInput.Send';

const Footer = forwardRef<HTMLParagraphElement, PromptInputFooterProps>(
  ({ className, ...rest }, ref) => (
    <p
      ref={ref}
      data-slot="prompt-input-footer"
      className={clsx('prompt-input__footer', className)}
      {...rest}
    />
  ),
);
Footer.displayName = 'PromptInput.Footer';

const QueueRoot = forwardRef<HTMLDivElement, PromptInputQueueProps>(
  ({ actionsVisibility = 'hover', className, ...rest }, ref) => (
    <div
      ref={ref}
      data-slot="prompt-input-queue"
      data-actions-visibility={actionsVisibility}
      className={clsx('prompt-input__queue', className)}
      {...rest}
    />
  ),
);
QueueRoot.displayName = 'PromptInput.Queue';

/**
 * 包装 OSS ScrollShadow（默认 vertical/fade 与快照一致）；
 * values + onReorder 同传时子项启用原生 DnD 拖拽排序（原站用 Motion，本仓不引依赖）。
 */
const QueueList = <T,>({
  values,
  onReorder,
  // 原生 DnD 不约束轴向，axis 仅保留 API（下划线豁免 noUnusedParameters）
  axis: _axis = 'y',
  className,
  children,
  ...rest
}: PromptInputQueueListProps<T>) => {
  const dragIndexRef = useRef<number | null>(null);

  const indexOf = useCallback(
    (value: unknown) => (values === undefined ? -1 : (values as unknown[]).indexOf(value)),
    [values],
  );

  const move = useMemo(() => {
    if (values === undefined || onReorder === undefined) {
      return null;
    }
    return (from: number, to: number) => {
      const next = [...values];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      onReorder(next);
    };
  }, [values, onReorder]);

  const contextValue = useMemo<QueueListContextValue>(
    () => ({ hasReorder: move !== null, indexOf, move, dragIndexRef }),
    [move, indexOf],
  );

  return (
    <QueueListContext.Provider value={contextValue}>
      <ScrollShadow
        data-slot="prompt-input-queue-list"
        className={clsx('prompt-input__queue-list', className)}
        {...rest}
      >
        <ul className="prompt-input__queue-list-items">{children}</ul>
      </ScrollShadow>
    </QueueListContext.Provider>
  );
};
QueueList.displayName = 'PromptInput.Queue.List';

const QueueItemRoot = <T,>({
  value,
  className,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  ...rest
}: PromptInputQueueItemProps<T>) => {
  const { indexOf, move, dragIndexRef } = useContext(QueueListContext);
  const index = value === undefined ? -1 : indexOf(value);
  const isReorderEnabled = move !== null && index >= 0;

  const handleDragStart = useCallback(
    (event: DragEvent<HTMLLIElement>) => {
      onDragStart?.(event);
      if (!isReorderEnabled) {
        return;
      }
      dragIndexRef.current = index;
      event.dataTransfer.effectAllowed = 'move';
    },
    [onDragStart, isReorderEnabled, dragIndexRef, index],
  );

  const handleDragOver = useCallback(
    (event: DragEvent<HTMLLIElement>) => {
      onDragOver?.(event);
      if (!isReorderEnabled || dragIndexRef.current === null) {
        return;
      }
      event.preventDefault();
      const from = dragIndexRef.current;
      // 拖过其他行即实时换位（与 Motion reorder 的实时预览行为一致）
      if (from !== index && move !== null) {
        move(from, index);
        dragIndexRef.current = index;
      }
    },
    [onDragOver, isReorderEnabled, dragIndexRef, index, move],
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLLIElement>) => {
      onDrop?.(event);
      if (isReorderEnabled) {
        event.preventDefault();
      }
    },
    [onDrop, isReorderEnabled],
  );

  const handleDragEnd = useCallback(
    (event: DragEvent<HTMLLIElement>) => {
      onDragEnd?.(event);
      dragIndexRef.current = null;
    },
    [onDragEnd, dragIndexRef],
  );

  return (
    <li
      data-slot="prompt-input-queue-item"
      className={clsx('prompt-input__queue-item', className)}
      draggable={isReorderEnabled || undefined}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
      {...rest}
    />
  );
};
QueueItemRoot.displayName = 'PromptInput.Queue.Item';

/** 拖拽手柄（展示性，排序手势在行上）；无 children 时渲染默认网点图标 */
const QueueItemHandle = ({
  className,
  children,
  'aria-label': ariaLabel = 'Reorder queued prompt',
  ...rest
}: PromptInputQueueButtonProps) => {
  const { hasReorder } = useContext(QueueListContext);

  return (
    <Button
      data-slot="prompt-input-queue-item-handle"
      data-reorder-enabled={hasReorder ? 'true' : undefined}
      size="sm"
      variant="ghost"
      aria-label={ariaLabel}
      className={clsx('prompt-input__queue-item-handle', className)}
      {...rest}
    >
      {children ?? <GripIcon />}
    </Button>
  );
};
QueueItemHandle.displayName = 'PromptInput.Queue.Item.Handle';

const QueueItemBody = forwardRef<HTMLDivElement, PromptInputQueueItemSlotProps>(
  ({ className, ...rest }, ref) => (
    <div
      ref={ref}
      data-slot="prompt-input-queue-item-body"
      className={clsx('prompt-input__queue-item-body', className)}
      {...rest}
    />
  ),
);
QueueItemBody.displayName = 'PromptInput.Queue.Item.Body';

const QueueItemIcon = forwardRef<HTMLSpanElement, PromptInputQueueItemIconProps>(
  ({ className, children, ...rest }, ref) => (
    <span
      ref={ref}
      data-slot="prompt-input-queue-item-icon"
      className={clsx('prompt-input__queue-item-icon', className)}
      {...rest}
    >
      {children ?? <QueueFileIcon />}
    </span>
  ),
);
QueueItemIcon.displayName = 'PromptInput.Queue.Item.Icon';

const QueueItemContent = forwardRef<HTMLParagraphElement, PromptInputQueueItemTextProps>(
  ({ className, ...rest }, ref) => (
    <p
      ref={ref}
      data-slot="prompt-input-queue-item-content"
      className={clsx('prompt-input__queue-item-content', className)}
      {...rest}
    />
  ),
);
QueueItemContent.displayName = 'PromptInput.Queue.Item.Content';

const QueueItemDescription = forwardRef<HTMLParagraphElement, PromptInputQueueItemTextProps>(
  ({ className, ...rest }, ref) => (
    <p
      ref={ref}
      data-slot="prompt-input-queue-item-description"
      className={clsx('prompt-input__queue-item-description', className)}
      {...rest}
    />
  ),
);
QueueItemDescription.displayName = 'PromptInput.Queue.Item.Description';

const QueueItemAttachments = forwardRef<HTMLDivElement, PromptInputQueueItemSlotProps>(
  ({ className, ...rest }, ref) => (
    <div
      ref={ref}
      data-slot="prompt-input-queue-item-attachments"
      className={clsx('prompt-input__queue-item-attachments', className)}
      {...rest}
    />
  ),
);
QueueItemAttachments.displayName = 'PromptInput.Queue.Item.Attachments';

const QueueItemAttachmentsOverflow = forwardRef<
  HTMLSpanElement,
  PromptInputQueueItemAttachmentsOverflowProps
>(({ hiddenCount, noun = 'files', className, children, ...rest }, ref) => (
  <span
    ref={ref}
    data-slot="prompt-input-queue-item-attachments-overflow"
    className={clsx('prompt-input__queue-item-attachments-overflow', className)}
    {...rest}
  >
    {children ?? (hiddenCount !== undefined ? `+${hiddenCount} ${noun}` : null)}
  </span>
));
QueueItemAttachmentsOverflow.displayName = 'PromptInput.Queue.Item.AttachmentsOverflow';

const QueueItemActions = forwardRef<HTMLDivElement, PromptInputQueueItemSlotProps>(
  ({ className, ...rest }, ref) => (
    <div
      ref={ref}
      data-slot="prompt-input-queue-item-actions"
      className={clsx('prompt-input__queue-item-actions', className)}
      {...rest}
    />
  ),
);
QueueItemActions.displayName = 'PromptInput.Queue.Item.Actions';

const QueueItemRemove = ({
  className,
  children,
  'aria-label': ariaLabel = 'Remove queued prompt',
  ...rest
}: PromptInputQueueButtonProps) => (
  <Button
    data-slot="prompt-input-queue-item-remove"
    isIconOnly
    size="sm"
    variant="ghost"
    aria-label={ariaLabel}
    className={className}
    {...rest}
  >
    {children ?? <TrashIcon />}
  </Button>
);
QueueItemRemove.displayName = 'PromptInput.Queue.Item.Remove';

const QueueItemMore = ({
  className,
  children,
  'aria-label': ariaLabel = 'More queue actions',
  ...rest
}: PromptInputQueueButtonProps) => (
  <Button
    data-slot="prompt-input-queue-item-more"
    isIconOnly
    size="sm"
    variant="ghost"
    aria-label={ariaLabel}
    className={className}
    {...rest}
  >
    {children ?? <DotsIcon />}
  </Button>
);
QueueItemMore.displayName = 'PromptInput.Queue.Item.More';

const QueueItemAction = ({ className, ...rest }: PromptInputQueueButtonProps) => (
  <Button
    data-slot="prompt-input-queue-item-action"
    isIconOnly
    size="sm"
    variant="ghost"
    className={className}
    {...rest}
  />
);
QueueItemAction.displayName = 'PromptInput.Queue.Item.Action';

/**
 * AI 提示输入根（原站 API）：值受控/非受控、status 状态机、isDisabled、
 * inline 变体按行数切 data-expanded；shell/queue 等结构由子组件按 Anatomy 组合。
 */
const PromptInputRoot = ({
  value: valueProp,
  onValueChange,
  onSubmit,
  onStop,
  status = 'ready',
  isDisabled = false,
  lockInputOnRun = true,
  maxHeight = 240,
  size = 'md',
  variant = 'primary',
  className,
  ...rest
}: PromptInputProps) => {
  const [internalValue, setInternalValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const isControlled = valueProp !== undefined;
  const value = isControlled ? valueProp : internalValue;

  const setValue = useCallback(
    (next: string) => {
      if (!isControlled) {
        setInternalValue(next);
      }
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const submit = useCallback(() => {
    if (isDisabled || status === 'submitted' || status === 'streaming') {
      return;
    }
    if (value.trim().length === 0) {
      return;
    }
    onSubmit?.();
  }, [isDisabled, status, value, onSubmit]);

  const stop = useCallback(() => {
    onStop?.();
  }, [onStop]);

  const contextValue = useMemo<PromptInputContextValue>(
    () => ({
      value,
      setValue,
      submit,
      stop,
      status,
      isDisabled,
      lockInputOnRun,
      maxHeight,
      size,
      variant,
      setExpanded: setIsExpanded,
    }),
    [value, setValue, submit, stop, status, isDisabled, lockInputOnRun, maxHeight, size, variant],
  );

  return (
    <PromptInputContext.Provider value={contextValue}>
      <div
        data-slot="prompt-input"
        data-status={status}
        data-variant={variant}
        data-disabled={isDisabled ? 'true' : undefined}
        data-pending={status === 'submitted' ? 'true' : undefined}
        data-expanded={variant === 'inline' && isExpanded ? 'true' : undefined}
        className={clsx('prompt-input', size !== 'md' && `prompt-input--${size}`, className)}
        {...rest}
      />
    </PromptInputContext.Provider>
  );
};
PromptInputRoot.displayName = 'PromptInput';

const QueueItem = Object.assign(QueueItemRoot, {
  Handle: QueueItemHandle,
  Body: QueueItemBody,
  Icon: QueueItemIcon,
  Content: QueueItemContent,
  Description: QueueItemDescription,
  Attachments: QueueItemAttachments,
  AttachmentsOverflow: QueueItemAttachmentsOverflow,
  Actions: QueueItemActions,
  Remove: QueueItemRemove,
  More: QueueItemMore,
  Action: QueueItemAction,
});

const Queue = Object.assign(QueueRoot, {
  List: QueueList,
  Item: QueueItem,
});

const PromptInput = Object.assign(PromptInputRoot, {
  Shell,
  Content,
  Attachments,
  TextArea: TextAreaSlot,
  Toolbar,
  ToolbarStart,
  ToolbarEnd,
  Action,
  Send,
  Footer,
  Queue,
});

export default PromptInput;
