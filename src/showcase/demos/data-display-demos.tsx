import { useState, type ReactNode } from 'react';
import type { Key, Selection, SortDescriptor } from 'react-aria-components';
import ActionBar from '../../components/action-bar';
import Agenda, { useAgenda, type AgendaEvent } from '../../components/agenda';
import Badge from '../../components/badge';
import Button from '../../components/button';
import Carousel from '../../components/carousel';
import ChartTooltip from '../../components/chart-tooltip';
import Chip from '../../components/chip';
import DataGrid, { type DataGridColumn } from '../../components/data-grid';
import EmptyState from '../../components/empty-state';
import FileTree from '../../components/file-tree';
import FloatingToc from '../../components/floating-toc';
import HoverCard from '../../components/hover-card';
import ItemCard from '../../components/item-card';
import ItemCardGroup from '../../components/item-card-group';
import Kanban, { useKanban, useKanbanColumn } from '../../components/kanban';
import Kpi from '../../components/kpi';
import KpiGroup from '../../components/kpi-group';
import ListView from '../../components/list-view';
import Separator from '../../components/separator';
import Tooltip from '../../components/tooltip';
import Widget from '../../components/widget';
import DemoSection from '../demo-section';

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

const ItemCardDemo = () => (
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
        <Button size="sm" variant="outline">
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
  </DemoSection>
);

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

/** 原站「With Action Bar」联动：多选行 → ActionBar 浮出，清除按钮收起 */
const ListViewDemo = () => {
  const [files, setFiles] = useState(LIST_VIEW_FILES);
  const [selected, setSelected] = useState<Selection>(new Set());
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

const EmptyStateDemo = () => (
  <DemoSection>
    <EmptyState size="md" style={{ width: 320 }}>
      <EmptyState.Header>
        <EmptyState.Media variant="icon">
          <FileIcon />
        </EmptyState.Media>
        <EmptyState.Title>暂无待审核内容</EmptyState.Title>
        <EmptyState.Description>新提交的课程内容会出现在这里</EmptyState.Description>
      </EmptyState.Header>
      <EmptyState.Content>
        <Button size="sm" variant="secondary">
          刷新列表
        </Button>
      </EmptyState.Content>
    </EmptyState>
  </DemoSection>
);

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
  const [expandedKeys, setExpandedKeys] = useState<Set<Key>>(
    () => new Set<Key>(['course', 'ielts']),
  );
  const [selectedKeys, setSelectedKeys] = useState<Selection>(
    () => new Set<Key>(['ielts-words']),
  );

  const handleExpandedChange = (keys: Set<Key>) => {
    setExpandedKeys(new Set(keys));
  };

  const handleSelectionChange = (keys: Selection) => {
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

const sortOrderRows = (rows: OrderRow[], descriptor: SortDescriptor): OrderRow[] => {
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
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'amount',
    direction: 'descending',
  });
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set(['20260612001']));
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

const CAROUSEL_SLIDES = ['暑期班招生海报', '教师节活动物料', '新版 App 上线公告'];

const CarouselDemo = () => (
  <DemoSection isColumn>
    <Carousel aria-label="运营物料轮播" style={{ width: 420 }}>
      <Carousel.Content>
        {CAROUSEL_SLIDES.map((slide) => (
          <Carousel.Item key={slide}>
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
              {slide}
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

const AgendaDemo = () => {
  const agenda = useAgenda({ events: AGENDA_EVENTS, defaultView: 'week' });

  return (
    <DemoSection isColumn label="日历议程 · 视图切换（日/周/月）+ 日期前后导航 / 回今天均可点">
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
    </DemoSection>
  );
};

export const dataDisplayDemos: Record<string, ReactNode> = {
  agenda: <AgendaDemo />,
  kpi: <KpiDemo />,
  'kpi-group': <KpiGroupDemo />,
  'item-card': <ItemCardDemo />,
  'item-card-group': <ItemCardGroupDemo />,
  'list-view': <ListViewDemo />,
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
