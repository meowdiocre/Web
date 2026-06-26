import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [svelte({ hot: false })],
  resolve: {
    conditions: ['browser'],
    alias: {
      $lib: resolve('src/lib'),
      $db:  resolve('src/lib/server/db'),
      $app: resolve('src/test/app-stub')
    }
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.{test,spec}.{js,ts}'],
    exclude: ['tests/e2e/**', 'node_modules/**', '.svelte-kit/**'],
    setupFiles: ['./src/test/setup.ts']
  }
});
