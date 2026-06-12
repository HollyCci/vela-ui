import {
  forwardRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import clsx from 'clsx';

export type CheckboxButtonGroupProps = HTMLAttributes<HTMLDivElement> & {
  isGrid?: boolean;
  columns?: number;
};

const CheckboxButtonGroupRoot = forwardRef<HTMLDivElement, CheckboxButtonGroupProps>(
  ({ isGrid = false, columns, className, style, ...rest }, ref) => {
    const gridStyle: CSSProperties | undefined =
      isGrid && columns !== undefined
        ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, ...style }
        : style;

    return (
      <div
        ref={ref}
        role="group"
        className={clsx(
          'checkbox-button-group',
          isGrid && 'checkbox-button-group--grid',
          className,
        )}
        style={gridStyle}
        {...rest}
      />
    );
  },
);
CheckboxButtonGroupRoot.displayName = 'CheckboxButtonGroup';

export type CheckboxButtonGroupItemProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> & {
  isSelected?: boolean;
  defaultSelected?: boolean;
  onSelectedChange?: (isSelected: boolean) => void;
  icon?: ReactNode;
  children?: ReactNode;
};

const Item = forwardRef<HTMLButtonElement, CheckboxButtonGroupItemProps>(
  (
    { isSelected, defaultSelected = false, onSelectedChange, icon, className, children, ...rest },
    ref,
  ) => {
    const [innerSelected, setInnerSelected] = useState(defaultSelected);
    const selected = isSelected ?? innerSelected;

    const handleClick = () => {
      const next = !selected;
      if (isSelected === undefined) setInnerSelected(next);
      onSelectedChange?.(next);
    };

    return (
      <button
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={selected}
        className={clsx('checkbox-button-group__item', className)}
        data-selected={selected || undefined}
        onClick={handleClick}
        {...rest}
      >
        <span className="checkbox-button-group__indicator" data-custom="true" aria-hidden="true">
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
        {icon !== undefined && <span className="checkbox-button-group__item-icon">{icon}</span>}
        <span className="checkbox-button-group__item-content">{children}</span>
      </button>
    );
  },
);
Item.displayName = 'CheckboxButtonGroup.Item';

const CheckboxButtonGroup = Object.assign(CheckboxButtonGroupRoot, { Item });

export default CheckboxButtonGroup;
