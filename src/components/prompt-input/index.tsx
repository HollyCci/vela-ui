import {
  forwardRef,
  type HTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import clsx from 'clsx';
import Button, { type ButtonProps } from '../button';

export type PromptInputSize = 'sm' | 'md' | 'lg';
export type PromptInputVariant = 'primary' | 'secondary';
export type PromptInputStatus = 'idle' | 'error';

export type PromptInputProps = HTMLAttributes<HTMLDivElement> & {
  size?: PromptInputSize;
  variant?: PromptInputVariant;
  isDisabled?: boolean;
  isPending?: boolean;
  status?: PromptInputStatus;
};

type SectionProps = HTMLAttributes<HTMLDivElement>;

const PromptInputRoot = forwardRef<HTMLDivElement, PromptInputProps>(
  (
    {
      size = 'md',
      variant = 'primary',
      isDisabled = false,
      isPending = false,
      status = 'idle',
      className,
      children,
      ...rest
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={clsx('prompt-input', size !== 'md' && `prompt-input--${size}`, className)}
      data-variant={variant}
      data-disabled={isDisabled ? 'true' : undefined}
      data-pending={isPending ? 'true' : undefined}
      data-status={status === 'error' ? 'error' : undefined}
      {...rest}
    >
      <div className={clsx('prompt-input__shell', `prompt-input__shell--${variant}`)}>{children}</div>
    </div>
  ),
);
PromptInputRoot.displayName = 'PromptInput';

const Content = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('prompt-input__content', className)} {...rest} />
));
Content.displayName = 'PromptInput.Content';

const Attachments = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('prompt-input__attachments', className)} {...rest} />
));
Attachments.displayName = 'PromptInput.Attachments';

export type PromptInputTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = forwardRef<HTMLTextAreaElement, PromptInputTextareaProps>(
  ({ className, ...rest }, ref) => (
    <textarea ref={ref} className={clsx('prompt-input__textarea', 'textarea', className)} {...rest} />
  ),
);
Textarea.displayName = 'PromptInput.Textarea';

const ToolbarSection = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('prompt-input__toolbar', className)} {...rest} />
));
ToolbarSection.displayName = 'PromptInput.Toolbar';

const ToolbarStart = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('prompt-input__toolbar-start', className)} {...rest} />
));
ToolbarStart.displayName = 'PromptInput.ToolbarStart';

const ToolbarEnd = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('prompt-input__toolbar-end', className)} {...rest} />
));
ToolbarEnd.displayName = 'PromptInput.ToolbarEnd';

const Send = forwardRef<HTMLButtonElement, ButtonProps>(({ className, ...rest }, ref) => (
  <Button ref={ref} className={clsx('prompt-input__send', className)} {...rest} />
));
Send.displayName = 'PromptInput.Send';

const Footer = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('prompt-input__footer', className)} {...rest} />
));
Footer.displayName = 'PromptInput.Footer';

const PromptInput = Object.assign(PromptInputRoot, {
  Content,
  Attachments,
  Textarea,
  Toolbar: ToolbarSection,
  ToolbarStart,
  ToolbarEnd,
  Send,
  Footer,
});

export default PromptInput;
