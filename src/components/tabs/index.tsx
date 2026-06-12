import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
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

type TabButtonProps = {
  item: TabItem;
  isSelected: boolean;
  onSelect?: (key: string) => void;
};

const TabButton = ({ item, isSelected, onSelect }: TabButtonProps) => {
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
      {isSelected && <span className="tabs__indicator" aria-hidden="true" />}
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

    const tabButtons = items.map((item) => (
      <TabButton key={item.key} item={item} isSelected={item.key === selectedKey} onSelect={onChange} />
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
