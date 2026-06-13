import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';
import SpinnerBase from '../spinner';

export type ChatLoaderVariant = 'dots' | 'pulse' | 'skeleton' | 'spinner';
export type ChatLoaderSize = 'sm' | 'md' | 'lg';

export type ChatLoaderBaseProps = HTMLAttributes<HTMLSpanElement> & {
  size?: ChatLoaderSize;
  label?: string;
};

export type ChatLoaderProps = ChatLoaderBaseProps & {
  variant?: ChatLoaderVariant;
};

export type ChatLoaderSkeletonProps = ChatLoaderBaseProps & {
  children?: ReactNode;
};

export type ChatLoaderSkeletonAvatarProps = HTMLAttributes<HTMLSpanElement> & {
  size?: ChatLoaderSize;
};

export type ChatLoaderSkeletonLineProps = HTMLAttributes<HTMLSpanElement> & {
  size?: ChatLoaderSize;
};

export type ChatLoaderSkeletonBlockProps = HTMLAttributes<HTMLSpanElement>;

const SKELETON_LINE_COUNT = 3;

const ChatLoaderDots = forwardRef<HTMLSpanElement, ChatLoaderBaseProps>(
  ({ size = 'md', label = '加载中', className, ...rest }, ref) => (
    <span
      ref={ref}
      role="status"
      aria-label={label}
      className={clsx('chat-loader__dots', size !== 'md' && `chat-loader__dots--${size}`, className)}
      {...rest}
    >
      <span className="chat-loader__dot" />
      <span className="chat-loader__dot" />
      <span className="chat-loader__dot" />
    </span>
  ),
);

ChatLoaderDots.displayName = 'ChatLoader.Dots';

const ChatLoaderPulse = forwardRef<HTMLSpanElement, ChatLoaderBaseProps>(
  ({ size = 'md', label = '加载中', className, ...rest }, ref) => (
    <span
      ref={ref}
      role="status"
      aria-label={label}
      className={clsx('chat-loader__pulse', size !== 'md' && `chat-loader__pulse--${size}`, className)}
      {...rest}
    />
  ),
);

ChatLoaderPulse.displayName = 'ChatLoader.Pulse';

const ChatLoaderSpinner = forwardRef<HTMLSpanElement, Omit<ChatLoaderBaseProps, 'size'>>(
  ({ label = '加载中', className, ...rest }, ref) => (
    <span
      ref={ref}
      role="status"
      aria-label={label}
      className={clsx('chat-loader__spinner', className)}
      {...rest}
    >
      <SpinnerBase />
    </span>
  ),
);

ChatLoaderSpinner.displayName = 'ChatLoader.Spinner';

const ChatLoaderSkeletonAvatar = forwardRef<HTMLSpanElement, ChatLoaderSkeletonAvatarProps>(
  ({ size = 'md', className, ...rest }, ref) => (
    <span
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

const ChatLoaderSkeletonLine = forwardRef<HTMLSpanElement, ChatLoaderSkeletonLineProps>(
  ({ size = 'md', className, ...rest }, ref) => (
    <span
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

const ChatLoaderSkeletonBlock = forwardRef<HTMLSpanElement, ChatLoaderSkeletonBlockProps>(
  ({ className, ...rest }, ref) => (
    <span ref={ref} className={clsx('chat-loader__skeleton-block', className)} {...rest} />
  ),
);

ChatLoaderSkeletonBlock.displayName = 'ChatLoader.SkeletonBlock';

const ChatLoaderSkeleton = forwardRef<HTMLSpanElement, ChatLoaderSkeletonProps>(
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
      <span
        ref={ref}
        role="status"
        aria-label={label}
        className={clsx('chat-loader__skeleton', className)}
        {...rest}
      >
        {content}
      </span>
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

const ChatLoaderRoot = forwardRef<HTMLSpanElement, ChatLoaderProps>(
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
