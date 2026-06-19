'use client';

import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  type ChangeEvent,
  type ComponentProps,
  type CSSProperties,
  type InputHTMLAttributes,
  type MutableRefObject,
  type ReactNode,
  type Ref,
} from 'react';
import { Radio as HeroRadio, RadioGroup as HeroRadioGroup } from '@heroui/react';
import clsx from 'clsx';

export type RadioProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'checked' | 'defaultChecked' | 'children' | 'onChange'
> & {
  isSelected?: boolean;
  defaultSelected?: boolean;
  onSelectedChange?: (isSelected: boolean) => void;
  isInvalid?: boolean;
  isDisabled?: boolean;
  description?: ReactNode;
  children?: ReactNode;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
};

const setRef = <T,>(ref: Ref<T> | undefined, value: T) => {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref !== undefined && ref !== null) {
    (ref as MutableRefObject<T>).current = value;
  }
};

/**
 * 单选项 — 包装 OSS `@heroui/react` 的 Radio（底座为 react-aria-components，真 a11y/键盘/焦点/按压态）。
 *
 * 契约保真说明：本组件对外是「独立、可单独受控」的单选项（isSelected / onSelectedChange /
 * 独立 checked / name / value / disabled），而底座 RAC 的 RadioField/RadioButton 必须运行在
 * RadioGroup context 中、选中态由分组共享 value 驱动。为同时拿到真引擎能力并保留旧契约，这里给每个
 * 独立 Radio 套一层隐式 RadioGroup，并在两套模型间桥接：
 *   - 选中：group.value = 本项 value（选中）/ null（未选）；非受控用 defaultValue；
 *   - 回调：group.onChange(v) → onSelectedChange(v === 本项 value)，并合成原生 onChange 事件；
 *   - 事件：onClick 桥接到 group 包裹层（RAC 的 field/button 会删 onClick），其余原生属性透传到底座；
 *   - 状态：isDisabled / isInvalid 透传给 group（驱动 RAC 状态）。
 * DOM/类名仍与样式分片对齐：RadioField=.radio（落 className/style），RadioButton=.radio__content。
 */
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
      style,
      onChange,
      onClick,
      value,
      name,
      ...rest
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    // RAC 通过 value 匹配管理选中，独立 Radio 未必有 value，用稳定 id 兜底
    const generatedValue = useId();
    const radioValue = value !== undefined && value !== null ? String(value) : generatedValue;

    // RAC 把真 <input> 挂到 inputRef 后，把同一节点桥接给外部 ref（overlay 触发器需真 DOM ref）
    useEffect(() => {
      setRef(ref, inputRef.current);
      return () => setRef(ref, null);
    });

    const handleGroupChange = (next: string) => {
      const selected = next === radioValue;
      onSelectedChange?.(selected);
      if (selected && onChange && inputRef.current) {
        // 桥接旧契约的原生 onChange：从真 input 合成事件，target.checked 反映已选中
        onChange({
          target: inputRef.current,
          currentTarget: inputRef.current,
        } as ChangeEvent<HTMLInputElement>);
      }
    };

    // 受控：value=本项(选中)/null(未选)；非受控走 defaultValue
    const groupSelectionProps =
      isSelected === undefined
        ? { defaultValue: defaultSelected ? radioValue : null }
        : { value: isSelected ? radioValue : null };

    // 隐式分组需要可访问名（否则 RAC 报缺 aria-label）；children 为纯文本时直接复用
    const groupAriaLabel = typeof children === 'string' ? children : undefined;

    // rest 为 InputHTMLAttributes（事件类型按 <input>），透传到底座 RadioField（事件类型按 Element）
    // 仅类型形状不同、运行时一致，按 RadioField 的 props 形状收敛
    const radioPassthrough = rest as ComponentProps<typeof HeroRadio>;

    return (
      <HeroRadioGroup
        // 隐式分组只为提供 RAC context（真 a11y/键盘/焦点/按压态）；可见 DOM/style 全部落到内层 .radio
        aria-label={groupAriaLabel}
        onClick={onClick as ComponentProps<typeof HeroRadioGroup>['onClick']}
        isDisabled={isDisabled}
        isInvalid={isInvalid}
        name={name}
        onChange={handleGroupChange}
        {...groupSelectionProps}
      >
        <HeroRadio
          {...radioPassthrough}
          className={clsx('radio', className)}
          style={style as CSSProperties}
          value={radioValue}
          isDisabled={isDisabled}
          inputRef={inputRef}
        >
          {/* RadioButton：可点击行（圆点 + 标签），对齐 .radio__content [data-slot=label] */}
          <HeroRadio.Content>
            <HeroRadio.Control>
              <HeroRadio.Indicator />
            </HeroRadio.Control>
            {children !== undefined && (
              <span className="label" data-slot="label">
                {children}
              </span>
            )}
          </HeroRadio.Content>
          {/* field 级说明：作为 RadioButton 的兄弟，缩进对齐到标签下方 */}
          {description !== undefined && (
            <span className="description" data-slot="description">
              {description}
            </span>
          )}
        </HeroRadio>
      </HeroRadioGroup>
    );
  },
);

Radio.displayName = 'Radio';

export default Radio;
