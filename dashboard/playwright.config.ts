import { defineConfig, devices } from '@playwright/test'

const origin = 'http://127.0.0.1:3444'

export default defineConfig({
  testDir: './tests/e2e',
  use: { ...devices['Desktop Chrome'], baseURL: origin, trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run dev -- --hostname 127.0.0.1 --port 3444',
    url: origin,
    timeout: 120_000,
  },
})
