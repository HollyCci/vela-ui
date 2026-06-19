import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import PressableFeedback from './index';

beforeEach(() => {
  // WAAPI: jsdom 不实现 Element.animate；Ripple 用 surface.animate，需要桩
  if (!(Element.prototype as unknown as { animate?: unknown }).animate) {
    (Element.prototype as unknown as { animate: () => unknown }).animate = () => ({
      cancel() {},
      finish() {},
    });
  }
});

describe('PressableFeedback', () => {
  it('renders a RAC button with BEM class and data-slot', () => {
    render(<PressableFeedback aria-label="press">Tap</PressableFeedback>);
    const btn = screen.getByRole('button', { name: 'press' });
    expect(btn).toHaveClass('pressable-feedback');
    expect(btn).toHaveAttribute('data-slot', 'pressable-feedback');
  });

  it('fires onPress when clicked', async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(
      <PressableFeedback aria-label="press" onPress={onPress}>
        Tap
      </PressableFeedback>,
    );
    await user.click(screen.getByRole('button', { name: 'press' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('Ripple grows and shows --press on keyboard activation (Space/Enter)', async () => {
    // WAAPI 在 jsdom 无实现，桩出 animate 以观测扩散是否触发（同既有桩策略）
    const animateSpy = vi.fn(() => ({ cancel() {}, finish() {} }));
    (Element.prototype as unknown as { animate: typeof animateSpy }).animate = animateSpy;
    const user = userEvent.setup();
    render(
      <PressableFeedback aria-label="press">
        <PressableFeedback.Ripple minimumPressDuration={0} />
        Tap
      </PressableFeedback>,
    );
    const btn = screen.getByRole('button', { name: 'press' });
    const surface = btn.querySelector('.pressable-feedback__ripple-surface') as HTMLElement;

    btn.focus();
    animateSpy.mockClear();

    // 键盘按下：宿主获得 RAC 的 data-pressed，波纹应居中扩散并加 --press 类
    await user.keyboard('{Enter>}');
    expect(animateSpy).toHaveBeenCalledTimes(1);
    expect(surface.classList.contains('--press')).toBe(true);
    expect(btn).toHaveAttribute('data-pressed', 'true');

    // 松开后 --press 解除（minimumPressDuration=0 立即移除）
    await user.keyboard('{/Enter}');
    expect(surface.classList.contains('--press')).toBe(false);
  });

  it('renders feedback sub-layers with correct data-slot and aria-hidden', () => {
    render(
      <PressableFeedback aria-label="press">
        <PressableFeedback.Highlight />
        <PressableFeedback.Ripple />
        <PressableFeedback.HoldConfirm />
        <PressableFeedback.ProgressFeedback />
        Tap
      </PressableFeedback>,
    );
    const btn = screen.getByRole('button', { name: 'press' });
    const highlight = btn.querySelector('[data-slot="pressable-feedback-highlight"]');
    const hold = btn.querySelector('[data-slot="pressable-feedback-hold-confirm"]');
    const progress = btn.querySelector('[data-slot="pressable-feedback-progress-feedback"]');
    expect(highlight).toHaveClass('pressable-feedback__highlight');
    expect(highlight).toHaveAttribute('aria-hidden', 'true');
    expect(btn.querySelector('.pressable-feedback__ripple')).toBeInTheDocument();
    expect(hold).toHaveAttribute('data-sweep', 'right');
    expect(progress).toHaveAttribute('data-sweep', 'right');
  });

  it('HoldConfirm writes duration CSS variables and honors sweep prop', () => {
    render(
      <PressableFeedback aria-label="hold">
        <PressableFeedback.HoldConfirm duration={1500} releaseDuration={300} sweep="left" />
      </PressableFeedback>,
    );
    const hold = screen
      .getByRole('button', { name: 'hold' })
      .querySelector('[data-slot="pressable-feedback-hold-confirm"]') as HTMLElement;
    expect(hold).toHaveAttribute('data-sweep', 'left');
    expect(hold.style.getPropertyValue('--pressable-feedback-hold-confirm-duration')).toBe('1500ms');
    expect(
      hold.style.getPropertyValue('--pressable-feedback-hold-confirm-release-duration'),
    ).toBe('300ms');
  });

  it('ProgressFeedback writes duration CSS variables', () => {
    render(
      <PressableFeedback aria-label="progress">
        <PressableFeedback.ProgressFeedback duration={1200} sweep="down" />
      </PressableFeedback>,
    );
    const progress = screen
      .getByRole('button', { name: 'progress' })
      .querySelector('[data-slot="pressable-feedback-progress-feedback"]') as HTMLElement;
    expect(progress).toHaveAttribute('data-sweep', 'down');
    expect(
      progress.style.getPropertyValue('--pressable-feedback-progress-feedback-duration'),
    ).toBe('1200ms');
  });

  it('has no axe a11y violations', async () => {
    // 按钮的可访问名由消费方提供（aria-label）；反馈层均 aria-hidden，含完整合法结构
    const { container } = render(
      <PressableFeedback aria-label="点赞">
        <PressableFeedback.Highlight />
        <PressableFeedback.Ripple />
        <PressableFeedback.HoldConfirm />
        <PressableFeedback.ProgressFeedback />
        Tap
      </PressableFeedback>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
