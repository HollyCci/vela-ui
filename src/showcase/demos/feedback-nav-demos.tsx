import {
  useRef,
  useState,
  type CSSProperties,
  type Key as ReactKey,
  type MouseEvent,
  type ReactNode,
} from 'react';
import type { Key } from 'react-aria-components';
import Breadcrumbs from '../../components/breadcrumbs';
import Button from '../../components/button';
import Command from '../../components/command';
import ContextMenu from '../../components/context-menu';
import Kbd from '../../components/kbd';
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
import Resizable from '../../components/resizable';
import AppLayout from '../../components/app-layout';
import Sidebar from '../../components/sidebar';
import Segment from '../../components/segment';
import Stepper from '../../components/stepper';
import Tabs from '../../components/tabs';
import Toast, { Toaster, useToast } from '../../components/toast';
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

const TOAST_VARIANTS = [
  { title: '文件已保存', description: '所有更改已同步到云端。', indicator: '✓', color: 'success' as const },
  { title: '网络连接失败', description: '请检查网络后重试。', indicator: '✕', color: 'danger' as const },
  { title: '新版本可用', indicator: 'ℹ︎', color: 'accent' as const },
] as const;

const ToastDemo = () => {
  const { toast } = useToast();
  const [seq, setSeq] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [isSavedPreviewVisible, setSavedPreviewVisible] = useState(true);

  const handlePush = () => {
    const variant = TOAST_VARIANTS[seq % TOAST_VARIANTS.length];
    setSeq((value) => value + 1);
    toast({ ...variant });
  };
  const handleRetry = () => setRetryCount((value) => value + 1);
  const handleSavedPreviewClose = () => setSavedPreviewVisible(false);
  const handleSavedPreviewRestore = () => setSavedPreviewVisible(true);

  return (
    <>
      <DemoSection label="编排：滑入 / 自动消失" isColumn>
        <Button variant="primary" onClick={handlePush}>
          弹出一条 toast
        </Button>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, maxWidth: 420 }}>
          点击后从右下角滑入（View Transitions），4 秒后或点关闭按钮滑出移除。
        </p>
        {/* 编排区域：固定定位、portal 到 body，订阅命令式 toast store */}
        <Toaster placement="bottom-end" />
      </DemoSection>
      <DemoSection label="可操作预览" isColumn>
        {isSavedPreviewVisible ? (
          <div style={{ position: 'relative', height: 76, maxWidth: 420 }}>
            <Toast
              title="文件已保存"
              description="所有更改已同步到云端。"
              indicator="✓"
              color="success"
              onClose={handleSavedPreviewClose}
            />
          </div>
        ) : (
          <Button size="sm" variant="secondary" onClick={handleSavedPreviewRestore}>
            恢复保存提示
          </Button>
        )}
        <div style={{ position: 'relative', height: 76, maxWidth: 420 }}>
          <Toast
            title="网络连接失败"
            description={
              retryCount > 0 ? `已重试 ${retryCount} 次，请等待网络恢复。` : '请检查网络后重试。'
            }
            indicator="✕"
            color="danger"
            action={
              <Button size="sm" variant="outline" onClick={handleRetry}>
                重试
              </Button>
            }
          />
        </div>
        <div style={{ position: 'relative', height: 60, maxWidth: 420 }}>
          <Toast title="新版本可用" indicator="ℹ︎" color="accent" />
        </div>
      </DemoSection>
    </>
  );
};

const PaginationDemo = () => {
  const [page, setPage] = useState(3);

  return (
    <DemoSection isColumn>
      <Pagination count={12} page={page} onPageChange={setPage} summary={`共 120 条 · 第 ${page} 页`} />
      <Pagination count={5} page={2} size="sm" />
    </DemoSection>
  );
};

const BREADCRUMB_ITEMS = [
  { id: 'home', label: '首页', href: '/app' },
  { id: 'components', label: '组件库', href: '/app/components' },
  { id: 'navigation', label: '导航', href: '/app/components/navigation' },
  { id: 'breadcrumbs', label: '面包屑', href: '/app/components/navigation/breadcrumbs' },
];

const BreadcrumbsDemo = () => {
  const [currentCrumb, setCurrentCrumb] = useState('breadcrumbs');
  const currentIndex = Math.max(
    BREADCRUMB_ITEMS.findIndex((item) => item.id === currentCrumb),
    0,
  );
  const visibleItems = BREADCRUMB_ITEMS.slice(0, currentIndex + 1);
  const currentLabel = BREADCRUMB_ITEMS[currentIndex]?.label ?? '首页';

  const handleNavigate = (id: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setCurrentCrumb(id);
  };

  return (
    <DemoSection isColumn>
      <Breadcrumbs>
        {visibleItems.map((item, index) => (
          <Breadcrumbs.Item
            key={item.id}
            label={item.label}
            href={item.href}
            isCurrent={index === visibleItems.length - 1}
            linkProps={index === visibleItems.length - 1 ? undefined : { onClick: handleNavigate(item.id) }}
          />
        ))}
      </Breadcrumbs>
      <span>当前路径：{currentLabel}</span>
    </DemoSection>
  );
};

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

const StepperDemo = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const handleStepChange = (step: number) => setCurrentStep(step);

  return (
    <>
      <DemoSection label="受控 + 可点击（点任意步骤跳转，连接线随进度填充）" isColumn>
        <Stepper currentStep={currentStep} onStepChange={handleStepChange} style={{ maxWidth: 560 }}>
          {STEPPER_STEPS.map((step) => (
            <Stepper.Step key={step.title}>
              <Stepper.Indicator />
              <Stepper.Content>
                <Stepper.Title>{step.title}</Stepper.Title>
              </Stepper.Content>
            </Stepper.Step>
          ))}
        </Stepper>
        <span>
          当前第 {currentStep + 1} 步：{STEPPER_STEPS[currentStep].title}
        </span>
      </DemoSection>
      <DemoSection label="垂直 / 小尺寸 / 展示型（无 onStepChange 不可点击）">
        <Stepper orientation="vertical" size="sm" currentStep={1}>
          {STEPPER_STEPS.map((step) => (
            <Stepper.Step key={step.title}>
              <Stepper.Indicator />
              <Stepper.Content>
                <Stepper.Title>{step.title}</Stepper.Title>
                <Stepper.Description>{step.description}</Stepper.Description>
              </Stepper.Content>
            </Stepper.Step>
          ))}
        </Stepper>
      </DemoSection>
    </>
  );
};

const LinkDemo = () => {
  const [lastLink, setLastLink] = useState('尚未点击链接');
  const handleInternalLink = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setLastLink('已拦截站内跳转：/docs/components/link');
  };

  return (
    <DemoSection isColumn>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Link href="/docs/components/link" onClick={handleInternalLink}>
          普通链接
        </Link>
        <Link href="https://example.com" isExternal>
          外部链接
        </Link>
        <Link isDisabled tabIndex={-1}>
          禁用链接
        </Link>
      </div>
      <span>{lastLink}</span>
    </DemoSection>
  );
};

const NAVBAR_LINKS = [
  { href: '/app/dashboard', label: '工作台' },
  { href: '/app/students', label: '学员管理' },
  { href: '/app/schedule', label: '排班' },
];

const NAVBAR_SCROLL_CONTAINER_STYLE: CSSProperties = {
  width: '100%',
  height: 240,
  overflowY: 'auto',
  border: '1px solid var(--border)',
  borderRadius: 8,
};

const NAVBAR_SCROLL_FILLER_STYLE: CSSProperties = {
  height: 720,
  padding: 16,
  color: 'var(--muted)',
};

const NAVBAR_MENU_CONTAINER_STYLE: CSSProperties = {
  width: '100%',
  height: 280,
  position: 'relative',
  overflow: 'hidden',
  border: '1px solid var(--border)',
  borderRadius: 8,
};

const NavbarDemo = () => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeHref, setActiveHref] = useState('/app/dashboard');

  const handleMenuOpenChange = (isOpen: boolean) => setIsMenuOpen(isOpen);
  const handleNavigate = (href: string) => setActiveHref(href);
  const activeLabel =
    NAVBAR_LINKS.find((link) => link.href === activeHref)?.label ??
    (activeHref === '/app/settings' ? '设置' : '工作台');

  return (
    <>
      <DemoSection label="hide-on-scroll（在容器内下滑隐藏、上滑恢复）" isColumn>
        <div ref={scrollContainerRef} style={NAVBAR_SCROLL_CONTAINER_STYLE}>
          <Navbar
            maxWidth="full"
            hideOnScroll
            parentRef={scrollContainerRef}
            navigate={handleNavigate}
          >
            <Navbar.Header>
              <Navbar.Brand>
                <strong>Matrix</strong>
              </Navbar.Brand>
              <Navbar.Content>
                {NAVBAR_LINKS.map((link) => (
                  <Navbar.Item key={link.href} href={link.href} isCurrent={activeHref === link.href}>
                    {link.label}
                  </Navbar.Item>
                ))}
              </Navbar.Content>
              <Navbar.Spacer />
              <Navbar.Content>
                <Navbar.Separator />
                <Navbar.Item href="/app/settings" isCurrent={activeHref === '/app/settings'}>
                  设置
                </Navbar.Item>
              </Navbar.Content>
            </Navbar.Header>
          </Navbar>
          <div style={NAVBAR_SCROLL_FILLER_STYLE}>
            向下滚动隐藏导航栏，向上滚动立即恢复。当前：{activeLabel}
          </div>
        </div>
      </DemoSection>
      <DemoSection label="移动菜单（受控 MenuToggle，汉堡图标切换为关闭）" isColumn>
        <div style={NAVBAR_MENU_CONTAINER_STYLE}>
          <Navbar
            position="static"
            maxWidth="full"
            isMenuOpen={isMenuOpen}
            onMenuOpenChange={handleMenuOpenChange}
            shouldBlockScroll={false}
            navigate={handleNavigate}
          >
            <Navbar.Header>
              <Navbar.Brand>
                <strong>Matrix</strong>
              </Navbar.Brand>
              <Navbar.Spacer />
              <Navbar.MenuToggle />
            </Navbar.Header>
            <Navbar.Menu>
              {NAVBAR_LINKS.map((link) => (
                <Navbar.MenuItem key={link.href} href={link.href} isCurrent={activeHref === link.href}>
                  {link.label}
                </Navbar.MenuItem>
              ))}
            </Navbar.Menu>
          </Navbar>
        </div>
        <span>
          移动菜单{isMenuOpen ? '已展开（点菜单项自动收起）' : '已收起'} · 当前：{activeLabel}
        </span>
      </DemoSection>
    </>
  );
};

type CommandAction = {
  id: string;
  label: string;
  shortcut?: string;
};

type CommandGroup = {
  heading: string;
  items: CommandAction[];
};

const COMMAND_GROUPS: CommandGroup[] = [
  {
    heading: '建议',
    items: [
      { id: 'new-file', label: '新建文件', shortcut: '⌘N' },
      { id: 'new-folder', label: '新建文件夹', shortcut: '⌘⇧N' },
      { id: 'search', label: '全局搜索', shortcut: '⌘P' },
    ],
  },
  {
    heading: '导航',
    items: [
      { id: 'goto-dashboard', label: '前往工作台' },
      { id: 'goto-settings', label: '前往设置' },
      { id: 'goto-billing', label: '前往账单' },
    ],
  },
];

const CommandEmptyState = () => (
  <div className="command__empty">没有匹配的命令，换个关键词试试。</div>
);

const CommandDemo = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');

  const handleOpenChange = (open: boolean) => setIsOpen(open);
  const handleOpen = () => setIsOpen(true);

  const handleAction = (key: ReactKey) => {
    setLastAction(String(key));
    setIsOpen(false);
  };

  return (
    <DemoSection label="打字实时过滤 · 方向键移动高亮 · Enter/点击触发" isColumn>
      <Button variant="outline" onClick={handleOpen}>
        打开命令面板{' '}
        <Kbd abbr="⌘" abbrTitle="Command">
          K
        </Kbd>
      </Button>
      <span>{lastAction ? `已执行：${lastAction}` : '尚未执行命令'}</span>
      <Command>
        <Command.Backdrop variant="blur" isOpen={isOpen} onOpenChange={handleOpenChange}>
          <Command.Container size="md">
            <Command.Dialog aria-label="命令面板">
              <Command.InputGroup>
                <Command.InputGroup.Prefix>⌕</Command.InputGroup.Prefix>
                <Command.InputGroup.Input placeholder="搜索命令…" />
                <Command.InputGroup.Suffix>
                  <Command.InputGroup.ClearButton />
                </Command.InputGroup.Suffix>
              </Command.InputGroup>
              <Command.List
                aria-label="命令列表"
                onAction={handleAction}
                renderEmptyState={CommandEmptyState}
              >
                {COMMAND_GROUPS.map((group) => (
                  <Command.Group key={group.heading} heading={group.heading}>
                    {group.items.map((item) => (
                      <Command.Item key={item.id} id={item.id} textValue={item.label}>
                        <span>{item.label}</span>
                        {item.shortcut !== undefined && (
                          <Kbd isLight>{item.shortcut}</Kbd>
                        )}
                      </Command.Item>
                    ))}
                  </Command.Group>
                ))}
              </Command.List>
              <Command.Footer>方向键移动 · Enter 执行 · Esc 关闭</Command.Footer>
            </Command.Dialog>
          </Command.Container>
        </Command.Backdrop>
      </Command>
    </DemoSection>
  );
};

const CONTEXT_MENU_TARGET_STYLE: CSSProperties = {
  display: 'flex',
  height: 160,
  width: 320,
  userSelect: 'none',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 12,
  border: '1px dashed var(--border)',
  color: 'var(--muted)',
  fontSize: 14,
};

const ContextMenuDemo = () => {
  const [lastItem, setLastItem] = useState<string>('');

  const handleAction = (key: ReactKey) => setLastItem(String(key));

  return (
    <>
      <DemoSection label="右键区域 → 光标处打开 · 键盘导航 · Esc/点击外部关闭" isColumn>
        <ContextMenu>
          <ContextMenu.Trigger>
            <div style={CONTEXT_MENU_TARGET_STYLE}>在此处右键</div>
          </ContextMenu.Trigger>
          <ContextMenu.Popover>
            <ContextMenu.Menu aria-label="操作" onAction={handleAction}>
              <ContextMenu.Item id="back" textValue="后退">
                后退
              </ContextMenu.Item>
              <ContextMenu.Item id="forward" textValue="前进" isDisabled>
                前进
              </ContextMenu.Item>
              <ContextMenu.Item id="reload" textValue="重新加载">
                重新加载
              </ContextMenu.Item>
              <ContextMenu.Item id="save" textValue="另存为">
                另存为…
              </ContextMenu.Item>
            </ContextMenu.Menu>
          </ContextMenu.Popover>
        </ContextMenu>
        <span>{lastItem ? `已选择：${lastItem}` : '尚未操作'}</span>
      </DemoSection>
      <DemoSection label="分组 · 分隔线 · 危险项（variant=danger）" isColumn>
        <ContextMenu>
          <ContextMenu.Trigger>
            <div style={CONTEXT_MENU_TARGET_STYLE}>右键查看完整菜单</div>
          </ContextMenu.Trigger>
          <ContextMenu.Popover>
            <ContextMenu.Menu aria-label="文件操作" onAction={handleAction}>
              <ContextMenu.Section>
                <ContextMenu.Item id="cut" textValue="剪切">
                  剪切
                </ContextMenu.Item>
                <ContextMenu.Item id="copy" textValue="复制">
                  复制
                </ContextMenu.Item>
                <ContextMenu.Item id="paste" textValue="粘贴">
                  粘贴
                </ContextMenu.Item>
              </ContextMenu.Section>
              <ContextMenu.Separator />
              <ContextMenu.Item id="rename" textValue="重命名">
                重命名
              </ContextMenu.Item>
              <ContextMenu.Item id="delete" textValue="删除" variant="danger">
                删除
              </ContextMenu.Item>
            </ContextMenu.Menu>
          </ContextMenu.Popover>
        </ContextMenu>
      </DemoSection>
    </>
  );
};

const RESIZABLE_PANEL_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
  fontSize: 14,
  color: 'var(--muted)',
};

const ResizableDemo = () => {
  const [sizes, setSizes] = useState<number[]>([50, 50]);
  const [vSizes, setVSizes] = useState<number[]>([40, 60]);

  const handleLayout = (next: number[]) => setSizes(next);
  const handleVLayout = (next: number[]) => setVSizes(next);

  return (
    <>
      <DemoSection label="水平（拖拽中缝或方向键调整两侧面板）" isColumn>
        <Resizable
          orientation="horizontal"
          onLayout={handleLayout}
          style={{ width: 520, height: 200, border: '1px solid var(--separator)', borderRadius: 12 }}
        >
          <Resizable.Panel defaultSize={50} minSize={20} style={RESIZABLE_PANEL_STYLE}>
            侧栏 {Math.round(sizes[0])}%
          </Resizable.Panel>
          <Resizable.Handle type="line" withIndicator />
          <Resizable.Panel defaultSize={50} minSize={20} style={RESIZABLE_PANEL_STYLE}>
            内容 {Math.round(sizes[1])}%
          </Resizable.Panel>
        </Resizable>
      </DemoSection>
      <DemoSection label="垂直" isColumn>
        <Resizable
          orientation="vertical"
          onLayout={handleVLayout}
          style={{ width: 360, height: 280, border: '1px solid var(--separator)', borderRadius: 12 }}
        >
          <Resizable.Panel defaultSize={40} minSize={15} style={RESIZABLE_PANEL_STYLE}>
            上 {Math.round(vSizes[0])}%
          </Resizable.Panel>
          <Resizable.Handle type="line" withIndicator />
          <Resizable.Panel defaultSize={60} minSize={15} style={RESIZABLE_PANEL_STYLE}>
            下 {Math.round(vSizes[1])}%
          </Resizable.Panel>
        </Resizable>
      </DemoSection>
    </>
  );
};

const APP_LAYOUT_NAV: { id: string; label: string }[] = [
  { id: 'dashboard', label: '仪表盘' },
  { id: 'students', label: '学员' },
  { id: 'courses', label: '课程' },
  { id: 'settings', label: '设置' },
];

const AppLayoutDemo = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [active, setActive] = useState('dashboard');

  const handleToggle = () => setSidebarOpen((v) => !v);
  const handleNav = (e: MouseEvent<HTMLButtonElement>) => {
    const id = e.currentTarget.dataset.id;
    if (id) setActive(id);
  };

  return (
    <DemoSection isColumn>
      <AppLayout
        sidebarOpen={sidebarOpen}
        onSidebarOpenChange={setSidebarOpen}
        style={{
          width: 760,
          height: 380,
          border: '1px solid var(--separator)',
          borderRadius: 12,
          overflow: 'hidden',
        }}
        sidebar={
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 12, width: 200 }}>
            {APP_LAYOUT_NAV.map((item) => (
              <Button
                key={item.id}
                data-id={item.id}
                size="sm"
                variant={item.id === active ? 'secondary' : 'ghost'}
                isFullWidth
                onClick={handleNav}
              >
                {item.label}
              </Button>
            ))}
          </nav>
        }
        navbar={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 52, padding: '0 16px' }}>
            <Button size="sm" variant="ghost" onClick={handleToggle}>
              {sidebarOpen ? '收起侧栏' : '展开侧栏'}
            </Button>
            <span style={{ fontWeight: 600 }}>{APP_LAYOUT_NAV.find((n) => n.id === active)?.label}</span>
          </div>
        }
      >
        <div style={{ padding: 24, color: 'var(--muted)' }}>
          主内容区 · 当前：{active} · 侧栏{sidebarOpen ? '展开' : '收起'}
        </div>
      </AppLayout>
    </DemoSection>
  );
};

const SIDEBAR_ITEMS: { id: string; label: string }[] = [
  { id: 'dashboard', label: '仪表盘' },
  { id: 'students', label: '学员' },
  { id: 'courses', label: '课程' },
  { id: 'settings', label: '设置' },
];

const SidebarDemo = () => {
  const [open, setOpen] = useState(true);
  const [current, setCurrent] = useState('dashboard');

  const handleOpenChange = (next: boolean) => setOpen(next);
  const handleSelect = (id: string) => () => setCurrent(id);

  return (
    <DemoSection isColumn>
      <div
        style={{
          display: 'flex',
          width: 640,
          height: 360,
          border: '1px solid var(--separator)',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        <Sidebar.Provider open={open} onOpenChange={handleOpenChange} collapsible="icon">
          <Sidebar>
            <Sidebar.Header>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px' }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  V
                </div>
                <span className="sidebar__menu-label-text" style={{ fontWeight: 600, fontSize: 14 }}>
                  Vela
                </span>
              </div>
            </Sidebar.Header>
            <Sidebar.Content>
              <Sidebar.Group>
                <Sidebar.GroupLabel>导航</Sidebar.GroupLabel>
                <Sidebar.Menu aria-label="导航">
                  {SIDEBAR_ITEMS.map((item) => (
                    <Sidebar.MenuItem
                      key={item.id}
                      id={item.id}
                      textValue={item.label}
                      isCurrent={current === item.id}
                      onAction={handleSelect(item.id)}
                    >
                      <Sidebar.MenuItemContent>
                        <Sidebar.MenuLabel>{item.label}</Sidebar.MenuLabel>
                      </Sidebar.MenuItemContent>
                    </Sidebar.MenuItem>
                  ))}
                </Sidebar.Menu>
              </Sidebar.Group>
            </Sidebar.Content>
            <Sidebar.Rail />
          </Sidebar>
          <Sidebar.Main>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16 }}>
              <Sidebar.Trigger />
              <span style={{ color: 'var(--muted)', fontSize: 14 }}>
                当前：{current} · 侧栏{open ? '展开' : '收起'}
              </span>
            </div>
          </Sidebar.Main>
        </Sidebar.Provider>
      </div>
    </DemoSection>
  );
};

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
  command: <CommandDemo />,
  'context-menu': <ContextMenuDemo />,
  resizable: <ResizableDemo />,
  'app-layout': <AppLayoutDemo />,
  sidebar: <SidebarDemo />,
};
