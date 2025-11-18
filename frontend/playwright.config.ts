import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'list',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: 'npm run dev',
      cwd: '../backend',
      port: 8000,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL || 'postgresql://tu_phmhhk:qM4y8EBHYxGxRX4SEqd6K8CsQMR7jL7HMxJC6tEB@37.156.46.78:43971/test_db_vk11wc',
        JWT_SECRET: process.env.JWT_SECRET || 'test-jwt-secret-key-256-bits-long-for-development-only-change-in-production',
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'test-jwt-refresh-secret-key-256-bits-long-for-development-only-change-in-production',
        PORT: '8000',
        NODE_ENV: 'development',
        CORS_ORIGIN: '*',
        LOG_LEVEL: 'info',
      },
    },
    {
      command: 'npm run dev',
      port: 3000,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],
});
