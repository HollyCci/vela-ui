'use client';

import {
  forwardRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import clsx from 'clsx';

const VISUALLY_HIDDEN: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  border: 0,
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
};

export type SwitchSize = 'sm' | 'md' | 'lg';

export type SwitchProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'checked' | 'defaultChecked' | 'onChange' | 'size' | 'children'
> & {
  size?: SwitchSize;
  isSelected?: boolean;
  defaultSelected?: boolean;
  onSelectedChange?: (isSelected: boolean) => void;
  isDisabled?: boolean;
  children?: ReactNode;
};

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      size = 'md',
      isSelected,
      defaultSelected = false,
      onSelectedChange,
      isDisabled = false,
      children,
      className,
      ...rest
    },
    ref,
  ) => {
    const [innerSelected, setInnerSelected] = useState(defaultSelected);
    const selected = isSelected ?? innerSelected;

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (isSelected === undefined) setInnerSelected(event.target.checked);
      onSelectedChange?.(event.target.checked);
    };

    return (
      <label
        className={clsx('switch', size !== 'md' && `switch--${size}`, className)}
        data-selected={selected || undefined}
        data-disabled={isDisabled || undefined}
      >
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          style={VISUALLY_HIDDEN}
          checked={selected}
          onChange={handleChange}
          disabled={isDisabled}
          {...rest}
        />
        <span className="switch__control" aria-hidden="true">
          <span className="switch__thumb" />
        </span>
        {children !== undefined && (
          <span className="switch__content">
            <span className="switch__label">{children}</span>
          </span>
        )}
      </label>
    );
  },
);

Switch.displayName = 'Switch';

export default Switch;
