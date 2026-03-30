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

  function drawGOAPNode(x, y, label, isActive = false) {
    const w = 140; const h = 40;
    
    ctx.fillStyle = isActive ? 'var(--accent)' : '#fff';
    ctx.strokeStyle = 'var(--panel-border)';
    ctx.lineWidth = 1;
    
    // Drop shadow
    ctx.shadowColor = 'rgba(0,0,0,0.05)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    
    ctx.beginPath();
    ctx.roundRect(x - w/2, y - h/2, w, h, 6);
    ctx.fill();
    ctx.stroke();
    
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    ctx.fillStyle = isActive ? '#fff' : 'var(--text-primary)';
    ctx.font = '600 0.75rem sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y);
  }

  function drawArrow(x1, y1, x2, y2) {
    const headlen = 10; 
    const dx = x2 - x1;
    const dy = y2 - y1;
    const angle = Math.atan2(dy, dx);
    
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headlen * Math.cos(angle - Math.PI / 6), y2 - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - headlen * Math.cos(angle + Math.PI / 6), y2 - headlen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fill();
  }

  function render() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    if (params.mode === 'goap') {
        const plan = stats.currentPlan || [{ name: 'Idle - No Plan Found' }];
        const nodeSpacing = 180;
        const centerX = width / 2 - ((plan.length - 1) * nodeSpacing) / 2;
        const centerY = height / 2;

        for (let i = 0; i < plan.length; i++) {
            const x = centerX + i * nodeSpacing;
            if (i < plan.length - 1) {
                drawArrow(x + 70, centerY, x + nodeSpacing - 70, centerY);
            }
            drawGOAPNode(x, centerY, plan[i].name, i === 0);
        }
    } else {
        // Utility Bar Chart
        const scores = stats.utilityScores;
        const barW = 200; const barH = 50; const spacing = 20;
        const totalH = (barH + spacing) * scores.length;
        const startY = height / 2 - totalH / 2;
        const startX = width / 2 - barW / 2;

        scores.forEach((s, i) => {
            const y = startY + i * (barH + spacing);
            
            // Label
            ctx.fillStyle = 'var(--text-secondary)';
            ctx.font = '700 0.65rem sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(s.label.toUpperCase() + ' — ' + s.breakdown, startX, y - 5);

            // BG
            ctx.fillStyle = '#e2e8f0';
            ctx.beginPath();
            ctx.roundRect(startX, y, barW, barH, 4);
            ctx.fill();

            // Progress
            ctx.fillStyle = i === 0 ? 'var(--accent)' : 'rgba(59, 130, 246, 0.4)';
            ctx.beginPath();
            ctx.roundRect(startX, y, barW * s.score, barH, 4);
            ctx.fill();

            // Score text
            ctx.fillStyle = s.score > 0.8 ? '#fff' : 'var(--text-primary)';
            ctx.font = 'bold 0.85rem monospace';
            ctx.textAlign = 'right';
            ctx.fillText(s.score.toFixed(2), startX + barW - 10, y + barH / 2 + 5);
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
