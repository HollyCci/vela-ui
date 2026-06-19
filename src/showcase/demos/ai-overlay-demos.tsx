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
  '好的，这份报告的核心要点有三个：营收同比增长 18%、新客户留存率提升至 76%、华东区表现最为突出。';

const ChatMessageDemo = () => (
  <DemoSection label="用户 / 助手气泡" isColumn>
    <ChatMessage.User>
      <ChatMessage.Bubble>
        <ChatMessage.Content>请帮我总结一下这份季度报告的要点。</ChatMessage.Content>
      </ChatMessage.Bubble>
    </ChatMessage.User>
    <ChatMessage.Assistant>
      <ChatMessage.Avatar fallback="AI" show />
      <ChatMessage.Body>
        <ChatMessage.Content>{CHAT_MESSAGE_DEMO_ANSWER}</ChatMessage.Content>
        <ChatMessage.Actions>
          <ChatMessageActions>
            <ChatMessageActions.Copy content={CHAT_MESSAGE_DEMO_ANSWER} />
          </ChatMessageActions>
        </ChatMessage.Actions>
      </ChatMessage.Body>
    </ChatMessage.Assistant>
  </DemoSection>
);

const ChatLoaderDemo = () => (
  <>
    <DemoSection label="dots / pulse / spinner">
      <ChatLoader.Dots />
      <ChatLoader.Dots size="lg" />
      <ChatLoader.Pulse />
      <ChatLoader.Spinner />
    </DemoSection>
    <DemoSection label="skeleton" isColumn>
      <ChatLoader.Skeleton />
      <ChatLoader.Skeleton aria-label="自定义加载骨架">
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
  { name: '需求文档.pdf' },
  { name: '截图.png', kind: 'image' as const, fallbackIcon: '🖼' },
  { name: '数据表.xlsx', fallbackIcon: '📊' },
];

const ChatAttachmentDemo = () => {
  const [attachments, setAttachments] = useState(INITIAL_ATTACHMENTS);
  const handleRemove = (name: string) =>
    setAttachments((prev) => prev.filter((attachment) => attachment.name !== name));

  return (
    <DemoSection label="文件附件（悬停显示移除按钮）">
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
  const [lastOpened, setLastOpened] = useState('尚未打开');

  return (
    <DemoSection label="引用来源（点击打开后显示反馈）" isColumn>
      <div>
        <ChatSource
          href="https://react.dev"
          title="React 官方文档"
          onOpen={() => setLastOpened('React 官方文档')}
        />{' '}
        <ChatSource
          href="https://developer.mozilla.org"
          title="MDN Web Docs"
          fallback="M"
          onOpen={() => setLastOpened('MDN Web Docs')}
        />
      </div>
      <ChatSource.Preview
        href="https://react.dev"
        title="React 官方文档"
        description="用于构建用户界面的 JavaScript 库，提供组件化开发模式。"
        onOpen={() => setLastOpened('React 官方文档预览卡片')}
      />
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>最近打开：{lastOpened}</span>
    </DemoSection>
  );
};

type DemoToolRunStatus = Extract<ChatToolStatus, 'pending' | 'running' | 'success' | 'error'>;

const CHAT_TOOL_ARGS = `{
  "table": "users",
  "limit": 10,
  "fields": ["name", "role", "lastLogin"]
}`;

const CHAT_TOOL_RESULT = `{
  "rowCount": 10,
  "elapsedMs": 42,
  "cache": "warm"
}`;

const CHAT_TOOL_STATUS_LABELS: Record<DemoToolRunStatus, string> = {
  pending: '等待',
  running: '运行中',
  success: '成功',
  error: '错误',
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
      ? '已允许删除分支'
      : approvalResult === 'rejected'
        ? '已拒绝删除分支'
        : '删除分支需要确认';
  const approvalStatus =
    approvalResult === 'approved' ? 'success' : approvalResult === 'rejected' ? 'error' : 'requires-action';
  const approvalText =
    approvalResult === 'approved'
      ? '已允许操作，模拟执行删除远程分支。'
      : approvalResult === 'rejected'
        ? '已拒绝操作，远程分支保持不变。'
        : '该操作不可撤销，是否允许删除远程分支？';
  const toolLabel =
    toolStatus === 'running' ? (
      <TextShimmer>正在调用 user.lookup</TextShimmer>
    ) : toolStatus === 'success' ? (
      'user.lookup 调用完成'
    ) : toolStatus === 'error' ? (
      'user.lookup 调用失败'
    ) : (
      'user.lookup 等待执行'
    );

  return (
    <DemoSection label="工具调用生命周期" isColumn>
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
          <ChatTool.Error>接口返回 403：当前账号缺少 users.read 权限。</ChatTool.Error>
        ) : (
          <ChatTool.Result>
            {toolStatus === 'pending' && '已排队，等待调度执行。'}
            {toolStatus === 'running' && <TextShimmer>正在查询用户表并汇总字段…</TextShimmer>}
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
          {toolStatus === 'error' ? '重试' : toolStatus === 'pending' ? '开始' : '再次运行'}
        </Button>
        <Button variant="ghost" size="sm" disabled={toolStatus !== 'running'} onClick={handleFail}>
          模拟失败
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setIsToolExpanded((current) => !current)}>
          {isToolExpanded ? '收起' : '展开'}
        </Button>
        <Button variant="ghost" size="sm" disabled={toolStatus === 'pending'} onClick={handleReset}>
          重置
        </Button>
      </div>
      <ChatTool label={approvalLabel} status={approvalStatus} defaultExpanded>
        <ChatTool.Approval
          actions={
            <>
              <Button variant="ghost" size="sm" disabled={isApprovalResolved} onClick={handleReject}>
                拒绝
              </Button>
              <Button size="sm" disabled={isApprovalResolved} onClick={handleApprove}>
                允许
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
    <DemoSection label="思维链" isColumn>
      <ChainOfThought defaultExpanded>
        <ChainOfThought.Trigger>已思考 6 秒</ChainOfThought.Trigger>
        <ChainOfThought.Content>
          <ChainOfThought.Steps>
            <ChainOfThought.Step label="理解问题">用户想对比两个季度的销售数据。</ChainOfThought.Step>
            <ChainOfThought.Step label="检索数据">从报表服务取得 Q1、Q2 汇总数据。</ChainOfThought.Step>
            <ChainOfThought.Step label="得出结论">Q2 环比增长 12%，主要来自新渠道。</ChainOfThought.Step>
          </ChainOfThought.Steps>
        </ChainOfThought.Content>
      </ChainOfThought>
      <ChainOfThought isExpanded={isExpanded} onExpandedChange={handleExpandedChange}>
        <ChainOfThought.Trigger>
          {isExpanded ? '收起推理过程（受控）' : '展开推理过程（受控）'}
        </ChainOfThought.Trigger>
        <ChainOfThought.Content>
          <ChainOfThought.Steps>
            <ChainOfThought.Step>无标签步骤：只渲染正文内容。</ChainOfThought.Step>
            <ChainOfThought.Step label="受控状态">展开/收起由外部 state 控制。</ChainOfThought.Step>
          </ChainOfThought.Steps>
        </ChainOfThought.Content>
      </ChainOfThought>
      <ChainOfThought isStreaming defaultExpanded>
        <ChainOfThought.Trigger>正在思考…</ChainOfThought.Trigger>
        <ChainOfThought.Content>
          <ChainOfThought.Steps>
            <ChainOfThought.Step label="分析">正在把请求拆解为展示型组件…</ChainOfThought.Step>
          </ChainOfThought.Steps>
        </ChainOfThought.Content>
      </ChainOfThought>
    </DemoSection>
  );
};

type DemoQueuedPrompt = { id: number; text: string };

const INITIAL_QUEUED_PROMPTS: DemoQueuedPrompt[] = [
  { id: 1, text: '先审查首页改版的设计稿，再排实现计划。' },
  { id: 2, text: '给设置页补充暗色模式支持。' },
];

const QUEUE_MORE_ACTION_LABELS: Record<string, string> = {
  duplicate: '已复制队列项',
  prioritize: '已提升队列优先级',
};

const MESSAGE_MORE_ACTION_LABELS: Record<string, string> = {
  copyLink: '已复制消息链接',
  forward: '已转发到协作群',
  review: '已标记待复查',
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
        aria-label={`${prompt.text} 更多操作`}
        onAction={(key) => onAction(QUEUE_MORE_ACTION_LABELS[String(key)] ?? '已执行队列操作')}
      >
        <MenuItem id="duplicate">复制提示</MenuItem>
        <MenuItem id="prioritize">优先处理</MenuItem>
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
        aria-label="更多消息操作"
        onAction={(key) => onAction(MESSAGE_MORE_ACTION_LABELS[String(key)] ?? '已执行更多操作')}
      >
        <MenuItem id="copyLink">复制链接</MenuItem>
        <MenuItem id="forward">转发协作群</MenuItem>
        <MenuItem id="review">标记复查</MenuItem>
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
  const [lastSent, setLastSent] = useState('尚未发送');
  const [inlineLastSent, setInlineLastSent] = useState('尚未发送 inline 提示');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [inlineAttachments, setInlineAttachments] = useState<string[]>([]);
  const [queuedPrompts, setQueuedPrompts] = useState<DemoQueuedPrompt[]>(INITIAL_QUEUED_PROMPTS);
  const [queueAction, setQueueAction] = useState('尚未操作队列');
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
    setAttachments((prev) => [...prev, `参考资料-${attachmentSeqRef.current}.pdf`]);
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
    setInlineAttachments((prev) => [...prev, `inline-资料-${attachmentSeqRef.current}.pdf`]);
  }, []);

  const handleRemoveAttachment = useCallback((name: string) => {
    setAttachments((prev) => prev.filter((item) => item !== name));
  }, []);

  const handleRemoveInlineAttachment = useCallback((name: string) => {
    setInlineAttachments((prev) => prev.filter((item) => item !== name));
  }, []);

  const handleInlineSubmit = useCallback((submittedValue: string) => {
    setInlineLastSent(`inline 已发送：${submittedValue}`);
    setInlineValue('');
    setInlineAttachments([]);
  }, []);

  const handleReorderQueue = useCallback((next: DemoQueuedPrompt[]) => {
    setQueuedPrompts(next);
    setQueueAction('队列顺序已更新');
  }, []);

  const handleRemoveQueued = useCallback((id: number) => {
    setQueuedPrompts((prev) => prev.filter((prompt) => prompt.id !== id));
    setQueueAction('已移除队列项');
  }, []);

  return (
    <DemoSection label="Enter 发送（Shift+Enter 换行）/ 运行态停止 / 附件 / 队列拖拽排序" isColumn>
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
            <PromptInput.TextArea placeholder="想了解点什么？" />
          </PromptInput.Content>
          <PromptInput.Toolbar>
            <PromptInput.ToolbarStart>
              <PromptInput.Action aria-label="添加附件" tooltip="添加附件" onPress={handleAttach}>
                ＋
              </PromptInput.Action>
            </PromptInput.ToolbarStart>
            <PromptInput.ToolbarEnd>
              <PromptInput.Send />
            </PromptInput.ToolbarEnd>
          </PromptInput.Toolbar>
        </PromptInput.Shell>
        <PromptInput.Footer>AI 可能出错，请核查重要信息。</PromptInput.Footer>
      </PromptInput>
      <p>
        最近发送：{lastSent}（当前状态：{status}）
      </p>
      <p>队列操作：{queueAction}</p>
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
            <PromptInput.TextArea placeholder="inline 变体：折行自动展开" />
          </PromptInput.Content>
          <PromptInput.Toolbar>
            <PromptInput.ToolbarStart>
              <PromptInput.Action aria-label="添加附件" onPress={handleInlineAttach}>
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
            <PromptInput.TextArea placeholder="已禁用" aria-label="禁用的提示输入" />
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

const PromptSuggestionDemo = () => {
  const [selectedSuggestion, setSelectedSuggestion] = useState('总结今天的学员辅导记录');

  return (
    <DemoSection isColumn>
      <PromptSuggestion
        title="今天想做点什么？"
        description={`已选择：${selectedSuggestion}`}
      >
        <PromptSuggestion.Group label="常用">
          <PromptSuggestion.Items variant="pill">
            <PromptSuggestion.Item
              endIcon="→"
              aria-pressed={selectedSuggestion === '总结今天的学员辅导记录'}
              onClick={() => setSelectedSuggestion('总结今天的学员辅导记录')}
            >
              总结今天的学员辅导记录
            </PromptSuggestion.Item>
            <PromptSuggestion.Item
              endIcon="→"
              aria-pressed={selectedSuggestion === '生成本周排班建议'}
              onClick={() => setSelectedSuggestion('生成本周排班建议')}
            >
              生成本周排班建议
            </PromptSuggestion.Item>
          </PromptSuggestion.Items>
        </PromptSuggestion.Group>
        <PromptSuggestion.Group label="数据分析">
          <PromptSuggestion.Items variant="card">
            <PromptSuggestion.CardItem
              description="对比近两个季度的续费率变化。"
              meta="约 30 秒"
              aria-pressed={selectedSuggestion === '续费率分析'}
              onClick={() => setSelectedSuggestion('续费率分析')}
            >
              续费率分析
            </PromptSuggestion.CardItem>
            <PromptSuggestion.CardItem
              description="找出听力练习完成率最低的班级。"
              meta="约 1 分钟"
              aria-pressed={selectedSuggestion === '班级完成率排查'}
              onClick={() => setSelectedSuggestion('班级完成率排查')}
            >
              班级完成率排查
            </PromptSuggestion.CardItem>
          </PromptSuggestion.Items>
        </PromptSuggestion.Group>
      </PromptSuggestion>
    </DemoSection>
  );
};

const TextShimmerVariantDemo = ({ variant = 'default' }: { variant?: 'default' | 'color' }) => {
  if (variant === 'color') {
    return (
      <DemoSection label="语义色微光文案">
        <TextShimmer style={{ color: 'var(--color-blue-600)' }}>正在分析续费风险…</TextShimmer>
        <TextShimmer style={{ color: 'var(--color-emerald-600)' }}>已找到可复用素材…</TextShimmer>
        <TextShimmer style={{ color: 'var(--color-amber-600)' }}>等待工具返回结果…</TextShimmer>
      </DemoSection>
    );
  }

  return (
    <DemoSection label="加载文案微光效果">
      <TextShimmer>正在生成回答…</TextShimmer>
      <TextShimmer>检索知识库中…</TextShimmer>
    </DemoSection>
  );
};

const CODE_SAMPLE = `type Status = 'idle' | 'running' | 'success';

export function formatStatus(status: Status) {
  if (status === 'running') {
    return '同步中';
  }

  return status.toUpperCase();
}`;

const SHELL_SAMPLE = `pnpm type-check
pnpm audit:pro`;

const CodeBlockDemo = () => (
  <DemoSection label="语言标签 + token 高亮 + 复制反馈" isColumn>
    <CodeBlock>
      <CodeBlock.Header>
        <span className="text-muted text-xs uppercase">typescript</span>
        <CodeBlock.CopyButton code={CODE_SAMPLE} />
      </CodeBlock.Header>
      <CodeBlock.Code code={CODE_SAMPLE} language="typescript" />
    </CodeBlock>
    <CodeBlock>
      <CodeBlock.Header>
        <span className="text-muted text-xs uppercase">shell</span>
        <CodeBlock.CopyButton code={SHELL_SAMPLE} />
      </CodeBlock.Header>
      <CodeBlock.Code code={SHELL_SAMPLE} language="shellscript" />
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
    <DemoSection label="底部 Sheet（trigger 打开 / Esc 与遮罩关闭 / 拖拽手柄 / 焦点圈定）">
      <Sheet placement="bottom">
        <Sheet.Trigger variant="secondary">打开 Sheet</Sheet.Trigger>
        <Sheet.Backdrop>
          <Sheet.Content>
            <Sheet.Dialog>
              <Sheet.Handle />
              <Sheet.Header>
                <Sheet.Heading>筛选条件</Sheet.Heading>
              </Sheet.Header>
              <Sheet.Body>在这里选择课程类型、时间范围与负责老师。</Sheet.Body>
              <Sheet.Footer>
                <Sheet.Close variant="ghost">重置</Sheet.Close>
                <Sheet.Close>应用</Sheet.Close>
              </Sheet.Footer>
              <Sheet.CloseTrigger aria-label="关闭" />
            </Sheet.Dialog>
          </Sheet.Content>
        </Sheet.Backdrop>
      </Sheet>
    </DemoSection>
    <DemoSection label="嵌套 Sheet（父面板中再打开右侧子面板）">
      <Sheet placement="bottom">
        <Sheet.Trigger variant="outline">打开父 Sheet</Sheet.Trigger>
        <Sheet.Backdrop variant="blur">
          <Sheet.Content>
            <Sheet.Dialog>
              <Sheet.Header>
                <Sheet.Heading>父面板</Sheet.Heading>
              </Sheet.Header>
              <Sheet.Body>
                <p>在父面板内部可以再唤起一个嵌套子面板。</p>
                <Sheet.NestedRoot placement="right">
                  <Sheet.Trigger size="sm">打开子 Sheet</Sheet.Trigger>
                  <Sheet.Backdrop>
                    <Sheet.Content>
                      <Sheet.Dialog>
                        <Sheet.Header>
                          <Sheet.Heading>子面板</Sheet.Heading>
                        </Sheet.Header>
                        <Sheet.Body>这是从右侧滑出的嵌套子面板。</Sheet.Body>
                        <Sheet.Footer>
                          <Sheet.Close size="sm">完成</Sheet.Close>
                        </Sheet.Footer>
                        <Sheet.CloseTrigger aria-label="关闭子面板" />
                      </Sheet.Dialog>
                    </Sheet.Content>
                  </Sheet.Backdrop>
                </Sheet.NestedRoot>
              </Sheet.Body>
              <Sheet.CloseTrigger aria-label="关闭父面板" />
            </Sheet.Dialog>
          </Sheet.Content>
        </Sheet.Backdrop>
      </Sheet>
    </DemoSection>
  </>
);

const EMOJI_RECENT = ['😀', '👍', '🎉', '🔥'];

const EmojiPickerDemo = () => {
  const [picked, setPicked] = useState('尚未选择');

  const handleEmojiSelect = useCallback((emoji: string) => {
    setPicked(emoji);
  }, []);

  return (
    <DemoSection
      label="弹层选择器（切分类 / 搜索过滤 / 点表情回调）+ 内联与最近使用"
      isColumn
    >
      <div className="flex items-center gap-4">
        <EmojiPicker defaultValue="😀" recentEmojis={EMOJI_RECENT} onEmojiSelect={handleEmojiSelect} />
        <span>最近选择：{picked}</span>
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

const CHAT_ANSWER =
  '助手回复下方可以露出快捷操作：复制、赞、踩、重新生成等。点击复制会切换成功态，赞/踩互斥可切换。';

const ChatMessageActionsDemo = () => {
  const [rating, setRating] = useState<'up' | 'down' | null>(null);
  const [regenerateCount, setRegenerateCount] = useState(0);
  const [lastAction, setLastAction] = useState('尚未操作');

  const handleThumbsUp = (isSelected: boolean) => {
    setRating(isSelected ? 'up' : null);
    setLastAction(isSelected ? '已赞' : '已取消赞');
  };
  const handleThumbsDown = (isSelected: boolean) => {
    setRating(isSelected ? 'down' : null);
    setLastAction(isSelected ? '已踩' : '已取消踩');
  };
  const handleRegenerate = () => {
    setRegenerateCount((count) => count + 1);
    setLastAction('已重新生成');
  };
  return (
    <DemoSection label="消息操作条（复制成功态 / 赞踩互斥 toggle / 操作反馈）" isColumn>
      <ChatMessageActions>
        <ChatMessageActions.Copy content={CHAT_ANSWER} />
        <ChatMessageActions.ThumbsUp isSelected={rating === 'up'} onChange={handleThumbsUp} />
        <ChatMessageActions.ThumbsDown isSelected={rating === 'down'} onChange={handleThumbsDown} />
        <ChatMessageActions.Regenerate onPress={handleRegenerate} />
        <MessageMoreActionsMenu onAction={setLastAction} />
      </ChatMessageActions>
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>
        当前评价：{rating === 'up' ? '已赞' : rating === 'down' ? '已踩' : '未评价'}；重新生成：
        {regenerateCount} 次；最近动作：{lastAction}
      </span>
    </DemoSection>
  );
};

const CHAT_LIST = [
  { id: '1', title: '产品发布计划', preview: '帮我起草一份发布清单', meta: '2 小时前' },
  { id: '2', title: '用户反馈整理', preview: '总结上周的用户反馈', meta: '昨天' },
  { id: '3', title: '文案润色', preview: '把这段话改得更简洁', meta: '周一' },
];

const ChatListViewDemo = () => {
  const [selectedKeys, setSelectedKeys] = useState<DemoSelection>(new Set(['1']));

  const handleSelectionChange = (keys: DemoSelection) => setSelectedKeys(keys);
  const current = selectedKeys === 'all' ? 'all' : [...selectedKeys][0];

  return (
    <DemoSection label="会话列表（点击选中高亮，键盘上下导航）" isColumn>
      <div style={{ width: 420 }}>
        <ChatListView
          aria-label="最近会话"
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
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>当前选中：{String(current)}</span>
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
      ? `第 ${i / 2 + 1} 个问题：聊天界面的自动滚动是怎么实现的？`
      : '当用户停留在底部时，新消息会把视口保持钉在最新一条；向上滚动阅读时则不打扰。',
}));

const NEW_TURN_TEXTS = [
  '再追问一句：新消息进场的淡入上移动画是怎么做的？',
  '新消息用 framer-motion 包裹：initial(opacity:0,y:8) → animate(opacity:1,y:0)。',
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
    <DemoSection
      label="对话视图（滚动消息流 / 离底显示回到底部按钮 / 新消息淡入上移进场）"
      isColumn
    >
      <Button variant="secondary" size="sm" onClick={handleSendTurn}>
        发送新消息（观察进场动画）
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

const MARKDOWN_SAMPLE = `# Vela UI Markdown

支持 **加粗**、*斜体*、~~删除线~~、行内 \`code\` 与 [链接](https://github.com/HollyCci/vela-ui)。

## 特性

- 标题、列表与链接
- 行内代码片段
- 带复制按钮的代码块
- [x] 任务列表
- [ ] 流式增量渲染

\`\`\`tsx
<Markdown>{response}</Markdown>
\`\`\`

| 元素 | 状态 |
| --- | --- |
| 表格 | 已支持 |
| 代码复制 | 保留 |

> AI 回复可以带富文本格式，且不耦合任何 SDK。`;

const MARKDOWN_DEFAULT_TOKENS = [MARKDOWN_SAMPLE] as const;

const MARKDOWN_STREAMING_TOKENS = [
  '# Streaming Markdown\n\n',
  '正在生成 **分析结论**，先附上 [参考链接](https://react.dev/reference/react)。\n\n',
  '```tsx\n',
  'const partial = "token append";\n',
  '<Markdown>{partial}</Markdown>\n',
  '// 代码围栏会在后续 token 才闭合。\n',
  '```\n\n',
  '| 检查项 | 结果 |\n| --- | --- |\n| 未闭合代码块 | 已兜底 |\n| 代码复制 | 保持可用 |\n\n',
  '- [x] 表格已渲染\n- [ ] 等待最后一个 token\n',
] as const;

const MARKDOWN_STREAMDOWN_TOKENS = [
  '## Streamdown 风格回复\n\n',
  '1. 支持列表、**重点** 和 [外链](https://github.com/vercel/ai)。\n',
  '2. 代码块仍走 Vela `CodeBlock`，因此保留复制能力。\n\n',
  '```ts\n',
  'const status = "ready";\n',
  'const copyHint = "点击代码块右上角复制";\n',
  '```\n\n',
  '| token | 渲染 |\n| --- | --- |\n| table | ok |\n| task list | ok |\n\n',
  '- [x] 链接已解析\n- [x] 代码复制保留\n- [ ] 继续接收模型输出\n',
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
  <DemoSection label="Markdown 渲染（代码块可复制）" isColumn>
    <div style={{ width: 600 }}>
      <Markdown>{MARKDOWN_SAMPLE}</Markdown>
    </div>
  </DemoSection>
);

type ChainOfThoughtVariant = 'agent-trace' | 'agent-trace-streaming' | 'default' | 'streaming';

const ChainOfThoughtVariantDemo = ({ variant }: { variant: ChainOfThoughtVariant }) => {
  const isTrace = variant === 'agent-trace' || variant === 'agent-trace-streaming';
  const isStreaming = variant === 'streaming' || variant === 'agent-trace-streaming';

  return (
    <DemoSection label={`chain-of-thought-${variant}`} isColumn>
      <ChainOfThought defaultExpanded isStreaming={isStreaming}>
        <ChainOfThought.Trigger>{isStreaming ? '正在分析请求…' : '已思考 8 秒'}</ChainOfThought.Trigger>
        <ChainOfThought.Content>
          <ChainOfThought.Steps>
            <ChainOfThought.Step label="拆解目标">识别用户希望比较不同班级的学习进度。</ChainOfThought.Step>
            <ChainOfThought.Step label="检索数据">读取最近 7 天的完成率、错题数与跟进记录。</ChainOfThought.Step>
            <ChainOfThought.Step label={isStreaming ? '生成中' : '输出结论'}>
              {isStreaming ? '正在汇总异常班级与建议动作…' : 'A 班完成率下降，需要优先补充听力训练。'}
            </ChainOfThought.Step>
          </ChainOfThought.Steps>
        </ChainOfThought.Content>
      </ChainOfThought>
      {isTrace && (
        <ChatTool
          label={isStreaming ? <TextShimmer>调用 learner_progress.search</TextShimmer> : 'learner_progress.search'}
          status={isStreaming ? 'running' : 'success'}
          statusLabel={isStreaming ? '运行中' : '成功'}
          defaultExpanded
        >
          <ChatTool.Args>
            <CodeBlock>
              <CodeBlock.Code code={'{ "range": "7d", "groupBy": "class" }'} language="json" />
            </CodeBlock>
          </ChatTool.Args>
          <ChatTool.Result>{isStreaming ? '正在读取学习记录…' : '返回 3 个低完成率班级。'}</ChatTool.Result>
        </ChatTool>
      )}
    </DemoSection>
  );
};

type ChatAttachmentVariant = 'composer' | 'default' | 'grouped';

const ChatAttachmentVariantDemo = ({ variant }: { variant: ChatAttachmentVariant }) => {
  const [attachments, setAttachments] = useState([
    { name: '课后反馈.pdf', kind: 'file' as const, fallbackIcon: 'PDF' },
    { name: '课堂截图.png', kind: 'image' as const, fallbackIcon: 'IMG' },
    { name: '朗读片段.mp4', kind: 'video' as const, fallbackIcon: 'VID' },
  ]);
  const [draftAttachments, setDraftAttachments] = useState(['家长沟通记录.docx']);
  const [composerStatus, setComposerStatus] = useState('附件尚未发送');
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
    setComposerStatus(`已发送：${submitted.slice(0, 18)} · 附件 ${draftAttachments.length} 个`);
  }, [draftAttachments.length]);

  if (variant === 'composer') {
    return (
      <DemoSection label="chat-attachment-composer" isColumn>
        <PromptInput defaultValue="请结合附件整理一次家长沟通摘要。" onSubmit={submitComposer}>
          <PromptInput.Shell>
            <PromptInput.Content>
              <PromptInput.Attachments>
                {draftAttachments.map((name) => (
                  <DemoAttachment key={name} name={name} onRemove={removeDraftAttachment} />
                ))}
              </PromptInput.Attachments>
              <PromptInput.TextArea aria-label="带附件的提示输入" />
            </PromptInput.Content>
            <ChatAttachment.Input
              ref={fileInputRef}
              accept=".pdf,.doc,.docx,image/*"
              onSelect={addPickedFiles}
            />
            <PromptInput.Toolbar>
              <PromptInput.ToolbarStart>
                <PromptInput.Action aria-label="添加附件" tooltip="添加附件" onPress={openFilePicker}>
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
        <ChatAttachment.Group label="本次提交的附件">
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
  { id: 1, role: 'user', text: '帮我看一下本周哪类问题增长最快。' },
  { id: 2, role: 'assistant', text: '阅读理解类问题增长 18%，主要集中在三年级新班。' },
  { id: 3, role: 'user', text: '把原因和下一步动作也列出来。' },
  { id: 4, role: 'assistant', text: '原因是练习量上升但讲评不足；建议补一节错题精讲并跟进家长反馈。' },
];

const FULL_CHAT_DEFAULT_PROMPT = '把本周阅读理解风险、原因和下一步动作串成一段可执行建议。';

const FULL_CHAT_RESPONSE_TOKENS = [
  '### 本周阅读理解风险\n\n',
  '三年级 A 班的阅读理解问题增长最快，近 7 天新增错题占比约 **18%**，集中在主旨概括和细节定位。\n\n',
  '- 先安排 20 分钟错题精讲，优先覆盖高频题型。\n',
  '- 明天课后追加 10 道分层练习，系统会避开已掌握题型。\n',
  '- 周五前同步家长沟通摘要，并标注需要配合复习的短文类型。\n\n',
  '> 写入任务时权限校验失败，已保留草稿，老师确认后可手动发送提醒。',
] as const;

const FULL_CHAT_TOOL_STATUS_LABELS: Record<FullChatToolStatus, string> = {
  pending: '等待',
  running: '运行中',
  success: '成功',
  error: '错误',
  'requires-action': '待批准',
};

const FULL_CHAT_SEARCH_ARGS = `{
  "classId": "grade3-a",
  "range": "7d",
  "metric": "reading_risk"
}`;

const FULL_CHAT_SEARCH_RESULT = `{
  "riskType": "阅读理解",
  "growth": "18%",
  "clusters": ["主旨概括", "细节定位"]
}`;

const FULL_CHAT_AUDIT_ARGS = `{
  "draftId": "followup-reading-grade3-a",
  "channel": "parent_notice"
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
  const copyContent = run.markdown || '本次运行尚未生成正文。';
  const isAwaitingApproval = run.approvalStatus === 'requires-action';

  return (
    <ChatMessage
      variant="assistant"
      avatar={<Avatar fallback="AI" />}
      actions={
        <ChatMessageActions>
          <ChatMessageActions.Copy content={copyContent} />
          <ChatMessageActions.Regenerate aria-label="重新生成回答" onPress={onRegenerate} />
        </ChatMessageActions>
      }
    >
      <ChainOfThought defaultExpanded isStreaming={isRunning}>
        <ChainOfThought.Trigger>
          {isRunning ? '正在分析请求…' : isInterrupted ? '运行已停止' : '已完成推理'}
        </ChainOfThought.Trigger>
        <ChainOfThought.Content>
          <ChainOfThought.Steps>
            {run.thoughtStepCount >= 1 && (
              <ChainOfThought.Step label="理解目标">
                识别用户需要风险、原因与下一步动作连贯输出。
              </ChainOfThought.Step>
            )}
            {run.thoughtStepCount >= 2 && (
              <ChainOfThought.Step label="检索数据">
                拉取最近 7 天班级题型、错题与跟进记录。
              </ChainOfThought.Step>
            )}
            {run.thoughtStepCount >= 3 && (
              <ChainOfThought.Step label="权限确认">
                检查家长通知发送前是否需要人工批准。
              </ChainOfThought.Step>
            )}
            {run.thoughtStepCount >= 4 && (
              <ChainOfThought.Step label="生成建议">
                合并风险聚类、练习安排与沟通草稿。
              </ChainOfThought.Step>
            )}
          </ChainOfThought.Steps>
        </ChainOfThought.Content>
      </ChainOfThought>

      <ChatTool
        label={
          run.searchStatus === 'running' ? (
            <TextShimmer>learning_risk.search 正在执行</TextShimmer>
          ) : (
            'learning_risk.search'
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
          {run.searchStatus === 'pending' && '已进入工具队列，等待调度。'}
          {run.searchStatus === 'running' && <TextShimmer>正在聚合班级错题与题型变化…</TextShimmer>}
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
              ? '已批准发送家长提醒'
              : run.approvalStatus === 'error'
                ? '已拒绝发送家长提醒'
                : '需要确认：发送家长提醒'
          }
          status={run.approvalStatus}
          statusLabel={FULL_CHAT_TOOL_STATUS_LABELS[run.approvalStatus]}
          defaultExpanded
        >
          <ChatTool.Approval
            actions={
              <>
                <Button size="sm" variant="ghost" disabled={!isAwaitingApproval} onClick={onReject}>
                  拒绝
                </Button>
                <Button size="sm" disabled={!isAwaitingApproval} onClick={onApprove}>
                  允许
                </Button>
              </>
            }
          >
            {run.approvalStatus === 'success' &&
              '已确认提醒对象与内容，进入后续写入校验。'}
            {run.approvalStatus === 'error' &&
              '已拒绝发送家长提醒，回答已停在草稿状态。'}
            {run.approvalStatus === 'requires-action' &&
              '发送前需要确认提醒对象、风险描述与跟进动作。'}
          </ChatTool.Approval>
        </ChatTool>
      )}

      {run.isAuditVisible && (
        <ChatTool
          label={
            run.auditStatus === 'running' ? (
              <TextShimmer>parent_notice.write 正在校验</TextShimmer>
            ) : run.auditStatus === 'error' ? (
              'parent_notice.write 校验失败'
            ) : (
              'parent_notice.write 等待写入'
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
            <ChatTool.Error>缺少 parent_notice.write 权限，已保留草稿并继续返回建议。</ChatTool.Error>
          ) : (
            <ChatTool.Result>
              {run.auditStatus === 'pending' && '写入任务已排队。'}
              {run.auditStatus === 'running' && <TextShimmer>正在校验通知权限与草稿内容…</TextShimmer>}
            </ChatTool.Result>
          )}
        </ChatTool>
      )}

      {run.markdown.length > 0 ? (
        <Markdown>{run.markdown}</Markdown>
      ) : isInterrupted ? (
        <Markdown>{'生成已停止。点击输入框右侧错误图标可按原提示重试。'}</Markdown>
      ) : (
        <ChatLoader.Skeleton aria-label="等待生成回答">
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
    (message = '追加一个跟进问题。') => {
      setTurns((prev) => [
        ...prev,
        { id: prev.length + 1, role: 'user', text: message },
        { id: prev.length + 2, role: 'assistant', text: '已补充跟进建议，并保持消息流滚动到最新内容。' },
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
      markdown: `${run.markdown}\n\n> 已拒绝发送家长提醒，可修改提示后重试。`,
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
                <PromptInput.TextArea placeholder="继续追问…" />
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
          text: index % 2 === 0 ? `第 ${index / 2 + 1} 个追问` : '滚动离开底部时会显示回到底部按钮。',
        }))
      : turns;

  return (
    <DemoSection label={`chat-conversation-${variant}`} isColumn>
      {variant === 'default' && (
        <Button variant="secondary" size="sm" onClick={() => sendTurn()}>
          追加消息
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

  return (
    <DemoSection label={`chat-list-view-${variant}`} isColumn>
      <div style={{ width: 440 }}>
        <ChatListView
          aria-label="会话列表变体"
          density={variant === 'compact' ? 'compact' : 'comfortable'}
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
                  <ChatListView.Preview>{chat.preview}</ChatListView.Preview>
                </ChatListView.Text>
                <ChatListView.Meta>{chat.meta}</ChatListView.Meta>
              </ChatListView.ItemContent>
            </ChatListView.Item>
          )}
        </ChatListView>
      </div>
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>当前选中：{String(current)}</span>
    </DemoSection>
  );
};

const ChatMessageVariantDemo = ({ variant }: { variant: 'default' | 'loading' | 'with-markdown' }) => (
  <DemoSection label={`chat-message-${variant}`} isColumn>
    {variant === 'default' && (
      <>
        <ChatMessage.User>
          <ChatMessage.Bubble>
            <ChatMessage.Content>请用一句话解释今天的学习风险。</ChatMessage.Content>
          </ChatMessage.Bubble>
        </ChatMessage.User>
        <ChatMessage.Assistant>
          <ChatMessage.Avatar fallback="AI" show />
          <ChatMessage.Body>
            <ChatMessage.Content>
              风险集中在阅读理解，建议先补讲题型再追加练习。
            </ChatMessage.Content>
          </ChatMessage.Body>
        </ChatMessage.Assistant>
      </>
    )}
    {variant === 'loading' && (
      <ChatMessage.Assistant>
        <ChatMessage.Avatar fallback="AI" show />
        <ChatMessage.Body>
          <ChatMessage.Content>
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
    )}
    {variant === 'with-markdown' && (
      <ChatMessage.Assistant>
        <ChatMessage.Avatar fallback="AI" show />
        <ChatMessage.Body>
          <ChatMessage.Content>
            <Markdown>{'### 建议\n\n- 先完成 **阅读理解** 错题讲评\n- 追加 `15 min` 课后练习\n\n> 明天复盘完成率。'}</Markdown>
          </ChatMessage.Content>
          <ChatMessage.Actions>
            <ChatMessageActions>
              <ChatMessageActions.Copy content={MARKDOWN_SAMPLE} />
            </ChatMessageActions>
          </ChatMessage.Actions>
        </ChatMessage.Body>
      </ChatMessage.Assistant>
    )}
  </DemoSection>
);

type ChatMessageActionsVariant = 'custom-icons' | 'default' | 'minimal';

const ChatMessageActionsVariantDemo = ({ variant }: { variant: ChatMessageActionsVariant }) => {
  const [rating, setRating] = useState<'up' | 'down' | null>(null);
  const [regenerateCount, setRegenerateCount] = useState(0);
  const [menuCount, setMenuCount] = useState(0);

  return (
    <DemoSection label={`chat-message-actions-${variant}`} isColumn>
      <ChatMessageActions>
        <ChatMessageActions.Copy
          content={CHAT_ANSWER}
          icon={variant === 'custom-icons' ? <span aria-hidden="true">C</span> : undefined}
          copiedIcon={variant === 'custom-icons' ? <span aria-hidden="true">✓</span> : undefined}
        />
        {variant !== 'minimal' && (
          <>
            <ChatMessageActions.ThumbsUp
              isSelected={rating === 'up'}
              onChange={(isSelected) => setRating(isSelected ? 'up' : null)}
            >
              {variant === 'custom-icons' ? '＋' : undefined}
            </ChatMessageActions.ThumbsUp>
            <ChatMessageActions.ThumbsDown
              isSelected={rating === 'down'}
              onChange={(isSelected) => setRating(isSelected ? 'down' : null)}
            >
              {variant === 'custom-icons' ? '－' : undefined}
            </ChatMessageActions.ThumbsDown>
            <ChatMessageActions.Regenerate onPress={() => setRegenerateCount((count) => count + 1)}>
              {variant === 'custom-icons' ? '↻' : undefined}
            </ChatMessageActions.Regenerate>
          </>
        )}
        <MessageMoreActionsMenu onAction={() => setMenuCount((count) => count + 1)}>
          {variant === 'custom-icons' ? '…' : undefined}
        </MessageMoreActionsMenu>
      </ChatMessageActions>
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>
        评价：{rating ?? 'none'}；重新生成：{regenerateCount}；更多：{menuCount}
      </span>
    </DemoSection>
  );
};

type ChatSourceVariant = 'composable' | 'default' | 'document' | 'grouped' | 'stacked-favicons';

const SOURCE_ITEMS = [
  { href: 'https://react.dev', title: 'React Docs', fallback: 'R' },
  { href: 'https://developer.mozilla.org', title: 'MDN', fallback: 'M' },
  { href: 'https://www.w3.org', title: 'W3C', fallback: 'W' },
];

const ChatSourceVariantDemo = ({ variant }: { variant: ChatSourceVariant }) => {
  const [opened, setOpened] = useState('尚未打开');
  const handleOpen = useCallback((_href: string) => {
    setOpened('已打开引用');
  }, []);

  return (
    <DemoSection label={`chat-source-${variant}`} isColumn>
      {variant === 'default' && (
        <ChatSource href={SOURCE_ITEMS[0].href} title={SOURCE_ITEMS[0].title} fallback="R" onOpen={handleOpen} />
      )}
      {variant === 'document' && (
        <ChatSource.Preview
          href="https://github.com/HollyCci/vela-ui/blob/main/README.md"
          title="Vela UI README.md"
          description="包含安装方式、样式引入与组件库消费说明。"
          onOpen={handleOpen}
        />
      )}
      {variant === 'grouped' && (
        <div className="flex flex-wrap gap-2">
          {SOURCE_ITEMS.map((source) => (
            <ChatSource key={source.href} {...source} onOpen={handleOpen} />
          ))}
        </div>
      )}
      {variant === 'stacked-favicons' && (
        <ChatMessage variant="assistant" avatar={<Avatar fallback="AI" />}>
          本段回答参考了{' '}
          {SOURCE_ITEMS.map((source) => (
            <ChatSource key={source.href} {...source} onOpen={handleOpen} />
          ))}
          。
        </ChatMessage>
      )}
      {variant === 'composable' && (
        <ChatMessage
          variant="assistant"
          avatar={<Avatar fallback="AI" />}
          actions={
            <ChatMessageActions>
              <ChatMessageActions.Copy content="回答已附带来源预览。" />
            </ChatMessageActions>
          }
        >
          <Markdown>{'这条回答把正文、操作条与来源预览组合在同一个消息中。'}</Markdown>
          <ChatSource.Preview
            href="https://react.dev/learn"
            title="React Learn"
            description="组合式组件适合把来源嵌入 AI 回复正文。"
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
        <ChatTool label="需要权限：发送家长通知" status={resolved ? (approval === 'approved' ? 'success' : 'error') : 'requires-action'} defaultExpanded>
          <ChatTool.Approval
            actions={
              <>
                <Button size="sm" variant="ghost" disabled={resolved} onClick={() => setApproval('rejected')}>
                  拒绝
                </Button>
                <Button size="sm" disabled={resolved} onClick={() => setApproval('approved')}>
                  允许
                </Button>
              </>
            }
          >
            {approval === 'approved'
              ? '已允许发送，正在模拟通知家长。'
              : approval === 'rejected'
                ? '已拒绝，本次不会发送通知。'
                : '发送前需要确认消息内容与接收人。'}
          </ChatTool.Approval>
        </ChatTool>
      </DemoSection>
    );
  }

  if (variant === 'composable') {
    return (
      <DemoSection label="chat-tool-composable" isColumn>
        <ChatMessage variant="assistant" avatar={<Avatar fallback="AI" />}>
          <Markdown>{'我会先读取学习记录，再给出可执行建议。'}</Markdown>
          <ChatTool label="learning_record.read" status="success" statusLabel="成功" defaultExpanded>
            <ChatTool.Args>
              <CodeBlock>
                <CodeBlock.Code code={'{ "studentId": "stu_1024", "days": 14 }'} language="json" />
              </CodeBlock>
            </ChatTool.Args>
            <ChatTool.Result>已找到 12 条练习与 3 条老师备注。</ChatTool.Result>
          </ChatTool>
        </ChatMessage>
      </DemoSection>
    );
  }

  if (variant === 'grouped') {
    return (
      <DemoSection label="chat-tool-grouped" isColumn>
        <ChatTool.Group label="家长通知流程 · 3 个工具调用" defaultExpanded>
          <ChatTool label="读取学习记录" status="success" statusLabel="成功" defaultExpanded>
            <ChatTool.Result>读取完成。</ChatTool.Result>
          </ChatTool>
          <ChatTool label={<TextShimmer>生成行动建议</TextShimmer>} status="running" isExpandable={false} />
          <ChatTool label="发送提醒" status="requires-action" defaultExpanded>
            <ChatTool.Approval
              actions={
                <Button size="sm" disabled={approval === 'approved'} onClick={() => setApproval('approved')}>
                  允许
                </Button>
              }
            >
              {approval === 'approved' ? '已允许发送提醒。' : '需要确认发送对象。'}
            </ChatTool.Approval>
          </ChatTool>
        </ChatTool.Group>
      </DemoSection>
    );
  }

  if (variant === 'streaming') {
    return (
      <DemoSection label="chat-tool-streaming" isColumn>
        <ChatTool label={<TextShimmer>search_lessons 正在执行…</TextShimmer>} status="streaming" defaultExpanded>
          <ChatTool.Args>
            <CodeBlock>
              <CodeBlock.Code code={'{ "keyword": "阅读理解", "limit": 5 }'} language="json" />
            </CodeBlock>
          </ChatTool.Args>
          <ChatTool.Result>
            <TextShimmer>已返回 2 条结果，继续检索相似课程…</TextShimmer>
          </ChatTool.Result>
        </ChatTool>
      </DemoSection>
    );
  }

  return (
    <DemoSection label={`chat-tool-${variant}`} isColumn>
      <ChatTool
        label={variant === 'error-state' ? '写入学习计划失败' : '生成学习计划'}
        status={variant === 'error-state' ? 'error' : 'success'}
        statusLabel={variant === 'error-state' ? '错误' : '成功'}
        isExpanded={expanded}
        onExpandedChange={setExpanded}
      >
        {variant === 'error-state' ? (
          <ChatTool.Error>缺少课程计划写入权限，请切换账号或联系管理员。</ChatTool.Error>
        ) : (
          <>
            <ChatTool.Args>
              <CodeBlock>
                <CodeBlock.Code code={'{ "goal": "阅读理解", "weeks": 2 }'} language="json" />
              </CodeBlock>
            </ChatTool.Args>
            <ChatTool.Result>已生成 2 周学习计划。</ChatTool.Result>
          </>
        )}
      </ChatTool>
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>展开状态：{expanded ? 'open' : 'closed'}</span>
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
            重新播放
          </Button>
          {isStreaming && <TextShimmer>正在追加 token…</TextShimmer>}
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

const PROMPT_RUN_STATE_DEFAULT_PROMPT = '生成一段课程反馈';

const PROMPT_RUN_STATE_TOKENS = [
  '### 课程反馈\n\n',
  '今天课堂整体参与度较高，朗读环节能主动跟读，但阅读理解的细节定位还需要继续练习。\n\n',
  '- 明天先复盘 2 道错题，确认关键词定位方法。\n',
  '- 课后追加 10 分钟短文精读，并记录易错句型。\n',
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
  const [runStateSummary, setRunStateSummary] = useState('等待发送');
  const [queuedPrompts, setQueuedPrompts] = useState<DemoQueuedPrompt[]>(INITIAL_QUEUED_PROMPTS);
  const [queueAction, setQueueAction] = useState('尚未操作队列');
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
      setRunStateSummary(`已提交：${prompt}`);
      setStatus('submitted');

      scheduleDemoTimer(runStateTimersRef, 700, () => {
        setStatus('streaming');
        setRunStateSummary('正在生成课程反馈…');
      });

      PROMPT_RUN_STATE_TOKENS.forEach((token, index) => {
        scheduleDemoTimer(runStateTimersRef, 1000 + index * 700, () => {
          setRunStateText((current) => current + token);
        });
      });

      scheduleDemoTimer(runStateTimersRef, 1000 + PROMPT_RUN_STATE_TOKENS.length * 700, () => {
        setStatus('ready');
        setRunStateSummary('生成完成，可继续发送新提示。');
      });
    },
    [clearRunStateTimers],
  );

  const submitPrompt = useCallback((submitted: string) => {
    if (variant === 'run-state') {
      startRunStateFlow(submitted);
      return;
    }

    setValue(`已发送：${submitted}`);
    setStatus('submitted');
  }, [startRunStateFlow, variant]);

  const stopRunStateFlow = useCallback(() => {
    clearRunStateTimers();
    setStatus('error');
    setValue(runStateLastPromptRef.current);
    setRunStateSummary('已停止生成，点击错误图标可重试。');
    setRunStateText((current) => current || '生成已停止，尚未收到正文。');
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
        <PromptSuggestion title="可直接填入输入框">
          <PromptSuggestion.Items variant="pill">
            {['总结今天的辅导记录', '生成本周学习建议'].map((suggestion) => (
              <PromptSuggestion.Item key={suggestion} endIcon="→" onClick={() => setValue(suggestion)}>
                {suggestion}
              </PromptSuggestion.Item>
            ))}
          </PromptSuggestion.Items>
        </PromptSuggestion>
        <PromptInput value={value} onValueChange={setValue} onSubmit={submitPrompt}>
          <PromptInput.Shell>
            <PromptInput.Content>
              <PromptInput.TextArea placeholder="点击上方建议或直接输入…" />
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
        <PromptInput defaultValue="依次处理这些任务" onSubmit={submitPrompt}>
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
              <PromptInput.TextArea />
            </PromptInput.Content>
            <PromptInput.Toolbar>
              <PromptInput.ToolbarEnd>
                <PromptInput.Send />
              </PromptInput.ToolbarEnd>
            </PromptInput.Toolbar>
          </PromptInput.Shell>
        </PromptInput>
        {value.startsWith('已发送') && <span style={{ fontSize: 12, color: 'var(--muted)' }}>{value}</span>}
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
              <PromptInput.TextArea placeholder="发送后观察 submitted / streaming / ready / error" />
            </PromptInput.Content>
            <PromptInput.Toolbar>
              <PromptInput.ToolbarEnd>
                <PromptInput.Send aria-label={status === 'error' ? '重试生成' : undefined} />
              </PromptInput.ToolbarEnd>
            </PromptInput.Toolbar>
          </PromptInput.Shell>
        </PromptInput>
        <ChatMessage variant="assistant" avatar={<Avatar fallback="AI" />}>
          {status === 'submitted' ? (
            <ChatLoader.Skeleton aria-label="正在提交">
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
          当前状态：{status}；{runStateSummary}
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
        {value.startsWith('已发送') && <span style={{ fontSize: 12, color: 'var(--muted)' }}>{value}</span>}
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
            <PromptInput.TextArea placeholder={variant === 'inline' ? 'Inline 输入…' : variant === 'compact' ? 'Compact composer…' : '向 AI 发送提示…'} />
          </PromptInput.Content>
          <PromptInput.Toolbar>
            <PromptInput.ToolbarStart>
              <PromptInput.Action aria-label="添加附件" tooltip="添加附件" onPress={addAttachment}>
                ＋
              </PromptInput.Action>
            </PromptInput.ToolbarStart>
            <PromptInput.ToolbarEnd>
              <PromptInput.Send />
            </PromptInput.ToolbarEnd>
          </PromptInput.Toolbar>
        </PromptInput.Shell>
        {(attachmentCount > 0 || variant === 'secondary') && (
          <PromptInput.Footer>
            {attachmentCount > 0
              ? `已添加 ${attachmentCount} 个附件`
              : 'Secondary 外观适合低优先级输入区。'}
          </PromptInput.Footer>
        )}
      </PromptInput>
      {value.startsWith('已发送') && <span style={{ fontSize: 12, color: 'var(--muted)' }}>{value}</span>}
    </DemoSection>
  );
};

const PromptSuggestionVariantDemo = ({ variant }: { variant: 'cards' | 'default' }) => {
  const [selected, setSelected] = useState('尚未选择');

  return (
    <DemoSection label={`prompt-suggestion-${variant}`} isColumn>
      <PromptSuggestion title="推荐提示" description={`当前：${selected}`}>
        <PromptSuggestion.Group label={variant === 'cards' ? '分析任务' : '快捷输入'}>
          <PromptSuggestion.Items variant={variant === 'cards' ? 'card' : 'pill'}>
            {variant === 'cards' ? (
              <>
                <PromptSuggestion.CardItem description="对比最近两周学习完成率。" meta="数据分析" onClick={() => setSelected('完成率对比')}>
                  完成率对比
                </PromptSuggestion.CardItem>
                <PromptSuggestion.CardItem description="生成课堂反馈和家长沟通重点。" meta="文案" onClick={() => setSelected('沟通重点')}>
                  沟通重点
                </PromptSuggestion.CardItem>
              </>
            ) : (
              <>
                <PromptSuggestion.Item endIcon="→" onClick={() => setSelected('总结今日问题')}>
                  总结今日问题
                </PromptSuggestion.Item>
                <PromptSuggestion.Item endIcon="→" onClick={() => setSelected('制定跟进计划')}>
                  制定跟进计划
                </PromptSuggestion.Item>
              </>
            )}
          </PromptSuggestion.Items>
        </PromptSuggestion.Group>
      </PromptSuggestion>
    </DemoSection>
  );
};

const EmojiPickerVariantDemo = ({ variant }: { variant: 'custom-categories' | 'default' | 'inline' | 'sizes' }) => {
  const [picked, setPicked] = useState('尚未选择');
  const categories = [
    { id: 'study', icon: '📚', label: '学习', emojis: ['📚', '✏️', '🧠', '✅'] },
    { id: 'status', icon: '🔥', label: '状态', emojis: ['🔥', '⭐', '💡', '🎯'] },
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
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>最近选择：{picked}</span>
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
  const [actionMessage, setActionMessage] = useState('尚未执行动作');
  const [hasDeadline, setHasDeadline] = useState(false);
  const handleRegenerate = () => setActionMessage('已重新生成 Sheet 内消息');
  const handleDeadline = () => setHasDeadline((value) => !value);
  const handleTaskSubmit = (submitted: string) => {
    setActionMessage(`已创建任务：${submitted.slice(0, 18)}`);
  };

  const professionOptions = [
    { id: 'teacher', title: '授课老师', preview: '负责课堂讲解与答疑', meta: '8 人' },
    { id: 'coach', title: '学习顾问', preview: '跟进练习、家长沟通', meta: '5 人' },
    { id: 'ops', title: '教务运营', preview: '排课与异常处理', meta: '3 人' },
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
                  <Sheet.Body>不同遮罩视觉，但仍保留焦点圈定与关闭行为。</Sheet.Body>
                  <Sheet.Footer>
                    <Sheet.Close>完成</Sheet.Close>
                  </Sheet.Footer>
                  <Sheet.CloseTrigger aria-label="关闭" />
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
                  <Sheet.Body>同一套内容从 {placement} 方向进入。</Sheet.Body>
                  <Sheet.Footer>
                    <Sheet.Close>完成</Sheet.Close>
                  </Sheet.Footer>
                  <Sheet.CloseTrigger aria-label="关闭" />
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
          <Sheet.Trigger variant="secondary">打开父 Sheet</Sheet.Trigger>
          <Sheet.Backdrop variant="blur">
            <Sheet.Content>
              <Sheet.Dialog>
                <Sheet.Handle />
                <Sheet.Header>
                  <Sheet.Heading>父面板</Sheet.Heading>
                </Sheet.Header>
                <Sheet.Body>
                  <p>父级保留上下文，子级从右侧进入处理细节。</p>
                  <Sheet.NestedRoot placement="right" isDetached>
                    <Sheet.Trigger size="sm">打开子 Sheet</Sheet.Trigger>
                    <Sheet.Backdrop>
                      <Sheet.Content>
                        <Sheet.Dialog>
                          <Sheet.Header>
                            <Sheet.Heading>子面板</Sheet.Heading>
                          </Sheet.Header>
                          <Sheet.Body>这里编辑单个筛选项，不关闭父面板。</Sheet.Body>
                          <Sheet.Footer>
                            <Sheet.Close size="sm">保存</Sheet.Close>
                          </Sheet.Footer>
                          <Sheet.CloseTrigger aria-label="关闭子面板" />
                        </Sheet.Dialog>
                      </Sheet.Content>
                    </Sheet.Backdrop>
                  </Sheet.NestedRoot>
                </Sheet.Body>
                <Sheet.CloseTrigger aria-label="关闭父面板" />
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
    const snapLabels = ['紧凑', '半屏', '展开'];
    const snapTasks = [
      '确认发送对象',
      '检查消息摘要',
      '设置截止时间',
      '通知学习顾问',
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
          <Sheet.Trigger variant="secondary">打开 Snap Sheet</Sheet.Trigger>
          <Sheet.Backdrop variant={variant === 'snap-points-custom-fade' ? 'blur' : 'opaque'}>
            <Sheet.Content>
              <Sheet.Dialog>
                <Sheet.Handle />
                <Sheet.Header>
                  <Sheet.Heading>{snapLabels[snapStep]}高度</Sheet.Heading>
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
                        下一档
                      </Button>
                    )}
                  </div>
                  {variant === 'snap-points-custom-fade' ? (
                    <TextShimmer>当前面板停靠在 {snapHeights[snapStep]}px。</TextShimmer>
                  ) : (
                    <p>当前面板停靠在 {snapHeights[snapStep]}px，任务内容随档位展开。</p>
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
                  <Sheet.Close>完成</Sheet.Close>
                </Sheet.Footer>
                <Sheet.CloseTrigger aria-label="关闭" />
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
          {variant === 'controlled' ? (isOpen ? '已打开' : '打开受控 Sheet') : '打开 Sheet'}
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
                    ? `选择表情 ${emoji}`
                    : variant === 'detached'
                      ? '右侧分离面板'
                      : variant === 'professions-picker'
                        ? '选择角色'
                        : variant === 'slack-message-actions'
                          ? '消息操作'
                          : variant === 'with-form'
                            ? '创建跟进任务'
                            : '筛选条件'}
                </Sheet.Heading>
              </Sheet.Header>
              <Sheet.Body>
                {variant === 'emoji-picker-sheet' ? (
                  <EmojiPicker isInline value={emoji} onEmojiSelect={setEmoji} />
                ) : variant === 'handle-only' ? (
                  '仅保留拖拽手柄和关闭按钮，适合移动端轻量操作。'
                ) : variant === 'professions-picker' ? (
                  <ChatListView
                    aria-label="角色列表"
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
                      <p key={index}>第 {index + 1} 条跟进记录：记录课堂表现、作业完成度和下一步动作。</p>
                    ))}
                  </div>
                ) : variant === 'slack-message-actions' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <ChatMessage
                      variant="assistant"
                      avatar={<Avatar fallback="AI" />}
                      actions={
                        <ChatMessageActions>
                          <ChatMessageActions.Copy content="已整理为 Slack 风格操作面板。" />
                          <ChatMessageActions.Regenerate onPress={handleRegenerate} />
                          <MessageMoreActionsMenu onAction={setActionMessage} />
                        </ChatMessageActions>
                      }
                    >
                      这条消息可以复制、重新生成，或在更多菜单中转发给协作群。
                    </ChatMessage>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{actionMessage}</span>
                  </div>
                ) : variant === 'with-form' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <PromptInput defaultValue="为三年级 A 班创建阅读理解跟进任务" onSubmit={handleTaskSubmit}>
                      <PromptInput.Shell>
                        <PromptInput.Content>
                          <PromptInput.TextArea aria-label="任务描述" />
                        </PromptInput.Content>
                        <PromptInput.Toolbar>
                          <PromptInput.ToolbarStart>
                            <PromptInput.Action aria-label="设置截止日期" tooltip="设置截止日期" onPress={handleDeadline}>
                              日
                            </PromptInput.Action>
                          </PromptInput.ToolbarStart>
                          <PromptInput.ToolbarEnd>
                            <PromptInput.Send aria-label="创建任务" />
                          </PromptInput.ToolbarEnd>
                        </PromptInput.Toolbar>
                      </PromptInput.Shell>
                      <PromptInput.Footer>
                        {hasDeadline ? '已设置截止日期：本周五 18:00' : '表单内容保留在 Sheet 内，提交后可继续补充附件。'}
                      </PromptInput.Footer>
                    </PromptInput>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{actionMessage}</span>
                  </div>
                ) : (
                  variant === 'non-dismissable'
                    ? '遮罩和 Esc 不会关闭，需要使用底部按钮完成操作。'
                    : '选择课程类型、学习状态和负责老师后应用筛选。'
                )}
              </Sheet.Body>
              {variant !== 'handle-only' && (
                <Sheet.Footer>
                  <Sheet.Close variant="ghost">取消</Sheet.Close>
                  <Sheet.Close>应用</Sheet.Close>
                </Sheet.Footer>
              )}
              <Sheet.CloseTrigger aria-label="关闭" />
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
