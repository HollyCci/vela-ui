'use client';

import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import { Radio, RadioGroup, type RadioGroupProps, type RadioProps } from '@heroui/react';
import clsx from 'clsx';
import PressableFeedback from '../pressable-feedback';

export type RadioButtonGroupLayout = 'flex' | 'grid';
export type RadioButtonGroupItemPressFeedback = 'ripple' | 'none';
type RadioButtonGroupItemRenderProps = Parameters<
  Extract<RadioProps['children'], (...args: never[]) => unknown>
>[0];

export type RadioButtonGroupProps = Omit<RadioGroupProps, 'className' | 'style'> & {
  /** 布局模式（参考 API）：grid 时列数由调用方样式（如 gridTemplateColumns）决定 */
  layout?: RadioButtonGroupLayout;
  className?: string;
  style?: CSSProperties;
};

export type RadioButtonGroupItemProps = Omit<RadioProps, 'className' | 'style'> & {
  className?: string;
  pressFeedback?: RadioButtonGroupItemPressFeedback;
  style?: CSSProperties;
  withRipple?: boolean;
};

export type RadioButtonGroupIndicatorProps = HTMLAttributes<HTMLSpanElement>;

export type RadioButtonGroupItemContentProps = HTMLAttributes<HTMLLabelElement>;

export type RadioButtonGroupItemIconProps = HTMLAttributes<HTMLDivElement>;

/** 卡片式单选项；render-prop children（访问选中态）由 OSS Radio 原样支持 */
const Item = ({
  children,
  className,
  isDisabled,
  pressFeedback = 'none',
  withRipple = false,
  ...rest
}: RadioButtonGroupItemProps) => {
  const hasRipple = withRipple || pressFeedback === 'ripple';
  const ripple = hasRipple ? (
    <PressableFeedback.Ripple
      isDisabled={isDisabled}
      className="radio-button-group__press-feedback"
    />
  ) : null;
  const content =
    typeof children === 'function'
      ? (renderProps: RadioButtonGroupItemRenderProps) => (
          <>
            {ripple}
            {children(renderProps)}
          </>
        )
      : (
          <>
            {ripple}
            {children}
          </>
        );

  return (
    <Radio
      data-slot="radio-button-group-item"
      className={clsx('radio-button-group__item', className)}
      isDisabled={isDisabled}
      {...rest}
    >
      {content}
    </Radio>
  );
};
Item.displayName = 'RadioButtonGroup.Item';

/**
 * 右上角选择指示器（参考 API）：
 * 无 children 渲染默认 OSS Radio.Control + Indicator（圆点）；
 * 有 children 渲染 data-custom 的普通 span，仅选中时可见由 CSS
 * `[data-selected=true]>.radio-button-group__indicator[data-custom=true]` 控制。
 */
const Indicator = ({ className, children, ...rest }: RadioButtonGroupIndicatorProps) => {
  if (children === undefined) {
    return (
      <Radio.Control
        data-slot="radio-button-group-indicator"
        className={clsx('radio-button-group__indicator', className)}
        {...rest}
      >
        <Radio.Indicator />
      </Radio.Control>
    );
  }

  return (
    <span
      data-custom="true"
      data-slot="radio-button-group-indicator"
      className={clsx('radio-button-group__indicator', className)}
      {...rest}
    >
      {children}
    </span>
  );
};
Indicator.displayName = 'RadioButtonGroup.Indicator';

/** 包装 OSS Radio.Content 的文本内容区 */
const ItemContent = ({ className, ...rest }: RadioButtonGroupItemContentProps) => (
  <Radio.Content
    data-slot="radio-button-group-item-content"
    className={clsx('radio-button-group__item-content', className)}
    {...rest}
  />
);
ItemContent.displayName = 'RadioButtonGroup.ItemContent';

const ItemIcon = forwardRef<HTMLDivElement, RadioButtonGroupItemIconProps>(
  ({ className, ...rest }, ref) => (
    <div
      ref={ref}
      data-slot="radio-button-group-item-icon"
      className={clsx('radio-button-group__item-icon', className)}
      {...rest}
    />
  ),
);
ItemIcon.displayName = 'RadioButtonGroup.ItemIcon';

/**
 * 包装 OSS RadioGroup 的卡片单选组（参考 API）：
 * 受控 value/onChange、isDisabled、键盘/方向键交互由底座提供。
 * 参考实现快照默认 demo 根类为 radio-group--secondary，故默认 variant=secondary（可透传覆盖）。
 */
const RadioButtonGroupRoot = forwardRef<HTMLDivElement, RadioButtonGroupProps>(
  ({ layout = 'flex', className, ...rest }, ref) => (
    <RadioGroup
      ref={ref}
      data-slot="radio-button-group"
      variant="secondary"
      className={clsx(
        'radio-button-group',
        layout === 'grid' && 'radio-button-group--grid',
        className,
      )}
      {...rest}
    />
  ),
);
RadioButtonGroupRoot.displayName = 'RadioButtonGroup';

const RadioButtonGroup = Object.assign(RadioButtonGroupRoot, {
  Item,
  Indicator,
  ItemContent,
  ItemIcon,
});

export default RadioButtonGroup;
