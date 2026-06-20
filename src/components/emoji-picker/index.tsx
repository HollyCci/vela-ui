'use client';

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import {
  Button as RACButton,
  type ButtonProps as RACButtonProps,
  Dialog as RACDialog,
  DialogTrigger as RACDialogTrigger,
  Input as RACInput,
  ListBox as RACListBox,
  type ListBoxProps as RACListBoxProps,
  ListBoxItem as RACListBoxItem,
  type ListBoxItemProps as RACListBoxItemProps,
  Popover as RACPopover,
  type PopoverProps as RACPopoverProps,
  SelectValue as RACSelectValue,
  type SelectValueProps as RACSelectValueProps,
  ToggleButton as RACToggleButton,
  type ToggleButtonProps as RACToggleButtonProps,
  ToggleButtonGroup as RACToggleButtonGroup,
  type Key,
  type Placement,
} from 'react-aria-components';
import clsx from 'clsx';

export type EmojiPickerSize = 'sm' | 'md' | 'lg';

/** 肤色：default 为不加 Fitzpatrick 修饰符（黄色基底） */
export type EmojiSkinTone = 'default' | 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark';

/**
 * 富表情条目（参考 API：可附可读名/关键词供搜索，标记 toneable 表示支持肤色修饰）。
 * caller 仍可直接传裸 emoji 字符串，内部会归一化，保证向后兼容。
 */
export type EmojiEntry = {
  char: string;
  /** 可读名，用于英文/拼音名称搜索 */
  name?: string;
  /** 额外搜索关键词 */
  keywords?: string[];
  /** 是否支持 Fitzpatrick 肤色修饰（人手/人形表情才适用） */
  toneable?: boolean;
};

/** caller 侧可混用裸字符串与富条目 */
export type EmojiInput = string | EmojiEntry;

/** 一个表情分类（caller 可整体替换 categories） */
export type EmojiCategory = {
  id: string;
  /** 分类标签上显示的图标（通常是代表性 emoji） */
  icon: string;
  label: string;
  emojis: EmojiInput[];
};

export type EmojiPickerProps = {
  size?: EmojiPickerSize;
  /** 分类数据，缺省用内置小型数据集（参考 API：Custom Categories） */
  categories?: EmojiCategory[];
  /** 最近使用，非空时置顶为 "recent" 分类（参考 API） */
  recentEmojis?: string[];
  /** 选中一个表情时回调（参考实现 onEmojiSelect），回调值为已套用肤色的最终字符 */
  onEmojiSelect?: (emoji: string) => void;
  /** 受控当前选中表情，显示在 trigger 的 Value 中 */
  value?: string;
  defaultValue?: string;
  /** 受控肤色（参考 API：Skin Tone Selector） */
  tone?: EmojiSkinTone;
  /** 非受控初始肤色 */
  defaultTone?: EmojiSkinTone;
  /** 肤色切换回调（参考 API） */
  onToneChange?: (tone: EmojiSkinTone) => void;
  /** 内联渲染：不套 trigger/popover，直接展示选择面板（参考实现 Inline 变体） */
  isInline?: boolean;
  isDisabled?: boolean;
  /** trigger 的无障碍标签 */
  'aria-label'?: string;
  className?: string;
  style?: CSSProperties;
};

const RECENT_ID = 'recent';

/** 归一化后的内部条目：char 始终存在，names 为小写检索词集合 */
type NormalizedEmoji = {
  char: string;
  names: string[];
  toneable: boolean;
};

/**
 * Fitzpatrick 肤色修饰符（U+1F3FB‥U+1F3FF）。default 不加修饰符。
 * 直接拼在基础人形/人手 emoji 之后即可重渲为对应肤色（纯 JS，无需 CSS）。
 */
const SKIN_TONE_MODIFIER: Record<EmojiSkinTone, string> = {
  default: '',
  light: '\u{1F3FB}',
  'medium-light': '\u{1F3FC}',
  medium: '\u{1F3FD}',
  'medium-dark': '\u{1F3FE}',
  dark: '\u{1F3FF}',
};

/** 肤色选择器中每个选项的展示色块（用 ✋ 套各档修饰符，default 用黄色基底） */
const SKIN_TONE_ORDER: EmojiSkinTone[] = ['default', 'light', 'medium-light', 'medium', 'medium-dark', 'dark'];
const SKIN_TONE_LABEL: Record<EmojiSkinTone, string> = {
  default: '默认',
  light: '浅',
  'medium-light': '中浅',
  medium: '中',
  'medium-dark': '中深',
  dark: '深',
};

/** 把 default/light/… 套到 ✋ 上得到色块预览 */
const toneSwatch = (tone: EmojiSkinTone) => `✋${SKIN_TONE_MODIFIER[tone]}`;

/**
 * 给可套肤色的 emoji 套上对应修饰符；default 或不可套色时原样返回。
 * 已含修饰符的字符不会重复叠加（caller 传的就是基础态）。
 */
const applyTone = (char: string, toneable: boolean, tone: EmojiSkinTone) => {
  if (!toneable || tone === 'default') return char;
  return `${char}${SKIN_TONE_MODIFIER[tone]}`;
};

/** 内置小型分类数据，足够演示分类切换、名称搜索与肤色重渲 */
const DEFAULT_CATEGORIES: EmojiCategory[] = [
  {
    id: 'smileys',
    icon: '😀',
    label: '表情',
    emojis: [
      { char: '😀', name: 'grinning', keywords: ['smile', 'happy', '笑'] },
      { char: '😃', name: 'smiley', keywords: ['smile', 'happy'] },
      { char: '😄', name: 'smile', keywords: ['happy', 'laugh'] },
      { char: '😁', name: 'grin', keywords: ['smile'] },
      { char: '😆', name: 'laughing', keywords: ['laugh', 'haha'] },
      { char: '😅', name: 'sweat smile', keywords: ['laugh', 'sweat'] },
      { char: '😂', name: 'joy', keywords: ['laugh', 'tears', '哭笑'] },
      { char: '🙂', name: 'slight smile', keywords: ['smile'] },
      { char: '😉', name: 'wink', keywords: ['flirt'] },
      { char: '😊', name: 'blush', keywords: ['smile', 'happy'] },
      { char: '😍', name: 'heart eyes', keywords: ['love', 'heart', '爱'] },
      { char: '😘', name: 'kiss', keywords: ['love', 'heart'] },
      { char: '😜', name: 'stuck out tongue wink', keywords: ['tongue', 'joke'] },
      { char: '🤔', name: 'thinking', keywords: ['hmm', '想'] },
      { char: '😎', name: 'sunglasses', keywords: ['cool'] },
      { char: '🥳', name: 'partying', keywords: ['party', 'celebrate', '庆祝'] },
    ],
  },
  {
    id: 'gestures',
    icon: '👍',
    label: '手势',
    emojis: [
      { char: '👍', name: 'thumbs up', keywords: ['like', 'yes', '赞'], toneable: true },
      { char: '👎', name: 'thumbs down', keywords: ['dislike', 'no'], toneable: true },
      { char: '👌', name: 'ok hand', keywords: ['ok', 'perfect'], toneable: true },
      { char: '✌️', name: 'victory', keywords: ['peace', 'win'], toneable: true },
      { char: '🤞', name: 'crossed fingers', keywords: ['luck', 'hope'], toneable: true },
      { char: '🤙', name: 'call me', keywords: ['hang', 'shaka'], toneable: true },
      { char: '👋', name: 'wave', keywords: ['hello', 'hi', 'bye', '招手'], toneable: true },
      { char: '🙌', name: 'raised hands', keywords: ['celebrate', 'praise'], toneable: true },
      { char: '👏', name: 'clap', keywords: ['applause', 'bravo', '鼓掌'], toneable: true },
      { char: '🙏', name: 'pray', keywords: ['please', 'thanks', '祈祷'], toneable: true },
      { char: '💪', name: 'muscle', keywords: ['strong', 'flex'], toneable: true },
      { char: '🤝', name: 'handshake', keywords: ['deal', 'agree'], toneable: true },
    ],
  },
  {
    id: 'animals',
    icon: '🐶',
    label: '动物',
    emojis: [
      { char: '🐶', name: 'dog', keywords: ['puppy', '狗'] },
      { char: '🐱', name: 'cat', keywords: ['kitten', '猫'] },
      { char: '🐭', name: 'mouse', keywords: ['rat'] },
      { char: '🐹', name: 'hamster', keywords: ['pet'] },
      { char: '🐰', name: 'rabbit', keywords: ['bunny'] },
      { char: '🦊', name: 'fox', keywords: [] },
      { char: '🐻', name: 'bear', keywords: [] },
      { char: '🐼', name: 'panda', keywords: ['熊猫'] },
      { char: '🐨', name: 'koala', keywords: [] },
      { char: '🐯', name: 'tiger', keywords: ['虎'] },
      { char: '🦁', name: 'lion', keywords: [] },
      { char: '🐸', name: 'frog', keywords: [] },
    ],
  },
  {
    id: 'food',
    icon: '🍎',
    label: '食物',
    emojis: [
      { char: '🍎', name: 'apple', keywords: ['fruit', '苹果'] },
      { char: '🍌', name: 'banana', keywords: ['fruit'] },
      { char: '🍇', name: 'grapes', keywords: ['fruit'] },
      { char: '🍓', name: 'strawberry', keywords: ['fruit'] },
      { char: '🍑', name: 'peach', keywords: ['fruit'] },
      { char: '🍔', name: 'hamburger', keywords: ['burger', 'food'] },
      { char: '🍟', name: 'fries', keywords: ['food'] },
      { char: '🍕', name: 'pizza', keywords: ['food'] },
      { char: '🌮', name: 'taco', keywords: ['food'] },
      { char: '🍜', name: 'ramen', keywords: ['noodle', '面'] },
      { char: '🍣', name: 'sushi', keywords: ['food'] },
      { char: '🍩', name: 'doughnut', keywords: ['donut', 'sweet'] },
    ],
  },
  {
    id: 'objects',
    icon: '💡',
    label: '物件',
    emojis: [
      { char: '💡', name: 'bulb', keywords: ['idea', 'light'] },
      { char: '📱', name: 'phone', keywords: ['mobile'] },
      { char: '💻', name: 'laptop', keywords: ['computer'] },
      { char: '⌨️', name: 'keyboard', keywords: [] },
      { char: '🖱️', name: 'mouse', keywords: ['click'] },
      { char: '🎧', name: 'headphone', keywords: ['music'] },
      { char: '📷', name: 'camera', keywords: ['photo'] },
      { char: '⏰', name: 'alarm clock', keywords: ['time'] },
      { char: '🔋', name: 'battery', keywords: ['power'] },
      { char: '🔑', name: 'key', keywords: ['lock'] },
      { char: '📎', name: 'paperclip', keywords: [] },
      { char: '✏️', name: 'pencil', keywords: ['write', 'edit'] },
    ],
  },
];

/** 裸字符串 / 富条目统一归一化为内部表示 */
const normalizeEmoji = (input: EmojiInput): NormalizedEmoji => {
  if (typeof input === 'string') {
    return { char: input, names: [], toneable: false };
  }
  const names = [input.name ?? '', ...(input.keywords ?? [])]
    .filter(Boolean)
    .map((n) => n.toLowerCase());
  return { char: input.char, names, toneable: input.toneable ?? false };
};

const matchesSearch = (entry: NormalizedEmoji, category: EmojiCategory, query: string) => {
  // 名称/关键词命中（HeroUI 搜索是按名检索）；保留 glyph、分类标签/id 的旧匹配
  const q = query.trim().toLowerCase();
  if (q === '') return true;
  if (entry.char.includes(q)) return true;
  if (entry.names.some((name) => name.includes(q))) return true;
  return category.label.toLowerCase().includes(q) || category.id.includes(q);
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
  tone: EmojiSkinTone;
  onToneChange: (tone: EmojiSkinTone) => void;
  footer?: ReactNode;
};

/**
 * 选择面板：分类标签（RAC ToggleButtonGroup）+ 肤色选择器 + 搜索框 + 表情网格（RAC ListBox grid）。
 * 切分类只换网格内容；搜索非空时跨全部分类按名/glyph 过滤并忽略分类选择；点表情经 onSelectionChange 上报。
 * 网格 item 在渲染前先按当前肤色套 Fitzpatrick 修饰符。
 */
const Panel = ({
  size,
  categories,
  recentEmojis,
  onEmojiSelect,
  selectedEmoji,
  tone,
  onToneChange,
  footer,
}: PanelProps) => {
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
    // 选分类时清空搜索，否则 visibleEmojis 优先走搜索结果会让点击分类"无反应"
    if (!first.done) {
      setActiveCategory(first.value);
      setQuery('');
    }
  };

  const handleToneChange = (keys: Set<Key>) => {
    const first = keys.values().next();
    if (!first.done) onToneChange(first.value as EmojiSkinTone);
  };

  // categories/recentEmojis 外部切换后，若当前 activeCategory 已不在集合中则回退到首个，避免空网格
  useEffect(() => {
    if (!allCategories.some((category) => category.id === activeCategory)) {
      setActiveCategory(allCategories[0]?.id ?? '');
    }
  }, [allCategories, activeCategory]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  // 用 onAction 而非 onSelectionChange：onAction 每次激活 item 都触发（含重复点已选表情），
  // 而 RAC 单选 ListBox 对"再次点击已选 key"不重发 onSelectionChange。选中高亮由受控 selectedKeys 承载。
  const handleEmojiAction = (key: Key) => {
    onEmojiSelect?.(String(key));
  };

  const handleEmojiSelectionChange = (keys: 'all' | Set<Key>) => {
    if (keys === 'all') return;
    const first = keys.values().next();
    if (!first.done) handleEmojiAction(first.value);
  };

  const isSearching = query.trim() !== '';

  // 归一化后的可见 emoji（含 char + 是否可套色），随后按 tone 重渲
  const visibleEmojis = useMemo<NormalizedEmoji[]>(() => {
    if (isSearching) {
      const seen = new Set<string>();
      const result: NormalizedEmoji[] = [];
      for (const category of allCategories) {
        if (category.id === RECENT_ID) continue;
        for (const input of category.emojis) {
          const entry = normalizeEmoji(input);
          if (!seen.has(entry.char) && matchesSearch(entry, category, query)) {
            seen.add(entry.char);
            result.push(entry);
          }
        }
      }
      return result;
    }
    const current = allCategories.find((category) => category.id === activeCategory);
    return (current?.emojis ?? []).map(normalizeEmoji);
  }, [allCategories, activeCategory, query, isSearching]);

  // 套肤色后的最终展示字符（recent 等裸字符串 toneable=false，不受影响）
  const renderedEmojis = useMemo<string[]>(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const entry of visibleEmojis) {
      const char = applyTone(entry.char, entry.toneable, tone);
      // 套色后理论上不会撞键（修饰符不同），仍去重以防裸字符串重复
      if (!seen.has(char)) {
        seen.add(char);
        result.push(char);
      }
    }
    return result;
  }, [visibleEmojis, tone]);

  return (
    <div data-slot="emoji-picker-content" className="emoji-picker__content">
      <div className="flex items-center justify-between gap-1">
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
        <RACToggleButtonGroup
          data-slot="emoji-picker-skin-tones"
          aria-label="肤色"
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[tone]}
          onSelectionChange={handleToneChange}
          className="emoji-picker__skin-tone-options"
        >
          {SKIN_TONE_ORDER.map((toneOption) => (
            <RACToggleButton
              key={toneOption}
              id={toneOption}
              aria-label={SKIN_TONE_LABEL[toneOption]}
              className="emoji-picker__skin-tone-option"
            >
              {toneSwatch(toneOption)}
            </RACToggleButton>
          ))}
        </RACToggleButtonGroup>
      </div>
      <RACInput
        aria-label="搜索表情"
        placeholder="搜索表情…"
        value={query}
        onChange={handleSearchChange}
        className="emoji-picker__search w-full rounded-medium bg-default px-2 py-1 text-sm outline-none"
      />
      <RACListBox
        data-slot="emoji-picker-grid"
        aria-label="表情网格"
        layout="grid"
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={selectedEmoji ? [selectedEmoji] : []}
        onAction={handleEmojiAction}
        onSelectionChange={handleEmojiSelectionChange}
        className="emoji-picker__grid"
        renderEmptyState={renderEmptyState}
      >
        {renderedEmojis.map((emoji) => (
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
 * 表情选择器（参考 API）：分类切换 / 名称搜索实时过滤 / 肤色重渲 / 点击触发 onEmojiSelect。
 * 默认弹层模式（RAC DialogTrigger + Popover，按钮打开、Esc/遮罩关闭、焦点圈定），
 * isInline 时直接内联渲染面板（参考实现 Inline 变体）。分类标签与肤色都用 RAC ToggleButtonGroup。
 */
const EmojiPicker = ({
  size = 'md',
  categories = DEFAULT_CATEGORIES,
  recentEmojis,
  onEmojiSelect,
  value,
  defaultValue = '😀',
  tone,
  defaultTone = 'default',
  onToneChange,
  isInline = false,
  isDisabled = false,
  'aria-label': ariaLabel = 'Emoji',
  className,
  style,
}: EmojiPickerProps) => {
  const [selectedEmoji, setSelectedEmoji] = useState(defaultValue);
  const [toneState, setToneState] = useState<EmojiSkinTone>(defaultTone);
  const [isOpen, setIsOpen] = useState(false);

  const currentEmoji = value ?? selectedEmoji;
  const currentTone = tone ?? toneState;

  const handleEmojiSelect = (emoji: string) => {
    if (value === undefined) setSelectedEmoji(emoji);
    onEmojiSelect?.(emoji);
    setIsOpen(false);
  };

  const handleToneChange = (next: EmojiSkinTone) => {
    if (tone === undefined) setToneState(next);
    onToneChange?.(next);
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
          onEmojiSelect={handleEmojiSelect}
          selectedEmoji={currentEmoji}
          tone={currentTone}
          onToneChange={handleToneChange}
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
            tone={currentTone}
            onToneChange={handleToneChange}
          />
        </RACDialog>
      </RACPopover>
    </RACDialogTrigger>
  );
};
EmojiPicker.displayName = 'EmojiPicker';

/* ────────────────────────────────────────────────────────────────────────────
 * 复合（dot-notation）子组件 —— 对齐线上 Pro 版的 compound API。
 *
 * 线上 Pro 的 EmojiPicker 暴露一套点记法子组件（Trigger / Value / Popover / Content /
 * Grid / Item / Footer / SkinTonePicker / SkinToneTrigger / SkinToneContent /
 * SkinToneOption），每个都是包基础 RAC primitive 的真复合件、props 与渲染元素逐一对齐 Pro。
 * 顶层 `<EmojiPicker .../>` 的单组件 props 路径（categories/onEmojiSelect/isInline/…）作为
 * **向后兼容默认行为**保留不动——现有 7+ 调用点全部走这条路径，不受影响。
 * 新增子组件供需要自行组合 Trigger/Popover/Grid 的调用方使用，props/renders-as 对齐 Pro。
 * 基础件来源：react-aria-components 的 Button / SelectValue / Popover / ListBox / ListBoxItem。
 * ──────────────────────────────────────────────────────────────────────────── */

/** EmojiPicker.Trigger —— renders as Button（包 RAC Button，透传全部 RAC Button props）。 */
const EmojiPickerTrigger = ({ className, ...props }: RACButtonProps) => (
  <RACButton
    data-slot="emoji-picker-trigger"
    className={(values) =>
      clsx('emoji-picker__trigger', typeof className === 'function' ? className(values) : className)
    }
    {...props}
  />
);
EmojiPickerTrigger.displayName = 'EmojiPicker.Trigger';

/** EmojiPicker.Value —— renders as RAC SelectValue（显示当前选中表情）。 */
const EmojiPickerValue = <T extends object>({
  className,
  ...props
}: RACSelectValueProps<T>) => (
  <RACSelectValue
    data-slot="emoji-picker-value"
    className={(values) =>
      clsx('emoji-picker__value', typeof className === 'function' ? className(values) : className)
    }
    {...props}
  />
);
EmojiPickerValue.displayName = 'EmojiPicker.Value';

export type EmojiPickerPopoverProps = RACPopoverProps & {
  /** 距 trigger 的偏移（px），Pro 默认 4 */
  offset?: number;
  /** 相对 trigger 的首选放置位，Pro 默认 'bottom' */
  placement?: Placement;
};

/** EmojiPicker.Popover —— renders as 浮层（包 RAC Popover）。offset/placement 默认对齐 Pro。 */
const EmojiPickerPopover = ({
  offset = 4,
  placement = 'bottom',
  className,
  ...props
}: EmojiPickerPopoverProps) => (
  <RACPopover
    data-slot="emoji-picker-popover"
    offset={offset}
    placement={placement}
    className={(values) =>
      clsx('emoji-picker__popover', typeof className === 'function' ? className(values) : className)
    }
    {...props}
  />
);
EmojiPickerPopover.displayName = 'EmojiPicker.Popover';

export type EmojiPickerContentProps = {
  /** 自定义表情搜索过滤函数，Pro 默认大小写不敏感 contains */
  filter?: (textValue: string, inputValue: string) => boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

/** EmojiPicker.Content —— renders as flex wrapper（Pro 内部 Autocomplete）。这里渲染为容器 div。 */
const EmojiPickerContent = ({ className, style, children }: EmojiPickerContentProps) => (
  <div
    data-slot="emoji-picker-content"
    className={clsx('emoji-picker__content', className)}
    style={style}
  >
    {children}
  </div>
);
EmojiPickerContent.displayName = 'EmojiPicker.Content';

/** EmojiPicker.Grid —— renders as RAC ListBox（Pro 用 Virtualizer+GridLayout，透传 ListBox props）。 */
const EmojiPickerGrid = <T extends object>({
  className,
  ...props
}: RACListBoxProps<T>) => (
  <RACListBox
    data-slot="emoji-picker-grid"
    className={(values) =>
      clsx('emoji-picker__grid', typeof className === 'function' ? className(values) : className)
    }
    {...props}
  />
);
EmojiPickerGrid.displayName = 'EmojiPicker.Grid';

/** EmojiPicker.Item —— renders as RAC ListBoxItem（透传全部 RAC ListBoxItem props）。 */
const EmojiPickerItem = <T extends object>({
  className,
  ...props
}: RACListBoxItemProps<T>) => (
  <RACListBoxItem
    data-slot="emoji-picker-item"
    className={(values) =>
      clsx('emoji-picker__item', typeof className === 'function' ? className(values) : className)
    }
    {...props}
  />
);
EmojiPickerItem.displayName = 'EmojiPicker.Item';

/** EmojiPicker.Footer —— renders as <div>（Pro 无独有 props）。 */
const EmojiPickerFooter = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    data-slot="emoji-picker-footer"
    className={clsx('emoji-picker__footer', className)}
    {...props}
  >
    {children}
  </div>
);
EmojiPickerFooter.displayName = 'EmojiPicker.Footer';

/** EmojiPicker.SkinTonePicker —— renders as 容器（Pro 是带内部 Popover 的 Provider）。 */
const EmojiPickerSkinTonePicker = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    data-slot="emoji-picker-skin-tone-picker"
    className={clsx('emoji-picker__skin-tone-picker', className)}
    {...props}
  >
    {children}
  </div>
);
EmojiPickerSkinTonePicker.displayName = 'EmojiPicker.SkinTonePicker';

/** EmojiPicker.SkinToneTrigger —— renders as Button。Pro 默认 aria-label='Select skin tone'。 */
const EmojiPickerSkinToneTrigger = ({
  className,
  'aria-label': ariaLabel = 'Select skin tone',
  ...props
}: RACButtonProps) => (
  <RACButton
    data-slot="emoji-picker-skin-tone-trigger"
    aria-label={ariaLabel}
    className={(values) =>
      clsx(
        'emoji-picker__skin-tone-picker',
        typeof className === 'function' ? className(values) : className,
      )
    }
    {...props}
  />
);
EmojiPickerSkinToneTrigger.displayName = 'EmojiPicker.SkinToneTrigger';

export type EmojiPickerSkinToneContentProps = RACPopoverProps & {
  /** 距 trigger 的偏移（px），Pro 默认 4 */
  offset?: number;
  /** Popover 放置位，Pro 默认 'bottom end' */
  placement?: Placement;
};

/** EmojiPicker.SkinToneContent —— renders as Popover content。placement 默认对齐 Pro 'bottom end'。 */
const EmojiPickerSkinToneContent = ({
  offset = 4,
  placement = 'bottom end',
  className,
  ...props
}: EmojiPickerSkinToneContentProps) => (
  <RACPopover
    data-slot="emoji-picker-skin-tone-content"
    offset={offset}
    placement={placement}
    className={(values) =>
      clsx(
        'emoji-picker__skin-tone-options',
        typeof className === 'function' ? className(values) : className,
      )
    }
    {...props}
  />
);
EmojiPickerSkinToneContent.displayName = 'EmojiPicker.SkinToneContent';

export type EmojiPickerSkinToneOptionProps = RACToggleButtonProps & {
  /** 肤色标识（如 default / light / dark）。Pro 标记为必填。 */
  id: string;
};

/** EmojiPicker.SkinToneOption —— renders as Button 色块（这里包 RAC ToggleButton 以承载选中态）。 */
const EmojiPickerSkinToneOption = ({
  className,
  ...props
}: EmojiPickerSkinToneOptionProps) => (
  <RACToggleButton
    data-slot="emoji-picker-skin-tone-option"
    className={(values) =>
      clsx(
        'emoji-picker__skin-tone-option',
        typeof className === 'function' ? className(values) : className,
      )
    }
    {...props}
  />
);
EmojiPickerSkinToneOption.displayName = 'EmojiPicker.SkinToneOption';

/** 把复合子组件挂到 EmojiPicker 上，得到 Pro 的点记法（dot-notation）API。 */
const EmojiPickerNamespace = Object.assign(EmojiPicker, {
  Trigger: EmojiPickerTrigger,
  Value: EmojiPickerValue,
  Popover: EmojiPickerPopover,
  Content: EmojiPickerContent,
  Grid: EmojiPickerGrid,
  Item: EmojiPickerItem,
  Footer: EmojiPickerFooter,
  SkinTonePicker: EmojiPickerSkinTonePicker,
  SkinToneTrigger: EmojiPickerSkinToneTrigger,
  SkinToneContent: EmojiPickerSkinToneContent,
  SkinToneOption: EmojiPickerSkinToneOption,
});

export default EmojiPickerNamespace;
