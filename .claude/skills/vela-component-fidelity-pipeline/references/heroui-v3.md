# HeroUI v3 真源 + 细节规范（保真杠杆）

本地有 HeroUI v3 OSS 源码：**`/Users/wocc/Code/enterprise/frontend/heroui`**（heroui-inc/heroui，与我们用的
`@heroui/react` 同版本）。这是**基础件的 ground truth**——拼 Pro 复合件、对齐细节时，**先 diff 真源再动手，别靠推断**。
注意：该仓库**纯 OSS，无任何 Pro 组件**（kpi/command/sheet/data-grid/agenda/各 chat-*/各 chart 都不在，Pro 闭源）。
所以真源只给基础件契约，Pro 复合件仍由基础件拼。

## 基础件四处真源（逐处对齐）

对每个**基础件**（button/card/slider/switch/checkbox… 我们 fork 的同名分片）：
1. `heroui/packages/styles/src/components/<n>/<n>.styles.ts` —— `tv()` 产出的 **BEM 语义类名** + defaultVariants（决定挂哪些类）。
2. `heroui/packages/styles/components/<n>.css` —— **视觉真源**（逐行 token/transition/顺序，Tailwind v4 @apply + 嵌套 + data-attr 选择器；用 CSS 自定义属性做变体引擎：`.button` 定义 `--button-bg` 默认，变体类只重设 token）。
3. `heroui/packages/styles/themes/default/` —— token 默认与覆盖。
4. `heroui/packages/react/src/components/<n>/<n>.tsx` —— `data-slot` / DOM 契约 / RAC primitive。
并核对 `packages/styles/components/index.css` 的 **import 顺序**（共享件先），避免我们 lib.css 后导入造成的特指度覆盖 bug（见 [[cell-wrapper-specificity]]）。

**用法**：我们的 `src/styles/components/<n>.css` 是 fork。要对齐基础件视觉，`diff` 我们的分片 vs `heroui/packages/styles/components/<n>.css`，比对截图精确得多——逐条 transition/token/值核对。

## 细节 1000% 硬数值（照搬，别近似）

**动效（v3 已弃 Framer Motion，改 CSS transition；仅 render-prop 场景用 `motion/react`）**
- press：`transform: scale(0.97)`（bouncy 变体才 `0.95`）；触发选择器同挂 `:active` 与 `[data-pressed="true"]`。
- enter：`animate-in zoom-in-90 fade-in-0 duration-200`；exit：`animate-out zoom-out-95 fade-out duration-150`
  （**exit 比 enter 短：200→150，别对称**）。
- easing：`--ease-out-fluid: cubic-bezier(0.32,0.72,0,1)`（Apple 风）；另有 in/out/in-out×quad…circ 全谱、`--ease-smooth: ease`。
- 预置：`--animate-spin-fast: spin .75s linear infinite`、`--animate-skeleton: skeleton 2s linear infinite`、
  `--animate-caret-blink: caret-blink 1.2s ease-out infinite`；skeleton 末态 `translateX(200%)`。
- tooltip：`--tooltip-delay: 1500ms`、`--tooltip-close-delay: 500ms`（别拍脑袋）。
- **reduce-motion 双通道（极易漏）**：每条 transition 都加 `motion-reduce:transition-none`，且同时响应
  `prefers-reduced-motion` 媒体查询 **和** `[data-reduce-motion="true"]` 属性。
- **性能铁律**：只动 `transform`/`opacity`，禁 `left/top`；`will-change` 用完即撤。

**token（间距/圆角/阴影）**
- `--spacing: 0.25rem`、`--radius: 0.5rem`、`--border-width: 1px`、`--disabled-opacity: 0.5`、`--ring-offset-width: 2px`。
- 圆角阶梯全是 `--radius` 倍数：xs×.25 / sm×.5 / md×.75 / lg×1 / xl×1.5 / 2xl×2 / 3xl×3 / 4xl×4。
- **表单件独立体系**：`--field-radius: calc(var(--radius)*1.5)`、`--field-border-width: 0px`——别和按钮统一。
- 阴影三档 `--surface-shadow`/`--overlay-shadow`/`--field-shadow`；**暗色模式三者全 `0 0 0 0 transparent inset`**
  （暗色无阴影，靠 surface/overlay 亮度差分层）。

**色（oklch + foreground 配对 + color-mix 派生）**
- 语义变量(`--accent`) → `@theme inline` 桥到 Tailwind token(`--color-accent`)；全 oklch。
- **foreground 配对铁律**：无后缀=背景，`-foreground`=其上文字，foreground **永不在组件级硬编码**。
- 派生比例照搬：hover=`色90%+fg10%`（default 特例 96%/4%）；soft 底=`色15%+transparent`、soft-hover=`20%`、
  soft-fg=原色；background secondary/tertiary=`96%/92%+fg 4%/8%`；separator secondary/tertiary=`surface 85%/81%`。

## 官方构建约定（拼 Pro 复合件应照做，易漏）

- **compound + context 下发 slots**：Root 用 `useMemo(xVariants(...))` 算 slots 注入 context，子件 `useContext`
  取 `slots?.foo()`——**别让每个 part 各自 tv()**，否则一处改样式不全 part 生效。
- **className 透传分流**：render-prop 件（Button/Switch/Popover/Tabs…）用 `composeTwRenderProps(className, slots.x())`；
  string-only 件（Label/Input/Heading/Dialog…）用 `slots?.x({className})`。选错 → 外部 className 静默失效。
- **BEM 三段** + **data-attr 双轨**：每个交互态同写伪类与 data-attr（`.btn:hover, .btn[data-hovered="true"]`；
  focus 用 `outline:2px var(--focus); outline-offset:2px`）。默认尺寸进 base（`--md` 修饰符为空）。
- **组合而非复制**：官方明确**别给每个复合件造专属 Label/Description**，复用共享 primitive。
- **静态 className**：禁 `btn--${size}` 动态拼（Tailwind 扫不到），用完整类名。`onPress` 非 `onClick`；
  icon-only Button 必带 `aria-label`。导出永远带 `xxxVariants()`（BEM class 双通道）。
- 保真铁律一致：只补官方真有的 aria，别自创（[[parity-gap-backlog]]）。

## 官方 AI 工具（可选接入）

- **MCP**：`claude mcp add heroui-react -- npx -y @heroui/react-mcp@latest`（Node≥22）。6 tool：
  `get_component_source_code`/`get_component_source_styles`/`get_theme_variables`/`list_components`/
  `get_component_docs`/`get_docs`。**但本地已有 heroui 仓库，直接读文件更快**——MCP 仅在无本地仓库时用。
- `npx heroui-cli@latest agents-md --react` → 文档+demo 落 `.heroui-docs/react/`（离线副本）。
- 官方 skill：`npx skills add heroui-inc/heroui`（装 `/heroui-react`，能力镜像 MCP）。
- `https://heroui.com/react/llms-full.txt`（静态全量参考）。
