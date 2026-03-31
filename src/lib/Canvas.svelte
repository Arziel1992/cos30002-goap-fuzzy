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

  // Zoom management
  let transform = $state({ x: 0, y: 0, k: 1 });

  function handleResize() {
    if (!wrapperDiv) return;
    const rect = wrapperDiv.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
  }

  // Hierarchical Data Processing
  let hierarchy = $derived.by(() => {
    if (params.mode !== 'bt' || !stats.btRoot) return null;

    const root = d3.hierarchy(stats.btRoot, d => {
        // Only return children if the node is expanded
        return d.isExpanded !== false ? d.children : null;
    });

    const treeLayout = d3.tree()
      .nodeSize([180, 160])
      .separation((a, b) => (a.parent == b.parent ? 1 : 1.2));

    return treeLayout(root);
  });

  // Utility scores for chart mode
  let utilityResult = $derived(stats.utilityScores || []);

  onMount(() => {
    const d3Zoom = d3.zoom()
      .scaleExtent([0.2, 3])
      .on('zoom', (event) => {
        transform = event.transform;
      });

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

  function getStrokeColor(status) {
     return status === 'EVALUATING' ? '#eab308' : '#e2e8f0';
  }

  function toggleExpand(node) {
      node.data.isExpanded = !node.data.isExpanded;
      // Trigger update
      stats.btRoot = { ...stats.btRoot };
  }
</script>

<div class="canvas-wrapper" bind:this={wrapperDiv}>
  {#if params.mode === 'bt'}
    <svg 
      bind:this={svg} 
      class="bt-svg"
      viewBox="0 0 {width} {height}"
    >
      <g 
        transform="translate({width/2 + transform.x}, {100 + transform.y}) scale({transform.k})"
        class="zoomable-content"
      >
        {#if hierarchy}
          <!-- Edges -->
          {#each hierarchy.links() as link}
            <path 
              class="link"
              d={d3.linkVertical()
                .x(d => d.x)
                .y(d => d.y)({
                    source: link.source,
                    target: link.target
                })}
              fill="none"
              stroke="#cbd5e1"
              stroke-width="5"
              stroke-linecap="round"
            />
          {/each}

          <!-- Nodes -->
          {#each hierarchy.descendants() as node}
            <g 
              role="button"
              aria-label="Toggle node {node.data.name}"
              class="node-group" 
              transform="translate({node.x}, {node.y})"
              onclick={() => node.data.children?.length > 0 && toggleExpand(node)}
              tabindex="0"
              onkeydown={(e) => e.key === 'Enter' && node.data.children?.length > 0 && toggleExpand(node)}
            >
              <rect 
                width="160" 
                height="60" 
                x="-80" 
                y="-30" 
                rx="12" 
                fill={getStatusColor(node.data.status)}
                stroke={getStrokeColor(node.data.status)}
                stroke-width={node.data.status === 'EVALUATING' ? 4 : 2}
                class="node-rect"
                style="transition: all 0.3s ease;"
              />
              
              <text 
                class="node-label" 
                text-anchor="middle"
                dy="-5"
                fill={node.data.status === 'SUCCESS' || node.data.status === 'FAILURE' || node.data.status === 'RUNNING' ? '#fff' : '#0f172a'}
                font-weight="800"
                font-size="10.5"
              >
                {node.data.name}
              </text>

              <text 
                class="node-type" 
                text-anchor="middle"
                dy="15"
                fill={node.data.status === 'SUCCESS' || node.data.status === 'FAILURE' || node.data.status === 'RUNNING' ? 'rgba(255,255,255,0.7)' : '#64748b'}
                font-size="8"
                font-weight="600"
              >
                {node.data.type?.toUpperCase()}
              </text>

              {#if node.data.children?.length > 0}
                <circle r="8" cy="30" fill="#fff" stroke="#cbd5e1" class="expand-btn" />
                <path 
                   d={node.data.isExpanded ? "M-3 30 L3 30" : "M-3 30 L3 30 M0 27 L0 33"} 
                   stroke="#64748b" stroke-width="1.5" 
                />
              {/if}
            </g>
          {/each}
        {/if}
      </g>
    </svg>
  {:else}
    <!-- Utility Bar Chart Mode (Preserved) -->
    <div class="utility-viz">
        {#each utilityResult as s, i}
          <div class="u-bar-group">
            <div class="u-label-row">
              <span class="u-label">{s.label}</span>
              <span class="u-score">{s.score.toFixed(2)}</span>
            </div>
            <div class="u-bar-bg">
              <div class="u-bar-fill" style="width: {s.score * 100}%; background: {i === 0 ? 'var(--accent)' : '#93c5fd'}"></div>
            </div>
          </div>
        {/each}
    </div>
  {/if}
</div>

<style>
  .canvas-wrapper { width: 100%; height: 100%; position: relative; overflow: hidden; }
  .bt-svg { width: 100%; height: 100%; display: block; background: #f8fafc; cursor: grab; }
  .bt-svg:active { cursor: grabbing; }

  .node-group { cursor: pointer; outline: none; }
  .node-rect { transition: fill 0.3s, stroke 0.3s; }
  .link { stroke-linejoin: round; }

  .utility-viz {
    display: flex; flex-direction: column; gap: 2rem;
    padding: 4rem; justify-content: center; height: 100%;
    max-width: 600px; margin: 0 auto;
  }
  .u-bar-group { display: flex; flex-direction: column; gap: 0.8rem; }
  .u-label-row { display: flex; justify-content: space-between; font-weight: 800; font-size: 0.9rem; }
  .u-bar-bg { background: #e2e8f0; height: 50px; border-radius: 8px; overflow: hidden; }
  .u-bar-fill { height: 100%; transition: width 0.4s ease-out; }
</style>
