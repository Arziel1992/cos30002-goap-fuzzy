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
		body: "Modern Game AI must choose between complex planning and instant, reactive scores. The decision architecture defines how an agent transitions from sensing to acting.",
	},
	{
		id: "goap",
		title: "GOAP: Regressive Search",
		body: 'Goal-Oriented Action Planning uses A* to search from a goal back to its preconditions. For example, "Target Dead" -> Precondition "Has Ammo" -> Action "Collect Ammo". It allows for emergent problem solving.',
	},
	{
		id: "utility",
		title: "Utility: Scoring & Weights",
		body: "Fuzzy logic scoring. Each action (Attack, Heal, Flee) calculates a 0-1 value based on multiple environmental inputs. Weights allow designers to prioritize survival over combat.",
	},
	{
		id: "fuzzy",
		title: "Fuzzy Logic Curves",
		body: 'Unlike binary "if-then" rules, fuzzy curves provide a gradient. Health <= 20% might have a utility of 1, but 21% is not 0; it might be 0.9. This creates smooth, human-like transitions.',
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
<div class="modal-overlay" onclick={handleClose} onkeydown={(e) => e.key === 'Escape' && handleClose()} tabindex="-1">
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