import { forwardRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export type TooltipProps = HTMLAttributes<HTMLSpanElement> & {
  content: ReactNode;
  placement?: TooltipPlacement;
  /** 受控展示；缺省时由 hover / focus 控制 */
  isOpen?: boolean;
  children: ReactNode;
};

const PLACEMENT_STYLE: Record<TooltipPlacement, CSSProperties> = {
  top: { bottom: '100%', left: '50%', transform: 'translate(-50%, -6px)' },
  bottom: { top: '100%', left: '50%', transform: 'translate(-50%, 6px)' },
  left: { right: '100%', top: '50%', transform: 'translate(-6px, -50%)' },
  right: { left: '100%', top: '50%', transform: 'translate(6px, -50%)' },
};

const Tooltip = forwardRef<HTMLSpanElement, TooltipProps>(
  ({ content, placement = 'top', isOpen, className, children, ...rest }, ref) => {
    const [isHovered, setIsHovered] = useState(false);
    const isVisible = isOpen ?? isHovered;

    const handleShow = () => setIsHovered(true);
    const handleHide = () => setIsHovered(false);

    return (
      <span
        ref={ref}
        className={clsx('tooltip__trigger', className)}
        style={{ position: 'relative' }}
        onMouseEnter={handleShow}
        onMouseLeave={handleHide}
        onFocus={handleShow}
        onBlur={handleHide}
        {...rest}
      >
        {children}
        {isVisible && (
          <span
            role="tooltip"
            className="tooltip"
            data-placement={placement}
            style={{
              position: 'absolute',
              zIndex: 50,
              whiteSpace: 'nowrap',
              ...PLACEMENT_STYLE[placement],
            }}
          >
            {content}
          </span>
        )}
      </span>
    );
  },
);

Tooltip.displayName = 'Tooltip';

export default Tooltip;
