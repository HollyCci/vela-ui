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

type OpenFeedbackProps = {
  /** 来源链接被点击打开时触发；不会阻止默认的新标签打开行为 */
  onOpen?: (href: string) => void;
  /** 点击打开后短暂展示的状态文案 */
  openedLabel?: ReactNode;
  /** 打开反馈保持毫秒数（默认 2000） */
  openFeedbackDuration?: number;
};

export type ChatSourceProps = HTMLAttributes<HTMLSpanElement> & {
  href: string;
  title: string;
  iconSrc?: string;
  fallback?: ReactNode;
} & OpenFeedbackProps;

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

const ChatSourceRoot = forwardRef<HTMLSpanElement, ChatSourceProps>(
  (
    {
      href,
      title,
      iconSrc,
      fallback,
      openedLabel = '已打开',
      openFeedbackDuration = DEFAULT_OPEN_FEEDBACK_DURATION,
      onOpen,
      className,
      ...rest
    },
    ref,
  ) => {
    const [isOpened, showOpened] = useOpenFeedback(openFeedbackDuration);

    const handleOpen = useCallback<MouseEventHandler<HTMLAnchorElement>>(() => {
      onOpen?.(href);
      showOpened();
    }, [href, onOpen, showOpened]);

    return (
      <span
        ref={ref}
        data-slot="chat-source"
        data-opened={isOpened ? 'true' : undefined}
        className={clsx('chat-source', className)}
        {...rest}
      >
        <span className="chat-source__trigger" data-slot="chat-source-trigger">
          <span className="hover-card__trigger" data-slot="hover-card-trigger">
            <a
              className="chat-source__trigger-link"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={isOpened ? `${title}，已打开` : title}
              onClick={handleOpen}
            >
              {iconSrc !== undefined ? (
                <img className="chat-source__icon" data-slot="chat-source-icon" src={iconSrc} alt="" aria-hidden="true" />
              ) : (
                <span className="chat-source__icon-fallback" data-slot="chat-source-icon" aria-hidden="true">
                  {fallback ?? title.charAt(0)}
                </span>
              )}
              <span className="chat-source__title" data-slot="chat-source-title">{title}</span>
              {isOpened && (
                <span className="chat-source__status" data-slot="chat-source-status" aria-live="polite">
                  {openedLabel}
                </span>
              )}
            </a>
          </span>
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
