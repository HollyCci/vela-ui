import {
  useRef,
  useState,
  type CSSProperties,
  type Key as ReactKey,
  type MouseEvent,
  type ReactNode,
} from 'react';
import Breadcrumbs from '../../components/breadcrumbs';
import Button from '../../components/button';
import Command from '../../components/command';
import ContextMenu from '../../components/context-menu';
import Dropdown from '../../components/dropdown';
import Kbd from '../../components/kbd';
import EmojiReactionButton from '../../components/emoji-reaction-button';
import Link from '../../components/link';
import MenuItem from '../../components/menu-item';
import Meter from '../../components/meter';
import Navbar, { useNavbar } from '../../components/navbar';
import NumberValue from '../../components/number-value';
import Pagination from '../../components/pagination';
import PressableFeedback from '../../components/pressable-feedback';
import ProgressBar from '../../components/progress-bar';
import ProgressCircle from '../../components/progress-circle';
import Rating from '../../components/rating';
import Resizable from '../../components/resizable';
import AppLayout, { useAppLayout } from '../../components/app-layout';
import Sidebar from '../../components/sidebar';
import Segment from '../../components/segment';
import Stepper, { useStepperStep } from '../../components/stepper';
import Tabs from '../../components/tabs';
import Toast, { Toaster, useToast } from '../../components/toast';
import Tooltip from '../../components/tooltip';
import TrendChip from '../../components/trend-chip';
import DemoSection from '../demo-section';

type DemoKey = string | number;

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

const RatingDemo = () => (
  <DemoSection label="Usage">
    <Rating aria-label="3 out of 5 stars" defaultValue={3}>
      {RATING_VALUES.map((v) => (
        <Rating.Item key={v} value={v} />
      ))}
    </Rating>
  </DemoSection>
);

const TrendChipDemo = () => (
  <DemoSection label="Usage">
    <TrendChip trend="up" value="+3.3%" />
    <TrendChip trend="down" value="-2.1%" />
    <TrendChip trend="neutral" value="0.0%" />
  </DemoSection>
);

const NumberValueDemo = () => (
  <DemoSection label="Usage" isColumn>
    {(
      [
        ['USD', 'USD'],
        ['EUR', 'EUR'],
        ['JPY', 'JPY'],
        ['GBP', 'GBP'],
      ] as const
    ).map(([label, currency]) => (
      <div key={currency} style={VARIANT_ROW_STYLE}>
        <span style={{ ...VARIANT_MUTED_STYLE, width: 48 }}>{label}</span>
        <NumberValue
          value={228441}
          locale="en-US"
          formatOptions={{ style: 'currency', currency }}
        />
      </div>
    ))}
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
  const [isLiked, setIsLiked] = useState(true);

  return (
    <DemoSection label="Usage">
      <EmojiReactionButton isSelected={isLiked} onChange={setIsLiked}>
        <EmojiReactionButton.Emoji>❤️</EmojiReactionButton.Emoji>
        <EmojiReactionButton.Count>12</EmojiReactionButton.Count>
      </EmojiReactionButton>
      <EmojiReactionButton>
        <EmojiReactionButton.Emoji>🎉</EmojiReactionButton.Emoji>
        <EmojiReactionButton.Count>1</EmojiReactionButton.Count>
      </EmojiReactionButton>
      <EmojiReactionButton>
        <EmojiReactionButton.Emoji>👍</EmojiReactionButton.Emoji>
        <EmojiReactionButton.Count>5</EmojiReactionButton.Count>
      </EmojiReactionButton>
      <EmojiReactionButton>
        <EmojiReactionButton.Emoji>😂</EmojiReactionButton.Emoji>
        <EmojiReactionButton.Count>3</EmojiReactionButton.Count>
      </EmojiReactionButton>
      <EmojiReactionButton>
        <EmojiReactionButton.Emoji>🚀</EmojiReactionButton.Emoji>
        <EmojiReactionButton.Count>1</EmojiReactionButton.Count>
      </EmojiReactionButton>
    </DemoSection>
  );
};

const TooltipDemo = () => (
  <>
    <DemoSection label="多方向提示">
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
    <DemoSection label="带箭头提示">
      <Tooltip delay={0} closeDelay={0}>
        <Tooltip.Trigger>
          <Button variant="secondary">带箭头</Button>
        </Tooltip.Trigger>
        <Tooltip.Content placement="top" showArrow>
          <Tooltip.Arrow />
          课程详情会显示在这里
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
  const [compactPage, setCompactPage] = useState(2);

  return (
    <DemoSection isColumn>
      <Pagination count={12} page={page} onPageChange={setPage} summary={`共 120 条 · 第 ${page} 页`} />
      <Pagination count={5} page={compactPage} size="sm" onPageChange={setCompactPage} />
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
          selectedKey={secondaryKey}
          onChange={setSecondaryKey}
          variant="secondary"
          style={{ maxWidth: 480 }}
        >
          <Tabs.List aria-label="项目区块">
            <Tabs.Tab id="overview">概览</Tabs.Tab>
            <Tabs.Tab id="members">成员</Tabs.Tab>
            <Tabs.Tab id="settings">设置</Tabs.Tab>
            <Tabs.Tab id="archive" isDisabled>
              归档
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel id="overview">这里是项目概览信息。</Tabs.Panel>
          <Tabs.Panel id="members">共有 8 名成员参与本项目。</Tabs.Panel>
          <Tabs.Panel id="settings">在这里调整项目配置。</Tabs.Panel>
        </Tabs>
      </DemoSection>
    </>
  );
};


const SegmentDemo = () => {
  const [range, setRange] = useState<DemoKey>('dashboard');

  return (
    <DemoSection label="Usage">
      <Segment aria-label="View" selectedKey={range} onSelectionChange={setRange}>
        {SEGMENT_VARIANT_ITEMS.map((item) => (
          <Segment.Item key={item.id} id={item.id}>
            {item.label}
          </Segment.Item>
        ))}
      </Segment>
    </DemoSection>
  );
};

const STEPPER_STEPS = [
  { title: 'Cart', description: 'Review items' },
  { title: 'Shipping', description: 'Delivery address' },
  { title: 'Payment', description: 'Card details' },
  { title: 'Confirmation', description: 'Order placed' },
];

const StepperDemo = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const handleStepChange = (step: number) => setCurrentStep(step);

  return (
    <>
      <DemoSection label="Usage" isColumn>
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
      </DemoSection>
      <DemoSection label="Vertical">
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
        <Link href="https://github.com/HollyCci/vela-ui" isExternal>
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
  { href: '/features', label: 'Features' },
  { href: '/customers', label: 'Customers' },
  { href: '/integrations', label: 'Integrations' },
  { href: '/pricing', label: 'Pricing' },
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
  const [activeHref, setActiveHref] = useState('/customers');

  const handleMenuOpenChange = (isOpen: boolean) => setIsMenuOpen(isOpen);
  const handleNavigate = (href: string) => setActiveHref(href);
  const activeLabel =
    NAVBAR_LINKS.find((link) => link.href === activeHref)?.label ??
    (activeHref === '/settings' ? 'Settings' : 'Features');

  return (
    <>
      <DemoSection label="Usage" isColumn>
        <div ref={scrollContainerRef} style={NAVBAR_SCROLL_CONTAINER_STYLE}>
          <Navbar
            maxWidth="full"
            hideOnScroll
            parentRef={scrollContainerRef}
            navigate={handleNavigate}
          >
            <Navbar.Header>
              <Navbar.Brand>
                <strong>hero</strong>
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
                <Navbar.Item href="/settings" isCurrent={activeHref === '/settings'}>
                  Settings
                </Navbar.Item>
              </Navbar.Content>
            </Navbar.Header>
          </Navbar>
          <div style={NAVBAR_SCROLL_FILLER_STYLE}>
            Scroll down to hide the navbar, scroll up to restore. Current: {activeLabel}
          </div>
        </div>
      </DemoSection>
      <DemoSection label="With Menu" isColumn>
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
                <strong>hero</strong>
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
          {isMenuOpen ? 'Menu open (tap an item to close)' : 'Menu closed'} · Current: {activeLabel}
        </span>
      </DemoSection>
    </>
  );
};

type CommandAction = {
  id: string;
  label: string;
  description?: string;
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
      { id: 'new-file', label: '新建文件', description: '在当前工作区创建文档', shortcut: '⌘N' },
      { id: 'new-folder', label: '新建文件夹', description: '整理项目资源和组件草稿', shortcut: '⌘⇧N' },
      { id: 'search', label: '全局搜索', description: '跨页面定位组件、示例和设置', shortcut: '⌘P' },
    ],
  },
  {
    heading: '导航',
    items: [
      { id: 'goto-dashboard', label: '前往工作台', description: '查看团队当前状态' },
      { id: 'goto-settings', label: '前往设置', description: '调整偏好和权限' },
      { id: 'goto-billing', label: '前往账单', description: '管理席位与付款方式' },
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
      {/* openShortcut 开启全局 Cmd+K / Ctrl+K：命中即 onOpen 打开面板（开合仍由下方 Backdrop 受控） */}
      <Command openShortcut="mod+k" onOpen={handleOpen}>
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
              <Command.Collection
                aria-label="命令列表"
                groups={COMMAND_GROUPS}
                onAction={handleAction}
                renderEmptyState={CommandEmptyState}
              />
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
    <DemoSection label="Usage" isColumn>
      <ContextMenu>
        <ContextMenu.Trigger>
          <div style={CONTEXT_MENU_TARGET_STYLE}>Right-click here</div>
        </ContextMenu.Trigger>
        <ContextMenu.Popover>
          <ContextMenu.Menu aria-label="Actions" onAction={handleAction}>
            <ContextMenu.Item id="back" textValue="Back">
              Back
            </ContextMenu.Item>
            <ContextMenu.Item id="forward" textValue="Forward" isDisabled>
              Forward
            </ContextMenu.Item>
            <ContextMenu.Item id="reload" textValue="Reload">
              Reload
            </ContextMenu.Item>
            <ContextMenu.Item id="save" textValue="Save as">
              Save as…
            </ContextMenu.Item>
          </ContextMenu.Menu>
        </ContextMenu.Popover>
      </ContextMenu>
      {lastItem && <span style={VARIANT_MUTED_STYLE}>Selected: {lastItem}</span>}
    </DemoSection>
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
  const [sizes, setSizes] = useState<number[]>([30, 70]);
  const [vSizes, setVSizes] = useState<number[]>([40, 60]);

  const handleLayout = (next: number[]) => setSizes(next);
  const handleVLayout = (next: number[]) => setVSizes(next);

  return (
    <>
      <DemoSection label="Usage" isColumn>
        <Resizable
          orientation="horizontal"
          onLayout={handleLayout}
          style={{ width: 520, height: 200, border: '1px solid var(--separator)', borderRadius: 12 }}
        >
          <Resizable.Panel defaultSize={30} minSize={15} maxSize={45} style={RESIZABLE_PANEL_STYLE}>
            Sidebar {Math.round(sizes[0])}%
          </Resizable.Panel>
          <Resizable.Handle type="line" withIndicator />
          <Resizable.Panel defaultSize={70} minSize={20} style={RESIZABLE_PANEL_STYLE}>
            Main content {Math.round(sizes[1])}%
          </Resizable.Panel>
        </Resizable>
      </DemoSection>
      <DemoSection label="Vertical" isColumn>
        <Resizable
          orientation="vertical"
          onLayout={handleVLayout}
          style={{ width: 360, height: 280, border: '1px solid var(--separator)', borderRadius: 12 }}
        >
          <Resizable.Panel defaultSize={40} minSize={15} style={RESIZABLE_PANEL_STYLE}>
            Top {Math.round(vSizes[0])}%
          </Resizable.Panel>
          <Resizable.Handle type="line" withIndicator />
          <Resizable.Panel defaultSize={60} minSize={15} style={RESIZABLE_PANEL_STYLE}>
            Bottom {Math.round(vSizes[1])}%
          </Resizable.Panel>
        </Resizable>
      </DemoSection>
    </>
  );
};

const APP_LAYOUT_NAV: { id: string; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'tracker', label: 'Tracker' },
  { id: 'settings', label: 'Settings' },
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
    <DemoSection label="Usage" isColumn>
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
              {sidebarOpen ? 'Collapse' : 'Expand'}
            </Button>
            <span style={{ fontWeight: 600 }}>{APP_LAYOUT_NAV.find((n) => n.id === active)?.label}</span>
          </div>
        }
      >
        <div style={{ padding: 24, color: 'var(--muted)' }}>
          Main content area. Resize to mobile to see the sidebar collapse into a sheet.
        </div>
      </AppLayout>
    </DemoSection>
  );
};

const SIDEBAR_ITEMS: { id: string; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'tracker', label: 'Tracker' },
  { id: 'settings', label: 'Settings' },
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
                <Sidebar.GroupLabel>Navigation</Sidebar.GroupLabel>
                <Sidebar.Menu aria-label="Navigation">
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
          <Sidebar.Mobile>
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
                <Sidebar.GroupLabel>Navigation</Sidebar.GroupLabel>
                <Sidebar.Menu aria-label="Mobile navigation">
                  {SIDEBAR_ITEMS.map((item) => (
                    <Sidebar.MenuItem
                      key={`${item.id}-mobile`}
                      id={`${item.id}-mobile`}
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
          </Sidebar.Mobile>
          <Sidebar.Main>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16 }}>
              <Sidebar.Trigger />
              <span style={{ color: 'var(--muted)', fontSize: 14 }}>
                Main content area. Resize to mobile to see the Sheet sidebar.
              </span>
            </div>
          </Sidebar.Main>
        </Sidebar.Provider>
      </div>
    </DemoSection>
  );
};

type VariantDemoProps = {
  variant: string;
};

const VARIANT_ROW_STYLE: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 12,
  alignItems: 'center',
};

const VARIANT_COLUMN_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

const VARIANT_PANEL_STYLE: CSSProperties = {
  border: '1px solid var(--separator)',
  borderRadius: 8,
  padding: 16,
};

const VARIANT_MUTED_STYLE: CSSProperties = {
  color: 'var(--muted)',
  fontSize: 13,
};

const VARIANT_CARD_STYLE: CSSProperties = {
  ...VARIANT_PANEL_STYLE,
  minWidth: 180,
};

const RatingItems = ({
  children,
}: {
  children?: (value: number) => ReactNode;
}) => (
  <>
    {RATING_VALUES.map((value) => (
      <Rating.Item key={value} value={value}>
        {children?.(value)}
      </Rating.Item>
    ))}
  </>
);

const EmojiReactionVariantDemo = ({ variant }: VariantDemoProps) => {
  const [isSelected, setSelected] = useState(true);

  if (variant === 'sizes') {
    return (
      <DemoSection label="sizes" isColumn>
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <div key={size} style={VARIANT_ROW_STYLE}>
            <span style={{ ...VARIANT_MUTED_STYLE, width: 32 }}>{size}</span>
            <EmojiReactionButton size={size} defaultSelected>
              <EmojiReactionButton.Emoji>👍</EmojiReactionButton.Emoji>
              <EmojiReactionButton.Count>5</EmojiReactionButton.Count>
            </EmojiReactionButton>
            <EmojiReactionButton size={size}>
              <EmojiReactionButton.Emoji>😂</EmojiReactionButton.Emoji>
              <EmojiReactionButton.Count>2</EmojiReactionButton.Count>
            </EmojiReactionButton>
            <EmojiReactionButton size={size}>
              <EmojiReactionButton.Emoji>🎉</EmojiReactionButton.Emoji>
              <EmojiReactionButton.Count>1</EmojiReactionButton.Count>
            </EmojiReactionButton>
          </div>
        ))}
      </DemoSection>
    );
  }

  if (variant === 'disabled') {
    return (
      <DemoSection label="disabled">
        <EmojiReactionButton isDisabled isSelected>
          <EmojiReactionButton.Emoji>❤️</EmojiReactionButton.Emoji>
          <EmojiReactionButton.Count>12</EmojiReactionButton.Count>
        </EmojiReactionButton>
        <EmojiReactionButton isDisabled>
          <EmojiReactionButton.Emoji>👍</EmojiReactionButton.Emoji>
          <EmojiReactionButton.Count>3</EmojiReactionButton.Count>
        </EmojiReactionButton>
      </DemoSection>
    );
  }

  if (variant === 'read-only') {
    return (
      <DemoSection label="read only">
        <EmojiReactionButton isReadOnly isSelected>
          <EmojiReactionButton.Emoji>❤️</EmojiReactionButton.Emoji>
          <EmojiReactionButton.Count>12</EmojiReactionButton.Count>
        </EmojiReactionButton>
        <EmojiReactionButton isReadOnly>
          <EmojiReactionButton.Emoji>👍</EmojiReactionButton.Emoji>
          <EmojiReactionButton.Count>3</EmojiReactionButton.Count>
        </EmojiReactionButton>
      </DemoSection>
    );
  }

  return (
    <DemoSection label="default">
      <EmojiReactionButton isSelected={isSelected} onChange={setSelected}>
        <EmojiReactionButton.Emoji>❤️</EmojiReactionButton.Emoji>
        <EmojiReactionButton.Count>12</EmojiReactionButton.Count>
      </EmojiReactionButton>
      <EmojiReactionButton>
        <EmojiReactionButton.Emoji>👍</EmojiReactionButton.Emoji>
        <EmojiReactionButton.Count>5</EmojiReactionButton.Count>
      </EmojiReactionButton>
    </DemoSection>
  );
};

const NumberValueVariantDemo = ({ variant }: VariantDemoProps) => {
  if (variant === 'compact') {
    return (
      <DemoSection label="compact" isColumn>
        {[1234, 45678, 1234567, 9876543210].map((value) => (
          <div key={value} style={VARIANT_ROW_STYLE}>
            <span style={{ ...VARIANT_MUTED_STYLE, width: 120, textAlign: 'right' }}>
              {value.toLocaleString('en-US')}
            </span>
            <NumberValue
              value={value}
              locale="zh-CN"
              formatOptions={{ notation: 'compact', maximumFractionDigits: 1 }}
            />
          </div>
        ))}
      </DemoSection>
    );
  }

  if (variant === 'currency') {
    return (
      <DemoSection label="currency" isColumn>
        {(['USD', 'EUR', 'JPY', 'GBP'] as const).map((currency) => (
          <div key={currency} style={VARIANT_ROW_STYLE}>
            <span style={{ ...VARIANT_MUTED_STYLE, width: 48 }}>{currency}</span>
            <NumberValue value={228441} locale="en-US" formatOptions={{ style: 'currency', currency }} />
          </div>
        ))}
      </DemoSection>
    );
  }

  if (variant === 'format-options') {
    return (
      <DemoSection label="format options" isColumn>
        <div style={VARIANT_ROW_STYLE}>
          <span style={{ ...VARIANT_MUTED_STYLE, width: 140 }}>Compact currency</span>
          <NumberValue
            value={1235000}
            locale="zh-CN"
            formatOptions={{ style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }}
          />
        </div>
        <div style={VARIANT_ROW_STYLE}>
          <span style={{ ...VARIANT_MUTED_STYLE, width: 140 }}>Accounting</span>
          <NumberValue
            value={-1234.56}
            locale="en-US"
            formatOptions={{ style: 'currency', currency: 'USD', currencySign: 'accounting' }}
          />
        </div>
      </DemoSection>
    );
  }

  if (variant === 'percent') {
    return (
      <DemoSection label="percent" isColumn>
        <NumberValue value={0.033} formatOptions={{ style: 'percent', maximumFractionDigits: 1 }} />
        <NumberValue value={0.985} formatOptions={{ style: 'percent', maximumFractionDigits: 1 }} />
        <NumberValue value={-0.02} formatOptions={{ style: 'percent', maximumFractionDigits: 1 }} />
      </DemoSection>
    );
  }

  if (variant === 'sign-display') {
    return (
      <DemoSection label="sign display" isColumn>
        {(['auto', 'always', 'exceptZero', 'never'] as const).map((signDisplay) => (
          <div key={signDisplay} style={VARIANT_ROW_STYLE}>
            <span style={{ ...VARIANT_MUTED_STYLE, width: 96 }}>{signDisplay}</span>
            {[42, 0, -42].map((value) => (
              <NumberValue
                key={value}
                value={value}
                formatOptions={{ signDisplay }}
                style={{ width: 48, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}
              />
            ))}
          </div>
        ))}
      </DemoSection>
    );
  }

  if (variant === 'tabular-nums') {
    return (
      <DemoSection label="tabular nums" isColumn>
        {[228441, 71887, 156540, 1234, 98234].map((value) => (
          <NumberValue
            key={value}
            value={value}
            locale="en-US"
            style={{ fontVariantNumeric: 'tabular-nums', minWidth: 140, textAlign: 'right' }}
            formatOptions={{ style: 'currency', currency: 'USD' }}
          />
        ))}
      </DemoSection>
    );
  }

  if (variant === 'with-prefix-suffix') {
    return (
      <DemoSection label="prefix / suffix" isColumn>
        <NumberValue value={228441} locale="en-US" suffix="revenue" />
        <NumberValue value={1234567} locale="zh-CN" formatOptions={{ notation: 'compact', maximumFractionDigits: 1 }} suffix="users" />
        <NumberValue value={99.99} locale="en-US" formatOptions={{ style: 'currency', currency: 'USD' }} suffix="/month" />
      </DemoSection>
    );
  }

  return (
    <DemoSection label="default" isColumn>
      {(['USD', 'EUR', 'JPY', 'GBP'] as const).map((currency) => (
        <div key={currency} style={VARIANT_ROW_STYLE}>
          <span style={{ ...VARIANT_MUTED_STYLE, width: 48 }}>{currency}</span>
          <NumberValue value={228441} locale="en-US" formatOptions={{ style: 'currency', currency }} />
        </div>
      ))}
    </DemoSection>
  );
};

// 自定义指示图标：使用 currentColor 以继承趋势槽的颜色
const TargetIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path
      d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TrendChipVariantDemo = ({ variant }: VariantDemoProps) => {
  if (variant === 'sizes') {
    return (
      <DemoSection label="sizes">
        <TrendChip trend="up" value="+3.3%" size="sm" />
        <TrendChip trend="up" value="+3.3%" />
        <TrendChip trend="up" value="+3.3%" size="lg" />
      </DemoSection>
    );
  }

  if (variant === 'variants') {
    return (
      <DemoSection label="variants" isColumn>
        {(['primary', 'tertiary', 'soft'] as const).map((v) => (
          <div key={v} style={VARIANT_ROW_STYLE}>
            <span style={{ ...VARIANT_MUTED_STYLE, width: 80 }}>{v}</span>
            <TrendChip trend="up" value="+3.3%" variant={v} />
            <TrendChip trend="down" value="-2.1%" variant={v} />
            <TrendChip trend="neutral" value="0.0%" variant={v} />
          </div>
        ))}
      </DemoSection>
    );
  }

  if (variant === 'prefix-and-suffix') {
    return (
      <DemoSection label="prefix and suffix" isColumn>
        <TrendChip trend="up" prefix="$" value=" 1,234" />
        <TrendChip trend="down" value="-5.9%" suffix="vs last month" />
        <TrendChip trend="up" prefix="+ " value="3.3%" suffix="MoM" />
      </DemoSection>
    );
  }

  if (variant === 'tabular-nums') {
    return (
      <DemoSection label="tabular nums" isColumn>
        <TrendChip trend="up" value="+1.1%" style={{ fontVariantNumeric: 'tabular-nums' }} />
        <TrendChip trend="up" value="+22.2%" style={{ fontVariantNumeric: 'tabular-nums' }} />
        <TrendChip trend="down" value="-333.3%" style={{ fontVariantNumeric: 'tabular-nums' }} />
        <TrendChip trend="neutral" value="0.0%" style={{ fontVariantNumeric: 'tabular-nums' }} />
      </DemoSection>
    );
  }

  if (variant === 'custom-indicator') {
    return (
      <DemoSection label="custom indicator">
        {/* icon 覆盖默认箭头，仍沿用趋势色 */}
        <TrendChip trend="up" value="+3.3%" />
        <TrendChip trend="down" value="-2.1%" />
        <TrendChip trend="up" icon={<TargetIcon />} value="+12.5%" />
        <TrendChip trend="neutral" icon={<ShieldIcon />} value="0.0%" />
      </DemoSection>
    );
  }

  return (
    <DemoSection label="default">
      <TrendChip trend="up" value="+3.3%" />
      <TrendChip trend="down" value="-2.1%" />
      <TrendChip trend="neutral" value="0.0%" />
    </DemoSection>
  );
};

const RatingVariantDemo = ({ variant }: VariantDemoProps) => {
  const [score, setScore] = useState(3);

  if (variant === 'sizes') {
    return (
      <DemoSection label="sizes">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={VARIANT_MUTED_STYLE}>sm</span>
          <Rating aria-label="sm" size="sm" value={3} isReadOnly>
            <RatingItems />
          </Rating>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={VARIANT_MUTED_STYLE}>md</span>
          <Rating aria-label="md" value={3} isReadOnly>
            <RatingItems />
          </Rating>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={VARIANT_MUTED_STYLE}>lg</span>
          <Rating aria-label="lg" size="lg" value={3} isReadOnly>
            <RatingItems />
          </Rating>
        </div>
      </DemoSection>
    );
  }

  if (variant === 'disabled') {
    return (
      <DemoSection label="disabled">
        <Rating aria-label="disabled" value={3} isDisabled>
          <RatingItems />
        </Rating>
      </DemoSection>
    );
  }

  if (variant === 'read-only' || variant === 'read-only-fractional') {
    return (
      <DemoSection label={variant} isColumn>
        {[1.5, 2.3, 3.7, 4.2, 4.8].map((value) => (
          <div key={value} style={VARIANT_ROW_STYLE}>
            <Rating aria-label={`${value} out of 5 stars`} value={value} isReadOnly>
              <RatingItems />
            </Rating>
            <NumberValue value={value} style={{ ...VARIANT_MUTED_STYLE, marginLeft: 8 }} />
          </div>
        ))}
      </DemoSection>
    );
  }

  if (variant === 'custom-color' || variant === 'custom-color-vertical') {
    return (
      <DemoSection label="custom color" isColumn>
        {(
          [
            ['Accent', 'var(--accent)'],
            ['Danger', 'var(--danger)'],
            ['Success', 'var(--success)'],
          ] as const
        ).map(([label, color]) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={VARIANT_MUTED_STYLE}>{label}</span>
            <Rating
              aria-label={label}
              value={4}
              isReadOnly
              style={{ '--rating-active-color': color } as CSSProperties}
            >
              <RatingItems />
            </Rating>
          </div>
        ))}
      </DemoSection>
    );
  }

  if (variant === 'custom-icon-heart') {
    return (
      <DemoSection label="custom icon heart">
        <Rating aria-label="3 out of 5 hearts" value={3} icon={<span aria-hidden="true">♥</span>} isReadOnly>
          <RatingItems />
        </Rating>
      </DemoSection>
    );
  }

  if (variant === 'custom-icon-per-item') {
    return (
      <DemoSection label="custom icon per item">
        <Rating
          aria-label="3 out of 5 hearts"
          value={3}
          isReadOnly
          style={{ '--rating-active-color': 'var(--danger)' } as CSSProperties}
        >
          <RatingItems>{() => <span aria-hidden="true">♥</span>}</RatingItems>
        </Rating>
      </DemoSection>
    );
  }

  if (variant === 'render-function') {
    return (
      <DemoSection label="render function" isColumn>
        <Rating aria-label="render function" value={score} onValueChange={setScore}>
          {RATING_VALUES.map((value) => (
            <Rating.Item key={value} value={value}>
              {({ isActive }) => <span aria-hidden="true">{isActive ? '★' : '☆'}</span>}
            </Rating.Item>
          ))}
        </Rating>
        <span style={VARIANT_MUTED_STYLE}>{score > 0 ? `${score} stars` : 'No rating'}</span>
      </DemoSection>
    );
  }

  if (variant === 'product-review') {
    return (
      <DemoSection label="product review" isColumn>
        {(
          [
            ['Quality', 4.5],
            ['Value for money', 3.7],
            ['Design', 5],
            ['Durability', 2.3],
          ] as const
        ).map(([label, value]) => (
          <div key={label} style={VARIANT_ROW_STYLE}>
            <span style={{ width: 140 }}>{label}</span>
            <Rating aria-label={label} value={value} isReadOnly>
              <RatingItems />
            </Rating>
            <NumberValue value={value} style={{ ...VARIANT_MUTED_STYLE, marginLeft: 8 }} />
          </div>
        ))}
      </DemoSection>
    );
  }

  if (variant === 'with-label') {
    return (
      <DemoSection label="with label" isColumn>
        <span>How would you rate this product?</span>
        <Rating aria-label="How would you rate this product?" defaultValue={0}>
          <RatingItems />
        </Rating>
      </DemoSection>
    );
  }

  if (variant === 'controlled') {
    return (
      <DemoSection label="controlled" isColumn>
        <Rating aria-label="controlled" value={score} onValueChange={setScore}>
          <RatingItems />
        </Rating>
        <span style={VARIANT_MUTED_STYLE}>{score > 0 ? `${score} stars` : 'No rating'}</span>
      </DemoSection>
    );
  }

  return (
    <DemoSection label="default">
      <Rating aria-label="3 out of 5 stars" defaultValue={3}>
        <RatingItems />
      </Rating>
    </DemoSection>
  );
};

const StandaloneFeedbackHost = ({ kind }: { kind: 'highlight' | 'ripple' }) => (
  <PressableFeedback
    style={{
      ...VARIANT_CARD_STYLE,
      position: 'relative',
      overflow: 'hidden',
      minHeight: 84,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {kind === 'highlight' ? <PressableFeedback.Highlight /> : <PressableFeedback.Ripple />}
    standalone {kind}
  </PressableFeedback>
);

const PressableFeedbackVariantDemo = ({ variant }: VariantDemoProps) => {
  const [holdCount, setHoldCount] = useState(0);
  const [progressCount, setProgressCount] = useState(0);
  const [resetCount, setResetCount] = useState(0);

  const handleHoldComplete = () => setHoldCount((value) => value + 1);
  const handleProgressComplete = () => setProgressCount((value) => value + 1);
  const handleProgressReset = () => setResetCount((value) => value + 1);

  const progressLabel = `完成 ${progressCount} 次 · 复位 ${resetCount} 次`;

  if (variant === 'comparison') {
    return (
      <DemoSection label="comparison">
        <PressableFeedback style={PRESSABLE_BOX_STYLE}>
          <PressableFeedback.Highlight />
          Highlight
        </PressableFeedback>
        <PressableFeedback style={PRESSABLE_BOX_STYLE}>
          <PressableFeedback.Ripple />
          Ripple
        </PressableFeedback>
        <PressableFeedback style={PRESSABLE_BOX_STYLE}>
          <PressableFeedback.HoldConfirm style={HOLD_OVERLAY_STYLE}>Done</PressableFeedback.HoldConfirm>
          Hold
        </PressableFeedback>
      </DemoSection>
    );
  }

  if (variant === 'disabled') {
    return (
      <DemoSection label="disabled">
        <PressableFeedback isDisabled style={PRESSABLE_BOX_STYLE}>
          <PressableFeedback.Highlight />
          已禁用
        </PressableFeedback>
        <PressableFeedback isDisabled style={PRESSABLE_BOX_STYLE}>
          <PressableFeedback.Ripple isDisabled />
          禁用波纹
        </PressableFeedback>
      </DemoSection>
    );
  }

  if (variant === 'hold-confirm-callback') {
    return (
      <DemoSection label="hold confirm callback">
        <PressableFeedback style={PRESSABLE_BOX_STYLE}>
          <PressableFeedback.HoldConfirm style={HOLD_OVERLAY_STYLE} onComplete={handleHoldComplete}>
            已确认
          </PressableFeedback.HoldConfirm>
          按住确认
        </PressableFeedback>
        <span style={VARIANT_MUTED_STYLE}>触发 {holdCount} 次</span>
      </DemoSection>
    );
  }

  if (variant === 'hold-confirm-durations') {
    return (
      <DemoSection label="hold confirm durations">
        <PressableFeedback style={PRESSABLE_BOX_STYLE}>
          <PressableFeedback.HoldConfirm duration={700} style={PROGRESS_OVERLAY_STYLE}>
            快速
          </PressableFeedback.HoldConfirm>
          700ms
        </PressableFeedback>
        <PressableFeedback style={PRESSABLE_BOX_STYLE}>
          <PressableFeedback.HoldConfirm duration={1800} releaseDuration={450} style={HOLD_OVERLAY_STYLE}>
            慢速
          </PressableFeedback.HoldConfirm>
          1800ms
        </PressableFeedback>
      </DemoSection>
    );
  }

  if (variant === 'hold-confirm-sweep') {
    return (
      <DemoSection label="hold confirm sweep">
        {(['right', 'left', 'up', 'down'] as const).map((sweep) => (
          <PressableFeedback key={sweep} style={PRESSABLE_BOX_STYLE}>
            <PressableFeedback.HoldConfirm sweep={sweep} duration={900} style={PROGRESS_OVERLAY_STYLE}>
              {sweep}
            </PressableFeedback.HoldConfirm>
            {sweep}
          </PressableFeedback>
        ))}
      </DemoSection>
    );
  }

  if (variant === 'pressable-cards') {
    return (
      <DemoSection label="pressable cards">
        {['Growth', 'Retention'].map((label) => (
          <PressableFeedback key={label} style={{ ...VARIANT_CARD_STYLE, position: 'relative', overflow: 'hidden' }}>
            <PressableFeedback.Ripple />
            <strong>{label}</strong>
            <span style={VARIANT_MUTED_STYLE}>点击查看指标</span>
          </PressableFeedback>
        ))}
      </DemoSection>
    );
  }

  if (variant === 'progress-feedback-callback') {
    return (
      <DemoSection label="progress feedback callback">
        <PressableFeedback style={PRESSABLE_BOX_STYLE}>
          <PressableFeedback.ProgressFeedback
            onComplete={handleProgressComplete}
            onReset={handleProgressReset}
            style={PROGRESS_OVERLAY_STYLE}
          >
            已同步
          </PressableFeedback.ProgressFeedback>
          点击同步
        </PressableFeedback>
        <span style={VARIANT_MUTED_STYLE}>{progressLabel}</span>
      </DemoSection>
    );
  }

  if (variant === 'progress-feedback-durations') {
    return (
      <DemoSection label="progress feedback durations">
        <PressableFeedback style={PRESSABLE_BOX_STYLE}>
          <PressableFeedback.ProgressFeedback duration={700} resetDelay={600} style={PROGRESS_OVERLAY_STYLE}>
            快
          </PressableFeedback.ProgressFeedback>
          700ms
        </PressableFeedback>
        <PressableFeedback style={PRESSABLE_BOX_STYLE}>
          <PressableFeedback.ProgressFeedback duration={1800} resetDelay={1000} style={HOLD_OVERLAY_STYLE}>
            慢
          </PressableFeedback.ProgressFeedback>
          1800ms
        </PressableFeedback>
      </DemoSection>
    );
  }

  if (variant === 'progress-feedback-no-reset') {
    return (
      <DemoSection label="progress feedback no reset">
        <PressableFeedback style={PRESSABLE_BOX_STYLE}>
          <PressableFeedback.ProgressFeedback autoReset={false} style={PROGRESS_OVERLAY_STYLE}>
            保持完成
          </PressableFeedback.ProgressFeedback>
          点击发布
        </PressableFeedback>
      </DemoSection>
    );
  }

  if (variant === 'progress-feedback-sweep') {
    return (
      <DemoSection label="progress feedback sweep">
        {(['right', 'left', 'up', 'down'] as const).map((sweep) => (
          <PressableFeedback key={sweep} style={PRESSABLE_BOX_STYLE}>
            <PressableFeedback.ProgressFeedback sweep={sweep} duration={900} style={PROGRESS_OVERLAY_STYLE}>
              {sweep}
            </PressableFeedback.ProgressFeedback>
            {sweep}
          </PressableFeedback>
        ))}
      </DemoSection>
    );
  }

  if (variant === 'standalone-highlight') {
    return (
      <DemoSection label="standalone highlight">
        <StandaloneFeedbackHost kind="highlight" />
      </DemoSection>
    );
  }

  if (variant === 'standalone-ripple') {
    return (
      <DemoSection label="standalone ripple">
        <StandaloneFeedbackHost kind="ripple" />
      </DemoSection>
    );
  }

  if (variant === 'with-hold-confirm') {
    return (
      <DemoSection label="with hold confirm">
        <PressableFeedback style={PRESSABLE_BOX_STYLE}>
          <PressableFeedback.HoldConfirm style={HOLD_OVERLAY_STYLE}>确认</PressableFeedback.HoldConfirm>
          按住删除
        </PressableFeedback>
      </DemoSection>
    );
  }

  if (variant === 'with-progress-feedback') {
    return (
      <DemoSection label="with progress feedback">
        <PressableFeedback style={PRESSABLE_BOX_STYLE}>
          <PressableFeedback.ProgressFeedback style={PROGRESS_OVERLAY_STYLE}>完成</PressableFeedback.ProgressFeedback>
          点击购买
        </PressableFeedback>
      </DemoSection>
    );
  }

  if (variant === 'with-ripple') {
    return (
      <DemoSection label="with ripple">
        <PressableFeedback style={PRESSABLE_BOX_STYLE}>
          <PressableFeedback.Ripple hoverOpacity={0.08} pressedOpacity={0.18} />
          点击看波纹
        </PressableFeedback>
      </DemoSection>
    );
  }

  return (
    <DemoSection label={variant === 'with-highlight' ? 'with highlight' : 'default'}>
      <PressableFeedback style={PRESSABLE_BOX_STYLE}>
        <PressableFeedback.Highlight />
        悬停 / 按下
      </PressableFeedback>
    </DemoSection>
  );
};

const RESIZABLE_VARIANT_FRAME_STYLE: CSSProperties = {
  width: 520,
  height: 220,
  border: '1px solid var(--separator)',
  borderRadius: 8,
};

const ResizableTwoPanel = ({
  orientation = 'horizontal',
  handleType = 'line',
  handleVariant = 'primary',
  withIndicator = false,
  onLayout,
}: {
  orientation?: 'horizontal' | 'vertical';
  handleType?: 'line' | 'drag' | 'pill' | 'handle';
  handleVariant?: 'primary' | 'secondary' | 'tertiary';
  withIndicator?: boolean;
  onLayout?: (sizes: number[]) => void;
}) => (
  <Resizable
    orientation={orientation}
    onLayout={onLayout}
    style={{
      ...RESIZABLE_VARIANT_FRAME_STYLE,
      width: orientation === 'vertical' ? 360 : 520,
      height: orientation === 'vertical' ? 280 : 220,
    }}
  >
    <Resizable.Panel defaultSize={36} minSize={18} style={RESIZABLE_PANEL_STYLE}>
      面板 A
    </Resizable.Panel>
    <Resizable.Handle type={handleType} variant={handleVariant} withIndicator={withIndicator} />
    <Resizable.Panel defaultSize={64} minSize={24} style={RESIZABLE_PANEL_STYLE}>
      面板 B
    </Resizable.Panel>
  </Resizable>
);

const ResizableVariantDemo = ({ variant }: VariantDemoProps) => {
  const [layout, setLayout] = useState<number[]>([36, 64]);
  const [collapseState, setCollapseState] = useState('拖拽到最小宽度可折叠');
  const [persistedStatus, setPersistedStatus] = useState('已保存布局');
  const [handleSize, setHandleSize] = useState(6);

  if (variant === 'size-units') {
    return (
      <DemoSection label="size units" isColumn>
        <Resizable
          onLayout={setLayout}
          style={{ ...RESIZABLE_VARIANT_FRAME_STYLE, width: 560 }}
        >
          <Resizable.Panel defaultSize={25} minSize={15} maxSize={45} style={RESIZABLE_PANEL_STYLE}>
            辅助栏 · 25%
          </Resizable.Panel>
          <Resizable.Handle type="line" withIndicator />
          <Resizable.Panel defaultSize={75} minSize={40} style={RESIZABLE_PANEL_STYLE}>
            内容区 · 75%
          </Resizable.Panel>
        </Resizable>
        <span style={VARIANT_MUTED_STYLE}>当前尺寸：{layout.map((size) => `${Math.round(size)}%`).join(' / ')}</span>
      </DemoSection>
    );
  }

  if (variant === 'persisted-sizes') {
    const autoSaveId = 'vela-demo-resizable-persisted';

    return (
      <DemoSection label="persisted sizes" isColumn>
        <Resizable autoSaveId={autoSaveId} onLayout={setLayout} style={RESIZABLE_VARIANT_FRAME_STYLE}>
          <Resizable.Panel id="navigator" defaultSize={28} minSize={18} style={RESIZABLE_PANEL_STYLE}>
            导航面板
          </Resizable.Panel>
          <Resizable.Handle type="drag" />
          <Resizable.Panel id="editor" defaultSize={72} minSize={36} style={RESIZABLE_PANEL_STYLE}>
            编辑面板
          </Resizable.Panel>
        </Resizable>
        <div style={VARIANT_ROW_STYLE}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              window.localStorage.removeItem(`react-resizable-panels:${autoSaveId}`);
              setPersistedStatus('已重置保存尺寸');
            }}
          >
            重置尺寸
          </Button>
          <span style={VARIANT_MUTED_STYLE}>{persistedStatus} · {layout.map((size) => `${Math.round(size)}%`).join(' / ')}</span>
        </div>
      </DemoSection>
    );
  }

  if (variant === 'css-variables') {
    return (
      <DemoSection label="css variables" isColumn>
        <div style={VARIANT_ROW_STYLE}>
          {[4, 8, 12].map((size) => (
            <Button key={size} size="sm" variant={handleSize === size ? 'secondary' : 'ghost'} onClick={() => setHandleSize(size)}>
              {size}px
            </Button>
          ))}
        </div>
        <Resizable
          onLayout={setLayout}
          style={{
            ...RESIZABLE_VARIANT_FRAME_STYLE,
            '--resizable-handle-size': `${handleSize}px`,
            '--resizable-handle-hit-area': `${handleSize + 10}px`,
            '--resizable-handle-color': 'var(--color-accent-soft)',
            '--resizable-handle-color-hover': 'var(--color-accent)',
            '--resizable-indicator-pill-width': `${Math.max(4, handleSize - 1)}px`,
          } as CSSProperties}
        >
          <Resizable.Panel defaultSize={42} minSize={24} style={RESIZABLE_PANEL_STYLE}>
            变量面板
          </Resizable.Panel>
          <Resizable.Handle type="line" withIndicator />
          <Resizable.Panel defaultSize={58} minSize={30} style={RESIZABLE_PANEL_STYLE}>
            预览面板
          </Resizable.Panel>
        </Resizable>
        <span style={VARIANT_MUTED_STYLE}>握柄 {handleSize}px · {layout.map((size) => `${Math.round(size)}%`).join(' / ')}</span>
      </DemoSection>
    );
  }

  if (variant === 'nested') {
    return (
      <DemoSection label="nested" isColumn>
        <Resizable style={{ ...RESIZABLE_VARIANT_FRAME_STYLE, height: 260 }}>
          <Resizable.Panel defaultSize={34} minSize={20} style={RESIZABLE_PANEL_STYLE}>
            导航
          </Resizable.Panel>
          <Resizable.Handle type="line" withIndicator />
          <Resizable.Panel defaultSize={66} minSize={30} style={{ padding: 0 }}>
            <Resizable orientation="vertical" style={{ width: '100%', height: '100%' }}>
              <Resizable.Panel defaultSize={42} minSize={20} style={RESIZABLE_PANEL_STYLE}>
                详情
              </Resizable.Panel>
              <Resizable.Handle type="drag" />
              <Resizable.Panel defaultSize={58} minSize={20} style={RESIZABLE_PANEL_STYLE}>
                日志
              </Resizable.Panel>
            </Resizable>
          </Resizable.Panel>
        </Resizable>
      </DemoSection>
    );
  }

  if (variant === 'types') {
    return (
      <DemoSection label="handle types" isColumn>
        {(['line', 'drag', 'pill', 'handle'] as const).map((type) => (
          <ResizableTwoPanel key={type} handleType={type} withIndicator={type === 'line'} />
        ))}
      </DemoSection>
    );
  }

  if (variant === 'variants') {
    return (
      <DemoSection label="handle variants" isColumn>
        {(['primary', 'secondary', 'tertiary'] as const).map((handleVariant) => (
          <ResizableTwoPanel key={handleVariant} handleType="pill" handleVariant={handleVariant} />
        ))}
      </DemoSection>
    );
  }

  if (variant === 'vertical') {
    return (
      <DemoSection label="vertical">
        <ResizableTwoPanel orientation="vertical" handleType="line" withIndicator />
      </DemoSection>
    );
  }

  if (variant === 'with-collapse') {
    return (
      <DemoSection label="with collapse" isColumn>
        <Resizable style={RESIZABLE_VARIANT_FRAME_STYLE}>
          <Resizable.Panel
            defaultSize={30}
            minSize={12}
            collapsible
            collapsedSize={0}
            onCollapse={() => setCollapseState('侧栏已折叠')}
            onExpand={() => setCollapseState('侧栏已展开')}
            style={RESIZABLE_PANEL_STYLE}
          >
            可折叠侧栏
          </Resizable.Panel>
          <Resizable.Handle type="line" withIndicator />
          <Resizable.Panel defaultSize={70} minSize={30} style={RESIZABLE_PANEL_STYLE}>
            内容区
          </Resizable.Panel>
        </Resizable>
        <span style={VARIANT_MUTED_STYLE}>{collapseState}</span>
      </DemoSection>
    );
  }

  if (variant === 'with-indicator') {
    return (
      <DemoSection label="with indicator">
        <ResizableTwoPanel handleType="line" withIndicator />
      </DemoSection>
    );
  }

  return (
    <DemoSection label="default" isColumn>
      <ResizableTwoPanel onLayout={setLayout} />
      <span style={VARIANT_MUTED_STYLE}>当前布局：{layout.map((size) => `${Math.round(size)}%`).join(' / ')}</span>
    </DemoSection>
  );
};

const COMMAND_VARIANT_GROUPS: CommandGroup[] = [
  {
    heading: '工作区',
    items: [
      { id: 'open-dashboard', label: '打开工作台', description: '进入团队指标总览', shortcut: '⌘1' },
      { id: 'invite-member', label: '邀请成员', description: '发送团队协作邀请', shortcut: 'I' },
      { id: 'create-course', label: '创建课程', description: '生成新的课程工作流', shortcut: 'C' },
    ],
  },
  {
    heading: '系统',
    items: [
      { id: 'toggle-sidebar', label: '切换侧栏', description: '展开或收起主导航', shortcut: '⌘B' },
      { id: 'open-settings', label: '打开设置', description: '修改显示、通知和团队偏好', shortcut: '⌘,' },
    ],
  },
];

const CommandVariantDemo = ({ variant }: VariantDemoProps) => {
  const [isOpen, setOpen] = useState(false);
  const [lastAction, setLastAction] = useState('尚未执行命令');

  const size = variant === 'sizes' ? 'lg' : variant === 'minimal' ? 'sm' : 'md';
  const backdropVariant = variant === 'backdrop-variants' ? 'transparent' : variant === 'clean' ? 'blur' : 'opaque';
  const defaultInputValue = variant === 'multiple-search-terms' ? '打开 工作' : undefined;
  const filter =
    variant === 'multiple-search-terms'
      ? (textValue: string, inputValue: string) =>
          inputValue
            .split(/\s+/)
            .filter(Boolean)
            .every((term) => textValue.toLowerCase().includes(term.toLowerCase()))
      : undefined;

  const handleAction = (key: ReactKey) => {
    setLastAction(`已执行：${String(key)}`);
    setOpen(false);
  };

  const groups =
    variant === 'minimal'
      ? [{ heading: '快速操作', items: COMMAND_VARIANT_GROUPS[0].items.slice(0, 2) }]
      : COMMAND_VARIANT_GROUPS;

  return (
    <DemoSection label={variant} isColumn>
      <div style={VARIANT_ROW_STYLE}>
        <Button variant={variant === 'launcher' ? 'primary' : 'outline'} onClick={() => setOpen(true)}>
          {variant === 'launcher' ? '启动命令面板' : '打开命令面板'} <Kbd isLight>⌘K</Kbd>
        </Button>
        <span style={VARIANT_MUTED_STYLE}>{lastAction}</span>
      </div>
      <Command>
        <Command.Backdrop variant={backdropVariant} isOpen={isOpen} onOpenChange={setOpen}>
          <Command.Container size={size}>
            <Command.Dialog
              aria-label="命令面板"
              defaultInputValue={defaultInputValue}
              filter={filter}
            >
              {variant !== 'minimal' && (
                <Command.Header>
                  {variant === 'split-view' ? 'Command Center · 右侧预览当前操作' : 'Command Center'}
                </Command.Header>
              )}
              <Command.InputGroup>
                <Command.InputGroup.Prefix>⌕</Command.InputGroup.Prefix>
                <Command.InputGroup.Input
                  placeholder={variant === 'multiple-search-terms' ? '输入多个关键词…' : '搜索命令…'}
                />
                <Command.InputGroup.Suffix>
                  <Command.InputGroup.ClearButton />
                </Command.InputGroup.Suffix>
              </Command.InputGroup>
              {variant === 'dev-toolbar' && (
                <div style={{ ...VARIANT_ROW_STYLE, padding: '8px 12px' }}>
                  <Kbd isLight>⌘P</Kbd>
                  <Kbd isLight>⌘⇧P</Kbd>
                  <Kbd isLight>Esc</Kbd>
                </div>
              )}
              <Command.Collection
                aria-label="命令列表"
                groups={
                  variant === 'clean'
                    ? groups.map((group) => ({ ...group, heading: undefined }))
                    : groups
                }
                onAction={handleAction}
                renderEmptyState={CommandEmptyState}
              />
              {variant === 'split-view' && (
                <Command.Footer>
                  <span>预览：选中命令后会在当前工作区执行</span>
                </Command.Footer>
              )}
              {variant !== 'minimal' && variant !== 'split-view' && (
                <Command.Footer>方向键移动 · Enter 执行 · Esc 关闭</Command.Footer>
              )}
            </Command.Dialog>
          </Command.Container>
        </Command.Backdrop>
      </Command>
    </DemoSection>
  );
};

const ContextMenuVariantDemo = ({ variant }: VariantDemoProps) => {
  const [lastItem, setLastItem] = useState('Nothing selected');
  const [isOpen, setOpen] = useState(false);

  const handleAction = (key: ReactKey) => setLastItem(`Selected: ${String(key)}`);

  const renderMenu = () => {
    if (variant === 'with-sections') {
      return (
        <ContextMenu.Menu aria-label="File actions" onAction={handleAction}>
          <ContextMenu.Section>
            <ContextMenu.Item id="copy" textValue="Copy">Copy</ContextMenu.Item>
            <ContextMenu.Item id="paste" textValue="Paste">Paste</ContextMenu.Item>
          </ContextMenu.Section>
          <ContextMenu.Separator />
          <ContextMenu.Section>
            <ContextMenu.Item id="rename" textValue="Rename">Rename</ContextMenu.Item>
            <ContextMenu.Item id="delete" textValue="Delete" variant="danger">Delete</ContextMenu.Item>
          </ContextMenu.Section>
        </ContextMenu.Menu>
      );
    }

    if (variant === 'with-selection') {
      return (
        <ContextMenu.Menu
          aria-label="View"
          selectionMode="single"
          defaultSelectedKeys={['preview']}
          onAction={handleAction}
        >
          <ContextMenu.Item id="preview" textValue="Preview">
            <ContextMenu.ItemIndicator />
            Preview
          </ContextMenu.Item>
          <ContextMenu.Item id="split" textValue="Split">
            <ContextMenu.ItemIndicator />
            Split
          </ContextMenu.Item>
          <ContextMenu.Item id="source" textValue="Source">
            <ContextMenu.ItemIndicator />
            Source
          </ContextMenu.Item>
        </ContextMenu.Menu>
      );
    }

    if (variant === 'with-submenus') {
      return (
        <ContextMenu.Menu aria-label="With submenus" onAction={handleAction}>
          <ContextMenu.Item id="open" textValue="Open">Open</ContextMenu.Item>
          <ContextMenu.SubmenuTrigger delay={0}>
            <ContextMenu.Item id="open-with" textValue="Open with">
              Open with
              <ContextMenu.SubmenuIndicator />
            </ContextMenu.Item>
            <ContextMenu.SubmenuPopover>
              <ContextMenu.Menu aria-label="Open with" onAction={handleAction}>
                <ContextMenu.Item id="browser" textValue="Browser">Browser</ContextMenu.Item>
                <ContextMenu.Item id="editor" textValue="Editor">Editor</ContextMenu.Item>
              </ContextMenu.Menu>
            </ContextMenu.SubmenuPopover>
          </ContextMenu.SubmenuTrigger>
          <ContextMenu.Separator />
          <ContextMenu.Item id="delete" textValue="Delete" variant="danger">Delete</ContextMenu.Item>
        </ContextMenu.Menu>
      );
    }

    return (
      <ContextMenu.Menu aria-label="Actions" onAction={handleAction}>
        <ContextMenu.Item id="back" textValue="Back">Back</ContextMenu.Item>
        <ContextMenu.Item id="forward" textValue="Forward" isDisabled>
          Forward
        </ContextMenu.Item>
        <ContextMenu.Item id="reload" textValue="Reload">Reload</ContextMenu.Item>
        <ContextMenu.Item id="save" textValue="Save as">Save as…</ContextMenu.Item>
      </ContextMenu.Menu>
    );
  };

  return (
    <DemoSection label={variant} isColumn>
      {variant === 'controlled' && (
        <span style={VARIANT_MUTED_STYLE}>{isOpen ? 'Menu is open' : 'Menu is closed'}</span>
      )}
      <ContextMenu
        open={variant === 'controlled' ? isOpen : undefined}
        onOpenChange={variant === 'controlled' ? setOpen : undefined}
        isDisabled={variant === 'disabled'}
      >
        <ContextMenu.Trigger longPressDelay={variant === 'long-press' ? 550 : undefined}>
          <div style={CONTEXT_MENU_TARGET_STYLE}>
            {variant === 'disabled'
              ? 'Right-click here (disabled)'
              : variant === 'long-press'
                ? 'Long press or right-click'
                : variant === 'controlled'
                  ? 'Right-click here (controlled)'
                  : 'Right-click here'}
          </div>
        </ContextMenu.Trigger>
        <ContextMenu.Popover>{renderMenu()}</ContextMenu.Popover>
      </ContextMenu>
      {variant === 'with-selection' && (
        // 多选（checkbox）：selectionMode="multiple" 透传到底层 Menu，RAC 输出 role="menuitemcheckbox"+aria-checked，
        // ItemIndicator 反映勾选态、且多选项点击后菜单不自动关闭（与单选 radio 对照）
        <ContextMenu>
          <ContextMenu.Trigger>
            <div style={CONTEXT_MENU_TARGET_STYLE}>Right-click here (checkbox)</div>
          </ContextMenu.Trigger>
          <ContextMenu.Popover>
            <ContextMenu.Menu
              aria-label="View options"
              selectionMode="multiple"
              defaultSelectedKeys={['wrap']}
              onAction={handleAction}
            >
              <ContextMenu.Item id="wrap" textValue="Word wrap">
                <ContextMenu.ItemIndicator />
                Word wrap
              </ContextMenu.Item>
              <ContextMenu.Item id="minimap" textValue="Minimap">
                <ContextMenu.ItemIndicator />
                Minimap
              </ContextMenu.Item>
              <ContextMenu.Item id="line-numbers" textValue="Line numbers">
                <ContextMenu.ItemIndicator />
                Line numbers
              </ContextMenu.Item>
            </ContextMenu.Menu>
          </ContextMenu.Popover>
        </ContextMenu>
      )}
      {lastItem !== 'Nothing selected' && <span style={VARIANT_MUTED_STYLE}>{lastItem}</span>}
    </DemoSection>
  );
};

const NAVBAR_VARIANT_FRAME_STYLE: CSSProperties = {
  width: '100%',
  minHeight: 210,
  border: '1px solid var(--separator)',
  borderRadius: 8,
  overflow: 'hidden',
  position: 'relative',
};

const NavbarProgrammaticStatus = () => {
  const { height, isHidden, isMenuOpen, setMenuOpen } = useNavbar();

  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => setMenuOpen(!isMenuOpen)}>
        {isMenuOpen ? '关闭菜单' : '打开菜单'}
      </Button>
      <Navbar.Label>
        {height} · {isHidden ? 'hidden' : 'visible'} · {isMenuOpen ? 'open' : 'closed'}
      </Navbar.Label>
    </>
  );
};

const NavbarVariantDemo = ({ variant }: VariantDemoProps) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [isMenuOpen, setMenuOpen] = useState(
    variant === 'with-menu' ||
      variant === 'responsive-mobile-menu' ||
      variant === 'programmatic-control',
  );
  const [activeHref, setActiveHref] = useState('/app/dashboard');
  const [routeLog, setRouteLog] = useState('等待导航');
  const isCompact = variant === 'compact';

  const handleNavigate = (href: string) => {
    setActiveHref(href);
    setRouteLog(`navigate(${href})`);
  };
  const handleDropdownAction = (key: ReactKey) => setActiveHref(`/app/${String(key)}`);

  if (variant === 'compact-density') {
    return (
      <DemoSection label="compact density" isColumn>
        <div style={NAVBAR_VARIANT_FRAME_STYLE}>
          <Navbar
            position="static"
            size="sm"
            height="2.75rem"
            maxWidth="full"
            shouldBlockScroll={false}
            navigate={handleNavigate}
          >
            <Navbar.Header>
              <Navbar.Brand>
                <strong>Vela</strong>
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
                <Navbar.Item href="/app/settings" isCurrent={activeHref === '/app/settings'}>
                  设置
                </Navbar.Item>
                <Navbar.MenuToggle srLabel="Toggle compact menu" />
              </Navbar.Content>
            </Navbar.Header>
            <Navbar.Menu>
              {NAVBAR_LINKS.map((link) => (
                <Navbar.MenuItem key={link.href} href={link.href} isCurrent={activeHref === link.href}>
                  {link.label}
                </Navbar.MenuItem>
              ))}
            </Navbar.Menu>
          </Navbar>
          <div style={{ padding: 16, color: 'var(--muted)' }}>
            当前：{activeHref.replace('/app/', '')} · height 2.75rem
          </div>
        </div>
      </DemoSection>
    );
  }

  if (variant === 'positioning') {
    return (
      <DemoSection label="positioning" isColumn>
        {(['static', 'sticky', 'floating'] as const).map((position) => (
          <div key={position} style={{ ...NAVBAR_VARIANT_FRAME_STYLE, minHeight: 96 }}>
            <Navbar position={position} maxWidth="full" shouldBlockScroll={false} navigate={handleNavigate}>
              <Navbar.Header>
                <Navbar.Brand>
                  <strong>{position}</strong>
                </Navbar.Brand>
                <Navbar.Content>
                  <Navbar.Item href="/app/dashboard" isCurrent={activeHref === '/app/dashboard'}>
                    工作台
                  </Navbar.Item>
                  <Navbar.Item href="/app/schedule" isCurrent={activeHref === '/app/schedule'}>
                    排班
                  </Navbar.Item>
                </Navbar.Content>
                <Navbar.Spacer />
                <Navbar.Content>
                  <Navbar.MenuToggle srLabel={`Toggle ${position} menu`} />
                </Navbar.Content>
              </Navbar.Header>
            </Navbar>
          </div>
        ))}
      </DemoSection>
    );
  }

  const navbar = (
    <Navbar
      position={variant === 'default' ? 'sticky' : 'static'}
      size={isCompact ? 'sm' : variant === 'docs-site' ? 'lg' : 'md'}
      height={isCompact ? '3rem' : undefined}
      maxWidth={variant === 'docs-site' ? 'xl' : 'full'}
      hideOnScroll={variant === 'hide-on-scroll'}
      parentRef={scrollContainerRef}
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setMenuOpen}
      shouldBlockScroll={false}
      navigate={handleNavigate}
      aria-label={variant === 'accessibility' ? 'Primary navigation' : undefined}
    >
      <Navbar.Header>
        <Navbar.Brand>
          <strong>{variant === 'docs-site' ? 'Vela Docs' : variant === 'dashboard' ? 'Vela Admin' : 'Vela'}</strong>
        </Navbar.Brand>
        <Navbar.Content>
          {NAVBAR_LINKS.map((link) => (
            <Navbar.Item key={link.href} href={link.href} isCurrent={activeHref === link.href}>
              {link.label}
            </Navbar.Item>
          ))}
        </Navbar.Content>
        {variant === 'with-dropdowns' && (
          <Navbar.Content>
            <Dropdown>
              <Dropdown.Trigger>更多 ▾</Dropdown.Trigger>
              <Dropdown.Popover placement="bottom end">
                <Dropdown.Menu aria-label="更多导航" onAction={handleDropdownAction}>
                  <MenuItem id="reports" textValue="报表">
                    <MenuItem.Label>报表</MenuItem.Label>
                  </MenuItem>
                  <MenuItem id="billing" textValue="账单">
                    <MenuItem.Label>账单</MenuItem.Label>
                  </MenuItem>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          </Navbar.Content>
        )}
        <Navbar.Spacer />
        <Navbar.Content>
          <Navbar.Separator />
          <Navbar.Item href="/app/settings" isCurrent={activeHref === '/app/settings'}>
            设置
          </Navbar.Item>
          {variant === 'programmatic-control' ? (
            <NavbarProgrammaticStatus />
          ) : (
            <Navbar.MenuToggle
              srLabel={
                variant === 'accessibility'
                  ? 'Toggle primary navigation menu'
                  : 'Toggle navigation menu'
              }
            />
          )}
        </Navbar.Content>
      </Navbar.Header>
      <Navbar.Menu>
        {NAVBAR_LINKS.map((link) => (
          <Navbar.MenuItem key={link.href} href={link.href} isCurrent={activeHref === link.href}>
            {link.label}
          </Navbar.MenuItem>
        ))}
      </Navbar.Menu>
    </Navbar>
  );

  if (variant === 'hide-on-scroll') {
    return (
      <DemoSection label="hide on scroll" isColumn>
        <div ref={scrollContainerRef} style={{ ...NAVBAR_VARIANT_FRAME_STYLE, height: 250, overflowY: 'auto' }}>
          {navbar}
          <div style={NAVBAR_SCROLL_FILLER_STYLE}>向下滚动隐藏导航，向上滚动恢复。</div>
        </div>
      </DemoSection>
    );
  }

  return (
    <DemoSection label={variant} isColumn>
      <div style={NAVBAR_VARIANT_FRAME_STYLE}>
        {navbar}
        <div style={{ padding: 16, color: 'var(--muted)' }}>
          当前：{activeHref.replace('/app/', '')} · 菜单{isMenuOpen ? '展开' : '收起'}
          {variant === 'client-side-routing' ? ` · ${routeLog}` : ''}
          {variant === 'accessibility' ? ' · aria-current=page' : ''}
        </div>
      </div>
    </DemoSection>
  );
};

const SEGMENT_VARIANT_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'reports', label: 'Reports' },
  { id: 'settings', label: 'Settings' },
];

const SegmentVariantDemo = ({ variant }: VariantDemoProps) => {
  const [selectedKey, setSelectedKey] = useState<DemoKey>('analytics');
  const size = variant === 'theme-switcher' ? 'sm' : 'md';
  const segmentVariant = variant === 'ghost' || variant === 'without-separators' ? 'ghost' : 'default';

  if (variant === 'sizes') {
    return (
      <DemoSection label="sizes" isColumn>
        {(['sm', 'md', 'lg'] as const).map((segmentSize) => (
          <div key={segmentSize} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={VARIANT_MUTED_STYLE}>{segmentSize}</span>
            <Segment aria-label={`size ${segmentSize}`} defaultSelectedKey="dashboard" size={segmentSize}>
              {SEGMENT_VARIANT_ITEMS.map((item) => (
                <Segment.Item key={item.id} id={item.id}>{item.label}</Segment.Item>
              ))}
            </Segment>
          </div>
        ))}
      </DemoSection>
    );
  }

  if (variant === 'two-items') {
    return (
      <DemoSection label="two items">
        <Segment aria-label="Billing period" defaultSelectedKey="monthly">
          <Segment.Item id="monthly">Monthly</Segment.Item>
          <Segment.Item id="yearly">Yearly</Segment.Item>
        </Segment>
      </DemoSection>
    );
  }

  if (variant === 'disabled') {
    return (
      <DemoSection label="disabled">
        <Segment aria-label="Disabled segment" defaultSelectedKey="dashboard" isDisabled>
          {SEGMENT_VARIANT_ITEMS.map((item) => (
            <Segment.Item key={item.id} id={item.id}>{item.label}</Segment.Item>
          ))}
        </Segment>
      </DemoSection>
    );
  }

  if (variant === 'disabled-item') {
    return (
      <DemoSection label="disabled item">
        <Segment aria-label="With disabled item" defaultSelectedKey="dashboard">
          <Segment.Item id="dashboard">Dashboard</Segment.Item>
          <Segment.Item id="analytics" isDisabled>Analytics</Segment.Item>
          <Segment.Item id="reports">Reports</Segment.Item>
        </Segment>
      </DemoSection>
    );
  }

  if (variant === 'icon-expand') {
    return (
      <DemoSection label="icon expand">
        <Segment aria-label="View" selectedKey={selectedKey} onSelectionChange={setSelectedKey}>
          <Segment.Item id="dashboard">{({ isSelected }) => <span>{isSelected ? '▾' : '▸'} Dashboard</span>}</Segment.Item>
          <Segment.Item id="analytics">{({ isSelected }) => <span>{isSelected ? '▾' : '▸'} Analytics</span>}</Segment.Item>
          <Segment.Item id="reports">{({ isSelected }) => <span>{isSelected ? '▾' : '▸'} Reports</span>}</Segment.Item>
        </Segment>
      </DemoSection>
    );
  }

  if (variant === 'theme-switcher') {
    return (
      <DemoSection label="theme switcher">
        <Segment aria-label="Theme" selectedKey={selectedKey} size="sm" variant="ghost" onSelectionChange={setSelectedKey}>
          <Segment.Item id="light" aria-label="Light">☀</Segment.Item>
          <Segment.Item id="analytics" aria-label="Dark">☾</Segment.Item>
          <Segment.Item id="system" aria-label="System">🖥</Segment.Item>
        </Segment>
      </DemoSection>
    );
  }

  if (variant === 'with-icons') {
    return (
      <DemoSection label="with icons">
        <Segment aria-label="View" defaultSelectedKey="dashboard">
          <Segment.Item id="dashboard">▦ Dashboard</Segment.Item>
          <Segment.Item id="analytics">▤ Analytics</Segment.Item>
          <Segment.Item id="team">◉ Team</Segment.Item>
          <Segment.Item id="settings">⚙ Settings</Segment.Item>
        </Segment>
      </DemoSection>
    );
  }

  return (
    <DemoSection label={variant} isColumn>
      <Segment
        aria-label="Statistics range"
        selectedKey={variant === 'controlled' ? selectedKey : undefined}
        defaultSelectedKey={variant === 'controlled' ? undefined : 'dashboard'}
        size={size}
        variant={segmentVariant}
        showSeparators={variant !== 'without-separators'}
        onSelectionChange={variant === 'controlled' ? setSelectedKey : undefined}
      >
        {SEGMENT_VARIANT_ITEMS.map((item) => (
          <Segment.Item key={item.id} id={item.id}>{item.label}</Segment.Item>
        ))}
      </Segment>
      {variant === 'controlled' && <span style={VARIANT_MUTED_STYLE}>Selected: <strong>{String(selectedKey)}</strong></span>}
    </DemoSection>
  );
};

const SIDEBAR_VARIANT_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '⌂', chip: '12' },
  { id: 'analytics', label: 'Analytics', icon: '◉', chip: '4' },
  { id: 'tracker', label: 'Tracker', icon: '◇' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
];

const SIDEBAR_VARIANT_FRAME_STYLE: CSSProperties = {
  display: 'flex',
  width: 720,
  height: 380,
  border: '1px solid var(--separator)',
  borderRadius: 8,
  overflow: 'hidden',
};

const SidebarVariantMenuRows = ({
  current,
  onSelect,
  withIcons = true,
  withChips = false,
  withActions = false,
}: {
  current: string;
  onSelect: (id: string) => () => void;
  withIcons?: boolean;
  withChips?: boolean;
  withActions?: boolean;
}) => (
  <>
    {SIDEBAR_VARIANT_ITEMS.map((item) => (
      <Sidebar.MenuItem
        key={item.id}
        id={item.id}
        textValue={item.label}
        isCurrent={current === item.id}
        onAction={onSelect(item.id)}
      >
        <Sidebar.MenuItemContent>
          {withIcons && <Sidebar.MenuIcon>{item.icon}</Sidebar.MenuIcon>}
          <Sidebar.MenuLabel>{item.label}</Sidebar.MenuLabel>
          {withChips && item.chip !== undefined && <Sidebar.MenuChip>{item.chip}</Sidebar.MenuChip>}
          {withActions && (
            <Sidebar.MenuActions>
              <Sidebar.MenuAction aria-label={`${item.label} 更多操作`}>⋯</Sidebar.MenuAction>
            </Sidebar.MenuActions>
          )}
        </Sidebar.MenuItemContent>
      </Sidebar.MenuItem>
    ))}
  </>
);

const readSidebarCookieState = () => {
  if (typeof document === 'undefined') return true;
  const match = /(?:^|;\s*)sidebar_state=(true|false)/.exec(document.cookie);
  return match === null ? true : match[1] === 'true';
};

const SidebarVariantDemo = ({ variant }: VariantDemoProps) => {
  const [open, setOpen] = useState(variant !== 'icon-only');
  const [current, setCurrent] = useState('dashboard');
  const [routePath, setRoutePath] = useState('/app/dashboard');
  const [persistedOpen, setPersistedOpen] = useState(readSidebarCookieState);
  const [persistedMessage, setPersistedMessage] = useState(
    readSidebarCookieState() ? 'sidebar_state=true' : 'sidebar_state=false',
  );
  const side = variant === 'right-side' ? 'right' : 'left';
  const sidebarVariant = variant === 'floating-variant' ? 'floating' : variant === 'inset-variant' ? 'inset' : 'sidebar';
  const collapsible = variant === 'collapsible' || variant === 'collapsible-groups' ? 'offcanvas' : 'icon';
  const showGroups =
    variant === 'with-groups' ||
    variant === 'collapsible-groups' ||
    variant === 'complex' ||
    variant === 'agent-hub' ||
    variant === 'agent-workspace' ||
    variant === 'meeting-notes';
  const withAvatar =
    variant === 'with-avatar' ||
    variant === 'compact-with-user-menu' ||
    variant === 'agent-hub' ||
    variant === 'agent-workspace';
  const withActions = variant === 'complex' || variant === 'meeting-notes';

  const handleOpenChange = (next: boolean) => setOpen(next);
  const handleSelect = (id: string) => () => setCurrent(id);

  if (variant === 'persisted-state') {
    return (
      <DemoSection label="persisted state" isColumn>
        <div style={SIDEBAR_VARIANT_FRAME_STYLE}>
          <Sidebar.Provider
            defaultOpen={persistedOpen}
            onOpenChange={(next) => {
              setPersistedOpen(next);
              setPersistedMessage(`sidebar_state=${String(next)}`);
            }}
            toggleShortcut={false}
          >
            <Sidebar>
              <Sidebar.Header>
                <div style={{ padding: '8px 4px', fontWeight: 600 }}>Vela</div>
              </Sidebar.Header>
              <Sidebar.Content>
                <Sidebar.Group>
                  <Sidebar.Menu aria-label="持久化导航">
                    <SidebarVariantMenuRows current={current} onSelect={handleSelect} />
                  </Sidebar.Menu>
                </Sidebar.Group>
              </Sidebar.Content>
              <Sidebar.Rail />
            </Sidebar>
            <Sidebar.Main>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16 }}>
                <Sidebar.Trigger />
                <span style={VARIANT_MUTED_STYLE}>{persistedMessage}</span>
              </div>
              <div style={{ padding: 16, ...VARIANT_MUTED_STYLE }}>
                非受控开合会写入 cookie，下一次用 defaultOpen 还原。
              </div>
            </Sidebar.Main>
          </Sidebar.Provider>
        </div>
      </DemoSection>
    );
  }

  if (variant === 'client-side-routing') {
    return (
      <DemoSection label="client-side routing" isColumn>
        <div style={SIDEBAR_VARIANT_FRAME_STYLE}>
          <Sidebar.Provider
            open={open}
            onOpenChange={handleOpenChange}
            navigate={(href) => setRoutePath(href)}
            toggleShortcut={false}
          >
            <Sidebar>
              <Sidebar.Header>
                <div style={{ padding: '8px 4px', fontWeight: 600 }}>Vela</div>
              </Sidebar.Header>
              <Sidebar.Content>
                <Sidebar.Group>
                  <Sidebar.GroupLabel>Routes</Sidebar.GroupLabel>
                  <Sidebar.Menu aria-label="客户端路由">
                    {SIDEBAR_VARIANT_ITEMS.map((item) => {
                      const href = `/app/${item.id}`;
                      return (
                        <Sidebar.MenuItem
                          key={item.id}
                          id={item.id}
                          href={href}
                          textValue={item.label}
                          isCurrent={routePath === href}
                        >
                          <Sidebar.MenuItemContent>
                            <Sidebar.MenuIcon>{item.icon}</Sidebar.MenuIcon>
                            <Sidebar.MenuLabel>{item.label}</Sidebar.MenuLabel>
                          </Sidebar.MenuItemContent>
                        </Sidebar.MenuItem>
                      );
                    })}
                  </Sidebar.Menu>
                </Sidebar.Group>
              </Sidebar.Content>
              <Sidebar.Rail />
            </Sidebar>
            <Sidebar.Main>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16 }}>
                <Sidebar.Trigger />
                <span style={VARIANT_MUTED_STYLE}>navigate({routePath})</span>
              </div>
              <div style={{ padding: 16, ...VARIANT_MUTED_STYLE }}>当前路径：{routePath}</div>
            </Sidebar.Main>
          </Sidebar.Provider>
        </div>
      </DemoSection>
    );
  }

  return (
    <DemoSection label={variant} isColumn>
      <div style={SIDEBAR_VARIANT_FRAME_STYLE}>
        <Sidebar.Provider
          open={open}
          onOpenChange={handleOpenChange}
          side={side}
          variant={sidebarVariant}
          collapsible={collapsible}
          reduceMotion={variant === 'reduced-motion'}
          toggleShortcut={variant === 'keyboard-shortcut' ? 'mod+b' : false}
        >
          <Sidebar>
            <Sidebar.Header>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px' }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: withAvatar ? '50%' : 8,
                    background: 'var(--accent)',
                    color: 'var(--accent-foreground)',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 700,
                  }}
                >
                  {withAvatar ? '吴' : 'V'}
                </div>
                <span className="sidebar__menu-label-text" style={{ fontWeight: 600 }}>
                  {variant === 'agent-hub' ? 'Agent Hub' : variant === 'meeting-notes' ? 'Meeting Notes' : 'Vela'}
                </span>
              </div>
            </Sidebar.Header>
            <Sidebar.Content>
              {showGroups ? (
                <>
                  <Sidebar.Group>
                    <Sidebar.GroupLabel>{variant === 'meeting-notes' ? '本周会议' : '工作区'}</Sidebar.GroupLabel>
                    <Sidebar.Menu aria-label="工作区" showGuideLines={variant === 'complex' ? 'hover' : true}>
                      <SidebarVariantMenuRows
                        current={current}
                        onSelect={handleSelect}
                        withChips={variant === 'agent-hub' || variant === 'meeting-notes'}
                        withActions={withActions}
                      />
                    </Sidebar.Menu>
                  </Sidebar.Group>
                  <Sidebar.Group>
                    <Sidebar.GroupLabel>收藏</Sidebar.GroupLabel>
                    <Sidebar.Menu aria-label="收藏">
                      <Sidebar.MenuItem id="playbooks" textValue="Playbooks" onAction={handleSelect('playbooks')}>
                        <Sidebar.MenuItemContent>
                          <Sidebar.MenuIcon>✦</Sidebar.MenuIcon>
                          <Sidebar.MenuLabel>Playbooks</Sidebar.MenuLabel>
                        </Sidebar.MenuItemContent>
                      </Sidebar.MenuItem>
                    </Sidebar.Menu>
                  </Sidebar.Group>
                </>
              ) : (
                <Sidebar.Group>
                  <Sidebar.Menu aria-label="导航" showGuideLines={variant !== 'reduced-motion'}>
                    <SidebarVariantMenuRows
                      current={current}
                      onSelect={handleSelect}
                      withIcons={variant !== 'default'}
                      withChips={variant === 'compact-with-user-menu'}
                    />
                  </Sidebar.Menu>
                </Sidebar.Group>
              )}
            </Sidebar.Content>
            {(variant === 'compact-with-user-menu' || withAvatar) && (
              <Sidebar.Footer>
                <Sidebar.Menu aria-label="用户">
                  <Sidebar.MenuItem id="profile" textValue="个人设置" onAction={handleSelect('profile')}>
                    <Sidebar.MenuItemContent>
                      <Sidebar.MenuIcon>●</Sidebar.MenuIcon>
                      <Sidebar.MenuLabel>吴老师</Sidebar.MenuLabel>
                      <Sidebar.MenuChip>Pro</Sidebar.MenuChip>
                    </Sidebar.MenuItemContent>
                  </Sidebar.MenuItem>
                </Sidebar.Menu>
              </Sidebar.Footer>
            )}
            <Sidebar.Rail />
          </Sidebar>
          <Sidebar.Mobile>
            <Sidebar.Header>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px' }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: withAvatar ? '50%' : 8,
                    background: 'var(--accent)',
                    color: 'var(--accent-foreground)',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 700,
                  }}
                >
                  {withAvatar ? '吴' : 'V'}
                </div>
                <span className="sidebar__menu-label-text" style={{ fontWeight: 600 }}>
                  {variant === 'agent-hub' ? 'Agent Hub' : variant === 'meeting-notes' ? 'Meeting Notes' : 'Vela'}
                </span>
              </div>
            </Sidebar.Header>
            <Sidebar.Content>
              {showGroups ? (
                <>
                  <Sidebar.Group>
                    <Sidebar.GroupLabel>{variant === 'meeting-notes' ? '本周会议' : '工作区'}</Sidebar.GroupLabel>
                    <Sidebar.Menu aria-label="移动端工作区" showGuideLines={variant === 'complex' ? 'hover' : true}>
                      <SidebarVariantMenuRows
                        current={current}
                        onSelect={handleSelect}
                        withChips={variant === 'agent-hub' || variant === 'meeting-notes'}
                        withActions={withActions}
                      />
                    </Sidebar.Menu>
                  </Sidebar.Group>
                  <Sidebar.Group>
                    <Sidebar.GroupLabel>收藏</Sidebar.GroupLabel>
                    <Sidebar.Menu aria-label="移动端收藏">
                      <Sidebar.MenuItem id="playbooks-mobile" textValue="Playbooks" onAction={handleSelect('playbooks')}>
                        <Sidebar.MenuItemContent>
                          <Sidebar.MenuIcon>✦</Sidebar.MenuIcon>
                          <Sidebar.MenuLabel>Playbooks</Sidebar.MenuLabel>
                        </Sidebar.MenuItemContent>
                      </Sidebar.MenuItem>
                    </Sidebar.Menu>
                  </Sidebar.Group>
                </>
              ) : (
                <Sidebar.Group>
                  <Sidebar.Menu aria-label="移动端导航" showGuideLines={variant !== 'reduced-motion'}>
                    <SidebarVariantMenuRows
                      current={current}
                      onSelect={handleSelect}
                      withIcons={variant !== 'default'}
                      withChips={variant === 'compact-with-user-menu'}
                    />
                  </Sidebar.Menu>
                </Sidebar.Group>
              )}
            </Sidebar.Content>
            {(variant === 'compact-with-user-menu' || withAvatar) && (
              <Sidebar.Footer>
                <Sidebar.Menu aria-label="移动端用户">
                  <Sidebar.MenuItem id="profile-mobile" textValue="个人设置" onAction={handleSelect('profile')}>
                    <Sidebar.MenuItemContent>
                      <Sidebar.MenuIcon>●</Sidebar.MenuIcon>
                      <Sidebar.MenuLabel>吴老师</Sidebar.MenuLabel>
                      <Sidebar.MenuChip>Pro</Sidebar.MenuChip>
                    </Sidebar.MenuItemContent>
                  </Sidebar.MenuItem>
                </Sidebar.Menu>
              </Sidebar.Footer>
            )}
          </Sidebar.Mobile>
          <Sidebar.Main>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16 }}>
              <Sidebar.Trigger />
              <span style={VARIANT_MUTED_STYLE}>
                当前：{current} · {open ? '展开' : '收起'} · {side === 'right' ? '右侧' : sidebarVariant}
                {variant === 'keyboard-shortcut' ? ' · Ctrl/Cmd+B' : ''}
              </span>
            </div>
            <div style={{ padding: 16, ...VARIANT_MUTED_STYLE }}>
              {variant === 'agent-workspace'
                ? 'Agent 运行队列、工具调用和工作区文件。'
                : variant === 'meeting-notes'
                  ? '会议纪要、待办和发言摘要。'
                  : '主内容区跟随侧栏状态调整。'}
            </div>
          </Sidebar.Main>
        </Sidebar.Provider>
      </div>
    </DemoSection>
  );
};

const APP_LAYOUT_VARIANT_STYLE: CSSProperties = {
  width: 780,
  height: 390,
  minHeight: 390,
  border: '1px solid var(--separator)',
  borderRadius: 8,
  overflow: 'hidden',
};

const APP_LAYOUT_VARIANT_ROWS = Array.from({ length: 8 }, (_, index) => `内容块 ${index + 1}`);

const AppLayoutSidebarContent = ({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (id: string) => void;
}) => (
  <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 12, width: 210 }}>
    {APP_LAYOUT_NAV.map((item) => (
      <Button
        key={item.id}
        size="sm"
        variant={active === item.id ? 'secondary' : 'ghost'}
        isFullWidth
        onClick={() => onSelect(item.id)}
      >
        {item.label}
      </Button>
    ))}
  </nav>
);

const AppLayoutRouteActions = () => {
  const layout = useAppLayout();

  return (
    <div style={{ ...VARIANT_PANEL_STYLE, margin: '12px 16px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {APP_LAYOUT_NAV.map((item) => (
        <Button key={item.id} size="sm" variant="ghost" onClick={() => layout?.navigate?.(`/app/${item.id}`)}>
          {item.label}
        </Button>
      ))}
    </div>
  );
};

const AppLayoutVariantDemo = ({ variant }: VariantDemoProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(!variant.includes('offcanvas'));
  const [asideOpen, setAsideOpen] = useState(true);
  const [active, setActive] = useState('dashboard');
  const [routePath, setRoutePath] = useState('/app/dashboard');

  const hasAside =
    variant === 'with-aside' ||
    variant === 'resizable-sidebar' ||
    variant === 'complex' ||
    variant === 'with-toolbar' ||
    variant === 'inset-dashboard' ||
    variant === 'persisted-state' ||
    variant === 'aside-keyboard-shortcut' ||
    variant === 'mobile-aside-sheet' ||
    variant === 'mobile-behavior' ||
    variant === 'controlled-state';
  const sidebarVariant =
    variant === 'floating-sidebar' ? 'floating' : variant === 'inset-dashboard' || variant === 'with-inset-sidebar' ? 'inset' : 'sidebar';
  const sidebarCollapsible =
    variant === 'offcanvas' || variant === 'resizable-sidebar' ? 'offcanvas' : variant === 'resizable-sidebar' ? 'none' : 'icon';
  const isResizableSidebar = variant === 'resizable-sidebar';
  const isResizableAside = variant === 'resizable-sidebar' || variant === 'complex';
  const scrollMode = variant === 'content-scroll' ? 'content' : 'page';
  const showToolbar = variant === 'with-toolbar' || variant === 'with-breadcrumbs' || variant === 'docs-site' || variant === 'complex';
  const isPersistedState = variant === 'persisted-state';
  const isControlledState = variant === 'controlled-state';
  const isSheetAside = variant === 'mobile-aside-sheet' || variant === 'mobile-behavior' || variant === 'offcanvas';

  const sidebar = (
    <AppLayoutSidebarContent active={active} onSelect={setActive} />
  );
  const aside = hasAside ? (
    <div style={{ padding: 16, ...VARIANT_COLUMN_STYLE }}>
      <strong>上下文</strong>
      <span style={VARIANT_MUTED_STYLE}>当前模块：{active}</span>
      <TrendChip trend="up" value="8.2%" suffix="活跃" size="sm" />
    </div>
  ) : null;
  const navbar =
    variant === 'navbar-adaptation' ? (
      <Navbar position="floating" maxWidth="full" shouldBlockScroll={false}>
        <Navbar.Header>
          <Navbar.Brand>
            <strong>Vela</strong>
          </Navbar.Brand>
          <Navbar.Content>
            {APP_LAYOUT_NAV.slice(0, 3).map((item) => (
              <Navbar.Item
                key={item.id}
                href={`/app/${item.id}`}
                isCurrent={routePath === `/app/${item.id}`}
              >
                {item.label}
              </Navbar.Item>
            ))}
          </Navbar.Content>
          <Navbar.Spacer />
          <Navbar.Content>
            <Navbar.MenuToggle />
          </Navbar.Content>
        </Navbar.Header>
      </Navbar>
    ) : (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 52, padding: '0 16px' }}>
      <AppLayout.MenuToggle tooltip="打开导航" />
      <Button size="sm" variant="ghost" onClick={() => setSidebarOpen((open) => !open)}>
        {sidebarOpen ? '收起侧栏' : '展开侧栏'}
      </Button>
      <strong>{variant === 'docs-site' ? 'Vela Docs' : 'Vela Console'}</strong>
      <span style={{ flex: 1 }} />
      {hasAside && <AppLayout.AsideTrigger closedTooltip="打开详情" openTooltip="关闭详情" />}
    </div>
    );
  const toolbar = showToolbar ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px' }}>
      {variant === 'with-breadcrumbs' || variant === 'docs-site' ? (
        <Breadcrumbs>
          <Breadcrumbs.Item label="Docs" href="/docs" />
          <Breadcrumbs.Item label="Navigation" href="/docs/navigation" />
          <Breadcrumbs.Item label="AppLayout" isCurrent />
        </Breadcrumbs>
      ) : (
        <Segment aria-label="视图" size="sm" defaultSelectedKey="overview">
          <Segment.Item id="overview">概览</Segment.Item>
          <Segment.Item id="timeline">时间线</Segment.Item>
        </Segment>
      )}
    </div>
  ) : null;

  return (
    <DemoSection label={variant} isColumn>
      <AppLayout
        sidebar={sidebar}
        navbar={navbar}
        aside={aside}
        toolbar={toolbar}
        footer={variant === 'complex' || variant === 'with-toolbar' ? <div style={{ padding: 12, ...VARIANT_MUTED_STYLE }}>已同步 · 3 个任务待处理</div> : undefined}
        sidebarOpen={isPersistedState ? undefined : sidebarOpen}
        defaultSidebarOpen={sidebarOpen}
        onSidebarOpenChange={setSidebarOpen}
        asideOpen={isPersistedState ? undefined : asideOpen}
        defaultAsideOpen={asideOpen}
        onAsideOpenChange={setAsideOpen}
        sidebarVariant={sidebarVariant}
        sidebarCollapsible={isResizableSidebar ? 'none' : sidebarCollapsible}
        sidebarResizable={isResizableSidebar}
        asideResizable={isResizableAside}
        sidebarDefaultSize={24}
        asideDefaultSize={24}
        scrollMode={scrollMode}
        asideMobile={isSheetAside ? 'sheet' : 'hidden'}
        navigate={(href) => {
          setRoutePath(href);
          setActive(href.replace('/app/', ''));
        }}
        toggleShortcut={variant === 'mobile-behavior' ? 'mod+b' : false}
        asideToggleShortcut={variant === 'aside-keyboard-shortcut' ? 'mod+.' : false}
        style={APP_LAYOUT_VARIANT_STYLE}
      >
        {variant === 'client-side-routing' && <AppLayoutRouteActions />}
        {isControlledState && (
          <div style={{ ...VARIANT_PANEL_STYLE, margin: '12px 16px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button size="sm" variant="secondary" onClick={() => setSidebarOpen((open) => !open)}>
              {sidebarOpen ? '关闭侧栏' : '打开侧栏'}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setAsideOpen((open) => !open)}>
              {asideOpen ? '关闭详情' : '打开详情'}
            </Button>
            <span style={VARIANT_MUTED_STYLE}>
              sidebar={String(sidebarOpen)} · aside={String(asideOpen)}
            </span>
          </div>
        )}
        {APP_LAYOUT_VARIANT_ROWS.map((row) => (
          <div key={row} style={{ ...VARIANT_PANEL_STYLE, margin: '12px 16px' }}>
            <strong>{row}</strong>
            <p style={{ ...VARIANT_MUTED_STYLE, margin: '6px 0 0' }}>
              {variant === 'content-scroll'
                ? '主内容区域独立滚动。'
                : variant === 'aside-keyboard-shortcut'
                  ? `按 Ctrl/Cmd+. 切换详情 · ${asideOpen ? '打开' : '关闭'}`
                  : variant === 'persisted-state'
                    ? `sidebar_state / aside_state 会随非受控开合写入 cookie。`
                    : variant === 'client-side-routing' || variant === 'navbar-adaptation'
                      ? `当前路径 ${routePath}`
                      : `当前 ${active} 模块的工作内容。`}
            </p>
          </div>
        ))}
        <AppLayout.MobileAside>
          <div style={{ padding: 16 }}>移动端详情面板</div>
        </AppLayout.MobileAside>
      </AppLayout>
    </DemoSection>
  );
};

const STEPPER_VARIANT_STEPS = [
  { title: 'Cart', description: 'Review items', icon: '1' },
  { title: 'Shipping', description: 'Delivery address', icon: '2' },
  { title: 'Payment', description: 'Card details', icon: '3' },
  { title: 'Confirmation', description: 'Order placed', icon: '4' },
];

const StepperStatusIcon = ({ mode }: { mode: 'complete' | 'dynamic' }) => {
  const { index, status } = useStepperStep();
  if (mode === 'complete') {
    return <Stepper.Icon>{status === 'complete' ? '✓' : index + 1}</Stepper.Icon>;
  }
  return <Stepper.Icon>{status === 'complete' ? '✓' : status === 'active' ? '●' : '○'}</Stepper.Icon>;
};

const StepperStatusLabel = () => {
  const { status } = useStepperStep();
  return <span style={VARIANT_MUTED_STYLE}>{status}</span>;
};

const renderStepperVariantSteps = ({
  variant,
  withDescriptions,
}: {
  variant: string;
  withDescriptions?: boolean;
}) => (
  <>
    {STEPPER_VARIANT_STEPS.map((step) => (
      <Stepper.Step key={step.title}>
        <Stepper.Indicator>
          {variant === 'bullet-steps' ? (
            <span aria-hidden="true">•</span>
          ) : variant === 'custom-completed-icon' ? (
            <StepperStatusIcon mode="complete" />
          ) : variant === 'dynamic-icon' ? (
            <StepperStatusIcon mode="dynamic" />
          ) : variant === 'with-icons' || variant === 'vertical-with-icons' ? (
            <Stepper.Icon>{step.icon}</Stepper.Icon>
          ) : undefined}
        </Stepper.Indicator>
        <Stepper.Content>
          <Stepper.Title>{step.title}</Stepper.Title>
          {(withDescriptions || variant === 'render-function') && (
            <Stepper.Description>
              {step.description}
              {variant === 'render-function' && <> · <StepperStatusLabel /></>}
            </Stepper.Description>
          )}
        </Stepper.Content>
      </Stepper.Step>
    ))}
  </>
);

const StepperVariantDemo = ({ variant }: VariantDemoProps) => {
  const [currentStep, setCurrentStep] = useState(variant.includes('timeline') || variant.includes('tracking') ? 2 : 1);
  const isVertical =
    variant.includes('vertical') ||
    variant.includes('timeline') ||
    variant === 'package-tracking' ||
    variant === 'free-trial-timeline' ||
    variant === 'onboarding-timeline';
  const size = variant.includes('sizes') ? 'lg' : variant === 'bullet-steps' ? 'sm' : 'md';
  const withDescriptions =
    variant === 'with-descriptions' ||
    variant.includes('timeline') ||
    variant === 'package-tracking' ||
    isVertical;
  const isInteractive = variant === 'controlled' || variant === 'controlled-vertical';
  const customColorStyle =
    variant === 'custom-color' || variant === 'custom-color-vertical'
      ? ({
          '--stepper-active-color': 'var(--success)',
          '--stepper-complete-color': 'var(--success)',
          '--stepper-complete-fg': 'var(--success-foreground)',
        } as CSSProperties)
      : undefined;

  if (variant === 'sizes') {
    return (
      <DemoSection label="sizes" isColumn>
        {(['sm', 'md', 'lg'] as const).map((stepperSize) => (
          <Stepper key={stepperSize} size={stepperSize} currentStep={1}>
            {renderStepperVariantSteps({ variant: 'default' })}
          </Stepper>
        ))}
      </DemoSection>
    );
  }

  if (variant === 'vertical-sizes') {
    return (
      <DemoSection label="vertical sizes">
        {(['sm', 'md', 'lg'] as const).map((stepperSize) => (
          <Stepper key={stepperSize} orientation="vertical" size={stepperSize} currentStep={1}>
            {renderStepperVariantSteps({ variant: 'default', withDescriptions: true })}
          </Stepper>
        ))}
      </DemoSection>
    );
  }

  return (
    <DemoSection label={variant} isColumn>
      <Stepper
        orientation={isVertical ? 'vertical' : 'horizontal'}
        size={size}
        currentStep={variant === 'default' ? undefined : currentStep}
        defaultStep={variant === 'default' ? 1 : undefined}
        onStepChange={isInteractive ? setCurrentStep : undefined}
        style={{ maxWidth: isVertical ? 360 : 660, ...customColorStyle }}
      >
        {renderStepperVariantSteps({
          variant:
            variant === 'custom-completed-icon'
              ? 'custom-completed-icon'
              : variant === 'dynamic-icon'
                ? 'dynamic-icon'
                : variant === 'bullet-steps'
                  ? 'bullet-steps'
                  : variant === 'with-icons' || variant === 'vertical-with-icons'
                    ? variant
                    : variant === 'render-function'
                      ? 'render-function'
                      : 'default',
          withDescriptions,
        })}
      </Stepper>
      {isInteractive && (
        <span style={VARIANT_MUTED_STYLE}>Step {currentStep + 1} of {STEPPER_VARIANT_STEPS.length}</span>
      )}
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

export const feedbackNavVariantDemos: Record<string, ReactNode> = {
  'emoji-reaction-button-default': <EmojiReactionVariantDemo variant="default" />,
  'emoji-reaction-button-disabled': <EmojiReactionVariantDemo variant="disabled" />,
  'emoji-reaction-button-read-only': <EmojiReactionVariantDemo variant="read-only" />,
  'emoji-reaction-button-sizes': <EmojiReactionVariantDemo variant="sizes" />,

  'number-value-compact': <NumberValueVariantDemo variant="compact" />,
  'number-value-currency': <NumberValueVariantDemo variant="currency" />,
  'number-value-default': <NumberValueVariantDemo variant="default" />,
  'number-value-format-options': <NumberValueVariantDemo variant="format-options" />,
  'number-value-percent': <NumberValueVariantDemo variant="percent" />,
  'number-value-sign-display': <NumberValueVariantDemo variant="sign-display" />,
  'number-value-tabular-nums': <NumberValueVariantDemo variant="tabular-nums" />,
  'number-value-with-prefix-suffix': <NumberValueVariantDemo variant="with-prefix-suffix" />,

  'pressable-feedback-comparison': <PressableFeedbackVariantDemo variant="comparison" />,
  'pressable-feedback-default': <PressableFeedbackVariantDemo variant="default" />,
  'pressable-feedback-disabled': <PressableFeedbackVariantDemo variant="disabled" />,
  'pressable-feedback-hold-confirm-callback': <PressableFeedbackVariantDemo variant="hold-confirm-callback" />,
  'pressable-feedback-hold-confirm-durations': <PressableFeedbackVariantDemo variant="hold-confirm-durations" />,
  'pressable-feedback-hold-confirm-sweep': <PressableFeedbackVariantDemo variant="hold-confirm-sweep" />,
  'pressable-feedback-pressable-cards': <PressableFeedbackVariantDemo variant="pressable-cards" />,
  'pressable-feedback-progress-feedback-callback': <PressableFeedbackVariantDemo variant="progress-feedback-callback" />,
  'pressable-feedback-progress-feedback-durations': <PressableFeedbackVariantDemo variant="progress-feedback-durations" />,
  'pressable-feedback-progress-feedback-no-reset': <PressableFeedbackVariantDemo variant="progress-feedback-no-reset" />,
  'pressable-feedback-progress-feedback-sweep': <PressableFeedbackVariantDemo variant="progress-feedback-sweep" />,
  'pressable-feedback-standalone-highlight': <PressableFeedbackVariantDemo variant="standalone-highlight" />,
  'pressable-feedback-standalone-ripple': <PressableFeedbackVariantDemo variant="standalone-ripple" />,
  'pressable-feedback-with-highlight': <PressableFeedbackVariantDemo variant="with-highlight" />,
  'pressable-feedback-with-hold-confirm': <PressableFeedbackVariantDemo variant="with-hold-confirm" />,
  'pressable-feedback-with-progress-feedback': <PressableFeedbackVariantDemo variant="with-progress-feedback" />,
  'pressable-feedback-with-ripple': <PressableFeedbackVariantDemo variant="with-ripple" />,

  'rating-controlled': <RatingVariantDemo variant="controlled" />,
  'rating-custom-color': <RatingVariantDemo variant="custom-color" />,
  'rating-custom-icon-heart': <RatingVariantDemo variant="custom-icon-heart" />,
  'rating-custom-icon-per-item': <RatingVariantDemo variant="custom-icon-per-item" />,
  'rating-default': <RatingVariantDemo variant="default" />,
  'rating-disabled': <RatingVariantDemo variant="disabled" />,
  'rating-product-review': <RatingVariantDemo variant="product-review" />,
  'rating-read-only': <RatingVariantDemo variant="read-only" />,
  'rating-read-only-fractional': <RatingVariantDemo variant="read-only-fractional" />,
  'rating-render-function': <RatingVariantDemo variant="render-function" />,
  'rating-sizes': <RatingVariantDemo variant="sizes" />,
  'rating-with-label': <RatingVariantDemo variant="with-label" />,

  'trend-chip-custom-indicator': <TrendChipVariantDemo variant="custom-indicator" />,
  'trend-chip-default': <TrendChipVariantDemo variant="default" />,
  'trend-chip-prefix-and-suffix': <TrendChipVariantDemo variant="prefix-and-suffix" />,
  'trend-chip-sizes': <TrendChipVariantDemo variant="sizes" />,
  'trend-chip-tabular-nums': <TrendChipVariantDemo variant="tabular-nums" />,
  'trend-chip-variants': <TrendChipVariantDemo variant="variants" />,

  'resizable-default': <ResizableVariantDemo variant="default" />,
  'resizable-nested': <ResizableVariantDemo variant="nested" />,
  'resizable-css-variables': <ResizableVariantDemo variant="css-variables" />,
  'resizable-persisted-sizes': <ResizableVariantDemo variant="persisted-sizes" />,
  'resizable-size-units': <ResizableVariantDemo variant="size-units" />,
  'resizable-types': <ResizableVariantDemo variant="types" />,
  'resizable-variants': <ResizableVariantDemo variant="variants" />,
  'resizable-vertical': <ResizableVariantDemo variant="vertical" />,
  'resizable-with-collapse': <ResizableVariantDemo variant="with-collapse" />,
  'resizable-with-indicator': <ResizableVariantDemo variant="with-indicator" />,

  'app-layout-collapsible': <AppLayoutVariantDemo variant="collapsible" />,
  'app-layout-complex': <AppLayoutVariantDemo variant="complex" />,
  'app-layout-content-scroll': <AppLayoutVariantDemo variant="content-scroll" />,
  'app-layout-client-side-routing': <AppLayoutVariantDemo variant="client-side-routing" />,
  'app-layout-controlled-state': <AppLayoutVariantDemo variant="controlled-state" />,
  'app-layout-default': <AppLayoutVariantDemo variant="default" />,
  'app-layout-docs-site': <AppLayoutVariantDemo variant="docs-site" />,
  'app-layout-floating-sidebar': <AppLayoutVariantDemo variant="floating-sidebar" />,
  'app-layout-inset-dashboard': <AppLayoutVariantDemo variant="inset-dashboard" />,
  'app-layout-mobile-aside-sheet': <AppLayoutVariantDemo variant="mobile-aside-sheet" />,
  'app-layout-mobile-behavior': <AppLayoutVariantDemo variant="mobile-behavior" />,
  'app-layout-navbar-adaptation': <AppLayoutVariantDemo variant="navbar-adaptation" />,
  'app-layout-offcanvas': <AppLayoutVariantDemo variant="offcanvas" />,
  'app-layout-persisted-state': <AppLayoutVariantDemo variant="persisted-state" />,
  'app-layout-resizable-sidebar': <AppLayoutVariantDemo variant="resizable-sidebar" />,
  'app-layout-aside-keyboard-shortcut': <AppLayoutVariantDemo variant="aside-keyboard-shortcut" />,
  'app-layout-with-aside': <AppLayoutVariantDemo variant="with-aside" />,
  'app-layout-with-breadcrumbs': <AppLayoutVariantDemo variant="with-breadcrumbs" />,
  'app-layout-with-inset-sidebar': <AppLayoutVariantDemo variant="with-inset-sidebar" />,
  'app-layout-with-toolbar': <AppLayoutVariantDemo variant="with-toolbar" />,

  'command-backdrop-variants': <CommandVariantDemo variant="backdrop-variants" />,
  'command-clean': <CommandVariantDemo variant="clean" />,
  'command-default': <CommandVariantDemo variant="default" />,
  'command-dev-toolbar': <CommandVariantDemo variant="dev-toolbar" />,
  'command-launcher': <CommandVariantDemo variant="launcher" />,
  'command-minimal': <CommandVariantDemo variant="minimal" />,
  'command-multiple-search-terms': <CommandVariantDemo variant="multiple-search-terms" />,
  'command-sizes': <CommandVariantDemo variant="sizes" />,
  'command-split-view': <CommandVariantDemo variant="split-view" />,

  'context-menu-controlled': <ContextMenuVariantDemo variant="controlled" />,
  'context-menu-default': <ContextMenuVariantDemo variant="default" />,
  'context-menu-disabled': <ContextMenuVariantDemo variant="disabled" />,
  'context-menu-long-press': <ContextMenuVariantDemo variant="long-press" />,
  'context-menu-with-sections': <ContextMenuVariantDemo variant="with-sections" />,
  'context-menu-with-selection': <ContextMenuVariantDemo variant="with-selection" />,
  'context-menu-with-submenus': <ContextMenuVariantDemo variant="with-submenus" />,

  'navbar-compact': <NavbarVariantDemo variant="compact" />,
  'navbar-compact-density': <NavbarVariantDemo variant="compact-density" />,
  'navbar-accessibility': <NavbarVariantDemo variant="accessibility" />,
  'navbar-client-side-routing': <NavbarVariantDemo variant="client-side-routing" />,
  'navbar-dashboard': <NavbarVariantDemo variant="dashboard" />,
  'navbar-default': <NavbarVariantDemo variant="default" />,
  'navbar-docs-site': <NavbarVariantDemo variant="docs-site" />,
  'navbar-hide-on-scroll': <NavbarVariantDemo variant="hide-on-scroll" />,
  'navbar-positioning': <NavbarVariantDemo variant="positioning" />,
  'navbar-programmatic-control': <NavbarVariantDemo variant="programmatic-control" />,
  'navbar-responsive-mobile-menu': <NavbarVariantDemo variant="responsive-mobile-menu" />,
  'navbar-with-dropdowns': <NavbarVariantDemo variant="with-dropdowns" />,
  'navbar-with-menu': <NavbarVariantDemo variant="with-menu" />,

  'segment-controlled': <SegmentVariantDemo variant="controlled" />,
  'segment-default': <SegmentVariantDemo variant="default" />,
  'segment-disabled': <SegmentVariantDemo variant="disabled" />,
  'segment-disabled-item': <SegmentVariantDemo variant="disabled-item" />,
  'segment-ghost': <SegmentVariantDemo variant="ghost" />,
  'segment-icon-expand': <SegmentVariantDemo variant="icon-expand" />,
  'segment-sizes': <SegmentVariantDemo variant="sizes" />,
  'segment-theme-switcher': <SegmentVariantDemo variant="theme-switcher" />,
  'segment-two-items': <SegmentVariantDemo variant="two-items" />,
  'segment-with-icons': <SegmentVariantDemo variant="with-icons" />,
  'segment-without-separators': <SegmentVariantDemo variant="without-separators" />,

  'sidebar-agent-hub': <SidebarVariantDemo variant="agent-hub" />,
  'sidebar-agent-workspace': <SidebarVariantDemo variant="agent-workspace" />,
  'sidebar-collapsible': <SidebarVariantDemo variant="collapsible" />,
  'sidebar-collapsible-groups': <SidebarVariantDemo variant="collapsible-groups" />,
  'sidebar-compact-with-user-menu': <SidebarVariantDemo variant="compact-with-user-menu" />,
  'sidebar-complex': <SidebarVariantDemo variant="complex" />,
  'sidebar-client-side-routing': <SidebarVariantDemo variant="client-side-routing" />,
  'sidebar-default': <SidebarVariantDemo variant="default" />,
  'sidebar-floating-variant': <SidebarVariantDemo variant="floating-variant" />,
  'sidebar-icon-only': <SidebarVariantDemo variant="icon-only" />,
  'sidebar-inset-variant': <SidebarVariantDemo variant="inset-variant" />,
  'sidebar-keyboard-shortcut': <SidebarVariantDemo variant="keyboard-shortcut" />,
  'sidebar-meeting-notes': <SidebarVariantDemo variant="meeting-notes" />,
  'sidebar-persisted-state': <SidebarVariantDemo variant="persisted-state" />,
  'sidebar-reduced-motion': <SidebarVariantDemo variant="reduced-motion" />,
  'sidebar-right-side': <SidebarVariantDemo variant="right-side" />,
  'sidebar-with-avatar': <SidebarVariantDemo variant="with-avatar" />,
  'sidebar-with-groups': <SidebarVariantDemo variant="with-groups" />,

  'stepper-bullet-steps': <StepperVariantDemo variant="bullet-steps" />,
  'stepper-controlled': <StepperVariantDemo variant="controlled" />,
  'stepper-controlled-vertical': <StepperVariantDemo variant="controlled-vertical" />,
  'stepper-custom-color': <StepperVariantDemo variant="custom-color" />,
  'stepper-custom-color-vertical': <StepperVariantDemo variant="custom-color-vertical" />,
  'stepper-custom-completed-icon': <StepperVariantDemo variant="custom-completed-icon" />,
  'stepper-default': <StepperVariantDemo variant="default" />,
  'stepper-display-only': <StepperVariantDemo variant="display-only" />,
  'stepper-dynamic-icon': <StepperVariantDemo variant="dynamic-icon" />,
  'stepper-free-trial-timeline': <StepperVariantDemo variant="free-trial-timeline" />,
  'stepper-onboarding-timeline': <StepperVariantDemo variant="onboarding-timeline" />,
  'stepper-package-tracking': <StepperVariantDemo variant="package-tracking" />,
  'stepper-render-function': <StepperVariantDemo variant="render-function" />,
  'stepper-sizes': <StepperVariantDemo variant="sizes" />,
  'stepper-vertical': <StepperVariantDemo variant="vertical" />,
  'stepper-vertical-sizes': <StepperVariantDemo variant="vertical-sizes" />,
  'stepper-vertical-with-icons': <StepperVariantDemo variant="vertical-with-icons" />,
  'stepper-with-descriptions': <StepperVariantDemo variant="with-descriptions" />,
  'stepper-with-icons': <StepperVariantDemo variant="with-icons" />,
};
