'use client';

import {
  createContext,
  forwardRef,
  useContext,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type RefObject,
} from 'react';
import {
  ToggleButton,
  ToggleButtonGroup,
  type ToggleButtonGroupProps,
  type ToggleButtonProps,
  type Key,
} from 'react-aria-components';
import clsx from 'clsx';

export type SegmentSize = 'sm' | 'md' | 'lg';
export type SegmentVariant = 'default' | 'ghost';

export type SegmentProps = Omit<
  ToggleButtonGroupProps,
  'selectionMode' | 'selectedKeys' | 'defaultSelectedKeys' | 'onSelectionChange' | 'className' | 'style'
> & {
  /** 视觉变体（原站 API） */
  variant?: SegmentVariant;
  size?: SegmentSize;
  /** 是否渲染分隔线；用于 without-separators 变体 */
  showSeparators?: boolean;
  /** 受控选中项（单选 API，包装 RAC 的 selectedKeys 集合） */
  selectedKey?: Key | null;
  defaultSelectedKey?: Key;
  onSelectionChange?: (key: Key) => void;
  className?: string;
  style?: CSSProperties;
};

export type SegmentItemProps = Omit<ToggleButtonProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type SegmentSeparatorProps = HTMLAttributes<HTMLSpanElement>;

type SegmentContextValue = {
  size: SegmentSize;
  variant: SegmentVariant;
  showSeparators: boolean;
  /** FLIP 滑动动画：记录上一个选中 indicator 的位置 */
  lastRect: RefObject<DOMRect | null>;
};

const SegmentContext = createContext<SegmentContextValue>({
  size: 'md',
  variant: 'default',
  showSeparators: true,
  lastRect: { current: null },
});

/**
 * 选中指示器：原站 CSS 已定义 `transition: translate,width,height`，
 * 这里在挂载时以上一个选中项的位置作为起点（FLIP），下一帧归零形成滑动动画。
 */
const Indicator = () => {
  const { variant, lastRect } = useContext(SegmentContext);
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (el === null) return undefined;
    const rect = el.getBoundingClientRect();
    const prev = lastRect.current;
    lastRect.current = rect;
    const resetToRest = () => {
      el.style.translate = '0px 0px';
      el.style.width = '100%';
      el.style.height = '100%';
    };
    let raf = 0;
    if (prev !== null && (prev.left !== rect.left || prev.top !== rect.top || prev.width !== rect.width)) {
      el.style.translate = `${prev.left - rect.left}px ${prev.top - rect.top}px`;
      el.style.width = `${prev.width}px`;
      el.style.height = `${prev.height}px`;
      raf = requestAnimationFrame(resetToRest);
    } else if (el.style.translate !== '' && el.style.translate !== '0px 0px') {
      // StrictMode 二次执行：起始偏移已设而归零帧被首轮 cleanup 取消，补一帧完成动画
      raf = requestAnimationFrame(resetToRest);
    }
    return () => cancelAnimationFrame(raf);
  }, [lastRect]);

  return (
    <div
      ref={ref}
      data-slot="segment-indicator"
      className={clsx('segment__indicator', variant === 'ghost' && 'segment__indicator--ghost')}
    />
  );
};
Indicator.displayName = 'Segment.Indicator';

const Separator = forwardRef<HTMLSpanElement, SegmentSeparatorProps>(
  ({ className, ...rest }, ref) => (
    <span
      ref={ref}
      aria-hidden="true"
      data-slot="segment-separator"
      className={clsx('segment__separator', className)}
      {...rest}
    />
  ),
);
Separator.displayName = 'Segment.Separator';

/** 包装 RAC ToggleButton；选中时自动渲染指示器，并内置分隔线（相邻选中项时由 CSS 隐藏） */
const Item = ({ className, children, ...rest }: SegmentItemProps) => {
  const { size, variant, showSeparators } = useContext(SegmentContext);

  return (
    <ToggleButton
      data-slot="segment-item"
      className={clsx(
        'segment__item',
        `segment__item--${size}`,
        variant === 'ghost' && 'segment__item--ghost',
        className,
      )}
      {...rest}
    >
      {(renderProps) => (
        <>
          {renderProps.isSelected && <Indicator />}
          {showSeparators && <Separator />}
          {typeof children === 'function' ? children(renderProps) : children}
        </>
      )}
    </ToggleButton>
  );
};
Item.displayName = 'Segment.Item';

/**
 * 包装 RAC ToggleButtonGroup 的单选分段控件（原站 API）：
 * 单选 + 不可清空，键盘导航与 radiogroup 语义由 RAC 提供。
 */
const SegmentRoot = forwardRef<HTMLDivElement, SegmentProps>(
  (
    {
      variant = 'default',
      size = 'md',
      showSeparators = true,
      selectedKey,
      defaultSelectedKey,
      onSelectionChange,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const lastRect = useRef<DOMRect | null>(null);

    const handleSelectionChange = (keys: Set<Key>) => {
      const first = keys.values().next();
      if (!first.done) onSelectionChange?.(first.value);
    };

    return (
      <SegmentContext.Provider value={{ size, variant, showSeparators, lastRect }}>
        <ToggleButtonGroup
          ref={ref}
          data-slot="segment"
          data-separators={showSeparators ? 'true' : 'false'}
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={
            selectedKey === undefined ? undefined : selectedKey === null ? [] : [selectedKey]
          }
          defaultSelectedKeys={defaultSelectedKey === undefined ? undefined : [defaultSelectedKey]}
          onSelectionChange={handleSelectionChange}
          className={clsx(
            'segment',
            `segment--${size}`,
            variant === 'ghost' && 'segment--ghost',
            className,
          )}
          {...rest}
        >
          {children}
        </ToggleButtonGroup>
      </SegmentContext.Provider>
    );
  },
);
SegmentRoot.displayName = 'Segment';

const Segment = Object.assign(SegmentRoot, { Item, Separator });

export default Segment;
