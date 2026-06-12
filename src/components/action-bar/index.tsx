import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';
import Toolbar from '../toolbar';

export type ActionBarProps = HTMLAttributes<HTMLDivElement> & {
  isOpen?: boolean;
  children: ReactNode;
};

type SectionProps = HTMLAttributes<HTMLDivElement>;

const ActionBarRoot = forwardRef<HTMLDivElement, ActionBarProps>(
  ({ isOpen = true, className, children, ...rest }, ref) => {
    if (!isOpen) return null;
    return (
      <div ref={ref} className={clsx('action-bar', className)} {...rest}>
        <Toolbar isAttached className="action-bar__wrapper">
          {children}
        </Toolbar>
      </div>
    );
  },
);

ActionBarRoot.displayName = 'ActionBar';

const Prefix = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('action-bar__prefix', className)} {...rest} />
));
Prefix.displayName = 'ActionBar.Prefix';

const Content = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('action-bar__content', className)} {...rest} />
));
Content.displayName = 'ActionBar.Content';

const Suffix = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('action-bar__suffix', className)} {...rest} />
));
Suffix.displayName = 'ActionBar.Suffix';

export type ActionBarLabelProps = HTMLAttributes<HTMLSpanElement>;

const Label = forwardRef<HTMLSpanElement, ActionBarLabelProps>(({ className, ...rest }, ref) => (
  <span ref={ref} className={clsx('action-bar__label', className)} {...rest} />
));
Label.displayName = 'ActionBar.Label';

const ActionBar = Object.assign(ActionBarRoot, { Prefix, Content, Suffix, Label });

export default ActionBar;
