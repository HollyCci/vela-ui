import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import ItemCard from './index';

describe('ItemCard', () => {
  it('renders with BEM class, data-slot and default variant', () => {
    render(
      <ItemCard>
        <ItemCard.Title>Course</ItemCard.Title>
      </ItemCard>,
    );
    const card = document.querySelector('[data-slot="item-card"]') as HTMLElement;
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('item-card', 'item-card--default');
    expect(screen.getByText('Course')).toBeInTheDocument();
  });

  it('applies the variant modifier class', () => {
    render(<ItemCard variant="outline">x</ItemCard>);
    expect(document.querySelector('[data-slot="item-card"]')).toHaveClass('item-card--outline');
  });

  it('is non-interactive (no button role / tabindex) without press or selection props', () => {
    render(<ItemCard>plain</ItemCard>);
    const card = document.querySelector('[data-slot="item-card"]') as HTMLElement;
    expect(card).not.toHaveAttribute('role');
    expect(card).not.toHaveAttribute('tabindex');
    expect(card).not.toHaveAttribute('data-pressable');
  });

  // 回归：onPress 提供时点击触发回调，且角色变 button / 可聚焦
  it('fires onPress on click and exposes button semantics', async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(<ItemCard onPress={onPress}>pressable</ItemCard>);
    const card = document.querySelector('[data-slot="item-card"]') as HTMLElement;
    expect(card).toHaveAttribute('role', 'button');
    expect(card).toHaveAttribute('tabindex', '0');
    await user.click(card);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  // 回归：Enter / Space 键触发 onPress
  it('fires onPress on Enter and Space key', async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(<ItemCard onPress={onPress}>key</ItemCard>);
    const card = document.querySelector('[data-slot="item-card"]') as HTMLElement;
    card.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onPress).toHaveBeenCalledTimes(2);
  });

  // 回归：可选时点击切换选中态并触发 onSelectedChange（非受控）
  it('toggles selection and fires onSelectedChange (uncontrolled)', async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    render(<ItemCard onSelectedChange={onSelectedChange}>sel</ItemCard>);
    const card = document.querySelector('[data-slot="item-card"]') as HTMLElement;
    expect(card).toHaveAttribute('aria-pressed', 'false');

    await user.click(card);
    expect(onSelectedChange).toHaveBeenNthCalledWith(1, true);
    expect(card).toHaveAttribute('aria-pressed', 'true');
    expect(card).toHaveAttribute('data-selected', 'true');

    await user.click(card);
    expect(onSelectedChange).toHaveBeenNthCalledWith(2, false);
    expect(card).toHaveAttribute('aria-pressed', 'false');
  });

  // 回归：受控 isSelected 不被内部状态覆盖（onSelectedChange 仍触发，但 aria 跟随 prop）
  it('respects controlled isSelected prop', async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    render(
      <ItemCard isSelected onSelectedChange={onSelectedChange}>
        controlled
      </ItemCard>,
    );
    const card = document.querySelector('[data-slot="item-card"]') as HTMLElement;
    expect(card).toHaveAttribute('aria-pressed', 'true');

    await user.click(card);
    // 受控：内部不翻转，回调请求设为 false（受控方负责更新）
    expect(onSelectedChange).toHaveBeenCalledWith(false);
    expect(card).toHaveAttribute('aria-pressed', 'true');
  });

  // 回归：点击内部交互元素（按钮）不触发卡片 onPress
  it('does not fire card onPress when an inner interactive element is clicked', async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    const onInner = vi.fn();
    render(
      <ItemCard onPress={onPress}>
        <ItemCard.Action>
          <button type="button" onClick={onInner} data-testid="inner-btn">
            inner
          </button>
        </ItemCard.Action>
      </ItemCard>,
    );
    // 卡片本身是 role=button（accessible name 也是 "inner"），用 testid 精确定位内部按钮
    await user.click(screen.getByTestId('inner-btn'));
    expect(onInner).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();
  });

  // 参考版对齐：Title / Description 渲染为 <span>（而非 div）
  it('renders Title and Description as span elements (matches reference)', () => {
    render(
      <ItemCard>
        <ItemCard.Content>
          <ItemCard.Title>Course</ItemCard.Title>
          <ItemCard.Description>12 lessons</ItemCard.Description>
        </ItemCard.Content>
      </ItemCard>,
    );
    const title = screen.getByText('Course');
    const description = screen.getByText('12 lessons');
    expect(title.tagName).toBe('SPAN');
    expect(title).toHaveClass('item-card__title');
    expect(description.tagName).toBe('SPAN');
    expect(description).toHaveClass('item-card__description');
  });

  // 参考版对齐：render(DOMRenderFunction) 替换默认 div 根元素，并保留全部解析后的 DOM props
  it('supports the render prop to override the root element while keeping DOM props', async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(
      <ItemCard
        render={(domProps) => (
          <a href="/details" {...domProps}>
            <ItemCard.Title>Linked card</ItemCard.Title>
          </a>
        )}
        onPress={onPress}
      />,
    );
    const card = document.querySelector('[data-slot="item-card"]') as HTMLElement;
    // 自定义元素是 <a>，但带上了卡片的类名、role 与交互
    expect(card.tagName).toBe('A');
    expect(card).toHaveClass('item-card', 'item-card--default');
    expect(card).toHaveAttribute('role', 'button');
    expect(card).toHaveAttribute('data-pressable', 'true');
    await user.click(card);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('has no axe a11y violations', async () => {
    // 可按下的卡片渲染为 role=button，其可访问名取自标题文本内容
    const { container } = render(
      <ItemCard onPress={() => {}}>
        <ItemCard.Icon>★</ItemCard.Icon>
        <ItemCard.Content>
          <ItemCard.Title>Advanced React patterns</ItemCard.Title>
          <ItemCard.Description>12 lessons · 3h 20m</ItemCard.Description>
        </ItemCard.Content>
      </ItemCard>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
