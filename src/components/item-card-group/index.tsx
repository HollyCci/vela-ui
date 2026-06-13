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

export type ItemCardGroupProps = HTMLAttributes<HTMLDivElement> & {
  variant?: ItemCardGroupVariant;
  layout?: ItemCardGroupLayout;
  /** grid 布局时的列数（CSS 变量 --item-card-group-columns，默认 2） */
  columns?: number;
  isPressable?: boolean;
  selectedKey?: ItemCardGroupSelectionKey | null;
  defaultSelectedKey?: ItemCardGroupSelectionKey | null;
  onSelectionChange?: (key: ItemCardGroupSelectionKey | null) => void;
  onItemPress?: (key: ItemCardGroupSelectionKey, event: ItemCardPressEvent) => void;
};

type SectionProps = HTMLAttributes<HTMLDivElement>;

const isItemCardElement = (child: ReactNode): child is ReactElement<ItemCardProps> =>
  isValidElement<ItemCardProps>(child) &&
  (child.type as { displayName?: string }).displayName === 'ItemCard';

const getItemKey = (child: ReactElement<ItemCardProps>): ItemCardGroupSelectionKey | null => {
  if (typeof child.props.id === 'string' && child.props.id.length > 0) return child.props.id;
  if (typeof child.key === 'string' || typeof child.key === 'number') return child.key;
  return null;
};

const ItemCardGroupRoot = forwardRef<HTMLDivElement, ItemCardGroupProps>(
  (
    {
      variant = 'default',
      layout = 'list',
      columns,
      className,
      style,
      isPressable,
      selectedKey,
      defaultSelectedKey,
      onSelectionChange,
      onItemPress,
      children,
      ...rest
    },
    ref,
  ) => {
    const [innerSelectedKey, setInnerSelectedKey] =
      useState<ItemCardGroupSelectionKey | null>(defaultSelectedKey ?? null);
    const hasSelection =
      selectedKey !== undefined ||
      defaultSelectedKey !== undefined ||
      onSelectionChange !== undefined;
    const currentSelectedKey = selectedKey !== undefined ? selectedKey : innerSelectedKey;
    const shouldEnhanceChildren =
      isPressable !== undefined || onItemPress !== undefined || hasSelection;

    const updateSelection = (key: ItemCardGroupSelectionKey, nextSelected: boolean) => {
      if (!hasSelection) return;

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
            nextProps.isSelected = child.props.isSelected ?? currentSelectedKey === itemKey;
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
        {...rest}
      >
        {enhancedChildren}
      </div>
    );
  },
);
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
