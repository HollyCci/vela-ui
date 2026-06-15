import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Textarea from './index';

describe('Textarea', () => {
  it('renders a textbox with textarea BEM class and data-slot', () => {
    render(<Textarea aria-label="备注" />);
    const field = screen.getByRole('textbox', { name: '备注' });
    expect(field.tagName).toBe('TEXTAREA');
    expect(field).toHaveClass('textarea');
    expect(field).toHaveAttribute('data-slot', 'textarea-field');
  });

  it('associates label and description', () => {
    render(<Textarea label="简介" description="最多 200 字" />);
    expect(screen.getByRole('textbox', { name: '简介' })).toBeInTheDocument();
    expect(screen.getByText('最多 200 字')).toHaveAttribute('data-slot', 'description');
  });

  it('applies secondary variant and full-width classes', () => {
    render(<Textarea aria-label="x" variant="secondary" isFullWidth />);
    const field = screen.getByRole('textbox', { name: 'x' });
    expect(field).toHaveClass('textarea--secondary', 'textarea--full-width');
  });

  it('marks field invalid', () => {
    render(<Textarea aria-label="x" isInvalid errorMessage="内容不能为空" />);
    const field = screen.getByRole('textbox', { name: 'x' });
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAttribute('data-invalid', 'true');
  });

  it('reflects disabled state', () => {
    render(<Textarea aria-label="x" isDisabled />);
    expect(screen.getByRole('textbox', { name: 'x' })).toBeDisabled();
  });

  it('accepts user typing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Textarea aria-label="内容" onChange={onChange} />);
    const field = screen.getByRole('textbox', { name: '内容' }) as HTMLTextAreaElement;
    await user.type(field, 'hi');
    expect(field.value).toBe('hi');
    expect(onChange).toHaveBeenCalled();
  });

  it('supports compound composition via subcomponents', () => {
    render(
      <Textarea aria-label="复合">
        <Textarea.Label>描述</Textarea.Label>
        <Textarea.Field />
        <Textarea.Description>提示</Textarea.Description>
      </Textarea>,
    );
    expect(screen.getByRole('textbox', { name: '描述' })).toHaveAttribute(
      'data-slot',
      'textarea-field',
    );
    expect(screen.getByText('提示')).toHaveAttribute('data-slot', 'description');
  });
});
