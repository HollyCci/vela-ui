'use client';

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { Button, Tooltip, type ButtonProps } from '@heroui/react';
import { AnimatePresence, motion, type Transition } from 'motion/react';
import clsx from 'clsx';

type ScrollBehaviorMode = 'auto' | 'smooth';

/** 新消息进场：从下方 8px、透明淡入到原位（参考实现对话流新消息进场手感） */
const MESSAGE_INITIAL = { opacity: 0, y: 8 } as const;
const MESSAGE_ANIMATE = { opacity: 1, y: 0 } as const;
const MESSAGE_TRANSITION: Transition = { duration: 0.25, ease: [0.16, 1, 0.3, 1] };

type ChatConversationContextValue = {
  /** 滚动视口元素（root） */
  viewportRef: React.MutableRefObject<HTMLDivElement | null>;
  /** 底部锚点元素，scrollIntoView 用于回到底部 */
  anchorRef: React.MutableRefObject<HTMLDivElement | null>;
  /** 当前视口是否贴底；决定 scroll-button 可见性与自动跟随 */
  isAtBottom: boolean;
  /** 滚动到底部（默认平滑） */
  scrollToBottom: (behavior?: ScrollBehaviorMode) => void;
  registerAnchor: (node: HTMLDivElement | null) => void;
};

const ChatConversationContext = createContext<ChatConversationContextValue | null>(null);

function useChatConversationContext(component: string): ChatConversationContextValue {
  const ctx = useContext(ChatConversationContext);
  if (ctx === null) {
    throw new Error(`${component} 必须在 <ChatConversation> 内使用`);
  }
  return ctx;
}

export type ChatConversationProps = Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'style'> & {
  /** 内容变化时是否自动跟随到底（仅当用户已贴底时生效，参考实现 stick-to-bottom 行为，默认 true） */
  followOutput?: boolean;
  /** 判定“贴底”的像素阈值（默认 24） */
  threshold?: number;
  /** 首次挂载后是否立即滚动到底部（默认 true） */
  initialScrollToBottom?: boolean;
  /** 贴底状态变化回调 */
  onAtBottomChange?: (isAtBottom: boolean) => void;
  className?: string;
  style?: CSSProperties;
};

const ChatConversationRoot = forwardRef<HTMLDivElement, ChatConversationProps>(
  (
    {
      className,
      followOutput = true,
      threshold = 24,
      initialScrollToBottom = true,
      onAtBottomChange,
      children,
      ...rest
    },
    forwardedRef,
  ) => {
    const viewportRef = useRef<HTMLDivElement | null>(null);
    const anchorRef = useRef<HTMLDivElement | null>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const didInitialScroll = useRef(false);
    // 增高前的贴底快照：每次评估贴底时同步写入，供 MutationObserver 在 DOM 增长后读取“增长前”的真值
    const wasAtBottomRef = useRef(true);
    // 始终指向最新的 onAtBottomChange，避免回调身份变化重建 effect
    const onAtBottomChangeRef = useRef(onAtBottomChange);
    onAtBottomChangeRef.current = onAtBottomChange;

    // 合并外部 ref 与内部视口 ref
    useImperativeHandle(forwardedRef, () => viewportRef.current as HTMLDivElement, []);

    const computeAtBottom = useCallback(() => {
      const node = viewportRef.current;
      if (node === null) {
        return true;
      }
      const distance = node.scrollHeight - node.scrollTop - node.clientHeight;
      return distance <= threshold;
    }, [threshold]);

    const scrollToBottom = useCallback((behavior: ScrollBehaviorMode = 'smooth') => {
      const node = viewportRef.current;
      if (node === null) {
        return;
      }
      const anchor = anchorRef.current;
      if (anchor !== null) {
        anchor.scrollIntoView({ behavior, block: 'end' });
        return;
      }
      node.scrollTo({ top: node.scrollHeight, behavior });
    }, []);

    const updateAtBottom = useCallback(() => {
      const next = computeAtBottom();
      // 同步保存“增长前”的贴底快照，供 MutationObserver 在内容追加后判断是否跟随
      wasAtBottomRef.current = next;
      // updater 保持纯：只 return next，副作用（onAtBottomChange）由下方 useEffect 触发
      setIsAtBottom(next);
    }, [computeAtBottom]);

    const handleScroll = useCallback(() => {
      updateAtBottom();
    }, [updateAtBottom]);

    // 贴底状态变化回调：只在 isAtBottom 真正变化时触发（跳过首挂载），等价于原 prev !== next 语义；
    // 副作用从 setState updater 中移出，保证 updater 纯、StrictMode/并发下不重复调用消费者回调
    const didMountAtBottomEffect = useRef(false);
    useEffect(() => {
      if (!didMountAtBottomEffect.current) {
        didMountAtBottomEffect.current = true;
        return;
      }
      onAtBottomChangeRef.current?.(isAtBottom);
    }, [isAtBottom]);

    // 首次挂载：跳到底部并初始化贴底状态
    useLayoutEffect(() => {
      if (initialScrollToBottom && !didInitialScroll.current) {
        didInitialScroll.current = true;
        scrollToBottom('auto');
      }
      updateAtBottom();
      // 仅挂载时运行
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 内容变化时：贴底则跟随，否则只重新评估贴底状态（保留用户阅读位置）
    useLayoutEffect(() => {
      const node = viewportRef.current;
      if (node === null || !(node instanceof HTMLElement)) {
        return;
      }
      const observer = new MutationObserver(() => {
        // 用“增长前”的贴底快照决定是否跟随：DOM 已增高，此刻现算 computeAtBottom() 会误判为非贴底。
        // MutationObserver 回调本身按微任务批处理——一次流式提交合并为一次回调，无需再额外节流；
        // 同步执行也保证页面隐藏（requestAnimationFrame 被暂停）时仍能跟随，回到前台即处于底部。
        if (followOutput && wasAtBottomRef.current) {
          // 跟随必须用 instant：smooth 动画下 scrollTop 滞后于增长的 scrollHeight，
          // 紧随其后的 updateAtBottom() 会读到动画中途位置而把贴底快照误清为 false，
          // 导致下一次 mutation 不再跟随（流式第一条之后即停止粘底）。
          scrollToBottom('auto');
        }
        // instant 滚动同步生效，此刻评估到的就是贴底真值，wasAtBottomRef 维持 true；
        // 用户已上滚时则如实评估为非贴底，驱动 scroll-button 显隐。
        updateAtBottom();
      });
      observer.observe(node, { childList: true, subtree: true, characterData: true });

      // 尺寸变化跟随：视口/容器 resize、异步图片或 iframe 撑高都不改 DOM 结构，
      // MutationObserver 捕获不到——必须额外用 ResizeObserver，否则贴底快照与 scroll-button
      // 显隐会在这些场景下变陈旧（参考实现 stick-to-bottom 同样跟踪尺寸变化）。
      // jsdom 无 ResizeObserver：feature-detect 后再构造，缺失环境则静默跳过。
      let resizeObserver: ResizeObserver | null = null;
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => {
          // 与 MutationObserver 分支同构：增高前已贴底则跟随（instant，理由同上），随后重评估贴底。
          if (followOutput && wasAtBottomRef.current) {
            scrollToBottom('auto');
          }
          updateAtBottom();
        });
        resizeObserver.observe(node);
        // 同时观测内层内容节点：视口本身尺寸不变、内部内容撑高时（如图片加载完）也能跟随。
        const content = node.firstElementChild;
        if (content !== null) {
          resizeObserver.observe(content);
        }
      }

      return () => {
        observer.disconnect();
        resizeObserver?.disconnect();
      };
    }, [followOutput, scrollToBottom, updateAtBottom]);

    const registerAnchor = useCallback((node: HTMLDivElement | null) => {
      anchorRef.current = node;
    }, []);

    const contextValue = useMemo<ChatConversationContextValue>(
      () => ({ viewportRef, anchorRef, isAtBottom, scrollToBottom, registerAnchor }),
      [isAtBottom, scrollToBottom, registerAnchor],
    );

    return (
      <ChatConversationContext.Provider value={contextValue}>
        <div
          ref={viewportRef}
          data-slot="chat-conversation"
          role="log"
          className={clsx('chat-conversation', className)}
          onScroll={handleScroll}
          {...rest}
        >
          {children}
        </div>
      </ChatConversationContext.Provider>
    );
  },
);
ChatConversationRoot.displayName = 'ChatConversation';

export type ChatConversationContentProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'className' | 'style'
> & {
  className?: string;
  style?: CSSProperties;
};

const Content = forwardRef<HTMLDivElement, ChatConversationContentProps>(
  ({ className, children, ...rest }, ref) => (
    <div
      ref={ref}
      data-slot="chat-conversation-content"
      className={clsx('chat-conversation__content', className)}
      {...rest}
    >
      {children}
    </div>
  ),
);
Content.displayName = 'ChatConversation.Content';

export type ChatConversationMessagesProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'className' | 'style'
> & {
  className?: string;
  style?: CSSProperties;
};

/**
 * 消息列表容器：内部包一层 AnimatePresence，使其直接子 <ChatConversation.Message> 在挂载时
 * 触发进场过渡（initial=false：首屏已存在的消息不播放，仅后续追加的新消息进场）。
 * 不渲染 DOM 包裹层以外的结构，data-slot 与参考实现 content 保持解耦。
 */
const Messages = forwardRef<HTMLDivElement, ChatConversationMessagesProps>(
  ({ className, children, ...rest }, ref) => (
    <div
      ref={ref}
      data-slot="chat-conversation-messages"
      className={clsx('chat-conversation__messages', className)}
      {...rest}
    >
      <AnimatePresence initial={false}>{children}</AnimatePresence>
    </div>
  ),
);
Messages.displayName = 'ChatConversation.Messages';

/**
 * Message 底座是 Motion 元素（motion.div），故剔除会与 Motion 同名 prop 冲突的原生拖拽/动画事件
 * （onDrag*、onAnimation*）——这些由 Motion 接管，对外不暴露。
 */
type ChatConversationMessageConflictingProps =
  | 'className'
  | 'style'
  | 'onDrag'
  | 'onDragStart'
  | 'onDragEnd'
  | 'onDragEnter'
  | 'onDragExit'
  | 'onDragLeave'
  | 'onDragOver'
  | 'onDrop'
  | 'onAnimationStart'
  | 'onAnimationEnd'
  | 'onAnimationIteration';

export type ChatConversationMessageProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  ChatConversationMessageConflictingProps
> & {
  className?: string;
  style?: CSSProperties;
};

/**
 * 单条消息进场包装：真 framer-motion（motion/react）。新消息挂载时
 * initial(opacity:0,y:8) → animate(opacity:1,y:0)，淡入并上移到位。
 * 用作 <ChatConversation.Messages> 的直接子，每条消息须带稳定 key 让 AnimatePresence 识别增量。
 * 仅做 transform/opacity 动画，不增删子节点，故不触发滚动跟随的 MutationObserver childList 误判。
 */
const Message = forwardRef<HTMLDivElement, ChatConversationMessageProps>(
  ({ className, children, ...rest }, ref) => (
    <motion.div
      ref={ref}
      data-slot="chat-conversation-message"
      className={clsx('chat-conversation__message', className)}
      initial={MESSAGE_INITIAL}
      animate={MESSAGE_ANIMATE}
      transition={MESSAGE_TRANSITION}
      {...rest}
    >
      {children}
    </motion.div>
  ),
);
Message.displayName = 'ChatConversation.Message';

export type ChatConversationScrollAnchorProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'className' | 'style'
> & {
  className?: string;
  style?: CSSProperties;
};

/** 底部锚点：stick-to-bottom 行为通过 scrollIntoView 此元素回到底部 */
const ScrollAnchor = forwardRef<HTMLDivElement, ChatConversationScrollAnchorProps>(
  ({ className, ...rest }, ref) => {
    const { registerAnchor } = useChatConversationContext('ChatConversation.ScrollAnchor');

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        registerAnchor(node);
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref !== null) {
          ref.current = node;
        }
      },
      [registerAnchor, ref],
    );

    return (
      <div
        ref={setRefs}
        aria-hidden="true"
        data-slot="chat-conversation-scroll-anchor"
        className={clsx('chat-conversation__scroll-anchor', className)}
        {...rest}
      />
    );
  },
);
ScrollAnchor.displayName = 'ChatConversation.ScrollAnchor';

const ChevronDownIcon = () => (
  <svg
    fill="none"
    height="16"
    viewBox="0 0 16 16"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
    className="size-4"
  >
    <path
      clipRule="evenodd"
      d="M2.97 5.47a.75.75 0 0 1 1.06 0L8 9.44l3.97-3.97a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 0 1 0-1.06"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);
ChevronDownIcon.displayName = 'ChatConversation.ChevronDownIcon';

export type ChatConversationScrollButtonProps = Omit<ButtonProps, 'className' | 'style'> & {
  /** 提供时按钮包进 OSS Tooltip（参考实现快照行为，默认 "Scroll to bottom"） */
  tooltip?: ReactNode;
  /** 滚动行为（默认 smooth） */
  scrollBehavior?: ScrollBehaviorMode;
  className?: string;
  style?: CSSProperties;
};

/**
 * 跳转到底部按钮：视口远离底部时显示（容器 data-state=visible），贴底时隐藏（data-state=hidden）。
 * 按钮为 OSS Button secondary/icon-only/sm，按下回到底部。
 */
const ScrollButton = forwardRef<HTMLButtonElement, ChatConversationScrollButtonProps>(
  (
    {
      className,
      tooltip = 'Scroll to bottom',
      scrollBehavior = 'smooth',
      size = 'sm',
      variant = 'secondary',
      onPress,
      children,
      'aria-label': ariaLabel,
      ...rest
    },
    ref,
  ) => {
    const { isAtBottom, scrollToBottom } = useChatConversationContext(
      'ChatConversation.ScrollButton',
    );

    const handlePress = useCallback<NonNullable<ButtonProps['onPress']>>(
      (event) => {
        onPress?.(event);
        scrollToBottom(scrollBehavior);
      },
      [onPress, scrollToBottom, scrollBehavior],
    );

    const button = (
      <Button
        ref={ref}
        data-slot="chat-conversation-scroll-button"
        isIconOnly
        size={size}
        variant={variant}
        className={clsx('chat-conversation__scroll-button', className)}
        aria-label={ariaLabel ?? 'Scroll to bottom'}
        isDisabled={isAtBottom}
        onPress={handlePress}
        {...rest}
      >
        {children ?? <ChevronDownIcon />}
      </Button>
    );

    return (
      <div
        data-slot="chat-conversation-scroll-button-container"
        data-state={isAtBottom ? 'hidden' : 'visible'}
        aria-hidden={isAtBottom ? 'true' : undefined}
        className="chat-conversation__scroll-button-container"
      >
        {tooltip === undefined ? (
          button
        ) : (
          <Tooltip>
            <Tooltip.Trigger>{button}</Tooltip.Trigger>
            <Tooltip.Content>{tooltip}</Tooltip.Content>
          </Tooltip>
        )}
      </div>
    );
  },
);
ScrollButton.displayName = 'ChatConversation.ScrollButton';

const ChatConversation = Object.assign(ChatConversationRoot, {
  Content,
  Messages,
  Message,
  ScrollAnchor,
  ScrollButton,
});

export default ChatConversation;
