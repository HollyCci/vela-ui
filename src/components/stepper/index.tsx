'use client';

import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useMemo,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type LiHTMLAttributes,
  type OlHTMLAttributes,
  type ReactNode,
} from 'react';
import clsx from 'clsx';

export type StepperOrientation = 'horizontal' | 'vertical';
export type StepperSize = 'sm' | 'md' | 'lg';
export type StepperStepStatus = 'inactive' | 'active' | 'complete';

export type StepperProps = OlHTMLAttributes<HTMLOListElement> & {
  orientation?: StepperOrientation;
  size?: StepperSize;
  /** 当前步骤下标（受控，从 0 开始） */
  currentStep?: number;
  /** 初始步骤下标（非受控） */
  defaultStep?: number;
  /** 提供后步骤可点击（data-clickable），点击回调被点步骤下标 */
  onStepChange?: (step: number) => void;
};

export type StepperStepProps = LiHTMLAttributes<HTMLLIElement>;
export type StepperIndicatorProps = HTMLAttributes<HTMLSpanElement>;
export type StepperIconProps = HTMLAttributes<HTMLSpanElement>;
export type StepperContentProps = HTMLAttributes<HTMLSpanElement>;
export type StepperTitleProps = HTMLAttributes<HTMLSpanElement>;
export type StepperDescriptionProps = HTMLAttributes<HTMLSpanElement>;

export type StepperSeparatorProps = HTMLAttributes<HTMLDivElement> & {
  /** 显式进度（0-1）；缺省时由所属步骤是否完成自动推导 */
  progress?: number;
  /** 末步默认不渲染连接线，force 可强制渲染 */
  force?: boolean;
};

type StepperContextValue = {
  orientation: StepperOrientation;
  size: StepperSize;
  currentStep: number;
  stepCount: number;
  isInteractive: boolean;
  onStepSelect: (index: number) => void;
};

const noop = () => undefined;

const StepperContext = createContext<StepperContextValue>({
  orientation: 'horizontal',
  size: 'md',
  currentStep: 0,
  stepCount: 0,
  isInteractive: false,
  onStepSelect: noop,
});

/** 步骤下标由 Root 按 children 顺序注入（参考实现 li 上的 data-index） */
const StepIndexContext = createContext(0);

export type StepperStepContextValue = {
  index: number;
  status: StepperStepStatus;
  isLast: boolean;
};

const StepContext = createContext<StepperStepContextValue>({
  index: 0,
  status: 'inactive',
  isLast: false,
});

/** 参考 API：在 Stepper.Step 的任意后代中读取步骤状态 */
export const useStepperStep = (): StepperStepContextValue => useContext(StepContext);

/** 默认完成态对勾（属性与参考实现快照逐字一致，尺寸/动画由 CSS 接管） */
const DefaultCheckmark = () => (
  <svg
    data-slot="stepper-default-checkmark"
    viewBox="0 0 17 18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    role="presentation"
    aria-hidden="true"
  >
    <polyline points="1 9 7 14 15 4" />
  </svg>
);
DefaultCheckmark.displayName = 'Stepper.DefaultCheckmark';

const Icon = forwardRef<HTMLSpanElement, StepperIconProps>(({ className, ...rest }, ref) => (
  <span ref={ref} data-slot="stepper-icon" className={clsx('stepper__icon', className)} {...rest} />
));
Icon.displayName = 'Stepper.Icon';

const Indicator = forwardRef<HTMLSpanElement, StepperIndicatorProps>(
  ({ className, children, ...rest }, ref) => {
    const { size } = useContext(StepperContext);
    const { index, status } = useContext(StepContext);

    // 默认内容：完成态为对勾，其余为 1 开始的序号；children 可整体覆盖
    let content: ReactNode;
    if (children !== undefined && children !== null) {
      content = children;
    } else if (status === 'complete') {
      content = (
        <Icon>
          <DefaultCheckmark />
        </Icon>
      );
    } else {
      content = <span>{index + 1}</span>;
    }

    return (
      <span
        ref={ref}
        data-slot="stepper-indicator"
        data-status={status}
        className={clsx('stepper__indicator', `stepper__indicator--${size}`, className)}
        {...rest}
      >
        {content}
      </span>
    );
  },
);
Indicator.displayName = 'Stepper.Indicator';

const Content = forwardRef<HTMLSpanElement, StepperContentProps>(({ className, ...rest }, ref) => {
  const { orientation } = useContext(StepperContext);

  return (
    <span
      ref={ref}
      data-slot="stepper-content"
      className={clsx('stepper__content', `stepper__content--${orientation}`, className)}
      {...rest}
    />
  );
});
Content.displayName = 'Stepper.Content';

const Title = forwardRef<HTMLSpanElement, StepperTitleProps>(({ className, ...rest }, ref) => {
  const { size } = useContext(StepperContext);

  return (
    <span
      ref={ref}
      data-slot="stepper-title"
      className={clsx('stepper__title', `stepper__title--${size}`, className)}
      {...rest}
    />
  );
});
Title.displayName = 'Stepper.Title';

const Description = forwardRef<HTMLSpanElement, StepperDescriptionProps>(
  ({ className, ...rest }, ref) => {
    const { size } = useContext(StepperContext);

    return (
      <span
        ref={ref}
        data-slot="stepper-description"
        className={clsx('stepper__description', `stepper__description--${size}`, className)}
        {...rest}
      />
    );
  },
);
Description.displayName = 'Stepper.Description';

const Separator = forwardRef<HTMLDivElement, StepperSeparatorProps>(
  ({ progress, force = false, className, ...rest }, ref) => {
    const { orientation } = useContext(StepperContext);
    const { status, isLast } = useContext(StepContext);

    if (isLast && !force) return null;

    const resolvedProgress = progress ?? (status === 'complete' ? 1 : 0);
    const fillStyle = { '--stepper-separator-progress': resolvedProgress } as CSSProperties;

    return (
      <div
        ref={ref}
        aria-hidden="true"
        data-slot="stepper-separator"
        className={clsx('stepper__separator', `stepper__separator--${orientation}`, className)}
        {...rest}
      >
        <div
          data-slot="stepper-separator-track"
          data-complete={resolvedProgress >= 1 ? 'true' : undefined}
          className={clsx('stepper__separator-track', `stepper__separator-track--${orientation}`)}
        >
          <div
            data-slot="stepper-separator-fill"
            className={clsx('stepper__separator-fill', `stepper__separator-fill--${orientation}`)}
            style={fillStyle}
          />
        </div>
      </div>
    );
  },
);
Separator.displayName = 'Stepper.Separator';

const Step = forwardRef<HTMLLIElement, StepperStepProps>(
  ({ className, children, ...rest }, ref) => {
    const { orientation, currentStep, stepCount, isInteractive, onStepSelect } =
      useContext(StepperContext);
    const index = useContext(StepIndexContext);

    const status: StepperStepStatus =
      index < currentStep ? 'complete' : index === currentStep ? 'active' : 'inactive';
    const isLast = index === stepCount - 1;

    const stepContextValue = useMemo<StepperStepContextValue>(
      () => ({ index, status, isLast }),
      [index, status, isLast],
    );

    // 基准 DOM 里 Separator 是 step-button 的兄弟节点：把子级中的 Separator 拆出按钮，
    // 未显式提供时自动补一条（末步由 Separator 自身判定不渲染）
    const childArray = Children.toArray(children);
    const separatorChildren = childArray.filter(
      (child) => isValidElement(child) && child.type === Separator,
    );
    const buttonChildren = childArray.filter(
      (child) => !(isValidElement(child) && child.type === Separator),
    );

    const handleClick = () => onStepSelect(index);
    const stepButtonContent = <>{buttonChildren}</>;

    return (
      <StepContext.Provider value={stepContextValue}>
        <li
          ref={ref}
          data-slot="stepper-step"
          data-index={index}
          data-status={status}
          className={clsx('stepper__step', `stepper__step--${orientation}`, className)}
          {...rest}
        >
          {isInteractive ? (
            <button
              type="button"
              data-slot="stepper-step-button"
              data-clickable="true"
              aria-current={status === 'active' ? 'step' : undefined}
              className={clsx('stepper__step-button', `stepper__step-button--${orientation}`)}
              onClick={handleClick}
            >
              {stepButtonContent}
            </button>
          ) : (
            <span
              data-slot="stepper-step-button"
              aria-current={status === 'active' ? 'step' : undefined}
              className={clsx('stepper__step-button', `stepper__step-button--${orientation}`)}
            >
              {stepButtonContent}
            </span>
          )}
          {separatorChildren.length > 0 ? separatorChildren : <Separator />}
        </li>
      </StepContext.Provider>
    );
  },
);
Step.displayName = 'Stepper.Step';

const StepperRoot = forwardRef<HTMLOListElement, StepperProps>(
  (
    {
      orientation = 'horizontal',
      size = 'md',
      currentStep,
      defaultStep = 0,
      onStepChange,
      'aria-label': ariaLabel = 'Progress',
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const [internalStep, setInternalStep] = useState(defaultStep);
    const activeStep = currentStep ?? internalStep;
    const items = Children.toArray(children);
    const stepCount = items.length;
    const isInteractive = onStepChange !== undefined;

    const handleStepSelect = (index: number) => {
      if (currentStep === undefined) setInternalStep(index);
      onStepChange?.(index);
    };

    const contextValue: StepperContextValue = {
      orientation,
      size,
      currentStep: activeStep,
      stepCount,
      isInteractive,
      onStepSelect: handleStepSelect,
    };

    return (
      <StepperContext.Provider value={contextValue}>
        <ol
          ref={ref}
          aria-label={ariaLabel}
          data-slot="stepper"
          className={clsx('stepper', `stepper--${orientation}`, `stepper--${size}`, className)}
          {...rest}
        >
          {items.map((child, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <StepIndexContext.Provider key={index} value={index}>
              {child}
            </StepIndexContext.Provider>
          ))}
        </ol>
      </StepperContext.Provider>
    );
  },
);
StepperRoot.displayName = 'Stepper';

const Stepper = Object.assign(StepperRoot, {
  Step,
  Indicator,
  Icon,
  Title,
  Description,
  Content,
  Separator,
});

export default Stepper;
