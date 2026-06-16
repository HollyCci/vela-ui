import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'vitest-axe';
import Avatar from './index';

describe('Avatar', () => {
  it('renders the image when a src is provided', () => {
    const { container } = render(<Avatar src="https://example.com/a.png" alt="Ann" />);
    const img = container.querySelector('img.avatar__image');
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute('src', 'https://example.com/a.png');
    expect(img).toHaveAttribute('alt', 'Ann');
  });

  it('renders the fallback when no src is provided', () => {
    render(<Avatar fallback="AB" />);
    const fallback = screen.getByText('AB');
    expect(fallback).toHaveAttribute('data-slot', 'avatar-fallback');
    expect(fallback).toHaveClass('avatar__fallback', 'avatar__fallback--default');
  });

  it('applies size and soft modifier classes', () => {
    const { container } = render(<Avatar size="lg" isSoft fallback="X" />);
    const root = container.querySelector('.avatar');
    expect(root).toHaveClass('avatar--lg', 'avatar--soft');
  });

  // 回归：图片 onError 后显示 fallback；rerender 传新有效 src 后重新显示 <img>（hasError 随 src 重置）
  it('regression: falls back on image error, then recovers when src changes', () => {
    const { container, rerender } = render(
      <Avatar src="https://example.com/broken.png" alt="Broken" fallback="BR" />,
    );

    // 初始显示 img
    let img = container.querySelector('img.avatar__image');
    expect(img).not.toBeNull();
    expect(container.querySelector('[data-slot="avatar-fallback"]')).toBeNull();

    // 触发 onError -> 切换到 fallback
    fireEvent.error(img!);
    expect(container.querySelector('img.avatar__image')).toBeNull();
    const fallback = container.querySelector('[data-slot="avatar-fallback"]');
    expect(fallback).not.toBeNull();
    expect(fallback).toHaveTextContent('BR');

    // 传新的有效 src -> hasError 经 useEffect 重置，重新显示 img
    rerender(<Avatar src="https://example.com/fixed.png" alt="Fixed" fallback="BR" />);
    img = container.querySelector('img.avatar__image');
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute('src', 'https://example.com/fixed.png');
    expect(container.querySelector('[data-slot="avatar-fallback"]')).toBeNull();
  });

  it('has no axe a11y violations (image avatar with alt)', async () => {
    const { container } = render(
      <Avatar src="https://example.com/ann.png" alt="Ann Lee" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe a11y violations (fallback avatar)', async () => {
    const { container } = render(<Avatar fallback="AL" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
