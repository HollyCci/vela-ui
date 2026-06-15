'use client';

import {
  useMemo,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  Button as RACButton,
  Dialog as RACDialog,
  DialogTrigger as RACDialogTrigger,
  Input as RACInput,
  ListBox as RACListBox,
  ListBoxItem as RACListBoxItem,
  Popover as RACPopover,
  ToggleButton as RACToggleButton,
  ToggleButtonGroup as RACToggleButtonGroup,
  type Key,
} from 'react-aria-components';
import clsx from 'clsx';

export type EmojiPickerSize = 'sm' | 'md' | 'lg';

/** 一个表情分类（caller 可整体替换 categories） */
export type EmojiCategory = {
  id: string;
  /** 分类标签上显示的图标（通常是代表性 emoji） */
  icon: string;
  label: string;
  emojis: string[];
};

export type EmojiPickerProps = {
  size?: EmojiPickerSize;
  /** 分类数据，缺省用内置小型数据集（参考 API：Custom Categories） */
  categories?: EmojiCategory[];
  /** 最近使用，非空时置顶为 "recent" 分类（参考 API） */
  recentEmojis?: string[];
  /** 选中一个表情时回调（参考实现 onEmojiSelect） */
  onEmojiSelect?: (emoji: string) => void;
  /** 受控当前选中表情，显示在 trigger 的 Value 中 */
  value?: string;
  defaultValue?: string;
  /** 内联渲染：不套 trigger/popover，直接展示选择面板（参考实现 Inline 变体） */
  isInline?: boolean;
  isDisabled?: boolean;
  /** trigger 的无障碍标签 */
  'aria-label'?: string;
  className?: string;
  style?: CSSProperties;
};

const RECENT_ID = 'recent';

/** 内置小型分类数据，足够演示分类切换与搜索过滤 */
const DEFAULT_CATEGORIES: EmojiCategory[] = [
  {
    id: 'smileys',
    icon: '😀',
    label: '表情',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🙂', '😉', '😊', '😍', '😘', '😜', '🤔', '😎', '🥳'],
  },
  {
    id: 'gestures',
    icon: '👍',
    label: '手势',
    emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤙', '👋', '🙌', '👏', '🙏', '💪', '🤝'],
  },
  {
    id: 'animals',
    icon: '🐶',
    label: '动物',
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸'],
  },
  {
    id: 'food',
    icon: '🍎',
    label: '食物',
    emojis: ['🍎', '🍌', '🍇', '🍓', '🍑', '🍔', '🍟', '🍕', '🌮', '🍜', '🍣', '🍩'],
  },
  {
    id: 'objects',
    icon: '💡',
    label: '物件',
    emojis: ['💡', '📱', '💻', '⌨️', '🖱️', '🎧', '📷', '⏰', '🔋', '🔑', '📎', '✏️'],
  },
];

const matchesSearch = (emoji: string, category: EmojiCategory, query: string) => {
  // 表情本身无可读文本，按分类标签做包含匹配，足够演示"实时过滤"
  const q = query.trim().toLowerCase();
  if (q === '') return true;
  return emoji.includes(q) || category.label.toLowerCase().includes(q) || category.id.includes(q);
};

const Item = ({ emoji, size }: { emoji: string; size: EmojiPickerSize }) => (
  <RACListBoxItem
    id={emoji}
    textValue={emoji}
    data-slot="emoji-picker-item"
    className={clsx('emoji-picker__item', `emoji-picker__item--${size}`)}
  >
    {emoji}
  </RACListBoxItem>
);
Item.displayName = 'EmojiPicker.Item';

type PanelProps = {
  size: EmojiPickerSize;
  categories: EmojiCategory[];
  recentEmojis?: string[];
  onEmojiSelect?: (emoji: string) => void;
  selectedEmoji?: string;
  footer?: ReactNode;
};

/**
 * 选择面板：分类标签（RAC ToggleButtonGroup）+ 搜索框 + 表情网格（RAC ListBox grid）。
 * 切分类只换网格内容；搜索非空时跨全部分类过滤并忽略分类选择；点表情经 onSelectionChange 上报。
 */
const Panel = ({ size, categories, recentEmojis, onEmojiSelect, selectedEmoji, footer }: PanelProps) => {
  const allCategories = useMemo<EmojiCategory[]>(() => {
    if (recentEmojis && recentEmojis.length > 0) {
      return [{ id: RECENT_ID, icon: '🕘', label: '最近', emojis: recentEmojis }, ...categories];
    }
    return categories;
  }, [categories, recentEmojis]);

  const [activeCategory, setActiveCategory] = useState<Key>(allCategories[0]?.id ?? '');
  const [query, setQuery] = useState('');

  const handleCategoryChange = (keys: Set<Key>) => {
    const first = keys.values().next();
    if (!first.done) setActiveCategory(first.value);
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  // 用 onAction 而非 onSelectionChange：onAction 每次激活 item 都触发（含重复点已选表情），
  // 而 RAC 单选 ListBox 对"再次点击已选 key"不重发 onSelectionChange。选中高亮由受控 selectedKeys 承载。
  const handleEmojiAction = (key: Key) => {
    onEmojiSelect?.(String(key));
  };

  const isSearching = query.trim() !== '';

  const visibleEmojis = useMemo<string[]>(() => {
    if (isSearching) {
      const seen = new Set<string>();
      for (const category of allCategories) {
        if (category.id === RECENT_ID) continue;
        for (const emoji of category.emojis) {
          if (!seen.has(emoji) && matchesSearch(emoji, category, query)) seen.add(emoji);
        }
      }
      return [...seen];
    }
    const current = allCategories.find((category) => category.id === activeCategory);
    return current?.emojis ?? [];
  }, [allCategories, activeCategory, query, isSearching]);

  return (
    <div data-slot="emoji-picker-content" className="emoji-picker__content">
      <RACToggleButtonGroup
        data-slot="emoji-picker-categories"
        aria-label="表情分类"
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={[activeCategory]}
        onSelectionChange={handleCategoryChange}
        className="flex items-center gap-1"
      >
        {allCategories.map((category) => (
          <RACToggleButton
            key={category.id}
            id={category.id}
            aria-label={category.label}
            className="emoji-picker__skin-tone-picker"
          >
            {category.icon}
          </RACToggleButton>
        ))}
      </RACToggleButtonGroup>
      <RACInput
        aria-label="搜索表情"
        placeholder="搜索表情…"
        value={query}
        onChange={handleSearchChange}
        className="w-full rounded-medium bg-default px-2 py-1 text-sm outline-none"
      />
      <RACListBox
        data-slot="emoji-picker-grid"
        aria-label="表情网格"
        layout="grid"
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={selectedEmoji ? [selectedEmoji] : []}
        onAction={handleEmojiAction}
        className="emoji-picker__grid"
        renderEmptyState={renderEmptyState}
      >
        {visibleEmojis.map((emoji) => (
          <Item key={emoji} emoji={emoji} size={size} />
        ))}
      </RACListBox>
      {footer !== undefined && (
        <div data-slot="emoji-picker-footer" className="emoji-picker__footer">
          {footer}
        </div>
      )}
    </div>
  );
};
Panel.displayName = 'EmojiPicker.Panel';

const renderEmptyState = () => (
  <div data-slot="emoji-picker-empty" className="emoji-picker__empty">
    没有匹配的表情
  </div>
);

/**
 * 表情选择器（参考 API）：分类切换 / 搜索实时过滤 / 点击触发 onEmojiSelect。
 * 默认弹层模式（RAC DialogTrigger + Popover，按钮打开、Esc/遮罩关闭、焦点圈定），
 * isInline 时直接内联渲染面板（参考实现 Inline 变体）。分类标签用 RAC ToggleButtonGroup。
 */
const EmojiPicker = ({
  size = 'md',
  categories = DEFAULT_CATEGORIES,
  recentEmojis,
  onEmojiSelect,
  value,
  defaultValue = '😀',
  isInline = false,
  isDisabled = false,
  'aria-label': ariaLabel = 'Emoji',
  className,
  style,
}: EmojiPickerProps) => {
  const [selectedEmoji, setSelectedEmoji] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);

  const currentEmoji = value ?? selectedEmoji;

  const handleEmojiSelect = (emoji: string) => {
    if (value === undefined) setSelectedEmoji(emoji);
    onEmojiSelect?.(emoji);
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  if (isInline) {
    return (
      <div
        data-slot="emoji-picker"
        className={clsx('emoji-picker__popover', `emoji-picker__popover--${size}`, className)}
        style={style}
      >
        <Panel
          size={size}
          categories={categories}
          recentEmojis={recentEmojis}
          onEmojiSelect={onEmojiSelect}
          selectedEmoji={currentEmoji}
        />
      </div>
    );
  }

  return (
    <RACDialogTrigger isOpen={isOpen} onOpenChange={handleOpenChange}>
      <RACButton
        data-slot="emoji-picker-trigger"
        aria-label={ariaLabel}
        isDisabled={isDisabled}
        className={clsx('emoji-picker__trigger', className)}
        style={style}
      >
        <span data-slot="emoji-picker-value" className="emoji-picker__value">
          {currentEmoji}
        </span>
      </RACButton>
      <RACPopover
        data-slot="emoji-picker-popover"
        offset={4}
        placement="bottom"
        className={clsx('emoji-picker__popover', `emoji-picker__popover--${size}`)}
      >
        <RACDialog aria-label={ariaLabel} className="outline-none">
          <Panel
            size={size}
            categories={categories}
            recentEmojis={recentEmojis}
            onEmojiSelect={handleEmojiSelect}
            selectedEmoji={currentEmoji}
          />
        </RACDialog>
      </RACPopover>
    </RACDialogTrigger>
  );
};
EmojiPicker.displayName = 'EmojiPicker';

export default EmojiPicker;
