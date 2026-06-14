'use client';

import { createContext, useContext, type CSSProperties, type ReactNode } from 'react';
import {
  Button,
  Group,
  Input,
  Label,
  NumberField,
  NumberFieldStateContext,
  Text,
  type ButtonProps,
  type GroupProps,
  type LabelProps,
  type NumberFieldProps,
  type TextProps,
} from 'react-aria-components';
import NumberFlow, { type Format, type NumberFlowProps } from '@number-flow/react';
import clsx from 'clsx';

export type NumberStepperSize = 'sm' | 'md' | 'lg';

export type NumberStepperProps = Omit<NumberFieldProps, 'className' | 'style' | 'children'> & {
  size?: NumberStepperSize;
  /** 数字格式化选项，同时作用于 RAC NumberField 与 Number Flow 显示（原站 API：Number Flow 的 Format） */
  formatOptions?: Format;
  label?: ReactNode;
  description?: ReactNode;
  children?: ReactNode | NumberFieldRenderChildren;
  className?: string;
  style?: CSSProperties;
};

export type NumberStepperGroupProps = Omit<GroupProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type NumberStepperValueProps = Omit<NumberFlowProps, 'value' | 'children'> & {
  /** 覆盖显示值（默认取根组件当前值） */
  value?: number;
  /** 覆盖格式化选项 */
  format?: Format;
  /** 自定义内容或渲染函数（原站 API） */
  children?: ReactNode | ((props: { value: number; formatOptions?: Format }) => ReactNode);
};

export type NumberStepperButtonProps = Omit<ButtonProps, 'className' | 'style'> & {
  icon?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export type NumberStepperLabelProps = Omit<LabelProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type NumberStepperDescriptionProps = Omit<TextProps, 'className' | 'style' | 'slot'> & {
  className?: string;
  style?: CSSProperties;
};

type NumberStepperContextValue = {
  size: NumberStepperSize;
  format?: Format;
};

type NumberFieldRenderChildren = Extract<
  NumberFieldProps['children'],
  (props: any) => ReactNode
>;
type NumberFieldRenderProps = Parameters<NumberFieldRenderChildren>[0];

const NumberStepperContext = createContext<NumberStepperContextValue>({ size: 'md' });

/** 原站默认 ± 图标（与基准快照 SVG path 一致） */
const MinusIcon = () => (
  <svg fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
    <path
      clipRule="evenodd"
      d="M1.75 8a.75.75 0 0 1 .75-.75h11a.75.75 0 0 1 0 1.5h-11A.75.75 0 0 1 1.75 8"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);
MinusIcon.displayName = 'NumberStepper.MinusIcon';

const PlusIcon = () => (
  <svg fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
    <path
      clipRule="evenodd"
      d="M8 1.75a.75.75 0 0 1 .75.75v4.75h4.75a.75.75 0 0 1 0 1.5H8.75v4.75a.75.75 0 0 1-1.5 0V8.75H2.5a.75.75 0 0 1 0-1.5h4.75V2.5A.75.75 0 0 1 8 1.75"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);
PlusIcon.displayName = 'NumberStepper.PlusIcon';

const StepperLabel = ({ className, ...rest }: NumberStepperLabelProps) => (
  <Label className={clsx('number-stepper__label', className)} data-slot="label" {...rest} />
);
StepperLabel.displayName = 'NumberStepper.Label';

const Description = ({ className, ...rest }: NumberStepperDescriptionProps) => (
  <Text
    slot="description"
    className={clsx('number-stepper__description', className)}
    data-slot="description"
    {...rest}
  />
);
Description.displayName = 'NumberStepper.Description';

/** 包装 RAC Group；末尾自动渲染无障碍隐藏输入框（与原站 DOM 一致） */
const StepperGroup = ({ className, children, ...rest }: NumberStepperGroupProps) => {
  const { size } = useContext(NumberStepperContext);
  const state = useContext(NumberFieldStateContext);
  const currentValue =
    state !== null && !Number.isNaN(state.numberValue) ? state.numberValue : undefined;

  return (
    <Group
      data-slot="number-stepper-group"
      className={clsx('number-stepper__group', `number-stepper__group--${size}`, className)}
      {...rest}
    >
      {(renderProps) => (
        <>
          {typeof children === 'function' ? children(renderProps) : children}
          <Input
            aria-valuemax={state?.maxValue}
            aria-valuemin={state?.minValue}
            aria-valuenow={currentValue}
            aria-valuetext={state?.inputValue || undefined}
            className="number-stepper__input"
            data-slot="number-stepper-input"
            role="spinbutton"
          />
        </>
      )}
    </Group>
  );
};
StepperGroup.displayName = 'NumberStepper.Group';

/** Number Flow 动画数字显示；默认读取根 NumberField 的当前值 */
const Value = ({ value, format, children, className, ...rest }: NumberStepperValueProps) => {
  const { size, format: rootFormat } = useContext(NumberStepperContext);
  const state = useContext(NumberFieldStateContext);
  const stateValue = state !== null && !Number.isNaN(state.numberValue) ? state.numberValue : 0;
  const current = value ?? stateValue;
  const effectiveFormat = format ?? rootFormat;
  const valueClass = clsx('number-stepper__value', `number-stepper__value--${size}`, className);

  if (children !== undefined) {
    return (
      <span className={valueClass} data-slot="number-stepper-value">
        {typeof children === 'function'
          ? children({ value: current, formatOptions: effectiveFormat })
          : children}
      </span>
    );
  }

  return (
    <NumberFlow
      className={valueClass}
      data-slot="number-stepper-value"
      format={effectiveFormat}
      value={current}
      {...rest}
    />
  );
};
Value.displayName = 'NumberStepper.Value';

/** 包装 RAC Button slot="decrement"；无 children 时渲染默认减号图标 */
const DecrementButton = ({ icon, className, children, ...rest }: NumberStepperButtonProps) => {
  const { size } = useContext(NumberStepperContext);

  return (
    <Button
      slot="decrement"
      data-slot="number-stepper-decrement-button"
      className={clsx(
        'number-stepper__decrement-button',
        `number-stepper__decrement-button--${size}`,
        className,
      )}
      {...rest}
    >
      {icon ?? children ?? <MinusIcon />}
    </Button>
  );
};
DecrementButton.displayName = 'NumberStepper.DecrementButton';

/** 包装 RAC Button slot="increment"；无 children 时渲染默认加号图标 */
const IncrementButton = ({ icon, className, children, ...rest }: NumberStepperButtonProps) => {
  const { size } = useContext(NumberStepperContext);

  return (
    <Button
      slot="increment"
      data-slot="number-stepper-increment-button"
      className={clsx(
        'number-stepper__increment-button',
        `number-stepper__increment-button--${size}`,
        className,
      )}
      {...rest}
    >
      {icon ?? children ?? <PlusIcon />}
    </Button>
  );
};
IncrementButton.displayName = 'NumberStepper.IncrementButton';

/**
 * 包装 RAC NumberField 的步进数字输入（原站 API）：
 * min/max/step/受控等行为由 RAC 提供，按住按钮连续步进、键盘上下方向键调值开箱即用。
 */
const NumberStepperRoot = ({
  size = 'md',
  formatOptions,
  label,
  description,
  className,
  children,
  ...rest
}: NumberStepperProps) => {
  const labelNode = label !== undefined ? <StepperLabel>{label}</StepperLabel> : null;
  const descriptionNode =
    description !== undefined ? <Description>{description}</Description> : null;
  const content =
    typeof children === 'function'
      ? (renderProps: NumberFieldRenderProps) => (
          <>
            {labelNode}
            {(children as NumberFieldRenderChildren)(renderProps)}
            {descriptionNode}
          </>
        )
      : (
          <>
            {labelNode}
            {children}
            {descriptionNode}
          </>
        );

  return (
    <NumberStepperContext.Provider value={{ size, format: formatOptions }}>
      <NumberField
        data-slot="number-stepper"
        formatOptions={formatOptions}
        className={clsx('number-stepper', className)}
        {...rest}
      >
        {content}
      </NumberField>
    </NumberStepperContext.Provider>
  );
};
NumberStepperRoot.displayName = 'NumberStepper';

const NumberStepper = Object.assign(NumberStepperRoot, {
  Label: StepperLabel,
  Description,
  Group: StepperGroup,
  Value,
  DecrementButton,
  IncrementButton,
});

export default NumberStepper;
