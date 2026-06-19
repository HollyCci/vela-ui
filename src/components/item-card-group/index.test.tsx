import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import ItemCardGroup from './index';
import ItemCard from '../item-card';

describe('ItemCardGroup', () => {
  it('renders role=group with variant + layout BEM classes', () => {
    render(
      <ItemCardGroup variant="secondary" layout="grid">
        <ItemCard id="a">
          <ItemCard.Title>A</ItemCard.Title>
        </ItemCard>
      </ItemCardGroup>,
    );
    const group = screen.getByRole('group');
    expect(group).toHaveClass(
      'item-card-group',
      'item-card-group--secondary',
      'item-card-group--grid',
    );
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('sets the columns CSS variable for grid layout', () => {
    render(
      <ItemCardGroup layout="grid" columns={3}>
        <ItemCard id="a">A</ItemCard>
      </ItemCardGroup>,
    );
    const group = screen.getByRole('group');
    expect(group.style.getPropertyValue('--item-card-group-columns')).toBe('3');
  });

  it('renders header/title/description slots', () => {
    render(
      <ItemCardGroup>
        <ItemCardGroup.Header>
          <ItemCardGroup.Title>Top courses</ItemCardGroup.Title>
          <ItemCardGroup.Description>By enrollment</ItemCardGroup.Description>
        </ItemCardGroup.Header>
      </ItemCardGroup>,
    );
    expect(document.querySelector('[data-slot="item-card-group-header"]')).toBeInTheDocument();
    expect(screen.getByText('Top courses')).toBeInTheDocument();
    expect(screen.getByText('By enrollment')).toBeInTheDocument();
  });

  // 回归：onItemPress 透传被点击项的 key
  it('fires onItemPress with the pressed child key', async () => {
    const user = userEvent.setup();
    const onItemPress = vi.fn();
    render(
      <ItemCardGroup onItemPress={onItemPress}>
        <ItemCard id="first">
          <ItemCard.Title>First</ItemCard.Title>
        </ItemCard>
        <ItemCard id="second">
          <ItemCard.Title>Second</ItemCard.Title>
        </ItemCard>
      </ItemCardGroup>,
    );
    await user.click(screen.getByText('Second'));
    expect(onItemPress).toHaveBeenCalledTimes(1);
    expect(onItemPress.mock.calls[0][0]).toBe('second');
  });

  // 回归：单选语义 —— 点击触发 onSelectionChange 并把被选项标为 selected
  it('drives single selection via onSelectionChange', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <ItemCardGroup onSelectionChange={onSelectionChange}>
        <ItemCard id="x">
          <ItemCard.Title>X</ItemCard.Title>
        </ItemCard>
        <ItemCard id="y">
          <ItemCard.Title>Y</ItemCard.Title>
        </ItemCard>
      </ItemCardGroup>,
    );
    await user.click(screen.getByText('X'));
    expect(onSelectionChange).toHaveBeenCalledWith('x');

    const cards = document.querySelectorAll('[data-slot="item-card"]');
    expect(cards[0]).toHaveAttribute('data-selected', 'true');
    expect(cards[1]).not.toHaveAttribute('data-selected');
  });

  // 回归：受控 selectedKey 决定哪张卡片选中
  it('honors controlled selectedKey', () => {
    render(
      <ItemCardGroup selectedKey="y" onSelectionChange={() => {}}>
        <ItemCard id="x">
          <ItemCard.Title>X</ItemCard.Title>
        </ItemCard>
        <ItemCard id="y">
          <ItemCard.Title>Y</ItemCard.Title>
        </ItemCard>
      </ItemCardGroup>,
    );
    const cards = document.querySelectorAll('[data-slot="item-card"]');
    expect(cards[0]).not.toHaveAttribute('data-selected');
    expect(cards[1]).toHaveAttribute('data-selected', 'true');
  });

  // 多选语义：selectionMode="multiple" 时两次点击两张不同卡片，二者同时保持选中（不互斥）
  it('toggles multiple items in multiple selection mode', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <ItemCardGroup selectionMode="multiple" onSelectionChange={onSelectionChange}>
        <ItemCard id="x">
          <ItemCard.Title>X</ItemCard.Title>
        </ItemCard>
        <ItemCard id="y">
          <ItemCard.Title>Y</ItemCard.Title>
        </ItemCard>
      </ItemCardGroup>,
    );

    await user.click(screen.getByText('X'));
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(['x']));

    await user.click(screen.getByText('Y'));
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(['x', 'y']));

    const cards = document.querySelectorAll('[data-slot="item-card"]');
    expect(cards[0]).toHaveAttribute('data-selected', 'true');
    expect(cards[1]).toHaveAttribute('data-selected', 'true');

    // 再次点击 X 仅把它移出集合，Y 仍选中
    await user.click(screen.getByText('X'));
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(['y']));
    expect(cards[0]).not.toHaveAttribute('data-selected');
    expect(cards[1]).toHaveAttribute('data-selected', 'true');
  });

  // 多选受控 selectedKeys 同时点亮多张卡片
  it('honors controlled selectedKeys in multiple mode', () => {
    render(
      <ItemCardGroup
        selectionMode="multiple"
        selectedKeys={new Set(['x', 'y'])}
        onSelectionChange={() => {}}
      >
        <ItemCard id="x">
          <ItemCard.Title>X</ItemCard.Title>
        </ItemCard>
        <ItemCard id="y">
          <ItemCard.Title>Y</ItemCard.Title>
        </ItemCard>
        <ItemCard id="z">
          <ItemCard.Title>Z</ItemCard.Title>
        </ItemCard>
      </ItemCardGroup>,
    );
    const cards = document.querySelectorAll('[data-slot="item-card"]');
    expect(cards[0]).toHaveAttribute('data-selected', 'true');
    expect(cards[1]).toHaveAttribute('data-selected', 'true');
    expect(cards[2]).not.toHaveAttribute('data-selected');
  });

  // 回归：单选模式不受多选改动影响 —— 点第二张会清掉第一张
  it('keeps single selection exclusive (unchanged)', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <ItemCardGroup onSelectionChange={onSelectionChange}>
        <ItemCard id="x">
          <ItemCard.Title>X</ItemCard.Title>
        </ItemCard>
        <ItemCard id="y">
          <ItemCard.Title>Y</ItemCard.Title>
        </ItemCard>
      </ItemCardGroup>,
    );

    await user.click(screen.getByText('X'));
    expect(onSelectionChange).toHaveBeenLastCalledWith('x');

    await user.click(screen.getByText('Y'));
    expect(onSelectionChange).toHaveBeenLastCalledWith('y');

    const cards = document.querySelectorAll('[data-slot="item-card"]');
    expect(cards[0]).not.toHaveAttribute('data-selected');
    expect(cards[1]).toHaveAttribute('data-selected', 'true');
  });

  it('has no axe a11y violations', async () => {
    // role=group 配可访问名（aria-label），每张可选卡片的名字取自标题文本
    const { container } = render(
      <ItemCardGroup aria-label="Top courses" onSelectionChange={() => {}}>
        <ItemCardGroup.Header>
          <ItemCardGroup.Title>Top courses</ItemCardGroup.Title>
          <ItemCardGroup.Description>By enrollment</ItemCardGroup.Description>
        </ItemCardGroup.Header>
        <ItemCard id="a">
          <ItemCard.Title>React fundamentals</ItemCard.Title>
        </ItemCard>
        <ItemCard id="b">
          <ItemCard.Title>TypeScript deep dive</ItemCard.Title>
        </ItemCard>
      </ItemCardGroup>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
