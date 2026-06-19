import { describe, it, expect, vi } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import Rating from './index';

function renderRating(props: React.ComponentProps<typeof Rating> = {}) {
  return render(
    <Rating aria-label="评分" {...props}>
      <Rating.Item value={1} />
      <Rating.Item value={2} />
      <Rating.Item value={3} />
      <Rating.Item value={4} />
      <Rating.Item value={5} />
    </Rating>,
  );
}

// data-active 与 aria-label 落在 .rating__item 这个 <label> 上（data-slot=rating-item），
// 真正的 role=radio 是它内部的 <input>。所以 active 断言查 item，交互点 radio。
function getItems(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>('[data-slot="rating-item"]'),
  );
}

describe('Rating', () => {
  it('renders a radiogroup with five radio items and BEM classes', () => {
    const { container } = renderRating({ size: 'lg' });
    const group = screen.getByRole('radiogroup', { name: '评分' });
    expect(group).toHaveClass('rating');
    expect(group).toHaveClass('rating--lg');
    expect(group).toHaveAttribute('data-slot', 'rating');
    const radios = within(group).getAllByRole('radio');
    expect(radios).toHaveLength(5);
    const items = getItems(container);
    expect(items).toHaveLength(5);
    items.forEach((i) => expect(i).toHaveClass('rating__item'));
  });

  it('marks items up to defaultValue as data-active', () => {
    const { container } = renderRating({ defaultValue: 3 });
    const items = getItems(container);
    // 前三项 active，后两项不 active
    expect(items[0]).toHaveAttribute('data-active', 'true');
    expect(items[1]).toHaveAttribute('data-active', 'true');
    expect(items[2]).toHaveAttribute('data-active', 'true');
    expect(items[3]).not.toHaveAttribute('data-active');
    expect(items[4]).not.toHaveAttribute('data-active');
  });

  it('fires onValueChange with the numeric value on selection (uncontrolled)', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = renderRating({ onValueChange });
    const radios = screen.getAllByRole('radio');
    await user.click(radios[3]); // value=4
    expect(onValueChange).toHaveBeenCalledWith(4);
    // 非受控自更新：前四项 active
    const items = getItems(container);
    expect(items[3]).toHaveAttribute('data-active', 'true');
    expect(items[0]).toHaveAttribute('data-active', 'true');
    expect(items[4]).not.toHaveAttribute('data-active');
  });

  it('controlled value: click reports change but does not self-update active state', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = renderRating({ value: 2, onValueChange });
    const items = getItems(container);
    // 受控 value=2 → 前两项 active
    expect(items[1]).toHaveAttribute('data-active', 'true');
    expect(items[2]).not.toHaveAttribute('data-active');
    const radios = screen.getAllByRole('radio');
    await user.click(radios[4]); // value=5
    expect(onValueChange).toHaveBeenCalledWith(5);
    // 移开指针以排除悬停预览，断言已提交态：受控 prop 未变，第三项仍不 active
    await user.unhover(radios[4]);
    expect(items[2]).not.toHaveAttribute('data-active');
  });

  it('previews the hovered value via data-active and reverts on hover end', () => {
    const { container } = renderRating({ defaultValue: 1 });
    const items = getItems(container);
    // 初始仅第一项 active
    expect(items[0]).toHaveAttribute('data-active', 'true');
    expect(items[2]).not.toHaveAttribute('data-active');

    // 悬停第四颗星 → 前四项预览为 active（RAC useHover 需 mouse 指针类型）
    fireEvent.pointerEnter(items[3], { pointerType: 'mouse' });
    expect(items[0]).toHaveAttribute('data-active', 'true');
    expect(items[2]).toHaveAttribute('data-active', 'true');
    expect(items[3]).toHaveAttribute('data-active', 'true');
    expect(items[4]).not.toHaveAttribute('data-active');

    // 离开 → 恢复到已提交的 1 分
    fireEvent.pointerLeave(items[3], { pointerType: 'mouse' });
    expect(items[0]).toHaveAttribute('data-active', 'true');
    expect(items[1]).not.toHaveAttribute('data-active');
    expect(items[3]).not.toHaveAttribute('data-active');
  });

  it('skips hover preview when read-only', () => {
    const { container } = render(
      <Rating aria-label="评分" value={2} isReadOnly>
        <Rating.Item value={1} />
        <Rating.Item value={2} />
        <Rating.Item value={3} />
        <Rating.Item value={4} />
        <Rating.Item value={5} />
      </Rating>,
    );
    const items = getItems(container);
    fireEvent.pointerEnter(items[4], { pointerType: 'mouse' });
    // 只读不预览：仍只有前两项 active
    expect(items[1]).toHaveAttribute('data-active', 'true');
    expect(items[2]).not.toHaveAttribute('data-active');
    expect(items[4]).not.toHaveAttribute('data-active');
  });

  it('renders a partial overlay for fractional controlled value', () => {
    const { container } = render(
      <Rating aria-label="评分" value={3.5}>
        <Rating.Item value={1} />
        <Rating.Item value={2} />
        <Rating.Item value={3} />
        <Rating.Item value={4} />
        <Rating.Item value={5} />
      </Rating>,
    );
    const partial = container.querySelector('[data-slot="rating-icon-partial"]') as HTMLElement;
    expect(partial).toBeInTheDocument();
    expect(partial.style.getPropertyValue('--rating-partial')).toBe('50%');
  });

  it('provides accessible labels for each radio item', () => {
    renderRating();
    expect(screen.getByRole('radio', { name: '1 star' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '5 stars' })).toBeInTheDocument();
  });

  it('has no axe a11y violations', async () => {
    // 完整合法结构：radiogroup（aria-label=评分）+ 5 个带 aria-label 的 radio 项
    const { container } = renderRating({ defaultValue: 3 });
    expect(await axe(container)).toHaveNoViolations();
  });
});
