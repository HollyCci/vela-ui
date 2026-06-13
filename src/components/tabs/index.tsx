import {
  forwardRef,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import clsx from 'clsx';

export type TabsVariant = 'primary' | 'secondary';
export type TabsOrientation = 'horizontal' | 'vertical';

export type TabItem = {
  key: string;
  title: ReactNode;
  content?: ReactNode;
  isDisabled?: boolean;
};

export type TabsProps = Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> & {
  items: TabItem[];
  selectedKey?: string;
  defaultSelectedKey?: string;
  onChange?: (key: string) => void;
  variant?: TabsVariant;
  orientation?: TabsOrientation;
};

/**
 * 选中指示器：原站 CSS 已定义 `transition: translate,width,height`（与 segment 同款）。
 * 这里在挂载到新选中 tab 时以上一个选中项的位置作为起点（FLIP），下一帧归零形成滑动动画，
 * 否则指示器会直接「瞬移」到新 tab 而非滑过去。
 */
const TabIndicator = ({ lastRect }: { lastRect: RefObject<DOMRect | null> }) => {
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

type TabButtonProps = {
  item: TabItem;
  tabId: string;
  panelId?: string;
  isSelected: boolean;
  isFocusable: boolean;
  onSelect?: (key: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>, key: string) => void;
  setTabRef?: (node: HTMLButtonElement | null) => void;
  lastRect: RefObject<DOMRect | null>;
};

const TabButton = ({
  item,
  tabId,
  panelId,
  isSelected,
  isFocusable,
  onSelect,
  onKeyDown,
  setTabRef,
  lastRect,
}: TabButtonProps) => {
  const handleClick = () => {
    if (!item.isDisabled) onSelect?.(item.key);
  };

  return (
    <button
      ref={setTabRef}
      id={tabId}
      type="button"
      role="tab"
      aria-selected={isSelected}
      aria-controls={panelId}
      aria-disabled={item.isDisabled || undefined}
      tabIndex={item.isDisabled ? undefined : isFocusable ? 0 : -1}
      className="tabs__tab"
      data-selected={isSelected || undefined}
      data-disabled={item.isDisabled || undefined}
      disabled={item.isDisabled}
      onClick={handleClick}
      onKeyDown={(event) => onKeyDown?.(event, item.key)}
    >
      <span className="tabs__separator" aria-hidden="true" />
      {isSelected && <TabIndicator lastRect={lastRect} />}
      {item.title}
    </button>
  );
};

TabButton.displayName = 'Tabs.TabButton';

const getTabId = (baseId: string, index: number) => `${baseId}-tab-${index}`;
const getPanelId = (baseId: string, index: number) => `${baseId}-panel-${index}`;

const isSelectableItem = (item: TabItem | undefined): item is TabItem =>
  item !== undefined && !item.isDisabled;

const getSelectableKeys = (items: TabItem[]) =>
  items.filter((item) => !item.isDisabled).map((item) => item.key);

const getDefaultSelectedKey = (items: TabItem[], defaultSelectedKey?: string) => {
  const defaultItem =
    defaultSelectedKey === undefined ? undefined : items.find((item) => item.key === defaultSelectedKey);
  if (isSelectableItem(defaultItem)) return defaultSelectedKey;
  return items.find((item) => !item.isDisabled)?.key;
};

const getNextKey = (keys: string[], currentKey: string | undefined, offset: 1 | -1) => {
  if (keys.length === 0) return undefined;
  const currentIndex = currentKey === undefined ? -1 : keys.indexOf(currentKey);
  if (currentIndex === -1) return keys[0];
  return keys[(currentIndex + offset + keys.length) % keys.length];
};

const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      items,
      selectedKey,
      defaultSelectedKey,
      onChange,
      variant = 'primary',
      orientation = 'horizontal',
      className,
      ...rest
    },
    ref,
  ) => {
    const { id, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy, ...rootProps } = rest;
    const generatedId = useId();
    const baseId = id ?? generatedId;
    const isControlled = selectedKey !== undefined;
    const [uncontrolledKey, setUncontrolledKey] = useState(() =>
      getDefaultSelectedKey(items, defaultSelectedKey),
    );
    const selectableKeys = useMemo(() => getSelectableKeys(items), [items]);
    const fallbackSelectedKey = getDefaultSelectedKey(items, defaultSelectedKey);
    const controlledItem = items.find((item) => item.key === selectedKey);
    const uncontrolledItem = items.find((item) => item.key === uncontrolledKey);
    const resolvedSelectedKey = isControlled
      ? isSelectableItem(controlledItem)
        ? selectedKey
        : fallbackSelectedKey
      : isSelectableItem(uncontrolledItem)
        ? uncontrolledKey
        : fallbackSelectedKey;
    const selectedIndex = items.findIndex((item) => item.key === resolvedSelectedKey);
    const selectedItem = selectedIndex >= 0 ? items[selectedIndex] : undefined;
    const focusableKey = isSelectableItem(selectedItem) ? selectedItem.key : selectableKeys[0];
    const lastRect = useRef<DOMRect | null>(null);
    const tabRefs = useRef(new Map<string, HTMLButtonElement>());

    const selectKey = (key: string) => {
      const item = items.find((candidate) => candidate.key === key);
      if (!isSelectableItem(item)) return;
      if (!isControlled) setUncontrolledKey(key);
      if (key !== resolvedSelectedKey) onChange?.(key);
    };

    const focusTab = (key: string | undefined) => {
      if (key === undefined) return;
      tabRefs.current.get(key)?.focus({ preventScroll: true });
    };

    const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, key: string) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

      let nextKey: string | undefined;

      switch (event.key) {
        case 'Home':
          nextKey = selectableKeys[0];
          break;
        case 'End':
          nextKey = selectableKeys[selectableKeys.length - 1];
          break;
        case 'ArrowRight':
          if (orientation !== 'horizontal') return;
          nextKey = getNextKey(selectableKeys, key, 1);
          break;
        case 'ArrowLeft':
          if (orientation !== 'horizontal') return;
          nextKey = getNextKey(selectableKeys, key, -1);
          break;
        case 'ArrowDown':
          if (orientation !== 'vertical') return;
          nextKey = getNextKey(selectableKeys, key, 1);
          break;
        case 'ArrowUp':
          if (orientation !== 'vertical') return;
          nextKey = getNextKey(selectableKeys, key, -1);
          break;
        default:
          return;
      }

      event.preventDefault();
      if (nextKey === undefined) return;
      if (nextKey !== resolvedSelectedKey) selectKey(nextKey);
      focusTab(nextKey);
    };

    const tabButtons = items.map((item, index) => (
      <TabButton
        key={item.key}
        tabId={getTabId(baseId, index)}
        panelId={item.content === undefined ? undefined : getPanelId(baseId, index)}
        item={item}
        isSelected={item.key === resolvedSelectedKey}
        isFocusable={item.key === focusableKey}
        onSelect={selectKey}
        onKeyDown={handleTabKeyDown}
        setTabRef={(node) => {
          if (node === null) {
            tabRefs.current.delete(item.key);
          } else {
            tabRefs.current.set(item.key, node);
          }
        }}
        lastRect={lastRect}
      />
    ));

    return (
      <div
        ref={ref}
        id={id}
        data-orientation={orientation}
        className={clsx('tabs', variant === 'secondary' && 'tabs--secondary', className)}
        {...rootProps}
      >
        <div className="tabs__list-container">
          <div
            role="tablist"
            aria-orientation={orientation}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            data-orientation={orientation}
            className="tabs__list"
          >
            {tabButtons}
          </div>
        </div>
        {selectedItem?.content !== undefined && selectedIndex >= 0 && (
          <div
            id={getPanelId(baseId, selectedIndex)}
            role="tabpanel"
            aria-labelledby={getTabId(baseId, selectedIndex)}
            tabIndex={0}
            data-orientation={orientation}
            className="tabs__panel"
          >
            {selectedItem.content}
          </div>
        )}
      </div>
    );
  },
);

Tabs.displayName = 'Tabs';

export default Tabs;
