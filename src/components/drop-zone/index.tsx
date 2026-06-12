import {
  forwardRef,
  useRef,
  useState,
  type DragEvent,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import clsx from 'clsx';

export type DropZoneProps = HTMLAttributes<HTMLDivElement>;

const DropZoneRoot = forwardRef<HTMLDivElement, DropZoneProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('drop-zone', className)} {...rest} />
));
DropZoneRoot.displayName = 'DropZone';

export type DropZoneAreaProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  label?: ReactNode;
  description?: ReactNode;
  triggerText?: ReactNode;
  accept?: string;
  isMultiple?: boolean;
  isDisabled?: boolean;
  onFilesAdded?: (files: File[]) => void;
};

const Area = forwardRef<HTMLDivElement, DropZoneAreaProps>(
  (
    {
      label,
      description,
      triggerText = '选择文件',
      accept,
      isMultiple = false,
      isDisabled = false,
      onFilesAdded,
      className,
      ...rest
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDropTarget, setIsDropTarget] = useState(false);

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDropTarget(true);
    };
    const handleDragLeave = () => setIsDropTarget(false);
    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDropTarget(false);
      onFilesAdded?.(Array.from(event.dataTransfer.files));
    };
    const handleTriggerClick = () => inputRef.current?.click();
    const handleInputChange = () => {
      const files = inputRef.current?.files;
      if (files !== null && files !== undefined) onFilesAdded?.(Array.from(files));
    };

    return (
      <div
        ref={ref}
        className={clsx('drop-zone__area', className)}
        data-drop-target={isDropTarget || undefined}
        data-disabled={isDisabled || undefined}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        {...rest}
      >
        <span className="drop-zone__icon" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 16V4m0 0L7 9m5-5l5 5" />
            <path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" />
          </svg>
        </span>
        {label !== undefined && <span className="drop-zone__label">{label}</span>}
        {description !== undefined && (
          <span className="drop-zone__description">{description}</span>
        )}
        <button
          type="button"
          className="drop-zone__trigger"
          onClick={handleTriggerClick}
          disabled={isDisabled}
        >
          {triggerText}
        </button>
        <input
          ref={inputRef}
          type="file"
          className="drop-zone__input"
          accept={accept}
          multiple={isMultiple}
          disabled={isDisabled}
          onChange={handleInputChange}
          tabIndex={-1}
        />
      </div>
    );
  },
);
Area.displayName = 'DropZone.Area';

export type DropZoneFileListProps = HTMLAttributes<HTMLDivElement>;

const FileList = forwardRef<HTMLDivElement, DropZoneFileListProps>(
  ({ className, ...rest }, ref) => (
    <div ref={ref} className={clsx('drop-zone__file-list', className)} role="list" {...rest} />
  ),
);
FileList.displayName = 'DropZone.FileList';

export type DropZoneFileStatus = 'uploading' | 'complete' | 'failed';
export type DropZoneFormatColor = 'red' | 'green' | 'blue' | 'orange' | 'purple' | 'gray';

export type DropZoneFileItemProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  name: string;
  meta?: ReactNode;
  format?: string;
  formatColor?: DropZoneFormatColor;
  status?: DropZoneFileStatus;
  /** 0–100 */
  progress?: number;
  onRemove?: () => void;
  onRetry?: () => void;
};

const FileItem = forwardRef<HTMLDivElement, DropZoneFileItemProps>(
  (
    {
      name,
      meta,
      format,
      formatColor = 'gray',
      status = 'uploading',
      progress,
      onRemove,
      onRetry,
      className,
      ...rest
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={clsx('drop-zone__file-item', className)}
      data-status={status}
      role="listitem"
      {...rest}
    >
      <span className="drop-zone__file-format-icon" aria-hidden="true">
        <svg
          viewBox="0 0 32 40"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          width="32"
          height="40"
        >
          <path d="M4 4a2 2 0 012-2h14l8 8v26a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
          <path d="M20 2v8h8" />
        </svg>
        {format !== undefined && (
          <span className="drop-zone__file-format-icon-badge" data-color={formatColor}>
            {format}
          </span>
        )}
      </span>
      <span className="drop-zone__file-info">
        <span className="drop-zone__file-name">{name}</span>
        {meta !== undefined && <span className="drop-zone__file-meta">{meta}</span>}
        {progress !== undefined && (
          <span className="drop-zone__file-progress">
            <span
              className="progress-bar progress-bar--accent progress-bar--sm"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <span className="progress-bar__track">
                <span className="progress-bar__fill" style={{ width: `${progress}%` }} />
              </span>
            </span>
          </span>
        )}
        {status === 'failed' && onRetry !== undefined && (
          <button type="button" className="drop-zone__file-retry-trigger" onClick={onRetry}>
            重试
          </button>
        )}
      </span>
      {onRemove !== undefined && (
        <button
          type="button"
          className="drop-zone__file-remove-trigger"
          aria-label="移除文件"
          onClick={onRemove}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      )}
    </div>
  ),
);
FileItem.displayName = 'DropZone.FileItem';

const DropZone = Object.assign(DropZoneRoot, { Area, FileList, FileItem });

export default DropZone;
