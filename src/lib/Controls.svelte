<script>
let {
	params = $bindable(),
	onTick = () => {},
	onReset = () => {},
	onGlossary = () => {},
} = $props();

const modes = [
	{
		id: "binary",
		label: "Evaluation: Binary",
		tooltip:
			"Traditional priority-based execution. Branches are evaluated in a fixed order.",
	},
	{
		id: "fuzzy",
		label: "Evaluation: Fuzzy",
		tooltip:
			"Utility-based execution. Selector children are re-prioritized based on real-time scores.",
	},
];

const goals = [
	{ id: "patrol", label: "Patrol Territory" },
	{ id: "defense", label: "Defensive Stand" },
	{ id: "siege", label: "Offensive Siege" },
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

  <div class="control-group">
    <label for="goal-select" class="field-label">Active Strategic Goal</label>
    <div class="select-wrapper">
      <select id="goal-select" bind:value={params.goal} class="styled-select">
        {#each goals as g}
          <option value={g.id}>{g.label}</option>
        {/each}
      </select>
      <div class="select-arrow">▼</div>
    </div>
  </div>

  <hr class="divider" />
  
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
  h3 { font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; margin: 0; font-weight: 800; }
  .section-header { display: flex; justify-content: space-between; align-items: center; margin: 0.5rem 0; }

  .glossary-btn {
    background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3);
    color: var(--accent); width: 24px; height: 24px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; font-size: 0.8rem;
    font-weight: 800; cursor: pointer; transition: all 0.2s;
  }
  .glossary-btn:hover { background: var(--accent); color: white; }

  .toggle-list { display: flex; flex-direction: column; gap: 0.5rem; }
  .toggle-list button {
    padding: 0.8rem 1rem; border-radius: 12px; border: 2px solid var(--panel-border);
    background: #fff; color: var(--text-secondary);
    font-size: 0.85rem; font-weight: 700; cursor: pointer; text-align: left;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .toggle-list button:hover { border-color: #cbd5e1; }
  .toggle-list button.active {
    background: #fff; border-color: var(--accent); color: var(--accent);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.08);
  }

  .sim-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; margin: 0.5rem 0; }
  .tick-btn {
    padding: 0.9rem; background: var(--accent); color: white; border: none;
    border-radius: 12px; font-weight: 800; cursor: pointer; font-size: 0.9rem;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
  }
  .reset-btn {
    padding: 0.9rem; background: #fff; color: var(--text-secondary); 
    border: 2px solid var(--panel-border); border-radius: 12px; font-weight: 800; cursor: pointer;
  }

  .divider { border: 0; border-top: 1px solid #e2e8f0; margin: 1.5rem 0; }

  .field-label { display: block; font-size: 0.7rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5rem; }

  .select-wrapper { position: relative; width: 100%; }
  .styled-select {
    width: 100%; appearance: none; background: #fff; border: 2px solid #e2e8f0;
    border-radius: 12px; padding: 0.8rem 1rem; padding-right: 2.5rem;
    font-size: 0.9rem; font-weight: 700; color: #0f172a; cursor: pointer; transition: all 0.2s;
  }
  .styled-select:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }
  .select-arrow {
    position: absolute; right: 1rem; top: 50%; transform: translateY(-50%);
    pointer-events: none; font-size: 0.6rem; color: #94a3b8;
  }

  .control-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.5rem; }
  .label-row { display: flex; justify-content: space-between; font-size: 0.85rem; color: #475569; font-weight: 700; }
  .label-row span { color: var(--accent); font-weight: 800; }

  input[type="range"] { appearance: none; background: #e2e8f0; height: 6px; border-radius: 3px; cursor: pointer; }
  input[type="range"]::-webkit-slider-thumb {
    appearance: none; width: 18px; height: 18px; background: #fff; 
    border: 3px solid var(--accent); border-radius: 50%; cursor: pointer;
    box-shadow: 0 2px 6px rgba(37, 99, 235, 0.2); transition: transform 0.1s;
  }
  input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.1); }
</style>
