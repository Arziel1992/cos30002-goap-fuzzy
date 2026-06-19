# Cognitive Decision Architectures (COS30002)

An interactive, pedagogical simulator that layers two real Game-AI techniques to match a strategy → tactics → action hierarchy: a **fuzzy (or binary) strategy selector** decides *which* goal to pursue, and a **GOAP planner** computes *how* to achieve it as an ordered action queue. It directly contrasts **binary** threshold decisions with **fuzzy** desirability, and shows the GOAP plan the original tool never surfaced.

## 🚀 Key Features

- **Binary vs Fuzzy selection (the headline comparison):** the same inputs are run through hard priority thresholds *and* fuzzy membership functions; the panel shows both picks and flags when they disagree near a boundary.
- **Real fuzzy logic:** crisp Health / Ammo / Enemy-Distance inputs are fuzzified through triangular & shoulder membership functions, combined with fuzzy AND (`min`) / OR (`max`) rules into a continuous desirability per strategy.
- **Real GOAP planner:** a forward **A\*** search over world-states (actions with preconditions, effects and cost) computes the cheapest action sequence to reach the chosen goal — shown as a live, step-through **action queue** with total cost and nodes explored.
- **Reachability made visible:** if an action's preconditions can't be met (e.g. no ammo → can't reload → can't attack), the goal is reported as **unreachable** rather than silently failing.
- **Force-directed graph:** Strategy Selector → Strategy → scoped tactical plan → actions, with desirability (`μ`) and cost badges; TICK executes the plan step by step.

## 📐 Mathematical Models

### Fuzzy desirability

$$
desire(goal) = \max_{rules}\;\min(\mu_{1}, \mu_{2}, \ldots)
$$

Each input is mapped to a membership degree $\mu \in [0,1]$ by its membership function. A rule fires at the strength of its weakest input (fuzzy AND = min); all rules voting for a goal aggregate with fuzzy OR (max).

### GOAP forward A\*

$$
f(state) = g(state) + h(state)
$$

`g` is the summed cost of actions taken so far; `h` is an admissible heuristic — the count of goal facts still unsatisfied. The first goal-satisfying state expanded yields the optimal (lowest-cost) plan.

## 💻 Tech Stack

- **Framework:** [Svelte 5](https://svelte.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Rendering:** HTML5 Canvas API
- **Styling:** CSS variables via Master Template (`app.css`)

## 👨‍🏫 Local Development & Deployment

1. **Install Dependencies:**
   ```bash
   pnpm install
   ```

2. **Run Dev Server:**
   ```bash
   pnpm dev
   ```

3. **Build for Production (Canvas RCE Deployment):**
   ```bash
   pnpm build
   ```

## 📄 License

This repository is licensed under the terms described in the [LICENSE](./LICENSE) file. 

---
_Made with ❤️ for Swinburne — COS30002 Artificial Intelligence for Games — By E. Ketterer_
