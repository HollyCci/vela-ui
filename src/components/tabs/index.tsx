'use client';

import {
  createContext,
  forwardRef,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  Tab as RacTab,
  TabList as RacTabList,
  TabPanel as RacTabPanel,
  TabPanels as RacTabPanels,
  Tabs as RacTabs,
  type Key,
  type TabListProps as RacTabListProps,
  type TabPanelProps as RacTabPanelProps,
  type TabPanelsProps as RacTabPanelsProps,
  type TabProps as RacTabProps,
  type TabsProps as RacTabsProps,
} from 'react-aria-components';
import clsx from 'clsx';

export type TabsVariant = 'primary' | 'secondary';
export type TabsOrientation = 'horizontal' | 'vertical';

export type TabItem = {
  key: string;
  title: ReactNode;
  content?: ReactNode;
  isDisabled?: boolean;
};

type TabsContextValue = {
  orientation: TabsOrientation;
  variant: TabsVariant;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  lastRect: RefObject<DOMRect | null>;
};

const defaultTabsContext: TabsContextValue = {
  orientation: 'horizontal',
  variant: 'primary',
  lastRect: { current: null },
};

const TabsContext = createContext<TabsContextValue>(defaultTabsContext);

const useTabsContext = () => useContext(TabsContext);

export type TabsProps = Omit<
  RacTabsProps,
  'children' | 'className' | 'onChange' | 'onSelectionChange'
> & {
  /** 便捷用法：直接传 items；省略则按 compound 子组件自行组合 */
  items?: TabItem[];
  onChange?: (key: string) => void;
  onSelectionChange?: (key: Key) => void;
  variant?: TabsVariant;
  orientation?: TabsOrientation;
  className?: RacTabsProps['className'];
  children?: RacTabsProps['children'];
};

export type TabsListProps = RacTabListProps<object>;
export type TabsTabProps = RacTabProps;
export type TabsPanelProps = RacTabPanelProps;
export type TabsPanelsProps = RacTabPanelsProps<object>;

/**
 * 选中指示器：原站 CSS 已定义 `transition: translate,width,height`（与 segment 同款）。
 * 这里在挂载到新选中 tab 时以上一个选中项的位置作为起点（FLIP），下一帧归零形成滑动动画，
 * 否则指示器会直接「瞬移」到新 tab 而非滑过去。
 */
const TabIndicator = () => {
  const { lastRect } = useTabsContext();
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (el === null) return undefined;
    const rect = el.getBoundingClientRect();
    const prev = lastRect.current;
    lastRect.current = rect;
    const resetToRest = () => {
      el.style.translate = '0px 0px';
      el.style.width = '100%';
      el.style.height = '100%';
    };
    let raf = 0;
    if (prev !== null && (prev.left !== rect.left || prev.top !== rect.top || prev.width !== rect.width)) {
      el.style.translate = `${prev.left - rect.left}px ${prev.top - rect.top}px`;
      el.style.width = `${prev.width}px`;
      el.style.height = `${prev.height}px`;
      raf = requestAnimationFrame(resetToRest);
    } else if (el.style.translate !== '' && el.style.translate !== '0px 0px') {
      // StrictMode 二次执行：起始偏移已设而归零帧被首轮 cleanup 取消，补一帧完成动画
      raf = requestAnimationFrame(resetToRest);
    }
    return () => cancelAnimationFrame(raf);
  }, [lastRect]);

  return <span ref={ref} className="tabs__indicator" aria-hidden="true" />;
};

TabIndicator.displayName = 'Tabs.TabIndicator';

const List = forwardRef<HTMLDivElement, TabsListProps>(
  (
    {
      className,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      ...rest
    },
    ref,
  ) => {
    const context = useTabsContext();

    return (
      <RacTabList
        ref={ref}
        aria-label={ariaLabel ?? context.ariaLabel}
        aria-labelledby={ariaLabelledBy ?? context.ariaLabelledBy}
        data-slot="tabs-list"
        className={(renderProps) =>
          clsx(
            'tabs__list',
            typeof className === 'function' ? className(renderProps) : className,
          )
        }
        {...rest}
      />
    );
  },
);

List.displayName = 'Tabs.List';

const Tab = forwardRef<HTMLDivElement, TabsTabProps>(
  ({ className, children, ...rest }, ref) => (
    <RacTab
      ref={ref}
      data-slot="tabs-tab"
      className={(renderProps) =>
        clsx(
          'tabs__tab',
          typeof className === 'function' ? className(renderProps) : className,
        )
      }
      {...rest}
    >
      {(renderProps) => (
        <>
          <span className="tabs__separator" aria-hidden="true" />
          {renderProps.isSelected && <TabIndicator />}
          {typeof children === 'function' ? children(renderProps) : children}
        </>
      )}
    </RacTab>
  ),
);

Tab.displayName = 'Tabs.Tab';

const Panel = forwardRef<HTMLDivElement, TabsPanelProps>(
  ({ className, ...rest }, ref) => {
    const { orientation } = useTabsContext();

    return (
      <RacTabPanel
        ref={ref}
        data-slot="tabs-panel"
        data-orientation={orientation}
        className={(renderProps) =>
          clsx(
            'tabs__panel',
            typeof className === 'function' ? className(renderProps) : className,
          )
        }
        {...rest}
      />
    );
  },
);

Panel.displayName = 'Tabs.Panel';

const Panels = forwardRef<HTMLDivElement, TabsPanelsProps>(
  ({ className, ...rest }, ref) => (
    <RacTabPanels ref={ref} data-slot="tabs-panels" className={clsx('tabs__panels', className)} {...rest} />
  ),
);

Panels.displayName = 'Tabs.Panels';

/**
 * 基于 react-aria-components Tabs：
 * roving focus、键盘导航、selection state 与 tabpanel 语义由 RAC 提供。
 * 传 items 时保留原有便捷用法；否则使用 Tabs.List / Tabs.Tab / Tabs.Panel compound 组合。
 */
const TabsRoot = forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      items,
      onChange,
      onSelectionChange,
      variant = 'primary',
      orientation = 'horizontal',
      className,
      children,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      ...rest
    },
    ref,
  ) => {
    const lastRect = useRef<DOMRect | null>(null);
    const contextValue = useMemo(
      () => ({
        orientation,
        variant,
        ariaLabel,
        ariaLabelledBy,
        lastRect,
      }),
      [ariaLabel, ariaLabelledBy, orientation, variant],
    );

    const handleSelectionChange = (key: Key) => {
      onSelectionChange?.(key);
      onChange?.(String(key));
    };

    return (
      <TabsContext.Provider value={contextValue}>
        <RacTabs
          ref={ref}
          data-slot="tabs"
          orientation={orientation}
          onSelectionChange={handleSelectionChange}
          className={(renderProps) =>
            clsx(
              'tabs',
              variant === 'secondary' && 'tabs--secondary',
              typeof className === 'function' ? className(renderProps) : className,
            )
          }
          {...rest}
        >
          {items === undefined ? (
            children
          ) : (
            <>
              <List>
                {items.map((item) => (
                  <Tab key={item.key} id={item.key} isDisabled={item.isDisabled}>
                    {item.title}
                  </Tab>
                ))}
              </List>
              {items.map(
                (item) =>
                  item.content !== undefined && (
                    <Panel key={item.key} id={item.key}>
                      {item.content}
                    </Panel>
                  ),
              )}
            </>
          )}
        </RacTabs>
      </TabsContext.Provider>
    );
  },
);

TabsRoot.displayName = 'Tabs';

const Tabs = Object.assign(TabsRoot, { List, Tab, Panel, Panels });

export default Tabs;
