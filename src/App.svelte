<script>
import { version } from "../package.json";
import Canvas from "./lib/Canvas.svelte";
import Controls from "./lib/Controls.svelte";
import Glossary from "./lib/Glossary.svelte";
import Sidebar from "./lib/Sidebar.svelte";
import { DecisionEngine, STRATEGIES } from "./lib/Simulation.js";

const engine = new DecisionEngine();

let params = $state({
	mode: "fuzzy", // 'binary' (priority thresholds) or 'fuzzy' (desirability)
	health: 75,
	ammo: 18,
	distEnemy: 30,
});

// Execution pointer for the chosen strategy's GOAP plan (advanced by TICK).
let execStep = $state(0);

// Layer 1 (fuzzy + binary selection) + Layer 2 (GOAP plans), recomputed on input change.
const result = $derived(engine.evaluate(params));

// The chosen strategy's GOAP action queue + A* search metadata.
const activePlan = $derived(result.plans[result.chosen]);

// Restart execution from step 0 whenever the active plan changes.
const planSig = $derived(
	`${result.chosen}:${activePlan?.found ? activePlan.plan.map((a) => a.id).join(">") : "none"}`,
);

let stats = $state({
	btRoot: null,
	lastDecision: "READY",
	utilityScores: [],
	binaryWinner: null,
});


let leftOpen = $state(true);
let rightOpen = $state(true);

let glossaryOpen = $state(false);
let glossarySection = $state("root");

function openGlossary(section = "root") {
	glossarySection = section;
	glossaryOpen = true;
}

function tickAI() {
	if (activePlan?.found && execStep < activePlan.plan.length) execStep += 1;
}

function resetTrees() {
	execStep = 0;
}

$effect(() => {
	planSig; // track active plan; reset execution when it changes
	execStep = 0;
});

$effect(() => {
	stats.btRoot = engine.buildGraph(result, execStep);
	stats.utilityScores = STRATEGIES.map((s) => ({
		id: s.id,
		label: s.label,
		score: result.fuzzy.desirabilities[s.id],
	})).sort((a, b) => b.score - a.score);
	stats.binaryWinner = STRATEGIES.find((s) => s.id === result.chosen)?.label ?? "—";
	stats.lastDecision = activePlan.found
		? execStep >= activePlan.plan.length
			? "GOAL REACHED"
			: `EXECUTING ${execStep}/${activePlan.plan.length}`
		: "NO VALID PLAN";
});

const labelFor = (id) => STRATEGIES.find((s) => s.id === id)?.label ?? "—";
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

  <section class="canvas-panel">
    <button class="toggle-btn toggle-left" onclick={() => leftOpen = !leftOpen} aria-label="Toggle left sidebar">
      {leftOpen ? '◀' : '▶'}
    </button>
    <button class="toggle-btn toggle-right" onclick={() => rightOpen = !rightOpen} aria-label="Toggle right sidebar">
      {rightOpen ? '▶' : '◀'}
    </button>

    <Canvas {stats} />
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

      <!-- Decision Context -->
      <div class="panel-section">
        <div class="panel-header">
          <span class="panel-label">Decision Context</span>
          <button class="mini-tick-btn" onclick={tickAI} title="Execute Step">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 3l14 9-14 9V3z"/></svg>
            TICK
          </button>
        </div>

        <!-- Layer 1: strategy selection — binary vs fuzzy, side by side -->
        <div class="pick-compare">
          <div class="pick-card" class:active={params.mode === 'binary'}>
            <span class="pick-tag">Binary pick</span>
            <span class="pick-name">{labelFor(result.binaryChoice)}</span>
          </div>
          <div class="pick-card" class:active={params.mode === 'fuzzy'}>
            <span class="pick-tag">Fuzzy pick</span>
            <span class="pick-name">{labelFor(result.fuzzyChoice)}</span>
          </div>
        </div>
        {#if result.binaryChoice !== result.fuzzyChoice}
          <p class="pick-note">⚠ The two methods disagree here — fuzzy blends membership; binary uses hard thresholds.</p>
        {/if}

        <div class="score-comparison">
          <div class="mode-score full-scores">
            <span class="score-label">Fuzzy Desirability (μ)</span>
            <p class="mu-note">μ = each strategy's fuzzy desirability (0–1), from the membership functions. Shown on the strategy nodes too.</p>
            {#each stats.utilityScores as s}
              <div class="u-row">
                <span class="u-name">{s.label}</span>
                <div class="u-meter-bg">
                  <div class="u-meter-fill" style="width: {s.score * 100}%"></div>
                </div>
                <span class="u-val">{s.score.toFixed(2)}</span>
              </div>
            {/each}
          </div>
        </div>

        <hr class="mini-divider" />

        <!-- Layer 2: the actual GOAP action queue for the chosen strategy -->
        <div class="goap-queue">
          <div class="queue-head">
            <span class="score-label">GOAP Plan · {stats.binaryWinner}</span>
            {#if activePlan.found}
              <span class="queue-meta">cost {activePlan.cost} · {activePlan.explored} explored</span>
            {/if}
          </div>
          {#if activePlan.found && activePlan.plan.length > 0}
            <ol class="queue-list">
              {#each activePlan.plan as a, i}
                <li class="queue-item"
                  class:done={i < execStep}
                  class:current={i === execStep}>
                  <span class="q-idx">{i + 1}</span>
                  <span class="q-name">{a.name}</span>
                  <span class="q-cost">{a.cost}</span>
                </li>
              {/each}
            </ol>
          {:else if activePlan.found}
            <p class="queue-empty">Goal already satisfied — no actions needed.</p>
          {:else}
            <p class="queue-empty fail">No valid plan: preconditions for this goal cannot be met from the current world state.</p>
          {/if}
        </div>

        <div class="root-info">
          <div class="info-row">
            <span class="info-label">Active ({params.mode}):</span>
            <span class="info-value binary">{stats.binaryWinner || '...'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Execution:</span>
            <span class="info-value" class:success={stats.lastDecision === 'GOAL REACHED'} class:failure={stats.lastDecision === 'NO VALID PLAN'}>{stats.lastDecision}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="app-footer">
      &copy; E. Ketterer Ortiz - 
      <a href="https://github.com/Arziel1992/cos30002-goap-fuzzy/" target="_blank" rel="noopener noreferrer" style="color: var(--accent); text-decoration: none; font-weight: 600;">
        <svg height="11" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="11" style="fill: currentColor; vertical-align: middle; margin-top: -2px;">
          <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
        </svg> Repository
      </a>
      <span class="app-version" style="font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; opacity: 0.55; margin-left: 0.4rem;">v{version}</span>
    </div>
  </aside>
  {/if}

  <Glossary bind:isOpen={glossaryOpen} bind:section={glossarySection} />
</main>

<style>
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
  .mu-note { font-size: 0.62rem; line-height: 1.35; color: var(--text-secondary); opacity: 0.85; margin: 0 0 0.5rem; font-style: italic; }

  /* Binary vs fuzzy strategy pick comparison */
  .pick-compare { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin: 0.4rem 0; }
  .pick-card {
    display: flex; flex-direction: column; gap: 0.2rem; padding: 0.5rem 0.6rem;
    border: 2px solid var(--panel-border); border-radius: 10px; background: #fff;
  }
  .pick-card.active { border-color: var(--accent); box-shadow: 0 4px 12px rgba(37,99,235,0.1); }
  .pick-tag { font-size: 0.55rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-secondary); opacity: 0.8; }
  .pick-name { font-size: 0.8rem; font-weight: 900; color: #0f172a; }
  .pick-note { font-size: 0.62rem; color: #b45309; background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3); border-radius: 8px; padding: 0.4rem 0.5rem; margin: 0.3rem 0 0; line-height: 1.3; }

  /* GOAP action queue */
  .goap-queue { margin: 0.4rem 0; }
  .queue-head { display: flex; justify-content: space-between; align-items: baseline; gap: 0.4rem; }
  .queue-meta { font-size: 0.58rem; font-family: 'JetBrains Mono', monospace; color: var(--accent); white-space: nowrap; }
  .queue-list { list-style: none; margin: 0.4rem 0 0; padding: 0; display: flex; flex-direction: column; gap: 0.3rem; }
  .queue-item {
    display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.5rem;
    border-radius: 8px; background: #f1f5f9; border: 1px solid var(--panel-border);
    font-size: 0.72rem; font-weight: 700; color: #475569; transition: all 0.2s;
  }
  .queue-item.done { background: rgba(34,197,94,0.1); border-color: rgba(34,197,94,0.4); color: #15803d; }
  .queue-item.current { background: rgba(59,130,246,0.12); border-color: var(--accent); color: var(--accent); box-shadow: 0 2px 8px rgba(37,99,235,0.15); }
  .q-idx { width: 16px; height: 16px; border-radius: 50%; background: var(--accent); color: #fff; font-size: 0.58rem; font-weight: 900; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .queue-item.done .q-idx { background: #22c55e; }
  .q-name { flex: 1; }
  .q-cost { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; opacity: 0.8; }
  .queue-empty { font-size: 0.68rem; color: var(--text-secondary); line-height: 1.4; margin: 0.4rem 0 0; }
  .queue-empty.fail { color: #b91c1c; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25); border-radius: 8px; padding: 0.5rem; }

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
