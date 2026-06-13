import { useState, type CSSProperties, type ReactNode } from 'react';
import type { Key } from 'react-aria-components';
import Breadcrumbs from '../../components/breadcrumbs';
import Button from '../../components/button';
import EmojiReactionButton from '../../components/emoji-reaction-button';
import Link from '../../components/link';
import Meter from '../../components/meter';
import Navbar from '../../components/navbar';
import NumberValue from '../../components/number-value';
import Pagination from '../../components/pagination';
import PressableFeedback from '../../components/pressable-feedback';
import ProgressBar from '../../components/progress-bar';
import ProgressCircle from '../../components/progress-circle';
import Rating from '../../components/rating';
import Segment from '../../components/segment';
import Stepper from '../../components/stepper';
import Tabs from '../../components/tabs';
import Toast from '../../components/toast';
import Tooltip from '../../components/tooltip';
import TrendChip from '../../components/trend-chip';
import DemoSection from '../demo-section';

const ProgressBarDemo = () => (
  <>
    <DemoSection label="颜色与数值" isColumn>
      <ProgressBar label="下载进度" value={64} style={{ maxWidth: 360 }} />
      <ProgressBar label="存储空间" value={86} color="warning" style={{ maxWidth: 360 }} />
      <ProgressBar label="错误率" value={32} color="danger" style={{ maxWidth: 360 }} />
    </DemoSection>
    <DemoSection label="尺寸与不确定态" isColumn>
      <ProgressBar label="小尺寸" value={40} size="sm" style={{ maxWidth: 360 }} />
      <ProgressBar label="加载中…" style={{ maxWidth: 360 }} />
    </DemoSection>
  </>
);

const ProgressCircleDemo = () => (
  <DemoSection label="尺寸与颜色">
    <ProgressCircle value={25} size="sm" />
    <ProgressCircle value={60} />
    <ProgressCircle value={80} size="lg" color="success" />
    <ProgressCircle aria-label="加载中" />
  </DemoSection>
);

const MeterDemo = () => (
  <DemoSection label="容量指示" isColumn>
    <Meter label="CPU 使用率" value={45} style={{ maxWidth: 360 }} />
    <Meter label="内存占用" value={72} color="warning" style={{ maxWidth: 360 }} />
    <Meter label="磁盘空间" value={93} color="danger" size="lg" style={{ maxWidth: 360 }} />
  </DemoSection>
);

const RATING_VALUES = [1, 2, 3, 4, 5];

const RatingDemo = () => {
  const [score, setScore] = useState(3);

  return (
    <>
      <DemoSection label="受控（点击或方向键打分，按下星星有缩放反馈）">
        <Rating aria-label="评分" value={score} onValueChange={setScore}>
          {RATING_VALUES.map((v) => (
            <Rating.Item key={v} value={v} />
          ))}
        </Rating>
        <span>当前 {score} 分</span>
      </DemoSection>
      <DemoSection label="只读（半星）与禁用">
        <Rating aria-label="3.5 out of 5 stars" value={3.5} isReadOnly>
          {RATING_VALUES.map((v) => (
            <Rating.Item key={v} value={v} />
          ))}
        </Rating>
        <Rating aria-label="4 out of 5 stars" size="lg" value={4} isReadOnly>
          {RATING_VALUES.map((v) => (
            <Rating.Item key={v} value={v} />
          ))}
        </Rating>
        <Rating aria-label="评分（禁用）" size="sm" value={2} isDisabled>
          {RATING_VALUES.map((v) => (
            <Rating.Item key={v} value={v} />
          ))}
        </Rating>
      </DemoSection>
    </>
  );
};

const TrendChipDemo = () => (
  <DemoSection label="趋势指标">
    <TrendChip trend="up" value="12.5%" suffix="环比" />
    <TrendChip trend="down" value="3.2%" suffix="较昨日" />
    <TrendChip trend="neutral" value="0.0%" />
    <TrendChip trend="up" value="8.4%" size="sm" />
  </DemoSection>
);

const NumberValueDemo = () => (
  <DemoSection label="数字格式化">
    <NumberValue value={1234567.89} />
    <NumberValue value={0.4567} formatOptions={{ style: 'percent', maximumFractionDigits: 1 }} />
    <NumberValue value={9988} formatOptions={{ style: 'currency', currency: 'CNY' }} />
  </DemoSection>
);

const PRESSABLE_BOX_STYLE: CSSProperties = {
  padding: '8px 16px',
  borderRadius: 8,
  border: '1px solid var(--border)',
};

const HOLD_OVERLAY_STYLE: CSSProperties = {
  background: 'var(--danger)',
  color: 'var(--danger-foreground)',
};

const PROGRESS_OVERLAY_STYLE: CSSProperties = {
  background: 'var(--accent)',
  color: 'var(--accent-foreground)',
};

const PressableFeedbackDemo = () => {
  const [holdCount, setHoldCount] = useState(0);
  const [isProgressDone, setIsProgressDone] = useState(false);

  const handleHoldComplete = () => setHoldCount((count) => count + 1);
  const handleProgressComplete = () => setIsProgressDone(true);
  const handleProgressReset = () => setIsProgressDone(false);

  return (
    <>
      <DemoSection label="高亮反馈（悬停 / 按压）">
        <PressableFeedback style={PRESSABLE_BOX_STYLE}>
          <PressableFeedback.Highlight />
          悬停 / 按住试试
        </PressableFeedback>
        <PressableFeedback isDisabled style={PRESSABLE_BOX_STYLE}>
          <PressableFeedback.Highlight />
          已禁用
        </PressableFeedback>
      </DemoSection>
      <DemoSection label="波纹反馈（M3 径向扩散）">
        <PressableFeedback style={PRESSABLE_BOX_STYLE}>
          <PressableFeedback.Ripple />
          点击看波纹
        </PressableFeedback>
        <PressableFeedback isDisabled style={PRESSABLE_BOX_STYLE}>
          <PressableFeedback.Ripple isDisabled />
          已禁用
        </PressableFeedback>
      </DemoSection>
      <DemoSection label="按住确认（按住 2 秒触发，提前松手回弹）">
        <PressableFeedback style={PRESSABLE_BOX_STYLE}>
          <PressableFeedback.HoldConfirm style={HOLD_OVERLAY_STYLE} onComplete={handleHoldComplete}>
            确认删除！
          </PressableFeedback.HoldConfirm>
          按住删除
        </PressableFeedback>
        <PressableFeedback style={PRESSABLE_BOX_STYLE}>
          <PressableFeedback.HoldConfirm
            sweep="up"
            duration={1000}
            style={PROGRESS_OVERLAY_STYLE}
            onComplete={handleHoldComplete}
          >
            已确认
          </PressableFeedback.HoldConfirm>
          按住 1 秒（向上扫入）
        </PressableFeedback>
        <span>已确认 {holdCount} 次</span>
      </DemoSection>
      <DemoSection label="点击进度（自动扫入，完成 1.5 秒后复位）">
        <PressableFeedback style={PRESSABLE_BOX_STYLE}>
          <PressableFeedback.ProgressFeedback
            style={PROGRESS_OVERLAY_STYLE}
            onComplete={handleProgressComplete}
            onReset={handleProgressReset}
          >
            购买中…
          </PressableFeedback.ProgressFeedback>
          点击购买
        </PressableFeedback>
        <span>{isProgressDone ? '已完成' : '待操作'}</span>
      </DemoSection>
    </>
  );
};

const EmojiReactionButtonDemo = () => {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <>
      <DemoSection label="受控切换（悬停变底色，按下缩放）">
        <EmojiReactionButton isSelected={isLiked} onChange={setIsLiked}>
          <EmojiReactionButton.Emoji>👍</EmojiReactionButton.Emoji>
          <EmojiReactionButton.Count>{isLiked ? 13 : 12}</EmojiReactionButton.Count>
        </EmojiReactionButton>
        <EmojiReactionButton defaultSelected size="lg">
          <EmojiReactionButton.Emoji>❤️</EmojiReactionButton.Emoji>
          <EmojiReactionButton.Count>28</EmojiReactionButton.Count>
        </EmojiReactionButton>
        <EmojiReactionButton size="sm">
          <EmojiReactionButton.Emoji>🎉</EmojiReactionButton.Emoji>
          <EmojiReactionButton.Count>5</EmojiReactionButton.Count>
        </EmojiReactionButton>
      </DemoSection>
      <DemoSection label="只读与禁用">
        <EmojiReactionButton isSelected isReadOnly>
          <EmojiReactionButton.Emoji>👀</EmojiReactionButton.Emoji>
          <EmojiReactionButton.Count>3</EmojiReactionButton.Count>
        </EmojiReactionButton>
        <EmojiReactionButton isDisabled>
          <EmojiReactionButton.Emoji>😂</EmojiReactionButton.Emoji>
          <EmojiReactionButton.Count>7</EmojiReactionButton.Count>
        </EmojiReactionButton>
      </DemoSection>
    </>
  );
};

const TooltipDemo = () => (
  <>
    <DemoSection label="悬停 / 聚焦显示提示（content 便捷用法）">
      <Tooltip content="顶部提示" placement="top" delay={0} closeDelay={0}>
        <Button variant="secondary">上</Button>
      </Tooltip>
      <Tooltip content="底部提示" placement="bottom" delay={0} closeDelay={0}>
        <Button variant="secondary">下</Button>
      </Tooltip>
      <Tooltip content="左侧提示" placement="left" delay={0} closeDelay={0}>
        <Button variant="secondary">左</Button>
      </Tooltip>
      <Tooltip content="一直展示的受控提示" isOpen placement="right">
        <Button variant="secondary">受控</Button>
      </Tooltip>
    </DemoSection>
    <DemoSection label="compound 组合用法（带箭头）">
      <Tooltip delay={0} closeDelay={0}>
        <Tooltip.Trigger>
          <Button variant="secondary">带箭头</Button>
        </Tooltip.Trigger>
        <Tooltip.Content placement="top" showArrow>
          <Tooltip.Arrow />
          组合用法的提示内容
        </Tooltip.Content>
      </Tooltip>
    </DemoSection>
  </>
);

const ToastNoop = () => undefined;

const ToastDemo = () => (
  <DemoSection label="静态展示" isColumn>
    <div style={{ position: 'relative', height: 76, maxWidth: 420 }}>
      <Toast title="文件已保存" description="所有更改已同步到云端。" indicator="✓" color="success" onClose={ToastNoop} />
    </div>
    <div style={{ position: 'relative', height: 76, maxWidth: 420 }}>
      <Toast
        title="网络连接失败"
        description="请检查网络后重试。"
        indicator="✕"
        color="danger"
        action={
          <Button size="sm" variant="outline">
            重试
          </Button>
        }
      />
    </div>
    <div style={{ position: 'relative', height: 60, maxWidth: 420 }}>
      <Toast title="新版本可用" indicator="ℹ︎" color="accent" />
    </div>
  </DemoSection>
);

const PaginationDemo = () => {
  const [page, setPage] = useState(3);

  return (
    <DemoSection isColumn>
      <Pagination count={12} page={page} onPageChange={setPage} summary={`共 120 条 · 第 ${page} 页`} />
      <Pagination count={5} page={2} size="sm" />
    </DemoSection>
  );
};

const BreadcrumbsDemo = () => (
  <DemoSection>
    <Breadcrumbs>
      <Breadcrumbs.Item label="首页" href="#" />
      <Breadcrumbs.Item label="组件库" href="#" />
      <Breadcrumbs.Item label="导航" href="#" />
      <Breadcrumbs.Item label="面包屑" isCurrent />
    </Breadcrumbs>
  </DemoSection>
);

const TABS_ITEMS = [
  { key: 'overview', title: '概览', content: '这里是项目概览信息。' },
  { key: 'members', title: '成员', content: '共有 8 名成员参与本项目。' },
  { key: 'settings', title: '设置', content: '在这里调整项目配置。' },
  { key: 'archive', title: '归档', isDisabled: true },
];

const TabsDemo = () => {
  const [primaryKey, setPrimaryKey] = useState('overview');
  const [secondaryKey, setSecondaryKey] = useState('members');

  return (
    <>
      <DemoSection label="主样式" isColumn>
        <Tabs items={TABS_ITEMS} selectedKey={primaryKey} onChange={setPrimaryKey} style={{ maxWidth: 480 }} />
      </DemoSection>
      <DemoSection label="次级样式（下划线）" isColumn>
        <Tabs
          items={TABS_ITEMS}
          selectedKey={secondaryKey}
          onChange={setSecondaryKey}
          variant="secondary"
          style={{ maxWidth: 480 }}
        />
      </DemoSection>
    </>
  );
};

const SEGMENT_RANGES = [
  { id: 'day', label: '日' },
  { id: 'week', label: '周' },
  { id: 'month', label: '月' },
  { id: 'year', label: '年', isDisabled: true },
];

const SegmentDemo = () => {
  const [range, setRange] = useState<Key>('week');

  return (
    <>
      <DemoSection label="受控 + 同步两种尺寸">
        <Segment aria-label="统计周期" selectedKey={range} onSelectionChange={setRange}>
          {SEGMENT_RANGES.map((r) => (
            <Segment.Item key={r.id} id={r.id} isDisabled={r.isDisabled}>
              {r.label}
            </Segment.Item>
          ))}
        </Segment>
        <Segment
          aria-label="统计周期（小尺寸）"
          selectedKey={range}
          size="sm"
          onSelectionChange={setRange}
        >
          {SEGMENT_RANGES.map((r) => (
            <Segment.Item key={r.id} id={r.id} isDisabled={r.isDisabled}>
              {r.label}
            </Segment.Item>
          ))}
        </Segment>
      </DemoSection>
      <DemoSection label="ghost 变体（非受控）">
        <Segment aria-label="视图" defaultSelectedKey="day" variant="ghost">
          {SEGMENT_RANGES.map((r) => (
            <Segment.Item key={r.id} id={r.id} isDisabled={r.isDisabled}>
              {r.label}
            </Segment.Item>
          ))}
        </Segment>
      </DemoSection>
    </>
  );
};

const STEPPER_STEPS = [
  { title: '填写信息', description: '基础资料' },
  { title: '上传材料', description: '相关证明' },
  { title: '审核确认', description: '1-2 个工作日' },
  { title: '完成', description: '开通成功' },
];

const StepperDemo = () => (
  <>
    <DemoSection label="水平" isColumn>
      <Stepper steps={STEPPER_STEPS} currentStep={2} style={{ maxWidth: 560 }} />
    </DemoSection>
    <DemoSection label="垂直 / 小尺寸">
      <Stepper steps={STEPPER_STEPS} currentStep={1} orientation="vertical" size="sm" />
    </DemoSection>
  </>
);

const LinkDemo = () => (
  <DemoSection>
    <Link href="#">普通链接</Link>
    <Link href="https://example.com" isExternal>
      外部链接
    </Link>
    <Link href="#" isDisabled>
      禁用链接
    </Link>
  </DemoSection>
);

const NavbarDemo = () => (
  <DemoSection isColumn>
    <div style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
      <Navbar>
        <Navbar.Header maxWidth="full">
          <Navbar.Brand>
            <strong>Matrix</strong>
          </Navbar.Brand>
          <Navbar.Content>
            <Navbar.Item href="#" isCurrent>
              工作台
            </Navbar.Item>
            <Navbar.Item href="#">学员管理</Navbar.Item>
            <Navbar.Item href="#">排班</Navbar.Item>
          </Navbar.Content>
          <Navbar.Spacer />
          <Navbar.Content>
            <Navbar.Separator />
            <Navbar.Item href="#">设置</Navbar.Item>
          </Navbar.Content>
        </Navbar.Header>
      </Navbar>
    </div>
  </DemoSection>
);

export const feedbackNavDemos: Record<string, ReactNode> = {
  'progress-bar': <ProgressBarDemo />,
  'progress-circle': <ProgressCircleDemo />,
  meter: <MeterDemo />,
  rating: <RatingDemo />,
  'trend-chip': <TrendChipDemo />,
  'number-value': <NumberValueDemo />,
  'pressable-feedback': <PressableFeedbackDemo />,
  'emoji-reaction-button': <EmojiReactionButtonDemo />,
  tooltip: <TooltipDemo />,
  toast: <ToastDemo />,
  pagination: <PaginationDemo />,
  breadcrumbs: <BreadcrumbsDemo />,
  tabs: <TabsDemo />,
  segment: <SegmentDemo />,
  stepper: <StepperDemo />,
  link: <LinkDemo />,
  navbar: <NavbarDemo />,
};
