---
name: vela-component-fidelity-pipeline
description: >-
  Vela UI 复刻组件库的组件生产流水线：把一个 Vela 组件做到 / 更新到与线上参考版**像素级、交互级、细节级 1:1**，
  且底层代码与对外接口优雅可组合。当用户说「对齐参考版 / 补齐组件 API / 这个组件是空壳/太薄 /
  用基础件拼 / 复刻这个组件 / 新建一个组件做到和线上一样 / 跟官网不一致 / 参考版升级了同步组件 /
  为什么我们没有这些」、或贴出参考组件的 API 文档/截图要我们对齐时，**务必用本 skill**。
  核心信号 = 让某个组件的样式 / 交互 / API 契约 1:1 对齐线上参考实现。仅改 demo 示例内容、
  改纯样式、或与参考实现无关的普通组件开发不属于本 skill。
---

# vela-component-fidelity-pipeline

Vela UI 复刻组件库的**组件生产流水线**：把一个 Vela 组件做到（或更新到）与线上参考版 1:1。

## 本质目标（四条，缺一不可）

1. **样式 100% 一致** —— 视觉与参考版逐像素对齐。
2. **交互 100% 一致** —— 行为、键盘、焦点、动效与参考版一致。
3. **细节 1000% 较真** —— 间距、圆角、阴影、边界态、空态、加载态、语义……逐项对照，不放过细节。
4. **底层代码与对外接口无比优雅** —— 用基础件拼装、契约清晰、props 对齐参考版、后向兼容、a11y 干净、
   类型完备。**绝不是套 class 的空壳 div。**

> 参考版 = 线上参考实现（其组件文档页可 `WebFetch` 取完整 API，见第 1 步）。

## 这个 skill 解决的根本问题

本库很多组件早期是**「套 class 的空壳 div / demo 级」**——看起来像参考版，但**组件 API 契约比参考版薄得多**
（缺子组件、缺 props、子组件是空透传 div 而非真复合）。真正的「做组件库」是在**组件 API 层**做到 1:1，
不是 demo 层。本 skill 把这条已验证的流水线固化下来，让每个组件都能可重复、可并发、可持续更新地
做到「样式 / 交互 / 细节 / 接口」四个目标。

**第一条铁律 —— 用基础件拼，不要重造。** 参考版的复合组件就是拿它自己的基础件拼的；我们也一样：
`KPI.Value` 包 `NumberValue`、`KPI.Trend` 包 `TrendChip`、`KPI.Chart` 用 Recharts、`KPI.Actions` 包
`Button`……可组合的基础件清单见 [references/base-components.md](references/base-components.md)。
拼装得到的不只是样式，还有真 a11y / 键盘 / 焦点（基础件已包真实底座）——这正是「接口优雅」的来源。

## 每个组件的流水线（按顺序）

### 1. 取 Pro 规格（目标）
- **API Reference + CSS Classes**：来自 heroui.pro 该组件文档页（`https://heroui.pro/docs/react/components/<id>`）。
  **`WebFetch` 这个 URL 已验证可直接抓到完整 API（子组件 + props 类型/默认值 + CSS 类 + data 属性）**
  ——这是流水线能自助运转的关键。prompt 用「Extract the full API Reference: every sub-component with its
  props (type, default), plus CSS Classes and data attributes, verbatim」。万一抓不到（站点改版/被墙），
  再让用户贴。
- **视觉参照**：`docs/parity-shots/<id>/live__*.png`（Pro 示例页实拍）+ `local__*.png`（我们当前实拍）。
  `ls docs/parity-shots/<id>/` 然后 `Read` 这些图，看每个 section / 子组件长什么样。
- **基础件真源（保真杠杆）**：拼/对齐时涉及的**基础件**有本地真源 `/Users/wocc/Code/enterprise/frontend/heroui`
  （HeroUI v3 OSS）。**先 diff 真源再动手**，别推断——视觉对齐 `diff` 我们的分片 vs
  `heroui/packages/styles/components/<n>.css` 比看截图精确。动效/token/色/构建约定的硬数值全在
  [references/heroui-v3.md](references/heroui-v3.md)（press scale 0.97、enter/exit 200/150、field-radius×1.5、
  reduce-motion 双通道、color-mix 派生、compose-not-copy 等）。注意该仓库纯 OSS、无 Pro 组件。

### 2. 读现状
读这四处，建立「我们现在有什么」：
- `src/components/<id>/index.tsx`（组件源码 —— 看每个子组件是真复合还是空 div）
- `src/components/<id>/index.test.tsx`（单测 —— 改完要同步）
- demo（`src/showcase/demos/*.tsx` 里搜 `<Id` 用法 —— 看调用点会不会被破坏）
- `src/styles/components/<id>.css`（样式真相源，见 [[css-source-of-truth]]）

### 3. 找差距
逐个子组件对比「我们的 API」vs「Pro 文档的 API」：哪些子组件缺、哪些 prop 缺、哪些是空透传 div
而 Pro 是真复合（带 props 的组件）。列成表，这是这次要补的工作量。

### 4. 用基础件重建到 Pro API
把缺的/薄的子组件重建为真复合组件，**组合本库已有基础件**（清单见 references/base-components.md）。
- 子组件的 props 对齐 Pro 文档（名字、类型、默认值、语义）。
- root 通常包 `Card`；数值包 `NumberValue`；趋势包 `TrendChip`；进度包 `ProgressBar`；
  迷你图用 Recharts area sparkline；图标钮包 `Button`；分隔线包 `Separator`。
- 拿不准某基础件的 prop 名/类型，直接读它的 `src/components/<base>/index.tsx` 确认，别猜。

### 5. 保后向兼容（别砍现有调用点）
新 API 加上去的同时，**保留 children 回退路径**：提供新 prop（如 `value`/`data`）时走 Pro 路径，
未提供时回退直渲 `children`。这样老 demo / 老调用点不会被一次性砍断（一个组件常有十几个调用点）。
典型写法：`{value !== undefined ? <Base value={value} .../> : children}`。

### 6. a11y 冲突：Pro 文档 ≠ 一定照抄
**保真铁律**：别加 Pro 没有的 aria/角色/行为（见 [[parity-gap-backlog]]）。
**但** 当 Pro 的字面文档与 a11y 冲突、且我们的门禁跑 axe 时，**a11y 干净优先**，并在代码注释里写明这是
对 Pro 的「有意偏差 + 原因」。已知例子：Pro 把 `KPI.Title` 标 `dt`、`KPI.Value` 标 `dd`，但 Pro 自己的
布局把 Title 放 Header、Value 放 Content，凑不成合法 `<dl>`，`dt/dd` 脱离 `dl` 触发 axe 违规 → 我们用 `div`。
更多见 [references/gotchas.md](references/gotchas.md)。

### 7. 更新测试到新 API
旧单测往往断言旧 prop（如 `format`）或旧属性（如 `data-trend`）。改成断言新 Pro API 的行为，
并保持 `axe(container)` 无违规（jsdom 限制见 [[test-suite]]）。

### 8. 验证（真实退出码，禁管道掩盖）
铁律见 [[verify-real-exit-code]]：每条看真实 `EXIT`，**绝不用 `| tail`/`| grep` 掩盖失败**。
```bash
npm run type-check                          > /tmp/v1.log 2>&1; echo "type-check EXIT=$?"
npx vitest run src/components/<id> src/components/<id>-group > /tmp/v2.log 2>&1; echo "unit EXIT=$?"
npm run lint                                > /tmp/v3.log 2>&1; echo "lint EXIT=$?"
npm run build                               > /tmp/v4.log 2>&1; echo "build EXIT=$?"
npm run audit:pro:reference-live            > /tmp/v5.log 2>&1; echo "reflive EXIT=$?"   # 变体数仍 0 mismatch
# 视觉对照：重截 1440 截图，Read local 与 live 比对
node scripts/capture-parity-screenshots.cjs --component=<id> --local-only > /tmp/cap.log 2>&1; echo "cap EXIT=$?"
```
全 `EXIT=0` 且重截截图与 `live__*.png` 一致，才算这个组件落地。任何一项红就先修。

### 9. 按组件提交
`git commit` 一个组件一个提交，message 用 `feat(<id>): ...` 或 `fix(<id>): ...`（遵循 docs/git-commit-spec.md），
正文写明：补了哪些 Pro 子组件/props、组合了哪些基础件、对 Pro 的有意偏差（如有）、门禁状态。
提交结尾加 `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`。

## 并发流水线（多组件一起做）

组件是**一文件一个**（`src/components/<id>/index.tsx` + 各自 `.test.tsx`），互不共享文件 →
**天然适合一组件一 agent 并发 fan-out，无写冲突**（这点比 demo 对齐好得多，demo 多组件共享一个大文件）。

模式：用 `Workflow`，一个 agent 认领一个组件，按上面 1–8 步做到位（含验证），返回结构化结果
（aligned 子组件 / 仍 partial / 对 Pro 的偏差 / 门禁状态）。**前提是每个 agent 都有它那个组件的 Pro API spec**
——所以并发前先把所有目标组件的 Pro API 文档备齐（用户贴 / WebFetch）。跑完主循环统一 `git` 审阅 + 提交。

并发注意：单个 agent 仍要自己跑该组件的单测 + type-check 自检；主循环跑全套门禁兜底。

## 已验证的样板：KPI

提交 `e12ec79`（`git show e12ec79`）。把 KPI 从「11 个空透传 div 子组件」重建为真复合：
`Value→NumberValue`、`Trend→TrendChip`、`Progress→ProgressBar`、`Chart→Recharts sparkline(data/dataKey/...)`、
`Actions→Button(默认三点图标)`、`Separator→Separator`、root→`Card`，全部带 children 回退；
`Title/Value` 因 `dl` 冲突保 `div`（有意偏差）；单测更新到新 API（18 passed）；门禁全绿。
照这个质量与边界做。

## 持续打磨

这个 skill 是活的。每做一个组件、每踩一个坑，就把可复用的教训追加到
[references/gotchas.md](references/gotchas.md)（基础件 API 变化则更新 references/base-components.md）。
目标：坑只踩一次，后续组件流水线越跑越顺。

## 相关项目记忆
[[verify-real-exit-code]] · [[css-source-of-truth]] · [[library-packaging]] · [[parity-gap-backlog]] ·
[[test-suite]] · [[offline-pro-workflow]]（真相：自研无授权，照公开站逆向）
