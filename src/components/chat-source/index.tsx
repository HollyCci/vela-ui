import { forwardRef, type AnchorHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

export type ChatSourceProps = HTMLAttributes<HTMLSpanElement> & {
  href: string;
  title: string;
  iconSrc?: string;
  fallback?: ReactNode;
};

const ChatSourceRoot = forwardRef<HTMLSpanElement, ChatSourceProps>(
  ({ href, title, iconSrc, fallback, className, ...rest }, ref) => (
    <span ref={ref} className={clsx('chat-source', className)} {...rest}>
      <span className="chat-source__trigger">
        <a
          className="chat-source__trigger-link"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {iconSrc !== undefined ? (
            <img className="chat-source__icon" src={iconSrc} alt="" aria-hidden="true" />
          ) : (
            <span className="chat-source__icon-fallback" aria-hidden="true">
              {fallback ?? title.charAt(0)}
            </span>
          )}
          <span className="chat-source__title">{title}</span>
        </a>
      </span>
    </span>
  ),
);
ChatSourceRoot.displayName = 'ChatSource';

export type ChatSourcePreviewProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  title: string;
  description?: string;
  iconSrc?: string;
};

const Preview = forwardRef<HTMLAnchorElement, ChatSourcePreviewProps>(
  ({ title, description, iconSrc, className, ...rest }, ref) => (
    <div className="chat-source__preview">
      <a
        ref={ref}
        className={clsx('chat-source__preview-link', className)}
        target="_blank"
        rel="noopener noreferrer"
        {...rest}
      >
        <span className="chat-source__preview-header">
          {iconSrc !== undefined && (
            <img className="chat-source__icon" src={iconSrc} alt="" aria-hidden="true" />
          )}
          <span className="chat-source__preview-title">{title}</span>
        </span>
        {description !== undefined && (
          <span className="chat-source__preview-description">{description}</span>
        )}
      </a>
    </div>
  ),
);
Preview.displayName = 'ChatSource.Preview';

const ChatSource = Object.assign(ChatSourceRoot, { Preview });

export default ChatSource;
