import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  Button as UIButton,
  ScrollShadow,
  type ButtonProps as UIButtonProps,
  type ScrollShadowProps,
} from '@heroui/react';
import { Button as RACButton, type ButtonProps as RACButtonProps } from 'react-aria-components';
import clsx from 'clsx';

export type CarouselLayoutType = 'in-place' | 'modal' | 'miniatures';

/** 滚动行为选项（对应原站 Embla opts 的常用子集；本仓库无 embla 依赖，用原生滚动实现） */
export type CarouselOptions = {
  /** 到达边界后从另一端继续 */
  loop?: boolean;
  /** 初始激活索引 */
  startIndex?: number;
};

/** 暴露给 setApi / useCarousel 的编程式控制接口（对应原站 Embla API 的常用子集） */
export type CarouselApi = {
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
  canScrollPrev: () => boolean;
  canScrollNext: () => boolean;
  selectedScrollSnap: () => number;
  scrollSnapList: () => number[];
};

export type CarouselProps = HTMLAttributes<HTMLDivElement> & {
  /** 导航按钮布局类型（原站 API，默认 in-place） */
  type?: CarouselLayoutType;
  opts?: CarouselOptions;
  /** 仅为原站 API 兼容占位；无 embla 依赖，插件（如 autoplay）不生效 */
  plugins?: unknown[];
  /** 获取编程式控制 API（原站 setApi） */
  setApi?: (api: CarouselApi) => void;
};

export type CarouselContentProps = HTMLAttributes<HTMLDivElement>;
export type CarouselItemProps = HTMLAttributes<HTMLDivElement>;

export type CarouselNavButtonProps = Omit<UIButtonProps, 'className' | 'style'> & {
  /** 替换默认 chevron 的自定义图标（原站 API） */
  icon?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export type CarouselDotsProps = HTMLAttributes<HTMLDivElement> & {
  /** 自定义 dot 渲染（原站 API） */
  renderDot?: (props: { index: number; isSelected: boolean }) => ReactNode;
};

export type CarouselThumbnailsProps = Omit<ScrollShadowProps, 'orientation'>;

export type CarouselThumbnailProps = Omit<
  RACButtonProps,
  'className' | 'style' | 'children'
> & {
  /** 该缩略图跳转的幻灯片索引（原站 API，必填，0 起） */
  index: number;
  /** 缩略图图片地址；也可改用 children 自定义内容 */
  src?: string;
  alt?: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

type CarouselContextValue = {
  layoutType: CarouselLayoutType;
  api: CarouselApi;
  selectedIndex: number;
  scrollSnapCount: number;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
  viewportRef: RefObject<HTMLDivElement | null>;
  handleViewportScroll: () => void;
  syncSnapState: () => void;
};

const CarouselContext = createContext<CarouselContextValue | null>(null);

const useCarouselContext = (): CarouselContextValue => {
  const context = useContext(CarouselContext);
  if (context === null) {
    throw new Error('Carousel 子组件必须在 <Carousel> 内使用');
  }
  return context;
};

/** 原站 useCarousel hook：在任意后代组件中访问轮播上下文 */
export function useCarousel(): {
  api: CarouselApi;
  selectedIndex: number;
  scrollSnapCount: number;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
} {
  const {
    api,
    selectedIndex,
    scrollSnapCount,
    canScrollPrev,
    canScrollNext,
    scrollPrev,
    scrollNext,
    scrollTo,
  } = useCarouselContext();
  return {
    api,
    selectedIndex,
    scrollSnapCount,
    canScrollPrev,
    canScrollNext,
    scrollPrev,
    scrollNext,
    scrollTo,
  };
}

const ChevronLeftIcon = () => (
  <svg fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
    <path
      clipRule="evenodd"
      d="M10.53 2.97a.75.75 0 0 1 0 1.06L6.56 8l3.97 3.97a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 0"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);
ChevronLeftIcon.displayName = 'Carousel.ChevronLeftIcon';

const ChevronRightIcon = () => (
  <svg fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
    <path
      clipRule="evenodd"
      d="M5.47 13.03a.75.75 0 0 1 0-1.06L9.44 8 5.47 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);
ChevronRightIcon.displayName = 'Carousel.ChevronRightIcon';

/** 滚动容器 + 弹性内容区；幻灯片数量变化时同步 snap 状态 */
const Content = forwardRef<HTMLDivElement, CarouselContentProps>(
  ({ className, children, ...rest }, ref) => {
    const { viewportRef, handleViewportScroll, syncSnapState } = useCarouselContext();

    // 无依赖数组：每次渲染后同步（setState 值未变化时 React 自动跳过重渲染）
    useEffect(() => {
      syncSnapState();
    });

    return (
      <div
        ref={viewportRef}
        className="carousel__viewport"
        data-slot="carousel-viewport"
        onScroll={handleViewportScroll}
      >
        <div
          ref={ref}
          className={clsx('carousel__content', className)}
          data-slot="carousel-content"
          {...rest}
        >
          {children}
        </div>
      </div>
    );
  },
);
Content.displayName = 'Carousel.Content';

const Item = forwardRef<HTMLDivElement, CarouselItemProps>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    role="group"
    aria-roledescription="slide"
    data-slot="carousel-item"
    className={clsx('carousel__item', className)}
    {...rest}
  />
));
Item.displayName = 'Carousel.Item';

const Previous = ({ icon, className, ...rest }: CarouselNavButtonProps) => {
  const { layoutType, canScrollPrev, scrollPrev } = useCarouselContext();

  return (
    <UIButton
      data-slot="carousel-previous"
      variant="tertiary"
      size="sm"
      isIconOnly
      aria-label="Previous slide"
      isDisabled={!canScrollPrev}
      onPress={scrollPrev}
      className={clsx('carousel__previous', `carousel__previous--${layoutType}`, className)}
      {...rest}
    >
      {icon ?? <ChevronLeftIcon />}
    </UIButton>
  );
};
Previous.displayName = 'Carousel.Previous';

const Next = ({ icon, className, ...rest }: CarouselNavButtonProps) => {
  const { layoutType, canScrollNext, scrollNext } = useCarouselContext();

  return (
    <UIButton
      data-slot="carousel-next"
      variant="tertiary"
      size="sm"
      isIconOnly
      aria-label="Next slide"
      isDisabled={!canScrollNext}
      onPress={scrollNext}
      className={clsx('carousel__next', `carousel__next--${layoutType}`, className)}
      {...rest}
    >
      {icon ?? <ChevronRightIcon />}
    </UIButton>
  );
};
Next.displayName = 'Carousel.Next';

type DotProps = {
  index: number;
  isSelected: boolean;
};

const Dot = ({ index, isSelected }: DotProps) => {
  const { scrollTo } = useCarouselContext();
  const handlePress = useCallback(() => {
    scrollTo(index);
  }, [scrollTo, index]);

  return (
    <RACButton
      data-slot="carousel-dot"
      data-selected={isSelected || undefined}
      aria-label={`Go to slide ${index + 1}`}
      className="carousel__dot"
      onPress={handlePress}
    />
  );
};
Dot.displayName = 'Carousel.Dot';

/** 分页圆点：每个 snap 一个；只有一个 snap 时隐藏（原站行为） */
const Dots = forwardRef<HTMLDivElement, CarouselDotsProps>(
  ({ renderDot, className, ...rest }, ref) => {
    const { scrollSnapCount, selectedIndex } = useCarouselContext();

    if (scrollSnapCount <= 1) return null;

    return (
      <div
        ref={ref}
        role="tablist"
        aria-label="Slide indicators"
        data-slot="carousel-dots"
        className={clsx('carousel__dots', className)}
        {...rest}
      >
        {Array.from({ length: scrollSnapCount }, (_, dotIndex) =>
          renderDot !== undefined ? (
            renderDot({ index: dotIndex, isSelected: dotIndex === selectedIndex })
          ) : (
            // eslint-disable-next-line react/no-array-index-key -- dot 与幻灯片索引一一对应
            <Dot key={dotIndex} index={dotIndex} isSelected={dotIndex === selectedIndex} />
          ),
        )}
      </div>
    );
  },
);
Dots.displayName = 'Carousel.Dots';

/** 缩略图容器：复用 OSS ScrollShadow（横向、隐藏滚动条、渐隐边缘），与原站 DOM 一致 */
const Thumbnails = forwardRef<HTMLDivElement, CarouselThumbnailsProps>(
  ({ className, ...rest }, ref) => {
    const { layoutType } = useCarouselContext();

    return (
      <ScrollShadow
        ref={ref}
        orientation="horizontal"
        hideScrollBar
        role="tablist"
        aria-label="Slide thumbnails"
        data-slot="carousel-thumbnails"
        className={clsx(
          'carousel__thumbnails',
          layoutType === 'miniatures' && 'carousel__thumbnails--miniatures',
          className,
        )}
        {...rest}
      />
    );
  },
);
Thumbnails.displayName = 'Carousel.Thumbnails';

const Thumbnail = ({ index, src, alt = '', children, className, ...rest }: CarouselThumbnailProps) => {
  const { selectedIndex, scrollTo } = useCarouselContext();
  const handlePress = useCallback(() => {
    scrollTo(index);
  }, [scrollTo, index]);

  return (
    <RACButton
      data-slot="carousel-thumbnail"
      data-selected={index === selectedIndex || undefined}
      aria-label={`Go to slide ${index + 1}`}
      className={clsx('carousel__thumbnail', className)}
      onPress={handlePress}
      {...rest}
    >
      {children ?? (src !== undefined ? <img alt={alt} draggable={false} src={src} /> : null)}
    </RACButton>
  );
};
Thumbnail.displayName = 'Carousel.Thumbnail';

/**
 * 轮播根组件。原站底座是 Embla（本仓库不可用），此处以原生滚动等价实现：
 * 视口 overflow hidden + 程序化 scrollTo 平滑滚动，索引/边界状态由 scroll 事件回算。
 * 与原站一致：Content/Previous/Next 渲染进 viewport-wrapper，Dots/Thumbnails 在其后。
 */
const CarouselRoot = forwardRef<HTMLDivElement, CarouselProps>(
  ({ type = 'in-place', opts, plugins: _plugins, setApi, className, children, ...rest }, ref) => {
    const viewportRef = useRef<HTMLDivElement>(null);
    const loop = opts?.loop ?? false;
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnapCount, setScrollSnapCount] = useState(0);
    const [atStart, setAtStart] = useState(true);
    const [atEnd, setAtEnd] = useState(true);

    const canScrollPrev = loop ? scrollSnapCount > 1 : !atStart;
    const canScrollNext = loop ? scrollSnapCount > 1 : !atEnd;

    // 最新状态镜像：供稳定身份的命令式 API 读取
    const latest = useRef({ selectedIndex, scrollSnapCount, canScrollPrev, canScrollNext, loop });
    useEffect(() => {
      latest.current = { selectedIndex, scrollSnapCount, canScrollPrev, canScrollNext, loop };
    });
    // 连续点击翻页时以目标索引为步进基准（滚动停稳后回归实际索引）
    const targetIndexRef = useRef(0);

    const getItems = useCallback((): HTMLElement[] => {
      const viewport = viewportRef.current;
      if (viewport === null) return [];
      return Array.from(viewport.querySelectorAll<HTMLElement>('[data-slot="carousel-item"]'));
    }, []);

    /** 由滚动位置回算激活索引与前后边界 */
    const measure = useCallback(() => {
      const viewport = viewportRef.current;
      if (viewport === null) return;
      const items = getItems();
      setScrollSnapCount(items.length);
      const maxScroll = Math.max(viewport.scrollWidth - viewport.clientWidth, 0);
      setAtStart(viewport.scrollLeft <= 1);
      setAtEnd(viewport.scrollLeft >= maxScroll - 1);
      if (items.length === 0) return;
      const base = items[0].offsetLeft;
      let nearestIndex = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;
      items.forEach((item, itemIndex) => {
        const distance = Math.abs(item.offsetLeft - base - viewport.scrollLeft);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = itemIndex;
        }
      });
      setSelectedIndex(nearestIndex);
    }, [getItems]);

    const scrollToIndex = useCallback(
      (index: number, behavior: ScrollBehavior = 'smooth') => {
        const viewport = viewportRef.current;
        const items = getItems();
        if (viewport === null || items.length === 0) return;
        const clamped = Math.min(Math.max(index, 0), items.length - 1);
        targetIndexRef.current = clamped;
        const maxScroll = Math.max(viewport.scrollWidth - viewport.clientWidth, 0);
        const left = Math.min(items[clamped].offsetLeft - items[0].offsetLeft, maxScroll);
        viewport.scrollTo({ left, behavior });
      },
      [getItems],
    );

    const scrollTo = useCallback(
      (index: number) => {
        scrollToIndex(index);
      },
      [scrollToIndex],
    );

    const scrollPrev = useCallback(() => {
      const state = latest.current;
      const previous = targetIndexRef.current - 1;
      if (previous < 0) {
        if (state.loop && state.scrollSnapCount > 1) scrollToIndex(state.scrollSnapCount - 1);
        return;
      }
      scrollToIndex(previous);
    }, [scrollToIndex]);

    const scrollNext = useCallback(() => {
      const state = latest.current;
      const next = targetIndexRef.current + 1;
      if (next > state.scrollSnapCount - 1) {
        if (state.loop && state.scrollSnapCount > 1) scrollToIndex(0);
        return;
      }
      scrollToIndex(next);
    }, [scrollToIndex]);

    const measureRafRef = useRef(0);
    const settleTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const handleViewportScroll = useCallback(() => {
      cancelAnimationFrame(measureRafRef.current);
      measureRafRef.current = requestAnimationFrame(measure);
      // 平滑滚动停稳后把步进基准对齐到实际索引
      clearTimeout(settleTimerRef.current);
      settleTimerRef.current = setTimeout(() => {
        targetIndexRef.current = latest.current.selectedIndex;
      }, 150);
    }, [measure]);

    useEffect(
      () => () => {
        cancelAnimationFrame(measureRafRef.current);
        clearTimeout(settleTimerRef.current);
      },
      [],
    );

    const startIndex = opts?.startIndex ?? 0;
    useEffect(() => {
      if (startIndex > 0) scrollToIndex(startIndex, 'auto');
      measure();
      // 仅初始化执行一次
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const api = useMemo<CarouselApi>(
      () => ({
        scrollPrev,
        scrollNext,
        scrollTo,
        canScrollPrev: () => latest.current.canScrollPrev,
        canScrollNext: () => latest.current.canScrollNext,
        selectedScrollSnap: () => latest.current.selectedIndex,
        scrollSnapList: () =>
          Array.from({ length: latest.current.scrollSnapCount }, (_, snapIndex) => snapIndex),
      }),
      [scrollPrev, scrollNext, scrollTo],
    );

    useEffect(() => {
      setApi?.(api);
    }, [setApi, api]);

    const contextValue = useMemo<CarouselContextValue>(
      () => ({
        layoutType: type,
        api,
        selectedIndex,
        scrollSnapCount,
        canScrollPrev,
        canScrollNext,
        scrollPrev,
        scrollNext,
        scrollTo,
        viewportRef,
        handleViewportScroll,
        syncSnapState: measure,
      }),
      [
        type,
        api,
        selectedIndex,
        scrollSnapCount,
        canScrollPrev,
        canScrollNext,
        scrollPrev,
        scrollNext,
        scrollTo,
        handleViewportScroll,
        measure,
      ],
    );

    // 与原站 DOM 一致：Content 与前后按钮进 viewport-wrapper（按钮相对它绝对定位），其余在外
    const childArray = Children.toArray(children);
    const wrapperChildren = childArray.filter(
      (child) =>
        isValidElement(child) &&
        (child.type === Content || child.type === Previous || child.type === Next),
    );
    const outerChildren = childArray.filter((child) => !wrapperChildren.includes(child));

    return (
      <CarouselContext.Provider value={contextValue}>
        <div
          ref={ref}
          role="region"
          aria-roledescription="carousel"
          tabIndex={0}
          data-slot="carousel"
          className={clsx('carousel', `carousel--${type}`, className)}
          {...rest}
        >
          <div className="carousel__viewport-wrapper" data-slot="carousel-viewport-wrapper">
            {wrapperChildren}
          </div>
          {outerChildren}
        </div>
      </CarouselContext.Provider>
    );
  },
);
CarouselRoot.displayName = 'Carousel';

const Carousel = Object.assign(CarouselRoot, {
  Content,
  Item,
  Previous,
  Next,
  Dots,
  Thumbnails,
  Thumbnail,
});

export default Carousel;
