import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type Ref,
} from 'react';
import clsx from 'clsx';

export type ResizableOrientation = 'horizontal' | 'vertical';
export type ResizableHandleType = 'line' | 'drag' | 'pill' | 'handle';
export type ResizableVariant = 'primary' | 'secondary' | 'tertiary';
export type ResizableIndicatorType = 'pill' | 'drag';

/** 命令式句柄（原站 API：尺寸为百分比数组） */
export type ResizableImperativeHandle = {
  getLayout: () => number[];
  setLayout: (sizes: number[]) => void;
};

export type ResizableProps = Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'style'> & {
  orientation?: ResizableOrientation;
  /** 持久化 id：写入 localStorage，重载后恢复布局（原站 API） */
  autoSaveId?: string;
  /** 每次布局变化（含拖拽过程）触发，回传各面板百分比 */
  onLayout?: (sizes: number[]) => void;
  /** 命令式控制布局（原站 handleRef） */
  handleRef?: Ref<ResizableImperativeHandle>;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

export type ResizablePanelProps = Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'style'> & {
  /** 初始尺寸（百分比，原站 API） */
  defaultSize?: number;
  /** 最小尺寸（百分比） */
  minSize?: number;
  /** 最大尺寸（百分比） */
  maxSize?: number;
  /** 拖到最小尺寸以下时折叠到 collapsedSize（原站 API） */
  collapsible?: boolean;
  /** 折叠后的尺寸（百分比） */
  collapsedSize?: number;
  onCollapse?: () => void;
  onExpand?: () => void;
  onResize?: (size: number) => void;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

export type ResizableHandleProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'className' | 'style' | 'children'
> & {
  type?: ResizableHandleType;
  variant?: ResizableVariant;
  /** 便捷：在 line 型 handle 内渲染默认指示器 */
  withIndicator?: boolean;
  disabled?: boolean;
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

/** 面板注册时携带的尺寸约束（百分比） */
type PanelConstraint = {
  defaultSize: number;
  minSize: number;
  maxSize: number;
  collapsible: boolean;
  collapsedSize: number;
  onResize?: (size: number) => void;
  onCollapse?: () => void;
  onExpand?: () => void;
};

type ResizableContextValue = {
  orientation: ResizableOrientation;
  groupRef: MutableRefObject<HTMLDivElement | null>;
  /** 面板首渲染时注册约束，返回其在 sizes 数组中的索引 */
  registerPanel: (constraint: PanelConstraint) => number;
  /** handle 首渲染时领取其左侧面板索引 */
  registerHandle: () => number;
  getSize: (index: number) => number;
  /** 拖拽：把像素位移换算为百分比并分摊到相邻两面板 */
  resizeByPointer: (leftPanelIndex: number, deltaPx: number) => void;
  /** 键盘步进 */
  resizeByKeyboard: (leftPanelIndex: number, deltaPercent: number) => void;
  getPanelConstraint: (index: number) => PanelConstraint;
  beginDrag: () => void;
  endDrag: () => void;
};

const ResizableContext = createContext<ResizableContextValue | null>(null);

const useResizableContext = (sub: string) => {
  const ctx = useContext(ResizableContext);
  if (ctx === null) throw new Error(`${sub} 必须用在 <Resizable> 内`);
  return ctx;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const STORAGE_PREFIX = 'react-resizable-panels:';

const readStoredLayout = (autoSaveId: string): number[] | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + autoSaveId);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.every((n) => typeof n === 'number') ? parsed : null;
  } catch {
    return null;
  }
};

const writeStoredLayout = (autoSaveId: string, sizes: number[]) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_PREFIX + autoSaveId, JSON.stringify(sizes));
  } catch {
    // 隐私模式 / 配额超限：静默降级为非持久化
  }
};

/** 把各面板的 defaultSize 归一化为总和 100 的百分比数组（未声明的均分剩余空间） */
const normalizeDefaults = (constraints: PanelConstraint[]): number[] => {
  const provided = constraints.map((c) => c.defaultSize);
  const known = provided.reduce((sum, v) => sum + (v > 0 ? v : 0), 0);
  const unknownCount = provided.filter((v) => v <= 0).length;
  const remaining = Math.max(100 - known, 0);
  const fill = unknownCount > 0 ? remaining / unknownCount : 0;
  const filled = provided.map((v) => (v > 0 ? v : fill));
  const sum = filled.reduce((a, b) => a + b, 0) || 1;
  return filled.map((v) => (v / sum) * 100);
};

/** 拖动一个 handle 时，把百分比增量分摊到相邻两面板，各自夹紧到 min/max，支持折叠吸附 */
const applyDelta = (
  sizes: number[],
  constraints: PanelConstraint[],
  leftIndex: number,
  deltaPercent: number,
): number[] => {
  const rightIndex = leftIndex + 1;
  if (rightIndex >= sizes.length) return sizes;

  const left = constraints[leftIndex];
  const right = constraints[rightIndex];
  const next = [...sizes];

  let proposedLeft = sizes[leftIndex] + deltaPercent;
  if (left.collapsible && proposedLeft < left.minSize) {
    const threshold = (left.minSize + left.collapsedSize) / 2;
    proposedLeft = proposedLeft <= threshold ? left.collapsedSize : left.minSize;
  } else {
    proposedLeft = clamp(proposedLeft, left.minSize, left.maxSize);
  }

  const actualDelta = proposedLeft - sizes[leftIndex];
  let proposedRight = sizes[rightIndex] - actualDelta;
  if (right.collapsible && proposedRight < right.minSize) {
    const threshold = (right.minSize + right.collapsedSize) / 2;
    proposedRight = proposedRight <= threshold ? right.collapsedSize : right.minSize;
  } else {
    proposedRight = clamp(proposedRight, right.minSize, right.maxSize);
  }

  // 右侧被夹住产生的差额退回左侧，保证两面板尺寸之和守恒
  const correction = sizes[rightIndex] - proposedRight - actualDelta;
  next[leftIndex] = proposedLeft + correction;
  next[rightIndex] = proposedRight;
  return next;
};

const mergeRefs =
  <T,>(...refs: Array<Ref<T> | undefined>) =>
  (node: T | null) => {
    for (const r of refs) {
      if (typeof r === 'function') r(node);
      else if (r != null) (r as MutableRefObject<T | null>).current = node;
    }
  };

const ResizableRoot = forwardRef<HTMLDivElement, ResizableProps>(
  (
    { orientation = 'horizontal', autoSaveId, onLayout, handleRef, className, style, children, ...rest },
    ref,
  ) => {
    const groupRef = useRef<HTMLDivElement | null>(null);
    const constraintsRef = useRef<PanelConstraint[]>([]);
    const handleCursorRef = useRef(0);
    const prevCollapsedRef = useRef<boolean[]>([]);
    const initializedRef = useRef(false);

    const [sizes, setSizes] = useState<number[]>([]);
    const sizesRef = useRef<number[]>(sizes);
    sizesRef.current = sizes;
    const dragStartSizesRef = useRef<number[] | null>(null);

    const commitSizes = useMemo(
      () => (nextSizes: number[]) => {
        sizesRef.current = nextSizes;
        setSizes(nextSizes);
        onLayout?.(nextSizes);
        if (autoSaveId !== undefined) writeStoredLayout(autoSaveId, nextSizes);
        const constraints = constraintsRef.current;
        nextSizes.forEach((size, index) => {
          const c = constraints[index];
          if (c === undefined) return;
          c.onResize?.(size);
          const collapsed = c.collapsible && size <= c.collapsedSize + 0.01;
          const was = prevCollapsedRef.current[index] ?? false;
          if (collapsed && !was) c.onCollapse?.();
          else if (!collapsed && was) c.onExpand?.();
          prevCollapsedRef.current[index] = collapsed;
        });
      },
      [autoSaveId, onLayout],
    );

    const initializeIfReady = useMemo(
      () => () => {
        if (initializedRef.current) return;
        const constraints = constraintsRef.current;
        if (constraints.length === 0) return;
        initializedRef.current = true;
        const stored = autoSaveId !== undefined ? readStoredLayout(autoSaveId) : null;
        const initial =
          stored !== null && stored.length === constraints.length
            ? stored
            : normalizeDefaults(constraints);
        prevCollapsedRef.current = initial.map((size, index) =>
          constraints[index].collapsible ? size <= constraints[index].collapsedSize + 0.01 : false,
        );
        sizesRef.current = initial;
        setSizes(initial);
      },
      [autoSaveId],
    );

    const contextValue = useMemo<ResizableContextValue>(
      () => ({
        orientation,
        groupRef,
        registerPanel: (constraint) => {
          const index = constraintsRef.current.length;
          constraintsRef.current.push(constraint);
          // 每个面板注册后尝试初始化（最后一个注册时长度齐全）
          queueMicrotask(initializeIfReady);
          return index;
        },
        registerHandle: () => {
          const index = handleCursorRef.current;
          handleCursorRef.current += 1;
          return index;
        },
        getSize: (index) => sizesRef.current[index] ?? 0,
        resizeByPointer: (leftPanelIndex, deltaPx) => {
          const group = groupRef.current;
          if (group === null) return;
          const total = orientation === 'horizontal' ? group.clientWidth : group.clientHeight;
          if (total === 0) return;
          const base = dragStartSizesRef.current ?? sizesRef.current;
          const next = applyDelta(
            base,
            constraintsRef.current,
            leftPanelIndex,
            (deltaPx / total) * 100,
          );
          commitSizes(next);
        },
        resizeByKeyboard: (leftPanelIndex, deltaPercent) => {
          const next = applyDelta(
            sizesRef.current,
            constraintsRef.current,
            leftPanelIndex,
            deltaPercent,
          );
          commitSizes(next);
        },
        getPanelConstraint: (index) =>
          constraintsRef.current[index] ?? {
            defaultSize: 0,
            minSize: 0,
            maxSize: 100,
            collapsible: false,
            collapsedSize: 0,
          },
        beginDrag: () => {
          dragStartSizesRef.current = [...sizesRef.current];
        },
        endDrag: () => {
          dragStartSizesRef.current = null;
        },
      }),
      [orientation, commitSizes, initializeIfReady],
    );

    useImperativeHandle(
      handleRef,
      (): ResizableImperativeHandle => ({
        getLayout: () => sizesRef.current,
        setLayout: (next) => commitSizes(next),
      }),
      [commitSizes],
    );

    return (
      <ResizableContext.Provider value={contextValue}>
        <div
          ref={mergeRefs(groupRef, ref)}
          data-slot="resizable"
          data-orientation={orientation}
          className={clsx('resizable', `resizable--${orientation}`, className)}
          style={style}
          {...rest}
        >
          {children}
        </div>
      </ResizableContext.Provider>
    );
  },
);
ResizableRoot.displayName = 'Resizable';

const Panel = ({
  defaultSize = 0,
  minSize = 0,
  maxSize = 100,
  collapsible = false,
  collapsedSize = 0,
  onCollapse,
  onExpand,
  onResize,
  className,
  style,
  children,
  ...rest
}: ResizablePanelProps) => {
  const ctx = useResizableContext('Resizable.Panel');

  // 仅首渲染注册一次，锁定索引以读取实时尺寸
  const indexRef = useRef<number | null>(null);
  if (indexRef.current === null) {
    indexRef.current = ctx.registerPanel({
      defaultSize,
      minSize,
      maxSize,
      collapsible,
      collapsedSize,
      onResize,
      onCollapse,
      onExpand,
    });
  }
  const size = ctx.getSize(indexRef.current);

  return (
    <div
      data-slot="resizable-panel"
      data-panel="true"
      className={clsx('resizable__panel', className)}
      // flex-grow 表达百分比（basis 0），相邻面板按 grow 比例瓜分空间
      style={{ flexGrow: size, flexShrink: 1, flexBasis: '0px', overflow: 'hidden', ...style }}
      {...rest}
    >
      {children}
    </div>
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

/** 拖拽抓手：pill 为药丸，drag 为带握点图标的圆角块（原站 API） */
const Indicator = ({ type = 'pill', children, className }: ResizableIndicatorProps) => (
  <span
    aria-hidden="true"
    data-slot="resizable-handle-indicator"
    className={clsx('resizable__handle-indicator', `resizable__handle-indicator--${type}`, className)}
  >
    {children ?? (type === 'drag' ? <DragDotsIcon /> : null)}
  </span>
);
Indicator.displayName = 'Resizable.Indicator';

const KEYBOARD_STEP = 5;

const Handle = ({
  type = 'line',
  variant = 'primary',
  withIndicator = false,
  disabled = false,
  onDragging,
  className,
  style,
  children,
  ...rest
}: ResizableHandleProps) => {
  const ctx = useResizableContext('Resizable.Handle');
  const { orientation } = ctx;

  // handle 紧跟其左侧面板，索引首渲染锁定
  const leftIndexRef = useRef<number | null>(null);
  if (leftIndexRef.current === null) leftIndexRef.current = ctx.registerHandle();
  const leftIndex = leftIndexRef.current;

  const id = useId();
  const startPosRef = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const meta = ctx.getPanelConstraint(leftIndex);
  const valueNow = Math.round(ctx.getSize(leftIndex));

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    startPosRef.current = orientation === 'horizontal' ? event.clientX : event.clientY;
    ctx.beginDrag();
    setIsDragging(true);
    onDragging?.(true);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (startPosRef.current === null) return;
    const current = orientation === 'horizontal' ? event.clientX : event.clientY;
    ctx.resizeByPointer(leftIndex, current - startPosRef.current);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (startPosRef.current === null) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    startPosRef.current = null;
    ctx.endDrag();
    setIsDragging(false);
    onDragging?.(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const decrease =
      orientation === 'horizontal' ? event.key === 'ArrowLeft' : event.key === 'ArrowUp';
    const increase =
      orientation === 'horizontal' ? event.key === 'ArrowRight' : event.key === 'ArrowDown';
    if (!decrease && !increase) return;
    event.preventDefault();
    ctx.resizeByKeyboard(leftIndex, increase ? KEYBOARD_STEP : -KEYBOARD_STEP);
  };

  // line + withIndicator 渲染 drag-dots；pill/handle/drag 自带抓手
  const shouldRenderIndicator = withIndicator || type !== 'line';
  const indicatorType: ResizableIndicatorType =
    type === 'drag' || (type === 'line' && withIndicator) ? 'drag' : 'pill';

  return (
    <div
      id={id}
      role="separator"
      tabIndex={disabled ? undefined : 0}
      aria-label="Resize handle"
      aria-orientation={orientation === 'horizontal' ? 'vertical' : 'horizontal'}
      aria-valuemin={Math.round(meta.minSize)}
      aria-valuemax={Math.round(meta.maxSize)}
      aria-valuenow={valueNow}
      aria-disabled={disabled || undefined}
      data-slot="resizable-handle"
      data-type={type}
      data-variant={variant}
      data-resize-handle-active={isDragging ? '' : undefined}
      data-pressed={isDragging ? 'true' : undefined}
      data-disabled={disabled ? '' : undefined}
      className={clsx(
        'resizable__handle',
        `resizable__handle--${orientation}`,
        `resizable__handle--${type}`,
        `resizable__handle--${variant}`,
        className,
      )}
      style={{ touchAction: 'none', ...style }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {children ?? (shouldRenderIndicator ? <Indicator type={indicatorType} /> : null)}
    </div>
  );
};
Handle.displayName = 'Resizable.Handle';

const Resizable = Object.assign(ResizableRoot, { Panel, Handle, Indicator });

export default Resizable;
