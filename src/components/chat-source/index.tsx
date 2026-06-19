'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
} from 'react';
import clsx from 'clsx';

const DEFAULT_OPEN_FEEDBACK_DURATION = 2000;

/** 把 0–1 的 confidence 归档为高/中/低三档，用于 data-confidence-level 与默认标签 */
const resolveConfidenceLevel = (confidence: number): 'high' | 'medium' | 'low' => {
  if (confidence >= 0.75) return 'high';
  if (confidence >= 0.4) return 'medium';
  return 'low';
};

const CONFIDENCE_LEVEL_LABEL: Record<'high' | 'medium' | 'low', string> = {
  high: '高相关',
  medium: '中相关',
  low: '低相关',
};

type OpenFeedbackProps = {
  /** 来源链接被点击打开时触发；不会阻止默认的新标签打开行为 */
  onOpen?: (href: string) => void;
  /** 点击打开后短暂展示的状态文案 */
  openedLabel?: ReactNode;
  /** 打开反馈保持毫秒数（默认 2000） */
  openFeedbackDuration?: number;
};

/** 来源类型：'url' 渲染可点击锚点（默认），'document' 渲染不可导航的文档指示卡 */
export type ChatSourceType = 'url' | 'document';

type ConfidenceProps = {
  /** 置信度/相关度（0–1）；surfaced 为 data-confidence 并渲染可见的标记点 */
  confidence?: number;
  /** confidence 的可见标签，默认按 confidence 自动归档为 高/中/低 */
  confidenceLabel?: ReactNode;
};

export type ChatSourceProps = HTMLAttributes<HTMLSpanElement> & {
  href: string;
  title: string;
  iconSrc?: string;
  fallback?: ReactNode;
  /** 来源类型，默认 'url'（锚点）；'document' 渲染非锚点文档卡，无 target=_blank */
  sourceType?: ChatSourceType;
} & ConfidenceProps &
  OpenFeedbackProps;

export type ChatSourcePreviewProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'onClick'> & {
  href: string;
  title: string;
  description?: string;
  iconSrc?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
} & OpenFeedbackProps;

const useOpenFeedback = (duration: number) => {
  const [isOpened, setIsOpened] = useState(false);
  const resetTimerRef = useRef<number | null>(null);

  const clearResetTimer = useCallback(() => {
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, []);

  useEffect(
    () => () => {
      clearResetTimer();
    },
    [clearResetTimer],
  );

  const showOpened = useCallback(() => {
    setIsOpened(true);
    clearResetTimer();
    resetTimerRef.current = window.setTimeout(() => {
      setIsOpened(false);
      resetTimerRef.current = null;
    }, duration);
  }, [clearResetTimer, duration]);

  return [isOpened, showOpened] as const;
};

/** 文档来源的指示图标（参考 HeroUI 的 document indicator），与 .chat-source__document-icon 对齐 */
const DOCUMENT_ICON = (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M9 1.5H4.5A1.5 1.5 0 0 0 3 3v10a1.5 1.5 0 0 0 1.5 1.5h7A1.5 1.5 0 0 0 13 13V5.5L9 1.5Z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    <path d="M9 1.5V5.5H13" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
);

const ChatSourceRoot = forwardRef<HTMLSpanElement, ChatSourceProps>(
  (
    {
      href,
      title,
      iconSrc,
      fallback,
      sourceType = 'url',
      confidence,
      confidenceLabel,
      openedLabel = '已打开',
      openFeedbackDuration = DEFAULT_OPEN_FEEDBACK_DURATION,
      onOpen,
      className,
      ...rest
    },
    ref,
  ) => {
    const [isOpened, showOpened] = useOpenFeedback(openFeedbackDuration);

    const handleOpen = useCallback<MouseEventHandler<HTMLElement>>(() => {
      onOpen?.(href);
      showOpened();
    }, [href, onOpen, showOpened]);

    const isDocument = sourceType === 'document';
    const hasConfidence = typeof confidence === 'number';
    const confidenceLevel = hasConfidence ? resolveConfidenceLevel(confidence) : undefined;
    const resolvedConfidenceLabel =
      confidenceLabel ?? (confidenceLevel ? CONFIDENCE_LEVEL_LABEL[confidenceLevel] : undefined);

    // 卡片内容（图标 / 标题 / 置信度标记 / 打开反馈）在锚点与非锚点之间共用
    const inner = (
      <>
        {iconSrc !== undefined ? (
          <img className="chat-source__icon" data-slot="chat-source-icon" src={iconSrc} alt="" aria-hidden="true" />
        ) : isDocument ? (
          <span className="chat-source__document-icon" data-slot="chat-source-icon" aria-hidden="true">
            {DOCUMENT_ICON}
          </span>
        ) : (
          <span className="chat-source__icon-fallback" data-slot="chat-source-icon" aria-hidden="true">
            {fallback ?? title.charAt(0)}
          </span>
        )}
        <span className="chat-source__title" data-slot="chat-source-title">{title}</span>
        {hasConfidence && (
          <span
            className="chat-source__confidence"
            data-slot="chat-source-confidence"
            data-confidence-level={confidenceLevel}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'calc(var(--spacing) * 1)',
              flexShrink: 0,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 'calc(var(--spacing) * 1.5)',
                height: 'calc(var(--spacing) * 1.5)',
                borderRadius: '3.40282e38px',
                backgroundColor:
                  confidenceLevel === 'high'
                    ? 'var(--success)'
                    : confidenceLevel === 'medium'
                      ? 'var(--warning)'
                      : 'var(--danger)',
              }}
            />
            <span style={{ fontSize: 10, lineHeight: 1, whiteSpace: 'nowrap' }}>
              {resolvedConfidenceLabel}
            </span>
          </span>
        )}
        {isOpened && (
          <span className="chat-source__status" data-slot="chat-source-status" aria-live="polite">
            {openedLabel}
          </span>
        )}
      </>
    );

    return (
      <span
        ref={ref}
        data-slot="chat-source"
        data-source-type={sourceType}
        data-opened={isOpened ? 'true' : undefined}
        data-confidence={hasConfidence ? confidence : undefined}
        className={clsx('chat-source', className)}
        {...rest}
      >
        <span className="chat-source__trigger" data-slot="chat-source-trigger">
          {isDocument ? (
            // 文档来源不是可导航链接：渲染 button（无 href / 无 target=_blank），匹配 HeroUI 文档指示器
            <button
              type="button"
              className="chat-source__trigger-link"
              aria-label={isOpened ? `${title}，已打开` : title}
              onClick={handleOpen}
            >
              {inner}
            </button>
          ) : (
            <a
              className="chat-source__trigger-link"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={isOpened ? `${title}，已打开` : title}
              onClick={handleOpen}
            >
              {inner}
            </a>
          )}
        </span>
      </span>
    );
  },
);
ChatSourceRoot.displayName = 'ChatSource';

const Preview = forwardRef<HTMLAnchorElement, ChatSourcePreviewProps>(
  (
    {
      href,
      title,
      description,
      iconSrc,
      openedLabel = '已打开',
      openFeedbackDuration = DEFAULT_OPEN_FEEDBACK_DURATION,
      onOpen,
      onClick,
      className,
      ...rest
    },
    ref,
  ) => {
    const [isOpened, showOpened] = useOpenFeedback(openFeedbackDuration);

    const handleOpen = useCallback<MouseEventHandler<HTMLAnchorElement>>(
      (event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        onOpen?.(href);
        showOpened();
      },
      [href, onClick, onOpen, showOpened],
    );

    return (
      <div className="chat-source__preview" data-opened={isOpened ? 'true' : undefined}>
        <a
          ref={ref}
          className={clsx('chat-source__preview-link', className)}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={isOpened ? `${title}，已打开` : title}
          onClick={handleOpen}
          {...rest}
        >
          <span className="chat-source__preview-header">
            {iconSrc !== undefined && (
              <img className="chat-source__icon" data-slot="chat-source-icon" src={iconSrc} alt="" aria-hidden="true" />
            )}
            <span className="chat-source__preview-title">{title}</span>
            {isOpened && (
              <span className="chat-source__preview-status" aria-live="polite">
                {openedLabel}
              </span>
            )}
          </span>
          {description !== undefined && (
            <span className="chat-source__preview-description">{description}</span>
          )}
        </a>
      </div>
    );
  },
);
Preview.displayName = 'ChatSource.Preview';

const ChatSource = Object.assign(ChatSourceRoot, { Preview });

export default ChatSource;
