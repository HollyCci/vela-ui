import { Fragment, useCallback, useState, type ReactNode } from 'react';
import ActionBar from '../../components/action-bar';
import Agenda, { useAgenda, type AgendaEvent } from '../../components/agenda';
import Avatar from '../../components/avatar';
import Badge from '../../components/badge';
import BarChart from '../../components/bar-chart';
import Button from '../../components/button';
import Carousel, { type CarouselApi } from '../../components/carousel';
import ChartTooltip from '../../components/chart-tooltip';
import Checkbox from '../../components/checkbox';
import Chip from '../../components/chip';
import DataGrid, {
  type DataGridCellEditEvent,
  type DataGridColumn,
  type DataGridVirtualRange,
} from '../../components/data-grid';
import EmptyState from '../../components/empty-state';
import FileTree, { useFileTree, useFileTreeData, useFileTreeDrag } from '../../components/file-tree';
import FloatingToc from '../../components/floating-toc';
import HoverCard from '../../components/hover-card';
import ItemCard from '../../components/item-card';
import ItemCardGroup from '../../components/item-card-group';
import Kanban, { useKanban, useKanbanColumn } from '../../components/kanban';
import Kpi from '../../components/kpi';
import KpiGroup from '../../components/kpi-group';
import LineChart from '../../components/line-chart';
import ListView from '../../components/list-view';
import PieChart from '../../components/pie-chart';
import ProgressBar from '../../components/progress-bar';
import Separator from '../../components/separator';
import Switch from '../../components/switch';
import Timeline from '../../components/timeline';
import Tooltip from '../../components/tooltip';
import Widget from '../../components/widget';
import DemoSection from '../demo-section';

type DemoKey = string | number;
type DemoSelection = 'all' | Set<DemoKey>;
type DemoSortDescriptor = {
  column: DemoKey;
  direction: 'ascending' | 'descending';
};

const BookIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M3 2.5h7a2 2 0 0 1 2 2v9H5a2 2 0 0 1-2-2v-9z" />
    <path d="M3 11.5a2 2 0 0 1 2-2h7" />
  </svg>
);

const FolderIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M2 4a1 1 0 0 1 1-1h3l1.5 2H13a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4z" />
  </svg>
);

const FileIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M4 2h5l3 3v9H4V2z" />
    <path d="M9 2v3h3" />
  </svg>
);

const KpiDemo = () => (
  <DemoSection isColumn>
    <Kpi className="card" style={{ width: 280 }}>
      <Kpi.Header>
        <Kpi.Icon status="success">
          <BookIcon />
        </Kpi.Icon>
        <Kpi.Title>本周完课学员</Kpi.Title>
      </Kpi.Header>
      <Kpi.Content>
        <Kpi.Value value={1286} />
        <Kpi.Trend trend="up">
          <Chip color="success" size="sm">
            +12.4%
          </Chip>
        </Kpi.Trend>
      </Kpi.Content>
      <Kpi.Separator />
      <Kpi.Footer>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>较上周同期增长 142 人</span>
      </Kpi.Footer>
    </Kpi>
  </DemoSection>
);

const KpiGroupDemo = () => (
  <DemoSection isColumn>
    <KpiGroup orientation="horizontal" style={{ width: 680 }}>
      <Kpi>
        <Kpi.Header>
          <Kpi.Title>Total Subscribers</Kpi.Title>
        </Kpi.Header>
        <Kpi.Content>
          <Kpi.Value>71,897</Kpi.Value>
          <Kpi.Trend>{kpiTrendPill('up', '12%')}</Kpi.Trend>
        </Kpi.Content>
      </Kpi>
      <KpiGroup.Separator />
      <Kpi>
        <Kpi.Header>
          <Kpi.Title>Avg. Open Rate</Kpi.Title>
        </Kpi.Header>
        <Kpi.Content>
          <Kpi.Value>58.16%</Kpi.Value>
          <Kpi.Trend>{kpiTrendPill('up', '2.02%')}</Kpi.Trend>
        </Kpi.Content>
      </Kpi>
      <KpiGroup.Separator />
      <Kpi>
        <Kpi.Header>
          <Kpi.Title>Avg. Click Rate</Kpi.Title>
        </Kpi.Header>
        <Kpi.Content>
          <Kpi.Value>24.57%</Kpi.Value>
          <Kpi.Trend>{kpiTrendPill('down', '4.05%')}</Kpi.Trend>
        </Kpi.Content>
      </Kpi>
    </KpiGroup>
    <KpiGroup orientation="vertical" style={{ width: 280 }}>
      <Kpi>
        <Kpi.Header>
          <Kpi.Title>Revenue</Kpi.Title>
        </Kpi.Header>
        <Kpi.Content>
          <Kpi.Value>US$228,451</Kpi.Value>
          <Kpi.Trend>{kpiTrendPill('up', '+3.3%')}</Kpi.Trend>
        </Kpi.Content>
      </Kpi>
      <KpiGroup.Separator />
      <Kpi>
        <Kpi.Header>
          <Kpi.Title>Expenses</Kpi.Title>
        </Kpi.Header>
        <Kpi.Content>
          <Kpi.Value>US$25,108</Kpi.Value>
          <Kpi.Trend>{kpiTrendPill('down', '-3.3%')}</Kpi.Trend>
        </Kpi.Content>
      </Kpi>
    </KpiGroup>
  </DemoSection>
);

const ItemCardDemo = () => {
  const [message, setMessage] = useState('No card opened');

  return (
    <DemoSection isColumn>
      <ItemCard style={{ width: 420 }}>
        <ItemCard.Icon>
          <GlobeIcon />
        </ItemCard.Icon>
        <ItemCard.Content>
          <ItemCard.Title>Language</ItemCard.Title>
          <ItemCard.Description>Choose your preferred language</ItemCard.Description>
        </ItemCard.Content>
        <ItemCard.Action>
          <Button size="sm" variant="outline" onClick={() => setMessage('Language changed')}>
            English
          </Button>
        </ItemCard.Action>
      </ItemCard>
      <ItemCard variant="outline" style={{ width: 420 }}>
        <ItemCard.Icon>
          <MoonIcon />
        </ItemCard.Icon>
        <ItemCard.Content>
          <ItemCard.Title>Dark mode</ItemCard.Title>
          <ItemCard.Description>Use dark theme across the app</ItemCard.Description>
        </ItemCard.Content>
        <ItemCard.Action>
          <Switch aria-label="Dark mode" size="sm" />
        </ItemCard.Action>
      </ItemCard>
      <span style={{ fontSize: 13, color: 'var(--foreground)' }}>{message}</span>
    </DemoSection>
  );
};

const ItemCardGroupDemo = () => {
  // 多选示例：selectionMode="multiple" 时多张卡片可同时选中（如通知偏好），状态以 Set 承载
  const [notifyKeys, setNotifyKeys] = useState<Set<string | number>>(
    () => new Set(['email']),
  );

  return (
    <DemoSection isColumn>
      <ItemCardGroup layout="list" style={{ width: 460 }}>
        <ItemCardGroup.Header>
          <ItemCardGroup.Title>Account</ItemCardGroup.Title>
          <ItemCardGroup.Description>Manage your account settings and preferences</ItemCardGroup.Description>
        </ItemCardGroup.Header>
        <ItemCard>
          <ItemCard.Icon>
            <UserIcon />
          </ItemCard.Icon>
          <ItemCard.Content>
            <ItemCard.Title>Profile</ItemCard.Title>
            <ItemCard.Description>Update your personal information</ItemCard.Description>
          </ItemCard.Content>
          <ItemCard.Action>
            <ChevronRightIcon />
          </ItemCard.Action>
        </ItemCard>
        <ItemCard>
          <ItemCard.Icon>
            <ShieldIcon />
          </ItemCard.Icon>
          <ItemCard.Content>
            <ItemCard.Title>Security</ItemCard.Title>
            <ItemCard.Description>Manage passwords and 2FA</ItemCard.Description>
          </ItemCard.Content>
          <ItemCard.Action>
            <ChevronRightIcon />
          </ItemCard.Action>
        </ItemCard>
      </ItemCardGroup>
      <ItemCardGroup
        layout="list"
        variant="outline"
        style={{ width: 460 }}
        selectionMode="multiple"
        selectedKeys={notifyKeys}
        onSelectionChange={setNotifyKeys}
      >
        <ItemCardGroup.Header>
          <ItemCardGroup.Title>Notification Preferences</ItemCardGroup.Title>
          <ItemCardGroup.Description>Choose how you receive notifications</ItemCardGroup.Description>
        </ItemCardGroup.Header>
        <ItemCard id="email">
          <ItemCard.Icon>
            <BellIcon />
          </ItemCard.Icon>
          <ItemCard.Content>
            <ItemCard.Title>Email</ItemCard.Title>
            <ItemCard.Description>Updates and deadlines</ItemCard.Description>
          </ItemCard.Content>
        </ItemCard>
        <ItemCard id="sms">
          <ItemCard.Icon>
            <BellIcon />
          </ItemCard.Icon>
          <ItemCard.Content>
            <ItemCard.Title>SMS</ItemCard.Title>
            <ItemCard.Description>30 minutes before events</ItemCard.Description>
          </ItemCard.Content>
        </ItemCard>
        <ItemCard id="push">
          <ItemCard.Icon>
            <BellIcon />
          </ItemCard.Icon>
          <ItemCard.Content>
            <ItemCard.Title>Push Notification</ItemCard.Title>
            <ItemCard.Description>Real-time activity</ItemCard.Description>
          </ItemCard.Content>
        </ItemCard>
      </ItemCardGroup>
    </DemoSection>
  );
};

const XmarkIcon = () => (
  <svg
    aria-hidden="true"
    fill="none"
    height="16"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    width="16"
  >
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
XmarkIcon.displayName = 'XmarkIcon';

const ChevronRightIcon = () => (
  <svg
    aria-hidden="true"
    fill="none"
    height="16"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    width="16"
  >
    <path d="m9 6 6 6-6 6" />
  </svg>
);
ChevronRightIcon.displayName = 'ChevronRightIcon';

const GlobeIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
    <circle cx="8" cy="8" r="6" />
    <path d="M2 8h12M8 2c1.8 1.6 2.8 3.8 2.8 6S9.8 12.4 8 14C6.2 12.4 5.2 10.2 5.2 8S6.2 3.6 8 2z" />
  </svg>
);
GlobeIcon.displayName = 'GlobeIcon';

const MoonIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
    <path d="M13 9.5A5.5 5.5 0 0 1 6.5 3 5.5 5.5 0 1 0 13 9.5z" />
  </svg>
);
MoonIcon.displayName = 'MoonIcon';

const ShieldIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
    <path d="M8 1.8 13 4v4c0 3.2-2.1 5-5 6.2C5.1 13 3 11.2 3 8V4l5-2.2z" />
  </svg>
);
ShieldIcon.displayName = 'ShieldIcon';

const UserIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
    <circle cx="8" cy="5.5" r="2.5" />
    <path d="M3.5 13.5a4.5 4.5 0 0 1 9 0" />
  </svg>
);
UserIcon.displayName = 'UserIcon';

const BellIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
    <path d="M8 2a3.5 3.5 0 0 0-3.5 3.5c0 3-1.5 4-1.5 4h10s-1.5-1-1.5-4A3.5 3.5 0 0 0 8 2z" />
    <path d="M6.5 12.5a1.5 1.5 0 0 0 3 0" />
  </svg>
);
BellIcon.displayName = 'BellIcon';

const CloudIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
    <path d="M4.5 12a3 3 0 0 1-.2-6 4 4 0 0 1 7.7.9A2.5 2.5 0 0 1 11.5 12h-7z" />
  </svg>
);
CloudIcon.displayName = 'CloudIcon';

const LIST_VIEW_FILES = [
  { id: '1', name: 'Documents', updated: 'Updated 2 days ago', kind: 'folder' as const },
  { id: '2', name: 'Photos', updated: 'Updated 1 week ago', kind: 'folder' as const },
  { id: '3', name: 'README.md', updated: 'Updated 3 hours ago', kind: 'file' as const },
  { id: '4', name: 'package.json', updated: 'Updated Yesterday', kind: 'file' as const },
  { id: '5', name: 'src', updated: 'Updated Just now', kind: 'folder' as const },
  { id: '6', name: '.gitignore', updated: 'Updated 2 weeks ago', kind: 'file' as const },
];

const summarizeNames = (names: string[]) => {
  if (names.length === 0) {
    return 'No files selected';
  }
  if (names.length <= 2) {
    return names.join(', ');
  }
  return `${names.slice(0, 2).join(', ')} and ${names.length} files`;
};

/** 参考「With Action Bar」联动：多选行 → ActionBar 浮出，清除按钮收起 */
const ListViewDemo = () => {
  const [files, setFiles] = useState(LIST_VIEW_FILES);
  const [selected, setSelected] = useState<DemoSelection>(new Set());
  const [actionMessage, setActionMessage] = useState('Select files to download, move or delete');
  const [studentMessage, setStudentMessage] = useState('README.md selected, src is disabled');
  const count = selected === 'all' ? files.length : selected.size;
  const selectedNames =
    selected === 'all'
      ? files.map((file) => file.name)
      : files.filter((file) => selected.has(file.id)).map((file) => file.name);

  const handleAction = (action: string) => {
    setActionMessage(`${action}: ${summarizeNames(selectedNames)}`);
  };

  const handleDelete = () => {
    const ids = selected === 'all' ? new Set(files.map((file) => file.id)) : selected;
    setFiles((current) => current.filter((file) => !ids.has(file.id)));
    setSelected(new Set());
    setActionMessage(`Deleted: ${summarizeNames(selectedNames)}`);
  };

  const handleClear = () => {
    setSelected(new Set());
    setActionMessage('Selection cleared');
  };

  return (
    <>
      <DemoSection isColumn label="multiple selection + action bar">
        <ListView
          aria-label="Files"
          items={files}
          selectedKeys={selected}
          selectionMode="multiple"
          style={{ width: 420 }}
          onSelectionChange={setSelected}
        >
          {(file) => (
            <ListView.Item id={file.id} textValue={file.name}>
              <ListView.ItemContent>
                {file.kind === 'folder' ? <FolderIcon /> : <FileIcon />}
                <div>
                  <ListView.Title>{file.name}</ListView.Title>
                  <ListView.Description>{file.updated}</ListView.Description>
                </div>
              </ListView.ItemContent>
            </ListView.Item>
          )}
        </ListView>
        <div style={{ fontSize: 13, color: 'var(--foreground)' }}>{actionMessage}</div>
        <ActionBar isOpen={count > 0}>
          <ActionBar.Prefix>
            <Chip color="accent" size="sm">
              {count}
            </Chip>
            <ActionBar.Label>Selected</ActionBar.Label>
          </ActionBar.Prefix>
          <Separator orientation="vertical" />
          <ActionBar.Content>
            <Button size="sm" variant="ghost" onClick={() => handleAction('Downloaded')}>
              Download
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleAction('Moved')}>
              Move
            </Button>
            <Button size="sm" variant="danger-soft" onClick={handleDelete}>
              Delete
            </Button>
          </ActionBar.Content>
          <Separator orientation="vertical" />
          <ActionBar.Suffix>
            <Tooltip content="Clear selection" placement="top">
              <Button
                aria-label="Clear selection"
                isIconOnly
                size="sm"
                variant="ghost"
                onClick={handleClear}
              >
                <XmarkIcon />
              </Button>
            </Tooltip>
          </ActionBar.Suffix>
        </ActionBar>
      </DemoSection>
      <DemoSection isColumn label="secondary · single selection · disabled item">
        <ListView
          aria-label="Files"
          defaultSelectedKeys={['3']}
          disabledKeys={['5']}
          selectionMode="single"
          style={{ width: 420 }}
          variant="secondary"
        >
          {LIST_VIEW_FILES.slice(0, 4).map((file) => (
            <ListView.Item key={file.id} id={file.id} textValue={file.name}>
              <ListView.ItemContent>
                {file.kind === 'folder' ? <FolderIcon /> : <FileIcon />}
                <div>
                  <ListView.Title>{file.name}</ListView.Title>
                  <ListView.Description>{file.updated}</ListView.Description>
                </div>
              </ListView.ItemContent>
              <ListView.ItemAction>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(event) => {
                    event.stopPropagation();
                    setStudentMessage(`Opened ${file.name}`);
                  }}
                >
                  Open
                </Button>
              </ListView.ItemAction>
            </ListView.Item>
          ))}
        </ListView>
        <div style={{ fontSize: 13, color: 'var(--foreground)' }}>{studentMessage}</div>
      </DemoSection>
    </>
  );
};

const EmptyStateDemo = () => {
  const [refreshCount, setRefreshCount] = useState(0);
  const handleRefresh = () => setRefreshCount((count) => count + 1);

  return (
    <DemoSection isColumn>
      <EmptyState size="md" style={{ width: 420 }}>
        <EmptyState.Header>
          <EmptyState.Media variant="icon">
            <FolderIcon />
          </EmptyState.Media>
          <EmptyState.Title>No Projects Yet</EmptyState.Title>
          <EmptyState.Description>
            You haven't created any projects yet. Get started by creating your first project.
          </EmptyState.Description>
        </EmptyState.Header>
        <EmptyState.Content>
          <Button size="sm" variant="primary" onClick={handleRefresh}>
            Create Project
          </Button>
          <Button size="sm" variant="outline">
            Import Project
          </Button>
        </EmptyState.Content>
      </EmptyState>
      <span style={{ fontSize: 13, color: 'var(--foreground)' }}>
        Created {refreshCount} project(s)
      </span>
    </DemoSection>
  );
};

const WIDGET_SEGMENTS = [
  { key: 'patterns', label: '句型训练', color: 'var(--chart-1)' },
  { key: 'reading', label: '阅读', color: 'var(--chart-2)' },
  { key: 'spelling', label: '拼写', color: 'var(--chart-3)' },
] as const;

type WidgetMetric = (typeof WIDGET_SEGMENTS)[number]['key'];
type WidgetRange = 'week' | 'month';
type WidgetPoint = { label: string } & Record<WidgetMetric, number>;

const WIDGET_SERIES: Record<
  WidgetRange,
  { label: string; updated: string; points: WidgetPoint[] }
> = {
  week: {
    label: '本周',
    updated: '数据每小时更新',
    points: [
      { label: '一', patterns: 28, reading: 42, spelling: 18 },
      { label: '二', patterns: 36, reading: 38, spelling: 24 },
      { label: '三', patterns: 30, reading: 52, spelling: 20 },
      { label: '四', patterns: 44, reading: 48, spelling: 28 },
      { label: '五', patterns: 40, reading: 56, spelling: 34 },
      { label: '六', patterns: 24, reading: 32, spelling: 18 },
      { label: '日', patterns: 18, reading: 28, spelling: 16 },
    ],
  },
  month: {
    label: '近 30 天',
    updated: '按周汇总',
    points: [
      { label: 'W1', patterns: 168, reading: 214, spelling: 92 },
      { label: 'W2', patterns: 182, reading: 236, spelling: 108 },
      { label: 'W3', patterns: 204, reading: 258, spelling: 126 },
      { label: 'W4', patterns: 196, reading: 242, spelling: 118 },
    ],
  },
};

const WidgetDemo = () => {
  const [range, setRange] = useState<WidgetRange>('week');
  const series = WIDGET_SERIES[range];
  const totals = series.points.map((point) =>
    WIDGET_SEGMENTS.reduce((sum, segment) => sum + point[segment.key], 0),
  );
  const maxTotal = Math.max(...totals, 1);
  const totalMinutes = totals.reduce((sum, value) => sum + value, 0);
  const averageMinutes = Math.round(totalMinutes / series.points.length);

  return (
    <DemoSection isColumn>
      <Widget style={{ width: 420 }}>
        <Widget.Header>
          <Widget.Title>学习时长分布</Widget.Title>
          <Widget.Legend>
            {WIDGET_SEGMENTS.map((segment) => (
              <Widget.LegendItem key={segment.key} color={segment.color}>
                {segment.label}
              </Widget.LegendItem>
            ))}
          </Widget.Legend>
        </Widget.Header>
        <Widget.Content>
          <div
            aria-label={`${series.label}学习时长分布`}
            style={{
              minHeight: 128,
              display: 'flex',
              alignItems: 'end',
              gap: 14,
              paddingTop: 8,
            }}
          >
            {series.points.map((point, index) => {
              const total = totals[index] ?? 0;
              return (
                <div
                  key={point.label}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <div
                    title={`${point.label}：${total} 分钟`}
                    style={{
                      height: 96,
                      width: '100%',
                      maxWidth: 34,
                      borderRadius: 8,
                      background: 'var(--surface-secondary)',
                      display: 'flex',
                      alignItems: 'end',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: `${Math.max((total / maxTotal) * 100, 6)}%`,
                        display: 'flex',
                        flexDirection: 'column-reverse',
                      }}
                    >
                      {WIDGET_SEGMENTS.map((segment) => {
                        const value = point[segment.key];
                        return (
                          <span
                            key={segment.key}
                            aria-hidden="true"
                            style={{
                              height: total > 0 ? `${(value / total) * 100}%` : 0,
                              background: segment.color,
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>{point.label}</span>
                </div>
              );
            })}
          </div>
        </Widget.Content>
        <Widget.Footer style={{ flexWrap: 'wrap' }}>
          <span style={{ flex: 1, minWidth: 180, fontSize: 12, color: 'var(--muted)' }}>
            {series.updated} · 共 {totalMinutes} 分钟 · 均值 {averageMinutes} 分钟
          </span>
          <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
            <Button
              aria-pressed={range === 'week'}
              data-pressed={range === 'week' ? 'true' : undefined}
              size="sm"
              variant={range === 'week' ? 'secondary' : 'ghost'}
              onClick={() => setRange('week')}
            >
              本周
            </Button>
            <Button
              aria-pressed={range === 'month'}
              data-pressed={range === 'month' ? 'true' : undefined}
              size="sm"
              variant={range === 'month' ? 'secondary' : 'ghost'}
              onClick={() => setRange('month')}
            >
              近 30 天
            </Button>
          </div>
        </Widget.Footer>
      </Widget>
      <Widget style={{ width: 420 }}>
        <Widget.Header>
          <Widget.Title>关键指标</Widget.Title>
          <Widget.Description>{series.label}</Widget.Description>
        </Widget.Header>
        <Widget.Content>
          <KpiGroup orientation="horizontal">
            <Kpi>
              <Kpi.Header>
                <Kpi.Title>活跃学员</Kpi.Title>
              </Kpi.Header>
              <Kpi.Content>
                <Kpi.Value>{range === 'week' ? '1,486' : '5,214'}</Kpi.Value>
              </Kpi.Content>
            </Kpi>
            <KpiGroup.Separator />
            <Kpi>
              <Kpi.Header>
                <Kpi.Title>新增课程</Kpi.Title>
              </Kpi.Header>
              <Kpi.Content>
                <Kpi.Value>{range === 'week' ? '9' : '36'}</Kpi.Value>
              </Kpi.Content>
            </Kpi>
          </KpiGroup>
        </Widget.Content>
      </Widget>
    </DemoSection>
  );
};

const FileTreeDemo = () => {
  const [expandedKeys, setExpandedKeys] = useState<Set<DemoKey>>(
    () => new Set<DemoKey>(['course', 'ielts']),
  );
  const [selectedKeys, setSelectedKeys] = useState<DemoSelection>(
    () => new Set<DemoKey>(['ielts-words']),
  );

  const handleExpandedChange = (keys: Set<DemoKey>) => {
    setExpandedKeys(new Set(keys));
  };

  const handleSelectionChange = (keys: DemoSelection) => {
    setSelectedKeys(keys);
  };

  const selectedLabel =
    selectedKeys === 'all' ? 'All' : ([...selectedKeys].map(String).join(', ') || '(none)');

  return (
    <DemoSection isColumn>
      <div style={{ width: 320 }}>
        <FileTree
          aria-label="Project files"
          selectionMode="single"
          expandedKeys={expandedKeys}
          onExpandedChange={handleExpandedChange}
          selectedKeys={selectedKeys}
          onSelectionChange={handleSelectionChange}
        >
          <FileTree.Item id="course" title="apps" icon={<FolderIcon />}>
            <FileTree.Item id="ielts" title="frontend" icon={<FolderIcon />}>
              <FileTree.Item id="ielts-words" title="package.json" icon={<FileIcon />} />
              <FileTree.Item id="ielts-listening" title="tsconfig.json" icon={<FileIcon />} />
            </FileTree.Item>
            <FileTree.Item id="cet4" title="api" icon={<FileIcon />} />
          </FileTree.Item>
          <FileTree.Item id="ops" title="packages" icon={<FolderIcon />}>
            <FileTree.Item id="poster" title="README.md" icon={<FileIcon />} />
          </FileTree.Item>
        </FileTree>
      </div>
      <div style={{ fontSize: 13, color: 'var(--foreground)' }}>
        Selected: {selectedLabel} ({expandedKeys.size} folders expanded)
      </div>
    </DemoSection>
  );
};

type KanbanTask = {
  id: string;
  title: string;
  status: string;
  priority: 'low' | 'normal' | 'high';
};

const KANBAN_TASKS: KanbanTask[] = [
  { id: 't1', title: 'Develop API for User Profiles', status: 'todo', priority: 'high' },
  { id: 't2', title: 'Login Page Redesign', status: 'todo', priority: 'normal' },
  { id: 't3', title: 'Feature: Dark Mode', status: 'todo', priority: 'low' },
  { id: 't4', title: 'Component Library Setup', status: 'doing', priority: 'high' },
  { id: 't5', title: 'Database Connection Error', status: 'doing', priority: 'normal' },
  { id: 't6', title: 'Performance Optimization', status: 'done', priority: 'low' },
];

const KANBAN_COLUMNS: { id: string; title: string; color: string }[] = [
  { id: 'todo', title: 'Open', color: 'var(--warning)' },
  { id: 'doing', title: 'In Progress', color: 'var(--accent)' },
  { id: 'done', title: 'Closed', color: 'var(--success)' },
];

const KANBAN_PRIORITY: Record<KanbanTask['priority'], { label: string; color: 'danger' | 'warning' | 'success' }> = {
  high: { label: 'High', color: 'danger' },
  normal: { label: 'Medium', color: 'warning' },
  low: { label: 'Low', color: 'success' },
};

const getKanbanColumn = (task: KanbanTask) => task.status;
const setKanbanColumn = (task: KanbanTask, column: string): KanbanTask => ({
  ...task,
  status: column,
});
const KANBAN_PRIORITY_ORDER: KanbanTask['priority'][] = ['low', 'normal', 'high'];
const getNextKanbanPriority = (priority: KanbanTask['priority']) =>
  KANBAN_PRIORITY_ORDER[(KANBAN_PRIORITY_ORDER.indexOf(priority) + 1) % KANBAN_PRIORITY_ORDER.length];
const getKanbanBoardOrder = (
  items: KanbanTask[],
  columns: { id: string; title: string }[] = KANBAN_COLUMNS,
) =>
  columns
    .map((column) => {
      const ordered = items
        .filter((task) => task.status === column.id)
        .map((task) => task.id)
        .join(',');
      return `${column.id}:${ordered || '-'}`;
    })
    .join('|');

type KanbanColumnViewProps = {
  kanban: ReturnType<typeof useKanban<KanbanTask>>;
  column: { id: string; title: string; color: string };
  actions?: ReactNode;
};

const KanbanColumnView = ({ kanban, column, actions }: KanbanColumnViewProps) => {
  const { items, dragAndDropHooks } = useKanbanColumn(kanban, column.id);
  return (
    <Kanban.Column>
      <Kanban.ColumnHeader
        title={column.title}
        count={items.length}
        indicatorColor={column.color}
        actions={actions}
      />
      <Kanban.ColumnBody>
        <Kanban.CardList
          aria-label={column.title}
          items={items}
          dragAndDropHooks={dragAndDropHooks}
          renderEmptyState={renderKanbanEmpty}
        >
          {(task: KanbanTask) => {
            const nextPriority = getNextKanbanPriority(task.priority);
            return (
              <Kanban.Card id={task.id} textValue={task.title} data-kanban-task-id={task.id}>
                <Kanban.CardContent>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <Kanban.DragHandle aria-label={`Drag ${task.title}`} />
                    <span style={{ flex: 1, fontWeight: 600, lineHeight: 1.4 }}>{task.title}</span>
                    <Chip size="sm" color={KANBAN_PRIORITY[task.priority].color}>
                      {KANBAN_PRIORITY[task.priority].label}
                    </Chip>
                  </div>
                  <Kanban.CardActions>
                    <Button
                      size="sm"
                      variant="ghost"
                      data-kanban-card-action="priority"
                      aria-label={`Change priority of ${task.title}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        kanban.updateItem(task.id, { ...task, priority: nextPriority });
                      }}
                    >
                      {KANBAN_PRIORITY[nextPriority].label}
                    </Button>
                  </Kanban.CardActions>
                </Kanban.CardContent>
              </Kanban.Card>
            );
          }}
        </Kanban.CardList>
      </Kanban.ColumnBody>
    </Kanban.Column>
  );
};

const renderKanbanEmpty = () => <Kanban.Empty>Drop cards here</Kanban.Empty>;

const KanbanDemo = () => {
  const [nextTaskIndex, setNextTaskIndex] = useState(7);
  const kanban = useKanban<KanbanTask>({
    initialItems: KANBAN_TASKS,
    getColumn: getKanbanColumn,
    setColumn: setKanbanColumn,
  });

  const handleAddTask = () => {
    kanban.addItem({
      id: `t${nextTaskIndex}`,
      title: `New task #${nextTaskIndex}`,
      status: 'todo',
      priority: 'normal',
    });
    setNextTaskIndex((value) => value + 1);
  };

  const distribution = KANBAN_COLUMNS.map(
    (column) => `${column.title} ${kanban.list.items.filter((task) => task.status === column.id).length}`,
  ).join(' · ');
  const order = getKanbanBoardOrder(kanban.list.items);

  return (
    <DemoSection isColumn label="multi-column · drag between columns / reorder / keyboard sorting / add task (live counts)">
      <Kanban size="sm" style={{ width: 820 }}>
        {KANBAN_COLUMNS.map((column) => (
          <KanbanColumnView
            key={column.id}
            kanban={kanban}
            column={column}
            actions={
              column.id === 'todo' ? (
                <Button size="sm" variant="ghost" onClick={handleAddTask}>
                  Add a task
                </Button>
              ) : undefined
            }
          />
        ))}
      </Kanban>
      <div style={{ fontSize: 13, color: 'var(--muted)' }} data-kanban-keyboard-hint>
        Keyboard sorting: focus a card drag handle, press Space/Enter to grab, arrow keys to move (up/down within a column, left/right between columns), Esc to cancel.
      </div>
      <div style={{ fontSize: 13, color: 'var(--foreground)' }} data-kanban-distribution>
        Distribution: {distribution}
      </div>
      <div style={{ fontSize: 13, color: 'var(--muted)' }} data-kanban-order>
        Order: {order}
      </div>
    </DemoSection>
  );
};

type OrderRow = {
  id: string;
  student: string;
  course: string;
  amount: number;
  status: string;
};

const ORDER_ROWS: OrderRow[] = [
  { id: '20260612001', student: 'Olivia Martin', course: 'Enterprise Plan', amount: 3980, status: 'Paid' },
  { id: '20260612002', student: 'Jackson Lee', course: 'Team Plan', amount: 2680, status: 'Pending' },
  { id: '20260612003', student: 'Isabella Nguyen', course: 'Starter Plan', amount: 1280, status: 'Refunded' },
  { id: '20260612004', student: 'Liam Johnson', course: 'Business Plan', amount: 4680, status: 'Paid' },
];

const renderOrderStatus = (row: OrderRow) => {
  const color = row.status === 'Paid' ? 'success' : row.status === 'Pending' ? 'warning' : 'danger';
  return (
    <Chip size="sm" color={color}>
      {row.status}
    </Chip>
  );
};

const renderOrderAmount = (row: OrderRow) => `$${row.amount.toLocaleString('en-US')}`;

const ORDER_COLUMNS: DataGridColumn<OrderRow>[] = [
  { id: 'id', header: 'Order ID', accessorKey: 'id', isRowHeader: true, width: 150 },
  { id: 'student', header: 'Customer', accessorKey: 'student', allowsSorting: true, width: 140 },
  { id: 'course', header: 'Plan', accessorKey: 'course' },
  { id: 'amount', header: 'Amount', accessorKey: 'amount', allowsSorting: true, align: 'end', cell: renderOrderAmount },
  { id: 'status', header: 'Status', accessorKey: 'status', cell: renderOrderStatus },
];

const orderRowId = (row: OrderRow) => row.id;

const sortOrderRows = (rows: OrderRow[], descriptor: DemoSortDescriptor): OrderRow[] => {
  const column = descriptor.column;
  if (column === undefined) {
    return rows;
  }
  const sorted = [...rows].sort((a, b) => {
    const av = a[column as keyof OrderRow];
    const bv = b[column as keyof OrderRow];
    if (typeof av === 'number' && typeof bv === 'number') {
      return av - bv;
    }
    return String(av).localeCompare(String(bv));
  });
  return descriptor.direction === 'descending' ? sorted.reverse() : sorted;
};

const DataGridDemo = () => {
  const [sortDescriptor, setSortDescriptor] = useState<DemoSortDescriptor>({
    column: 'amount',
    direction: 'descending',
  });
  const [selectedKeys, setSelectedKeys] = useState<DemoSelection>(new Set(['20260612001']));
  const [rowMessage, setRowMessage] = useState('Double-click a row or press Enter to open an order');

  // 受控排序：调用方据 descriptor 自行重排数据（服务端排序的本地等价）
  const rows = sortOrderRows(ORDER_ROWS, sortDescriptor);

  const selectedLabel =
    selectedKeys === 'all' ? 'All' : [...selectedKeys].map(String).join(', ') || '(none)';
  const sortLabel = `${String(sortDescriptor.column)} (${
    sortDescriptor.direction === 'ascending' ? 'ascending' : 'descending'
  })`;

  return (
    <DemoSection isColumn label="controlled/uncontrolled sorting (click headers to toggle aria-sort) + multi-select readout">
      <div style={{ width: 720 }}>
        <DataGrid
          aria-label="Orders"
          columns={ORDER_COLUMNS}
          data={rows}
          getRowId={orderRowId}
          selectionMode="multiple"
          showSelectionCheckboxes
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
          sortDescriptor={sortDescriptor}
          onSortChange={setSortDescriptor}
          onRowAction={(key) => setRowMessage(`Opened order ${String(key)}`)}
        />
      </div>
      <div style={{ fontSize: 13, color: 'var(--foreground)' }}>
        Sort: {sortLabel} · Selected: {selectedLabel} · {rowMessage}
      </div>
      <div style={{ width: 720 }}>
        <DataGrid
          aria-label="Default sorted orders"
          columns={ORDER_COLUMNS}
          data={ORDER_ROWS}
          getRowId={orderRowId}
          defaultSortDescriptor={{ column: 'student', direction: 'ascending' }}
        />
      </div>
    </DemoSection>
  );
};

type CarouselSlideData = {
  id: string;
  title: string;
  meta: string;
  accent: string;
  secondary: string;
  stats: string[];
};

const CAROUSEL_SLIDES: CarouselSlideData[] = [
  {
    id: 'slide-1',
    title: 'Slide 1',
    meta: 'Nike Free RN',
    accent: 'var(--accent)',
    secondary: 'var(--success)',
    stats: ['Running', 'Lightweight'],
  },
  {
    id: 'slide-2',
    title: 'Slide 2',
    meta: 'Nike Air Zoom',
    accent: 'var(--warning)',
    secondary: 'var(--accent)',
    stats: ['Training', 'Responsive'],
  },
  {
    id: 'slide-3',
    title: 'Slide 3',
    meta: 'Nike Pegasus',
    accent: 'var(--success)',
    secondary: 'var(--danger)',
    stats: ['Road', 'Cushioned'],
  },
];

const CarouselDemo = () => (
  <DemoSection isColumn>
    <Carousel aria-label="Product carousel" style={{ width: 420 }}>
      <Carousel.Content>
        {CAROUSEL_SLIDES.map((slide) => (
          <Carousel.Item key={slide.id}>
            <div
              style={{
                height: 160,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                background: 'var(--surface-secondary)',
                color: 'var(--foreground)',
                fontSize: 14,
              }}
            >
              <span>{slide.title}</span>
              <span style={{ color: 'var(--muted)', fontSize: 12 }}>{slide.meta}</span>
            </div>
          </Carousel.Item>
        ))}
      </Carousel.Content>
      <Carousel.Previous />
      <Carousel.Next />
      <Carousel.Dots />
    </Carousel>
  </DemoSection>
);

type TocEntry = { key: string; label: string; level?: number };

const TOC_ITEMS: TocEntry[] = [
  { key: 'overview', label: 'Introduction', level: 1 },
  { key: 'students', label: 'Getting Started', level: 2 },
  { key: 'orders', label: 'API Reference', level: 2 },
  { key: 'courses', label: 'Examples', level: 1 },
  { key: 'faq', label: 'FAQ', level: 1 },
];

type TocDemoItemProps = {
  entry: TocEntry;
  isActive: boolean;
  onSelect: (key: string) => void;
};

const TocDemoItem = ({ entry, isActive, onSelect }: TocDemoItemProps) => {
  const handlePress = () => {
    onSelect(entry.key);
  };
  return (
    <FloatingToc.Item active={isActive} level={entry.level} onPress={handlePress}>
      {entry.label}
    </FloatingToc.Item>
  );
};

const FloatingTocDemo = () => {
  const [activeKey, setActiveKey] = useState('students');
  return (
    <DemoSection label="hover to expand · click to highlight the active section">
      <div style={{ padding: '8px 160px 8px 8px' }}>
        <FloatingToc placement="left" openDelay={200} closeDelay={300}>
          <FloatingToc.Trigger>
            {TOC_ITEMS.map((entry) => (
              <FloatingToc.Bar
                key={entry.key}
                active={entry.key === activeKey}
                level={entry.level}
              />
            ))}
          </FloatingToc.Trigger>
          <FloatingToc.Content>
            {TOC_ITEMS.map((entry) => (
              <TocDemoItem
                key={entry.key}
                entry={entry}
                isActive={entry.key === activeKey}
                onSelect={setActiveKey}
              />
            ))}
          </FloatingToc.Content>
        </FloatingToc>
      </div>
    </DemoSection>
  );
};

const HoverCardDemo = () => (
  <DemoSection label="hover trigger (300ms open / 200ms close) · with arrow">
    <p style={{ margin: 0, fontSize: 14, lineHeight: '32px' }}>
      Check out{' '}
      <HoverCard openDelay={300} closeDelay={200}>
        <HoverCard.Trigger>
          <Chip color="accent">@hero_ui</Chip>
        </HoverCard.Trigger>
        <HoverCard.Content placement="bottom">
          <HoverCard.Arrow />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 200 }}>
            <strong style={{ fontSize: 14 }}>@hero_ui</strong>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>
              Beautiful, fast and modern React UI library.
            </span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Joined December 2021</span>
          </div>
        </HoverCard.Content>
      </HoverCard>
      {' '}for beautiful React components.
    </p>
  </DemoSection>
);

const ChartTooltipDemo = () => (
  <DemoSection>
    <ChartTooltip>
      <ChartTooltip.Header>6 月 11 日</ChartTooltip.Header>
      <ChartTooltip.Item
        indicator="dot"
        indicatorColor="var(--accent)"
        label="新增学员"
        value="328"
      />
      <ChartTooltip.Item
        indicator="dot"
        indicatorColor="var(--success)"
        label="完课学员"
        value="1,286"
      />
      <ChartTooltip.Item
        indicator="line"
        indicatorColor="var(--warning)"
        label="客单价"
        value="¥2,430"
      />
    </ChartTooltip>
  </DemoSection>
);

/** 以本周一为锚生成事件日期，保证 demo 中事件始终落在可视范围内 */
const agendaWeekMonday = (() => {
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekday = (base.getDay() + 6) % 7;
  base.setDate(base.getDate() - weekday);
  return base;
})();

/** 相对本周一第 offset 天的指定时分 */
const agendaAt = (dayOffset: number, hour: number, minute = 0): Date => {
  const date = new Date(agendaWeekMonday);
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const AGENDA_EVENTS: AgendaEvent[] = [
  { id: '1', title: 'Team Standup', start: agendaAt(4, 9, 0), end: agendaAt(4, 9, 30), color: '#06b6d4' },
  { id: '2', title: 'Lunch', start: agendaAt(4, 12, 0), end: agendaAt(4, 13, 0), color: '#d946ef' },
  { id: '3', title: 'Design Review', start: agendaAt(4, 14, 0), end: agendaAt(4, 15, 30), color: '#3b82f6' },
  { id: '4', title: '1:1 with Manager', start: agendaAt(4, 16, 0), end: agendaAt(4, 16, 30), color: '#10b981' },
  { id: '5', title: 'Product Sync', start: agendaAt(4, 9, 0), end: agendaAt(4, 10, 0), color: '#f59e0b' },
  { id: '6', title: 'Eng Huddle', start: agendaAt(4, 9, 15), end: agendaAt(4, 10, 15), color: '#8b5cf6' },
  { id: '7', title: 'Client Call', start: agendaAt(4, 14, 30), end: agendaAt(4, 15, 30), color: '#ef4444' },
  { id: '10', title: 'Sprint Planning', start: agendaAt(3, 10, 0), end: agendaAt(3, 11, 30), color: '#f59e0b' },
  { id: '14', title: 'Code Review', start: agendaAt(6, 11, 0), end: agendaAt(6, 12, 0), color: '#10b981' },
  {
    id: '16',
    title: 'Planning',
    start: agendaAt(4, 10, 15),
    end: agendaAt(4, 11, 15),
    color: '#3b82f6',
    status: 'unconfirmed',
  },
  {
    id: '17',
    title: 'Company All-Hands',
    start: agendaAt(5, 9, 0),
    end: agendaAt(5, 10, 0),
    color: '#6b7280',
    isReadOnly: true,
  },
  {
    id: 'h1',
    title: 'Company Holiday',
    start: agendaAt(4, 0, 0),
    end: agendaAt(6, 0, 0),
    color: '#10b981',
    isAllDay: true,
  },
  {
    id: 'h2',
    title: 'Team Offsite',
    start: agendaAt(4, 0, 0),
    end: agendaAt(4, 0, 0),
    color: '#3b82f6',
    isAllDay: true,
  },
];

type AgendaVariant =
  | 'default'
  | 'views'
  | 'events'
  | 'drag-interactions'
  | 'all-day-events'
  | 'month-view-features'
  | 'weekend-highlighting'
  | 'current-time-indicator';

const AGENDA_MONTH_FEATURE_EVENTS: AgendaEvent[] = [
  ...AGENDA_EVENTS,
  { id: 'm1', title: 'Office Hours', start: agendaAt(2, 9, 0), end: agendaAt(2, 9, 45), color: '#06b6d4' },
  { id: 'm2', title: 'Mentor Sync', start: agendaAt(2, 10, 0), end: agendaAt(2, 10, 45), color: '#8b5cf6' },
  { id: 'm3', title: 'Content QA', start: agendaAt(2, 11, 0), end: agendaAt(2, 12, 0), color: '#f59e0b' },
  { id: 'm4', title: 'Launch Review', start: agendaAt(1, 0, 0), end: agendaAt(3, 0, 0), color: '#ef4444', isAllDay: true },
];

const AgendaCanvas = ({
  agenda,
  monthMaxEvents = 2,
}: {
  agenda: ReturnType<typeof useAgenda>;
  monthMaxEvents?: number;
}) => (
  <div style={{ height: 600, width: '100%' }}>
    <Agenda {...agenda}>
      <Agenda.Header>
        <Agenda.Heading />
        <Agenda.ViewSelector />
        <Agenda.Navigation>
          <Agenda.NavButton slot="previous" />
          <Agenda.TodayButton />
          <Agenda.NavButton slot="next" />
        </Agenda.Navigation>
      </Agenda.Header>
      <Agenda.Body>
        {agenda.view === 'month' ? (
          <Agenda.MonthGrid>
            {agenda.visibleWeeks.map((week, weekIndex) => {
              const rowLayout = agenda.getMonthRowLayout(week);
              return (
                <Agenda.MonthRow
                  // eslint-disable-next-line react/no-array-index-key -- 周序号在当前视图内稳定
                  key={weekIndex}
                  spanningRowCount={rowLayout.rowCount}
                >
                  {rowLayout.items.map((item) => (
                    <Agenda.MonthSpanningEvent
                      key={item.event.id}
                      event={item.event}
                      colStart={item.colStart}
                      colSpan={item.colSpan}
                      row={item.row}
                    />
                  ))}
                  {week.map((day, colIndex) => (
                    <Agenda.MonthCell
                      key={day.toISOString()}
                      date={day}
                      maxEvents={monthMaxEvents}
                      spanningRowCount={rowLayout.rowCountPerCol[colIndex] ?? 0}
                    >
                      {agenda.getPerCellEvents(day, week).map((event) => (
                        <Agenda.MonthEvent key={event.id} event={event} />
                      ))}
                    </Agenda.MonthCell>
                  ))}
                </Agenda.MonthRow>
              );
            })}
          </Agenda.MonthGrid>
        ) : (
          <>
            <Agenda.WeekHeader />
            <Agenda.AllDaySection>
              <Agenda.AllDayLabel>all-day</Agenda.AllDayLabel>
              {agenda.allDayLayout.map((item) => (
                <Agenda.AllDayEvent
                  key={item.event.id}
                  event={item.event}
                  colStart={item.colStart}
                  colSpan={item.colSpan}
                  row={item.row}
                />
              ))}
            </Agenda.AllDaySection>
            <Agenda.TimeGrid>
              <Agenda.CurrentTimeIndicator />
              {agenda.visibleDays.map((day) => (
                <Agenda.DayColumn key={day.toISOString()} date={day}>
                  {agenda.getEventsForDay(day).map((event) => (
                    <Agenda.Event key={event.id} event={event} />
                  ))}
                </Agenda.DayColumn>
              ))}
            </Agenda.TimeGrid>
          </>
        )}
      </Agenda.Body>
    </Agenda>
  </div>
);

const AgendaVariantDemo = ({ variant }: { variant: AgendaVariant }) => {
  const [events, setEvents] = useState(
    variant === 'month-view-features' ? AGENDA_MONTH_FEATURE_EVENTS : AGENDA_EVENTS,
  );
  const [message, setMessage] = useState('Click an event to select it; drag to move, drag the bottom edge to resize.');
  const now = new Date();
  const isMonth = variant === 'month-view-features';
  const startHour = variant === 'current-time-indicator' ? Math.max(0, now.getHours() - 2) : 8;
  const endHour = variant === 'current-time-indicator' ? Math.min(24, now.getHours() + 3) : 18;

  const updateTimedEvent = useCallback((id: string, start: Date, end: Date) => {
    setEvents((current) =>
      current.map((event) => (event.id === id ? { ...event, start, end } : event)),
    );
    setMessage(`Updated ${id}: ${start.toLocaleTimeString()} - ${end.toLocaleTimeString()}`);
  }, []);
  const agenda = useAgenda({
    events,
    defaultView:
      isMonth ? 'month' : variant === 'views' || variant === 'events' ? 'day' : 'week',
    defaultDate: variant === 'current-time-indicator' ? now : agendaAt(4, 0, 0),
    startHour,
    endHour,
    onEventMove: updateTimedEvent,
    onEventResize: updateTimedEvent,
    onEventCreate: ({ start, end }) => {
      const id = `created-${start.getTime()}`;
      setEvents((current) => [
        ...current,
        {
          id,
          title: 'New Event',
          start,
          end,
          color: '#14b8a6',
        },
      ]);
      setMessage(`Created event ${start.toLocaleTimeString()} - ${end.toLocaleTimeString()}`);
    },
    onEventDelete: (id) => {
      setEvents((current) => current.filter((event) => event.id !== id));
      setMessage(`Deleted event ${id}`);
    },
    onEventSelect: (id) => setMessage(id === null ? 'No event selected' : `Selected event ${id}`),
  });

  return (
    <DemoSection isColumn label={variant}>
      <AgendaCanvas agenda={agenda} monthMaxEvents={variant === 'month-view-features' ? 1 : 2} />
      <span style={demoMutedStyle}>
        {variant === 'current-time-indicator'
          ? 'The current time line refreshes every minute; today\'s column is highlighted.'
          : variant === 'weekend-highlighting'
            ? 'Weekend columns and month-view weekend cells emit data-weekend.'
            : message}
      </span>
    </DemoSection>
  );
};

const demoTextStyle = { fontSize: 13, color: 'var(--foreground)' } as const;
const demoMutedStyle = { fontSize: 12, color: 'var(--muted)' } as const;

const toSparklineData = (values: number[]) =>
  values.map((value, index) => ({ label: `${index + 1}`, value }));

const SparklineBars = ({
  values,
  color = 'var(--accent)',
  height = 48,
}: {
  values: number[];
  color?: string;
  height?: number;
}) => (
  <BarChart
    aria-label="学习趋势柱状图"
    data={toSparklineData(values)}
    height={height}
    margin={{ top: 4, right: 2, bottom: 0, left: 2 }}
    barCategoryGap="24%"
  >
    <BarChart.XAxis dataKey="label" hide />
    <BarChart.YAxis hide domain={[0, 'dataMax']} />
    <BarChart.Tooltip cursor={false} content={<BarChart.TooltipContent />} />
    <BarChart.Bar dataKey="value" name="学习量" fill={color} radius={[4, 4, 0, 0]} />
  </BarChart>
);

const SparklineLine = ({
  values,
  color = 'var(--accent)',
}: {
  values: number[];
  color?: string;
}) => (
  <LineChart
    aria-label="学习趋势折线图"
    data={toSparklineData(values)}
    height={52}
    margin={{ top: 4, right: 2, bottom: 0, left: 2 }}
  >
    <LineChart.XAxis dataKey="label" hide />
    <LineChart.YAxis hide domain={['dataMin', 'dataMax']} />
    <LineChart.Tooltip cursor={false} content={<LineChart.TooltipContent hideLabel />} />
    <LineChart.Line
      type="monotone"
      dataKey="value"
      name="学习量"
      stroke={color}
      strokeWidth={3}
      dot={{ r: 2.5, fill: color, strokeWidth: 0 }}
      activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
    />
  </LineChart>
);

const CourseCover = ({ title }: { title: string }) => (
  <div
    aria-hidden="true"
    style={{
      width: '100%',
      height: 84,
      borderRadius: 8,
      display: 'grid',
      placeItems: 'center',
      color: 'var(--accent-foreground)',
      background: 'linear-gradient(135deg, var(--accent), var(--success))',
      fontSize: 14,
      fontWeight: 700,
    }}
  >
    {title}
  </div>
);

const SIMPLE_COURSES = [
  { id: 'c1', name: 'Marketing Website', owner: 'Lindsay Walton', progress: 86 },
  { id: 'c2', name: 'Mobile App', owner: 'Courtney Henry', progress: 64 },
  { id: 'c3', name: 'Design System', owner: 'Tom Cook', progress: 42 },
];

type StudentRow = {
  id: string;
  name: string;
  group: string;
  active: string;
  score: number;
};

const STUDENT_ROWS: StudentRow[] = [
  { id: 'u1', name: 'Lindsay Walton', group: 'Front-end Developer', active: 'Today', score: 92 },
  { id: 'u2', name: 'Courtney Henry', group: 'Designer', active: 'Yesterday', score: 86 },
  { id: 'u3', name: 'Tom Cook', group: 'Director of Product', active: '3 days ago', score: 74 },
  { id: 'u4', name: 'Whitney Francis', group: 'Copywriter', active: 'Today', score: 88 },
];

const STUDENT_COLUMNS: DataGridColumn<StudentRow>[] = [
  { id: 'name', header: 'Name', accessorKey: 'name', isRowHeader: true, allowsSorting: true },
  { id: 'group', header: 'Title', accessorKey: 'group', width: 180 },
  { id: 'active', header: 'Last active', accessorKey: 'active', width: 110 },
  { id: 'score', header: 'Score', accessorKey: 'score', allowsSorting: true, align: 'end' },
];

type TransactionStatus = 'Succeeded' | 'Processing' | 'Refunded' | 'Failed';

type TransactionRow = {
  id: string;
  customer: string;
  email: string;
  transactionId: string;
  status: TransactionStatus;
  amount: string;
  balance: string;
};

const TRANSACTION_ROWS: TransactionRow[] = [
  {
    id: 'emma',
    customer: 'Emma Wilson',
    email: 'emma@example.com',
    transactionId: 'pay_1N3xDR',
    status: 'Succeeded',
    amount: '$2,450.00',
    balance: '$730.00',
  },
  {
    id: 'isabella',
    customer: 'Isabella Nguyen',
    email: 'isabella@example.com',
    transactionId: 'pay_1N3x9H',
    status: 'Succeeded',
    amount: '$299.00',
    balance: '$89.00',
  },
  {
    id: 'jackson',
    customer: 'Jackson Lee',
    email: 'jackson@example.com',
    transactionId: 'pay_1N3x8L',
    status: 'Processing',
    amount: '$39.00',
    balance: '$12.00',
  },
  {
    id: 'liam',
    customer: 'Liam Johnson',
    email: 'liam@example.com',
    transactionId: 'pay_1N3xC0',
    status: 'Refunded',
    amount: '$150.00',
    balance: '$45.00',
  },
  {
    id: 'olivia',
    customer: 'Olivia Martin',
    email: 'olivia@example.com',
    transactionId: 'pay_1N3x7K',
    status: 'Succeeded',
    amount: '$1,999.00',
    balance: '$599.00',
  },
  {
    id: 'sofia',
    customer: 'Sofia Davis',
    email: 'sofia@example.com',
    transactionId: 'pay_1N3xHP',
    status: 'Failed',
    amount: '$450.00',
    balance: '$135.00',
  },
  {
    id: 'william',
    customer: 'William Kim',
    email: 'will@example.com',
    transactionId: 'pay_1N3xAN',
    status: 'Failed',
    amount: '$99.00',
    balance: '$30.00',
  },
];

const transactionRowId = (row: TransactionRow) => row.id;

const TransactionStatusBadge = ({ status }: { status: TransactionStatus }) => (
  <span className={`sc-transaction-status sc-transaction-status--${status.toLowerCase()}`}>
    <span aria-hidden="true" />
    {status}
  </span>
);

const TRANSACTION_COLUMNS: DataGridColumn<TransactionRow>[] = [
  {
    id: 'customer',
    header: 'Customer',
    isRowHeader: true,
    allowsSorting: true,
    width: 220,
    cell: (row) => (
      <span className="sc-transaction-customer">
        <strong>{row.customer}</strong>
        <span>{row.email}</span>
      </span>
    ),
  },
  { id: 'transactionId', header: 'Transaction ID', accessorKey: 'transactionId', width: 150 },
  {
    id: 'status',
    header: 'Status',
    width: 132,
    cell: (row) => <TransactionStatusBadge status={row.status} />,
  },
  { id: 'amount', header: 'Amount', accessorKey: 'amount', width: 130, align: 'end', allowsSorting: true },
  { id: 'balance', header: 'Balance', accessorKey: 'balance', width: 110, align: 'end' },
  {
    id: 'actions',
    header: '',
    width: 52,
    align: 'center',
    cell: () => (
      <Button aria-label="Open row menu" className="sc-row-menu-button" isIconOnly size="sm" variant="ghost">
        <span aria-hidden="true">⋮</span>
      </Button>
    ),
  },
];

const COURSE_COLUMNS: DataGridColumn<(typeof SIMPLE_COURSES)[number]>[] = [
  { id: 'name', header: 'Project', accessorKey: 'name', isRowHeader: true },
  { id: 'owner', header: 'Owner', accessorKey: 'owner', width: 120 },
  {
    id: 'progress',
    header: 'Progress',
    accessorKey: 'progress',
    width: 160,
    cell: (row) => (
      <ProgressBar
        aria-label={`${row.name} progress`}
        color={row.progress > 80 ? 'success' : 'accent'}
        isShowValue={false}
        size="sm"
        value={row.progress}
      />
    ),
  },
];

const studentRowId = (row: StudentRow) => row.id;
const courseRowId = (row: (typeof SIMPLE_COURSES)[number]) => row.id;

const ActionBarDefaultVariantDemo = () => {
  const [open, setOpen] = useState(true);
  const [action, setAction] = useState('Waiting for an action');

  return (
    <DemoSection isColumn label="default · controlled visibility">
      <Button size="sm" variant="secondary" onClick={() => setOpen((value) => !value)}>
        {open ? 'Hide action bar' : 'Show action bar'}
      </Button>
      <ActionBar isOpen={open}>
        <ActionBar.Prefix>
          <Badge color="accent">3</Badge>
          <ActionBar.Label>Selected</ActionBar.Label>
        </ActionBar.Prefix>
        <Separator orientation="vertical" />
        <ActionBar.Content>
          <Button size="sm" variant="ghost" onClick={() => setAction('Marked 3 items as complete')}>
            Mark complete
          </Button>
          <Button size="sm" variant="danger-soft" onClick={() => setAction('Dismissed selected items')}>
            Dismiss
          </Button>
        </ActionBar.Content>
      </ActionBar>
      <span style={demoTextStyle}>{action}</span>
    </DemoSection>
  );
};

const ActionBarWithDataGridVariantDemo = () => {
  const [selectedKeys, setSelectedKeys] = useState<DemoSelection>(new Set(['20260612001']));
  const [action, setAction] = useState('Select orders to run a bulk action');
  const count = selectedKeys === 'all' ? ORDER_ROWS.length : selectedKeys.size;

  return (
    <DemoSection isColumn label="data grid selection drives action bar">
      <div style={{ width: 720 }}>
        <DataGrid
          aria-label="Bulk orders"
          columns={ORDER_COLUMNS}
          data={ORDER_ROWS}
          getRowId={orderRowId}
          selectedKeys={selectedKeys}
          selectionMode="multiple"
          showSelectionCheckboxes
          onSelectionChange={setSelectedKeys}
        />
      </div>
      <ActionBar isOpen={count > 0}>
        <ActionBar.Prefix>
          <Chip color="accent" size="sm">
            {count}
          </Chip>
          <ActionBar.Label>selected</ActionBar.Label>
        </ActionBar.Prefix>
        <Separator orientation="vertical" />
        <ActionBar.Content>
          <Button size="sm" variant="ghost" onClick={() => setAction(`Exported ${count} orders`)}>
            Export
          </Button>
          <Button
            size="sm"
            variant="danger-soft"
            onClick={() => {
              setAction(`Closed ${count} orders`);
              setSelectedKeys(new Set());
            }}
          >
            Close
          </Button>
        </ActionBar.Content>
      </ActionBar>
      <span style={demoTextStyle}>{action}</span>
    </DemoSection>
  );
};

const ActionBarResponsiveLabelsVariantDemo = () => {
  const [selectedKeys, setSelectedKeys] = useState<DemoSelection>(new Set(['20260612001', '20260612003']));
  const [action, setAction] = useState('Selected 2 orders');
  const count = selectedKeys === 'all' ? ORDER_ROWS.length : selectedKeys.size;

  return (
    <DemoSection isColumn label="responsive labels">
      <div style={{ width: 560, maxWidth: '100%' }}>
        <DataGrid
          aria-label="Responsive action bar orders"
          columns={ORDER_COLUMNS.slice(0, 3)}
          data={ORDER_ROWS.slice(0, 4)}
          getRowId={orderRowId}
          selectedKeys={selectedKeys}
          selectionMode="multiple"
          showSelectionCheckboxes
          onSelectionChange={setSelectedKeys}
        />
      </div>
      <ActionBar isOpen={count > 0} aria-label="Responsive action labels">
        <ActionBar.Prefix>
          <Chip color="accent" size="sm">
            {count}
          </Chip>
          <ActionBar.Label>selected</ActionBar.Label>
        </ActionBar.Prefix>
        <Separator orientation="vertical" />
        <ActionBar.Content>
          <Button size="sm" variant="ghost" aria-label="Archive selected orders" onClick={() => setAction(`Archived ${count} orders`)}>
            Archive
          </Button>
          <Button size="sm" variant="ghost" aria-label="Assign selected orders" onClick={() => setAction(`Assigned ${count} orders`)}>
            Assign
          </Button>
          <Button
            size="sm"
            variant="danger-soft"
            aria-label="Clear selected orders"
            onClick={() => {
              setAction('Cleared selection');
              setSelectedKeys(new Set());
            }}
          >
            Clear
          </Button>
        </ActionBar.Content>
      </ActionBar>
      <span style={demoTextStyle}>{action}</span>
    </DemoSection>
  );
};

const CarouselSlide = ({ title, meta }: { title: string; meta: string }) => (
  <div
    style={{
      height: 168,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      borderRadius: 8,
      padding: 18,
      background: 'var(--surface-secondary)',
      color: 'var(--foreground)',
    }}
  >
    <strong>{title}</strong>
    <span style={demoMutedStyle}>{meta}</span>
  </div>
);

type CarouselVariant =
  | 'api-access'
  | 'autoplay'
  | 'default'
  | 'loop'
  | 'modal-type'
  | 'multiple-slides';

const CarouselVariantDemo = ({ variant }: { variant: CarouselVariant }) => {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [apiMessage, setApiMessage] = useState('Not scrolled yet');
  const [isPlaying, setIsPlaying] = useState(variant === 'autoplay');

  const isMultiple = variant === 'multiple-slides';
  const carouselType = variant === 'modal-type' ? 'modal' : 'in-place';
  const opts = variant === 'loop' || variant === 'autoplay' ? { loop: true } : undefined;

  const handleApiJump = () => {
    api?.scrollTo(2);
    setApiMessage('Scrolled to slide 3');
  };

  return (
    <DemoSection isColumn label={variant}>
      <Carousel
        aria-label="Product carousel"
        autoplay={variant === 'autoplay' && isPlaying ? { delay: 1800 } : false}
        opts={opts}
        setApi={setApi}
        style={{ width: variant === 'modal-type' ? 360 : 460 }}
        type={carouselType}
      >
        <Carousel.Content>
          {CAROUSEL_SLIDES.map((slide, index) => (
            <Carousel.Item
              key={slide.id}
              style={isMultiple ? { flex: '0 0 58%', paddingRight: 12 } : undefined}
            >
              <CarouselSlide meta={`${slide.meta} · ${index + 1} of ${CAROUSEL_SLIDES.length}`} title={slide.title} />
            </Carousel.Item>
          ))}
        </Carousel.Content>
        <Carousel.Previous />
        <Carousel.Next />
        <Carousel.Dots
          renderDot={
            variant === 'api-access'
              ? ({ index, isSelected }) => (
                  <Carousel.Dot
                    key={index}
                    aria-label={`Go to slide ${index + 1}`}
                    data-selected={isSelected || undefined}
                    index={index}
                    isSelected={isSelected}
                    style={{
                      width: isSelected ? 18 : 8,
                      height: 8,
                      border: 0,
                      borderRadius: 999,
                      background: isSelected ? 'var(--accent)' : 'var(--default)',
                    }}
                  />
                )
              : undefined
          }
        />
      </Carousel>
      {variant === 'api-access' && (
        <>
          <Button size="sm" variant="secondary" onClick={handleApiJump}>
            Scroll to slide 3
          </Button>
          <span style={demoTextStyle}>{apiMessage}</span>
        </>
      )}
      {variant === 'autoplay' && (
        <Switch isSelected={isPlaying} size="sm" onSelectedChange={setIsPlaying}>
          Autoplay
        </Switch>
      )}
    </DemoSection>
  );
};

const DataGridDefaultVariantDemo = () => {
  return (
    <DemoSection isColumn>
      <div style={{ width: 720 }}>
        <DataGrid
          aria-label="Transactions"
          columns={TRANSACTION_COLUMNS}
          data={TRANSACTION_ROWS}
          defaultSelectedKeys={new Set(['emma'])}
          defaultSortDescriptor={{ column: 'customer', direction: 'ascending' }}
          getRowId={transactionRowId}
          selectionMode="multiple"
          showSelectionCheckboxes
        />
      </div>
    </DemoSection>
  );
};

const DataGridColumnDefinitionsVariantDemo = () => {
  const [message, setMessage] = useState('Double-click a row or press Enter to open transaction details');
  const columns: DataGridColumn<TransactionRow>[] = [
    {
      id: 'customer',
      header: ({ sortDirection }) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          Customer
          {sortDirection !== undefined && (
            <Badge color="accent">{sortDirection === 'ascending' ? 'A-Z' : 'Z-A'}</Badge>
          )}
        </span>
      ),
      isRowHeader: true,
      allowsSorting: true,
      width: 220,
      cell: (row) => (
        <span className="sc-transaction-customer">
          <strong>{row.customer}</strong>
          <span>{row.email}</span>
        </span>
      ),
    },
    { id: 'transactionId', header: 'Transaction ID', accessorKey: 'transactionId', width: 150 },
    {
      id: 'status',
      header: 'Status',
      width: 132,
      cell: (row) => <TransactionStatusBadge status={row.status} />,
    },
    {
      id: 'amount',
      header: 'Amount',
      accessorKey: 'amount',
      width: 130,
      align: 'end',
      allowsSorting: true,
    },
  ];

  return (
    <DemoSection isColumn label="column definitions">
      <div style={{ width: 720 }}>
        <DataGrid
          aria-label="Column definition transactions"
          columns={columns}
          data={TRANSACTION_ROWS.slice(0, 5)}
          defaultSortDescriptor={{ column: 'customer', direction: 'ascending' }}
          getRowId={transactionRowId}
          onRowAction={(key) => setMessage(`Opened transaction ${String(key)}`)}
        />
      </div>
      <span style={demoMutedStyle}>{message}</span>
    </DemoSection>
  );
};

const DataGridRowSelectionVariantDemo = () => {
  const [selectedKeys, setSelectedKeys] = useState<DemoSelection>(new Set(['emma', 'olivia']));
  const selectedCount =
    selectedKeys === 'all' ? TRANSACTION_ROWS.length : selectedKeys.size;

  return (
    <DemoSection isColumn label="row selection">
      <div style={{ width: 720 }}>
        <DataGrid
          aria-label="Selectable transactions"
          columns={TRANSACTION_COLUMNS}
          data={TRANSACTION_ROWS}
          getRowId={transactionRowId}
          selectedKeys={selectedKeys}
          selectionMode="multiple"
          showSelectionCheckboxes
          onSelectionChange={setSelectedKeys}
        />
      </div>
      <ActionBar isOpen={selectedCount > 0}>
        <ActionBar.Prefix>
          <Chip color="accent" size="sm">
            {selectedCount}
          </Chip>
          <ActionBar.Label>selected</ActionBar.Label>
        </ActionBar.Prefix>
        <Separator orientation="vertical" />
        <ActionBar.Content>
          <Button size="sm" variant="ghost" onClick={() => setSelectedKeys(new Set())}>
            Clear
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedKeys('all')}>
            Select all
          </Button>
        </ActionBar.Content>
      </ActionBar>
    </DemoSection>
  );
};

const DataGridSortingVariantDemo = () => {
  const [sortDescriptor, setSortDescriptor] = useState<DemoSortDescriptor>({
    column: 'amount',
    direction: 'descending',
  });
  const rows = [...TRANSACTION_ROWS].sort((a, b) => {
    const column = sortDescriptor.column as keyof TransactionRow;
    const left = a[column];
    const right = b[column];
    const result = String(left).localeCompare(String(right), undefined, { numeric: true });
    return sortDescriptor.direction === 'descending' ? -result : result;
  });

  return (
    <DemoSection isColumn label="sorting">
      <div style={{ width: 720 }}>
        <DataGrid
          aria-label="Sortable transactions"
          columns={TRANSACTION_COLUMNS}
          data={rows}
          getRowId={transactionRowId}
          sortDescriptor={sortDescriptor}
          onSortChange={setSortDescriptor}
        />
      </div>
      <span style={demoTextStyle}>
        Sort: {String(sortDescriptor.column)} ·{' '}
        {sortDescriptor.direction === 'ascending' ? 'ascending' : 'descending'}
      </span>
    </DemoSection>
  );
};

const DataGridColumnResizingVariantDemo = () => {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({
    customer: 220,
    transactionId: 150,
    status: 132,
    amount: 130,
    balance: 110,
    actions: 52,
  });
  const [message, setMessage] = useState('Drag the header dividers to resize columns');

  return (
    <DemoSection isColumn label="column resizing">
      <div style={{ width: 720 }}>
        <DataGrid
          aria-label="Resizable transactions"
          columns={TRANSACTION_COLUMNS.map((column) => ({
            ...column,
            minWidth: column.id === 'actions' ? 48 : 96,
            maxWidth: column.id === 'customer' ? 320 : 240,
            resizable: column.id !== 'actions',
          }))}
          columnWidths={columnWidths}
          data={TRANSACTION_ROWS}
          enableColumnResizing
          getRowId={transactionRowId}
          onColumnResize={({ columnId, width }) => {
            setColumnWidths((current) => ({ ...current, [columnId]: width }));
            setMessage(`${columnId} width: ${width}px`);
          }}
        />
      </div>
      <span style={demoMutedStyle}>{message}</span>
    </DemoSection>
  );
};

const DataGridAsyncLoadingVariantDemo = () => {
  const [isLoading, setIsLoading] = useState(true);
  const rows = isLoading ? [] : STUDENT_ROWS;

  return (
    <DemoSection isColumn label="async loading state">
      <Button size="sm" variant="secondary" onClick={() => setIsLoading((value) => !value)}>
        {isLoading ? 'Load data' : 'Show loading state'}
      </Button>
      <div style={{ width: 720 }}>
        <DataGrid
          aria-label="Async users"
          columns={STUDENT_COLUMNS}
          data={rows}
          getRowId={studentRowId}
          renderEmptyState={() => (
            <div className="data-grid__empty-state">
              {isLoading ? 'Loading users…' : 'No users'}
            </div>
          )}
        />
      </div>
    </DemoSection>
  );
};

const DataGridBulkActionsVariantDemo = () => {
  const [selectedKeys, setSelectedKeys] = useState<DemoSelection>(new Set(['u1', 'u2']));
  const [action, setAction] = useState('Select users to run a bulk action');
  const count = selectedKeys === 'all' ? STUDENT_ROWS.length : selectedKeys.size;
  const handleAssignClass = () => setAction(`Assigned ${count} users to a team`);
  const handleNotify = () => setAction(`Notified ${count} users`);

  return (
    <DemoSection isColumn label="bulk actions">
      <div style={{ width: 720 }}>
        <DataGrid
          aria-label="Bulk users"
          columns={STUDENT_COLUMNS}
          data={STUDENT_ROWS}
          getRowId={studentRowId}
          selectedKeys={selectedKeys}
          selectionMode="multiple"
          showSelectionCheckboxes
          onSelectionChange={setSelectedKeys}
        />
      </div>
      <ActionBar isOpen={count > 0}>
        <ActionBar.Prefix>
          <Chip color="accent" size="sm">
            {count}
          </Chip>
          <ActionBar.Label>selected</ActionBar.Label>
        </ActionBar.Prefix>
        <Separator orientation="vertical" />
        <ActionBar.Content>
          <Button size="sm" variant="ghost" onClick={handleAssignClass}>
            Assign
          </Button>
          <Button size="sm" variant="ghost" onClick={handleNotify}>
            Notify
          </Button>
        </ActionBar.Content>
      </ActionBar>
      <span style={demoTextStyle}>{action}</span>
    </DemoSection>
  );
};

type ReorderRow = StudentRow & { order: number };

const REORDER_ROWS: ReorderRow[] = STUDENT_ROWS.map((row, index) => ({
  ...row,
  order: index + 1,
}));

const DataGridDragAndDropVariantDemo = () => {
  const [rows, setRows] = useState(REORDER_ROWS);

  const columns: DataGridColumn<ReorderRow>[] = [
    {
      id: 'order',
      header: 'Order',
      width: 56,
      accessorKey: 'order',
      align: 'end',
    },
    { id: 'name', header: 'Name', accessorKey: 'name', isRowHeader: true },
    { id: 'group', header: 'Title', accessorKey: 'group', width: 180 },
    { id: 'active', header: 'Last active', accessorKey: 'active', width: 110 },
    { id: 'score', header: 'Score', accessorKey: 'score', align: 'end' },
  ];

  return (
    <DemoSection isColumn label="drag and drop row reorder">
      <div style={{ width: 760 }}>
        <DataGrid
          aria-label="Reorderable users"
          columns={columns}
          data={rows}
          enableRowReordering
          getRowId={studentRowId}
          showRowDragHandles
          onRowReorder={(_, event) => {
            setRows(event.orderedRows.map((row, index) => ({ ...row, order: index + 1 })));
          }}
        />
      </div>
      <span style={demoTextStyle}>Order: {rows.map((row) => row.name).join(' / ')}</span>
    </DemoSection>
  );
};

const DataGridEditableCellsVariantDemo = () => {
  const [rows, setRows] = useState(SIMPLE_COURSES);
  const [editMessage, setEditMessage] = useState('Press Enter or blur to commit, Escape to cancel.');

  const parseProgress = (value: string) => {
    const parsed = Number(value.trim().replace(/%$/, ''));

    if (!Number.isFinite(parsed)) {
      throw new Error('Enter a number between 0 and 100');
    }

    return Math.min(100, Math.max(0, Math.round(parsed)));
  };

  const handleCellEdit = ({
    row,
    rowKey,
    columnId,
    value,
    reason,
  }: DataGridCellEditEvent<(typeof SIMPLE_COURSES)[number]>) => {
    setRows((current) =>
      current.map((course) => {
        if (String(course.id) !== String(rowKey)) return course;

        if (columnId === 'progress') {
          return { ...course, progress: Number(value) };
        }

        if (columnId === 'owner') {
          return { ...course, owner: String(value) };
        }

        if (columnId === 'name') {
          return { ...course, name: String(value) };
        }

        return course;
      }),
    );

    const label = columnId === 'progress' ? 'Progress' : columnId === 'owner' ? 'Owner' : 'Project';
    const displayValue = columnId === 'progress' ? `${String(value)}%` : String(value);
    setEditMessage(
      `Committed on ${reason === 'blur' ? 'blur' : 'Enter'}: ${row.name} ${label} is ${displayValue}`,
    );
  };

  const columns: DataGridColumn<(typeof SIMPLE_COURSES)[number]>[] = [
    { id: 'name', header: 'Project', accessorKey: 'name', isRowHeader: true, editable: true },
    { id: 'owner', header: 'Owner', accessorKey: 'owner', editable: true },
    {
      id: 'progress',
      header: 'Progress',
      accessorKey: 'progress',
      align: 'end',
      editable: true,
      format: (value) => `${String(value)}%`,
      parse: parseProgress,
    },
  ];

  return (
    <DemoSection isColumn label="editable cells">
      <div style={{ width: 640 }}>
        <DataGrid
          aria-label="Editable projects"
          columns={columns}
          data={rows}
          getRowId={courseRowId}
          onCellEdit={handleCellEdit}
        />
      </div>
      <span style={demoMutedStyle}>{editMessage}</span>
    </DemoSection>
  );
};

const DataGridEmptyStateVariantDemo = () => (
  <DemoSection label="empty state">
    <div style={{ width: 640 }}>
      <DataGrid
        aria-label="Empty projects"
        columns={COURSE_COLUMNS}
        data={[]}
        getRowId={courseRowId}
        renderEmptyState={() => (
          <div className="data-grid__empty-state">
            <EmptyState size="sm">
              <EmptyState.Header>
                <EmptyState.Title>No Projects Yet</EmptyState.Title>
                <EmptyState.Description>No projects match the current filters.</EmptyState.Description>
              </EmptyState.Header>
            </EmptyState>
          </div>
        )}
      />
    </div>
  </DemoSection>
);

type ExpandableCourse = (typeof SIMPLE_COURSES)[number] & { detail: string };

const EXPANDABLE_ROWS: ExpandableCourse[] = SIMPLE_COURSES.map((course) => ({
  ...course,
  detail: `${course.owner} is tracking ${course.progress}% of the project milestones.`,
}));

const DataGridExpandableRowsVariantDemo = () => {
  const [expandedKeys, setExpandedKeys] = useState<Set<DemoKey>>(new Set(['c1']));
  const columns: DataGridColumn<ExpandableCourse>[] = [
    {
      id: 'name',
      header: 'Project',
      isRowHeader: true,
      accessorKey: 'name',
    },
    { id: 'owner', header: 'Owner', accessorKey: 'owner', width: 120 },
    { id: 'progress', header: 'Progress', accessorKey: 'progress', align: 'end' },
  ];

  return (
    <DemoSection isColumn label="expandable rows">
      <div style={{ width: 680 }}>
        <DataGrid
          aria-label="Expandable projects"
          columns={columns}
          data={EXPANDABLE_ROWS}
          expandedKeys={expandedKeys}
          getRowId={courseRowId}
          onExpandedChange={(keys) => setExpandedKeys(new Set(keys as Set<DemoKey>))}
          renderExpandedContent={(row) => (
            <div style={{ display: 'grid', gap: 6 }}>
              <strong>{row.name} details</strong>
              <span style={demoMutedStyle}>{row.detail}</span>
              <ProgressBar
                aria-label={`${row.name} expanded row progress`}
                color={row.progress > 80 ? 'success' : 'accent'}
                isShowValue={false}
                size="sm"
                value={row.progress}
              />
            </div>
          )}
        />
      </div>
    </DemoSection>
  );
};

const DataGridPinnedColumnsVariantDemo = () => {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({
    id: 180,
    student: 112,
    course: 240,
    amount: 120,
    status: 120,
    teacher: 120,
    campus: 120,
  });
  const columns: DataGridColumn<OrderRow>[] = [
    {
      ...ORDER_COLUMNS[0],
      pin: 'left',
      cell: (row) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Badge color="accent">Pinned</Badge>
          {row.id}
        </span>
      ),
    },
    ...ORDER_COLUMNS.slice(1),
    { id: 'teacher', header: 'Rep', cell: (row) => (row.status === 'Paid' ? 'Avery Stone' : 'Jordan Reed'), width: 140 },
    { id: 'campus', header: 'Channel', cell: () => 'Online', width: 120, pin: 'right' },
  ];

  return (
    <DemoSection isColumn label="pinned columns">
      <div style={{ width: 620 }}>
        <DataGrid
          aria-label="Pinned column orders"
          columns={columns}
          columnWidths={columnWidths}
          contentClassName="min-w-[1040px]"
          data={ORDER_ROWS}
          enableColumnResizing
          getRowId={orderRowId}
          scrollContainerClassName="overflow-x-auto"
          onColumnResize={({ columnId, width }) =>
            setColumnWidths((current) => ({ ...current, [columnId]: width }))
          }
        />
      </div>
      <span style={demoMutedStyle}>Drag column borders to resize; pinned columns stay visible while scrolling.</span>
    </DemoSection>
  );
};

const SERVER_ROWS = [
  { id: 'srv-1', name: 'api-gateway', region: 'US-East', status: 'healthy', cpu: 48 },
  { id: 'srv-2', name: 'worker-pool', region: 'US-West', status: 'warming', cpu: 72 },
  { id: 'srv-3', name: 'billing-sync', region: 'EU-West', status: 'healthy', cpu: 35 },
];

type ServerRow = (typeof SERVER_ROWS)[number];

const SERVER_COLUMNS: DataGridColumn<ServerRow>[] = [
  { id: 'name', header: 'Service', accessorKey: 'name', isRowHeader: true, allowsSorting: true },
  { id: 'region', header: 'Region', accessorKey: 'region', width: 100 },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    cell: (row) => (
      <Chip color={row.status === 'healthy' ? 'success' : 'warning'} size="sm">
        {row.status}
      </Chip>
    ),
  },
  { id: 'cpu', header: 'CPU', accessorKey: 'cpu', align: 'end', allowsSorting: true },
];

const DataGridServersVariantDemo = () => (
  <DemoSection label="servers">
    <div style={{ width: 680 }}>
      <DataGrid
        aria-label="Server status"
        columns={SERVER_COLUMNS}
        data={SERVER_ROWS}
        defaultSortDescriptor={{ column: 'cpu', direction: 'descending' }}
        getRowId={(row) => row.id}
      />
    </div>
  </DemoSection>
);

const DataGridTeamMembersVariantDemo = () => (
  <DemoSection label="team members">
    <div style={{ width: 680 }}>
      <DataGrid
        aria-label="Team members"
        columns={[
          {
            id: 'name',
            header: 'Member',
            isRowHeader: true,
            cell: (row: StudentRow) => (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Avatar fallback={row.name.slice(0, 1)} size="sm" />
                {row.name}
              </span>
            ),
          },
          { id: 'group', header: 'Role', accessorKey: 'group' },
          { id: 'score', header: 'Score', accessorKey: 'score', align: 'end' },
        ]}
        data={STUDENT_ROWS}
        getRowId={studentRowId}
      />
    </div>
  </DemoSection>
);

const DataGridUsersVariantDemo = () => (
  <DemoSection label="users">
    <div style={{ width: 680 }}>
      <DataGrid
        aria-label="Users"
        columns={STUDENT_COLUMNS}
        data={STUDENT_ROWS}
        getRowId={studentRowId}
        selectionMode="single"
      />
    </div>
  </DemoSection>
);

const VIRTUAL_ROWS = Array.from({ length: 40 }, (_, index) => ({
  id: `v${index + 1}`,
  name: `User ${index + 1}`,
  group: index % 2 === 0 ? 'Front-end Developer' : 'Designer',
  active: index % 3 === 0 ? 'Today' : 'This week',
  score: 60 + ((index * 7) % 38),
}));

const DataGridVirtualizedVariantDemo = () => {
  const [range, setRange] = useState<DataGridVirtualRange>({
    startIndex: 0,
    endIndex: 8,
    visibleStartIndex: 0,
    visibleEndIndex: 8,
    total: VIRTUAL_ROWS.length,
  });

  return (
    <DemoSection isColumn label="virtualized rows">
      <div style={{ width: 680 }}>
        <DataGrid
          aria-label="Virtualized users"
          columns={STUDENT_COLUMNS}
          data={VIRTUAL_ROWS}
          getRowId={studentRowId}
          virtualized
          virtualMaxHeight={360}
          virtualOverscan={4}
          virtualRowHeight={45}
          onVirtualRangeChange={setRange}
        />
      </div>
      <span style={demoTextStyle}>
        Visible window: {range.visibleStartIndex + 1}-{range.visibleEndIndex} / {range.total}
      </span>
    </DemoSection>
  );
};

type EmptyStateVariant =
  | 'default'
  | 'full-height'
  | 'minimal'
  | 'outline'
  | 'sizes'
  | 'with-avatar'
  | 'with-avatar-group'
  | 'with-background';

/** Pro 风格渐变头像球：用于 with-avatar / with-avatar-group 空态 */
const GradientAvatar = ({ gradient, size = 48 }: { gradient: string; size?: number }) => (
  <span
    aria-hidden="true"
    style={{
      display: 'inline-block',
      width: size,
      height: size,
      borderRadius: '50%',
      background: gradient,
    }}
  />
);

const EmptyStateVariantDemo = ({ variant }: { variant: EmptyStateVariant }) => {
  // sizes 对齐 Pro：sm / md / lg 三个「No Projects Yet」并排
  if (variant === 'sizes') {
    return (
      <DemoSection>
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <div key={size} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={demoTextStyle}>{size}</span>
            <EmptyState size={size} style={{ width: 280 }}>
              <EmptyState.Header>
                <EmptyState.Media variant="icon">
                  <FolderIcon />
                </EmptyState.Media>
                <EmptyState.Title>No Projects Yet</EmptyState.Title>
                <EmptyState.Description>
                  You haven't created any projects yet. Get started by creating your first project.
                </EmptyState.Description>
              </EmptyState.Header>
              <EmptyState.Content>
                <Button size="sm" variant="primary">
                  Create Project
                </Button>
                <Button size="sm" variant="outline">
                  Import Project
                </Button>
              </EmptyState.Content>
            </EmptyState>
          </div>
        ))}
      </DemoSection>
    );
  }

  // minimal 对齐 Pro：仅标题 + 描述，无图标/按钮
  if (variant === 'minimal') {
    return (
      <DemoSection isColumn label="minimal">
        <EmptyState size="md" style={{ width: 480, minHeight: 200 }}>
          <EmptyState.Header>
            <EmptyState.Title>Nothing here yet</EmptyState.Title>
            <EmptyState.Description>Content will appear here once it becomes available.</EmptyState.Description>
          </EmptyState.Header>
        </EmptyState>
      </DemoSection>
    );
  }

  // outline 对齐 Pro：虚线边框 + 云图标 + Upload Files
  if (variant === 'outline') {
    return (
      <DemoSection isColumn label="outline">
        <EmptyState
          size="md"
          style={{ width: 420, border: '1px dashed var(--border)', borderRadius: 12 }}
        >
          <EmptyState.Header>
            <EmptyState.Media variant="icon">
              <CloudIcon />
            </EmptyState.Media>
            <EmptyState.Title>Cloud Storage Empty</EmptyState.Title>
            <EmptyState.Description>
              Upload files to your cloud storage to access them anywhere.
            </EmptyState.Description>
          </EmptyState.Header>
          <EmptyState.Content>
            <Button size="sm" variant="outline">
              Upload Files
            </Button>
          </EmptyState.Content>
        </EmptyState>
      </DemoSection>
    );
  }

  // full-height 对齐 Pro：高容器内居中的「No Results Found」+ Clear Filters
  if (variant === 'full-height') {
    return (
      <DemoSection isColumn label="full height">
        <EmptyState
          size="md"
          style={{ width: 480, minHeight: 360, border: '1px dashed var(--border)', borderRadius: 12 }}
        >
          <EmptyState.Header>
            <EmptyState.Media variant="icon">
              <UserIcon />
            </EmptyState.Media>
            <EmptyState.Title>No Results Found</EmptyState.Title>
            <EmptyState.Description>
              We couldn't find anything matching your search. Try adjusting your filters.
            </EmptyState.Description>
          </EmptyState.Header>
          <EmptyState.Content>
            <Button size="sm" variant="outline">
              Clear Filters
            </Button>
          </EmptyState.Content>
        </EmptyState>
      </DemoSection>
    );
  }

  // with-avatar 对齐 Pro：渐变头像 + User Offline + Leave Message
  if (variant === 'with-avatar') {
    return (
      <DemoSection isColumn label="with avatar">
        <EmptyState size="md" style={{ width: 480 }}>
          <EmptyState.Header>
            <EmptyState.Media>
              <GradientAvatar gradient="linear-gradient(135deg, #c4b5fd, #67e8f9)" />
            </EmptyState.Media>
            <EmptyState.Title>User Offline</EmptyState.Title>
            <EmptyState.Description>
              This user is currently offline. You can leave a message to notify them or try again later.
            </EmptyState.Description>
          </EmptyState.Header>
          <EmptyState.Content>
            <Button size="sm" variant="secondary">
              Leave Message
            </Button>
          </EmptyState.Content>
        </EmptyState>
      </DemoSection>
    );
  }

  // with-avatar-group 对齐 Pro：三个渐变头像球 + No Team Members + Invite Members
  if (variant === 'with-avatar-group') {
    return (
      <DemoSection isColumn label="with avatar group">
        <EmptyState size="md" style={{ width: 480 }}>
          <EmptyState.Header>
            <EmptyState.Media>
              <span style={{ display: 'inline-flex' }}>
                <GradientAvatar gradient="linear-gradient(135deg, #93c5fd, #67e8f9)" size={40} />
                <span style={{ marginLeft: -10 }}>
                  <GradientAvatar gradient="linear-gradient(135deg, #6ee7b7, #34d399)" size={40} />
                </span>
                <span style={{ marginLeft: -10 }}>
                  <GradientAvatar gradient="linear-gradient(135deg, #c4b5fd, #f472b6)" size={40} />
                </span>
              </span>
            </EmptyState.Media>
            <EmptyState.Title>No Team Members</EmptyState.Title>
            <EmptyState.Description>Invite your team to collaborate on this project.</EmptyState.Description>
          </EmptyState.Header>
          <EmptyState.Content>
            <Button size="sm" variant="primary">
              + Invite Members
            </Button>
          </EmptyState.Content>
        </EmptyState>
      </DemoSection>
    );
  }

  // with-background 对齐 Pro：灰底容器 + 铃铛图标 + No Notifications + Refresh
  if (variant === 'with-background') {
    return (
      <DemoSection isColumn label="with background">
        <EmptyState
          size="md"
          style={{ width: 420, background: 'var(--surface-secondary)', borderRadius: 12 }}
        >
          <EmptyState.Header>
            <EmptyState.Media variant="icon">
              <BellIcon />
            </EmptyState.Media>
            <EmptyState.Title>No Notifications</EmptyState.Title>
            <EmptyState.Description>You're all caught up. New notifications will appear here.</EmptyState.Description>
          </EmptyState.Header>
          <EmptyState.Content>
            <Button size="sm" variant="secondary">
              Refresh
            </Button>
          </EmptyState.Content>
        </EmptyState>
      </DemoSection>
    );
  }

  // default 对齐 Pro Usage：文件夹图标 + No Projects Yet + Create/Import Project
  return (
    <DemoSection isColumn label="default">
      <EmptyState size="md" style={{ width: 480 }}>
        <EmptyState.Header>
          <EmptyState.Media variant="icon">
            <FolderIcon />
          </EmptyState.Media>
          <EmptyState.Title>No Projects Yet</EmptyState.Title>
          <EmptyState.Description>
            You haven't created any projects yet. Get started by creating your first project.
          </EmptyState.Description>
        </EmptyState.Header>
        <EmptyState.Content>
          <Button size="sm" variant="primary">
            Create Project
          </Button>
          <Button size="sm" variant="outline">
            Import Project
          </Button>
        </EmptyState.Content>
      </EmptyState>
    </DemoSection>
  );
};

type DemoFileNode = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  status?: string;
  children?: DemoFileNode[];
};

type DemoTreeNode = {
  key: DemoKey;
  value: DemoFileNode;
  children: DemoTreeNode[] | null;
};

const FILE_TREE_ITEMS: DemoFileNode[] = [
  {
    id: 'courses',
    name: 'apps',
    type: 'folder',
    children: [
      { id: 'ielts-plan', name: 'package.json', type: 'file', status: 'modified' },
      { id: 'cet4-paper', name: 'tsconfig.json', type: 'file', status: 'added' },
    ],
  },
  {
    id: 'ops',
    name: 'packages',
    type: 'folder',
    children: [
      { id: 'poster', name: 'button.tsx', type: 'file' },
      { id: 'brief', name: 'card.tsx', type: 'file', status: 'review' },
    ],
  },
];

const nodeIcon = (node: DemoFileNode) => (node.type === 'folder' ? <FolderIcon /> : <FileIcon />);

const renderDemoFileNode = (node: DemoFileNode): ReactNode => (
  <FileTree.Item key={node.id} id={node.id} icon={nodeIcon(node)} title={node.name}>
    {node.children?.map(renderDemoFileNode)}
  </FileTree.Item>
);

const renderTreeDataNode = (node: DemoTreeNode): ReactNode => (
  <FileTree.Item key={node.key} id={node.key} icon={nodeIcon(node.value)} title={node.value.name}>
    {node.children?.map(renderTreeDataNode)}
  </FileTree.Item>
);

const flattenTreeDataNames = (nodes: DemoTreeNode[]): string[] =>
  nodes.flatMap((node) => [
    node.value.name,
    ...flattenTreeDataNames(node.children ?? []),
  ]);

type FileTreeVariant =
  | 'custom-indicator'
  | 'default'
  | 'drag-and-drop'
  | 'dynamic-collection'
  | 'guide-lines'
  | 'multiple-selection'
  | 'pr-file-review'
  | 'reduced-motion'
  | 'sizes'
  | 'with-icons';

const FileTreeVariantDemo = ({ variant }: { variant: FileTreeVariant }) => {
  const [query, setQuery] = useState('package');
  const [expandedKeys, setExpandedKeys] = useState<Set<DemoKey>>(new Set(['courses']));
  const [lastMove, setLastMove] = useState('No files moved yet');
  const tree = useFileTreeData<DemoFileNode>({
    initialItems: FILE_TREE_ITEMS,
    getKey: (item) => item.id,
    getChildren: (item) => item.children ?? [],
  });
  const drag = useFileTreeDrag({
    tree,
    onMove: (keys, target) => {
      setLastMove(`Moved ${[...keys].join(', ')} ${target.dropPosition} ${String(target.key)}`);
    },
  });
  const helpers = useFileTree({ items: FILE_TREE_ITEMS });
  const visibleItems =
    variant === 'dynamic-collection'
      ? helpers.filterTree((node) => node.name.toLowerCase().includes(query.toLowerCase()))
      : FILE_TREE_ITEMS;

  if (variant === 'sizes') {
    return (
      <DemoSection>
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <div key={size} style={{ width: 240 }}>
            <FileTree
              aria-label={`${size} file tree`}
              defaultExpandedKeys={['courses']}
              selectionMode="single"
              size={size}
            >
              {FILE_TREE_ITEMS.slice(0, 1).map(renderDemoFileNode)}
            </FileTree>
          </div>
        ))}
      </DemoSection>
    );
  }

  if (variant === 'custom-indicator') {
    const isCoursesOpen = expandedKeys.has('courses');

    return (
      <DemoSection label="custom indicator">
        <div style={{ width: 300 }}>
          <FileTree
            aria-label="Custom expand indicator"
            expandedKeys={expandedKeys}
            onExpandedChange={setExpandedKeys}
          >
            <FileTree.Item id="courses" icon={<FolderIcon />} title="src">
              <FileTree.Indicator>
                <span style={{ fontSize: 12 }}>{isCoursesOpen ? '-' : '+'}</span>
              </FileTree.Indicator>
              <FileTree.Item id="course-outline" icon={<FileIcon />} title="index.tsx" />
            </FileTree.Item>
          </FileTree>
        </div>
      </DemoSection>
    );
  }

  if (variant === 'drag-and-drop') {
    const treeOrder = flattenTreeDataNames(tree.items as DemoTreeNode[]);

    return (
      <DemoSection isColumn label="drag and drop">
        <div style={{ width: 320 }}>
          <FileTree
            aria-label="Draggable file tree"
            defaultExpandedKeys={['courses', 'ops']}
            dragAndDropHooks={drag.dragAndDropHooks}
            selectionMode="multiple"
          >
            {(tree.items as DemoTreeNode[]).map(renderTreeDataNode)}
          </FileTree>
        </div>
        <span data-file-tree-dnd-status style={demoMutedStyle}>{lastMove}</span>
        <span data-file-tree-dnd-order style={demoMutedStyle}>Order: {treeOrder.join(' > ')}</span>
      </DemoSection>
    );
  }

  if (variant === 'dynamic-collection') {
    return (
      <DemoSection isColumn label="dynamic collection">
        <div style={{ display: 'flex', gap: 6 }}>
          {['package', 'button', 'card'].map((value) => (
            <Button key={value} size="sm" variant={query === value ? 'secondary' : 'ghost'} onClick={() => setQuery(value)}>
              {value}
            </Button>
          ))}
        </div>
        <div style={{ width: 320 }}>
          <FileTree
            aria-label="Dynamic file tree"
            defaultExpandedKeys={helpers.expandableKeys}
            selectionMode="single"
          >
            {visibleItems.map(renderDemoFileNode)}
          </FileTree>
        </div>
      </DemoSection>
    );
  }

  if (variant === 'pr-file-review') {
    return (
      <DemoSection label="pull request review">
        <div style={{ width: 360 }}>
          <FileTree aria-label="Pull request file review" defaultExpandedKeys={['courses', 'ops']} selectionMode="multiple">
            {FILE_TREE_ITEMS.map((node) => (
              <FileTree.Item key={node.id} id={node.id} icon={<FolderIcon />} title={node.name}>
                {node.children?.map((child) => (
                  <FileTree.Item
                    key={child.id}
                    id={child.id}
                    icon={<FileIcon />}
                    title={
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        {child.name}
                        {child.status !== undefined && (
                          <Chip color={child.status === 'added' ? 'success' : 'warning'} size="sm">
                            {child.status}
                          </Chip>
                        )}
                      </span>
                    }
                    textValue={child.name}
                  />
                ))}
              </FileTree.Item>
            ))}
          </FileTree>
        </div>
      </DemoSection>
    );
  }

  return (
    <DemoSection label={variant}>
      <div style={{ width: 320 }}>
        <FileTree
          aria-label="Project file tree"
          defaultExpandedKeys={['courses']}
          defaultSelectedKeys={variant === 'multiple-selection' ? ['ielts-plan', 'poster'] : ['ielts-plan']}
          reduceMotion={variant === 'reduced-motion'}
          selectionMode={variant === 'multiple-selection' ? 'multiple' : 'single'}
          showGuideLines={variant === 'guide-lines' ? 'hover' : true}
        >
          {FILE_TREE_ITEMS.map((node) =>
            variant === 'with-icons' || variant === 'default' || variant === 'guide-lines' || variant === 'multiple-selection' || variant === 'reduced-motion'
              ? renderDemoFileNode(node)
              : renderDemoFileNode(node),
          )}
        </FileTree>
      </div>
    </DemoSection>
  );
};

type FloatingTocVariant =
  | 'controlled'
  | 'custom-delays'
  | 'default'
  | 'hierarchical'
  | 'in-page-context'
  | 'left-aligned-bars'
  | 'left-placement'
  | 'press-mode'
  | 'press-mode-in-page'
  | 'virtualized';

const FloatingTocVariantDemo = ({ variant }: { variant: FloatingTocVariant }) => {
  const [open, setOpen] = useState(true);
  const [active, setActive] = useState('students');
  const manyItems = Array.from({ length: 24 }, (_, index) => ({
    key: `section-${index + 1}`,
    label: `Section ${index + 1}`,
    level: index % 4 === 0 ? 1 : 2,
  }));
  const items = variant === 'virtualized' ? manyItems : TOC_ITEMS;
  const tocItems = items.map((entry) => ({
    ...entry,
    level: variant === 'hierarchical' || variant === 'virtualized' ? entry.level : 1,
  }));
  const placement = variant === 'left-placement' || variant === 'left-aligned-bars' ? 'left' : 'right';
  const triggerMode = variant === 'press-mode' || variant === 'press-mode-in-page' ? 'press' : 'hover';
  const controlledProps =
    variant === 'controlled' ? { open, onOpenChange: setOpen } : { defaultOpen: true };

  const toc = (
    <FloatingToc
      closeDelay={variant === 'custom-delays' ? 900 : 300}
      activeKey={active}
      items={tocItems}
      openDelay={variant === 'custom-delays' ? 0 : 200}
      placement={placement}
      triggerMode={triggerMode}
      onActiveChange={setActive}
      {...controlledProps}
    >
      <FloatingToc.Trigger>
        {tocItems.slice(0, 8).map((entry) => (
          <FloatingToc.Bar key={entry.key} itemKey={entry.key} />
        ))}
      </FloatingToc.Trigger>
      <FloatingToc.Content data-demo-floating-toc={variant}>
        <div
          style={
            variant === 'virtualized'
              ? { maxHeight: 220, overflow: 'auto', paddingRight: 4 }
              : undefined
          }
        >
          {tocItems.map((entry) => (
            <FloatingToc.Item key={entry.key} itemKey={entry.key} />
          ))}
        </div>
      </FloatingToc.Content>
    </FloatingToc>
  );

  if (variant === 'in-page-context' || variant === 'press-mode-in-page') {
    return (
      <DemoSection label={variant}>
        <div
          style={{
            position: 'relative',
            width: 520,
            minHeight: 220,
            padding: '16px 88px 16px 16px',
            border: '1px solid var(--border)',
            borderRadius: 8,
            background: 'var(--surface)',
          }}
        >
          <strong>Documentation</strong>
          <p style={demoMutedStyle}>The table of contents highlights the active section as you scroll.</p>
          <div style={{ display: 'grid', gap: 8 }}>
            {TOC_ITEMS.slice(0, 3).map((entry) => (
              <div key={entry.key} style={{ padding: 10, borderRadius: 8, background: 'var(--surface-secondary)' }}>
                {entry.label}
              </div>
            ))}
          </div>
          <div style={{ position: 'absolute', top: 24, right: 24 }}>{toc}</div>
        </div>
      </DemoSection>
    );
  }

  return (
    <DemoSection isColumn label={variant}>
      {variant === 'controlled' && (
        <Button size="sm" variant="secondary" onClick={() => setOpen((value) => !value)}>
          {open ? 'Close TOC' : 'Open TOC'}
        </Button>
      )}
      <div style={{ padding: '8px 160px 8px 8px' }}>{toc}</div>
      <span style={demoTextStyle}>Active section: {active}</span>
    </DemoSection>
  );
};

type HoverCardVariant =
  | 'controlled'
  | 'custom-delays'
  | 'default'
  | 'placements'
  | 'with-arrow'
  | 'with-image';

const HoverCardContentBox = ({ withImage = false }: { withImage?: boolean }) => (
  <div style={{ display: 'grid', gap: 8, minWidth: 220 }}>
    {withImage && <CourseCover title="HeroUI" />}
    <strong style={{ fontSize: 14 }}>@hero_ui</strong>
    <span style={demoMutedStyle}>Beautiful, fast and modern React UI library.</span>
    <ProgressBar color="success" isShowValue={false} size="sm" value={86} />
  </div>
);

const HoverCardVariantDemo = ({ variant }: { variant: HoverCardVariant }) => {
  const [open, setOpen] = useState(true);
  const [placement, setPlacement] = useState<'top' | 'right' | 'bottom' | 'left'>('bottom');

  if (variant === 'placements') {
    return (
      <DemoSection isColumn label="placements">
        <div style={{ display: 'flex', gap: 6 }}>
          {(['top', 'right', 'bottom', 'left'] as const).map((item) => (
            <Button key={item} size="sm" variant={placement === item ? 'secondary' : 'ghost'} onClick={() => setPlacement(item)}>
              {item}
            </Button>
          ))}
        </div>
        <HoverCard open>
          <HoverCard.Trigger>
            <Chip color="accent">@hero_ui</Chip>
          </HoverCard.Trigger>
          <HoverCard.Content placement={placement}>
            <HoverCardContentBox />
          </HoverCard.Content>
        </HoverCard>
      </DemoSection>
    );
  }

  return (
    <DemoSection isColumn label={variant}>
      {variant === 'controlled' && (
        <Switch isSelected={open} size="sm" onSelectedChange={setOpen}>
          Controlled open
        </Switch>
      )}
      <HoverCard
        closeDelay={variant === 'custom-delays' ? 700 : 300}
        open={variant === 'controlled' ? open : undefined}
        openDelay={variant === 'custom-delays' ? 0 : 300}
        defaultOpen={variant !== 'controlled'}
      >
        <HoverCard.Trigger>
          <Chip color="accent">@hero_ui</Chip>
        </HoverCard.Trigger>
        <HoverCard.Content placement="bottom">
          {variant === 'with-arrow' && <HoverCard.Arrow />}
          <HoverCardContentBox withImage={variant === 'with-image'} />
        </HoverCard.Content>
      </HoverCard>
    </DemoSection>
  );
};

const KanbanNotionVariantDemo = () => {
  const kanban = useKanban<KanbanTask>({
    initialItems: KANBAN_TASKS.slice(0, 5),
    getColumn: getKanbanColumn,
    setColumn: setKanbanColumn,
  });

  return (
    <DemoSection label="notion board">
      <Kanban size="md" style={{ width: 760 }}>
        {KANBAN_COLUMNS.map((column) => (
          <KanbanColumnView
            key={column.id}
            kanban={kanban}
            column={column}
            actions={<Chip size="sm">{column.id}</Chip>}
          />
        ))}
      </Kanban>
    </DemoSection>
  );
};

const KanbanDefaultVariantDemo = () => {
  const kanban = useKanban<KanbanTask>({
    initialItems: KANBAN_TASKS.slice(0, 4),
    getColumn: getKanbanColumn,
    setColumn: setKanbanColumn,
  });
  const distribution = KANBAN_COLUMNS.map(
    (column) => `${column.title} ${kanban.list.items.filter((task) => task.status === column.id).length}`,
  ).join(' · ');
  const order = getKanbanBoardOrder(kanban.list.items);

  return (
    <DemoSection isColumn label="default kanban">
      <Kanban size="sm" style={{ width: 760 }}>
        {KANBAN_COLUMNS.map((column) => (
          <KanbanColumnView key={column.id} kanban={kanban} column={column} />
        ))}
      </Kanban>
      <div style={{ fontSize: 13, color: 'var(--foreground)' }} data-kanban-distribution>
        Distribution: {distribution}
      </div>
      <div style={{ fontSize: 13, color: 'var(--muted)' }} data-kanban-order>
        Order: {order}
      </div>
    </DemoSection>
  );
};

const PROJECT_KANBAN_TASKS: KanbanTask[] = [
  { id: 'p1', title: 'Research competitor onboarding patterns', status: 'todo', priority: 'high' },
  { id: 'p2', title: 'Audit analytics event naming', status: 'todo', priority: 'normal' },
  { id: 'p3', title: 'Design empty states for dashboard widgets', status: 'doing', priority: 'high' },
  { id: 'p4', title: 'Set up CI/CD for staging environment', status: 'done', priority: 'low' },
];

const PROJECT_KANBAN_COLUMNS = [
  { id: 'todo', title: 'Backlog', color: 'var(--warning)' },
  { id: 'doing', title: 'To Do', color: 'var(--accent)' },
  { id: 'done', title: 'In Progress', color: 'var(--success)' },
];

const KanbanProjectBoardVariantDemo = () => {
  const kanban = useKanban<KanbanTask>({
    initialItems: PROJECT_KANBAN_TASKS,
    getColumn: getKanbanColumn,
    setColumn: setKanbanColumn,
  });

  return (
    <DemoSection label="project board">
      <Kanban size="md" style={{ width: 820 }}>
        {PROJECT_KANBAN_COLUMNS.map((column) => (
          <KanbanColumnView
            key={column.id}
            kanban={kanban}
            column={column}
            actions={<Chip size="sm">{column.title}</Chip>}
          />
        ))}
      </Kanban>
    </DemoSection>
  );
};

const KanbanSizesVariantDemo = () => (
  <DemoSection isColumn label="sizes">
    {(['sm', 'md', 'lg'] as const).map((size) => (
      <Kanban key={size} size={size} style={{ width: 560 }}>
        <Kanban.Column>
          <Kanban.ColumnHeader indicatorColor="var(--accent)" title={`${size} To Do`} count={2} />
          <Kanban.ColumnBody>
            <Kanban.CardList
              aria-label={`${size} tasks`}
              items={KANBAN_TASKS.slice(0, 2)}
            >
              {(task) => (
                <Kanban.Card id={task.id} textValue={task.title}>
                  <Kanban.CardContent>
                    <span>{task.title}</span>
                  </Kanban.CardContent>
                </Kanban.Card>
              )}
            </Kanban.CardList>
          </Kanban.ColumnBody>
        </Kanban.Column>
      </Kanban>
    ))}
  </DemoSection>
);

type ItemCardVariantKey =
  | 'default'
  | 'device-list'
  | 'email-setting'
  | 'pressable'
  | 'title-only'
  | 'variants'
  | 'vertical-stack'
  | 'wallet-card'
  | 'with-multi-select'
  | 'with-select'
  | 'with-switch'
  | 'without-icon';

const ItemCardVariantDemo = ({ variant }: { variant: ItemCardVariantKey }) => {
  const [message, setMessage] = useState('No card opened');
  const [enabled, setEnabled] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);

  // default 对齐 Pro Usage：Language 设置行 + 「English」操作按钮
  if (variant === 'default') {
    return (
      <DemoSection isColumn label="default">
        <ItemCard style={{ width: 480 }}>
          <ItemCard.Icon>
            <GlobeIcon />
          </ItemCard.Icon>
          <ItemCard.Content>
            <ItemCard.Title>Language</ItemCard.Title>
            <ItemCard.Description>Choose your preferred language</ItemCard.Description>
          </ItemCard.Content>
          <ItemCard.Action>
            <Button size="sm" variant="outline" onClick={() => setMessage('Language changed')}>
              English
            </Button>
          </ItemCard.Action>
        </ItemCard>
        <span style={demoTextStyle}>{message}</span>
      </DemoSection>
    );
  }

  // variants 对齐 Pro：Default / Secondary / Tertiary / Outline / Transparent
  if (variant === 'variants') {
    const variantRows: {
      key: 'default' | 'secondary' | 'tertiary' | 'outline' | 'transparent';
      title: string;
      desc: string;
    }[] = [
      { key: 'default', title: 'Default', desc: 'Surface background with shadow' },
      { key: 'secondary', title: 'Secondary', desc: 'Secondary surface, no shadow' },
      { key: 'tertiary', title: 'Tertiary', desc: 'Tertiary surface, no shadow' },
      { key: 'outline', title: 'Outline', desc: 'Transparent with border, no shadow' },
      { key: 'transparent', title: 'Transparent', desc: 'No background, no border, no shadow' },
    ];
    return (
      <DemoSection isColumn label="variants">
        {variantRows.map((row) => (
          <ItemCard key={row.key} variant={row.key} style={{ width: 440 }}>
            <ItemCard.Icon>
              <GlobeIcon />
            </ItemCard.Icon>
            <ItemCard.Content>
              <ItemCard.Title>{row.title}</ItemCard.Title>
              <ItemCard.Description>{row.desc}</ItemCard.Description>
            </ItemCard.Content>
            <ItemCard.Action>
              <ChevronRightIcon />
            </ItemCard.Action>
          </ItemCard>
        ))}
      </DemoSection>
    );
  }

  // with-multi-select 对齐 Pro：Event Invites 设置行 + 多选触发的选择框
  if (variant === 'with-multi-select') {
    const channels = ['Email', 'Push Notifications', 'SMS'];
    const toggle = (name: string, selected: boolean) =>
      setSelectedDevices((current) =>
        selected
          ? current.includes(name)
            ? current
            : [...current, name]
          : current.filter((item) => item !== name),
      );
    return (
      <DemoSection isColumn label="with multi select">
        <ItemCard style={{ width: 480 }}>
          <ItemCard.Icon>
            <BellIcon />
          </ItemCard.Icon>
          <ItemCard.Content>
            <ItemCard.Title>Event Invites</ItemCard.Title>
            <ItemCard.Description>Choose how you receive invitations</ItemCard.Description>
          </ItemCard.Content>
          <ItemCard.Action>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {channels.map((channel) => (
                <Checkbox
                  key={channel}
                  aria-label={channel}
                  isSelected={selectedDevices.includes(channel)}
                  onSelectedChange={(selected) => toggle(channel, selected)}
                >
                  {channel}
                </Checkbox>
              ))}
            </div>
          </ItemCard.Action>
        </ItemCard>
      </DemoSection>
    );
  }

  // with-select 对齐 Pro：Language 设置行 + 内联下拉(用 outline 按钮模拟选择器)
  if (variant === 'with-select') {
    const languages = ['English', 'Español', '中文'];
    return (
      <DemoSection isColumn label="with select">
        <ItemCard style={{ width: 480 }}>
          <ItemCard.Icon>
            <GlobeIcon />
          </ItemCard.Icon>
          <ItemCard.Content>
            <ItemCard.Title>Language</ItemCard.Title>
            <ItemCard.Description>Choose your preferred language</ItemCard.Description>
          </ItemCard.Content>
          <ItemCard.Action>
            <div style={{ display: 'flex', gap: 6 }}>
              {languages.map((lang) => (
                <Chip
                  key={lang}
                  color={message === lang ? 'accent' : 'default'}
                  variant="soft"
                  size="sm"
                  onClick={() => setMessage(lang)}
                  style={{ cursor: 'pointer' }}
                >
                  {lang}
                </Chip>
              ))}
            </div>
          </ItemCard.Action>
        </ItemCard>
        <span style={demoTextStyle}>Selected: {message === 'No card opened' ? 'English' : message}</span>
      </DemoSection>
    );
  }

  // with-switch 对齐 Pro：Dark mode 设置行 + Switch
  if (variant === 'with-switch') {
    return (
      <DemoSection isColumn label="with switch">
        <ItemCard style={{ width: 480 }}>
          <ItemCard.Icon>
            <MoonIcon />
          </ItemCard.Icon>
          <ItemCard.Content>
            <ItemCard.Title>Dark mode</ItemCard.Title>
            <ItemCard.Description>Use dark theme across the app</ItemCard.Description>
          </ItemCard.Content>
          <ItemCard.Action>
            <Switch aria-label="Dark mode" isSelected={enabled} size="sm" onSelectedChange={setEnabled} />
          </ItemCard.Action>
        </ItemCard>
      </DemoSection>
    );
  }

  // email-setting 对齐 Pro：邮箱地址 + Primary 标 + ⋯ 操作
  if (variant === 'email-setting') {
    return (
      <DemoSection isColumn label="email setting">
        <ItemCard style={{ width: 560 }}>
          <ItemCard.Content>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ItemCard.Title>junior@heroui.com</ItemCard.Title>
              <Chip color="default" variant="soft" size="sm">
                Primary
              </Chip>
            </div>
            <ItemCard.Description>
              Notifications and account updates will be sent to this address.
            </ItemCard.Description>
          </ItemCard.Content>
          <ItemCard.Action>
            <Button aria-label="More options" isIconOnly size="sm" variant="ghost">
              ⋯
            </Button>
          </ItemCard.Action>
        </ItemCard>
      </DemoSection>
    );
  }

  // pressable 对齐 Pro：整卡可点击的导航行(Account settings / Security)
  if (variant === 'pressable') {
    const rows = [
      { id: 'account', icon: <UserIcon />, title: 'Account settings', desc: 'Manage your account preferences' },
      { id: 'security', icon: <ShieldIcon />, title: 'Security', desc: 'Passwords and two-factor authentication' },
    ];
    return (
      <DemoSection isColumn label="pressable">
        {rows.map((row) => (
          <ItemCard key={row.id} isPressable style={{ width: 480 }} onPress={() => setMessage(`Opened ${row.title}`)}>
            <ItemCard.Icon>{row.icon}</ItemCard.Icon>
            <ItemCard.Content>
              <ItemCard.Title>{row.title}</ItemCard.Title>
              <ItemCard.Description>{row.desc}</ItemCard.Description>
            </ItemCard.Content>
            <ItemCard.Action>
              <ChevronRightIcon />
            </ItemCard.Action>
          </ItemCard>
        ))}
        <span style={demoTextStyle}>{message}</span>
      </DemoSection>
    );
  }

  // device-list 对齐 Pro：MacBook Pro(Active) / iMac(Revoke) / iPhone 15 Pro(Revoke)
  if (variant === 'device-list') {
    const devices = [
      { id: 'macbook', icon: <FileIcon />, name: 'MacBook Pro', last: 'Last active: 2 minutes ago', active: true },
      { id: 'imac', icon: <FileIcon />, name: 'iMac', last: 'Last active: 3 days ago', active: false },
      { id: 'iphone', icon: <ShieldIcon />, name: 'iPhone 15 Pro', last: 'Last active: 1 hour ago', active: false },
    ];
    return (
      <DemoSection isColumn label="device list">
        {devices.map((device) => (
          <ItemCard key={device.id} style={{ width: 480 }}>
            <ItemCard.Icon>{device.icon}</ItemCard.Icon>
            <ItemCard.Content>
              <ItemCard.Title>{device.name}</ItemCard.Title>
              <ItemCard.Description>{device.last}</ItemCard.Description>
            </ItemCard.Content>
            <ItemCard.Action>
              {device.active ? (
                <Chip color="success" variant="soft" size="sm">
                  Active
                </Chip>
              ) : (
                <Button size="sm" variant="outline">
                  Revoke
                </Button>
              )}
            </ItemCard.Action>
          </ItemCard>
        ))}
      </DemoSection>
    );
  }

  // wallet-card 对齐 Pro：NFT/钱包行(头像 + 地址 + 价格 + ⋯)
  if (variant === 'wallet-card') {
    return (
      <DemoSection label="wallet card">
        <ItemCard style={{ width: 460 }}>
          <ItemCard.Icon>
            <Avatar fallback="SL" />
          </ItemCard.Icon>
          <ItemCard.Content>
            <ItemCard.Title>SLMobbin's</ItemCard.Title>
            <ItemCard.Description>0x9DC5...621a</ItemCard.Description>
          </ItemCard.Content>
          <ItemCard.Action>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600 }}>$34.99</div>
                <div style={demoMutedStyle}>0.021 ETH</div>
              </div>
              <Button aria-label="More options" isIconOnly size="sm" variant="ghost">
                ⋯
              </Button>
            </div>
          </ItemCard.Action>
        </ItemCard>
      </DemoSection>
    );
  }

  // vertical-stack 对齐 Pro：Profile / Security / Cloud sync 导航行
  if (variant === 'vertical-stack') {
    const rows = [
      { id: 'profile', icon: <UserIcon />, title: 'Profile', desc: 'Update your personal information' },
      { id: 'security', icon: <ShieldIcon />, title: 'Security', desc: 'Manage passwords and 2FA' },
      { id: 'cloud', icon: <CloudIcon />, title: 'Cloud sync', desc: 'Sync data across your devices' },
    ];
    return (
      <DemoSection isColumn label="vertical stack">
        {rows.map((row) => (
          <ItemCard key={row.id} isPressable style={{ width: 480 }} onPress={() => setMessage(`Opened ${row.title}`)}>
            <ItemCard.Icon>{row.icon}</ItemCard.Icon>
            <ItemCard.Content>
              <ItemCard.Title>{row.title}</ItemCard.Title>
              <ItemCard.Description>{row.desc}</ItemCard.Description>
            </ItemCard.Content>
            <ItemCard.Action>
              <ChevronRightIcon />
            </ItemCard.Action>
          </ItemCard>
        ))}
      </DemoSection>
    );
  }

  // title-only 对齐 Pro：仅标题(无描述) + chevron
  if (variant === 'title-only') {
    return (
      <DemoSection isColumn label="title only">
        <ItemCard style={{ width: 480 }}>
          <ItemCard.Icon>
            <GlobeIcon />
          </ItemCard.Icon>
          <ItemCard.Content>
            <ItemCard.Title>Appearance</ItemCard.Title>
          </ItemCard.Content>
          <ItemCard.Action>
            <ChevronRightIcon />
          </ItemCard.Action>
        </ItemCard>
      </DemoSection>
    );
  }

  // without-icon 对齐 Pro：无前置图标的危险操作行(Delete account)
  return (
    <DemoSection isColumn label="without icon">
      <ItemCard style={{ width: 480 }}>
        <ItemCard.Content>
          <ItemCard.Title>Delete account</ItemCard.Title>
          <ItemCard.Description>Permanently remove your account and all data</ItemCard.Description>
        </ItemCard.Content>
        <ItemCard.Action>
          <Button size="sm" variant="danger-soft">
            Delete
          </Button>
        </ItemCard.Action>
      </ItemCard>
    </DemoSection>
  );
};

type ItemCardGroupVariantKey =
  | 'developer-settings'
  | 'grid'
  | 'grid-three-columns'
  | 'linked-accounts'
  | 'list'
  | 'multiple-sections'
  | 'notification-preferences'
  | 'permission-levels'
  | 'pressable'
  | 'variants'
  | 'wallet-list'
  | 'with-header';

/** 通用设置行：icon + 标题 + 描述（+ 可选 action）；对齐 heroui Pro Item Card Group 各 section */
const GroupSettingCard = ({
  id,
  icon,
  title,
  desc,
  action,
}: {
  id?: string;
  icon?: ReactNode;
  title: string;
  desc?: string;
  action?: ReactNode;
}) => (
  <ItemCard id={id}>
    {icon && <ItemCard.Icon>{icon}</ItemCard.Icon>}
    <ItemCard.Content>
      <ItemCard.Title>{title}</ItemCard.Title>
      {desc && <ItemCard.Description>{desc}</ItemCard.Description>}
    </ItemCard.Content>
    {action && <ItemCard.Action>{action}</ItemCard.Action>}
  </ItemCard>
);

const selectChip = (label: string) => (
  <Chip color="default" variant="soft" size="sm">
    {label} ⌄
  </Chip>
);

const ItemCardGroupVariantDemo = ({ variant }: { variant: ItemCardGroupVariantKey }) => {
  const [pressed, setPressed] = useState('No item pressed');

  // grid / grid-three-columns 对齐 Pro：网格排布的设置入口
  if (variant === 'grid' || variant === 'grid-three-columns') {
    const isThree = variant === 'grid-three-columns';
    return (
      <DemoSection isColumn label={variant}>
        <ItemCardGroup layout="grid" columns={isThree ? 3 : 2} style={{ width: isThree ? 760 : 560 }}>
          {isThree && (
            <ItemCardGroup.Header>
              <ItemCardGroup.Title>Devices</ItemCardGroup.Title>
              <ItemCardGroup.Description>Manage your connected devices</ItemCardGroup.Description>
            </ItemCardGroup.Header>
          )}
          {isThree ? (
            <>
              <GroupSettingCard icon={<FileIcon />} title="MacBook Pro" desc="Active now" />
              <GroupSettingCard icon={<FileIcon />} title="iMac" desc="3 days ago" />
              <GroupSettingCard icon={<ShieldIcon />} title="iPhone 15" desc="1 hour ago" />
            </>
          ) : (
            <>
              <GroupSettingCard icon={<UserIcon />} title="Profile" desc="Personal info" />
              <GroupSettingCard icon={<ShieldIcon />} title="Security" desc="2FA & passwords" />
              <GroupSettingCard icon={<GlobeIcon />} title="Language" desc="English (US)" />
              <GroupSettingCard icon={<GlobeIcon />} title="Appearance" desc="Theme & colors" />
            </>
          )}
        </ItemCardGroup>
      </DemoSection>
    );
  }

  // linked-accounts 对齐 Pro：3 列账号网格，已连接显示对勾、未连接显示 +
  if (variant === 'linked-accounts') {
    const accounts = [
      { id: 'google', title: 'Google', desc: 'junior@heroui.com', linked: true },
      { id: 'apple', title: 'Apple', desc: 'Not Linked', linked: false },
      { id: 'github', title: 'Github', desc: 'Not Linked', linked: false },
      { id: 'linkedin', title: 'LinkedIn', desc: 'Account Linked', linked: true },
      { id: 'notion', title: 'Notion', desc: 'Not Linked', linked: false },
    ];
    return (
      <DemoSection isColumn label="linked accounts">
        <ItemCardGroup layout="grid" columns={3} style={{ width: 760 }}>
          {accounts.map((account) => (
            <GroupSettingCard
              key={account.id}
              icon={<GlobeIcon />}
              title={account.title}
              desc={account.desc}
              action={
                account.linked ? (
                  <Chip color="success" variant="soft" size="sm">
                    ✓
                  </Chip>
                ) : (
                  <Button aria-label={`Link ${account.title}`} isIconOnly size="sm" variant="ghost">
                    +
                  </Button>
                )
              }
            />
          ))}
        </ItemCardGroup>
      </DemoSection>
    );
  }

  // list 对齐 Pro：Profile / Security / Cloud sync + 行内操作按钮
  if (variant === 'list') {
    const rows = [
      { id: 'profile', icon: <UserIcon />, title: 'Profile', desc: 'Update your personal information', cta: 'Update' },
      { id: 'security', icon: <ShieldIcon />, title: 'Security', desc: 'Manage passwords and 2FA', cta: 'Manage' },
      { id: 'cloud', icon: <CloudIcon />, title: 'Cloud sync', desc: 'Sync data across your devices', cta: 'Sync' },
    ];
    return (
      <DemoSection isColumn label="list">
        <ItemCardGroup layout="list" style={{ width: 520 }}>
          {rows.map((row) => (
            <GroupSettingCard
              key={row.id}
              icon={row.icon}
              title={row.title}
              desc={row.desc}
              action={
                <Button size="sm" variant="outline">
                  {row.cta}
                </Button>
              }
            />
          ))}
        </ItemCardGroup>
      </DemoSection>
    );
  }

  // multiple-sections 对齐 Pro：Account 区(导航行) + Preferences 区(Language/Dark mode)
  if (variant === 'multiple-sections') {
    return (
      <DemoSection isColumn label="multiple sections">
        <ItemCardGroup layout="list" style={{ width: 520 }}>
          <ItemCardGroup.Header>
            <ItemCardGroup.Title>Account</ItemCardGroup.Title>
          </ItemCardGroup.Header>
          <GroupSettingCard
            icon={<UserIcon />}
            title="Profile"
            desc="Update your personal information"
            action={<ChevronRightIcon />}
          />
          <GroupSettingCard
            icon={<ShieldIcon />}
            title="Security"
            desc="Manage passwords and 2FA"
            action={<ChevronRightIcon />}
          />
        </ItemCardGroup>
        <ItemCardGroup layout="list" style={{ width: 520 }}>
          <ItemCardGroup.Header>
            <ItemCardGroup.Title>Preferences</ItemCardGroup.Title>
          </ItemCardGroup.Header>
          <GroupSettingCard
            icon={<GlobeIcon />}
            title="Language"
            desc="Choose your preferred language"
            action={
              <Button size="sm" variant="outline">
                English
              </Button>
            }
          />
          <GroupSettingCard
            icon={<MoonIcon />}
            title="Dark mode"
            desc="Use dark theme across the app"
            action={<Switch aria-label="Dark mode" size="sm" />}
          />
        </ItemCardGroup>
      </DemoSection>
    );
  }

  // notification-preferences 对齐 Pro：带头部 + 每个事件类型一个下拉
  if (variant === 'notification-preferences') {
    const events = [
      { id: 'invites', icon: <BellIcon />, title: 'Event Invites', value: 'Email & Push Notification' },
      { id: 'reminders', icon: <BellIcon />, title: 'Event Reminders', value: 'Email' },
      { id: 'blasts', icon: <BellIcon />, title: 'Event Blasts', value: 'Email & Push Notification' },
    ];
    return (
      <DemoSection isColumn label="notification preferences">
        <ItemCardGroup layout="list" style={{ width: 560 }}>
          <ItemCardGroup.Header>
            <ItemCardGroup.Title>Notification Preferences</ItemCardGroup.Title>
            <ItemCardGroup.Description>
              Choose how you receive notifications for each event type
            </ItemCardGroup.Description>
          </ItemCardGroup.Header>
          {events.map((event) => (
            <GroupSettingCard
              key={event.id}
              icon={event.icon}
              title={event.title}
              action={selectChip(event.value)}
            />
          ))}
        </ItemCardGroup>
      </DemoSection>
    );
  }

  // permission-levels 对齐 Pro：带头部 + 每个资源一个权限下拉
  if (variant === 'permission-levels') {
    const perms = [
      { id: 'documents', icon: <FolderIcon />, title: 'Documents', desc: 'Access to shared files', value: 'Edit' },
      { id: 'billing', icon: <FileIcon />, title: 'Billing', desc: 'Payment and invoices', value: 'View' },
      { id: 'members', icon: <UserIcon />, title: 'Members', desc: 'Team member management', value: 'Manage' },
    ];
    return (
      <DemoSection isColumn label="permission levels">
        <ItemCardGroup layout="list" style={{ width: 560 }}>
          <ItemCardGroup.Header>
            <ItemCardGroup.Title>Permissions</ItemCardGroup.Title>
            <ItemCardGroup.Description>Control access levels for your team</ItemCardGroup.Description>
          </ItemCardGroup.Header>
          {perms.map((perm) => (
            <GroupSettingCard
              key={perm.id}
              icon={perm.icon}
              title={perm.title}
              desc={perm.desc}
              action={selectChip(perm.value)}
            />
          ))}
        </ItemCardGroup>
      </DemoSection>
    );
  }

  // pressable 对齐 Pro：带头部 + Profile / Security / Cloud sync 整行可点
  if (variant === 'pressable') {
    const rows = [
      { id: 'profile', icon: <UserIcon />, title: 'Profile', desc: 'Update your personal information' },
      { id: 'security', icon: <ShieldIcon />, title: 'Security', desc: 'Manage passwords and 2FA' },
      { id: 'cloud', icon: <CloudIcon />, title: 'Cloud sync', desc: 'Sync data across your devices' },
    ];
    return (
      <DemoSection isColumn label="pressable">
        <ItemCardGroup
          layout="list"
          isPressable
          style={{ width: 520 }}
          onItemPress={(key) => {
            const row = rows.find((item) => item.id === key);
            setPressed(row ? `Opened ${row.title}` : String(key));
          }}
        >
          <ItemCardGroup.Header>
            <ItemCardGroup.Title>Account</ItemCardGroup.Title>
            <ItemCardGroup.Description>Manage your account settings and preferences</ItemCardGroup.Description>
          </ItemCardGroup.Header>
          {rows.map((row) => (
            <GroupSettingCard
              key={row.id}
              id={row.id}
              icon={row.icon}
              title={row.title}
              desc={row.desc}
              action={<ChevronRightIcon />}
            />
          ))}
        </ItemCardGroup>
        <span style={demoTextStyle}>{pressed}</span>
      </DemoSection>
    );
  }

  // variants 对齐 Pro：每个视觉变体一个分组(含描述头部 + Profile/Security 行)
  if (variant === 'variants') {
    const variantRows: {
      key: 'default' | 'secondary' | 'tertiary' | 'outline' | 'transparent';
      title: string;
      desc: string;
    }[] = [
      { key: 'default', title: 'Default', desc: 'Surface background with shadow' },
      { key: 'secondary', title: 'Secondary', desc: 'Secondary surface, no shadow' },
      { key: 'tertiary', title: 'Tertiary', desc: 'Tertiary surface, no shadow' },
      { key: 'outline', title: 'Outline', desc: 'Transparent with border, no shadow' },
      { key: 'transparent', title: 'Transparent', desc: 'No background, no border, no shadow' },
    ];
    return (
      <DemoSection isColumn label="variants">
        {variantRows.map((row) => (
          <ItemCardGroup key={row.key} layout="list" variant={row.key} style={{ width: 480 }}>
            <ItemCardGroup.Header>
              <ItemCardGroup.Title>{row.title}</ItemCardGroup.Title>
              <ItemCardGroup.Description>{row.desc}</ItemCardGroup.Description>
            </ItemCardGroup.Header>
            <GroupSettingCard
              icon={<UserIcon />}
              title="Profile"
              desc="Update your personal information"
              action={<ChevronRightIcon />}
            />
            <GroupSettingCard
              icon={<ShieldIcon />}
              title="Security"
              desc="Manage passwords and 2FA"
              action={<ChevronRightIcon />}
            />
          </ItemCardGroup>
        ))}
      </DemoSection>
    );
  }

  // wallet-list 对齐 Pro：头像 + 名称/地址 + 价格 + ⋯
  if (variant === 'wallet-list') {
    const wallets = [
      { id: 'funds', name: 'Funds', addr: '0x34E6...6255', usd: '$0.00', eth: '0.0 ETH', grad: 'linear-gradient(135deg, #475569, #1e293b)' },
      { id: 'd9ea', name: '0xD9EA...f40e', addr: '0xD9EA...f40e', usd: '$0.00', eth: '0.0 ETH', grad: 'linear-gradient(135deg, #60a5fa, #a78bfa)' },
      { id: 'slmobbin', name: "SLMobbin's", addr: '0x9DC5...621a', usd: '$37.09', eth: '0.021 ETH', grad: 'linear-gradient(135deg, #6ee7b7, #f472b6)' },
      { id: 'samlee', name: "Sam Lee's Wallet", addr: '0xa98b...4daa', usd: '$0.00', eth: '0.0 ETH', grad: 'linear-gradient(135deg, #fb923c, #facc15)' },
    ];
    return (
      <DemoSection isColumn label="wallet list">
        <ItemCardGroup layout="list" style={{ width: 520 }}>
          {wallets.map((wallet) => (
            <ItemCard key={wallet.id}>
              <ItemCard.Icon>
                <GradientAvatar gradient={wallet.grad} size={32} />
              </ItemCard.Icon>
              <ItemCard.Content>
                <ItemCard.Title>{wallet.name}</ItemCard.Title>
                <ItemCard.Description>{wallet.addr}</ItemCard.Description>
              </ItemCard.Content>
              <ItemCard.Action>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600 }}>{wallet.usd}</div>
                    <div style={demoMutedStyle}>{wallet.eth}</div>
                  </div>
                  <Button aria-label="More options" isIconOnly size="sm" variant="ghost">
                    ⋯
                  </Button>
                </div>
              </ItemCard.Action>
            </ItemCard>
          ))}
        </ItemCardGroup>
      </DemoSection>
    );
  }

  // with-header / developer-settings 对齐 Pro：带 General 头部的设置组
  return (
    <DemoSection isColumn label={variant}>
      <ItemCardGroup layout="list" style={{ width: 520 }}>
        <ItemCardGroup.Header>
          <ItemCardGroup.Title>General</ItemCardGroup.Title>
          <ItemCardGroup.Description>Manage your account preferences</ItemCardGroup.Description>
        </ItemCardGroup.Header>
        <GroupSettingCard
          icon={<GlobeIcon />}
          title="Language"
          desc="Choose your preferred language"
          action={
            <Button size="sm" variant="outline">
              English
            </Button>
          }
        />
        <GroupSettingCard
          icon={<GlobeIcon />}
          title="Theme"
          desc="Choose your app's look"
          action={selectChip('System')}
        />
        <GroupSettingCard
          icon={<MoonIcon />}
          title="Dark mode"
          desc="Use dark theme across the app"
          action={<Switch aria-label="Dark mode" size="sm" />}
        />
      </ItemCardGroup>
    </DemoSection>
  );
};

type KpiVariantKey =
  | 'default'
  | 'with-actions'
  | 'with-chart-bottom'
  | 'with-chart-inline'
  | 'with-footer'
  | 'with-icon'
  | 'with-progress';

/** Pro 风格软趋势标：淡底 pill + ↑/↓ 箭头（neutral 用中性色无箭头），对齐 heroui Pro KPI.Trend */
const kpiTrendPill = (direction: 'up' | 'down' | 'neutral', percent: string) =>
  direction === 'neutral' ? (
    <Chip color="default" variant="soft" size="sm">
      {percent}
    </Chip>
  ) : (
    <Chip color={direction === 'up' ? 'success' : 'danger'} variant="soft" size="sm">
      {direction === 'up' ? '↑' : '↓'} {percent}
    </Chip>
  );

const KpiVariantDemo = ({ variant }: { variant: KpiVariantKey }) => {
  // default 对齐 Pro「Usage」：2×2 四卡业务网格
  if (variant === 'default') {
    const cards = [
      { title: 'Total Revenue', value: 'US$228,451', dir: 'up' as const, pct: '+33%' },
      { title: 'Total Expenses', value: 'US$71,887', dir: 'down' as const, pct: '13.0%' },
      { title: 'Total Profit', value: 'US$156,540', dir: 'neutral' as const, pct: '0.0%' },
      { title: 'New Customers', value: '1,234', dir: 'up' as const, pct: '+1.0%' },
    ];
    return (
      <DemoSection isColumn label="default">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 248px)', gap: 16 }}>
          {cards.map((card) => (
            <Kpi key={card.title} className="card">
              <Kpi.Header>
                <Kpi.Title>{card.title}</Kpi.Title>
              </Kpi.Header>
              <Kpi.Content>
                <Kpi.Value>{card.value}</Kpi.Value>
                <Kpi.Trend>{kpiTrendPill(card.dir, card.pct)}</Kpi.Trend>
              </Kpi.Content>
            </Kpi>
          ))}
        </div>
      </DemoSection>
    );
  }

  // 单卡变体对齐 Pro 各 section 的业务示例
  const isProgress = variant === 'with-progress';
  const title = isProgress ? 'Load Time' : 'Conversion Rate';
  const value = isProgress ? '856' : '3.8%';

  return (
    <DemoSection isColumn label={variant}>
      <Kpi className="card" style={{ width: 320 }}>
        <Kpi.Header>
          {(variant === 'with-icon' || variant === 'with-actions') && (
            <Kpi.Icon status="success">
              <BookIcon />
            </Kpi.Icon>
          )}
          <Kpi.Title>{title}</Kpi.Title>
          {variant === 'with-actions' && (
            <Kpi.Actions>
              <Button size="sm" variant="ghost" isIconOnly aria-label="More options">
                ⋮
              </Button>
            </Kpi.Actions>
          )}
        </Kpi.Header>
        <Kpi.Content>
          <Kpi.Value>{value}</Kpi.Value>
          {!isProgress && <Kpi.Trend>{kpiTrendPill('up', '+1.7%')}</Kpi.Trend>}
          {variant === 'with-chart-inline' && (
            <Kpi.Chart style={{ width: 96 }}>
              <SparklineLine values={[20, 32, 28, 44, 52, 48]} />
            </Kpi.Chart>
          )}
        </Kpi.Content>
        {variant === 'with-progress' && (
          <Kpi.Progress>
            <ProgressBar color="warning" label="Load budget" size="sm" value={62} />
          </Kpi.Progress>
        )}
        {variant === 'with-chart-bottom' && (
          <Kpi.Chart>
            <SparklineBars values={[18, 28, 42, 35, 52, 46, 60]} />
          </Kpi.Chart>
        )}
        {variant === 'with-footer' && (
          <>
            <Kpi.Separator />
            <Kpi.Footer>
              <span style={demoMutedStyle}>vs last week +1.7%</span>
            </Kpi.Footer>
          </>
        )}
      </Kpi>
    </DemoSection>
  );
};

const KpiGroupVariantDemo = ({ variant }: { variant: 'horizontal' | 'vertical' | 'with-from-suffix' }) => {
  // vertical 对齐 Pro：单列堆叠 Revenue / Expenses / Profit（US$ 金额 + soft 趋势标）
  if (variant === 'vertical') {
    const verticalCards = [
      { title: 'Revenue', value: 'US$228,451', dir: 'up' as const, pct: '+3.3%' },
      { title: 'Expenses', value: 'US$25,108', dir: 'down' as const, pct: '-3.3%' },
      { title: 'Profit', value: 'US$203,133', dir: 'up' as const, pct: '+4.1%' },
    ];
    return (
      <DemoSection label="vertical">
        <KpiGroup orientation="vertical" style={{ width: 280 }}>
          {verticalCards.map((card, index) => (
            <Fragment key={card.title}>
              {index > 0 && <KpiGroup.Separator />}
              <Kpi>
                <Kpi.Header>
                  <Kpi.Title>{card.title}</Kpi.Title>
                </Kpi.Header>
                <Kpi.Content>
                  <Kpi.Value>{card.value}</Kpi.Value>
                  <Kpi.Trend>{kpiTrendPill(card.dir, card.pct)}</Kpi.Trend>
                </Kpi.Content>
              </Kpi>
            </Fragment>
          ))}
        </KpiGroup>
      </DemoSection>
    );
  }

  // horizontal / with-from-suffix 对齐 Pro：Total Subscribers / Avg. Open Rate / Avg. Click Rate
  const withFrom = variant === 'with-from-suffix';
  const horizontalCards = [
    { title: 'Total Subscribers', value: '71,897', from: '70,946', dir: 'up' as const, pct: '12%' },
    { title: 'Avg. Open Rate', value: '58.16%', from: '56.14%', dir: 'up' as const, pct: '2.02%' },
    { title: 'Avg. Click Rate', value: '24.57%', from: '28.62%', dir: 'down' as const, pct: '4.05%' },
  ];
  return (
    <DemoSection label={variant}>
      <KpiGroup orientation="horizontal" style={{ width: 680 }}>
        {horizontalCards.map((card, index) => (
          <Fragment key={card.title}>
            {index > 0 && <KpiGroup.Separator />}
            <Kpi>
              <Kpi.Header>
                <Kpi.Title>{card.title}</Kpi.Title>
              </Kpi.Header>
              <Kpi.Content>
                {withFrom ? (
                  <div className="kpi__value-group">
                    <Kpi.Value>{card.value}</Kpi.Value>
                    <span className="kpi__value-suffix">
                      <span>from</span>
                      <span>{card.from}</span>
                    </span>
                  </div>
                ) : (
                  <Kpi.Value>{card.value}</Kpi.Value>
                )}
                <Kpi.Trend>{kpiTrendPill(card.dir, card.pct)}</Kpi.Trend>
              </Kpi.Content>
            </Kpi>
          </Fragment>
        ))}
      </KpiGroup>
    </DemoSection>
  );
};

type ListViewVariantKey = 'default' | 'disabled-items' | 'secondary' | 'selection-modes' | 'with-actions';

/** 渲染单个文件行：folder/file 图标 + 标题 + 「Updated …」描述，对齐 heroui Pro List View */
const renderListViewFile = (file: (typeof LIST_VIEW_FILES)[number]) => (
  <ListView.Item id={file.id} textValue={file.name}>
    <ListView.ItemContent>
      {file.kind === 'folder' ? <FolderIcon /> : <FileIcon />}
      <div>
        <ListView.Title>{file.name}</ListView.Title>
        <ListView.Description>{file.updated}</ListView.Description>
      </div>
    </ListView.ItemContent>
  </ListView.Item>
);

const ListViewVariantDemo = ({ variant }: { variant: ListViewVariantKey }) => {
  const [message, setMessage] = useState('No action yet');

  // selection-modes 对齐 Pro：None / Single / Multiple 三列并排
  if (variant === 'selection-modes') {
    const modes: { mode: 'none' | 'single' | 'multiple'; label: string }[] = [
      { mode: 'none', label: 'None' },
      { mode: 'single', label: 'Single' },
      { mode: 'multiple', label: 'Multiple' },
    ];
    return (
      <DemoSection label="selection modes">
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {modes.map(({ mode, label }) => (
            <div key={mode} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={demoTextStyle}>{label}</span>
              <ListView
                aria-label={`Files (${label})`}
                items={LIST_VIEW_FILES.slice(0, 4)}
                selectionMode={mode}
                style={{ width: 220 }}
              >
                {renderListViewFile}
              </ListView>
            </div>
          ))}
        </div>
      </DemoSection>
    );
  }

  // disabled-items：禁用 README.md / src 两行（带锁定语义）
  if (variant === 'disabled-items') {
    return (
      <DemoSection isColumn label="disabled items">
        <ListView
          aria-label="Files"
          disabledKeys={['3', '5']}
          items={LIST_VIEW_FILES}
          selectionMode="multiple"
          style={{ width: 420 }}
        >
          {renderListViewFile}
        </ListView>
      </DemoSection>
    );
  }

  return (
    <DemoSection isColumn label={variant}>
      <ListView
        aria-label="Files"
        items={LIST_VIEW_FILES}
        selectionMode={variant === 'default' ? 'none' : 'single'}
        style={{ width: 420 }}
        variant={variant === 'secondary' ? 'secondary' : 'primary'}
      >
        {(file) => (
          <ListView.Item id={file.id} textValue={file.name}>
            <ListView.ItemContent>
              {file.kind === 'folder' ? <FolderIcon /> : <FileIcon />}
              <div>
                <ListView.Title>{file.name}</ListView.Title>
                <ListView.Description>{file.updated}</ListView.Description>
              </div>
            </ListView.ItemContent>
            {variant === 'with-actions' && (
              <ListView.ItemAction>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(event) => {
                    event.stopPropagation();
                    setMessage(`Opened ${file.name}`);
                  }}
                >
                  Open
                </Button>
              </ListView.ItemAction>
            )}
          </ListView.Item>
        )}
      </ListView>
      {variant === 'with-actions' && <span style={demoTextStyle}>{message}</span>}
    </DemoSection>
  );
};

type WidgetVariantKey =
  | 'dashboard-grid'
  | 'default'
  | 'usage-summary'
  | 'with-bar-chart'
  | 'with-kpis'
  | 'with-line-chart'
  | 'with-pie-chart'
  | 'with-table';

/** Widget demo 用的 Pro 业务数据集 */
const WIDGET_TOKENS = [
  { day: '09/03', input: 180, output: 30 },
  { day: '09/06', input: 90, output: 28 },
  { day: '09/09', input: 70, output: 40 },
  { day: '09/12', input: 95, output: 34 },
  { day: '09/15', input: 60, output: 30 },
  { day: '09/18', input: 50, output: 26 },
  { day: '09/21', input: 42, output: 24 },
  { day: '09/24', input: 38, output: 22 },
  { day: '09/27', input: 34, output: 20 },
  { day: '09/30', input: 32, output: 18 },
];
const WIDGET_REQUESTS = [
  { day: '09/03', requests: 600 },
  { day: '09/06', requests: 1050 },
  { day: '09/09', requests: 900 },
  { day: '09/12', requests: 1150 },
  { day: '09/15', requests: 1700 },
  { day: '09/18', requests: 1450 },
  { day: '09/21', requests: 1180 },
  { day: '09/24', requests: 1000 },
  { day: '09/27', requests: 880 },
  { day: '09/30', requests: 560 },
];
const WIDGET_TRAFFIC = [
  { month: 'Jan', organic: 5000, paid: 1000 },
  { month: 'Mar', organic: 9000, paid: 11000 },
  { month: 'May', organic: 11000, paid: 12000 },
  { month: 'Jul', organic: 13000, paid: 9000 },
  { month: 'Sep', organic: 18000, paid: 7000 },
  { month: 'Nov', organic: 21000, paid: 16000 },
  { month: 'Dec', organic: 17000, paid: 11000 },
];
const WIDGET_BROWSERS = [
  { name: 'Chrome', value: 62 },
  { name: 'Safari', value: 19 },
  { name: 'Firefox', value: 11 },
  { name: 'Edge', value: 8 },
];
const WIDGET_TEAM = [
  { id: 'kate', name: 'Kate Moore', role: 'CEO', status: 'Active', email: 'kate@acme.com' },
  { id: 'john', name: 'John Smith', role: 'CTO', status: 'Active', email: 'john@acme.com' },
  { id: 'sara', name: 'Sara Johnson', role: 'CMO', status: 'On Leave', email: 'sara@acme.com' },
  { id: 'michael', name: 'Michael Brown', role: 'CFO', status: 'Active', email: 'michael@acme.com' },
];
type WidgetTeamRow = (typeof WIDGET_TEAM)[number];
const WIDGET_TEAM_COLUMNS: DataGridColumn<WidgetTeamRow>[] = [
  { id: 'name', header: 'Name', accessorKey: 'name', isRowHeader: true },
  { id: 'role', header: 'Role', accessorKey: 'role' },
  { id: 'status', header: 'Status', accessorKey: 'status' },
  { id: 'email', header: 'Email', accessorKey: 'email' },
];

const WidgetVariantDemo = ({ variant }: { variant: WidgetVariantKey }) => {
  // dashboard-grid 对齐 Pro：Overview KPI 行 + Revenue/Traffic 双图 + Monthly Sales 柱图
  if (variant === 'dashboard-grid') {
    return (
      <DemoSection label="dashboard grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 760 }}>
          <Widget>
            <Widget.Header>
              <Widget.Title>Overview</Widget.Title>
            </Widget.Header>
            <Widget.Content>
              <KpiGroup orientation="horizontal">
                <Kpi>
                  <Kpi.Header>
                    <Kpi.Title>Revenue</Kpi.Title>
                  </Kpi.Header>
                  <Kpi.Content>
                    <Kpi.Value>$228K</Kpi.Value>
                    <Kpi.Trend>{kpiTrendPill('up', '12.5%')}</Kpi.Trend>
                  </Kpi.Content>
                </Kpi>
                <KpiGroup.Separator />
                <Kpi>
                  <Kpi.Header>
                    <Kpi.Title>Orders</Kpi.Title>
                  </Kpi.Header>
                  <Kpi.Content>
                    <Kpi.Value>1,234</Kpi.Value>
                    <Kpi.Trend>{kpiTrendPill('up', '8.2%')}</Kpi.Trend>
                  </Kpi.Content>
                </Kpi>
                <KpiGroup.Separator />
                <Kpi>
                  <Kpi.Header>
                    <Kpi.Title>Customers</Kpi.Title>
                  </Kpi.Header>
                  <Kpi.Content>
                    <Kpi.Value>8,921</Kpi.Value>
                    <Kpi.Trend>{kpiTrendPill('up', '3.1%')}</Kpi.Trend>
                  </Kpi.Content>
                </Kpi>
                <KpiGroup.Separator />
                <Kpi>
                  <Kpi.Header>
                    <Kpi.Title>Conversion</Kpi.Title>
                  </Kpi.Header>
                  <Kpi.Content>
                    <Kpi.Value>3.2%</Kpi.Value>
                    <Kpi.Trend>{kpiTrendPill('down', '0.4%')}</Kpi.Trend>
                  </Kpi.Content>
                </Kpi>
              </KpiGroup>
            </Widget.Content>
          </Widget>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
            <Widget>
              <Widget.Header>
                <Widget.Title>Revenue</Widget.Title>
                <Chip color="success" variant="soft" size="sm">
                  ↑ 12.5%
                </Chip>
              </Widget.Header>
              <Widget.Content>
                <SparklineLine values={[40, 38, 52, 48, 60, 56, 70, 66, 78, 84]} />
              </Widget.Content>
            </Widget>
            <Widget>
              <Widget.Header>
                <Widget.Title>Traffic</Widget.Title>
                <Widget.Legend>
                  <Widget.LegendItem color="var(--chart-4)">Organic</Widget.LegendItem>
                  <Widget.LegendItem color="var(--chart-1)">Paid</Widget.LegendItem>
                </Widget.Legend>
              </Widget.Header>
              <Widget.Content>
                <SparklineLine values={[20, 34, 42, 56, 64, 78]} />
              </Widget.Content>
            </Widget>
          </div>
          <Widget>
            <Widget.Header>
              <Widget.Title>Monthly Sales</Widget.Title>
              <Widget.Description>Units sold — Jan to Dec 2025</Widget.Description>
            </Widget.Header>
            <Widget.Content>
              <SparklineBars values={[18, 26, 22, 40, 30, 52, 34, 48, 38, 60, 46, 58]} />
            </Widget.Content>
          </Widget>
        </div>
      </DemoSection>
    );
  }

  // with-table 对齐 Pro：Team Members 表格(4 members)
  if (variant === 'with-table') {
    return (
      <DemoSection label="with table">
        <Widget style={{ width: 640 }}>
          <Widget.Header>
            <Widget.Title>Team Members</Widget.Title>
            <Widget.Description>4 members</Widget.Description>
          </Widget.Header>
          <Widget.Content>
            <DataGrid
              aria-label="Team Members"
              columns={WIDGET_TEAM_COLUMNS}
              data={WIDGET_TEAM}
              getRowId={(row) => row.id}
            />
          </Widget.Content>
        </Widget>
      </DemoSection>
    );
  }

  // with-bar-chart 对齐 Pro：Requests Over Time 柱图
  if (variant === 'with-bar-chart') {
    return (
      <DemoSection label="with bar chart">
        <Widget style={{ width: 560 }}>
          <Widget.Header>
            <Widget.Title>Requests Over Time</Widget.Title>
            <Widget.Legend>
              <Widget.LegendItem color="var(--chart-1)">Requests</Widget.LegendItem>
            </Widget.Legend>
          </Widget.Header>
          <Widget.Content>
            <BarChart data={WIDGET_REQUESTS} height={220}>
              <BarChart.Grid vertical={false} />
              <BarChart.XAxis dataKey="day" tickLine={false} axisLine={false} />
              <BarChart.YAxis tickLine={false} axisLine={false} width={40} />
              <BarChart.Tooltip cursor content={<BarChart.TooltipContent indicator="dot" />} />
              <BarChart.Bar dataKey="requests" name="Requests" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </Widget.Content>
        </Widget>
      </DemoSection>
    );
  }

  // with-line-chart 对齐 Pro：Traffic Sources 折线(Organic / Paid Ads)
  if (variant === 'with-line-chart') {
    return (
      <DemoSection label="with line chart">
        <Widget style={{ width: 560 }}>
          <Widget.Header>
            <Widget.Title>Traffic Sources</Widget.Title>
            <Widget.Legend>
              <Widget.LegendItem color="var(--chart-4)">Organic</Widget.LegendItem>
              <Widget.LegendItem color="var(--chart-1)">Paid Ads</Widget.LegendItem>
            </Widget.Legend>
          </Widget.Header>
          <Widget.Content>
            <LineChart data={WIDGET_TRAFFIC} height={220}>
              <LineChart.Grid vertical={false} />
              <LineChart.XAxis dataKey="month" tickLine={false} axisLine={false} />
              <LineChart.YAxis tickLine={false} axisLine={false} width={40} />
              <LineChart.Tooltip cursor={{ strokeDasharray: '4 4' }} content={<LineChart.TooltipContent indicator="line" />} />
              <LineChart.Line type="monotone" dataKey="organic" name="Organic" stroke="var(--chart-4)" strokeWidth={2} dot={false} />
              <LineChart.Line type="monotone" dataKey="paid" name="Paid Ads" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
            </LineChart>
          </Widget.Content>
        </Widget>
      </DemoSection>
    );
  }

  // with-pie-chart 对齐 Pro：Browser Usage 饼图(Chrome/Safari/Firefox/Edge)
  if (variant === 'with-pie-chart') {
    return (
      <DemoSection label="with pie chart">
        <Widget style={{ width: 420 }}>
          <Widget.Header>
            <Widget.Title>Browser Usage</Widget.Title>
          </Widget.Header>
          <Widget.Content>
            <PieChart height={240} width={360}>
              <PieChart.Tooltip content={<PieChart.TooltipContent />} />
              <PieChart.Pie
                data={WIDGET_BROWSERS}
                dataKey="value"
                nameKey="name"
                outerRadius={92}
                activeShape={<PieChart.ActiveShape />}
              />
            </PieChart>
            <Widget.Legend style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
              {WIDGET_BROWSERS.map((item, index) => (
                <Widget.LegendItem key={item.name} color={`var(--chart-${index + 1})`}>
                  {item.name}
                </Widget.LegendItem>
              ))}
            </Widget.Legend>
          </Widget.Content>
        </Widget>
      </DemoSection>
    );
  }

  // with-kpis / usage-summary 对齐 Pro：Key Metrics 三联指标 + 迷你趋势
  if (variant === 'with-kpis' || variant === 'usage-summary') {
    return (
      <DemoSection label={variant}>
        <Widget style={{ width: 640 }}>
          <Widget.Header>
            <Widget.Title>Key Metrics</Widget.Title>
            <Widget.Description>Last 30 days</Widget.Description>
          </Widget.Header>
          <Widget.Content>
            <KpiGroup orientation="horizontal">
              <Kpi>
                <Kpi.Header>
                  <Kpi.Title>Total Revenue</Kpi.Title>
                </Kpi.Header>
                <Kpi.Content>
                  <Kpi.Value>US$228,451</Kpi.Value>
                  <Kpi.Trend>{kpiTrendPill('up', '3.3% last 30d')}</Kpi.Trend>
                </Kpi.Content>
              </Kpi>
              <KpiGroup.Separator />
              <Kpi>
                <Kpi.Header>
                  <Kpi.Title>Bounce Rate</Kpi.Title>
                </Kpi.Header>
                <Kpi.Content>
                  <Kpi.Value>42.3%</Kpi.Value>
                  <Kpi.Trend>{kpiTrendPill('down', '5.9% vs last 7d')}</Kpi.Trend>
                </Kpi.Content>
              </Kpi>
              <KpiGroup.Separator />
              <Kpi>
                <Kpi.Header>
                  <Kpi.Title>Active Users</Kpi.Title>
                </Kpi.Header>
                <Kpi.Content>
                  <Kpi.Value>100K</Kpi.Value>
                  <Kpi.Trend>{kpiTrendPill('up', '10.9% this month')}</Kpi.Trend>
                </Kpi.Content>
              </Kpi>
            </KpiGroup>
          </Widget.Content>
        </Widget>
      </DemoSection>
    );
  }

  // default 对齐 Pro Usage：Tokens Over Time 折线(Input / Output)
  return (
    <DemoSection label="default">
      <Widget style={{ width: 560 }}>
        <Widget.Header>
          <Widget.Title>Tokens Over Time</Widget.Title>
          <Widget.Legend>
            <Widget.LegendItem color="var(--chart-1)">Input</Widget.LegendItem>
            <Widget.LegendItem color="var(--chart-2)">Output</Widget.LegendItem>
          </Widget.Legend>
        </Widget.Header>
        <Widget.Content>
          <LineChart data={WIDGET_TOKENS} height={220}>
            <LineChart.Grid vertical={false} />
            <LineChart.XAxis dataKey="day" tickLine={false} axisLine={false} />
            <LineChart.YAxis tickLine={false} axisLine={false} width={40} />
            <LineChart.Tooltip cursor={{ strokeDasharray: '4 4' }} content={<LineChart.TooltipContent indicator="line" />} />
            <LineChart.Line type="monotone" dataKey="input" name="Input" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
            <LineChart.Line type="monotone" dataKey="output" name="Output" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
          </LineChart>
        </Widget.Content>
      </Widget>
    </DemoSection>
  );
};

type ChartTooltipVariantKey =
  | 'auto-content'
  | 'chart-colors'
  | 'custom-formatters'
  | 'default'
  | 'inactive'
  | 'line-indicator'
  | 'no-header';

const ChartTooltipVariantDemo = ({ variant }: { variant: ChartTooltipVariantKey }) => {
  // inactive 对齐 Pro：active=false，无悬停数据点不渲染内容
  if (variant === 'inactive') {
    return (
      <DemoSection isColumn label="inactive">
        <span style={demoMutedStyle}>The tooltip below is inactive (active=false) — nothing should render:</span>
        <div
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 360,
            height: 64,
            borderRadius: 8,
            background: 'var(--surface-secondary)',
            color: 'var(--muted)',
            fontSize: 13,
          }}
        >
          (empty — tooltip hidden)
        </div>
      </DemoSection>
    );
  }

  // chart-colors 对齐 Pro：四个 chart token 色阶
  if (variant === 'chart-colors') {
    const colors = [
      { token: 'chart-1', label: 'Lightest' },
      { token: 'chart-2', label: 'Light' },
      { token: 'chart-3', label: 'Accent' },
      { token: 'chart-4', label: 'Darkest' },
    ];
    return (
      <DemoSection label="chart colors">
        <ChartTooltip>
          <ChartTooltip.Header>All Chart Colors</ChartTooltip.Header>
          {colors.map((color) => (
            <ChartTooltip.Item
              key={color.token}
              indicator="dot"
              indicatorColor={`var(--${color.token})`}
              label={color.token}
              value={color.label}
            />
          ))}
        </ChartTooltip>
      </DemoSection>
    );
  }

  // line-indicator / no-header 对齐 Pro：流量来源(竖线指示器)
  if (variant === 'line-indicator' || variant === 'no-header') {
    const rows = [
      { label: 'Organic', value: '15,200', color: 'var(--chart-1)' },
      { label: 'Paid Ads', value: '8,400', color: 'var(--chart-3)' },
      { label: 'Referral', value: '3,100', color: 'var(--chart-4)' },
    ];
    return (
      <DemoSection label={variant}>
        <ChartTooltip>
          {variant !== 'no-header' && <ChartTooltip.Header>March 2025</ChartTooltip.Header>}
          {rows.map((row) => (
            <ChartTooltip.Item
              key={row.label}
              indicator="line"
              indicatorColor={row.color}
              label={row.label}
              value={row.value}
            />
          ))}
        </ChartTooltip>
      </DemoSection>
    );
  }

  // custom-formatters 对齐 Pro：投资组合 vs 基准(货币格式)
  if (variant === 'custom-formatters') {
    return (
      <DemoSection label="custom formatters">
        <ChartTooltip>
          <ChartTooltip.Header>January 15, 2025</ChartTooltip.Header>
          <ChartTooltip.Item indicator="dot" indicatorColor="var(--chart-1)" label="Portfolio" value="$24,801.32" />
          <ChartTooltip.Item indicator="dot" indicatorColor="var(--chart-4)" label="Benchmark" value="$21,500" />
        </ChartTooltip>
      </DemoSection>
    );
  }

  // default / auto-content 对齐 Pro：月度营收 vs 支出
  const isAuto = variant === 'auto-content';
  return (
    <DemoSection label={variant}>
      <ChartTooltip>
        <ChartTooltip.Header>{isAuto ? 'February' : 'January'}</ChartTooltip.Header>
        <ChartTooltip.Item
          indicator="dot"
          indicatorColor="var(--chart-1)"
          label="Revenue"
          value={isAuto ? '18200' : '$12,400'}
        />
        <ChartTooltip.Item
          indicator="dot"
          indicatorColor="var(--chart-4)"
          label="Expenses"
          value={isAuto ? '9800' : '$8,200'}
        />
      </ChartTooltip>
    </DemoSection>
  );
};

type TimelineVariantKey =
  | 'default'
  | 'centered-milestones'
  | 'studio-review'
  | 'compact-log'
  | 'incident-response'
  | 'version-history'
  | 'repository-activity'
  | 'split-content';

const TIMELINE_VARIANT_ITEMS: Record<TimelineVariantKey, Array<{
  title: string;
  description: string;
  time: string;
  status?: 'default' | 'current' | 'success' | 'warning' | 'danger' | 'muted';
}>> = {
  default: [
    { title: 'Imported customer notes', description: '42 interview highlights were attached to the opportunity.', time: '09:18', status: 'current' },
    { title: 'Assigned follow-up owner', description: 'Mia Chen will prepare the next review agenda.', time: '10:04', status: 'success' },
    { title: 'Shared summary', description: 'Stakeholders received the product feedback digest.', time: '11:30', status: 'default' },
  ],
  'centered-milestones': [
    { title: 'Discovery', description: 'Research synthesis and success metrics were locked.', time: 'Week 1', status: 'success' },
    { title: 'Prototype', description: 'Interaction model and component inventory are in review.', time: 'Week 2', status: 'current' },
    { title: 'Release', description: 'Public changelog and migration notes are queued.', time: 'Week 3', status: 'muted' },
  ],
  'studio-review': [
    { title: 'Scene approved', description: 'Primary animation timing matches the reference handoff.', time: '09:40', status: 'success' },
    { title: 'Copy pass requested', description: 'Shorten the empty-state paragraph before final export.', time: '10:15', status: 'warning' },
    { title: 'Ready for QA', description: 'Responsive checks are assigned to the frontend owner.', time: '11:05', status: 'current' },
  ],
  'compact-log': [
    { title: 'Build started', description: 'Preview build picked up commit 8f4c2a1.', time: '12:01', status: 'current' },
    { title: 'Checks passed', description: 'Types, lint, and visual smoke checks are green.', time: '12:04', status: 'success' },
    { title: 'Deploy queued', description: 'Production promotion waits for reviewer approval.', time: '12:06', status: 'muted' },
  ],
  'incident-response': [
    { title: 'Alert triggered', description: 'Checkout latency crossed the 95th percentile threshold.', time: '14:22', status: 'danger' },
    { title: 'Mitigation applied', description: 'Traffic was shifted to the warm standby pool.', time: '14:29', status: 'warning' },
    { title: 'Incident resolved', description: 'Error rate returned to baseline and monitoring continues.', time: '14:46', status: 'success' },
  ],
  'version-history': [
    { title: 'v0.4.0 published', description: 'Added controlled sheet snap points and grouped command actions.', time: 'Jun 18', status: 'success' },
    { title: 'v0.3.2 patched', description: 'Fixed keyboard navigation in nested menus.', time: 'Jun 13', status: 'current' },
    { title: 'v0.3.0 released', description: 'Introduced AI message and source components.', time: 'Jun 08', status: 'muted' },
  ],
  'repository-activity': [
    { title: 'Opened pull request', description: 'feat(showcase): add timeline parity demos.', time: '2m ago', status: 'current' },
    { title: 'Requested review', description: 'Design and accessibility reviewers were assigned.', time: '5m ago', status: 'warning' },
    { title: 'Merged dependency update', description: 'UI library patch release was consumed by the build.', time: '1h ago', status: 'success' },
  ],
  'split-content': [
    { title: 'Plan', description: 'Scope the component slots and API surface.', time: 'Step 1', status: 'success' },
    { title: 'Implement', description: 'Wire visual states, actions, and keyboard semantics.', time: 'Step 2', status: 'current' },
    { title: 'Verify', description: 'Compare against the reference and record parity gaps.', time: 'Step 3', status: 'muted' },
  ],
};

const TimelineVariantDemo = ({ variant }: { variant: TimelineVariantKey }) => {
  const [message, setMessage] = useState('No timeline event selected yet');
  const axis = variant === 'centered-milestones' || variant === 'split-content' ? 'center' : 'start';
  const placement = variant === 'centered-milestones' ? 'alternate' : variant === 'split-content' ? 'alternate' : 'end';
  const density = variant === 'compact-log' ? 'compact' : 'comfortable';
  const size = variant === 'centered-milestones' ? 'lg' : variant === 'compact-log' ? 'sm' : 'md';
  const items = TIMELINE_VARIANT_ITEMS[variant];

  return (
    <DemoSection label={`timeline-${variant}`} isColumn>
      <Timeline
        axis={axis}
        placement={placement}
        density={density}
        size={size}
        aria-label={`${variant} timeline`}
        style={{ width: variant === 'centered-milestones' || variant === 'split-content' ? 720 : 560, maxWidth: '100%' }}
      >
        {items.map((item, index) => (
          <Timeline.Item
            key={item.title}
            status={variant === 'incident-response' && index === 1 ? 'current' : item.status}
          >
            <Timeline.Rail>
              <Timeline.Marker>
                {variant === 'centered-milestones' ? index + 1 : null}
              </Timeline.Marker>
              <Timeline.Connector />
            </Timeline.Rail>
            <Timeline.Content>
              <Timeline.Time>{item.time}</Timeline.Time>
              <Timeline.Title>{item.title}</Timeline.Title>
              <Timeline.Description>{item.description}</Timeline.Description>
              {(variant === 'studio-review' || variant === 'incident-response' || variant === 'repository-activity') && (
                <Timeline.Actions>
                  <Button size="sm" variant="secondary" onClick={() => setMessage(`Opened: ${item.title}`)}>
                    Open
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setMessage(`Copied link: ${item.title}`)}>
                    Copy link
                  </Button>
                </Timeline.Actions>
              )}
            </Timeline.Content>
          </Timeline.Item>
        ))}
      </Timeline>
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{message}</span>
    </DemoSection>
  );
};

export const dataDisplayDemos: Record<string, ReactNode> = {
  agenda: <AgendaVariantDemo variant="default" />,
  kpi: <KpiDemo />,
  'kpi-group': <KpiGroupDemo />,
  'item-card': <ItemCardDemo />,
  'item-card-group': <ItemCardGroupDemo />,
  'list-view': <ListViewDemo />,
  timeline: <TimelineVariantDemo variant="default" />,
  'empty-state': <EmptyStateDemo />,
  widget: <WidgetDemo />,
  'file-tree': <FileTreeDemo />,
  kanban: <KanbanDemo />,
  'data-grid': <DataGridDemo />,
  carousel: <CarouselDemo />,
  'floating-toc': <FloatingTocDemo />,
  'hover-card': <HoverCardDemo />,
  'chart-tooltip': <ChartTooltipDemo />,
};

export const dataDisplayVariantDemos: Record<string, ReactNode> = {
  'agenda-all-day-events': <AgendaVariantDemo variant="all-day-events" />,
  'agenda-current-time-indicator': <AgendaVariantDemo variant="current-time-indicator" />,
  'agenda-default': <AgendaVariantDemo variant="default" />,
  'agenda-drag-interactions': <AgendaVariantDemo variant="drag-interactions" />,
  'agenda-events': <AgendaVariantDemo variant="events" />,
  'agenda-month-view-features': <AgendaVariantDemo variant="month-view-features" />,
  'agenda-views': <AgendaVariantDemo variant="views" />,
  'agenda-weekend-highlighting': <AgendaVariantDemo variant="weekend-highlighting" />,
  'action-bar-default': <ActionBarDefaultVariantDemo />,
  'action-bar-responsive-labels': <ActionBarResponsiveLabelsVariantDemo />,
  'action-bar-with-data-grid': <ActionBarWithDataGridVariantDemo />,
  'carousel-api-access': <CarouselVariantDemo variant="api-access" />,
  'carousel-autoplay': <CarouselVariantDemo variant="autoplay" />,
  'carousel-default': <CarouselVariantDemo variant="default" />,
  'carousel-loop': <CarouselVariantDemo variant="loop" />,
  'carousel-modal-type': <CarouselVariantDemo variant="modal-type" />,
  'carousel-multiple-slides': <CarouselVariantDemo variant="multiple-slides" />,
  'data-grid-async-loading': <DataGridAsyncLoadingVariantDemo />,
  'data-grid-bulk-actions': <DataGridBulkActionsVariantDemo />,
  'data-grid-column-definitions': <DataGridColumnDefinitionsVariantDemo />,
  'data-grid-column-resizing': <DataGridColumnResizingVariantDemo />,
  'data-grid-default': <DataGridDefaultVariantDemo />,
  'data-grid-drag-and-drop': <DataGridDragAndDropVariantDemo />,
  'data-grid-editable-cells': <DataGridEditableCellsVariantDemo />,
  'data-grid-empty-state': <DataGridEmptyStateVariantDemo />,
  'data-grid-expandable-rows': <DataGridExpandableRowsVariantDemo />,
  'data-grid-pinned-columns': <DataGridPinnedColumnsVariantDemo />,
  'data-grid-row-selection': <DataGridRowSelectionVariantDemo />,
  'data-grid-servers': <DataGridServersVariantDemo />,
  'data-grid-sorting': <DataGridSortingVariantDemo />,
  'data-grid-team-members': <DataGridTeamMembersVariantDemo />,
  'data-grid-users': <DataGridUsersVariantDemo />,
  'data-grid-virtualized': <DataGridVirtualizedVariantDemo />,
  'empty-state-default': <EmptyStateVariantDemo variant="default" />,
  'empty-state-full-height': <EmptyStateVariantDemo variant="full-height" />,
  'empty-state-minimal': <EmptyStateVariantDemo variant="minimal" />,
  'empty-state-outline': <EmptyStateVariantDemo variant="outline" />,
  'empty-state-sizes': <EmptyStateVariantDemo variant="sizes" />,
  'empty-state-with-avatar': <EmptyStateVariantDemo variant="with-avatar" />,
  'empty-state-with-avatar-group': <EmptyStateVariantDemo variant="with-avatar-group" />,
  'empty-state-with-background': <EmptyStateVariantDemo variant="with-background" />,
  'file-tree-custom-indicator': <FileTreeVariantDemo variant="custom-indicator" />,
  'file-tree-default': <FileTreeVariantDemo variant="default" />,
  'file-tree-drag-and-drop': <FileTreeVariantDemo variant="drag-and-drop" />,
  'file-tree-dynamic-collection': <FileTreeVariantDemo variant="dynamic-collection" />,
  'file-tree-guide-lines': <FileTreeVariantDemo variant="guide-lines" />,
  'file-tree-multiple-selection': <FileTreeVariantDemo variant="multiple-selection" />,
  'file-tree-pr-file-review': <FileTreeVariantDemo variant="pr-file-review" />,
  'file-tree-reduced-motion': <FileTreeVariantDemo variant="reduced-motion" />,
  'file-tree-sizes': <FileTreeVariantDemo variant="sizes" />,
  'file-tree-with-icons': <FileTreeVariantDemo variant="with-icons" />,
  'floating-toc-controlled': <FloatingTocVariantDemo variant="controlled" />,
  'floating-toc-custom-delays': <FloatingTocVariantDemo variant="custom-delays" />,
  'floating-toc-default': <FloatingTocVariantDemo variant="default" />,
  'floating-toc-hierarchical': <FloatingTocVariantDemo variant="hierarchical" />,
  'floating-toc-in-page-context': <FloatingTocVariantDemo variant="in-page-context" />,
  'floating-toc-left-aligned-bars': <FloatingTocVariantDemo variant="left-aligned-bars" />,
  'floating-toc-left-placement': <FloatingTocVariantDemo variant="left-placement" />,
  'floating-toc-press-mode': <FloatingTocVariantDemo variant="press-mode" />,
  'floating-toc-press-mode-in-page': <FloatingTocVariantDemo variant="press-mode-in-page" />,
  'floating-toc-virtualized': <FloatingTocVariantDemo variant="virtualized" />,
  'hover-card-controlled': <HoverCardVariantDemo variant="controlled" />,
  'hover-card-custom-delays': <HoverCardVariantDemo variant="custom-delays" />,
  'hover-card-default': <HoverCardVariantDemo variant="default" />,
  'hover-card-placements': <HoverCardVariantDemo variant="placements" />,
  'hover-card-with-arrow': <HoverCardVariantDemo variant="with-arrow" />,
  'hover-card-with-image': <HoverCardVariantDemo variant="with-image" />,
  'kanban-default': <KanbanDefaultVariantDemo />,
  'kanban-notion-board': <KanbanNotionVariantDemo />,
  'kanban-project-board': <KanbanProjectBoardVariantDemo />,
  'kanban-sizes': <KanbanSizesVariantDemo />,
  'item-card-default': <ItemCardVariantDemo variant="default" />,
  'item-card-device-list': <ItemCardVariantDemo variant="device-list" />,
  'item-card-email-setting': <ItemCardVariantDemo variant="email-setting" />,
  'item-card-pressable': <ItemCardVariantDemo variant="pressable" />,
  'item-card-title-only': <ItemCardVariantDemo variant="title-only" />,
  'item-card-variants': <ItemCardVariantDemo variant="variants" />,
  'item-card-vertical-stack': <ItemCardVariantDemo variant="vertical-stack" />,
  'item-card-wallet-card': <ItemCardVariantDemo variant="wallet-card" />,
  'item-card-with-multi-select': <ItemCardVariantDemo variant="with-multi-select" />,
  'item-card-with-select': <ItemCardVariantDemo variant="with-select" />,
  'item-card-with-switch': <ItemCardVariantDemo variant="with-switch" />,
  'item-card-without-icon': <ItemCardVariantDemo variant="without-icon" />,
  'item-card-group-developer-settings': <ItemCardGroupVariantDemo variant="developer-settings" />,
  'item-card-group-grid': <ItemCardGroupVariantDemo variant="grid" />,
  'item-card-group-grid-three-columns': <ItemCardGroupVariantDemo variant="grid-three-columns" />,
  'item-card-group-linked-accounts': <ItemCardGroupVariantDemo variant="linked-accounts" />,
  'item-card-group-list': <ItemCardGroupVariantDemo variant="list" />,
  'item-card-group-multiple-sections': <ItemCardGroupVariantDemo variant="multiple-sections" />,
  'item-card-group-notification-preferences': <ItemCardGroupVariantDemo variant="notification-preferences" />,
  'item-card-group-permission-levels': <ItemCardGroupVariantDemo variant="permission-levels" />,
  'item-card-group-pressable': <ItemCardGroupVariantDemo variant="pressable" />,
  'item-card-group-variants': <ItemCardGroupVariantDemo variant="variants" />,
  'item-card-group-wallet-list': <ItemCardGroupVariantDemo variant="wallet-list" />,
  'item-card-group-with-header': <ItemCardGroupVariantDemo variant="with-header" />,
  'kpi-default': <KpiVariantDemo variant="default" />,
  'kpi-with-actions': <KpiVariantDemo variant="with-actions" />,
  'kpi-with-chart-bottom': <KpiVariantDemo variant="with-chart-bottom" />,
  'kpi-with-chart-inline': <KpiVariantDemo variant="with-chart-inline" />,
  'kpi-with-footer': <KpiVariantDemo variant="with-footer" />,
  'kpi-with-icon': <KpiVariantDemo variant="with-icon" />,
  'kpi-with-progress': <KpiVariantDemo variant="with-progress" />,
  'kpi-group-horizontal': <KpiGroupVariantDemo variant="horizontal" />,
  'kpi-group-vertical': <KpiGroupVariantDemo variant="vertical" />,
  'kpi-group-with-from-suffix': <KpiGroupVariantDemo variant="with-from-suffix" />,
  'list-view-default': <ListViewVariantDemo variant="default" />,
  'list-view-disabled-items': <ListViewVariantDemo variant="disabled-items" />,
  'list-view-secondary': <ListViewVariantDemo variant="secondary" />,
  'list-view-selection-modes': <ListViewVariantDemo variant="selection-modes" />,
  'list-view-with-actions': <ListViewVariantDemo variant="with-actions" />,
  'timeline-centered-milestones': <TimelineVariantDemo variant="centered-milestones" />,
  'timeline-compact-log': <TimelineVariantDemo variant="compact-log" />,
  'timeline-default': <TimelineVariantDemo variant="default" />,
  'timeline-incident-response': <TimelineVariantDemo variant="incident-response" />,
  'timeline-repository-activity': <TimelineVariantDemo variant="repository-activity" />,
  'timeline-split-content': <TimelineVariantDemo variant="split-content" />,
  'timeline-studio-review': <TimelineVariantDemo variant="studio-review" />,
  'timeline-version-history': <TimelineVariantDemo variant="version-history" />,
  'widget-dashboard-grid': <WidgetVariantDemo variant="dashboard-grid" />,
  'widget-default': <WidgetVariantDemo variant="default" />,
  'widget-usage-summary': <WidgetVariantDemo variant="usage-summary" />,
  'widget-with-bar-chart': <WidgetVariantDemo variant="with-bar-chart" />,
  'widget-with-kpis': <WidgetVariantDemo variant="with-kpis" />,
  'widget-with-line-chart': <WidgetVariantDemo variant="with-line-chart" />,
  'widget-with-pie-chart': <WidgetVariantDemo variant="with-pie-chart" />,
  'widget-with-table': <WidgetVariantDemo variant="with-table" />,
  'chart-tooltip-auto-content': <ChartTooltipVariantDemo variant="auto-content" />,
  'chart-tooltip-chart-colors': <ChartTooltipVariantDemo variant="chart-colors" />,
  'chart-tooltip-custom-formatters': <ChartTooltipVariantDemo variant="custom-formatters" />,
  'chart-tooltip-default': <ChartTooltipVariantDemo variant="default" />,
  'chart-tooltip-inactive': <ChartTooltipVariantDemo variant="inactive" />,
  'chart-tooltip-line-indicator': <ChartTooltipVariantDemo variant="line-indicator" />,
  'chart-tooltip-no-header': <ChartTooltipVariantDemo variant="no-header" />,
};
