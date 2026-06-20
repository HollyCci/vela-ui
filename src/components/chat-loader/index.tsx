import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';
import SpinnerBase from '../spinner';

export type ChatLoaderVariant = 'dots' | 'pulse' | 'skeleton' | 'spinner';
export type ChatLoaderSize = 'sm' | 'md' | 'lg';

/*
 * 渲染元素对齐线上 Pro 版：所有子组件（Dots / Pulse / Spinner / Skeleton /
 * SkeletonAvatar / SkeletonBlock / SkeletonLine）都是结构 primitive，
 * 「Supports native `div` props」——故 renders-as = div，props 继承原生 div 属性。
 * div↔span 切换不触发 a11y 冲突，CSS 锁的是 .chat-loader__* 类名而非标签，视觉零变化。
 *
 * 有意偏差：Pro API 表未列 `label`/`role="status"`。本库门禁跑 axe，
 * 纯动画 div 无可访问名会被判为无标签状态控件 → 保留 `role="status"` + `aria-label`
 * （由 `label` 提供，默认「加载中」）以保 axe 0 违规。仅此一处 a11y 偏差，不外扩。
 */
export type ChatLoaderBaseProps = HTMLAttributes<HTMLDivElement> & {
  size?: ChatLoaderSize;
  label?: string;
};

export type ChatLoaderProps = ChatLoaderBaseProps & {
  variant?: ChatLoaderVariant;
};

export type ChatLoaderSkeletonProps = ChatLoaderBaseProps & {
  children?: ReactNode;
};

export type ChatLoaderSkeletonAvatarProps = HTMLAttributes<HTMLDivElement> & {
  size?: ChatLoaderSize;
};

export type ChatLoaderSkeletonLineProps = HTMLAttributes<HTMLDivElement> & {
  size?: ChatLoaderSize;
};

export type ChatLoaderSkeletonBlockProps = HTMLAttributes<HTMLDivElement>;

const SKELETON_LINE_COUNT = 3;

const ChatLoaderDots = forwardRef<HTMLDivElement, ChatLoaderBaseProps>(
  ({ size = 'md', label = '加载中', className, ...rest }, ref) => (
    <div
      ref={ref}
      role="status"
      aria-label={label}
      className={clsx('chat-loader__dots', size !== 'md' && `chat-loader__dots--${size}`, className)}
      {...rest}
    >
      <span className="chat-loader__dot" />
      <span className="chat-loader__dot" />
      <span className="chat-loader__dot" />
    </div>
  ),
);

ChatLoaderDots.displayName = 'ChatLoader.Dots';

const ChatLoaderPulse = forwardRef<HTMLDivElement, ChatLoaderBaseProps>(
  ({ size = 'md', label = '加载中', className, ...rest }, ref) => (
    <div
      ref={ref}
      role="status"
      aria-label={label}
      className={clsx('chat-loader__pulse', size !== 'md' && `chat-loader__pulse--${size}`, className)}
      {...rest}
    />
  ),
);

ChatLoaderPulse.displayName = 'ChatLoader.Pulse';

const ChatLoaderSpinner = forwardRef<HTMLDivElement, Omit<ChatLoaderBaseProps, 'size'>>(
  ({ label = '加载中', className, ...rest }, ref) => (
    <div
      ref={ref}
      role="status"
      aria-label={label}
      className={clsx('chat-loader__spinner', className)}
      {...rest}
    >
      <SpinnerBase />
    </div>
  ),
);

ChatLoaderSpinner.displayName = 'ChatLoader.Spinner';

const ChatLoaderSkeletonAvatar = forwardRef<HTMLDivElement, ChatLoaderSkeletonAvatarProps>(
  ({ size = 'md', className, ...rest }, ref) => (
    <div
      ref={ref}
      className={clsx(
        'chat-loader__skeleton-avatar',
        size !== 'md' && `chat-loader__skeleton-avatar--${size}`,
        className,
      )}
      {...rest}
    />
  ),
);

ChatLoaderSkeletonAvatar.displayName = 'ChatLoader.SkeletonAvatar';

const ChatLoaderSkeletonLine = forwardRef<HTMLDivElement, ChatLoaderSkeletonLineProps>(
  ({ size = 'md', className, ...rest }, ref) => (
    <div
      ref={ref}
      className={clsx(
        'chat-loader__skeleton-line',
        size !== 'md' && `chat-loader__skeleton-line--${size}`,
        className,
      )}
      {...rest}
    />
  ),
);

ChatLoaderSkeletonLine.displayName = 'ChatLoader.SkeletonLine';

const ChatLoaderSkeletonBlock = forwardRef<HTMLDivElement, ChatLoaderSkeletonBlockProps>(
  ({ className, ...rest }, ref) => (
    <div ref={ref} className={clsx('chat-loader__skeleton-block', className)} {...rest} />
  ),
);

ChatLoaderSkeletonBlock.displayName = 'ChatLoader.SkeletonBlock';

const ChatLoaderSkeleton = forwardRef<HTMLDivElement, ChatLoaderSkeletonProps>(
  ({ size = 'md', label = '加载中', className, children, ...rest }, ref) => {
    const content = children ?? (
      <>
        <ChatLoaderSkeletonAvatar size={size} />
        <ChatLoaderSkeletonBlock>
          {Array.from({ length: SKELETON_LINE_COUNT }, (_, index) => (
            <ChatLoaderSkeletonLine key={index} size={size} />
          ))}
        </ChatLoaderSkeletonBlock>
      </>
    );

    return (
      <div
        ref={ref}
        role="status"
        aria-label={label}
        className={clsx('chat-loader__skeleton', className)}
        {...rest}
      >
        {content}
      </div>
    );
  },
);

ChatLoaderSkeleton.displayName = 'ChatLoader.Skeleton';

type ChatLoaderComponent = typeof ChatLoaderRoot & {
  Dots: typeof ChatLoaderDots;
  Pulse: typeof ChatLoaderPulse;
  Spinner: typeof ChatLoaderSpinner;
  Skeleton: typeof ChatLoaderSkeleton;
  SkeletonAvatar: typeof ChatLoaderSkeletonAvatar;
  SkeletonBlock: typeof ChatLoaderSkeletonBlock;
  SkeletonLine: typeof ChatLoaderSkeletonLine;
};

const ChatLoaderRoot = forwardRef<HTMLDivElement, ChatLoaderProps>(
  ({ variant = 'dots', size = 'md', ...rest }, ref) => {
    if (variant === 'pulse') return <ChatLoaderPulse ref={ref} size={size} {...rest} />;
    if (variant === 'skeleton') return <ChatLoaderSkeleton ref={ref} size={size} {...rest} />;
    if (variant === 'spinner') return <ChatLoaderSpinner ref={ref} {...rest} />;
    return <ChatLoaderDots ref={ref} size={size} {...rest} />;
  },
);

ChatLoaderRoot.displayName = 'ChatLoader';

const ChatLoader = Object.assign(ChatLoaderRoot, {
  Dots: ChatLoaderDots,
  Pulse: ChatLoaderPulse,
  Spinner: ChatLoaderSpinner,
  Skeleton: ChatLoaderSkeleton,
  SkeletonAvatar: ChatLoaderSkeletonAvatar,
  SkeletonBlock: ChatLoaderSkeletonBlock,
  SkeletonLine: ChatLoaderSkeletonLine,
}) satisfies ChatLoaderComponent;

export {
  ChatLoaderDots,
  ChatLoaderPulse,
  ChatLoaderSpinner,
  ChatLoaderSkeleton,
  ChatLoaderSkeletonAvatar,
  ChatLoaderSkeletonBlock,
  ChatLoaderSkeletonLine,
};

export default ChatLoader;
