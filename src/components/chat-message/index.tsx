import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';
import Avatar, { type AvatarProps } from '../avatar';

export type ChatMessageVariant = 'user' | 'assistant';

export type ChatMessageProps = HTMLAttributes<HTMLDivElement> & {
  variant: ChatMessageVariant;
  avatar?: ReactNode;
  media?: ReactNode;
  actions?: ReactNode;
};

export type ChatMessageAssistantProps = HTMLAttributes<HTMLDivElement>;
export type ChatMessageUserProps = HTMLAttributes<HTMLDivElement>;
export type ChatMessageBodyProps = HTMLAttributes<HTMLDivElement>;
export type ChatMessageBubbleProps = HTMLAttributes<HTMLDivElement>;
export type ChatMessageContentProps = HTMLAttributes<HTMLDivElement>;
export type ChatMessageActionsSlotProps = HTMLAttributes<HTMLDivElement>;
export type ChatMessageMediaProps = HTMLAttributes<HTMLDivElement>;
export type ChatMessageActionProps = HTMLAttributes<HTMLDivElement>;
export type ChatMessageAvatarProps = AvatarProps & {
  show?: boolean;
};

const Assistant = forwardRef<HTMLDivElement, ChatMessageAssistantProps>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    data-slot="chat-message-assistant"
    className={clsx('chat-message--assistant', className)}
    {...rest}
  />
));
Assistant.displayName = 'ChatMessage.Assistant';

const User = forwardRef<HTMLDivElement, ChatMessageUserProps>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    data-slot="chat-message-user"
    className={clsx('chat-message--user', className)}
    {...rest}
  />
));
User.displayName = 'ChatMessage.User';

const MessageAvatar = forwardRef<HTMLSpanElement, ChatMessageAvatarProps>(
  ({ className, show = true, src, alt, fallback, color, size, isSoft, ...rest }, ref) => {
    if (!show) {
      return (
        <span
          ref={ref}
          aria-hidden="true"
          data-slot="chat-message-avatar"
          className={clsx('chat-message__avatar-spacer', className)}
          {...rest}
        />
      );
    }

    return (
      <Avatar
        ref={ref}
        data-slot="chat-message-avatar"
        className={clsx('chat-message__avatar', className)}
        src={src}
        alt={alt}
        fallback={fallback}
        color={color}
        size={size}
        isSoft={isSoft}
        {...rest}
      />
    );
  },
);
MessageAvatar.displayName = 'ChatMessage.Avatar';

const Body = forwardRef<HTMLDivElement, ChatMessageBodyProps>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    data-slot="chat-message-body"
    className={clsx('chat-message__body', className)}
    {...rest}
  />
));
Body.displayName = 'ChatMessage.Body';

const Bubble = forwardRef<HTMLDivElement, ChatMessageBubbleProps>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    data-slot="chat-message-bubble"
    className={clsx('chat-message__bubble', className)}
    {...rest}
  />
));
Bubble.displayName = 'ChatMessage.Bubble';

const Content = forwardRef<HTMLDivElement, ChatMessageContentProps>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    data-slot="chat-message-content"
    className={clsx('chat-message__content', className)}
    {...rest}
  />
));
Content.displayName = 'ChatMessage.Content';

const Actions = forwardRef<HTMLDivElement, ChatMessageActionsSlotProps>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    data-slot="chat-message-actions"
    className={clsx('chat-message__actions', className)}
    {...rest}
  />
));
Actions.displayName = 'ChatMessage.Actions';

const Media = forwardRef<HTMLDivElement, ChatMessageMediaProps>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    data-slot="chat-message-media"
    className={clsx('chat-message__media', className)}
    {...rest}
  />
));
Media.displayName = 'ChatMessage.Media';

const AvatarSlot = ({ children }: { children: ReactNode }) => (
  <div data-slot="chat-message-avatar" className="chat-message__avatar">
    {children}
  </div>
);

const ChatMessageRoot = forwardRef<HTMLDivElement, ChatMessageProps>(
  ({ variant, avatar, media, actions, className, children, ...rest }, ref) => {
    if (variant === 'user') {
      return (
        <User ref={ref} className={className} {...rest}>
          {media !== undefined && <Media>{media}</Media>}
          <Bubble>
            <Content>{children}</Content>
          </Bubble>
          {actions !== undefined && <Actions>{actions}</Actions>}
        </User>
      );
    }
    return (
      <Assistant ref={ref} className={className} {...rest}>
        {avatar !== undefined ? (
          <AvatarSlot>{avatar}</AvatarSlot>
        ) : (
          <MessageAvatar show={false} />
        )}
        <Body>
          {media !== undefined && <Media>{media}</Media>}
          <Content>{children}</Content>
          {actions !== undefined && <Actions>{actions}</Actions>}
        </Body>
      </Assistant>
    );
  },
);
ChatMessageRoot.displayName = 'ChatMessage';

const Action = forwardRef<HTMLDivElement, ChatMessageActionProps>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    data-slot="chat-message-action"
    className={clsx('chat-message__action', className)}
    {...rest}
  />
));
Action.displayName = 'ChatMessage.Action';

const ChatMessage = Object.assign(ChatMessageRoot, {
  Assistant,
  User,
  Avatar: MessageAvatar,
  Body,
  Bubble,
  Content,
  Actions,
  Media,
  Action,
});

export default ChatMessage;
