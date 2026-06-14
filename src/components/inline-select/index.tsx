'use client';

import type { ComponentProps, CSSProperties, SVGProps } from 'react';
import {
  ListBox,
  type ListBoxItemProps,
  type ListBoxProps,
  Select,
  type SelectPopoverProps,
  type SelectRootProps,
  type SelectTriggerProps,
  type SelectValueProps,
} from '@heroui/react';
import clsx from 'clsx';

export type InlineSelectProps<
  T extends object = object,
  M extends 'single' | 'multiple' = 'single',
> = Omit<SelectRootProps<T, M>, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type InlineSelectTriggerProps = Omit<SelectTriggerProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type InlineSelectValueProps = Omit<SelectValueProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type InlineSelectIndicatorProps = ComponentProps<typeof Select.Indicator>;

export type InlineSelectPopoverProps = Omit<SelectPopoverProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type InlineSelectListProps<T extends object = object> = Omit<
  ListBoxProps<T>,
  'className' | 'style'
> & {
  className?: string;
  style?: CSSProperties;
};

export type InlineSelectItemProps = Omit<ListBoxItemProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type InlineSelectItemIndicatorProps = ComponentProps<typeof ListBox.ItemIndicator>;

/**
 * 原站默认指示器（ChevronsExpandVertical，16x16）；快照中 clipPath id 即为 "a"。
 * 必须透传 props：OSS Select.Indicator 通过 cloneElement 注入 className/data-slot/data-open。
 */
const ChevronsExpandVerticalIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    fill="none"
    height="16"
    viewBox="0 0 16 16"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clipPath="url(#a)">
      <path
        clipRule="evenodd"
        d="M3.58 4.109a.75.75 0 0 0 1.061 1.06L8 1.811l3.354 3.353a.75.75 0 0 0 1.06-1.06L8.53.22a.75.75 0 0 0-1.06 0zm8.84 7.782a.75.75 0 1 0-1.061-1.06l-3.36 3.358-3.353-3.353a.75.75 0 1 0-1.06 1.06L7.47 15.78a.75.75 0 0 0 1.06 0z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </g>
    <defs>
      <clipPath id="a">
        <path d="M0 0h16v16H0z" fill="currentColor" />
      </clipPath>
    </defs>
  </svg>
);
ChevronsExpandVerticalIcon.displayName = 'InlineSelect.ChevronsExpandVerticalIcon';

const Trigger = ({ className, ...rest }: InlineSelectTriggerProps) => (
  <Select.Trigger
    data-slot="inline-select-trigger"
    className={clsx('inline-select__trigger', className)}
    {...rest}
  />
);
Trigger.displayName = 'InlineSelect.Trigger';

const Value = ({ className, ...rest }: InlineSelectValueProps) => (
  <Select.Value
    data-slot="inline-select-value"
    className={clsx('inline-select__value', className)}
    {...rest}
  />
);
Value.displayName = 'InlineSelect.Value';

/**
 * 包装 OSS Select.Indicator：无 children 时渲染原站默认 ChevronsExpandVertical 图标（原站 API）。
 * OSS 通过 cloneElement 把 className/data-slot="select-indicator"/data-open 合并到子 svg 上，
 * 故 data-slot 不可覆盖，与快照一致。
 */
const Indicator = ({ className, children, ...rest }: InlineSelectIndicatorProps) => (
  <Select.Indicator className={clsx('inline-select__indicator', className)} {...rest}>
    {children ?? <ChevronsExpandVerticalIcon />}
  </Select.Indicator>
);
Indicator.displayName = 'InlineSelect.Indicator';

/** 原站默认 placement 为 'bottom end'（OSS 默认是 'bottom'） */
const Popover = ({ className, placement = 'bottom end', ...rest }: InlineSelectPopoverProps) => (
  <Select.Popover
    placement={placement}
    className={clsx('inline-select__popover', className)}
    {...rest}
  />
);
Popover.displayName = 'InlineSelect.Popover';

const List = <T extends object = object>({ className, ...rest }: InlineSelectListProps<T>) => (
  <ListBox
    data-slot="inline-select-list"
    className={clsx('inline-select__list', className)}
    {...rest}
  />
);
List.displayName = 'InlineSelect.List';

const Item = ({ className, ...rest }: InlineSelectItemProps) => (
  <ListBox.Item
    data-slot="inline-select-item"
    className={clsx('inline-select__item', className)}
    {...rest}
  />
);
Item.displayName = 'InlineSelect.Item';

const ItemIndicator = ({ className, ...rest }: InlineSelectItemIndicatorProps) => (
  <ListBox.ItemIndicator
    data-slot="inline-select-item-indicator"
    className={clsx('inline-select__item-indicator', className)}
    {...rest}
  />
);
ItemIndicator.displayName = 'InlineSelect.ItemIndicator';

/**
 * 包装 OSS Select 的行内下拉（原站 API）：真实弹出列表、键盘导航、typeahead、
 * 受控 value/onChange、selectionMode="multiple" 多选均由底座（RAC Select）提供。
 */
function InlineSelectRoot<
  T extends object = object,
  M extends 'single' | 'multiple' = 'single',
>({ className, ...rest }: InlineSelectProps<T, M>) {
  return <Select data-slot="inline-select" className={clsx('inline-select', className)} {...rest} />;
}
InlineSelectRoot.displayName = 'InlineSelect';

const InlineSelect = Object.assign(InlineSelectRoot, {
  Trigger,
  Value,
  Indicator,
  Popover,
  List,
  Item,
  ItemIndicator,
});

export default InlineSelect;
