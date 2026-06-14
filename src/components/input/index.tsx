'use client';

import {
  createContext,
  forwardRef,
  useContext,
  type ForwardedRef,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import {
  FieldError as AriaFieldError,
  Input as AriaInput,
  Label as AriaLabel,
  Text as AriaText,
  TextField as AriaTextField,
  type FieldErrorProps as AriaFieldErrorProps,
  type InputProps as AriaInputProps,
  type LabelProps as AriaLabelProps,
  type TextProps as AriaTextProps,
} from 'react-aria-components';
import clsx from 'clsx';
import { assignRef } from '../_internal/assign-ref';

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'children'> & {
  variant?: 'default' | 'secondary';
  isFullWidth?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode;
  children?: ReactNode;
};

export type InputFieldProps = Omit<AriaInputProps, 'className' | 'style'> & {
  variant?: 'default' | 'secondary';
  isFullWidth?: boolean;
  isInvalid?: boolean;
  className?: string;
  style?: InputHTMLAttributes<HTMLInputElement>['style'];
};

export type InputLabelProps = Omit<AriaLabelProps, 'className' | 'style'> & {
  className?: string;
  style?: InputHTMLAttributes<HTMLInputElement>['style'];
};

export type InputDescriptionProps = Omit<AriaTextProps, 'className' | 'style' | 'slot'> & {
  className?: string;
  style?: InputHTMLAttributes<HTMLInputElement>['style'];
};

export type InputErrorMessageProps = Omit<AriaFieldErrorProps, 'className' | 'style'> & {
  className?: string;
  style?: InputHTMLAttributes<HTMLInputElement>['style'];
};

const isInvalidValue = (value: InputHTMLAttributes<HTMLInputElement>['aria-invalid']) =>
  value !== undefined && value !== false && value !== 'false';

type InputFieldContextValue = {
  inputProps: Omit<InputHTMLAttributes<HTMLInputElement>, 'children' | 'className' | 'style'>;
  ref: ForwardedRef<HTMLInputElement>;
  variant: NonNullable<InputProps['variant']>;
  isFullWidth: boolean;
  isInvalid: boolean;
};

const InputFieldContext = createContext<InputFieldContextValue | null>(null);

const Label = forwardRef<HTMLLabelElement, InputLabelProps>(({ className, ...rest }, ref) => (
  <AriaLabel ref={ref} className={clsx('label', className)} data-slot="label" {...rest} />
));
Label.displayName = 'Input.Label';

const Description = forwardRef<HTMLElement, InputDescriptionProps>(
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
Description.displayName = 'Input.Description';

const ErrorMessage = forwardRef<HTMLElement, InputErrorMessageProps>(
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
ErrorMessage.displayName = 'Input.ErrorMessage';

const Field = forwardRef<HTMLInputElement, InputFieldProps>(
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
    const context = useContext(InputFieldContext);
    const resolvedVariant = variant ?? context?.variant ?? 'default';
    const resolvedFullWidth = isFullWidth ?? context?.isFullWidth ?? false;
    const resolvedInvalid = isInvalid ?? context?.isInvalid ?? false;
    const contextInputProps = context?.inputProps ?? {};
    const contextRef = context?.ref ?? null;

    return (
      <AriaInput
        ref={(node) => {
          assignRef(contextRef, node);
          assignRef(ref, node);
        }}
        {...contextInputProps}
        {...rest}
        className={clsx(
          'input',
          resolvedVariant === 'secondary' && 'input--secondary',
          resolvedFullWidth && 'input--full-width',
          className,
        )}
        data-slot="input-field"
        data-invalid={resolvedInvalid || undefined}
        aria-invalid={resolvedInvalid ? true : ariaInvalid}
      />
    );
  },
);
Field.displayName = 'Input.Field';

const InputRoot = forwardRef<HTMLInputElement, InputProps>(
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
        'input-field',
        isFullWidth && 'input-field--full-width',
        children !== undefined && className,
      ),
      style: children !== undefined ? style : undefined,
      'data-invalid': fieldInvalid || undefined,
    };

    const fieldContext: InputFieldContextValue = {
      inputProps: {
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
          <InputFieldContext.Provider value={fieldContext}>{children}</InputFieldContext.Provider>
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
InputRoot.displayName = 'Input';

const Input = Object.assign(InputRoot, {
  Label,
  Field,
  Description,
  ErrorMessage,
});

export default Input;
