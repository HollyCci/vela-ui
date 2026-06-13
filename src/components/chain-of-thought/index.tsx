import {
  createContext,
  forwardRef,
  useContext,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import {
  Button,
  Disclosure,
  type ButtonProps,
  type DisclosureContentProps,
  type DisclosureProps,
} from '@heroui/react';
import clsx from 'clsx';

export type ChainOfThoughtProps = Omit<DisclosureProps, 'className' | 'style'> & {
  /** 流式推理中：trigger 文本套 shimmer，根类切换为 --streaming（原站 API，默认 false） */
  isStreaming?: boolean;
  className?: string;
  style?: CSSProperties;
};

export type ChainOfThoughtTriggerProps = Omit<ButtonProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type ChainOfThoughtContentProps = Omit<DisclosureContentProps, 'className' | 'style'> & {
  className?: string;
  style?: CSSProperties;
};

export type ChainOfThoughtStepsProps = HTMLAttributes<HTMLDivElement>;

export type ChainOfThoughtStepProps = HTMLAttributes<HTMLDivElement> & {
  /** 可选步骤标签：提供时渲染步骤头（指示点 + 标签），缺省时只有正文（原站 API） */
  label?: ReactNode;
};

type ChainOfThoughtContextValue = {
  isStreaming: boolean;
};

const ChainOfThoughtContext = createContext<ChainOfThoughtContextValue>({ isStreaming: false });

/**
 * 包装 OSS Button slot="trigger"（原站 trigger 即 ghost/sm 按钮，外层 Disclosure.Heading 提供 h3 语义）；
 * 流式态把 children 包进 text-shimmer，末尾固定渲染 Disclosure 默认 chevron 指示器。
 */
const Trigger = ({ className, children, ...rest }: ChainOfThoughtTriggerProps) => {
  const { isStreaming } = useContext(ChainOfThoughtContext);

  return (
    <Disclosure.Heading>
      <Button
        size="sm"
        variant="ghost"
        slot="trigger"
        data-slot="chain-of-thought-trigger"
        className={clsx('chain-of-thought__trigger', className)}
        {...rest}
      >
        {(renderProps) => {
          const content = typeof children === 'function' ? children(renderProps) : children;
          return (
            <>
              {isStreaming ? (
                <span className="text-shimmer" data-slot="text-shimmer">
                  {content}
                </span>
              ) : (
                content
              )}
              <Disclosure.Indicator className="text-muted size-3.5" />
            </>
          );
        }}
      </Button>
    </Disclosure.Heading>
  );
};
Trigger.displayName = 'ChainOfThought.Trigger';

/** 包装 OSS Disclosure.Content；children 自动套 Disclosure.Body（基准快照含 body/body-inner 两层） */
const Content = ({ className, children, ...rest }: ChainOfThoughtContentProps) => (
  <Disclosure.Content
    data-slot="chain-of-thought-content"
    className={clsx('chain-of-thought__content', className)}
    {...rest}
  >
    <Disclosure.Body>{children}</Disclosure.Body>
  </Disclosure.Content>
);
Content.displayName = 'ChainOfThought.Content';

const Steps = forwardRef<HTMLDivElement, ChainOfThoughtStepsProps>(
  ({ className, ...rest }, ref) => (
    <div
      ref={ref}
      data-slot="chain-of-thought-steps"
      className={clsx('chain-of-thought__steps', className)}
      {...rest}
    />
  ),
);
Steps.displayName = 'ChainOfThought.Steps';

const Step = forwardRef<HTMLDivElement, ChainOfThoughtStepProps>(
  ({ label, className, children, ...rest }, ref) => (
    <div
      ref={ref}
      data-slot="chain-of-thought-step"
      className={clsx('chain-of-thought__step', className)}
      {...rest}
    >
      {label !== undefined && (
        <div className="chain-of-thought__step-header">
          <span aria-hidden="true" className="chain-of-thought__step-indicator" />
          <span className="chain-of-thought__step-label">{label}</span>
        </div>
      )}
      <div className="chain-of-thought__step-content">{children}</div>
    </div>
  ),
);
Step.displayName = 'ChainOfThought.Step';

/**
 * 包装 OSS Disclosure 的可折叠思维链（原站 API）：
 * 展开/收起、受控 isExpanded/onExpandedChange、键盘与 aria 语义均由底座提供；
 * 非流式时根类为 --complete（与基准快照一致，CSS 仅对 --streaming 定义样式）。
 */
const ChainOfThoughtRoot = ({ isStreaming = false, className, ...rest }: ChainOfThoughtProps) => (
  <ChainOfThoughtContext.Provider value={{ isStreaming }}>
    <Disclosure
      data-slot="chain-of-thought"
      className={clsx(
        'chain-of-thought',
        isStreaming ? 'chain-of-thought--streaming' : 'chain-of-thought--complete',
        className,
      )}
      {...rest}
    />
  </ChainOfThoughtContext.Provider>
);
ChainOfThoughtRoot.displayName = 'ChainOfThought';

const ChainOfThought = Object.assign(ChainOfThoughtRoot, { Trigger, Content, Steps, Step });

export default ChainOfThought;
