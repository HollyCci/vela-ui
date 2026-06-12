import {
  forwardRef,
  useCallback,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
} from 'react';
import clsx from 'clsx';

export type FloatingTocPlacement = 'left' | 'right';

export type FloatingTocItem = {
  key: string;
  label: string;
  /** 层级（1 起，控制缩进与条形宽度），默认 1 */
  level?: number;
  isDisabled?: boolean;
};

export type FloatingTocProps = Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> & {
  items: FloatingTocItem[];
  /** 当前激活项 key */
  activeKey?: string;
  /** 触发条停靠侧，默认 right */
  placement?: FloatingTocPlacement;
  /** 受控展开；省略时由 hover 控制 */
  isOpen?: boolean;
  onSelect?: (key: string) => void;
};

type TocItemButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onSelect'> & {
  item: FloatingTocItem;
  isActive: boolean;
  onSelect?: (key: string) => void;
};

const TocItemButton = forwardRef<HTMLButtonElement, TocItemButtonProps>(
  ({ item, isActive, onSelect, className, style, ...rest }, ref) => {
    const handleClick = useCallback(() => {
      onSelect?.(item.key);
    }, [onSelect, item.key]);

    return (
      <button
        ref={ref}
        type="button"
        data-active={isActive || undefined}
        aria-current={isActive || undefined}
        disabled={item.isDisabled}
        className={clsx('floating-toc__item', className)}
        style={{ ...style, ['--floating-toc-level' as string]: String(item.level ?? 1) }}
        onClick={handleClick}
        {...rest}
      >
        {item.label}
      </button>
    );
  },
);
TocItemButton.displayName = 'FloatingToc.ItemButton';

const FloatingToc = forwardRef<HTMLDivElement, FloatingTocProps>(
  (
    { items, activeKey, placement = 'right', isOpen, onSelect, className, ...rest },
    ref,
  ) => {
    const [isHovered, setIsHovered] = useState(false);
    const isControlled = isOpen !== undefined;
    const isVisible = isControlled ? isOpen : isHovered;

    const handleMouseEnter = useCallback(() => {
      setIsHovered(true);
    }, []);
    const handleMouseLeave = useCallback(() => {
      setIsHovered(false);
    }, []);

    return (
      <div
        ref={ref}
        className={clsx('floating-toc', className)}
        style={{ position: 'relative', display: 'inline-flex' }}
        onMouseEnter={isControlled ? undefined : handleMouseEnter}
        onMouseLeave={isControlled ? undefined : handleMouseLeave}
        {...rest}
      >
        <div
          className="floating-toc__trigger"
          data-placement={placement}
          role="button"
          aria-haspopup="menu"
          aria-expanded={isVisible}
          tabIndex={0}
        >
          {items.map((item) => (
            <span
              key={item.key}
              className="floating-toc__bar"
              data-active={item.key === activeKey || undefined}
              style={{ ['--floating-toc-level' as string]: String(item.level ?? 1) }}
            />
          ))}
        </div>
        {isVisible && (
          <div
            className="floating-toc__content"
            data-placement={placement}
            role="menu"
            style={{
              position: 'absolute',
              zIndex: 50,
              top: 0,
              ...(placement === 'right' ? { right: '100%' } : { left: '100%' }),
            }}
          >
            {items.map((item) => (
              <TocItemButton
                key={item.key}
                item={item}
                isActive={item.key === activeKey}
                onSelect={onSelect}
                role="menuitem"
              />
            ))}
          </div>
        )}
      </div>
    );
  },
);

FloatingToc.displayName = 'FloatingToc';

export default FloatingToc;
