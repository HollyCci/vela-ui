import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import Timeline, { useTimelineItem, type TimelineItemContextValue } from './index';

const renderBasic = (props?: Record<string, unknown>) =>
  render(
    <Timeline aria-label="Activity" {...props}>
      <Timeline.Item status="success">
        <Timeline.Rail>
          <Timeline.Marker />
          <Timeline.Connector />
        </Timeline.Rail>
        <Timeline.Content>
          <Timeline.Time dateTime="2026-06-19">09:18</Timeline.Time>
          <Timeline.Title>First</Timeline.Title>
          <Timeline.Description>First description</Timeline.Description>
        </Timeline.Content>
      </Timeline.Item>
      <Timeline.Item status="current">
        <Timeline.Rail>
          <Timeline.Marker />
          <Timeline.Connector />
        </Timeline.Rail>
        <Timeline.Content>
          <Timeline.Title>Second</Timeline.Title>
        </Timeline.Content>
      </Timeline.Item>
    </Timeline>,
  );

describe('Timeline', () => {
  it('renders an ordered list root with Pro data attributes and defaults', () => {
    renderBasic();
    const list = screen.getByRole('list', { name: 'Activity' });
    expect(list.tagName).toBe('OL');
    expect(list).toHaveClass('timeline');
    expect(list).toHaveAttribute('data-slot', 'timeline');
    expect(list).toHaveAttribute('data-axis', 'start');
    expect(list).toHaveAttribute('data-placement', 'end');
    expect(list).toHaveAttribute('data-size', 'md');
    expect(list).toHaveAttribute('data-density', 'comfortable');
    expect(list).toHaveAttribute('data-item-align', 'start');
  });

  it('forwards axis/placement/size/density/itemAlign to data attributes', () => {
    renderBasic({ axis: 'center', placement: 'alternate', size: 'lg', density: 'compact', itemAlign: 'center' });
    const list = screen.getByRole('list', { name: 'Activity' });
    expect(list).toHaveAttribute('data-axis', 'center');
    expect(list).toHaveAttribute('data-placement', 'alternate');
    expect(list).toHaveAttribute('data-size', 'lg');
    expect(list).toHaveAttribute('data-density', 'compact');
    expect(list).toHaveAttribute('data-item-align', 'center');
  });

  it('renders items as li with status and resolved side from placement', () => {
    renderBasic({ placement: 'start' });
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0].tagName).toBe('LI');
    expect(items[0]).toHaveAttribute('data-slot', 'timeline-item');
    expect(items[0]).toHaveAttribute('data-status', 'success');
    expect(items[0]).toHaveAttribute('data-side', 'start');
    expect(items[0]).toHaveAttribute('data-align', 'start');
  });

  it('alternates the resolved item side by index for alternate placement', () => {
    renderBasic({ placement: 'alternate' });
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveAttribute('data-side', 'end');
    expect(items[1]).toHaveAttribute('data-side', 'start');
  });

  it('marks current status with data-current on the item', () => {
    renderBasic();
    const items = screen.getAllByRole('listitem');
    expect(items[0]).not.toHaveAttribute('data-current');
    expect(items[1]).toHaveAttribute('data-current', 'true');
  });

  it('renders Rail/Marker/Connector as span elements', () => {
    const { container } = renderBasic();
    const rail = container.querySelector('[data-slot="timeline-rail"]');
    const marker = container.querySelector('[data-slot="timeline-marker"]');
    const connector = container.querySelector('[data-slot="timeline-connector"]');
    expect(rail?.tagName).toBe('SPAN');
    expect(marker?.tagName).toBe('SPAN');
    expect(connector?.tagName).toBe('SPAN');
  });

  it('marker inherits item status and can override it', () => {
    const { container } = render(
      <Timeline aria-label="t">
        <Timeline.Item status="danger">
          <Timeline.Rail>
            <Timeline.Marker />
          </Timeline.Rail>
        </Timeline.Item>
        <Timeline.Item status="danger">
          <Timeline.Rail>
            <Timeline.Marker status="success" />
          </Timeline.Rail>
        </Timeline.Item>
      </Timeline>,
    );
    const markers = container.querySelectorAll('[data-slot="timeline-marker"]');
    expect(markers[0]).toHaveAttribute('data-status', 'danger');
    expect(markers[1]).toHaveAttribute('data-status', 'success');
  });

  it('omits the connector on the last item but renders it with force', () => {
    const { container } = render(
      <Timeline aria-label="t">
        <Timeline.Item>
          <Timeline.Rail>
            <Timeline.Connector />
          </Timeline.Rail>
        </Timeline.Item>
        <Timeline.Item>
          <Timeline.Rail>
            <Timeline.Connector />
            <Timeline.Connector force />
          </Timeline.Rail>
        </Timeline.Item>
      </Timeline>,
    );
    // Item 1 (not last): its connector renders. Item 2 (last): the unforced
    // connector is omitted, the forced one renders → 2 total.
    const connectors = container.querySelectorAll('[data-slot="timeline-connector"]');
    expect(connectors).toHaveLength(2);
    expect(connectors[connectors.length - 1]).toBeInTheDocument();
  });

  it('renders Content as a div carrying the resolved side', () => {
    const { container } = renderBasic({ placement: 'start' });
    const content = container.querySelector('[data-slot="timeline-content"]');
    expect(content?.tagName).toBe('DIV');
    expect(content).toHaveAttribute('data-side', 'start');
  });

  it('lets Content override the side', () => {
    const { container } = render(
      <Timeline aria-label="t" placement="start">
        <Timeline.Item>
          <Timeline.Content side="end">body</Timeline.Content>
        </Timeline.Item>
      </Timeline>,
    );
    const content = container.querySelector('[data-slot="timeline-content"]');
    expect(content).toHaveAttribute('data-side', 'end');
  });

  it('renders Title as h3, Description as p, Time as time[dateTime]', () => {
    renderBasic();
    const title = screen.getByRole('heading', { level: 3, name: 'First' });
    expect(title.tagName).toBe('H3');
    const desc = screen.getByText('First description');
    expect(desc.tagName).toBe('P');
    const time = screen.getByText('09:18');
    expect(time.tagName).toBe('TIME');
    expect(time).toHaveAttribute('datetime', '2026-06-19');
  });

  it('exposes resolved align/index/isLast/side/status via useTimelineItem', () => {
    const captured: TimelineItemContextValue[] = [];
    const Probe = () => {
      captured.push(useTimelineItem());
      return null;
    };
    render(
      <Timeline aria-label="t" placement="alternate" itemAlign="center">
        <Timeline.Item status="success">
          <Probe />
        </Timeline.Item>
        <Timeline.Item>
          <Probe />
        </Timeline.Item>
      </Timeline>,
    );
    expect(captured[0]).toMatchObject({ align: 'center', index: 0, isLast: false, side: 'end', status: 'success' });
    expect(captured[1]).toMatchObject({ align: 'center', index: 1, isLast: true, side: 'start', status: 'default' });
  });

  it('renders custom marker children (e.g. milestone numbers)', () => {
    render(
      <Timeline aria-label="t">
        <Timeline.Item>
          <Timeline.Rail>
            <Timeline.Marker>1</Timeline.Marker>
          </Timeline.Rail>
        </Timeline.Item>
      </Timeline>,
    );
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders interactive Actions children', () => {
    render(
      <Timeline aria-label="t">
        <Timeline.Item>
          <Timeline.Content>
            <Timeline.Actions>
              <button type="button">Open</button>
            </Timeline.Actions>
          </Timeline.Content>
        </Timeline.Item>
      </Timeline>,
    );
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = renderBasic({ axis: 'center', placement: 'alternate' });
    expect(await axe(container)).toHaveNoViolations();
  });
});
