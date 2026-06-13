import {
  createContext,
  forwardRef,
  useContext,
  type CSSProperties,
  type ForwardedRef,
  type ReactNode,
} from 'react';
import {
  Button as AriaButton,
  FieldError as AriaFieldError,
  Group as AriaGroup,
  Input as AriaInput,
  Label as AriaLabel,
  NumberField as AriaNumberField,
  Text as AriaText,
  type ButtonProps as AriaButtonProps,
  type FieldErrorProps as AriaFieldErrorProps,
  type GroupProps as AriaGroupProps,
  type InputProps as AriaInputProps,
  type LabelProps as AriaLabelProps,
  type NumberFieldProps as AriaNumberFieldProps,
  type TextProps as AriaTextProps,
} from 'react-aria-components';
import clsx from 'clsx';

export type NumberFieldProps = Omit<
  AriaNumberFieldProps,
  'children' | 'className' | 'style' | 'onChange'
> & {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  minValue?: number;
  maxValue?: number;
  step?: number;
  variant?: 'default' | 'secondary';
  isFullWidth?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export type NumberFieldLabelProps = Omit<AriaLabelProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type NumberFieldDescriptionProps = Omit<AriaTextProps, 'className' | 'style' | 'slot'> & {
  className?: string;
  style?: CSSProperties;
};

export type NumberFieldErrorMessageProps = Omit<AriaFieldErrorProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type NumberFieldGroupProps = Omit<AriaGroupProps, 'className' | 'style'> & {
  isFullWidth?: boolean;
  className?: string;
  style?: CSSProperties;
};

export type NumberFieldInputProps = Omit<AriaInputProps, 'className' | 'style' | 'type'> & {
  className?: string;
  style?: CSSProperties;
};

export type NumberFieldButtonProps = Omit<AriaButtonProps, 'className' | 'style'> & {
  icon?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

type NumberFieldInputContextValue = {
  ref: ForwardedRef<HTMLInputElement>;
};

const NumberFieldInputContext = createContext<NumberFieldInputContextValue | null>(null);

const assignRef = <T,>(ref: ForwardedRef<T>, value: T | null) => {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref !== null) {
    ref.current = value;
  }
};

const MinusIcon = () => (
  <svg
    data-slot="number-field-decrement-button-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M5 12h14" />
  </svg>
);
MinusIcon.displayName = 'NumberField.MinusIcon';

const PlusIcon = () => (
  <svg
    data-slot="number-field-increment-button-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);
PlusIcon.displayName = 'NumberField.PlusIcon';

const Label = forwardRef<HTMLLabelElement, NumberFieldLabelProps>(
  ({ className, ...rest }, ref) => (
    <AriaLabel ref={ref} className={clsx('label', className)} data-slot="label" {...rest} />
  ),
);
Label.displayName = 'NumberField.Label';

const Description = forwardRef<HTMLElement, NumberFieldDescriptionProps>(
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
Description.displayName = 'NumberField.Description';

const ErrorMessage = forwardRef<HTMLElement, NumberFieldErrorMessageProps>(
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
ErrorMessage.displayName = 'NumberField.ErrorMessage';

const Group = forwardRef<HTMLDivElement, NumberFieldGroupProps>(
  ({ isFullWidth = false, className, ...rest }, ref) => (
    <AriaGroup
      ref={ref}
      className={clsx(
        'number-field__group',
        isFullWidth && 'number-field__group--full-width',
        className,
      )}
      data-slot="number-field-group"
      {...rest}
    />
  ),
);
Group.displayName = 'NumberField.Group';

const Input = forwardRef<HTMLInputElement, NumberFieldInputProps>(
  ({ className, ...rest }, ref) => {
    const context = useContext(NumberFieldInputContext);
    const contextRef = context?.ref ?? null;

    return (
      <AriaInput
        ref={(node) => {
          assignRef(contextRef, node);
          assignRef(ref, node);
        }}
        className={clsx('number-field__input', className)}
        data-slot="number-field-input"
        {...rest}
      />
    );
  },
);
Input.displayName = 'NumberField.Input';

const DecrementButton = forwardRef<HTMLButtonElement, NumberFieldButtonProps>(
  (
    {
      icon,
      className,
      children,
      'aria-label': ariaLabel = '减少',
      type = 'button',
      ...rest
    },
    ref,
  ) => (
    <AriaButton
      ref={ref}
      slot="decrement"
      type={type}
      aria-label={ariaLabel}
      className={clsx('number-field__decrement-button', className)}
      data-slot="number-field-decrement-button"
      {...rest}
    >
      {icon ?? children ?? <MinusIcon />}
    </AriaButton>
  ),
);
DecrementButton.displayName = 'NumberField.DecrementButton';

const IncrementButton = forwardRef<HTMLButtonElement, NumberFieldButtonProps>(
  (
    {
      icon,
      className,
      children,
      'aria-label': ariaLabel = '增加',
      type = 'button',
      ...rest
    },
    ref,
  ) => (
    <AriaButton
      ref={ref}
      slot="increment"
      type={type}
      aria-label={ariaLabel}
      className={clsx('number-field__increment-button', className)}
      data-slot="number-field-increment-button"
      {...rest}
    >
      {icon ?? children ?? <PlusIcon />}
    </AriaButton>
  ),
);
IncrementButton.displayName = 'NumberField.IncrementButton';

const NumberFieldRoot = forwardRef<HTMLInputElement, NumberFieldProps>(
  (
    {
      value,
      defaultValue = 0,
      onValueChange,
      minValue = Number.MIN_SAFE_INTEGER,
      maxValue = Number.MAX_SAFE_INTEGER,
      step = 1,
      variant = 'default',
      isFullWidth = false,
      isInvalid = false,
      isDisabled = false,
      label,
      description,
      errorMessage,
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) => {
    const inputContext: NumberFieldInputContextValue = { ref };

    return (
      <AriaNumberField
        {...rest}
        value={value}
        defaultValue={value === undefined ? defaultValue : undefined}
        onChange={onValueChange}
        minValue={minValue}
        maxValue={maxValue}
        step={step}
        isInvalid={isInvalid}
        isDisabled={isDisabled}
        className={clsx(
          'number-field',
          variant === 'secondary' && 'number-field--secondary',
          isFullWidth && 'number-field--full-width',
          className,
        )}
        style={style}
      >
        {children !== undefined ? (
          <NumberFieldInputContext.Provider value={inputContext}>
            {children}
          </NumberFieldInputContext.Provider>
        ) : (
          <>
            {label !== undefined && <Label>{label}</Label>}
            <Group isFullWidth={isFullWidth}>
              <DecrementButton />
              <Input ref={ref} />
              <IncrementButton />
            </Group>
            {description !== undefined && <Description>{description}</Description>}
            {errorMessage !== undefined && <ErrorMessage>{errorMessage}</ErrorMessage>}
          </>
        )}
      </AriaNumberField>
    );
  },
);
NumberFieldRoot.displayName = 'NumberField';

const NumberField = Object.assign(NumberFieldRoot, {
  Label,
  Description,
  ErrorMessage,
  Group,
  Input,
  DecrementButton,
  IncrementButton,
});

export default NumberField;
