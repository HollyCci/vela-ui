import { forwardRef, type HTMLAttributes } from 'react';
import clsx from 'clsx';
import Spinner from '../spinner';

export type ChatLoaderVariant = 'dots' | 'pulse' | 'skeleton' | 'spinner';
export type ChatLoaderSize = 'sm' | 'md' | 'lg';

export type ChatLoaderProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: ChatLoaderVariant;
  size?: ChatLoaderSize;
  label?: string;
};

const SKELETON_LINE_COUNT = 3;

const ChatLoader = forwardRef<HTMLSpanElement, ChatLoaderProps>(
  ({ variant = 'dots', size = 'md', label = '加载中', className, ...rest }, ref) => {
    if (variant === 'pulse') {
      return (
        <span
          ref={ref}
          role="status"
          aria-label={label}
          className={clsx('chat-loader__pulse', size !== 'md' && `chat-loader__pulse--${size}`, className)}
          {...rest}
        />
      );
    }
    if (variant === 'skeleton') {
      return (
        <span
          ref={ref}
          role="status"
          aria-label={label}
          className={clsx('chat-loader__skeleton', className)}
          {...rest}
        >
          <span
            className={clsx(
              'chat-loader__skeleton-avatar',
              size !== 'md' && `chat-loader__skeleton-avatar--${size}`,
            )}
          />
          <span className="chat-loader__skeleton-block">
            {Array.from({ length: SKELETON_LINE_COUNT }, (_, index) => (
              <span
                key={index}
                className={clsx(
                  'chat-loader__skeleton-line',
                  size !== 'md' && `chat-loader__skeleton-line--${size}`,
                )}
              />
            ))}
          </span>
        </span>
      );
    }
    if (variant === 'spinner') {
      return (
        <span
          ref={ref}
          role="status"
          aria-label={label}
          className={clsx('chat-loader__spinner', className)}
          {...rest}
        >
          <Spinner />
        </span>
      );
    }
    return (
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
    );
  },
);

ChatLoader.displayName = 'ChatLoader';

export default ChatLoader;
