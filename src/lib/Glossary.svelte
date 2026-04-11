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
  .modal-overlay {
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: var(--bg-secondary); border: 1px solid var(--panel-border);
    border-radius: 12px; width: 800px; max-width: 95%; height: 650px;
    box-shadow: 0 10px 50px rgba(0,0,0,0.1);
    display: flex; overflow: hidden;
  }

  .toc {
    width: 240px; background: var(--bg-primary); 
    border-right: 1px solid var(--panel-border);
    padding: 2rem; display: flex; flex-direction: column; gap: 1rem;
  }

  .toc h3 { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-secondary); margin: 0; }
  
  .toc ul { list-style: none; padding: 0; margin: 0; flex: 1; }
  
  .toc button {
    background: none; border: none; font-size: 0.85rem; color: var(--text-secondary);
    padding: 0.6rem 0; cursor: pointer; display: block; text-align: left; width: 100%;
    transition: color 0.2s;
  }

  .toc button:hover, .toc button.active { color: var(--accent); font-weight: 700; }

  .content-view { flex: 1; padding: 2rem; overflow-y: auto; scroll-behavior: smooth; }
  
  section { margin-bottom: 4rem; scroll-margin-top: 2rem; }

  h2 { font-size: 1.5rem; color: var(--text-primary); margin-bottom: 1.2rem; }
  p { line-height: 1.6; color: var(--text-secondary); font-size: 1.05rem; }
  
  hr { border: 0; border-top: 1px solid var(--panel-border); margin: 2rem 0; }

  .footer-note { font-style: italic; font-size: 0.85rem; color: var(--accent); opacity: 0.9; margin-top: 2rem; }

  .close-main-btn {
    background: var(--bg-secondary); border: 1px solid var(--panel-border); padding: 0.75rem;
    border-radius: 8px; cursor: pointer; font-size: 0.8rem; font-weight: bold; color: var(--text-secondary);
  }
</style>
