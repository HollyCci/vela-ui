import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { axe } from 'vitest-axe';
import ChatTool, { ChatToolGroup } from './index';

describe('ChatTool', () => {
  it('has no axe a11y violations', async () => {
    const { container } = render(
      <ChatTool label="search_web" status="success" statusLabel="Done" defaultExpanded>
        <ChatTool.Args>{'{ "query": "weather" }'}</ChatTool.Args>
        <ChatTool.Result>Sunny, 24°C</ChatTool.Result>
      </ChatTool>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('ChatTool.Group', () => {
  it('renders a shared container wrapping the child ChatTool cards', () => {
    const { container, getByText } = render(
      <ChatTool.Group>
        <ChatTool label="读取学习记录" status="success" defaultExpanded>
          <ChatTool.Result>读取完成。</ChatTool.Result>
        </ChatTool>
        <ChatTool label="发送提醒" status="requires-action" />
      </ChatTool.Group>,
    );

    const group = container.querySelector('.chat-tool-group');
    expect(group).not.toBeNull();
    const body = group?.querySelector('.chat-tool-group__content-body');
    expect(body).not.toBeNull();
    // 子卡片落在分组容器内
    expect(body?.querySelectorAll('.chat-tool')).toHaveLength(2);
    expect(getByText('读取学习记录')).toBeTruthy();
    expect(getByText('发送提醒')).toBeTruthy();
  });

  it('renders an expandable group header when a label is provided', () => {
    const { container } = render(
      <ChatTool.Group label="家长通知流程">
        <ChatTool label="读取学习记录" status="success" />
      </ChatTool.Group>,
    );

    const trigger = container.querySelector<HTMLButtonElement>('.chat-tool-group__trigger');
    expect(trigger).not.toBeNull();
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');

    const content = container.querySelector('.chat-tool-group__content');
    expect(content?.getAttribute('data-expanded')).toBe('true');

    fireEvent.click(trigger as HTMLButtonElement);
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    expect(content?.getAttribute('data-expanded')).toBe('false');
  });

  it('exposes the same component via the named ChatToolGroup export', () => {
    expect(ChatToolGroup).toBe(ChatTool.Group);
  });

  it('has no axe a11y violations', async () => {
    const { container } = render(
      <ChatTool.Group label="家长通知流程" defaultExpanded>
        <ChatTool label="读取学习记录" status="success" defaultExpanded>
          <ChatTool.Result>读取完成。</ChatTool.Result>
        </ChatTool>
      </ChatTool.Group>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
