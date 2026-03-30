# Cognitive Decision Architectures (COS30002)

An interactive, pedagogical simulator for visualizing **Goal-Oriented Action Planning (GOAP)** and **Utility-Based AI (Fuzzy Logic)**. This tool demonstrates how modern games (like F.E.A.R. and The Sims) translate environmental variables into complex, human-like behavior.

## 🚀 Key Features

- **Svelte 5 + HTML5 Canvas:** High-performance visualization of logical chains and scoring bars.
- **Two Core Architectures:**
    - **Mode A: GOAP:** A regressive A* search through action space. Reverses from a Goal (e.g., Target Eliminated) to find the path of least resistance based on current preconditions.
    - **Mode B: Utility (Fuzzy Logic):** Continuous evaluation of competing behaviors using non-linear curves (Attack vs. Heal vs. Flee).
- **Interactive Environment:** Sliders for Agent Health, Ammo Count, and Proximity to threats and resources.
- **Pedagogical Glassmorphism:** Live Decision Cards and Glossary TOC for academic reference.

## 📐 Mathematical Models

### GOAP Cost
$$TotalCost = \sum ActionCost_i$$
The planner selects the path with the minimum Total Cost from the goal state back to the current state.

### Utility Scoring (Fuzzy)
$$Score = \sum (Weight_n \times Curve_n(Variable))$$
Each action competes; the highest score is selected as the current decision.

## 👨‍🏫 Local Development

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run Dev Server:**
   ```bash
   npm run dev
   ```

3. **Build for Production:**
   ```bash
   npm run build
   ```

## 📄 License

Educational material for Swinburne University's COS30002 "AI for Games". ❤️
