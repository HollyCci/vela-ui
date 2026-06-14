# Vela UI

Vela UI 是一套面向产品界面的 React 组件库，以 [HeroUI](https://www.heroui.com/) 与 [React Aria Components](https://react-spectrum.adobe.com/react-aria/) 为无障碍基座，提供 98 个类型完备、可摇树、可在 RSC 中安全使用的组件，覆盖表单、导航、数据展示、反馈、浮层、图表与 AI 界面等场景。仓库同时内置一个文档式 showcase 用于浏览与回归。

## 安装

```bash
pnpm add vela-ui
# peer 依赖（由宿主应用提供，确保单实例）
pnpm add react react-dom @heroui/react react-aria-components@1.17.0
```

> `react-aria-components` 必须与 `@heroui/react` 内部实例同版本（钉死 `1.17.0`），否则上下文会静默失效。

## 使用

```tsx
import { Button, Card, DataGrid } from 'vela-ui';
import 'vela-ui/styles.css'; // 一次性引入，含 HeroUI 预编译样式与字体

export function Example() {
  return (
    <Card>
      <Card.Header>
        <Card.Title>你好，Vela</Card.Title>
      </Card.Header>
      <Card.Footer>
        <Button variant="primary">开始</Button>
      </Card.Footer>
    </Card>
  );
}
```

- **样式**：`vela-ui/styles.css` 是自包含的预编译产物，**消费方无需安装 Tailwind**。
- **Tree-shaking**：ESM + CJS 双格式，每个组件独立产物（`preserveModules`）+ `sideEffects: ["**/*.css"]`，未使用的组件不会进入打包结果。
- **RSC / Next.js App Router**：交互组件已标注 `'use client'`（74/98），纯展示组件保持 Server Component 兼容，可直接在 server 组件树中引入。
- **类型**：每个组件及其子组件 Props 类型均随包导出。

## 本地开发（showcase）

```bash
pnpm install
pnpm dev        # 文档式 showcase，默认 http://localhost:5180
```

## 脚本

```bash
pnpm dev          # 启动本地 showcase（开发）
pnpm build        # 构建可发布库产物（dist/：ESM+CJS+.d.ts+styles.css+fonts）
pnpm build:demo   # 构建 showcase 静态站
pnpm preview      # 预览构建产物
pnpm type-check   # TypeScript 检查
```

## 构建产物

`pnpm build` 输出到 `dist/`：

- `index.js` / `index.cjs` — 库入口（ESM / CJS）
- `components/<name>/index.{js,cjs}` — 每组件独立模块（按需打包）
- `index.d.ts` + `components/<name>/index.d.ts` — 类型声明
- `styles.css` — 合并样式（HeroUI 全量 + data-grid + 字体声明）
- `fonts/*.woff2` — 字体资源

## 工程约定

- 组件以 HeroUI / React Aria Components 为基座封装，DOM 与类名对齐设计规范；样式真相源为 `src/styles/heroui-full.css`。
- 提交信息遵循 `docs/git-commit-spec.md`：`<type>(<scope>): <中文主题>`。

## 项目结构

- `src/components/` — 组件实现（库源码）
- `src/index.ts` — 库入口（re-export `./components`）
- `src/styles/` — 令牌、基础样式与组件样式
- `src/showcase/` — 文档式 showcase 与演示
- `vite.config.ts` — showcase 开发配置；`vite.config.lib.ts` — 库构建配置

## 合规

Vela UI 是独立项目，与任何第三方 UI 库或品牌无隶属、背书或赞助关系。产品名称、商标与标识归各自所有者。在商用前请核对全部依赖、资源与生成物以符合你的授权要求。
