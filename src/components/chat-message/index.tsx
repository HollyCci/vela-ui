import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

export type ChatMessageVariant = 'user' | 'assistant';

export type ChatMessageProps = HTMLAttributes<HTMLDivElement> & {
  variant: ChatMessageVariant;
  avatar?: ReactNode;
  media?: ReactNode;
  actions?: ReactNode;
};

export type ChatMessageActionProps = HTMLAttributes<HTMLDivElement>;

const ChatMessageRoot = forwardRef<HTMLDivElement, ChatMessageProps>(
  ({ variant, avatar, media, actions, className, children, ...rest }, ref) => {
    if (variant === 'user') {
      return (
        <div ref={ref} className={clsx('chat-message--user', className)} {...rest}>
          {media !== undefined && <div className="chat-message__media">{media}</div>}
          <div className="chat-message__bubble">
            <div className="chat-message__content">{children}</div>
          </div>
          {actions !== undefined && <div className="chat-message__actions">{actions}</div>}
        </div>
      );
    }
    return (
      <div ref={ref} className={clsx('chat-message--assistant', className)} {...rest}>
        {avatar !== undefined ? (
          <div className="chat-message__avatar">{avatar}</div>
        ) : (
          <div className="chat-message__avatar-spacer" aria-hidden="true" />
        )}
        <div className="chat-message__body">
          {media !== undefined && <div className="chat-message__media">{media}</div>}
          <div className="chat-message__content">{children}</div>
          {actions !== undefined && <div className="chat-message__actions">{actions}</div>}
        </div>
      </div>
    );
  },
);
ChatMessageRoot.displayName = 'ChatMessage';

const Action = forwardRef<HTMLDivElement, ChatMessageActionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('chat-message__action', className)} {...rest} />
));
Action.displayName = 'ChatMessage.Action';

const ChatMessage = Object.assign(ChatMessageRoot, { Action });

export default ChatMessage;
