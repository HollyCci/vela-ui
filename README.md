# Vela UI

Vela UI is a React component playground for building polished product interfaces.
It focuses on typed component APIs, reusable visual patterns, and a documentation-style showcase for browsing examples across forms, navigation, data display, feedback, overlays, and AI interface components.

## Features

- TypeScript-first React components
- Documentation-style component showcase
- Themeable CSS variable foundation
- Light, dark, and vibrant visual modes
- Reference demos for layout, interaction, and visual QA

## Tech Stack

- React
- TypeScript
- Vite
- CSS variables
- Recharts for chart-oriented demos

## Getting Started

```bash
pnpm install
pnpm dev
```

The showcase runs at `http://localhost:5180` by default.

## Scripts

```bash
pnpm dev         # Start the local showcase
pnpm build       # Build the project
pnpm preview     # Preview the production build
pnpm type-check  # Run TypeScript checks
```

## Development

Commit messages follow the project specification in `docs/git-commit-spec.md`.
Use the format `<type>(<scope>): <Chinese subject>` and inspect staged changes before committing.

## Project Structure

- `src/components/` - React component implementations
- `src/styles/` - shared tokens, base styles, and component styles
- `src/showcase/` - documentation-style showcase app and demos
- `public/demo/` - static demo fixtures used by the showcase
- `scripts/` - local maintenance scripts for demo and docs assets

## Status

Vela UI is an early-stage component system experiment. The current focus is on component coverage, visual consistency, and demo quality. Some advanced components are still being refined.

## Compliance

Vela UI is an independent project and is not affiliated with, endorsed by, or sponsored by any third-party UI library or brand. Product names, trademarks, and logos belong to their respective owners. Before using this project in a commercial product, review all dependencies, assets, and generated fixtures to ensure they match your licensing requirements.
