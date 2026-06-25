import { defineConfig } from 'vitest/config';

// Vitest stubs CSS imports to empty strings by default (css: false) to save resources.
// The engine imports each animation's stylesheet via `?raw` (to inline it in the lab and
// the single-file export), so the tests need real CSS processing to see that content.
export default defineConfig({
  test: { css: true },
});
