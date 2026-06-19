'use client';

import { forwardRef, type AnchorHTMLAttributes } from 'react';
import { Link as AriaLink, type LinkProps as AriaLinkProps, type PressEvent } from 'react-aria-components';
import clsx from 'clsx';

export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  isDisabled?: boolean;
  /** 外链：自动 target=_blank 并显示外链箭头图标 */
  isExternal?: boolean;
  /** react-aria 抽象指针事件（与 onClick 等价，两者可同时使用） */
  onPress?: (event: PressEvent) => void;
};

const ExternalIcon = () => (
  <span className="link__icon" data-default-icon="true" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M7 17L17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

/**
 * 包装 react-aria-components 的 Link（真 a11y / 键盘 / 焦点 / press 状态），
 * 输出与 CSS 分片一致的 `.link` 类名。禁用态保留原生 `<a aria-disabled>` 契约，
 * 不退化成 RAC 的 `<span>`，并抑制 onClick / 外链图标。
 */
const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    { isDisabled = false, isExternal = false, className, children, href, onClick, onPress, ...rest },
    ref,
  ) => {
    if (isDisabled) {
      // RAC 在缺少 href 时会渲染 <span>，为保持公共契约这里直接渲染禁用的 <a>。
      return (
        <a ref={ref} aria-disabled="true" className={clsx('link', className)} {...rest}>
          {children}
        </a>
      );
    }

    return (
      <AriaLink
        ref={ref}
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className={clsx('link', className)}
        // useLink 运行时消费 onClick，保留原生 MouseEvent（含 preventDefault）以兼容站内跳转拦截；
        // RAC 的 onClick 签名用 FocusableElement，运行时即本锚点，类型上做一次安全收窄。
        onClick={onClick as AriaLinkProps['onClick']}
        onPress={onPress}
        {...(rest as Omit<AriaLinkProps, 'href' | 'target' | 'rel' | 'className' | 'children' | 'onClick' | 'onPress'>)}
      >
        {children}
        {isExternal && <ExternalIcon />}
      </AriaLink>
    );
  },
);

Link.displayName = 'Link';

export default Link;
