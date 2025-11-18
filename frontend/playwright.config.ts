import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'cd ../backend && PORT=8000 npm run dev',
      url: 'http://localhost:8000',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      env: {
        PORT: '8000',
        NODE_ENV: 'development',
        DATABASE_URL: 'postgresql://tu_phmhhk:qM4y8EBHYxGxRX4SEqd6K8CsQMR7jL7HMxJC6tEB@37.156.46.78:43971/test_db_vk11wc',
        JWT_SECRET: 'test-jwt-secret-key-for-development-only-change-in-production-256-bits',
        JWT_REFRESH_SECRET: 'test-jwt-refresh-secret-key-for-development-only-change-in-production-256-bits',
        CORS_ORIGIN: '*',
        LOG_LEVEL: 'info',
      },
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],
});
