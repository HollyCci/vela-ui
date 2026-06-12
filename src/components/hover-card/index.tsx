import {
  forwardRef,
  useCallback,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import clsx from 'clsx';

export type HoverCardPlacement = 'top' | 'bottom' | 'left' | 'right';

export type HoverCardProps = HTMLAttributes<HTMLDivElement> & {
  /** 触发器内容 */
  trigger: ReactNode;
  /** 浮层放置方位，默认 bottom */
  placement?: HoverCardPlacement;
  /** 受控打开；省略时由鼠标 hover 控制 */
  isOpen?: boolean;
  children: ReactNode;
};

const ROOT_STYLE: CSSProperties = { position: 'relative', display: 'inline-flex' };

const PLACEMENT_STYLE: Record<HoverCardPlacement, CSSProperties> = {
  top: { bottom: '100%', left: '50%', transform: 'translate(-50%, -8px)' },
  bottom: { top: '100%', left: '50%', transform: 'translate(-50%, 8px)' },
  left: { right: '100%', top: '50%', transform: 'translate(-8px, -50%)' },
  right: { left: '100%', top: '50%', transform: 'translate(8px, -50%)' },
};

const HoverCard = forwardRef<HTMLDivElement, HoverCardProps>(
  ({ trigger, placement = 'bottom', isOpen, className, children, ...rest }, ref) => {
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
        className={clsx('hover-card', className)}
        style={ROOT_STYLE}
        onMouseEnter={isControlled ? undefined : handleMouseEnter}
        onMouseLeave={isControlled ? undefined : handleMouseLeave}
        {...rest}
      >
        <div className="hover-card__trigger">{trigger}</div>
        {isVisible && (
          <div
            role="dialog"
            data-placement={placement}
            className="hover-card__content"
            style={{ position: 'absolute', zIndex: 50, ...PLACEMENT_STYLE[placement] }}
          >
            {children}
          </div>
        )}
      </div>
    );
  },
);

HoverCard.displayName = 'HoverCard';

export default HoverCard;
