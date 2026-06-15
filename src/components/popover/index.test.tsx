import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Popover from './index';

describe('Popover', () => {
  it('renders trigger, opens dialog content on click, closes on Escape', async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <Popover.Trigger>查看说明</Popover.Trigger>
        <Popover.Content placement="bottom">
          <Popover.Dialog>
            <Popover.Heading>排班规则</Popover.Heading>
            <p>每天最多 8 节。</p>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>,
    );

    const trigger = screen.getByRole('button', { name: '查看说明' });
    expect(trigger).toBeInTheDocument();
    // content is not mounted before opening
    expect(screen.queryByText('排班规则')).not.toBeInTheDocument();

    await user.click(trigger);
    // portal content: query globally via screen
    expect(await screen.findByText('排班规则')).toBeInTheDocument();
    expect(screen.getByText('每天最多 8 节。')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await screen.findByRole('button', { name: '查看说明' });
    expect(screen.queryByText('排班规则')).not.toBeInTheDocument();
  });

  it('trigger carries popover__trigger BEM class', () => {
    render(
      <Popover>
        <Popover.Trigger>more</Popover.Trigger>
        <Popover.Content>
          <Popover.Dialog>x</Popover.Dialog>
        </Popover.Content>
      </Popover>,
    );
    expect(screen.getByRole('button', { name: 'more' })).toHaveClass('popover__trigger');
  });

  it('convenience `trigger` prop renders trigger and dialog wrapper with popover BEM classes', async () => {
    const user = userEvent.setup();
    render(
      <Popover trigger="more" className="custom-dialog">
        <span>气泡正文</span>
      </Popover>,
    );

    const trigger = screen.getByRole('button', { name: 'more' });
    await user.click(trigger);

    const body = await screen.findByText('气泡正文');
    expect(body).toBeInTheDocument();
    // Dialog carries popover__dialog + the className passed via `className`
    const dialog = body.closest('.popover__dialog');
    expect(dialog).not.toBeNull();
    expect(dialog).toHaveClass('custom-dialog');
  });
});
