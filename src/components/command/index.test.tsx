import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { useState } from 'react';
import Command from './index';

// 完整合法结构（对齐 src/showcase/demos/feedback-nav-demos.tsx 的 CommandDemo）：
// Backdrop(isOpen 打开) → Container → Dialog(aria-label) → InputGroup(SearchField, 自带 aria-label)
// + Collection(Menu, aria-label, 分组 + 命令项)。每个交互件都带可访问名。
const COMMAND_GROUPS = [
  {
    heading: '建议',
    items: [
      { id: 'new-file', label: '新建文件', description: '在当前工作区创建文档', shortcut: '⌘N' },
      { id: 'search', label: '全局搜索', description: '跨页面定位组件与设置', shortcut: '⌘P' },
    ],
  },
  {
    heading: '导航',
    items: [
      { id: 'goto-dashboard', label: '前往工作台', description: '查看团队当前状态' },
      { id: 'goto-settings', label: '前往设置', description: '调整偏好与权限' },
    ],
  },
];

const renderCommand = () =>
  render(
    <Command>
      <Command.Backdrop variant="blur" isOpen onOpenChange={() => {}}>
        <Command.Container size="md">
          <Command.Dialog aria-label="命令面板">
            <Command.InputGroup>
              <Command.InputGroup.Prefix>⌕</Command.InputGroup.Prefix>
              <Command.InputGroup.Input placeholder="搜索命令…" />
              <Command.InputGroup.Suffix>
                <Command.InputGroup.ClearButton />
              </Command.InputGroup.Suffix>
            </Command.InputGroup>
            <Command.Collection aria-label="命令列表" groups={COMMAND_GROUPS} onAction={() => {}} />
            <Command.Footer>方向键移动 · Enter 执行 · Esc 关闭</Command.Footer>
          </Command.Dialog>
        </Command.Container>
      </Command.Backdrop>
    </Command>,
  );

describe('Command', () => {
  it('打开态渲染命令面板：dialog、搜索框、命令列表都在', async () => {
    renderCommand();
    // Dialog 由 aria-label 提供可访问名
    expect(await screen.findByRole('dialog', { name: '命令面板' })).toBeInTheDocument();
    // SearchField 内部 input → role=searchbox（aria-label="Search commands"）
    expect(screen.getByRole('searchbox', { name: 'Search commands' })).toBeInTheDocument();
    // Menu → role=menu（aria-label="命令列表"）
    expect(screen.getByRole('menu', { name: '命令列表' })).toBeInTheDocument();
    // 命令项渲染为 menuitem
    expect(screen.getByRole('menuitem', { name: /新建文件/ })).toBeInTheDocument();
  });

  it('isOpen=false 时不渲染浮层内容', () => {
    render(
      <Command>
        <Command.Backdrop isOpen={false} onOpenChange={() => {}}>
          <Command.Container>
            <Command.Dialog aria-label="命令面板">
              <Command.InputGroup>
                <Command.InputGroup.Input />
              </Command.InputGroup>
              <Command.Collection aria-label="命令列表" groups={COMMAND_GROUPS} />
            </Command.Dialog>
          </Command.Container>
        </Command.Backdrop>
      </Command>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('ClearButton 接入 SearchField clear 槽并清空搜索框', async () => {
    const user = userEvent.setup();
    renderCommand();
    const input = await screen.findByRole('searchbox', { name: 'Search commands' });
    await user.type(input, '设置');
    expect(input).toHaveValue('设置');

    await user.click(screen.getByRole('button', { name: '清空搜索' }));
    expect(input).toHaveValue('');
  });

  it('has no axe a11y violations', async () => {
    renderCommand();
    await screen.findByRole('dialog', { name: '命令面板' });
    // 浮层经 portal 渲染，对 document.body 跑 axe 覆盖命令面板内容。
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it('openShortcut 开启时 Cmd+K / Ctrl+K 触发 onOpen', () => {
    const onOpen = vi.fn();
    render(
      <Command openShortcut="mod+k" onOpen={onOpen}>
        <Command.Backdrop isOpen={false} onOpenChange={() => {}}>
          <Command.Container>
            <Command.Dialog aria-label="命令面板">
              <Command.InputGroup>
                <Command.InputGroup.Input />
              </Command.InputGroup>
              <Command.Collection aria-label="命令列表" groups={COMMAND_GROUPS} />
            </Command.Dialog>
          </Command.Container>
        </Command.Backdrop>
      </Command>,
    );

    // Cmd+K（metaKey）命中
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    expect(onOpen).toHaveBeenCalledTimes(1);
    // Ctrl+K（ctrlKey）同样命中
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    expect(onOpen).toHaveBeenCalledTimes(2);
    // 无修饰键的 k 不应触发
    fireEvent.keyDown(document, { key: 'k' });
    expect(onOpen).toHaveBeenCalledTimes(2);
  });

  it('openShortcut 打开非受控面板：Cmd+K 后 dialog 出现', async () => {
    const ShortcutHarness = () => {
      const [open, setOpen] = useState(false);
      return (
        <Command openShortcut onOpen={() => setOpen(true)}>
          <Command.Backdrop isOpen={open} onOpenChange={setOpen}>
            <Command.Container>
              <Command.Dialog aria-label="命令面板">
                <Command.InputGroup>
                  <Command.InputGroup.Input />
                </Command.InputGroup>
                <Command.Collection aria-label="命令列表" groups={COMMAND_GROUPS} />
              </Command.Dialog>
            </Command.Container>
          </Command.Backdrop>
        </Command>
      );
    };

    render(<ShortcutHarness />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    expect(await screen.findByRole('dialog', { name: '命令面板' })).toBeInTheDocument();
  });

  it('未开启 openShortcut 时 Cmd+K 不触发任何回调', () => {
    const onOpen = vi.fn();
    render(
      <Command onOpen={onOpen}>
        <Command.Backdrop isOpen={false} onOpenChange={() => {}}>
          <Command.Container>
            <Command.Dialog aria-label="命令面板">
              <Command.InputGroup>
                <Command.InputGroup.Input />
              </Command.InputGroup>
              <Command.Collection aria-label="命令列表" groups={COMMAND_GROUPS} />
            </Command.Dialog>
          </Command.Container>
        </Command.Backdrop>
      </Command>,
    );

    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('isDisabled 时即便 openShortcut 开启也不触发 onOpen', () => {
    const onOpen = vi.fn();
    render(
      <Command openShortcut="mod+k" onOpen={onOpen} isDisabled>
        <Command.Backdrop isOpen={false} onOpenChange={() => {}}>
          <Command.Container>
            <Command.Dialog aria-label="命令面板">
              <Command.InputGroup>
                <Command.InputGroup.Input />
              </Command.InputGroup>
              <Command.Collection aria-label="命令列表" groups={COMMAND_GROUPS} />
            </Command.Dialog>
          </Command.Container>
        </Command.Backdrop>
      </Command>,
    );

    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    expect(onOpen).not.toHaveBeenCalled();
  });
});
