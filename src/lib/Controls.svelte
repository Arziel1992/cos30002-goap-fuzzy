<script>
  let { 
    params = $bindable(), 
    onTick = () => {},
    onReset = () => {},
    onGlossary = () => {}
  } = $props();

  const modes = [
    { id: 'bt', label: 'Mode A: Behaviour Tree', tooltip: 'Hierarchical Control Flow. Evaluates Selectors and Sequences to choose a single atomic action.' },
    { id: 'utility', label: 'Mode B: Utility (Fuzzy Logic)', tooltip: 'State evaluation using non-linear math. All actions compete simultaneously.' }
  ];
</script>

<div class="controls-panel">
  <header class="section-header">
    <h3>Decision Architecture</h3>
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

  <div class="sim-actions">
    <button class="tick-btn" onclick={onTick}>Tick AI</button>
    <button class="reset-btn" onclick={onReset}>Reset State</button>
  </div>

  <hr />

  <header class="section-header">
    <h3>Environmental State</h3>
    <button class="glossary-btn" onclick={() => onGlossary('utility')}>?</button>
  </header>
  
  <div class="control-group">
    <div class="label-row">
      <label for="health">Agent Health (%)</label>
      <span>{params.health}%</span>
    </div>
    <input id="health" type="range" min="0" max="100" bind:value={params.health}>
  </div>

  <div class="control-group">
    <div class="label-row">
      <label for="ammo">Ammo Count</label>
      <span>{params.ammo}</span>
    </div>
    <input id="ammo" type="range" min="0" max="30" bind:value={params.ammo}>
  </div>

  <div class="control-group">
    <div class="label-row">
      <label for="dist-enemy">Dist. to Enemy (m)</label>
      <span>{params.distEnemy}m</span>
    </div>
    <input id="dist-enemy" type="range" min="0" max="100" bind:value={params.distEnemy}>
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
    font-weight: 800; cursor: pointer;
  }

  .toggle-list { display: flex; flex-direction: column; gap: 0.5rem; }
  .toggle-list button {
    padding: 0.7rem; border-radius: 8px; border: 1px solid var(--panel-border);
    background: var(--bg-primary); color: var(--text-secondary);
    font-size: 0.85rem; font-weight: 600; cursor: pointer; text-align: left;
  }
  .toggle-list button.active {
    background: var(--bg-secondary); border-color: var(--accent); color: var(--accent);
  }

  .sim-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.5rem; }
  .tick-btn {
    padding: 0.8rem; background: var(--accent); color: white; border: none;
    border-radius: 8px; font-weight: 800; cursor: pointer; font-size: 0.9rem;
  }
  .reset-btn {
    padding: 0.8rem; background: #fff; color: var(--text-secondary); 
    border: 1px solid var(--panel-border); border-radius: 8px; font-weight: 800; cursor: pointer;
  }

  .control-group { display: flex; flex-direction: column; gap: 0.4rem; }
  .label-row { display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-secondary); }
  .label-row span { color: var(--accent); font-weight: bold; }

  input[type="range"] { appearance: none; background: var(--panel-border); height: 4px; border-radius: 2px; }
  input[type="range"]::-webkit-slider-thumb {
    appearance: none; width: 14px; height: 14px; background: var(--accent); border-radius: 50%; cursor: pointer;
  }

  hr { border: 0; border-top: 1px solid var(--panel-border); margin: 0.5rem 0; }
</style>
