import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';
import { Button, type ButtonProps } from 'react-aria-components';
import clsx from 'clsx';

export type PressableFeedbackSweep = 'right' | 'left' | 'down' | 'up';

export type PressableFeedbackProps = Omit<ButtonProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type PressableFeedbackHighlightProps = HTMLAttributes<HTMLDivElement>;

export type PressableFeedbackRippleProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  /** 波纹扩散动画时长（ms），同时写入 --pressable-feedback-ripple-duration */
  duration?: number;
  hoverOpacity?: number;
  pressedOpacity?: number;
  /** 按压视觉至少保持的时长（ms），快速点击时波纹不至于一闪而过 */
  minimumPressDuration?: number;
  isDisabled?: boolean;
};

export type PressableFeedbackHoldConfirmProps = HTMLAttributes<HTMLDivElement> & {
  duration?: number;
  releaseDuration?: number;
  sweep?: PressableFeedbackSweep;
  resetOnComplete?: boolean;
  isDisabled?: boolean;
  onComplete?: () => void;
};

export type PressableFeedbackProgressFeedbackProps = HTMLAttributes<HTMLDivElement> & {
  duration?: number;
  releaseDuration?: number;
  sweep?: PressableFeedbackSweep;
  autoReset?: boolean;
  resetDelay?: number;
  isDisabled?: boolean;
  onComplete?: () => void;
  onReset?: () => void;
};

/** hover / pressed 高亮层：状态完全由 CSS 依据父元素 :hover/:active 或 data-hovered/data-pressed 驱动 */
const Highlight = forwardRef<HTMLDivElement, PressableFeedbackHighlightProps>(
  ({ className, ...rest }, ref) => (
    <div
      ref={ref}
      aria-hidden="true"
      data-slot="pressable-feedback-highlight"
      className={clsx('pressable-feedback__highlight', className)}
      {...rest}
    />
  ),
);
Highlight.displayName = 'PressableFeedback.Highlight';

/** M3 波纹起点占宿主短边的比例与扩散末态的安全边距（同 material-web ripple） */
const RIPPLE_INITIAL_ORIGIN_SCALE = 0.2;
const RIPPLE_PADDING = 10;
const RIPPLE_EASING = 'cubic-bezier(0.2, 0, 0, 1)';

/**
 * M3 径向波纹层：事件挂在宿主（父元素）上，层本身 pointer-events:none。
 * hover/press 仅切换 surface 的 .--hover/.--press 类（透明度由 CSS 完成），
 * 扩散动画用 WAAPI 作用在 ::after 伪元素上。
 */
const Ripple = ({
  duration: durationProp,
  hoverOpacity,
  pressedOpacity,
  minimumPressDuration = 225,
  isDisabled = false,
  className,
  style,
  ...rest
}: PressableFeedbackRippleProps) => {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const duration = durationProp ?? 150;

  useEffect(() => {
    const surface = surfaceRef.current;
    const host = surface?.parentElement?.parentElement;
    if (!surface || !host || isDisabled) return undefined;

    let growAnimation: Animation | null = null;
    let releaseTimer = 0;
    let pressedAt = 0;

    const handleEnter = () => surface.classList.add('--hover');

    const handleDown = (event: PointerEvent) => {
      window.clearTimeout(releaseTimer);
      pressedAt = performance.now();
      surface.classList.add('--press');

      const rect = host.getBoundingClientRect();
      const initialSize = Math.max(
        Math.floor(Math.max(rect.width, rect.height) * RIPPLE_INITIAL_ORIGIN_SCALE),
        1,
      );
      const endScale = (Math.hypot(rect.width, rect.height) + RIPPLE_PADDING) / initialSize;
      const startX = event.clientX - rect.left - initialSize / 2;
      const startY = event.clientY - rect.top - initialSize / 2;
      const endX = (rect.width - initialSize) / 2;
      const endY = (rect.height - initialSize) / 2;

      growAnimation?.cancel();
      growAnimation = surface.animate(
        {
          top: ['0px', '0px'],
          left: ['0px', '0px'],
          width: [`${initialSize}px`, `${initialSize}px`],
          height: [`${initialSize}px`, `${initialSize}px`],
          transform: [
            `translate(${startX}px, ${startY}px) scale(1)`,
            `translate(${endX}px, ${endY}px) scale(${endScale})`,
          ],
        },
        { pseudoElement: '::after', duration, easing: RIPPLE_EASING, fill: 'forwards' },
      );
    };

    const handleRelease = () => {
      const remaining = Math.max(minimumPressDuration - (performance.now() - pressedAt), 0);
      window.clearTimeout(releaseTimer);
      releaseTimer = window.setTimeout(() => surface.classList.remove('--press'), remaining);
    };

    const handleLeave = () => {
      surface.classList.remove('--hover');
      handleRelease();
    };

    host.addEventListener('pointerenter', handleEnter);
    host.addEventListener('pointerleave', handleLeave);
    host.addEventListener('pointerdown', handleDown);
    host.addEventListener('pointerup', handleRelease);
    host.addEventListener('pointercancel', handleRelease);

    return () => {
      window.clearTimeout(releaseTimer);
      growAnimation?.cancel();
      surface.classList.remove('--hover', '--press');
      host.removeEventListener('pointerenter', handleEnter);
      host.removeEventListener('pointerleave', handleLeave);
      host.removeEventListener('pointerdown', handleDown);
      host.removeEventListener('pointerup', handleRelease);
      host.removeEventListener('pointercancel', handleRelease);
    };
  }, [duration, minimumPressDuration, isDisabled]);

  // 仅在显式传入时写 CSS 变量，静止态 DOM 与原站快照一致（无内联 style）
  const cssVars: Record<string, string | number> = {};
  if (durationProp !== undefined) {
    cssVars['--pressable-feedback-ripple-duration'] = `${durationProp}ms`;
  }
  if (hoverOpacity !== undefined) {
    cssVars['--pressable-feedback-ripple-hover-opacity'] = hoverOpacity;
  }
  if (pressedOpacity !== undefined) {
    cssVars['--pressable-feedback-ripple-pressed-opacity'] = pressedOpacity;
  }
  const mergedStyle =
    Object.keys(cssVars).length > 0 || style !== undefined
      ? ({ ...cssVars, ...style } as CSSProperties)
      : undefined;

  return (
    <div
      aria-hidden="true"
      aria-disabled={isDisabled || undefined}
      className={clsx('pressable-feedback__ripple', className)}
      style={mergedStyle}
      {...rest}
    >
      <div ref={surfaceRef} className="pressable-feedback__ripple-surface" />
    </div>
  );
};
Ripple.displayName = 'PressableFeedback.Ripple';

/**
 * 按住确认层：按住期间 data-holding 触发 CSS clip-path 以 duration 线性扫入；
 * 提前松手按 releaseDuration 回弹；满时长置 data-complete 并回调。
 */
const HoldConfirm = ({
  duration = 2000,
  releaseDuration = 200,
  sweep = 'right',
  resetOnComplete = true,
  isDisabled = false,
  onComplete,
  className,
  style,
  children,
  ...rest
}: PressableFeedbackHoldConfirmProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHolding, setIsHolding] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    const host = ref.current?.parentElement;
    if (!host || isDisabled) return undefined;

    let timer = 0;
    let completed = false;

    const handleDown = () => {
      completed = false;
      setIsComplete(false);
      setIsHolding(true);
      timer = window.setTimeout(() => {
        completed = true;
        setIsHolding(false);
        setIsComplete(true);
        onCompleteRef.current?.();
      }, duration);
    };

    const handleRelease = () => {
      window.clearTimeout(timer);
      setIsHolding(false);
      if (completed && resetOnComplete) {
        completed = false;
        setIsComplete(false);
      }
    };

    host.addEventListener('pointerdown', handleDown);
    host.addEventListener('pointerup', handleRelease);
    host.addEventListener('pointerleave', handleRelease);
    host.addEventListener('pointercancel', handleRelease);

    return () => {
      window.clearTimeout(timer);
      host.removeEventListener('pointerdown', handleDown);
      host.removeEventListener('pointerup', handleRelease);
      host.removeEventListener('pointerleave', handleRelease);
      host.removeEventListener('pointercancel', handleRelease);
    };
  }, [duration, resetOnComplete, isDisabled]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-slot="pressable-feedback-hold-confirm"
      data-sweep={sweep}
      data-holding={isHolding || undefined}
      data-complete={isComplete || undefined}
      className={clsx('pressable-feedback__hold-confirm', className)}
      style={
        {
          ...style,
          '--pressable-feedback-hold-confirm-duration': `${duration}ms`,
          '--pressable-feedback-hold-confirm-release-duration': `${releaseDuration}ms`,
        } as CSSProperties
      }
      {...rest}
    >
      {children}
    </div>
  );
};
HoldConfirm.displayName = 'PressableFeedback.HoldConfirm';

/**
 * 点击进度层：单击后 data-progressing 自动扫入（无需按住），
 * 满 duration 置 data-complete 并回调；autoReset 时 resetDelay 后复位并回调 onReset。
 */
const ProgressFeedback = ({
  duration = 2000,
  releaseDuration = 300,
  sweep = 'right',
  autoReset = true,
  resetDelay = 1500,
  isDisabled = false,
  onComplete,
  onReset,
  className,
  style,
  children,
  ...rest
}: PressableFeedbackProgressFeedbackProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'idle' | 'progressing' | 'complete'>('idle');
  const onCompleteRef = useRef(onComplete);
  const onResetRef = useRef(onReset);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onResetRef.current = onReset;
  });

  useEffect(() => {
    const host = ref.current?.parentElement;
    if (!host || isDisabled) return undefined;

    let completeTimer = 0;
    let resetTimer = 0;
    let isBusy = false;

    const handleClick = () => {
      if (isBusy) return;
      isBusy = true;
      setStatus('progressing');
      completeTimer = window.setTimeout(() => {
        setStatus('complete');
        onCompleteRef.current?.();
        if (autoReset) {
          resetTimer = window.setTimeout(() => {
            isBusy = false;
            setStatus('idle');
            onResetRef.current?.();
          }, resetDelay);
        }
      }, duration);
    };

    host.addEventListener('click', handleClick);

    return () => {
      window.clearTimeout(completeTimer);
      window.clearTimeout(resetTimer);
      host.removeEventListener('click', handleClick);
    };
  }, [duration, autoReset, resetDelay, isDisabled]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-slot="pressable-feedback-progress-feedback"
      data-sweep={sweep}
      data-progressing={status === 'progressing' || undefined}
      data-complete={status === 'complete' || undefined}
      className={clsx('pressable-feedback__progress-feedback', className)}
      style={
        {
          ...style,
          '--pressable-feedback-progress-feedback-duration': `${duration}ms`,
          '--pressable-feedback-progress-feedback-release-duration': `${releaseDuration}ms`,
        } as CSSProperties
      }
      {...rest}
    >
      {children}
    </div>
  );
};
ProgressFeedback.displayName = 'PressableFeedback.ProgressFeedback';

/**
 * 基于 RAC Button 的按压容器：data-hovered / data-pressed / data-focus-visible
 * 与 disabled 属性由 RAC 输出，反馈层与焦点环、禁用态全部由复刻 CSS 接管。
 * 反馈层也可脱离本容器、直接放进任意 position:relative 的宿主元素内使用。
 */
const PressableFeedbackRoot = forwardRef<HTMLButtonElement, PressableFeedbackProps>(
  ({ className, ...rest }, ref) => (
    <Button
      ref={ref}
      data-slot="pressable-feedback"
      className={clsx('pressable-feedback', className)}
      {...rest}
    />
  ),
);
PressableFeedbackRoot.displayName = 'PressableFeedback';

const PressableFeedback = Object.assign(PressableFeedbackRoot, {
  Highlight,
  Ripple,
  HoldConfirm,
  ProgressFeedback,
});

export default PressableFeedback;
