# 可组合的基础件清单

Pro 的复合组件就是拿基础件拼的，我们也照拼。下面是常被组合进 Pro 复合组件的本库基础件 +
关键 API。**完整导出列表见 `src/components/index.ts`；具体 prop 名/类型以各组件 `index.tsx` 为准
（拿不准就读源码，别猜）。**

## 数值 / 趋势

### NumberValue（`src/components/number-value`）
大号格式化数字。Pro 的 `KPI.Value` 包它。
- `value: number`（必填）
- `formatOptions?: Intl.NumberFormatOptions`（货币/百分比等，如 `{ style: 'currency', currency: 'USD' }`）
- `locale?`、`prefix?: ReactNode`、`suffix?: ReactNode`
- `animate?: boolean`（值变化滚动动画，走 @number-flow/react，遵循 reduce-motion）

### TrendChip（`src/components/trend-chip`）
软底趋势徽标（箭头 + 值），按方向上色。Pro 的 `KPI.Trend` 包它。
- `trend?: 'up' | 'down' | 'neutral'`（默认 up；映射 success/danger/default 色）
- `value: ReactNode`（必填，如 `'+33%'`）
- `icon?`（替换默认箭头）、`prefix?`、`suffix?`、`size?: 'sm'|'md'|'lg'`、`variant?: ChipVariant`
- 内部包 `Chip`，自带上/下/平箭头 SVG。

### Chip（`src/components/chip`）
- `color?: 'default'|'accent'|'success'|'warning'|'danger'`
- `variant?: 'primary'|'soft'|'tertiary'`（**`soft`=淡底**，Pro 的软徽标用这个，别用实心 primary）
- `size?: 'sm'|'md'|'lg'`

## 进度 / 图表

### ProgressBar（`src/components/progress-bar`）
- `value?: number`（不传=indeterminate）
- `color?: 'default'|'accent'|'success'|'warning'|'danger'`（默认 accent）
- `valueLabel?: ReactNode`
- KPI 里 status→color 直接映射（success/warning/danger）。

### AreaChart（`src/components/area-chart`）/ 直用 Recharts
全幅图表用 `AreaChart`（`data`、`dataKey`、`height`、`children`）。
**迷你 sparkline**（KPI.Chart 那种无轴无网格）直接用 `recharts` 的 `ResponsiveContainer + AreaChart + Area`
（`recharts` 已是依赖）：`<Area type="monotone" dataKey strokeWidth dot={false} isAnimationActive={false} fill="url(#gradId)" />`，
gradient id 用 `useId()`。其它图表：BarChart/LineChart/PieChart/RadarChart/RadialChart/ComposedChart 均有。

## 容器 / 控件 / 装饰

### Card（`src/components/card`）
- `variant?`，渲染 `div[data-slot=card]`，有 `.Header/.Body/.Footer` 等子组件。
- root 包 Card 时：`<Card className={clsx('kpi', className)} data-slot="kpi">`，Card 给边框/底/圆角/阴影，
  `.kpi` 给布局/内边距。

### Button（`src/components/button`）
- `variant?: 'primary'|'secondary'|'tertiary'|'ghost'|'outline'|'danger'|'danger-soft'`
- `size?: 'sm'|'md'|'lg'`、`isIconOnly?`、`isFullWidth?`、`prefix?`/`suffix?`
- 图标钮（如 KPI.Actions 三点）：`<Button variant="ghost" size="sm" isIconOnly aria-label="...">`
- 包真 react-aria Button；`onClick` 仍是真 MouseEvent（见 [[trigger-no-nested-button]]，别再套一层）。

### Separator（`src/components/separator`）
- `orientation?: 'horizontal'|'vertical'`；水平渲染 `<hr>`（隐式 role=separator），垂直渲染 `div[role=separator]`。

## 其它常用基础件（完整见 index.ts）
Avatar、Badge、Skeleton、Spinner、Switch、Checkbox、Radio、Link、Pagination、Tooltip、Popover、
Sheet、HoverCard、ContextMenu、ListView、DataGrid、ItemCard、EmptyState、Stepper、Segment、
NumberStepper、Rating、Carousel、Resizable、CodeBlock、Markdown、各 chat-* / chart-* 等。

> 注：基础件本身已迁移为包真实 `@heroui/react` / react-aria（见 [[library-packaging]]），
> 组合它们即得到真 a11y / 键盘 / 焦点，无需自己补。
