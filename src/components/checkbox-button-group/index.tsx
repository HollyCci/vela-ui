'use client';

import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import {
  Checkbox,
  CheckboxGroup,
  type CheckboxGroupProps,
  type CheckboxProps,
} from '@heroui/react';
import clsx from 'clsx';
import PressableFeedback from '../pressable-feedback';

export type CheckboxButtonGroupLayout = 'flex' | 'grid';
export type CheckboxButtonGroupItemPressFeedback = 'ripple' | 'none';
type CheckboxButtonGroupItemRenderProps = Parameters<
  Extract<CheckboxProps['children'], (...args: any[]) => unknown>
>[0];

export type CheckboxButtonGroupProps = Omit<CheckboxGroupProps, 'className' | 'style'> & {
  /** 布局模式（原站 API）：grid 时列数由调用方样式（如 gridTemplateColumns）决定 */
  layout?: CheckboxButtonGroupLayout;
  className?: string;
  style?: CSSProperties;
};

export type CheckboxButtonGroupItemProps = Omit<CheckboxProps, 'className' | 'style'> & {
  className?: string;
  pressFeedback?: CheckboxButtonGroupItemPressFeedback;
  style?: CSSProperties;
  withRipple?: boolean;
};

export type CheckboxButtonGroupIndicatorProps = HTMLAttributes<HTMLSpanElement>;

export type CheckboxButtonGroupItemContentProps = HTMLAttributes<HTMLDivElement>;

export type CheckboxButtonGroupItemIconProps = HTMLAttributes<HTMLDivElement>;

/** 卡片式可选项；render-prop children（访问选中态）由 OSS Checkbox 原样支持 */
const Item = ({
  children,
  className,
  isDisabled,
  pressFeedback = 'none',
  withRipple = false,
  ...rest
}: CheckboxButtonGroupItemProps) => {
  const hasRipple = withRipple || pressFeedback === 'ripple';
  const ripple = hasRipple ? (
    <PressableFeedback.Ripple
      isDisabled={isDisabled}
      className="checkbox-button-group__press-feedback"
    />
  ) : null;
  const content =
    typeof children === 'function'
      ? (renderProps: CheckboxButtonGroupItemRenderProps) => (
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
    <Checkbox
      data-slot="checkbox-button-group-item"
      className={clsx('checkbox-button-group__item', className)}
      isDisabled={isDisabled}
      {...rest}
    >
      {content}
    </Checkbox>
  );
};
Item.displayName = 'CheckboxButtonGroup.Item';

/**
 * 右上角选择指示器（原站 API）：
 * 无 children 渲染默认 OSS Checkbox.Control + Indicator（对勾）；
 * 有 children 渲染 data-custom 的普通 span，仅选中时可见由 CSS
 * `[data-selected=true]>.checkbox-button-group__indicator[data-custom=true]` 控制。
 */
const Indicator = ({ className, children, ...rest }: CheckboxButtonGroupIndicatorProps) => {
  if (children === undefined) {
    return (
      <Checkbox.Control
        data-slot="checkbox-button-group-indicator"
        className={clsx('checkbox-button-group__indicator', className)}
        {...rest}
      >
        <Checkbox.Indicator />
      </Checkbox.Control>
    );
  }

  return (
    <span
      data-custom="true"
      data-slot="checkbox-button-group-indicator"
      className={clsx('checkbox-button-group__indicator', className)}
      {...rest}
    >
      {children}
    </span>
  );
};
Indicator.displayName = 'CheckboxButtonGroup.Indicator';

/** 包装 OSS Checkbox.Content 的文本内容区 */
const ItemContent = ({ className, ...rest }: CheckboxButtonGroupItemContentProps) => (
  <Checkbox.Content
    data-slot="checkbox-button-group-item-content"
    className={clsx('checkbox-button-group__item-content', className)}
    {...rest}
  />
);
ItemContent.displayName = 'CheckboxButtonGroup.ItemContent';

const ItemIcon = forwardRef<HTMLDivElement, CheckboxButtonGroupItemIconProps>(
  ({ className, ...rest }, ref) => (
    <div
      ref={ref}
      data-slot="checkbox-button-group-item-icon"
      className={clsx('checkbox-button-group__item-icon', className)}
      {...rest}
    />
  ),
);
ItemIcon.displayName = 'CheckboxButtonGroup.ItemIcon';

/**
 * 包装 OSS CheckboxGroup 的卡片多选组（原站 API）：
 * 受控 value/onChange、isDisabled、键盘交互由底座提供。
 * 原站快照所有 demo 根类均为 checkbox-group--secondary，故默认 variant=secondary（可透传覆盖）。
 */
const CheckboxButtonGroupRoot = forwardRef<HTMLDivElement, CheckboxButtonGroupProps>(
  ({ layout = 'flex', className, ...rest }, ref) => (
    <CheckboxGroup
      ref={ref}
      data-slot="checkbox-button-group"
      variant="secondary"
      className={clsx(
        'checkbox-button-group',
        layout === 'grid' && 'checkbox-button-group--grid',
        className,
      )}
      {...rest}
    />
  ),
);
CheckboxButtonGroupRoot.displayName = 'CheckboxButtonGroup';

const CheckboxButtonGroup = Object.assign(CheckboxButtonGroupRoot, {
  Item,
  Indicator,
  ItemContent,
  ItemIcon,
});

export default CheckboxButtonGroup;
