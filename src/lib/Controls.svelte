<script>
  let { 
    params = $bindable(), 
    onGlossary = () => {}
  } = $props();

  const modes = [
    { id: 'goap', label: 'Mode A: GOAP', tooltip: 'Goal-Oriented Action Planning. A regressive A* search finds a logical chain of behaviors to satisfy a high-level goal.' },
    { id: 'utility', label: 'Mode B: Utility (Fuzzy Logic)', tooltip: 'State evaluation using non-linear math. All actions compete simultaneously based on environmental variables.' }
  ];
</script>

<div class="controls-panel">
  <header class="section-header">
    <h3>Cognitive Architecture</h3>
    <button class="glossary-btn" onclick={() => onGlossary('root')}>?</button>
  </header>
  <div class="toggle-list">
    {#each modes as m}
      <button 
        class:active={params.mode === m.id} 
        onclick={() => params.mode = m.id}
        title={m.tooltip}
      >
        {m.label}
      </button>
    {/each}
  </div>

  {#if params.mode === 'goap'}
  <div class="control-group">
    <div class="label-row">
        <label for="goal-select">Active Goal</label>
        <button class="glossary-btn-small" onclick={() => onGlossary('goap')}>?</button>
    </div>
    <select id="goal-select" bind:value={params.goal} title="The high-level objective the GOAP planner will regressively solve for.">
       <option value="enemyDead">Goal: Target Eliminated</option>
       <option value="fullHealth">Goal: Fully Healed</option>
    </select>
  </div>
  {/if}

  <hr />

  <header class="section-header">
    <h3>Environmental State</h3>
    <button class="glossary-btn" onclick={() => onGlossary('utility')}>?</button>
  </header>
  
  <div class="control-group">
    <div class="label-row">
      <label for="health">Agent Health (%)</label>
      <div class="actions">
          <span>{params.health}</span>
          <button class="glossary-btn-small" onclick={() => onGlossary('utility')}>?</button>
      </div>
    </div>
    <input 
      id="health" type="range" min="0" max="100" step="1" 
      bind:value={params.health}
      title="The Agent s wellness. Low health exponential spikes the 'Heal' and 'Flee' utility."
    >
  </div>

  <div class="control-group">
    <div class="label-row">
      <label for="ammo">Ammo Count</label>
      <div class="actions">
          <span>{params.ammo}</span>
          <button class="glossary-btn-small" onclick={() => onGlossary('utility')}>?</button>
      </div>
    </div>
    <input 
      id="ammo" type="range" min="0" max="30" step="1" 
      bind:value={params.ammo}
      title="Remaining bullets. Attack utility drops to zero when empty, forcing GOAP to search for an ammo depot."
    >
  </div>

  <div class="control-group">
    <div class="label-row">
      <label for="dist-enemy">Dist. to Enemy (m)</label>
      <div class="actions">
          <span>{params.distEnemy}</span>
      </div>
    </div>
    <input 
      id="dist-enemy" type="range" min="0" max="100" step="1" 
      bind:value={params.distEnemy}
      title="How close the threat is. Flee utility spikes at low distance, Attack increases at medium-close range."
    >
  </div>

  <div class="control-group">
    <div class="label-row">
      <label for="dist-health">Dist. to Health (m)</label>
      <div class="actions">
          <span>{params.distHealth}</span>
      </div>
    </div>
    <input 
      id="dist-health" type="range" min="0" max="100" step="1" 
      bind:value={params.distHealth}
      title="How far it is to the nearest healing source. Affects the cost of 'Heal' plans and the weight of 'Seek Health' utility."
    >
  </div>
</div>

<style>
  .controls-panel { display: flex; flex-direction: column; gap: 1rem; }
  h3 { font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; margin: 0; }

  .section-header { display: flex; justify-content: space-between; align-items: center; margin: 1rem 0 0.5rem 0; }

  .glossary-btn {
    background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3);
    color: var(--accent); width: 24px; height: 24px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; font-size: 0.8rem;
    font-weight: 800; cursor: pointer; transition: all 0.2s;
  }

  .glossary-btn:hover { background: var(--accent); color: white; }

  .glossary-btn-small {
    background: none; border: none; color: var(--text-secondary); 
    padding: 2px 5px; opacity: 0.5; font-size: 0.7rem; cursor: pointer;
  }

  .glossary-btn-small:hover { opacity: 1; color: var(--accent); }

  .toggle-list { display: flex; flex-direction: column; gap: 0.5rem; }
  .toggle-list button {
    padding: 0.7rem; border-radius: 8px; border: 1px solid var(--panel-border);
    background: var(--bg-primary); color: var(--text-secondary);
    font-size: 0.85rem; font-weight: 600; cursor: pointer; text-align: left;
    transition: all 0.2s;
  }
  .toggle-list button.active {
    background: var(--bg-secondary); border-color: var(--accent);
    color: var(--accent); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.05);
  }

  .control-group { display: flex; flex-direction: column; gap: 0.4rem; }
  .label-row { display: flex; justify-content: space-between; font-size: 0.85rem; align-items: center; }
  .label-row .actions { display: flex; align-items: center; gap: 0.4rem; }
  .label-row span { color: var(--accent); font-family: monospace; font-weight: bold; min-width: 40px; text-align: right; }

  select {
     padding: 0.6rem; border-radius: 6px; border: 1px solid var(--panel-border); 
     background: #fff; font-size: 0.85rem; cursor: pointer; color: var(--text-primary);
  }

  input[type="range"] { appearance: none; background: var(--panel-border); height: 4px; border-radius: 2px; }
  input[type="range"]::-webkit-slider-thumb {
    appearance: none; width: 14px; height: 14px; background: var(--accent); border-radius: 50%;
  }

  hr { border: 0; border-top: 1px solid var(--panel-border); margin: 0.5rem 0; }
</style>
