import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

export type EmojiReactionButtonSize = 'sm' | 'md' | 'lg';

export type EmojiReactionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  emoji: ReactNode;
  count?: number;
  isSelected?: boolean;
  isReadOnly?: boolean;
  size?: EmojiReactionButtonSize;
};

const EmojiReactionButton = forwardRef<HTMLButtonElement, EmojiReactionButtonProps>(
  (
    { emoji, count, isSelected = false, isReadOnly = false, size = 'md', className, ...rest },
    ref,
  ) => (
    <button
      ref={ref}
      type="button"
      aria-pressed={isSelected}
      data-selected={isSelected || undefined}
      data-readonly={isReadOnly || undefined}
      className={clsx('emoji-reaction-button', `emoji-reaction-button--${size}`, className)}
      {...rest}
    >
      <span className="emoji-reaction-button__emoji">{emoji}</span>
      {count !== undefined && <span className="emoji-reaction-button__count">{count}</span>}
    </button>
  ),
);

EmojiReactionButton.displayName = 'EmojiReactionButton';

export default EmojiReactionButton;
