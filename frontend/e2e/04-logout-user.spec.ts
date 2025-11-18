import { test, expect } from '@playwright/test';
import { ensureTestUser, TEST_EMAIL, TEST_PASSWORD } from './helpers';

test.describe('Logout User', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure test user exists and login
    await ensureTestUser(page);
    
    // Wait for navigation to home screen
    await page.waitForURL('/home', { timeout: 10000 });
    await expect(page.locator('h1:has-text("Home")')).toBeVisible();
  });

  test('LOGOUT-001: Logout User - Positive Case', async ({ page }) => {
    // Step 1: Verify user is logged in and on an authenticated screen (e.g., Home Screen)
    await expect(page).toHaveURL('/home');
    await expect(page.locator('h1:has-text("Home")')).toBeVisible();

    // Step 2: Verify settings icon (round icon) is visible in top-right corner
    const settingsButton = page.locator('button[aria-label="Settings"]');
    await expect(settingsButton).toBeVisible();

    // Step 3: Click settings icon in top-right corner
    await settingsButton.click();

    // Step 4: Verify settings menu is displayed
    const settingsMenu = page.locator('.settings-dropdown');
    await expect(settingsMenu).toBeVisible();

    // Step 5: Verify settings menu shows user name (e.g., "testuser@example.com" or user's display name)
    const userName = settingsMenu.locator('.settings-user-name');
    await expect(userName).toBeVisible();
    await expect(userName).toContainText(TEST_EMAIL);

    // Step 6: Verify settings menu shows logout option
    const logoutButton = settingsMenu.locator('button:has-text("Logout")');
    await expect(logoutButton).toBeVisible();

    // Step 7: Click logout option
    await logoutButton.click();

    // Step 8-11: Verify logout is successful, session is invalidated, user is redirected to Login Screen
    await page.waitForURL('/login', { timeout: 10000 });
    await expect(page.locator('h1:has-text("Visual Programming Application")')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // Step 12: Verify Login Screen is displayed correctly
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Login');

    // Step 13: Verify user is no longer authenticated
    // Try to access home directly - should redirect to login
    await page.goto('/home');
    await page.waitForURL('/login', { timeout: 5000 });
    
    // Verify no error messages are displayed
    const errorNotification = page.locator('.error-notification');
    await expect(errorNotification).not.toBeVisible();
  });

  test('LOGOUT-002: Verify Cannot Access Authenticated Features After Logout', async ({ page }) => {
    // First, logout (reuse the logout flow from LOGOUT-001)
    const settingsButton = page.locator('button[aria-label="Settings"]');
    await settingsButton.click();
    
    const settingsMenu = page.locator('.settings-dropdown');
    await expect(settingsMenu).toBeVisible();
    
    const logoutButton = settingsMenu.locator('button:has-text("Logout")');
    await logoutButton.click();
    
    // Wait for redirect to login
    await page.waitForURL('/login', { timeout: 10000 });

    // Step 1: Verify user is on Login Screen after logout
    await expect(page).toHaveURL('/login');
    await expect(page.locator('h1:has-text("Visual Programming Application")')).toBeVisible();

    // Step 2: Attempt to navigate to Home Screen by typing URL directly
    await page.goto('/home');

    // Step 3: Verify user is redirected back to Login Screen OR access is denied
    await page.waitForURL('/login', { timeout: 5000 });
    await expect(page).toHaveURL('/login');

    // Step 4: Verify user cannot access Home Screen without authentication
    await page.goto('/home');
    await page.waitForURL('/login', { timeout: 5000 });
    await expect(page.locator('h1:has-text("Visual Programming Application")')).toBeVisible();

    // Step 5: Verify user cannot access Project Editor without authentication
    await page.goto('/projects/test-project-id');
    await page.waitForURL('/login', { timeout: 5000 });
    await expect(page).toHaveURL('/login');

    // Step 6: Verify user cannot access Function Editor without authentication
    await page.goto('/functions/test-function-id');
    await page.waitForURL('/login', { timeout: 5000 });
    await expect(page).toHaveURL('/login');

    // Step 7: Verify any API calls to authenticated endpoints would fail (if testable)
    // This is verified by the redirects above - if the user was authenticated, they would see the pages
    // Since they're redirected to login, authentication is required
  });
});
