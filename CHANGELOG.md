# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 2026-06-20 - 05:06

### Changed

- **Replaced the Behaviour-Tree engine with a genuine GOAP + fuzzy architecture.** The tool previously claimed GOAP and fuzzy logic but implemented neither; it was a hand-built behaviour tree with a utility re-sort.
- Strategy selection is now a real comparison between **binary** (priority thresholds) and **fuzzy** (membership functions + min/max rule aggregation) methods; the panel shows both picks and flags when they disagree.
- The graph now maps the intended hierarchy onto real logic: Strategy Selector → Strategy → scoped tactical plan → planned actions.

### Added

- **Forward A\* GOAP planner** over world-states (actions with preconditions, effects, cost). The chosen strategy's **action queue** is shown with per-action cost, total plan cost and nodes explored — the real plan the original never surfaced — and steps through on TICK.
- Unreachable-goal detection: when preconditions can't be met (e.g. no ammo → no reload → no attack), the planner reports "No valid plan".
- Rewrote Sidebar and Glossary to teach fuzzy membership, binary-vs-fuzzy selection, and forward A\* planning; updated README and removed the duplicate/divergent utility scorer.

## 2026-06-19 - 23:18

### Changed

- Migrated the package manager from npm to **pnpm** (global pnpm via Volta).
- Updated CI (`deploy.yml`) to set up pnpm via `pnpm/action-setup` and run `pnpm install --frozen-lockfile` + `pnpm run build`.
- Updated README commands to pnpm.

### Added

- `pnpm-lock.yaml` (imported from the previous `package-lock.json`, which was removed).
- Node pin `"volta": { "node": "24.17.0" }` in `package.json`.

## 2026-06-19 - 22:18 - Conform to refined tool_template

### Changed

- Conformed to the refined `tool_template` shared structure.
- Upgraded toolchain to Svelte 5.56.3, Vite 8, `@sveltejs/vite-plugin-svelte` 7, and Biome 2.5.0; CI Node bumped to 24.
- Normalised `src/app.css` and `.gitignore` to the canonical shared versions.

### Added

- Displayed the build version next to the repository link in the right-panel footer
- `svelte.config.js` (`vitePreprocess`) and `.markdownlint.json` (David Anson Markdown Lint) config.
- Loaded the JetBrains Mono web font used by telemetry/formula styling.

### Fixed

- Removed the broken `/vite.svg` favicon reference (the asset did not exist, causing a 404).

## 2026-04-01 - 00:51 - Fix CI Deployment & Node Deprecation

### Fixed

- Upgraded `actions/setup-node` from Node 20 to Node 22 (current LTS) to resolve GitHub Actions Node 20 deprecation warning.
- Bumped `actions/deploy-pages` from `v4` to `v5` to resolve associated Node 20 runtime warning.

### Notes

- **Action required**: The GitHub Pages source must be set to **"GitHub Actions"** (not "Deploy from a branch") in the repo's Settings → Pages. The MIME error (`/src/main.js blocked`) is caused by Pages serving the raw repo root `index.html` instead of the CI-built `dist/`.

## 2026-04-01 - 00:27 - Fix Vite Version Compatibility

### Fixed

- Downgraded `vite` from `^8.0.0` to `^5.0.0` to satisfy `@sveltejs/vite-plugin-svelte@4` peer dependency (`vite ^5.0.0` required). GitHub Actions CI was failing with `ERESOLVE`.

## 2026-03-31 - 23:59 - Copyright Footer

### Added

- Copyright footer (© E. Ketterer Ortiz) to the right sidebar in all three projects.

## 2026-03-31 - 23:47 - Dual Sidebar Layout

### Changed

- Replaced resizable single sidebar with static dual-sidebar layout (25% left / 50% canvas / 25% right).
- Moved Controls, Physics Engine, and Decision Context panels from left sidebar and floating overlays into the right sidebar.
- Left sidebar now contains only educational content.
- Added toggle buttons on canvas edges to show/hide each sidebar.
- Removed drag-resize functionality.

## 2026-03-31 - 15:53 - Repulsion Slider & Scoped Group Physics

### Changed

- Repulsion slider now behaves intuitively — dragging right increases repulsion (was reversed).
- Scoped tactic groups (Turret Assembly, Base Demolition) repulse external nodes as a single unit; internal nodes retain normal per-node repulsion within the group.

## 2026-03-31 - 15:41 - Graph Visualisation Fixes

### Fixed

- Edges now update positions in real time during force simulation ticks.
- Decision panel label dynamically switches between "Binary Pick" and "Fuzzy Pick" based on active evaluation mode.
- Nodes no longer overlap — added collision force and increased default repulsion/link distance.
- Improved hierarchical layout spacing (200px depth intervals, collision radius 90px).

### Removed

- Bottom-right "Interactive Behaviour Tree Engine" watermark label.

## 2026-03-31 - 10:45 - Initial Commit

### Added

- Created interactive Decision Architecture simulator for GOAP and Utility-Based AI.
- Implemented regressive A* GOAP planner with dynamic goal selection.
- Developed Fuzzy Logic Utility engine with exponential and non-linear scoring curves.
- Added live node-based graph visualization for planning chains.
- Integrated dynamic bar chart for real-time utility evaluation.
- Implemented Light Theme design system with glassmorphism and resizable sidebar.
- Added educational "Textbook" content and integrated Glossary TOC.
