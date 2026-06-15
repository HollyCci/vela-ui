import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
});
