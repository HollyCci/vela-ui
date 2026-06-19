# 安装教程：在你的项目里使用 @hollycci/vela-ui

`@hollycci/vela-ui` 是一套基于 HeroUI + React Aria Components 的 React 组件库，发布在
**GitHub Packages**（私有 npm registry）。本教程教你在**自己的项目**里把它装上并用起来。

> ⚠️ 关键前提：GitHub Packages 的 npm registry **即使包是公开的，安装时也必须带认证**。
> 所以第一步一定是配一个 GitHub Token，否则 `npm install` 会报 401/404。

---

## 第 1 步：准备一个 GitHub Token（带 `read:packages`）

1. 打开 https://github.com/settings/tokens/new （Settings → Developer settings → Personal access tokens → **Tokens (classic)**）
2. 起个名（如 `vela-ui install`），设过期时间
3. 勾选 scope：**只勾 `read:packages`**
4. 生成后**立刻复制**（`ghp_...`，只显示一次）

> CI / 团队场景：把它存成 CI secret，别写进代码库（见[第 5 步](#第-5-步ci-里怎么配)）。

---

## 第 2 步：配置 `.npmrc`

在**你的项目根目录**建/改 `.npmrc`：

```ini
@hollycci:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

- 第一行：把 `@hollycci` 这个 scope 指向 GitHub Packages —— **这行可以提交进库**。
- 第二行：认证 token，用环境变量 `${GITHUB_TOKEN}` 占位 —— **token 本身绝不要提交**。

然后注入 token（二选一）：

```bash
# 方式 A：环境变量（推荐；加到 ~/.zshrc 或 ~/.bashrc 持久化）
export GITHUB_TOKEN=ghp_你的token

# 方式 B：写进用户级 ~/.npmrc（不是项目里的那个），直接放明文
#   //npm.pkg.github.com/:_authToken=ghp_你的token
```

---

## 第 3 步：安装

```bash
# 装组件库本体
pnpm add @hollycci/vela-ui          # npm i / yarn add 同理

# 装 peer 依赖（由你的项目提供，版本要对齐）
pnpm add react react-dom \
  @heroui/react@^3.2.1 \
  @heroui/styles@^3.2.1 \
  react-aria-components@1.18.0
```

> **为什么要装这些 peer：**
> - `@heroui/react` / `@heroui/styles`：组件库的运行时基座，需 `>=3.2.1`（3.2.0 是缺陷版，tooltip/calendar 焦点会坏）。
> - `react-aria-components` **务必钉 `1.18.0`**：必须与 `@heroui/react` 内部实例同版本，否则 React context 会静默失效（组件行为异常但不报错）。
> - 我们的 CSS 入口是**预编译产物**，所以**不需要**装 Tailwind。

---

## 第 4 步：在代码里用

```tsx
import { Button, Card, DataGrid } from '@hollycci/vela-ui';
import '@hollycci/vela-ui/css'; // 全局引一次即可（含样式与字体）

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

- **样式只需引一次**：通常放在应用入口（如 `main.tsx` / `app/layout.tsx`）。
- **旧入口已移除**：不要再使用 `@hollycci/vela-ui/styles.css`，请改用 `@hollycci/vela-ui/css`。
- **已有主题系统**：可按需接 `@hollycci/vela-ui/tokens.css`、`@hollycci/vela-ui/components.css` 或 `@hollycci/vela-ui/components/button.css` 等 CSS 子路径。
- **按需子路径导入**（更利于 tree-shaking，可选）：
  ```tsx
  import Button from '@hollycci/vela-ui/button';
  ```
- **TypeScript**：每个组件及其子组件的 Props 类型都随包导出，开箱即用。
- **Next.js / RSC**：交互组件已标 `'use client'`，纯展示组件兼容 Server Component，可直接在 server 组件树引入；`@hollycci/vela-ui/css` 在 `app/layout.tsx` 引入即可。

---

## 第 5 步：CI 里怎么配

让 CI 能装包，把 token 作为 secret 注入环境变量 `GITHUB_TOKEN`。`.npmrc`（含 `${GITHUB_TOKEN}` 占位）正常提交进库即可。

GitHub Actions 示例（消费方项目的 workflow）：

```yaml
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: pnpm install
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}   # 同组织仓库内置 token 通常即可读包
```

> 若消费方与本库**不在同一 GitHub 组织/账号**下，内置 `GITHUB_TOKEN` 可能读不到，需要用一个带 `read:packages` 的 PAT 存成 secret（如 `secrets.VELA_READ_TOKEN`）替换上面的值。

---

## 排错

| 现象 | 原因 / 解决 |
|---|---|
| `npm error 401 Unauthorized` | token 没配或失效。确认 `echo $GITHUB_TOKEN` 有值、token 有 `read:packages`、`.npmrc` 第二行在 |
| `npm error 404 Not Found` (`@hollycci/vela-ui`) | scope 没指向 GitHub Packages（`.npmrc` 第一行缺失）或 token 无权限读 |
| 组件渲染了但**样式全无** | 忘了 `import '@hollycci/vela-ui/css'`；或打包工具把 CSS 摇掉了（确认没在 sideEffects 里排除 CSS） |
| 组件**行为异常**（如下拉/焦点不工作）但不报错 | `react-aria-components` 版本与 `@heroui/react` 不一致 → 钉到 `1.18.0` |
| tooltip / 日历**焦点打不开浮层** | `@heroui/react` 是缺陷的 3.2.0 → 升到 `>=3.2.1` |
| pnpm 报 peer 警告 | 按第 3 步把 peer 依赖装齐、版本对齐即可 |

---

## 升级到新版本

```bash
pnpm update @hollycci/vela-ui          # 在你 package.json 的 semver range 内升
# 或先抬高范围再装：pnpm add @hollycci/vela-ui@^0.3.0
```

破坏性变更只会随 **major** 版本发布，迁移点见对应 Release notes。
