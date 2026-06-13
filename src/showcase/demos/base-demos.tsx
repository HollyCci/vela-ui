import { useState, type ReactNode } from 'react';
import {
  ActionBar,
  Alert,
  Avatar,
  Badge,
  BadgeAnchor,
  Button,
  Card,
  Chip,
  Kbd,
  Separator,
  Skeleton,
  Spinner,
  Toolbar,
} from '../../components';
import {
  Button as UIButton,
  Chip as UIChip,
  ListBox,
  Select,
  Separator as UISeparator,
  Tooltip as UITooltip,
} from '@heroui/react';
import type { Key } from 'react-aria-components';
import DemoSection from '../demo-section';

const SELECT_OPTIONS = [
  { id: 'react', label: 'React' },
  { id: 'vue', label: 'Vue' },
  { id: 'svelte', label: 'Svelte' },
  { id: 'solid', label: 'Solid' },
];

const SelectDemo = () => {
  const [framework, setFramework] = useState<Key | null>('react');
  const handleChange = (value: Key | null) => setFramework(value);
  const current = SELECT_OPTIONS.find((o) => o.id === framework)?.label ?? '未选择';

  return (
    <DemoSection label="受控单选（点击打开真实弹层）">
      <Select aria-label="框架" value={framework} onChange={handleChange} style={{ width: 220 }}>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {SELECT_OPTIONS.map((option) => (
              <ListBox.Item key={option.id} id={option.id} textValue={option.label}>
                {option.label}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
      <span>当前：{current}</span>
    </DemoSection>
  );
};
SelectDemo.displayName = 'SelectDemo';

const ButtonDemo = () => (
  <>
    <DemoSection label="variants">
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="tertiary">Tertiary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="danger-soft">Danger Soft</Button>
    </DemoSection>
    <DemoSection label="sizes">
      <Button size="sm">Small</Button>
      <Button>Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="sm" variant="ghost" isIconOnly aria-label="关闭">
        ✕
      </Button>
    </DemoSection>
  </>
);

const BadgeDemo = () => (
  <DemoSection>
    <Badge>1</Badge>
    <Badge color="accent">12</Badge>
    <Badge color="success" variant="soft">
      99+
    </Badge>
    <Badge color="danger">3</Badge>
    <BadgeAnchor>
      <Avatar fallback="WC" />
      <Badge color="danger" size="sm" placement="top-right">
        2
      </Badge>
    </BadgeAnchor>
  </DemoSection>
);

const ChipDemo = () => (
  <DemoSection>
    <Chip>Default</Chip>
    <Chip color="accent">Accent</Chip>
    <Chip color="success">Success</Chip>
    <Chip color="warning" variant="tertiary">
      Warning
    </Chip>
    <Chip color="danger" size="sm">
      Danger
    </Chip>
  </DemoSection>
);

const AlertDemo = () => (
  <DemoSection isColumn>
    <Alert title="默认提示" description="这是一条默认的提示信息。" indicator="ℹ︎" />
    <Alert color="success" title="操作成功" description="数据已保存。" indicator="✓" />
    <Alert color="warning" title="注意" description="该操作不可撤销。" indicator="⚠︎" />
    <Alert color="danger" title="出错了" description="网络请求失败，请重试。" indicator="✕" />
  </DemoSection>
);

const AvatarDemo = () => (
  <DemoSection>
    <Avatar size="sm" fallback="SM" />
    <Avatar fallback="WC" color="accent" />
    <Avatar size="lg" fallback="LG" color="success" isSoft />
    <Avatar src="https://i.pravatar.cc/80?img=12" alt="用户头像" fallback="U" />
  </DemoSection>
);

const SpinnerDemo = () => (
  <DemoSection>
    <Spinner size="sm" />
    <Spinner />
    <Spinner size="lg" color="success" />
    <Spinner size="xl" color="danger" />
  </DemoSection>
);

const SkeletonDemo = () => (
  <DemoSection isColumn>
    <Skeleton style={{ width: 240, height: 16 }} />
    <Skeleton style={{ width: 360, height: 16 }} animation="shimmer" />
    <Skeleton style={{ width: 64, height: 64, borderRadius: '50%' }} />
  </DemoSection>
);

const KbdDemo = () => (
  <DemoSection>
    <Kbd abbr="⌘">K</Kbd>
    <Kbd abbr="⇧">P</Kbd>
    <Kbd isLight>Esc</Kbd>
  </DemoSection>
);

const CardDemo = () => (
  <DemoSection>
    <Card style={{ width: 320 }}>
      <Card.Header>
        <Card.Title>项目周报</Card.Title>
        <Card.Description>本周交付进展与风险同步</Card.Description>
      </Card.Header>
      <Card.Content>完成组件库样式迁移，覆盖 153 个组件。</Card.Content>
      <Card.Footer>
        <Button size="sm">查看详情</Button>
      </Card.Footer>
    </Card>
  </DemoSection>
);

const SeparatorDemo = () => (
  <DemoSection isColumn>
    <span>上方内容</span>
    <Separator />
    <span>下方内容</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 24 }}>
      <span>左</span>
      <Separator orientation="vertical" />
      <span>右</span>
    </div>
  </DemoSection>
);

const ToolbarDemo = () => (
  <DemoSection>
    <Toolbar isAttached>
      <Button size="sm" variant="ghost">
        复制
      </Button>
      <Button size="sm" variant="ghost">
        粘贴
      </Button>
      <Separator orientation="vertical" />
      <Button size="sm" variant="ghost">
        删除
      </Button>
    </Toolbar>
  </DemoSection>
);

const XmarkIcon = () => (
  <svg
    aria-hidden="true"
    fill="none"
    height="16"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    width="16"
  >
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
XmarkIcon.displayName = 'XmarkIcon';

/** 原站 anatomy 同构：OSS Chip/Button/Separator/Tooltip 填充 ActionBar 各分区 */
const ActionBarDemo = () => {
  const [isOpen, setIsOpen] = useState(false);
  const handleToggle = () => setIsOpen((v) => !v);
  const handleClose = () => setIsOpen(false);

  return (
    <DemoSection>
      <UIButton variant="secondary" onPress={handleToggle}>
        {isOpen ? '隐藏' : '显示'} Action Bar
      </UIButton>
      <ActionBar isOpen={isOpen}>
        <ActionBar.Prefix>
          <UIChip color="accent" size="sm">
            2
          </UIChip>
          <ActionBar.Label>已选择</ActionBar.Label>
        </ActionBar.Prefix>
        <UISeparator />
        <ActionBar.Content>
          <UIButton size="sm" variant="ghost">
            编辑
          </UIButton>
          <UIButton size="sm" variant="ghost">
            导出
          </UIButton>
          <UIButton className="text-danger" size="sm" variant="ghost">
            删除
          </UIButton>
        </ActionBar.Content>
        <UISeparator />
        <ActionBar.Suffix>
          <UITooltip>
            <UIButton aria-label="清除选择" isIconOnly size="sm" variant="ghost" onPress={handleClose}>
              <XmarkIcon />
            </UIButton>
            <UITooltip.Content>清除选择</UITooltip.Content>
          </UITooltip>
        </ActionBar.Suffix>
      </ActionBar>
    </DemoSection>
  );
};

export const baseDemos: Record<string, ReactNode> = {
  button: <ButtonDemo />,
  badge: <BadgeDemo />,
  chip: <ChipDemo />,
  alert: <AlertDemo />,
  avatar: <AvatarDemo />,
  spinner: <SpinnerDemo />,
  skeleton: <SkeletonDemo />,
  kbd: <KbdDemo />,
  card: <CardDemo />,
  separator: <SeparatorDemo />,
  toolbar: <ToolbarDemo />,
  'action-bar': <ActionBarDemo />,
  select: <SelectDemo />,
};
