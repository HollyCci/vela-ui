'use client';

import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useMemo,
  type CSSProperties,
  type HTMLAttributes,
  type LiHTMLAttributes,
} from 'react';
import clsx from 'clsx';

export type TimelineAxis = 'start' | 'center';
export type TimelinePlacement = 'start' | 'end' | 'alternate';
export type TimelineSize = 'sm' | 'md' | 'lg';
export type TimelineDensity = 'compact' | 'comfortable';
export type TimelineItemStatus =
  | 'default'
  | 'current'
  | 'success'
  | 'warning'
  | 'danger'
  | 'muted';
export type TimelineItemAlign = 'start' | 'center';
export type TimelineItemSide = 'start' | 'end';

export type TimelineProps = Omit<HTMLAttributes<HTMLOListElement>, 'className' | 'style'> & {
  /** Position of the timeline rail. */
  axis?: TimelineAxis;
  /** Default side for item content; `alternate` alternates by item index. */
  placement?: TimelinePlacement;
  /** Marker and text size. */
  size?: TimelineSize;
  /** Vertical rhythm between events. */
  density?: TimelineDensity;
  /** Default vertical alignment for item content. */
  itemAlign?: TimelineItemAlign;
  className?: string;
  style?: CSSProperties;
};

export type TimelineItemProps = Omit<LiHTMLAttributes<HTMLLIElement>, 'className' | 'style'> & {
  /** Marker tone. */
  status?: TimelineItemStatus;
  /** Vertical alignment for item content. */
  align?: TimelineItemAlign;
  /** Content side for centered timelines. */
  side?: TimelineItemSide;
  className?: string;
  style?: CSSProperties;
};

export type TimelineRailProps = HTMLAttributes<HTMLSpanElement>;
export type TimelineMarkerProps = HTMLAttributes<HTMLSpanElement> & {
  /** Marker tone override (defaults to the item status). */
  status?: TimelineItemStatus;
};
export type TimelineConnectorProps = HTMLAttributes<HTMLSpanElement> & {
  /** Force rendering even on the last item. */
  force?: boolean;
};
export type TimelineContentProps = HTMLAttributes<HTMLDivElement> & {
  /** Content side (defaults to the item side). */
  side?: TimelineItemSide;
};
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
  itemAlign: TimelineItemAlign;
};

export type TimelineItemContextValue = {
  /** Resolved item content alignment. */
  align: TimelineItemAlign;
  /** Zero-based item index. */
  index: number;
  /** Whether this is the final timeline item. */
  isLast: boolean;
  /** Resolved item side. */
  side: TimelineItemSide;
  /** Item marker status. */
  status: TimelineItemStatus;
};

const TimelineContext = createContext<TimelineContextValue>({
  axis: 'start',
  placement: 'end',
  size: 'md',
  density: 'comfortable',
  itemAlign: 'start',
});

const TimelineItemContext = createContext<TimelineItemContextValue>({
  align: 'start',
  index: 0,
  isLast: false,
  side: 'end',
  status: 'default',
});

export const useTimelineItem = (): TimelineItemContextValue => useContext(TimelineItemContext);

type InternalItemProps = TimelineItemProps & { __index?: number; __isLast?: boolean };

const TimelineRoot = forwardRef<HTMLOListElement, TimelineProps>(
  (
    {
      axis = 'start',
      placement = 'end',
      size = 'md',
      density = 'comfortable',
      itemAlign = 'start',
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const items = Children.toArray(children);
    const lastIndex = items.length - 1;

    return (
      <TimelineContext.Provider value={{ axis, placement, size, density, itemAlign }}>
        <ol
          ref={ref}
          data-slot="timeline"
          data-axis={axis}
          data-placement={placement}
          data-size={size}
          data-density={density}
          data-item-align={itemAlign}
          className={clsx('timeline', className)}
          {...rest}
        >
          {items.map((child, index) =>
            isValidElement<InternalItemProps>(child) && child.type === Item
              ? cloneElement(child, { __index: index, __isLast: index === lastIndex })
              : child,
          )}
        </ol>
      </TimelineContext.Provider>
    );
  },
);
TimelineRoot.displayName = 'Timeline';

const Item = forwardRef<HTMLLIElement, InternalItemProps>(
  ({ status = 'default', align, side, __index, __isLast, className, children, ...rest }, ref) => {
    const { placement, itemAlign } = useContext(TimelineContext);
    const index = __index ?? 0;
    const isLast = __isLast ?? false;

    const resolvedAlign = align ?? itemAlign;
    const resolvedSide: TimelineItemSide =
      side ??
      (placement === 'start'
        ? 'start'
        : placement === 'alternate'
          ? index % 2 === 0
            ? 'end'
            : 'start'
          : 'end');

    const contextValue = useMemo<TimelineItemContextValue>(
      () => ({ align: resolvedAlign, index, isLast, side: resolvedSide, status }),
      [resolvedAlign, index, isLast, resolvedSide, status],
    );

    return (
      <TimelineItemContext.Provider value={contextValue}>
        <li
          ref={ref}
          data-slot="timeline-item"
          data-status={status}
          data-align={resolvedAlign}
          data-side={resolvedSide}
          data-current={status === 'current' ? 'true' : undefined}
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

const Rail = forwardRef<HTMLSpanElement, TimelineRailProps>(
  ({ className, children, ...rest }, ref) => (
    <span
      ref={ref}
      data-slot="timeline-rail"
      className={clsx('timeline__rail', className)}
      {...rest}
    >
      {children ?? (
        <>
          <Marker />
          <Connector />
        </>
      )}
    </span>
  ),
);
Rail.displayName = 'Timeline.Rail';

const Marker = forwardRef<HTMLSpanElement, TimelineMarkerProps>(
  ({ status, className, children, ...rest }, ref) => {
    const item = useTimelineItem();
    const resolvedStatus = status ?? item.status;

    return (
      <span
        ref={ref}
        data-slot="timeline-marker"
        data-status={resolvedStatus}
        data-current={resolvedStatus === 'current' ? 'true' : undefined}
        className={clsx('timeline__marker', className)}
        {...rest}
      >
        {children}
      </span>
    );
  },
);
Marker.displayName = 'Timeline.Marker';

const Connector = forwardRef<HTMLSpanElement, TimelineConnectorProps>(
  ({ force = false, className, ...rest }, ref) => {
    const { isLast } = useTimelineItem();
    if (isLast && !force) return null;

    return (
      <span
        ref={ref}
        aria-hidden="true"
        data-slot="timeline-connector"
        className={clsx('timeline__connector', className)}
        {...rest}
      />
    );
  },
);
Connector.displayName = 'Timeline.Connector';

const Content = forwardRef<HTMLDivElement, TimelineContentProps>(
  ({ side, className, ...rest }, ref) => {
    const item = useTimelineItem();
    const resolvedSide = side ?? item.side;

    return (
      <div
        ref={ref}
        data-slot="timeline-content"
        data-side={resolvedSide}
        className={clsx('timeline__content', className)}
        {...rest}
      />
    );
  },
);
Content.displayName = 'Timeline.Content';

const Title = forwardRef<HTMLHeadingElement, TimelineTitleProps>(({ className, ...rest }, ref) => (
  <h3 ref={ref} data-slot="timeline-title" className={clsx('timeline__title', className)} {...rest} />
));
Title.displayName = 'Timeline.Title';

const Description = forwardRef<HTMLParagraphElement, TimelineDescriptionProps>(
  ({ className, ...rest }, ref) => (
    <p
      ref={ref}
      data-slot="timeline-description"
      className={clsx('timeline__description', className)}
      {...rest}
    />
  ),
);
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
}) as typeof TimelineRoot & {
  Item: typeof Item;
  Rail: typeof Rail;
  Marker: typeof Marker;
  Connector: typeof Connector;
  Content: typeof Content;
  Title: typeof Title;
  Description: typeof Description;
  Time: typeof Time;
  Actions: typeof Actions;
};

export default Timeline;
