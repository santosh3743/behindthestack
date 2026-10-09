import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  use: { baseURL: 'http://localhost:4321', ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
  webServer: {
    command: 'PUBLIC_SHOW_DRAFTS=1 npm run build && node tests/serve-dist.mjs',
    url: 'http://localhost:4321',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
