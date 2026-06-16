import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import Tooltip from './index';

// NOTE: Tooltip.Trigger wraps children in a single focusable element (data-slot=tooltip-trigger).
// We pass plain text children (not a nested <button>) so the trigger is the only focusable node,
// keeping role/name queries unambiguous (see "trigger no nested button" convention).

describe('Tooltip', () => {
  // RAC opens tooltips on focus or hover-intent. jsdom does not reliably fire RAC's
  // pointer-based hover-intent via userEvent.hover, so this test drives it via focus/blur
  // (the keyboard path), which is the stable behavior to assert here.
  it('content convenience API: shows tooltip on focus, hides on blur', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="清除选择" delay={0} closeDelay={0}>
        清除
      </Tooltip>,
    );

    expect(screen.queryByText('清除选择')).not.toBeInTheDocument();

    await user.tab();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('清除选择');

    await user.tab();
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });

  it('shows tooltip on keyboard focus of the trigger', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="键盘可达" delay={0} closeDelay={0}>
        聚焦我
      </Tooltip>,
    );
    await user.tab();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('键盘可达');
  });

  it('compound API renders trigger and exposes tooltip role when open via isOpen', async () => {
    render(
      <Tooltip isOpen>
        <Tooltip.Trigger>trig</Tooltip.Trigger>
        <Tooltip.Content>提示正文</Tooltip.Content>
      </Tooltip>,
    );
    expect(screen.getByText('trig')).toBeInTheDocument();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('提示正文');
  });

  it('trigger output carries tooltip__trigger class and data-slot', () => {
    render(
      <Tooltip content="x" delay={0}>
        hover-me
      </Tooltip>,
    );
    const trigger = screen.getByText('hover-me');
    expect(trigger).toHaveClass('tooltip__trigger');
    expect(trigger).toHaveAttribute('data-slot', 'tooltip-trigger');
  });

  it('has no axe a11y violations', async () => {
    // 打开态（isOpen）：trigger 文本可达，role=tooltip 浮层经 portal 渲染。
    // 对 document.body 跑 axe 覆盖触发器 + tooltip 浮层。
    render(
      <Tooltip isOpen>
        <Tooltip.Trigger>清除选择</Tooltip.Trigger>
        <Tooltip.Content>清除当前选择的全部项目</Tooltip.Content>
      </Tooltip>,
    );
    await screen.findByRole('tooltip');
    // 关闭页面级 region 规则：tooltip 浮层经 portal 直挂 body，孤立测试无 landmark 容器，
    // 这是页面结构最佳实践（消费方页面的事），非组件自身 ARIA/角色/可访问名缺陷。
    expect(
      await axe(document.body, { rules: { region: { enabled: false } } }),
    ).toHaveNoViolations();
  });
});
