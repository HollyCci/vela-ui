'use client';

import type { ComponentProps, CSSProperties, SVGProps } from 'react';
import {
  ListBox,
  type ListBoxItemProps,
  type ListBoxProps,
  Select as HeroSelect,
  type SelectPopoverProps as HeroSelectPopoverProps,
  type SelectRootProps as HeroSelectRootProps,
  type SelectTriggerProps as HeroSelectTriggerProps,
  type SelectValueProps as HeroSelectValueProps,
} from '@heroui/react';
import clsx from 'clsx';

export type SelectVariant = 'primary' | 'secondary';

export type SelectProps<
  T extends object = object,
  M extends 'single' | 'multiple' = 'single',
> = Omit<HeroSelectRootProps<T, M>, 'className' | 'style' | 'variant' | 'fullWidth'> & {
  variant?: SelectVariant;
  fullWidth?: boolean;
  className?: string;
  style?: CSSProperties;
};

export type SelectTriggerProps = Omit<HeroSelectTriggerProps, 'className' | 'style'> & {
  fullWidth?: boolean;
  className?: string;
  style?: CSSProperties;
};

export type SelectValueProps = Omit<HeroSelectValueProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type SelectIndicatorProps = ComponentProps<typeof HeroSelect.Indicator>;

export type SelectPopoverProps = Omit<HeroSelectPopoverProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type SelectListProps<T extends object = object> = Omit<
  ListBoxProps<T>,
  'className' | 'style'
> & {
  className?: string;
  style?: CSSProperties;
};

export type SelectItemProps = Omit<ListBoxItemProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type SelectItemIndicatorProps = ComponentProps<typeof ListBox.ItemIndicator>;

const ChevronDownIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    aria-hidden="true"
    fill="none"
    height="16"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    width="16"
    {...props}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);
ChevronDownIcon.displayName = 'Select.ChevronDownIcon';

const Trigger = ({ className, fullWidth = false, ...rest }: SelectTriggerProps) => (
  <HeroSelect.Trigger
    className={clsx('select__trigger', fullWidth && 'select__trigger--full-width', className)}
    {...rest}
  />
);
Trigger.displayName = 'Select.Trigger';

const Value = ({ className, ...rest }: SelectValueProps) => (
  <HeroSelect.Value className={clsx('select__value', className)} {...rest} />
);
Value.displayName = 'Select.Value';

const Indicator = ({ className, children, ...rest }: SelectIndicatorProps) => (
  <HeroSelect.Indicator className={clsx('select__indicator', className)} {...rest}>
    {children ?? <ChevronDownIcon data-slot="select-default-indicator" />}
  </HeroSelect.Indicator>
);
Indicator.displayName = 'Select.Indicator';

const Popover = ({ className, placement = 'bottom', ...rest }: SelectPopoverProps) => (
  <HeroSelect.Popover
    placement={placement}
    className={clsx('select__popover', className)}
    {...rest}
  />
);
Popover.displayName = 'Select.Popover';

const List = <T extends object = object>({ className, ...rest }: SelectListProps<T>) => (
  <ListBox className={className} {...rest} />
);
List.displayName = 'Select.List';

const Item = ({ className, ...rest }: SelectItemProps) => (
  <ListBox.Item className={className} {...rest} />
);
Item.displayName = 'Select.Item';

const ItemIndicator = ({ className, ...rest }: SelectItemIndicatorProps) => (
  <ListBox.ItemIndicator className={className} {...rest} />
);
ItemIndicator.displayName = 'Select.ItemIndicator';

function SelectRoot<
  T extends object = object,
  M extends 'single' | 'multiple' = 'single',
>({ variant = 'primary', fullWidth = false, className, ...rest }: SelectProps<T, M>) {
  return (
    <HeroSelect
      data-slot="select"
      variant={variant}
      fullWidth={fullWidth}
      className={clsx(
        'select',
        variant === 'secondary' && 'select--secondary',
        fullWidth && 'select--full-width',
        className,
      )}
      {...rest}
    />
  );
}
SelectRoot.displayName = 'Select';

const Select = Object.assign(SelectRoot, {
  Trigger,
  Value,
  Indicator,
  Popover,
  List,
  Item,
  ItemIndicator,
});

export default Select;
