<script>
import * as d3 from "d3";

let { stats } = $props();

const NODE_W = 156;
const NODE_H = 52;

// Static "tidy tree" layout (d3.tree). Replaces the old force simulation, which
// flung nodes off-screen, overlapped the scoped boxes, and mis-grouped actions.
// The viewBox is fitted to the tree bounds so the WHOLE tree is always visible
// without any pan/zoom — exactly one clear, stable picture per decision.
const layout = $derived.by(() => {
	if (!stats.btRoot) return { nodes: [], links: [], regions: [], vb: "0 0 100 100" };

	const root = d3.hierarchy(stats.btRoot, (d) => d.children);
	d3
		.tree()
		.nodeSize([NODE_W + 34, 132])
		.separation((a, b) => (a.parent === b.parent ? 1 : 1.25))(root);

	const nodes = root.descendants();
	const links = root.links();

	const xs = nodes.map((n) => n.x);
	const ys = nodes.map((n) => n.y);
	const minX = Math.min(...xs);
	const maxX = Math.max(...xs);
	const minY = Math.min(...ys);
	const maxY = Math.max(...ys);
	const padX = NODE_W / 2 + 36;
	const padTop = NODE_H / 2 + 34;
	const padBot = NODE_H / 2 + 40;
	const vb = `${minX - padX} ${minY - padTop} ${maxX - minX + padX * 2} ${maxY - minY + padTop + padBot}`;

	// One scoped "tactical boundary" box per strategy subtree. With a static
	// layout these never overlap and always wrap the right children.
	const regions = nodes
		.filter((n) => n.data.isScoped)
		.map((sn) => {
			const sub = sn.descendants();
			const x0 = Math.min(...sub.map((d) => d.x)) - NODE_W / 2 - 14;
			const x1 = Math.max(...sub.map((d) => d.x)) + NODE_W / 2 + 14;
			// Extra top room so the strategy node's μ pill clears the box label.
			const y0 = Math.min(...sub.map((d) => d.y)) - NODE_H / 2 - 54;
			const y1 = Math.max(...sub.map((d) => d.y)) + NODE_H / 2 + 16;
			return { id: sn.data.id, x: x0, y: y0, w: x1 - x0, h: y1 - y0, label: sn.data.name };
		});

	return { nodes, links, regions, vb };
});

const FILL = {
	SUCCESS: "#22c55e",
	FAILURE: "#ef4444",
	RUNNING: "#3b82f6",
	EVALUATING: "#eab308",
	READY: "#e2e8f0",
};
const fillFor = (s) => FILL[s] ?? "#e2e8f0";
const isLight = (s) => s === "READY" || s === "EVALUATING";
const inkFor = (s) => (isLight(s) ? "#475569" : "#ffffff");
const subInkFor = (s) => (isLight(s) ? "#94a3b8" : "rgba(255,255,255,0.72)");

function linkPath(l) {
	const sx = l.source.x;
	const sy = l.source.y + NODE_H / 2;
	const tx = l.target.x;
	const ty = l.target.y - NODE_H / 2;
	const my = (sy + ty) / 2;
	return `M${sx},${sy} C${sx},${my} ${tx},${my} ${tx},${ty}`;
}
</script>

<div class="tree-wrap">
	<svg class="tree" viewBox={layout.vb} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Decision tree">
		<!-- Scoped tactical boundaries -->
		{#each layout.regions as r (r.id)}
			<g class="region">
				<rect x={r.x} y={r.y} width={r.w} height={r.h} rx="16" />
				<text class="region-label" x={r.x + 14} y={r.y + 22}>{r.label}</text>
			</g>
		{/each}

		<!-- Links -->
		{#each layout.links as l (l.target.data.id)}
			<path
				class="link"
				d={linkPath(l)}
				stroke={l.target.data.status === "READY" ? "#cbd5e1" : fillFor(l.target.data.status)}
			/>
		{/each}

		<!-- Nodes -->
		{#each layout.nodes as n (n.data.id)}
			<g class="node" style="transform: translate({n.x}px, {n.y}px);">
				<rect
					class="node-rect"
					x={-NODE_W / 2}
					y={-NODE_H / 2}
					width={NODE_W}
					height={NODE_H}
					rx="11"
					fill={fillFor(n.data.status)}
					stroke={n.data.status === "RUNNING" ? "#1d4ed8" : "#ffffff"}
					stroke-width={n.data.status === "RUNNING" ? 3 : 2}
				/>
				<text class="node-name" text-anchor="middle" dy="-1" fill={inkFor(n.data.status)}>{n.data.name}</text>
				<text class="node-type" text-anchor="middle" dy="13" fill={subInkFor(n.data.status)}>{n.data.type?.toUpperCase()}</text>

				{#if n.data.type === "strategy"}
					<g class="badge-mu" transform="translate(0, {-NODE_H / 2 - 13})">
						<rect x="-30" y="-11" width="60" height="20" rx="10" />
						<text text-anchor="middle" dy="0.32em">μ {n.data.utility.toFixed(2)}</text>
					</g>
				{:else if n.data.type === "action" && n.data.cost}
					<g class="badge-cost" transform="translate({NODE_W / 2 - 6}, {-NODE_H / 2 + 6})">
						<circle r="11" />
						<text text-anchor="middle" dy="0.32em">{n.data.cost}</text>
					</g>
				{/if}
			</g>
		{/each}
	</svg>
</div>

<style>
	.tree-wrap {
		width: 100%;
		height: 100%;
		display: flex;
		background: #f8fafc;
	}
	.tree {
		width: 100%;
		height: 100%;
		display: block;
	}

	.region rect {
		fill: rgba(37, 99, 235, 0.04);
		stroke: #2563eb;
		stroke-width: 2;
		stroke-dasharray: 8 4;
	}
	.region-label {
		font-size: 11px;
		font-weight: 900;
		fill: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.link {
		fill: none;
		stroke-width: 3;
		transition: stroke 0.4s ease;
	}

	.node {
		transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
	}
	.node-rect {
		filter: drop-shadow(0 4px 8px rgba(15, 23, 42, 0.08));
		transition: fill 0.3s ease, stroke 0.3s ease;
	}
	.node-name {
		font-size: 12.5px;
		font-weight: 800;
		pointer-events: none;
	}
	.node-type {
		font-size: 8px;
		font-weight: 700;
		letter-spacing: 0.06em;
		pointer-events: none;
	}

	/* μ desirability pill above each strategy */
	.badge-mu rect {
		fill: #eef2ff;
		stroke: #c7d2fe;
		stroke-width: 1;
	}
	.badge-mu text {
		font-size: 11px;
		font-weight: 800;
		fill: #4f46e5;
	}

	/* cost chip on the corner of each action */
	.badge-cost circle {
		fill: #0f172a;
		stroke: #fff;
		stroke-width: 1.5;
	}
	.badge-cost text {
		font-size: 11px;
		font-weight: 800;
		fill: #fff;
	}
</style>
