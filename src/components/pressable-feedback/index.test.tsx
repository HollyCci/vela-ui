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
