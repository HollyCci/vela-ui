# Git Commit Specification

> This file is the source of truth for Vela UI commit messages.
> It applies to human contributors and AI coding agents.

## 1. General Rule

Each commit should contain one atomic change. Before writing a commit message, inspect the staged diff with:

```bash
git diff --cached
```

The commit message must describe the real intent of the staged change, not just the filenames.

Format:

```text
<type>(<scope>): <subject>

<body>

<footer>
```

- `type` and `scope` use lowercase kebab-case.
- `subject` should be Chinese and written as a clear verb-object phrase.
- There must be one space after the colon.
- The header line should be 72 characters or fewer.
- Bare messages without a type are not allowed.
- Merge commits are exempt.

## 2. Type

Only these nine types are allowed:

| type | Use when | Example |
| --- | --- | --- |
| `feat` | Add a feature, component, demo, or user-visible behavior | `feat(showcase): 增加组件搜索入口` |
| `fix` | Fix incorrect behavior | `fix(form-components): 修复数字步进器禁用态` |
| `perf` | Improve performance without changing behavior | `perf(showcase): 缓存文档内容请求` |
| `refactor` | Improve structure without changing behavior | `refactor(base-components): 收敛按钮类名拼接` |
| `docs` | Change only documentation or comments | `docs(git): 增加提交信息规范` |
| `test` | Add or update tests only | `test(data-display): 增加表格空态用例` |
| `style` | Format code or adjust visual styling without logic changes | `style(styles): 统一预览边框颜色` |
| `chore` | Maintain dependencies, config, build, scripts, release, or tooling | `chore(deps): 升级 Vite 版本` |
| `revert` | Revert an earlier commit | `revert: feat(showcase): 增加组件搜索入口` |

Decision notes:

- New capability -> `feat`
- Bug in existing capability -> `fix`
- Structure-only improvement -> `refactor`
- Speed or bundle-size improvement -> `perf`
- Dependency, Vite, TypeScript, GitHub, package, or release work -> `chore`
- Security fixes use `fix(security)` or a concrete module scope plus a `Security:` footer.

## 3. Scope

Scope describes the module or cross-cutting domain. Use one of the scopes below.
If a new scope is needed, update this list before using it.

Component and product areas:

`base-components` `form-components` `data-display` `feedback` `navigation` `overlays` `ai-components` `chart-components`

Showcase and asset areas:

`showcase` `demos` `docs-content` `reference-pages` `demo-pages`

Technical areas:

`styles` `theme` `tokens` `fonts` `config` `deps` `scripts` `build` `release` `git` `security` `docs`

Rules:

- Do not use Chinese scopes.
- Do not use PascalCase or camelCase scopes.
- Do not use file-location scopes such as `components`, `utils`, `src`, or `public`.
- Prefer splitting unrelated modules into separate commits.
- If a change spans multiple scopes and cannot be split, choose the main intent.

## 4. Subject

The subject should be short, searchable, and specific.

- Use Chinese.
- Prefer a verb-object phrase.
- Do not end with punctuation.
- Avoid vague words such as "更新文件", "修改代码", "修复 bug", "临时", "wip", or "调整一些问题".

Good examples:

```text
docs(git): 增加提交信息规范
fix(showcase): 修复组件预览高度计算
feat(form-components): 增加单元格选择器演示
chore(release): 发布 0.1.0 版本
```

Bad examples:

```text
fix:bug
update files
feat(Components): add stuff
修改 README
```

## 5. Body

Use a body when the subject cannot explain the reason or impact.
Focus on the previous problem, the new behavior, risks, and compatibility notes.
Do not repeat the diff file by file.

```text
fix(showcase): 修复文档内容加载失败兜底

部分组件缺少采集正文时会显示空白页。
现在回退到 registry 元数据渲染，保证组件页仍可浏览基准 demo。
```

## 6. Footer

Use one footer per line when needed:

```text
Closes: #123
Refs: #456
BREAKING CHANGE: xxx
Security: xxx
Migration: xxx
```

AI signature footers are forbidden, including `Co-Authored-By: Claude`, `Generated with ...`, or similar generated-by notices.

## 7. Pre-Commit Message Checklist

Before creating a commit:

1. Run `git diff --cached`.
2. Confirm unrelated files are not staged.
3. Confirm the commit is atomic.
4. Choose one allowed type.
5. Choose one allowed scope.
6. Write a Chinese subject that describes the actual change.
7. Check the header length and colon spacing.
8. Add body/footer only when useful.
9. Do not include AI signature footers.

## 8. Branches And Pull Requests

- Branch names should use `feature/`, `fix/`, `hotfix/`, `docs/`, or `chore/`.
- Pull request titles should follow the same format as commit headers.
- Prefer squash merge when a pull request contains several small work-in-progress commits.
