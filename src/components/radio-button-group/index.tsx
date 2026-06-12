import {
  createContext,
  forwardRef,
  useContext,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import clsx from 'clsx';

type RadioButtonGroupContextValue = {
  value: string | undefined;
  setValue: (value: string) => void;
};

const RadioButtonGroupContext = createContext<RadioButtonGroupContextValue | null>(null);

export type RadioButtonGroupProps = Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  isGrid?: boolean;
  columns?: number;
};

const RadioButtonGroupRoot = forwardRef<HTMLDivElement, RadioButtonGroupProps>(
  (
    { value, defaultValue, onValueChange, isGrid = false, columns, className, style, ...rest },
    ref,
  ) => {
    const [innerValue, setInnerValue] = useState(defaultValue);
    const currentValue = value ?? innerValue;

    const contextValue = useMemo<RadioButtonGroupContextValue>(
      () => ({
        value: currentValue,
        setValue: (next: string) => {
          if (value === undefined) setInnerValue(next);
          onValueChange?.(next);
        },
      }),
      [currentValue, value, onValueChange],
    );

    const gridStyle: CSSProperties | undefined =
      isGrid && columns !== undefined
        ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, ...style }
        : style;

    return (
      <RadioButtonGroupContext.Provider value={contextValue}>
        <div
          ref={ref}
          role="radiogroup"
          className={clsx('radio-button-group', isGrid && 'radio-button-group--grid', className)}
          style={gridStyle}
          {...rest}
        />
      </RadioButtonGroupContext.Provider>
    );
  },
);
RadioButtonGroupRoot.displayName = 'RadioButtonGroup';

export type RadioButtonGroupItemProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> & {
  value: string;
  icon?: ReactNode;
};

const Item = forwardRef<HTMLButtonElement, RadioButtonGroupItemProps>(
  ({ value, icon, className, children, ...rest }, ref) => {
    const context = useContext(RadioButtonGroupContext);
    const isSelected = context?.value === value;

    const handleClick = () => context?.setValue(value);

    return (
      <button
        ref={ref}
        type="button"
        role="radio"
        aria-checked={isSelected}
        className={clsx('radio-button-group__item', className)}
        data-selected={isSelected || undefined}
        onClick={handleClick}
        {...rest}
      >
        <span className="radio-button-group__indicator" data-custom="true" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12.5l2.5 2.5L16 9.5" />
          </svg>
        </span>
        {icon !== undefined && <span className="radio-button-group__item-icon">{icon}</span>}
        <span className="radio-button-group__item-content">{children}</span>
      </button>
    );
  },
);
Item.displayName = 'RadioButtonGroup.Item';

const RadioButtonGroup = Object.assign(RadioButtonGroupRoot, { Item });

export default RadioButtonGroup;
