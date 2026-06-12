import {
  Children,
  forwardRef,
  useCallback,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import clsx from 'clsx';

export type CarouselVariant = 'in-place' | 'modal' | 'miniatures';

export type CarouselProps = Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> & {
  /** 当前激活索引（受控） */
  index: number;
  onIndexChange?: (index: number) => void;
  /** 导航按钮形态，默认 in-place */
  variant?: CarouselVariant;
  /** 是否显示圆点指示器 */
  hasDots?: boolean;
  /** 缩略图地址列表，提供则渲染缩略图导航 */
  thumbnails?: string[];
  children: ReactNode;
};

type NavButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  direction: 'previous' | 'next';
  variant: CarouselVariant;
};

const NavButton = forwardRef<HTMLButtonElement, NavButtonProps>(
  ({ direction, variant, className, ...rest }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-label={direction === 'previous' ? '上一张' : '下一张'}
      className={clsx(
        `carousel__${direction}`,
        `carousel__${direction}--${variant}`,
        'button',
        'button--secondary',
        'button--icon-only',
        className,
      )}
      {...rest}
    >
      {direction === 'previous' ? '‹' : '›'}
    </button>
  ),
);
NavButton.displayName = 'Carousel.NavButton';

type DotProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  dotIndex: number;
  isSelected: boolean;
  onIndexChange?: (index: number) => void;
};

const Dot = forwardRef<HTMLButtonElement, DotProps>(
  ({ dotIndex, isSelected, onIndexChange, className, ...rest }, ref) => {
    const handleClick = useCallback(() => {
      onIndexChange?.(dotIndex);
    }, [onIndexChange, dotIndex]);
    return (
      <button
        ref={ref}
        type="button"
        aria-label={`跳转到第 ${dotIndex + 1} 张`}
        data-selected={isSelected || undefined}
        className={clsx('carousel__dot', className)}
        onClick={handleClick}
        {...rest}
      />
    );
  },
);
Dot.displayName = 'Carousel.Dot';

type ThumbnailProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  src: string;
  thumbIndex: number;
  isSelected: boolean;
  onIndexChange?: (index: number) => void;
};

const Thumbnail = forwardRef<HTMLButtonElement, ThumbnailProps>(
  ({ src, thumbIndex, isSelected, onIndexChange, className, ...rest }, ref) => {
    const handleClick = useCallback(() => {
      onIndexChange?.(thumbIndex);
    }, [onIndexChange, thumbIndex]);
    return (
      <button
        ref={ref}
        type="button"
        aria-label={`查看第 ${thumbIndex + 1} 张`}
        data-selected={isSelected || undefined}
        className={clsx('carousel__thumbnail', className)}
        onClick={handleClick}
        {...rest}
      >
        <img src={src} alt="" />
      </button>
    );
  },
);
Thumbnail.displayName = 'Carousel.Thumbnail';

const CarouselRoot = forwardRef<HTMLDivElement, CarouselProps>(
  (
    {
      index,
      onIndexChange,
      variant = 'in-place',
      hasDots = false,
      thumbnails,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const items = Children.toArray(children);
    const count = items.length;
    const clampedIndex = Math.min(Math.max(index, 0), Math.max(count - 1, 0));

    const handlePrevious = useCallback(() => {
      onIndexChange?.(clampedIndex <= 0 ? count - 1 : clampedIndex - 1);
    }, [onIndexChange, clampedIndex, count]);

    const handleNext = useCallback(() => {
      onIndexChange?.(clampedIndex >= count - 1 ? 0 : clampedIndex + 1);
    }, [onIndexChange, clampedIndex, count]);

    return (
      <div
        ref={ref}
        role="region"
        aria-roledescription="carousel"
        className={clsx(
          'carousel',
          variant !== 'in-place' && `carousel--${variant}`,
          className,
        )}
        {...rest}
      >
        <div className="carousel__viewport-wrapper">
          <div className="carousel__viewport">
            <div
              className="carousel__content carousel__content--horizontal"
              style={{
                transform: `translateX(-${clampedIndex * 100}%)`,
                transition: 'transform .3s ease',
              }}
            >
              {items.map((item, itemIndex) => (
                <div
                  // eslint-disable-next-line react/no-array-index-key -- 静态切片，顺序稳定
                  key={itemIndex}
                  className="carousel__item carousel__item--horizontal"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${itemIndex + 1} / ${count}`}
                  aria-hidden={itemIndex !== clampedIndex || undefined}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
          {variant !== 'miniatures' && (
            <>
              <NavButton direction="previous" variant={variant} onClick={handlePrevious} />
              <NavButton direction="next" variant={variant} onClick={handleNext} />
            </>
          )}
        </div>
        {hasDots && (
          <div className="carousel__dots" role="tablist">
            {items.map((_, dotIndex) => (
              <Dot
                // eslint-disable-next-line react/no-array-index-key -- 静态切片，顺序稳定
                key={dotIndex}
                dotIndex={dotIndex}
                isSelected={dotIndex === clampedIndex}
                onIndexChange={onIndexChange}
              />
            ))}
          </div>
        )}
        {thumbnails !== undefined && (
          <div
            className={clsx(
              'carousel__thumbnails',
              variant === 'miniatures' && 'carousel__thumbnails--miniatures',
            )}
          >
            {variant === 'miniatures' && (
              <NavButton direction="previous" variant={variant} onClick={handlePrevious} />
            )}
            {thumbnails.map((src, thumbIndex) => (
              <Thumbnail
                // eslint-disable-next-line react/no-array-index-key -- 静态切片，顺序稳定
                key={thumbIndex}
                src={src}
                thumbIndex={thumbIndex}
                isSelected={thumbIndex === clampedIndex}
                onIndexChange={onIndexChange}
              />
            ))}
            {variant === 'miniatures' && (
              <NavButton direction="next" variant={variant} onClick={handleNext} />
            )}
          </div>
        )}
      </div>
    );
  },
);
CarouselRoot.displayName = 'Carousel';

const Carousel = Object.assign(CarouselRoot, { NavButton, Dot, Thumbnail });

export default Carousel;
