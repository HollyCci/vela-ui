# 贡献指南

## 环境

```bash
pnpm install
pnpm dev        # showcase（http://localhost:5180），用于人工查看组件
```

## 脚本

| 命令 | 作用 |
|---|---|
| `pnpm type-check` | TypeScript 检查（`tsc -b --noEmit`） |
| `pnpm lint` | ESLint（含 `react-hooks/exhaustive-deps`）；基线 0 error / 0 warning |
| `pnpm test` | Vitest 全量（单元 + 回归 + axe 无障碍断言） |
| `pnpm test:watch` | Vitest 监听模式 |
| `pnpm test:coverage` | 带覆盖率阈值的测试 |
| `pnpm build` | 构建可发布库产物到 `dist/` |
| `pnpm audit:all && pnpm smoke` | exports/CSS/指纹/发布烟测护栏 |

提交前请确保 `type-check`、`lint`、`test` 全绿——CI 会逐项把关。

## 测试约定

- 测试位于 `src/components/<name>/index.test.tsx`（Vitest + Testing Library + jsdom）。
- 每个组件至少一条 `axe()` 无障碍断言（`toHaveNoViolations`），按真实带可访问名的用法渲染。
- jsdom 无真实布局：不要断言像素/尺寸/滚动；用到 `ResizeObserver`/`matchMedia`/`IntersectionObserver`/`Element.animate` 的组件在 `beforeEach` 用 `vi.stubGlobal` mock。
- 修 bug 时同步补一条回归测试锁住正确行为。

## 设计约束（务必遵守）

- **保持 DOM/类名契约稳定**：组件 DOM 结构、类名（BEM）、`data-slot`、`data-*` 状态属性遵循既定设计规范。改 a11y 时优先加**不可见**的属性/行为（aria-*、tabIndex、键盘 handler、焦点管理），不改可见结构。
- **基座**：以 `@heroui/react` + `react-aria-components` 封装，不自造交互原语。`react-aria-components` 须与 `@heroui/react` 内部实例同版本。
- **不引入** Radix `Slot`/`asChild`、`tailwind-variants`/CVA——它们会改变渲染的标签/类名，破坏保真。变体用联合字面量类型 + `clsx` 拼 BEM。
- 样式真相源是 `src/styles/components/*.css` 分片（经 `lib.css` 聚合 / 库构建拼成 `dist/styles.css`）；新增分片要同步登记进 `_index.json` 与 `lib.css`。

## 提交信息

遵循 `<type>(<scope>): <中文主题>`，例如 `fix(a11y): 为 carousel 补方向键导航`。
