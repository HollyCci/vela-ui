'use client';

import {
  createContext,
  forwardRef,
  useContext,
  type CSSProperties,
  type HTMLAttributes,
  type LiHTMLAttributes,
} from 'react';
import clsx from 'clsx';

export type TimelineAxis = 'start' | 'center';
export type TimelinePlacement = 'start' | 'end' | 'alternate';
export type TimelineSize = 'sm' | 'md' | 'lg';
export type TimelineDensity = 'compact' | 'default' | 'spacious';
export type TimelineItemStatus = 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'muted';
export type TimelineItemAlign = 'start' | 'end';

export type TimelineProps = Omit<HTMLAttributes<HTMLOListElement>, 'className' | 'style'> & {
  axis?: TimelineAxis;
  placement?: TimelinePlacement;
  size?: TimelineSize;
  density?: TimelineDensity;
  className?: string;
  style?: CSSProperties;
};

export type TimelineItemProps = Omit<LiHTMLAttributes<HTMLLIElement>, 'className' | 'style'> & {
  status?: TimelineItemStatus;
  align?: TimelineItemAlign;
  isCurrent?: boolean;
  className?: string;
  style?: CSSProperties;
};

export type TimelineRailProps = HTMLAttributes<HTMLDivElement>;
export type TimelineMarkerProps = HTMLAttributes<HTMLSpanElement> & {
  status?: TimelineItemStatus;
  pulse?: boolean;
};
export type TimelineConnectorProps = HTMLAttributes<HTMLSpanElement>;
export type TimelineContentProps = HTMLAttributes<HTMLDivElement>;
export type TimelineTitleProps = HTMLAttributes<HTMLHeadingElement>;
export type TimelineDescriptionProps = HTMLAttributes<HTMLParagraphElement>;
export type TimelineTimeProps = HTMLAttributes<HTMLTimeElement> & {
  dateTime?: string;
};
export type TimelineActionsProps = HTMLAttributes<HTMLDivElement>;

type TimelineContextValue = {
  axis: TimelineAxis;
  placement: TimelinePlacement;
  size: TimelineSize;
  density: TimelineDensity;
};

type TimelineItemContextValue = {
  status: TimelineItemStatus;
  align?: TimelineItemAlign;
  isCurrent: boolean;
};

const TimelineContext = createContext<TimelineContextValue>({
  axis: 'start',
  placement: 'end',
  size: 'md',
  density: 'default',
});

const TimelineItemContext = createContext<TimelineItemContextValue>({
  status: 'default',
  isCurrent: false,
});

export const useTimelineItem = () => useContext(TimelineItemContext);

const TimelineRoot = forwardRef<HTMLOListElement, TimelineProps>(
  (
    {
      axis = 'start',
      placement = 'end',
      size = 'md',
      density = 'default',
      className,
      children,
      ...rest
    },
    ref,
  ) => (
    <TimelineContext.Provider value={{ axis, placement, size, density }}>
      <ol
        ref={ref}
        data-slot="timeline"
        data-axis={axis}
        data-placement={placement}
        data-size={size}
        data-density={density}
        className={clsx('timeline', className)}
        {...rest}
      >
        {children}
      </ol>
    </TimelineContext.Provider>
  ),
);
TimelineRoot.displayName = 'Timeline';

const Item = forwardRef<HTMLLIElement, TimelineItemProps>(
  ({ status = 'default', align, isCurrent = false, className, children, ...rest }, ref) => {
    const { placement } = useContext(TimelineContext);
    const resolvedAlign =
      align ?? (placement === 'start' ? 'start' : placement === 'end' ? 'end' : undefined);

    return (
      <TimelineItemContext.Provider value={{ status, align: resolvedAlign, isCurrent }}>
        <li
          ref={ref}
          data-slot="timeline-item"
          data-status={status}
          data-align={resolvedAlign}
          data-current={isCurrent ? 'true' : undefined}
          className={clsx('timeline__item', className)}
          {...rest}
        >
          {children}
        </li>
      </TimelineItemContext.Provider>
    );
  },
);
Item.displayName = 'Timeline.Item';

const Rail = forwardRef<HTMLDivElement, TimelineRailProps>(({ className, children, ...rest }, ref) => (
  <div ref={ref} data-slot="timeline-rail" className={clsx('timeline__rail', className)} {...rest}>
    {children ?? (
      <>
        <Marker />
        <Connector />
      </>
    )}
  </div>
));
Rail.displayName = 'Timeline.Rail';

const Marker = forwardRef<HTMLSpanElement, TimelineMarkerProps>(
  ({ status, pulse = false, className, children, ...rest }, ref) => {
    const item = useTimelineItem();
    const resolvedStatus = status ?? item.status;

    return (
      <span
        ref={ref}
        data-slot="timeline-marker"
        data-status={resolvedStatus}
        data-current={item.isCurrent ? 'true' : undefined}
        data-pulse={pulse ? 'true' : undefined}
        className={clsx('timeline__marker', className)}
        {...rest}
      >
        {children}
      </span>
    );
  },
);
Marker.displayName = 'Timeline.Marker';

const Connector = forwardRef<HTMLSpanElement, TimelineConnectorProps>(({ className, ...rest }, ref) => (
  <span
    ref={ref}
    aria-hidden="true"
    data-slot="timeline-connector"
    className={clsx('timeline__connector', className)}
    {...rest}
  />
));
Connector.displayName = 'Timeline.Connector';

const Content = forwardRef<HTMLDivElement, TimelineContentProps>(({ className, ...rest }, ref) => (
  <div ref={ref} data-slot="timeline-content" className={clsx('timeline__content', className)} {...rest} />
));
Content.displayName = 'Timeline.Content';

const Title = forwardRef<HTMLHeadingElement, TimelineTitleProps>(({ className, ...rest }, ref) => (
  <h3 ref={ref} data-slot="timeline-title" className={clsx('timeline__title', className)} {...rest} />
));
Title.displayName = 'Timeline.Title';

const Description = forwardRef<HTMLParagraphElement, TimelineDescriptionProps>(({ className, ...rest }, ref) => (
  <p
    ref={ref}
    data-slot="timeline-description"
    className={clsx('timeline__description', className)}
    {...rest}
  />
));
Description.displayName = 'Timeline.Description';

const Time = forwardRef<HTMLTimeElement, TimelineTimeProps>(({ className, ...rest }, ref) => (
  <time ref={ref} data-slot="timeline-time" className={clsx('timeline__time', className)} {...rest} />
));
Time.displayName = 'Timeline.Time';

const Actions = forwardRef<HTMLDivElement, TimelineActionsProps>(({ className, ...rest }, ref) => (
  <div ref={ref} data-slot="timeline-actions" className={clsx('timeline__actions', className)} {...rest} />
));
Actions.displayName = 'Timeline.Actions';

const Timeline = Object.assign(TimelineRoot, {
  Item,
  Rail,
  Marker,
  Connector,
  Content,
  Title,
  Description,
  Time,
  Actions,
});

export default Timeline;
