'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type InputHTMLAttributes,
  type Ref,
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

export type RadioProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'checked' | 'defaultChecked' | 'children'
> & {
  isSelected?: boolean;
  defaultSelected?: boolean;
  onSelectedChange?: (isSelected: boolean) => void;
  isInvalid?: boolean;
  isDisabled?: boolean;
  description?: ReactNode;
  children?: ReactNode;
};

const setRef = <T,>(ref: Ref<T> | undefined, value: T) => {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref !== undefined && ref !== null) {
    ref.current = value;
  }
};

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      isSelected,
      defaultSelected = false,
      onSelectedChange,
      isInvalid = false,
      isDisabled = false,
      description,
      children,
      className,
      onChange,
      ...rest
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [innerSelected, setInnerSelected] = useState(defaultSelected);
    const selected = isSelected ?? innerSelected;

    const updateFromInput = useCallback(() => {
      if (isSelected === undefined && inputRef.current !== null) {
        setInnerSelected(inputRef.current.checked);
      }
    }, [isSelected]);

    const handleRef = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        setRef(ref, node);
      },
      [ref],
    );

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (isSelected === undefined) setInnerSelected(event.target.checked);
      onSelectedChange?.(event.target.checked);
      onChange?.(event);
    };

    useEffect(() => {
      if (isSelected !== undefined) return undefined;

      const handleDocumentChange = (event: Event) => {
        const input = inputRef.current;
        const target = event.target;

        if (
          input === null ||
          !(target instanceof HTMLInputElement) ||
          target.type !== 'radio' ||
          target.name !== input.name ||
          target.form !== input.form
        ) {
          return;
        }

        updateFromInput();
      };

      document.addEventListener('change', handleDocumentChange);
      updateFromInput();

      return () => document.removeEventListener('change', handleDocumentChange);
    }, [isSelected, updateFromInput]);

    return (
      <label
        className={clsx('radio', className)}
        data-selected={selected || undefined}
        data-disabled={isDisabled || undefined}
        aria-checked={selected || undefined}
        aria-invalid={isInvalid || undefined}
      >
        <input
          ref={handleRef}
          type="radio"
          style={VISUALLY_HIDDEN}
          checked={selected}
          onChange={handleChange}
          disabled={isDisabled}
          aria-invalid={isInvalid || undefined}
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
    );
  },
);

Radio.displayName = 'Radio';

export default Radio;
