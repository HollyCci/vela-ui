# AGENTS.md - Vela UI

> Vela UI is a React + TypeScript component system and showcase.
> This file is the shared instruction entry for coding agents.

## Git Commits

Before writing any commit message, read `docs/git-commit-spec.md` and follow it exactly.

Required format:

```text
<type>(<scope>): <Chinese subject>
```

Key rules:

- Type must be one of `feat`, `fix`, `perf`, `refactor`, `docs`, `test`, `style`, `chore`, `revert`.
- Scope must come from the scope list in `docs/git-commit-spec.md`.
- Scope must be lowercase kebab-case.
- The subject must be Chinese, specific, and action-oriented.
- Run `git diff --cached` before deciding the message.
- Do not include AI signature footers.

## Useful Commands

```bash
pnpm install
pnpm dev
pnpm type-check
pnpm build
```

## Project Notes

- `src/components/` contains typed React component wrappers.
- `src/showcase/` contains the documentation-style showcase app.
- `src/styles/` contains tokens, base styles, and component CSS.
- `public/demo/` and `public/reference/` contain static demo fixtures used by the showcase.
