import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import clsx from 'clsx';

export type WidgetProps = HTMLAttributes<HTMLDivElement>;

type SectionProps = HTMLAttributes<HTMLDivElement>;

export type WidgetLegendItemProps = HTMLAttributes<HTMLDivElement> & {
  /** 圆点颜色（CSS 颜色值或 var(--xxx)） */
  dotColor?: string;
  label: string;
};

const WidgetRoot = forwardRef<HTMLDivElement, WidgetProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('widget', className)} {...rest} />
));
WidgetRoot.displayName = 'Widget';

const Header = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('widget__header', className)} {...rest} />
));
Header.displayName = 'Widget.Header';

const Title = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('widget__title', className)} {...rest} />
));
Title.displayName = 'Widget.Title';

const Description = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('widget__description', className)} {...rest} />
));
Description.displayName = 'Widget.Description';

const Content = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('widget__content', className)} {...rest} />
));
Content.displayName = 'Widget.Content';

const Footer = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('widget__footer', className)} {...rest} />
));
Footer.displayName = 'Widget.Footer';

const Legend = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('widget__legend', className)} {...rest} />
));
Legend.displayName = 'Widget.Legend';

const LegendItem = forwardRef<HTMLDivElement, WidgetLegendItemProps>(
  ({ dotColor, label, className, ...rest }, ref) => {
    const dotStyle: CSSProperties | undefined =
      dotColor !== undefined ? { backgroundColor: dotColor } : undefined;
    return (
      <div ref={ref} className={clsx('widget__legend-item', className)} {...rest}>
        <span className="widget__legend-item-dot" style={dotStyle} aria-hidden="true" />
        <span className="widget__legend-item-label">{label}</span>
      </div>
    );
  },
);
LegendItem.displayName = 'Widget.LegendItem';

const Widget = Object.assign(WidgetRoot, {
  Header,
  Title,
  Description,
  Content,
  Footer,
  Legend,
  LegendItem,
});

export default Widget;
