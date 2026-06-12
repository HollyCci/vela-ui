import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

export type StepperOrientation = 'horizontal' | 'vertical';
export type StepperSize = 'sm' | 'md' | 'lg';
export type StepStatus = 'complete' | 'active' | 'inactive';

export type StepItem = {
  title: ReactNode;
  description?: ReactNode;
};

export type StepperProps = HTMLAttributes<HTMLOListElement> & {
  steps: StepItem[];
  /** 当前步骤下标（从 0 开始）；之前的步骤视为已完成 */
  currentStep: number;
  orientation?: StepperOrientation;
  size?: StepperSize;
};

const CheckmarkIcon = () => (
  <svg
    data-slot="stepper-default-checkmark"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    aria-hidden="true"
  >
    <path d="M4 12.5l5.5 5.5L20 6.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type StepProps = {
  step: StepItem;
  index: number;
  status: StepStatus;
  isLast: boolean;
  orientation: StepperOrientation;
  size: StepperSize;
};

const Step = ({ step, index, status, isLast, orientation, size }: StepProps) => {
  const separatorProgress = {
    '--stepper-separator-progress': status === 'complete' ? 1 : 0,
  } as CSSProperties;

  return (
    <li
      className={clsx('stepper__step', `stepper__step--${orientation}`)}
      data-status={status}
      aria-current={status === 'active' ? 'step' : undefined}
    >
      {!isLast && (
        <span
          className={clsx('stepper__separator', `stepper__separator--${orientation}`)}
          aria-hidden="true"
        >
          <span
            className={clsx('stepper__separator-track', `stepper__separator-track--${orientation}`)}
          >
            <span
              className={clsx('stepper__separator-fill', `stepper__separator-fill--${orientation}`)}
              style={separatorProgress}
            />
          </span>
        </span>
      )}
      <div className={clsx('stepper__step-button', `stepper__step-button--${orientation}`)}>
        <span className={clsx('stepper__indicator', `stepper__indicator--${size}`)} data-status={status}>
          {status === 'complete' ? (
            <span className="stepper__icon">
              <CheckmarkIcon />
            </span>
          ) : (
            index + 1
          )}
        </span>
        <span className={clsx('stepper__content', `stepper__content--${orientation}`)}>
          <span className={clsx('stepper__title', `stepper__title--${size}`)}>{step.title}</span>
          {step.description !== undefined && (
            <span className={clsx('stepper__description', `stepper__description--${size}`)}>
              {step.description}
            </span>
          )}
        </span>
      </div>
    </li>
  );
};

Step.displayName = 'Stepper.Step';

const getStatus = (index: number, currentStep: number): StepStatus => {
  if (index < currentStep) return 'complete';
  if (index === currentStep) return 'active';
  return 'inactive';
};

const Stepper = forwardRef<HTMLOListElement, StepperProps>(
  ({ steps, currentStep, orientation = 'horizontal', size = 'md', className, ...rest }, ref) => {
    const items = steps.map((step, index) => (
      <Step
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        step={step}
        index={index}
        status={getStatus(index, currentStep)}
        isLast={index === steps.length - 1}
        orientation={orientation}
        size={size}
      />
    ));

    return (
      <ol
        ref={ref}
        className={clsx('stepper', `stepper--${orientation}`, `stepper--${size}`, className)}
        {...rest}
      >
        {items}
      </ol>
    );
  },
);

Stepper.displayName = 'Stepper';

export default Stepper;
