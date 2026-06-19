'use client';

import { forwardRef, useEffect, useState, type HTMLAttributes } from 'react';
import { Avatar as HeroAvatar } from '@heroui/react';

export type AvatarColor = 'default' | 'accent' | 'success' | 'warning' | 'danger';
export type AvatarSize = 'sm' | 'md' | 'lg';

export type AvatarProps = HTMLAttributes<HTMLSpanElement> & {
  src?: string;
  alt?: string;
  /** 图片缺失/加载失败时显示的占位内容（一般是姓名缩写） */
  fallback?: string;
  color?: AvatarColor;
  size?: AvatarSize;
  isSoft?: boolean;
};

const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  ({ src, alt = '', fallback, color = 'default', size = 'md', isSoft = false, className, ...rest }, ref) => {
    const [hasError, setHasError] = useState(false);

    useEffect(() => setHasError(false), [src]);

    const showImage = Boolean(src) && !hasError;

    const handleError = () => setHasError(true);

    // 用真组件 HeroUI Avatar.Root（基于 react-aria/Radix Primitive）渲染根 span：
    // - color/size/variant 经 avatarVariants 产出与本仓 CSS 分片完全一致的 .avatar/.avatar--<size>/.avatar--soft 类
    // - Root 透传 ...props 到 Radix Primitive.span（forwardRef），ref 落到真实 DOM 节点
    // 图片走本仓既定契约：有 src 即时渲染 <img>，onError 切到 fallback，src 变更经 useEffect 重置（消费方/测试均依赖）。
    return (
      <HeroAvatar
        ref={ref}
        className={className}
        color={color}
        size={size}
        variant={isSoft ? 'soft' : 'default'}
        {...rest}
      >
        {showImage ? (
          <img className="avatar__image" src={src} alt={alt} onError={handleError} />
        ) : (
          <HeroAvatar.Fallback color={color}>{fallback}</HeroAvatar.Fallback>
        )}
      </HeroAvatar>
    );
  },
);

Avatar.displayName = 'Avatar';

export default Avatar;
