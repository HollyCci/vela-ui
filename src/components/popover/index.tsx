import type { CSSProperties, ReactNode } from 'react';
import {
  Popover as HeroPopover,
  type PopoverArrowProps as HeroPopoverArrowProps,
  type PopoverContentProps as HeroPopoverContentProps,
  type PopoverDialogProps as HeroPopoverDialogProps,
  type PopoverHeadingProps as HeroPopoverHeadingProps,
  type PopoverRootProps as HeroPopoverRootProps,
  type PopoverTriggerProps as HeroPopoverTriggerProps,
} from '@heroui/react';
import clsx from 'clsx';

export type PopoverPlacement = NonNullable<HeroPopoverContentProps['placement']>;

export type PopoverProps = Omit<HeroPopoverRootProps, 'className' | 'style'> & {
  trigger?: ReactNode;
  placement?: PopoverPlacement;
  className?: string;
  style?: CSSProperties;
};

export type PopoverTriggerProps = HeroPopoverTriggerProps;
export type PopoverContentProps = HeroPopoverContentProps;
export type PopoverDialogProps = HeroPopoverDialogProps;
export type PopoverArrowProps = HeroPopoverArrowProps;
export type PopoverHeadingProps = HeroPopoverHeadingProps;

const Trigger = ({ className, ...rest }: PopoverTriggerProps) => (
  <HeroPopover.Trigger className={clsx('popover__trigger', className)} {...rest} />
);
Trigger.displayName = 'Popover.Trigger';

const Content = ({ className, placement = 'bottom', ...rest }: PopoverContentProps) => (
  <HeroPopover.Content
    className={clsx('popover', className)}
    placement={placement}
    {...rest}
  />
);
Content.displayName = 'Popover.Content';

const Dialog = ({ className, ...rest }: PopoverDialogProps) => (
  <HeroPopover.Dialog className={clsx('popover__dialog', className)} {...rest} />
);
Dialog.displayName = 'Popover.Dialog';

const Arrow = ({ className, ...rest }: PopoverArrowProps) => (
  <HeroPopover.Arrow className={className} {...rest} />
);
Arrow.displayName = 'Popover.Arrow';

const Heading = ({ className, ...rest }: PopoverHeadingProps) => (
  <HeroPopover.Heading className={clsx('popover__heading', className)} {...rest} />
);
Heading.displayName = 'Popover.Heading';

const PopoverRoot = ({ trigger, placement = 'bottom', className, style, children, ...rest }: PopoverProps) => {
  if (trigger !== undefined) {
    return (
      <HeroPopover.Root {...rest}>
        <Trigger>{trigger}</Trigger>
        <Content placement={placement} style={style}>
          <Dialog className={className}>{children}</Dialog>
        </Content>
      </HeroPopover.Root>
    );
  }

  return <HeroPopover.Root {...rest}>{children}</HeroPopover.Root>;
};
PopoverRoot.displayName = 'Popover';

const Popover = Object.assign(PopoverRoot, {
  Trigger,
  Content,
  Dialog,
  Arrow,
  Heading,
});

export default Popover;
