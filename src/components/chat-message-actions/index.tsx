'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type SVGProps,
} from 'react';
import { Button, type ButtonProps } from '@heroui/react';
import { ToggleButton, type ToggleButtonProps } from 'react-aria-components';
import clsx from 'clsx';

/** 基准快照中复制图标外层 Motion span 的终态内联样式（本仓无动画库，静态对齐） */
const ICON_MOTION_STYLE: CSSProperties = { filter: 'blur(0px)', opacity: 1, transform: 'none' };

/** Action 按钮固定类名（与快照一致：icon-only / sm / ghost） */
const ACTION_BUTTON_CLASS = 'button button--icon-only button--sm button--ghost chat-message__action';

type IconProps = SVGProps<SVGSVGElement>;
type CopyStatus = 'idle' | 'copied' | 'failed';

/** 预设图标统一为 16×16；自定义 className 置于基类 size-4 之前，与 custom-icons 快照顺序一致 */
const baseSvgProps = {
  fill: 'none',
  height: 16,
  viewBox: '0 0 16 16',
  width: 16,
  xmlns: 'http://www.w3.org/2000/svg',
} as const;

const CopyIcon = ({ className, ...rest }: IconProps) => (
  <svg
    {...baseSvgProps}
    className={clsx(className, 'size-4')}
    data-slot="chat-message-actions-copy-icon"
    {...rest}
  >
    <path
      clipRule="evenodd"
      d="M12 2.5H8A1.5 1.5 0 0 0 6.5 4v1H8a3 3 0 0 1 3 3v1.5h1A1.5 1.5 0 0 0 13.5 8V4A1.5 1.5 0 0 0 12 2.5M11 11h1a3 3 0 0 0 3-3V4a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3v1H4a3 3 0 0 0-3 3v4a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3zM4 6.5h4A1.5 1.5 0 0 1 9.5 8v4A1.5 1.5 0 0 1 8 13.5H4A1.5 1.5 0 0 1 2.5 12V8A1.5 1.5 0 0 1 4 6.5"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);
CopyIcon.displayName = 'ChatMessageActions.CopyIcon';

/** 复制成功对勾图标（成功态切换用，无快照基准，沿用 copy-icon 槽位） */
const CheckIcon = ({ className, ...rest }: IconProps) => (
  <svg
    {...baseSvgProps}
    className={clsx(className, 'size-4')}
    data-slot="chat-message-actions-copy-icon"
    {...rest}
  >
    <path
      clipRule="evenodd"
      d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06l2.72 2.72 6.72-6.72a.75.75 0 0 1 1.06 0"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);
CheckIcon.displayName = 'ChatMessageActions.CheckIcon';

/** 复制失败提示图标（clipboard 被拦截或不可用时短暂展示） */
const ErrorIcon = ({ className, ...rest }: IconProps) => (
  <svg
    {...baseSvgProps}
    className={clsx(className, 'size-4')}
    data-slot="chat-message-actions-copy-icon"
    {...rest}
  >
    <path
      clipRule="evenodd"
      d="M8 1.25a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5M6.22 5.72a.75.75 0 0 1 1.06 0L8 6.44l.72-.72a.75.75 0 1 1 1.06 1.06L9.06 7.5l.72.72a.75.75 0 1 1-1.06 1.06L8 8.56l-.72.72a.75.75 0 0 1-1.06-1.06l.72-.72-.72-.72a.75.75 0 0 1 0-1.06"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);
ErrorIcon.displayName = 'ChatMessageActions.ErrorIcon';

const ThumbsUpIcon = ({ className, ...rest }: IconProps) => (
  <svg
    {...baseSvgProps}
    className={clsx(className, 'size-4')}
    data-slot="chat-message-actions-thumbs-up-icon"
    {...rest}
  >
    <path
      clipRule="evenodd"
      d="m4 7 2.94-5.041a1.932 1.932 0 0 1 3.56 1.378L10.25 4.5 9.93 6h2.94a2 2 0 0 1 1.927 2.535l-.879 3.162A4 4 0 0 1 9.596 14.6L4.5 14zm5.771 6.11-3.863-.455-.379-5.3 2.708-4.64a.432.432 0 0 1 .796.308l-.571 2.663L8.073 7.5h4.796a.5.5 0 0 1 .482.634l-.879 3.162a2.5 2.5 0 0 1-2.7 1.814M2.748 7.447a.75.75 0 1 0-1.496.106l.5 7a.75.75 0 0 0 1.496-.106z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);
ThumbsUpIcon.displayName = 'ChatMessageActions.ThumbsUpIcon';

const ThumbsDownIcon = ({ className, ...rest }: IconProps) => (
  <svg
    {...baseSvgProps}
    className={clsx(className, 'size-4')}
    data-slot="chat-message-actions-thumbs-down-icon"
    {...rest}
  >
    <path
      clipRule="evenodd"
      d="m12 9-2.94 5.041a1.932 1.932 0 0 1-3.56-1.378l.25-1.163.321-1.5h-2.94a2 2 0 0 1-1.927-2.535l.879-3.162A4 4 0 0 1 6.404 1.4L11.5 2zM6.229 2.89l3.863.455.379 5.3-2.708 4.64a.432.432 0 0 1-.796-.308l.571-2.663.389-1.814H3.13a.5.5 0 0 1-.482-.634l.879-3.162a2.5 2.5 0 0 1 2.7-1.814m7.023 5.663a.75.75 0 1 0 1.496-.106l-.5-7a.75.75 0 0 0-1.496.106z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);
ThumbsDownIcon.displayName = 'ChatMessageActions.ThumbsDownIcon';

const RegenerateIcon = ({ className, ...rest }: IconProps) => (
  <svg
    {...baseSvgProps}
    className={clsx(className, 'size-4')}
    data-slot="chat-message-actions-regenerate-icon"
    {...rest}
  >
    <path
      clipRule="evenodd"
      d="M8 1.5a6.5 6.5 0 0 1 6.445 5.649.75.75 0 1 1-1.488.194A5.001 5.001 0 0 0 4.43 4.5h1.32a.75.75 0 0 1 0 1.5h-3A.75.75 0 0 1 2 5.25v-3a.75.75 0 1 1 1.5 0v1.06A6.48 6.48 0 0 1 8 1.5m5.25 13a.75.75 0 0 0 .75-.75v-3a.75.75 0 0 0-.75-.75h-3a.75.75 0 1 0 0 1.5h1.32a5.001 5.001 0 0 1-8.528-2.843.75.75 0 1 0-1.487.194 6.501 6.501 0 0 0 10.945 3.84v1.059c0 .414.336.75.75.75"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);
RegenerateIcon.displayName = 'ChatMessageActions.RegenerateIcon';

const MenuIcon = ({ className, ...rest }: IconProps) => (
  <svg
    {...baseSvgProps}
    className={clsx(className, 'size-4')}
    data-slot="chat-message-actions-menu-icon"
    {...rest}
  >
    <path
      clipRule="evenodd"
      d="M3 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M9.5 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);
MenuIcon.displayName = 'ChatMessageActions.MenuIcon';

const copyText = async (text: string) => {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText !== undefined) {
    await navigator.clipboard.writeText(text);
    return;
  }

  if (typeof document === 'undefined') {
    throw new Error('Clipboard API is unavailable');
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.inset = '0';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    if (!document.execCommand('copy')) {
      throw new Error('Copy command was rejected');
    }
  } finally {
    document.body.removeChild(textarea);
  }
};

const getCopyLabel = (status: CopyStatus, label: string) => {
  if (status === 'copied') return 'Copied';
  if (status === 'failed') return 'Copy failed';
  return label;
};

/**
 * 通用动作按钮：OSS Button（icon-only / sm / ghost），输出 button[data-slot=chat-message-action]。
 * 参考实现 ChatMessageActions.Action「Extends HeroUI Button props」，故透传全部 Button props。
 */
export type ChatMessageActionsActionProps = Omit<ButtonProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

const Action = forwardRef<HTMLButtonElement, ChatMessageActionsActionProps>(
  // 固定 icon-only/sm/ghost 渲染以对齐快照，丢弃同名覆盖 props
  ({ className, isIconOnly: _isIconOnly, size: _size, variant: _variant, ...rest }, ref) => (
    <Button
      ref={ref}
      data-slot="chat-message-action"
      isIconOnly
      size="sm"
      variant="ghost"
      className={clsx(ACTION_BUTTON_CLASS, className)}
      {...rest}
    />
  ),
);
Action.displayName = 'ChatMessageActions.Action';

/**
 * 复制动作：navigator.clipboard 写入成功后切换对勾图标约 2 秒，失败时短暂展示失败图标。
 * 图标外层 motion span 与快照一致（data-slot=chat-message-actions-copy-icon-motion）。
 */
export type ChatMessageActionsCopyProps = Omit<ButtonProps, 'className' | 'style' | 'children'> & {
  /** 点击时写入剪贴板的文本（参考 API） */
  content: string;
  /** 自定义复制图标；缺省用预设 CopyIcon */
  icon?: ReactNode;
  /** 自定义成功态图标；缺省用预设 CheckIcon */
  copiedIcon?: ReactNode;
  /** 自定义失败态图标；缺省用预设 ErrorIcon */
  failedIcon?: ReactNode;
  /** 成功态保持毫秒数（默认 2000） */
  timeout?: number;
  className?: string;
  style?: CSSProperties;
};

const Copy = forwardRef<HTMLButtonElement, ChatMessageActionsCopyProps>(
  (
    {
      content,
      icon,
      copiedIcon,
      failedIcon,
      timeout = 2000,
      className,
      onPress,
      'aria-label': ariaLabel = 'Copy',
      ...rest
    },
    ref,
  ) => {
    const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');
    const resetTimerRef = useRef<number | null>(null);

    const clearResetTimer = useCallback(() => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
        resetTimerRef.current = null;
      }
    }, []);

    useEffect(
      () => () => {
        clearResetTimer();
      },
      [clearResetTimer],
    );

    const showStatus = useCallback(
      (status: Exclude<CopyStatus, 'idle'>) => {
        setCopyStatus(status);
        clearResetTimer();
        resetTimerRef.current = window.setTimeout(() => {
          setCopyStatus('idle');
          resetTimerRef.current = null;
        }, timeout);
      },
      [clearResetTimer, timeout],
    );

    const handlePress = useCallback<NonNullable<ButtonProps['onPress']>>(
      (event) => {
        onPress?.(event);
        void copyText(content)
          .then(() => showStatus('copied'))
          .catch(() => showStatus('failed'));
      },
      [onPress, content, showStatus],
    );

    const currentIcon =
      copyStatus === 'copied'
        ? (copiedIcon ?? <CheckIcon />)
        : copyStatus === 'failed'
          ? (failedIcon ?? <ErrorIcon />)
          : (icon ?? <CopyIcon />);

    return (
      <Button
        ref={ref}
        data-slot="chat-message-action"
        data-copy-status={copyStatus}
        isIconOnly
        size="sm"
        variant="ghost"
        aria-label={getCopyLabel(copyStatus, ariaLabel)}
        className={clsx(ACTION_BUTTON_CLASS, className)}
        onPress={handlePress}
        {...rest}
      >
        <span
          className="flex size-4 items-center justify-center"
          data-slot="chat-message-actions-copy-icon-motion"
          style={ICON_MOTION_STYLE}
        >
          {currentIcon}
        </span>
      </Button>
    );
  },
);
Copy.displayName = 'ChatMessageActions.Copy';

/**
 * 赞/踩切换动作：RAC ToggleButton 提供受控 isSelected / onChange 与 aria-pressed、data-selected。
 * 手动套用 ACTION_BUTTON_CLASS 保证与快照按钮视觉一致。
 */
export type ChatMessageActionsToggleProps = Omit<ToggleButtonProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

const ThumbsUp = forwardRef<HTMLButtonElement, ChatMessageActionsToggleProps>(
  ({ className, children, 'aria-label': ariaLabel = 'Good response', ...rest }, ref) => (
    <ToggleButton
      ref={ref}
      data-slot="chat-message-action"
      aria-label={ariaLabel}
      className={clsx(ACTION_BUTTON_CLASS, className)}
      {...rest}
    >
      {(renderProps) => (
        <>{typeof children === 'function' ? children(renderProps) : (children ?? <ThumbsUpIcon />)}</>
      )}
    </ToggleButton>
  ),
);
ThumbsUp.displayName = 'ChatMessageActions.ThumbsUp';

const ThumbsDown = forwardRef<HTMLButtonElement, ChatMessageActionsToggleProps>(
  ({ className, children, 'aria-label': ariaLabel = 'Bad response', ...rest }, ref) => (
    <ToggleButton
      ref={ref}
      data-slot="chat-message-action"
      aria-label={ariaLabel}
      className={clsx(ACTION_BUTTON_CLASS, className)}
      {...rest}
    >
      {(renderProps) => (
        <>{typeof children === 'function' ? children(renderProps) : (children ?? <ThumbsDownIcon />)}</>
      )}
    </ToggleButton>
  ),
);
ThumbsDown.displayName = 'ChatMessageActions.ThumbsDown';

/** 重新生成动作：预设 OSS Button + RegenerateIcon */
const Regenerate = forwardRef<HTMLButtonElement, ChatMessageActionsActionProps>(
  ({ children, 'aria-label': ariaLabel = 'Regenerate', ...rest }, ref) => (
    <Action ref={ref} aria-label={ariaLabel} {...rest}>
      {children ?? <RegenerateIcon />}
    </Action>
  ),
);
Regenerate.displayName = 'ChatMessageActions.Regenerate';

/** 更多动作触发：预设 OSS Button + MenuIcon */
const Menu = forwardRef<HTMLButtonElement, ChatMessageActionsActionProps>(
  ({ children, 'aria-label': ariaLabel = 'More actions', ...rest }, ref) => (
    <Action ref={ref} aria-label={ariaLabel} {...rest}>
      {children ?? <MenuIcon />}
    </Action>
  ),
);
Menu.displayName = 'ChatMessageActions.Menu';

/** 根动作行：div.chat-message-actions（参考 API：仅原生 div props） */
export type ChatMessageActionsProps = HTMLAttributes<HTMLDivElement>;

const ChatMessageActionsRoot = forwardRef<HTMLDivElement, ChatMessageActionsProps>(
  ({ className, ...rest }, ref) => (
    <div
      ref={ref}
      data-slot="chat-message-actions"
      className={clsx('chat-message-actions', className)}
      {...rest}
    />
  ),
);
ChatMessageActionsRoot.displayName = 'ChatMessageActions';

const ChatMessageActions = Object.assign(ChatMessageActionsRoot, {
  Action,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Regenerate,
  Menu,
  CopyIcon,
  CheckIcon,
  ErrorIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  RegenerateIcon,
  MenuIcon,
});

export default ChatMessageActions;
