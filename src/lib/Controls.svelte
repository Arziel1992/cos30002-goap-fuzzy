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
		label: "Selector: Binary",
		tooltip:
			"Priority thresholds. The first rule whose hard condition holds wins — no blending.",
	},
	{
		id: "fuzzy",
		label: "Selector: Fuzzy",
		tooltip:
			"Membership functions blend the inputs into a desirability per strategy; the highest fires.",
	},
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
    <button class="tick-btn" onclick={onTick}>Execute Step ▶</button>
    <button class="reset-btn" onclick={onReset}>Reset Plan</button>
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