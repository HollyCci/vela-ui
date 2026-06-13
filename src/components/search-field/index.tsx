import {
  createContext,
  forwardRef,
  useContext,
  type CSSProperties,
  type ForwardedRef,
  type ReactNode,
  type SVGProps,
} from 'react';
import {
  Button as AriaButton,
  FieldError as AriaFieldError,
  Group as AriaGroup,
  Input as AriaInput,
  Label as AriaLabel,
  SearchField as AriaSearchField,
  Text as AriaText,
  type ButtonProps as AriaButtonProps,
  type FieldErrorProps as AriaFieldErrorProps,
  type GroupProps as AriaGroupProps,
  type InputProps as AriaInputProps,
  type LabelProps as AriaLabelProps,
  type SearchFieldProps as AriaSearchFieldProps,
  type TextProps as AriaTextProps,
} from 'react-aria-components';
import clsx from 'clsx';

export type SearchFieldProps = Omit<
  AriaSearchFieldProps,
  'children' | 'className' | 'style' | 'onChange'
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: 'default' | 'secondary';
  isFullWidth?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode;
  placeholder?: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export type SearchFieldLabelProps = Omit<AriaLabelProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type SearchFieldDescriptionProps = Omit<AriaTextProps, 'className' | 'style' | 'slot'> & {
  className?: string;
  style?: CSSProperties;
};

export type SearchFieldErrorMessageProps = Omit<AriaFieldErrorProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type SearchFieldGroupProps = Omit<AriaGroupProps, 'className' | 'style'> & {
  isFullWidth?: boolean;
  className?: string;
  style?: CSSProperties;
};

export type SearchFieldInputProps = Omit<AriaInputProps, 'className' | 'style' | 'type'> & {
  className?: string;
  style?: CSSProperties;
};

export type SearchFieldClearButtonProps = Omit<AriaButtonProps, 'className' | 'style'> & {
  icon?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export type SearchFieldSearchIconProps = Omit<SVGProps<SVGSVGElement>, 'className'> & {
  className?: string;
};

type SearchFieldInputContextValue = {
  placeholder?: string;
  ref: ForwardedRef<HTMLInputElement>;
};

const SearchFieldInputContext = createContext<SearchFieldInputContextValue | null>(null);

const assignRef = <T,>(ref: ForwardedRef<T>, value: T | null) => {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref !== null) {
    ref.current = value;
  }
};

const SearchIcon = ({ className, ...rest }: SearchFieldSearchIconProps) => (
  <svg
    className={clsx('search-field__search-icon', className)}
    data-slot="search-field-search-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...rest}
  >
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);
SearchIcon.displayName = 'SearchField.SearchIcon';

const CloseIcon = () => (
  <svg
    data-slot="close-button-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
CloseIcon.displayName = 'SearchField.CloseIcon';

const Label = forwardRef<HTMLLabelElement, SearchFieldLabelProps>(
  ({ className, ...rest }, ref) => (
    <AriaLabel ref={ref} className={clsx('label', className)} data-slot="label" {...rest} />
  ),
);
Label.displayName = 'SearchField.Label';

const Description = forwardRef<HTMLElement, SearchFieldDescriptionProps>(
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
Description.displayName = 'SearchField.Description';

const ErrorMessage = forwardRef<HTMLElement, SearchFieldErrorMessageProps>(
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
ErrorMessage.displayName = 'SearchField.ErrorMessage';

const Group = forwardRef<HTMLDivElement, SearchFieldGroupProps>(
  ({ isFullWidth = false, className, ...rest }, ref) => (
    <AriaGroup
      ref={ref}
      className={clsx(
        'search-field__group',
        isFullWidth && 'search-field__group--full-width',
        className,
      )}
      data-slot="search-field-group"
      {...rest}
    />
  ),
);
Group.displayName = 'SearchField.Group';

const Input = forwardRef<HTMLInputElement, SearchFieldInputProps>(
  ({ className, placeholder, ...rest }, ref) => {
    const context = useContext(SearchFieldInputContext);
    const contextRef = context?.ref ?? null;

    return (
      <AriaInput
        ref={(node) => {
          assignRef(contextRef, node);
          assignRef(ref, node);
        }}
        type="search"
        className={clsx('search-field__input', className)}
        data-slot="search-field-input"
        placeholder={placeholder ?? context?.placeholder}
        {...rest}
      />
    );
  },
);
Input.displayName = 'SearchField.Input';

const ClearButton = forwardRef<HTMLButtonElement, SearchFieldClearButtonProps>(
  (
    {
      icon,
      className,
      children,
      'aria-label': ariaLabel = '清空',
      type = 'button',
      ...rest
    },
    ref,
  ) => (
    <AriaButton
      ref={ref}
      slot="clear"
      type={type}
      aria-label={ariaLabel}
      className={clsx('search-field__clear-button', className)}
      data-slot="search-field-clear-button"
      {...rest}
    >
      {icon ?? children ?? <CloseIcon />}
    </AriaButton>
  ),
);
ClearButton.displayName = 'SearchField.ClearButton';

const SearchFieldRoot = forwardRef<HTMLInputElement, SearchFieldProps>(
  (
    {
      value,
      defaultValue = '',
      onValueChange,
      variant = 'default',
      isFullWidth = false,
      isInvalid = false,
      isDisabled = false,
      label,
      description,
      errorMessage,
      placeholder,
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) => {
    const inputContext: SearchFieldInputContextValue = { placeholder, ref };

    return (
      <AriaSearchField
        {...rest}
        value={value}
        defaultValue={value === undefined ? defaultValue : undefined}
        onChange={onValueChange}
        isInvalid={isInvalid}
        isDisabled={isDisabled}
        className={clsx(
          'search-field',
          variant === 'secondary' && 'search-field--secondary',
          isFullWidth && 'search-field--full-width',
          className,
        )}
        style={style}
      >
        {children !== undefined ? (
          <SearchFieldInputContext.Provider value={inputContext}>
            {children}
          </SearchFieldInputContext.Provider>
        ) : (
          <>
            {label !== undefined && <Label>{label}</Label>}
            <Group isFullWidth={isFullWidth}>
              <SearchIcon />
              <Input ref={ref} placeholder={placeholder} />
              <ClearButton />
            </Group>
            {description !== undefined && <Description>{description}</Description>}
            {errorMessage !== undefined && <ErrorMessage>{errorMessage}</ErrorMessage>}
          </>
        )}
      </AriaSearchField>
    );
  },
);
SearchFieldRoot.displayName = 'SearchField';

const SearchField = Object.assign(SearchFieldRoot, {
  Label,
  Description,
  ErrorMessage,
  Group,
  Input,
  ClearButton,
  SearchIcon,
});

export default SearchField;
