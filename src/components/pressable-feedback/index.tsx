import { forwardRef, type ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

export type PressableFeedbackProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isDisabled?: boolean;
};

/**
 * 按压反馈容器：内置 highlight 层，hover / active 视觉反馈由 CSS 完成。
 * 作为可点击区域包裹任意内容。
 */
const PressableFeedback = forwardRef<HTMLButtonElement, PressableFeedbackProps>(
  ({ isDisabled = false, className, children, type = 'button', ...rest }, ref) => (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-disabled={isDisabled || undefined}
      className={clsx('pressable-feedback', className)}
      {...rest}
    >
      {children}
      <span className="pressable-feedback__highlight" aria-hidden="true" />
    </button>
  ),
);

PressableFeedback.displayName = 'PressableFeedback';

export default PressableFeedback;
