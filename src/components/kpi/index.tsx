import { forwardRef, type HTMLAttributes } from 'react';
import clsx from 'clsx';

export type KpiStatus = 'success' | 'warning' | 'danger';

export type KpiProps = HTMLAttributes<HTMLDivElement>;

type SectionProps = HTMLAttributes<HTMLDivElement>;

export type KpiIconProps = HTMLAttributes<HTMLDivElement> & {
  status?: KpiStatus;
};

const KpiRoot = forwardRef<HTMLDivElement, KpiProps>(({ className, ...rest }, ref) => (
  <div ref={ref} data-slot="kpi" className={clsx('kpi', className)} {...rest} />
));
KpiRoot.displayName = 'Kpi';

const Header = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('kpi__header', className)} {...rest} />
));
Header.displayName = 'Kpi.Header';

const Content = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('kpi__content', className)} {...rest} />
));
Content.displayName = 'Kpi.Content';

const Icon = forwardRef<HTMLDivElement, KpiIconProps>(({ status, className, ...rest }, ref) => (
  <div
    ref={ref}
    data-status={status}
    aria-hidden="true"
    className={clsx('kpi__icon', className)}
    {...rest}
  />
));
Icon.displayName = 'Kpi.Icon';

const Title = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('kpi__title', className)} {...rest} />
));
Title.displayName = 'Kpi.Title';

const Value = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('kpi__value', className)} {...rest} />
));
Value.displayName = 'Kpi.Value';

const Trend = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('kpi__trend', className)} {...rest} />
));
Trend.displayName = 'Kpi.Trend';

const Progress = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('kpi__progress', className)} {...rest} />
));
Progress.displayName = 'Kpi.Progress';

const Chart = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('kpi__chart', className)} {...rest} />
));
Chart.displayName = 'Kpi.Chart';

const KpiSeparator = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    role="separator"
    className={clsx('kpi__separator', 'separator', 'separator--horizontal', className)}
    {...rest}
  />
));
KpiSeparator.displayName = 'Kpi.Separator';

const Footer = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('kpi__footer', className)} {...rest} />
));
Footer.displayName = 'Kpi.Footer';

const Actions = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('kpi__actions', className)} {...rest} />
));
Actions.displayName = 'Kpi.Actions';

const Kpi = Object.assign(KpiRoot, {
  Header,
  Content,
  Icon,
  Title,
  Value,
  Trend,
  Progress,
  Chart,
  Separator: KpiSeparator,
  Footer,
  Actions,
});

export default Kpi;
