<script>
import Canvas from "./lib/Canvas.svelte";
import Controls from "./lib/Controls.svelte";
import Glossary from "./lib/Glossary.svelte";
import Sidebar from "./lib/Sidebar.svelte";
import { BehaviourTree, UtilityEngine } from "./lib/Simulation.js";

let bt = new BehaviourTree();
let utility = new UtilityEngine();

let params = $state({
	mode: "binary", // 'binary' or 'fuzzy'
	health: 80,
	ammo: 20,
	distEnemy: 50,
	distHealth: 70,
	distAmmo: 30,
	goal: "patrol",
});

let physics = $state({
	repulsion: 3500,
	linkDist: 180,
	drift: false,
	gravity: 0.1,
});

let stats = $state({
	btRoot: bt.root,
	lastDecision: "READY",
	utilityScores: [],
	binaryWinner: null,
});

let containerRef = $state();

let leftOpen = $state(true);
let rightOpen = $state(true);

let glossaryOpen = $state(false);
let glossarySection = $state("root");

function openGlossary(section = "root") {
	glossarySection = section;
	glossaryOpen = true;
}

function tickAI() {
	bt.tick(bt.root, params, params.mode);
	stats.btRoot = { ...bt.root };
	stats.lastDecision = bt.root.status;

	let rawScores = utility.calculateScores(params);
	const winningBranch = bt.root.children.find(
		(c) => c.status === "SUCCESS" || c.status === "RUNNING",
	);

	if (params.mode === "binary") {
		stats.utilityScores = rawScores.map((s) => ({
			...s,
			score:
				winningBranch && winningBranch.id.includes(s.id.split("-")[0]) ? 1 : 0,
		}));
	} else {
		stats.utilityScores = rawScores;
	}

	stats.binaryWinner = winningBranch ? winningBranch.name : "Searching...";
}

function resetTrees() {
	bt = new BehaviourTree();
	stats.btRoot = bt.root;
	stats.lastDecision = "Reset Complete";
}
</script>

<main class="app-layout">
  {#if leftOpen}
  <aside class="sidebar-left">
    <div class="sidebar-inner">
      <Sidebar />
    </div>
    <div class="app-footer">
      Made with ❤️ for Swinburne — COS30002 Artificial Intelligence for Games
    </div>
  </aside>
  {/if}

  <section class="canvas-panel" bind:this={containerRef}>
    <button class="toggle-btn toggle-left" onclick={() => leftOpen = !leftOpen} aria-label="Toggle left sidebar">
      {leftOpen ? '◀' : '▶'}
    </button>
    <button class="toggle-btn toggle-right" onclick={() => rightOpen = !rightOpen} aria-label="Toggle right sidebar">
      {rightOpen ? '▶' : '◀'}
    </button>

    <Canvas {stats} {params} {physics} {containerRef} />
  </section>

  {#if rightOpen}
  <aside class="sidebar-right">
    <div class="sidebar-inner">
      <Controls
        bind:params
        onTick={tickAI}
        onReset={resetTrees}
        onGlossary={openGlossary}
      />

      <hr />

      <!-- Physics Engine -->
      <div class="panel-section">
        <div class="panel-header">
          <span class="panel-label">Physics Engine</span>
        </div>
        <div class="panel-body">
          <div class="p-row">
            <label for="repulsion">Repulsion</label>
            <input id="repulsion" type="range" min="500" max="4000" step="100" bind:value={physics.repulsion} />
          </div>
          <div class="p-row">
            <label for="linkDist">Link Dist</label>
            <input id="linkDist" type="range" min="50" max="400" step="10" bind:value={physics.linkDist} />
          </div>
          <div class="p-row">
            <label for="gravity">Gravity</label>
            <input id="gravity" type="range" min="0" max="1" step="0.05" bind:value={physics.gravity} />
          </div>
          <hr class="mini-divider" />
          <div class="p-toggle">
            <span class="toggle-label">Movement: <b>{physics.drift ? 'DRIFT' : 'FIXED'}</b></span>
            <button class="drift-btn" class:active={physics.drift} onclick={() => physics.drift = !physics.drift}>
              {physics.drift ? 'Unbound' : 'Hierarchical'}
            </button>
          </div>
        </div>
      </div>

      <hr />

      <!-- Decision Context -->
      <div class="panel-section">
        <div class="panel-header">
          <span class="panel-label">Decision Context</span>
          <button class="mini-tick-btn" onclick={tickAI} title="Execute Step">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 3l14 9-14 9V3z"/></svg>
            TICK
          </button>
        </div>

        <div class="score-comparison">
          <div class="mode-score full-scores">
            <span class="score-label">Fuzzy Strategy Utilities:</span>
            {#each stats.utilityScores as s}
              <div class="u-row">
                <span class="u-name">{s.label}</span>
                <div class="u-meter-bg">
                  <div class="u-meter-fill" style="width: {s.score * 100}%"></div>
                </div>
                <span class="u-val">{s.score.toFixed(3)}</span>
              </div>
            {/each}
          </div>
        </div>

        <hr class="mini-divider" />

        <div class="root-info">
          <div class="info-row">
            <span class="info-label">{params.mode === 'fuzzy' ? 'Fuzzy Pick:' : 'Binary Pick:'}</span>
            <span class="info-value binary">{stats.binaryWinner || '...'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Step Status:</span>
            <span class="info-value" class:success={stats.lastDecision === 'SUCCESS'} class:failure={stats.lastDecision === 'FAILURE'}>{stats.lastDecision}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="app-footer">
      &copy; E. Ketterer Ortiz
    </div>
  </aside>
  {/if}

  <Glossary bind:isOpen={glossaryOpen} bind:section={glossarySection} />
</main>

<style>
  :global(:root) {
    --bg-primary: #f8fafc;
    --bg-secondary: #ffffff;
    --text-primary: #0f172a;
    --text-secondary: #475569;
    --accent: #2563eb;
    --panel-border: #e2e8f0;
    --glass-bg: rgba(255, 255, 255, 0.85);

    --bt-ready: #94a3b8;
    --bt-evaluating: #eab308;
    --bt-success: #22c55e;
    --bt-failure: #ef4444;
    --bt-running: #3b82f6;
  }

  :global(body) {
    margin: 0; padding: 0;
    background-color: var(--bg-primary); color: var(--text-primary);
    font-family: 'Inter', system-ui, sans-serif; overflow: hidden;
  }

  .app-layout { display: flex; height: 100vh; width: 100vw; overflow: hidden; }

  .sidebar-left, .sidebar-right {
    width: 25%; flex-shrink: 0;
    background-color: var(--bg-secondary);
    display: flex; flex-direction: column;
    z-index: 100; overflow: hidden;
  }

  .sidebar-left {
    border-right: 1px solid var(--panel-border);
    box-shadow: 1px 0 10px rgba(0,0,0,0.05);
  }

  .sidebar-right {
    border-left: 1px solid var(--panel-border);
    box-shadow: -1px 0 10px rgba(0,0,0,0.05);
  }

  .sidebar-inner { flex: 1; overflow-y: auto; padding: 1.5rem; }

  .app-footer {
    padding: 1rem; font-size: 0.7rem; color: var(--text-secondary);
    text-align: center; border-top: 1px solid var(--panel-border); background: var(--bg-primary);
  }

  .canvas-panel { flex: 1; position: relative; background-color: #f1f5f9; overflow: hidden; min-width: 0; }

  /* Toggle buttons */
  .toggle-btn {
    position: absolute; top: 50%; transform: translateY(-50%);
    z-index: 200; width: 28px; height: 56px;
    background: var(--glass-bg); backdrop-filter: blur(8px);
    border: 1px solid var(--panel-border); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.75rem; color: var(--text-secondary);
    transition: background 0.2s, color 0.2s;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }
  .toggle-btn:hover { background: var(--accent); color: white; }
  .toggle-left { left: 0; border-radius: 0 8px 8px 0; border-left: none; }
  .toggle-right { right: 0; border-radius: 8px 0 0 8px; border-right: none; }

  /* Right sidebar panel sections */
  .panel-section { margin: 0.5rem 0; }
  .panel-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 0.8rem;
  }
  .panel-label {
    font-size: 0.7rem; font-weight: 800; color: var(--text-secondary);
    text-transform: uppercase; letter-spacing: 0.5px;
  }
  .panel-body { display: flex; flex-direction: column; gap: 0.8rem; }

  .p-row { display: flex; flex-direction: column; gap: 0.2rem; }
  .p-row label { font-size: 0.6rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; opacity: 0.7; }
  .p-row input { width: 100%; cursor: pointer; height: 4px; accent-color: var(--accent); }

  .p-toggle { display: flex; flex-direction: column; gap: 0.5rem; }
  .toggle-label { font-size: 0.65rem; color: var(--text-secondary); }
  .drift-btn {
    background: #e2e8f0; border: none; border-radius: 8px; padding: 0.4rem;
    font-size: 0.7rem; font-weight: 800; cursor: pointer; transition: all 0.2s;
  }
  .drift-btn.active { background: var(--accent); color: white; }

  .mini-tick-btn {
    background: var(--accent); color: white; border: none; border-radius: 8px;
    padding: 0.4rem 0.8rem; font-size: 0.65rem; font-weight: 800; cursor: pointer;
    display: flex; align-items: center; gap: 0.4rem; transition: transform 0.1s, background 0.2s;
  }
  .mini-tick-btn:hover { background: #1d4ed8; transform: translateY(-1px); }
  .mini-tick-btn:active { transform: translateY(0); }

  .score-comparison { display: flex; flex-direction: column; gap: 0.8rem; margin: 0.5rem 0; }
  .full-scores { display: flex; flex-direction: column; gap: 0.4rem; }
  .u-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; font-weight: 700; color: #1e293b; }
  .u-name { flex: 1; opacity: 0.8; }
  .u-meter-bg { flex: 2; height: 6px; background: #e2e8f0; border-radius: 99px; overflow: hidden; }
  .u-meter-fill { height: 100%; background: var(--accent); transition: width 0.3s; }
  .u-val { min-width: 35px; font-variant-numeric: tabular-nums; color: var(--accent); }

  .score-label { font-size: 0.65rem; color: var(--text-secondary); font-weight: 700; opacity: 0.8; text-transform: uppercase; margin-bottom: 0.2rem; }

  .mini-divider { border: 0; border-top: 1px solid var(--panel-border); margin: 0.8rem 0; opacity: 0.5; }

  .root-info { display: flex; flex-direction: column; gap: 0.6rem; }
  .info-row { display: flex; flex-direction: column; gap: 0.1rem; }
  .info-row .info-label { font-size: 0.6rem; color: var(--text-secondary); opacity: 0.9; }
  .info-row .info-value { font-size: 1.1rem; font-weight: 900; }
  .info-value.binary { color: #1e293b; letter-spacing: -0.01em; }
  .info-value.success { color: var(--bt-success); }
  .info-value.failure { color: var(--bt-failure); }

  hr { border: 0; border-top: 1px solid var(--panel-border); margin: 1.5rem 0; }
</style>
