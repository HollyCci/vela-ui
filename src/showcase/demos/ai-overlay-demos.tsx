import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Key, Selection } from 'react-aria-components';
import AlertDialog from '../../components/alert-dialog';
import Avatar from '../../components/avatar';
import Button from '../../components/button';
import ChainOfThought from '../../components/chain-of-thought';
import ChatAttachment from '../../components/chat-attachment';
import ChatConversation from '../../components/chat-conversation';
import ChatListView from '../../components/chat-list-view';
import ChatLoader from '../../components/chat-loader';
import ChatMessage from '../../components/chat-message';
import ChatMessageActions from '../../components/chat-message-actions';
import ChatSource from '../../components/chat-source';
import Markdown from '../../components/markdown';
import ChatTool from '../../components/chat-tool';
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

const CHAT_MESSAGE_DEMO_ANSWER =
  '好的，这份报告的核心要点有三个：营收同比增长 18%、新客户留存率提升至 76%、华东区表现最为突出。';

const ChatMessageDemo = () => (
  <DemoSection label="用户 / 助手气泡" isColumn>
    <ChatMessage variant="user">请帮我总结一下这份季度报告的要点。</ChatMessage>
    <ChatMessage
      variant="assistant"
      avatar={<Avatar fallback="AI" />}
      actions={
        <ChatMessageActions>
          <ChatMessageActions.Copy content={CHAT_MESSAGE_DEMO_ANSWER} />
        </ChatMessageActions>
      }
    >
      {CHAT_MESSAGE_DEMO_ANSWER}
    </ChatMessage>
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

const ChatToolDemo = () => {
  const [approvalResult, setApprovalResult] = useState<'pending' | 'rejected' | 'approved'>('pending');

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
    approvalResult === 'approved' ? 'running' : approvalResult === 'rejected' ? 'error' : 'requires-action';
  const approvalText =
    approvalResult === 'approved'
      ? '已允许操作，模拟执行删除远程分支。'
      : approvalResult === 'rejected'
        ? '已拒绝操作，远程分支保持不变。'
        : '该操作不可撤销，是否允许删除远程分支？';

  return (
    <DemoSection label="工具调用" isColumn>
      <ChatTool label="查询数据库：用户表" statusIcon="▾" defaultExpanded>
        <ChatTool.Args>
          <CodeBlock>
            <CodeBlock.Code code={'{ "table": "users", "limit": 10 }'} />
          </CodeBlock>
        </ChatTool.Args>
        <ChatTool.Result>共返回 10 条记录，耗时 42ms。</ChatTool.Result>
      </ChatTool>
      <ChatTool label={<TextShimmer>正在执行检索…</TextShimmer>} status="running" isExpandable={false} />
      <ChatTool label="写入文件失败" status="error" defaultExpanded>
        <ChatTool.Error>没有目标目录的写入权限。</ChatTool.Error>
      </ChatTool>
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

type DemoQueueRowProps = {
  prompt: DemoQueuedPrompt;
  onRemove: (id: number) => void;
};

const DemoQueueRow = ({ prompt, onRemove }: DemoQueueRowProps) => {
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
        <PromptInput.Queue.Item.More />
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
  const [status, setStatus] = useState<PromptInputStatus>('ready');
  const [lastSent, setLastSent] = useState('尚未发送');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [queuedPrompts, setQueuedPrompts] = useState<DemoQueuedPrompt[]>(INITIAL_QUEUED_PROMPTS);
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

  const handleRemoveAttachment = useCallback((name: string) => {
    setAttachments((prev) => prev.filter((item) => item !== name));
  }, []);

  const handleReorderQueue = useCallback((next: DemoQueuedPrompt[]) => {
    setQueuedPrompts(next);
  }, []);

  const handleRemoveQueued = useCallback((id: number) => {
    setQueuedPrompts((prev) => prev.filter((prompt) => prompt.id !== id));
  }, []);

  return (
    <DemoSection label="Enter 发送（Shift+Enter 换行）/ 运行态停止 / 附件 / 队列拖拽排序" isColumn>
      <PromptInput
        value={value}
        onValueChange={handleValueChange}
        onSubmit={handleSubmit}
        onStop={handleStop}
        status={status}
      >
        {queuedPrompts.length > 0 && (
          <PromptInput.Queue>
            <PromptInput.Queue.List values={queuedPrompts} onReorder={handleReorderQueue}>
              {queuedPrompts.map((prompt) => (
                <DemoQueueRow key={prompt.id} prompt={prompt} onRemove={handleRemoveQueued} />
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
      <PromptInput variant="inline">
        <PromptInput.Shell>
          <PromptInput.Content>
            <PromptInput.TextArea placeholder="inline 变体：折行自动展开" />
          </PromptInput.Content>
          <PromptInput.Toolbar>
            <PromptInput.ToolbarStart>
              <PromptInput.Action aria-label="添加附件" onPress={handleAttach}>
                ＋
              </PromptInput.Action>
            </PromptInput.ToolbarStart>
            <PromptInput.ToolbarEnd>
              <PromptInput.Send />
            </PromptInput.ToolbarEnd>
          </PromptInput.Toolbar>
        </PromptInput.Shell>
      </PromptInput>
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

const TextShimmerDemo = () => (
  <DemoSection label="加载文案微光效果">
    <TextShimmer>正在生成回答…</TextShimmer>
    <TextShimmer>检索知识库中…</TextShimmer>
  </DemoSection>
);

const CODE_SAMPLE = `function greet(name: string) {
  return \`你好，\${name}！\`;
}`;

const CodeBlockDemo = () => (
  <DemoSection label="语言标签 + 复制按钮（点击切换成功态对勾）" isColumn>
    <CodeBlock>
      <CodeBlock.Header>
        <span className="text-muted text-xs uppercase">typescript</span>
        <CodeBlock.CopyButton code={CODE_SAMPLE} />
      </CodeBlock.Header>
      <CodeBlock.Code code={CODE_SAMPLE} language="typescript" />
    </CodeBlock>
    <CodeBlock>
      <CodeBlock.Code code="pnpm install" language="shellscript" />
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

  const handleAction = useCallback((key: Key) => {
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
  const [sortKeys, setSortKeys] = useState<Selection>(new Set(['created']));
  const [lastAction, setLastAction] = useState('尚未操作');

  const handleSortChange = useCallback((keys: Selection) => {
    setSortKeys(keys);
  }, []);
  const handleStudentAction = useCallback((key: Key) => {
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
  const handleOpenMore = () => {
    setLastAction('已打开更多操作');
  };

  return (
    <DemoSection label="消息操作条（复制成功态 / 赞踩互斥 toggle / 操作反馈）" isColumn>
      <ChatMessageActions>
        <ChatMessageActions.Copy content={CHAT_ANSWER} />
        <ChatMessageActions.ThumbsUp isSelected={rating === 'up'} onChange={handleThumbsUp} />
        <ChatMessageActions.ThumbsDown isSelected={rating === 'down'} onChange={handleThumbsDown} />
        <ChatMessageActions.Regenerate onPress={handleRegenerate} />
        <ChatMessageActions.Menu onPress={handleOpenMore} />
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
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set(['1']));

  const handleSelectionChange = (keys: Selection) => setSelectedKeys(keys);
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

type ConversationTurn = { id: number; role: 'user' | 'assistant'; text: string };

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

支持 **加粗**、行内 \`code\` 与[链接](https://github.com/HollyCci/vela-ui)。

## 特性

- 标题、列表与链接
- 行内代码片段
- 带复制按钮的代码块

\`\`\`tsx
<Markdown>{response}</Markdown>
\`\`\`

> AI 回复可以带富文本格式，且不耦合任何 SDK。`;

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
        <ChatTool label={isStreaming ? <TextShimmer>调用 learner_progress.search</TextShimmer> : 'learner_progress.search'} status={isStreaming ? 'running' : 'idle'} defaultExpanded>
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

  const removeAttachment = useCallback((name: string) => {
    setAttachments((prev) => prev.filter((attachment) => attachment.name !== name));
  }, []);
  const addDraftAttachment = useCallback(() => {
    setDraftAttachments((prev) => [...prev, `补充材料-${prev.length + 1}.pdf`]);
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
            <PromptInput.Toolbar>
              <PromptInput.ToolbarStart>
                <PromptInput.Action aria-label="添加附件" tooltip="添加附件" onPress={addDraftAttachment}>
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

  return (
    <DemoSection label={`chat-attachment-${variant}`}>
      {attachments.slice(0, variant === 'default' ? 2 : attachments.length).map((attachment) => (
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
  const [value, setValue] = useState('');

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

  if (variant === 'full-chat') {
    return (
      <DemoSection label="chat-conversation-full-chat" isColumn>
        <ChatConversationFrame height={420}>
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
          <PromptInput value={value} onValueChange={setValue} onSubmit={sendTurn} variant="inline">
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
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set(['2']));
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
        <ChatMessage variant="user">请用一句话解释今天的学习风险。</ChatMessage>
        <ChatMessage variant="assistant" avatar={<Avatar fallback="AI" />}>
          风险集中在阅读理解，建议先补讲题型再追加练习。
        </ChatMessage>
      </>
    )}
    {variant === 'loading' && (
      <ChatMessage variant="assistant" avatar={<Avatar fallback="AI" />}>
        <ChatLoader.Skeleton>
          <ChatLoader.SkeletonAvatar />
          <ChatLoader.SkeletonBlock>
            <ChatLoader.SkeletonLine />
            <ChatLoader.SkeletonLine />
            <ChatLoader.SkeletonLine size="sm" />
          </ChatLoader.SkeletonBlock>
        </ChatLoader.Skeleton>
      </ChatMessage>
    )}
    {variant === 'with-markdown' && (
      <ChatMessage
        variant="assistant"
        avatar={<Avatar fallback="AI" />}
        actions={
          <ChatMessageActions>
            <ChatMessageActions.Copy content={MARKDOWN_SAMPLE} />
          </ChatMessageActions>
        }
      >
        <Markdown>{'### 建议\n\n- 先完成 **阅读理解** 错题讲评\n- 追加 `15 min` 课后练习\n\n> 明天复盘完成率。'}</Markdown>
      </ChatMessage>
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
        <ChatMessageActions.Menu onPress={() => setMenuCount((count) => count + 1)}>
          {variant === 'custom-icons' ? '…' : undefined}
        </ChatMessageActions.Menu>
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
          href="https://example.com/quarterly-report.pdf"
          title="季度学习报告.pdf"
          description="包含班级完成率、薄弱题型与后续跟进建议。"
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
        <ChatTool label="需要权限：发送家长通知" status={resolved ? (approval === 'approved' ? 'running' : 'error') : 'requires-action'} defaultExpanded>
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
          <ChatTool label="learning_record.read" status="idle" defaultExpanded>
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
        <ChatTool label="读取学习记录" status="idle" defaultExpanded>
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
        status={variant === 'error-state' ? 'error' : 'idle'}
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
  const [isExpanded, setIsExpanded] = useState(false);
  const streamingText = isExpanded
    ? `${MARKDOWN_SAMPLE}\n\n- 流式补充：已追加一个新列表项。`
    : '# Streaming Markdown\n\n正在生成 **分析结论**…\n\n```tsx\n<Markdown>{partial}</Markdown>\n```';

  return (
    <DemoSection label={`markdown-${variant}`} isColumn>
      {variant === 'streaming' && (
        <Button variant="secondary" size="sm" onClick={() => setIsExpanded((next) => !next)}>
          {isExpanded ? '收起流式增量' : '追加流式内容'}
        </Button>
      )}
      <div style={{ width: 620 }}>
        <Markdown>
          {variant === 'default'
            ? MARKDOWN_SAMPLE
            : variant === 'streaming'
              ? streamingText
              : '## Streamdown 风格回复\n\n1. 支持列表和 **重点**\n2. 代码块仍走 Vela `CodeBlock`\n\n```ts\nconst status = "ready";\n```\n\n> 在本仓中用现有 Markdown 渲染同类富文本回复。'}
        </Markdown>
      </div>
    </DemoSection>
  );
};

const PromptInputVariantDemo = ({
  variant,
}: {
  variant: 'default' | 'inline' | 'queue' | 'run-state' | 'secondary' | 'with-suggestions';
}) => {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<PromptInputStatus>(variant === 'run-state' ? 'streaming' : 'ready');
  const [queuedPrompts, setQueuedPrompts] = useState<DemoQueuedPrompt[]>(INITIAL_QUEUED_PROMPTS);
  const [attachmentCount, setAttachmentCount] = useState(0);

  const submitPrompt = useCallback((submitted: string) => {
    setValue(`已发送：${submitted}`);
    setStatus('submitted');
  }, []);
  const addAttachment = useCallback(() => {
    setAttachmentCount((count) => count + 1);
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
      </DemoSection>
    );
  }

  if (variant === 'run-state') {
    return (
      <DemoSection label="prompt-input-run-state" isColumn>
        <div className="flex flex-wrap gap-2">
          {(['ready', 'submitted', 'streaming', 'error'] as PromptInputStatus[]).map((nextStatus) => (
            <Button key={nextStatus} size="sm" variant={status === nextStatus ? 'primary' : 'secondary'} onClick={() => setStatus(nextStatus)}>
              {nextStatus}
            </Button>
          ))}
        </div>
        <PromptInput
          value={value || '生成一段课程反馈'}
          onValueChange={setValue}
          onSubmit={submitPrompt}
          onStop={() => setStatus('ready')}
          status={status}
          lockInputOnRun={false}
        >
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
      </DemoSection>
    );
  }

  return (
    <DemoSection label={`prompt-input-${variant}`} isColumn>
      <PromptInput
        value={value}
        onValueChange={setValue}
        onSubmit={submitPrompt}
        variant={variant === 'inline' ? 'inline' : variant === 'secondary' ? 'secondary' : 'primary'}
        size={variant === 'secondary' ? 'sm' : 'md'}
      >
        <PromptInput.Shell>
          <PromptInput.Content>
            <PromptInput.TextArea placeholder={variant === 'inline' ? 'Inline 输入…' : '向 AI 发送提示…'} />
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
  const [professionKeys, setProfessionKeys] = useState<Selection>(new Set(['teacher']));
  const [actionMessage, setActionMessage] = useState('尚未执行动作');
  const [hasDeadline, setHasDeadline] = useState(false);
  const handleRegenerate = () => setActionMessage('已重新生成 Sheet 内消息');
  const handleOpenMenu = () => setActionMessage('已打开更多操作菜单');
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

    return (
      <DemoSection label={`sheet-${variant}`} isColumn>
        <Sheet placement="bottom" isOpen={isOpen} onOpenChange={setIsOpen}>
          <Sheet.Trigger variant="secondary">打开 Snap Sheet</Sheet.Trigger>
          <Sheet.Backdrop variant={variant === 'snap-points-custom-fade' ? 'blur' : 'opaque'}>
            <Sheet.Content>
              <Sheet.Dialog style={{ maxHeight: snapHeights[snapStep] }}>
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
                    <TextShimmer>背景使用 blur fade，面板高度由当前 snap 状态切换。</TextShimmer>
                  ) : (
                    <p>本地 Sheet 通过受控状态和面板 maxHeight 模拟多档 snap point。</p>
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
                          <ChatMessageActions.Regenerate onClick={handleRegenerate} />
                          <ChatMessageActions.Menu onClick={handleOpenMenu} />
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
  'text-shimmer': <TextShimmerDemo />,
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
  'prompt-input-default': <PromptInputVariantDemo variant="default" />,
  'prompt-input-inline': <PromptInputVariantDemo variant="inline" />,
  'prompt-input-queue': <PromptInputVariantDemo variant="queue" />,
  'prompt-input-run-state': <PromptInputVariantDemo variant="run-state" />,
  'prompt-input-secondary': <PromptInputVariantDemo variant="secondary" />,
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
  'text-shimmer-default': <TextShimmerDemo />,
};
