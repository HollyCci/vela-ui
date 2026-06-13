import {
  forwardRef,
  useLayoutEffect,
  useRef,
  type HTMLAttributes,
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
  selectedKey: string;
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
  isSelected: boolean;
  onSelect?: (key: string) => void;
  lastRect: RefObject<DOMRect | null>;
};

const TabButton = ({ item, isSelected, onSelect, lastRect }: TabButtonProps) => {
  const handleClick = () => {
    if (!item.isDisabled) onSelect?.(item.key);
  };

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      className="tabs__tab"
      data-selected={isSelected || undefined}
      data-disabled={item.isDisabled || undefined}
      disabled={item.isDisabled}
      onClick={handleClick}
    >
      <span className="tabs__separator" aria-hidden="true" />
      {isSelected && <TabIndicator lastRect={lastRect} />}
      {item.title}
    </button>
  );
};

TabButton.displayName = 'Tabs.TabButton';

const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      items,
      selectedKey,
      onChange,
      variant = 'primary',
      orientation = 'horizontal',
      className,
      ...rest
    },
    ref,
  ) => {
    const selectedItem = items.find((item) => item.key === selectedKey);
    const lastRect = useRef<DOMRect | null>(null);

    const tabButtons = items.map((item) => (
      <TabButton
        key={item.key}
        item={item}
        isSelected={item.key === selectedKey}
        onSelect={onChange}
        lastRect={lastRect}
      />
    ));

    return (
      <div
        ref={ref}
        data-orientation={orientation}
        className={clsx('tabs', variant === 'secondary' && 'tabs--secondary', className)}
        {...rest}
      >
        <div className="tabs__list-container">
          <div role="tablist" data-orientation={orientation} className="tabs__list">
            {tabButtons}
          </div>
        </div>
        {selectedItem?.content !== undefined && (
          <div role="tabpanel" data-orientation={orientation} className="tabs__panel">
            {selectedItem.content}
          </div>
        )}
      </div>
    );
  },
);

Tabs.displayName = 'Tabs';

export default Tabs;
