'use client';

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
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
  /** 视觉变体（参考 API） */
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
  /** 分段项列表；不支持 RAC 的 render-prop children 形式（本控件统一渲染常驻指示器） */
  children?: ReactNode;
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
};

const SegmentContext = createContext<SegmentContextValue>({
  size: 'md',
  variant: 'default',
  showSeparators: true,
});

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

/** 包装 RAC ToggleButton；内置分隔线（相邻选中项时由 CSS 隐藏）。滑块指示器由 Root 统一渲染 */
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
          {showSeparators && <Separator />}
          {typeof children === 'function' ? children(renderProps) : children}
        </>
      )}
    </ToggleButton>
  );
};
Item.displayName = 'Segment.Item';

/**
 * 包装 RAC ToggleButtonGroup 的单选分段控件（参考 API）：
 * 单选 + 不可清空，键盘导航与 radiogroup 语义由 RAC 提供。
 *
 * 滑块指示器是 group 内的**单个常驻元素**（非每个选中项里临时挂载）：选中态切换时只更新它的
 * translate/width/height 内联样式，靠 CSS `transition: translate,width,height` 平滑滑动——对齐
 * heroui.pro Segment 的切换过渡。这避免了「指示器随选中项 unmount/remount + rAF FLIP」的脆弱写法
 * （rAF 在隐藏页会暂停、remount 元素无前态可过渡，都会让切换动画丢失）。
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
    const groupRef = useRef<HTMLDivElement | null>(null);
    const indicatorRef = useRef<HTMLDivElement | null>(null);

    const setGroupRef = useCallback(
      (node: HTMLDivElement | null) => {
        groupRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    // 把常驻指示器移动/缩放到当前选中项的几何位置。animate=false 时临时关掉过渡（初始化、容器尺寸
    // 变化），让定位即时落地不产生「从原点滑入」的假动画；animate=true 时走 CSS 过渡形成切换滑动。
    const positionIndicator = useCallback((animate: boolean) => {
      const group = groupRef.current;
      const indicator = indicatorRef.current;
      if (group === null || indicator === null) return;
      const selected = group.querySelector<HTMLElement>(
        '[data-slot="segment-item"][data-selected="true"]',
      );
      if (selected === null) {
        indicator.style.opacity = '0';
        return;
      }
      const apply = () => {
        indicator.style.opacity = '1';
        indicator.style.translate = `${selected.offsetLeft}px ${selected.offsetTop}px`;
        indicator.style.width = `${selected.offsetWidth}px`;
        indicator.style.height = `${selected.offsetHeight}px`;
      };
      if (animate) {
        apply();
        return;
      }
      indicator.style.transitionProperty = 'none';
      apply();
      // 读取布局强制同步回流，确保无过渡定位即时提交，再恢复 CSS 过渡（否则浏览器会合并样式变更、
      // 仍按过渡动画到新位置）。
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      indicator.offsetWidth;
      indicator.style.transitionProperty = '';
    }, []);

    useLayoutEffect(() => {
      positionIndicator(false);
      const group = groupRef.current;
      if (group === null) return undefined;
      // 选中态切换会改子项的 data-selected 属性；监听子树属性变化驱动滑动（受控/非受控都覆盖）。
      const mutation = new MutationObserver(() => positionIndicator(true));
      mutation.observe(group, {
        attributes: true,
        attributeFilter: ['data-selected'],
        subtree: true,
      });
      // 容器/字体导致的尺寸变化时无动画重新对齐。jsdom 无 ResizeObserver：feature-detect 后再构造。
      let resize: ResizeObserver | null = null;
      if (typeof ResizeObserver !== 'undefined') {
        resize = new ResizeObserver(() => positionIndicator(false));
        resize.observe(group);
      }
      return () => {
        mutation.disconnect();
        resize?.disconnect();
      };
    }, [positionIndicator]);

    // 受控 selectedKey 变化时同步定位（MutationObserver 已覆盖，这里兜底同步、避免微任务延迟）。
    useLayoutEffect(() => {
      positionIndicator(true);
    }, [selectedKey, positionIndicator]);

    const handleSelectionChange = (keys: Set<Key>) => {
      const first = keys.values().next();
      if (!first.done) onSelectionChange?.(first.value);
    };

    return (
      <SegmentContext.Provider value={{ size, variant, showSeparators }}>
        <ToggleButtonGroup
          ref={setGroupRef}
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
          <div
            ref={indicatorRef}
            aria-hidden="true"
            data-slot="segment-indicator"
            className={clsx('segment__indicator', variant === 'ghost' && 'segment__indicator--ghost')}
          />
          {children}
        </ToggleButtonGroup>
      </SegmentContext.Provider>
    );
  },
);
SegmentRoot.displayName = 'Segment';

const Segment = Object.assign(SegmentRoot, { Item, Separator });

export default Segment;
