# HeroUI Replica

复刻 [HeroUI Pro](https://heroui.pro) 全部组件的设计风格：样式层直接采用从其线上 CSS bundle 提取的源样式（tokens + 153 个组件的 BEM CSS），React 层为自实现的类型化封装，并配有按分类浏览的展示站。

## 技术栈

React 18 + TypeScript + Vite + clsx。无其他运行时依赖；样式为纯 CSS（非 Tailwind 运行时），含亮/暗/vibrant 三套主题变量。

## 命令

```bash
pnpm install   # 安装依赖
pnpm dev       # 展示站（默认 http://localhost:5180）
pnpm build     # 构建
pnpm type-check
```

## 目录

- `src/styles/` — 设计真相源：`tokens.css`（主题变量）、`properties.css`（CSS 变量注册）、`base.css`、`components/*.css`（153 个组件样式，提取自 HeroUI Pro，未改动）
- `src/components/` — React 封装，每组件一个 kebab-case 目录；封装模式见 `PATTERN.md`
- `src/showcase/` — 组件展示站：侧边栏分类 + 各组件中文演示

## 当前进度

- 已实现 React 封装 + 演示：约 77 个组件（基础 / 表单 / 数据展示 / 反馈导航 / AI / 浮层）
- 仅样式就绪、封装待补：图表类（area/bar/line/pie/radar/radial/composed chart，需配 recharts）、agenda、command、sidebar、app-layout、emoji-picker、table、accordion、resizable 等（侧边栏中置灰显示）

## 致谢与声明

样式版权归 HeroUI 团队所有，本仓库仅用于内部学习与设计参考，请勿用于对外商业产品。
