<section class="sidebar-content">
  <header>
    <h1>Decision Architectures</h1>
    <p class="tagline">Decision Architectures &mdash; COS30002 Module 5</p>
  </header>

  <div class="md-body">
    <h2 id="theory">📖 The Textbook: Planning & Utility</h2>
    <p>
      In Game AI, <strong>Decision-Making</strong> involves choosing an action from a set of possibilities based on the current state. We contrast two major approaches: <strong>Planning</strong> (Long-term chain) and <strong>Utility</strong> (Instant best-fit).
    </p>
    
    <div class="rule-card card-green">
      <div class="rule-icon icon-green">🧠</div>
      <div class="rule-body">
        <h3 class="color-green" id="goap">GOAP: Goal-Oriented Action Planning</h3>
        <p>
          Unlike <strong>Behaviour Trees (BTs)</strong>, which are a fixed hierarchy of selectors and sequences, GOAP is a <strong>Plan Generator</strong>. It decouples actions from goals. The AI doesn't have a hardcoded "Attack Branch"; it has a goal (<code>TargetDead</code>) and a list of atomic actions.
        </p>
        <p>
            During reasoning, it uses <strong>Regressive A* Search</strong> to dynamically build a "Plan Chain" from the Goal back to the current state. This allows for emergent problem solving that standard BTs cannot easily replicate.
        </p>
      </div>
    </div>

    <div class="rule-card card-purple">
      <div class="rule-icon icon-purple">⚖️</div>
      <div class="rule-body">
        <h3 class="color-purple" id="utility">Utility & Fuzzy Logic</h3>
        <p>
          Utility-based AI calculates a score (0.0 to 1.0) for every possible behavior. Unlike Finite State Machines (FSMs), which use binary thresholds, Utility uses <strong>Fuzzy Curves</strong>.
        </p>
        <div class="formula-block">
          <code>Utility = Σ (Weight_i * Curve_i(Variable))</code>
        </div>
        <ul class="formula-desc">
          <li><strong>Variable</strong>: The raw environment value (e.g. Health, Distance)</li>
          <li><strong>Curve_i</strong>: The fuzzy membership function mapping the variable to [0,1]</li>
          <li><strong>Weight_i</strong>: Priority modifier for this specific consideration</li>
          <li><strong>Σ</strong>: The final score is aggregated (summed or multiplied) to find the winning action</li>
        </ul>
        <p>
          This avoids "FSM Brittleness", where an AI might awkwardly flip-flop between states at a specific threshold. 
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