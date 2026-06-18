import { useCallback, useState, type ReactNode } from 'react';
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
        <Kpi.Value>1,286</Kpi.Value>
        <Kpi.Trend>
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
    <KpiGroup orientation="horizontal" style={{ width: 640 }}>
      <Kpi>
        <Kpi.Header>
          <Kpi.Title>今日新增学员</Kpi.Title>
        </Kpi.Header>
        <Kpi.Content>
          <Kpi.Value>328</Kpi.Value>
          <Kpi.Trend>
            <Chip color="success" size="sm">
              +8.2%
            </Chip>
          </Kpi.Trend>
        </Kpi.Content>
      </Kpi>
      <KpiGroup.Separator />
      <Kpi>
        <Kpi.Header>
          <Kpi.Title>课程续费率</Kpi.Title>
        </Kpi.Header>
        <Kpi.Content>
          <Kpi.Value>76.5%</Kpi.Value>
          <Kpi.Trend>
            <Chip color="danger" size="sm">
              -1.3%
            </Chip>
          </Kpi.Trend>
        </Kpi.Content>
      </Kpi>
      <KpiGroup.Separator />
      <Kpi>
        <Kpi.Header>
          <Kpi.Title>待处理订单</Kpi.Title>
        </Kpi.Header>
        <Kpi.Content>
          <Kpi.Value>47</Kpi.Value>
        </Kpi.Content>
      </Kpi>
    </KpiGroup>
    <KpiGroup orientation="vertical" style={{ width: 280 }}>
      <Kpi>
        <Kpi.Header>
          <Kpi.Title>本月完课率</Kpi.Title>
        </Kpi.Header>
        <Kpi.Content>
          <Kpi.Value>91.2%</Kpi.Value>
          <Kpi.Trend>
            <Chip color="success" size="sm">
              +3.4%
            </Chip>
          </Kpi.Trend>
        </Kpi.Content>
      </Kpi>
      <KpiGroup.Separator />
      <Kpi>
        <Kpi.Header>
          <Kpi.Title>平均学习时长</Kpi.Title>
        </Kpi.Header>
        <Kpi.Content>
          <Kpi.Value>42 分钟</Kpi.Value>
        </Kpi.Content>
      </Kpi>
    </KpiGroup>
  </DemoSection>
);

const ItemCardDemo = () => {
  const [message, setMessage] = useState('尚未打开课程');
  const handleView = () => setMessage('已打开：雅思核心词汇 · 第 3 期');

  return (
    <DemoSection isColumn>
      <ItemCard style={{ width: 360 }}>
        <ItemCard.Icon>
          <BookIcon />
        </ItemCard.Icon>
        <ItemCard.Content>
          <ItemCard.Title>雅思核心词汇 · 第 3 期</ItemCard.Title>
          <ItemCard.Description>已报名 86 人 · 开课时间 6 月 20 日</ItemCard.Description>
        </ItemCard.Content>
        <ItemCard.Action>
          <Button size="sm" variant="outline" onClick={handleView}>
            查看
          </Button>
        </ItemCard.Action>
      </ItemCard>
      <ItemCard variant="outline" style={{ width: 360 }}>
        <ItemCard.Icon>
          <FileIcon />
        </ItemCard.Icon>
        <ItemCard.Content>
          <ItemCard.Title>四级真题精讲营</ItemCard.Title>
          <ItemCard.Description>已报名 132 人 · 进行中</ItemCard.Description>
        </ItemCard.Content>
      </ItemCard>
      <span style={{ fontSize: 13, color: 'var(--foreground)' }}>{message}</span>
    </DemoSection>
  );
};

const ItemCardGroupDemo = () => (
  <DemoSection isColumn>
    <ItemCardGroup layout="list" style={{ width: 400 }}>
      <ItemCardGroup.Header>
        <ItemCardGroup.Title>本月热门课程</ItemCardGroup.Title>
        <ItemCardGroup.Description>按报名人数排序</ItemCardGroup.Description>
      </ItemCardGroup.Header>
      <ItemCard>
        <ItemCard.Icon>
          <BookIcon />
        </ItemCard.Icon>
        <ItemCard.Content>
          <ItemCard.Title>考研英语冲刺班</ItemCard.Title>
          <ItemCard.Description>报名 412 人</ItemCard.Description>
        </ItemCard.Content>
        <ItemCard.Action>
          <Badge color="accent">1</Badge>
        </ItemCard.Action>
      </ItemCard>
      <ItemCard>
        <ItemCard.Icon>
          <BookIcon />
        </ItemCard.Icon>
        <ItemCard.Content>
          <ItemCard.Title>商务英语口语营</ItemCard.Title>
          <ItemCard.Description>报名 298 人</ItemCard.Description>
        </ItemCard.Content>
        <ItemCard.Action>
          <Badge>2</Badge>
        </ItemCard.Action>
      </ItemCard>
    </ItemCardGroup>
  </DemoSection>
);

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

const LIST_VIEW_FILES = [
  { id: '1', name: 'Project proposal.pdf', size: '2.4 MB' },
  { id: '2', name: 'Q4 financial report.xlsx', size: '1.8 MB' },
  { id: '3', name: 'Design assets.zip', size: '24 MB' },
  { id: '4', name: 'Meeting notes.docx', size: '356 KB' },
  { id: '5', name: 'Customer interviews.mp4', size: '512 MB' },
];

const summarizeNames = (names: string[]) => {
  if (names.length === 0) {
    return '未选择文件';
  }
  if (names.length <= 2) {
    return names.join('、');
  }
  return `${names.slice(0, 2).join('、')} 等 ${names.length} 个文件`;
};

/** 参考「With Action Bar」联动：多选行 → ActionBar 浮出，清除按钮收起 */
const ListViewDemo = () => {
  const [files, setFiles] = useState(LIST_VIEW_FILES);
  const [selected, setSelected] = useState<DemoSelection>(new Set());
  const [actionMessage, setActionMessage] = useState('选择文件后可批量下载、移动或删除');
  const [studentMessage, setStudentMessage] = useState('默认选中李子轩，陈雨桐不可选');
  const count = selected === 'all' ? files.length : selected.size;
  const selectedNames =
    selected === 'all'
      ? files.map((file) => file.name)
      : files.filter((file) => selected.has(file.id)).map((file) => file.name);

  const handleAction = (action: string) => {
    setActionMessage(`已${action}：${summarizeNames(selectedNames)}`);
  };

  const handleDelete = () => {
    const ids = selected === 'all' ? new Set(files.map((file) => file.id)) : selected;
    setFiles((current) => current.filter((file) => !ids.has(file.id)));
    setSelected(new Set());
    setActionMessage(`已删除：${summarizeNames(selectedNames)}`);
  };

  const handleClear = () => {
    setSelected(new Set());
    setActionMessage('已清除选择');
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
                <FileIcon />
                <div>
                  <ListView.Title>{file.name}</ListView.Title>
                  <ListView.Description>{file.size}</ListView.Description>
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
            <ActionBar.Label>已选择</ActionBar.Label>
          </ActionBar.Prefix>
          <Separator orientation="vertical" />
          <ActionBar.Content>
            <Button size="sm" variant="ghost" onClick={() => handleAction('下载')}>
              下载
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleAction('移动')}>
              移动
            </Button>
            <Button size="sm" variant="danger-soft" onClick={handleDelete}>
              删除
            </Button>
          </ActionBar.Content>
          <Separator orientation="vertical" />
          <ActionBar.Suffix>
            <Tooltip content="清除选择" placement="top">
              <Button
                aria-label="清除选择"
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
          aria-label="Students"
          defaultSelectedKeys={['s2']}
          disabledKeys={['s3']}
          selectionMode="single"
          style={{ width: 380 }}
          variant="secondary"
        >
          <ListView.Item id="s1" textValue="王晓萌">
            <ListView.ItemContent>
              <div>
                <ListView.Title>王晓萌</ListView.Title>
                <ListView.Description>雅思 7 分计划 · 第 12 天</ListView.Description>
              </div>
            </ListView.ItemContent>
            <ListView.ItemAction>
              <Button
                size="sm"
                variant="ghost"
                onClick={(event) => {
                  event.stopPropagation();
                  setStudentMessage('已安排王晓萌的辅导跟进');
                }}
              >
                辅导
              </Button>
            </ListView.ItemAction>
          </ListView.Item>
          <ListView.Item id="s2" textValue="李子轩">
            <ListView.ItemContent>
              <div>
                <ListView.Title>李子轩</ListView.Title>
                <ListView.Description>考研词汇 · 第 45 天</ListView.Description>
              </div>
            </ListView.ItemContent>
            <ListView.ItemAction>
              <Button
                size="sm"
                variant="ghost"
                onClick={(event) => {
                  event.stopPropagation();
                  setStudentMessage('已安排李子轩的辅导跟进');
                }}
              >
                辅导
              </Button>
            </ListView.ItemAction>
          </ListView.Item>
          <ListView.Item id="s3" textValue="陈雨桐">
            <ListView.ItemContent>
              <div>
                <ListView.Title>陈雨桐</ListView.Title>
                <ListView.Description>四级冲刺 · 第 8 天</ListView.Description>
              </div>
            </ListView.ItemContent>
          </ListView.Item>
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
      <EmptyState size="md" style={{ width: 320 }}>
        <EmptyState.Header>
          <EmptyState.Media variant="icon">
            <FileIcon />
          </EmptyState.Media>
          <EmptyState.Title>暂无待审核内容</EmptyState.Title>
          <EmptyState.Description>新提交的课程内容会出现在这里</EmptyState.Description>
        </EmptyState.Header>
        <EmptyState.Content>
          <Button size="sm" variant="secondary" onClick={handleRefresh}>
            刷新列表
          </Button>
        </EmptyState.Content>
      </EmptyState>
      <span style={{ fontSize: 13, color: 'var(--foreground)' }}>
        已刷新 {refreshCount} 次
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
    selectedKeys === 'all' ? '全部' : ([...selectedKeys].map(String).join('、') || '（未选择）');

  return (
    <DemoSection isColumn>
      <div style={{ width: 320 }}>
        <FileTree
          aria-label="课程资料"
          selectionMode="single"
          expandedKeys={expandedKeys}
          onExpandedChange={handleExpandedChange}
          selectedKeys={selectedKeys}
          onSelectionChange={handleSelectionChange}
        >
          <FileTree.Item id="course" title="课程资料" icon={<FolderIcon />}>
            <FileTree.Item id="ielts" title="雅思" icon={<FolderIcon />}>
              <FileTree.Item id="ielts-words" title="核心词汇表.xlsx" icon={<FileIcon />} />
              <FileTree.Item id="ielts-listening" title="听力素材清单.docx" icon={<FileIcon />} />
            </FileTree.Item>
            <FileTree.Item id="cet4" title="四级真题合集.pdf" icon={<FileIcon />} />
          </FileTree.Item>
          <FileTree.Item id="ops" title="运营物料" icon={<FolderIcon />}>
            <FileTree.Item id="poster" title="暑期活动海报.png" icon={<FileIcon />} />
          </FileTree.Item>
        </FileTree>
      </div>
      <div style={{ fontSize: 13, color: 'var(--foreground)' }}>
        当前选中：{selectedLabel}（已展开 {expandedKeys.size} 个目录）
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
  { id: 't1', title: '学员「王晓萌」连续 3 天未打卡', status: 'todo', priority: 'high' },
  { id: 't2', title: '订单 #20260611 申请退费待审核', status: 'todo', priority: 'normal' },
  { id: 't3', title: '雅思口语班课件待补充', status: 'todo', priority: 'low' },
  { id: 't4', title: '考研班排课冲突，与教务沟通中', status: 'doing', priority: 'high' },
  { id: 't5', title: '暑期活动海报终稿设计', status: 'doing', priority: 'normal' },
  { id: 't6', title: '六月续费名单已导出', status: 'done', priority: 'low' },
];

const KANBAN_COLUMNS: { id: string; title: string; color: string }[] = [
  { id: 'todo', title: '待跟进', color: 'var(--warning)' },
  { id: 'doing', title: '处理中', color: 'var(--accent)' },
  { id: 'done', title: '已完成', color: 'var(--success)' },
];

const KANBAN_PRIORITY: Record<KanbanTask['priority'], { label: string; color: 'danger' | 'warning' | 'success' }> = {
  high: { label: '高优', color: 'danger' },
  normal: { label: '常规', color: 'warning' },
  low: { label: '低优', color: 'success' },
};

const getKanbanColumn = (task: KanbanTask) => task.status;
const setKanbanColumn = (task: KanbanTask, column: string): KanbanTask => ({
  ...task,
  status: column,
});

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
          {(task: KanbanTask) => (
            <Kanban.Card id={task.id} textValue={task.title}>
              <Kanban.CardContent>
                <span style={{ fontWeight: 600, lineHeight: 1.4 }}>{task.title}</span>
                <Chip size="sm" color={KANBAN_PRIORITY[task.priority].color}>
                  {KANBAN_PRIORITY[task.priority].label}
                </Chip>
              </Kanban.CardContent>
            </Kanban.Card>
          )}
        </Kanban.CardList>
      </Kanban.ColumnBody>
    </Kanban.Column>
  );
};

const renderKanbanEmpty = () => <Kanban.Empty>拖拽卡片到此</Kanban.Empty>;

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
      title: `新跟进事项 #${nextTaskIndex}`,
      status: 'todo',
      priority: 'normal',
    });
    setNextTaskIndex((value) => value + 1);
  };

  const distribution = KANBAN_COLUMNS.map(
    (column) => `${column.title} ${kanban.list.items.filter((task) => task.status === column.id).length}`,
  ).join(' · ');

  return (
    <DemoSection isColumn label="多列 · 拖拽换列 / 列内排序 / 新增任务（回显各列数量）">
      <Kanban size="sm" style={{ width: 820 }}>
        {KANBAN_COLUMNS.map((column) => (
          <KanbanColumnView
            key={column.id}
            kanban={kanban}
            column={column}
            actions={
              column.id === 'todo' ? (
                <Button size="sm" variant="ghost" onClick={handleAddTask}>
                  新增
                </Button>
              ) : undefined
            }
          />
        ))}
      </Kanban>
      <div style={{ fontSize: 13, color: 'var(--foreground)' }}>当前分布：{distribution}</div>
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
  { id: '20260612001', student: '王晓萌', course: '雅思 7 分计划', amount: 3980, status: '已支付' },
  { id: '20260612002', student: '李子轩', course: '考研英语冲刺班', amount: 2680, status: '待支付' },
  { id: '20260612003', student: '陈雨桐', course: '四级真题精讲营', amount: 1280, status: '已退款' },
  { id: '20260612004', student: '赵梓涵', course: '商务英语口语营', amount: 4680, status: '已支付' },
];

const renderOrderStatus = (row: OrderRow) => {
  const color = row.status === '已支付' ? 'success' : row.status === '待支付' ? 'warning' : 'danger';
  return (
    <Chip size="sm" color={color}>
      {row.status}
    </Chip>
  );
};

const renderOrderAmount = (row: OrderRow) => `¥${row.amount.toLocaleString('zh-CN')}`;

const ORDER_COLUMNS: DataGridColumn<OrderRow>[] = [
  { id: 'id', header: '订单号', accessorKey: 'id', isRowHeader: true, width: 150 },
  { id: 'student', header: '学员', accessorKey: 'student', allowsSorting: true, width: 100 },
  { id: 'course', header: '课程', accessorKey: 'course' },
  { id: 'amount', header: '金额', accessorKey: 'amount', allowsSorting: true, align: 'end', cell: renderOrderAmount },
  { id: 'status', header: '状态', accessorKey: 'status', cell: renderOrderStatus },
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
  const [rowMessage, setRowMessage] = useState('双击行或按 Enter 可打开订单');

  // 受控排序：调用方据 descriptor 自行重排数据（服务端排序的本地等价）
  const rows = sortOrderRows(ORDER_ROWS, sortDescriptor);

  const selectedLabel =
    selectedKeys === 'all' ? '全部' : [...selectedKeys].map(String).join('、') || '（未选择）';
  const sortLabel = `${String(sortDescriptor.column)}（${
    sortDescriptor.direction === 'ascending' ? '升序' : '降序'
  }）`;

  return (
    <DemoSection isColumn label="受控/非受控排序（点列头切换 aria-sort）+ 多选回显">
      <div style={{ width: 720 }}>
        <DataGrid
          aria-label="订单"
          columns={ORDER_COLUMNS}
          data={rows}
          getRowId={orderRowId}
          selectionMode="multiple"
          showSelectionCheckboxes
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
          sortDescriptor={sortDescriptor}
          onSortChange={setSortDescriptor}
          onRowAction={(key) => setRowMessage(`已打开订单 ${String(key)}`)}
        />
      </div>
      <div style={{ fontSize: 13, color: 'var(--foreground)' }}>
        排序：{sortLabel} · 已选：{selectedLabel} · {rowMessage}
      </div>
      <div style={{ width: 720 }}>
        <DataGrid
          aria-label="默认排序订单"
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
    id: 'summer',
    title: '暑期班招生海报',
    meta: '投放中 · 328 条线索',
    accent: 'var(--accent)',
    secondary: 'var(--success)',
    stats: ['转化 +18%', '预算 62%'],
  },
  {
    id: 'teacher-day',
    title: '教师节活动物料',
    meta: '待发布 · 9 张素材',
    accent: 'var(--warning)',
    secondary: 'var(--accent)',
    stats: ['预约 126', '完稿 7/9'],
  },
  {
    id: 'app-launch',
    title: '新版 App 上线公告',
    meta: '灰度中 · 4 个渠道',
    accent: 'var(--success)',
    secondary: 'var(--danger)',
    stats: ['打开率 42%', '反馈 31'],
  },
];

const CarouselDemo = () => (
  <DemoSection isColumn>
    <Carousel aria-label="运营物料轮播" style={{ width: 420 }}>
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
  { key: 'overview', label: '运营概览', level: 1 },
  { key: 'students', label: '学员数据', level: 2 },
  { key: 'orders', label: '订单数据', level: 2 },
  { key: 'courses', label: '课程安排', level: 1 },
  { key: 'faq', label: '常见问题', level: 1 },
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
    <DemoSection label="hover 展开 · 点击高亮当前章节">
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
  <DemoSection label="hover 触发（300ms 打开 / 200ms 关闭）· 含箭头">
    <p style={{ margin: 0, fontSize: 14, lineHeight: '32px' }}>
      本周之星：
      <HoverCard openDelay={300} closeDelay={200}>
        <HoverCard.Trigger>
          <Chip color="accent">学员：王晓萌</Chip>
        </HoverCard.Trigger>
        <HoverCard.Content placement="bottom">
          <HoverCard.Arrow />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 200 }}>
            <strong style={{ fontSize: 14 }}>王晓萌</strong>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>
              雅思 7 分计划 · 学习第 12 天
            </span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>带班老师：周老师</span>
          </div>
        </HoverCard.Content>
      </HoverCard>
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
  const [message, setMessage] = useState('点击事件选中；可拖拽移动并拖动底部调整时长。');
  const now = new Date();
  const isMonth = variant === 'month-view-features';
  const startHour = variant === 'current-time-indicator' ? Math.max(0, now.getHours() - 2) : 8;
  const endHour = variant === 'current-time-indicator' ? Math.min(24, now.getHours() + 3) : 18;

  const updateTimedEvent = useCallback((id: string, start: Date, end: Date) => {
    setEvents((current) =>
      current.map((event) => (event.id === id ? { ...event, start, end } : event)),
    );
    setMessage(`已更新 ${id}: ${start.toLocaleTimeString()} - ${end.toLocaleTimeString()}`);
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
      setMessage(`已创建事件 ${start.toLocaleTimeString()} - ${end.toLocaleTimeString()}`);
    },
    onEventDelete: (id) => {
      setEvents((current) => current.filter((event) => event.id !== id));
      setMessage(`已删除事件 ${id}`);
    },
    onEventSelect: (id) => setMessage(id === null ? '未选中事件' : `已选中事件 ${id}`),
  });

  return (
    <DemoSection isColumn label={variant}>
      <AgendaCanvas agenda={agenda} monthMaxEvents={variant === 'month-view-features' ? 1 : 2} />
      <span style={demoMutedStyle}>
        {variant === 'current-time-indicator'
          ? '当前时间线每分钟刷新；今日列高亮。'
          : variant === 'weekend-highlighting'
            ? '周末列和月视图周末单元格输出 data-weekend。'
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

const CompletionDonut = ({ value, label }: { value: number; label: string }) => {
  const boundedValue = Math.max(0, Math.min(value, 100));
  const data = [
    { name: label, value: boundedValue, fill: 'var(--accent)' },
    { name: '未完成', value: 100 - boundedValue, fill: 'var(--surface-secondary)' },
  ];

  return (
    <div aria-label={`${label} ${boundedValue}%`} style={{ position: 'relative', width: 96, height: 96 }}>
      <PieChart data={data} height={96} width={96}>
        <PieChart.Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={31}
          outerRadius={48}
          startAngle={90}
          endAngle={-270}
          stroke="var(--surface)"
          isAnimationActive={false}
        >
          {data.map((entry) => (
            <PieChart.Cell key={entry.name} fill={entry.fill} />
          ))}
        </PieChart.Pie>
        <PieChart.Tooltip cursor={false} content={<PieChart.TooltipContent />} />
      </PieChart>
      <span
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          color: 'var(--foreground)',
          fontSize: 14,
          fontWeight: 700,
          pointerEvents: 'none',
        }}
      >
        {boundedValue}%
      </span>
    </div>
  );
};

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
  { id: 'c1', name: '雅思 7 分计划', owner: '王晓萌', progress: 86 },
  { id: 'c2', name: '考研英语冲刺班', owner: '李子轩', progress: 64 },
  { id: 'c3', name: '商务英语口语营', owner: '赵梓涵', progress: 42 },
];

type StudentRow = {
  id: string;
  name: string;
  group: string;
  active: string;
  score: number;
};

const STUDENT_ROWS: StudentRow[] = [
  { id: 'u1', name: '王晓萌', group: '雅思 7 分计划', active: '今天', score: 92 },
  { id: 'u2', name: '李子轩', group: '考研英语冲刺班', active: '昨天', score: 86 },
  { id: 'u3', name: '陈雨桐', group: '四级真题精讲营', active: '3 天前', score: 74 },
  { id: 'u4', name: '赵梓涵', group: '商务英语口语营', active: '今天', score: 88 },
];

const STUDENT_COLUMNS: DataGridColumn<StudentRow>[] = [
  { id: 'name', header: '学员', accessorKey: 'name', isRowHeader: true, allowsSorting: true },
  { id: 'group', header: '课程', accessorKey: 'group', width: 180 },
  { id: 'active', header: '最近学习', accessorKey: 'active', width: 110 },
  { id: 'score', header: '掌握度', accessorKey: 'score', allowsSorting: true, align: 'end' },
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
  { id: 'name', header: '课程', accessorKey: 'name', isRowHeader: true },
  { id: 'owner', header: '负责人', accessorKey: 'owner', width: 120 },
  {
    id: 'progress',
    header: '进度',
    accessorKey: 'progress',
    width: 160,
    cell: (row) => (
      <ProgressBar
        aria-label={`${row.name} 进度`}
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
  const [action, setAction] = useState('等待操作');

  return (
    <DemoSection isColumn label="default · controlled visibility">
      <Button size="sm" variant="secondary" onClick={() => setOpen((value) => !value)}>
        {open ? '收起操作条' : '显示操作条'}
      </Button>
      <ActionBar isOpen={open}>
        <ActionBar.Prefix>
          <Badge color="accent">3</Badge>
          <ActionBar.Label>待处理课程</ActionBar.Label>
        </ActionBar.Prefix>
        <Separator orientation="vertical" />
        <ActionBar.Content>
          <Button size="sm" variant="ghost" onClick={() => setAction('已标记 3 门课程完成')}>
            标记完成
          </Button>
          <Button size="sm" variant="danger-soft" onClick={() => setAction('已忽略待处理课程')}>
            忽略
          </Button>
        </ActionBar.Content>
      </ActionBar>
      <span style={demoTextStyle}>{action}</span>
    </DemoSection>
  );
};

const ActionBarWithDataGridVariantDemo = () => {
  const [selectedKeys, setSelectedKeys] = useState<DemoSelection>(new Set(['20260612001']));
  const [action, setAction] = useState('选择订单后执行批量操作');
  const count = selectedKeys === 'all' ? ORDER_ROWS.length : selectedKeys.size;

  return (
    <DemoSection isColumn label="data grid selection drives action bar">
      <div style={{ width: 720 }}>
        <DataGrid
          aria-label="批量订单"
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
          <ActionBar.Label>已选择订单</ActionBar.Label>
        </ActionBar.Prefix>
        <Separator orientation="vertical" />
        <ActionBar.Content>
          <Button size="sm" variant="ghost" onClick={() => setAction(`已导出 ${count} 条订单`)}>
            导出
          </Button>
          <Button
            size="sm"
            variant="danger-soft"
            onClick={() => {
              setAction(`已批量关闭 ${count} 条订单`);
              setSelectedKeys(new Set());
            }}
          >
            批量关闭
          </Button>
        </ActionBar.Content>
      </ActionBar>
      <span style={demoTextStyle}>{action}</span>
    </DemoSection>
  );
};

const ActionBarResponsiveLabelsVariantDemo = () => {
  const [selectedKeys, setSelectedKeys] = useState<DemoSelection>(new Set(['20260612001', '20260612003']));
  const [action, setAction] = useState('已选择 2 条订单');
  const count = selectedKeys === 'all' ? ORDER_ROWS.length : selectedKeys.size;

  return (
    <DemoSection isColumn label="responsive labels">
      <div style={{ width: 560, maxWidth: '100%' }}>
        <DataGrid
          aria-label="响应式操作条订单"
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
          <ActionBar.Label>已选择订单</ActionBar.Label>
        </ActionBar.Prefix>
        <Separator orientation="vertical" />
        <ActionBar.Content>
          <Button size="sm" variant="ghost" aria-label="归档所选订单" onClick={() => setAction(`已归档 ${count} 条订单`)}>
            归档
          </Button>
          <Button size="sm" variant="ghost" aria-label="分配所选订单" onClick={() => setAction(`已分配 ${count} 条订单`)}>
            分配
          </Button>
          <Button
            size="sm"
            variant="danger-soft"
            aria-label="清除所选订单"
            onClick={() => {
              setAction('已清除选择');
              setSelectedKeys(new Set());
            }}
          >
            清除
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
  const [apiMessage, setApiMessage] = useState('尚未跳转');
  const [isPlaying, setIsPlaying] = useState(variant === 'autoplay');

  const isMultiple = variant === 'multiple-slides';
  const carouselType = variant === 'modal-type' ? 'modal' : 'in-place';
  const opts = variant === 'loop' || variant === 'autoplay' ? { loop: true } : undefined;

  const handleApiJump = () => {
    api?.scrollTo(2);
    setApiMessage('已跳到第 3 张');
  };

  return (
    <DemoSection isColumn label={variant}>
      <Carousel
        aria-label="课程运营轮播"
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
              <CarouselSlide meta={`${slide.meta} · 第 ${index + 1} 张`} title={slide.title} />
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
                    aria-label={`跳到第 ${index + 1} 张`}
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
            跳到第 3 张
          </Button>
          <span style={demoTextStyle}>{apiMessage}</span>
        </>
      )}
      {variant === 'autoplay' && (
        <Switch isSelected={isPlaying} size="sm" onSelectedChange={setIsPlaying}>
          自动轮播
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
  const [message, setMessage] = useState('双击一行或按 Enter 打开交易详情');
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
          onRowAction={(key) => setMessage(`已打开交易 ${String(key)}`)}
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
  const [message, setMessage] = useState('拖动表头分隔线调整列宽');

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
        {isLoading ? '加载数据' : '显示加载态'}
      </Button>
      <div style={{ width: 720 }}>
        <DataGrid
          aria-label="异步学员"
          columns={STUDENT_COLUMNS}
          data={rows}
          getRowId={studentRowId}
          renderEmptyState={() => (
            <div className="data-grid__empty-state">
              {isLoading ? '正在加载学员数据…' : '暂无学员'}
            </div>
          )}
        />
      </div>
    </DemoSection>
  );
};

const DataGridBulkActionsVariantDemo = () => {
  const [selectedKeys, setSelectedKeys] = useState<DemoSelection>(new Set(['u1', 'u2']));
  const [action, setAction] = useState('选择学员后可执行批量操作');
  const count = selectedKeys === 'all' ? STUDENT_ROWS.length : selectedKeys.size;
  const handleAssignClass = () => setAction(`已将 ${count} 名学员加入冲刺班`);
  const handleNotify = () => setAction(`已向 ${count} 名学员发送通知`);

  return (
    <DemoSection isColumn label="bulk actions">
      <div style={{ width: 720 }}>
        <DataGrid
          aria-label="批量学员"
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
          <ActionBar.Label>已选学员</ActionBar.Label>
        </ActionBar.Prefix>
        <Separator orientation="vertical" />
        <ActionBar.Content>
          <Button size="sm" variant="ghost" onClick={handleAssignClass}>
            分班
          </Button>
          <Button size="sm" variant="ghost" onClick={handleNotify}>
            发通知
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
      header: '顺序',
      width: 56,
      accessorKey: 'order',
      align: 'end',
    },
    { id: 'name', header: '学员', accessorKey: 'name', isRowHeader: true },
    { id: 'group', header: '课程', accessorKey: 'group', width: 180 },
    { id: 'active', header: '最近学习', accessorKey: 'active', width: 110 },
    { id: 'score', header: '掌握度', accessorKey: 'score', align: 'end' },
  ];

  return (
    <DemoSection isColumn label="drag and drop row reorder">
      <div style={{ width: 760 }}>
        <DataGrid
          aria-label="可重排学员"
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
      <span style={demoTextStyle}>当前顺序：{rows.map((row) => row.name).join(' / ')}</span>
    </DemoSection>
  );
};

const DataGridEditableCellsVariantDemo = () => {
  const [rows, setRows] = useState(SIMPLE_COURSES);
  const [editMessage, setEditMessage] = useState('Enter 或失焦提交，Escape 取消。');

  const parseProgress = (value: string) => {
    const parsed = Number(value.trim().replace(/%$/, ''));

    if (!Number.isFinite(parsed)) {
      throw new Error('请输入 0-100 的数字');
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

    const label = columnId === 'progress' ? '掌握度' : columnId === 'owner' ? '负责人' : '课程';
    const displayValue = columnId === 'progress' ? `${String(value)}%` : String(value);
    setEditMessage(
      `已${reason === 'blur' ? '失焦' : '回车'}提交：${row.name} 的${label}为 ${displayValue}`,
    );
  };

  const columns: DataGridColumn<(typeof SIMPLE_COURSES)[number]>[] = [
    { id: 'name', header: '课程', accessorKey: 'name', isRowHeader: true, editable: true },
    { id: 'owner', header: '负责人', accessorKey: 'owner', editable: true },
    {
      id: 'progress',
      header: '掌握度',
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
          aria-label="可编辑课程"
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
        aria-label="空课程表"
        columns={COURSE_COLUMNS}
        data={[]}
        getRowId={courseRowId}
        renderEmptyState={() => (
          <div className="data-grid__empty-state">
            <EmptyState size="sm">
              <EmptyState.Header>
                <EmptyState.Title>暂无课程数据</EmptyState.Title>
                <EmptyState.Description>筛选条件下没有可展示的课程</EmptyState.Description>
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
  detail: `${course.owner} 正在跟进 ${course.progress}% 的课程节点。`,
}));

const DataGridExpandableRowsVariantDemo = () => {
  const [expandedKeys, setExpandedKeys] = useState<Set<DemoKey>>(new Set(['c1']));
  const columns: DataGridColumn<ExpandableCourse>[] = [
    {
      id: 'name',
      header: '课程',
      isRowHeader: true,
      accessorKey: 'name',
    },
    { id: 'owner', header: '负责人', accessorKey: 'owner', width: 120 },
    { id: 'progress', header: '进度', accessorKey: 'progress', align: 'end' },
  ];

  return (
    <DemoSection isColumn label="expandable rows">
      <div style={{ width: 680 }}>
        <DataGrid
          aria-label="展开课程表"
          columns={columns}
          data={EXPANDABLE_ROWS}
          expandedKeys={expandedKeys}
          getRowId={courseRowId}
          onExpandedChange={(keys) => setExpandedKeys(new Set(keys as Set<DemoKey>))}
          renderExpandedContent={(row) => (
            <div style={{ display: 'grid', gap: 6 }}>
              <strong>{row.name} 跟进说明</strong>
              <span style={demoMutedStyle}>{row.detail}</span>
              <ProgressBar
                aria-label={`${row.name} 展开行进度`}
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
          <Badge color="accent">固定</Badge>
          {row.id}
        </span>
      ),
    },
    ...ORDER_COLUMNS.slice(1),
    { id: 'teacher', header: '顾问', cell: (row) => (row.status === '已支付' ? '周老师' : '李老师'), width: 120 },
    { id: 'campus', header: '校区', cell: () => '线上', width: 120, pin: 'right' },
  ];

  return (
    <DemoSection isColumn label="pinned columns">
      <div style={{ width: 620 }}>
        <DataGrid
          aria-label="固定列订单"
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
      <span style={demoMutedStyle}>拖动列边界可调整宽度，固定列会持续保持可见。</span>
    </DemoSection>
  );
};

const SERVER_ROWS = [
  { id: 'srv-1', name: 'api-gateway', region: '华东', status: 'healthy', cpu: 48 },
  { id: 'srv-2', name: 'lesson-worker', region: '华北', status: 'warming', cpu: 72 },
  { id: 'srv-3', name: 'billing-sync', region: '华南', status: 'healthy', cpu: 35 },
];

type ServerRow = (typeof SERVER_ROWS)[number];

const SERVER_COLUMNS: DataGridColumn<ServerRow>[] = [
  { id: 'name', header: '服务', accessorKey: 'name', isRowHeader: true, allowsSorting: true },
  { id: 'region', header: '区域', accessorKey: 'region', width: 100 },
  {
    id: 'status',
    header: '状态',
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
        aria-label="服务状态"
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
        aria-label="团队成员"
        columns={[
          {
            id: 'name',
            header: '成员',
            isRowHeader: true,
            cell: (row: StudentRow) => (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Avatar fallback={row.name.slice(0, 1)} size="sm" />
                {row.name}
              </span>
            ),
          },
          { id: 'group', header: '负责课程', accessorKey: 'group' },
          { id: 'score', header: '满意度', accessorKey: 'score', align: 'end' },
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
        aria-label="用户列表"
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
  name: `学员 ${index + 1}`,
  group: index % 2 === 0 ? '雅思 7 分计划' : '考研英语冲刺班',
  active: index % 3 === 0 ? '今天' : '本周',
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
          aria-label="大数据学员窗口"
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
        可见窗口：{range.visibleStartIndex + 1}-{range.visibleEndIndex} / {range.total}
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

const EmptyStateVariantDemo = ({ variant }: { variant: EmptyStateVariant }) => {
  const [count, setCount] = useState(0);

  if (variant === 'sizes') {
    return (
      <DemoSection>
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <EmptyState key={size} size={size} style={{ width: 220 }}>
            <EmptyState.Header>
              <EmptyState.Media variant="icon">
                <FileIcon />
              </EmptyState.Media>
              <EmptyState.Title>{size.toUpperCase()} 空态</EmptyState.Title>
              <EmptyState.Description>尺寸对比</EmptyState.Description>
            </EmptyState.Header>
          </EmptyState>
        ))}
      </DemoSection>
    );
  }

  const showMedia = variant !== 'minimal';
  const style =
    variant === 'full-height'
      ? { width: 360, minHeight: 320 }
      : variant === 'outline'
        ? { width: 360, border: '1px dashed var(--border)', borderRadius: 8 }
        : variant === 'with-background'
          ? {
              width: 360,
              background: 'linear-gradient(135deg, var(--surface), var(--surface-secondary))',
              borderRadius: 8,
            }
          : { width: 360 };

  return (
    <DemoSection isColumn label={variant}>
      <EmptyState size={variant === 'minimal' ? 'sm' : 'md'} style={style}>
        <EmptyState.Header>
          {showMedia && (
            <EmptyState.Media variant="icon">
              {variant === 'with-avatar' ? (
                <Avatar fallback="王" color="accent" />
              ) : variant === 'with-avatar-group' ? (
                <span style={{ display: 'inline-flex', marginLeft: 12 }}>
                  <Avatar fallback="王" color="accent" size="sm" />
                  <Avatar fallback="李" color="success" size="sm" style={{ marginLeft: -8 }} />
                  <Avatar fallback="陈" color="warning" size="sm" style={{ marginLeft: -8 }} />
                </span>
              ) : (
                <FileIcon />
              )}
            </EmptyState.Media>
          )}
          <EmptyState.Title>暂无匹配课程</EmptyState.Title>
          <EmptyState.Description>
            {variant === 'minimal' ? '精简空态，只保留关键文案。' : '调整筛选条件或刷新列表后重试。'}
          </EmptyState.Description>
        </EmptyState.Header>
        {variant !== 'minimal' && (
          <EmptyState.Content>
            <Button size="sm" variant="secondary" onClick={() => setCount((value) => value + 1)}>
              刷新 {count}
            </Button>
          </EmptyState.Content>
        )}
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
    name: 'courses',
    type: 'folder',
    children: [
      { id: 'ielts-plan', name: 'ielts-plan.md', type: 'file', status: 'modified' },
      { id: 'cet4-paper', name: 'cet4-paper.pdf', type: 'file', status: 'added' },
    ],
  },
  {
    id: 'ops',
    name: 'operations',
    type: 'folder',
    children: [
      { id: 'poster', name: 'summer-poster.fig', type: 'file' },
      { id: 'brief', name: 'campaign-brief.docx', type: 'file', status: 'review' },
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
  const [query, setQuery] = useState('course');
  const [expandedKeys, setExpandedKeys] = useState<Set<DemoKey>>(new Set(['courses']));
  const tree = useFileTreeData<DemoFileNode>({
    initialItems: FILE_TREE_ITEMS,
    getKey: (item) => item.id,
    getChildren: (item) => item.children ?? [],
  });
  const drag = useFileTreeDrag({ tree });
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
            aria-label="自定义展开图标"
            expandedKeys={expandedKeys}
            onExpandedChange={setExpandedKeys}
          >
            <FileTree.Item id="courses" icon={<FolderIcon />} title="courses">
              <FileTree.Indicator>
                <span style={{ fontSize: 12 }}>{isCoursesOpen ? '-' : '+'}</span>
              </FileTree.Indicator>
              <FileTree.Item id="course-outline" icon={<FileIcon />} title="outline.md" />
            </FileTree.Item>
          </FileTree>
        </div>
      </DemoSection>
    );
  }

  if (variant === 'drag-and-drop') {
    return (
      <DemoSection isColumn label="drag and drop">
        <div style={{ width: 320 }}>
          <FileTree
            aria-label="可拖拽文件树"
            defaultExpandedKeys={['courses', 'ops']}
            dragAndDropHooks={drag.dragAndDropHooks}
            selectionMode="multiple"
          >
            {(tree.items as DemoTreeNode[]).map(renderTreeDataNode)}
          </FileTree>
        </div>
        <span style={demoMutedStyle}>把文件拖到目标目录即可调整归档位置。</span>
      </DemoSection>
    );
  }

  if (variant === 'dynamic-collection') {
    return (
      <DemoSection isColumn label="dynamic collection">
        <div style={{ display: 'flex', gap: 6 }}>
          {['course', 'poster', 'brief'].map((value) => (
            <Button key={value} size="sm" variant={query === value ? 'secondary' : 'ghost'} onClick={() => setQuery(value)}>
              {value}
            </Button>
          ))}
        </div>
        <div style={{ width: 320 }}>
          <FileTree
            aria-label="动态文件树"
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
          <FileTree aria-label="PR 文件评审" defaultExpandedKeys={['courses', 'ops']} selectionMode="multiple">
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
          aria-label="课程文件树"
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
    label: `章节 ${index + 1}`,
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
      <FloatingToc.Content>
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
          <strong>课程运营报告</strong>
          <p style={demoMutedStyle}>右侧目录会跟随当前章节同步高亮。</p>
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
          {open ? '关闭目录' : '打开目录'}
        </Button>
      )}
      <div style={{ padding: '8px 160px 8px 8px' }}>{toc}</div>
      <span style={demoTextStyle}>当前章节：{active}</span>
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
    {withImage && <CourseCover title="IELTS" />}
    <strong style={{ fontSize: 14 }}>王晓萌</strong>
    <span style={demoMutedStyle}>雅思 7 分计划 · 连续学习 12 天</span>
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
            <Chip color="accent">切换浮层方向</Chip>
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
          受控打开
        </Switch>
      )}
      <HoverCard
        closeDelay={variant === 'custom-delays' ? 700 : 300}
        open={variant === 'controlled' ? open : undefined}
        openDelay={variant === 'custom-delays' ? 0 : 300}
        defaultOpen={variant !== 'controlled'}
      >
        <HoverCard.Trigger>
          <Chip color="accent">学员档案</Chip>
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

  return (
    <DemoSection label="default kanban">
      <Kanban size="sm" style={{ width: 760 }}>
        {KANBAN_COLUMNS.map((column) => (
          <KanbanColumnView key={column.id} kanban={kanban} column={column} />
        ))}
      </Kanban>
    </DemoSection>
  );
};

const PROJECT_KANBAN_TASKS: KanbanTask[] = [
  { id: 'p1', title: '定义组件验收清单', status: 'todo', priority: 'high' },
  { id: 'p2', title: '补齐浏览器 smoke test', status: 'todo', priority: 'normal' },
  { id: 'p3', title: '实现变体级 demo resolver', status: 'doing', priority: 'high' },
  { id: 'p4', title: '发布 Vela UI beta', status: 'done', priority: 'low' },
];

const PROJECT_KANBAN_COLUMNS = [
  { id: 'todo', title: 'Backlog', color: 'var(--warning)' },
  { id: 'doing', title: 'In progress', color: 'var(--accent)' },
  { id: 'done', title: 'Shipped', color: 'var(--success)' },
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
          <Kanban.ColumnHeader indicatorColor="var(--accent)" title={`${size} 待办`} count={2} />
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
  const [message, setMessage] = useState('尚未选择');
  const [selectedCards, setSelectedCards] = useState<string[]>(['雅思 7 分计划']);
  const [enabled, setEnabled] = useState(true);

  if (variant === 'variants') {
    return (
      <DemoSection isColumn label="visual variants">
        {(['default', 'secondary', 'tertiary', 'outline', 'transparent'] as const).map((item) => (
          <ItemCard key={item} variant={item} style={{ width: 360 }}>
            <ItemCard.Icon>
              <BookIcon />
            </ItemCard.Icon>
            <ItemCard.Content>
              <ItemCard.Title>{item}</ItemCard.Title>
              <ItemCard.Description>课程卡片视觉层级</ItemCard.Description>
            </ItemCard.Content>
          </ItemCard>
        ))}
      </DemoSection>
    );
  }

  if (variant === 'with-multi-select') {
    const toggle = (name: string, selected: boolean) =>
      setSelectedCards((current) =>
        selected
          ? current.includes(name) ? current : [...current, name]
          : current.filter((item) => item !== name),
      );

    return (
      <DemoSection isColumn label="multi select">
        {SIMPLE_COURSES.map((course) => (
          <ItemCard
            key={course.id}
            isSelected={selectedCards.includes(course.name)}
            style={{ width: 400 }}
            onSelectedChange={(selected) => toggle(course.name, selected)}
          >
            <ItemCard.Icon>
              <BookIcon />
            </ItemCard.Icon>
            <ItemCard.Content>
              <ItemCard.Title>{course.name}</ItemCard.Title>
              <ItemCard.Description>{course.owner} · {course.progress}%</ItemCard.Description>
            </ItemCard.Content>
            <ItemCard.Action>
              <Checkbox
                aria-label={`选择 ${course.name}`}
                isSelected={selectedCards.includes(course.name)}
                onSelectedChange={(selected) => toggle(course.name, selected)}
              />
            </ItemCard.Action>
          </ItemCard>
        ))}
        <span style={demoTextStyle}>已选：{selectedCards.join('、') || '无'}</span>
      </DemoSection>
    );
  }

  if (variant === 'with-select') {
    return (
      <DemoSection isColumn label="single select">
        {SIMPLE_COURSES.map((course) => (
          <ItemCard
            key={course.id}
            isSelected={message === course.name}
            variant={message === course.name ? 'outline' : 'default'}
            style={{ width: 400 }}
            onSelectedChange={(selected) => {
              if (selected) setMessage(course.name);
            }}
          >
            <ItemCard.Icon>
              <BookIcon />
            </ItemCard.Icon>
            <ItemCard.Content>
              <ItemCard.Title>{course.name}</ItemCard.Title>
              <ItemCard.Description>点击切换当前课程</ItemCard.Description>
            </ItemCard.Content>
            <ItemCard.Action>
              <Chip color={message === course.name ? 'success' : 'default'} size="sm">
                {message === course.name ? '当前' : '选择'}
              </Chip>
            </ItemCard.Action>
          </ItemCard>
        ))}
        <span style={demoTextStyle}>当前：{message}</span>
      </DemoSection>
    );
  }

  if (variant === 'with-switch' || variant === 'email-setting') {
    return (
      <DemoSection isColumn label={variant}>
        <ItemCard style={{ width: 420 }}>
          <ItemCard.Icon>
            <FileIcon />
          </ItemCard.Icon>
          <ItemCard.Content>
            <ItemCard.Title>{variant === 'email-setting' ? '邮件学习报告' : '自动提醒'}</ItemCard.Title>
            <ItemCard.Description>
              {enabled ? '已开启，每日 20:00 发送' : '已关闭，暂停自动发送'}
            </ItemCard.Description>
          </ItemCard.Content>
          <ItemCard.Action>
            <Switch aria-label="切换提醒" isSelected={enabled} size="sm" onSelectedChange={setEnabled} />
          </ItemCard.Action>
        </ItemCard>
      </DemoSection>
    );
  }

  if (variant === 'pressable') {
    return (
      <DemoSection isColumn label="pressable">
        <ItemCard
          isPressable
          style={{ width: 380 }}
          onPress={() => setMessage('已打开课程详情')}
        >
          <ItemCard.Icon>
            <BookIcon />
          </ItemCard.Icon>
          <ItemCard.Content>
            <ItemCard.Title>雅思核心词汇</ItemCard.Title>
            <ItemCard.Description>整卡可点击</ItemCard.Description>
          </ItemCard.Content>
        </ItemCard>
        <span style={demoTextStyle}>{message}</span>
      </DemoSection>
    );
  }

  if (variant === 'device-list') {
    return (
      <DemoSection isColumn label="device list">
        {['iPhone 15', 'MacBook Air'].map((device, index) => (
          <ItemCard key={device} style={{ width: 380 }}>
            <ItemCard.Icon>
              <FileIcon />
            </ItemCard.Icon>
            <ItemCard.Content>
              <ItemCard.Title>{device}</ItemCard.Title>
              <ItemCard.Description>{index === 0 ? '当前设备' : '上次登录：昨天'}</ItemCard.Description>
            </ItemCard.Content>
            <ItemCard.Action>
              <Chip color={index === 0 ? 'success' : 'default'} size="sm">
                {index === 0 ? '在线' : '离线'}
              </Chip>
            </ItemCard.Action>
          </ItemCard>
        ))}
      </DemoSection>
    );
  }

  if (variant === 'wallet-card') {
    return (
      <DemoSection label="wallet card">
        <ItemCard variant="outline" style={{ width: 380 }}>
          <ItemCard.Icon>
            <Badge color="accent">¥</Badge>
          </ItemCard.Icon>
          <ItemCard.Content>
            <ItemCard.Title>课程余额</ItemCard.Title>
            <ItemCard.Description>可用课时 18 节 · 优惠券 3 张</ItemCard.Description>
          </ItemCard.Content>
          <ItemCard.Action>
            <strong>¥2,680</strong>
          </ItemCard.Action>
        </ItemCard>
      </DemoSection>
    );
  }

  return (
    <DemoSection label={variant}>
      <ItemCard style={{ width: variant === 'vertical-stack' ? 280 : 380 }}>
        {variant !== 'without-icon' && (
          <ItemCard.Icon>
            <BookIcon />
          </ItemCard.Icon>
        )}
        <ItemCard.Content
          style={
            variant === 'vertical-stack'
              ? { alignItems: 'flex-start', gap: 8 }
              : undefined
          }
        >
          <ItemCard.Title>
            {variant === 'title-only' ? '雅思核心词汇' : '雅思核心词汇 · 第 3 期'}
          </ItemCard.Title>
          {variant !== 'title-only' && (
            <ItemCard.Description>已报名 86 人 · 开课时间 6 月 20 日</ItemCard.Description>
          )}
        </ItemCard.Content>
        {variant === 'default' && (
          <ItemCard.Action>
            <Button size="sm" variant="outline" onClick={() => setMessage('已打开课程详情')}>
              查看
            </Button>
          </ItemCard.Action>
        )}
      </ItemCard>
      {variant === 'default' && <span style={demoTextStyle}>{message}</span>}
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

const GroupCourseCard = ({ name, meta }: { name: string; meta: string }) => (
  <ItemCard>
    <ItemCard.Icon>
      <BookIcon />
    </ItemCard.Icon>
    <ItemCard.Content>
      <ItemCard.Title>{name}</ItemCard.Title>
      <ItemCard.Description>{meta}</ItemCard.Description>
    </ItemCard.Content>
  </ItemCard>
);

const ItemCardGroupVariantDemo = ({ variant }: { variant: ItemCardGroupVariantKey }) => {
  const [pressed, setPressed] = useState('未点击');

  if (variant === 'variants') {
    return (
      <DemoSection isColumn label="group variants">
        {(['default', 'secondary', 'tertiary', 'outline', 'transparent'] as const).map((item) => (
          <ItemCardGroup key={item} layout="list" variant={item} style={{ width: 360 }}>
            <GroupCourseCard meta="视觉变体" name={item} />
          </ItemCardGroup>
        ))}
      </DemoSection>
    );
  }

  if (variant === 'multiple-sections') {
    return (
      <DemoSection isColumn label="multiple sections">
        {['热门课程', '待审核课程'].map((title) => (
          <ItemCardGroup key={title} layout="list" style={{ width: 420 }}>
            <ItemCardGroup.Header>
              <ItemCardGroup.Title>{title}</ItemCardGroup.Title>
            </ItemCardGroup.Header>
            <GroupCourseCard meta="本周更新" name="雅思核心词汇" />
            <GroupCourseCard meta="教研待确认" name="四级真题精讲" />
          </ItemCardGroup>
        ))}
      </DemoSection>
    );
  }

  const isGrid = variant === 'grid' || variant === 'grid-three-columns';
  const columns = variant === 'grid-three-columns' ? 3 : 2;
  const title =
    variant === 'linked-accounts'
      ? '已连接账号'
      : variant === 'wallet-list'
        ? '钱包列表'
        : variant === 'developer-settings'
          ? '开发者设置'
          : variant === 'notification-preferences'
            ? '通知偏好'
            : variant === 'permission-levels'
              ? '权限级别'
              : '课程分组';

  return (
    <DemoSection isColumn label={variant}>
      <ItemCardGroup
        columns={columns}
        isPressable={variant === 'pressable' ? true : undefined}
        layout={isGrid ? 'grid' : 'list'}
        style={{ width: isGrid ? 620 : 420 }}
        variant={variant === 'wallet-list' ? 'outline' : 'default'}
        onItemPress={
          variant === 'pressable'
            ? (key) => {
                const course = SIMPLE_COURSES.find((item) => item.id === key);
                setPressed(course?.name ?? String(key));
              }
            : undefined
        }
      >
        {(variant === 'with-header' || variant !== 'list') && (
          <ItemCardGroup.Header>
            <ItemCardGroup.Title>{title}</ItemCardGroup.Title>
            <ItemCardGroup.Description>组合不同卡片内容与动作</ItemCardGroup.Description>
          </ItemCardGroup.Header>
        )}
        {SIMPLE_COURSES.map((course) => (
          <ItemCard
            id={course.id}
            key={course.id}
          >
            <ItemCard.Icon>
              {variant === 'wallet-list' ? <Badge color="accent">¥</Badge> : <BookIcon />}
            </ItemCard.Icon>
            <ItemCard.Content>
              <ItemCard.Title>{course.name}</ItemCard.Title>
              <ItemCard.Description>
                {variant === 'permission-levels'
                  ? course.progress > 70 ? '管理员' : '成员'
                  : `${course.owner} · ${course.progress}%`}
              </ItemCard.Description>
            </ItemCard.Content>
            {(variant === 'notification-preferences' || variant === 'developer-settings') && (
              <ItemCard.Action>
                <Switch aria-label={course.name} defaultSelected={course.progress > 60} size="sm" />
              </ItemCard.Action>
            )}
          </ItemCard>
        ))}
      </ItemCardGroup>
      {variant === 'pressable' && <span style={demoTextStyle}>已点击：{pressed}</span>}
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

const KpiVariantDemo = ({ variant }: { variant: KpiVariantKey }) => {
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const value = period === 'week' ? '1,286' : '5,214';

  return (
    <DemoSection isColumn label={variant}>
      <Kpi style={{ width: 320 }}>
        <Kpi.Header>
          {variant === 'with-icon' && (
            <Kpi.Icon status="success">
              <BookIcon />
            </Kpi.Icon>
          )}
          <Kpi.Title>完课学员</Kpi.Title>
          {variant === 'with-actions' && (
            <Kpi.Actions>
              <Button size="sm" variant="ghost" onClick={() => setPeriod(period === 'week' ? 'month' : 'week')}>
                {period === 'week' ? '本周' : '本月'}
              </Button>
            </Kpi.Actions>
          )}
        </Kpi.Header>
        <Kpi.Content>
          <Kpi.Value>{value}</Kpi.Value>
          <Kpi.Trend>
            <Chip color="success" size="sm">
              +12.4%
            </Chip>
          </Kpi.Trend>
          {variant === 'with-chart-inline' && (
            <Kpi.Chart style={{ width: 96 }}>
              <SparklineLine values={[20, 32, 28, 44, 52, 48]} />
            </Kpi.Chart>
          )}
        </Kpi.Content>
        {variant === 'with-progress' && (
          <Kpi.Progress>
            <ProgressBar color="success" label="目标完成" size="sm" value={76} />
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
              <span style={demoMutedStyle}>较上周同期增长 142 人</span>
            </Kpi.Footer>
          </>
        )}
      </Kpi>
    </DemoSection>
  );
};

const KpiGroupVariantDemo = ({ variant }: { variant: 'horizontal' | 'vertical' | 'with-from-suffix' }) => (
  <DemoSection label={variant}>
    <KpiGroup orientation={variant === 'vertical' ? 'vertical' : 'horizontal'} style={{ width: variant === 'vertical' ? 280 : 680 }}>
      <Kpi>
        <Kpi.Header>
          <Kpi.Title>新增学员</Kpi.Title>
        </Kpi.Header>
        <Kpi.Content>
          <Kpi.Value>{variant === 'with-from-suffix' ? 'from 328' : '328'}</Kpi.Value>
        </Kpi.Content>
      </Kpi>
      <KpiGroup.Separator />
      <Kpi>
        <Kpi.Header>
          <Kpi.Title>续费率</Kpi.Title>
        </Kpi.Header>
        <Kpi.Content>
          <Kpi.Value>{variant === 'with-from-suffix' ? '76.5% suffix' : '76.5%'}</Kpi.Value>
        </Kpi.Content>
      </Kpi>
    </KpiGroup>
  </DemoSection>
);

type ListViewVariantKey = 'default' | 'disabled-items' | 'secondary' | 'selection-modes' | 'with-actions';

const ListViewVariantDemo = ({ variant }: { variant: ListViewVariantKey }) => {
  const [selected, setSelected] = useState<DemoSelection>(new Set(['1']));
  const [message, setMessage] = useState('尚未操作');

  if (variant === 'selection-modes') {
    return (
      <DemoSection isColumn label="selection modes">
        <ListView
          aria-label="多选文件"
          items={LIST_VIEW_FILES.slice(0, 3)}
          selectedKeys={selected}
          selectionMode="multiple"
          style={{ width: 420 }}
          onSelectionChange={setSelected}
        >
          {(file) => (
            <ListView.Item id={file.id} textValue={file.name}>
              <ListView.ItemContent>
                <FileIcon />
                <ListView.Title>{file.name}</ListView.Title>
              </ListView.ItemContent>
            </ListView.Item>
          )}
        </ListView>
        <span style={demoTextStyle}>已选择：{selected === 'all' ? '全部' : selected.size}</span>
      </DemoSection>
    );
  }

  return (
    <DemoSection isColumn label={variant}>
      <ListView
        aria-label="文件列表"
        disabledKeys={variant === 'disabled-items' ? ['3'] : undefined}
        items={LIST_VIEW_FILES.slice(0, 4)}
        selectionMode={variant === 'default' ? 'none' : 'single'}
        style={{ width: 420 }}
        variant={variant === 'secondary' ? 'secondary' : 'primary'}
      >
        {(file) => (
          <ListView.Item id={file.id} textValue={file.name}>
            <ListView.ItemContent>
              <FileIcon />
              <div>
                <ListView.Title>{file.name}</ListView.Title>
                <ListView.Description>{file.size}</ListView.Description>
              </div>
            </ListView.ItemContent>
            {variant === 'with-actions' && (
              <ListView.ItemAction>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(event) => {
                    event.stopPropagation();
                    setMessage(`已下载 ${file.name}`);
                  }}
                >
                  下载
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

const WidgetVariantDemo = ({ variant }: { variant: WidgetVariantKey }) => {
  if (variant === 'dashboard-grid') {
    return (
      <DemoSection label="dashboard grid">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, width: 720 }}>
          <Widget>
            <Widget.Header>
              <Widget.Title>关键指标</Widget.Title>
            </Widget.Header>
            <Widget.Content>
              <KpiGroup orientation="horizontal">
                <Kpi>
                  <Kpi.Header>
                    <Kpi.Title>活跃</Kpi.Title>
                  </Kpi.Header>
                  <Kpi.Content>
                    <Kpi.Value>1,486</Kpi.Value>
                  </Kpi.Content>
                </Kpi>
                <KpiGroup.Separator />
                <Kpi>
                  <Kpi.Header>
                    <Kpi.Title>续费</Kpi.Title>
                  </Kpi.Header>
                  <Kpi.Content>
                    <Kpi.Value>76%</Kpi.Value>
                  </Kpi.Content>
                </Kpi>
              </KpiGroup>
            </Widget.Content>
          </Widget>
          <Widget>
            <Widget.Header>
              <Widget.Title>学习趋势</Widget.Title>
              <Widget.Legend>
                <Widget.LegendItem color="var(--accent)">阅读</Widget.LegendItem>
                <Widget.LegendItem color="var(--success)">词汇</Widget.LegendItem>
              </Widget.Legend>
            </Widget.Header>
            <Widget.Content>
              <SparklineBars values={[18, 28, 42, 35, 52, 46, 60]} />
            </Widget.Content>
          </Widget>
        </div>
      </DemoSection>
    );
  }

  if (variant === 'with-table') {
    return (
      <DemoSection label="widget table">
        <Widget style={{ width: 620 }}>
          <Widget.Header>
            <Widget.Title>课程排行</Widget.Title>
            <Widget.Description>按本周学习时长排序</Widget.Description>
          </Widget.Header>
          <Widget.Content>
            <DataGrid aria-label="课程排行" columns={COURSE_COLUMNS} data={SIMPLE_COURSES} getRowId={courseRowId} />
          </Widget.Content>
        </Widget>
      </DemoSection>
    );
  }

  return (
    <DemoSection label={variant}>
      <Widget style={{ width: 420 }}>
        <Widget.Header>
          <Widget.Title>
            {variant === 'usage-summary'
              ? '使用摘要'
              : variant === 'with-kpis'
                ? '关键指标'
                : '学习趋势'}
          </Widget.Title>
          {(variant === 'with-bar-chart' || variant === 'with-line-chart' || variant === 'with-pie-chart') && (
            <Widget.Legend>
              <Widget.LegendItem color="var(--accent)">阅读</Widget.LegendItem>
              <Widget.LegendItem color="var(--success)">词汇</Widget.LegendItem>
            </Widget.Legend>
          )}
        </Widget.Header>
        <Widget.Content>
          {variant === 'with-kpis' ? (
            <KpiGroup orientation="horizontal">
              <Kpi>
                <Kpi.Header>
                  <Kpi.Title>活跃</Kpi.Title>
                </Kpi.Header>
                <Kpi.Content>
                  <Kpi.Value>1,486</Kpi.Value>
                </Kpi.Content>
              </Kpi>
              <KpiGroup.Separator />
              <Kpi>
                <Kpi.Header>
                  <Kpi.Title>续费</Kpi.Title>
                </Kpi.Header>
                <Kpi.Content>
                  <Kpi.Value>76%</Kpi.Value>
                </Kpi.Content>
              </Kpi>
            </KpiGroup>
          ) : variant === 'with-line-chart' ? (
            <SparklineLine values={[18, 22, 31, 28, 44, 52, 58]} />
          ) : variant === 'with-pie-chart' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <CompletionDonut label="课程完成率" value={72} />
              <span style={demoMutedStyle}>72% 学员完成本周目标</span>
            </div>
          ) : (
            <SparklineBars values={variant === 'usage-summary' ? [32, 46, 38, 58, 42, 64, 70] : [18, 28, 42, 35, 52, 46, 60]} />
          )}
        </Widget.Content>
        <Widget.Footer>
          <span style={demoMutedStyle}>数据每小时更新</span>
        </Widget.Footer>
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

const ChartTooltipVariantDemo = ({ variant }: { variant: ChartTooltipVariantKey }) => (
  <DemoSection label={variant}>
    {variant === 'inactive' ? (
      <span style={demoMutedStyle}>暂无悬停数据点。</span>
    ) : (
      <ChartTooltip>
        {variant !== 'no-header' && <ChartTooltip.Header>{variant === 'auto-content' ? '自动内容' : '6 月 11 日'}</ChartTooltip.Header>}
        <ChartTooltip.Item
          indicator={variant === 'line-indicator' ? 'line' : 'dot'}
          indicatorColor={variant === 'chart-colors' ? 'var(--chart-1)' : 'var(--accent)'}
          label="新增学员"
          value={variant === 'custom-formatters' ? '+328 人' : '328'}
        />
        <ChartTooltip.Item
          indicator={variant === 'line-indicator' ? 'line' : 'dot'}
          indicatorColor={variant === 'chart-colors' ? 'var(--chart-2)' : 'var(--success)'}
          label="完课学员"
          value={variant === 'custom-formatters' ? '1,286 人' : '1,286'}
        />
      </ChartTooltip>
    )}
  </DemoSection>
);

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
  status?: 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'muted';
}>> = {
  default: [
    { title: 'Imported customer notes', description: '42 interview highlights were attached to the opportunity.', time: '09:18', status: 'accent' },
    { title: 'Assigned follow-up owner', description: 'Mia Chen will prepare the next review agenda.', time: '10:04', status: 'success' },
    { title: 'Shared summary', description: 'Stakeholders received the product feedback digest.', time: '11:30', status: 'default' },
  ],
  'centered-milestones': [
    { title: 'Discovery', description: 'Research synthesis and success metrics were locked.', time: 'Week 1', status: 'success' },
    { title: 'Prototype', description: 'Interaction model and component inventory are in review.', time: 'Week 2', status: 'accent' },
    { title: 'Release', description: 'Public changelog and migration notes are queued.', time: 'Week 3', status: 'muted' },
  ],
  'studio-review': [
    { title: 'Scene approved', description: 'Primary animation timing matches the reference handoff.', time: '09:40', status: 'success' },
    { title: 'Copy pass requested', description: 'Shorten the empty-state paragraph before final export.', time: '10:15', status: 'warning' },
    { title: 'Ready for QA', description: 'Responsive checks are assigned to the frontend owner.', time: '11:05', status: 'accent' },
  ],
  'compact-log': [
    { title: 'Build started', description: 'Preview build picked up commit 8f4c2a1.', time: '12:01', status: 'accent' },
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
    { title: 'v0.3.2 patched', description: 'Fixed keyboard navigation in nested menus.', time: 'Jun 13', status: 'accent' },
    { title: 'v0.3.0 released', description: 'Introduced AI message and source components.', time: 'Jun 08', status: 'muted' },
  ],
  'repository-activity': [
    { title: 'Opened pull request', description: 'feat(showcase): add timeline parity demos.', time: '2m ago', status: 'accent' },
    { title: 'Requested review', description: 'Design and accessibility reviewers were assigned.', time: '5m ago', status: 'warning' },
    { title: 'Merged dependency update', description: 'UI library patch release was consumed by the build.', time: '1h ago', status: 'success' },
  ],
  'split-content': [
    { title: 'Plan', description: 'Scope the component slots and API surface.', time: 'Step 1', status: 'success' },
    { title: 'Implement', description: 'Wire visual states, actions, and keyboard semantics.', time: 'Step 2', status: 'accent' },
    { title: 'Verify', description: 'Compare against the reference and record parity gaps.', time: 'Step 3', status: 'muted' },
  ],
};

const TimelineVariantDemo = ({ variant }: { variant: TimelineVariantKey }) => {
  const [message, setMessage] = useState('尚未选择时间线事件');
  const axis = variant === 'centered-milestones' || variant === 'split-content' ? 'center' : 'start';
  const placement = variant === 'centered-milestones' ? 'alternate' : variant === 'split-content' ? 'alternate' : 'end';
  const density = variant === 'compact-log' ? 'compact' : variant === 'incident-response' ? 'spacious' : 'default';
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
            status={item.status}
            isCurrent={variant === 'incident-response' && index === 1}
          >
            <Timeline.Rail>
              <Timeline.Marker pulse={variant === 'incident-response' && index === 1}>
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
                  <Button size="sm" variant="secondary" onClick={() => setMessage(`已打开：${item.title}`)}>
                    打开
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setMessage(`已复制链接：${item.title}`)}>
                    复制链接
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
