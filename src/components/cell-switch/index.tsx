import {
  createContext,
  forwardRef,
  useContext,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';
import { Switch, type SwitchControlProps, type SwitchProps } from '@heroui/react';
import clsx from 'clsx';

export type CellSwitchVariant = 'default' | 'secondary';

export type CellSwitchProps = Omit<SwitchProps, 'className' | 'style'> & {
  /** 视觉变体（原站 API；OSS Switch 本身无 variant，不冲突） */
  variant?: CellSwitchVariant;
  className?: string;
  style?: CSSProperties;
};

export type CellSwitchTriggerProps = HTMLAttributes<HTMLDivElement>;

export type CellSwitchLabelProps = HTMLAttributes<HTMLSpanElement>;

export type CellSwitchControlProps = SwitchControlProps;

/** Trigger/Control 需要根据根组件 variant 渲染对应修饰类 */
const CellSwitchContext = createContext<CellSwitchVariant>('default');

/** 可见的整行单元格容器；快照中 default 变体也带 --default 修饰类 */
const Trigger = forwardRef<HTMLDivElement, CellSwitchTriggerProps>(
  ({ className, ...rest }, ref) => {
    const variant = useContext(CellSwitchContext);

    return (
      <div
        ref={ref}
        data-slot="cell-switch-trigger"
        className={clsx('cell-switch__trigger', `cell-switch__trigger--${variant}`, className)}
        {...rest}
      />
    );
  },
);
Trigger.displayName = 'CellSwitch.Trigger';

const Label = forwardRef<HTMLSpanElement, CellSwitchLabelProps>(({ className, ...rest }, ref) => (
  <span
    ref={ref}
    data-slot="cell-switch-label"
    className={clsx('cell-switch__label', className)}
    {...rest}
  />
));
Label.displayName = 'CellSwitch.Label';

/** 包装 OSS Switch.Control；无 children 时渲染默认 Switch.Thumb（原站 API） */
const Control = ({ className, children, ...rest }: CellSwitchControlProps) => {
  const variant = useContext(CellSwitchContext);

  return (
    <Switch.Control
      data-slot="cell-switch-control"
      className={clsx(
        'cell-switch__control',
        variant === 'secondary' && 'cell-switch__control--secondary',
        className,
      )}
      {...rest}
    >
      {children ?? <Switch.Thumb />}
    </Switch.Control>
  );
};
Control.displayName = 'CellSwitch.Control';

/**
 * 包装 OSS Switch 的单元格开关（原站 API）：根即 label，点击整行切换；
 * 受控（isSelected/onChange）、键盘与 data-hovered/pressed/focus-visible/disabled
 * 状态属性均由底座提供，CSS 依赖这些 data 属性着色。
 */
const CellSwitchRoot = forwardRef<HTMLLabelElement, CellSwitchProps>(
  ({ variant = 'default', className, children, ...rest }, ref) => (
    <CellSwitchContext.Provider value={variant}>
      <Switch
        ref={ref}
        data-slot="cell-switch"
        className={clsx(
          'cell-switch',
          variant === 'secondary' && 'cell-switch--secondary',
          className,
        )}
        {...rest}
      >
        {children}
      </Switch>
    </CellSwitchContext.Provider>
  ),
);
CellSwitchRoot.displayName = 'CellSwitch';

const CellSwitch = Object.assign(CellSwitchRoot, { Trigger, Label, Control });

export default CellSwitch;
