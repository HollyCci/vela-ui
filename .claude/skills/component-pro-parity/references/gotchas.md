# 踩坑日志（持续追加）

> 每做一个组件、每踩一个坑，就把**可复用**的教训追加到这里。目标：同一个坑只踩一次。
> 写的时候说清「现象 → 根因 → 怎么做」，让后面的 agent 看一眼就懂。

## a11y / 语义

- **Pro 文档的 `dt`/`dd` 别盲抄。** Pro 把 `KPI.Title` 标 `dt`、`KPI.Value` 标 `dd`，但它的布局把 Title 放
  Header、Value 放 Content，凑不成合法 `<dl>`；`dt/dd` 脱离 `dl` 会触发 axe `dlitem` 违规。→ 用 `div`，
  在注释写明「对 Pro 的有意偏差 + 原因」。**通则**：Pro 字面文档与 axe 冲突时，a11y 干净优先。
- **别加 Pro 没有的 aria/role/行为**（保真铁律，[[parity-gap-backlog]]）。补 API 是补 props/组合，不是
  顺手加无障碍特性——那会让 audit 把我们判成「比 Pro 多」。

## 后向兼容 / 调用点

- **新 API 一定带 children 回退**，否则一个组件十几个老调用点会被一次性砍断、demo 编译全红。
  写法：`{value !== undefined ? <Base value={value}/> : children}`。改完跑 type-check 看老调用点是否还编译。
- **回退分支别 spread 复合 props 到原生元素**。如 `KPI.Trend` 的 fallback span 不能把 `trend/icon/size`
  这些 TrendChip 专属 prop spread 到 `<span>`（TS 会报非法属性）。fallback 只透传 `className` + `children`。

## 测试

- 改组件 API 后，旧单测常断言旧 prop（`format`）或旧属性（`data-trend`）→ 同步改成断言新 Pro API。
- `axe(container)` 必须保持 0 违规；jsdom 无布局/无 ResizeObserver，写测试避开（[[test-suite]]）。
- 组件常有配套 `*-group` 测试（如 kpi + kpi-group），改完一起跑：`npx vitest run src/components/<id> src/components/<id>-group`。

## 样式

- 样式真相源是分片 `src/styles/components/<id>.css`（[[css-source-of-truth]]）；改类名行为前先确认分片。
- 包装件/cell-* 与基础 shard 同特指度时，base 后导入会胜出 → 视觉 bug；加祖先类提特指度
  （[[cell-wrapper-specificity]]）。
- 源码注释里别出现 `heroui.pro` 域名——copyStyles 会把 CSS 注释拼进 dist/styles.css，触发
  audit:fingerprint 禁止模式。措辞用「线上 Pro 版」。

## 依赖 / 打包

- 组件 runtime import 的包必须在 `vite.config.lib.ts` 的 `external` 里且声明为 peer/dep，
  否则 preserveModules 会把它连子依赖 vendored 进 `dist/node_modules`（[[library-packaging]]）。
  新组合基础件如果引入了新的第三方 runtime 依赖，记得同步 external + peer。

## 取 Pro 规格

- 本地 gh/npm token 常缺 `read:packages`，与本 skill 无关；Pro API 文档来自 heroui.pro 文档页，
  不是 npm。优先让用户贴 API Reference（最准），WebFetch 兜底，抓不到就停下来要。
- `docs/parity-shots/<id>/` 里 `live__*.png` 是 Pro 实拍、`local__*.png` 是我们的；重截只更新 local
  （`--local-only`），live 不动。

## 流程

- 验证看真实退出码，**禁 `| tail`/`| grep` 掩盖**（[[verify-real-exit-code]]）。
- 有并行 session 在发版（改 package.json 版本 / CSS 分发结构）是常态；本 skill 只碰
  `src/components/<id>` + 其测试，别碰 package.json/版本/vite.config，避免互踩。
