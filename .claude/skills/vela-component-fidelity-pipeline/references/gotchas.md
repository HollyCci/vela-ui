# 踩坑日志（持续追加）

> 每做一个组件、每踩一个坑，就把**可复用**的教训追加到这里。目标：同一个坑只踩一次。
> 写的时候说清「现象 → 根因 → 怎么做」，让后面的 agent 看一眼就懂。

## 真源 diff（基础件 CSS 对齐 heroui v3，83 件全量实战）

- **`max-*`/`min-*` 钳制项最易在编译态分片里整条漏掉**（无 token 引用、不报错、只在超长/超高内容时暴露）。
  overlay/dialog/sheet/popover/modal 类件**专门核** `max-h`/`max-w`/`min-h`——alert-dialog 漏 `max-height:100%`
  致超高内容溢出视口，modal 同类。
- **结构同构的姊妹件别互抄**：autocomplete 的 popover 段曾从 select.css 误抄（select=`min-w`+popover 自身滚；
  autocomplete=固定 `w/max-w`+popover `overflow-hidden`+滚动&scrollbar&`max-h:320` 在 list-box+独立 popover-dialog
  块）。**每个件核它自己的真源，别假设和邻居一样**。
- **编译态 ≠ drift，别误判**：`var(--container-xs)` == 真源 `max-w-xs`（Tailwind v4 max-w-* 解析为 --container-*）；
  reduce-motion 两路（[data-reduce-motion] 属性轨 + prefers-reduced-motion 媒查轨）是正常展开非重复。status-*
  （focused/disabled/pending/invalid-field）逐字段核展开是否完整。
- **83 件实测：61 已忠实（多数像 button 逐项 1:1）、22 真 drift**——基础件保真度本就高，但那 22 个是截图永远看
  不出的 CSS bug。真源 diff 法可证伪，值得对全部 OSS 同源件跑。

## 单组件 monolith vs Pro compound（dot-notation）API（emoji-picker 实战）

- **现象**：本库 emoji-picker 是「一个 `<EmojiPicker categories=… onEmojiSelect=… isInline=… />` 单组件 props」，
  而线上 Pro 的 API Reference 是 11 个点记法子组件（`EmojiPicker.Trigger/.Value/.Popover/.Content/.Grid/
  .Item/.Footer/.SkinTonePicker/.SkinToneTrigger/.SkinToneContent/.SkinToneOption`），各自有 props + renders-as。
  这类「契约形态根本不同」(monolith ↔ compound) 是**真 API 缺口**，不是 already-aligned——子组件根本没导出。
- **怎么做**：用 `Object.assign(Fn, { Trigger, Value, … })` 把真复合子组件挂成命名空间，每个子组件包对应
  RAC primitive（Trigger→`Button`、Value→`SelectValue`、Popover/SkinToneContent→`Popover`、Grid→`ListBox`、
  Item→`ListBoxItem`、SkinToneOption→`ToggleButton`、Content/Footer/SkinTonePicker→`div`），className 用
  `clsx('emoji-picker__x', fnOrStr)` 默认到 Pro 的 CSS 类 + emit `data-slot`。**单组件 props 路径原样保留**当
  默认行为（十几个老调用点全走它，零破坏）。renders-as 逐一对齐 Pro（button/div/listbox/option），单测加
  `tagName`/`getByRole` 锁死。
- **status 诚实定级**：只补「子组件 API 表面 + props/renders-as」算 upgrade；但若没把 root 从 `DialogTrigger`
  重架成 Pro 的 RAC `Select` 语义、没把 Content 接 `Autocomplete`、Grid 接 `Virtualizer+GridLayout`
  （这些是深引擎改造、会动到所有调用点+测试），则 root 内部引擎仍偏离 Pro → 记 **partial + deviation**，
  别谎报全 upgraded。`Content.filter`/`Grid.layoutOptions` 这种 prop 可先以**类型化 pass-through** 暴露占位。
- **RAC className 是函数式**：`Button/ListBox/Popover/ToggleButton` 的 `className` 可为 `(values)=>string`，
  包装时要 `typeof className === 'function' ? className(values) : className` 才能既默认 Pro 类又透传调用方。
- **`React.HTMLAttributes` 要显式 import**：`import { type HTMLAttributes } from 'react'`，别写 `React.xxx`
  （组件文件多半没 `import * as React`）。linter 会顺手重排 import，改完别被吓到，核对 diff 即可。

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

- **网格内容行多塞一个子项会换行（KPI「with from suffix」实战）**：`.kpi__content` 是 `grid-template-columns: 1fr auto`
  的两列网格（数值占 1fr、趋势标占 auto 靠右）。该变体在中间多塞了一个裸 `<span>from N</span>` 作第 3 个网格
  子项 → auto-placement 把趋势标挤到第 2 行。**修法不是把网格改 flex**（会波及 progress/chart-inline 等同享
  `.kpi__content` 的已对齐变体），而是**把「数值 + 后缀」包进一个 flex 单元**让网格只见两格：value-group(col1
  1fr) + trend(col2 auto)，三者稳定同行、趋势标仍靠右。后缀本身用 `flex-direction:column` 做「from / 数字」两行
  堆叠（小号 muted）。教训：变体往内容行加第 3 个 inline 子项前，先确认该行网格列数，必要时分组成单格。
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
  （`--local-only`），live 不动。`docs/parity-shots/` 已 gitignore——重截不会脏 git，对照看图即可。

## parity 截图：recharts 图表会被截到动画中途（radar 实战）

- **现象**：radar-chart 的多边形/某些图表在 `local__*.png` 里只到半径的 ~50%，看着像 `outerRadius` 太小或
  radius-axis `domain` 太大。**但这是假象**：先用预览 DOM 量过——radar 多边形终态 Design=86 → 99.8px =
  栅格环(116px)的 86%，自动 domain `[0,'auto']` 解析成 `[0,100]`（和显式 `domain={[0,100]}` 那版完全一致），
  栅格到标签的 gap 也只有约 12px（recharts 标签固有偏移，不是「大空隙」）。组件**本身就是 1:1 的**。
- **根因**：recharts 图表 mount 时有约 1.5s 入场动画（radar/area/line 从中心/基线长出来）。
  `captureLive` 截图前会先跑好几秒的 `autoScroll`，动画早跑完→线上图是终态；而 `captureLocal` 只
  `scrollIntoView + sleep(120)` 就截→**靠前的变体被冻在动画中途**（按 `demoIndex` 顺序，越靠前越小，
  越靠后越完整——这就是为什么同样几何的 with-radius-axis(最后截)正常、default/comparison(靠前)偏小）。
- **怎么做**：别动组件的 `outerRadius`/`domain`（动了反而让终态溢出）。在 `captureLocal` 截图前等图表几何
  稳定——poll 该 preview `svg.recharts-surface` 内所有 `path`@d + `polygon`@points 串，连续两次不变即视为
  settled（无 recharts surface 的非图表 preview 立即返回，不增加耗时）。已落地在
  `scripts/capture-parity-screenshots.cjs` 的 `waitForChartSettled`。
- **量图坑**：按颜色量「蓝色多边形」bbox 时，带 `Widget.Legend` 的变体(comparison/multi-series/with-radius-axis)
  图例色块也是蓝的会污染 bbox 宽度；用无图例的 default/dots-only 量纯多边形最干净。
- **预览页量 recharts 动画无效**：Claude Preview 页是 hidden 态、rAF 暂停，radar 多边形 `d` 会卡在
  `M cx,cy L cx,cy …`（全在中心，半径 0）。要量终态得临时 `isAnimationActive={false}` 再量
  （[[preview-hidden-no-raf]]）。

## 流程

- 验证看真实退出码，**禁 `| tail`/`| grep` 掩盖**（[[verify-real-exit-code]]）。
- 有并行 session 在发版（改 package.json 版本 / CSS 分发结构）是常态；本 skill 只碰
  `src/components/<id>` + 其测试，别碰 package.json/版本/vite.config，避免互踩。
