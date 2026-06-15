'use client';

import type { ComponentProps, CSSProperties, HTMLAttributes } from 'react';
import {
  Description as HeroDescription,
  Label as HeroLabel,
  MenuItem as HeroMenuItem,
  type MenuItemRootProps as HeroMenuItemRootProps,
} from '@heroui/react';

export type MenuItemVariant = 'default' | 'danger';

/** 必须渲染在 RAC Menu 集合内（如 @heroui/react 的 Dropdown.Menu / Menu），脱离集合上下文会抛错 */
export type MenuItemProps = Omit<HeroMenuItemRootProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type MenuItemIndicatorProps = HTMLAttributes<HTMLSpanElement> & {
  /** 选中指示器形态（底座默认 checkmark），选中态由 Menu 的 selection 状态驱动 */
  type?: 'checkmark' | 'dot';
};

export type MenuItemSubmenuIndicatorProps = HTMLAttributes<HTMLSpanElement>;

export type MenuItemLabelProps = ComponentProps<typeof HeroLabel>;

export type MenuItemDescriptionProps = ComponentProps<typeof HeroDescription>;

const MenuItemRoot = ({ className, style, ...rest }: MenuItemProps) => (
  <HeroMenuItem className={className} style={style} {...rest} />
);
MenuItemRoot.displayName = 'MenuItem';

const Indicator = (props: MenuItemIndicatorProps) => <HeroMenuItem.Indicator {...props} />;
Indicator.displayName = 'MenuItem.Indicator';

const Label = (props: MenuItemLabelProps) => <HeroLabel {...props} />;
Label.displayName = 'MenuItem.Label';

const Description = (props: MenuItemDescriptionProps) => <HeroDescription {...props} />;
Description.displayName = 'MenuItem.Description';

/** 仅在项处于 SubmenuTrigger 内（hasSubmenu）时渲染，否则底座返回 null */
const SubmenuIndicator = (props: MenuItemSubmenuIndicatorProps) => (
  <HeroMenuItem.SubmenuIndicator {...props} />
);
SubmenuIndicator.displayName = 'MenuItem.SubmenuIndicator';

/**
 * 基于 @heroui/react MenuItem（RAC MenuItem）的菜单项（参考 API）：
 * 键盘导航、hover/press/disabled、单选/多选选中态均由底座提供；
 * variant="danger" 输出 menu-item--danger，类名天然对齐参考实现 CSS。
 */
const MenuItem = Object.assign(MenuItemRoot, { Indicator, Label, Description, SubmenuIndicator });

export default MenuItem;
