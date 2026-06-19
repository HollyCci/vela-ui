import {
  forwardRef,
  type ChangeEvent,
  type DragEvent,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
} from 'react';
import clsx from 'clsx';

export type ChatAttachmentKind = 'image' | 'video' | 'file';

export type ChatAttachmentProps = HTMLAttributes<HTMLDivElement> & {
  name: string;
  kind?: ChatAttachmentKind;
  src?: string;
  fallbackIcon?: ReactNode;
  onRemove?: MouseEventHandler<HTMLButtonElement>;
};

const ChatAttachmentRoot = forwardRef<HTMLDivElement, ChatAttachmentProps>(
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

ChatAttachmentRoot.displayName = 'ChatAttachment';

// 隐藏文件输入：运行时不依赖独立 CSS，行内样式收起到 0 尺寸即可
const HIDDEN_INPUT_STYLE = {
  position: 'absolute' as const,
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden' as const,
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap' as const,
  border: 0,
};

export type ChatAttachmentInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'onSelect'
> & {
  /** 通过文件选择器或拖放选中文件时回调（与 RAC FileTrigger 一致，回传原始 File 列表） */
  onSelect?: (files: File[]) => void;
};

/**
 * 真实隐藏 <input type="file">，替换原先伪造的字符串附件。
 * 选择文件后通过 onSelect 回传 File 对象；同时挂 onDrop 兜底基础拖放选取。
 */
const Input = forwardRef<HTMLInputElement, ChatAttachmentInputProps>(
  ({ onSelect, onChange, onDrop, multiple = true, className, style, ...rest }, ref) => {
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      onChange?.(event);
      const { files } = event.target;
      if (files !== null && files.length > 0) {
        onSelect?.(Array.from(files));
      }
      // 与 RAC FileTrigger 行为一致：清空 value，重复选择同一文件仍触发 change
      event.target.value = '';
    };

    const handleDrop = (event: DragEvent<HTMLInputElement>) => {
      onDrop?.(event);
      const dropped = Array.from(event.dataTransfer?.files ?? []);
      if (dropped.length > 0) {
        event.preventDefault();
        onSelect?.(dropped);
      }
    };

    return (
      <input
        ref={ref}
        type="file"
        multiple={multiple}
        data-slot="chat-attachment-input"
        className={clsx('chat-attachment__input', className)}
        style={{ ...HIDDEN_INPUT_STYLE, ...style }}
        onChange={handleChange}
        onDrop={handleDrop}
        {...rest}
      />
    );
  },
);
Input.displayName = 'ChatAttachment.Input';

export type ChatAttachmentGroupProps = HTMLAttributes<HTMLDivElement> & {
  /** 分组标签，建立 aria-label；缺省时回退到 role="list" 的隐式语义 */
  label?: string;
};

/**
 * 分组容器：role="list" 的带标签包裹层，配合内部贴片的 role="listitem"，
 * 提供原本「Grouped」变体缺失的分组语义。
 */
const Group = forwardRef<HTMLDivElement, ChatAttachmentGroupProps>(
  ({ label, role = 'list', className, style, children, ...rest }, ref) => (
    <div
      ref={ref}
      role={role}
      aria-label={label}
      data-slot="chat-attachment-group"
      className={clsx('chat-attachment-group', className)}
      style={{ display: 'flex', flexWrap: 'wrap', gap: 'calc(var(--spacing) * 2)', ...style }}
      {...rest}
    >
      {children}
    </div>
  ),
);
Group.displayName = 'ChatAttachment.Group';

const ChatAttachment = Object.assign(ChatAttachmentRoot, {
  Input,
  Group,
});

export default ChatAttachment;
