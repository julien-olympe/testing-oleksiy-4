import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const PRIMARY_EMAIL = 'testuser@example.com';
const PRIMARY_PASSWORD = 'SecurePass123!';

test.describe('Logout User Tests', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    
    // Navigate to login screen
    await page.goto('/login');
  });

  test('LOGOUT-001: Logout User - Positive Case', async () => {
    // ===== STEP 1: Login User =====
    await test.step('Step 1: Login User', async () => {
      // Verify Login Screen is displayed
      await expect(page.locator('input[id="email"]')).toBeVisible();
      await expect(page.locator('input[id="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]:has-text("Login")')).toBeVisible();

      // Enter login credentials
      await page.fill('input[id="email"]', PRIMARY_EMAIL);
      await page.fill('input[id="password"]', PRIMARY_PASSWORD);

      // Click Login button
      await page.click('button[type="submit"]:has-text("Login")');

      // Verify user is authenticated and redirected to Home Screen
      await page.waitForURL('/home', { timeout: 10000 });
      await expect(page.locator('h1:has-text("Home")')).toBeVisible();
    });

    // ===== STEP 2: Verify User is Logged In =====
    await test.step('Step 2: Verify User is Logged In and on Authenticated Screen', async () => {
      // Verify user is on Home Screen (authenticated screen)
      await expect(page.locator('h1:has-text("Home")')).toBeVisible();
      await expect(page).toHaveURL(/\/home/);
    });

    // ===== STEP 3: Verify Settings Icon =====
    await test.step('Step 3: Verify Settings Icon is Visible', async () => {
      // Verify settings icon (round icon) is visible in top-right corner
      const settingsButton = page.locator('button.settings-button, button[aria-label="Settings"]');
      await expect(settingsButton).toBeVisible();
    });

    // ===== STEP 4: Click Settings Icon =====
    await test.step('Step 4: Click Settings Icon', async () => {
      // Click settings icon in top-right corner
      await page.click('button.settings-button, button[aria-label="Settings"]');
    });

    // ===== STEP 5: Verify Settings Menu =====
    await test.step('Step 5: Verify Settings Menu is Displayed', async () => {
      // Verify settings menu is displayed
      await expect(page.locator('.settings-dropdown')).toBeVisible();
    });

    // ===== STEP 6: Verify Settings Menu Content =====
    await test.step('Step 6: Verify Settings Menu Shows User Name and Logout Option', async () => {
      // Verify settings menu shows user name (e.g., "testuser@example.com" or user's display name)
      await expect(page.locator('.settings-user-name')).toContainText(PRIMARY_EMAIL);
      
      // Verify settings menu shows logout option
      await expect(page.locator('button.settings-logout:has-text("Logout")')).toBeVisible();
    });

    // ===== STEP 7: Click Logout Option =====
    await test.step('Step 7: Click Logout Option', async () => {
      // Click logout option
      await page.click('button.settings-logout:has-text("Logout")');
    });

    // ===== STEP 8: Verify Logout is Successful =====
    await test.step('Step 8: Verify Logout is Successful', async () => {
      // Wait for navigation to login screen
      await page.waitForURL('/login', { timeout: 10000 });
      
      // Verify user is redirected to Login Screen
      await expect(page).toHaveURL(/\/login/);
    });

    // ===== STEP 9: Verify Login Screen is Displayed =====
    await test.step('Step 9: Verify Login Screen is Displayed Correctly', async () => {
      // Verify Login Screen is displayed correctly
      await expect(page.locator('input[id="email"]')).toBeVisible();
      await expect(page.locator('input[id="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]:has-text("Login")')).toBeVisible();
    });

    // ===== STEP 10: Verify User is No Longer Authenticated =====
    await test.step('Step 10: Verify User is No Longer Authenticated', async () => {
      // Verify user is on login screen (not authenticated)
      await expect(page).toHaveURL(/\/login/);
      
      // Verify no error messages are displayed
      const errorNotification = page.locator('.error-notification');
      if (await errorNotification.isVisible()) {
        const errorText = await errorNotification.textContent();
        throw new Error(`Unexpected error after logout: ${errorText}`);
      }
    });
  });

  test('LOGOUT-002: Verify Cannot Access Authenticated Features After Logout', async () => {
    // ===== STEP 1: Login User =====
    await test.step('Step 1: Login User', async () => {
      // Enter login credentials
      await page.fill('input[id="email"]', PRIMARY_EMAIL);
      await page.fill('input[id="password"]', PRIMARY_PASSWORD);

      // Click Login button
      await page.click('button[type="submit"]:has-text("Login")');

      // Verify user is authenticated and redirected to Home Screen
      await page.waitForURL('/home', { timeout: 10000 });
      await expect(page.locator('h1:has-text("Home")')).toBeVisible();
    });

    // ===== STEP 2: Logout User =====
    await test.step('Step 2: Logout User', async () => {
      // Click settings icon
      await page.click('button.settings-button, button[aria-label="Settings"]');
      
      // Wait for settings menu to appear
      await expect(page.locator('.settings-dropdown')).toBeVisible();
      
      // Click logout option
      await page.click('button.settings-logout:has-text("Logout")');
      
      // Wait for redirect to login screen
      await page.waitForURL('/login', { timeout: 10000 });
    });

    // ===== STEP 3: Verify User is on Login Screen After Logout =====
    await test.step('Step 3: Verify User is on Login Screen After Logout', async () => {
      // Verify user is on Login Screen after logout
      await expect(page).toHaveURL(/\/login/);
      await expect(page.locator('input[id="email"]')).toBeVisible();
    });

    // ===== STEP 4: Attempt to Navigate to Home Screen =====
    await test.step('Step 4: Attempt to Navigate to Home Screen by URL', async () => {
      // Attempt to navigate to Home Screen by typing URL directly
      await page.goto('/home');
      
      // Wait a bit for any redirect
      await page.waitForTimeout(1000);
      
      // Verify user is redirected back to Login Screen OR access is denied
      // The app should redirect unauthenticated users to /login
      await expect(page).toHaveURL(/\/login/);
    });

    // ===== STEP 5: Verify Cannot Access Home Screen =====
    await test.step('Step 5: Verify User Cannot Access Home Screen Without Authentication', async () => {
      // Try to navigate to home again
      await page.goto('/home');
      await page.waitForTimeout(1000);
      
      // Verify user cannot access Home Screen without authentication
      await expect(page).toHaveURL(/\/login/);
      await expect(page.locator('h1:has-text("Home")')).not.toBeVisible();
    });

    // ===== STEP 6: Verify Cannot Access Project Editor =====
    await test.step('Step 6: Verify User Cannot Access Project Editor Without Authentication', async () => {
      // Try to navigate to a project editor (using a dummy project ID)
      await page.goto('/projects/00000000-0000-0000-0000-000000000000');
      await page.waitForTimeout(1000);
      
      // Verify user is redirected to login
      await expect(page).toHaveURL(/\/login/);
      await expect(page.locator('.project-editor')).not.toBeVisible();
    });

    // ===== STEP 7: Verify Cannot Access Function Editor =====
    await test.step('Step 7: Verify User Cannot Access Function Editor Without Authentication', async () => {
      // Try to navigate to a function editor (using a dummy function ID)
      await page.goto('/functions/00000000-0000-0000-0000-000000000000');
      await page.waitForTimeout(1000);
      
      // Verify user is redirected to login
      await expect(page).toHaveURL(/\/login/);
      await expect(page.locator('.function-editor')).not.toBeVisible();
    });
  });
});
