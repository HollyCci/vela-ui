import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import AlertDialog from '../../components/alert-dialog';
import Avatar from '../../components/avatar';
import Button from '../../components/button';
import Checkbox from '../../components/checkbox';
import ChainOfThought from '../../components/chain-of-thought';
import ChatAttachment from '../../components/chat-attachment';
import ChatConversation from '../../components/chat-conversation';
import ChatListView from '../../components/chat-list-view';
import ChatLoader from '../../components/chat-loader';
import ChatMessage from '../../components/chat-message';
import ChatMessageActions from '../../components/chat-message-actions';
import ChatSource from '../../components/chat-source';
import Markdown from '../../components/markdown';
import ChatTool, { type ChatToolStatus } from '../../components/chat-tool';
import CodeBlock from '../../components/code-block';
import Drawer from '../../components/drawer';
import Dropdown from '../../components/dropdown';
import EmojiPicker from '../../components/emoji-picker';
import MenuItem from '../../components/menu-item';
import Modal from '../../components/modal';
import Popover from '../../components/popover';
import PromptInput, { type PromptInputStatus } from '../../components/prompt-input';
import PromptSuggestion from '../../components/prompt-suggestion';
import Sheet from '../../components/sheet';
import TextShimmer from '../../components/text-shimmer';
import DemoSection from '../demo-section';

type DemoKey = string | number;
type DemoSelection = 'all' | Set<DemoKey>;

const CHAT_MESSAGE_DEMO_ANSWER =
  'Compound components let you compose message layout explicitly while keeping state in your app layer.';

const ChatMessageDemo = () => (
  <DemoSection label="Usage" isColumn>
    <ChatMessage.User>
      <ChatMessage.Bubble>
        <ChatMessage.Content>
          Can you explain how compound components help AI chat UIs stay SDK-agnostic?
        </ChatMessage.Content>
      </ChatMessage.Bubble>
    </ChatMessage.User>
    <ChatMessage.Assistant>
      <ChatMessage.Avatar fallback="AI" show />
      <ChatMessage.Body>
        <ChatMessage.Content>{CHAT_MESSAGE_DEMO_ANSWER}</ChatMessage.Content>
        <ChatMessage.Actions>
          <ChatMessageActions>
            <ChatMessageActions.Copy content={CHAT_MESSAGE_DEMO_ANSWER} />
            <ChatMessageActions.ThumbsUp />
            <ChatMessageActions.ThumbsDown />
            <ChatMessageActions.Regenerate />
          </ChatMessageActions>
        </ChatMessage.Actions>
      </ChatMessage.Body>
    </ChatMessage.Assistant>
  </DemoSection>
);

const ChatLoaderDemo = () => (
  <>
    <DemoSection label="Dots / Pulse / Spinner">
      <ChatLoader.Dots />
      <ChatLoader.Dots size="lg" />
      <ChatLoader.Pulse />
      <ChatLoader.Spinner />
    </DemoSection>
    <DemoSection label="Skeleton" isColumn>
      <ChatLoader.Skeleton />
      <ChatLoader.Skeleton aria-label="Custom loading skeleton">
        <ChatLoader.SkeletonAvatar size="lg" />
        <ChatLoader.SkeletonBlock>
          <ChatLoader.SkeletonLine />
          <ChatLoader.SkeletonLine />
          <ChatLoader.SkeletonLine size="sm" />
        </ChatLoader.SkeletonBlock>
      </ChatLoader.Skeleton>
    </DemoSection>
  </>
);

const INITIAL_ATTACHMENTS = [
  { name: 'brief.pdf' },
  { name: 'screenshot.png', kind: 'image' as const, fallbackIcon: '🖼' },
  { name: 'data.csv', fallbackIcon: '📊' },
];

const ChatAttachmentDemo = () => {
  const [attachments, setAttachments] = useState(INITIAL_ATTACHMENTS);
  const handleRemove = (name: string) =>
    setAttachments((prev) => prev.filter((attachment) => attachment.name !== name));

  return (
    <DemoSection label="Usage">
      {attachments.map((attachment) => (
        <ChatAttachment
          key={attachment.name}
          name={attachment.name}
          kind={attachment.kind}
          fallbackIcon={attachment.fallbackIcon}
          onRemove={() => handleRemove(attachment.name)}
        />
      ))}
    </DemoSection>
  );
};

const ChatSourceDemo = () => {
  const [lastOpened, setLastOpened] = useState('Not opened yet');

  return (
    <DemoSection label="Usage" isColumn>
      <ChatMessage variant="assistant" avatar={<Avatar fallback="AI" />}>
        Here is an answer backed by a single web source.
        <ChatSource
          href="https://heroui.com"
          title="HeroUI Pro"
          fallback="H"
          onOpen={() => setLastOpened('HeroUI Pro')}
        />
      </ChatMessage>
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>Last opened: {lastOpened}</span>
    </DemoSection>
  );
};

type DemoToolRunStatus = Extract<ChatToolStatus, 'pending' | 'running' | 'success' | 'error'>;

const CHAT_TOOL_ARGS = `{
  "location": "San Francisco",
  "units": "fahrenheit"
}`;

const CHAT_TOOL_RESULT = `{
  "temperature": 64,
  "condition": "Sunny",
  "humidity": 0.41
}`;

const CHAT_TOOL_STATUS_LABELS: Record<DemoToolRunStatus, string> = {
  pending: 'Pending',
  running: 'Running',
  success: 'Success',
  error: 'Error',
};

const ChatToolDemo = () => {
  const [toolStatus, setToolStatus] = useState<DemoToolRunStatus>('pending');
  const [isToolExpanded, setIsToolExpanded] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [approvalResult, setApprovalResult] = useState<'pending' | 'rejected' | 'approved'>('pending');
  const lifecycleTimerRef = useRef<number | null>(null);

  const clearLifecycleTimer = useCallback(() => {
    if (lifecycleTimerRef.current !== null) {
      window.clearTimeout(lifecycleTimerRef.current);
      lifecycleTimerRef.current = null;
    }
  }, []);

  useEffect(
    () => () => {
      clearLifecycleTimer();
    },
    [clearLifecycleTimer],
  );

  const runTool = useCallback(
    (shouldFail = false) => {
      clearLifecycleTimer();
      setIsToolExpanded(true);
      setAttempt((current) => current + 1);
      setToolStatus('running');
      lifecycleTimerRef.current = window.setTimeout(() => {
        setToolStatus(shouldFail ? 'error' : 'success');
        lifecycleTimerRef.current = null;
      }, 1400);
    },
    [clearLifecycleTimer],
  );

  const handleRun = useCallback(() => {
    runTool(false);
  }, [runTool]);

  const handleFail = useCallback(() => {
    clearLifecycleTimer();
    setIsToolExpanded(true);
    setToolStatus('error');
  }, [clearLifecycleTimer]);

  const handleReset = useCallback(() => {
    clearLifecycleTimer();
    setIsToolExpanded(true);
    setAttempt(0);
    setToolStatus('pending');
  }, [clearLifecycleTimer]);

  const handleReject = useCallback(() => {
    setApprovalResult('rejected');
  }, []);
  const handleApprove = useCallback(() => {
    setApprovalResult('approved');
  }, []);

  const isApprovalResolved = approvalResult !== 'pending';
  const approvalLabel =
    approvalResult === 'approved'
      ? 'Approval needed: deleteBranch'
      : approvalResult === 'rejected'
        ? 'Approval needed: deleteBranch'
        : 'Approval needed: deleteBranch';
  const approvalStatus =
    approvalResult === 'approved' ? 'success' : approvalResult === 'rejected' ? 'error' : 'requires-action';
  const approvalText =
    approvalResult === 'approved'
      ? 'Approved — deleting the remote branch.'
      : approvalResult === 'rejected'
        ? 'Rejected — the remote branch is unchanged.'
        : 'This action cannot be undone. Delete the remote branch?';
  const toolLabel =
    toolStatus === 'running' ? (
      <TextShimmer>Running tool: getWeather</TextShimmer>
    ) : toolStatus === 'success' ? (
      'Used tool: getWeather'
    ) : toolStatus === 'error' ? (
      'Failed tool: getWeather'
    ) : (
      'Queued tool: getWeather'
    );

  return (
    <DemoSection label="Usage" isColumn>
      <ChatTool
        label={toolLabel}
        status={toolStatus}
        statusLabel={CHAT_TOOL_STATUS_LABELS[toolStatus]}
        isExpanded={isToolExpanded}
        onExpandedChange={setIsToolExpanded}
      >
        <ChatTool.Args>
          <CodeBlock>
            <CodeBlock.Header>
              <span className="text-muted text-xs uppercase">json</span>
              <CodeBlock.CopyButton code={CHAT_TOOL_ARGS} />
            </CodeBlock.Header>
            <CodeBlock.Code code={CHAT_TOOL_ARGS} language="json" />
          </CodeBlock>
        </ChatTool.Args>
        {toolStatus === 'error' ? (
          <ChatTool.Error>Request failed with 403: missing weather.read scope.</ChatTool.Error>
        ) : (
          <ChatTool.Result>
            {toolStatus === 'pending' && 'Queued, waiting to run.'}
            {toolStatus === 'running' && <TextShimmer>Fetching the latest forecast…</TextShimmer>}
            {toolStatus === 'success' && (
              <CodeBlock>
                <CodeBlock.Header>
                  <span className="text-muted text-xs uppercase">json</span>
                  <CodeBlock.CopyButton code={CHAT_TOOL_RESULT} />
                </CodeBlock.Header>
                <CodeBlock.Code code={CHAT_TOOL_RESULT} language="json" />
              </CodeBlock>
            )}
          </ChatTool.Result>
        )}
        <ChatTool.Meta>
          attempt={attempt} status={toolStatus}
        </ChatTool.Meta>
      </ChatTool>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Button size="sm" disabled={toolStatus === 'running'} onClick={handleRun}>
          {toolStatus === 'error' ? 'Retry' : toolStatus === 'pending' ? 'Run' : 'Run again'}
        </Button>
        <Button variant="ghost" size="sm" disabled={toolStatus !== 'running'} onClick={handleFail}>
          Simulate failure
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setIsToolExpanded((current) => !current)}>
          {isToolExpanded ? 'Collapse' : 'Expand'}
        </Button>
        <Button variant="ghost" size="sm" disabled={toolStatus === 'pending'} onClick={handleReset}>
          Reset
        </Button>
      </div>
      <ChatTool label={approvalLabel} status={approvalStatus} defaultExpanded>
        <ChatTool.Approval
          actions={
            <>
              <Button variant="ghost" size="sm" disabled={isApprovalResolved} onClick={handleReject}>
                Reject
              </Button>
              <Button size="sm" disabled={isApprovalResolved} onClick={handleApprove}>
                Approve
              </Button>
            </>
          }
        >
          {approvalText}
        </ChatTool.Approval>
      </ChatTool>
    </DemoSection>
  );
};

const ChainOfThoughtDemo = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpandedChange = (expanded: boolean) => {
    setIsExpanded(expanded);
  };

  return (
    <DemoSection label="Usage" isColumn>
      <ChainOfThought>
        <ChainOfThought.Trigger>Thought for 4 seconds</ChainOfThought.Trigger>
        <ChainOfThought.Content>
          <ChainOfThought.Steps>
            <ChainOfThought.Step label="Analyze">
              Breaking the request into presentation-only Pro components.
            </ChainOfThought.Step>
            <ChainOfThought.Step label="Plan">
              Composing the layout with compound components.
            </ChainOfThought.Step>
            <ChainOfThought.Step label="Respond">
              Returning the answer while the SDK owns the message array.
            </ChainOfThought.Step>
          </ChainOfThought.Steps>
        </ChainOfThought.Content>
      </ChainOfThought>
      <ChainOfThought isExpanded={isExpanded} onExpandedChange={handleExpandedChange}>
        <ChainOfThought.Trigger>
          {isExpanded ? 'Hide reasoning' : 'Show reasoning'}
        </ChainOfThought.Trigger>
        <ChainOfThought.Content>
          <ChainOfThought.Steps>
            <ChainOfThought.Step>Steps without a label render body content only.</ChainOfThought.Step>
            <ChainOfThought.Step label="Controlled">
              Expansion is driven by external state.
            </ChainOfThought.Step>
          </ChainOfThought.Steps>
        </ChainOfThought.Content>
      </ChainOfThought>
      <ChainOfThought isStreaming defaultExpanded>
        <ChainOfThought.Trigger>Thinking…</ChainOfThought.Trigger>
        <ChainOfThought.Content>
          <ChainOfThought.Steps>
            <ChainOfThought.Step label="Analyze">
              Breaking the request into presentation-only Pro components.
            </ChainOfThought.Step>
          </ChainOfThought.Steps>
        </ChainOfThought.Content>
      </ChainOfThought>
    </DemoSection>
  );
};

type DemoQueuedPrompt = { id: number; text: string };

const INITIAL_QUEUED_PROMPTS: DemoQueuedPrompt[] = [
  { id: 1, text: 'Review the attached mockups before implementing the landing page updates.' },
  { id: 2, text: 'Add dark mode support to the settings page.' },
  { id: 3, text: 'Refactor the queue item layout to match Codex.' },
];

const QUEUE_MORE_ACTION_LABELS: Record<string, string> = {
  duplicate: 'Prompt duplicated',
  prioritize: 'Prompt prioritized',
};

const MESSAGE_MORE_ACTION_LABELS: Record<string, string> = {
  copyLink: 'Link copied',
  forward: 'Forwarded',
  review: 'Marked for review',
};

const QueueItemMoreMenu = ({
  prompt,
  onAction,
}: {
  prompt: DemoQueuedPrompt;
  onAction: (message: string) => void;
}) => (
  <Dropdown>
    <Dropdown.Trigger>
      <PromptInput.Queue.Item.More />
    </Dropdown.Trigger>
    <Dropdown.Popover placement="bottom end">
      <Dropdown.Menu
        aria-label={`${prompt.text} actions`}
        onAction={(key) => onAction(QUEUE_MORE_ACTION_LABELS[String(key)] ?? 'Queue action done')}
      >
        <MenuItem id="duplicate">Duplicate prompt</MenuItem>
        <MenuItem id="prioritize">Prioritize</MenuItem>
      </Dropdown.Menu>
    </Dropdown.Popover>
  </Dropdown>
);

const MessageMoreActionsMenu = ({
  children,
  onAction,
}: {
  children?: ReactNode;
  onAction: (message: string) => void;
}) => (
  <Dropdown>
    <Dropdown.Trigger>
      <ChatMessageActions.Menu>{children}</ChatMessageActions.Menu>
    </Dropdown.Trigger>
    <Dropdown.Popover placement="bottom end">
      <Dropdown.Menu
        aria-label="More message actions"
        onAction={(key) => onAction(MESSAGE_MORE_ACTION_LABELS[String(key)] ?? 'Action done')}
      >
        <MenuItem id="copyLink">Copy link</MenuItem>
        <MenuItem id="forward">Forward</MenuItem>
        <MenuItem id="review">Mark for review</MenuItem>
      </Dropdown.Menu>
    </Dropdown.Popover>
  </Dropdown>
);

type DemoQueueRowProps = {
  prompt: DemoQueuedPrompt;
  onMore: (message: string) => void;
  onRemove: (id: number) => void;
};

const DemoQueueRow = ({ prompt, onMore, onRemove }: DemoQueueRowProps) => {
  const handleRemove = useCallback(() => {
    onRemove(prompt.id);
  }, [onRemove, prompt.id]);

  return (
    <PromptInput.Queue.Item value={prompt}>
      <PromptInput.Queue.Item.Handle />
      <PromptInput.Queue.Item.Body>
        <PromptInput.Queue.Item.Icon />
        <PromptInput.Queue.Item.Content>{prompt.text}</PromptInput.Queue.Item.Content>
      </PromptInput.Queue.Item.Body>
      <PromptInput.Queue.Item.Actions>
        <PromptInput.Queue.Item.Remove onPress={handleRemove} />
        <QueueItemMoreMenu prompt={prompt} onAction={onMore} />
      </PromptInput.Queue.Item.Actions>
    </PromptInput.Queue.Item>
  );
};

type DemoAttachmentProps = {
  name: string;
  onRemove: (name: string) => void;
};

const DemoAttachment = ({ name, onRemove }: DemoAttachmentProps) => {
  const handleRemove = useCallback(() => {
    onRemove(name);
  }, [onRemove, name]);

  return <ChatAttachment name={name} onRemove={handleRemove} />;
};

const PromptInputDemo = () => {
  const [value, setValue] = useState('');
  const [inlineValue, setInlineValue] = useState('');
  const [status, setStatus] = useState<PromptInputStatus>('ready');
  const [lastSent, setLastSent] = useState('Nothing sent yet');
  const [inlineLastSent, setInlineLastSent] = useState('No inline prompt sent yet');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [inlineAttachments, setInlineAttachments] = useState<string[]>([]);
  const [queuedPrompts, setQueuedPrompts] = useState<DemoQueuedPrompt[]>(INITIAL_QUEUED_PROMPTS);
  const [queueAction, setQueueAction] = useState('No queue action yet');
  const timersRef = useRef<number[]>([]);
  const attachmentSeqRef = useRef(0);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const handleValueChange = useCallback((next: string) => {
    setValue(next);
  }, []);

  // 模拟一次运行：submitted（约 0.8s）→ streaming（点停止或约 4s 后回 ready）
  const handleSubmit = useCallback((submittedValue: string) => {
    clearTimers();
    setLastSent(submittedValue);
    setValue('');
    setAttachments([]);
    setStatus('submitted');
    timersRef.current.push(
      window.setTimeout(() => {
        setStatus('streaming');
      }, 800),
    );
    timersRef.current.push(
      window.setTimeout(() => {
        setStatus('ready');
      }, 4800),
    );
  }, [clearTimers]);

  const handleStop = useCallback(() => {
    clearTimers();
    setStatus('ready');
  }, [clearTimers]);

  const handleAttach = useCallback(() => {
    attachmentSeqRef.current += 1;
    setAttachments((prev) => [...prev, `reference-${attachmentSeqRef.current}.pdf`]);
  }, []);

  // 文件拖入 shell 时入队附件（取拖放文件名，去重后追加）
  const handleFilesDrop = useCallback((files: File[]) => {
    setAttachments((prev) => {
      const names = files.map((file) => file.name);
      const merged = [...prev];
      names.forEach((name) => {
        if (!merged.includes(name)) {
          merged.push(name);
        }
      });
      return merged;
    });
  }, []);

  const handleInlineAttach = useCallback(() => {
    attachmentSeqRef.current += 1;
    setInlineAttachments((prev) => [...prev, `inline-reference-${attachmentSeqRef.current}.pdf`]);
  }, []);

  const handleRemoveAttachment = useCallback((name: string) => {
    setAttachments((prev) => prev.filter((item) => item !== name));
  }, []);

  const handleRemoveInlineAttachment = useCallback((name: string) => {
    setInlineAttachments((prev) => prev.filter((item) => item !== name));
  }, []);

  const handleInlineSubmit = useCallback((submittedValue: string) => {
    setInlineLastSent(`Inline sent: ${submittedValue}`);
    setInlineValue('');
    setInlineAttachments([]);
  }, []);

  const handleReorderQueue = useCallback((next: DemoQueuedPrompt[]) => {
    setQueuedPrompts(next);
    setQueueAction('Queue reordered');
  }, []);

  const handleRemoveQueued = useCallback((id: number) => {
    setQueuedPrompts((prev) => prev.filter((prompt) => prompt.id !== id));
    setQueueAction('Queue item removed');
  }, []);

  return (
    <DemoSection label="Usage" isColumn>
      <PromptInput
        value={value}
        onValueChange={handleValueChange}
        onSubmit={handleSubmit}
        onStop={handleStop}
        onFilesDrop={handleFilesDrop}
        status={status}
      >
        {queuedPrompts.length > 0 && (
          <PromptInput.Queue>
            <PromptInput.Queue.List values={queuedPrompts} onReorder={handleReorderQueue}>
              {queuedPrompts.map((prompt) => (
                <DemoQueueRow
                  key={prompt.id}
                  prompt={prompt}
                  onMore={setQueueAction}
                  onRemove={handleRemoveQueued}
                />
              ))}
            </PromptInput.Queue.List>
          </PromptInput.Queue>
        )}
        <PromptInput.Shell>
          <PromptInput.Content>
            {attachments.length > 0 && (
              <PromptInput.Attachments>
                {attachments.map((name) => (
                  <DemoAttachment key={name} name={name} onRemove={handleRemoveAttachment} />
                ))}
              </PromptInput.Attachments>
            )}
            <PromptInput.TextArea placeholder="What do you want to know?" />
          </PromptInput.Content>
          <PromptInput.Toolbar>
            <PromptInput.ToolbarStart>
              <PromptInput.Action aria-label="Add attachment" tooltip="Add attachment" onPress={handleAttach}>
                ＋
              </PromptInput.Action>
            </PromptInput.ToolbarStart>
            <PromptInput.ToolbarEnd>
              <PromptInput.Send />
            </PromptInput.ToolbarEnd>
          </PromptInput.Toolbar>
        </PromptInput.Shell>
        <PromptInput.Footer>AI can make mistakes. Check important info.</PromptInput.Footer>
      </PromptInput>
      <p>
        Last sent: {lastSent} (status: {status})
      </p>
      <p>Queue action: {queueAction}</p>
      <PromptInput
        value={inlineValue}
        variant="inline"
        onSubmit={handleInlineSubmit}
        onValueChange={setInlineValue}
      >
        <PromptInput.Shell>
          <PromptInput.Content>
            {inlineAttachments.length > 0 && (
              <PromptInput.Attachments>
                {inlineAttachments.map((name) => (
                  <DemoAttachment key={name} name={name} onRemove={handleRemoveInlineAttachment} />
                ))}
              </PromptInput.Attachments>
            )}
            <PromptInput.TextArea placeholder="Send a follow-up" />
          </PromptInput.Content>
          <PromptInput.Toolbar>
            <PromptInput.ToolbarStart>
              <PromptInput.Action aria-label="Add attachment" onPress={handleInlineAttach}>
                ＋
              </PromptInput.Action>
            </PromptInput.ToolbarStart>
            <PromptInput.ToolbarEnd>
              <PromptInput.Send />
            </PromptInput.ToolbarEnd>
          </PromptInput.Toolbar>
        </PromptInput.Shell>
      </PromptInput>
      <p>{inlineLastSent}</p>
      <PromptInput variant="secondary" size="sm" isDisabled>
        <PromptInput.Shell>
          <PromptInput.Content>
            <PromptInput.TextArea placeholder="Disabled" aria-label="Disabled prompt input" />
          </PromptInput.Content>
          <PromptInput.Toolbar>
            <PromptInput.ToolbarEnd>
              <PromptInput.Send />
            </PromptInput.ToolbarEnd>
          </PromptInput.Toolbar>
        </PromptInput.Shell>
      </PromptInput>
    </DemoSection>
  );
};

const PROMPT_SUGGESTION_USAGE_ITEMS = [
  'Draft a weekly project update email for my team',
  'Summarize this meeting transcript into action items',
  'Help me plan a product launch checklist',
  'Write a friendly reply to a customer support ticket',
  'Brainstorm names for a developer tools startup',
  'Explain this error message in plain language',
];

const PromptSuggestionDemo = () => {
  const [selectedSuggestion, setSelectedSuggestion] = useState('Nothing selected');

  return (
    <DemoSection isColumn>
      <PromptSuggestion
        title="What do you want to work on?"
        description="Ask a question or start from one of the suggestions below."
      >
        <PromptSuggestion.Items variant="card">
          {PROMPT_SUGGESTION_USAGE_ITEMS.map((suggestion) => (
            <PromptSuggestion.CardItem
              key={suggestion}
              aria-pressed={selectedSuggestion === suggestion}
              onClick={() => setSelectedSuggestion(suggestion)}
            >
              {suggestion}
            </PromptSuggestion.CardItem>
          ))}
        </PromptSuggestion.Items>
      </PromptSuggestion>
    </DemoSection>
  );
};

const TextShimmerVariantDemo = ({ variant = 'default' }: { variant?: 'default' | 'color' }) => {
  if (variant === 'color') {
    return (
      <DemoSection label="Color" isColumn>
        <TextShimmer className="text-muted">Thinking…</TextShimmer>
      </DemoSection>
    );
  }

  return (
    <DemoSection label="Usage" isColumn>
      <TextShimmer>Thinking…</TextShimmer>
      <TextShimmer>Generating response…</TextShimmer>
    </DemoSection>
  );
};

const CODE_SAMPLE = `function greet(name: string) {
  return \`Hello, \${name}!\`;
}

console.log(greet("HeroUI"));`;

const CodeBlockDemo = () => (
  <DemoSection label="Usage" isColumn>
    <CodeBlock>
      <CodeBlock.Header>
        <span className="text-muted text-xs uppercase">typescript</span>
        <CodeBlock.CopyButton code={CODE_SAMPLE} />
      </CodeBlock.Header>
      <CodeBlock.Code code={CODE_SAMPLE} language="typescript" />
    </CodeBlock>
  </DemoSection>
);

const ModalDemo = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);
  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <DemoSection label="受控对话框">
      <Button onClick={handleOpen}>打开 Modal</Button>
      <Modal isOpen={isOpen} onClose={handleClose} size="sm">
        <Modal.Header>
          <Modal.Heading>确认提交</Modal.Heading>
        </Modal.Header>
        <Modal.Body>提交后将通知相关老师，确定继续吗？</Modal.Body>
        <Modal.Footer>
          <Button variant="ghost" onClick={handleClose}>
            取消
          </Button>
          <Button onClick={handleClose}>确定</Button>
        </Modal.Footer>
      </Modal>
    </DemoSection>
  );
};

const DrawerDemo = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);
  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <DemoSection label="右侧抽屉">
      <Button onClick={handleOpen}>打开 Drawer</Button>
      <Drawer isOpen={isOpen} onClose={handleClose} placement="right">
        <Drawer.Header>
          <Drawer.Heading>学员详情</Drawer.Heading>
        </Drawer.Header>
        <Drawer.Body>这里展示学员的学习进度、辅导记录与备注信息。</Drawer.Body>
        <Drawer.Footer>
          <Button variant="ghost" onClick={handleClose}>
            关闭
          </Button>
        </Drawer.Footer>
      </Drawer>
    </DemoSection>
  );
};

const PopoverDemo = () => (
  <DemoSection label="受控气泡卡片（按钮触发 / 外部点击关闭 / 焦点管理）" isColumn>
    <Popover>
      <Popover.Trigger>
        <Button variant="outline">查看说明</Button>
      </Popover.Trigger>
      <Popover.Content placement="bottom">
        <Popover.Dialog>
          <Popover.Heading>排班规则</Popover.Heading>
          <p>每位老师每天最多安排 8 节辅导课，跨时段需间隔 15 分钟。</p>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  </DemoSection>
);

const DROPDOWN_ACTION_LABELS: Record<string, string> = {
  edit: '编辑学员信息',
  export: '导出记录',
  delete: '删除学员',
};

const DropdownDemo = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [lastAction, setLastAction] = useState('尚未选择');

  const handleAction = useCallback((key: DemoKey) => {
    setLastAction(DROPDOWN_ACTION_LABELS[String(key)] ?? String(key));
  }, []);

  return (
    <DemoSection label="受控下拉菜单（按钮触发 / 键盘导航 / 选中回调）" isColumn>
      <Dropdown isOpen={isOpen} onOpenChange={setIsOpen}>
        <Dropdown.Trigger>操作菜单 ▾</Dropdown.Trigger>
        <Dropdown.Popover placement="bottom">
          <Dropdown.Menu aria-label="操作菜单" onAction={handleAction}>
            <MenuItem id="edit" textValue="编辑学员信息">
              <MenuItem.Label>编辑学员信息</MenuItem.Label>
            </MenuItem>
            <MenuItem id="export" textValue="导出记录">
              <MenuItem.Label>导出记录</MenuItem.Label>
              <MenuItem.Description>导出为 Excel 文件</MenuItem.Description>
            </MenuItem>
            <MenuItem id="archive" isDisabled textValue="归档（无权限）">
              <MenuItem.Label>归档（无权限）</MenuItem.Label>
            </MenuItem>
            <MenuItem id="delete" variant="danger" textValue="删除学员">
              <MenuItem.Label>删除学员</MenuItem.Label>
            </MenuItem>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>最近选择：{lastAction}</span>
    </DemoSection>
  );
};

const SheetDemo = () => (
  <>
    <DemoSection label="Usage">
      <Sheet placement="bottom">
        <Sheet.Trigger variant="secondary">Open Sheet</Sheet.Trigger>
        <Sheet.Backdrop>
          <Sheet.Content>
            <Sheet.Dialog>
              <Sheet.Handle />
              <Sheet.Header>
                <Sheet.Heading>Filters</Sheet.Heading>
              </Sheet.Header>
              <Sheet.Body>Choose a category, date range, and owner.</Sheet.Body>
              <Sheet.Footer>
                <Sheet.Close variant="ghost">Reset</Sheet.Close>
                <Sheet.Close>Apply</Sheet.Close>
              </Sheet.Footer>
              <Sheet.CloseTrigger aria-label="Close" />
            </Sheet.Dialog>
          </Sheet.Content>
        </Sheet.Backdrop>
      </Sheet>
    </DemoSection>
    <DemoSection label="Nested">
      <Sheet placement="bottom">
        <Sheet.Trigger variant="outline">Open parent Sheet</Sheet.Trigger>
        <Sheet.Backdrop variant="blur">
          <Sheet.Content>
            <Sheet.Dialog>
              <Sheet.Header>
                <Sheet.Heading>Parent panel</Sheet.Heading>
              </Sheet.Header>
              <Sheet.Body>
                <p>Open a nested panel from inside the parent.</p>
                <Sheet.NestedRoot placement="right">
                  <Sheet.Trigger size="sm">Open nested Sheet</Sheet.Trigger>
                  <Sheet.Backdrop>
                    <Sheet.Content>
                      <Sheet.Dialog>
                        <Sheet.Header>
                          <Sheet.Heading>Nested panel</Sheet.Heading>
                        </Sheet.Header>
                        <Sheet.Body>This nested panel slides in from the right.</Sheet.Body>
                        <Sheet.Footer>
                          <Sheet.Close size="sm">Done</Sheet.Close>
                        </Sheet.Footer>
                        <Sheet.CloseTrigger aria-label="Close nested panel" />
                      </Sheet.Dialog>
                    </Sheet.Content>
                  </Sheet.Backdrop>
                </Sheet.NestedRoot>
              </Sheet.Body>
              <Sheet.CloseTrigger aria-label="Close parent panel" />
            </Sheet.Dialog>
          </Sheet.Content>
        </Sheet.Backdrop>
      </Sheet>
    </DemoSection>
  </>
);

const EMOJI_RECENT = ['😀', '👍', '🎉', '🔥'];

const EmojiPickerDemo = () => {
  const [picked, setPicked] = useState('None selected');

  const handleEmojiSelect = useCallback((emoji: string) => {
    setPicked(emoji);
  }, []);

  return (
    <DemoSection label="Usage" isColumn>
      <div className="flex items-center gap-4">
        <EmojiPicker defaultValue="😀" recentEmojis={EMOJI_RECENT} onEmojiSelect={handleEmojiSelect} />
        <span>Last selected: {picked}</span>
      </div>
      <EmojiPicker isInline size="lg" onEmojiSelect={handleEmojiSelect} />
    </DemoSection>
  );
};

const AlertDialogDemo = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [lastResult, setLastResult] = useState('尚未操作');

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);
  const handleCancel = useCallback(() => {
    setLastResult('已取消');
    setIsOpen(false);
  }, []);
  const handleConfirm = useCallback(() => {
    setLastResult('已确认删除');
    setIsOpen(false);
  }, []);

  return (
    <DemoSection label="危险操作确认（trigger 打开 / Esc 与遮罩关闭 / 焦点圈定）" isColumn>
      <AlertDialog isOpen={isOpen} onOpenChange={handleOpenChange}>
        <AlertDialog.Trigger>
          <Button variant="danger">删除记录</Button>
        </AlertDialog.Trigger>
        <AlertDialog.Backdrop isDismissable isKeyboardDismissDisabled={false}>
          <AlertDialog.Container size="xs">
            <AlertDialog.Dialog>
              <AlertDialog.Header>
                <AlertDialog.Icon status="danger" />
                <AlertDialog.Heading>确认删除该辅导记录？</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>删除后无法恢复，相关统计数据也会同步更新。</AlertDialog.Body>
              <AlertDialog.Footer>
                <Button variant="ghost" onClick={handleCancel}>
                  取消
                </Button>
                <Button variant="danger" onClick={handleConfirm}>
                  删除
                </Button>
              </AlertDialog.Footer>
              <AlertDialog.CloseTrigger aria-label="关闭" />
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
      <p>最近一次操作：{lastResult}</p>
    </DemoSection>
  );
};

const SORT_LABELS: Record<string, string> = {
  created: '按创建时间排序',
  updated: '按更新时间排序',
  name: '按学员姓名排序',
};

const STUDENT_ACTION_LABELS: Record<string, string> = {
  edit: '编辑学员信息',
  export: '导出记录',
  delete: '删除学员',
};

const MenuItemDemo = () => {
  const [sortKeys, setSortKeys] = useState<DemoSelection>(new Set(['created']));
  const [lastAction, setLastAction] = useState('尚未操作');

  const handleSortChange = useCallback((keys: DemoSelection) => {
    setSortKeys(keys);
  }, []);
  const handleStudentAction = useCallback((key: DemoKey) => {
    setLastAction(STUDENT_ACTION_LABELS[String(key)] ?? String(key));
  }, []);

  const sortKey = sortKeys === 'all' ? undefined : Array.from(sortKeys)[0];
  const sortLabel = (sortKey !== undefined && SORT_LABELS[String(sortKey)]) || '未选择';

  return (
    <DemoSection label="真实下拉菜单（按钮触发 / 键盘导航 / 选中回调）" isColumn>
      <Dropdown>
        <Dropdown.Trigger>排序方式：{sortLabel}</Dropdown.Trigger>
        <Dropdown.Popover placement="bottom start">
          <Dropdown.Menu
            aria-label="排序方式"
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={sortKeys}
            onSelectionChange={handleSortChange}
          >
            <MenuItem id="created" textValue="按创建时间排序">
              <MenuItem.Indicator />
              <MenuItem.Label>按创建时间排序</MenuItem.Label>
            </MenuItem>
            <MenuItem id="updated" textValue="按更新时间排序">
              <MenuItem.Indicator />
              <MenuItem.Label>按更新时间排序</MenuItem.Label>
            </MenuItem>
            <MenuItem id="name" textValue="按学员姓名排序">
              <MenuItem.Indicator />
              <MenuItem.Label>按学员姓名排序</MenuItem.Label>
            </MenuItem>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
      <Dropdown>
        <Dropdown.Trigger>学员操作</Dropdown.Trigger>
        <Dropdown.Popover placement="bottom start">
          <Dropdown.Menu aria-label="学员操作" onAction={handleStudentAction}>
            <MenuItem id="edit" textValue="编辑学员信息">
              <MenuItem.Label>编辑学员信息</MenuItem.Label>
            </MenuItem>
            <MenuItem id="export" textValue="导出记录">
              <MenuItem.Label>导出记录</MenuItem.Label>
              <MenuItem.Description>导出为 Excel 文件</MenuItem.Description>
            </MenuItem>
            <MenuItem id="archive" isDisabled textValue="归档（无权限）">
              <MenuItem.Label>归档（无权限）</MenuItem.Label>
            </MenuItem>
            <MenuItem id="delete" variant="danger" textValue="删除学员">
              <MenuItem.Label>删除学员</MenuItem.Label>
            </MenuItem>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
      <p>最近操作：{lastAction}</p>
    </DemoSection>
  );
};

const CHAT_ANSWER = 'Assistant responses can expose quick actions beneath the message body.';

const ChatMessageActionsDemo = () => {
  const [rating, setRating] = useState<'up' | 'down' | null>(null);
  const [regenerateCount, setRegenerateCount] = useState(0);
  const [lastAction, setLastAction] = useState('尚未操作');

  const handleThumbsUp = (isSelected: boolean) => {
    setRating(isSelected ? 'up' : null);
    setLastAction(isSelected ? 'Liked' : 'Like removed');
  };
  const handleThumbsDown = (isSelected: boolean) => {
    setRating(isSelected ? 'down' : null);
    setLastAction(isSelected ? 'Disliked' : 'Dislike removed');
  };
  const handleRegenerate = () => {
    setRegenerateCount((count) => count + 1);
    setLastAction('Regenerated');
  };
  return (
    <DemoSection label="Usage" isColumn>
      <ChatMessage.Assistant>
        <ChatMessage.Avatar fallback="AI" show />
        <ChatMessage.Body>
          <ChatMessage.Content>{CHAT_ANSWER}</ChatMessage.Content>
          <ChatMessage.Actions>
            <ChatMessageActions>
              <ChatMessageActions.Copy content={CHAT_ANSWER} />
              <ChatMessageActions.ThumbsUp isSelected={rating === 'up'} onChange={handleThumbsUp} />
              <ChatMessageActions.ThumbsDown
                isSelected={rating === 'down'}
                onChange={handleThumbsDown}
              />
              <ChatMessageActions.Regenerate onPress={handleRegenerate} />
              <MessageMoreActionsMenu onAction={setLastAction} />
            </ChatMessageActions>
          </ChatMessage.Actions>
        </ChatMessage.Body>
      </ChatMessage.Assistant>
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>
        Rating: {rating === 'up' ? 'liked' : rating === 'down' ? 'disliked' : 'none'}; regenerated:{' '}
        {regenerateCount}; last action: {lastAction}
      </span>
    </DemoSection>
  );
};

const CHAT_LIST = [
  {
    id: '1',
    title: 'Product launch planning',
    preview: 'Can you help me draft a launch checklist?',
    meta: '2h ago',
  },
  {
    id: '2',
    title: 'Customer feedback review',
    preview: 'Summarize the customer feedback from last week.',
    meta: 'Yesterday',
  },
  {
    id: '3',
    title: 'Copy editing help',
    preview: 'Rewrite this paragraph to sound more concise.',
    meta: 'Mon',
  },
];

const ChatListViewDemo = () => {
  const [selectedKeys, setSelectedKeys] = useState<DemoSelection>(new Set(['1']));

  const handleSelectionChange = (keys: DemoSelection) => setSelectedKeys(keys);
  const current = selectedKeys === 'all' ? 'all' : [...selectedKeys][0];

  return (
    <DemoSection label="Usage" isColumn>
      <div style={{ width: 420 }}>
        <ChatListView
          aria-label="Recent conversations"
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={selectedKeys}
          items={CHAT_LIST}
          onSelectionChange={handleSelectionChange}
        >
          {(chat) => (
            <ChatListView.Item
              id={chat.id}
              textValue={chat.title}
              aria-label={`${chat.title} ${chat.preview}`}
            >
              <ChatListView.ItemContent>
                <ChatListView.Icon />
                <ChatListView.Text>
                  <ChatListView.Title>{chat.title}</ChatListView.Title>
                  <ChatListView.Preview>{chat.preview}</ChatListView.Preview>
                </ChatListView.Text>
                <ChatListView.Meta>{chat.meta}</ChatListView.Meta>
              </ChatListView.ItemContent>
            </ChatListView.Item>
          )}
        </ChatListView>
      </div>
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>Selected: {String(current)}</span>
    </DemoSection>
  );
};

type FullChatToolStatus = Extract<
  ChatToolStatus,
  'pending' | 'running' | 'success' | 'error' | 'requires-action'
>;

type FullChatRun = {
  phase: PromptInputStatus;
  thoughtStepCount: number;
  markdown: string;
  searchStatus: FullChatToolStatus;
  approvalStatus: FullChatToolStatus;
  auditStatus: FullChatToolStatus;
  isApprovalVisible: boolean;
  isAuditVisible: boolean;
};

type ConversationTurn = {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  run?: FullChatRun;
};

const INITIAL_CONVERSATION_TURNS: ConversationTurn[] = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
  text:
    i % 2 === 0
      ? `Question ${i / 2 + 1}: how does the chat viewport auto-scroll?`
      : 'Stick-to-bottom keeps the viewport pinned to the latest message while you stream. Once you scroll away from the bottom, new content arrives without snapping you back.',
}));

const NEW_TURN_TEXTS = [
  'What happens when the assistant is doing multiple steps?',
  'You can combine the conversation viewport with reasoning and tool UI so the whole exchange stays in one scrollable surface.',
];

const ChatConversationDemo = () => {
  const [turns, setTurns] = useState<ConversationTurn[]>(INITIAL_CONVERSATION_TURNS);

  const handleSendTurn = useCallback(() => {
    setTurns((prev) => {
      const role: 'user' | 'assistant' = prev.length % 2 === 0 ? 'user' : 'assistant';
      const text = NEW_TURN_TEXTS[role === 'user' ? 0 : 1];
      return [...prev, { id: prev.length, role, text }];
    });
  }, []);

  return (
    <DemoSection label="Usage" isColumn>
      <Button variant="secondary" size="sm" onClick={handleSendTurn}>
        Send new message
      </Button>
      <div style={{ display: 'flex', flexDirection: 'column', height: 360, width: 560, overflow: 'hidden', border: '1px solid var(--separator)', borderRadius: 12 }}>
        <ChatConversation style={{ flex: 1 }}>
          <ChatConversation.Content style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
            <ChatConversation.Messages style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {turns.map((turn) => (
                <ChatConversation.Message key={turn.id}>
                  <ChatMessage variant={turn.role}>{turn.text}</ChatMessage>
                </ChatConversation.Message>
              ))}
            </ChatConversation.Messages>
            <ChatConversation.ScrollButton />
            <ChatConversation.ScrollAnchor />
          </ChatConversation.Content>
        </ChatConversation>
      </div>
    </DemoSection>
  );
};

const MARKDOWN_SAMPLE = `## HeroUI Pro AI Markdown

This component uses **react-markdown** with block-level memoization for streaming performance.

### Features

- Headings, lists, and links
- Inline \`code\` snippets
- Fenced code blocks with Shiki highlighting

\`\`\`tsx
<ChatMessage.Assistant>
  <ChatMessage.Avatar alt="Assistant" fallback="AI" show />
  <ChatMessage.Body>
    <ChatMessage.Content>
      <Markdown>{response}</Markdown>
    </ChatMessage.Content>
  </ChatMessage.Body>
</ChatMessage.Assistant>
\`\`\`

AI responses can include rich formatting without coupling to any SDK.`;

const MARKDOWN_DEFAULT_TOKENS = [MARKDOWN_SAMPLE] as const;

const MARKDOWN_STREAMING_TOKENS = [
  '## Streaming demo\n\n',
  'Each token update only re-renders changed markdown blocks.\n\n',
  '1. First item\n',
  '2. Second item\n',
  '3. Third item\n',
] as const;

const MARKDOWN_STREAMDOWN_TOKENS = [
  '## Streamdown demo\n\n',
  'Streamdown repairs incomplete markdown while a response streams, so partially typed blocks stay readable.\n\n',
  '- Headings, lists, and links\n',
  '- Inline `code` snippets\n',
  '- Fenced code blocks with Shiki highlighting\n',
] as const;

const MARKDOWN_TOKEN_INTERVAL = 420;

const useMarkdownTokenStream = (tokens: readonly string[]) => {
  const [runId, setRunId] = useState(0);
  const [text, setText] = useState(tokens[0] ?? '');
  const [isStreaming, setIsStreaming] = useState(tokens.length > 1);

  useEffect(() => {
    let tokenIndex = 1;
    let timerId: number | null = null;

    setText(tokens[0] ?? '');
    setIsStreaming(tokens.length > 1);

    if (tokens.length > 1) {
      timerId = window.setInterval(() => {
        setText((current) => current + tokens[tokenIndex]);
        tokenIndex += 1;

        if (tokenIndex >= tokens.length) {
          setIsStreaming(false);

          if (timerId !== null) {
            window.clearInterval(timerId);
            timerId = null;
          }
        }
      }, MARKDOWN_TOKEN_INTERVAL);
    }

    return () => {
      if (timerId !== null) {
        window.clearInterval(timerId);
      }
    };
  }, [tokens, runId]);

  const replay = useCallback(() => {
    setRunId((current) => current + 1);
  }, []);

  return { isStreaming, replay, text };
};

const MarkdownDemo = () => (
  <DemoSection label="Usage" isColumn>
    <div style={{ width: 600 }}>
      <Markdown>{MARKDOWN_SAMPLE}</Markdown>
    </div>
  </DemoSection>
);

type ChainOfThoughtVariant = 'agent-trace' | 'agent-trace-streaming' | 'default' | 'streaming';

const ChainOfThoughtVariantDemo = ({ variant }: { variant: ChainOfThoughtVariant }) => {
  const isTrace = variant === 'agent-trace' || variant === 'agent-trace-streaming';
  const isStreaming = variant === 'streaming' || variant === 'agent-trace-streaming';

  if (isTrace) {
    return (
      <DemoSection label={`chain-of-thought-${variant}`} isColumn>
        <ChainOfThought defaultExpanded isStreaming={isStreaming}>
          <ChainOfThought.Trigger>{isStreaming ? 'Thinking…' : 'Thought for 2s'}</ChainOfThought.Trigger>
          <ChainOfThought.Content>
            <ChainOfThought.Steps>
              <ChainOfThought.Step>
                The user wants a simple login page. This is a straightforward UI task - I should create
                a clean login form. Let me generate some design inspiration first to ensure it looks
                good, then build the page.
              </ChainOfThought.Step>
              <ChainOfThought.Step label="Explore · 2 Files">
                Read app/layout.tsx and app/globals.css.
              </ChainOfThought.Step>
              <ChainOfThought.Step label="Found UI components">
                {isStreaming ? (
                  <TextShimmer>Scanning 56 files…</TextShimmer>
                ) : (
                  'Now let me check the existing UI components available: Scanning 56 files.'
                )}
              </ChainOfThought.Step>
            </ChainOfThought.Steps>
          </ChainOfThought.Content>
        </ChainOfThought>
      </DemoSection>
    );
  }

  return (
    <DemoSection label={`chain-of-thought-${variant}`} isColumn>
      <ChainOfThought defaultExpanded={isStreaming} isStreaming={isStreaming}>
        <ChainOfThought.Trigger>{isStreaming ? 'Thinking…' : 'Thought for 4 seconds'}</ChainOfThought.Trigger>
        <ChainOfThought.Content>
          <ChainOfThought.Steps>
            <ChainOfThought.Step label="Analyze">
              Breaking the request into presentation-only Pro components.
            </ChainOfThought.Step>
            {!isStreaming && (
              <>
                <ChainOfThought.Step label="Plan">
                  Composing the layout with compound components.
                </ChainOfThought.Step>
                <ChainOfThought.Step label="Respond">
                  Returning the answer while the SDK owns the message array.
                </ChainOfThought.Step>
              </>
            )}
          </ChainOfThought.Steps>
        </ChainOfThought.Content>
      </ChainOfThought>
    </DemoSection>
  );
};

type ChatAttachmentVariant = 'composer' | 'default' | 'grouped';

const ChatAttachmentVariantDemo = ({ variant }: { variant: ChatAttachmentVariant }) => {
  const [attachments, setAttachments] = useState([
    { name: 'brief.pdf', kind: 'file' as const, fallbackIcon: 'PDF' },
    { name: 'screenshot.png', kind: 'image' as const, fallbackIcon: 'IMG' },
    { name: 'screenshot-2.png', kind: 'image' as const, fallbackIcon: 'IMG' },
  ]);
  const [draftAttachments, setDraftAttachments] = useState(['notes.docx']);
  const [composerStatus, setComposerStatus] = useState('No attachment sent yet');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const removeAttachment = useCallback((name: string) => {
    setAttachments((prev) => prev.filter((attachment) => attachment.name !== name));
  }, []);
  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  const addPickedFiles = useCallback((files: File[]) => {
    setDraftAttachments((prev) => [
      ...prev,
      ...files.map((file) => file.name).filter((name) => !prev.includes(name)),
    ]);
  }, []);
  const removeDraftAttachment = useCallback((name: string) => {
    setDraftAttachments((prev) => prev.filter((item) => item !== name));
  }, []);
  const submitComposer = useCallback((submitted: string) => {
    setComposerStatus(`Sent: ${submitted.slice(0, 24)} · ${draftAttachments.length} attachments`);
  }, [draftAttachments.length]);

  if (variant === 'composer') {
    return (
      <DemoSection label="chat-attachment-composer" isColumn>
        <PromptInput onSubmit={submitComposer}>
          <PromptInput.Shell>
            <PromptInput.Content>
              <PromptInput.Attachments>
                {draftAttachments.map((name) => (
                  <DemoAttachment key={name} name={name} onRemove={removeDraftAttachment} />
                ))}
              </PromptInput.Attachments>
              <PromptInput.TextArea aria-label="Composer with attachments" placeholder="Ask about your files…" />
            </PromptInput.Content>
            <ChatAttachment.Input
              ref={fileInputRef}
              accept=".pdf,.doc,.docx,image/*"
              onSelect={addPickedFiles}
            />
            <PromptInput.Toolbar>
              <PromptInput.ToolbarStart>
                <PromptInput.Action aria-label="Add attachment" tooltip="Add attachment" onPress={openFilePicker}>
                  ＋
                </PromptInput.Action>
              </PromptInput.ToolbarStart>
              <PromptInput.ToolbarEnd>
                <PromptInput.Send />
              </PromptInput.ToolbarEnd>
            </PromptInput.Toolbar>
          </PromptInput.Shell>
        </PromptInput>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{composerStatus}</span>
      </DemoSection>
    );
  }

  if (variant === 'grouped') {
    return (
      <DemoSection label="chat-attachment-grouped">
        <ChatAttachment.Group label="Attachments">
          {attachments.map((attachment) => (
            <ChatAttachment
              key={attachment.name}
              role="listitem"
              name={attachment.name}
              kind={attachment.kind}
              fallbackIcon={attachment.fallbackIcon}
              onRemove={() => removeAttachment(attachment.name)}
            />
          ))}
        </ChatAttachment.Group>
      </DemoSection>
    );
  }

  return (
    <DemoSection label={`chat-attachment-${variant}`}>
      {attachments.slice(0, 2).map((attachment) => (
        <ChatAttachment
          key={attachment.name}
          name={attachment.name}
          kind={attachment.kind}
          fallbackIcon={attachment.fallbackIcon}
          onRemove={() => removeAttachment(attachment.name)}
        />
      ))}
    </DemoSection>
  );
};

const CONVERSATION_VARIANT_TURNS: ConversationTurn[] = [
  {
    id: 1,
    role: 'assistant',
    text: 'Stick-to-bottom keeps the viewport pinned to the latest message while you stream. It also leaves the user in control: once they scroll away from the bottom, new content can arrive without snapping the viewport away from what they are reading.',
  },
  { id: 2, role: 'user', text: 'What happens when the assistant is doing multiple steps?' },
  {
    id: 3,
    role: 'assistant',
    text: 'You can combine the conversation viewport with reasoning and tool UI so the whole exchange remains in one scrollable surface.',
  },
];

const FULL_CHAT_DEFAULT_PROMPT = 'Turn this settings page into a responsive layout.';

const FULL_CHAT_RESPONSE_TOKENS = [
  '### Settings layout\n\n',
  'Mapped profile, notifications, and danger-zone sections to a settings layout.\n\n',
  '- Kept the same structure usable in both full-page and drawer layouts.\n',
  '- Reduced section padding and kept labels visible for compact widths.\n',
  '- Moved destructive actions behind a confirmation step.\n\n',
  '> The components stay responsive with container width constraints.',
] as const;

const FULL_CHAT_TOOL_STATUS_LABELS: Record<FullChatToolStatus, string> = {
  pending: 'Pending',
  running: 'Running',
  success: 'Success',
  error: 'Error',
  'requires-action': 'Needs approval',
};

const FULL_CHAT_SEARCH_ARGS = `{
  "query": "settings page layout",
  "scope": "components"
}`;

const FULL_CHAT_SEARCH_RESULT = `{
  "matches": 3,
  "files": ["app/layout.tsx", "app/globals.css"]
}`;

const FULL_CHAT_AUDIT_ARGS = `{
  "draftId": "settings-layout",
  "channel": "deploy"
}`;

const createFullChatRun = (): FullChatRun => ({
  phase: 'submitted',
  thoughtStepCount: 1,
  markdown: '',
  searchStatus: 'pending',
  approvalStatus: 'requires-action',
  auditStatus: 'pending',
  isApprovalVisible: false,
  isAuditVisible: false,
});

const clearDemoTimers = (timersRef: { current: number[] }) => {
  timersRef.current.forEach((id) => window.clearTimeout(id));
  timersRef.current = [];
};

const scheduleDemoTimer = (
  timersRef: { current: number[] },
  delay: number,
  action: () => void,
) => {
  const timerId = window.setTimeout(action, delay);
  timersRef.current.push(timerId);
};

type FullChatRunActions = {
  onApprove: () => void;
  onReject: () => void;
  onRegenerate: () => void;
};

const renderFullChatAssistantRun = (
  run: FullChatRun,
  { onApprove, onReject, onRegenerate }: FullChatRunActions,
) => {
  const isRunning = run.phase === 'submitted' || run.phase === 'streaming';
  const isInterrupted = run.phase === 'error';
  const copyContent = run.markdown || 'No response generated yet.';
  const isAwaitingApproval = run.approvalStatus === 'requires-action';

  return (
    <ChatMessage
      variant="assistant"
      avatar={<Avatar fallback="AI" />}
      actions={
        <ChatMessageActions>
          <ChatMessageActions.Copy content={copyContent} />
          <ChatMessageActions.Regenerate aria-label="Regenerate response" onPress={onRegenerate} />
        </ChatMessageActions>
      }
    >
      <ChainOfThought defaultExpanded isStreaming={isRunning}>
        <ChainOfThought.Trigger>
          {isRunning ? 'Thinking…' : isInterrupted ? 'Run stopped' : 'Thought for 3s'}
        </ChainOfThought.Trigger>
        <ChainOfThought.Content>
          <ChainOfThought.Steps>
            {run.thoughtStepCount >= 1 && (
              <ChainOfThought.Step label="Read requirements">
                Mapped profile, notifications, and danger-zone sections to a settings layout.
              </ChainOfThought.Step>
            )}
            {run.thoughtStepCount >= 2 && (
              <ChainOfThought.Step label="Plan responsive behavior">
                Kept the same structure usable in both full-page and drawer layouts.
              </ChainOfThought.Step>
            )}
            {run.thoughtStepCount >= 3 && (
              <ChainOfThought.Step label="Check safety">
                Verified destructive actions sit behind a confirmation step.
              </ChainOfThought.Step>
            )}
            {run.thoughtStepCount >= 4 && (
              <ChainOfThought.Step label="Compose response">
                Combined layout notes, spacing tweaks, and the responsive plan.
              </ChainOfThought.Step>
            )}
          </ChainOfThought.Steps>
        </ChainOfThought.Content>
      </ChainOfThought>

      <ChatTool
        label={
          run.searchStatus === 'running' ? (
            <TextShimmer>Running tool: searchDocs</TextShimmer>
          ) : (
            'Used tool: searchDocs'
          )
        }
        status={run.searchStatus}
        statusLabel={FULL_CHAT_TOOL_STATUS_LABELS[run.searchStatus]}
        defaultExpanded
      >
        <ChatTool.Args>
          <CodeBlock>
            <CodeBlock.Code code={FULL_CHAT_SEARCH_ARGS} language="json" />
          </CodeBlock>
        </ChatTool.Args>
        <ChatTool.Result>
          {run.searchStatus === 'pending' && 'Queued, waiting to run.'}
          {run.searchStatus === 'running' && <TextShimmer>Scanning the codebase…</TextShimmer>}
          {run.searchStatus === 'success' && (
            <CodeBlock>
              <CodeBlock.Code code={FULL_CHAT_SEARCH_RESULT} language="json" />
            </CodeBlock>
          )}
        </ChatTool.Result>
      </ChatTool>

      {run.isApprovalVisible && (
        <ChatTool
          label={
            run.approvalStatus === 'success'
              ? 'Approved: deploy'
              : run.approvalStatus === 'error'
                ? 'Rejected: deploy'
                : 'Approval needed: deploy'
          }
          status={run.approvalStatus}
          statusLabel={FULL_CHAT_TOOL_STATUS_LABELS[run.approvalStatus]}
          defaultExpanded
        >
          <ChatTool.Approval
            actions={
              <>
                <Button size="sm" variant="ghost" disabled={!isAwaitingApproval} onClick={onReject}>
                  Reject
                </Button>
                <Button size="sm" disabled={!isAwaitingApproval} onClick={onApprove}>
                  Approve
                </Button>
              </>
            }
          >
            {run.approvalStatus === 'success' && 'Approved — running the deploy step.'}
            {run.approvalStatus === 'error' && 'Rejected — the response stays in draft.'}
            {run.approvalStatus === 'requires-action' &&
              'Confirm the target and changes before deploying.'}
          </ChatTool.Approval>
        </ChatTool>
      )}

      {run.isAuditVisible && (
        <ChatTool
          label={
            run.auditStatus === 'running' ? (
              <TextShimmer>Running tool: deploy</TextShimmer>
            ) : run.auditStatus === 'error' ? (
              'Failed tool: deploy'
            ) : (
              'Queued tool: deploy'
            )
          }
          status={run.auditStatus}
          statusLabel={FULL_CHAT_TOOL_STATUS_LABELS[run.auditStatus]}
          defaultExpanded
        >
          <ChatTool.Args>
            <CodeBlock>
              <CodeBlock.Code code={FULL_CHAT_AUDIT_ARGS} language="json" />
            </CodeBlock>
          </ChatTool.Args>
          {run.auditStatus === 'error' ? (
            <ChatTool.Error>Missing deploy permission. Draft saved; returning the plan.</ChatTool.Error>
          ) : (
            <ChatTool.Result>
              {run.auditStatus === 'pending' && 'Deploy task queued.'}
              {run.auditStatus === 'running' && <TextShimmer>Checking permissions and draft…</TextShimmer>}
            </ChatTool.Result>
          )}
        </ChatTool>
      )}

      {run.markdown.length > 0 ? (
        <Markdown>{run.markdown}</Markdown>
      ) : isInterrupted ? (
        <Markdown>{'Generation stopped. Click the error icon to retry with the same prompt.'}</Markdown>
      ) : (
        <ChatLoader.Skeleton aria-label="Waiting for response">
          <ChatLoader.SkeletonAvatar />
          <ChatLoader.SkeletonBlock>
            <ChatLoader.SkeletonLine />
            <ChatLoader.SkeletonLine />
          </ChatLoader.SkeletonBlock>
        </ChatLoader.Skeleton>
      )}
    </ChatMessage>
  );
};

type ChatConversationVariant = 'default' | 'full-chat' | 'scroll-button';

const ChatConversationFrame = ({ children, height = 300 }: { children: ReactNode; height?: number }) => (
  <div
    style={{
      border: '1px solid var(--separator)',
      borderRadius: 12,
      display: 'flex',
      flexDirection: 'column',
      height,
      overflow: 'hidden',
      width: 560,
    }}
  >
    {children}
  </div>
);

const ChatConversationVariantDemo = ({ variant }: { variant: ChatConversationVariant }) => {
  const [turns, setTurns] = useState<ConversationTurn[]>(CONVERSATION_VARIANT_TURNS);
  const [value, setValue] = useState(variant === 'full-chat' ? FULL_CHAT_DEFAULT_PROMPT : '');
  const [fullChatStatus, setFullChatStatus] = useState<PromptInputStatus>('ready');
  const fullChatTimersRef = useRef<number[]>([]);
  const fullChatAssistantIdRef = useRef<number | null>(null);
  const fullChatLastPromptRef = useRef(FULL_CHAT_DEFAULT_PROMPT);

  const clearFullChatTimers = useCallback(() => {
    clearDemoTimers(fullChatTimersRef);
  }, []);

  useEffect(() => clearFullChatTimers, [clearFullChatTimers]);

  const updateFullChatRun = useCallback((updater: (run: FullChatRun) => FullChatRun) => {
    const assistantId = fullChatAssistantIdRef.current;
    if (assistantId === null) {
      return;
    }

    setTurns((prev) =>
      prev.map((turn) => {
        if (turn.id !== assistantId || turn.role !== 'assistant') {
          return turn;
        }

        return { ...turn, run: updater(turn.run ?? createFullChatRun()) };
      }),
    );
  }, []);

  const scheduleFullChatCompletion = useCallback(() => {
    setFullChatStatus('streaming');
    updateFullChatRun((run) => ({ ...run, approvalStatus: 'success', thoughtStepCount: 4 }));

    scheduleDemoTimer(fullChatTimersRef, 550, () => {
      updateFullChatRun((run) => ({ ...run, isAuditVisible: true }));
    });

    scheduleDemoTimer(fullChatTimersRef, 1150, () => {
      updateFullChatRun((run) => ({ ...run, auditStatus: 'running' }));
    });

    scheduleDemoTimer(fullChatTimersRef, 1900, () => {
      updateFullChatRun((run) => ({ ...run, auditStatus: 'error' }));
    });

    FULL_CHAT_RESPONSE_TOKENS.slice(3).forEach((token, index) => {
      scheduleDemoTimer(fullChatTimersRef, 500 + index * 680, () => {
        updateFullChatRun((run) => ({ ...run, markdown: run.markdown + token }));
      });
    });

    scheduleDemoTimer(fullChatTimersRef, 3600, () => {
      setFullChatStatus('ready');
      updateFullChatRun((run) => ({ ...run, phase: 'ready' }));
    });
  }, [updateFullChatRun]);

  const sendTurn = useCallback(
    (message = 'Add a follow-up question.') => {
      setTurns((prev) => [
        ...prev,
        { id: prev.length + 1, role: 'user', text: message },
        {
          id: prev.length + 2,
          role: 'assistant',
          text: 'Added a follow-up reply while keeping the viewport pinned to the latest message.',
        },
      ]);
      setValue('');
    },
    [],
  );

  const startFullChatRun = useCallback(
    (submitted: string) => {
      const prompt = submitted.trim() || FULL_CHAT_DEFAULT_PROMPT;
      const submittedAt = Date.now();
      const userId = submittedAt;
      const assistantId = submittedAt + 1;

      clearFullChatTimers();
      fullChatAssistantIdRef.current = assistantId;
      fullChatLastPromptRef.current = prompt;
      setFullChatStatus('submitted');
      setValue('');
      setTurns((prev) => [
        ...prev,
        { id: userId, role: 'user', text: prompt },
        { id: assistantId, role: 'assistant', text: '', run: createFullChatRun() },
      ]);

      scheduleDemoTimer(fullChatTimersRef, 650, () => {
        setFullChatStatus('streaming');
        updateFullChatRun((run) => ({
          ...run,
          phase: 'streaming',
          thoughtStepCount: 2,
          searchStatus: 'running',
        }));
      });

      scheduleDemoTimer(fullChatTimersRef, 1350, () => {
        updateFullChatRun((run) => ({ ...run, thoughtStepCount: 3 }));
      });

      scheduleDemoTimer(fullChatTimersRef, 1900, () => {
        updateFullChatRun((run) => ({ ...run, searchStatus: 'success' }));
      });

      scheduleDemoTimer(fullChatTimersRef, 2450, () => {
        updateFullChatRun((run) => ({ ...run, isApprovalVisible: true }));
      });

      FULL_CHAT_RESPONSE_TOKENS.slice(0, 3).forEach((token, index) => {
        scheduleDemoTimer(fullChatTimersRef, 1150 + index * 650, () => {
          updateFullChatRun((run) => ({ ...run, markdown: run.markdown + token }));
        });
      });
    },
    [clearFullChatTimers, updateFullChatRun],
  );

  const approveFullChatRun = useCallback(() => {
    scheduleFullChatCompletion();
  }, [scheduleFullChatCompletion]);

  const rejectFullChatRun = useCallback(() => {
    clearFullChatTimers();
    setFullChatStatus('error');
    setValue(fullChatLastPromptRef.current);
    updateFullChatRun((run) => ({
      ...run,
      phase: 'error',
      approvalStatus: 'error',
      markdown: `${run.markdown}\n\n> Rejected the action. Edit the prompt and try again.`,
    }));
  }, [clearFullChatTimers, updateFullChatRun]);

  const regenerateFullChatRun = useCallback(() => {
    startFullChatRun(fullChatLastPromptRef.current);
  }, [startFullChatRun]);

  const stopFullChatRun = useCallback(() => {
    clearFullChatTimers();
    setFullChatStatus('error');
    setValue(fullChatLastPromptRef.current);
    updateFullChatRun((run) => ({
      ...run,
      phase: 'error',
      auditStatus: run.auditStatus === 'running' ? 'error' : run.auditStatus,
    }));
  }, [clearFullChatTimers, updateFullChatRun]);

  if (variant === 'full-chat') {
    return (
      <DemoSection label="chat-conversation-full-chat" isColumn>
        <ChatConversationFrame height={420}>
          <ChatConversation style={{ flex: 1 }}>
            <ChatConversation.Content style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
              <ChatConversation.Messages style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {turns.map((turn) => (
                  <ChatConversation.Message key={turn.id}>
                    {turn.run !== undefined ? (
                      renderFullChatAssistantRun(turn.run, {
                        onApprove: approveFullChatRun,
                        onReject: rejectFullChatRun,
                        onRegenerate: regenerateFullChatRun,
                      })
                    ) : (
                      <ChatMessage
                        variant={turn.role}
                        avatar={turn.role === 'assistant' ? <Avatar fallback="AI" /> : undefined}
                      >
                        {turn.role === 'assistant' ? <Markdown>{turn.text}</Markdown> : turn.text}
                      </ChatMessage>
                    )}
                  </ChatConversation.Message>
                ))}
              </ChatConversation.Messages>
              <ChatConversation.ScrollButton />
              <ChatConversation.ScrollAnchor />
            </ChatConversation.Content>
          </ChatConversation>
          <PromptInput
            value={value}
            onValueChange={setValue}
            onSubmit={startFullChatRun}
            onStop={stopFullChatRun}
            status={fullChatStatus}
            variant="inline"
          >
            <PromptInput.Shell>
              <PromptInput.Content>
                <PromptInput.TextArea placeholder="Ask a follow-up…" />
              </PromptInput.Content>
              <PromptInput.Toolbar>
                <PromptInput.ToolbarEnd>
                  <PromptInput.Send />
                </PromptInput.ToolbarEnd>
              </PromptInput.Toolbar>
            </PromptInput.Shell>
          </PromptInput>
        </ChatConversationFrame>
      </DemoSection>
    );
  }

  const messages =
    variant === 'scroll-button'
      ? Array.from({ length: 12 }, (_, index) => ({
          id: index,
          role: (index % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
          text:
            index % 2 === 0
              ? `Follow-up ${index / 2 + 1}`
              : 'Scroll away from the bottom and the jump-to-latest button appears.',
        }))
      : turns;

  return (
    <DemoSection label={`chat-conversation-${variant}`} isColumn>
      {variant === 'default' && (
        <Button variant="secondary" size="sm" onClick={() => sendTurn()}>
          Add message
        </Button>
      )}
      <ChatConversationFrame height={variant === 'scroll-button' ? 260 : 320}>
        <ChatConversation initialScrollToBottom={variant !== 'scroll-button'} style={{ flex: 1 }}>
          <ChatConversation.Content style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
            <ChatConversation.Messages style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {messages.map((turn) => (
                <ChatConversation.Message key={turn.id}>
                  <ChatMessage variant={turn.role}>{turn.text}</ChatMessage>
                </ChatConversation.Message>
              ))}
            </ChatConversation.Messages>
            <ChatConversation.ScrollButton />
            <ChatConversation.ScrollAnchor />
          </ChatConversation.Content>
        </ChatConversation>
      </ChatConversationFrame>
    </DemoSection>
  );
};

type ChatListViewVariant = 'compact' | 'default';

const ChatListViewVariantDemo = ({ variant }: { variant: ChatListViewVariant }) => {
  const [selectedKeys, setSelectedKeys] = useState<DemoSelection>(new Set(['2']));
  const current = selectedKeys === 'all' ? 'all' : Array.from(selectedKeys)[0];

  const isCompact = variant === 'compact';

  return (
    <DemoSection label={`chat-list-view-${variant}`} isColumn>
      <div style={{ width: 440 }}>
        <ChatListView
          aria-label="Conversation list variant"
          density={isCompact ? 'compact' : 'comfortable'}
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={selectedKeys}
          items={CHAT_LIST}
          onSelectionChange={setSelectedKeys}
        >
          {(chat) => (
            <ChatListView.Item id={chat.id} textValue={chat.title}>
              <ChatListView.ItemContent>
                <ChatListView.Icon />
                <ChatListView.Text>
                  <ChatListView.Title>{chat.title}</ChatListView.Title>
                  {!isCompact && <ChatListView.Preview>{chat.preview}</ChatListView.Preview>}
                </ChatListView.Text>
                {!isCompact && <ChatListView.Meta>{chat.meta}</ChatListView.Meta>}
              </ChatListView.ItemContent>
            </ChatListView.Item>
          )}
        </ChatListView>
      </div>
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>Selected: {String(current)}</span>
    </DemoSection>
  );
};

const CHAT_MESSAGE_MARKDOWN_ANSWER = [
  'Here is a concise answer with **markdown** support:',
  '',
  '```ts',
  'export type ChatStatus = "ready" | "streaming";',
  '```',
  '',
  'The UI stays presentation-only — your SDK owns the message array.',
].join('\n');

const ChatMessageVariantDemo = ({ variant }: { variant: 'default' | 'loading' | 'with-markdown' }) => (
  <DemoSection label={`chat-message-${variant}`} isColumn>
    {variant === 'default' && (
      <>
        <ChatMessage.User>
          <ChatMessage.Bubble>
            <ChatMessage.Content>
              Can you explain how compound components help AI chat UIs stay SDK-agnostic?
            </ChatMessage.Content>
          </ChatMessage.Bubble>
        </ChatMessage.User>
        <ChatMessage.Assistant>
          <ChatMessage.Avatar fallback="AI" show />
          <ChatMessage.Body>
            <ChatMessage.Content>
              Compound components let you compose message layout explicitly while keeping state in
              your app layer.
            </ChatMessage.Content>
          </ChatMessage.Body>
        </ChatMessage.Assistant>
      </>
    )}
    {variant === 'loading' && (
      <>
        <ChatMessage.User>
          <ChatMessage.Bubble>
            <ChatMessage.Content>What is the weather in San Francisco?</ChatMessage.Content>
          </ChatMessage.Bubble>
        </ChatMessage.User>
        <ChatMessage.Assistant>
          <ChatMessage.Avatar fallback="AI" show />
          <ChatMessage.Body>
            <ChatMessage.Content>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>Thinking…</span>
                <ChatLoader.Dots />
              </div>
              <ChatLoader.Skeleton>
                <ChatLoader.SkeletonAvatar />
                <ChatLoader.SkeletonBlock>
                  <ChatLoader.SkeletonLine />
                  <ChatLoader.SkeletonLine />
                  <ChatLoader.SkeletonLine size="sm" />
                </ChatLoader.SkeletonBlock>
              </ChatLoader.Skeleton>
            </ChatMessage.Content>
          </ChatMessage.Body>
        </ChatMessage.Assistant>
      </>
    )}
    {variant === 'with-markdown' && (
      <>
        <ChatMessage.User>
          <ChatMessage.Bubble>
            <ChatMessage.Content>Show me markdown inside assistant messages.</ChatMessage.Content>
          </ChatMessage.Bubble>
        </ChatMessage.User>
        <ChatMessage.Assistant>
          <ChatMessage.Avatar fallback="AI" show />
          <ChatMessage.Body>
            <ChatMessage.Content>
              <Markdown>{CHAT_MESSAGE_MARKDOWN_ANSWER}</Markdown>
            </ChatMessage.Content>
            <ChatMessage.Actions>
              <ChatMessageActions>
                <ChatMessageActions.Copy content={CHAT_MESSAGE_MARKDOWN_ANSWER} />
              </ChatMessageActions>
            </ChatMessage.Actions>
          </ChatMessage.Body>
        </ChatMessage.Assistant>
      </>
    )}
  </DemoSection>
);

type ChatMessageActionsVariant = 'custom-icons' | 'default' | 'minimal';

const ChatMessageActionsVariantDemo = ({ variant }: { variant: ChatMessageActionsVariant }) => {
  const [rating, setRating] = useState<'up' | 'down' | null>(null);
  const [regenerateCount, setRegenerateCount] = useState(0);
  const [menuCount, setMenuCount] = useState(0);

  const message =
    variant === 'minimal'
      ? 'Minimal action set for compact layouts.'
      : variant === 'custom-icons'
        ? 'Swap preset icons via the Icon subcomponents.'
        : 'Assistant responses can expose quick actions beneath the message body.';

  return (
    <DemoSection label={`chat-message-actions-${variant}`} isColumn>
      <ChatMessage.Assistant>
        <ChatMessage.Avatar fallback="AI" show />
        <ChatMessage.Body>
          <ChatMessage.Content>{message}</ChatMessage.Content>
          <ChatMessage.Actions>
            <ChatMessageActions>
              <ChatMessageActions.Copy
                content={CHAT_ANSWER}
                icon={variant === 'custom-icons' ? <span aria-hidden="true">C</span> : undefined}
                copiedIcon={
                  variant === 'custom-icons' ? <span aria-hidden="true">✓</span> : undefined
                }
              />
              {variant === 'custom-icons' && (
                <ChatMessageActions.ThumbsUp
                  isSelected={rating === 'up'}
                  onChange={(isSelected) => setRating(isSelected ? 'up' : null)}
                >
                  <span aria-hidden="true">＋</span>
                </ChatMessageActions.ThumbsUp>
              )}
              {variant === 'default' && (
                <>
                  <ChatMessageActions.ThumbsUp
                    isSelected={rating === 'up'}
                    onChange={(isSelected) => setRating(isSelected ? 'up' : null)}
                  />
                  <ChatMessageActions.ThumbsDown
                    isSelected={rating === 'down'}
                    onChange={(isSelected) => setRating(isSelected ? 'down' : null)}
                  />
                  <ChatMessageActions.Regenerate
                    onPress={() => setRegenerateCount((count) => count + 1)}
                  />
                </>
              )}
              {variant !== 'custom-icons' && (
                <MessageMoreActionsMenu onAction={() => setMenuCount((count) => count + 1)} />
              )}
            </ChatMessageActions>
          </ChatMessage.Actions>
        </ChatMessage.Body>
      </ChatMessage.Assistant>
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>
        rating: {rating ?? 'none'}; regenerated: {regenerateCount}; more: {menuCount}
      </span>
    </DemoSection>
  );
};

type ChatSourceVariant = 'composable' | 'default' | 'document' | 'grouped' | 'stacked-favicons';

const SOURCE_ITEMS = [
  { href: 'https://heroui.com', title: 'HeroUI Pro', fallback: 'H' },
  { href: 'https://react.dev', title: 'React', fallback: 'R' },
  { href: 'https://developer.mozilla.org', title: 'MDN', fallback: 'M' },
];

const ChatSourceVariantDemo = ({ variant }: { variant: ChatSourceVariant }) => {
  const [opened, setOpened] = useState('Not opened yet');
  const handleOpen = useCallback((_href: string) => {
    setOpened('Source opened');
  }, []);

  return (
    <DemoSection label={`chat-source-${variant}`} isColumn>
      {variant === 'default' && (
        <ChatMessage variant="assistant" avatar={<Avatar fallback="AI" />}>
          Here is an answer backed by a single web source.
          <ChatSource
            href={SOURCE_ITEMS[0].href}
            title={SOURCE_ITEMS[0].title}
            fallback={SOURCE_ITEMS[0].fallback}
            onOpen={handleOpen}
          />
        </ChatMessage>
      )}
      {variant === 'document' && (
        <ChatMessage variant="assistant" avatar={<Avatar fallback="AI" />}>
          Referenced an uploaded document.
          <ChatSource
            href="https://files.example.com/q3-launch-brief.pdf"
            title="Q3-launch-brief.pdf"
            sourceType="document"
            onOpen={handleOpen}
          />
        </ChatMessage>
      )}
      {variant === 'grouped' && (
        <ChatMessage variant="assistant" avatar={<Avatar fallback="AI" />}>
          Answer synthesized from multiple sources.
          <div className="flex flex-wrap gap-2">
            {SOURCE_ITEMS.map((source) => (
              <ChatSource key={source.href} {...source} onOpen={handleOpen} />
            ))}
          </div>
        </ChatMessage>
      )}
      {variant === 'stacked-favicons' && (
        <ChatMessage variant="assistant" avatar={<Avatar fallback="AI" />}>
          Answer synthesized from multiple sources.
          <div className="flex flex-wrap gap-2">
            {SOURCE_ITEMS.map((source) => (
              <ChatSource key={source.href} {...source} onOpen={handleOpen} />
            ))}
          </div>
        </ChatMessage>
      )}
      {variant === 'composable' && (
        <ChatMessage
          variant="assistant"
          avatar={<Avatar fallback="AI" />}
          actions={
            <ChatMessageActions>
              <ChatMessageActions.Copy content="React's documentation has a clear explanation of component composition and state-driven rendering." />
            </ChatMessageActions>
          }
        >
          <Markdown>
            {
              "React's documentation has a clear explanation of component composition and state-driven rendering. The source chip below uses custom trigger content with a fetched favicon."
            }
          </Markdown>
          <ChatSource
            href="https://react.dev/learn"
            title="React docs"
            fallback="R"
            onOpen={handleOpen}
          />
        </ChatMessage>
      )}
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{opened}</span>
    </DemoSection>
  );
};

type ChatToolVariant = 'approval' | 'composable' | 'default' | 'error-state' | 'grouped' | 'streaming';

const ChatToolVariantDemo = ({ variant }: { variant: ChatToolVariant }) => {
  const [approval, setApproval] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [expanded, setExpanded] = useState(true);

  if (variant === 'approval') {
    const resolved = approval !== 'pending';

    return (
      <DemoSection label="chat-tool-approval" isColumn>
        <ChatTool label="Approval needed: sendEmail" status={resolved ? (approval === 'approved' ? 'success' : 'error') : 'requires-action'} defaultExpanded>
          <ChatTool.Args>
            <CodeBlock>
              <CodeBlock.Code
                code={'{ "to": "team@acme.com", "subject": "Launch update" }'}
                language="json"
              />
            </CodeBlock>
          </ChatTool.Args>
          <ChatTool.Approval
            actions={
              <>
                <Button size="sm" variant="ghost" disabled={resolved} onClick={() => setApproval('rejected')}>
                  Reject
                </Button>
                <Button size="sm" disabled={resolved} onClick={() => setApproval('approved')}>
                  Approve
                </Button>
              </>
            }
          >
            {approval === 'approved'
              ? 'Approved — sending the email.'
              : approval === 'rejected'
                ? 'Rejected — the email will not be sent.'
                : 'Confirm the recipient and subject before sending.'}
          </ChatTool.Approval>
        </ChatTool>
      </DemoSection>
    );
  }

  if (variant === 'composable') {
    return (
      <DemoSection label="chat-tool-composable" isColumn>
        <ChatMessage variant="assistant" avatar={<Avatar fallback="AI" />}>
          <Markdown>{'Completed tool call with JSON args and result.'}</Markdown>
          <ChatTool label="Used tool: getWeather" status="success" defaultExpanded>
            <ChatTool.Args>
              <CodeBlock>
                <CodeBlock.Code code={'{ "location": "San Francisco" }'} language="json" />
              </CodeBlock>
            </ChatTool.Args>
            <ChatTool.Result>{'{ "temperature": 64, "condition": "Sunny" }'}</ChatTool.Result>
          </ChatTool>
        </ChatMessage>
      </DemoSection>
    );
  }

  if (variant === 'grouped') {
    return (
      <DemoSection label="chat-tool-grouped" isColumn>
        <ChatTool.Group label="2 tool calls">
          <ChatTool label="Used tool: getWeather" status="success">
            <ChatTool.Result>{'{ "temperature": 64, "condition": "Sunny" }'}</ChatTool.Result>
          </ChatTool>
          <ChatTool label="Used tool: searchDocs" status="success">
            <ChatTool.Args>
              <CodeBlock>
                <CodeBlock.Code code={'{ "query": "HeroUI Pro" }'} language="json" />
              </CodeBlock>
            </ChatTool.Args>
          </ChatTool>
        </ChatTool.Group>
      </DemoSection>
    );
  }

  if (variant === 'streaming') {
    return (
      <DemoSection label="chat-tool-streaming" isColumn>
        <ChatTool label={<TextShimmer>Running tool: searchDocs</TextShimmer>} status="streaming" defaultExpanded>
          <ChatTool.Args>
            <CodeBlock>
              <CodeBlock.Code code={'{ "query": "HeroUI Pro" }'} language="json" />
            </CodeBlock>
          </ChatTool.Args>
        </ChatTool>
      </DemoSection>
    );
  }

  if (variant === 'error-state') {
    return (
      <DemoSection label="chat-tool-error-state" isColumn>
        <ChatTool label="Failed tool: fetchPage" status="error" isExpanded={expanded} onExpandedChange={setExpanded}>
          <ChatTool.Args>
            <CodeBlock>
              <CodeBlock.Code code={'{ "url": "https://example.com" }'} language="json" />
            </CodeBlock>
          </ChatTool.Args>
          <ChatTool.Error>Request timed out after 30s</ChatTool.Error>
        </ChatTool>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>State: {expanded ? 'open' : 'closed'}</span>
      </DemoSection>
    );
  }

  return (
    <DemoSection label={`chat-tool-${variant}`} isColumn>
      <ChatTool label="Used tool: getWeather" status="success" isExpanded={expanded} onExpandedChange={setExpanded}>
        <ChatTool.Args>
          <CodeBlock>
            <CodeBlock.Code code={'{ "location": "San Francisco" }'} language="json" />
          </CodeBlock>
        </ChatTool.Args>
        <ChatTool.Result>{'{ "temperature": 64, "condition": "Sunny" }'}</ChatTool.Result>
      </ChatTool>
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>State: {expanded ? 'open' : 'closed'}</span>
    </DemoSection>
  );
};

const MarkdownVariantDemo = ({ variant }: { variant: 'default' | 'streaming' | 'with-streamdown' }) => {
  const tokens =
    variant === 'with-streamdown'
      ? MARKDOWN_STREAMDOWN_TOKENS
      : variant === 'streaming'
        ? MARKDOWN_STREAMING_TOKENS
        : MARKDOWN_DEFAULT_TOKENS;
  const { isStreaming, replay, text } = useMarkdownTokenStream(tokens);

  return (
    <DemoSection label={`markdown-${variant}`} isColumn>
      {variant !== 'default' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button variant="secondary" size="sm" onClick={replay}>
            Replay
          </Button>
          {isStreaming && <TextShimmer>Appending tokens…</TextShimmer>}
        </div>
      )}
      <div style={{ width: 620 }}>
        <Markdown isStreaming={variant === 'with-streamdown' && isStreaming}>
          {variant === 'default' ? MARKDOWN_SAMPLE : text}
        </Markdown>
      </div>
    </DemoSection>
  );
};

const PROMPT_RUN_STATE_DEFAULT_PROMPT = 'Draft a weekly project update';

const PROMPT_RUN_STATE_TOKENS = [
  '### Weekly project update\n\n',
  'Send to see the composer move through submitted, streaming, and ready states.\n\n',
  '- Shipped the new onboarding flow ahead of schedule.\n',
  '- Next up: polish the settings page and add dark mode support.\n',
] as const;

const PromptInputVariantDemo = ({
  variant,
}: {
  variant:
    | 'default'
    | 'inline'
    | 'compact'
    | 'queue'
    | 'review-composer'
    | 'run-state'
    | 'secondary'
    | 'with-attachments'
    | 'with-suggestions';
}) => {
  const [value, setValue] = useState(variant === 'run-state' ? PROMPT_RUN_STATE_DEFAULT_PROMPT : '');
  const [status, setStatus] = useState<PromptInputStatus>('ready');
  const [runStateText, setRunStateText] = useState('');
  const [runStateSummary, setRunStateSummary] = useState('Waiting to send');
  const [queuedPrompts, setQueuedPrompts] = useState<DemoQueuedPrompt[]>(INITIAL_QUEUED_PROMPTS);
  const [queueAction, setQueueAction] = useState('No queue action yet');
  const [attachmentCount, setAttachmentCount] = useState(0);
  const [attachments, setAttachments] = useState<string[]>(
    variant === 'with-attachments' ? ['lesson-notes.pdf', 'student-progress.csv'] : [],
  );
  const runStateTimersRef = useRef<number[]>([]);
  const runStateLastPromptRef = useRef(PROMPT_RUN_STATE_DEFAULT_PROMPT);

  const clearRunStateTimers = useCallback(() => {
    clearDemoTimers(runStateTimersRef);
  }, []);

  useEffect(() => clearRunStateTimers, [clearRunStateTimers]);

  const startRunStateFlow = useCallback(
    (submitted: string) => {
      const prompt = submitted.trim() || PROMPT_RUN_STATE_DEFAULT_PROMPT;

      clearRunStateTimers();
      runStateLastPromptRef.current = prompt;
      setValue('');
      setRunStateText('');
      setRunStateSummary(`Submitted: ${prompt}`);
      setStatus('submitted');

      scheduleDemoTimer(runStateTimersRef, 700, () => {
        setStatus('streaming');
        setRunStateSummary('Generating response…');
      });

      PROMPT_RUN_STATE_TOKENS.forEach((token, index) => {
        scheduleDemoTimer(runStateTimersRef, 1000 + index * 700, () => {
          setRunStateText((current) => current + token);
        });
      });

      scheduleDemoTimer(runStateTimersRef, 1000 + PROMPT_RUN_STATE_TOKENS.length * 700, () => {
        setStatus('ready');
        setRunStateSummary('Done. Send another prompt to continue.');
      });
    },
    [clearRunStateTimers],
  );

  const submitPrompt = useCallback((submitted: string) => {
    if (variant === 'run-state') {
      startRunStateFlow(submitted);
      return;
    }

    setValue(`Sent: ${submitted}`);
    setStatus('submitted');
  }, [startRunStateFlow, variant]);

  const stopRunStateFlow = useCallback(() => {
    clearRunStateTimers();
    setStatus('error');
    setValue(runStateLastPromptRef.current);
    setRunStateSummary('Stopped. Click the error icon to retry.');
    setRunStateText((current) => current || 'Generation stopped before any output.');
  }, [clearRunStateTimers]);

  const addAttachment = useCallback(() => {
    setAttachmentCount((count) => count + 1);
    setAttachments((items) => [...items, `reference-${items.length + 1}.pdf`]);
  }, []);

  const removeAttachment = useCallback((name: string) => {
    setAttachments((items) => items.filter((item) => item !== name));
  }, []);

  if (variant === 'with-suggestions') {
    return (
      <DemoSection label="prompt-input-with-suggestions" isColumn>
        <PromptSuggestion title="Build something useful with HeroUI Pro AI">
          <PromptSuggestion.Items variant="pill">
            {['Design a launch page', 'Summarize meeting notes', 'Plan a data model'].map(
              (suggestion) => (
                <PromptSuggestion.Item key={suggestion} onClick={() => setValue(suggestion)}>
                  {suggestion}
                </PromptSuggestion.Item>
              ),
            )}
          </PromptSuggestion.Items>
        </PromptSuggestion>
        <PromptInput value={value} onValueChange={setValue} onSubmit={submitPrompt}>
          <PromptInput.Shell>
            <PromptInput.Content>
              <PromptInput.TextArea placeholder="Describe an app, workflow, or interface…" />
            </PromptInput.Content>
            <PromptInput.Toolbar>
              <PromptInput.ToolbarEnd>
                <PromptInput.Send />
              </PromptInput.ToolbarEnd>
            </PromptInput.Toolbar>
          </PromptInput.Shell>
        </PromptInput>
      </DemoSection>
    );
  }

  if (variant === 'queue') {
    return (
      <DemoSection label="prompt-input-queue" isColumn>
        <PromptInput onSubmit={submitPrompt}>
          <PromptInput.Queue actionsVisibility="always">
            <PromptInput.Queue.List values={queuedPrompts} onReorder={setQueuedPrompts}>
              {queuedPrompts.map((prompt) => (
                <DemoQueueRow
                  key={prompt.id}
                  prompt={prompt}
                  onMore={setQueueAction}
                  onRemove={(id) => setQueuedPrompts((prev) => prev.filter((item) => item.id !== id))}
                />
              ))}
            </PromptInput.Queue.List>
          </PromptInput.Queue>
          <PromptInput.Shell>
            <PromptInput.Content>
              <PromptInput.TextArea placeholder="Ask for follow-up changes" />
            </PromptInput.Content>
            <PromptInput.Toolbar>
              <PromptInput.ToolbarEnd>
                <PromptInput.Send />
              </PromptInput.ToolbarEnd>
            </PromptInput.Toolbar>
          </PromptInput.Shell>
        </PromptInput>
        {value.startsWith('Sent:') && <span style={{ fontSize: 12, color: 'var(--muted)' }}>{value}</span>}
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{queueAction}</span>
      </DemoSection>
    );
  }

  if (variant === 'run-state') {
    return (
      <DemoSection label="prompt-input-run-state" isColumn>
        <PromptInput
          value={value}
          onValueChange={setValue}
          onSubmit={submitPrompt}
          onStop={stopRunStateFlow}
          status={status}
        >
          <PromptInput.Shell>
            <PromptInput.Content>
              <PromptInput.TextArea placeholder="Send to see submitted → streaming → ready" />
            </PromptInput.Content>
            <PromptInput.Toolbar>
              <PromptInput.ToolbarEnd>
                <PromptInput.Send aria-label={status === 'error' ? 'Retry' : undefined} />
              </PromptInput.ToolbarEnd>
            </PromptInput.Toolbar>
          </PromptInput.Shell>
        </PromptInput>
        <ChatMessage variant="assistant" avatar={<Avatar fallback="AI" />}>
          {status === 'submitted' ? (
            <ChatLoader.Skeleton aria-label="Submitting">
              <ChatLoader.SkeletonAvatar />
              <ChatLoader.SkeletonBlock>
                <ChatLoader.SkeletonLine />
                <ChatLoader.SkeletonLine size="sm" />
              </ChatLoader.SkeletonBlock>
            </ChatLoader.Skeleton>
          ) : runStateText.length > 0 ? (
            <Markdown>{runStateText}</Markdown>
          ) : (
            <TextShimmer>{runStateSummary}</TextShimmer>
          )}
        </ChatMessage>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>
          Status: {status}; {runStateSummary}
        </span>
      </DemoSection>
    );
  }

  if (variant === 'review-composer') {
    return (
      <DemoSection label="prompt-input-review-composer" isColumn>
        <PromptInput value={value} onValueChange={setValue} onSubmit={submitPrompt} variant="secondary">
          <PromptInput.Shell>
            <PromptInput.Content>
              <PromptInput.TextArea placeholder="Review this component for visual parity, keyboard behavior, and states…" />
            </PromptInput.Content>
            <PromptInput.Toolbar>
              <PromptInput.ToolbarStart>
                <PromptInput.Action aria-label="Attach screenshot" tooltip="Attach screenshot" onPress={addAttachment}>
                  ＋
                </PromptInput.Action>
                <PromptInput.Action aria-label="Insert checklist" tooltip="Insert checklist" onPress={() => setValue('Check spacing, focus order, disabled states, and mobile layout.')}>
                  ✓
                </PromptInput.Action>
              </PromptInput.ToolbarStart>
              <PromptInput.ToolbarEnd>
                <PromptInput.Send />
              </PromptInput.ToolbarEnd>
            </PromptInput.Toolbar>
          </PromptInput.Shell>
          <PromptInput.Footer>
            {attachmentCount > 0 ? `${attachmentCount} review attachments queued` : 'Review composer keeps actions visible for QA workflows.'}
          </PromptInput.Footer>
        </PromptInput>
        {value.startsWith('Sent:') && <span style={{ fontSize: 12, color: 'var(--muted)' }}>{value}</span>}
      </DemoSection>
    );
  }

  if (variant === 'with-attachments') {
    return (
      <DemoSection label="prompt-input-with-attachments" isColumn>
        <PromptInput value={value} onValueChange={setValue} onSubmit={submitPrompt}>
          <PromptInput.Shell>
            <PromptInput.Content>
              <PromptInput.Attachments>
                {attachments.map((name) => (
                  <DemoAttachment key={name} name={name} onRemove={removeAttachment} />
                ))}
              </PromptInput.Attachments>
              <PromptInput.TextArea placeholder="Ask AI to compare the attached files…" />
            </PromptInput.Content>
            <PromptInput.Toolbar>
              <PromptInput.ToolbarStart>
                <PromptInput.Action aria-label="Add file" tooltip="Add file" onPress={addAttachment}>
                  ＋
                </PromptInput.Action>
              </PromptInput.ToolbarStart>
              <PromptInput.ToolbarEnd>
                <PromptInput.Send />
              </PromptInput.ToolbarEnd>
            </PromptInput.Toolbar>
          </PromptInput.Shell>
          <PromptInput.Footer>{attachments.length} attachments ready for context.</PromptInput.Footer>
        </PromptInput>
      </DemoSection>
    );
  }

  return (
    <DemoSection label={`prompt-input-${variant}`} isColumn>
      <PromptInput
        value={value}
        onValueChange={setValue}
        onSubmit={submitPrompt}
        variant={variant === 'inline' || variant === 'compact' ? 'inline' : variant === 'secondary' ? 'secondary' : 'primary'}
        size={variant === 'secondary' || variant === 'compact' ? 'sm' : 'md'}
      >
        <PromptInput.Shell>
          <PromptInput.Content>
            <PromptInput.TextArea placeholder={variant === 'compact' ? 'Send follow-up' : 'What do you want to know?'} />
          </PromptInput.Content>
          <PromptInput.Toolbar>
            <PromptInput.ToolbarStart>
              <PromptInput.Action aria-label="Add attachment" tooltip="Add attachment" onPress={addAttachment}>
                ＋
              </PromptInput.Action>
            </PromptInput.ToolbarStart>
            <PromptInput.ToolbarEnd>
              <PromptInput.Send />
            </PromptInput.ToolbarEnd>
          </PromptInput.Toolbar>
        </PromptInput.Shell>
        <PromptInput.Footer>
          {attachmentCount > 0
            ? `${attachmentCount} attachments added`
            : variant === 'secondary'
              ? 'Secondary surface with default background tokens.'
              : variant === 'compact'
                ? 'AI can make mistakes. Check important info.'
                : 'AI can make mistakes. Check important info.'}
        </PromptInput.Footer>
      </PromptInput>
      {value.startsWith('Sent:') && <span style={{ fontSize: 12, color: 'var(--muted)' }}>{value}</span>}
    </DemoSection>
  );
};

const PromptSuggestionVariantDemo = ({ variant }: { variant: 'cards' | 'default' }) => {
  const [selected, setSelected] = useState('Nothing selected');

  if (variant === 'cards') {
    return (
      <DemoSection label="prompt-suggestion-cards" isColumn>
        <PromptSuggestion
          title="Starter prompts for everyday work"
          description="Pick one to see what kinds of conversations this template is designed for."
        >
          <PromptSuggestion.Group
            label="At work"
            description="Planning, updates, and stakeholder communication."
          >
            <PromptSuggestion.Items variant="card">
              <PromptSuggestion.CardItem
                description="Turn rough notes into a clear weekly update."
                onClick={() => setSelected('Weekly project update')}
              >
                Weekly project update
              </PromptSuggestion.CardItem>
              <PromptSuggestion.CardItem
                description="Capture decisions, owners, and next steps."
                onClick={() => setSelected('Meeting summary')}
              >
                Meeting summary
              </PromptSuggestion.CardItem>
              <PromptSuggestion.CardItem
                description="Outline milestones, risks, and launch tasks."
                onClick={() => setSelected('Launch planning')}
              >
                Launch planning
              </PromptSuggestion.CardItem>
            </PromptSuggestion.Items>
          </PromptSuggestion.Group>
        </PromptSuggestion>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Selected: {selected}</span>
      </DemoSection>
    );
  }

  return (
    <DemoSection label="prompt-suggestion-default" isColumn>
      <PromptSuggestion
        title="What do you want to work on?"
        description="Ask a question or start from one of the suggestions below."
      >
        <PromptSuggestion.Items variant="card">
          {PROMPT_SUGGESTION_USAGE_ITEMS.map((suggestion) => (
            <PromptSuggestion.CardItem key={suggestion} onClick={() => setSelected(suggestion)}>
              {suggestion}
            </PromptSuggestion.CardItem>
          ))}
        </PromptSuggestion.Items>
      </PromptSuggestion>
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>Selected: {selected}</span>
    </DemoSection>
  );
};

const EmojiPickerVariantDemo = ({ variant }: { variant: 'custom-categories' | 'default' | 'inline' | 'sizes' }) => {
  const [picked, setPicked] = useState('None selected');
  const categories = [
    { id: 'work', icon: '💼', label: 'Work', emojis: ['💼', '📈', '🧠', '✅'] },
    { id: 'status', icon: '🔥', label: 'Status', emojis: ['🔥', '⭐', '💡', '🎯'] },
  ];

  return (
    <DemoSection label={`emoji-picker-${variant}`} isColumn>
      {variant === 'sizes' ? (
        <div className="flex items-center gap-4">
          <EmojiPicker size="sm" onEmojiSelect={setPicked} />
          <EmojiPicker size="md" onEmojiSelect={setPicked} />
          <EmojiPicker size="lg" onEmojiSelect={setPicked} />
        </div>
      ) : (
        <EmojiPicker
          isInline={variant === 'inline'}
          categories={variant === 'custom-categories' ? categories : undefined}
          recentEmojis={variant === 'default' ? EMOJI_RECENT : undefined}
          onEmojiSelect={setPicked}
        />
      )}
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>Last selected: {picked}</span>
    </DemoSection>
  );
};

type SheetVariant =
  | 'backdrop-variants'
  | 'controlled'
  | 'default'
  | 'detached'
  | 'emoji-picker-sheet'
  | 'handle-only'
  | 'nested'
  | 'non-dismissable'
  | 'placements'
  | 'professions-picker'
  | 'scrollable-content'
  | 'slack-message-actions'
  | 'snap-points'
  | 'snap-points-custom-fade'
  | 'snap-points-sequential'
  | 'with-form';

const SheetVariantDemo = ({ variant }: { variant: SheetVariant }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [emoji, setEmoji] = useState('😀');
  const [snapStep, setSnapStep] = useState(1);
  const [professionKeys, setProfessionKeys] = useState<DemoSelection>(new Set(['teacher']));
  const [actionMessage, setActionMessage] = useState('No action yet');
  const [hasDeadline, setHasDeadline] = useState(false);
  const handleRegenerate = () => setActionMessage('Regenerated the message');
  const handleDeadline = () => setHasDeadline((value) => !value);
  const handleTaskSubmit = (submitted: string) => {
    setActionMessage(`Task created: ${submitted.slice(0, 24)}`);
  };

  const professionOptions = [
    { id: 'engineer', title: 'Engineer', preview: 'Builds and ships features', meta: '8' },
    { id: 'designer', title: 'Designer', preview: 'Owns product design', meta: '5' },
    { id: 'pm', title: 'Product manager', preview: 'Plans and prioritizes', meta: '3' },
  ];

  if (variant === 'backdrop-variants') {
    return (
      <DemoSection label="sheet-backdrop-variants">
        {(['opaque', 'blur', 'transparent'] as const).map((backdrop) => (
          <Sheet key={backdrop} placement="bottom">
            <Sheet.Trigger variant="secondary">{backdrop}</Sheet.Trigger>
            <Sheet.Backdrop variant={backdrop}>
              <Sheet.Content>
                <Sheet.Dialog>
                  <Sheet.Handle />
                  <Sheet.Header>
                    <Sheet.Heading>{backdrop} backdrop</Sheet.Heading>
                  </Sheet.Header>
                  <Sheet.Body>Different backdrop visuals; focus trapping and close behavior stay the same.</Sheet.Body>
                  <Sheet.Footer>
                    <Sheet.Close>Done</Sheet.Close>
                  </Sheet.Footer>
                  <Sheet.CloseTrigger aria-label="Close" />
                </Sheet.Dialog>
              </Sheet.Content>
            </Sheet.Backdrop>
          </Sheet>
        ))}
      </DemoSection>
    );
  }

  if (variant === 'placements') {
    return (
      <DemoSection label="sheet-placements">
        {(['top', 'right', 'bottom', 'left'] as const).map((placement) => (
          <Sheet key={placement} placement={placement}>
            <Sheet.Trigger variant="secondary">{placement}</Sheet.Trigger>
            <Sheet.Backdrop>
              <Sheet.Content>
                <Sheet.Dialog>
                  <Sheet.Header>
                    <Sheet.Heading>{placement} placement</Sheet.Heading>
                  </Sheet.Header>
                  <Sheet.Body>The same content enters from the {placement} side.</Sheet.Body>
                  <Sheet.Footer>
                    <Sheet.Close>Done</Sheet.Close>
                  </Sheet.Footer>
                  <Sheet.CloseTrigger aria-label="Close" />
                </Sheet.Dialog>
              </Sheet.Content>
            </Sheet.Backdrop>
          </Sheet>
        ))}
      </DemoSection>
    );
  }

  if (variant === 'nested') {
    return (
      <DemoSection label="sheet-nested">
        <Sheet placement="bottom">
          <Sheet.Trigger variant="secondary">Open parent Sheet</Sheet.Trigger>
          <Sheet.Backdrop variant="blur">
            <Sheet.Content>
              <Sheet.Dialog>
                <Sheet.Handle />
                <Sheet.Header>
                  <Sheet.Heading>Parent panel</Sheet.Heading>
                </Sheet.Header>
                <Sheet.Body>
                  <p>The parent keeps context while the nested panel enters from the right.</p>
                  <Sheet.NestedRoot placement="right" isDetached>
                    <Sheet.Trigger size="sm">Open nested Sheet</Sheet.Trigger>
                    <Sheet.Backdrop>
                      <Sheet.Content>
                        <Sheet.Dialog>
                          <Sheet.Header>
                            <Sheet.Heading>Nested panel</Sheet.Heading>
                          </Sheet.Header>
                          <Sheet.Body>Edit a single filter here without closing the parent.</Sheet.Body>
                          <Sheet.Footer>
                            <Sheet.Close size="sm">Save</Sheet.Close>
                          </Sheet.Footer>
                          <Sheet.CloseTrigger aria-label="Close nested panel" />
                        </Sheet.Dialog>
                      </Sheet.Content>
                    </Sheet.Backdrop>
                  </Sheet.NestedRoot>
                </Sheet.Body>
                <Sheet.CloseTrigger aria-label="Close parent panel" />
              </Sheet.Dialog>
            </Sheet.Content>
          </Sheet.Backdrop>
        </Sheet>
      </DemoSection>
    );
  }

  if (
    variant === 'snap-points' ||
    variant === 'snap-points-custom-fade' ||
    variant === 'snap-points-sequential'
  ) {
    const snapHeights = [220, 340, 480];
    const snapLabels = ['Compact', 'Half', 'Expanded'];
    const snapTasks = [
      'Confirm the recipient',
      'Review the summary',
      'Set a deadline',
      'Notify the team',
    ];

    return (
      <DemoSection label={`sheet-${variant}`} isColumn>
        <Sheet
          placement="bottom"
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          snapPoints={snapHeights}
          activeSnapPoint={snapHeights[snapStep]}
          onActiveSnapPointChange={(snapPoint) => {
            const nextIndex = snapHeights.findIndex((height) => height === snapPoint);
            if (nextIndex >= 0) setSnapStep(nextIndex);
          }}
        >
          <Sheet.Trigger variant="secondary">Open Snap Sheet</Sheet.Trigger>
          <Sheet.Backdrop variant={variant === 'snap-points-custom-fade' ? 'blur' : 'opaque'}>
            <Sheet.Content>
              <Sheet.Dialog>
                <Sheet.Handle />
                <Sheet.Header>
                  <Sheet.Heading>{snapLabels[snapStep]} height</Sheet.Heading>
                </Sheet.Header>
                <Sheet.Body>
                  <div className="flex flex-wrap gap-2">
                    {snapLabels.map((label, index) => (
                      <Button
                        key={label}
                        size="sm"
                        variant={snapStep === index ? 'primary' : 'secondary'}
                        onClick={() => setSnapStep(index)}
                      >
                        {label}
                      </Button>
                    ))}
                    {variant === 'snap-points-sequential' && (
                      <Button size="sm" variant="outline" onClick={() => setSnapStep((step) => (step + 1) % snapLabels.length)}>
                        Next snap
                      </Button>
                    )}
                  </div>
                  {variant === 'snap-points-custom-fade' ? (
                    <TextShimmer>The panel is docked at {snapHeights[snapStep]}px.</TextShimmer>
                  ) : (
                    <p>The panel is docked at {snapHeights[snapStep]}px; content expands per snap.</p>
                  )}
                  {snapStep > 0 && (
                    <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                      {snapTasks.map((task, index) => (
                        <Checkbox key={task} isSelected={index < snapStep + 1} isDisabled>
                          {task}
                        </Checkbox>
                      ))}
                    </div>
                  )}
                </Sheet.Body>
                <Sheet.Footer>
                  <Sheet.Close>Done</Sheet.Close>
                </Sheet.Footer>
                <Sheet.CloseTrigger aria-label="Close" />
              </Sheet.Dialog>
            </Sheet.Content>
          </Sheet.Backdrop>
        </Sheet>
      </DemoSection>
    );
  }

  return (
    <DemoSection label={`sheet-${variant}`}>
      <Sheet
        placement={variant === 'detached' ? 'right' : 'bottom'}
        isDetached={variant === 'detached'}
        isOpen={variant === 'controlled' ? isOpen : undefined}
        onOpenChange={variant === 'controlled' ? setIsOpen : undefined}
      >
        <Sheet.Trigger variant={variant === 'controlled' && isOpen ? 'primary' : 'secondary'}>
          {variant === 'controlled' ? (isOpen ? 'Opened' : 'Open controlled Sheet') : 'Open Sheet'}
        </Sheet.Trigger>
        <Sheet.Backdrop
          variant={variant === 'detached' ? 'blur' : 'opaque'}
          isDismissable={variant === 'non-dismissable' ? false : undefined}
          isKeyboardDismissDisabled={variant === 'non-dismissable' ? true : undefined}
        >
          <Sheet.Content>
            <Sheet.Dialog>
              {(variant === 'handle-only' || variant === 'default' || variant === 'emoji-picker-sheet') && <Sheet.Handle />}
              <Sheet.Header>
                <Sheet.Heading>
                  {variant === 'emoji-picker-sheet'
                    ? `Pick an emoji ${emoji}`
                    : variant === 'detached'
                      ? 'Detached panel'
                      : variant === 'professions-picker'
                        ? 'Pick a role'
                        : variant === 'slack-message-actions'
                          ? 'Message actions'
                          : variant === 'with-form'
                            ? 'Create a follow-up task'
                            : 'Filters'}
                </Sheet.Heading>
              </Sheet.Header>
              <Sheet.Body>
                {variant === 'emoji-picker-sheet' ? (
                  <EmojiPicker isInline value={emoji} onEmojiSelect={setEmoji} />
                ) : variant === 'handle-only' ? (
                  'Only the drag handle and close button remain, ideal for lightweight mobile actions.'
                ) : variant === 'professions-picker' ? (
                  <ChatListView
                    aria-label="Role list"
                    selectionMode="single"
                    disallowEmptySelection
                    selectedKeys={professionKeys}
                    items={professionOptions}
                    onSelectionChange={setProfessionKeys}
                  >
                    {(profession) => (
                      <ChatListView.Item id={profession.id} textValue={profession.title}>
                        <ChatListView.ItemContent>
                          <ChatListView.Icon />
                          <ChatListView.Text>
                            <ChatListView.Title>{profession.title}</ChatListView.Title>
                            <ChatListView.Preview>{profession.preview}</ChatListView.Preview>
                          </ChatListView.Text>
                          <ChatListView.Meta>{profession.meta}</ChatListView.Meta>
                        </ChatListView.ItemContent>
                      </ChatListView.Item>
                    )}
                  </ChatListView>
                ) : variant === 'scrollable-content' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {Array.from({ length: 10 }, (_, index) => (
                      <p key={index}>Note {index + 1}: progress, blockers, and the next step.</p>
                    ))}
                  </div>
                ) : variant === 'slack-message-actions' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <ChatMessage
                      variant="assistant"
                      avatar={<Avatar fallback="AI" />}
                      actions={
                        <ChatMessageActions>
                          <ChatMessageActions.Copy content="Organized into a Slack-style action panel." />
                          <ChatMessageActions.Regenerate onPress={handleRegenerate} />
                          <MessageMoreActionsMenu onAction={setActionMessage} />
                        </ChatMessageActions>
                      }
                    >
                      Copy, regenerate, or forward this message from the more menu.
                    </ChatMessage>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{actionMessage}</span>
                  </div>
                ) : variant === 'with-form' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <PromptInput defaultValue="Create a follow-up task for the launch" onSubmit={handleTaskSubmit}>
                      <PromptInput.Shell>
                        <PromptInput.Content>
                          <PromptInput.TextArea aria-label="Task description" />
                        </PromptInput.Content>
                        <PromptInput.Toolbar>
                          <PromptInput.ToolbarStart>
                            <PromptInput.Action aria-label="Set deadline" tooltip="Set deadline" onPress={handleDeadline}>
                              D
                            </PromptInput.Action>
                          </PromptInput.ToolbarStart>
                          <PromptInput.ToolbarEnd>
                            <PromptInput.Send aria-label="Create task" />
                          </PromptInput.ToolbarEnd>
                        </PromptInput.Toolbar>
                      </PromptInput.Shell>
                      <PromptInput.Footer>
                        {hasDeadline ? 'Deadline set: Friday 18:00' : 'The form stays inside the Sheet; add attachments after submitting.'}
                      </PromptInput.Footer>
                    </PromptInput>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{actionMessage}</span>
                  </div>
                ) : (
                  variant === 'non-dismissable'
                    ? 'The backdrop and Esc will not close it; use the footer buttons to finish.'
                    : 'Choose a category, status, and owner, then apply the filters.'
                )}
              </Sheet.Body>
              {variant !== 'handle-only' && (
                <Sheet.Footer>
                  <Sheet.Close variant="ghost">Cancel</Sheet.Close>
                  <Sheet.Close>Apply</Sheet.Close>
                </Sheet.Footer>
              )}
              <Sheet.CloseTrigger aria-label="Close" />
            </Sheet.Dialog>
          </Sheet.Content>
        </Sheet.Backdrop>
      </Sheet>
    </DemoSection>
  );
};

export const aiOverlayDemos: Record<string, ReactNode> = {
  'chat-message': <ChatMessageDemo />,
  'chat-message-actions': <ChatMessageActionsDemo />,
  'chat-list-view': <ChatListViewDemo />,
  'chat-conversation': <ChatConversationDemo />,
  markdown: <MarkdownDemo />,
  'chat-loader': <ChatLoaderDemo />,
  'chat-attachment': <ChatAttachmentDemo />,
  'chat-source': <ChatSourceDemo />,
  'chat-tool': <ChatToolDemo />,
  'chain-of-thought': <ChainOfThoughtDemo />,
  'prompt-input': <PromptInputDemo />,
  'prompt-suggestion': <PromptSuggestionDemo />,
  'text-shimmer': <TextShimmerVariantDemo />,
  'code-block': <CodeBlockDemo />,
  modal: <ModalDemo />,
  drawer: <DrawerDemo />,
  popover: <PopoverDemo />,
  dropdown: <DropdownDemo />,
  sheet: <SheetDemo />,
  'emoji-picker': <EmojiPickerDemo />,
  'alert-dialog': <AlertDialogDemo />,
  'menu-item': <MenuItemDemo />,
};

export const aiOverlayVariantDemos: Record<string, ReactNode> = {
  'chain-of-thought-agent-trace': <ChainOfThoughtVariantDemo variant="agent-trace" />,
  'chain-of-thought-agent-trace-streaming': <ChainOfThoughtVariantDemo variant="agent-trace-streaming" />,
  'chain-of-thought-default': <ChainOfThoughtVariantDemo variant="default" />,
  'chain-of-thought-streaming': <ChainOfThoughtVariantDemo variant="streaming" />,
  'chat-attachment-composer': <ChatAttachmentVariantDemo variant="composer" />,
  'chat-attachment-default': <ChatAttachmentVariantDemo variant="default" />,
  'chat-attachment-grouped': <ChatAttachmentVariantDemo variant="grouped" />,
  'chat-conversation-default': <ChatConversationVariantDemo variant="default" />,
  'chat-conversation-full-chat': <ChatConversationVariantDemo variant="full-chat" />,
  'chat-conversation-scroll-button': <ChatConversationVariantDemo variant="scroll-button" />,
  'chat-list-view-compact': <ChatListViewVariantDemo variant="compact" />,
  'chat-list-view-default': <ChatListViewVariantDemo variant="default" />,
  'chat-loader-default': <ChatLoaderDemo />,
  'chat-message-actions-custom-icons': <ChatMessageActionsVariantDemo variant="custom-icons" />,
  'chat-message-actions-default': <ChatMessageActionsVariantDemo variant="default" />,
  'chat-message-actions-minimal': <ChatMessageActionsVariantDemo variant="minimal" />,
  'chat-message-default': <ChatMessageVariantDemo variant="default" />,
  'chat-message-loading': <ChatMessageVariantDemo variant="loading" />,
  'chat-message-with-markdown': <ChatMessageVariantDemo variant="with-markdown" />,
  'chat-source-composable': <ChatSourceVariantDemo variant="composable" />,
  'chat-source-default': <ChatSourceVariantDemo variant="default" />,
  'chat-source-document': <ChatSourceVariantDemo variant="document" />,
  'chat-source-grouped': <ChatSourceVariantDemo variant="grouped" />,
  'chat-source-stacked-favicons': <ChatSourceVariantDemo variant="stacked-favicons" />,
  'chat-tool-approval': <ChatToolVariantDemo variant="approval" />,
  'chat-tool-composable': <ChatToolVariantDemo variant="composable" />,
  'chat-tool-default': <ChatToolVariantDemo variant="default" />,
  'chat-tool-error-state': <ChatToolVariantDemo variant="error-state" />,
  'chat-tool-grouped': <ChatToolVariantDemo variant="grouped" />,
  'chat-tool-streaming': <ChatToolVariantDemo variant="streaming" />,
  'code-block-default': <CodeBlockDemo />,
  'emoji-picker-custom-categories': <EmojiPickerVariantDemo variant="custom-categories" />,
  'emoji-picker-default': <EmojiPickerVariantDemo variant="default" />,
  'emoji-picker-inline': <EmojiPickerVariantDemo variant="inline" />,
  'emoji-picker-sizes': <EmojiPickerVariantDemo variant="sizes" />,
  'markdown-default': <MarkdownVariantDemo variant="default" />,
  'markdown-streaming': <MarkdownVariantDemo variant="streaming" />,
  'markdown-with-streamdown': <MarkdownVariantDemo variant="with-streamdown" />,
  'prompt-input-compact': <PromptInputVariantDemo variant="compact" />,
  'prompt-input-default': <PromptInputVariantDemo variant="default" />,
  'prompt-input-inline': <PromptInputVariantDemo variant="inline" />,
  'prompt-input-queue': <PromptInputVariantDemo variant="queue" />,
  'prompt-input-review-composer': <PromptInputVariantDemo variant="review-composer" />,
  'prompt-input-run-state': <PromptInputVariantDemo variant="run-state" />,
  'prompt-input-secondary': <PromptInputVariantDemo variant="secondary" />,
  'prompt-input-with-attachments': <PromptInputVariantDemo variant="with-attachments" />,
  'prompt-input-with-suggestions': <PromptInputVariantDemo variant="with-suggestions" />,
  'prompt-suggestion-cards': <PromptSuggestionVariantDemo variant="cards" />,
  'prompt-suggestion-default': <PromptSuggestionVariantDemo variant="default" />,
  'sheet-backdrop-variants': <SheetVariantDemo variant="backdrop-variants" />,
  'sheet-controlled': <SheetVariantDemo variant="controlled" />,
  'sheet-default': <SheetVariantDemo variant="default" />,
  'sheet-detached': <SheetVariantDemo variant="detached" />,
  'sheet-emoji-picker-sheet': <SheetVariantDemo variant="emoji-picker-sheet" />,
  'sheet-handle-only': <SheetVariantDemo variant="handle-only" />,
  'sheet-nested': <SheetVariantDemo variant="nested" />,
  'sheet-non-dismissable': <SheetVariantDemo variant="non-dismissable" />,
  'sheet-placements': <SheetVariantDemo variant="placements" />,
  'sheet-professions-picker': <SheetVariantDemo variant="professions-picker" />,
  'sheet-scrollable-content': <SheetVariantDemo variant="scrollable-content" />,
  'sheet-slack-message-actions': <SheetVariantDemo variant="slack-message-actions" />,
  'sheet-snap-points': <SheetVariantDemo variant="snap-points" />,
  'sheet-snap-points-custom-fade': <SheetVariantDemo variant="snap-points-custom-fade" />,
  'sheet-snap-points-sequential': <SheetVariantDemo variant="snap-points-sequential" />,
  'sheet-with-form': <SheetVariantDemo variant="with-form" />,
  'text-shimmer-color': <TextShimmerVariantDemo variant="color" />,
  'text-shimmer-default': <TextShimmerVariantDemo />,
};
