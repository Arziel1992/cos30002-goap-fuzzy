<section class="sidebar-content">
  <header>
    <h1>Decision Architectures</h1>
    <p class="tagline">Decision Architectures &mdash; COS30002 Module 5</p>
  </header>

  <div class="md-body">
    <h2 id="theory">📖 The Textbook: Two Decision Layers</h2>
    <p>
      This tool stacks two real techniques. A <strong>fuzzy selector</strong> decides
      <em>which</em> strategy to pursue (the goal), and a <strong>GOAP planner</strong>
      works out <em>how</em> to achieve it (the action queue). The graph mirrors this:
      <strong>Strategy Selector → Strategy → Tactical plan (scoped) → Actions</strong>.
    </p>

    <div class="rule-card card-blue">
      <div class="rule-icon icon-blue">🎚️</div>
      <div class="rule-body">
        <h3 class="color-blue" id="binary-vs-fuzzy">Binary vs Fuzzy Selection</h3>
        <p>
          The headline comparison. <strong>Binary</strong> selection uses hard
          thresholds in a fixed priority order — the first rule that fires wins
          (e.g. <code>if health &lt; 30 → Survive</code>). It is brittle near the
          threshold and ignores how far over the line a value sits.
        </p>
        <p>
          <strong>Fuzzy</strong> selection instead fuzzifies each input through
          membership functions and blends rules into a continuous
          <strong>desirability</strong> per strategy. Near boundaries the two methods
          can <strong>disagree</strong> — the right panel flags exactly when.
        </p>
        <div class="formula-block">
          <code>μ_near(dist), μ_low(ammo), μ_critical(health) → [0,1]</code><br />
          <code>desire(goal) = max over rules ( min(μ inputs) )</code>
        </div>
        <ul class="formula-desc">
          <li><strong>μ</strong>: a membership function mapping a crisp value into a fuzzy set [0,1]</li>
          <li><strong>min</strong>: fuzzy AND — a rule is only as strong as its weakest input</li>
          <li><strong>max</strong>: aggregates all rules that vote for the same goal</li>
        </ul>
      </div>
    </div>

    <div class="rule-card card-green">
      <div class="rule-icon icon-green">🧠</div>
      <div class="rule-body">
        <h3 class="color-green" id="goap">GOAP: the tactical plan</h3>
        <p>
          Once a strategy is chosen, GOAP plans the action queue. Each
          <strong>action</strong> has <strong>preconditions</strong>, <strong>effects</strong>
          and a <strong>cost</strong>; the goal is a target world-state (e.g.
          <code>enemyDead = true</code>). A <strong>forward A* search</strong> finds the
          cheapest action sequence whose effects reach the goal.
        </p>
        <div class="formula-block">
          <code>f(state) = g(cost so far) + h(unmet goal facts)</code>
        </div>
        <ul class="formula-desc">
          <li><strong>g</strong>: summed cost of the actions taken to reach this state</li>
          <li><strong>h</strong>: admissible heuristic — number of goal facts still unsatisfied</li>
        </ul>
        <p>
          If an action's preconditions can never be met (e.g. <em>Reload</em> needs ammo
          you don't have), the goal becomes <strong>unreachable</strong> and the planner
          returns no plan — visible directly in the action queue.
        </p>
      </div>
    </div>

    <div class="game-cases">
      <article>
        <h4>GOAP: F.E.A.R. (Monolith Productions)</h4>
        <p>
          Soldiers in F.E.A.R. use GOAP to dynamically suppress players. If they lose their gun, the planner automatically generates a path to find a replacement without a specific "Missing Gun" state.
        </p>
      </article>

      <article>
        <h4>Utility: The Sims (Maxis)</h4>
        <p>
          Sims use high-dimension utility to fulfill "Needs". "Eating" has a higher utility when the "Hunger" curve is low, but might be overridden by "Sleep" if the "Energy" curve is even lower.
        </p>
      </article>

      <article>
        <h4>GOAP: STALKER (S.T.A.L.K.E.R.)</h4>
        <p>
          Stalkers use GOAP to manage survival goals like "Find Artifact" or "Avoid Blowout", resulting in emergent behavior that feels alive and unpredictable.
        </p>
      </article>
    </div>
  </div>
</section>

<style>
  
</style>