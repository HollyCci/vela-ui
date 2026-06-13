import { useState, type ReactNode } from 'react';
import type { Selection } from 'react-aria-components';
import {
  Button as UIButton,
  Chip as UIChip,
  Separator as UISeparator,
  Tooltip as UITooltip,
} from '@heroui/react';
import ActionBar from '../../components/action-bar';
import Badge from '../../components/badge';
import Button from '../../components/button';
import Carousel from '../../components/carousel';
import ChartTooltip from '../../components/chart-tooltip';
import Chip from '../../components/chip';
import DataGrid, { type DataGridColumn } from '../../components/data-grid';
import EmptyState from '../../components/empty-state';
import FileTree, { type FileTreeNode } from '../../components/file-tree';
import FloatingToc from '../../components/floating-toc';
import HoverCard from '../../components/hover-card';
import ItemCard from '../../components/item-card';
import ItemCardGroup from '../../components/item-card-group';
import Kanban from '../../components/kanban';
import Kpi from '../../components/kpi';
import KpiGroup from '../../components/kpi-group';
import ListView from '../../components/list-view';
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
      <Kpi>
        <Kpi.Header>
          <Kpi.Title>待处理订单</Kpi.Title>
        </Kpi.Header>
        <Kpi.Content>
          <Kpi.Value>47</Kpi.Value>
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

/** 原站「With Action Bar」联动：多选行 → ActionBar 浮出，清除按钮收起 */
const ListViewDemo = () => {
  const [selected, setSelected] = useState<Selection>(new Set());
  const count = selected === 'all' ? LIST_VIEW_FILES.length : selected.size;
  const handleClear = () => setSelected(new Set());

  return (
    <>
      <DemoSection isColumn label="multiple selection + action bar">
        <ListView
          aria-label="Files"
          items={LIST_VIEW_FILES}
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
        <ActionBar isOpen={count > 0}>
          <ActionBar.Prefix>
            <UIChip color="accent" size="sm">
              {count}
            </UIChip>
            <ActionBar.Label>已选择</ActionBar.Label>
          </ActionBar.Prefix>
          <UISeparator />
          <ActionBar.Content>
            <UIButton size="sm" variant="ghost">
              下载
            </UIButton>
            <UIButton size="sm" variant="ghost">
              移动
            </UIButton>
            <UIButton className="text-danger" size="sm" variant="ghost">
              删除
            </UIButton>
          </ActionBar.Content>
          <UISeparator />
          <ActionBar.Suffix>
            <UITooltip>
              <UIButton
                aria-label="清除选择"
                isIconOnly
                size="sm"
                variant="ghost"
                onPress={handleClear}
              >
                <XmarkIcon />
              </UIButton>
              <UITooltip.Content>清除选择</UITooltip.Content>
            </UITooltip>
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
              <UIButton size="sm" variant="ghost">
                辅导
              </UIButton>
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
              <UIButton size="sm" variant="ghost">
                辅导
              </UIButton>
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

const WidgetDemo = () => (
  <DemoSection isColumn>
    <Widget style={{ width: 360 }}>
      <Widget.Header>
        <div>
          <Widget.Title>学习时长分布</Widget.Title>
          <Widget.Description>近 7 天</Widget.Description>
        </div>
        <Button size="sm" variant="ghost">
          导出
        </Button>
      </Widget.Header>
      <Widget.Content>
        <div style={{ height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 12 }}>
          图表占位区域
        </div>
      </Widget.Content>
      <Widget.Footer>
        <Widget.Legend>
          <Widget.LegendItem dotColor="var(--accent)" label="句型训练" />
          <Widget.LegendItem dotColor="var(--success)" label="阅读" />
          <Widget.LegendItem dotColor="var(--warning)" label="拼写" />
        </Widget.Legend>
      </Widget.Footer>
    </Widget>
  </DemoSection>
);

const FILE_TREE_NODES: FileTreeNode[] = [
  {
    key: 'course',
    label: '课程资料',
    icon: <FolderIcon />,
    children: [
      {
        key: 'ielts',
        label: '雅思',
        icon: <FolderIcon />,
        children: [
          { key: 'ielts-words', label: '核心词汇表.xlsx', icon: <FileIcon /> },
          { key: 'ielts-listening', label: '听力素材清单.docx', icon: <FileIcon /> },
        ],
      },
      { key: 'cet4', label: '四级真题合集.pdf', icon: <FileIcon /> },
    ],
  },
  {
    key: 'ops',
    label: '运营物料',
    icon: <FolderIcon />,
    children: [{ key: 'poster', label: '暑期活动海报.png', icon: <FileIcon /> }],
  },
];

const FileTreeDemo = () => {
  const [selectedKey, setSelectedKey] = useState<string>('ielts-words');
  return (
    <DemoSection isColumn>
      <div style={{ width: 320 }}>
        <FileTree
          nodes={FILE_TREE_NODES}
          defaultExpandedKeys={['course', 'ielts']}
          selectedKey={selectedKey}
          onSelect={setSelectedKey}
        />
      </div>
    </DemoSection>
  );
};

const KanbanDemo = () => (
  <DemoSection isColumn>
    <Kanban size="sm" style={{ width: 760 }}>
      <Kanban.Column>
        <Kanban.ColumnHeader title="待跟进" count="2" indicatorColor="var(--warning)" />
        <Kanban.ColumnBody>
          <Kanban.CardList>
            <Kanban.Card size="sm">
              <div>学员「王晓萌」连续 3 天未打卡</div>
              <Chip size="sm" color="warning">
                高优
              </Chip>
            </Kanban.Card>
            <Kanban.Card size="sm">
              <div>订单 #20260611 申请退费待审核</div>
            </Kanban.Card>
          </Kanban.CardList>
        </Kanban.ColumnBody>
      </Kanban.Column>
      <Kanban.Column>
        <Kanban.ColumnHeader title="处理中" count="1" indicatorColor="var(--accent)" />
        <Kanban.ColumnBody>
          <Kanban.CardList>
            <Kanban.Card size="sm" isSelected>
              <div>考研班排课冲突，与教务沟通中</div>
            </Kanban.Card>
          </Kanban.CardList>
        </Kanban.ColumnBody>
      </Kanban.Column>
      <Kanban.Column>
        <Kanban.ColumnHeader title="已完成" count="0" indicatorColor="var(--success)" />
        <Kanban.ColumnBody>
          <Kanban.CardList isEmpty>
            <Kanban.Empty>暂无任务</Kanban.Empty>
          </Kanban.CardList>
        </Kanban.ColumnBody>
      </Kanban.Column>
    </Kanban>
  </DemoSection>
);

type OrderRow = {
  id: string;
  student: string;
  course: string;
  amount: string;
  status: string;
};

const ORDER_ROWS: OrderRow[] = [
  { id: '20260612001', student: '王晓萌', course: '雅思 7 分计划', amount: '¥3,980', status: '已支付' },
  { id: '20260612002', student: '李子轩', course: '考研英语冲刺班', amount: '¥2,680', status: '待支付' },
  { id: '20260612003', student: '陈雨桐', course: '四级真题精讲营', amount: '¥1,280', status: '已退款' },
];

const renderOrderStatus = (row: OrderRow) => {
  const color = row.status === '已支付' ? 'success' : row.status === '待支付' ? 'warning' : 'danger';
  return (
    <Chip size="sm" color={color}>
      {row.status}
    </Chip>
  );
};

const ORDER_COLUMNS: DataGridColumn<OrderRow>[] = [
  { key: 'id', title: '订单号', width: 140 },
  { key: 'student', title: '学员' },
  { key: 'course', title: '课程' },
  { key: 'amount', title: '金额', align: 'right' },
  { key: 'status', title: '状态', render: renderOrderStatus },
];

const orderRowKey = (row: OrderRow) => row.id;

const DataGridDemo = () => (
  <DemoSection isColumn>
    <div style={{ width: 640 }}>
      <DataGrid
        columns={ORDER_COLUMNS}
        rows={ORDER_ROWS}
        rowKey={orderRowKey}
        selectedKeys={['20260612001']}
      />
    </div>
  </DemoSection>
);

const CarouselDemo = () => {
  const [index, setIndex] = useState(0);
  const slides = ['暑期班招生海报', '教师节活动物料', '新版 App 上线公告'];
  return (
    <DemoSection isColumn>
      <Carousel index={index} onIndexChange={setIndex} hasDots style={{ width: 420 }}>
        {slides.map((slide) => (
          <div
            key={slide}
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
        ))}
      </Carousel>
    </DemoSection>
  );
};

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

export const dataDisplayDemos: Record<string, ReactNode> = {
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
