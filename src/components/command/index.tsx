'use client';

import {
  createContext,
  useContext,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import {
  Autocomplete,
  Header,
  Input,
  Menu,
  MenuItem,
  MenuSection,
  ModalOverlay,
  Modal,
  Dialog,
  SearchField,
  Separator,
  useFilter,
  type MenuProps,
  type MenuItemProps,
  type MenuSectionProps,
  type ModalOverlayProps,
  type SearchFieldProps,
  type InputProps,
  type SeparatorProps,
} from 'react-aria-components';
import { CloseButton, type CloseButtonProps } from '@heroui/react';
import clsx from 'clsx';

export type CommandSize = 'sm' | 'md' | 'lg';
export type CommandBackdropVariant = 'opaque' | 'blur' | 'transparent';

/** 根 provider 仅透传 children，不渲染 DOM；开合由 Command.Backdrop 受控驱动 */
export type CommandProps = { children?: ReactNode };

/** ModalOverlay 已含遮罩全部 props，这里加 variant 并收窄 className/style */
export type CommandBackdropProps = Omit<ModalOverlayProps, 'className' | 'style'> & {
  variant?: CommandBackdropVariant;
  className?: string;
  style?: CSSProperties;
};

export type CommandContainerProps = Omit<HTMLAttributes<HTMLDivElement>, 'className'> & {
  size?: CommandSize;
  className?: string;
};

/** Dialog 内嵌 Autocomplete：受控/非受控搜索值与自定义 filter 都在此层 */
export type CommandDialogProps = Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'role'> & {
  defaultInputValue?: string;
  inputValue?: string;
  onInputChange?: (value: string) => void;
  filter?: (textValue: string, inputValue: string) => boolean;
  className?: string;
};

export type CommandHeaderProps = HTMLAttributes<HTMLDivElement>;
export type CommandFooterProps = HTMLAttributes<HTMLDivElement>;

export type CommandInputGroupProps = Omit<SearchFieldProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type CommandInputGroupAffixProps = HTMLAttributes<HTMLDivElement>;

export type CommandInputProps = Omit<InputProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type CommandClearButtonProps = Omit<CloseButtonProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type CommandListProps<T extends object = object> = Omit<
  MenuProps<T>,
  'className' | 'style'
> & {
  className?: string;
  style?: CSSProperties;
};

export type CommandItemProps = Omit<MenuItemProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

type CommandKey = string | number;

export type CommandCollectionItem = {
  id: CommandKey;
  label: ReactNode;
  description?: ReactNode;
  shortcut?: ReactNode;
  icon?: ReactNode;
  textValue?: string;
  isDisabled?: boolean;
  itemProps?: Omit<CommandItemProps, 'id' | 'textValue' | 'isDisabled' | 'children'>;
};

export type CommandCollectionGroup<TItem extends CommandCollectionItem = CommandCollectionItem> = {
  id?: CommandKey;
  heading?: ReactNode;
  items: readonly TItem[];
};

export type CommandGroupProps<T extends object = object> = Omit<
  MenuSectionProps<T>,
  'className' | 'style' | 'children'
> & {
  /** 分组标题，渲染为 command__group-heading（对齐参考实现 Anatomy 的 heading prop） */
  heading?: ReactNode;
  /** 分组内的命令项；heading 由本组件单独渲染为 Header 槽 */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export type CommandSeparatorProps = Omit<SeparatorProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type CommandCollectionProps<TItem extends CommandCollectionItem = CommandCollectionItem> = Omit<
  CommandListProps<TItem>,
  'children'
> & {
  groups: readonly CommandCollectionGroup<TItem>[];
  groupClassName?: string;
  itemClassName?: string;
  renderItem?: (item: TItem, group: CommandCollectionGroup<TItem>) => ReactNode;
};

/** Container → Dialog 透传尺寸（二者非直接父子，用 context 串联，对齐 command__dialog--<size>） */
const CommandSizeContext = createContext<CommandSize>('md');

/** 根 provider 只透传 children，不渲染 DOM；开合由 Command.Backdrop 的 isOpen/onOpenChange 受控驱动 */
const CommandRoot = ({ children }: CommandProps) => <>{children}</>;
CommandRoot.displayName = 'Command';

/** 全屏遮罩（RAC ModalOverlay）：isEntering/isExiting 由底座输出 data-entering/data-exiting，对齐参考实现动画 */
const Backdrop = ({ variant = 'opaque', className, style, ...rest }: CommandBackdropProps) => (
  <ModalOverlay
    isDismissable
    className={clsx('command__backdrop', `command__backdrop--${variant}`, className)}
    style={style}
    {...rest}
  />
);
Backdrop.displayName = 'Command.Backdrop';

/** 定位容器（RAC Modal）：携带 size 经 context 下发，data-entering/data-exiting 由底座输出 */
const Container = ({ size = 'md', className, children, ...rest }: CommandContainerProps) => (
  <Modal className={clsx('command__container', className)} {...rest}>
    <CommandSizeContext.Provider value={size}>{children}</CommandSizeContext.Provider>
  </Modal>
);
Container.displayName = 'Command.Container';

/**
 * Dialog 内嵌 RAC Autocomplete：把搜索框（SearchField）与列表（Menu）联动过滤。
 * inputValue/onInputChange 透传给 Autocomplete 实现受控搜索；filter 缺省为大小写不敏感 contains。
 */
const CommandDialog = ({
  defaultInputValue,
  inputValue,
  onInputChange,
  filter,
  className,
  children,
  ...rest
}: CommandDialogProps) => {
  const size = useContext(CommandSizeContext);
  const { contains } = useFilter({ sensitivity: 'base' });
  const resolvedFilter = filter ?? ((textValue: string, input: string) => contains(textValue, input));

  return (
    <Dialog className={clsx('command__dialog', `command__dialog--${size}`, className)} {...rest}>
      <Autocomplete
        defaultInputValue={defaultInputValue}
        inputValue={inputValue}
        onInputChange={onInputChange}
        filter={resolvedFilter}
      >
        {children}
      </Autocomplete>
    </Dialog>
  );
};
CommandDialog.displayName = 'Command.Dialog';

const CommandHeader = ({ className, ...rest }: CommandHeaderProps) => (
  <div data-slot="command-header" className={clsx('command__header', className)} {...rest} />
);
CommandHeader.displayName = 'Command.Header';

const Footer = ({ className, ...rest }: CommandFooterProps) => (
  <div data-slot="command-footer" className={clsx('command__footer', className)} {...rest} />
);
Footer.displayName = 'Command.Footer';

const Prefix = ({ className, ...rest }: CommandInputGroupAffixProps) => (
  <div
    data-slot="command-input-group-prefix"
    className={clsx('command__input-group-prefix', className)}
    {...rest}
  />
);
Prefix.displayName = 'Command.InputGroup.Prefix';

const Suffix = ({ className, ...rest }: CommandInputGroupAffixProps) => (
  <div
    data-slot="command-input-group-suffix"
    className={clsx('command__input-group-suffix', className)}
    {...rest}
  />
);
Suffix.displayName = 'Command.InputGroup.Suffix';

const CommandInput = ({ className, style, ...rest }: CommandInputProps) => (
  <Input
    placeholder="Search commands..."
    className={clsx('command__input', className)}
    style={style}
    {...rest}
  />
);
CommandInput.displayName = 'Command.InputGroup.Input';

/** 接入 RAC SearchField clear 槽：点击自动清空输入，并随 data-empty 隐藏。 */
const ClearButton = ({
  className,
  style,
  'aria-label': ariaLabel = '清空搜索',
  ...rest
}: CommandClearButtonProps) => (
  <CloseButton
    slot="clear"
    aria-label={ariaLabel}
    data-slot="command-input-group-clear-button"
    className={clsx('command__input-group-clear-button', className)}
    style={style}
    {...rest}
  />
);
ClearButton.displayName = 'Command.InputGroup.ClearButton';

/** 搜索框容器（RAC SearchField）：清空时底座输出 data-empty，对齐 [data-empty] 隐藏 ClearButton */
const InputGroupRoot = ({ autoFocus = true, className, style, ...rest }: CommandInputGroupProps) => (
  <SearchField
    autoFocus={autoFocus}
    aria-label="Search commands"
    className={clsx('command__input-group', className)}
    style={style}
    {...rest}
  />
);
InputGroupRoot.displayName = 'Command.InputGroup';

const InputGroup = Object.assign(InputGroupRoot, {
  Prefix,
  Input: CommandInput,
  Suffix,
  ClearButton,
});

const Item = ({ className, ...rest }: CommandItemProps) => (
  <MenuItem data-slot="command-item" className={clsx('command__item', className)} {...rest} />
);
Item.displayName = 'Command.Item';

/** 分组（RAC MenuSection）：heading 渲染为 command__group-heading（RAC Header 集合槽） */
const Group = <T extends object = object>({
  heading,
  className,
  children,
  ...rest
}: CommandGroupProps<T>) => (
  <MenuSection data-slot="command-group" className={clsx('command__group', className)} {...rest}>
    {heading !== undefined && <Header className="command__group-heading">{heading}</Header>}
    {children}
  </MenuSection>
);
Group.displayName = 'Command.Group';

const CommandSeparator = ({ className, ...rest }: CommandSeparatorProps) => (
  <Separator className={clsx('command__separator', className)} {...rest} />
);
CommandSeparator.displayName = 'Command.Separator';

const defaultEmptyState = () => <div className="command__empty">No results found.</div>;

const getPlainText = (node: ReactNode): string | undefined => {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  return undefined;
};

const getCollectionItemTextValue = <TItem extends CommandCollectionItem>(
  item: TItem,
  group: CommandCollectionGroup<TItem>,
) =>
  item.textValue ??
  [getPlainText(item.label), getPlainText(item.description), getPlainText(group.heading)]
    .filter(Boolean)
    .join(' ');

/**
 * 命令列表（RAC Menu）：作为 Autocomplete 的 collection，输入框打字 → 经 filter 实时过滤；
 * 方向键移动高亮、Enter/点击触发 onAction 均由底座提供。空态走 renderEmptyState（缺省统一类名）。
 */
const List = <T extends object = object>({
  className,
  style,
  renderEmptyState,
  ...rest
}: CommandListProps<T>) => (
  <Menu<T>
    data-slot="command-list"
    className={clsx('command__list', className)}
    style={style}
    renderEmptyState={renderEmptyState ?? defaultEmptyState}
    {...rest}
  />
);
List.displayName = 'Command.List';

const Collection = <TItem extends CommandCollectionItem = CommandCollectionItem>({
  groups,
  groupClassName,
  itemClassName,
  renderItem,
  ...rest
}: CommandCollectionProps<TItem>) => (
  <List<TItem> {...rest}>
    {groups.map((group, groupIndex) => {
      const groupKey = group.id ?? getPlainText(group.heading) ?? groupIndex;

      return (
        <Group<TItem> key={groupKey} heading={group.heading} className={groupClassName}>
          {group.items.map((item) => (
            <Item
              key={item.id}
              id={item.id}
              textValue={getCollectionItemTextValue(item, group)}
              isDisabled={item.isDisabled}
              className={itemClassName}
              {...item.itemProps}
            >
              {renderItem !== undefined ? (
                renderItem(item, group)
              ) : (
                <>
                  {item.icon !== undefined && <span className="command__item-icon">{item.icon}</span>}
                  <span className="command__item-content">
                    <span className="command__item-label">{item.label}</span>
                    {item.description !== undefined && (
                      <span className="command__item-description">{item.description}</span>
                    )}
                  </span>
                  {item.shortcut !== undefined && <kbd>{item.shortcut}</kbd>}
                </>
              )}
            </Item>
          ))}
        </Group>
      );
    })}
  </List>
);
Collection.displayName = 'Command.Collection';

/**
 * 命令面板（参考 API）：Backdrop/Container/Dialog 为 RAC ModalOverlay/Modal/Dialog；
 * Dialog 内嵌 RAC Autocomplete + useFilter，把 InputGroup（SearchField）与 List（Menu）联动，
 * 实现「打字 → 实时过滤 → 方向键高亮 → Enter/点击触发 onAction」完整链路。
 */
const Command = Object.assign(CommandRoot, {
  Backdrop,
  Container,
  Dialog: CommandDialog,
  Header: CommandHeader,
  InputGroup,
  List,
  Collection,
  Item,
  Group,
  Separator: CommandSeparator,
  Footer,
});

export default Command;
