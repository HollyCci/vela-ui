# Vela UI

Vela UI 是一套面向产品界面的 React 组件库，以 [HeroUI](https://www.heroui.com/) 与 [React Aria Components](https://react-spectrum.adobe.com/react-aria/) 为无障碍基座，提供 98 个类型完备、可摇树、可在 RSC 中安全使用的组件，覆盖表单、导航、数据展示、反馈、浮层、图表与 AI 界面等场景。仓库同时内置一个文档式 showcase 用于浏览与回归。

## 安装

本包发布在 **GitHub Packages**（私有 registry），消费方先在项目根 `.npmrc` 里把 `@hollycci` scope 指向 GitHub Packages 并配置鉴权 token（需 `read:packages` 权限的 GitHub PAT）：

```ini
# .npmrc
@hollycci:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

```bash
pnpm add @hollycci/vela-ui
# peer 依赖（由宿主应用提供，确保单实例）
pnpm add react react-dom @heroui/react@^3.2.1 @heroui/styles@^3.2.1 react-aria-components@1.18.0
```

> `react-aria-components` 必须与 `@heroui/react` 内部实例同版本（钉死 `1.18.0`），否则上下文会静默失效。
>
> `@heroui/react` 需 `>=3.2.1`：3.2.0 是缺陷发布（dist 误打包第二份 react-aria，导致 tooltip/calendar 焦点在 runtime 失效），3.2.1 已修复。

## 使用

```tsx
import { Button, Card, DataGrid } from '@hollycci/vela-ui';
import '@hollycci/vela-ui/styles.css'; // 一次性引入，含 Vela 预编译样式与字体

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

- **样式**：`@hollycci/vela-ui/styles.css` 是自包含的预编译产物，**消费方无需安装 Tailwind**。
- **Tree-shaking**：ESM-only 发布，每个组件独立产物（`preserveModules`）+ `sideEffects: ["**/*.css"]`，未使用的组件不会进入打包结果。
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
pnpm build        # 构建可发布库产物（dist/：ESM+.d.ts+styles.css+fonts）
pnpm build:demo   # 构建 showcase 静态站
pnpm preview      # 预览构建产物
pnpm type-check   # TypeScript 检查
```

## 发布与升级版本

> 完整可照做的发版作业流程（含门禁、版本号、排错、消费方安装）见 **[docs/release-sop.md](docs/release-sop.md)**。下面是速览。

发布走 **GitHub Release 触发 → CI 自动发到 GitHub Packages**（`.github/workflows/publish.yml`，用仓库内置 `GITHUB_TOKEN`，无需手动 PAT）。发布前 `prepublishOnly` 会自动 `build + smoke` 把关。

出新版本流程：

```bash
# 1) 确保 main 绿：type-check / test / lint / audit:all 全过
# 2) 按 semver 提升 package.json 的 version（patch 修复 / minor 新增 / major 破坏性）
npm version patch   # 或 minor / major；会改 package.json 并打本地 git tag vX.Y.Z
git push && git push --tags
# 3) 在 GitHub 切一个 Release，tag 用 vX.Y.Z（必须与 package.json 的 version 一致）
gh release create vX.Y.Z --title vX.Y.Z --generate-notes
# → publish.yml 自动触发，build + smoke 通过后发布到 GitHub Packages
```

> Release 的 tag 版本务必与 `package.json` 的 `version` 一致，否则发出去的版本号会对不上。

消费方升级：在其 semver range 内 `pnpm update @hollycci/vela-ui`，或先抬高依赖范围再 `pnpm install`。破坏性变更请发 major 版本，并在 Release notes 写明迁移点。

## 构建产物

`pnpm build` 输出到 `dist/`：

- `index.js` — 库入口（ESM-only）
- `components/<name>/index.js` — 每组件独立模块（按需打包）
- `index.d.ts` + `components/<name>/index.d.ts` — 类型声明
- `styles.css` — 由令牌、基础样式、组件分片与字体声明合成的库样式
- `fonts/*.woff2` — 字体资源

## 工程约定

- 组件以 HeroUI / React Aria Components 为基座封装；样式真相源为 `src/styles/lib.css` 与 `src/styles/components/*.css`。
- 提交信息遵循 `docs/git-commit-spec.md`：`<type>(<scope>): <中文主题>`。

## 项目结构

- `src/components/` — 组件实现（库源码）
- `src/index.ts` — 库入口（re-export `./components`）
- `src/styles/` — 令牌、基础样式与组件样式
- `src/showcase/` — 文档式 showcase 与演示
- `vite.config.ts` — showcase 开发配置；`vite.config.lib.ts` — 库构建配置

## 合规

Vela UI 与任何第三方 UI 库或品牌无隶属或背书关系，相关商标归各自所有者。商用前请自行核对所含依赖与资源的授权。
