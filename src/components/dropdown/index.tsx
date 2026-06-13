import {
  Dropdown as HeroDropdown,
  type DropdownMenuProps as HeroDropdownMenuProps,
  type DropdownPopoverProps as HeroDropdownPopoverProps,
  type DropdownRootProps as HeroDropdownRootProps,
  type DropdownSectionProps as HeroDropdownSectionProps,
  type DropdownTriggerProps as HeroDropdownTriggerProps,
} from '@heroui/react';
import clsx from 'clsx';

export type DropdownProps = Omit<HeroDropdownRootProps, 'className' | 'style'> & {
  className?: string;
};
export type DropdownTriggerProps = HeroDropdownTriggerProps;
export type DropdownPopoverProps = HeroDropdownPopoverProps;
export type DropdownMenuProps<T extends object = object> = HeroDropdownMenuProps<T>;
export type DropdownSectionProps = HeroDropdownSectionProps;

const DropdownRoot = ({ className, ...rest }: DropdownProps) => (
  <HeroDropdown.Root className={clsx('dropdown', className)} {...rest} />
);
DropdownRoot.displayName = 'Dropdown';

const Trigger = ({ className, ...rest }: DropdownTriggerProps) => (
  <HeroDropdown.Trigger className={clsx('dropdown__trigger', className)} {...rest} />
);
Trigger.displayName = 'Dropdown.Trigger';

const Popover = ({ className, placement = 'bottom', ...rest }: DropdownPopoverProps) => (
  <HeroDropdown.Popover
    className={clsx('dropdown__popover', className)}
    placement={placement}
    {...rest}
  />
);
Popover.displayName = 'Dropdown.Popover';

function Menu<T extends object = object>({ className, ...rest }: DropdownMenuProps<T>) {
  return <HeroDropdown.Menu<T> className={clsx('dropdown__menu', className)} {...rest} />;
}
Menu.displayName = 'Dropdown.Menu';

const Section = (props: DropdownSectionProps) => <HeroDropdown.Section {...props} />;
Section.displayName = 'Dropdown.Section';

const Dropdown = Object.assign(DropdownRoot, {
  Trigger,
  Popover,
  Menu,
  Section,
});

export default Dropdown;
