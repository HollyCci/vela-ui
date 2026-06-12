import {
  forwardRef,
  type CSSProperties,
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

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'children'> & {
  isSelected?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  description?: ReactNode;
  children?: ReactNode;
};

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    { isSelected, isInvalid = false, isDisabled = false, description, children, className, ...rest },
    ref,
  ) => (
    <label
      className={clsx('radio', className)}
      data-selected={isSelected || undefined}
      data-disabled={isDisabled || undefined}
      aria-invalid={isInvalid || undefined}
    >
      <input
        ref={ref}
        type="radio"
        style={VISUALLY_HIDDEN}
        checked={isSelected}
        disabled={isDisabled}
        {...rest}
      />
      <span className="radio__control" aria-hidden="true">
        <span className="radio__indicator" />
      </span>
      {(children !== undefined || description !== undefined) && (
        <span className="radio__content">
          {children !== undefined && (
            <span className="label" data-slot="label">
              {children}
            </span>
          )}
          {description !== undefined && (
            <span className="description" data-slot="description">
              {description}
            </span>
          )}
        </span>
      )}
    </label>
  ),
);

Radio.displayName = 'Radio';

export default Radio;
