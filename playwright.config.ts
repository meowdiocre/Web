import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PORT ?? 4173);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: 0,
  timeout: 30_000,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure'
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command:  `npm run build && npm run preview -- --port ${PORT}`,
        port:     PORT,
        reuseExistingServer: !process.env.CI,
        stdout:   'pipe',
        stderr:   'pipe',
        timeout:  120_000
      },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ]
});
