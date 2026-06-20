# 踩坑日志（持续追加）

> 每做一个组件、每踩一个坑，就把**可复用**的教训追加到这里。目标：同一个坑只踩一次。
> 写的时候说清「现象 → 根因 → 怎么做」，让后面的 agent 看一眼就懂。

## 判薄不薄 / 别瞎改（批次1 实战）

- **不是所有组件都要「用基础件拼真复合」。** 结构 primitive（Widget / Card / KpiGroup 这类）在**参考版自己的
  API 里就是纯 `className + children` 的 passthrough 容器**——真复合内容（NumberValue/Recharts…）活在 demo
  层，不在组件 API。判薄看「**参考版该组件的 API 表本身有没有 props / 复合子件**」，**不是看视觉里有图表就
  以为该内嵌 Recharts**。误把结构 primitive 当空壳硬塞基础件 → 造出参考版没有的 superset，违反保真铁律。
- **already-aligned 要给证据链**：WebFetch 抽参考版 API → 逐子组件对 props/渲染元素/CSS 类 → 对照
  parity-gap-backlog 既有评定 → 自检 EXIT=0，四者齐备才报 aligned。已对齐的组件（mtime 新 + 注释
  「参考实现快照逐字一致」= 已完成信号）**别为交差硬改**，会破坏已绿状态 + 踩后向兼容雷。
- **demo 调用点是最强的 API 覆盖证明**：若 demo 已消费全套 API（hooks/自定义 children/controlled/size），
  说明 API 表面是真被用的、非纸面。
- **`parity-gap-backlog.json` 的 suggestedFix ≠ 该做的事。** 它常「建议超出参考版」（如给 Widget 加 Actions
  slot / aria-pressed / isLoading，而参考版 API 根本没有）。实现前先核对参考版文档真有该 API，没有就**主动拒绝**。

## 渲染元素 / props 细节（批次1 实战）

- **逐子组件核对「渲染元素 renders-as」，别只看名字。** 隐蔽差距：empty-state 的 `Description` 名字一致但
  渲染 `div`≠参考版 `p`；item-card 的 `Title/Description` 是 `div`≠参考版 `span`。**renders-as 只在触发 a11y
  冲突时才偏差（KPI 的 dt/dd→div）；否则照参考版的元素抄**（span/h3/p 不触发 axe，照抄反而更语义；CSS 锁
  的是 `.x__title` 类不是标签，div→span/h3/p 视觉零变化）。改完用 `tagName` / `getByRole('heading',{level:3})`
  锁渲染元素。
- **带默认值的联合 prop 要「未传也 emit 属性」。** 参考版若把某 prop 写成 `'default'|'icon'` 默认 `'default'`，
  组件未传时也要 emit `data-variant="default"`，否则 `[data-variant=default]` 这条 CSS 永远死代码、且 prop 类型
  比参考版窄（少 `'default'` 字面量）。
- **`render: DOMRenderFunction`（root 可覆盖默认元素）本库已有成熟样板**：`src/components/drop-zone/index.tsx`
  —— 渲染处 `render !== undefined ? render(domProps) : <div ref={ref} {...domProps}/>`，把解析后的所有 props
  （含 `data-*`/事件）收敛成 `domProps` 对象再分流，ref 只给默认 div。新组件补 render **直接照搬**。
  `data-*` 写进 `HTMLAttributes<HTMLDivElement>` 字面量时 `as HTMLAttributes<HTMLDivElement>` 收尾过 tsc。
- **移除既有 role/aria 前先 grep 全仓有无 `getByRole` 依赖**（demo + 测试），确认无依赖才安全删。

## 并发自检（批次1 实战，重要）

- **并发跑 skill 时 `npm run type-check`（全量）会被别的 agent 在途编辑污染、给假失败**（item-card-group 自检
  tc EXIT=1 实为 item-card 的 WIP 未用类型，本组件无辜）。处理：自检用**隔离单文件** `npx tsc --noEmit <file>`，
  或**信任主循环的最终 Verify 门禁**（所有 agent 收工后再跑一次才权威）。**绝不去 stash/改别的 agent 的文件**
  （auto-mode 会拦）。先 `grep 'error TS'` 看错误归属哪个文件再判。
- **jsdom 报 `canvas getContext 未实现` 是正常噪声**，不影响退出码——看真实 `EXIT` 而非日志措辞。
- **grep 组件名要精确**：`grep 'Stepper'` 会命中无关的 `NumberStepper`，别把别的组件调用点误算进工作量。

## a11y / 语义

- **Pro 文档的 `dt`/`dd` 别盲抄。** Pro 把 `KPI.Title` 标 `dt`、`KPI.Value` 标 `dd`，但它的布局把 Title 放
  Header、Value 放 Content，凑不成合法 `<dl>`；`dt/dd` 脱离 `dl` 会触发 axe `dlitem` 违规。→ 用 `div`，
  在注释写明「对 Pro 的有意偏差 + 原因」。**通则**：Pro 字面文档与 axe 冲突时，a11y 干净优先。
- **别加 Pro 没有的 aria/role/行为**（保真铁律，[[parity-gap-backlog]]）。补 API 是补 props/组合，不是
  顺手加无障碍特性——那会让 audit 把我们判成「比 Pro 多」。
- **`h3`/`p` 不是 `dt`/`dd`，可以照抄。** `dt/dd` 脱离 `dl` 才违规；Pro 标 `Title→h3`、`Description→p`
  这类独立标题/段落元素无 list-context 父级要求，照搬反而更语义、axe 干净（item-card-group 实测：Title
  从 `div`→`h3`、Description `div`→`p` 后 axe 仍 0 违规、视觉不变因 CSS 锁的是 `.item-card-group__title`
  类而非标签）。改完把单测断言加 `tagName` / `getByRole('heading', { level: 3 })` 锁住渲染元素。

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

- **`WebFetch https://heroui.pro/docs/react/components/<id>` 已验证可抓到完整 API**（2026-06 在 empty-state
  实测：子组件 + props 类型/默认值 + CSS 类 + data 属性全拿到）。所以流水线可自助取 spec，**不必每个都让
  用户贴**。prompt 要明确「verbatim、结构化、含 props 类型/默认值 + CSS Classes + data attributes」。
- 抓 spec 时连**渲染元素**一起记（Pro 常标某子组件渲染为 `h3`/`p`/`dt`/`dd` 等）——这关系到语义与 a11y
  （但 `dl` 类冲突仍按 a11y 干净优先，见上）。
- 万一站点改版/抓不到，再回退让用户贴。本地 gh/npm token 的 `read:packages` 与本 skill 无关（那是装包，
  不是文档）。
- `docs/parity-shots/<id>/` 里 `live__*.png` 是 Pro 实拍、`local__*.png` 是我们的；重截只更新 local
  （`--local-only`），live 不动。

## 流程

- 验证看真实退出码，**禁 `| tail`/`| grep` 掩盖**（[[verify-real-exit-code]]）。
- 有并行 session 在发版（改 package.json 版本 / CSS 分发结构）是常态；本 skill 只碰
  `src/components/<id>` + 其测试，别碰 package.json/版本/vite.config，避免互踩。
