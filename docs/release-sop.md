# 发版 SOP（@hollycci/vela-ui）

> 本文是发布新版本的标准作业流程，写给执行者（人或 AI agent）冷启动照做。
> 包名 `@hollycci/vela-ui`，发布到 **GitHub Packages**（registry `https://npm.pkg.github.com`，scope `@hollycci`）。
> 发布由 **GitHub Release 触发 CI 自动 `npm publish`**（`.github/workflows/publish.yml`，用仓库内置 `GITHUB_TOKEN`，**不需要任何手动 PAT**）。

---

## 0. 前置条件

- 在仓库根目录 `frontend/vela-ui/`，分支 `main`，工作区无未提交的 tracked 改动。
- 已装 `pnpm`（版本须与 package.json `packageManager` 一致，当前 `pnpm@10.33.2`）、`node >=20.19`。
- `gh` CLI 已登录且有 `repo`、`workflow` scope（`gh auth status` 确认）。**发布本身不需要 `write:packages`**（CI 用内置 token）。
- 铁律：所有命令看**真实退出码**，禁止 `| tail`/`| grep` 掩盖失败。统一用：
  ```bash
  npm run <x> > /tmp/x.log 2>&1; echo "EXIT=$?"
  ```

---

## 1. 预发布门禁（必须全部 EXIT=0）

```bash
cd frontend/vela-ui
npm run type-check        > /tmp/g1.log 2>&1; echo "type-check EXIT=$?"
npm run test              > /tmp/g2.log 2>&1; echo "test EXIT=$?"
npm run lint              > /tmp/g3.log 2>&1; echo "lint EXIT=$?"
npm run audit:all         > /tmp/g4.log 2>&1; echo "audit:all EXIT=$?"
npm run audit:pro:browser > /tmp/g5.log 2>&1; echo "audit:pro:browser EXIT=$?"
```

**任一非 0 → 停，先修，别继续发版。**

### 1b. 构建产物自检（两个已知陷阱，必查）

```bash
rm -rf dist && npm run build > /tmp/build.log 2>&1; echo "build EXIT=$?"

# 陷阱① 不能有 vendored 依赖被打进 dist/node_modules
ls dist/node_modules 2>/dev/null && echo "❌ 有 vendored 依赖" || echo "✅ 无 dist/node_modules"

# 陷阱② dist 里不能出现品牌域名 heroui.pro（合规 + audit:fingerprint 会拦）
grep -rl "heroui\.pro" dist 2>/dev/null && echo "❌ dist 含 heroui.pro" || echo "✅ dist 干净"
```

两条都要是 ✅。陷阱处理见 [§5 排错](#5-排错known-gotchas)。

---

## 2. 版本号（semver）

| 改动性质 | bump |
|---|---|
| 仅修 bug、无 API 变更 | `patch`（x.y.**Z**）|
| 新增组件/能力、向后兼容 | `minor`（x.**Y**.0）|
| 破坏性变更（删/改 props、改导出、提 peer 下限等） | `major`（**X**.0.0）|

```bash
npm version <patch|minor|major> --no-git-tag-version   # 只改 package.json，不打 tag
NEW=$(node -e "console.log(require('./package.json').version)"); echo "新版本 v$NEW"

# CI 会跑 frozen-lockfile，本地先验证别让它在 CI 挂
pnpm install --frozen-lockfile > /tmp/frozen.log 2>&1; echo "frozen EXIT=$?"
```

提交（遵循 `docs/git-commit-spec.md`：`<type>(<scope>): <中文主题>`）：

```bash
git add package.json
git commit -m "chore(release): v$NEW — <一句话说明本版改了什么>

<可选正文：破坏性变更/新增 peer 依赖务必写明>

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

> 破坏性变更或新增/调整 peer 依赖，**必须**在 commit 正文和 Release notes 里写清迁移点。

---

## 3. 推送 + 切 Release（触发自动发布）

```bash
git push origin main

# tag 必须 = package.json 的 version（带 v 前缀）。--target main 会在 main HEAD 建 tag。
gh release create "v$NEW" --target main --title "v$NEW" \
  --notes "本版变更：<列要点>。⚠️ 破坏性/新增 peer 在此写明。安装见 README。"
```

`release: published` 事件触发 `publish.yml` → `pnpm install` → `npm publish`（其 `prepublishOnly` 自动 `build + smoke` 把关）。

---

## 4. 盯发布 + 验证

```bash
sleep 6
RID=$(gh run list --workflow=publish.yml -L 1 --json databaseId -q '.[0].databaseId')
gh run watch "$RID" --exit-status; echo "WATCH_EXIT=$?"   # 0 = 成功
gh run view "$RID" --json status,conclusion -q '"\(.status)/\(.conclusion)"'
```

### 4b. 真实消费方安装复测（强烈建议）

需要一个有 `read:packages` 的 GitHub PAT（**仅本地用，绝不入库/不贴聊天**）。

```bash
T=$(mktemp -d)
printf '@hollycci:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}\n' > "$T/.npmrc"
printf '{"name":"consume-test","version":"1.0.0","private":true}\n' > "$T/package.json"
( cd "$T" && GITHUB_TOKEN=<你的read:packages_PAT> npm install "@hollycci/vela-ui@$NEW" --no-audit --no-fund )

# 验证：版本对、无 vendored、无 heroui.pro
node -e "console.log(require('$T/node_modules/@hollycci/vela-ui/package.json').version)"
ls "$T/node_modules/@hollycci/vela-ui/dist/node_modules" 2>/dev/null && echo "❌vendored" || echo "✅"
grep -rl "heroui\.pro" "$T/node_modules/@hollycci/vela-ui/dist" 2>/dev/null && echo "❌heroui.pro" || echo "✅"
rm -rf "$T"
```

---

## 5. 排错（known gotchas）

| 现象 | 原因 | 处理 |
|---|---|---|
| CI 在 **Setup pnpm** 步挂：`No pnpm version is specified` | `pnpm/action-setup@v4` 要版本号 | package.json 必须有 `"packageManager": "pnpm@<版本>"`（已配；动 pnpm 版本时同步改） |
| `dist/node_modules` 里出现某依赖 | 有组件 **runtime import** 了它，但没在 `vite.config.lib.ts` 的 `external` 里 → preserveModules 把它连子依赖一起 vendored | 把该包加进 `external`（正则或字符串），并在 package.json 声明为 `peerDependency` 或 `dependency`；重建确认消失。例：`@heroui/styles`（button 的 buttonVariants） |
| `audit:fingerprint` 报 `dist/styles.css contains forbidden pattern /heroui.pro/i` | 源码 CSS 注释含 `heroui.pro`，被 copyStyles 拼进 styles.css | 把注释里的 `heroui.pro` 改为品牌中性措辞（如「线上 Pro 版」）；全仓查：`grep -rln "heroui\.pro" src` |
| 发了但 `npm view @hollycci/...` 报 404/403 | 本地 gh/npm token 无 `read:packages` scope | **不是发布失败**。以 `publish.yml` run 的 `conclusion=success` 为准；要本地查/装需带 `read:packages` 的 PAT |
| Release 切了但 workflow 没跑 | publish.yml 只认 `release: published`（无 `workflow_dispatch`），或 tag 指向的 commit 没有最新代码 | 确认 `publish.yml` 已在该 commit 存在；若 tag commit 不对：`gh release delete vX.Y.Z --yes --cleanup-tag` 后在正确 commit 重切 |
| 想重发同一版本 | npm 不允许重复发布同版本号 | 修完 bump 到新 patch 版本，重新走 §2–§4 |

---

## 6. 消费方怎么用（给被发布服务的项目）

详见 [README「安装」节](../README.md)。要点：

1. 消费项目 `.npmrc`（registry 映射可入库，**token 不入库**）：
   ```ini
   @hollycci:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
   ```
   `GITHUB_TOKEN` 为带 `read:packages` 的 PAT，放环境变量或用户级 `~/.npmrc`。
2. 安装 + peer 依赖：
   ```bash
   pnpm add @hollycci/vela-ui
   pnpm add react react-dom @heroui/react@^3.2.1 @heroui/styles@^3.2.1 react-aria-components@1.18.0
   ```
3. 用：`import '@hollycci/vela-ui/styles.css'`（自包含，无需 Tailwind）。
4. 升级：在 semver range 内 `pnpm update @hollycci/vela-ui`。

---

## 7. 安全红线

- **PAT 绝不写进仓库、提交、Issue、聊天**。CI 发布用内置 `GITHUB_TOKEN`，无需 PAT。
- PAT 一旦外泄，立即去 https://github.com/settings/tokens 撤销并重建。
- 只有 `.npmrc` 里的 `@hollycci:registry=...` 映射行可入库；带 `_authToken` 的行必须走环境变量。
