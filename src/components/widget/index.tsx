import {
  forwardRef,
  type ComponentProps,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';
import { dom } from '@heroui/react';
import clsx from 'clsx';

/** OSS dom.div：原站 root 的 render 多态 prop（自定义根元素渲染）即来自它 */
type DomDivProps = ComponentProps<typeof dom.div>;

export type WidgetProps = Omit<DomDivProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

type SectionProps = HTMLAttributes<HTMLDivElement>;
type TextProps = HTMLAttributes<HTMLSpanElement>;

export type WidgetLegendItemProps = HTMLAttributes<HTMLDivElement> & {
  /** 圆点颜色（原站 API，必填），如 "var(--chart-3)" */
  color: string;
};

const WidgetRoot = forwardRef<HTMLDivElement, WidgetProps>(({ className, ...rest }, ref) => (
  <dom.div ref={ref} data-slot="widget" className={clsx('widget', className)} {...rest} />
));
WidgetRoot.displayName = 'Widget';

const Header = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    data-slot="widget-header"
    className={clsx('widget__header', className)}
    {...rest}
  />
));
Header.displayName = 'Widget.Header';

const Title = forwardRef<HTMLSpanElement, TextProps>(({ className, ...rest }, ref) => (
  <span
    ref={ref}
    data-slot="widget-title"
    className={clsx('widget__title', className)}
    {...rest}
  />
));
Title.displayName = 'Widget.Title';

const Description = forwardRef<HTMLSpanElement, TextProps>(({ className, ...rest }, ref) => (
  <span
    ref={ref}
    data-slot="widget-description"
    className={clsx('widget__description', className)}
    {...rest}
  />
));
Description.displayName = 'Widget.Description';

const Content = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    data-slot="widget-content"
    className={clsx('widget__content', className)}
    {...rest}
  />
));
Content.displayName = 'Widget.Content';

const Footer = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    data-slot="widget-footer"
    className={clsx('widget__footer', className)}
    {...rest}
  />
));
Footer.displayName = 'Widget.Footer';

const Legend = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    data-slot="widget-legend"
    className={clsx('widget__legend', className)}
    {...rest}
  />
));
Legend.displayName = 'Widget.Legend';

const LegendItem = forwardRef<HTMLDivElement, WidgetLegendItemProps>(
  ({ color, className, children, ...rest }, ref) => {
    const dotStyle: CSSProperties = { backgroundColor: color };

    return (
      <div
        ref={ref}
        data-slot="widget-legend-item"
        className={clsx('widget__legend-item', className)}
        {...rest}
      >
        <span
          data-slot="widget-legend-item-dot"
          className="widget__legend-item-dot"
          style={dotStyle}
        />
        <span data-slot="widget-legend-item-label" className="widget__legend-item-label">
          {children}
        </span>
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
