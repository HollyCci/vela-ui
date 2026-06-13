import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';
import { Button, type ButtonProps } from '@heroui/react';
import clsx from 'clsx';

export type CodeBlockProps = HTMLAttributes<HTMLDivElement>;

export type CodeBlockHeaderProps = HTMLAttributes<HTMLDivElement>;

export type CodeBlockCodeProps = HTMLAttributes<HTMLDivElement> & {
  /** 要渲染的代码（原站 API） */
  code: string;
  /** Shiki 语言 id（原站 API，默认 'plaintext'）；本仓不内置 Shiki，按基准快照渲染纯 pre>code */
  language?: string;
  /** Shiki 主题（原站 API，默认 'github-light'）；同上仅保留 API，暗色由 CSS 主题选择器接管 */
  theme?: string;
};

export type CodeBlockCopyButtonProps = Omit<ButtonProps, 'className' | 'style' | 'children'> & {
  /** 点击时写入剪贴板的代码（原站 API） */
  code: string;
  className?: string;
  style?: CSSProperties;
};

/** 复制图标（与基准快照 SVG path 一致） */
const CopyIcon = () => (
  <svg className="size-3.5" fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
    <path
      clipRule="evenodd"
      d="M12 2.5H8A1.5 1.5 0 0 0 6.5 4v1H8a3 3 0 0 1 3 3v1.5h1A1.5 1.5 0 0 0 13.5 8V4A1.5 1.5 0 0 0 12 2.5M11 11h1a3 3 0 0 0 3-3V4a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3v1H4a3 3 0 0 0-3 3v4a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3zM4 6.5h4A1.5 1.5 0 0 1 9.5 8v4A1.5 1.5 0 0 1 8 13.5H4A1.5 1.5 0 0 1 2.5 12V8A1.5 1.5 0 0 1 4 6.5"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);
CopyIcon.displayName = 'CodeBlock.CopyIcon';

/** 复制成功对勾图标（成功态切换用，无快照基准） */
const CheckIcon = () => (
  <svg className="size-3.5" fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
    <path
      clipRule="evenodd"
      d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06l2.72 2.72 6.72-6.72a.75.75 0 0 1 1.06 0"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);
CheckIcon.displayName = 'CodeBlock.CheckIcon';

/** 基准快照中图标外层 Motion span 的终态内联样式（本仓无动画库，静态对齐） */
const ICON_MOTION_STYLE: CSSProperties = { filter: 'blur(0px)', opacity: 1, transform: 'none' };

const Header = forwardRef<HTMLDivElement, CodeBlockHeaderProps>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    data-slot="code-block-header"
    className={clsx('code-block__header', className)}
    {...rest}
  />
));
Header.displayName = 'CodeBlock.Header';

/** 代码滚动区：pre>code 结构与基准快照一致（快照亦为无高亮的纯文本渲染） */
const Code = forwardRef<HTMLDivElement, CodeBlockCodeProps>(
  ({ code, language: _language = 'plaintext', theme: _theme = 'github-light', className, ...rest }, ref) => (
    <div
      ref={ref}
      data-slot="code-block-code"
      className={clsx('code-block__code', className)}
      {...rest}
    >
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  ),
);
Code.displayName = 'CodeBlock.Code';

/**
 * 复制按钮：OSS Button ghost/sm/icon-only；navigator.clipboard 写入成功后
 * 切换对勾图标约 2 秒（原站行为），失败保持原图标。
 */
const CopyButton = ({
  code,
  className,
  'aria-label': ariaLabel = 'Copy code',
  onPress,
  ...rest
}: CodeBlockCopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const resetTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
    },
    [],
  );

  const handlePress = useCallback<NonNullable<ButtonProps['onPress']>>(
    (event) => {
      onPress?.(event);
      void navigator.clipboard
        .writeText(code)
        .then(() => {
          setIsCopied(true);
          if (resetTimerRef.current !== null) {
            window.clearTimeout(resetTimerRef.current);
          }
          resetTimerRef.current = window.setTimeout(() => {
            setIsCopied(false);
            resetTimerRef.current = null;
          }, 2000);
        })
        .catch(() => undefined);
    },
    [onPress, code],
  );

  return (
    <Button
      data-slot="code-block-copy-button"
      isIconOnly
      size="sm"
      variant="ghost"
      aria-label={isCopied ? 'Copied' : ariaLabel}
      className={clsx('code-block__copy-button', className)}
      onPress={handlePress}
      {...rest}
    >
      <span
        className="flex size-3.5 items-center justify-center"
        data-slot="code-block-copy-button-icon-motion"
        style={ICON_MOTION_STYLE}
      >
        {isCopied ? <CheckIcon /> : <CopyIcon />}
      </span>
    </Button>
  );
};
CopyButton.displayName = 'CodeBlock.CopyButton';

/** 代码块根容器（原站 API：仅原生 div props），语言标签/复制按钮由 Header 槽位组合 */
const CodeBlockRoot = forwardRef<HTMLDivElement, CodeBlockProps>(({ className, ...rest }, ref) => (
  <div ref={ref} data-slot="code-block" className={clsx('code-block', className)} {...rest} />
));
CodeBlockRoot.displayName = 'CodeBlock';

const CodeBlock = Object.assign(CodeBlockRoot, { Header, Code, CopyButton });

export default CodeBlock;
