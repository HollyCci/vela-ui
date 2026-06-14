'use client';

import {
  createContext,
  forwardRef,
  useContext,
  type ForwardedRef,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import {
  FieldError as AriaFieldError,
  Label as AriaLabel,
  Text as AriaText,
  TextArea as AriaTextArea,
  TextField as AriaTextField,
  type FieldErrorProps as AriaFieldErrorProps,
  type LabelProps as AriaLabelProps,
  type TextAreaProps as AriaTextAreaProps,
  type TextProps as AriaTextProps,
} from 'react-aria-components';
import clsx from 'clsx';
import { assignRef } from '../_internal/assign-ref';

export type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'children'> & {
  variant?: 'default' | 'secondary';
  isFullWidth?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode;
  children?: ReactNode;
};

export type TextareaFieldProps = Omit<AriaTextAreaProps, 'className' | 'style'> & {
  variant?: 'default' | 'secondary';
  isFullWidth?: boolean;
  isInvalid?: boolean;
  className?: string;
  style?: TextareaHTMLAttributes<HTMLTextAreaElement>['style'];
};

export type TextareaLabelProps = Omit<AriaLabelProps, 'className' | 'style'> & {
  className?: string;
  style?: TextareaHTMLAttributes<HTMLTextAreaElement>['style'];
};

export type TextareaDescriptionProps = Omit<AriaTextProps, 'className' | 'style' | 'slot'> & {
  className?: string;
  style?: TextareaHTMLAttributes<HTMLTextAreaElement>['style'];
};

export type TextareaErrorMessageProps = Omit<AriaFieldErrorProps, 'className' | 'style'> & {
  className?: string;
  style?: TextareaHTMLAttributes<HTMLTextAreaElement>['style'];
};

const isInvalidValue = (value: TextareaHTMLAttributes<HTMLTextAreaElement>['aria-invalid']) =>
  value !== undefined && value !== false && value !== 'false';

type TextareaFieldContextValue = {
  textareaProps: Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'children' | 'className' | 'style'>;
  ref: ForwardedRef<HTMLTextAreaElement>;
  variant: NonNullable<TextareaProps['variant']>;
  isFullWidth: boolean;
  isInvalid: boolean;
};

const TextareaFieldContext = createContext<TextareaFieldContextValue | null>(null);

const Label = forwardRef<HTMLLabelElement, TextareaLabelProps>(({ className, ...rest }, ref) => (
  <AriaLabel ref={ref} className={clsx('label', className)} data-slot="label" {...rest} />
));
Label.displayName = 'Textarea.Label';

const Description = forwardRef<HTMLElement, TextareaDescriptionProps>(
  ({ className, ...rest }, ref) => (
    <AriaText
      ref={ref}
      slot="description"
      className={clsx('description', className)}
      data-slot="description"
      {...rest}
    />
  ),
);
Description.displayName = 'Textarea.Description';

const ErrorMessage = forwardRef<HTMLElement, TextareaErrorMessageProps>(
  ({ className, ...rest }, ref) => (
    <AriaFieldError
      ref={ref}
      className={clsx('field-error', className)}
      data-slot="error-message"
      data-visible="true"
      {...rest}
    />
  ),
);
ErrorMessage.displayName = 'Textarea.ErrorMessage';

const Field = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  (
    {
      variant,
      isFullWidth,
      isInvalid,
      className,
      'aria-invalid': ariaInvalid,
      ...rest
    },
    ref,
  ) => {
    const context = useContext(TextareaFieldContext);
    const resolvedVariant = variant ?? context?.variant ?? 'default';
    const resolvedFullWidth = isFullWidth ?? context?.isFullWidth ?? false;
    const resolvedInvalid = isInvalid ?? context?.isInvalid ?? false;
    const contextTextareaProps = context?.textareaProps ?? {};
    const contextRef = context?.ref ?? null;

    return (
      <AriaTextArea
        ref={(node) => {
          assignRef(contextRef, node);
          assignRef(ref, node);
        }}
        {...contextTextareaProps}
        {...rest}
        className={clsx(
          'textarea',
          resolvedVariant === 'secondary' && 'textarea--secondary',
          resolvedFullWidth && 'textarea--full-width',
          className,
        )}
        data-slot="textarea-field"
        data-invalid={resolvedInvalid || undefined}
        aria-invalid={resolvedInvalid ? true : ariaInvalid}
      />
    );
  },
);
Field.displayName = 'Textarea.Field';

const TextareaRoot = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      variant = 'default',
      isFullWidth = false,
      isInvalid = false,
      isDisabled,
      label,
      description,
      errorMessage,
      className,
      style,
      children,
      disabled,
      readOnly,
      required,
      id,
      ...rest
    },
    ref,
  ) => {
    const fieldDisabled = isDisabled ?? disabled ?? false;
    const fieldInvalid = isInvalid || isInvalidValue(rest['aria-invalid']);
    const rootProps = {
      id,
      isDisabled: fieldDisabled,
      isInvalid: fieldInvalid,
      isReadOnly: readOnly,
      isRequired: required,
      className: clsx(
        'textarea-field',
        isFullWidth && 'textarea-field--full-width',
        children !== undefined && className,
      ),
      style: children !== undefined ? style : undefined,
      'data-invalid': fieldInvalid || undefined,
    };

    const fieldContext: TextareaFieldContextValue = {
      textareaProps: {
        disabled: fieldDisabled,
        readOnly,
        required,
        ...rest,
      },
      ref,
      variant,
      isFullWidth,
      isInvalid: fieldInvalid,
    };

    return (
      <AriaTextField {...rootProps}>
        {children !== undefined ? (
          <TextareaFieldContext.Provider value={fieldContext}>{children}</TextareaFieldContext.Provider>
        ) : (
          <>
            {label !== undefined && <Label>{label}</Label>}
            <Field
              ref={ref}
              variant={variant}
              isFullWidth={isFullWidth}
              isInvalid={fieldInvalid}
              className={className}
              style={style}
              disabled={fieldDisabled}
              readOnly={readOnly}
              required={required}
              {...rest}
            />
            {description !== undefined && <Description>{description}</Description>}
            {errorMessage !== undefined && <ErrorMessage>{errorMessage}</ErrorMessage>}
          </>
        )}
      </AriaTextField>
    );
  },
);
TextareaRoot.displayName = 'Textarea';

const Textarea = Object.assign(TextareaRoot, {
  Label,
  Field,
  Description,
  ErrorMessage,
});

export default Textarea;
