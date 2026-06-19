'use client';

import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import clsx from 'clsx';
import type { ItemCardPressEvent, ItemCardProps } from '../item-card';

export type ItemCardGroupVariant = 'default' | 'secondary' | 'tertiary' | 'outline' | 'transparent';

export type ItemCardGroupLayout = 'list' | 'grid';

export type ItemCardGroupSelectionKey = string | number;

/** 选择模式：默认单选；multiple 时多张卡片可同时选中（对齐 react-aria selectionMode） */
export type ItemCardGroupSelectionMode = 'single' | 'multiple';

type ItemCardGroupBaseProps = HTMLAttributes<HTMLDivElement> & {
  variant?: ItemCardGroupVariant;
  layout?: ItemCardGroupLayout;
  /** grid 布局时的列数（CSS 变量 --item-card-group-columns，默认 2） */
  columns?: number;
  isPressable?: boolean;
  onItemPress?: (key: ItemCardGroupSelectionKey, event: ItemCardPressEvent) => void;
};

/** 单选 API（默认，向后兼容）：受控/非受控均以单个 key|null 表达 */
type ItemCardGroupSingleSelectionProps = {
  selectionMode?: 'single';
  selectedKey?: ItemCardGroupSelectionKey | null;
  defaultSelectedKey?: ItemCardGroupSelectionKey | null;
  onSelectionChange?: (key: ItemCardGroupSelectionKey | null) => void;
  selectedKeys?: never;
  defaultSelectedKeys?: never;
};

/** 多选 API：以 Set 表达（对齐 react-aria 的 selectedKeys/onSelectionChange(Set)） */
type ItemCardGroupMultipleSelectionProps = {
  selectionMode: 'multiple';
  selectedKeys?: Iterable<ItemCardGroupSelectionKey>;
  defaultSelectedKeys?: Iterable<ItemCardGroupSelectionKey>;
  onSelectionChange?: (keys: Set<ItemCardGroupSelectionKey>) => void;
  selectedKey?: never;
  defaultSelectedKey?: never;
};

export type ItemCardGroupProps = ItemCardGroupBaseProps &
  (ItemCardGroupSingleSelectionProps | ItemCardGroupMultipleSelectionProps);

type SectionProps = HTMLAttributes<HTMLDivElement>;

const isItemCardElement = (child: ReactNode): child is ReactElement<ItemCardProps> =>
  isValidElement<ItemCardProps>(child) &&
  (child.type as { displayName?: string }).displayName === 'ItemCard';

const getItemKey = (child: ReactElement<ItemCardProps>): ItemCardGroupSelectionKey | null => {
  if (typeof child.props.id === 'string' && child.props.id.length > 0) return child.props.id;
  if (typeof child.key === 'string' || typeof child.key === 'number') return child.key;
  return null;
};

const ItemCardGroupRoot = forwardRef<HTMLDivElement, ItemCardGroupProps>((props, ref) => {
  const {
    variant = 'default',
    layout = 'list',
    columns,
    className,
    style,
    isPressable,
    onItemPress,
    children,
    selectionMode = 'single',
    ...rest
  } = props;

  // 多选模式以 Set 承载选中项；单选模式沿用单个 key|null，二者互不串味
  const isMultiple = selectionMode === 'multiple';

  const {
    selectedKey,
    defaultSelectedKey,
    selectedKeys,
    defaultSelectedKeys,
    onSelectionChange,
    ...domRest
  } = rest as {
    selectedKey?: ItemCardGroupSelectionKey | null;
    defaultSelectedKey?: ItemCardGroupSelectionKey | null;
    selectedKeys?: Iterable<ItemCardGroupSelectionKey>;
    defaultSelectedKeys?: Iterable<ItemCardGroupSelectionKey>;
    onSelectionChange?: (
      next: ItemCardGroupSelectionKey | null | Set<ItemCardGroupSelectionKey>,
    ) => void;
  } & HTMLAttributes<HTMLDivElement>;

  const [innerSelectedKey, setInnerSelectedKey] = useState<ItemCardGroupSelectionKey | null>(
    defaultSelectedKey ?? null,
  );
  const [innerSelectedKeys, setInnerSelectedKeys] = useState<Set<ItemCardGroupSelectionKey>>(
    () => new Set(defaultSelectedKeys ?? []),
  );

  const hasSelection = isMultiple
    ? selectedKeys !== undefined ||
      defaultSelectedKeys !== undefined ||
      onSelectionChange !== undefined
    : selectedKey !== undefined ||
      defaultSelectedKey !== undefined ||
      onSelectionChange !== undefined;

  const currentSelectedKey = selectedKey !== undefined ? selectedKey : innerSelectedKey;
  const currentSelectedKeys =
    selectedKeys !== undefined ? new Set(selectedKeys) : innerSelectedKeys;

  const shouldEnhanceChildren =
    isPressable !== undefined || onItemPress !== undefined || hasSelection;

  const isItemSelected = (itemKey: ItemCardGroupSelectionKey) =>
    isMultiple ? currentSelectedKeys.has(itemKey) : currentSelectedKey === itemKey;

  const updateSelection = (key: ItemCardGroupSelectionKey, nextSelected: boolean) => {
    if (!hasSelection) return;

    if (isMultiple) {
      // 多选：切换进/出 Set，不清空其它选中项
      const isCurrentlySelected = currentSelectedKeys.has(key);
      if (isCurrentlySelected === nextSelected) return;

      const nextKeys = new Set(currentSelectedKeys);
      if (nextSelected) nextKeys.add(key);
      else nextKeys.delete(key);

      if (selectedKeys === undefined) setInnerSelectedKeys(nextKeys);
      onSelectionChange?.(nextKeys);
      return;
    }

    const nextKey = nextSelected ? key : currentSelectedKey === key ? null : currentSelectedKey;
    if (nextKey === currentSelectedKey) return;

    if (selectedKey === undefined) setInnerSelectedKey(nextKey);
    onSelectionChange?.(nextKey);
  };

  const enhancedChildren = shouldEnhanceChildren
    ? Children.map(children, (child) => {
        if (!isItemCardElement(child)) return child;

        const itemKey = getItemKey(child);
        const childOnPress = child.props.onPress;
        const childOnSelectedChange = child.props.onSelectedChange;
        const nextProps: Partial<ItemCardProps> = {};

        if (isPressable !== undefined || onItemPress !== undefined) {
          nextProps.isPressable = child.props.isPressable ?? isPressable ?? true;
        }

        if (onItemPress !== undefined && itemKey !== null) {
          nextProps.onPress = (event) => {
            childOnPress?.(event);
            if (!event.defaultPrevented) onItemPress(itemKey, event);
          };
        }

        if (hasSelection && itemKey !== null) {
          nextProps.isSelected = child.props.isSelected ?? isItemSelected(itemKey);
          nextProps.onSelectedChange = (nextSelected) => {
            childOnSelectedChange?.(nextSelected);
            updateSelection(itemKey, nextSelected);
          };
        }

        return cloneElement(child, nextProps);
      })
    : children;

  return (
    <div
      ref={ref}
      role="group"
      className={clsx(
        'item-card-group',
        `item-card-group--${variant}`,
        `item-card-group--${layout}`,
        className,
      )}
      style={
        columns !== undefined
          ? { ...style, ['--item-card-group-columns' as string]: String(columns) }
          : style
      }
      {...domRest}
    >
      {enhancedChildren}
    </div>
  );
});
ItemCardGroupRoot.displayName = 'ItemCardGroup';

const Header = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    data-slot="item-card-group-header"
    className={clsx('item-card-group__header', className)}
    {...rest}
  />
));
Header.displayName = 'ItemCardGroup.Header';

const Title = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('item-card-group__title', className)} {...rest} />
));
Title.displayName = 'ItemCardGroup.Title';

const Description = forwardRef<HTMLDivElement, SectionProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={clsx('item-card-group__description', className)} {...rest} />
));
Description.displayName = 'ItemCardGroup.Description';

const ItemCardGroup = Object.assign(ItemCardGroupRoot, { Header, Title, Description });

export default ItemCardGroup;
