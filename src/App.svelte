<script>
  import Sidebar from './lib/Sidebar.svelte';
  import Canvas from './lib/Canvas.svelte';
  import Controls from './lib/Controls.svelte';
  import Glossary from './lib/Glossary.svelte';
  import { GOAPPlanner, UtilityEngine } from './lib/Simulation.js';
  import { onMount } from 'svelte';

  let planner = new GOAPPlanner();
  let utility = new UtilityEngine();

  let params = $state({
    mode: 'goap', // 'goap', 'utility'
    health: 80,
    ammo: 10,
    distEnemy: 50,
    distHealth: 70,
    distAmmo: 30,
    goal: 'enemyDead'
  });

  let stats = $state({
    currentPlan: [],
    utilityScores: [],
    lastDecision: ''
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

  function updateLogic() {
    if (params.mode === 'goap') {
      const currentState = {
        hasAmmo: params.ammo > 0,
        nearEnemy: params.distEnemy < 10,
        nearHealth: params.distHealth < 10,
        nearAmmo: params.distAmmo < 10,
        enemyDead: false,
        fullHealth: params.health >= 100
      };
      const goals = { 
        enemyDead: { enemyDead: true },
        fullHealth: { fullHealth: true }
      };
      stats.currentPlan = planner.plan(goals[params.goal], currentState);
      stats.lastDecision = stats.currentPlan?.[0]?.name || 'Idle';
    } else {
      stats.utilityScores = utility.calculate(params);
      stats.lastDecision = stats.utilityScores[0].label;
    }
  }

  $effect(() => {
    updateLogic();
  });

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
          <span class="label">Current Decision</span>
          <span class="value">{stats.lastDecision}</span>
       </div>
    </div>

    <div class="floating-bottom-right">
        <div class="kb-hint">
            Interactive Reasoning Engine | COS30002 Module 05
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
    background: var(--glass-bg); backdrop-filter: blur(8px);
    border: 1px solid var(--panel-border); border-radius: 12px;
    padding: 1.2rem; box-shadow: 0 10px 40px rgba(0,0,0,0.05);
    min-width: 250px; display: flex; flex-direction: column; gap: 0.4rem;
    pointer-events: auto; cursor: default;
  }

  .decision-card .label { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 1.5px; color: var(--text-secondary); font-weight: 700; }
  .decision-card .value { font-size: 1.3rem; font-weight: 800; color: var(--accent); }

  .kb-hint {
    background: var(--glass-bg); backdrop-filter: blur(4px);
    padding: 0.6rem 1.2rem; border-radius: 99px;
    font-size: 0.75rem; color: var(--text-secondary);
    border: 1px solid var(--panel-border); box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    pointer-events: auto; cursor: default;
  }

  hr { border: 0; border-top: 1px solid var(--panel-border); margin: 1.5rem 0; }
</style>
