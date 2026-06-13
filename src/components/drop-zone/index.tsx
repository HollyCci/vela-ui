import {
  createContext,
  forwardRef,
  useContext,
  useMemo,
  useRef,
  type ChangeEvent,
  type CSSProperties,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactElement,
  type RefObject,
} from 'react';
import {
  Button as RacButton,
  DropZone as RacDropZone,
  Text as RacText,
  type ButtonProps as RacButtonProps,
  type DropZoneProps as RacDropZoneProps,
  type PressEvent,
  type TextProps as RacTextProps,
} from 'react-aria-components';
import {
  ProgressBar,
  type ProgressBarFillProps,
  type ProgressBarProps,
  type ProgressBarTrackProps,
} from '@heroui/react';
import clsx from 'clsx';

/** 根组件提供的 file picker context：Trigger 点击转发到隐藏 Input（原站 "Provides file picker context"） */
type DropZoneFilePickerContextValue = {
  inputRef: RefObject<HTMLInputElement | null>;
};

const DropZoneFilePickerContext = createContext<DropZoneFilePickerContextValue | null>(null);

export type DropZoneRenderFunction = (props: HTMLAttributes<HTMLDivElement>) => ReactElement;

export type DropZoneProps = HTMLAttributes<HTMLDivElement> & {
  /** 自定义渲染函数，替换默认的 div 根元素（原站 API：DOMRenderFunction） */
  render?: DropZoneRenderFunction;
};

const DropZoneRoot = forwardRef<HTMLDivElement, DropZoneProps>(
  ({ render, className, ...rest }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const contextValue = useMemo<DropZoneFilePickerContextValue>(() => ({ inputRef }), []);

    const domProps = {
      'data-slot': 'drop-zone',
      className: clsx('drop-zone', className),
      ...rest,
    };

    return (
      <DropZoneFilePickerContext.Provider value={contextValue}>
        {render !== undefined ? render(domProps) : <div ref={ref} {...domProps} />}
      </DropZoneFilePickerContext.Provider>
    );
  },
);
DropZoneRoot.displayName = 'DropZone';

export type DropZoneAreaProps = Omit<RacDropZoneProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

/**
 * 可放置区域，包装 RAC DropZone：
 * 拖放高亮 [data-drop-target]、焦点 [data-focus-visible]、禁用 [data-disabled]
 * 与 onDrop/getDropOperation 等均由底座提供。
 */
const Area = ({ className, ...rest }: DropZoneAreaProps) => (
  <RacDropZone
    data-slot="drop-zone-area"
    className={clsx('drop-zone__area', className)}
    {...rest}
  />
);
Area.displayName = 'DropZone.Area';

/** 原站默认云上传图标（与基准快照 SVG path 一致） */
const CloudUploadIcon = () => (
  <svg fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#a)">
      <path
        clipRule="evenodd"
        d="M4.5 5.25a3.25 3.25 0 0 1 6.398-.811.75.75 0 0 0 .702.563A3 3 0 0 1 11.5 11h-.75a.75.75 0 0 0 0 1.5h.75a4.5 4.5 0 0 0 .687-8.948 4.751 4.751 0 0 0-9.184 1.522A3.751 3.751 0 0 0 3.75 12.5h1.5a.75.75 0 0 0 0-1.5H3.751a2.25 2.25 0 0 1-.003-4.5h.03a.75.75 0 0 0 .747-.843A3 3 0 0 1 4.5 5.25m4.25 3.31.72.72a.75.75 0 1 0 1.06-1.06l-2-2a.75.75 0 0 0-1.06 0l-2 2a.75.75 0 0 0 1.06 1.06l.72-.72v6.69a.75.75 0 0 0 1.5 0z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </g>
    <defs>
      <clipPath id="a">
        <path d="M0 0h16v16H0z" fill="currentColor" />
      </clipPath>
    </defs>
  </svg>
);
CloudUploadIcon.displayName = 'DropZone.CloudUploadIcon';

export type DropZoneIconProps = HTMLAttributes<HTMLSpanElement>;

const Icon = forwardRef<HTMLSpanElement, DropZoneIconProps>(
  ({ className, children, ...rest }, ref) => (
    <span
      ref={ref}
      data-slot="drop-zone-icon"
      className={clsx('drop-zone__icon', className)}
      {...rest}
    >
      {children ?? <CloudUploadIcon />}
    </span>
  ),
);
Icon.displayName = 'DropZone.Icon';

export type DropZoneLabelProps = Omit<RacTextProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

/** 主标签，包装 RAC Text slot="label"（RAC DropZone 自动建立 aria-labelledby 关联） */
const Label = ({ className, ...rest }: DropZoneLabelProps) => (
  <RacText
    elementType="span"
    slot="label"
    data-slot="drop-zone-label"
    className={clsx('drop-zone__label', className)}
    {...rest}
  />
);
Label.displayName = 'DropZone.Label';

export type DropZoneDescriptionProps = HTMLAttributes<HTMLSpanElement>;

const Description = forwardRef<HTMLSpanElement, DropZoneDescriptionProps>(
  ({ className, ...rest }, ref) => (
    <span
      ref={ref}
      data-slot="drop-zone-description"
      className={clsx('drop-zone__description', className)}
      {...rest}
    />
  ),
);
Description.displayName = 'DropZone.Description';

export type DropZoneTriggerProps = Omit<RacButtonProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

/** 浏览按钮，包装 RAC Button；点击通过根组件 context 打开隐藏文件输入 */
const Trigger = ({ className, children, onPress, ...rest }: DropZoneTriggerProps) => {
  const context = useContext(DropZoneFilePickerContext);

  const handlePress = (event: PressEvent) => {
    onPress?.(event);
    context?.inputRef.current?.click();
  };

  return (
    <RacButton
      data-slot="drop-zone-trigger"
      className={clsx('drop-zone__trigger', className)}
      onPress={handlePress}
      {...rest}
    >
      {children ?? 'Select files'}
    </RacButton>
  );
};
Trigger.displayName = 'DropZone.Trigger';

export type DropZoneInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'onSelect' | 'className' | 'style'
> & {
  /** 通过文件选择器选中文件时回调（原站 API 签名：FileList） */
  onSelect?: (files: FileList) => void;
  className?: string;
  style?: CSSProperties;
};

/** 隐藏文件输入（快照中为 Area 的兄弟节点）；注册到根 context 供 Trigger 点击 */
const Input = forwardRef<HTMLInputElement, DropZoneInputProps>(
  ({ onSelect, onChange, className, ...rest }, ref) => {
    const context = useContext(DropZoneFilePickerContext);

    const handleRef = (node: HTMLInputElement | null) => {
      if (context !== null) context.inputRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref !== null) ref.current = node;
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      onChange?.(event);
      if (event.target.files !== null && event.target.files.length > 0) {
        onSelect?.(event.target.files);
      }
      // 与 RAC FileTrigger 行为一致：清空 value，重复选择同一文件仍会触发 change
      event.target.value = '';
    };

    return (
      <input
        type="file"
        tabIndex={-1}
        data-slot="drop-zone-input"
        className={clsx('drop-zone__input', className)}
        onChange={handleChange}
        {...rest}
        ref={handleRef}
      />
    );
  },
);
Input.displayName = 'DropZone.Input';

export type DropZoneFileListProps = HTMLAttributes<HTMLDivElement>;

const FileList = forwardRef<HTMLDivElement, DropZoneFileListProps>(
  ({ className, ...rest }, ref) => (
    <div
      ref={ref}
      data-slot="drop-zone-file-list"
      className={clsx('drop-zone__file-list', className)}
      {...rest}
    />
  ),
);
FileList.displayName = 'DropZone.FileList';

export type DropZoneFileStatus = 'uploading' | 'complete' | 'failed';

export type DropZoneFileItemProps = HTMLAttributes<HTMLDivElement> & {
  status?: DropZoneFileStatus;
};

const FileItem = forwardRef<HTMLDivElement, DropZoneFileItemProps>(
  ({ status, className, ...rest }, ref) => (
    <div
      ref={ref}
      data-slot="drop-zone-file-item"
      data-status={status}
      className={clsx('drop-zone__file-item', className)}
      {...rest}
    />
  ),
);
FileItem.displayName = 'DropZone.FileItem';

export type DropZoneFileFormatIconColor = 'gray' | 'red' | 'green' | 'blue' | 'orange' | 'purple';

export type DropZoneFileFormatIconProps = HTMLAttributes<SVGSVGElement> & {
  /** 文件格式徽标文字（如 "PDF"），缺省不渲染徽标 */
  format?: string;
  color?: DropZoneFileFormatIconColor;
};

/** 文件页 SVG 图标 + foreignObject 内的彩色格式徽标（结构与基准快照一致） */
const FileFormatIcon = ({ format, color = 'gray', className, ...rest }: DropZoneFileFormatIconProps) => (
  <svg
    aria-hidden="true"
    data-slot="drop-zone-file-format-icon"
    className={clsx('drop-zone__file-format-icon', className)}
    fill="none"
    height="40"
    viewBox="0 0 32 40"
    width="32"
    xmlns="http://www.w3.org/2000/svg"
    {...rest}
  >
    <path
      d="M24 39.25H8C5.10051 39.25 2.75 36.8995 2.75 34V6C2.75 3.10051 5.10051 0.75 8 0.75H17.5147C18.9071 0.75 20.2425 1.30312 21.227 2.28769L29.7123 10.773C30.6969 11.7575 31.25 13.0929 31.25 14.4853V34C31.25 36.8995 28.8995 39.25 24 39.25Z"
      fill="var(--color-surface)"
      stroke="var(--color-border)"
      strokeWidth="1.5"
    />
    <path
      d="M19 1V8C19 10.2091 20.7909 12 23 12H31"
      fill="none"
      stroke="var(--color-border)"
      strokeWidth="1.5"
    />
    {format !== undefined && (
      <foreignObject height="40" width="32" x="0" y="0">
        <div
          data-color={color}
          data-slot="drop-zone-file-format-icon-badge"
          className="drop-zone__file-format-icon-badge"
        >
          {format}
        </div>
      </foreignObject>
    )}
  </svg>
);
FileFormatIcon.displayName = 'DropZone.FileFormatIcon';

export type DropZoneFileInfoProps = HTMLAttributes<HTMLDivElement>;

const FileInfo = forwardRef<HTMLDivElement, DropZoneFileInfoProps>(
  ({ className, ...rest }, ref) => (
    <div
      ref={ref}
      data-slot="drop-zone-file-info"
      className={clsx('drop-zone__file-info', className)}
      {...rest}
    />
  ),
);
FileInfo.displayName = 'DropZone.FileInfo';

export type DropZoneFileNameProps = HTMLAttributes<HTMLSpanElement>;

const FileName = forwardRef<HTMLSpanElement, DropZoneFileNameProps>(
  ({ className, ...rest }, ref) => (
    <span
      ref={ref}
      data-slot="drop-zone-file-name"
      className={clsx('drop-zone__file-name', className)}
      {...rest}
    />
  ),
);
FileName.displayName = 'DropZone.FileName';

export type DropZoneFileMetaProps = HTMLAttributes<HTMLSpanElement>;

const FileMeta = forwardRef<HTMLSpanElement, DropZoneFileMetaProps>(
  ({ className, ...rest }, ref) => (
    <span
      ref={ref}
      data-slot="drop-zone-file-meta"
      className={clsx('drop-zone__file-meta', className)}
      {...rest}
    />
  ),
);
FileMeta.displayName = 'DropZone.FileMeta';

export type DropZoneFileProgressProps = Omit<ProgressBarProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

/** 上传进度条，包装 OSS ProgressBar（原站 API：size 默认 'sm'，色板默认 accent） */
const FileProgress = ({ className, ...rest }: DropZoneFileProgressProps) => (
  <ProgressBar
    size="sm"
    data-slot="drop-zone-file-progress"
    className={clsx('drop-zone__file-progress', className)}
    {...rest}
  />
);
FileProgress.displayName = 'DropZone.FileProgress';

export type DropZoneFileProgressTrackProps = Omit<ProgressBarTrackProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

const FileProgressTrack = ({ className, ...rest }: DropZoneFileProgressTrackProps) => (
  <ProgressBar.Track data-slot="drop-zone-file-progress-track" className={className} {...rest} />
);
FileProgressTrack.displayName = 'DropZone.FileProgressTrack';

export type DropZoneFileProgressFillProps = Omit<ProgressBarFillProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

const FileProgressFill = ({ className, ...rest }: DropZoneFileProgressFillProps) => (
  <ProgressBar.Fill data-slot="drop-zone-file-progress-fill" className={className} {...rest} />
);
FileProgressFill.displayName = 'DropZone.FileProgressFill';

export type DropZoneFileRetryTriggerProps = Omit<RacButtonProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

const FileRetryTrigger = ({ className, ...rest }: DropZoneFileRetryTriggerProps) => (
  <RacButton
    data-slot="drop-zone-file-retry-trigger"
    className={clsx('drop-zone__file-retry-trigger', className)}
    {...rest}
  />
);
FileRetryTrigger.displayName = 'DropZone.FileRetryTrigger';

/** 原站默认垃圾桶图标（与基准快照 SVG path 一致） */
const TrashIcon = () => (
  <svg fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
    <path
      clipRule="evenodd"
      d="M9 2H7a.5.5 0 0 0-.5.5V3h3v-.5A.5.5 0 0 0 9 2m2 1v-.5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2V3H2.251a.75.75 0 0 0 0 1.5h.312l.317 7.625A3 3 0 0 0 5.878 15h4.245a3 3 0 0 0 2.997-2.875l.318-7.625h.312a.75.75 0 0 0 0-1.5zm.936 1.5H4.064l.315 7.562A1.5 1.5 0 0 0 5.878 13.5h4.245a1.5 1.5 0 0 0 1.498-1.438zm-6.186 2v5a.75.75 0 0 0 1.5 0v-5a.75.75 0 0 0-1.5 0m3.75-.75a.75.75 0 0 1 .75.75v5a.75.75 0 0 1-1.5 0v-5a.75.75 0 0 1 .75-.75"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);
TrashIcon.displayName = 'DropZone.TrashIcon';

export type DropZoneFileRemoveTriggerProps = Omit<RacButtonProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

/** 移除按钮，包装 RAC Button；无 children 时渲染默认垃圾桶图标 */
const FileRemoveTrigger = ({ className, children, ...rest }: DropZoneFileRemoveTriggerProps) => (
  <RacButton
    data-slot="drop-zone-file-remove-trigger"
    className={clsx('drop-zone__file-remove-trigger', className)}
    {...rest}
  >
    {children ?? <TrashIcon />}
  </RacButton>
);
FileRemoveTrigger.displayName = 'DropZone.FileRemoveTrigger';

const DropZone = Object.assign(DropZoneRoot, {
  Area,
  Icon,
  Label,
  Description,
  Trigger,
  Input,
  FileList,
  FileItem,
  FileFormatIcon,
  FileInfo,
  FileName,
  FileMeta,
  FileProgress,
  FileProgressTrack,
  FileProgressFill,
  FileRetryTrigger,
  FileRemoveTrigger,
});

export default DropZone;
