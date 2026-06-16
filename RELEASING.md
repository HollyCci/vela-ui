# 发布流程（Releasing）

`@hollycci/vela-ui` 发布到 **GitHub Packages**（私有 registry）。
触发方式：创建 GitHub Release → `.github/workflows/publish.yml` 用内置 `GITHUB_TOKEN` 自动 `npm publish`（`prepublishOnly` 先 build + smoke）。版本遵循 [SemVer](https://semver.org/lang/zh-CN/)。

## 标准步骤

1. **确认 main 绿**（CI：type-check / lint / test+coverage / build / audit/smoke）：
   ```bash
   pnpm type-check && pnpm lint && pnpm test:coverage && pnpm build && pnpm audit:all && pnpm smoke
   ```

2. **更新 `CHANGELOG.md`**：把 `[Unreleased]` 下的条目整理到新的 `## [X.Y.Z] - YYYY-MM-DD` 小节，顶部留一个空的 `[Unreleased]`，并补两条链接引用。

3. **升版本 + 打 tag**（`npm version` 会改 package.json、提交并打 `vX.Y.Z` tag）：
   ```bash
   npm version patch   # 或 minor / major；首发已是 0.1.0，可直接 git tag v0.1.0
   ```

4. **推送 main 与 tag**：
   ```bash
   git push --follow-tags
   ```

5. **创建 GitHub Release**（用 CHANGELOG 对应小节或 `notes.md` 作正文）：
   ```bash
   gh release create vX.Y.Z --title "vX.Y.Z" --notes-file notes.md
   ```

6. **自动发布**：`publish.yml` 触发，发到 GitHub Packages。在仓库 → Packages 页确认新版本出现。

## 约定与注意

- **仓库保持 private** → 包自动私有；消费方需带 `read:packages` 权限的 PAT（见 README 安装段）。
- Release 的 tag 版本必须与 `package.json` 的 `version` 一致，否则发出来的包版本对不上。
- 真 token 永不入库：发布鉴权在 CI 用 `secrets.GITHUB_TOKEN`，本地手动发用 `~/.npmrc`。
- 本包 1:1 复刻 heroui.pro、`license: UNLICENSED`，**仅限私有/内部使用，勿公开发布**。
