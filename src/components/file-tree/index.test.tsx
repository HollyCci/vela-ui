import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import FileTree, { useFileTree, type FileTreeNode } from './index';

// RAC Tree + motion section 过渡：mock ResizeObserver，避免 motion/jsdom 报错。
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

const Tree = (props?: Partial<React.ComponentProps<typeof FileTree>>) => (
  <FileTree
    aria-label="Files"
    selectionMode="single"
    defaultExpandedKeys={['root']}
    {...props}
  >
    <FileTree.Item id="root" title="Root">
      <FileTree.Item id="child-1" title="Child One" />
      <FileTree.Item id="child-2" title="Child Two" />
    </FileTree.Item>
    <FileTree.Item id="leaf" title="Leaf" />
  </FileTree>
);

describe('FileTree', () => {
  it('renders a treegrid with data-slot and size class', () => {
    render(<Tree size="sm" />);
    const tree = screen.getByRole('treegrid', { name: 'Files' });
    expect(tree).toHaveAttribute('data-slot', 'file-tree');
    expect(tree).toHaveClass('file-tree');
    expect(tree).toHaveClass('file-tree--sm');
  });

  it('renders rows for visible items (expanded root shows children)', () => {
    render(<Tree />);
    // RAC 把展开分支的行可能拍平+motion 嵌套两处渲染，故用 label slot 的文本去重断言存在性
    const labels = Array.from(
      document.querySelectorAll('[data-slot="file-tree-label"]'),
    ).map((el) => el.textContent);
    expect(labels).toContain('Root');
    expect(labels).toContain('Child One');
    expect(labels).toContain('Child Two');
    expect(labels).toContain('Leaf');
  });

  it('parent row exposes aria-expanded reflecting expansion state', () => {
    render(<Tree />);
    const rows = screen.getAllByRole('row');
    const rootRow = rows.find((r) => r.textContent?.includes('Root'));
    expect(rootRow).toBeDefined();
    expect(rootRow).toHaveAttribute('aria-expanded', 'true');
  });

  it('selecting a row fires onSelectionChange', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(<Tree onSelectionChange={onSelectionChange} />);
    const label = Array.from(
      document.querySelectorAll('[data-slot="file-tree-label"]'),
    ).find((el) => el.textContent === 'Child One') as HTMLElement;
    await user.click(label);
    expect(onSelectionChange).toHaveBeenCalled();
  });

  it('reduceMotion sets data-reduce-motion on the tree', () => {
    render(<Tree reduceMotion />);
    expect(screen.getByRole('treegrid')).toHaveAttribute('data-reduce-motion', 'true');
  });

  // a11y：treegrid 带 aria-label，展开根含合法 Item 行结构。
  // 预期违规（待主控修组件源码，非本测试用法问题）：分支行的展开切换按钮
  // <Button slot="chevron"> 只渲染了纯视觉 chevron 图标，没有文本/aria-label，
  // 触发 axe button-name（"Buttons must have discernible text"）。
  // 源码注释声称由 RAC 注入本地化 aria-label，但 slot="chevron" 的 Tree 按钮 RAC 并不会自动注名。
  it('has no axe a11y violations', async () => {
    const { container } = render(<Tree />);
    // aria-required-children 排除：RAC treegrid>row>gridcell 的 cell 包裹在真实浏览器完整，
    // jsdom 虚拟渲染下 axe 会把 chevron 按钮误判为 treegrid 直接子项；其余规则全部启用。
    expect(
      await axe(container, { rules: { 'aria-required-children': { enabled: false } } }),
    ).toHaveNoViolations();
  });
});

describe('useFileTree', () => {
  const items: FileTreeNode[] = [
    { id: 'a', children: [{ id: 'a1' }, { id: 'a2', children: [{ id: 'a2x' }] }] },
    { id: 'b' },
  ];

  it('computes expandableKeys (branch nodes only) and leaves', () => {
    let result: ReturnType<typeof useFileTree<FileTreeNode>> | null = null;
    function Probe() {
      result = useFileTree({ items });
      return null;
    }
    render(<Probe />);
    expect(result!.expandableKeys).toEqual(['a', 'a2']);
    expect(result!.leaves.map((n) => n.id)).toEqual(['a1', 'a2x', 'b']);
  });
});
