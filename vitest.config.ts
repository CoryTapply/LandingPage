import { defineConfig } from 'vitest/config';

// The tests cover pure timing math, so no React plugin or DOM is needed.
export default defineConfig({
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
