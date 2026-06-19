import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import EmojiPicker from './index';

// RAC ListBox(layout="grid") 内部会摸 getBoundingClientRect / ResizeObserver 做布局，
// jsdom 下这些都返回 0 / 不存在。为避免 RAC 内部因缺失 ResizeObserver 抛错，提供一个空壳。
beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

describe('EmojiPicker', () => {
  it('inline 模式渲染面板：分类、搜索框、网格都在', () => {
    render(<EmojiPicker isInline />);
    // 面板根
    expect(document.querySelector('[data-slot="emoji-picker-content"]')).toBeInTheDocument();
    // 搜索框：RACInput 渲染为普通 text input → role=textbox
    expect(screen.getByRole('textbox', { name: '搜索表情' })).toBeInTheDocument();
    // 表情网格：RAC ListBox(单选 layout=grid) ARIA 角色仍是 listbox
    expect(screen.getByRole('listbox', { name: '表情网格' })).toBeInTheDocument();
  });

  // ── 回归 1：连续两次点击同一个表情，onEmojiSelect 必须被调用两次 ───────────────
  // 修复点：grid 用 onAction 而非 onSelectionChange，重复点已选 key 仍上报。
  //
  // ⚠️ jsdom 限制：RAC ListBox 的 onAction 经 @react-aria/usePress 的指针按压完成路径触发，
  // 该路径依赖真实布局/elementFromPoint（jsdom 全返回 0/null），press 永远无法"完成"，
  // 因此 onAction 在 jsdom 中不会被任何合成事件（click / mouse / pointer / 键盘 Enter）触发，
  // 而内部选中态也不会随交互更新（实测均无效）。故"点击计数=2"无法在 jsdom 真实驱动，
  // 强行断言会是与 bug 无关的假失败。这里 skip 并记录意图，留给 E2E/浏览器环境覆盖。
  // 受控高亮这一半（fix 的另一面）由下方 value 驱动的回归测试覆盖。
  it.skip('回归(需浏览器): inline 下连点同一个表情两次, onEmojiSelect 触发两次', async () => {
    const user = userEvent.setup();
    const onEmojiSelect = vi.fn();
    render(<EmojiPicker isInline onEmojiSelect={onEmojiSelect} />);

    const grid = screen.getByRole('listbox', { name: '表情网格' });
    const option = within(grid).getByRole('option', { name: '😀' });

    await user.click(option);
    await user.click(option);

    expect(onEmojiSelect).toHaveBeenCalledTimes(2);
    expect(onEmojiSelect).toHaveBeenNthCalledWith(1, '😀');
    expect(onEmojiSelect).toHaveBeenNthCalledWith(2, '😀');
  });

  // ── 回归 2：受控高亮——当前选中表情在网格里 aria-selected=true ────────────────────
  // 修复点：高亮由受控 selectedKeys=currentEmoji 承载（而非 RAC 内部选中态），
  // 这样即便用 onAction 取代 onSelectionChange，选中项仍能稳定高亮。
  // 在 jsdom 中通过受控 value 驱动该机制（交互驱动的状态更新在 jsdom 不可用，见上条说明）。
  it('回归: 受控 value 对应的表情在网格中 aria-selected=true, 其余为 false', () => {
    render(<EmojiPicker isInline value="😍" />);

    const grid = screen.getByRole('listbox', { name: '表情网格' });
    // 受控值对应项高亮
    expect(within(grid).getByRole('option', { name: '😍' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    // 非选中项不高亮
    expect(within(grid).getByRole('option', { name: '😀' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  // 默认值（defaultValue='😀'）应是初始高亮项，验证受控高亮的非受控分支
  it('回归: 未传 value 时 defaultValue(😀) 为初始高亮项', () => {
    render(<EmojiPicker isInline />);
    const grid = screen.getByRole('listbox', { name: '表情网格' });
    expect(within(grid).getByRole('option', { name: '😀' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('搜索框输入会过滤网格内容', async () => {
    const user = userEvent.setup();
    render(<EmojiPicker isInline />);

    const search = screen.getByRole('textbox', { name: '搜索表情' });
    // 输入一个匹配不到任何分类/表情/名称的查询 → 空态
    await user.type(search, 'zzzznomatch');

    expect(screen.getByText('没有匹配的表情')).toBeInTheDocument();
  });

  // ── 名称搜索：英文关键词应跨分类命中对应 emoji（HeroUI 搜索是按名检索）─────────────
  it('按英文名称/关键词搜索能命中 emoji（smile / heart / dog）', async () => {
    const user = userEvent.setup();
    render(<EmojiPicker isInline />);

    const search = screen.getByRole('textbox', { name: '搜索表情' });
    const grid = screen.getByRole('listbox', { name: '表情网格' });

    // 'dog' 命中动物分类里的 🐶
    await user.type(search, 'dog');
    expect(within(grid).getByRole('option', { name: '🐶' })).toBeInTheDocument();
    expect(screen.queryByText('没有匹配的表情')).not.toBeInTheDocument();

    // 'heart' 命中 😍（heart eyes 关键词）
    await user.clear(search);
    await user.type(search, 'heart');
    expect(within(grid).getByRole('option', { name: '😍' })).toBeInTheDocument();

    // 'smile' 跨多个笑脸命中，至少 😄（smile）在内
    await user.clear(search);
    await user.type(search, 'smile');
    expect(within(grid).getByRole('option', { name: '😄' })).toBeInTheDocument();
  });

  // ── 肤色：选 dark 后，可套色的 👍 重渲为带 Fitzpatrick dark 修饰符的字符 ───────────
  it('选肤色后可套色 emoji 重渲为带 Fitzpatrick 修饰符的字符', async () => {
    const user = userEvent.setup();
    render(<EmojiPicker isInline />);

    // 先切到手势分类，👍 可套色（单选 ToggleButtonGroup 里的项 role=radio）
    await user.click(screen.getByRole('radio', { name: '手势' }));

    const grid = screen.getByRole('listbox', { name: '表情网格' });
    // 默认肤色：基础 👍 在网格中
    expect(within(grid).getByRole('option', { name: '👍' })).toBeInTheDocument();

    // 选 dark 肤色（aria-label='深'，exact 避免误配其它档）
    await user.click(screen.getByRole('radio', { name: '深', exact: true }));

    // 重渲后基础 👍 不再存在，取而代之是带 dark 修饰符的 👍🏿
    expect(within(grid).queryByRole('option', { name: '👍' })).not.toBeInTheDocument();
    expect(within(grid).getByRole('option', { name: '👍\u{1F3FF}' })).toBeInTheDocument();
  });

  // ── 肤色受控：传 tone 后渲染对应肤色，且不可套色的表情不受影响 ─────────────────────
  it('受控 tone=light 时手势重渲带 light 修饰符，笑脸不受影响', () => {
    render(<EmojiPicker isInline tone="light" />);
    // 笑脸分类（默认激活）：😀 不可套色，仍是基础字符
    const grid = screen.getByRole('listbox', { name: '表情网格' });
    expect(within(grid).getByRole('option', { name: '😀' })).toBeInTheDocument();
    expect(within(grid).queryByRole('option', { name: '😀\u{1F3FB}' })).not.toBeInTheDocument();
  });

  it('肤色切换触发 onToneChange 回调', async () => {
    const user = userEvent.setup();
    const onToneChange = vi.fn();
    render(<EmojiPicker isInline onToneChange={onToneChange} />);

    // exact:true 让 '中' 只配中档，不误配 '中浅'/'中深'
    await user.click(screen.getByRole('radio', { name: '中', exact: true }));
    expect(onToneChange).toHaveBeenCalledWith('medium');
  });

  it('非 inline 模式渲染 trigger 按钮, 显示当前值', () => {
    render(<EmojiPicker aria-label="选择表情" value="🐶" />);
    const trigger = screen.getByRole('button', { name: '选择表情' });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('data-slot', 'emoji-picker-trigger');
    expect(within(trigger).getByText('🐶')).toBeInTheDocument();
  });

  it('isDisabled 时 trigger 按钮被禁用', () => {
    render(<EmojiPicker aria-label="选择表情" isDisabled />);
    expect(screen.getByRole('button', { name: '选择表情' })).toBeDisabled();
  });

  // inline 面板含完整合法结构：分类 ToggleButtonGroup（aria-label）、搜索框（aria-label）、
  // 网格 ListBox（aria-label）；每个交互件都带可访问名，应当无 axe 违规。
  it('has no axe a11y violations', async () => {
    const { container } = render(<EmojiPicker isInline aria-label="选择表情" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
