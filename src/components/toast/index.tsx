'use client';

import {
  forwardRef,
  useCallback,
  useSyncExternalStore,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

export type ToastColor = 'default' | 'accent' | 'success' | 'warning' | 'danger';
export type ToastPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end';

export type ToastProps = Omit<HTMLAttributes<HTMLDivElement>, 'title'> & {
  title: ReactNode;
  description?: ReactNode;
  indicator?: ReactNode;
  /** 标题/描述下方的操作区（如按钮） */
  action?: ReactNode;
  color?: ToastColor;
  placement?: ToastPlacement;
  isFrontmost?: boolean;
  onClose?: () => void;
};

const CloseIcon = () => (
  <svg
    data-slot="close-button-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
  </svg>
);

const Toast = forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      title,
      description,
      indicator,
      action,
      color = 'default',
      placement = 'bottom-end',
      isFrontmost = true,
      onClose,
      className,
      ...rest
    },
    ref,
  ) => (
    <div
      ref={ref}
      role="alert"
      data-frontmost={isFrontmost || undefined}
      className={clsx(
        'toast',
        `toast--${placement}`,
        color !== 'default' && `toast--${color}`,
        className,
      )}
      {...rest}
    >
      {indicator !== undefined && <span className="toast__indicator">{indicator}</span>}
      <div className="toast__content">
        <div className="toast__title">{title}</div>
        {description !== undefined && <div className="toast__description">{description}</div>}
      </div>
      {action !== undefined && <div className="toast__action">{action}</div>}
      {onClose !== undefined && (
        <button type="button" aria-label="关闭" className="toast__close-button" onClick={onClose}>
          <CloseIcon />
        </button>
      )}
    </div>
  ),
);

Toast.displayName = 'Toast';

/* ------------------------------------------------------------------ *
 * 命令式 Toast 编排器（Toaster region）
 *
 * 真站 toast 的进出场动画由浏览器 View Transitions 驱动：
 *  - .toast--bottom/.toast--top 在 CSS 里声明了 `view-transition-class`
 *    （toast-bottom / toast-top）。
 *  - 样式分片中的 `::view-transition-new/old(.toast-bottom):only-child`
 *    把 toast-slide-*-in/out keyframe 挂到对应快照上。
 *  - 每条 toast 还需要一个**唯一**的 `view-transition-name`（真站由 JS 内联设置），
 *    浏览器才能在一次过渡里把同一条 toast 的旧/新快照配对、为新增/移除分别播放
 *    enter/exit 动画。
 *
 * 因此编排器的职责只有一件：把「插入/移除 DOM 节点」这个 setState 包进
 * document.startViewTransition()，剩下的动画完全交给上面那套已就绪的 CSS。
 * startViewTransition 不可用时优雅降级为直接 setState（无动画，功能不变）。
 * ------------------------------------------------------------------ */

export type ToastOptions = {
  title: ReactNode;
  description?: ReactNode;
  indicator?: ReactNode;
  action?: ReactNode;
  color?: ToastColor;
  /** 自动关闭毫秒数；<= 0 表示不自动关闭。默认 4000。 */
  timeout?: number;
};

type ToastEntry = ToastOptions & { id: string };

type StartViewTransition = (callback: () => void) => unknown;

const getStartViewTransition = (): StartViewTransition | undefined => {
  if (typeof document === 'undefined') return undefined;
  const doc = document as Document & { startViewTransition?: StartViewTransition };
  if (typeof doc.startViewTransition !== 'function') return undefined;
  return (callback) => doc.startViewTransition!(callback);
};

/** 把一次 DOM 变更包进 view transition；不支持时直接执行（降级，无动画）。 */
const withViewTransition = (mutate: () => void) => {
  const start = getStartViewTransition();
  if (!start) {
    mutate();
    return;
  }
  start(mutate);
};

let toastSeq = 0;

class ToastStore {
  private entries: ToastEntry[] = [];
  private listeners = new Set<() => void>();
  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.entries;

  private emit() {
    for (const listener of this.listeners) listener();
  }

  add = (options: ToastOptions): string => {
    toastSeq += 1;
    const id = `toast-${toastSeq}`;
    const entry: ToastEntry = { ...options, id };
    withViewTransition(() => {
      // 新数组引用，让 useSyncExternalStore 触发重渲染 → 新节点进入 DOM
      this.entries = [...this.entries, entry];
      this.emit();
    });
    const timeout = options.timeout ?? 4000;
    if (timeout > 0) {
      this.timers.set(
        id,
        setTimeout(() => this.remove(id), timeout),
      );
    }
    return id;
  };

  remove = (id: string) => {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    if (!this.entries.some((entry) => entry.id === id)) return;
    withViewTransition(() => {
      // 移除节点 → view transition 捕获旧快照并播放 exit 动画
      this.entries = this.entries.filter((entry) => entry.id !== id);
      this.emit();
    });
  };
}

const store = new ToastStore();

/** 命令式 API：在任意位置弹出一条 toast，返回其 id（可用于手动关闭）。 */
export const toast = (options: ToastOptions): string => store.add(options);
/** 关闭指定 toast。 */
toast.close = (id: string): void => store.remove(id);

/** Hook 形态，等价于模块级 `toast` / `toast.close`。 */
export const useToast = () => {
  const add = useCallback((options: ToastOptions) => store.add(options), []);
  const close = useCallback((id: string) => store.remove(id), []);
  return { toast: add, close };
};

export type ToasterProps = {
  placement?: ToastPlacement;
  /** region 在 sm 及以上的最小宽度（真站由 JS 测量内联，这里给一个稳妥默认）。 */
  width?: number | string;
  /** 渲染目标，默认 document.body。传入容器可在局部演示中就地渲染。 */
  container?: HTMLElement | null;
};

const placementToRegionModifier: Record<ToastPlacement, string> = {
  top: 'toast-region--top',
  'top-start': 'toast-region--top-start',
  'top-end': 'toast-region--top-end',
  bottom: 'toast-region--bottom',
  'bottom-start': 'toast-region--bottom-start',
  'bottom-end': 'toast-region--bottom-end',
};

/**
 * Toast 区域编排器：挂在应用任意位置（通常根部），订阅 store 并渲染当前 toast 栈。
 * 进出场动画由 store 的 withViewTransition + CSS view-transition 规则驱动。
 */
const Toaster = ({
  placement = 'bottom-end',
  width = 380,
  container,
}: ToasterProps): ReactNode => {
  const entries = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  if (typeof document === 'undefined') return null;
  const target = container ?? document.body;

  const style = {
    '--toast-width': typeof width === 'number' ? `${width}px` : width,
  } as CSSProperties;

  const node = (
    <div
      role="region"
      aria-label="通知"
      tabIndex={-1}
      className={clsx('toast-region', placementToRegionModifier[placement])}
      style={style}
    >
      {entries.map((entry, index) => {
        const isFrontmost = index === entries.length - 1;
        // 唯一 view-transition-name 让浏览器为每条 toast 单独配对/播放进出场动画。
        const toastStyle = { viewTransitionName: entry.id } as CSSProperties;
        return (
          <Toast
            key={entry.id}
            title={entry.title}
            description={entry.description}
            indicator={entry.indicator}
            action={entry.action}
            color={entry.color}
            placement={placement}
            isFrontmost={isFrontmost}
            style={toastStyle}
            onClose={() => store.remove(entry.id)}
          />
        );
      })}
    </div>
  );

  return createPortal(node, target);
};

Toaster.displayName = 'Toaster';

export { Toaster };

export default Toast;
