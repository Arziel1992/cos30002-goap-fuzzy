import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [svelte()],
	base: "/cos30002-goap-fuzzy/",
	resolve: {
		conditions: ["browser", "svelte"],
	},
});
