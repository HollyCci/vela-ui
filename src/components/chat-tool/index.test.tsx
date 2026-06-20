import { describe, it, expect, vi } from 'vitest';
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

  it('renders the legacy composable trigger from `label` + `status`', () => {
    const { container, getByText } = render(
      <ChatTool label="getWeather" status="success" defaultExpanded>
        <ChatTool.Result>done</ChatTool.Result>
      </ChatTool>,
    );
    expect(getByText('getWeather')).toBeTruthy();
    const root = container.querySelector('.chat-tool');
    expect(root?.getAttribute('data-status')).toBe('success');
  });
});

describe('ChatTool preset mode (Pro API)', () => {
  it('builds the trigger from triggerPrefix + toolName and maps `state` to status', () => {
    const { container, getByText } = render(
      <ChatTool toolName="searchDocs" state="output-available" triggerPrefix="Used tool:" defaultExpanded />,
    );
    // triggerPrefix text + bold tool name both present
    expect(getByText('Used tool:', { exact: false })).toBeTruthy();
    expect(getByText('searchDocs')).toBeTruthy();
    const root = container.querySelector('.chat-tool');
    // output-available -> success
    expect(root?.getAttribute('data-status')).toBe('success');
    expect(root?.getAttribute('data-state')).toBe('output-available');
  });

  it('renders input/output as JSON sections in preset mode', () => {
    const { container } = render(
      <ChatTool
        toolName="searchDocs"
        state="output-available"
        input={{ query: 'HeroUI Pro' }}
        output={{ matches: 3 }}
        defaultExpanded
      />,
    );
    const args = container.querySelector('.chat-tool__args');
    const result = container.querySelector('.chat-tool__result');
    expect(args?.textContent).toContain('"query"');
    expect(result?.textContent).toContain('"matches"');
  });

  it('renders errorText only for output-error state', () => {
    const { container } = render(
      <ChatTool toolName="fetchPage" state="output-error" errorText="Request timed out after 30s" defaultExpanded />,
    );
    const error = container.querySelector('.chat-tool__error');
    expect(error?.textContent).toContain('Request timed out after 30s');
  });

  it('wires onApprove / onReject in requires-action state', () => {
    const onApprove = vi.fn();
    const onReject = vi.fn();
    const { getByText } = render(
      <ChatTool
        toolName="sendEmail"
        state="requires-action"
        triggerPrefix="Approval needed:"
        onApprove={onApprove}
        onReject={onReject}
        defaultExpanded
      />,
    );
    fireEvent.click(getByText('Approve'));
    fireEvent.click(getByText('Reject'));
    expect(onApprove).toHaveBeenCalledTimes(1);
    expect(onReject).toHaveBeenCalledTimes(1);
  });

  it('prefers children over preset content when both could apply', () => {
    const { container, getByText } = render(
      <ChatTool toolName="getWeather" state="output-available" output={{ matches: 3 }} defaultExpanded>
        <ChatTool.Result>custom child</ChatTool.Result>
      </ChatTool>,
    );
    expect(getByText('custom child')).toBeTruthy();
    // preset output not auto-rendered when children present
    expect(container.querySelectorAll('.chat-tool__result')).toHaveLength(1);
    expect(container.querySelector('.chat-tool__result')?.textContent).not.toContain('"matches"');
  });

  it('has no axe a11y violations in preset approval mode', async () => {
    const { container } = render(
      <ChatTool
        toolName="sendEmail"
        state="requires-action"
        triggerPrefix="Approval needed:"
        input={{ to: 'team@acme.com' }}
        onApprove={() => {}}
        onReject={() => {}}
        defaultExpanded
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('ChatTool.Args / Result (Pro props)', () => {
  it('Args renders `input` as JSON and supports a custom `label`', () => {
    const { container, getByText } = render(
      <ChatTool.Args input={{ query: 'HeroUI Pro' }} label="Input" />,
    );
    expect(getByText('Input')).toBeTruthy();
    expect(container.querySelector('.chat-tool__args')?.textContent).toContain('"query"');
  });

  it('Result renders `value` as JSON and supports a custom `label`', () => {
    const { container, getByText } = render(<ChatTool.Result value={{ matches: 3 }} label="Result" />);
    expect(getByText('Result')).toBeTruthy();
    expect(container.querySelector('.chat-tool__result')?.textContent).toContain('"matches"');
  });

  it('Args falls back to children when no `input` provided (back-compat)', () => {
    const { getByText } = render(<ChatTool.Args>raw children</ChatTool.Args>);
    expect(getByText('raw children')).toBeTruthy();
    // default CN label preserved for legacy callers
    expect(getByText('参数')).toBeTruthy();
  });
});

describe('ChatTool.StatusIcon (Pro slot)', () => {
  it('renders a status indicator slot', () => {
    const { container } = render(<ChatTool.StatusIcon status="success" />);
    const slot = container.querySelector('.chat-tool__status');
    expect(slot).not.toBeNull();
    expect(slot?.querySelector('.chat-tool__status-indicator')).not.toBeNull();
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
