'use client';

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type MutableRefObject,
  type ReactNode,
  type Ref,
} from 'react';
import clsx from 'clsx';
import {
  Group,
  Panel as RPanel,
  Separator,
  type GroupImperativeHandle,
  type Layout,
  type PanelImperativeHandle,
  type PanelSize,
} from 'react-resizable-panels';

export type ResizableOrientation = 'horizontal' | 'vertical';
export type ResizableHandleType = 'line' | 'drag' | 'pill' | 'handle';
export type ResizableVariant = 'primary' | 'secondary' | 'tertiary';
export type ResizableIndicatorType = 'pill' | 'drag';

/** 命令式句柄（对外 API：尺寸为百分比数组，内部桥接真引擎的 {panelId: number} 布局 map） */
export type ResizableImperativeHandle = {
  getLayout: () => number[];
  setLayout: (sizes: number[]) => void;
};

export type ResizableProps = Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'style'> & {
  orientation?: ResizableOrientation;
  /** 持久化 id：写入 localStorage，重载后恢复布局（基于真引擎 onLayoutChanged + defaultLayout） */
  autoSaveId?: string;
  /** 每次布局变化（含拖拽过程）触发，回传各面板百分比（按 DOM 顺序） */
  onLayout?: (sizes: number[]) => void;
  /** 命令式控制布局（参考实现 handleRef） */
  handleRef?: Ref<ResizableImperativeHandle>;
  /** 禁用整组拖拽 */
  disabled?: boolean;
  /** 拖拽时不接管全局鼠标光标样式 */
  disableCursor?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

export type ResizablePanelProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'className' | 'style' | 'onResize' | 'id'
> & {
  /** 面板 id（透传给真引擎，落到 data-panel/id，并作为布局 map 的 key；缺省由引擎 useId 生成） */
  id?: string;
  /** 初始尺寸（百分比，参考 API） */
  defaultSize?: number;
  /** 最小尺寸（百分比） */
  minSize?: number;
  /** 最大尺寸（百分比） */
  maxSize?: number;
  /** 拖到最小尺寸以下时折叠到 collapsedSize（参考 API） */
  collapsible?: boolean;
  /** 折叠后的尺寸（百分比） */
  collapsedSize?: number;
  /** 禁用该面板的尺寸调整 */
  disabled?: boolean;
  onCollapse?: () => void;
  onExpand?: () => void;
  /** 尺寸变化回调，回传当前百分比（对齐参考实现签名） */
  onResize?: (size: number) => void;
  /** 命令式面板句柄（collapse/expand/resize/getSize/isCollapsed，透传真引擎） */
  panelRef?: Ref<PanelImperativeHandle | null>;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

export type ResizableHandleProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'className' | 'style' | 'children' | 'id'
> & {
  id?: string;
  type?: ResizableHandleType;
  variant?: ResizableVariant;
  /** 便捷：在 line 型 handle 内渲染默认指示器（pill） */
  withIndicator?: boolean;
  disabled?: boolean;
  /** 关闭双击复位面板尺寸（透传真引擎 disableDoubleClick） */
  disableDoubleClick?: boolean;
  /** 拖拽状态变化回调（由真引擎 data-separator 状态驱动） */
  onDragging?: (isDragging: boolean) => void;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

export type ResizableIndicatorProps = {
  type?: ResizableIndicatorType;
  children?: ReactNode;
  className?: string;
};

type PanelOrderRegistry = {
  /** 面板挂载时按 DOM 顺序登记 id，卸载时移除 —— 用于在 {panelId: size} map 与百分比数组间转换 */
  register: (id: string) => void;
  unregister: (id: string) => void;
  /** 当前有序 id 列表 */
  order: MutableRefObject<string[]>;
};

type ResizableContextValue = {
  orientation: ResizableOrientation;
  registry: PanelOrderRegistry;
};

const ResizableContext = createContext<ResizableContextValue | null>(null);

const useResizableContext = (sub: string) => {
  const ctx = useContext(ResizableContext);
  if (ctx === null) throw new Error(`${sub} 必须用在 <Resizable> 内`);
  return ctx;
};

const STORAGE_PREFIX = 'react-resizable-panels:';

/** 把真引擎的 {panelId: 百分比} 布局按登记顺序转成数组 */
const layoutToArray = (layout: Layout, order: string[]): number[] =>
  order.map((id) => layout[id] ?? 0);

/** 把百分比数组按登记顺序转回真引擎布局 map */
const arrayToLayout = (sizes: number[], order: string[]): Layout => {
  const layout: Layout = {};
  order.forEach((id, index) => {
    if (typeof sizes[index] === 'number') layout[id] = sizes[index];
  });
  return layout;
};

const readStoredLayout = (autoSaveId: string): Layout | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + autoSaveId);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (parsed !== null && typeof parsed === 'object') return parsed as Layout;
    return null;
  } catch {
    return null;
  }
};

const writeStoredLayout = (autoSaveId: string, layout: Layout) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_PREFIX + autoSaveId, JSON.stringify(layout));
  } catch {
    // 隐私模式 / 配额超限：静默降级为非持久化
  }
};

const ResizableRoot = forwardRef<HTMLDivElement, ResizableProps>(
  (
    {
      orientation = 'horizontal',
      autoSaveId,
      onLayout,
      handleRef,
      disabled,
      disableCursor,
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) => {
    const orderRef = useRef<string[]>([]);
    const groupHandleRef = useRef<GroupImperativeHandle | null>(null);
    // 指向引擎渲染的 Group 容器 DOM；用于按文档顺序派生面板顺序（与挂载序脱钩）
    const containerRef = useRef<HTMLDivElement | null>(null);

    const registry = useMemo<PanelOrderRegistry>(
      () => ({
        order: orderRef,
        register: (id) => {
          if (!orderRef.current.includes(id)) orderRef.current.push(id);
        },
        unregister: (id) => {
          orderRef.current = orderRef.current.filter((value) => value !== id);
        },
      }),
      [],
    );

    // 权威面板顺序：从 Group 容器 DOM 按文档顺序读取面板 id（引擎把 id 落到 data-panel 节点的 id 属性，
    // 且面板是 Group 的直接子节点），动态增删/重排后仍与可视 DOM 一致。
    // DOM 未就绪（SSR / 首帧挂载前)时回退到挂载序登记表。
    const resolveOrder = useCallback((): string[] => {
      const container = containerRef.current;
      if (container === null) return orderRef.current;
      const registered = orderRef.current;
      const domOrder: string[] = [];
      const seen = new Set<string>();
      container.querySelectorAll<HTMLElement>(':scope > [data-panel]').forEach((node) => {
        const panelId = node.id;
        // 仅纳入已登记的面板 id，过滤引擎可能渲染的非受控/无 id 节点，保证与转换两端一致
        if (panelId !== '' && registered.includes(panelId)) {
          domOrder.push(panelId);
          seen.add(panelId);
        }
      });
      // 兜底：极少数登记但尚未出现在 DOM 查询结果中的 id 追加在尾部，避免漏项
      for (const id of registered) if (!seen.has(id)) domOrder.push(id);
      return domOrder;
    }, []);

    // 合并转发 ref 与内部容器 ref：既满足对外 ref，又能在换算时读取容器 DOM
    const setContainerRef = useCallback(
      (node: HTMLDivElement | null) => {
        containerRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref !== null && ref !== undefined) ref.current = node;
      },
      [ref],
    );

    const contextValue = useMemo<ResizableContextValue>(
      () => ({ orientation, registry }),
      [orientation, registry],
    );

    // 拖拽过程（每次指针移动）触发：换算成百分比数组回调（按 DOM 文档顺序）
    const handleLayoutChange = useCallback(
      (layout: Layout) => {
        onLayout?.(layoutToArray(layout, resolveOrder()));
      },
      [onLayout, resolveOrder],
    );

    // 拖拽/键盘结束后触发：持久化最终布局（指针移动期间不写）
    const handleLayoutChanged = useCallback(
      (layout: Layout) => {
        if (autoSaveId !== undefined) writeStoredLayout(autoSaveId, layout);
      },
      [autoSaveId],
    );

    // 对外命令式句柄：数组 <-> 真引擎布局 map
    useImperativeHandle(
      handleRef,
      (): ResizableImperativeHandle => ({
        getLayout: () => {
          const layout = groupHandleRef.current?.getLayout() ?? {};
          return layoutToArray(layout, resolveOrder());
        },
        setLayout: (sizes) => {
          groupHandleRef.current?.setLayout(arrayToLayout(sizes, resolveOrder()));
        },
      }),
      [resolveOrder],
    );

    // SSR 安全：首屏与服务端一致（undefined），挂载后再读 localStorage 应用存储布局，避免水合不一致 + 布局闪
    const [defaultLayout, setDefaultLayout] = useState<Layout | undefined>(undefined);
    useEffect(() => {
      if (autoSaveId === undefined) return;
      setDefaultLayout(readStoredLayout(autoSaveId) ?? undefined);
    }, [autoSaveId]);

    return (
      <ResizableContext.Provider value={contextValue}>
        <Group
          elementRef={setContainerRef}
          groupRef={groupHandleRef}
          orientation={orientation}
          disabled={disabled}
          disableCursor={disableCursor}
          defaultLayout={defaultLayout}
          onLayoutChange={handleLayoutChange}
          onLayoutChanged={handleLayoutChanged}
          data-slot="resizable"
          className={clsx('resizable', `resizable--${orientation}`, className)}
          style={style}
          {...rest}
        >
          {children}
        </Group>
      </ResizableContext.Provider>
    );
  },
);
ResizableRoot.displayName = 'Resizable';

const Panel = ({
  id: idProp,
  defaultSize,
  minSize,
  maxSize,
  collapsible,
  collapsedSize,
  disabled,
  onCollapse,
  onExpand,
  onResize,
  panelRef,
  className,
  style,
  children,
  ...rest
}: ResizablePanelProps) => {
  const { registry } = useResizableContext('Resizable.Panel');
  const generatedId = useId();
  const id = idProp ?? generatedId;

  // 按 DOM 顺序登记 / 注销，供布局 map<->数组转换
  useEffect(() => {
    registry.register(id);
    return () => registry.unregister(id);
  }, [registry, id]);

  // 真引擎 onResize 回传 {asPercentage,inPixels}，并带折叠语义；映射到参考实现 onResize/onCollapse/onExpand
  const prevCollapsedRef = useRef<boolean | null>(null);
  const handleResize = useCallback(
    (panelSize: PanelSize) => {
      onResize?.(panelSize.asPercentage);
      if (!collapsible) return;
      const collapsed = panelSize.asPercentage <= (collapsedSize ?? 0) + 0.01;
      const was = prevCollapsedRef.current;
      if (was !== null) {
        if (collapsed && !was) onCollapse?.();
        else if (!collapsed && was) onExpand?.();
      }
      prevCollapsedRef.current = collapsed;
    },
    [onResize, onCollapse, onExpand, collapsible, collapsedSize],
  );

  return (
    <RPanel
      id={id}
      panelRef={panelRef}
      defaultSize={defaultSize}
      minSize={minSize}
      maxSize={maxSize}
      collapsible={collapsible}
      collapsedSize={collapsedSize}
      disabled={disabled}
      onResize={handleResize}
      // className 落到引擎渲染的内层 div（对齐快照 <div class="resizable__panel">）
      className={clsx('resizable__panel', className)}
      style={style}
      // data-slot 等 rest 落到引擎渲染的外层 div（带 data-panel/id）
      data-slot="resizable-panel"
      {...rest}
    >
      {children}
    </RPanel>
  );
};
Panel.displayName = 'Resizable.Panel';

const DragDotsIcon = () => (
  <svg
    className="resizable__handle-indicator-icon"
    data-slot="resizable-handle-indicator-icon"
    fill="none"
    height="16"
    viewBox="0 0 16 16"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      clipRule="evenodd"
      d="M7 3a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0M5.5 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m0-5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M7 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m3.5 1.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);
DragDotsIcon.displayName = 'Resizable.DragDotsIcon';

/** 拖拽抓手：pill 为药丸，drag 为带握点图标的圆角块（参考 API） */
const Indicator = ({ type = 'pill', children, className }: ResizableIndicatorProps) => (
  <span
    aria-hidden="true"
    data-slot="resizable-handle-indicator"
    className={clsx(
      'resizable__handle-indicator',
      `resizable__handle-indicator--${type}`,
      className,
    )}
  >
    {children ?? (type === 'drag' ? <DragDotsIcon /> : null)}
  </span>
);
Indicator.displayName = 'Resizable.Indicator';

const Handle = ({
  id: idProp,
  type = 'line',
  variant = 'primary',
  withIndicator = false,
  disabled = false,
  disableDoubleClick,
  onDragging,
  className,
  style,
  children,
  ...rest
}: ResizableHandleProps) => {
  const { orientation } = useResizableContext('Resizable.Handle');
  const elementRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const onDraggingRef = useRef(onDragging);
  onDraggingRef.current = onDragging;

  // 真引擎在拖拽时把 data-separator 置为 "active"，桥接成 BEM CSS 期望的
  // data-resize-handle-state="drag" / data-resize-handle-active / data-pressed，并驱动 onDragging
  useEffect(() => {
    const node = elementRef.current;
    if (node === null || !(node instanceof HTMLElement)) return;
    const sync = () => {
      const state = node.getAttribute('data-separator');
      const isDragging = state === 'active';
      if (isDragging) {
        node.setAttribute('data-resize-handle-state', 'drag');
        node.setAttribute('data-resize-handle-active', '');
        node.setAttribute('data-pressed', 'true');
      } else {
        node.removeAttribute('data-resize-handle-state');
        node.removeAttribute('data-resize-handle-active');
        node.removeAttribute('data-pressed');
      }
      if (isDragging !== draggingRef.current) {
        draggingRef.current = isDragging;
        onDraggingRef.current?.(isDragging);
      }
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(node, { attributes: true, attributeFilter: ['data-separator'] });
    return () => observer.disconnect();
  }, []);

  // line + withIndicator 渲染 pill；pill/handle 渲染 pill；drag 渲染 drag-dots
  const shouldRenderIndicator = withIndicator || type !== 'line';
  const indicatorType: ResizableIndicatorType = type === 'drag' ? 'drag' : 'pill';

  return (
    <Separator
      elementRef={elementRef}
      id={idProp}
      disabled={disabled}
      disableDoubleClick={disableDoubleClick}
      data-slot="resizable-handle"
      data-type={type}
      data-variant={variant}
      aria-label="Resize handle"
      className={clsx(
        'resizable__handle',
        `resizable__handle--${orientation}`,
        `resizable__handle--${type}`,
        `resizable__handle--${variant}`,
        className,
      )}
      style={style}
      {...rest}
    >
      {children ?? (shouldRenderIndicator ? <Indicator type={indicatorType} /> : null)}
    </Separator>
  );
};
Handle.displayName = 'Resizable.Handle';

const Resizable = Object.assign(ResizableRoot, { Panel, Handle, Indicator });

export default Resizable;
