import {
  createContext,
  useContext,
  type CSSProperties,
  type HTMLAttributes,
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
import clsx from 'clsx';

export type SheetPlacement = 'top' | 'bottom' | 'left' | 'right';
export type SheetBackdrop = 'opaque' | 'blur' | 'transparent';

/**
 * Root（即 OSS Drawer = RAC DialogTrigger）：管理 isOpen/defaultOpen/onOpenChange 与 trigger 关联、焦点圈定。
 * placement/isDetached 通过 context 下发给 Content/Dialog，使其叠加 `sheet__*--{placement}` 修饰类与
 * `data-sheet-detached`（v2 双层：底座输出 `drawer__*` 负责模态行为/滑入滑出动画，本层叠加 `sheet__*` 视觉）。
 */
export type SheetProps = Omit<DrawerRootProps, 'className' | 'style'> & {
  placement?: SheetPlacement;
  isDetached?: boolean;
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
};

const SheetContext = createContext<SheetContextValue>({ placement: 'bottom', isDetached: false });

/**
 * Trigger：直接渲染 OSS Button 作为 RAC DialogTrigger（Sheet Root）的触发器。
 * 原站快照触发器即 `button button--md`，不经 HeroUI Drawer.Trigger 包裹——后者会再套一层 <button>，
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

const Dialog = ({ className, ...rest }: SheetDialogProps) => {
  const { placement } = useContext(SheetContext);

  return (
    <Drawer.Dialog
      data-slot="sheet-dialog"
      className={clsx('sheet__dialog', `sheet__dialog--${placement}`, className)}
      {...rest}
    />
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

/** 拖拽手柄：底座 Handle 自带内嵌 bar（drawer.css 已渲染为可见药丸）；本层叠加 sheet__handle 视觉 */
const Handle = ({ className, ...rest }: SheetHandleProps) => (
  <Drawer.Handle data-slot="sheet-handle" className={clsx('sheet__handle', className)} {...rest} />
);
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
 * 基于 @heroui/react Drawer（RAC DialogTrigger/ModalOverlay/Modal/Dialog）的底部滑出面板（原站 API）：
 * 按钮打开 → Esc/遮罩/关闭按钮关闭 → 焦点圈定，拖拽手柄拖拽关闭均由底座提供；
 * placement（底/顶/左/右）与 isDetached 经 context 下发到 Content/Dialog 叠加 `sheet__*` 修饰类。
 */
const SheetRoot = ({ placement = 'bottom', isDetached = false, children, ...rest }: SheetProps) => (
  <SheetContext.Provider value={{ placement, isDetached }}>
    <Drawer data-slot="sheet" {...rest}>
      {children}
    </Drawer>
  </SheetContext.Provider>
);
SheetRoot.displayName = 'Sheet';

/**
 * 嵌套 sheet（原站 Sheet.NestedRoot）：放在另一个 Sheet 内部，复用同样的 placement/detached 下发逻辑。
 * 底座无独立嵌套 root，这里以新的 DialogTrigger 形成第二层模态，父层 sheet 仍保持打开。
 */
const NestedRoot = ({ placement = 'bottom', isDetached = false, children, ...rest }: SheetProps) => (
  <SheetContext.Provider value={{ placement, isDetached }}>
    <Drawer data-slot="sheet-nested" {...rest}>
      {children}
    </Drawer>
  </SheetContext.Provider>
);
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
