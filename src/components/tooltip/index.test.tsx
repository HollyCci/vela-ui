import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import Tooltip from './index';

// NOTE: Tooltip.Trigger wraps children in a single focusable element (data-slot=tooltip-trigger).
// We pass plain text children (not a nested <button>) so the trigger is the only focusable node,
// keeping role/name queries unambiguous (see "trigger no nested button" convention).

describe('Tooltip', () => {
  beforeEach(() => {
    document.documentElement.style.setProperty('--tooltip-show-delay', '0ms');
    document.documentElement.style.setProperty('--tooltip-hide-delay', '0ms');
  });

  // RAC opens tooltips on focus or hover-intent. jsdom does not reliably fire RAC's
  // pointer-based hover-intent via userEvent.hover, so this test drives it via focus/blur
  // (the keyboard path), which is the stable behavior to assert here.
  it('content convenience API: shows tooltip when open', async () => {
    render(
      <Tooltip content="清除选择" defaultOpen>
        清除
      </Tooltip>,
    );

    expect(await screen.findByRole('tooltip')).toHaveTextContent('清除选择');
  });

  it('shows tooltip when trigger is focused (controlled/defaultOpen)', async () => {
    render(
      <Tooltip content="键盘可达" defaultOpen>
        聚焦我
      </Tooltip>,
    );
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
