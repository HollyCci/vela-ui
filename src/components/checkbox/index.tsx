'use client';

import {
  forwardRef,
  useEffect,
  useRef,
  type ChangeEvent,
  type ComponentProps,
  type CSSProperties,
  type InputHTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type MutableRefObject,
  type ReactNode,
  type Ref,
} from 'react';
import { Checkbox as HeroCheckbox } from '@heroui/react';

export type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'checked' | 'defaultChecked' | 'onChange' | 'children'
> & {
  isSelected?: boolean;
  defaultSelected?: boolean;
  onSelectedChange?: (isSelected: boolean) => void;
  isIndeterminate?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  variant?: 'default' | 'secondary';
  description?: ReactNode;
  children?: ReactNode;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  /** 旧契约保留：点击真 <input> 时触发（底座 RAC 偏好 onPress，这里桥接到真 DOM click） */
  onPress?: (event: ReactMouseEvent<HTMLInputElement>) => void;
};

// 底座 CheckboxField 接受的 props（含 RAC 全局 DOM 属性）；用于把透传 rest 收敛到底座可接受的形状，
// 既保留旧契约的 input 透传，又规避 RAC 把 onClick/onFocus 等事件按元素泛型重定义导致的类型不兼容。
type HeroCheckboxProps = ComponentProps<typeof HeroCheckbox>;

const setRef = <T,>(ref: Ref<T> | undefined, value: T) => {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref !== undefined && ref !== null) {
    (ref as MutableRefObject<T>).current = value;
  }
};

/**
 * 复选项 — 包装 OSS `@heroui/react` 的 Checkbox（底座为 react-aria-components，真 a11y/键盘/焦点/按压态）。
 *
 * 契约保真说明：对外保持旧契约（isSelected / defaultSelected / onSelectedChange / isIndeterminate /
 * isInvalid / isDisabled / variant / description / 原生 onChange / forwardRef→真 input）。底座 RAC 的
 * CheckboxField 独立可用（无需 CheckboxGroup），选中/半选/校验/禁用态由 useCheckbox 驱动并落到真 <input>。
 * DOM/类名仍与样式分片对齐：CheckboxField=.checkbox（落 className/style + data-selected/indeterminate/
 * disabled/invalid），CheckboxButton=.checkbox__content（可点击行），control/indicator 由底座插槽渲染。
 */
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      isSelected,
      defaultSelected = false,
      onSelectedChange,
      isIndeterminate = false,
      isInvalid = false,
      isDisabled = false,
      variant = 'default',
      description,
      children,
      className,
      style,
      onChange,
      onClick,
      onPress,
      ...rest
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement | null>(null);

    // RAC 把真 <input> 挂到 inputRef 后，把同一节点桥接给外部 ref（overlay 触发器需真 DOM ref）
    useEffect(() => {
      setRef(ref, inputRef.current);
      return () => setRef(ref, null);
    });

    // 事件模型桥接：RAC/heroui 在 field/button 上 `delete onClick`（偏好 onPress），旧契约的 onClick/onPress
    // 改挂到真 <input> 的原生 click 上，点击复选框时按旧语义触发（call the handler，不丢事件）。
    useEffect(() => {
      const node = inputRef.current;
      if (!node || (!onClick && !onPress)) return;
      const handle = (event: globalThis.MouseEvent) => {
        const reactish = event as unknown as ReactMouseEvent<HTMLInputElement>;
        onClick?.(reactish);
        onPress?.(reactish);
      };
      node.addEventListener('click', handle);
      return () => node.removeEventListener('click', handle);
    }, [onClick, onPress]);

    const handleChange = (next: boolean) => {
      onSelectedChange?.(next);
      if (onChange && inputRef.current) {
        // 桥接旧契约的原生 onChange：从真 input 合成事件，target.checked 反映新选中态
        onChange({
          target: inputRef.current,
          currentTarget: inputRef.current,
        } as ChangeEvent<HTMLInputElement>);
      }
    };

    // 受控走 isSelected，非受控走 defaultSelected
    const selectionProps =
      isSelected === undefined ? { defaultSelected } : { isSelected };

    return (
      <HeroCheckbox
        // CheckboxField=.checkbox：className/style/data-* 与状态都落在这里（.checkbox/.checkbox--secondary 由底座 variant 产出）
        className={className}
        style={style as CSSProperties}
        // 旧契约 variant: 'default' | 'secondary' → 底座 'primary' | 'secondary'
        variant={variant === 'secondary' ? 'secondary' : 'primary'}
        isIndeterminate={isIndeterminate}
        isInvalid={isInvalid}
        isDisabled={isDisabled}
        onChange={handleChange}
        inputRef={inputRef}
        {...selectionProps}
        // rest 为旧契约的 input 透传（aria-*/name/value/id/data-*/tabIndex/onFocus…）；RAC 在运行期按全局 DOM
        // 属性接收它们，仅因事件处理器的元素泛型不同而类型不兼容，故收敛到底座 props 形状透传
        {...(rest as Partial<HeroCheckboxProps>)}
      >
        {/* CheckboxButton：可点击行（方框 + 标签），对齐 .checkbox__content [data-slot=label] */}
        <HeroCheckbox.Content>
          <HeroCheckbox.Control>
            <HeroCheckbox.Indicator />
          </HeroCheckbox.Control>
          {children !== undefined && (
            <span className="label" data-slot="label">
              {children}
            </span>
          )}
        </HeroCheckbox.Content>
        {/* field 级说明：作为 CheckboxButton 的兄弟，缩进对齐到标签下方 */}
        {description !== undefined && (
          <span className="description" data-slot="description">
            {description}
          </span>
        )}
      </HeroCheckbox>
    );
  },
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
