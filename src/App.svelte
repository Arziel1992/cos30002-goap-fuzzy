<script>
  import Sidebar from './lib/Sidebar.svelte';
  import Canvas from './lib/Canvas.svelte';
  import Controls from './lib/Controls.svelte';
  import Glossary from './lib/Glossary.svelte';
  import { BehaviourTree, UtilityEngine, NodeStatus } from './lib/Simulation.js';
  import { onMount, tick } from 'svelte';

  let bt = new BehaviourTree();
  let utility = new UtilityEngine();

  let params = $state({
    mode: 'bt', // 'bt', 'utility'
    health: 80,
    ammo: 10,
    distEnemy: 50,
    distHealth: 70,
    distAmmo: 30,
    goal: 'default'
  });

  let stats = $state({
    btRoot: bt.root,
    lastDecision: 'Waiting for Tick...',
    utilityScores: []
  });

  let sidebarWidth = $state(400);
  let isResizing = $state(false);
  let containerRef = $state();

  let glossaryOpen = $state(false);
  let glossarySection = $state('root');

  function openGlossary(section = 'root') {
    glossarySection = section;
    glossaryOpen = true;
  }

  function tickAI() {
    if (params.mode === 'bt') {
      bt.tick(bt.root, params);
      // Trigger Svelte state update (since bt.root is mutated internally)
      stats.btRoot = { ...bt.root };
      stats.lastDecision = bt.root.status;
    } else {
      stats.utilityScores = utility.calculate(params);
      stats.lastDecision = stats.utilityScores[0].label;
    }
  }

  function resetTrees() {
    bt = new BehaviourTree();
    stats.btRoot = bt.root;
    stats.lastDecision = 'Reset Complete';
  }

  onMount(() => {
    const handleGlobalResize = (e) => {
        if (!isResizing) return;
        const newWidth = Math.max(300, Math.min(e.clientX, window.innerWidth * 0.25));
        sidebarWidth = newWidth;
    };
    const stopResizing = () => { isResizing = false; };

    window.addEventListener('mousemove', handleGlobalResize);
    window.addEventListener('mouseup', stopResizing);

    return () => {
      window.removeEventListener('mousemove', handleGlobalResize);
      window.removeEventListener('mouseup', stopResizing);
    };
  });
</script>

<main class="app-layout" class:resizing={isResizing}>
  <aside class="sidebar-container" style="width: {sidebarWidth}px">
    <div class="sidebar-inner">
      <Sidebar />
      <hr />
      <Controls 
        bind:params 
        onTick={tickAI}
        onReset={resetTrees}
        onGlossary={openGlossary}
      />
    </div>
    <div class="app-footer">
      Made with ❤️ for Swinburne — COS30002 Artificial Intelligence for Games
    </div>
    <button class="resizer" onmousedown={() => isResizing = true} aria-label="Resize Sidebar"></button>
  </aside>
  
  <section class="canvas-panel" bind:this={containerRef}>
    <Canvas {stats} {params} {containerRef} />
    
    <div class="floating-top-right">
       <div class="decision-card">
          <div class="card-header">
            <span class="label">Root Execution Status</span>
            <button class="mini-tick-btn" onclick={tickAI} title="Tick (Execute Single Step)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 3l14 9-14 9V3z"/></svg>
              TICK
            </button>
          </div>
          <span class="value" class:success={stats.lastDecision === 'SUCCESS'} class:failure={stats.lastDecision === 'FAILURE'}>{stats.lastDecision}</span>
       </div>
    </div>

    <div class="floating-bottom-right">
        <div class="kb-hint">
            Interactive Behaviour Tree Engine | COS30002 Module 05
        </div>
    </div>
  </section>

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
  .app-layout.resizing { cursor: col-resize; user-select: none; }

  .sidebar-container {
    background-color: var(--bg-secondary); border-right: 1px solid var(--panel-border);
    display: flex; flex-direction: column; position: relative;
    box-shadow: 1px 0 10px rgba(0,0,0,0.05); z-index: 100; flex-shrink: 0;
  }

  .sidebar-inner { flex: 1; overflow-y: auto; padding: 1.5rem; }

  .resizer {
    position: absolute; right: -3px; top: 0;
    width: 6px; height: 100%; cursor: col-resize;
    background: transparent; border: none; z-index: 110;
  }
  .resizer:hover, .app-layout.resizing .resizer { background: var(--accent); }

  .app-footer {
    padding: 1rem; font-size: 0.7rem; color: var(--text-secondary);
    text-align: center; border-top: 1px solid var(--panel-border); background: var(--bg-primary);
  }

  .canvas-panel { flex: 1; position: relative; background-color: #f1f5f9; overflow: hidden; }

  .floating-top-right { position: absolute; top: 1.5rem; right: 1.5rem; pointer-events: none; z-index: 200; }
  .floating-bottom-right { position: absolute; bottom: 1.5rem; right: 1.5rem; pointer-events: none; z-index: 200; }

  .decision-card {
    background: var(--glass-bg); backdrop-filter: blur(12px);
    border: 1px solid var(--panel-border); border-radius: 16px;
    padding: 1.5rem; box-shadow: 0 20px 50px rgba(0,0,0,0.1);
    min-width: 280px; display: flex; flex-direction: column; gap: 0.6rem;
    pointer-events: auto; cursor: default;
  }

  .card-header { display: flex; justify-content: space-between; align-items: center; }

  .mini-tick-btn {
    background: var(--accent); color: white; border: none; border-radius: 8px;
    padding: 0.4rem 0.8rem; font-size: 0.65rem; font-weight: 800; cursor: pointer;
    display: flex; align-items: center; gap: 0.4rem; transition: transform 0.1s, background 0.2s;
  }
  .mini-tick-btn:hover { background: #1d4ed8; transform: translateY(-1px); }
  .mini-tick-btn:active { transform: translateY(0); }

  .decision-card .label { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 1.5px; color: var(--text-secondary); font-weight: 700; }
  .decision-card .value { font-size: 1.4rem; font-weight: 900; color: var(--accent); letter-spacing: -0.02em; }

  .value.success { color: var(--bt-success); }
  .value.failure { color: var(--bt-failure); }

  .kb-hint {
    background: var(--glass-bg); backdrop-filter: blur(4px);
    padding: 0.6rem 1.2rem; border-radius: 99px;
    font-size: 0.75rem; color: var(--text-secondary);
    border: 1px solid var(--panel-border); box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    pointer-events: auto; cursor: default;
  }

  hr { border: 0; border-top: 1px solid var(--panel-border); margin: 1.5rem 0; }
</style>
