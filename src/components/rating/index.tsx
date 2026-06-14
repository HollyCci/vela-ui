'use client';

import {
  createContext,
  forwardRef,
  useContext,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { Radio, RadioGroup, type RadioGroupProps, type RadioProps } from 'react-aria-components';
import clsx from 'clsx';

export type RatingSize = 'sm' | 'md' | 'lg';

export type RatingProps = Omit<
  RadioGroupProps,
  'value' | 'defaultValue' | 'onChange' | 'orientation' | 'className' | 'style'
> & {
  size?: RatingSize;
  /** 当前评分（受控），支持小数（只读半星展示） */
  value?: number;
  /** 初始评分（非受控） */
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** 所有评分项统一的自定义图标 */
  icon?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export type RatingItemRenderProps = {
  /** 当前分值是否覆盖到本项 */
  isActive: boolean;
  /** 是否半星（只读小数）部分填充 */
  isPartial: boolean;
  /** 部分填充百分比 0-100 */
  partialPercent: number;
};

export type RatingItemProps = Omit<RadioProps, 'children' | 'value' | 'className' | 'style'> & {
  /** 本项代表的分值 */
  value: number;
  children?: ReactNode | ((props: RatingItemRenderProps) => ReactNode);
  className?: string;
  style?: CSSProperties;
};

type RatingContextValue = {
  size: RatingSize;
  /** 当前评分数值（含小数），供 data-active / 半星计算 */
  value: number;
  icon?: ReactNode;
};

const RatingContext = createContext<RatingContextValue>({ size: 'md', value: 0 });

/** 原站默认星形图标（与基准快照 SVG path 一致） */
const StarIcon = () => (
  <svg aria-hidden="true" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.886.773C7.29-.231 8.71-.231 9.114.773l1.472 3.667l3.943.268c1.08.073 1.518 1.424.688 2.118L12.185 9.36l.964 3.832c.264 1.05-.886 1.884-1.802 1.31L8 12.4l-3.347 2.101c-.916.575-2.066-.26-1.802-1.309l.964-3.832L.783 6.826c-.83-.694-.391-2.045.688-2.118l3.943-.268z" />
  </svg>
);
StarIcon.displayName = 'Rating.StarIcon';

/**
 * 包装 RAC Radio 的单个评分项：选中/按压/只读/禁用等 data 属性由 RAC 输出，
 * data-active 标记当前分值覆盖到的项（与 RAC 单选的 data-selected 区分）。
 */
const Item = ({ value, children, className, ...rest }: RatingItemProps) => {
  const { size, value: rating, icon } = useContext(RatingContext);

  const isActive = value <= rating;
  const isPartial = !isActive && rating > value - 1 && rating < value;
  const partialPercent = isPartial ? Math.round((rating - (value - 1)) * 100) : 0;

  let content: ReactNode;
  if (typeof children === 'function') {
    // render function 的输出不做包装（与基准快照一致）
    content = children({ isActive, isPartial, partialPercent });
  } else {
    const iconNode = children ?? icon ?? <StarIcon />;
    content = (
      <>
        <span className="rating__icon" data-slot="rating-icon">
          {iconNode}
        </span>
        {isPartial && (
          <span
            className="rating__icon-partial"
            data-slot="rating-icon-partial"
            style={{ '--rating-partial': `${partialPercent}%` } as CSSProperties}
          >
            {iconNode}
          </span>
        )}
      </>
    );
  }

  return (
    <Radio
      aria-label={value === 1 ? '1 star' : `${value} stars`}
      {...rest}
      data-slot="rating-item"
      data-active={isActive || undefined}
      value={String(value)}
      className={clsx('rating__item', `rating__item--${size}`, className)}
    >
      {content}
    </Radio>
  );
};
Item.displayName = 'Rating.Item';

/**
 * 包装 RAC RadioGroup（水平朝向）的评分组件（原站 API）：
 * 数值 API 与 RAC 的字符串单选互转——分值向下取整映射到选中项，
 * 小数部分由 data-active 与半星覆盖层呈现；键盘方向键调分由 RAC 提供。
 */
const RatingRoot = forwardRef<HTMLDivElement, RatingProps>(
  (
    { size = 'md', value, defaultValue, onValueChange, icon, className, children, ...rest },
    ref,
  ) => {
    const [internalValue, setInternalValue] = useState(defaultValue ?? 0);
    const rating = value ?? internalValue;
    const selected = Math.floor(rating);

    const handleChange = (next: string) => {
      const nextValue = Number(next);
      if (value === undefined) setInternalValue(nextValue);
      onValueChange?.(nextValue);
    };

    return (
      <RatingContext.Provider value={{ size, value: rating, icon }}>
        <RadioGroup
          aria-label="Rating"
          {...rest}
          ref={ref}
          data-slot="rating"
          orientation="horizontal"
          value={selected >= 1 ? String(selected) : null}
          onChange={handleChange}
          className={clsx('rating', `rating--${size}`, className)}
        >
          {children}
        </RadioGroup>
      </RatingContext.Provider>
    );
  },
);
RatingRoot.displayName = 'Rating';

const Rating = Object.assign(RatingRoot, { Item });

export default Rating;
