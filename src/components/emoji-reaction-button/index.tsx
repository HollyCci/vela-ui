'use client';

import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import { ToggleButton, type ToggleButtonProps } from 'react-aria-components';
import clsx from 'clsx';

export type EmojiReactionButtonSize = 'sm' | 'md' | 'lg';

export type EmojiReactionButtonProps = Omit<ToggleButtonProps, 'className' | 'style'> & {
  size?: EmojiReactionButtonSize;
  /** 只读：保留选中态展示但不响应交互（指针由 CSS pointer-events 屏蔽，Tab 焦点经 excludeFromTabOrder 移除） */
  isReadOnly?: boolean;
  className?: string;
  style?: CSSProperties;
};

export type EmojiReactionButtonEmojiProps = HTMLAttributes<HTMLSpanElement>;

export type EmojiReactionButtonCountProps = HTMLAttributes<HTMLSpanElement>;

const Emoji = forwardRef<HTMLSpanElement, EmojiReactionButtonEmojiProps>(
  ({ className, ...rest }, ref) => (
    <span
      ref={ref}
      data-slot="emoji-reaction-button-emoji"
      className={clsx('emoji-reaction-button__emoji', className)}
      {...rest}
    />
  ),
);
Emoji.displayName = 'EmojiReactionButton.Emoji';

const Count = forwardRef<HTMLSpanElement, EmojiReactionButtonCountProps>(
  ({ className, ...rest }, ref) => (
    <span
      ref={ref}
      data-slot="emoji-reaction-button-count"
      className={clsx('emoji-reaction-button__count', className)}
      {...rest}
    />
  ),
);
Count.displayName = 'EmojiReactionButton.Count';

/**
 * 包装 RAC ToggleButton 的表情回应按钮（参考 API）：
 * 选中/悬停/按压/聚焦等 data 属性由 RAC 输出；
 * 只读仅屏蔽交互（onChange 置空 + CSS pointer-events / excludeFromTabOrder），
 * isSelected/defaultSelected 始终原样透传，受控/非受控通道不随 isReadOnly 切换。
 */
const EmojiReactionButtonRoot = forwardRef<HTMLButtonElement, EmojiReactionButtonProps>(
  (
    { size = 'md', isReadOnly = false, isSelected, defaultSelected, onChange, className, ...rest },
    ref,
  ) => (
    <ToggleButton
      ref={ref}
      data-slot="emoji-reaction-button"
      data-readonly={isReadOnly || undefined}
      excludeFromTabOrder={isReadOnly}
      isSelected={isSelected}
      defaultSelected={defaultSelected}
      onChange={isReadOnly ? undefined : onChange}
      className={clsx('emoji-reaction-button', `emoji-reaction-button--${size}`, className)}
      {...rest}
    />
  ),
);
EmojiReactionButtonRoot.displayName = 'EmojiReactionButton';

const EmojiReactionButton = Object.assign(EmojiReactionButtonRoot, { Emoji, Count });

export default EmojiReactionButton;
