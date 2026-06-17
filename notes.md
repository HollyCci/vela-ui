## @hollycci/vela-ui v0.1.0 — 首个发布

基于 [HeroUI](https://www.heroui.com/) + [React Aria Components](https://react-spectrum.adobe.com/react-aria/) 的企业级 React 组件库：98 个类型完备、可摇树、可在 RSC 中安全使用的组件，覆盖表单、导航、数据展示、反馈、浮层、图表与 AI 界面。

### 亮点

- **可发布**：ESM-only，98 个 per-component `exports` 子路径（`@hollycci/vela-ui/button` 等），全量 `.d.ts`，`'use client'` RSC 边界，自包含 `styles.css` + 字体（消费方无需 Tailwind）。
- **质量保障**：555 测试用例（单元 + 回归 + axe-core 无障碍），行覆盖率约 78%；ESLint（含 `react-hooks`）0 警告；CI 全闸（type-check / lint / test+coverage / build / audit）。
- **正确性**：经三轮严格审查 + 对抗式验证，修复约 60 个正确性 bug（受控/非受控、effect 清理、SSR 水合、键盘可达性、ARIA/焦点管理等）。

### 安装（GitHub Packages，私有）

项目根 `.npmrc`：

```ini
@hollycci:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}   # 有 read:packages 的 PAT
```

```bash
pnpm add @hollycci/vela-ui react react-dom @heroui/react react-aria-components@1.18.0
import '@hollycci/vela-ui/styles.css'
```

完整变更见 [CHANGELOG](./CHANGELOG.md)。
