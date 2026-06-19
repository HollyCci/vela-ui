'use client';

import {
  forwardRef,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { Switch as HeroSwitch, type SwitchProps as HeroSwitchProps } from '@heroui/react';

export type SwitchSize = 'sm' | 'md' | 'lg';

export type SwitchProps = Omit<
  HeroSwitchProps,
  'size' | 'children' | 'className' | 'style' | 'onChange'
> & {
  size?: SwitchSize;
  isSelected?: boolean;
  defaultSelected?: boolean;
  onSelectedChange?: (isSelected: boolean) => void;
  isDisabled?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /**
   * 事件桥接：消费方习惯传 onClick，而 RAC 在 label/根上删除 onClick。
   * 这里把 onClick 透传到底座的 Content（可见 label），click 仍会冒泡触发，事件不丢。
   */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
};

/**
 * 包装 @heroui/react 的 Switch（基于 react-aria-components，真 a11y/键盘/焦点/按压态）。
 * 公共契约保持不变：
 * - size/isSelected/defaultSelected/isDisabled 透传给底座；
 * - onSelectedChange 映射为底座 onChange(isSelected: boolean)；
 * - ref 经 inputRef 落在真实的 <input role="switch">（保留 forwardRef<HTMLInputElement>）；
 * - className/style 落在根 .switch 元素；
 * - children 渲染为 .switch__label；control/thumb 由底座 compound 组件组装，
 *   产出 .switch / .switch--<size> / .switch__control / .switch__thumb / .switch__content
 *   类，沿用同一 CSS 分片。
 */
const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ size = 'md', onSelectedChange, isDisabled = false, children, onClick, ...rest }, ref) => (
    <HeroSwitch
      // 底座 inputRef 把 ref 落到真实 <input>；RAC 内部 useObjectRef(mergeRefs)
      // 运行时同时接受 callback ref 与 object ref，这里仅做类型收窄。
      inputRef={ref as RefObject<HTMLInputElement | null>}
      size={size}
      isDisabled={isDisabled}
      onChange={onSelectedChange}
      {...rest}
    >
      <HeroSwitch.Content onClick={onClick}>
        <HeroSwitch.Control>
          <HeroSwitch.Thumb />
        </HeroSwitch.Control>
        {children !== undefined && <span className="switch__label">{children}</span>}
      </HeroSwitch.Content>
    </HeroSwitch>
  ),
);

Switch.displayName = 'Switch';

export default Switch;
