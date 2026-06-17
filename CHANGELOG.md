# Changelog

本项目的所有重要变更都会记录在此文件中。
格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本遵循 [SemVer](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### Changed

- **依赖升级**：将 `@heroui/react` 升级至 `3.2.0`，`react-aria-components` 升级至 `1.18.0`。
- **组件适配**：适配 Switch/Checkbox/Radio 的 explicit `*.Content` 组合模式变更，重构 `CellSwitch` 与 `DataGrid` 行选择复选框。
- **类型修复**：修复 `CellSwitch`、`CheckboxButtonGroup`、`RadioButtonGroup` 的编译类型错误。
- **测试调整**：调整 `Tooltip` 单元测试以兼容 JSDOM 环境下的焦点触发机制。

## [0.1.0] - 2026-06-16

### Added

- **可发布库工程化**：ESM-only 构建（`preserveModules` 每组件独立产物）、98 个 per-component `exports` 子路径、全量 `.d.ts` 类型声明、`'use client'` RSC 边界、自包含 `styles.css` + 字体分发、`peerDependencies` 划分。
- **测试套件**：Vitest + Testing Library + jsdom，98 个组件共 555 用例（单元 + 回归 + axe-core 无障碍断言）；`pnpm test` / `test:watch` / `test:coverage`（带覆盖率阈值）。
- **质量闸**：ESLint flat config（`react-hooks/exhaustive-deps` + typescript-eslint + react），基线 0 error / 0 warning；GitHub Actions CI（type-check / lint / test+coverage / build / audit / smoke）。
- **文档**：README 消费文档、CONTRIBUTING 贡献指南。

### Fixed

- 三轮严格审查（含对抗式验证）确认并修复约 60 个正确性 bug，覆盖：受控/非受控、effect 清理与泄漏、SSR/水合一致性、性能重渲染、键盘可达性、ARIA 角色/可访问名、焦点管理（含移动抽屉焦点陷阱、视图切换焦点恢复）、除零与边界值等。
- axe-core 审计修复 3 处组件无障碍违规（kanban list 角色、context-menu 浮层命名、file-tree chevron 命名）。

[Unreleased]: https://github.com/HollyCci/vela-ui/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/HollyCci/vela-ui/releases/tag/v0.1.0
