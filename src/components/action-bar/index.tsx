'use client';

import { useEffect, useState, forwardRef, type AnimationEvent, type HTMLAttributes } from 'react';
import { Toolbar, type ToolbarProps } from '@heroui/react';
import clsx from 'clsx';

export type ActionBarProps = Omit<ToolbarProps, 'className'> & {
  /** 控制显隐，带进出场动画（参考 API 为必填） */
  isOpen: boolean;
  /** 追加到 toolbar wrapper 上的类名（与参考 API 一致） */
  className?: string;
};

export type ActionBarSectionProps = HTMLAttributes<HTMLDivElement>;
type SectionProps = ActionBarSectionProps;

/** 进场/退场动画类（tw-animate-css），与参考实现「animates in/out based on isOpen」行为对齐 */
const ENTER_MOTION = 'animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-200';
const EXIT_MOTION =
  'animate-out fade-out-0 zoom-out-95 slide-out-to-bottom-4 duration-200 fill-mode-forwards';

/**
 * tw-animate-css 的 animate-out 走 @keyframes exit，animate-in 走 @keyframes enter，
 * 据此识别真正的退场动画结束（而非进场或子元素动画冒泡）。
 */
const EXIT_ANIMATION_NAME = 'exit';

/** 退场卸载兜底：动画被节流或禁用（如系统减弱动态效果）时 animationend 不可靠 */
const EXIT_FALLBACK_MS = 300;

/**
 * 基于 @heroui/react Toolbar 的浮动操作条。
 * Root 扩展 ToolbarProps（aria-label 默认 "Actions"，isAttached 默认 true），
 * 退场动画结束后再卸载 DOM。
 */
const ActionBarRoot = forwardRef<HTMLDivElement, ActionBarProps>((
  {
    isOpen,
    isAttached = true,
    'aria-label': ariaLabel = 'Actions',
    className,
    children,
    ...rest
  },
  ref,
) => {
  const [isPresent, setIsPresent] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setIsPresent(true);
      return undefined;
    }
    const timer = setTimeout(() => setIsPresent(false), EXIT_FALLBACK_MS);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleAnimationEnd = (e: AnimationEvent<HTMLDivElement>) => {
    // animationend 挂在带动画的内层 wrapper（Toolbar）上：动画直接跑在它自身，
    // 故只接受 e.target===e.currentTarget（wrapper 自己），忽略子元素冒泡上来的 animationend。
    if (e.target !== e.currentTarget) return;
    // 仅退场动画（@keyframes exit）结束才卸载，进场动画的 animationend 不触发卸载。
    if (!isOpen && e.animationName === EXIT_ANIMATION_NAME) setIsPresent(false);
  };

  if (!isPresent) return null;

  return (
    <div ref={ref} className="action-bar" data-state={isOpen ? 'open' : 'closed'}>
      <Toolbar
        aria-label={ariaLabel}
        isAttached={isAttached}
        className={clsx('action-bar__wrapper', isOpen ? ENTER_MOTION : EXIT_MOTION, className)}
        {...rest}
        onAnimationEnd={handleAnimationEnd}
      >
        {children}
      </Toolbar>
    </div>
  );
});

ActionBarRoot.displayName = 'ActionBar';

const Prefix = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('action-bar__prefix', className)} {...rest} />
));
Prefix.displayName = 'ActionBar.Prefix';

const Content = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('action-bar__content', className)} {...rest} />
));
Content.displayName = 'ActionBar.Content';

const Suffix = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('action-bar__suffix', className)} {...rest} />
));
Suffix.displayName = 'ActionBar.Suffix';

export type ActionBarLabelProps = HTMLAttributes<HTMLSpanElement>;

const Label = forwardRef<HTMLSpanElement, ActionBarLabelProps>(({ className, ...rest }, ref) => (
  <span ref={ref} className={clsx('action-bar__label', className)} {...rest} />
));
Label.displayName = 'ActionBar.Label';

const ActionBar = Object.assign(ActionBarRoot, { Prefix, Content, Suffix, Label });

export default ActionBar;
