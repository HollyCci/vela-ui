import { useEffect, useState, type MouseEvent, type ReactNode } from 'react';
import './showcase.css';
import DemoFrame from './demo-frame';
import docsMetaJson from './docs-meta.json';
import { BASE_CATEGORY, PRO_CATEGORIES, demoRegistry, titleOf } from './registry';
import {
  AnchorLinkIcon,
  ChevronRightSmIcon,
  LogoIcon,
  OpenNewTabIcon,
  SearchIcon,
  StorybookIcon,
  ThemeToggleIcon,
  TocIcon,
} from './icons';

type DocsMeta = Record<
  string,
  {
    title: string;
    description?: string;
    storybook?: string;
    sections: { heading: string; anchor: string; demo: string }[];
  }
>;

const docsMeta = docsMetaJson as DocsMeta;

/** 原站 AI 分类下标记 New 的组件 */
const NEW_COMPONENTS = new Set([
  'chain-of-thought',
  'chat-attachment',
  'chat-conversation',
  'chat-list-view',
  'chat-loader',
  'chat-message',
  'chat-message-actions',
  'chat-source',
  'chat-tool',
  'code-block',
  'markdown',
  'prompt-input',
  'prompt-suggestion',
  'text-shimmer',
]);

const CATEGORY_LABELS: Record<string, string> = {
  Charts: 'Charts',
  'Data Display': 'Data Display',
  AI: 'AI',
  Feedback: 'Feedback',
  Layout: 'Layout',
  Forms: 'Forms',
  Navigation: 'Navigation',
  Overlays: 'Overlays',
};

const SIDEBAR_ITEM_CLASS =
  'text-fd-muted-foreground relative flex flex-row items-center gap-2 rounded-lg p-2 text-start [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary transition-colors hover:transition-none data-[active=true]:hover:transition-colors';

const SIDEBAR_PAD = { paddingInlineStart: 'calc(2 * var(--spacing))' } as const;

type SidebarProps = {
  activeId: string;
  onSelect: (e: MouseEvent<HTMLButtonElement>) => void;
};

const SidebarItem = ({
  id,
  activeId,
  onSelect,
  children,
}: SidebarProps & { id: string; children: ReactNode }) => (
  <button
    type="button"
    data-id={id}
    data-active={id === activeId}
    onClick={onSelect}
    className={SIDEBAR_ITEM_CLASS}
    style={SIDEBAR_PAD}
  >
    {children}
  </button>
);
SidebarItem.displayName = 'SidebarItem';

const NewChip = () => (
  <span
    className="chip chip--default chip--primary h-5 rounded-full bg-pink-400/8 px-1.5 text-[10px] font-semibold text-pink-400/90 order-last"
    data-slot="chip"
  >
    <span className="chip__label" data-slot="chip-label">
      New
    </span>
  </span>
);
NewChip.displayName = 'NewChip';

const DocsSidebar = ({ activeId, onSelect }: SidebarProps) => (
  <div
    className="pointer-events-none sticky z-20 [grid-area:sidebar] *:pointer-events-auto max-md:hidden top-(--fd-docs-row-2) h-[calc(var(--fd-docs-height)-var(--fd-docs-row-2))]"
    style={{ width: 'var(--fd-sidebar-width)' }}
  >
    <aside
      id="nd-sidebar"
      data-collapsed="false"
      className="absolute inset-y-0 start-0 flex w-full flex-col items-end text-sm duration-250 *:w-(--fd-sidebar-width)"
    >
      <div className="overflow-hidden min-h-0 flex-1" style={{ position: 'relative' }}>
        <div className="size-full rounded-[inherit] *:flex! *:flex-col! *:gap-0.5! p-4 overscroll-contain mask-[linear-gradient(to_bottom,transparent,white_12px,white_calc(100%-12px),transparent)]" style={{ overflow: 'hidden auto' }}>
          <div style={{ minWidth: '100%', display: 'table' }}>
            <p className="[&_svg]:size-4 [&_svg]:shrink-0" style={SIDEBAR_PAD}>
              Overview
            </p>
            <a
              data-active="false"
              className={SIDEBAR_ITEM_CLASS}
              style={SIDEBAR_PAD}
              href="https://heroui.pro/docs/react/components"
              target="_blank"
              rel="noreferrer"
            >
              All Components
            </a>
            {Object.entries(PRO_CATEGORIES).map(([category, ids]) => (
              <div key={category} className="contents">
                <p className="[&_svg]:size-4 [&_svg]:shrink-0" style={SIDEBAR_PAD}>
                  {CATEGORY_LABELS[category]}
                </p>
                {ids.map((id) => (
                  <SidebarItem key={id} id={id} activeId={activeId} onSelect={onSelect}>
                    {NEW_COMPONENTS.has(id) && <NewChip />}
                    {docsMeta[id]?.title ?? titleOf(id)}
                  </SidebarItem>
                ))}
              </div>
            ))}
            <p className="[&_svg]:size-4 [&_svg]:shrink-0" style={SIDEBAR_PAD}>
              Base
            </p>
            {BASE_CATEGORY.map((id) => (
              <SidebarItem key={id} id={id} activeId={activeId} onSelect={onSelect}>
                {titleOf(id)}
              </SidebarItem>
            ))}
          </div>
        </div>
      </div>
    </aside>
  </div>
);
DocsSidebar.displayName = 'DocsSidebar';

const DocsHeader = () => (
  <header
    id="nd-subnav"
    data-transparent="false"
    className="data-[transparent=false]:bg-fd-background/80 sticky z-10 flex flex-col backdrop-blur-sm transition-colors [grid-area:header]"
    style={{ top: 'var(--fd-docs-row-1)' }}
  >
    <div className="flex h-14 items-center gap-2 border-b px-4 md:gap-3 md:px-6" data-header-body="">
      <div className="items-center flex flex-1">
        <div className="flex items-center gap-4">
          <a className="inline-flex items-center gap-2.5 font-semibold" href="https://heroui.pro/docs" target="_blank" rel="noreferrer">
            <LogoIcon />
            <span className="sr-only">HeroUI Pro</span>
          </a>
          <span
            className="chip chip--default chip--secondary bg-default text-muted hidden h-6 min-w-fit gap-0.5 px-2 py-1 min-[1070px]:flex"
            data-slot="chip"
          >
            <span className="chip__label" data-slot="chip-label">
              1.0.0-beta.5
            </span>
          </span>
        </div>
      </div>
      <button
        type="button"
        className="bg-fd-secondary/50 text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground inline-flex items-center gap-2 border p-1.5 text-sm transition-colors my-auto w-full min-w-0 shrink max-md:hidden max-w-[11rem] rounded-xl ps-2.5 md:max-w-[12rem] lg:max-w-[15rem] xl:max-w-sm"
      >
        <SearchIcon />
        Search
        <div className="ms-auto inline-flex items-center gap-0.5">
          <kbd className="kbd kbd--light size-5 justify-center rounded-md text-xs">⌘</kbd>
          <kbd className="kbd kbd--light size-5 justify-center rounded-md text-xs">K</kbd>
        </div>
      </button>
      <div className="flex flex-1 items-center justify-end gap-1.5">
        <span className="chip chip--default chip--secondary bg-default text-muted hidden h-6 gap-0.5 px-2 py-1 md:flex" data-slot="chip">
          <span className="chip__label" data-slot="chip-label">
            Vela UI
          </span>
        </span>
      </div>
    </div>
    <div className="flex flex-row items-end gap-6 h-10 overflow-x-auto border-b px-6" data-header-tabs="">
      <a
        className="text-fd-muted-foreground hover:text-fd-accent-foreground inline-flex items-center gap-2 text-nowrap border-b-2 border-transparent pb-1.5 text-sm font-medium transition-colors"
        href="https://heroui.pro/docs/react/getting-started"
        target="_blank"
        rel="noreferrer"
      >
        Getting Started
      </a>
      <span className="text-fd-primary border-fd-primary inline-flex items-center gap-2 text-nowrap border-b-2 pb-1.5 text-sm font-medium transition-colors">
        Components
      </span>
      <a
        className="text-fd-muted-foreground hover:text-fd-accent-foreground inline-flex items-center gap-2 text-nowrap border-b-2 border-transparent pb-1.5 text-sm font-medium transition-colors"
        href="https://heroui.pro/templates"
        target="_blank"
        rel="noreferrer"
      >
        Templates
      </a>
      <a
        className="text-fd-muted-foreground hover:text-fd-accent-foreground inline-flex items-center gap-2 text-nowrap border-b-2 border-transparent pb-1.5 text-sm font-medium transition-colors"
        href="https://heroui.pro/docs/react/releases"
        target="_blank"
        rel="noreferrer"
      >
        Releases
      </a>
    </div>
  </header>
);
DocsHeader.displayName = 'DocsHeader';

type Device = 'mobile' | 'tablet' | 'desktop';

const DEVICE_WIDTH: Record<Device, string> = {
  mobile: '375px',
  tablet: '768px',
  desktop: '100%',
};

/** 全屏/高内容组件需要更高的预览帧（原站默认 360px 起步） */
const HEIGHT_OVERRIDES: Record<string, number> = {
  agenda: 760,
  'app-layout': 760,
  sidebar: 760,
  navbar: 620,
  kanban: 640,
  'data-grid': 640,
  command: 620,
  'chat-conversation': 720,
  'emoji-picker': 620,
  'file-tree': 560,
  'list-view': 560,
  resizable: 560,
  carousel: 620,
  'prompt-input': 560,
  markdown: 720,
  'floating-toc': 560,
  'chat-list-view': 560,
  sheet: 560,
  'drop-zone': 560,
  'item-card-group': 560,
};

type ComponentPreviewProps = {
  component: string;
  slug: string;
};

const ComponentPreview = ({ component, slug }: ComponentPreviewProps) => {
  const [device, setDevice] = useState<Device>('desktop');
  const height = HEIGHT_OVERRIDES[component] ?? 360;

  const handleDevice = (e: MouseEvent<HTMLButtonElement>) => {
    setDevice(e.currentTarget.dataset.device as Device);
  };

  return (
    <div className="component-preview-container group relative my-4 w-full" data-name={slug}>
      <div className="flex items-center justify-between px-0.5 pb-3">
        <a
          className="link text-muted decoration-muted hover:text-accent text-sm no-underline hover:opacity-100"
          aria-label="Get the code"
          href="https://heroui.pro/#pricing"
          target="_blank"
          rel="noreferrer"
        >
          Get the code
          <ChevronRightSmIcon />
        </a>
        <div className="flex items-center gap-1">
          <div className="tooltip__trigger" data-slot="tooltip-trigger" role="button" tabIndex={0}>
            <button
              type="button"
              aria-label="Toggle theme"
              className="text-muted hover:text-foreground hover:bg-default flex size-7 cursor-pointer items-center justify-center rounded-lg transition-colors"
            >
              <ThemeToggleIcon />
            </button>
          </div>
          <div className="tooltip__trigger" data-slot="tooltip-trigger" role="button" tabIndex={0}>
            <a
              aria-label="Open in new tab"
              className="text-muted hover:text-foreground hover:bg-default flex size-7 items-center justify-center rounded-lg transition-colors"
              href={`/reference/demos/${slug}.html`}
              rel="noopener noreferrer"
              target="_blank"
            >
              <OpenNewTabIcon />
            </a>
          </div>
          <div className="bg-separator mx-1 hidden h-5 w-px md:block" />
          <div
            data-slot="segment"
            className="segment segment--sm hidden md:flex"
            role="radiogroup"
            aria-orientation="horizontal"
            data-orientation="horizontal"
          >
            {(['mobile', 'tablet', 'desktop'] as Device[]).map((d) => (
              <button
                key={d}
                data-slot="segment-item"
                className="segment__item segment__item--sm"
                type="button"
                role="radio"
                aria-checked={device === d}
                data-selected={device === d || undefined}
                data-device={d}
                onClick={handleDevice}
              >
                {device === d && <div data-slot="segment-indicator" className="segment__indicator" />}
                {d === 'mobile' ? 'Mobile' : d === 'tablet' ? 'Tablet' : 'Desktop'}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="relative overflow-visible" style={{ minHeight: height }}>
        <div className="relative flex justify-center">
          <div
            className="border-separator shrink-0 overflow-hidden rounded-xl border"
            style={{ width: DEVICE_WIDTH[device], maxWidth: '100%' }}
          >
            <div className="h-full w-full" style={{ minHeight: height }}>
              <DemoFrame slug={slug} height={height} />
            </div>
          </div>
          <div className="z-1 absolute bottom-0 top-0 hidden w-6 cursor-ew-resize items-center justify-center md:flex" style={{ right: 0 }}>
            <div className="h-10 w-1.5 rounded-full transition-colors bg-muted/20 hover:bg-muted/30" />
          </div>
        </div>
      </div>
    </div>
  );
};
ComponentPreview.displayName = 'ComponentPreview';

type DocBlock = { type: 'html'; html: string } | { type: 'demo'; slug: string };

type DocContent = { blocks: DocBlock[]; tocHtml: string };

const docContentCache = new Map<string, DocContent>();

/** 加载从原站采集提取的文档正文（prose + demo 占位） */
const useDocContent = (id: string): DocContent | null => {
  const [content, setContent] = useState<DocContent | null>(docContentCache.get(id) ?? null);

  useEffect(() => {
    let cancelled = false;
    const cached = docContentCache.get(id);
    if (cached) {
      setContent(cached);
      return undefined;
    }
    setContent(null);
    const load = async () => {
      try {
        const res = await fetch(`/docs-content/${id}.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as DocContent;
        docContentCache.set(id, data);
        if (!cancelled) setContent(data);
      } catch {
        if (!cancelled) setContent({ blocks: [], tocHtml: '' });
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return content;
};

type SectionHeadingProps = { anchor: string; children: ReactNode };

const SectionHeading = ({ anchor, children }: SectionHeadingProps) => (
  <h2 className="flex scroll-m-28 flex-row items-center gap-2 text-xl font-semibold mt-8" id={anchor}>
    <a data-card="" href={`#${anchor}`} className="peer">
      {children}
    </a>
    <AnchorLinkIcon />
  </h2>
);
SectionHeading.displayName = 'SectionHeading';

const App = () => {
  const [activeId, setActiveId] = useState('action-bar');
  const docContent = useDocContent(activeId);

  const handleItemClick = (e: MouseEvent<HTMLButtonElement>) => {
    const id = e.currentTarget.dataset.id;
    if (id) {
      setActiveId(id);
      window.scrollTo(0, 0);
    }
  };

  const meta = docsMeta[activeId];
  const sections = meta?.sections ?? [];
  const reactDemo = demoRegistry[activeId];
  const title = meta?.title ?? titleOf(activeId);
  // 有采集正文的组件直接渲染原站 prose；否则回退到 docs-meta 驱动的渲染
  const hasDocContent = docContent !== null && docContent.blocks.length > 0;

  return (
    <div
      id="nd-notebook-layout"
      className="min-h-(--fd-docs-height) grid auto-cols-auto auto-rows-auto overflow-x-clip transition-[grid-template-columns] [--fd-docs-height:100dvh]"
      style={{
        ['--fd-docs-row-1' as string]: '0px',
        ['--fd-docs-row-2' as string]: 'calc(var(--fd-docs-row-1) + var(--fd-header-height))',
        ['--fd-docs-row-3' as string]: 'var(--fd-docs-row-2)',
        ['--fd-header-height' as string]: '98px',
        ['--fd-sidebar-width' as string]: '268px',
        ['--fd-toc-width' as string]: '268px',
        ['--fd-sidebar-col' as string]: 'var(--fd-sidebar-width)',
        gridTemplate: `". header header header ."
        "sidebar sidebar toc-popover toc-popover ."
        "sidebar sidebar main toc ." 1fr / minmax(min-content, 1fr) var(--fd-sidebar-col) minmax(0, calc(var(--fd-layout-width, 97rem) - var(--fd-sidebar-col) - var(--fd-toc-width))) var(--fd-toc-width) minmax(min-content, 1fr)`,
      }}
    >
      <DocsHeader />
      <DocsSidebar activeId={activeId} onSelect={handleItemClick} />
      <article
        id="nd-page"
        data-full="false"
        className="flex flex-col gap-4 px-4 py-6 [grid-area:main] *:max-w-[900px] md:px-6 md:pt-8 xl:px-8 xl:pt-14"
      >
        {hasDocContent ? (
          docContent.blocks.map((block, i) =>
            block.type === 'html' ? (
              <div
                // 渲染本仓库采集、已清洗（去脚本）的原站静态正文，无用户输入
                key={`${activeId}-${i}`}
                className="contents"
                dangerouslySetInnerHTML={{ __html: block.html }}
              />
            ) : (
              <ComponentPreview key={`${activeId}-${i}`} component={activeId} slug={block.slug} />
            ),
          )
        ) : (
          <>
            <section className="flex flex-col gap-2">
              <h1 className="text-[1.75em] font-semibold flex items-center gap-2">{title}</h1>
              {meta?.description !== undefined && <p className="text-muted">{meta.description}</p>}
              {meta?.storybook !== undefined && (
                <div className="flex items-center gap-2 pt-1">
                  <a
                    className="button button--tertiary relative gap-2 dark:bg-default/70 button--sm"
                    href={meta.storybook}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <StorybookIcon />
                    Storybook
                  </a>
                </div>
              )}
              {meta === undefined && <p className="text-muted">底层基础组件 — React 复刻实现演示。</p>}
            </section>
            {sections.map((s) => (
              <div key={s.anchor} className="contents">
                <SectionHeading anchor={s.anchor}>{s.heading}</SectionHeading>
                <ComponentPreview component={activeId} slug={s.demo} />
              </div>
            ))}
          </>
        )}
        {reactDemo !== undefined && (
          <div className="contents">
            <SectionHeading anchor="react-implementation">React Implementation</SectionHeading>
            <div className="sc-react-demo">{reactDemo}</div>
          </div>
        )}
      </article>
      <div
        id="nd-toc"
        className="top-(--fd-docs-row-3) sticky flex h-[calc(var(--fd-docs-height)-var(--fd-docs-row-3))] flex-col pb-2 pe-4 pt-12 [grid-area:toc] max-xl:hidden"
        style={{ width: 'var(--fd-toc-width)' }}
      >
        <h3 className="text-fd-muted-foreground inline-flex items-center gap-1.5 text-sm" id="toc-title">
          <TocIcon />
          On this page
        </h3>
        <div className="relative min-h-0 text-sm ms-px overflow-auto [scrollbar-width:none] py-3">
          {hasDocContent && docContent.tocHtml !== '' ? (
            <div
              // 原站 TOC 锚点列表（已清洗静态片段）
              className="flex flex-col"
              dangerouslySetInnerHTML={{ __html: docContent.tocHtml }}
            />
          ) : (
            <div className="flex flex-col">
              {sections.map((s) => (
                <a
                  key={s.anchor}
                  href={`#${s.anchor}`}
                  className="text-fd-muted-foreground hover:text-fd-accent-foreground py-1.5 text-sm transition-colors"
                  style={{ paddingInlineStart: '12px' }}
                >
                  {s.heading}
                </a>
              ))}
              {reactDemo !== undefined && (
                <a
                  href="#react-implementation"
                  className="text-fd-muted-foreground hover:text-fd-accent-foreground py-1.5 text-sm transition-colors"
                  style={{ paddingInlineStart: '12px' }}
                >
                  React Implementation
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

App.displayName = 'App';

export default App;
