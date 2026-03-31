<section class="sidebar-content">
  <header>
    <h1>Decision Architectures</h1>
    <p class="tagline">Reasoning Frameworks for COS30002</p>
  </header>

  <div class="md-body">
    <h2 id="theory">📖 The Textbook: Planning & Utility</h2>
    <p>
      In Game AI, <strong>Decision-Making</strong> involves choosing an action from a set of possibilities based on the current state. We contrast two major approaches: <strong>Planning</strong> (Long-term chain) and <strong>Utility</strong> (Instant best-fit).
    </p>
    
    <h3 id="goap">GOAP: Goal-Oriented Action Planning</h3>
    <p>
      Unlike <strong>Behaviour Trees (BTs)</strong>, which are a fixed hierarchy of selectors and sequences, GOAP is a <strong>Plan Generator</strong>. It decouples actions from goals. The AI doesn't have a hardcoded "Attack Branch"; it has a goal (<code>TargetDead</code>) and a list of atomic actions.
    </p>
    <p>
        During reasoning, it uses <strong>Regressive A* Search</strong> to dynamically build a "Plan Chain" from the Goal back to the current state. This allows for emergent problem solving that standard BTs cannot easily replicate.
    </p>

    <h3 id="utility">Utility & Fuzzy Logic</h3>
    <p>
      Utility-based AI calculates a score (0.0 to 1.0) for every possible behavior. Unlike Finite State Machines (FSMs), which use binary thresholds, Utility uses <strong>Fuzzy Curves</strong>.
    </p>
    <div class="formula-block">
      <code>Utility = Σ (Weight_i * Curve_i(Variable))</code>
    </div>
    <p>
      This avoids "FSM Brittleness", where an AI might awkwardly flip-flop between states at a specific threshold. 
    </p>

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
  header { margin-bottom: 2rem; }
  h1 { font-size: 1.8rem; color: var(--accent); margin: 0; font-weight: 800; }
  .tagline { font-size: 0.85rem; color: var(--text-secondary); margin: 0.2rem 0; }

  .md-body { line-height: 1.6; font-size: 0.95rem; color: var(--text-secondary); }

  .md-body h2 {
    font-size: 1.1rem; color: var(--text-primary);
    margin: 2rem 0 1rem 0; border-bottom: 1px solid var(--panel-border);
    padding-bottom: 0.5rem;
  }

  .md-body h3 { font-size: 1rem; color: var(--text-primary); margin: 1.5rem 0 0.5rem 0; }

  .md-body p { margin-bottom: 1rem; }
  .md-body p strong { color: var(--text-primary); font-weight: 600; }

  .formula-block {
    background: #f1f5f9; padding: 1rem; border-radius: 8px;
    margin: 1rem 0; font-family: monospace; color: var(--accent);
    border: 1px solid var(--panel-border); font-size: 0.85rem;
    text-align: center;
  }

  .game-cases article {
    margin-top: 1rem; border-left: 3px solid var(--accent);
    padding: 0.8rem; background: #fff;
    border-radius: 0 8px 8px 0; margin-bottom: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  }

  .game-cases h4 {
    margin: 0 0 0.4rem 0; color: var(--accent);
    font-size: 0.85rem; text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .game-cases p { margin: 0; font-size: 0.82rem; line-height: 1.4; }

</style>
