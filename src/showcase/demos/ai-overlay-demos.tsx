import { useCallback, useState, type ReactNode } from 'react';
import AlertDialog from '../../components/alert-dialog';
import Avatar from '../../components/avatar';
import Button from '../../components/button';
import ChainOfThought from '../../components/chain-of-thought';
import ChatAttachment from '../../components/chat-attachment';
import ChatLoader from '../../components/chat-loader';
import ChatMessage from '../../components/chat-message';
import ChatSource from '../../components/chat-source';
import ChatTool from '../../components/chat-tool';
import CodeBlock from '../../components/code-block';
import Drawer from '../../components/drawer';
import Dropdown from '../../components/dropdown';
import MenuItem from '../../components/menu-item';
import Modal from '../../components/modal';
import Popover from '../../components/popover';
import PromptInput from '../../components/prompt-input';
import PromptSuggestion from '../../components/prompt-suggestion';
import Sheet from '../../components/sheet';
import TextShimmer from '../../components/text-shimmer';
import DemoSection from '../demo-section';

const noop = () => undefined;

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
      <ChatLoader variant="dots" />
      <ChatLoader variant="dots" size="lg" />
      <ChatLoader variant="pulse" />
      <ChatLoader variant="spinner" />
    </DemoSection>
    <DemoSection label="skeleton" isColumn>
      <ChatLoader variant="skeleton" />
    </DemoSection>
  </>
);

const ChatAttachmentDemo = () => (
  <DemoSection label="文件附件（悬停显示移除按钮）">
    <ChatAttachment name="需求文档.pdf" onRemove={noop} />
    <ChatAttachment name="截图.png" kind="image" fallbackIcon="🖼" onRemove={noop} />
    <ChatAttachment name="数据表.xlsx" fallbackIcon="📊" />
  </DemoSection>
);

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

const ChatToolDemo = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return (
    <DemoSection label="工具调用" isColumn>
      <ChatTool
        label="查询数据库：用户表"
        statusIcon="▾"
        isExpanded={isExpanded}
        onToggle={handleToggle}
      >
        <ChatTool.Args>
          <CodeBlock code={'{ "table": "users", "limit": 10 }'} hasCopyButton={false} />
        </ChatTool.Args>
        <ChatTool.Result>共返回 10 条记录，耗时 42ms。</ChatTool.Result>
      </ChatTool>
      <ChatTool label={<TextShimmer>正在执行检索…</TextShimmer>} status="running" isExpandable={false} />
      <ChatTool label="写入文件失败" status="error" isExpanded>
        <ChatTool.Error>没有目标目录的写入权限。</ChatTool.Error>
      </ChatTool>
      <ChatTool label="删除分支需要确认" status="requires-action" isExpanded>
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

const PromptInputDemo = () => (
  <DemoSection label="提示输入框" isColumn>
    <PromptInput>
      <PromptInput.Content>
        <PromptInput.Textarea placeholder="输入你的问题…" aria-label="提示输入" />
      </PromptInput.Content>
      <PromptInput.Toolbar>
        <PromptInput.ToolbarStart>
          <Button variant="ghost" size="sm" isIconOnly aria-label="添加附件">
            ＋
          </Button>
        </PromptInput.ToolbarStart>
        <PromptInput.ToolbarEnd>
          <PromptInput.Send size="sm" isIconOnly aria-label="发送">
            ↑
          </PromptInput.Send>
        </PromptInput.ToolbarEnd>
      </PromptInput.Toolbar>
    </PromptInput>
    <PromptInput variant="secondary" size="sm" isDisabled>
      <PromptInput.Content>
        <PromptInput.Textarea placeholder="已禁用" disabled aria-label="禁用的提示输入" />
      </PromptInput.Content>
    </PromptInput>
  </DemoSection>
);

const PromptSuggestionDemo = () => (
  <DemoSection isColumn>
    <PromptSuggestion title="今天想做点什么？" description="从下面的建议中选择一个快速开始。">
      <PromptSuggestion.Group label="常用">
        <PromptSuggestion.Items variant="pill">
          <PromptSuggestion.Item endIcon="→">总结今天的学员辅导记录</PromptSuggestion.Item>
          <PromptSuggestion.Item endIcon="→">生成本周排班建议</PromptSuggestion.Item>
        </PromptSuggestion.Items>
      </PromptSuggestion.Group>
      <PromptSuggestion.Group label="数据分析">
        <PromptSuggestion.Items variant="card">
          <PromptSuggestion.CardItem description="对比近两个季度的续费率变化。" meta="约 30 秒">
            续费率分析
          </PromptSuggestion.CardItem>
          <PromptSuggestion.CardItem description="找出听力练习完成率最低的班级。" meta="约 1 分钟">
            班级完成率排查
          </PromptSuggestion.CardItem>
        </PromptSuggestion.Items>
      </PromptSuggestion.Group>
    </PromptSuggestion>
  </DemoSection>
);

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
  <DemoSection isColumn>
    <CodeBlock language="typescript" code={CODE_SAMPLE} />
    <CodeBlock code={'pnpm install'} hasCopyButton={false} />
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

const PopoverDemo = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <DemoSection label="受控气泡卡片（静态定位）" isColumn>
      <Popover
        isOpen={isOpen}
        placement="bottom"
        trigger={
          <Button variant="outline" onClick={handleToggle}>
            {isOpen ? '收起说明' : '查看说明'}
          </Button>
        }
      >
        <Popover.Heading>排班规则</Popover.Heading>
        <p>每位老师每天最多安排 8 节辅导课，跨时段需间隔 15 分钟。</p>
      </Popover>
    </DemoSection>
  );
};

const DropdownDemo = () => {
  const [isOpen, setIsOpen] = useState(true);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <DemoSection label="受控下拉菜单（静态定位）" isColumn>
      <Dropdown
        isOpen={isOpen}
        placement="bottom"
        trigger={
          <Button variant="outline" onClick={handleToggle}>
            操作菜单 ▾
          </Button>
        }
      >
        <MenuItem>编辑学员信息</MenuItem>
        <MenuItem description="导出为 Excel 文件">导出记录</MenuItem>
        <MenuItem isDisabled>归档（无权限）</MenuItem>
        <MenuItem isDanger>删除学员</MenuItem>
      </Dropdown>
    </DemoSection>
  );
};

const SheetDemo = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);
  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <DemoSection label="底部 Sheet（带拖拽手柄）">
      <Button onClick={handleOpen}>打开 Sheet</Button>
      <Sheet isOpen={isOpen} onClose={handleClose} placement="bottom" hasHandle>
        <Sheet.Header>
          <Sheet.Heading>筛选条件</Sheet.Heading>
        </Sheet.Header>
        <Sheet.Body>在这里选择课程类型、时间范围与负责老师。</Sheet.Body>
        <Sheet.Footer>
          <Button variant="ghost" onClick={handleClose}>
            重置
          </Button>
          <Button onClick={handleClose}>应用</Button>
        </Sheet.Footer>
      </Sheet>
    </DemoSection>
  );
};

const AlertDialogDemo = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);
  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <DemoSection label="危险操作确认">
      <Button variant="danger" onClick={handleOpen}>
        删除记录
      </Button>
      <AlertDialog isOpen={isOpen} onClose={handleClose} size="xs">
        <AlertDialog.Header>
          <AlertDialog.Icon color="danger" aria-hidden="true">
            !
          </AlertDialog.Icon>
          <AlertDialog.Heading>确认删除该辅导记录？</AlertDialog.Heading>
        </AlertDialog.Header>
        <AlertDialog.Body>删除后无法恢复，相关统计数据也会同步更新。</AlertDialog.Body>
        <AlertDialog.Footer>
          <Button variant="ghost" onClick={handleClose}>
            取消
          </Button>
          <Button variant="danger" onClick={handleClose}>
            删除
          </Button>
        </AlertDialog.Footer>
      </AlertDialog>
    </DemoSection>
  );
};

const MenuItemDemo = () => (
  <DemoSection label="菜单项状态" isColumn>
    <MenuItem hasIndicator isSelected selectionMode="single">
      按创建时间排序
    </MenuItem>
    <MenuItem hasIndicator selectionMode="single">
      按更新时间排序
    </MenuItem>
    <MenuItem hasSubmenu>更多操作</MenuItem>
    <MenuItem isDanger>删除</MenuItem>
  </DemoSection>
);

export const aiOverlayDemos: Record<string, ReactNode> = {
  'chat-message': <ChatMessageDemo />,
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
  'alert-dialog': <AlertDialogDemo />,
  'menu-item': <MenuItemDemo />,
};
