import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import Tabs from './index';

const ITEMS = [
  { key: 'overview', title: '概览', content: '概览内容' },
  { key: 'members', title: '成员', content: '成员内容' },
  { key: 'archive', title: '归档', content: '归档内容', isDisabled: true },
];

describe('Tabs', () => {
  it('renders a tablist and panels from items', () => {
    render(<Tabs items={ITEMS} aria-label="项目" />);
    const tablist = screen.getByRole('tablist', { name: '项目' });
    expect(tablist).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '概览' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '成员' })).toBeInTheDocument();
  });

  it('disabled item renders a disabled tab', () => {
    render(<Tabs items={ITEMS} aria-label="项目" />);
    const archive = screen.getByRole('tab', { name: '归档' });
    expect(archive).toHaveAttribute('aria-disabled', 'true');
  });

  it('onChange fires with the selected key string', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Tabs items={ITEMS} aria-label="项目" defaultSelectedKey="overview" onChange={onChange} />);

    await user.click(screen.getByRole('tab', { name: '成员' }));
    expect(onChange).toHaveBeenCalledWith('members');
  });

  it('controlled selectedKey shows the matching panel content', () => {
    const { rerender } = render(
      <Tabs items={ITEMS} aria-label="项目" selectedKey="overview" onChange={() => undefined} />,
    );
    expect(screen.getByText('概览内容')).toBeInTheDocument();

    rerender(<Tabs items={ITEMS} aria-label="项目" selectedKey="members" onChange={() => undefined} />);
    expect(screen.getByText('成员内容')).toBeInTheDocument();
  });

  it('secondary variant adds the modifier class on the root', () => {
    const { container } = render(<Tabs items={ITEMS} aria-label="项目" variant="secondary" />);
    expect(container.querySelector('[data-slot="tabs"]')).toHaveClass('tabs--secondary');
  });

  it('supports compound children API', () => {
    render(
      <Tabs aria-label="区块" defaultSelectedKey="a">
        <Tabs.List aria-label="区块列表">
          <Tabs.Tab id="a">甲</Tabs.Tab>
          <Tabs.Tab id="b">乙</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel id="a">甲面板</Tabs.Panel>
        <Tabs.Panel id="b">乙面板</Tabs.Panel>
      </Tabs>,
    );
    expect(screen.getByRole('tab', { name: '甲' })).toBeInTheDocument();
    expect(screen.getByText('甲面板')).toBeInTheDocument();
    // 非选中面板默认不渲染内容
    expect(screen.queryByText('乙面板')).toBeNull();
  });

  it('has no axe a11y violations', async () => {
    const { container } = render(<Tabs items={ITEMS} aria-label="项目" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
