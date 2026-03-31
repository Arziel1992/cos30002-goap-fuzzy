<script>
  import * as d3 from 'd3';
  import { onMount } from 'svelte';

  let { 
    stats, 
    params, 
    containerRef 
  } = $props();

  let svg = $state();
  let wrapperDiv = $state();
  let width = $state(0);
  let height = $state(0);

  let transform = $state({ x: 0, y: 0, k: 1 });

  function handleResize() {
    if (!wrapperDiv) return;
    const rect = wrapperDiv.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
  }

  // COMPACT & STAGGERED LAYOUT
  let hierarchy = $derived.by(() => {
    if (params.mode !== 'bt' || !stats.btRoot) return null;

    const root = d3.hierarchy(stats.btRoot, d => {
        return d.isExpanded !== false ? d.children : null;
    });

    // Use a tighter nodeSize horizontally
    const treeLayout = d3.tree().nodeSize([180, 180]);
    const d3Tree = treeLayout(root);

    // Manual Staggering & Compact Pass
    d3Tree.descendants().forEach(d => {
       // Push the Siege branch (containing the scoped subset) FURTHER DOWN
       // This prevents horizontal clashing with other root siblings
       if (d.data.id === 'siege' || d.ancestors().some(a => a.data.id === 'siege')) {
          d.y += 180; // Extra vertical offset
          
          // Descent within the subset can be even tighter
          if (d.ancestors().some(a => a.data.isScoped)) {
             d.y += 60;
          }
       }

       // Survival protocol can be slightly offset too
       if (d.data.id === 'emergency' || d.ancestors().some(a => a.data.id === 'emergency')) {
          d.x -= 40; 
       }
    });

    return d3Tree;
  });

  // Calculate Scoped Regions with Padding
  let scopedRegions = $derived.by(() => {
    if (!hierarchy) return [];
    const regions = [];
    
    hierarchy.descendants().forEach(d => {
      if (d.data.isScoped) {
        const descendants = d.descendants();
        const minX = Math.min(...descendants.map(n => n.x)) - 100;
        const maxX = Math.max(...descendants.map(n => n.x)) + 100;
        const minY = Math.min(...descendants.map(n => n.y)) - 50;
        const maxY = Math.max(...descendants.map(n => n.y)) + 80;
        
        regions.push({
          id: d.data.id,
          x: minX, y: minY, w: maxX - minX, h: maxY - minY,
          label: d.data.name
        });
      }
    });
    return regions;
  });

  let utilityResult = $derived(stats.utilityScores || []);

  onMount(() => {
    const d3Zoom = d3.zoom()
      .scaleExtent([0.1, 3])
      .on('zoom', (event) => { transform = event.transform; });

    d3.select(svg).call(d3Zoom);
    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(wrapperDiv);
    handleResize();
    return () => resizeObserver.disconnect();
  });

  function getStatusColor(status) {
    switch (status) {
      case 'SUCCESS': return '#22c55e';
      case 'FAILURE': return '#ef4444';
      case 'RUNNING': return '#3b82f6';
      case 'EVALUATING': return '#eab308';
      default: return '#f8fafc';
    }
  }

  function toggleExpand(node) {
      node.data.isExpanded = !node.data.isExpanded;
      stats.btRoot = { ...stats.btRoot };
  }
</script>

<div class="canvas-wrapper" bind:this={wrapperDiv}>
  {#if params.mode === 'bt'}
    <svg bind:this={svg} class="bt-svg">
      <g transform="translate({width/2 + transform.x}, {100 + transform.y}) scale({transform.k})">
        {#if hierarchy}
          <!-- Scoped Borders -->
          {#each scopedRegions as r}
            <g class="scoped-region">
              <rect 
                x={r.x} y={r.y} width={r.w} height={r.h} 
                rx="20" fill="rgba(37, 99, 235, 0.04)" 
                stroke="#2563eb" stroke-width="2" stroke-dasharray="10,5"
              />
              <text x={r.x + 20} y={r.y + 30} class="scoped-label">{r.label}</text>
            </g>
          {/each}

          <!-- Custom Curved Links -->
          {#each hierarchy.links() as link}
            <path 
              class="link"
              d={d3.linkVertical().x(d => d.x).y(d => d.y)(link)}
              fill="none"
              stroke={link.target.data.status === 'READY' ? '#cbd5e1' : getStatusColor(link.target.data.status)}
              stroke-width={link.target.data.status === 'EVALUATING' ? 6 : 3}
              opacity={link.target.data.status === 'READY' ? 0.3 : 1}
              style="transition: all 0.5s ease;"
            />
          {/each}

          <!-- Nodes -->
          {#each hierarchy.descendants() as node}
            <g 
              role="button"
              aria-label="Node {node.data.name}"
              class="node-group" 
              transform="translate({node.x}, {node.y})"
              onclick={() => node.data.children?.length > 0 && toggleExpand(node)}
            >
              <rect 
                width="150" height="58" x="-75" y="-29" rx="12" 
                fill={getStatusColor(node.data.status)}
                stroke={node.data.status === 'EVALUATING' ? '#eab308' : '#e2e8f0'}
                stroke-width={node.data.status === 'EVALUATING' ? 3 : 1.5}
                class="node-rect shadow-sm"
              />
              <text class="node-label" text-anchor="middle" dy="-4" 
                fill={node.data.status === 'READY' || node.data.status === 'EVALUATING' ? '#0f172a' : '#fff'}
              >
                {node.data.name}
              </text>
              <text class="node-type" text-anchor="middle" dy="14" 
                fill={node.data.status === 'READY' || node.data.status === 'EVALUATING' ? '#64748b' : 'rgba(255,255,255,0.7)'}
              >
                {node.data.type?.toUpperCase()}
              </text>

              {#if node.data.children?.length > 0}
                <g transform="translate(0, 29)">
                  <circle r="9" fill="#fff" stroke="#cbd5e1" />
                  <path d={node.data.isExpanded ? "M-3.5 0 L3.5 0" : "M-3.5 0 L3.5 0 M0 -3.5 L0 3.5"} stroke="#64748b" stroke-width="2" />
                </g>
              {/if}
            </g>
          {/each}
        {/if}
      </g>
    </svg>
  {:else}
    <div class="utility-viz">
        <header class="viz-header">
           <h2>Fuzzy Utility Evaluation</h2>
           <p>Mapping environmental data to behavioral priority.</p>
        </header>
        <div class="bars-container">
          {#each utilityResult as s, i}
            <div class="u-bar-group">
              <div class="u-label-row">
                <span class="u-label">{s.label}</span>
                <span class="u-score" class:active={s.score > 0.5}>{s.score.toFixed(3)}</span>
              </div>
              <div class="u-bar-bg">
                <div class="u-bar-fill" style="width: {s.score * 100}%; background: {i === 0 ? 'var(--accent)' : '#93c5fd'}"></div>
              </div>
            </div>
          {/each}
        </div>
    </div>
  {/if}
</div>

<style>
  .canvas-wrapper { width: 100%; height: 100%; position: relative; overflow: hidden; background: #f8fafc; }
  .bt-svg { width: 100%; height: 100%; display: block; cursor: grab; }
  .bt-svg:active { cursor: grabbing; }

  .scoped-label { font-size: 9px; font-weight: 900; fill: var(--accent); text-transform: uppercase; letter-spacing: 1px; }

  .node-group { cursor: pointer; }
  .node-rect { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
  .node-label { font-weight: 800; font-size: 10px; }
  .node-type { font-weight: 600; font-size: 7px; letter-spacing: 0.5px; }

  .link { stroke-linejoin: round; transition: all 0.4s ease; }

  .utility-viz {
    display: flex; flex-direction: column; gap: 3rem;
    padding: 4rem; max-width: 800px; margin: 0 auto; height: 100%; justify-content: center;
  }
  .viz-header h2 { font-size: 1.8rem; font-weight: 900; color: var(--text-primary); margin-bottom: 0.5rem; }
  .viz-header p { color: var(--text-secondary); font-size: 0.9rem; }

  .bars-container { display: flex; flex-direction: column; gap: 1.2rem; }
  .u-bar-group { display: flex; flex-direction: column; gap: 0.6rem; }
  .u-label-row { display: flex; justify-content: space-between; font-weight: 800; font-size: 0.9rem; color: #475569; }
  .u-score.active { color: var(--accent); }
  .u-bar-bg { background: #e2e8f0; height: 50px; border-radius: 12px; overflow: hidden; }
  .u-bar-fill { height: 100%; transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
</style>
