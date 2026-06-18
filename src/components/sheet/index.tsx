'use client';

import {
  createContext,
  useEffect,
  useContext,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import {
  Button,
  Drawer,
  type ButtonProps,
  type DrawerBackdropProps,
  type DrawerCloseTriggerProps,
  type DrawerContentProps,
  type DrawerDialogProps,
  type DrawerHandleProps,
  type DrawerHeadingProps,
  type DrawerRootProps,
} from '@heroui/react';
import { OverlayTriggerStateContext } from 'react-aria-components';
import {
  motion,
  useDragControls,
  useMotionValue,
  type DragControls,
  type PanInfo,
  type Transition,
} from 'motion/react';
import clsx from 'clsx';

export type SheetPlacement = 'top' | 'bottom' | 'left' | 'right';
export type SheetBackdrop = 'opaque' | 'blur' | 'transparent';
export type SheetSnapPoint = number | string;
export type SheetActiveSnapPoint = SheetSnapPoint | null;

/**
 * Root（即 OSS Drawer = RAC DialogTrigger）：管理 isOpen/defaultOpen/onOpenChange 与 trigger 关联、焦点圈定。
 * placement/isDetached 通过 context 下发给 Content/Dialog，使其叠加 `sheet__*` 修饰类与
 * `data-sheet-detached`（v2 双层：底座输出 `drawer__*` 负责模态行为/滑入滑出动画，本层叠加 `sheet__*` 视觉）。
 */
export type SheetProps = Omit<DrawerRootProps, 'className' | 'style'> & {
  placement?: SheetPlacement;
  isDetached?: boolean;
  /** HeroUI Pro-compatible root-level snap points. Dialog-level props are still accepted for older demos. */
  snapPoints?: SheetSnapPoint[];
  /** Root-level controlled snap point value. Numeric values match a snap point first, then fall back to index. */
  activeSnapPoint?: SheetActiveSnapPoint;
  /** Root-level uncontrolled initial snap point value. */
  defaultActiveSnapPoint?: SheetActiveSnapPoint;
  /** Root-level snap point value callback, matching the Pro API shape. */
  onActiveSnapPointChange?: (snapPoint: SheetActiveSnapPoint) => void;
  /** Legacy index callback kept for local callers that already consume indexes. */
  onSnapPointChange?: (index: number) => void;
  /** Fraction of the sheet dimension required before a drag closes the sheet. */
  closeThreshold?: number;
  /** Reference prop retained for API parity; backdrop fade is handled by the Backdrop variant in this implementation. */
  fadeFromIndex?: number;
  /** Enables nested-sheet parent scaling when a child sheet is open. */
  shouldScaleBackground?: boolean;
  onClose?: () => void;
};

export type SheetTriggerProps = Omit<ButtonProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type SheetBackdropProps = Omit<DrawerBackdropProps, 'className' | 'style' | 'variant'> & {
  variant?: SheetBackdrop;
  className?: string;
  style?: CSSProperties;
};

export type SheetContentProps = Omit<DrawerContentProps, 'className' | 'style' | 'placement'> & {
  className?: string;
  style?: CSSProperties;
};

export type SheetDialogProps = Omit<DrawerDialogProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
  /** 多档面板尺寸；bottom/top 作用于 height，left/right 作用于 width */
  snapPoints?: SheetSnapPoint[];
  /** 受控当前 snap point 下标 */
  activeSnapPoint?: number;
  /** 非受控初始 snap point 下标 */
  defaultActiveSnapPoint?: number;
  /** snap point 变化回调；按钮切换与拖拽切换均会触发 */
  onSnapPointChange?: (index: number) => void;
};

export type SheetHeaderProps = HTMLAttributes<HTMLDivElement>;

export type SheetHeadingProps = Omit<DrawerHeadingProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type SheetBodyProps = HTMLAttributes<HTMLDivElement>;

export type SheetFooterProps = HTMLAttributes<HTMLDivElement>;

export type SheetHandleProps = Omit<DrawerHandleProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
  /** 抓手按下回调：本层用它把手势交给 framer-motion 的拖拽关闭（底座 Handle 已透传到底层 div） */
  onPointerDown?: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onClick?: (event: ReactMouseEvent<HTMLDivElement>) => void;
};

export type SheetCloseTriggerProps = Omit<DrawerCloseTriggerProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type SheetCloseProps = Omit<ButtonProps, 'className' | 'style' | 'slot'> & {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

type SheetContextValue = {
  placement: SheetPlacement;
  isDetached: boolean;
  snapPoints?: SheetSnapPoint[];
  activeSnapPoint?: SheetActiveSnapPoint;
  defaultActiveSnapPoint?: SheetActiveSnapPoint;
  onActiveSnapPointChange?: (snapPoint: SheetActiveSnapPoint) => void;
  onSnapPointChange?: (index: number) => void;
  closeThreshold: number;
  shouldScaleBackground: boolean;
  nestedOpen: boolean;
  setNestedOpen?: (isOpen: boolean) => void;
};

const SheetContext = createContext<SheetContextValue>({
  placement: 'bottom',
  isDetached: false,
  closeThreshold: 0.3,
  shouldScaleBackground: true,
  nestedOpen: false,
});

/** Dialog 把 framer-motion 的 dragControls 经 context 下发给 Handle：抓手 pointerdown 即 start 拖拽 */
type SheetDragContextValue = {
  dragControls: DragControls;
  cycleSnapPoint?: () => void;
};

const SheetDragContext = createContext<SheetDragContextValue | null>(null);

/** 位移阈值（占面板对应维度比例）与速度阈值（px/s）：任一超过即判定为关闭手势，对齐目标交互手感 */
const DISMISS_FRACTION = 0.3;
const SNAP_FRACTION = 0.18;
const MIN_SNAP_DISTANCE = 48;
const MAX_SNAP_DISTANCE = 120;
const VELOCITY_THRESHOLD = 500;

/** 弹回/收起的弹簧动画，cubic 近似 `cubic-bezier(0.32, 0.72, 0, 1)` 的速度曲线 */
const SNAP_TRANSITION: Transition = {
  type: 'spring',
  stiffness: 520,
  damping: 44,
  mass: 0.9,
};

/** 各 placement 下的关闭轴向：底/顶为 y，左/右为 x */
const isVerticalPlacement = (placement: SheetPlacement) =>
  placement === 'bottom' || placement === 'top';

/** 关闭方向符号：bottom/right 向正方向滑出，top/left 向负方向滑出 */
const dismissSign = (placement: SheetPlacement) =>
  placement === 'bottom' || placement === 'right' ? 1 : -1;

const clampIndex = (index: number, length: number) =>
  Math.min(Math.max(index, 0), Math.max(length - 1, 0));

const hasSnapPoints = (snapPoints: SheetSnapPoint[] | undefined) =>
  snapPoints !== undefined && snapPoints.length > 0;

const toCssSize = (value: SheetSnapPoint | undefined) =>
  typeof value === 'number' ? `${value}px` : value;

const snapPointToIndex = (
  value: SheetActiveSnapPoint | undefined,
  snapPoints: SheetSnapPoint[],
  fallbackIndex: number,
) => {
  if (value === undefined) return clampIndex(fallbackIndex, snapPoints.length);
  if (value === null) return 0;

  const exactIndex = snapPoints.findIndex((snapPoint) => snapPoint === value);
  if (exactIndex >= 0) return exactIndex;

  return typeof value === 'number' ? clampIndex(value, snapPoints.length) : fallbackIndex;
};

/**
 * Trigger：直接渲染 OSS Button 作为 RAC DialogTrigger（Sheet Root）的触发器。
 * 参考实现快照触发器即 `button button--md`，不经 HeroUI Drawer.Trigger 包裹——后者会再套一层 <button>，
 * 传入 <Button> 子节点会形成 button 嵌套 button 的非法 DOM。
 */
const Trigger = ({ className, ...rest }: SheetTriggerProps) => (
  <Button className={className} {...rest} />
);
Trigger.displayName = 'Sheet.Trigger';

/**
 * Close：OSS Button + RAC slot="close"，在 DialogTrigger 上下文中按下即关闭（自定义关闭按钮，区别于右上角 ×）。
 * 直接渲染 OSS Button（而非再包一层），避免 button 嵌套 button。
 */
const Close = ({ className, children, ...rest }: SheetCloseProps) => (
  <Button data-slot="sheet-close" slot="close" className={className} {...rest}>
    {children}
  </Button>
);
Close.displayName = 'Sheet.Close';

const Backdrop = ({ className, variant = 'opaque', ...rest }: SheetBackdropProps) => (
  <Drawer.Backdrop
    data-slot="sheet-backdrop"
    variant={variant}
    className={clsx('sheet__backdrop', `sheet__backdrop--${variant}`, className)}
    {...rest}
  />
);
Backdrop.displayName = 'Sheet.Backdrop';

const Content = ({ className, ...rest }: SheetContentProps) => {
  const { placement, isDetached } = useContext(SheetContext);

  return (
    <Drawer.Content
      data-slot="sheet-content"
      placement={placement}
      data-sheet-detached={isDetached ? '' : undefined}
      className={clsx('sheet__content', `sheet__content--${placement}`, className)}
      {...rest}
    />
  );
};
Content.displayName = 'Sheet.Content';

/**
 * Dialog：底座 Drawer.Dialog（RAC Dialog，保留 data-slot/焦点圈定/SurfaceContext）外，叠加一层
 * framer-motion 的拖拽关闭引擎。motion.div drag 沿 placement 轴拖动，超过位移/速度阈值则调用 RAC
 * overlayState.close()（即 onOpenChange(false)）随 Content 退场动画一起滑出；不够则 dragSnapToOrigin 弹回。
 * 拦截 motion.div 上的 pointerdown 冒泡，避免触发 Drawer.Dialog 自带的指针拖拽（双引擎冲突）。
 * 拖拽中输出 data-dragging=""，与运行时 data 属性约定一致。
 */
const Dialog = ({
  className,
  children,
  snapPoints,
  activeSnapPoint,
  defaultActiveSnapPoint = 0,
  onSnapPointChange,
  style,
  ...rest
}: SheetDialogProps) => {
  const sheetContext = useContext(SheetContext);
  const {
    placement,
    snapPoints: rootSnapPoints,
    activeSnapPoint: rootActiveSnapPoint,
    defaultActiveSnapPoint: rootDefaultActiveSnapPoint,
    onActiveSnapPointChange,
    onSnapPointChange: onRootSnapPointChange,
    closeThreshold,
    shouldScaleBackground,
    nestedOpen,
  } = sheetContext;
  const overlayState = useContext(OverlayTriggerStateContext);
  const vertical = isVerticalPlacement(placement);
  const sign = dismissSign(placement);
  const resolvedSnapPoints = snapPoints ?? rootSnapPoints ?? [];
  const snapsEnabled = hasSnapPoints(resolvedSnapPoints);
  const [uncontrolledSnapPoint, setUncontrolledSnapPoint] = useState(() =>
    snapsEnabled
      ? snapPointToIndex(
          rootSnapPoints === undefined ? defaultActiveSnapPoint : rootDefaultActiveSnapPoint,
          resolvedSnapPoints,
          defaultActiveSnapPoint,
        )
      : 0,
  );
  const rootSnapControlled = rootSnapPoints !== undefined && rootActiveSnapPoint !== undefined;
  const dialogSnapControlled = activeSnapPoint !== undefined;
  const currentSnapPoint = snapsEnabled
    ? dialogSnapControlled
      ? clampIndex(activeSnapPoint, resolvedSnapPoints.length)
      : rootSnapControlled
        ? snapPointToIndex(rootActiveSnapPoint, resolvedSnapPoints, uncontrolledSnapPoint)
        : clampIndex(uncontrolledSnapPoint, resolvedSnapPoints.length)
    : 0;
  const currentSnapValue = snapsEnabled ? resolvedSnapPoints[currentSnapPoint] : undefined;
  const currentSnapSize = toCssSize(currentSnapValue);
  const snapStyle: CSSProperties | undefined =
    currentSnapSize === undefined
      ? undefined
      : vertical
        ? { height: currentSnapSize }
        : { width: currentSnapSize };

  // 仅由 Handle 触发拖拽（dragListener=false）：抓手是唯一抓手，body 滚动不被劫持
  const dragControls = useDragControls();
  // 沿关闭轴的位移 motion value，弹回时由 dragSnapToOrigin 复位
  const offset = useMotionValue(0);
  const surfaceRef = useRef<HTMLDivElement | null>(null);

  const setDragging = (next: boolean) => {
    const el = surfaceRef.current;
    if (!el) return;
    if (next) el.setAttribute('data-dragging', '');
    else el.removeAttribute('data-dragging');
  };

  const handleDragStart = () => setDragging(true);

  const setSnapPoint = (index: number) => {
    if (!snapsEnabled) return;
    const nextIndex = clampIndex(index, resolvedSnapPoints.length);
    const nextSnapPoint = resolvedSnapPoints[nextIndex] ?? null;

    if (!dialogSnapControlled && !rootSnapControlled) setUncontrolledSnapPoint(nextIndex);
    if (nextIndex !== currentSnapPoint) {
      onSnapPointChange?.(nextIndex);
      onRootSnapPointChange?.(nextIndex);
      onActiveSnapPointChange?.(nextSnapPoint);
    }
  };

  const cycleSnapPoint = () => {
    if (!snapsEnabled) return;
    setSnapPoint((currentSnapPoint + 1) % resolvedSnapPoints.length);
  };

  const handleDragEnd = (_event: unknown, info: PanInfo) => {
    setDragging(false);
    const el = surfaceRef.current;
    const travel = vertical ? info.offset.y : info.offset.x;
    const speed = vertical ? info.velocity.y : info.velocity.x;
    // 仅朝关闭方向的位移/速度才计入；反向（橡皮筋回弹方向）不触发关闭
    const directedTravel = travel * sign;
    const directedSpeed = speed * sign;
    const dimension = el ? (vertical ? el.offsetHeight : el.offsetWidth) : 0;
    const snapDistance = Math.min(
      Math.max(dimension * SNAP_FRACTION, MIN_SNAP_DISTANCE),
      MAX_SNAP_DISTANCE,
    );

    if (snapsEnabled) {
      if (
        (directedTravel > snapDistance || directedSpeed > VELOCITY_THRESHOLD) &&
        currentSnapPoint > 0
      ) {
        setSnapPoint(currentSnapPoint - 1);
        return;
      }

      if (
        (-directedTravel > snapDistance || -directedSpeed > VELOCITY_THRESHOLD) &&
        currentSnapPoint < resolvedSnapPoints.length - 1
      ) {
        setSnapPoint(currentSnapPoint + 1);
        return;
      }
    }

    const shouldDismiss =
      directedTravel > dimension * closeThreshold || directedSpeed > VELOCITY_THRESHOLD;

    if (shouldDismiss && overlayState) {
      overlayState.close();
    }
    // 不关闭时：dragSnapToOrigin 自动把 offset 弹回 0
  };

  return (
    <SheetDragContext.Provider value={{ dragControls, cycleSnapPoint }}>
      {/*
       * motion.div 作为 .drawer__content 的 flex 子项「包住」整块面板（Drawer.Dialog），
       * drag 的 transform 平移整块面板的视觉盒（背景/圆角/阴影都在内层 .drawer__dialog 上）。
       * 与 RAC 进出场用的 CSS `translate`（drawer.css）属于不同属性、互不覆盖。
       */}
      <motion.div
        ref={surfaceRef}
        data-slot="sheet-drag-surface"
        data-sheet-snap-points={snapsEnabled ? 'true' : undefined}
        data-sheet-snap-index={snapsEnabled ? currentSnapPoint : undefined}
        drag={vertical ? 'y' : 'x'}
        dragControls={dragControls}
        dragListener={false}
        dragSnapToOrigin
        dragElastic={{
          // 关闭方向自由拖动（1）；反方向加橡皮筋阻尼（0.12），与 clamp 后的边界手感一致
          top: vertical ? (sign > 0 ? 0.12 : 1) : 0,
          bottom: vertical ? (sign > 0 ? 1 : 0.12) : 0,
          left: vertical ? 0 : sign > 0 ? 0.12 : 1,
          right: vertical ? 0 : sign > 0 ? 1 : 0.12,
        }}
        dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
        dragTransition={{ bounceStiffness: 520, bounceDamping: 44 }}
        dragMomentum={false}
        style={{
          display: 'flex',
          flexDirection: 'column',
          ...(vertical
            ? { flex: 'auto', minHeight: 0, width: '100%', y: offset }
            : { height: '100%', minWidth: 0, x: offset }),
        }}
        transition={SNAP_TRANSITION}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={clsx('sheet__drag-surface', `sheet__drag-surface--${placement}`)}
      >
        <Drawer.Dialog
          data-slot="sheet-dialog"
          data-sheet-snap-points={snapsEnabled ? 'true' : undefined}
          data-sheet-snap-index={snapsEnabled ? currentSnapPoint : undefined}
          data-sheet-snap-point={snapsEnabled ? String(currentSnapValue) : undefined}
          data-sheet-nested-open={shouldScaleBackground && nestedOpen ? '' : undefined}
          className={clsx('sheet__dialog', `sheet__dialog--${placement}`, className)}
          style={{ ...style, ...snapStyle }}
          {...rest}
        >
          {children}
        </Drawer.Dialog>
      </motion.div>
    </SheetDragContext.Provider>
  );
};
Dialog.displayName = 'Sheet.Dialog';

const Header = ({ className, ...rest }: SheetHeaderProps) => (
  <Drawer.Header data-slot="sheet-header" className={clsx('sheet__header', className)} {...rest} />
);
Header.displayName = 'Sheet.Header';

const Heading = ({ className, ...rest }: SheetHeadingProps) => (
  <Drawer.Heading
    data-slot="sheet-heading"
    className={clsx('sheet__heading', className)}
    {...rest}
  />
);
Heading.displayName = 'Sheet.Heading';

const Body = ({ className, ...rest }: SheetBodyProps) => (
  <Drawer.Body data-slot="sheet-body" className={clsx('sheet__body', className)} {...rest} />
);
Body.displayName = 'Sheet.Body';

const Footer = ({ className, ...rest }: SheetFooterProps) => (
  <Drawer.Footer data-slot="sheet-footer" className={clsx('sheet__footer', className)} {...rest} />
);
Footer.displayName = 'Sheet.Footer';

/**
 * 拖拽手柄：底座 Handle 自带内嵌 bar（drawer.css 已渲染为可见药丸）；本层叠加 sheet__handle 视觉。
 * 抓手上的 pointerdown 桥接到 Dialog 的 framer-motion drag，使「抓手按下即可向下拖拽关闭」。
 */
const Handle = ({ className, onPointerDown, onClick, ...rest }: SheetHandleProps) => {
  const dragContext = useContext(SheetDragContext);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    onPointerDown?.(event);
    // 抓手按下即把手势交给 Dialog 的 framer-motion 拖拽（dragListener=false 时唯一入口）
    dragContext?.dragControls.start(event);
    // 阻止冒泡到 Drawer.Dialog 自带的指针拖拽 onPointerDown，避免 CSS transform 与 motion 双引擎冲突
    event.stopPropagation();
  };

  const handleClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) dragContext?.cycleSnapPoint?.();
  };

  return (
    <Drawer.Handle
      data-slot="sheet-handle"
      className={clsx('sheet__handle', className)}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      {...rest}
    />
  );
};
Handle.displayName = 'Sheet.Handle';

const CloseTrigger = ({ className, ...rest }: SheetCloseTriggerProps) => (
  <Drawer.CloseTrigger
    data-slot="sheet-close-trigger"
    className={clsx('sheet__close-trigger', className)}
    {...rest}
  />
);
CloseTrigger.displayName = 'Sheet.CloseTrigger';

/**
 * 基于 @heroui/react Drawer（RAC DialogTrigger/ModalOverlay/Modal/Dialog）的底部滑出面板（参考 API）：
 * 按钮打开 → Esc/遮罩/关闭按钮关闭 → 焦点圈定由底座提供；拖拽关闭（drag-to-dismiss）由本层
 * framer-motion 在 Sheet.Dialog 上接入：手柄向关闭方向拖动，超过位移/速度阈值即关闭，否则弹回。
 * placement（底/顶/左/右）与 isDetached 经 context 下发到 Content/Dialog 叠加 `sheet__*` 修饰类。
 */
const SheetRoot = ({
  placement = 'bottom',
  isDetached = false,
  children,
  snapPoints,
  activeSnapPoint,
  defaultActiveSnapPoint,
  onActiveSnapPointChange,
  onSnapPointChange,
  closeThreshold = DISMISS_FRACTION,
  shouldScaleBackground = true,
  onClose,
  onOpenChange,
  ...rest
}: SheetProps) => {
  const [nestedOpen, setNestedOpen] = useState(false);
  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange?.(nextOpen);
    if (!nextOpen) onClose?.();
  };

  return (
    <SheetContext.Provider
      value={{
        placement,
        isDetached,
        snapPoints,
        activeSnapPoint,
        defaultActiveSnapPoint,
        onActiveSnapPointChange,
        onSnapPointChange,
        closeThreshold,
        shouldScaleBackground,
        nestedOpen,
        setNestedOpen,
      }}
    >
      <Drawer data-slot="sheet" onOpenChange={handleOpenChange} {...rest}>
        {children}
      </Drawer>
    </SheetContext.Provider>
  );
};
SheetRoot.displayName = 'Sheet';

/**
 * 嵌套 sheet（参考实现 Sheet.NestedRoot）：放在另一个 Sheet 内部，复用同样的 placement/detached 下发逻辑。
 * 底座无独立嵌套 root，这里以新的 DialogTrigger 形成第二层模态，父层 sheet 仍保持打开。
 */
const NestedRoot = ({
  placement = 'bottom',
  isDetached = false,
  children,
  snapPoints,
  activeSnapPoint,
  defaultActiveSnapPoint,
  onActiveSnapPointChange,
  onSnapPointChange,
  closeThreshold = DISMISS_FRACTION,
  shouldScaleBackground = true,
  onClose,
  onOpenChange,
  isOpen,
  ...rest
}: SheetProps) => {
  const { setNestedOpen } = useContext(SheetContext);

  useEffect(() => {
    if (isOpen === undefined) return undefined;
    setNestedOpen?.(isOpen);
    return () => setNestedOpen?.(false);
  }, [isOpen, setNestedOpen]);

  const handleOpenChange = (nextOpen: boolean) => {
    setNestedOpen?.(nextOpen);
    onOpenChange?.(nextOpen);
    if (!nextOpen) onClose?.();
  };

  return (
    <SheetContext.Provider
      value={{
        placement,
        isDetached,
        snapPoints,
        activeSnapPoint,
        defaultActiveSnapPoint,
        onActiveSnapPointChange,
        onSnapPointChange,
        closeThreshold,
        shouldScaleBackground,
        nestedOpen: false,
      }}
    >
      <Drawer data-slot="sheet-nested" isOpen={isOpen} onOpenChange={handleOpenChange} {...rest}>
        {children}
      </Drawer>
    </SheetContext.Provider>
  );
};
NestedRoot.displayName = 'Sheet.NestedRoot';

const Sheet = Object.assign(SheetRoot, {
  Trigger,
  Close,
  Backdrop,
  Content,
  Dialog,
  Header,
  Heading,
  Body,
  Footer,
  Handle,
  CloseTrigger,
  NestedRoot,
});

export default Sheet;
