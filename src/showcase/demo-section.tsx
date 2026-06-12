import type { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

export type DemoSectionProps = HTMLAttributes<HTMLDivElement> & {
  label?: string;
  isColumn?: boolean;
  children: ReactNode;
};

const DemoSection = ({ label, isColumn = false, className, children, ...rest }: DemoSectionProps) => (
  <div className={clsx('sc-demo', isColumn && 'sc-demo--column', className)} {...rest}>
    {label !== undefined && <span className="sc-demo__label">{label}</span>}
    {children}
  </div>
);

DemoSection.displayName = 'DemoSection';

export default DemoSection;
