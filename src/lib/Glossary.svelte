<script>
let {
	isOpen = $bindable(false),
	section = $bindable("root"),
	onClose,
} = $props();

const entries = [
	{
		id: "root",
		title: "Glossary: Cognitive Decision Architectures",
		body: "This tool layers two real techniques. A fuzzy (or binary) selector chooses WHICH strategy to pursue; a GOAP planner computes HOW to achieve it as an ordered action queue. The graph shows: Strategy Selector → Strategy → Tactical plan (scoped box) → Actions.",
	},
	{
		id: "binary",
		title: "Binary Selection",
		body: "The comparison baseline. Strategies are checked in a fixed priority order against hard thresholds; the first rule that passes wins (e.g. health < 30 → Survive). It cannot express 'how much' a condition holds, so it can flip abruptly and disagree with the fuzzy pick near a threshold.",
	},
	{
		id: "fuzzy",
		title: "Fuzzy Selection",
		body: "Each crisp input (health, ammo, enemy distance) is fuzzified by membership functions into degrees in linguistic sets (e.g. Critical / Wounded / Healthy). Rules combine them with fuzzy AND (min); rules voting for the same strategy aggregate with fuzzy OR (max), giving a continuous desirability in [0,1]. The most desirable strategy fires.",
	},
	{
		id: "membership",
		title: "Membership Function (μ)",
		body: "A curve mapping a crisp value to a [0,1] degree of membership in a fuzzy set. Here they are triangles and shoulders — e.g. 'enemy Near' is 1 below 25, ramps to 0 by 45. Overlapping sets are what give fuzzy logic its smooth, non-brittle transitions.",
	},
	{
		id: "goap",
		title: "GOAP: Goal-Oriented Action Planning",
		body: "The tactical layer. A goal is a target world-state (e.g. enemyDead = true). Each action has preconditions, effects and a cost. A forward A* search explores reachable world-states to find the cheapest action sequence that satisfies the goal — the 'plan' shown as the action queue.",
	},
	{
		id: "astar",
		title: "Forward A* Planning",
		body: "From the current world-state, expand each action whose preconditions hold, applying its effects to reach a new state. Nodes are prioritised by f = g + h, where g is cost-so-far and h counts unmet goal facts (an admissible heuristic). The first goal-satisfying state popped is the optimal plan.",
	},
	{
		id: "unreachable",
		title: "Unreachable Goal",
		body: "If no chain of satisfiable actions reaches the goal (e.g. Attack needs a loaded weapon, Reload needs ammo, and ammo is empty), the planner returns no plan. The tool surfaces this as 'No valid plan' rather than silently failing — a key advantage of planning over hard-coded branches.",
	},
];

function handleClose() {
	isOpen = false;
	onClose?.();
}

function scrollToSection(id) {
	const el = document.getElementById(`glossary-${id}`);
	if (el) el.scrollIntoView({ behavior: "smooth" });
	section = id;
}

$effect(() => {
	if (isOpen && section) {
		setTimeout(() => scrollToSection(section), 10);
	}
});
</script>

{#if isOpen}
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="modal-overlay" onclick={handleClose} onkeydown={(e) => e.key === 'Escape' && handleClose()} tabindex="-1">
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="modal-content" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="0">
    <aside class="toc">
      <h3>Decision Glossary</h3>
      <ul>
        {#each entries as entry}
          <li>
            <button 
              class:active={section === entry.id} 
              onclick={() => scrollToSection(entry.id)}
            >
              {entry.title.split(':')[1]?.trim() || entry.title}
            </button>
          </li>
        {/each}
      </ul>
      <button class="close-main-btn" onclick={handleClose}>Close Modal</button>
    </aside>

    <div class="content-view">
      {#each entries as entry}
        <section id="glossary-{entry.id}">
          <h2>{entry.title}</h2>
          <p>{entry.body}</p>
          <hr />
        </section>
      {/each}
      <div class="footer-note">Note: For university-level AI, we focus on the transition from static rules to iterative physical simulations.</div>
    </div>
  </div>
</div>
{/if}

<style>
  
</style>