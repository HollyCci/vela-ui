'use client';

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useState,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
  type Ref,
} from 'react';
import clsx from 'clsx';

/** 来源类型：'url' 渲染可点击锚点（默认），'document' 渲染不可导航的文档指示卡 */
export type ChatSourceType = 'url' | 'document';

/**
 * 从 href 推断展示标题（取主机名，去掉 www. 前缀）；对应线上 Pro 版 `title` 默认 = domain。
 */
const domainFromHref = (href: string): string => {
  try {
    return new URL(href).hostname.replace(/^www\./, '');
  } catch {
    return href;
  }
};

/** 文档来源的指示图标（与 .chat-source__document-icon 对齐） */
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

/* ------------------------------------------------------------------ */
/* ChatSource.Icon                                                     */
/* ------------------------------------------------------------------ */

export type ChatSourceIconProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
  /** Favicon 图片 URL（对齐线上 Pro 版 `faviconUrl`）。提供时渲染 <img>。 */
  faviconUrl?: string;
  /** 自定义图标元素；未提供 faviconUrl/children 时回退首字母。 */
  children?: ReactNode;
};

const Icon = forwardRef<HTMLSpanElement, ChatSourceIconProps>(
  ({ faviconUrl, children, className, ...rest }, ref) => {
    if (faviconUrl !== undefined) {
      return (
        <img
          className={clsx('chat-source__icon', className)}
          data-slot="chat-source-icon"
          src={faviconUrl}
          alt=""
          aria-hidden="true"
        />
      );
    }
    return (
      <span
        ref={ref}
        className={clsx('chat-source__icon-fallback', className)}
        data-slot="chat-source-icon"
        aria-hidden="true"
        {...rest}
      >
        {children}
      </span>
    );
  },
);
Icon.displayName = 'ChatSource.Icon';

/* ------------------------------------------------------------------ */
/* ChatSource.Title                                                    */
/* ------------------------------------------------------------------ */

export type ChatSourceTitleProps = HTMLAttributes<HTMLSpanElement>;

const Title = forwardRef<HTMLSpanElement, ChatSourceTitleProps>(({ className, ...rest }, ref) => (
  <span ref={ref} className={clsx('chat-source__title', className)} data-slot="chat-source-title" {...rest} />
));
Title.displayName = 'ChatSource.Title';

/* ------------------------------------------------------------------ */
/* ChatSource.Trigger                                                  */
/* ------------------------------------------------------------------ */

export type ChatSourceTriggerProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  /**
   * 当为 document 来源时渲染 <button>（无导航语义）；默认 false 渲染锚点。
   * 对齐线上 Pro 版：URL 源扩展原生 anchor props。
   */
  asButton?: boolean;
};

const Trigger = forwardRef<HTMLAnchorElement | HTMLButtonElement, ChatSourceTriggerProps>(
  ({ asButton = false, className, children, href, ...rest }, ref) => {
    if (asButton) {
      const { target, rel, ...buttonRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
      void target;
      void rel;
      return (
        <button
          ref={ref as Ref<HTMLButtonElement>}
          type="button"
          className={clsx('chat-source__trigger-link', className)}
          data-slot="chat-source-trigger"
          {...(buttonRest as ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {children}
        </button>
      );
    }
    return (
      <a
        ref={ref as Ref<HTMLAnchorElement>}
        className={clsx('chat-source__trigger-link', className)}
        data-slot="chat-source-trigger"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        {...rest}
      >
        {children}
      </a>
    );
  },
);
Trigger.displayName = 'ChatSource.Trigger';

/* ------------------------------------------------------------------ */
/* ChatSource (root)                                                   */
/* ------------------------------------------------------------------ */

export type ChatSourceProps = Omit<HTMLAttributes<HTMLSpanElement>, 'title'> & {
  /** 来源链接 URL。 */
  href: string;
  /** 展示标题；未提供时回退为 href 的域名（对齐线上 Pro 版 default = domain）。 */
  title?: string;
  /** 启用并填充 hover 预览内容（对齐线上 Pro 版 `description`）。 */
  description?: string;
  /** Favicon 图片 URL（对齐线上 Pro 版 `faviconUrl`）。 */
  faviconUrl?: string;
  /** 来源类型，默认 'url'（锚点）；'document' 渲染非锚点文档卡，无 target=_blank。 */
  sourceType?: ChatSourceType;
  /** 自定义来源组合（trigger / preview）；提供时覆盖默认渲染。 */
  children?: ReactNode;
  /**
   * @deprecated 用 `faviconUrl`。保留以兼容既有调用点。
   */
  iconSrc?: string;
  /**
   * 自定义首字母回退（无 favicon 时）；线上 Pro 版由 `ChatSource.Icon` 的 children 承担。
   */
  fallback?: ReactNode;
  /** 来源链接被点击打开时触发（兼容回调，不阻止默认新标签打开）。 */
  onOpen?: (href: string) => void;
};

const ChatSourceRoot = forwardRef<HTMLSpanElement, ChatSourceProps>(
  (
    {
      href,
      title,
      description,
      faviconUrl,
      iconSrc,
      fallback,
      sourceType = 'url',
      onOpen,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    // `description` 在线上 Pro 版仅驱动 hover 预览；此处解构以避免被 spread 到原生 <span>。
    // 独立的 hover 预览由 `ChatSource.Preview` 子组件承担（本库无内建 popover 引擎）。
    void description;

    const resolvedTitle = title ?? domainFromHref(href);
    const resolvedFavicon = faviconUrl ?? iconSrc;
    const isDocument = sourceType === 'document';

    const handleOpen = useCallback<MouseEventHandler<HTMLElement>>(() => {
      onOpen?.(href);
    }, [href, onOpen]);

    // 默认 trigger 内容（图标 + 标题），在锚点与按钮之间共用
    const triggerInner = (
      <>
        {isDocument && resolvedFavicon === undefined ? (
          <span className="chat-source__document-icon" data-slot="chat-source-icon" aria-hidden="true">
            {DOCUMENT_ICON}
          </span>
        ) : (
          <Icon faviconUrl={resolvedFavicon}>{fallback ?? resolvedTitle.charAt(0)}</Icon>
        )}
        <Title>{resolvedTitle}</Title>
      </>
    );

    return (
      <span ref={ref} data-slot="chat-source" className={clsx('chat-source', className)} {...rest}>
        <span className="chat-source__trigger" data-slot="chat-source-trigger-wrapper">
          {children ?? (
            <Trigger asButton={isDocument} href={href} aria-label={resolvedTitle} onClick={handleOpen}>
              {triggerInner}
            </Trigger>
          )}
        </span>
      </span>
    );
  },
);
ChatSourceRoot.displayName = 'ChatSource';

/* ------------------------------------------------------------------ */
/* ChatSource.Preview                                                  */
/* ------------------------------------------------------------------ */

export type ChatSourcePreviewProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'onClick'> & {
  href: string;
  title: string;
  description?: string;
  faviconUrl?: string;
  /**
   * @deprecated 用 `faviconUrl`。
   */
  iconSrc?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  /** 来源链接被点击打开时触发（兼容回调）。 */
  onOpen?: (href: string) => void;
};

const Preview = forwardRef<HTMLAnchorElement, ChatSourcePreviewProps>(
  ({ href, title, description, faviconUrl, iconSrc, onOpen, onClick, className, ...rest }, ref) => {
    const resolvedFavicon = faviconUrl ?? iconSrc;

    const handleClick = useCallback<MouseEventHandler<HTMLAnchorElement>>(
      (event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        onOpen?.(href);
      },
      [href, onClick, onOpen],
    );

    return (
      <div className="chat-source__preview" data-slot="chat-source-preview">
        <a
          ref={ref}
          className={clsx('chat-source__preview-link', className)}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={title}
          onClick={handleClick}
          {...rest}
        >
          <span className="chat-source__preview-header">
            {resolvedFavicon !== undefined && (
              <img
                className="chat-source__icon"
                data-slot="chat-source-icon"
                src={resolvedFavicon}
                alt=""
                aria-hidden="true"
              />
            )}
            <span className="chat-source__preview-title">{title}</span>
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

/* ================================================================== */
/* ChatSources — grouped source disclosure                            */
/* ================================================================== */

export type ChatSourcesProps = Omit<HTMLAttributes<HTMLDivElement>, 'onToggle'> & {
  /** 受控展开态。 */
  isExpanded?: boolean;
  /** 非受控初始展开态（对齐线上 Pro 版 Disclosure `defaultExpanded`，默认 false）。 */
  defaultExpanded?: boolean;
  /** 展开态变化回调。 */
  onExpandedChange?: (isExpanded: boolean) => void;
};

type ChatSourcesContextValue = {
  expanded: boolean;
  contentId: string;
  toggle: MouseEventHandler<HTMLButtonElement>;
};

/* 内部 context（不导出），让 Trigger/Content 取到展开态与 id */
const SourcesCtx = createContext<ChatSourcesContextValue | null>(null);

const useChatSources = (): ChatSourcesContextValue => {
  const ctx = useContext(SourcesCtx);
  if (ctx === null) {
    return { expanded: true, contentId: '', toggle: () => undefined };
  }
  return ctx;
};

const ChatSourcesRoot = forwardRef<HTMLDivElement, ChatSourcesProps>(
  ({ isExpanded, defaultExpanded = false, onExpandedChange, className, children, ...rest }, ref) => {
    const contentId = useId();
    const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
    const expanded = isExpanded ?? internalExpanded;

    const toggle = useCallback<MouseEventHandler<HTMLButtonElement>>(
      () => {
        const next = !expanded;
        if (isExpanded === undefined) setInternalExpanded(next);
        onExpandedChange?.(next);
      },
      [expanded, isExpanded, onExpandedChange],
    );

    const ctx: ChatSourcesContextValue = { expanded, contentId, toggle };

    return (
      <div
        ref={ref}
        className={clsx('chat-sources', className)}
        data-slot="chat-sources"
        data-expanded={expanded ? 'true' : 'false'}
        {...rest}
      >
        <SourcesCtx.Provider value={ctx}>{children}</SourcesCtx.Provider>
      </div>
    );
  },
);
ChatSourcesRoot.displayName = 'ChatSources';

export type ChatSourcesTriggerProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onToggle'>;

const SourcesTrigger = forwardRef<HTMLButtonElement, ChatSourcesTriggerProps>(
  ({ className, children, onClick, ...rest }, ref) => {
    const { expanded, contentId, toggle } = useChatSources();
    const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      toggle(event);
    };
    return (
      <button
        ref={ref}
        type="button"
        className={clsx('chat-sources__trigger', className)}
        data-slot="chat-sources-trigger"
        aria-expanded={expanded}
        aria-controls={contentId || undefined}
        onClick={handleClick}
        {...rest}
      >
        {children}
        <svg
          className="chat-sources__trigger-chevron"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          data-expanded={expanded ? 'true' : 'false'}
        >
          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    );
  },
);
SourcesTrigger.displayName = 'ChatSources.Trigger';

export type ChatSourcesContentProps = HTMLAttributes<HTMLDivElement>;

const SourcesContent = forwardRef<HTMLDivElement, ChatSourcesContentProps>(
  ({ className, children, ...rest }, ref) => {
    const { expanded, contentId } = useChatSources();
    return (
      <div
        ref={ref}
        id={contentId || undefined}
        className={clsx('chat-sources__content', className)}
        data-slot="chat-sources-content"
        data-expanded={expanded ? 'true' : 'false'}
        hidden={!expanded}
        aria-hidden={!expanded}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
SourcesContent.displayName = 'ChatSources.Content';

export type ChatSourcesListProps = HTMLAttributes<HTMLDivElement>;

const SourcesList = forwardRef<HTMLDivElement, ChatSourcesListProps>(
  ({ className, ...rest }, ref) => (
    <div
      ref={ref}
      className={clsx('chat-sources__list', className)}
      data-slot="chat-sources-list"
      {...rest}
    />
  ),
);
SourcesList.displayName = 'ChatSources.List';

/* ------------------------------------------------------------------ */
/* exports                                                            */
/* ------------------------------------------------------------------ */

const ChatSource = Object.assign(ChatSourceRoot, {
  Trigger,
  Icon,
  Title,
  Preview,
});

export const ChatSources = Object.assign(ChatSourcesRoot, {
  Trigger: SourcesTrigger,
  Content: SourcesContent,
  List: SourcesList,
});

export default ChatSource;
