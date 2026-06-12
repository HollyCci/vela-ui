# 组件封装模式（所有新组件必须遵守）

本项目复刻 HeroUI Pro：**CSS 已全部就绪**（`src/styles/components/<块名>.css`，构建时全量引入），
React 层只负责渲染正确的 BEM 类名结构 + 类型化 Props。**不要写新的 CSS**（展示站布局除外）。

## 流程

1. 用 `rg -o "\.<块名>(__[a-z-]+|--[a-z-]+)?" src/styles/components/<块名>.css | sort -u` 查出全部类名；
2. 必要时读 CSS 内容理解结构（哪些是容器/元素/修饰符、有无 data 属性选择器如 `[data-selected]`）；
3. 按下面的样板实现组件与 Props。

## 样板（参考 src/components/button、card、action-bar）

- 目录 kebab-case：`src/components/<块名>/index.tsx`，默认导出；
- Props `type`（不用 interface），继承对应的 `HTMLAttributes`，透传 `className`（clsx 合并）与 `...rest`；
- 修饰符 → 语义化 Props：`variant` / `color` / `size` / `is*` 布尔；默认值与 CSS 的无修饰基类一致；
- 复合组件用 `Object.assign(Root, { Sub })`（参考 card / action-bar）；
- 每个组件（含子组件）设置 `displayName`；`forwardRef` 包装；
- 状态类优先用 CSS 里实际存在的选择器（`data-selected` / `data-open` / 修饰符类），不要自创；
- 禁 `any`；JSX 内禁匿名函数（事件处理提取为 `handleXxx`）；
- 交互从简：纯静态/受控即可，不引入第三方库（无障碍属性 role/aria 要给）。

## 演示

- 写到你被分配的 `src/showcase/demos/<批次>-demos.tsx`，导出 `Record<string, ReactNode>`（key = 组件块名）；
- 用 `DemoSection`（`src/showcase/demo-section.tsx`）包裹，可加 `label`、`isColumn`；
- **不要改** `src/showcase/registry.ts`、`src/components/index.ts` 和其他批次的文件（避免冲突），演示文件里直接从组件目录 import。

## 验收

`pnpm type-check && pnpm build` 必须通过。
