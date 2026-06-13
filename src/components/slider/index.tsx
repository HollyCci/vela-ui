import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import clsx from 'clsx';

export type SliderOrientation = 'horizontal' | 'vertical';

export type SliderProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> & {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  minValue?: number;
  maxValue?: number;
  step?: number;
  label?: ReactNode;
  formatValue?: (value: number) => string;
  orientation?: SliderOrientation;
  isDisabled?: boolean;
};

const defaultFormatValue = (value: number) => String(value);

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const Slider = forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      minValue = 0,
      maxValue = 100,
      step = 1,
      label,
      formatValue = defaultFormatValue,
      orientation = 'horizontal',
      isDisabled = false,
      className,
      ...rest
    },
    ref,
  ) => {
    const [innerValue, setInnerValue] = useState(value ?? defaultValue ?? minValue);
    const currentValue = value ?? innerValue;

    const trackRef = useRef<HTMLDivElement>(null);
    const draggingRef = useRef(false);
    const [isDragging, setIsDragging] = useState(false);

    const range = maxValue - minValue;
    const ratio = range === 0 ? 0 : clamp((currentValue - minValue) / range, 0, 1);
    const percent = `${ratio * 100}%`;
    const isHorizontal = orientation === 'horizontal';

    const commitValue = useCallback(
      (next: number) => {
        const snapped = clamp(Math.round((next - minValue) / step) * step + minValue, minValue, maxValue);
        if (value === undefined) setInnerValue(snapped);
        if (snapped !== currentValue) onChange?.(snapped);
      },
      [minValue, maxValue, step, value, currentValue, onChange],
    );

    const valueFromPointer = useCallback(
      (clientX: number, clientY: number) => {
        const track = trackRef.current;
        if (track === null) return minValue;
        const rect = track.getBoundingClientRect();
        const pointerRatio = isHorizontal
          ? (clientX - rect.left) / rect.width
          : (rect.bottom - clientY) / rect.height;
        return minValue + clamp(pointerRatio, 0, 1) * range;
      },
      [isHorizontal, minValue, range],
    );

    const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
      if (isDisabled) return;
      event.preventDefault();
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // 某些环境（如测试或无指针捕获支持时）会抛错，忽略后仍可拖拽
      }
      draggingRef.current = true;
      setIsDragging(true);
      commitValue(valueFromPointer(event.clientX, event.clientY));
    };

    const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      commitValue(valueFromPointer(event.clientX, event.clientY));
    };

    const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      draggingRef.current = false;
      setIsDragging(false);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (isDisabled) return;
      let next: number | undefined;
      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = currentValue + step;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = currentValue - step;
      else if (event.key === 'Home') next = minValue;
      else if (event.key === 'End') next = maxValue;
      else if (event.key === 'PageUp') next = currentValue + step * 10;
      else if (event.key === 'PageDown') next = currentValue - step * 10;
      if (next === undefined) return;
      event.preventDefault();
      commitValue(next);
    };

    const fillStyle = isHorizontal ? { left: 0, width: percent } : { bottom: 0, height: percent };
    const thumbStyle = isHorizontal
      ? { left: percent, transform: 'translate(-50%, -50%)' }
      : { bottom: percent, transform: 'translate(-50%, 50%)' };

    return (
      <div
        ref={ref}
        className={clsx('slider', className)}
        data-orientation={orientation}
        data-disabled={isDisabled || undefined}
        {...rest}
      >
        {label !== undefined && (
          <span className="label" data-slot="label">
            {label}
          </span>
        )}
        <output className="slider__output">{formatValue(currentValue)}</output>
        <div
          ref={trackRef}
          className="slider__track"
          data-fill-start={ratio > 0 || undefined}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ touchAction: 'none' }}
        >
          <div className="slider__fill" style={fillStyle} />
          <div
            className="slider__thumb"
            style={thumbStyle}
            role="slider"
            aria-valuemin={minValue}
            aria-valuemax={maxValue}
            aria-valuenow={currentValue}
            aria-orientation={orientation}
            aria-disabled={isDisabled || undefined}
            tabIndex={isDisabled ? undefined : 0}
            data-disabled={isDisabled || undefined}
            data-dragging={isDragging || undefined}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
    );
  },
);

Slider.displayName = 'Slider';

export default Slider;
