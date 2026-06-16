# 组件封装模式（所有新组件必须遵守）

本项目以 HeroUI / React Aria Components 与已授权参考组件为基座，封装 Vela UI 自有组件库。CSS 已就绪
（`src/styles/components/<块名>.css`，构建时全量引入），新增样式只应服务组件缺口或展示站布局。

**核心原则：渲染对的 BEM 类名只是「长得像」，不等于「是同一个组件」。** 目标是行为对齐，
不是 DOM 对齐。每个组件的目标体验都建立在某个最佳引擎之上——必须接入**对应的真引擎**，而不是用基础原语近似：

| 能力 | 引擎（必须用） | 反面教材（不要再做） |
| --- | --- | --- |
| Carousel | `embla-carousel-react` | 手写 scrollTo / 原生滚动 |
| Resizable | `react-resizable-panels` | 手写 pointer 数学 |
| 拖拽/重排/展开/流式等布局动画 | `motion`（framer-motion）`layout` | 静态 div / 纯 CSS |
| 步进数字 | `@number-flow/react` | 直接 setState 文本 |
| 图表 | `recharts` | —（已对） |
| 交互原语（select/menu/tree/gridlist/slider…） | `@heroui/react` + `react-aria-components` | —（基座正确） |

**验收标准 = 与参考组件并排对照真实手感**（拖拽物理/缓动/键盘/边界/动画），
不是「aria 翻转了 / 没有 button 嵌套」这种 wiring 级检查，也不是对照抓取的静态快照（那是死 DOM）。

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
- **该用真引擎就装真引擎**（见上表，都是公网开源包）；交互必须是真实可用的，不是「从简」；
  无障碍属性 role/aria 要给，但 aria 对了 ≠ 行为对了。

## 演示

- 写到你被分配的 `src/showcase/demos/<批次>-demos.tsx`，导出 `Record<string, ReactNode>`（key = 组件块名）；
- 用 `DemoSection`（`src/showcase/demo-section.tsx`）包裹，可加 `label`、`isColumn`；
- **不要改** `src/showcase/registry.ts`、`src/components/index.ts` 和其他批次的文件（避免冲突），演示文件里直接从组件目录 import。

## 验收

`pnpm type-check && pnpm build` 必须通过。
