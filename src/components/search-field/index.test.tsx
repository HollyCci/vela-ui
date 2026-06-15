import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchField from './index';

describe('SearchField', () => {
  it('renders a searchbox with search-field class and data-slot', () => {
    render(<SearchField label="搜索" placeholder="输入关键字" />);
    const input = screen.getByRole('searchbox', { name: '搜索' });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'search');
    expect(input).toHaveAttribute('data-slot', 'search-field-input');
    expect(input).toHaveAttribute('placeholder', '输入关键字');
  });

  it('applies secondary variant and full-width classes on the root', () => {
    const { container } = render(
      <SearchField aria-label="x" variant="secondary" isFullWidth />,
    );
    const root = container.querySelector('.search-field');
    expect(root).toHaveClass('search-field--secondary', 'search-field--full-width');
  });

  it('calls onValueChange while typing (uncontrolled)', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<SearchField aria-label="搜索" onValueChange={onValueChange} />);
    const input = screen.getByRole('searchbox', { name: '搜索' }) as HTMLInputElement;
    await user.type(input, 'ab');
    expect(input.value).toBe('ab');
    expect(onValueChange).toHaveBeenLastCalledWith('ab');
  });

  it('renders controlled value', () => {
    render(<SearchField aria-label="搜索" value="预设" onValueChange={() => {}} />);
    expect((screen.getByRole('searchbox', { name: '搜索' }) as HTMLInputElement).value).toBe(
      '预设',
    );
  });

  it('clears the value via the clear button', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <SearchField aria-label="搜索" defaultValue="拓词" onValueChange={onValueChange} />,
    );
    const input = screen.getByRole('searchbox', { name: '搜索' }) as HTMLInputElement;
    expect(input.value).toBe('拓词');
    const clearBtn = screen.getByRole('button', { name: '清空' });
    await user.click(clearBtn);
    expect(input.value).toBe('');
    expect(onValueChange).toHaveBeenLastCalledWith('');
  });

  it('reflects disabled state', () => {
    render(<SearchField aria-label="x" isDisabled />);
    expect(screen.getByRole('searchbox', { name: 'x' })).toBeDisabled();
  });

  it('supports compound composition with description', () => {
    render(
      <SearchField aria-label="复合">
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input placeholder="搜索课程" />
          <SearchField.ClearButton />
        </SearchField.Group>
        <SearchField.Description>提示</SearchField.Description>
      </SearchField>,
    );
    expect(screen.getByPlaceholderText('搜索课程')).toHaveAttribute(
      'data-slot',
      'search-field-input',
    );
    expect(screen.getByText('提示')).toHaveAttribute('data-slot', 'description');
  });
});
