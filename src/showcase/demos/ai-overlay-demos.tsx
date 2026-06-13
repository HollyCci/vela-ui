import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Key, Selection } from 'react-aria-components';
import { Description, Label } from '@heroui/react';
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

const ChatMessageDemo = () => (
  <DemoSection label="用户 / 助手气泡" isColumn>
    <ChatMessage variant="user">请帮我总结一下这份季度报告的要点。</ChatMessage>
    <ChatMessage
      variant="assistant"
      avatar={<Avatar fallback="AI" />}
      actions={
        <ChatMessage.Action>
          <Button variant="ghost" size="sm" isIconOnly aria-label="复制">
            ⧉
          </Button>
        </ChatMessage.Action>
      }
    >
      好的，这份报告的核心要点有三个：营收同比增长 18%、新客户留存率提升至 76%、华东区表现最为突出。
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

const ChatSourceDemo = () => (
  <DemoSection label="引用来源" isColumn>
    <div>
      <ChatSource href="https://react.dev" title="React 官方文档" />{' '}
      <ChatSource href="https://developer.mozilla.org" title="MDN Web Docs" fallback="M" />
    </div>
    <ChatSource.Preview
      href="https://react.dev"
      title="React 官方文档"
      description="用于构建用户界面的 JavaScript 库，提供组件化开发模式。"
    />
  </DemoSection>
);

const ChatToolDemo = () => (
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
    <ChatTool label="删除分支需要确认" status="requires-action" defaultExpanded>
      <ChatTool.Approval
        actions={
          <>
            <Button variant="ghost" size="sm">
              拒绝
            </Button>
            <Button size="sm">允许</Button>
          </>
        }
      >
        该操作不可撤销，是否允许删除远程分支？
      </ChatTool.Approval>
    </ChatTool>
  </DemoSection>
);

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
  const handleSubmit = useCallback(() => {
    clearTimers();
    setLastSent(value);
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
  }, [clearTimers, value]);

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
              <PromptInput.Action aria-label="添加附件">＋</PromptInput.Action>
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

const DropdownDemo = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <DemoSection label="受控下拉菜单（按钮触发 / 键盘导航 / 选中回调）" isColumn>
      <Dropdown isOpen={isOpen} onOpenChange={setIsOpen}>
        <Dropdown.Trigger>操作菜单 ▾</Dropdown.Trigger>
        <Dropdown.Popover placement="bottom">
          <Dropdown.Menu aria-label="操作菜单">
            <MenuItem textValue="编辑学员信息">
              <Label>编辑学员信息</Label>
            </MenuItem>
            <MenuItem textValue="导出记录">
              <Label>导出记录</Label>
              <Description>导出为 Excel 文件</Description>
            </MenuItem>
            <MenuItem isDisabled textValue="归档（无权限）">
              <Label>归档（无权限）</Label>
            </MenuItem>
            <MenuItem variant="danger" textValue="删除学员">
              <Label>删除学员</Label>
            </MenuItem>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
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
              <Label>按创建时间排序</Label>
            </MenuItem>
            <MenuItem id="updated" textValue="按更新时间排序">
              <MenuItem.Indicator />
              <Label>按更新时间排序</Label>
            </MenuItem>
            <MenuItem id="name" textValue="按学员姓名排序">
              <MenuItem.Indicator />
              <Label>按学员姓名排序</Label>
            </MenuItem>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
      <Dropdown>
        <Dropdown.Trigger>学员操作</Dropdown.Trigger>
        <Dropdown.Popover placement="bottom start">
          <Dropdown.Menu aria-label="学员操作" onAction={handleStudentAction}>
            <MenuItem id="edit" textValue="编辑学员信息">
              <Label>编辑学员信息</Label>
            </MenuItem>
            <MenuItem id="export" textValue="导出记录">
              <Label>导出记录</Label>
              <Description>导出为 Excel 文件</Description>
            </MenuItem>
            <MenuItem id="archive" isDisabled textValue="归档（无权限）">
              <Label>归档（无权限）</Label>
            </MenuItem>
            <MenuItem id="delete" variant="danger" textValue="删除学员">
              <Label>删除学员</Label>
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

  const handleThumbsUp = (isSelected: boolean) => setRating(isSelected ? 'up' : null);
  const handleThumbsDown = (isSelected: boolean) => setRating(isSelected ? 'down' : null);

  return (
    <DemoSection label="消息操作条（复制成功态 / 赞踩互斥 toggle）" isColumn>
      <ChatMessageActions>
        <ChatMessageActions.Copy content={CHAT_ANSWER} />
        <ChatMessageActions.ThumbsUp isSelected={rating === 'up'} onChange={handleThumbsUp} />
        <ChatMessageActions.ThumbsDown isSelected={rating === 'down'} onChange={handleThumbsDown} />
        <ChatMessageActions.Regenerate />
        <ChatMessageActions.Menu />
      </ChatMessageActions>
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>
        当前评价：{rating === 'up' ? '👍 已赞' : rating === 'down' ? '👎 已踩' : '未评价'}
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

支持 **加粗**、行内 \`code\` 与[链接](https://heroui.pro)。

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
