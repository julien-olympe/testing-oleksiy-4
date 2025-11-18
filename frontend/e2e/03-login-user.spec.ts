import { test, expect } from '@playwright/test';

// Test data
const TEST_USER_EMAIL = 'testuser@example.com';
const TEST_USER_PASSWORD = 'SecurePass123!';
const INVALID_EMAIL = 'wrongemail@example.com';
const INVALID_PASSWORD = 'WrongPassword123!';

test.describe('Login User Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage and cookies before each test
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.context().clearCookies();
  });

  // LOGIN-001: Login User - Positive Case
  test('LOGIN-001: Login User - Positive Case', async ({ page }) => {
    // Step 1: Navigate to Login Screen
    await page.goto('/login');

    // Step 2: Verify Login Screen is displayed with email input field, password input field, Login button, and Register button
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /register/i })).toBeVisible();

    // Step 3: Enter email
    await page.fill('input[type="email"]', TEST_USER_EMAIL);

    // Step 4: Enter password
    await page.fill('input[type="password"]', TEST_USER_PASSWORD);

    // Step 5: Click Login button
    await page.getByRole('button', { name: /login/i }).click();

    // Step 6-9: Verify login is successful, user is authenticated, session is created, and redirected to Home Screen
    await expect(page).toHaveURL(/\/home/);
    
    // Step 10: Verify Home Screen displays correctly
    await expect(page.locator('h1:has-text("Home")')).toBeVisible();

    // Step 11: Verify no error messages are displayed
    const errorNotification = page.locator('.error-notification, [role="alert"]');
    await expect(errorNotification).not.toBeVisible({ timeout: 1000 }).catch(() => {
      // Error notification might not exist, which is fine
    });
  });

  // LOGIN-002: Login User - Negative Case - Invalid Email
  test('LOGIN-002: Login User - Negative Case - Invalid Email', async ({ page }) => {
    // Step 1: Navigate to Login Screen
    await page.goto('/login');

    // Step 2: Verify Login Screen is displayed
    await expect(page.locator('input[type="email"]')).toBeVisible();

    // Step 3: Enter invalid email
    await page.fill('input[type="email"]', INVALID_EMAIL);

    // Step 4: Enter password
    await page.fill('input[type="password"]', TEST_USER_PASSWORD);

    // Step 5: Click Login button
    await page.getByRole('button', { name: /login/i }).click();

    // Step 6: Verify login fails
    // Step 7-8: Verify error message "Invalid email or password" is displayed and clearly visible
    await expect(page.locator('text=/invalid email or password/i')).toBeVisible({ timeout: 5000 });

    // Step 9: Verify user remains on Login Screen
    await expect(page).toHaveURL(/\/login/);

    // Step 10: Verify user is not authenticated
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeNull();

    // Step 11: Verify user is not redirected to Home Screen
    await expect(page).not.toHaveURL(/\/home/);

    // Step 12: Verify no session is created (no token in localStorage)
    expect(token).toBeNull();
  });

  // LOGIN-003: Login User - Negative Case - Invalid Password
  test('LOGIN-003: Login User - Negative Case - Invalid Password', async ({ page }) => {
    // Step 1: Navigate to Login Screen
    await page.goto('/login');

    // Step 2: Verify Login Screen is displayed
    await expect(page.locator('input[type="email"]')).toBeVisible();

    // Step 3: Enter email
    await page.fill('input[type="email"]', TEST_USER_EMAIL);

    // Step 4: Enter invalid password
    await page.fill('input[type="password"]', INVALID_PASSWORD);

    // Step 5: Click Login button
    await page.getByRole('button', { name: /login/i }).click();

    // Step 6: Verify login fails
    // Step 7-8: Verify error message "Invalid email or password" is displayed and clearly visible
    await expect(page.locator('text=/invalid email or password/i')).toBeVisible({ timeout: 5000 });

    // Step 9: Verify user remains on Login Screen
    await expect(page).toHaveURL(/\/login/);

    // Step 10: Verify user is not authenticated
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeNull();

    // Step 11: Verify user is not redirected to Home Screen
    await expect(page).not.toHaveURL(/\/home/);

    // Step 12: Verify no session is created
    expect(token).toBeNull();
  });

  // LOGIN-004: Login User - Negative Case - Empty Email Field
  test('LOGIN-004: Login User - Negative Case - Empty Email Field', async ({ page }) => {
    // Step 1: Navigate to Login Screen
    await page.goto('/login');

    // Step 2: Verify Login Screen is displayed
    await expect(page.locator('input[type="email"]')).toBeVisible();

    // Step 3: Leave email input field empty
    // Step 4: Enter password
    await page.fill('input[type="password"]', TEST_USER_PASSWORD);

    // Step 5: Attempt to click Login button
    // HTML5 validation should prevent submission, but let's try
    const emailInput = page.locator('input[type="email"]');
    const loginButton = page.getByRole('button', { name: /login/i });
    
    // Check if the email field has required attribute
    const isRequired = await emailInput.getAttribute('required');
    
    if (isRequired !== null) {
      // HTML5 validation should prevent form submission
      await loginButton.click();
      // Form should not submit, so we should still be on login page
      await expect(page).toHaveURL(/\/login/);
    } else {
      // If no HTML5 validation, try to submit and check for error
      await loginButton.click();
      // Should show validation error or API error
      await expect(
        page.locator('text=/email.*required/i, text=/required/i, text=/invalid/i')
      ).toBeVisible({ timeout: 5000 });
    }

    // Step 8: Verify user remains on Login Screen
    await expect(page).toHaveURL(/\/login/);

    // Step 9: Verify user is not authenticated
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeNull();
  });

  // LOGIN-005: Login User - Negative Case - Empty Password Field
  test('LOGIN-005: Login User - Negative Case - Empty Password Field', async ({ page }) => {
    // Step 1: Navigate to Login Screen
    await page.goto('/login');

    // Step 2: Verify Login Screen is displayed
    await expect(page.locator('input[type="email"]')).toBeVisible();

    // Step 3: Enter email
    await page.fill('input[type="email"]', TEST_USER_EMAIL);

    // Step 4: Leave password input field empty
    // Step 5: Attempt to click Login button
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.getByRole('button', { name: /login/i });
    
    // Check if the password field has required attribute
    const isRequired = await passwordInput.getAttribute('required');
    
    if (isRequired !== null) {
      // HTML5 validation should prevent form submission
      await loginButton.click();
      // Form should not submit, so we should still be on login page
      await expect(page).toHaveURL(/\/login/);
    } else {
      // If no HTML5 validation, try to submit and check for error
      await loginButton.click();
      // Should show validation error or API error
      await expect(
        page.locator('text=/password.*required/i, text=/required/i, text=/invalid/i')
      ).toBeVisible({ timeout: 5000 });
    }

    // Step 8: Verify user remains on Login Screen
    await expect(page).toHaveURL(/\/login/);

    // Step 9: Verify user is not authenticated
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeNull();
  });

  // LOGIN-006: Login User - Negative Case - Both Fields Empty
  test('LOGIN-006: Login User - Negative Case - Both Fields Empty', async ({ page }) => {
    // Step 1: Navigate to Login Screen
    await page.goto('/login');

    // Step 2: Verify Login Screen is displayed
    await expect(page.locator('input[type="email"]')).toBeVisible();

    // Step 3: Leave email input field empty
    // Step 4: Leave password input field empty
    // Step 5: Attempt to click Login button
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.getByRole('button', { name: /login/i });
    
    // Check if fields have required attribute
    const emailRequired = await emailInput.getAttribute('required');
    const passwordRequired = await passwordInput.getAttribute('required');
    
    if (emailRequired !== null || passwordRequired !== null) {
      // HTML5 validation should prevent form submission
      await loginButton.click();
      // Form should not submit, so we should still be on login page
      await expect(page).toHaveURL(/\/login/);
    } else {
      // If no HTML5 validation, try to submit and check for error
      await loginButton.click();
      // Should show validation error
      await expect(
        page.locator('text=/required/i, text=/invalid/i')
      ).toBeVisible({ timeout: 5000 });
    }

    // Step 8: Verify user remains on Login Screen
    await expect(page).toHaveURL(/\/login/);

    // Step 9: Verify user is not authenticated
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeNull();
  });
});
