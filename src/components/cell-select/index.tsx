'use client';

import {
  createContext,
  forwardRef,
  useContext,
  type ComponentProps,
  type CSSProperties,
  type HTMLAttributes,
  type SVGProps,
} from 'react';
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

export type CellSelectVariant = 'default' | 'secondary';

/** 原站 API：variant 是 cell-select 自己的视觉变体，OSS Select 的 variant 不透传（root 保持 select--primary） */
export type CellSelectProps<
  T extends object = object,
  M extends 'single' | 'multiple' = 'single',
> = Omit<SelectRootProps<T, M>, 'className' | 'style' | 'variant'> & {
  variant?: CellSelectVariant;
  className?: string;
  style?: CSSProperties;
};

export type CellSelectTriggerProps = Omit<SelectTriggerProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type CellSelectLabelProps = HTMLAttributes<HTMLSpanElement>;

export type CellSelectValueProps = Omit<SelectValueProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type CellSelectIndicatorProps = ComponentProps<typeof Select.Indicator>;

export type CellSelectPopoverProps = Omit<SelectPopoverProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type CellSelectListProps<T extends object = object> = Omit<
  ListBoxProps<T>,
  'className' | 'style'
> & {
  className?: string;
  style?: CSSProperties;
};

export type CellSelectItemProps = Omit<ListBoxItemProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type CellSelectItemIndicatorProps = ComponentProps<typeof ListBox.ItemIndicator>;

/** Trigger 需要根据根组件 variant 渲染对应修饰类 */
const CellSelectContext = createContext<CellSelectVariant>('default');

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
ChevronsExpandVerticalIcon.displayName = 'CellSelect.ChevronsExpandVerticalIcon';

/** 可见的整行单元格触发器；快照中 default 变体也带 --default 修饰类 */
const Trigger = ({ className, ...rest }: CellSelectTriggerProps) => {
  const variant = useContext(CellSelectContext);

  return (
    <Select.Trigger
      data-slot="cell-select-trigger"
      className={clsx('cell-select__trigger', `cell-select__trigger--${variant}`, className)}
      {...rest}
    />
  );
};
Trigger.displayName = 'CellSelect.Trigger';

const Label = forwardRef<HTMLSpanElement, CellSelectLabelProps>(({ className, ...rest }, ref) => (
  <span
    ref={ref}
    data-slot="cell-select-label"
    className={clsx('cell-select__label', className)}
    {...rest}
  />
));
Label.displayName = 'CellSelect.Label';

const Value = ({ className, ...rest }: CellSelectValueProps) => (
  <Select.Value
    data-slot="cell-select-value"
    className={clsx('cell-select__value', className)}
    {...rest}
  />
);
Value.displayName = 'CellSelect.Value';

/**
 * 包装 OSS Select.Indicator：无 children 时渲染原站默认 ChevronsExpandVertical 图标（原站 API）。
 * OSS 通过 cloneElement 把 className/data-slot="select-indicator"/data-open 合并到子 svg 上。
 */
const Indicator = ({ className, children, ...rest }: CellSelectIndicatorProps) => (
  <Select.Indicator className={clsx('cell-select__indicator', className)} {...rest}>
    {children ?? <ChevronsExpandVerticalIcon />}
  </Select.Indicator>
);
Indicator.displayName = 'CellSelect.Indicator';

/** 原站默认 placement 为 'bottom end'（OSS 默认是 'bottom'） */
const Popover = ({ className, placement = 'bottom end', ...rest }: CellSelectPopoverProps) => (
  <Select.Popover
    placement={placement}
    className={clsx('cell-select__popover', className)}
    {...rest}
  />
);
Popover.displayName = 'CellSelect.Popover';

const List = <T extends object = object>({ className, ...rest }: CellSelectListProps<T>) => (
  <ListBox
    data-slot="cell-select-list"
    className={clsx('cell-select__list', className)}
    {...rest}
  />
);
List.displayName = 'CellSelect.List';

const Item = ({ className, ...rest }: CellSelectItemProps) => (
  <ListBox.Item
    data-slot="cell-select-item"
    className={clsx('cell-select__item', className)}
    {...rest}
  />
);
Item.displayName = 'CellSelect.Item';

const ItemIndicator = ({ className, ...rest }: CellSelectItemIndicatorProps) => (
  <ListBox.ItemIndicator
    data-slot="cell-select-item-indicator"
    className={clsx('cell-select__item-indicator', className)}
    {...rest}
  />
);
ItemIndicator.displayName = 'CellSelect.ItemIndicator';

/**
 * 包装 OSS Select 的设置单元格下拉（原站 API "wraps Select"）：真实弹出列表、键盘导航、
 * 受控 value/onChange、isDisabled（data-disabled 落到 root/trigger）均由底座提供。
 */
function CellSelectRoot<
  T extends object = object,
  M extends 'single' | 'multiple' = 'single',
>({ variant = 'default', className, ...rest }: CellSelectProps<T, M>) {
  return (
    <CellSelectContext.Provider value={variant}>
      <Select data-slot="cell-select" className={clsx('cell-select', className)} {...rest} />
    </CellSelectContext.Provider>
  );
}
CellSelectRoot.displayName = 'CellSelect';

const CellSelect = Object.assign(CellSelectRoot, {
  Trigger,
  Label,
  Value,
  Indicator,
  Popover,
  List,
  Item,
  ItemIndicator,
});

export default CellSelect;
