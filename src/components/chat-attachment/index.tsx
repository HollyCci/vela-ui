import { forwardRef, type HTMLAttributes, type MouseEventHandler, type ReactNode } from 'react';
import clsx from 'clsx';

export type ChatAttachmentKind = 'image' | 'video' | 'file';

export type ChatAttachmentProps = HTMLAttributes<HTMLDivElement> & {
  name: string;
  kind?: ChatAttachmentKind;
  src?: string;
  fallbackIcon?: ReactNode;
  onRemove?: MouseEventHandler<HTMLButtonElement>;
};

const ChatAttachment = forwardRef<HTMLDivElement, ChatAttachmentProps>(
  ({ name, kind = 'file', src, fallbackIcon, onRemove, className, ...rest }, ref) => (
    <div ref={ref} className={clsx('chat-attachment', className)} {...rest}>
      <div className="chat-attachment__preview">
        {kind === 'image' && src !== undefined ? (
          <img className="chat-attachment__preview-image" src={src} alt={name} />
        ) : kind === 'video' && src !== undefined ? (
          <video className="chat-attachment__preview-video" src={src} muted />
        ) : (
          <span className="chat-attachment__preview-fallback" aria-hidden="true">
            {fallbackIcon ?? '📄'}
          </span>
        )}
      </div>
      <span className="chat-attachment__name">{name}</span>
      {onRemove !== undefined && (
        <button
          type="button"
          className="chat-attachment__remove"
          data-slot="chat-attachment-remove"
          aria-label={`移除附件 ${name}`}
          onClick={onRemove}
        >
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" />
          </svg>
        </button>
      )}
    </div>
  ),
);

ChatAttachment.displayName = 'ChatAttachment';

export default ChatAttachment;
