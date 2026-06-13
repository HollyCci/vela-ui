import { forwardRef, useState, type HTMLAttributes } from 'react';
import clsx from 'clsx';

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
    const showImage = Boolean(src) && !hasError;

    const handleError = () => setHasError(true);

    return (
      <span
        ref={ref}
        className={clsx('avatar', `avatar--${size}`, isSoft && 'avatar--soft', className)}
        {...rest}
      >
        {showImage ? (
          <img className="avatar__image" src={src} alt={alt} onError={handleError} />
        ) : (
          <span data-slot="avatar-fallback" className={clsx('avatar__fallback', `avatar__fallback--${color}`)}>
            {fallback}
          </span>
        )}
      </span>
    );
  },
);

Avatar.displayName = 'Avatar';

export default Avatar;
