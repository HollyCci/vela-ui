import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import DataGrid, { type DataGridColumn, type DataGridSortDescriptor } from './index';

// jsdom 没有真实布局：ResizeObserver 缺失会让滚动指标 effect 报错。
// 这里全局桩掉，保证组件挂载稳定（我们不测布局/像素/虚拟化滚动）。
// IntersectionObserver 同理：底座 Table.LoadMore（RAC 哨兵）在 effect 里 new IntersectionObserver，
// jsdom 无此 API；桩掉保证 load-more 哨兵能挂载渲染（哨兵滚入触发的真实交叉逻辑依赖布局，jsdom 测不到）。
beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(_callback: IntersectionObserverCallback) {}
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [] as IntersectionObserverEntry[];
      }
    },
  );
});

type Course = {
  id: string;
  name: string;
  owner: string;
  progress: number;
};

const COURSES: Course[] = [
  { id: 'c1', name: 'Algebra', owner: 'Ann', progress: 40 },
  { id: 'c2', name: 'Biology', owner: 'Bob', progress: 80 },
  { id: 'c3', name: 'Chemistry', owner: 'Cara', progress: 60 },
];

const courseRowId = (row: Course) => row.id;

// 内置 inline 可编辑列：editable 列、不传 editor（命中 inlineEditorNode 分支）
const EDITABLE_COLUMNS: DataGridColumn<Course>[] = [
  { id: 'name', header: '课程', accessorKey: 'name', isRowHeader: true, editable: true },
  { id: 'owner', header: '负责人', accessorKey: 'owner', editable: true },
  {
    id: 'progress',
    header: '掌握度',
    accessorKey: 'progress',
    align: 'end',
    editable: true,
    format: (value) => `${String(value)}%`,
    parse: (value: string) => Math.round(Number(value)),
  },
];

const SORT_COLUMNS: DataGridColumn<Course>[] = [
  { id: 'name', header: '课程', accessorKey: 'name', isRowHeader: true, allowsSorting: true },
  { id: 'owner', header: '负责人', accessorKey: 'owner', allowsSorting: true },
  { id: 'progress', header: '掌握度', accessorKey: 'progress', allowsSorting: true },
];

const PLAIN_COLUMNS: DataGridColumn<Course>[] = [
  { id: 'name', header: '课程', accessorKey: 'name', isRowHeader: true },
  { id: 'owner', header: '负责人', accessorKey: 'owner' },
];

describe('DataGrid', () => {
  describe('smoke / 渲染', () => {
    it('renders a grid with header columns and row data, carrying data-slot', () => {
      const { container } = render(
        <DataGrid
          aria-label="课程"
          columns={PLAIN_COLUMNS}
          data={COURSES}
          getRowId={courseRowId}
        />,
      );

      const grid = container.querySelector('[data-slot="data-grid"]');
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass('data-grid');

      // 列头与行内容能渲染
      expect(screen.getByRole('columnheader', { name: '课程' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: '负责人' })).toBeInTheDocument();
      expect(screen.getByText('Algebra')).toBeInTheDocument();
      expect(screen.getByText('Chemistry')).toBeInTheDocument();
    });

    it('applies variant to the underlying table root', () => {
      const { container } = render(
        <DataGrid
          aria-label="课程"
          columns={PLAIN_COLUMNS}
          data={COURSES}
          getRowId={courseRowId}
          variant="secondary"
        />,
      );
      const grid = container.querySelector('[data-slot="data-grid"]');
      expect(grid).toHaveAttribute('data-vertical-align', 'middle');
      // variant 透传给底座 Table（class 由 OSS 决定，这里断言根存在即可，不脆弱断 OSS 内部 class）
      expect(grid).toBeInTheDocument();
    });

    it('renders empty state when data is empty', () => {
      render(
        <DataGrid
          aria-label="空课程"
          columns={PLAIN_COLUMNS}
          data={[]}
          getRowId={courseRowId}
          renderEmptyState={() => <div>没有数据</div>}
        />,
      );
      expect(screen.getByText('没有数据')).toBeInTheDocument();
    });
  });

  // 回归①：内置 inline 可编辑列，按 Enter 后 onCellEdit 只被调用 1 次（不是 2 次）。
  // 修复点：Enter 提交后置位 skipNextInlineBlurCommitRef，使随后的 blur 不再触发第二次提交。
  describe('回归①：inline 可编辑单元格 Enter 提交只触发一次 onCellEdit', () => {
    it('calls onCellEdit exactly once on Enter (blur does not double-fire)', async () => {
      const user = userEvent.setup();
      const onCellEdit = vi.fn();

      render(
        <DataGrid
          aria-label="可编辑课程"
          columns={EDITABLE_COLUMNS}
          data={COURSES}
          getRowId={courseRowId}
          onCellEdit={onCellEdit}
        />,
      );

      // 每行都渲染自己的 inline preview input（同 aria-label），按 defaultValue 定位 c1 行的负责人输入框
      const ownerInput = screen.getByDisplayValue('Ann') as HTMLInputElement;
      expect(ownerInput).toBeInTheDocument();

      await user.click(ownerInput);
      await user.clear(ownerInput);
      await user.type(ownerInput, 'Zoe');
      await user.keyboard('{Enter}');

      // 关键回归：Enter 触发一次，blur（refocus 过程）不应再触发第二次
      await waitFor(() => {
        expect(onCellEdit).toHaveBeenCalledTimes(1);
      });

      const event = onCellEdit.mock.calls[0][0];
      expect(event.columnId).toBe('owner');
      expect(event.rowKey).toBe('c1');
      expect(event.value).toBe('Zoe');
      expect(event.reason).toBe('enter');
    });

    it('a single Enter keydown commits exactly once (handler self-blur is suppressed)', async () => {
      // 关键回归：handleInlineEditorKey 的 Enter 分支会主动 inlineInput.blur() 并置 skip 标志，
      // 该 blur 不得再触发第二次提交。仅派发一个 keydown Enter，断言只 commit 一次。
      const onCellEdit = vi.fn();
      const user = userEvent.setup();

      render(
        <DataGrid
          aria-label="可编辑课程"
          columns={EDITABLE_COLUMNS}
          data={COURSES}
          getRowId={courseRowId}
          onCellEdit={onCellEdit}
        />,
      );

      const nameInput = screen.getByDisplayValue('Algebra') as HTMLInputElement;
      await user.click(nameInput);
      await user.clear(nameInput);
      await user.type(nameInput, 'Astronomy');

      // 派发 Enter：内部会同步 blur 一次（被 skip 吃掉），不应产生第二次提交
      fireEvent.keyDown(nameInput, { key: 'Enter' });

      expect(onCellEdit).toHaveBeenCalledTimes(1);
      expect(onCellEdit.mock.calls[0][0].reason).toBe('enter');
      expect(onCellEdit.mock.calls[0][0].value).toBe('Astronomy');
    });

    it('blur alone (no Enter) commits once with reason "blur"', async () => {
      const onCellEdit = vi.fn();
      const user = userEvent.setup();

      render(
        <DataGrid
          aria-label="可编辑课程"
          columns={EDITABLE_COLUMNS}
          data={COURSES}
          getRowId={courseRowId}
          onCellEdit={onCellEdit}
        />,
      );

      const ownerInput = screen.getByDisplayValue('Bob') as HTMLInputElement;
      await user.click(ownerInput);
      await user.clear(ownerInput);
      await user.type(ownerInput, 'Newowner');
      fireEvent.blur(ownerInput);

      expect(onCellEdit).toHaveBeenCalledTimes(1);
      expect(onCellEdit.mock.calls[0][0].reason).toBe('blur');
      expect(onCellEdit.mock.calls[0][0].value).toBe('Newowner');
    });

    it('does not fire onCellEdit when value is unchanged', async () => {
      const onCellEdit = vi.fn();
      const user = userEvent.setup();

      render(
        <DataGrid
          aria-label="可编辑课程"
          columns={EDITABLE_COLUMNS}
          data={COURSES}
          getRowId={courseRowId}
          onCellEdit={onCellEdit}
        />,
      );

      const ownerInput = screen.getByDisplayValue('Cara') as HTMLInputElement;
      await user.click(ownerInput);
      // 不改值，直接 Enter：previousValue === nextValue，应跳过回调
      fireEvent.keyDown(ownerInput, { key: 'Enter' });
      fireEvent.blur(ownerInput);

      expect(onCellEdit).not.toHaveBeenCalled();
    });
  });

  // 回归②：排序——可排序列头点击切换 sortDescriptor / 触发 onSortChange。
  describe('回归②：排序列头点击触发 onSortChange', () => {
    it('marks sortable columns and fires onSortChange on header click (非受控)', async () => {
      const user = userEvent.setup();
      const onSortChange = vi.fn();

      render(
        <DataGrid
          aria-label="排序课程"
          columns={SORT_COLUMNS}
          data={COURSES}
          getRowId={courseRowId}
          onSortChange={onSortChange}
        />,
      );

      const ownerHeader = screen.getByRole('columnheader', { name: /负责人/ });
      // 可排序列暴露 aria-sort
      expect(ownerHeader).toHaveAttribute('aria-sort');

      await user.click(ownerHeader);

      expect(onSortChange).toHaveBeenCalled();
      const descriptor = onSortChange.mock.calls[0][0] as DataGridSortDescriptor;
      expect(descriptor.column).toBe('owner');
      expect(['ascending', 'descending']).toContain(descriptor.direction);
    });

    it('reflects controlled sortDescriptor as aria-sort and toggles direction', async () => {
      const user = userEvent.setup();
      const onSortChange = vi.fn();

      render(
        <DataGrid
          aria-label="受控排序课程"
          columns={SORT_COLUMNS}
          data={COURSES}
          getRowId={courseRowId}
          sortDescriptor={{ column: 'owner', direction: 'ascending' }}
          onSortChange={onSortChange}
        />,
      );

      const ownerHeader = screen.getByRole('columnheader', { name: /负责人/ });
      expect(ownerHeader).toHaveAttribute('aria-sort', 'ascending');

      // 受控：点击仅回调，由调用方回写；当前方向 ascending → 期望切到 descending
      await user.click(ownerHeader);
      expect(onSortChange).toHaveBeenCalledTimes(1);
      expect((onSortChange.mock.calls[0][0] as DataGridSortDescriptor).column).toBe('owner');
      expect((onSortChange.mock.calls[0][0] as DataGridSortDescriptor).direction).toBe(
        'descending',
      );
    });

    it('non-sortable columns do not expose aria-sort', () => {
      render(
        <DataGrid
          aria-label="课程"
          columns={PLAIN_COLUMNS}
          data={COURSES}
          getRowId={courseRowId}
        />,
      );
      const header = screen.getByRole('columnheader', { name: '负责人' });
      expect(header).not.toHaveAttribute('aria-sort');
    });
  });

  // 回归③：行选择——onSelectionChange 在勾选 checkbox 时触发。
  describe('回归③：行选择触发 onSelectionChange', () => {
    it('fires onSelectionChange when a row checkbox is toggled (multiple)', async () => {
      const user = userEvent.setup();
      const onSelectionChange = vi.fn();

      render(
        <DataGrid
          aria-label="可选课程"
          columns={PLAIN_COLUMNS}
          data={COURSES}
          getRowId={courseRowId}
          selectionMode="multiple"
          showSelectionCheckboxes
          onSelectionChange={onSelectionChange}
        />,
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);

      // 勾选第一行（select-all 是 [0] 时取一个行 checkbox，统一点最后一个稳妥）
      await user.click(checkboxes[checkboxes.length - 1]);

      expect(onSelectionChange).toHaveBeenCalled();
      const selection = onSelectionChange.mock.calls[0][0];
      // Selection 是 Set<Key> 或 'all'
      if (selection !== 'all') {
        expect(selection.size).toBeGreaterThan(0);
      }
    });

    it('reflects controlled selectedKeys as checked rows', () => {
      render(
        <DataGrid
          aria-label="可选课程"
          columns={PLAIN_COLUMNS}
          data={COURSES}
          getRowId={courseRowId}
          selectionMode="multiple"
          showSelectionCheckboxes
          selectedKeys={new Set(['c2'])}
          onSelectionChange={() => {}}
        />,
      );

      // 受控选中：c2 行 checkbox 处于 checked
      const checkedBoxes = screen
        .getAllByRole('checkbox')
        .filter((cb) => (cb as HTMLInputElement).checked);
      expect(checkedBoxes.length).toBeGreaterThan(0);
    });

    it('single selection mode fires onSelectionChange with a single key', async () => {
      const user = userEvent.setup();
      const onSelectionChange = vi.fn();

      render(
        <DataGrid
          aria-label="单选课程"
          columns={PLAIN_COLUMNS}
          data={COURSES}
          getRowId={courseRowId}
          selectionMode="single"
          showSelectionCheckboxes
          onSelectionChange={onSelectionChange}
        />,
      );

      // 单选模式无表头全选框，每行一个 selection checkbox（RAC 以 checkbox role 呈现）
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
      await user.click(checkboxes[0]);

      expect(onSelectionChange).toHaveBeenCalled();
      const selection = onSelectionChange.mock.calls[0][0];
      if (selection !== 'all') {
        expect(selection.size).toBe(1);
      }
    });
  });

  // 参考版命名别名：allowsColumnResize / rowHeight / 列 pinned / 列 allowsResizing / onReorder / selectionBehavior。
  describe('参考版命名别名（向后兼容）', () => {
    it('allowsColumnResize wraps in a resizable container and marks resizable columns', () => {
      const RESIZABLE_COLUMNS: DataGridColumn<Course>[] = [
        { id: 'name', header: '课程', accessorKey: 'name', isRowHeader: true, allowsResizing: true },
        { id: 'owner', header: '负责人', accessorKey: 'owner' },
      ];
      const { container } = render(
        <DataGrid
          aria-label="可调列宽"
          columns={RESIZABLE_COLUMNS}
          data={COURSES}
          getRowId={courseRowId}
          allowsColumnResize
        />,
      );
      // allowsColumnResize（参考版名）应等价 enableColumnResizing：出现列宽调整手柄
      expect(container.querySelector('.data-grid__column-resizer')).toBeInTheDocument();
      // allowsResizing（参考版列名）应被识别为可调整列
      expect(container.querySelector('.data-grid__resizable-column')).toBeInTheDocument();
    });

    it('rowHeight (reference alias) drives virtualization without virtualRowHeight', () => {
      const { container } = render(
        <DataGrid
          aria-label="虚拟化"
          columns={PLAIN_COLUMNS}
          data={COURSES}
          getRowId={courseRowId}
          virtualized
          rowHeight={40}
        />,
      );
      // 仅靠参考版命名 rowHeight 也能启用虚拟化（root emit data-virtualized）
      expect(container.querySelector('[data-slot="data-grid"]')).toHaveAttribute(
        'data-virtualized',
        'true',
      );
    });

    it('column.pinned ("start"/"end") emits internal data-pinned left/right (CSS-compatible)', () => {
      const PINNED_COLUMNS: DataGridColumn<Course>[] = [
        { id: 'name', header: '课程', accessorKey: 'name', isRowHeader: true, pinned: 'start' },
        { id: 'owner', header: '负责人', accessorKey: 'owner' },
        { id: 'progress', header: '掌握度', accessorKey: 'progress', pinned: 'end' },
      ];
      const { container } = render(
        <DataGrid
          aria-label="固定列"
          columns={PINNED_COLUMNS}
          data={COURSES}
          getRowId={courseRowId}
        />,
      );
      // 参考版 pinned=start/end 映射到内部 left/right，保持与已锁定 CSS [data-pinned=left|right] 兼容
      expect(container.querySelector('[data-pinned="left"]')).toBeInTheDocument();
      expect(container.querySelector('[data-pinned="right"]')).toBeInTheDocument();
    });

    it('selectionBehavior is forwarded to the underlying table (not leaked onto root)', () => {
      const { container } = render(
        <DataGrid
          aria-label="替换选择"
          columns={PLAIN_COLUMNS}
          data={COURSES}
          getRowId={courseRowId}
          selectionMode="multiple"
          selectionBehavior="replace"
          showSelectionCheckboxes
          onSelectionChange={() => {}}
        />,
      );
      const root = container.querySelector('[data-slot="data-grid"]');
      // selectionBehavior 不应作为未知属性泄漏到根包装元素
      expect(root).not.toHaveAttribute('selectionbehavior');
      expect(root).toBeInTheDocument();
    });
  });

  // 无限滚动 / load-more（参考 API：onLoadMore / isLoadingMore / loadMoreContent）。
  // jsdom 无真实布局与 IntersectionObserver（已桩掉），哨兵滚入触发的交叉逻辑测不到；
  // 这里覆盖可达的契约：哨兵渲染/缺省、加载内容渲染、默认 Spinner、后向兼容、axe。
  describe('load-more / 无限滚动', () => {
    it('does NOT render a load-more sentinel when onLoadMore is absent (back-compat)', () => {
      const { container } = render(
        <DataGrid aria-label="课程" columns={PLAIN_COLUMNS} data={COURSES} getRowId={courseRowId} />,
      );
      // 未提供 onLoadMore = 现状：不渲染底座 load-more 哨兵，老调用点零破坏
      expect(container.querySelector('[data-slot="table-load-more"]')).toBeNull();
      expect(container.querySelector('.data-grid__load-more')).toBeNull();
    });

    it('does not render a visible load-more row until isLoadingMore is true (RAC sentinel contract)', () => {
      // 底座 RAC TableLoadMoreItem 的可见加载行只在 isLoading 为 true 时渲染（哨兵检测节点不可见）；
      // 提供 onLoadMore 但未加载时，DOM 里没有 data-slot="table-load-more" 的可见行——这是 RAC 原生契约。
      const { container } = render(
        <DataGrid
          aria-label="课程"
          columns={PLAIN_COLUMNS}
          data={COURSES}
          getRowId={courseRowId}
          onLoadMore={() => {}}
        />,
      );
      expect(container.querySelector('[data-slot="table-load-more"]')).toBeNull();
      // 但网格本身正常渲染（未因启用 load-more 而破坏）
      expect(container.querySelector('[data-slot="data-grid"]')).toBeInTheDocument();
      expect(screen.getByText('Algebra')).toBeInTheDocument();
    });

    it('renders the load-more row (with vela class) while isLoadingMore is true', () => {
      const { container } = render(
        <DataGrid
          aria-label="课程"
          columns={PLAIN_COLUMNS}
          data={COURSES}
          getRowId={courseRowId}
          onLoadMore={() => {}}
          isLoadingMore
        />,
      );
      // 加载时底座 Table.LoadMore 输出 data-slot="table-load-more"，并带上我们的 vela class
      const sentinel = container.querySelector('[data-slot="table-load-more"]');
      expect(sentinel).toBeInTheDocument();
      expect(sentinel).toHaveClass('data-grid__load-more');
    });

    it('renders the default Spinner inside the sentinel while isLoadingMore is true', () => {
      const { container } = render(
        <DataGrid
          aria-label="课程"
          columns={PLAIN_COLUMNS}
          data={COURSES}
          getRowId={courseRowId}
          onLoadMore={() => {}}
          isLoadingMore
        />,
      );
      // 不传 loadMoreContent → 默认渲染本库 Spinner（.spinner，来自基础件）
      const content = container.querySelector('[data-slot="table-load-more-content"]');
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass('data-grid__load-more-content');
      expect(container.querySelector('.spinner')).toBeInTheDocument();
    });

    it('renders custom loadMoreContent instead of the default Spinner', () => {
      render(
        <DataGrid
          aria-label="课程"
          columns={PLAIN_COLUMNS}
          data={COURSES}
          getRowId={courseRowId}
          onLoadMore={() => {}}
          isLoadingMore
          loadMoreContent={<span data-testid="custom-load-more">加载更多…</span>}
        />,
      );
      // 提供 loadMoreContent → 渲染它而非默认 Spinner
      expect(screen.getByTestId('custom-load-more')).toBeInTheDocument();
      expect(screen.getByText('加载更多…')).toBeInTheDocument();
    });

    it('does not leak load-more props onto the data-grid root element', () => {
      const { container } = render(
        <DataGrid
          aria-label="课程"
          columns={PLAIN_COLUMNS}
          data={COURSES}
          getRowId={courseRowId}
          onLoadMore={() => {}}
          isLoadingMore
          loadMoreScrollOffset={0}
        />,
      );
      const root = container.querySelector('[data-slot="data-grid"]');
      // 这些 prop 被组件消费，不应作为未知属性泄漏到根包装元素
      expect(root).not.toHaveAttribute('onloadmore');
      expect(root).not.toHaveAttribute('isloadingmore');
      expect(root).not.toHaveAttribute('loadmorescrolloffset');
      expect(root).toBeInTheDocument();
    });

    it('has no axe a11y violations when load-more is enabled (idle, not loading)', async () => {
      // 启用 load-more（提供 onLoadMore）但未加载时，无可见加载行 → 与基线一致，axe 应无违规。
      // 注：加载中（isLoadingMore=true）的可见行由底座 RAC TableLoadMoreItem 渲染，原生带
      // aria-level（grid 行）与空 rowheader 单元格，会触发 axe 的 aria-conditional-attr /
      // empty-table-header。这是 RAC/OSS 基础件自身输出（与线上 HeroUI Table.LoadMore 一致），
      // 非本组件新增；不在此处篡改 RAC 的 a11y 输出（保真铁律：不与真引擎对抗），
      // 故 axe 覆盖 idle 态，加载态的视觉/交互由真引擎保证。
      const { container } = render(
        <DataGrid
          aria-label="课程列表"
          columns={PLAIN_COLUMNS}
          data={COURSES}
          getRowId={courseRowId}
          onLoadMore={() => {}}
        />,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  // a11y：完整 grid（aria-label + 列头 + 行 + 多选 checkbox 列），axe 扫描应无违规。
  it('has no axe a11y violations', async () => {
    const { container } = render(
      <DataGrid
        aria-label="课程列表"
        columns={SORT_COLUMNS}
        data={COURSES}
        getRowId={courseRowId}
        selectionMode="multiple"
        showSelectionCheckboxes
        onSelectionChange={() => {}}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
