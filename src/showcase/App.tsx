import { useEffect, useState, type MouseEvent, type ReactNode } from 'react';
import Button from '../components/button';
import Chip from '../components/chip';
import Segment from '../components/segment';
import Tooltip from '../components/tooltip';
import './showcase.css';
import docsMetaJson from './docs-meta.json';
import { BASE_CATEGORY, PRO_CATEGORIES, demoIndex, resolveDemo, sectionTitle, titleOf } from './registry';
import {
  AnchorLinkIcon,
  ChevronRightSmIcon,
  LogoIcon,
  SearchIcon,
  ThemeToggleIcon,
  TocIcon,
} from './icons';

type DocsMeta = Record<
  string,
  {
    title: string;
    description?: string;
    sections: { heading: string; anchor: string; demo: string }[];
  }
>;

const docsMeta = docsMetaJson as DocsMeta;

const ALL_COMPONENTS_ID = 'all-components';
const REPOSITORY_URL = 'https://github.com/HollyCci/vela-ui';

/** 参考实现 AI 分类下标记 New 的组件 */
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
  'text-fd-muted-foreground relative flex w-full flex-row items-center gap-2 rounded-lg p-2 text-start [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 data-[active=true]:bg-fd-card data-[active=true]:text-fd-primary transition-colors hover:transition-none data-[active=true]:hover:transition-colors';

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
  <Chip
    className="order-last h-5 rounded-full bg-pink-400/8 px-1.5 text-[10px] font-semibold text-pink-400/90"
    color="default"
    size="sm"
  >
    New
  </Chip>
);
NewChip.displayName = 'NewChip';

const DocsSidebar = ({ activeId, onSelect }: SidebarProps) => (
  <div
    className="pointer-events-none sticky z-20 [grid-area:sidebar] *:pointer-events-auto max-md:hidden top-(--fd-docs-row-2) h-[calc(var(--fd-docs-height)-var(--fd-docs-row-2))]"
    style={{ justifySelf: 'end', width: 'var(--fd-sidebar-width)' }}
  >
    <aside
      id="nd-sidebar"
      data-collapsed="false"
      className="absolute inset-y-0 start-0 flex w-full flex-col items-end text-sm duration-250 *:w-(--fd-sidebar-width)"
    >
      <div className="overflow-hidden min-h-0 flex-1" style={{ position: 'relative' }}>
        <div className="sc-sidebar-scroll size-full rounded-[inherit] *:flex! *:flex-col! *:gap-0.5! pb-4 pe-1 ps-4 pt-4 overscroll-contain mask-[linear-gradient(to_bottom,transparent,white_12px,white_calc(100%-12px),transparent)]" style={{ overflow: 'hidden auto' }}>
          <div style={{ minWidth: '100%', display: 'table' }}>
            <p className="[&_svg]:size-4 [&_svg]:shrink-0" style={SIDEBAR_PAD}>
              Overview
            </p>
            <SidebarItem id={ALL_COMPONENTS_ID} activeId={activeId} onSelect={onSelect}>
              All Components
            </SidebarItem>
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
    <div className="flex h-14 items-center gap-2 border-b px-4 md:gap-3 md:px-6 xl:px-12" data-header-body="">
      <div className="items-center flex flex-1">
        <div className="flex items-center gap-4">
          <a className="inline-flex items-center gap-2.5 font-semibold" href={REPOSITORY_URL} target="_blank" rel="noreferrer">
            <LogoIcon />
          </a>
          <Chip className="hidden h-6 min-w-fit gap-0.5 bg-default px-2 py-1 text-muted min-[1070px]:flex" size="sm" variant="soft">
            1.0.0-beta.6
          </Chip>
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
        <span className="hidden h-8 items-center gap-1.5 rounded-full bg-fd-secondary/50 px-3 text-sm text-fd-muted-foreground md:inline-flex">
          Theme
        </span>
        <span className="hidden h-8 items-center rounded-full bg-fd-secondary/50 px-3 text-sm text-fd-muted-foreground lg:inline-flex">
          29.6k
        </span>
        <Chip className="hidden h-6 gap-0.5 bg-default px-2 py-1 text-muted md:flex" size="sm" variant="soft">
          Vela UI
        </Chip>
        <span className="inline-flex h-8 items-center rounded-full bg-accent px-3 text-sm font-medium text-accent-foreground">
          Get Pro
        </span>
      </div>
    </div>
    <div className="flex flex-row items-end gap-6 h-11 overflow-x-auto border-b px-6" data-header-tabs="">
      <span
        className="text-muted hover:text-foreground inline-flex items-center gap-2 text-nowrap border-b-2 border-transparent pb-1.5 text-sm font-medium transition-colors"
      >
        Getting Started
      </span>
      <span className="text-accent border-accent inline-flex items-center gap-2 text-nowrap border-b-2 pb-1.5 text-sm font-medium transition-colors">
        Components
      </span>
      <span
        className="text-muted hover:text-foreground inline-flex items-center gap-2 text-nowrap border-b-2 border-transparent pb-1.5 text-sm font-medium transition-colors"
      >
        Templates
      </span>
      <span
        className="text-muted hover:text-foreground inline-flex items-center gap-2 text-nowrap border-b-2 border-transparent pb-1.5 text-sm font-medium transition-colors"
      >
        Releases
      </span>
      <div className="ms-auto hidden items-center gap-1 self-center rounded-full bg-fd-secondary/50 p-1 text-sm md:flex">
        <span className="inline-flex h-7 items-center rounded-full bg-fd-card px-3 font-medium text-fd-primary shadow-sm">
          Web
        </span>
        <span className="inline-flex h-7 items-center rounded-full px-3 text-fd-muted-foreground">
          Native
        </span>
      </div>
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

/** 全屏/高内容组件需要更高的预览帧（参考实现默认 360px 起步） */
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
  'rich-text-editor': 620,
  markdown: 720,
  'floating-toc': 560,
  'chat-list-view': 560,
  sheet: 560,
  timeline: 560,
  'drop-zone': 560,
  'item-card-group': 560,
};

type ComponentPreviewProps = {
  component: string;
  slug: string;
  demo: ReactNode;
};

const ComponentPreview = ({ component, slug, demo }: ComponentPreviewProps) => {
  const [device, setDevice] = useState<Device>('desktop');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const height = HEIGHT_OVERRIDES[component] ?? 360;

  const handleTheme = () => setTheme((value) => (value === 'light' ? 'dark' : 'light'));

  return (
    <div className="component-preview-container group relative my-4 w-full" data-name={slug}>
      <div className="flex items-center justify-between px-0.5 pb-3">
        <a
          className="link text-muted decoration-muted hover:text-accent text-sm no-underline hover:opacity-100"
          aria-label="Get the code"
          href={REPOSITORY_URL}
          target="_blank"
          rel="noreferrer"
        >
          Get the code
          <ChevronRightSmIcon />
        </a>
        <div className="flex items-center gap-1">
          <Tooltip content={theme === 'light' ? '切换到深色预览' : '切换到浅色预览'} delay={0} closeDelay={0}>
            <Button
              aria-label="Toggle theme"
              className="size-7 text-muted hover:text-foreground"
              data-theme-selected={theme}
              isIconOnly
              size="sm"
              variant="ghost"
              onClick={handleTheme}
            >
              <ThemeToggleIcon />
            </Button>
          </Tooltip>
          <div className="bg-separator mx-1 hidden h-5 w-px md:block" />
          <Segment
            aria-orientation="horizontal"
            aria-label="Preview device"
            className="hidden md:flex"
            selectedKey={device}
            size="sm"
            onSelectionChange={(key) => setDevice(key as Device)}
          >
            {(['mobile', 'tablet', 'desktop'] as Device[]).map((d) => (
              <Segment.Item key={d} id={d}>
                {d === 'mobile' ? 'Mobile' : d === 'tablet' ? 'Tablet' : 'Desktop'}
              </Segment.Item>
            ))}
          </Segment>
        </div>
      </div>
      <div className="relative overflow-visible" style={{ minHeight: height }}>
        <div className="relative flex justify-center">
          <div
            className="border-separator shrink-0 overflow-hidden rounded-xl border"
            style={{ width: DEVICE_WIDTH[device], maxWidth: '100%' }}
          >
            <div
              className="sc-live-preview h-full w-full"
              data-theme={theme}
              data-slug={slug}
              style={{ minHeight: height }}
            >
              {demo}
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

const USAGE_COPY: Record<string, ReactNode> = {
  'data-grid': (
    <p>
      The <code>DataGrid</code> component takes a flat <code>data</code> array, a <code>columns</code> definition,
      and a <code>getRowId</code> function. It renders a fully accessible table with built-in support for sorting,
      selection, column resizing, and more.
    </p>
  ),
};

type DocsTitleProps = {
  title: string;
  description?: string;
};

const DocsTitle = ({ title, description }: DocsTitleProps) => (
  <section className="flex flex-col gap-4">
    <div className="flex items-start justify-between gap-4">
      <h1 className="text-[1.75em] font-semibold flex items-center gap-2">{title}</h1>
      <button
        type="button"
        className="hidden h-8 items-center gap-2 rounded-xl bg-fd-secondary/50 px-3 text-sm font-medium text-fd-primary transition-colors hover:bg-fd-accent md:inline-flex"
      >
        Copy Markdown
      </button>
    </div>
    {description !== undefined && <p className="text-muted">{description}</p>}
    <div>
      <span className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-fd-secondary/50 px-2 text-sm font-medium text-fd-primary">
        <span className="inline-flex size-4 items-center justify-center rounded bg-pink-400 text-[10px] font-bold text-white">
          S
        </span>
        Storybook
      </span>
    </div>
  </section>
);
DocsTitle.displayName = 'DocsTitle';

type AllComponentsOverviewProps = {
  activeId: string;
  onSelect: (e: MouseEvent<HTMLButtonElement>) => void;
};

const variantLabel = (count: number): string => `${count} ${count === 1 ? 'variant' : 'variants'}`;

const AllComponentsOverview = ({ activeId, onSelect }: AllComponentsOverviewProps) => (
  <>
    <section className="flex flex-col gap-2">
      <span className="text-muted text-sm">All Components</span>
      <h1 className="text-[1.75em] font-semibold flex items-center gap-2">All Components</h1>
      <p className="text-muted">
        Explore the full list of Pro components available in Vela UI. Each component page pairs
        its Vela React implementation with the same variant map from the Pro docs.
      </p>
    </section>
    {Object.entries(PRO_CATEGORIES).map(([category, ids]) => (
      <section key={category} className="sc-overview-section" id={`overview-${category.toLowerCase().replace(/\s+/g, '-')}`}>
        <h2 className="flex scroll-m-28 flex-row items-center gap-2 text-xl font-semibold">
          {CATEGORY_LABELS[category] ?? category}
        </h2>
        <div className="sc-component-grid">
          {ids.map((id) => {
            const title = docsMeta[id]?.title ?? titleOf(id);
            const count = demoIndex[id]?.length ?? 0;
            return (
              <button
                key={id}
                type="button"
                className="sc-component-card"
                data-id={id}
                data-active={activeId === id}
                onClick={onSelect}
              >
                <span className="sc-component-card__body">
                  <span className="sc-component-card__title-row">
                    <span className="sc-component-card__title">{title}</span>
                    {NEW_COMPONENTS.has(id) && <NewChip />}
                  </span>
                  <span className="sc-component-card__meta">{variantLabel(count)}</span>
                </span>
                <span className="sc-component-card__preview" aria-hidden="true">
                  {title}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    ))}
  </>
);
AllComponentsOverview.displayName = 'AllComponentsOverview';

const App = () => {
  const [activeId, setActiveId] = useState(ALL_COMPONENTS_ID);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const handleChange = () => setIsNarrow(query.matches);
    handleChange();
    query.addEventListener('change', handleChange);
    window.addEventListener('resize', handleChange);
    return () => {
      query.removeEventListener('change', handleChange);
      window.removeEventListener('resize', handleChange);
    };
  }, []);

  const handleItemClick = (e: MouseEvent<HTMLButtonElement>) => {
    const id = e.currentTarget.dataset.id;
    if (id) {
      setActiveId(id);
      window.scrollTo(0, 0);
    }
  };

  const isAllComponents = activeId === ALL_COMPONENTS_ID;
  const meta = docsMeta[activeId];
  const sections =
    meta?.sections ??
    (demoIndex[activeId] ?? []).map((slug) => ({
      heading: sectionTitle(activeId, slug),
      anchor: slug === activeId ? 'usage' : slug.slice(activeId.length + 1),
      demo: slug,
    }));
  const title = meta?.title ?? titleOf(activeId);

  return (
    <div
      id="nd-notebook-layout"
      className="min-h-(--fd-docs-height) grid auto-cols-auto auto-rows-auto overflow-x-clip transition-[grid-template-columns] [--fd-docs-height:100dvh]"
      style={{
        ['--fd-docs-row-1' as string]: '0px',
        ['--fd-docs-row-2' as string]: 'calc(var(--fd-docs-row-1) + var(--fd-header-height))',
        ['--fd-docs-row-3' as string]: 'var(--fd-docs-row-2)',
        ['--fd-header-height' as string]: '100px',
        ['--fd-sidebar-width' as string]: '220px',
        ['--fd-toc-width' as string]: '268px',
        ['--fd-sidebar-col' as string]: 'var(--fd-sidebar-width)',
        ['--sc-layout-width' as string]: '87.5rem',
        gridTemplate: isNarrow
          ? `"header"
        "main" 1fr / minmax(0, 1fr)`
          : `". header header header ."
        "sidebar sidebar toc-popover toc-popover ."
        "sidebar sidebar main toc ." 1fr / minmax(min-content, 1fr) var(--fd-sidebar-col) minmax(0, calc(var(--sc-layout-width, 97rem) - var(--fd-sidebar-col) - var(--fd-toc-width))) var(--fd-toc-width) minmax(min-content, 1fr)`,
      }}
    >
      <DocsHeader />
      <DocsSidebar activeId={activeId} onSelect={handleItemClick} />
      <article
        id="nd-page"
        data-full="false"
        className="flex flex-col gap-4 px-4 py-6 [grid-area:main] *:max-w-[900px] md:px-6 md:pt-8 xl:px-12 xl:pt-8"
      >
        {isAllComponents ? (
          <AllComponentsOverview activeId={activeId} onSelect={handleItemClick} />
        ) : (
          <>
            <DocsTitle title={title} description={meta?.description ?? '底层基础组件 — React 实现演示。'} />
            {sections.map((s) => {
              const sectionDemo = resolveDemo(activeId, s.demo);
              if (sectionDemo === undefined) return null;

              return (
                <div key={s.anchor} className="contents">
                  <SectionHeading anchor={s.anchor}>{s.heading}</SectionHeading>
                  {s.anchor === 'usage' && USAGE_COPY[activeId] !== undefined && (
                    <div className="prose prose-sm max-w-[900px] text-fd-foreground/90">{USAGE_COPY[activeId]}</div>
                  )}
                  <ComponentPreview component={activeId} slug={s.demo} demo={sectionDemo} />
                </div>
              );
            })}
          </>
        )}
      </article>
      <div
        id="nd-toc"
        className="top-(--fd-docs-row-3) sticky flex h-[calc(var(--fd-docs-height)-var(--fd-docs-row-3))] flex-col pb-2 pe-4 ps-4 pt-6 [grid-area:toc] max-xl:hidden"
        style={{ width: '240px' }}
      >
        <h3 className="text-muted inline-flex items-center gap-1.5 text-sm" id="toc-title">
          <TocIcon />
          On this page
        </h3>
        <div className="relative min-h-0 text-sm ms-px overflow-auto [scrollbar-width:none] py-3">
          {isAllComponents ? (
            <div className="flex flex-col">
              {Object.keys(PRO_CATEGORIES).map((category) => (
                <a
                  key={category}
                  href={`#overview-${category.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-muted hover:text-foreground py-1.5 text-sm transition-colors"
                  style={{ paddingInlineStart: '12px' }}
                >
                  {CATEGORY_LABELS[category] ?? category}
                </a>
              ))}
            </div>
          ) : (
            <div className="flex flex-col">
              {sections.map((s) => (
                <a
                  key={s.anchor}
                  href={`#${s.anchor}`}
                  className="text-muted hover:text-foreground py-1.5 text-sm transition-colors"
                  style={{ paddingInlineStart: '12px' }}
                >
                  {s.heading}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

App.displayName = 'App';

export default App;
