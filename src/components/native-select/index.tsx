import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type HTMLAttributes,
  type LabelHTMLAttributes,
  type OptgroupHTMLAttributes,
  type OptionHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react';
import clsx from 'clsx';

export type NativeSelectVariant = 'primary' | 'secondary';

export type NativeSelectProps = HTMLAttributes<HTMLDivElement> & {
  /** 视觉变体（原站 API）：primary 无修饰类，secondary 加 --secondary */
  variant?: NativeSelectVariant;
  /** 撑满容器（原站 API）：同时给 root 与 trigger 加 --full-width 修饰类 */
  fullWidth?: boolean;
};

export type NativeSelectTriggerProps = SelectHTMLAttributes<HTMLSelectElement> & {
  /** className 应用到 select 元素本身（原站 API） */
  className?: string;
  /** 应用到外层 trigger 包装 div（原站 API） */
  wrapperClassName?: string;
};

export type NativeSelectIndicatorProps = HTMLAttributes<HTMLSpanElement>;

export type NativeSelectOptionProps = OptionHTMLAttributes<HTMLOptionElement>;

export type NativeSelectOptGroupProps = OptgroupHTMLAttributes<HTMLOptGroupElement>;

export type NativeSelectLabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export type NativeSelectDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

type NativeSelectContextValue = {
  fullWidth: boolean;
  selectId: string;
  descriptionId: string;
  hasDescription: boolean;
  registerDescription: () => () => void;
};

const NativeSelectContext = createContext<NativeSelectContextValue>({
  fullWidth: false,
  selectId: '',
  descriptionId: '',
  hasDescription: false,
  registerDescription: () => () => undefined,
});

/** 包装原生 span 指示器；无 children 时渲染原站默认下箭头 SVG（原站 API） */
const Indicator = forwardRef<HTMLSpanElement, NativeSelectIndicatorProps>(
  ({ className, children, ...rest }, ref) => (
    <span
      ref={ref}
      aria-hidden="true"
      data-slot="native-select-indicator"
      className={clsx('native-select__indicator', className)}
      {...rest}
    >
      {children ?? (
        <svg
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      )}
    </span>
  ),
);
Indicator.displayName = 'NativeSelect.Indicator';

const isIndicatorElement = (child: ReactNode): boolean =>
  isValidElement(child) && child.type === Indicator;

const Label = forwardRef<HTMLLabelElement, NativeSelectLabelProps>(
  ({ className, htmlFor, ...rest }, ref) => {
    const { selectId } = useContext(NativeSelectContext);

    return (
      <label
        ref={ref}
        data-slot="native-select-label"
        htmlFor={htmlFor ?? selectId}
        className={clsx('native-select__label', className)}
        {...rest}
      />
    );
  },
);
Label.displayName = 'NativeSelect.Label';

const Description = forwardRef<HTMLParagraphElement, NativeSelectDescriptionProps>(
  ({ className, id, ...rest }, ref) => {
    const { descriptionId, registerDescription } = useContext(NativeSelectContext);
    const resolvedId = id ?? descriptionId;

    useEffect(() => registerDescription(), [registerDescription]);

    return (
      <p
        ref={ref}
        data-slot="native-select-description"
        id={resolvedId}
        className={clsx('native-select__description', className)}
        {...rest}
      />
    );
  },
);
Description.displayName = 'NativeSelect.Description';

/**
 * 原生 select 的可视包装（原站 API）：children 中的 Indicator 渲染在 select 外
 * （trigger div 内），其余（Option/OptGroup）渲染进 select；未提供 Indicator 时渲染默认指示器。
 */
const Trigger = forwardRef<HTMLSelectElement, NativeSelectTriggerProps>(
  ({ className, id, wrapperClassName, children, ...rest }, ref) => {
    const { fullWidth, selectId, descriptionId, hasDescription } =
      useContext(NativeSelectContext);
    const childArray = Children.toArray(children);
    const indicator = childArray.find(isIndicatorElement);
    const options = childArray.filter((child) => !isIndicatorElement(child));
    const { 'aria-describedby': ariaDescribedBy, ...selectProps } = rest;
    const describedBy = ariaDescribedBy ?? (hasDescription ? descriptionId : undefined);

    return (
      <div
        data-slot="native-select-trigger"
        className={clsx(
          'native-select__trigger',
          fullWidth && 'native-select__trigger--full-width',
          wrapperClassName,
        )}
      >
        <select
          {...selectProps}
          ref={ref}
          data-slot="native-select-select"
          id={id ?? selectId}
          aria-describedby={describedBy}
          className={clsx('native-select__select', className)}
        >
          {options}
        </select>
        {indicator ?? <Indicator />}
      </div>
    );
  },
);
Trigger.displayName = 'NativeSelect.Trigger';

const Option = forwardRef<HTMLOptionElement, NativeSelectOptionProps>((props, ref) => (
  <option ref={ref} {...props} />
));
Option.displayName = 'NativeSelect.Option';

const OptGroup = forwardRef<HTMLOptGroupElement, NativeSelectOptGroupProps>((props, ref) => (
  <optgroup ref={ref} {...props} />
));
OptGroup.displayName = 'NativeSelect.OptGroup';

/**
 * 原生 select 样式包装的根容器（原站 API）：children 由调用方组合
 * （OSS Label / Trigger / OSS Description）；验证态通过 aria-invalid/data-invalid 透传
 * （CSS 依赖 .native-select[data-invalid=true] / [aria-invalid=true]）。
 */
const NativeSelectRoot = forwardRef<HTMLDivElement, NativeSelectProps>(
  ({ variant = 'primary', fullWidth = false, className, ...rest }, ref) => {
    const selectId = useId();
    const descriptionId = useId();
    const [descriptionCount, setDescriptionCount] = useState(0);
    const registerDescription = useCallback(() => {
      setDescriptionCount((count) => count + 1);
      return () => setDescriptionCount((count) => Math.max(0, count - 1));
    }, []);
    const contextValue = useMemo<NativeSelectContextValue>(
      () => ({
        fullWidth,
        selectId,
        descriptionId,
        hasDescription: descriptionCount > 0,
        registerDescription,
      }),
      [descriptionCount, descriptionId, fullWidth, registerDescription, selectId],
    );

    return (
      <NativeSelectContext.Provider value={contextValue}>
      <div
        ref={ref}
        data-slot="native-select"
        className={clsx(
          'native-select',
          variant === 'secondary' && 'native-select--secondary',
          fullWidth && 'native-select--full-width',
          className,
        )}
        {...rest}
      />
      </NativeSelectContext.Provider>
    );
  },
);
NativeSelectRoot.displayName = 'NativeSelect';

const NativeSelect = Object.assign(NativeSelectRoot, {
  Trigger,
  Indicator,
  Option,
  OptGroup,
  Label,
  Description,
});

export default NativeSelect;
