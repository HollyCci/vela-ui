import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Stepper from './index';

const STEPS = ['账户', '资料', '完成'];

const renderStepper = (props?: Record<string, unknown>) =>
  render(
    <Stepper {...props}>
      {STEPS.map((title) => (
        <Stepper.Step key={title}>
          <Stepper.Indicator />
          <Stepper.Content>
            <Stepper.Title>{title}</Stepper.Title>
          </Stepper.Content>
        </Stepper.Step>
      ))}
    </Stepper>,
  );

describe('Stepper', () => {
  it('renders an ordered list with default aria-label', () => {
    renderStepper();
    const list = screen.getByRole('list', { name: 'Progress' });
    expect(list).toHaveClass('stepper');
    expect(list).toHaveAttribute('data-slot', 'stepper');
  });

  it('derives per-step status from currentStep', () => {
    renderStepper({ currentStep: 1 });
    const steps = document.querySelectorAll('[data-slot="stepper-step"]');
    expect(steps[0]).toHaveAttribute('data-status', 'complete');
    expect(steps[1]).toHaveAttribute('data-status', 'active');
    expect(steps[2]).toHaveAttribute('data-status', 'inactive');
  });

  it('active step button carries aria-current=step', () => {
    renderStepper({ currentStep: 1 });
    const active = document.querySelector('[data-slot="stepper-step-button"][aria-current="step"]');
    expect(active).not.toBeNull();
    expect(within(active as HTMLElement).getByText('资料')).toBeInTheDocument();
  });

  it('renders static spans (no buttons) when not interactive', () => {
    renderStepper({ currentStep: 0 });
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('onStepChange makes steps clickable and fires the clicked index', async () => {
    const user = userEvent.setup();
    const onStepChange = vi.fn();
    renderStepper({ currentStep: 0, onStepChange });

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(STEPS.length);
    expect(buttons[0]).toHaveAttribute('data-clickable', 'true');

    await user.click(buttons[2]);
    expect(onStepChange).toHaveBeenCalledTimes(1);
    expect(onStepChange).toHaveBeenCalledWith(2);
  });

  it('non-controlled defaultStep drives initial active step', () => {
    renderStepper({ defaultStep: 2 });
    const steps = document.querySelectorAll('[data-slot="stepper-step"]');
    expect(steps[2]).toHaveAttribute('data-status', 'active');
  });

  it('completed step indicator renders the checkmark, others render the number', () => {
    renderStepper({ currentStep: 1 });
    // step 0 完成 -> 对勾
    expect(document.querySelector('[data-slot="stepper-default-checkmark"]')).not.toBeNull();
    // step 2 inactive -> 序号 3
    const indicators = document.querySelectorAll('[data-slot="stepper-indicator"]');
    expect(indicators[2]).toHaveTextContent('3');
  });
});
