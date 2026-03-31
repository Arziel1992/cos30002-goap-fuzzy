# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2026-04-01 - 00:51] - Fix CI Deployment & Node Deprecation

### Fixed

- Upgraded `actions/setup-node` from Node 20 to Node 22 (current LTS) to resolve GitHub Actions Node 20 deprecation warning.
- Bumped `actions/deploy-pages` from `v4` to `v5` to resolve associated Node 20 runtime warning.

### Notes

- **Action required**: The GitHub Pages source must be set to **"GitHub Actions"** (not "Deploy from a branch") in the repo's Settings → Pages. The MIME error (`/src/main.js blocked`) is caused by Pages serving the raw repo root `index.html` instead of the CI-built `dist/`.

## [2026-04-01 - 00:27] - Fix Vite Version Compatibility

### Fixed

- Downgraded `vite` from `^8.0.0` to `^5.0.0` to satisfy `@sveltejs/vite-plugin-svelte@4` peer dependency (`vite ^5.0.0` required). GitHub Actions CI was failing with `ERESOLVE`.

## [2026-03-31 - 23:59] - Copyright Footer

### Added

- Copyright footer (© E. Ketterer Ortiz) to the right sidebar in all three projects.

## [2026-03-31 - 23:47] - Dual Sidebar Layout

### Changed

- Replaced resizable single sidebar with static dual-sidebar layout (25% left / 50% canvas / 25% right).
- Moved Controls, Physics Engine, and Decision Context panels from left sidebar and floating overlays into the right sidebar.
- Left sidebar now contains only educational content.
- Added toggle buttons on canvas edges to show/hide each sidebar.
- Removed drag-resize functionality.

## [2026-03-31 - 15:53] - Repulsion Slider & Scoped Group Physics

### Changed

- Repulsion slider now behaves intuitively — dragging right increases repulsion (was reversed).
- Scoped tactic groups (Turret Assembly, Base Demolition) repulse external nodes as a single unit; internal nodes retain normal per-node repulsion within the group.

## [2026-03-31 - 15:41] - Graph Visualisation Fixes

### Fixed

- Edges now update positions in real time during force simulation ticks.
- Decision panel label dynamically switches between "Binary Pick" and "Fuzzy Pick" based on active evaluation mode.
- Nodes no longer overlap — added collision force and increased default repulsion/link distance.
- Improved hierarchical layout spacing (200px depth intervals, collision radius 90px).

### Removed

- Bottom-right "Interactive Behaviour Tree Engine" watermark label.

## [2026-03-31 - 10:45] - Initial Commit

### Added

- Created interactive Decision Architecture simulator for GOAP and Utility-Based AI.
- Implemented regressive A* GOAP planner with dynamic goal selection.
- Developed Fuzzy Logic Utility engine with exponential and non-linear scoring curves.
- Added live node-based graph visualization for planning chains.
- Integrated dynamic bar chart for real-time utility evaluation.
- Implemented Light Theme design system with glassmorphism and resizable sidebar.
- Added educational "Textbook" content and integrated Glossary TOC.
