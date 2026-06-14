'use client';

import type { CSSProperties, HTMLAttributes } from 'react';
import {
  AlertDialog as HeroAlertDialog,
  type AlertDialogBackdropProps as HeroAlertDialogBackdropProps,
  type AlertDialogCloseTriggerProps as HeroAlertDialogCloseTriggerProps,
  type AlertDialogContainerProps as HeroAlertDialogContainerProps,
  type AlertDialogDialogProps as HeroAlertDialogDialogProps,
  type AlertDialogHeadingProps as HeroAlertDialogHeadingProps,
  type AlertDialogRootProps as HeroAlertDialogRootProps,
  type AlertDialogTriggerProps as HeroAlertDialogTriggerProps,
} from '@heroui/react';

export type AlertDialogSize = NonNullable<HeroAlertDialogContainerProps['size']>;
export type AlertDialogPlacement = NonNullable<HeroAlertDialogContainerProps['placement']>;
export type AlertDialogBackdropVariant = NonNullable<HeroAlertDialogBackdropProps['variant']>;
export type AlertDialogIconStatus = 'default' | 'accent' | 'success' | 'warning' | 'danger';

/** Root 即 RAC DialogTrigger：不渲染 DOM，负责 isOpen/defaultOpen/onOpenChange 与 trigger 关联 */
export type AlertDialogProps = HeroAlertDialogRootProps;

export type AlertDialogTriggerProps = HeroAlertDialogTriggerProps;

export type AlertDialogBackdropProps = Omit<HeroAlertDialogBackdropProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

/** 底座类型已剔除 style（与 Backdrop 共有的 ModalOverlay props 被 Omit），只收窄 className */
export type AlertDialogContainerProps = Omit<HeroAlertDialogContainerProps, 'className'> & {
  className?: string;
};

export type AlertDialogDialogProps = HeroAlertDialogDialogProps;

export type AlertDialogHeaderProps = HTMLAttributes<HTMLDivElement>;

export type AlertDialogHeadingProps = HeroAlertDialogHeadingProps;

export type AlertDialogBodyProps = HTMLAttributes<HTMLDivElement>;

export type AlertDialogFooterProps = HTMLAttributes<HTMLDivElement>;

export type AlertDialogIconProps = HTMLAttributes<HTMLDivElement> & {
  /** 语义状态，决定底色与缺省图标（底座默认 danger） */
  status?: AlertDialogIconStatus;
};

export type AlertDialogCloseTriggerProps = Omit<
  HeroAlertDialogCloseTriggerProps,
  'className' | 'style'
> & {
  className?: string;
  style?: CSSProperties;
};

const AlertDialogRoot = (props: AlertDialogProps) => <HeroAlertDialog {...props} />;
AlertDialogRoot.displayName = 'AlertDialog';

const Trigger = (props: AlertDialogTriggerProps) => <HeroAlertDialog.Trigger {...props} />;
Trigger.displayName = 'AlertDialog.Trigger';

/** 底座默认 isDismissable=false、isKeyboardDismissDisabled=true（警示框需显式操作关闭） */
const Backdrop = ({ className, style, ...rest }: AlertDialogBackdropProps) => (
  <HeroAlertDialog.Backdrop className={className} style={style} {...rest} />
);
Backdrop.displayName = 'AlertDialog.Backdrop';

const Container = ({ className, ...rest }: AlertDialogContainerProps) => (
  <HeroAlertDialog.Container className={className} {...rest} />
);
Container.displayName = 'AlertDialog.Container';

const Dialog = (props: AlertDialogDialogProps) => <HeroAlertDialog.Dialog {...props} />;
Dialog.displayName = 'AlertDialog.Dialog';

const Header = (props: AlertDialogHeaderProps) => <HeroAlertDialog.Header {...props} />;
Header.displayName = 'AlertDialog.Header';

const Heading = (props: AlertDialogHeadingProps) => <HeroAlertDialog.Heading {...props} />;
Heading.displayName = 'AlertDialog.Heading';

const Body = (props: AlertDialogBodyProps) => <HeroAlertDialog.Body {...props} />;
Body.displayName = 'AlertDialog.Body';

const Footer = (props: AlertDialogFooterProps) => <HeroAlertDialog.Footer {...props} />;
Footer.displayName = 'AlertDialog.Footer';

const Icon = (props: AlertDialogIconProps) => <HeroAlertDialog.Icon {...props} />;
Icon.displayName = 'AlertDialog.Icon';

const CloseTrigger = ({ className, style, ...rest }: AlertDialogCloseTriggerProps) => (
  <HeroAlertDialog.CloseTrigger className={className} style={style} {...rest} />
);
CloseTrigger.displayName = 'AlertDialog.CloseTrigger';

/**
 * 基于 @heroui/react AlertDialog 的警示对话框（原站 API）：
 * trigger 打开、焦点圈定、Esc/遮罩关闭策略均由底座（RAC DialogTrigger/ModalOverlay/Modal/Dialog）提供，
 * BEM 类名（alert-dialog__backdrop/container/dialog/...）由底座 variants 输出，天然对齐原站 CSS。
 */
const AlertDialog = Object.assign(AlertDialogRoot, {
  Trigger,
  Backdrop,
  Container,
  Dialog,
  Header,
  Heading,
  Body,
  Footer,
  Icon,
  CloseTrigger,
});

export default AlertDialog;
