import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NumberField from './index';

describe('NumberField', () => {
  it('renders a spinbutton with number-field class and label', () => {
    render(<NumberField label="数量" defaultValue={5} />);
    const input = screen.getByRole('textbox', { name: '数量' });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('data-slot', 'number-field-input');
    const root = input.closest('.number-field');
    expect(root).toBeInTheDocument();
  });

  it('renders increment and decrement buttons with default aria labels', () => {
    render(<NumberField aria-label="数量" defaultValue={1} />);
    expect(screen.getByRole('button', { name: '增加' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '减少' })).toBeInTheDocument();
  });

  it('applies secondary variant and full-width classes', () => {
    const { container } = render(
      <NumberField aria-label="x" variant="secondary" isFullWidth defaultValue={0} />,
    );
    const root = container.querySelector('.number-field');
    expect(root).toHaveClass('number-field--secondary', 'number-field--full-width');
  });

  it('increments and decrements value via buttons, firing onValueChange', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <NumberField
        aria-label="数量"
        defaultValue={5}
        minValue={0}
        maxValue={10}
        step={1}
        onValueChange={onValueChange}
      />,
    );
    const input = screen.getByRole('textbox', { name: '数量' }) as HTMLInputElement;
    await user.click(screen.getByRole('button', { name: '增加' }));
    expect(onValueChange).toHaveBeenLastCalledWith(6);
    await user.click(screen.getByRole('button', { name: '减少' }));
    expect(onValueChange).toHaveBeenLastCalledWith(5);
    expect(input.value).toBe('5');
  });

  it('respects controlled value', () => {
    render(
      <NumberField aria-label="数量" value={42} onValueChange={() => {}} />,
    );
    expect((screen.getByRole('textbox', { name: '数量' }) as HTMLInputElement).value).toBe(
      '42',
    );
  });

  it('reflects disabled state', () => {
    render(<NumberField aria-label="x" isDisabled defaultValue={0} />);
    expect(screen.getByRole('textbox', { name: 'x' })).toBeDisabled();
  });

  it('supports compound composition', () => {
    const { container } = render(
      <NumberField defaultValue={3}>
        <NumberField.Label>题量</NumberField.Label>
        <NumberField.Group>
          <NumberField.DecrementButton />
          <NumberField.Input />
          <NumberField.IncrementButton />
        </NumberField.Group>
      </NumberField>,
    );
    // 标签与受控输入框均渲染（RAC 处理 id/htmlFor 关联，断言放宽到结构/文本）
    expect(screen.getByText('题量')).toHaveAttribute('data-slot', 'label');
    const input = container.querySelector('.number-field__input');
    expect(input).toHaveAttribute('data-slot', 'number-field-input');
    expect((input as HTMLInputElement).value).toBe('3');
  });
});
