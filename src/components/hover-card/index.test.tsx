import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HoverCard from './index';

const renderCard = (
  props: Partial<React.ComponentProps<typeof HoverCard>> = {},
  triggerChild: React.ReactNode = '触发器',
) =>
  render(
    <HoverCard openDelay={0} closeDelay={0} {...props}>
      <HoverCard.Trigger>{triggerChild}</HoverCard.Trigger>
      <HoverCard.Content placement="bottom">
        <div>卡片内容</div>
      </HoverCard.Content>
    </HoverCard>,
  );

describe('HoverCard', () => {
  it('renders the trigger with hover-card__trigger class and data-slot', () => {
    renderCard();
    const trigger = screen.getByText('触发器');
    expect(trigger).toHaveClass('hover-card__trigger');
    expect(trigger).toHaveAttribute('data-slot', 'hover-card-trigger');
  });

  it('open controlled prop renders the content immediately', async () => {
    renderCard({ open: true });
    expect(await screen.findByText('卡片内容')).toBeInTheDocument();
  });

  // ── Regression (fix: 支持 HoverCard 键盘触发) ──────────────────────────────
  // A non-focusable child (plain text) means the trigger wrapper itself must be
  // made focusable via tabIndex=0 so keyboard users can reach it.
  it('REGRESSION: makes trigger focusable (tabIndex=0) when child is not natively focusable', () => {
    renderCard({}, '纯文本');
    expect(screen.getByText('纯文本')).toHaveAttribute('tabindex', '0');
  });

  // A natively focusable child (a button / anchor) already takes focus, so the
  // wrapper must NOT add its own tabIndex (would create a duplicate tab stop).
  it('REGRESSION: does not add tabIndex to trigger when child is natively focusable (button)', () => {
    renderCard({}, <button type="button">内部按钮</button>);
    const trigger = screen.getByText('内部按钮').closest('[data-slot="hover-card-trigger"]');
    expect(trigger).not.toBeNull();
    expect(trigger).not.toHaveAttribute('tabindex');
  });

  it('REGRESSION: anchor with href counts as focusable (no wrapper tabIndex)', () => {
    renderCard({}, <a href="/x">链接</a>);
    const trigger = screen.getByText('链接').closest('[data-slot="hover-card-trigger"]');
    expect(trigger).not.toHaveAttribute('tabindex');
  });

  // The fix added Enter/Space keydown handling to open the card from the keyboard.
  it('REGRESSION: pressing Enter on the trigger opens the card', async () => {
    const user = userEvent.setup();
    renderCard();
    expect(screen.queryByText('卡片内容')).not.toBeInTheDocument();

    const trigger = screen.getByText('触发器');
    trigger.focus();
    await user.keyboard('{Enter}');
    expect(await screen.findByText('卡片内容')).toBeInTheDocument();
  });

  it('REGRESSION: pressing Space on the trigger opens the card', async () => {
    const user = userEvent.setup();
    renderCard();
    const trigger = screen.getByText('触发器');
    trigger.focus();
    await user.keyboard('[Space]');
    expect(await screen.findByText('卡片内容')).toBeInTheDocument();
  });

  // The fix preserved Escape-to-close handling alongside the new open keys.
  it('REGRESSION: Escape on the trigger closes an open card', async () => {
    const user = userEvent.setup();
    renderCard({ defaultOpen: true });
    expect(await screen.findByText('卡片内容')).toBeInTheDocument();

    const trigger = screen.getByText('触发器');
    trigger.focus();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByText('卡片内容')).not.toBeInTheDocument());
  });

  it('honours an explicit tabIndex override on the trigger', () => {
    render(
      <HoverCard openDelay={0} closeDelay={0}>
        <HoverCard.Trigger tabIndex={-1}>纯文本</HoverCard.Trigger>
        <HoverCard.Content>
          <div>卡片内容</div>
        </HoverCard.Content>
      </HoverCard>,
    );
    expect(screen.getByText('纯文本')).toHaveAttribute('tabindex', '-1');
  });
});
