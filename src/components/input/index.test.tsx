import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from './index';

describe('Input', () => {
  it('renders a textbox with input BEM class and data-slot', () => {
    render(<Input aria-label="姓名" />);
    const field = screen.getByRole('textbox', { name: '姓名' });
    expect(field).toBeInTheDocument();
    expect(field).toHaveClass('input');
    expect(field).toHaveAttribute('data-slot', 'input-field');
  });

  it('associates label, description with the field', () => {
    render(<Input label="邮箱" description="必填项" />);
    const field = screen.getByRole('textbox', { name: '邮箱' });
    expect(field).toBeInTheDocument();
    expect(screen.getByText('必填项')).toHaveAttribute('data-slot', 'description');
  });

  it('applies secondary variant and full-width classes', () => {
    render(<Input aria-label="x" variant="secondary" isFullWidth />);
    const field = screen.getByRole('textbox', { name: 'x' });
    expect(field).toHaveClass('input--secondary', 'input--full-width');
  });

  it('marks field invalid via data-invalid and aria-invalid', () => {
    render(<Input aria-label="x" isInvalid errorMessage="格式错误" />);
    const field = screen.getByRole('textbox', { name: 'x' });
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAttribute('data-invalid', 'true');
  });

  it('reflects disabled state', () => {
    render(<Input aria-label="x" isDisabled />);
    expect(screen.getByRole('textbox', { name: 'x' })).toBeDisabled();
  });

  it('accepts user typing and fires onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input aria-label="搜索" onChange={onChange} />);
    const field = screen.getByRole('textbox', { name: '搜索' }) as HTMLInputElement;
    await user.type(field, 'abc');
    expect(field.value).toBe('abc');
    expect(onChange).toHaveBeenCalled();
  });

  it('supports compound (children) composition via subcomponents', () => {
    render(
      <Input aria-label="复合">
        <Input.Label>用户名</Input.Label>
        <Input.Field />
        <Input.Description>提示</Input.Description>
      </Input>,
    );
    expect(screen.getByRole('textbox', { name: '用户名' })).toHaveAttribute(
      'data-slot',
      'input-field',
    );
    expect(screen.getByText('提示')).toHaveAttribute('data-slot', 'description');
  });
});
