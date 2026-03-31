<script>
  import * as d3 from 'd3';
  import { onMount, tick, untrack } from 'svelte';

  let { 
    stats, 
    params, 
    physics,
    containerRef 
  } = $props();

  let svg = $state();
  let wrapperDiv = $state();
  let width = $state(0);
  let height = $state(0);
  let transform = $state({ x: 0, y: 0, k: 0.8 });

  // Force simulation state
  let nodes = $state([]);
  let links = $state([]);
  let simulation;

  function handleResize() {
    if (!wrapperDiv) return;
    const rect = wrapperDiv.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
  }

  // Effect to update simulation structure
  $effect(() => {
    if (!stats.btRoot) return;

    const root = d3.hierarchy(stats.btRoot, d => d.isExpanded !== false ? d.children : null);
    const d3Nodes = root.descendants();
    const d3Links = root.links();

    const forceNodes = d3Nodes.map(d => {
      const existing = untrack(() => nodes.find(n => n.id === d.data.id));
      return {
        id: d.data.id,
        data: d.data,
        depth: d.depth,
        x: existing?.x || (Math.random() - 0.5) * 200,
        y: existing?.y || d.depth * 180
      };
    });

    const forceLinks = d3Links.map(l => ({
      source: forceNodes.find(n => n.id === l.source.data.id),
      target: forceNodes.find(n => n.id === l.target.data.id)
    }));

    nodes = forceNodes;
    links = forceLinks;

    if (simulation) simulation.stop();

    simulation = d3.forceSimulation(forceNodes)
      .force('link', d3.forceLink(forceLinks).distance(physics.linkDist).strength(1))
      .force('charge', d3.forceManyBody().strength(physics.repulsion)) 
      .force('x', d3.forceX(0).strength(physics.gravity))
      .force('y', d3.forceY(d => d.depth * 180).strength(physics.drift ? 0.05 : 2)) 
      .on('tick', () => {
         nodes = [...forceNodes]; 
      });

    simulation.alpha(1).restart();
  });

  // Reactive adjustment of forces without restarting the whole structure
  $effect(() => {
     if (!simulation) return;
     simulation.force('charge').strength(physics.repulsion);
     simulation.force('link').distance(physics.linkDist);
     simulation.force('x').strength(physics.gravity);
     simulation.force('y').strength(physics.drift ? 0.05 : 2);
     simulation.alpha(0.3).restart();
  });

  let scopedRegions = $derived.by(() => {
    const regions = [];
    const scopedNodes = nodes.filter(n => n.data.isScoped);
    
    scopedNodes.forEach(sn => {
       const subRoot = d3.hierarchy(sn.data, d => d.children);
       const subIds = subRoot.descendants().map(d => d.data.id);
       const subNodes = nodes.filter(n => subIds.includes(n.id));

       if (subNodes.length > 0) {
          const minX = Math.min(...subNodes.map(n => n.x)) - 80;
          const maxX = Math.max(...subNodes.map(n => n.x)) + 80;
          const minY = Math.min(...subNodes.map(n => n.y)) - 50;
          const maxY = Math.max(...subNodes.map(n => n.y)) + 70;
          regions.push({ id: sn.id, x: minX, y: minY, w: maxX - minX, h: maxY - minY, label: sn.data.name });
       }
    });
    return regions;
  });

  onMount(() => {
    const d3Zoom = d3.zoom().scaleExtent([0.1, 4]).on('zoom', (event) => { transform = event.transform; });
    d3.select(svg).call(d3Zoom);
    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(wrapperDiv);
    handleResize();
    return () => {
      resizeObserver.disconnect();
      if (simulation) simulation.stop();
    };
  });

  function getStatusColor(status) {
    switch (status) {
      case 'SUCCESS': return '#22c55e';
      case 'FAILURE': return '#ef4444';
      case 'RUNNING': return '#3b82f6';
      case 'EVALUATING': return '#eab308';
      default: return '#94a3b8';
    }
  }

  function toggleExpand(nodeData) {
      nodeData.isExpanded = !nodeData.isExpanded;
      stats.btRoot = { ...stats.btRoot };
  }
</script>

<div class="canvas-wrapper" bind:this={wrapperDiv}>
  <svg bind:this={svg} class="bt-svg">
    <g transform="translate({width/2 + transform.x}, {100 + transform.y}) scale({transform.k})">
      <!-- Scoped Borders -->
      {#each scopedRegions as r}
        <g class="scoped-region">
          <rect x={r.x} y={r.y} width={r.w} height={r.h} rx="20" fill="rgba(37, 99, 235, 0.04)" stroke="#2563eb" stroke-width="2" stroke-dasharray="8,4" />
          <text x={r.x + 20} y={r.y + 25} class="scoped-label">{r.label}</text>
        </g>
      {/each}

      <!-- Links -->
      {#each links as link}
        <path class="link" 
          d="M{link.source.x},{link.source.y}C{link.source.x},{(link.source.y + link.target.y)/2} {link.target.x},{(link.source.y + link.target.y)/2} {link.target.x},{link.target.y}"
          fill="none" 
          stroke={link.target.data.status === 'READY' ? '#cbd5e1' : getStatusColor(link.target.data.status)} 
          stroke-width="3" 
        />
      {/each}

      <!-- Nodes -->
      {#each nodes as node}
        <g 
          class="node-group" 
          transform="translate({node.x}, {node.y})" 
          onclick={() => node.data.children?.length > 0 && toggleExpand(node.data)}
          onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && node.data.children?.length > 0 && toggleExpand(node.data)}
          role="button"
          tabindex="0"
          aria-label="Toggle {node.data.name} expansion"
        >
          <rect width="140" height="54" x="-70" y="-27" rx="10" 
            fill={getStatusColor(node.data.status)} 
            stroke={node.data.status === 'EVALUATING' ? '#eab308' : '#fff'}
            stroke-width={node.data.status === 'EVALUATING' ? 4 : 2}
            class="node-rect" 
          />
          <text class="node-label" text-anchor="middle" dy="-4" fill={node.data.status === 'READY' || node.data.status === 'EVALUATING' ? '#475569' : '#fff'}>
            {node.data.name}
          </text>
          <text class="node-type" text-anchor="middle" dy="14" fill={node.data.status === 'READY' || node.data.status === 'EVALUATING' ? '#94a3b8' : 'rgba(255,255,255,0.7)'}>
            {node.data.type?.toUpperCase()}
          </text>
          {#if params.mode === 'fuzzy' && node.data.utility > 0}
             <text x="75" dy="-10" class="utility-badge">U: {node.data.utility.toFixed(2)}</text>
          {/if}
        </g>
      {/each}
    </g>
  </svg>
</div>

<style>
  .canvas-wrapper { width: 100%; height: 100%; position: relative; overflow: hidden; background: #f8fafc; }
  .bt-svg { width: 100%; height: 100%; display: block; cursor: grab; }
  .scoped-label { font-size: 8px; font-weight: 900; fill: var(--accent); text-transform: uppercase; letter-spacing: 1px; }
  .node-group { cursor: pointer; border: none; outline: none; }
  .node-group:focus-visible .node-rect { stroke: var(--accent); stroke-width: 4; }
  .node-label { font-weight: 800; font-size: 10px; pointer-events: none; }
  .node-type { font-weight: 600; font-size: 7px; opacity: 0.8; pointer-events: none; }
  .node-rect { transition: fill 0.3s ease; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.05)); }
  .link { transition: stroke 0.4s ease; stroke-linejoin: round; }
  .utility-badge { font-size: 8px; font-weight: 900; fill: #6366f1; }
</style>
