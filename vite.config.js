import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  base: '/cos30002-goap-fuzzy/',
  resolve: {
    conditions: ['browser', 'svelte']
  }
});
