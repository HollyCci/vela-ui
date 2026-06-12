import { forwardRef, useCallback, useState, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';
import Button from '../button';

export type CodeBlockProps = HTMLAttributes<HTMLDivElement> & {
  code: string;
  language?: ReactNode;
  hasCopyButton?: boolean;
};

const CodeBlock = forwardRef<HTMLDivElement, CodeBlockProps>(
  ({ code, language, hasCopyButton = true, className, ...rest }, ref) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = useCallback(async () => {
      try {
        await navigator.clipboard.writeText(code);
        setIsCopied(true);
      } catch {
        setIsCopied(false);
      }
    }, [code]);

    return (
      <div ref={ref} className={clsx('code-block', className)} {...rest}>
        {(language !== undefined || hasCopyButton) && (
          <div className="code-block__header">
            <span>{language}</span>
            {hasCopyButton && (
              <Button
                variant="ghost"
                size="sm"
                isIconOnly
                className="code-block__copy-button"
                aria-label={isCopied ? '已复制' : '复制代码'}
                onClick={handleCopy}
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  {isCopied ? (
                    <path d="M3 8.5l3.5 3.5L13 5" />
                  ) : (
                    <>
                      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
                      <path d="M10.5 5.5v-2a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" />
                    </>
                  )}
                </svg>
              </Button>
            )}
          </div>
        )}
        <div className="code-block__code">
          <pre>
            <code>{code}</code>
          </pre>
        </div>
      </div>
    );
  },
);

CodeBlock.displayName = 'CodeBlock';

export default CodeBlock;
