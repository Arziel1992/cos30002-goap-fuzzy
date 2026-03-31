<script>
  import { onMount } from 'svelte';

  let { 
    stats, 
    params, 
    containerRef 
  } = $props();

  let canvas;
  let ctx;
  let width = 0;
  let height = 0;

  const colors = {
    accent: '#2563eb',
    text: '#0f172a',
    textSecondary: '#475569',
    border: '#e2e8f0',
    bg: '#f8fafc',
    highlight: '#60a5fa',
    leaf: 'rgba(59, 130, 246, 0.05)'
  };

  function handleResize() {
    if (!containerRef || !canvas || !ctx) return;
    const rect = containerRef.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
  }

  // Pre-defined static positions for the "Full Action State Map"
  const nodeMap = {
    'siege': { x: 0.5, y: 0.2, tier: 'HIGH' },
    'skirmish': { x: 0.2, y: 0.5, tier: 'HIGH' },
    'build_turret': { x: 0.8, y: 0.3, tier: 'COMPOSITE' },
    'scavenge': { x: 0.8, y: 0.5, tier: 'COMPOSITE' },
    'reload_task': { x: 0.2, y: 0.7, tier: 'COMPOSITE' },
    'move_enemy': { x: 0.5, y: 0.5, tier: 'ATOMIC' },
    'move_depot': { x: 0.8, y: 0.7, tier: 'ATOMIC' },
    'move_health': { x: 0.5, y: 0.8, tier: 'ATOMIC' },
    'find_medkit': { x: 0.8, y: 0.9, tier: 'LEAF' },
    'take_reserve': { x: 0.5, y: 0.3, tier: 'LEAF' }
  };

  function drawNode(x, y, label, tier, isActive = false, isComposite = false) {
    const w = isComposite ? 180 : 130; 
    const h = isComposite ? 50 : 36;
    
    // Composite Border (Design Pattern Visual)
    if (isComposite) {
        ctx.setLineDash([2, 4]);
        ctx.strokeStyle = colors.accent;
        ctx.beginPath();
        ctx.roundRect(x - w/2 - 10, y - h/2 - 10, w + 20, h + 20, 12);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    ctx.fillStyle = isActive ? colors.accent : '#ffffff';
    ctx.strokeStyle = isActive ? colors.accent : colors.border;
    ctx.lineWidth = 1.5;
    
    ctx.beginPath();
    ctx.roundRect(x - w/2, y - h/2, w, h, 6);
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = isActive ? '#fff' : colors.text;
    ctx.font = `bold 0.7rem Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label.toUpperCase(), x, y);

    // Tier Label
    ctx.fillStyle = colors.textSecondary;
    ctx.font = '600 0.5rem sans-serif';
    ctx.fillText(tier, x, y + 14 + (isComposite ? 5 : 0));
  }

  function drawLine(x1, y1, x2, y2, isActive = false) {
    ctx.strokeStyle = isActive ? colors.accent : 'rgba(0,0,0,0.05)';
    ctx.lineWidth = isActive ? 3 : 1;
    ctx.setLineDash(isActive ? [] : [5, 5]);
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function render() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    if (params.mode === 'goap') {
        const plan = stats.currentPlan || [];
        const activeNodeIds = new Set(plan.map(p => p.id));
        
        // 1. Draw "Composed Chains" (links between potential nodes)
        const actions = stats.allNodes || [];
        actions.forEach(a1 => {
            const p1 = nodeMap[a1.id];
            if (!p1) return;
            actions.forEach(a2 => {
              if (a1 === a2) return;
              const p2 = nodeMap[a2.id];
              if (!p2) return;
              // If a1 satisfies a2, draw a potential link
              for (const k in a1.post) {
                if (a1.post[k] === a2.pre[k]) {
                  const isActiveLink = activeNodeIds.has(a1.id) && activeNodeIds.has(a2.id);
                  drawLine(p1.x * width, p1.y * height, p2.x * width, p2.y * height, isActiveLink);
                }
              }
            });
        });

        // 2. Draw Nodes
        actions.forEach(node => {
          const pos = nodeMap[node.id];
          if (!pos) return;
          const isActive = activeNodeIds.has(node.id);
          drawNode(pos.x * width, pos.y * height, node.name, pos.tier, isActive, node.composite);
        });

    } else {
        const scores = stats.utilityScores || [];
        const barW = 280; const barH = 44; const spacing = 45;
        const totalH = (barH + spacing) * scores.length;
        const startY = height / 2 - (totalH - spacing) / 2;
        const startX = width / 2 - barW / 2;

        scores.forEach((s, i) => {
            const y = startY + i * (barH + spacing);
            ctx.fillStyle = colors.text;
            ctx.font = 'bold 0.8rem Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(s.label.toUpperCase(), startX, y - 10);

            ctx.fillStyle = '#e2e8f0';
            ctx.beginPath(); ctx.roundRect(startX, y, barW, barH, 6); ctx.fill();

            ctx.fillStyle = i === 0 ? colors.accent : 'rgba(37, 99, 235, 0.2)';
            ctx.beginPath(); ctx.roundRect(startX, y, barW * s.score, barH, 6); ctx.fill();

            ctx.fillStyle = colors.textSecondary;
            ctx.font = '500 0.6rem monospace';
            ctx.textAlign = 'left';
            ctx.fillText(s.breakdown, startX, y + barH + 12);

            ctx.fillStyle = i === 0 ? '#ffffff' : colors.text;
            ctx.font = '900 1.1rem monospace';
            ctx.textAlign = 'right';
            ctx.fillText(s.score.toFixed(2), startX + barW - 12, y + barH / 2 + 7);
        });
    }

    requestAnimationFrame(render);
  }

  onMount(() => {
    ctx = canvas.getContext('2d');
    render();
  });

  $effect(() => {
    if (containerRef && canvas) {
      const resizeObserver = new ResizeObserver(() => handleResize());
      resizeObserver.observe(containerRef);
      handleResize();
      return () => resizeObserver.disconnect();
    }
  });
</script>

<canvas bind:this={canvas}></canvas>

<style>
  canvas { display: block; width: 100%; height: 100%; cursor: crosshair; }
</style>
