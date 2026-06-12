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

export type CellSwitchProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'checked' | 'defaultChecked' | 'onChange' | 'children'
> & {
  label?: ReactNode;
  variant?: 'default' | 'secondary';
  isSelected?: boolean;
  defaultSelected?: boolean;
  onSelectedChange?: (isSelected: boolean) => void;
  isDisabled?: boolean;
};

const CellSwitch = forwardRef<HTMLInputElement, CellSwitchProps>(
  (
    {
      label,
      variant = 'default',
      isSelected,
      defaultSelected = false,
      onSelectedChange,
      isDisabled = false,
      className,
      ...rest
    },
    ref,
  ) => {
    const [innerSelected, setInnerSelected] = useState(defaultSelected);
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [isFocusVisible, setIsFocusVisible] = useState(false);
    const selected = isSelected ?? innerSelected;
    const isSecondary = variant === 'secondary';

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (isSelected === undefined) setInnerSelected(event.target.checked);
      onSelectedChange?.(event.target.checked);
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => {
      setIsHovered(false);
      setIsPressed(false);
    };
    const handlePointerDown = () => setIsPressed(true);
    const handlePointerUp = () => setIsPressed(false);
    const handleFocus = () => setIsFocusVisible(true);
    const handleBlur = () => setIsFocusVisible(false);

    return (
      <label
        className={clsx('cell-switch', className)}
        data-hovered={isHovered || undefined}
        data-pressed={isPressed || undefined}
        data-focus-visible={isFocusVisible || undefined}
        data-disabled={isDisabled || undefined}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <span
          className={clsx(
            'cell-switch__trigger',
            isSecondary && 'cell-switch__trigger--secondary',
          )}
        >
          <span className="cell-switch__label">{label}</span>
          <span
            className={clsx(
              'cell-switch__control',
              'switch',
              isSecondary && 'cell-switch__control--secondary',
            )}
            data-selected={selected || undefined}
            aria-hidden="true"
          >
            <span className="switch__control">
              <span className="switch__thumb" />
            </span>
          </span>
        </span>
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          style={VISUALLY_HIDDEN}
          checked={selected}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={isDisabled}
          {...rest}
        />
      </label>
    );
  },
);

CellSwitch.displayName = 'CellSwitch';

export default CellSwitch;
