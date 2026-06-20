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
        <Header>
          {title !== undefined && <Title>{title}</Title>}
          {description !== undefined && <Description>{description}</Description>}
        </Header>
      )}
      {children}
    </div>
  ),
);
PromptSuggestionRoot.displayName = 'PromptSuggestion';

export type PromptSuggestionHeaderProps = HTMLAttributes<HTMLDivElement>;

const Header = forwardRef<HTMLDivElement, PromptSuggestionHeaderProps>(
  ({ className, ...rest }, ref) => (
    <div ref={ref} className={clsx('prompt-suggestion__header', className)} {...rest} />
  ),
);
Header.displayName = 'PromptSuggestion.Header';

export type PromptSuggestionTitleProps = HTMLAttributes<HTMLHeadingElement>;

// Reference renders Title as the header's title element; h2 is the semantic
// heading for the suggestion panel's heading. CSS keys off `.prompt-suggestion__title`
// (the class, not the tag), so the element choice is visually inert.
const Title = forwardRef<HTMLHeadingElement, PromptSuggestionTitleProps>(
  ({ className, ...rest }, ref) => (
    <h2 ref={ref} className={clsx('prompt-suggestion__title', className)} {...rest} />
  ),
);
Title.displayName = 'PromptSuggestion.Title';

export type PromptSuggestionDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

// Reference renders Description as the header's description element; `p` is the
// semantic paragraph. No `dl`/list-context requirement → axe stays clean.
const Description = forwardRef<HTMLParagraphElement, PromptSuggestionDescriptionProps>(
  ({ className, ...rest }, ref) => (
    <p ref={ref} className={clsx('prompt-suggestion__description', className)} {...rest} />
  ),
);
Description.displayName = 'PromptSuggestion.Description';

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
    <div
      ref={ref}
      className={clsx(
        'prompt-suggestion__items',
        `prompt-suggestion__items--${variant}`,
        className,
      )}
      {...rest}
    />
  ),
);
Items.displayName = 'PromptSuggestion.Items';

export type PromptSuggestionItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  endIcon?: ReactNode;
};

const Item = forwardRef<HTMLButtonElement, PromptSuggestionItemProps>(
  ({ endIcon, className, children, type = 'button', ...rest }, ref) => (
    <button
      ref={ref}
      type={type}
      className={clsx('prompt-suggestion__item', 'prompt-suggestion__item--pill', className)}
      {...rest}
    >
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

export type PromptSuggestionItemTitleProps = HTMLAttributes<HTMLDivElement>;

// Rich content slot for an item's title (reference: PromptSuggestion.ItemTitle).
const ItemTitle = forwardRef<HTMLDivElement, PromptSuggestionItemTitleProps>(
  ({ className, ...rest }, ref) => (
    <div ref={ref} className={clsx('prompt-suggestion__item-label', className)} {...rest} />
  ),
);
ItemTitle.displayName = 'PromptSuggestion.ItemTitle';

export type PromptSuggestionItemDescriptionProps = HTMLAttributes<HTMLDivElement>;

// Rich content slot for an item's description (reference: PromptSuggestion.ItemDescription).
const ItemDescription = forwardRef<HTMLDivElement, PromptSuggestionItemDescriptionProps>(
  ({ className, ...rest }, ref) => (
    <div ref={ref} className={clsx('prompt-suggestion__item-description', className)} {...rest} />
  ),
);
ItemDescription.displayName = 'PromptSuggestion.ItemDescription';

export type PromptSuggestionItemFooterProps = HTMLAttributes<HTMLDivElement>;

// Footer slot for an item (reference: PromptSuggestion.ItemFooter).
const ItemFooter = forwardRef<HTMLDivElement, PromptSuggestionItemFooterProps>(
  ({ className, ...rest }, ref) => (
    <div ref={ref} className={clsx('prompt-suggestion__item-footer', className)} {...rest} />
  ),
);
ItemFooter.displayName = 'PromptSuggestion.ItemFooter';

export type PromptSuggestionItemTagsProps = HTMLAttributes<HTMLDivElement>;

// Tags slot for an item (reference: PromptSuggestion.ItemTags).
const ItemTags = forwardRef<HTMLDivElement, PromptSuggestionItemTagsProps>(
  ({ className, ...rest }, ref) => (
    <div ref={ref} className={clsx('prompt-suggestion__item-tags', className)} {...rest} />
  ),
);
ItemTags.displayName = 'PromptSuggestion.ItemTags';

export type PromptSuggestionItemMetaProps = HTMLAttributes<HTMLDivElement>;

// Metadata slot for an item (reference: PromptSuggestion.ItemMeta).
const ItemMeta = forwardRef<HTMLDivElement, PromptSuggestionItemMetaProps>(
  ({ className, ...rest }, ref) => (
    <div ref={ref} className={clsx('prompt-suggestion__item-meta', className)} {...rest} />
  ),
);
ItemMeta.displayName = 'PromptSuggestion.ItemMeta';

export type PromptSuggestionCardItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  description?: ReactNode;
  tags?: ReactNode;
  meta?: ReactNode;
};

const CardItem = forwardRef<HTMLButtonElement, PromptSuggestionCardItemProps>(
  ({ description, tags, meta, className, children, type = 'button', ...rest }, ref) => (
    <button
      ref={ref}
      type={type}
      className={clsx('prompt-suggestion__item', 'prompt-suggestion__item--card', className)}
      {...rest}
    >
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
    </button>
  ),
);
CardItem.displayName = 'PromptSuggestion.CardItem';

const PromptSuggestion = Object.assign(PromptSuggestionRoot, {
  Header,
  Title,
  Description,
  Group,
  Items,
  Item,
  ItemTitle,
  ItemDescription,
  ItemFooter,
  ItemTags,
  ItemMeta,
  CardItem,
});

export default PromptSuggestion;
