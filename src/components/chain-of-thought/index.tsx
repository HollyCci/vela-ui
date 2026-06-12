import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

export type ChainOfThoughtProps = HTMLAttributes<HTMLDivElement> & {
  isStreaming?: boolean;
};

const ChainOfThoughtRoot = forwardRef<HTMLDivElement, ChainOfThoughtProps>(
  ({ isStreaming = false, className, ...rest }, ref) => (
    <div
      ref={ref}
      className={clsx('chain-of-thought', isStreaming && 'chain-of-thought--streaming', className)}
      {...rest}
    />
  ),
);
ChainOfThoughtRoot.displayName = 'ChainOfThought';

export type ChainOfThoughtTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;

const Trigger = forwardRef<HTMLButtonElement, ChainOfThoughtTriggerProps>(
  ({ className, type = 'button', ...rest }, ref) => (
    <button ref={ref} type={type} className={clsx('chain-of-thought__trigger', className)} {...rest} />
  ),
);
Trigger.displayName = 'ChainOfThought.Trigger';

const Steps = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...rest }, ref) => (
    <div ref={ref} className={clsx('chain-of-thought__steps', className)} {...rest} />
  ),
);
Steps.displayName = 'ChainOfThought.Steps';

export type ChainOfThoughtStepProps = HTMLAttributes<HTMLDivElement> & {
  label: ReactNode;
};

const Step = forwardRef<HTMLDivElement, ChainOfThoughtStepProps>(
  ({ label, className, children, ...rest }, ref) => (
    <div ref={ref} className={clsx('chain-of-thought__step', className)} {...rest}>
      <div className="chain-of-thought__step-header">
        <span className="chain-of-thought__step-indicator" aria-hidden="true" />
        <span className="chain-of-thought__step-label">{label}</span>
      </div>
      {children !== undefined && <div className="chain-of-thought__step-content">{children}</div>}
    </div>
  ),
);
Step.displayName = 'ChainOfThought.Step';

const ChainOfThought = Object.assign(ChainOfThoughtRoot, { Trigger, Steps, Step });

export default ChainOfThought;
