'use client';

import {
  Fragment,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  Button as RacButton,
  DropZone as RacDropZone,
  Text as RacText,
  isFileDropItem,
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

export const isDropZoneFileItem = isFileDropItem;

export type DropZoneFileStatus = 'uploading' | 'complete' | 'failed';

export type DropZoneFileFormatIconColor = 'gray' | 'red' | 'green' | 'blue' | 'orange' | 'purple';

export type DropZoneUploadSource = 'input' | 'drop' | 'api';

export type DropZoneUploadFileLike = {
  name: string;
  size?: number;
  type?: string;
  lastModified?: number;
  file?: File;
};

export type DropZoneUploadQueueItem = {
  id: string;
  name: string;
  size?: number;
  type?: string;
  lastModified?: number;
  file?: File;
  format: string;
  color: DropZoneFileFormatIconColor;
  status: DropZoneFileStatus;
  progress: number;
  error?: string;
  canRetry: boolean;
  attempt: number;
  source: DropZoneUploadSource;
  createdAt: number;
  updatedAt: number;
};

export type DropZoneAddFilesOptions = {
  source?: DropZoneUploadSource;
  replace?: boolean;
};

export type DropZoneUploadFailureMessage =
  | string
  | ((item: DropZoneUploadQueueItem) => string);

export type DropZoneUploadQueueApi = {
  files: DropZoneUploadQueueItem[];
  addFiles: (
    files: Iterable<DropZoneUploadFileLike> | ArrayLike<DropZoneUploadFileLike>,
    options?: DropZoneAddFilesOptions,
  ) => void;
  retryFile: (id: string) => void;
  removeFile: (id: string) => void;
  clearQueue: () => void;
};

export type DropZoneValidateFile = (file: DropZoneUploadFileLike) => string | null | undefined;

export type DropZoneShouldFailUpload = (item: DropZoneUploadQueueItem) => boolean;

export type DropZoneQueueChangeHandler = (files: DropZoneUploadQueueItem[]) => void;

type DropZoneDropItem = Parameters<NonNullable<RacDropZoneProps['onDrop']>>[0]['items'][number];

type DropZoneUploadCandidate = DropZoneUploadFileLike & {
  error?: string;
};

/** 根组件提供 file picker 与上传队列 context：Trigger、Input、Area、FileQueue 共用同一状态源 */
type DropZoneFilePickerContextValue = DropZoneUploadQueueApi & {
  inputRef: RefObject<HTMLInputElement | null>;
  isDisabled: boolean;
  addDropItems: (items: Iterable<DropZoneDropItem> | ArrayLike<DropZoneDropItem>) => void;
};

const DropZoneFilePickerContext = createContext<DropZoneFilePickerContextValue | null>(null);

const DEFAULT_UPLOAD_INTERVAL = 320;
const DEFAULT_INITIAL_PROGRESS = 8;
const DEFAULT_UPLOAD_FAILURE_MESSAGE = '上传失败，请重试';

const isNativeFile = (file: DropZoneUploadFileLike): file is File =>
  typeof File !== 'undefined' && file instanceof File;

const normalizeUploadFile = (fileLike: DropZoneUploadFileLike): DropZoneUploadFileLike => {
  const nativeFile = isNativeFile(fileLike) ? fileLike : fileLike.file;

  return {
    file: nativeFile,
    name: fileLike.name || nativeFile?.name || '未命名文件',
    size: fileLike.size ?? nativeFile?.size,
    type: fileLike.type ?? nativeFile?.type,
    lastModified: fileLike.lastModified ?? nativeFile?.lastModified,
  };
};

const getUploadFileFormat = (name: string) => {
  const extension = name.includes('.') ? name.split('.').pop() : undefined;
  return extension !== undefined && extension !== '' ? extension.toUpperCase() : 'FILE';
};

const getUploadFileIconColor = (
  format: string,
  status: DropZoneFileStatus,
): DropZoneFileFormatIconColor => {
  if (status === 'failed') return 'red';
  if (format === 'PDF' || format === 'ZIP') return 'orange';
  if (format === 'DOC' || format === 'DOCX') return 'blue';
  if (format === 'XLS' || format === 'XLSX' || format === 'CSV') return 'green';
  if (format === 'PNG' || format === 'JPG' || format === 'JPEG' || format === 'WEBP') return 'purple';
  return 'gray';
};

const formatUploadFileSize = (size?: number) => {
  if (typeof size !== 'number') return '大小未知';
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / 1024 / 1024).toFixed(1).replace(/\.0$/, '')} MB`;
};

const getUploadProgressStep = (progress: number) => {
  if (progress < 30) return 18;
  if (progress < 75) return 12;
  return 7;
};

export const useDropZoneQueue = (): DropZoneUploadQueueApi => {
  const context = useContext(DropZoneFilePickerContext);
  if (context === null) {
    throw new Error('DropZone queue components must be used inside <DropZone>.');
  }

  return {
    files: context.files,
    addFiles: context.addFiles,
    retryFile: context.retryFile,
    removeFile: context.removeFile,
    clearQueue: context.clearQueue,
  };
};

export type DropZoneRenderFunction = (props: HTMLAttributes<HTMLDivElement>) => ReactElement;

export type DropZoneProps = HTMLAttributes<HTMLDivElement> & {
  /** 自定义渲染函数，替换默认的 div 根元素（参考 API：DOMRenderFunction） */
  render?: DropZoneRenderFunction;
  /** 禁用整个上传区，同时禁用拖放区域、触发按钮与隐藏文件输入 */
  isDisabled?: boolean;
  /** 受控上传队列。提供后由外部负责持久化 onQueueChange 返回的新队列。 */
  queue?: DropZoneUploadQueueItem[];
  /** 非受控上传队列初始值。 */
  defaultQueue?: DropZoneUploadQueueItem[];
  /** 上传队列变化回调。 */
  onQueueChange?: DropZoneQueueChangeHandler;
  /** 文件进入队列前的校验，返回字符串时进入失败状态。 */
  validateFile?: DropZoneValidateFile;
  /** 模拟上传走到 100% 时是否转为失败。重试会递增 item.attempt。 */
  shouldFailUpload?: DropZoneShouldFailUpload;
  /** 模拟上传失败文案。 */
  uploadFailureMessage?: DropZoneUploadFailureMessage;
  /** 是否模拟上传进度；关闭时合法文件直接完成。 */
  simulateUpload?: boolean;
  /** 模拟上传进度刷新间隔。 */
  uploadInterval?: number;
  /** 新文件加入时是否替换现有队列。 */
  replaceQueueOnAdd?: boolean;
  /** 自定义文件 id。 */
  getFileId?: (file: DropZoneUploadFileLike, index: number) => string;
};

const DropZoneRoot = forwardRef<HTMLDivElement, DropZoneProps>(
  (
    {
      render,
      className,
      isDisabled = false,
      queue,
      defaultQueue = [],
      onQueueChange,
      validateFile,
      shouldFailUpload,
      uploadFailureMessage = DEFAULT_UPLOAD_FAILURE_MESSAGE,
      simulateUpload = true,
      uploadInterval = DEFAULT_UPLOAD_INTERVAL,
      replaceQueueOnAdd = false,
      getFileId,
      ...rest
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const idCounterRef = useRef(0);
    const uploadTimersRef = useRef(new Map<string, ReturnType<typeof setInterval>>());
    const isQueueControlled = queue !== undefined;
    const [uncontrolledQueue, setUncontrolledQueue] =
      useState<DropZoneUploadQueueItem[]>(defaultQueue);
    const queueItems = queue ?? uncontrolledQueue;
    const queueRef = useRef(queueItems);

    useEffect(() => {
      queueRef.current = queueItems;
    }, [queueItems]);

    const clearUploadTimer = useCallback((id: string) => {
      const timer = uploadTimersRef.current.get(id);
      if (timer === undefined) return;

      clearInterval(timer);
      uploadTimersRef.current.delete(id);
    }, []);

    const commitQueue = useCallback(
      (
        nextQueueOrUpdater:
          | DropZoneUploadQueueItem[]
          | ((previousQueue: DropZoneUploadQueueItem[]) => DropZoneUploadQueueItem[]),
      ) => {
        const previousQueue = queueRef.current;
        const nextQueue =
          typeof nextQueueOrUpdater === 'function'
            ? nextQueueOrUpdater(previousQueue)
            : nextQueueOrUpdater;
        const nextIds = new Set(nextQueue.map((item) => item.id));

        previousQueue.forEach((item) => {
          if (!nextIds.has(item.id)) clearUploadTimer(item.id);
        });

        queueRef.current = nextQueue;
        if (!isQueueControlled) setUncontrolledQueue(nextQueue);
        onQueueChange?.(nextQueue);
      },
      [clearUploadTimer, isQueueControlled, onQueueChange],
    );

    const resolveUploadFailureMessage = useCallback(
      (item: DropZoneUploadQueueItem) =>
        typeof uploadFailureMessage === 'function'
          ? uploadFailureMessage(item)
          : uploadFailureMessage,
      [uploadFailureMessage],
    );

    const createQueueItem = useCallback(
      (
        fileLike: DropZoneUploadCandidate,
        index: number,
        source: DropZoneUploadSource,
      ): DropZoneUploadQueueItem => {
        const normalizedFile = normalizeUploadFile(fileLike);
        const now = Date.now();
        const validationError = fileLike.error ?? validateFile?.(normalizedFile) ?? undefined;
        const status: DropZoneFileStatus =
          validationError !== undefined ? 'failed' : simulateUpload ? 'uploading' : 'complete';
        const progress =
          status === 'failed' ? 0 : status === 'complete' ? 100 : DEFAULT_INITIAL_PROGRESS;
        const format = getUploadFileFormat(normalizedFile.name);
        const id =
          getFileId?.(normalizedFile, index) ??
          `${source}-${now.toString(36)}-${idCounterRef.current++}-${index}`;

        return {
          id,
          name: normalizedFile.name,
          size: normalizedFile.size,
          type: normalizedFile.type,
          lastModified: normalizedFile.lastModified,
          file: normalizedFile.file,
          format,
          color: getUploadFileIconColor(format, status),
          status,
          progress,
          error: validationError,
          canRetry: false,
          attempt: 1,
          source,
          createdAt: now,
          updatedAt: now,
        };
      },
      [getFileId, simulateUpload, validateFile],
    );

    const addFiles = useCallback<DropZoneUploadQueueApi['addFiles']>(
      (files, options) => {
        const fileList = Array.from(files) as DropZoneUploadCandidate[];
        if (fileList.length === 0) return;

        const source = options?.source ?? 'api';
        const shouldReplace = options?.replace ?? replaceQueueOnAdd;
        const nextItems = fileList.map((file, index) => createQueueItem(file, index, source));

        commitQueue((previousQueue) =>
          shouldReplace ? nextItems : [...previousQueue, ...nextItems],
        );
      },
      [commitQueue, createQueueItem, replaceQueueOnAdd],
    );

    const addDropItems = useCallback(
      (items: Iterable<DropZoneDropItem> | ArrayLike<DropZoneDropItem>) => {
        const fileItems = Array.from(items).filter(isDropZoneFileItem);
        if (fileItems.length === 0) return;

        void Promise.all(
          fileItems.map(async (item, index): Promise<DropZoneUploadCandidate> => {
            try {
              return await item.getFile();
            } catch {
              return {
                name: item.name || `拖放文件 ${index + 1}`,
                type: item.type,
                error: '无法读取拖放文件',
              };
            }
          }),
        ).then((files) => addFiles(files, { source: 'drop' }));
      },
      [addFiles],
    );

    const retryFile = useCallback(
      (id: string) => {
        commitQueue((previousQueue) =>
          previousQueue.map((item) => {
            if (item.id !== id || item.status !== 'failed') return item;

            const validationError = validateFile?.(item.file ?? item) ?? undefined;
            const status: DropZoneFileStatus =
              validationError !== undefined ? 'failed' : simulateUpload ? 'uploading' : 'complete';
            const progress =
              status === 'failed' ? 0 : status === 'complete' ? 100 : DEFAULT_INITIAL_PROGRESS;

            return {
              ...item,
              status,
              progress,
              error: validationError,
              canRetry: false,
              attempt: item.attempt + 1,
              color: getUploadFileIconColor(item.format, status),
              updatedAt: Date.now(),
            };
          }),
        );
      },
      [commitQueue, simulateUpload, validateFile],
    );

    const removeFile = useCallback(
      (id: string) => {
        commitQueue((previousQueue) => previousQueue.filter((item) => item.id !== id));
      },
      [commitQueue],
    );

    const clearQueue = useCallback(() => commitQueue([]), [commitQueue]);

    const startUploadTimer = useCallback(
      (id: string) => {
        if (!simulateUpload || uploadTimersRef.current.has(id)) return;

        const timer = setInterval(() => {
          commitQueue((previousQueue) =>
            previousQueue.map((item) => {
              if (item.id !== id || item.status !== 'uploading') return item;

              const progress = Math.min(100, item.progress + getUploadProgressStep(item.progress));
              const updatedAt = Date.now();

              if (progress < 100) {
                return { ...item, progress, updatedAt };
              }

              clearUploadTimer(id);

              if (shouldFailUpload?.({ ...item, progress: 100, updatedAt }) === true) {
                return {
                  ...item,
                  status: 'failed',
                  progress: 100,
                  error: resolveUploadFailureMessage(item),
                  canRetry: true,
                  color: getUploadFileIconColor(item.format, 'failed'),
                  updatedAt,
                };
              }

              return {
                ...item,
                status: 'complete',
                progress: 100,
                error: undefined,
                canRetry: false,
                color: getUploadFileIconColor(item.format, 'complete'),
                updatedAt,
              };
            }),
          );
        }, Math.max(100, uploadInterval));

        uploadTimersRef.current.set(id, timer);
      },
      [
        clearUploadTimer,
        commitQueue,
        resolveUploadFailureMessage,
        shouldFailUpload,
        simulateUpload,
        uploadInterval,
      ],
    );

    useEffect(() => {
      queueItems.forEach((item) => {
        if (item.status === 'uploading') {
          startUploadTimer(item.id);
        } else {
          clearUploadTimer(item.id);
        }
      });
    }, [clearUploadTimer, queueItems, startUploadTimer]);

    useEffect(
      () => () => {
        uploadTimersRef.current.forEach((timer) => clearInterval(timer));
        uploadTimersRef.current.clear();
      },
      [],
    );

    const contextValue = useMemo<DropZoneFilePickerContextValue>(
      () => ({
        inputRef,
        isDisabled,
        files: queueItems,
        addFiles,
        addDropItems,
        retryFile,
        removeFile,
        clearQueue,
      }),
      [
        addDropItems,
        addFiles,
        clearQueue,
        isDisabled,
        queueItems,
        removeFile,
        retryFile,
      ],
    );

    const domProps = {
      'data-slot': 'drop-zone',
      'data-disabled': isDisabled || undefined,
      'aria-disabled': isDisabled || undefined,
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
const Area = ({ className, isDisabled, onDrop, ...rest }: DropZoneAreaProps) => {
  const context = useContext(DropZoneFilePickerContext);
  const mergedIsDisabled = context?.isDisabled === true || isDisabled === true;

  const handleDrop: NonNullable<RacDropZoneProps['onDrop']> = (event) => {
    onDrop?.(event);
    if (mergedIsDisabled) return;
    context?.addDropItems(event.items);
  };

  return (
    <RacDropZone
      data-slot="drop-zone-area"
      className={clsx('drop-zone__area', className)}
      isDisabled={mergedIsDisabled}
      onDrop={handleDrop}
      {...rest}
    />
  );
};
Area.displayName = 'DropZone.Area';

/** 参考实现默认云上传图标（与基准快照 SVG path 一致） */
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
const Trigger = ({ className, children, isDisabled, onPress, ...rest }: DropZoneTriggerProps) => {
  const context = useContext(DropZoneFilePickerContext);
  const mergedIsDisabled = context?.isDisabled === true || isDisabled === true;

  const handlePress = (event: PressEvent) => {
    onPress?.(event);
    if (mergedIsDisabled) return;
    context?.inputRef.current?.click();
  };

  return (
    <RacButton
      data-slot="drop-zone-trigger"
      className={clsx('drop-zone__trigger', className)}
      isDisabled={mergedIsDisabled}
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
  /** 通过文件选择器选中文件时回调（参考 API 签名：FileList） */
  onSelect?: (files: FileList) => void;
  className?: string;
  style?: CSSProperties;
};

/** 隐藏文件输入（快照中为 Area 的兄弟节点）；注册到根 context 供 Trigger 点击 */
const Input = forwardRef<HTMLInputElement, DropZoneInputProps>(
  ({ onSelect, onChange, className, disabled, ...rest }, ref) => {
    const context = useContext(DropZoneFilePickerContext);
    const mergedDisabled = context?.isDisabled === true || disabled === true;

    const handleRef = (node: HTMLInputElement | null) => {
      if (context !== null) context.inputRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref !== null) ref.current = node;
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      onChange?.(event);
      if (mergedDisabled) {
        event.target.value = '';
        return;
      }
      if (event.target.files !== null && event.target.files.length > 0) {
        onSelect?.(event.target.files);
        context?.addFiles(event.target.files, { source: 'input' });
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
        disabled={mergedDisabled}
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

/** 上传进度条，包装 OSS ProgressBar（参考 API：size 默认 'sm'，色板默认 accent） */
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

/** 参考实现默认垃圾桶图标（与基准快照 SVG path 一致） */
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

export type DropZoneFileQueueRenderProps = DropZoneUploadQueueApi & {
  item: DropZoneUploadQueueItem;
};

export type DropZoneFileQueueProps = Omit<DropZoneFileListProps, 'children'> & {
  empty?: ReactNode;
  renderItem?: (props: DropZoneFileQueueRenderProps) => ReactNode;
};

const getQueueFileMeta = (item: DropZoneUploadQueueItem) => {
  const size = formatUploadFileSize(item.size);
  if (item.status === 'complete') return `${size} | 已上传`;
  if (item.status === 'failed') return `${size} | ${item.error ?? '上传失败'}`;
  return `${size} | 上传中 ${Math.round(item.progress)}%`;
};

type DefaultFileQueueItemProps = {
  item: DropZoneUploadQueueItem;
  queue: DropZoneUploadQueueApi;
};

const DefaultFileQueueItem = ({ item, queue }: DefaultFileQueueItemProps) => {
  const handleRetry = () => queue.retryFile(item.id);
  const handleRemove = () => queue.removeFile(item.id);

  return (
    <FileItem status={item.status}>
      <FileFormatIcon format={item.format} color={item.color} />
      <FileInfo>
        <FileName>{item.name}</FileName>
        <FileMeta>{getQueueFileMeta(item)}</FileMeta>
        {item.status === 'uploading' && (
          <FileProgress value={item.progress} aria-label={`${item.name} 上传进度`}>
            <FileProgressTrack>
              <FileProgressFill />
            </FileProgressTrack>
          </FileProgress>
        )}
        {item.status === 'failed' && item.canRetry && (
          <FileRetryTrigger onPress={handleRetry}>重试</FileRetryTrigger>
        )}
      </FileInfo>
      <FileRemoveTrigger aria-label={`移除 ${item.name}`} onPress={handleRemove} />
    </FileItem>
  );
};
DefaultFileQueueItem.displayName = 'DropZone.DefaultFileQueueItem';

const FileQueue = forwardRef<HTMLDivElement, DropZoneFileQueueProps>(
  ({ className, empty = null, renderItem, ...rest }, ref) => {
    const queue = useDropZoneQueue();

    if (queue.files.length === 0) return <>{empty}</>;

    return (
      <FileList ref={ref} className={className} {...rest}>
        {queue.files.map((item) => (
          <Fragment key={item.id}>
            {renderItem?.({ ...queue, item }) ?? (
              <DefaultFileQueueItem item={item} queue={queue} />
            )}
          </Fragment>
        ))}
      </FileList>
    );
  },
);
FileQueue.displayName = 'DropZone.FileQueue';

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
  FileQueue,
});

export default DropZone;
