import {
  forwardRef,
  useCallback,
  useRef,
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type DragEvent,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
} from 'react';
import clsx from 'clsx';

/**
 * 线上 Pro 版媒体类型联合：'audio' | 'document' | 'image' | 'unknown' | 'video'。
 * 未显式传入时从 mimeType 推断（见 inferMediaType）。
 */
export type ChatAttachmentMediaType = 'audio' | 'document' | 'image' | 'unknown' | 'video';

/** 旧契约的精简类型（保后向兼容）；image/video 直接映射，file→document。 */
export type ChatAttachmentKind = 'image' | 'video' | 'file';

const KIND_TO_MEDIA_TYPE: Record<ChatAttachmentKind, ChatAttachmentMediaType> = {
  image: 'image',
  video: 'video',
  file: 'document',
};

/** 从 mimeType 主类型推断 mediaType；无法判定时回退 'unknown'。 */
const inferMediaType = (mimeType: string | undefined): ChatAttachmentMediaType => {
  if (mimeType === undefined || mimeType.length === 0) return 'unknown';
  const main = mimeType.split('/')[0]?.toLowerCase();
  if (main === 'image') return 'image';
  if (main === 'video') return 'video';
  if (main === 'audio') return 'audio';
  if (main === 'application' || main === 'text') return 'document';
  return 'unknown';
};

/** 文档/音频/未知类型的默认占位图标（无 src 预览时显示）。 */
const DefaultFallbackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" strokeLinejoin="round" />
    <path d="M14 3v5h5" strokeLinejoin="round" />
  </svg>
);

export type ChatAttachmentPreviewProps = HTMLAttributes<HTMLDivElement> & {
  /** 媒体类型：决定渲染 <img> / <video> / 文档占位。 */
  mediaType?: ChatAttachmentMediaType;
  /** image/video 的预览地址。 */
  src?: string;
  /** 无障碍名称（透传给 <img> 的 alt）。 */
  name?: string;
  /** 自定义占位图标（无 src 的文档/音频/未知时显示），默认内置文件图标。 */
  fallbackIcon?: ReactNode;
  /** 传入则整体替换默认预览内容（对齐线上 Pro 版 Preview 的 children 覆盖语义）。 */
  children?: ReactNode;
};

/**
 * ChatAttachment.Preview —— 真复合预览子组件。
 * 渲染 <img>（image）/ <video>（video）/ 文档占位（document/audio/unknown）；
 * 传 children 则整体替换。对齐线上 Pro 版 `ChatAttachment.Preview`。
 */
const Preview = forwardRef<HTMLDivElement, ChatAttachmentPreviewProps>(
  ({ mediaType = 'unknown', src, name, fallbackIcon, className, children, ...rest }, ref) => (
    <div ref={ref} className={clsx('chat-attachment__preview', className)} {...rest}>
      {children !== undefined ? (
        children
      ) : mediaType === 'image' && src !== undefined ? (
        <img className="chat-attachment__preview-image" src={src} alt={name ?? ''} />
      ) : mediaType === 'video' && src !== undefined ? (
        <video className="chat-attachment__preview-video" src={src} muted />
      ) : (
        <span className="chat-attachment__preview-fallback" aria-hidden="true">
          {fallbackIcon ?? <DefaultFallbackIcon />}
        </span>
      )}
    </div>
  ),
);
Preview.displayName = 'ChatAttachment.Preview';

export type ChatAttachmentRemoveProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
  /** react-aria 风格的按压回调（与 onClick 等价并存），对齐 CloseButton 的 onPress。 */
  onPress?: () => void;
  /** @deprecated 旧契约移除回调，等价于 onClick。 */
  onRemove?: MouseEventHandler<HTMLButtonElement>;
};

/**
 * ChatAttachment.Remove —— 移除按钮。
 * 对齐线上 Pro 版「extends CloseButton props」：默认 X 图标 + 可访问名称，透传
 * onClick/onPress/aria-*；children 缺省时给默认 X。
 *
 * 有意偏差（对线上 Pro 版）：线上 Remove 基于通用 CloseButton；本库若包通用
 * Button 基础件，其 `.button--sm` / `.button--icon-only` 等尺寸/底色类会与本贴片
 * 专属的紧凑 `.chat-attachment__remove`（12px 圆角悬浮按钮）样式相互打架，且本任务
 * 禁止改 CSS 分发结构。原生 <button> 已自带真 a11y / 键盘 / 焦点 / role，故直接渲染
 * 原生 button 以保视觉 1:1，同时对外暴露 CloseButton 形态的复合 props。
 */
const Remove = forwardRef<HTMLButtonElement, ChatAttachmentRemoveProps>(
  ({ onPress, onRemove, onClick, className, children, 'aria-label': ariaLabel, ...rest }, ref) => {
    const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
      onClick?.(event);
      onRemove?.(event);
      onPress?.();
    };
    return (
      <button
        ref={ref}
        type="button"
        data-slot="chat-attachment-remove"
        aria-label={ariaLabel ?? 'Remove attachment'}
        className={clsx('chat-attachment__remove', className)}
        onClick={handleClick}
        {...rest}
      >
        {children ?? (
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" />
          </svg>
        )}
      </button>
    );
  },
);
Remove.displayName = 'ChatAttachment.Remove';

export type ChatAttachmentProps = HTMLAttributes<HTMLDivElement> & {
  /** 媒体类型；未传时从 mimeType 推断（image/video/audio/document/unknown）。 */
  mediaType?: ChatAttachmentMediaType;
  /** MIME 类型，用于推断 mediaType。 */
  mimeType?: string;
  /** 文件名（无障碍名称 + image alt）。 */
  name: string;
  /** image/video 预览地址。 */
  src?: string;
  /**
   * 自定义内容：传入则整体替换默认 Preview + Remove 结构
   * （对齐线上 Pro 版 root 的 children 语义，可用 ChatAttachment.Preview/.Remove 自行拼装）。
   */
  children?: ReactNode;
  /** @deprecated 旧契约精简类型；优先用 mediaType/mimeType。file→document。 */
  kind?: ChatAttachmentKind;
  /** @deprecated 旧契约占位图标，等价于 Preview 的 fallbackIcon。 */
  fallbackIcon?: ReactNode;
  /** @deprecated 旧契约移除回调；提供时默认渲染内置 Remove 按钮。优先用 ChatAttachment.Remove。 */
  onRemove?: MouseEventHandler<HTMLButtonElement>;
};

/**
 * ChatAttachment —— 附件预览贴片（root）。
 * 对齐线上 Pro 版：props 为 mediaType / mimeType / name / src / children，
 * 默认渲染 Preview；children 缺省 + onRemove（旧契约）时附加内置 Remove。
 * 保留 kind / fallbackIcon / onRemove 旧 props 作后向兼容回退（映射到 mediaType）。
 * 始终 emit data-media-type（即使从 mimeType 推断或默认 unknown）。
 */
const ChatAttachmentRoot = forwardRef<HTMLDivElement, ChatAttachmentProps>(
  (
    { mediaType, mimeType, name, src, kind, fallbackIcon, onRemove, className, children, ...rest },
    ref,
  ) => {
    const resolvedMediaType: ChatAttachmentMediaType =
      mediaType ?? (kind !== undefined ? KIND_TO_MEDIA_TYPE[kind] : inferMediaType(mimeType));

    return (
      <div
        ref={ref}
        className={clsx('chat-attachment', className)}
        data-media-type={resolvedMediaType}
        {...rest}
      >
        {children !== undefined ? (
          children
        ) : (
          <>
            <Preview mediaType={resolvedMediaType} src={src} name={name} fallbackIcon={fallbackIcon} />
            <span className="chat-attachment__name">{name}</span>
            {onRemove !== undefined && (
              <Remove aria-label={`Remove attachment ${name}`} onRemove={onRemove} />
            )}
          </>
        )}
      </div>
    );
  },
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

/** 传给 ChatAttachmentInput.render / .Trigger 的渲染参数：触发文件选择器。 */
export type ChatAttachmentInputRenderProps = {
  /** 打开系统文件选择对话框。 */
  onPress: () => void;
};

export type ChatAttachmentInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'onSelect' | 'children'
> & {
  /** 选中文件时回调（对齐线上 Pro 版，回传原始 File 列表）。 */
  onFilesSelected?: (files: File[]) => void;
  /** @deprecated 旧契约别名，等价 onFilesSelected。 */
  onSelect?: (files: File[]) => void;
  /**
   * 渲染触发元素：拿到 onPress 打开文件对话框
   * （对齐线上 Pro 版 ChatAttachmentInput.render / .Trigger，可包 PromptInput.Shell）。
   */
  render?: (props: ChatAttachmentInputRenderProps) => ReactElement;
};

/**
 * ChatAttachmentInput —— 真实隐藏 <input type="file">。
 * 选择文件后通过 onFilesSelected（兼容旧 onSelect）回传 File 对象；同时挂 onDrop 兜底拖放选取。
 * 传 render 则额外渲染触发元素（拿 onPress 打开对话框），对齐线上 Pro 版的 render-prop 形态。
 */
const InputRoot = forwardRef<HTMLInputElement, ChatAttachmentInputProps>(
  (
    { onFilesSelected, onSelect, onChange, onDrop, render, multiple = true, className, style, ...rest },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const setRef = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    const emit = (files: File[]) => {
      onFilesSelected?.(files);
      onSelect?.(files);
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      onChange?.(event);
      const { files } = event.target;
      if (files !== null && files.length > 0) {
        emit(Array.from(files));
      }
      // 与 RAC FileTrigger 行为一致：清空 value，重复选择同一文件仍触发 change
      event.target.value = '';
    };

    const handleDrop = (event: DragEvent<HTMLInputElement>) => {
      onDrop?.(event);
      const dropped = Array.from(event.dataTransfer?.files ?? []);
      if (dropped.length > 0) {
        event.preventDefault();
        emit(dropped);
      }
    };

    return (
      <>
        <input
          ref={setRef}
          type="file"
          multiple={multiple}
          data-slot="chat-attachment-input"
          className={clsx('chat-attachment__input', className)}
          style={{ ...HIDDEN_INPUT_STYLE, ...style }}
          onChange={handleChange}
          onDrop={handleDrop}
          {...rest}
        />
        {render?.({ onPress: () => inputRef.current?.click() })}
      </>
    );
  },
);
InputRoot.displayName = 'ChatAttachmentInput';

export type ChatAttachmentInputTriggerProps = {
  /** 拿到 onPress 渲染触发元素。 */
  render: (props: ChatAttachmentInputRenderProps) => ReactElement;
  /** 由 InputContext 注入；通常不手动传。 */
  onPress?: () => void;
};

/**
 * ChatAttachmentInput.Trigger —— 通过 render 暴露打开文件对话框的 onPress。
 * 对齐线上 Pro 版「Opens file input dialog via render prop」。
 * 与 ChatAttachmentInput 的 render prop 等价，便于声明式拼装。
 */
const InputTrigger = ({ render, onPress }: ChatAttachmentInputTriggerProps): ReactElement =>
  render({ onPress: onPress ?? (() => {}) });
InputTrigger.displayName = 'ChatAttachmentInput.Trigger';

export type ChatAttachmentInputDropzoneProps = HTMLAttributes<HTMLDivElement> & {
  /** 拖放选中文件时回调（与 onFilesSelected 一致）。 */
  onFilesSelected?: (files: File[]) => void;
};

/**
 * ChatAttachmentInput.Dropzone —— 拖放容器，对齐线上 Pro 版
 * 「Adds drag-and-drop handling; connects to PromptInput.Shell」。
 * 包裹任意 children（通常是 PromptInput.Shell），在其上挂 onDragOver/onDrop 收集文件。
 */
const InputDropzone = forwardRef<HTMLDivElement, ChatAttachmentInputDropzoneProps>(
  ({ onFilesSelected, onDragOver, onDrop, className, children, ...rest }, ref) => {
    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
      onDragOver?.(event);
      if (event.dataTransfer?.types.includes('Files')) {
        event.preventDefault();
      }
    };
    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
      onDrop?.(event);
      const dropped = Array.from(event.dataTransfer?.files ?? []);
      if (dropped.length > 0) {
        event.preventDefault();
        onFilesSelected?.(dropped);
      }
    };
    return (
      <div
        ref={ref}
        data-slot="chat-attachment-dropzone"
        className={clsx('chat-attachment__dropzone', className)}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
InputDropzone.displayName = 'ChatAttachmentInput.Dropzone';

const ChatAttachmentInput = Object.assign(InputRoot, {
  Trigger: InputTrigger,
  Dropzone: InputDropzone,
});

export type ChatAttachmentGroupProps = HTMLAttributes<HTMLDivElement> & {
  /** 分组标签，建立 aria-label；缺省时回退到 role="list" 的隐式语义 */
  label?: string;
};

/**
 * ChatAttachmentGroup —— 分组容器：role="list" 的带标签包裹层，配合内部贴片的
 * role="listitem"，提供分组语义。对齐线上 Pro 版 `ChatAttachmentGroup`。
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
Group.displayName = 'ChatAttachmentGroup';

const ChatAttachment = Object.assign(ChatAttachmentRoot, {
  Preview,
  Remove,
  Input: ChatAttachmentInput,
  Group,
});

export { ChatAttachmentInput, Group as ChatAttachmentGroup };
export default ChatAttachment;
