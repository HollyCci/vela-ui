'use client';

import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import {
  Button as UIButton,
  ScrollShadow,
  type ButtonProps as UIButtonProps,
  type ScrollShadowProps,
} from '@heroui/react';
import { Button as RACButton, type ButtonProps as RACButtonProps } from 'react-aria-components';
import useEmblaCarousel, { type EmblaViewportRefType } from 'embla-carousel-react';
import type { EmblaCarouselType, EmblaOptionsType, EmblaPluginType } from 'embla-carousel';
import clsx from 'clsx';

export type CarouselLayoutType = 'in-place' | 'modal' | 'miniatures';

export type CarouselAutoplayOptions = {
  /** 自动切换间隔，默认 3000ms */
  delay?: number;
};

/** 参考实现 setApi / useCarousel 暴露的就是真实 Embla API 实例 */
export type CarouselApi = EmblaCarouselType;

export type CarouselProps = HTMLAttributes<HTMLDivElement> & {
  /** 导航按钮布局类型（参考 API，默认 in-place） */
  type?: CarouselLayoutType;
  /** 传给底座 Embla 的选项（loop / startIndex / align / dragFree / axis 等） */
  opts?: EmblaOptionsType;
  /** Embla 插件（如 embla-carousel-autoplay），参考 API */
  plugins?: EmblaPluginType[];
  /** 组件级自动轮播 helper；没有 embla-carousel-autoplay 依赖时可直接使用 */
  autoplay?: boolean | CarouselAutoplayOptions;
  /** 拿到底座 Embla API 实例（参考实现 setApi） */
  setApi?: (api: EmblaCarouselType) => void;
};

export type CarouselContentProps = HTMLAttributes<HTMLDivElement>;
export type CarouselItemProps = HTMLAttributes<HTMLDivElement>;

export type CarouselNavButtonProps = Omit<UIButtonProps, 'className' | 'style'> & {
  /** 替换默认 chevron 的自定义图标（参考 API） */
  icon?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export type CarouselDotProps = Omit<RACButtonProps, 'className' | 'style' | 'children'> & {
  index: number;
  isSelected?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export type CarouselDotsProps = HTMLAttributes<HTMLDivElement> & {
  /** 自定义 dot 渲染（参考 API） */
  renderDot?: (props: { index: number; isSelected: boolean }) => ReactNode;
};

export type CarouselThumbnailsProps = Omit<ScrollShadowProps, 'orientation'>;

export type CarouselThumbnailProps = Omit<RACButtonProps, 'className' | 'style' | 'children'> & {
  /** 该缩略图跳转的幻灯片索引（参考 API，必填，0 起） */
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
  emblaApi: EmblaCarouselType | undefined;
  viewportRef: EmblaViewportRefType;
  selectedIndex: number;
  scrollSnapCount: number;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
};

const CarouselContext = createContext<CarouselContextValue | null>(null);

const useCarouselContext = (): CarouselContextValue => {
  const context = useContext(CarouselContext);
  if (context === null) {
    throw new Error('Carousel 子组件必须在 <Carousel> 内使用');
  }
  return context;
};

/** 参考实现 useCarousel hook：在任意后代组件中访问轮播上下文（api 为真实 Embla 实例） */
export function useCarousel(): {
  api: EmblaCarouselType | undefined;
  selectedIndex: number;
  scrollSnapCount: number;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
} {
  const {
    emblaApi,
    selectedIndex,
    scrollSnapCount,
    canScrollPrev,
    canScrollNext,
    scrollPrev,
    scrollNext,
    scrollTo,
  } = useCarouselContext();
  return {
    api: emblaApi,
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

/** 视口（Embla ref 目标，overflow hidden）+ 弹性内容容器（Embla 平移它，承载各 slide） */
const Content = forwardRef<HTMLDivElement, CarouselContentProps>(
  ({ className, children, ...rest }, ref) => {
    const { viewportRef } = useCarouselContext();

    return (
      <div ref={viewportRef} className="carousel__viewport" data-slot="carousel-viewport">
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

const Previous = ({ icon, className, onPress, ...rest }: CarouselNavButtonProps) => {
  const { layoutType, canScrollPrev, scrollPrev } = useCarouselContext();
  const handlePress = useCallback<NonNullable<CarouselNavButtonProps['onPress']>>(
    (event) => {
      scrollPrev();
      onPress?.(event);
    },
    [scrollPrev, onPress],
  );

  return (
    <UIButton
      data-slot="carousel-previous"
      variant="tertiary"
      size="sm"
      isIconOnly
      aria-label="Previous slide"
      isDisabled={!canScrollPrev}
      onPress={handlePress}
      className={clsx('carousel__previous', `carousel__previous--${layoutType}`, className)}
      {...rest}
    >
      {icon ?? <ChevronLeftIcon />}
    </UIButton>
  );
};
Previous.displayName = 'Carousel.Previous';

const Next = ({ icon, className, onPress, ...rest }: CarouselNavButtonProps) => {
  const { layoutType, canScrollNext, scrollNext } = useCarouselContext();
  const handlePress = useCallback<NonNullable<CarouselNavButtonProps['onPress']>>(
    (event) => {
      scrollNext();
      onPress?.(event);
    },
    [scrollNext, onPress],
  );

  return (
    <UIButton
      data-slot="carousel-next"
      variant="tertiary"
      size="sm"
      isIconOnly
      aria-label="Next slide"
      isDisabled={!canScrollNext}
      onPress={handlePress}
      className={clsx('carousel__next', `carousel__next--${layoutType}`, className)}
      {...rest}
    >
      {icon ?? <ChevronRightIcon />}
    </UIButton>
  );
};
Next.displayName = 'Carousel.Next';

const Dot = ({ index, isSelected, className, onPress, children, ...rest }: CarouselDotProps) => {
  const { selectedIndex, scrollTo } = useCarouselContext();
  const resolvedSelected = isSelected ?? selectedIndex === index;
  const handlePress = useCallback<NonNullable<CarouselDotProps['onPress']>>((event) => {
    scrollTo(index);
    onPress?.(event);
  }, [scrollTo, index, onPress]);

  return (
    <RACButton
      data-slot="carousel-dot"
      data-selected={resolvedSelected || undefined}
      aria-label={`Go to slide ${index + 1}`}
      className={clsx('carousel__dot', className)}
      onPress={handlePress}
      {...rest}
    >
      {children}
    </RACButton>
  );
};
Dot.displayName = 'Carousel.Dot';

/** 分页圆点：每个 snap 一个；只有一个 snap 时隐藏（参考实现行为） */
const Dots = forwardRef<HTMLDivElement, CarouselDotsProps>(
  ({ renderDot, className, ...rest }, ref) => {
    const { scrollSnapCount, selectedIndex } = useCarouselContext();

    if (scrollSnapCount <= 1) return null;

    return (
      <div
        ref={ref}
        role="group"
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

/** 缩略图容器：复用 OSS ScrollShadow（横向、隐藏滚动条、渐隐边缘），与基准 DOM 一致 */
const Thumbnails = forwardRef<HTMLDivElement, CarouselThumbnailsProps>(
  ({ className, ...rest }, ref) => {
    const { layoutType } = useCarouselContext();

    return (
      <ScrollShadow
        ref={ref}
        orientation="horizontal"
        hideScrollBar
        role="group"
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

const Thumbnail = ({
  index,
  src,
  alt = '',
  children,
  className,
  onPress,
  ...rest
}: CarouselThumbnailProps) => {
  const { selectedIndex, scrollTo } = useCarouselContext();
  const handlePress = useCallback<NonNullable<CarouselThumbnailProps['onPress']>>(
    (event) => {
      scrollTo(index);
      onPress?.(event);
    },
    [scrollTo, index, onPress],
  );

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
 * 轮播根组件：底座为真实 Embla（embla-carousel-react）。
 * 指针拖拽/惯性/吸附/loop/autoplay 插件均由 Embla 提供；本层只渲染参考实现 BEM 结构并把
 * Embla 的选中/边界状态经 context 下发给按钮/圆点/缩略图。
 * 与基准 DOM 一致：Content 与前后按钮渲染进 viewport-wrapper，Dots/Thumbnails 在其后。
 */
const CarouselRoot = forwardRef<HTMLDivElement, CarouselProps>(
  ({ type = 'in-place', opts, plugins, autoplay = false, setApi, className, children, ...rest }, ref) => {
    const [viewportRef, emblaApi] = useEmblaCarousel(opts, plugins);

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);
    const isAutoplayEnabled = autoplay === true || typeof autoplay === 'object';
    const autoplayDelay = typeof autoplay === 'object' ? (autoplay.delay ?? 3000) : 3000;

    const onSelect = useCallback((api: EmblaCarouselType) => {
      setSelectedIndex(api.selectedScrollSnap());
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    }, []);

    useEffect(() => {
      if (emblaApi === undefined) return undefined;
      const handleReInit = (api: EmblaCarouselType) => {
        setScrollSnaps(api.scrollSnapList());
        onSelect(api);
      };
      handleReInit(emblaApi);
      emblaApi.on('select', onSelect);
      emblaApi.on('reInit', handleReInit);
      return () => {
        emblaApi.off('select', onSelect);
        emblaApi.off('reInit', handleReInit);
      };
    }, [emblaApi, onSelect]);

    useEffect(() => {
      if (emblaApi !== undefined) setApi?.(emblaApi);
    }, [emblaApi, setApi]);

    useEffect(() => {
      if (emblaApi === undefined || !isAutoplayEnabled) return undefined;
      const timer = window.setInterval(() => {
        if (emblaApi.canScrollNext()) emblaApi.scrollNext();
        else emblaApi.scrollTo(0);
      }, Math.max(250, autoplayDelay));
      return () => window.clearInterval(timer);
    }, [autoplayDelay, emblaApi, isAutoplayEnabled]);

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
    const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

    const isVertical = opts?.axis === 'y';
    const isRtl = opts?.direction === 'rtl';
    const handleKeyDown = useCallback(
      (event: ReactKeyboardEvent<HTMLDivElement>) => {
        // 仅响应根容器自身的方向键，避免吞掉内部可聚焦控件（按钮/圆点)的键盘行为
        if (event.target !== event.currentTarget) return;
        const prevKey = isVertical ? 'ArrowUp' : isRtl ? 'ArrowRight' : 'ArrowLeft';
        const nextKey = isVertical ? 'ArrowDown' : isRtl ? 'ArrowLeft' : 'ArrowRight';
        switch (event.key) {
          case prevKey:
            event.preventDefault();
            scrollPrev();
            break;
          case nextKey:
            event.preventDefault();
            scrollNext();
            break;
          case 'Home':
            event.preventDefault();
            scrollTo(0);
            break;
          case 'End':
            event.preventDefault();
            scrollTo(Math.max(0, scrollSnaps.length - 1));
            break;
          default:
            break;
        }
      },
      [isVertical, isRtl, scrollPrev, scrollNext, scrollTo, scrollSnaps.length],
    );

    const contextValue = useMemo<CarouselContextValue>(
      () => ({
        layoutType: type,
        emblaApi,
        viewportRef,
        selectedIndex,
        scrollSnapCount: scrollSnaps.length,
        canScrollPrev,
        canScrollNext,
        scrollPrev,
        scrollNext,
        scrollTo,
      }),
      [
        type,
        emblaApi,
        viewportRef,
        selectedIndex,
        scrollSnaps.length,
        canScrollPrev,
        canScrollNext,
        scrollPrev,
        scrollNext,
        scrollTo,
      ],
    );

    // 与基准 DOM 一致：Content 与前后按钮进 viewport-wrapper（按钮相对它绝对定位），其余在外
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
          aria-label="Carousel"
          tabIndex={0}
          onKeyDown={handleKeyDown}
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
  Dot,
  Dots,
  Thumbnails,
  Thumbnail,
});

export default Carousel;
