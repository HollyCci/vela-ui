import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

export type PromptSuggestionProps = HTMLAttributes<HTMLDivElement> & {
  title?: ReactNode;
  description?: ReactNode;
};

export type PromptSuggestionItemsVariant = 'pill' | 'card';

const PromptSuggestionRoot = forwardRef<HTMLDivElement, PromptSuggestionProps>(
  ({ title, description, className, children, ...rest }, ref) => (
    <div ref={ref} className={clsx('prompt-suggestion', className)} {...rest}>
      {(title !== undefined || description !== undefined) && (
        <div className="prompt-suggestion__header">
          {title !== undefined && <div className="prompt-suggestion__title">{title}</div>}
          {description !== undefined && (
            <div className="prompt-suggestion__description">{description}</div>
          )}
        </div>
      )}
      {children}
    </div>
  ),
);
PromptSuggestionRoot.displayName = 'PromptSuggestion';

export type PromptSuggestionGroupProps = HTMLAttributes<HTMLDivElement> & {
  label?: ReactNode;
  description?: ReactNode;
};

const Group = forwardRef<HTMLDivElement, PromptSuggestionGroupProps>(
  ({ label, description, className, children, ...rest }, ref) => (
    <div ref={ref} className={clsx('prompt-suggestion__group', className)} {...rest}>
      {label !== undefined && <div className="prompt-suggestion__group-label">{label}</div>}
      {description !== undefined && (
        <div className="prompt-suggestion__group-description">{description}</div>
      )}
      {children}
    </div>
  ),
);
Group.displayName = 'PromptSuggestion.Group';

export type PromptSuggestionItemsProps = HTMLAttributes<HTMLDivElement> & {
  variant?: PromptSuggestionItemsVariant;
};

const Items = forwardRef<HTMLDivElement, PromptSuggestionItemsProps>(
  ({ variant = 'pill', className, ...rest }, ref) => (
    <div ref={ref} className={clsx(`prompt-suggestion__items--${variant}`, className)} {...rest} />
  ),
);
Items.displayName = 'PromptSuggestion.Items';

export type PromptSuggestionItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  endIcon?: ReactNode;
};

const Item = forwardRef<HTMLButtonElement, PromptSuggestionItemProps>(
  ({ endIcon, className, children, type = 'button', ...rest }, ref) => (
    <button ref={ref} type={type} className={clsx('prompt-suggestion__item--pill', className)} {...rest}>
      <span className="prompt-suggestion__item-label">{children}</span>
      {endIcon !== undefined && (
        <span className="prompt-suggestion__item-end-icon" aria-hidden="true">
          {endIcon}
        </span>
      )}
    </button>
  ),
);
Item.displayName = 'PromptSuggestion.Item';

export type PromptSuggestionCardItemProps = HTMLAttributes<HTMLDivElement> & {
  description?: ReactNode;
  tags?: ReactNode;
  meta?: ReactNode;
};

const CardItem = forwardRef<HTMLDivElement, PromptSuggestionCardItemProps>(
  ({ description, tags, meta, className, children, ...rest }, ref) => (
    <div ref={ref} className={clsx('prompt-suggestion__item--card', className)} {...rest}>
      <div className="prompt-suggestion__item-label">{children}</div>
      {description !== undefined && (
        <div className="prompt-suggestion__item-description">{description}</div>
      )}
      {(tags !== undefined || meta !== undefined) && (
        <div className="prompt-suggestion__item-footer">
          {tags !== undefined && <div className="prompt-suggestion__item-tags">{tags}</div>}
          {meta !== undefined && <div className="prompt-suggestion__item-meta">{meta}</div>}
        </div>
      )}
    </div>
  ),
);
CardItem.displayName = 'PromptSuggestion.CardItem';

const PromptSuggestion = Object.assign(PromptSuggestionRoot, { Group, Items, Item, CardItem });

export default PromptSuggestion;
