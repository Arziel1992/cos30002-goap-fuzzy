# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
