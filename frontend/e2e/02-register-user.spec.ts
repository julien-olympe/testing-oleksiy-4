import { test, expect } from '@playwright/test';

test.describe('Register User - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login screen
    await page.goto('/');
    // Wait for login screen to be visible
    await expect(page.locator('h1:has-text("Visual Programming Application")')).toBeVisible();
  });

  test('REG-001: Register User - Positive Case', async ({ page }) => {
    // Step 1: Navigate to Login Screen (already done in beforeEach)
    // Step 2: Verify Login Screen is displayed
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Login")')).toBeVisible();
    await expect(page.locator('button:has-text("Register")').or(page.locator('button:has-text("Don\'t have an account? Register")'))).toBeVisible();

    // Step 3: Click Register button
    const registerButton = page.locator('button:has-text("Don\'t have an account? Register")');
    await registerButton.click();

    // Step 4: Verify registration form is displayed
    await expect(page.locator('button:has-text("Register")')).toBeVisible();

    // Step 5: Enter email
    await page.fill('input[id="email"]', 'newuser@example.com');

    // Step 6: Enter password
    await page.fill('input[id="password"]', 'SecurePass123!');

    // Step 7: Complete any additional required registration fields (none in this case)

    // Step 8: Submit registration form
    await page.click('button:has-text("Register")');

    // Step 9: Verify registration is successful (user should be redirected)
    await expect(page).toHaveURL(/\/home/);

    // Step 10: Verify user is automatically logged in (on home screen)
    await expect(page.locator('h1:has-text("Home")')).toBeVisible();

    // Step 11: Verify user is redirected to Home Screen (already verified above)

    // Step 12: Verify Home Screen displays empty project list
    // The project grid should be visible, and if empty, it should show no projects
    const projectGrid = page.locator('.project-grid');
    await expect(projectGrid).toBeVisible();
    // Check that there are no project cards (empty list)
    const projectCards = page.locator('.project-card');
    await expect(projectCards).toHaveCount(0);

    // Step 13: Verify no error messages are displayed
    const errorNotification = page.locator('.error-notification, [class*="error"]');
    await expect(errorNotification).not.toBeVisible();
  });

  test('REG-002: Register User - Negative Case - Email Already Registered', async ({ page }) => {
    // Precondition: Create a user with existinguser@example.com first
    // Click Register button
    await page.click('button:has-text("Don\'t have an account? Register")');
    await page.fill('input[id="email"]', 'existinguser@example.com');
    await page.fill('input[id="password"]', 'SecurePass123!');
    await page.click('button:has-text("Register")');
    // Wait for registration to complete
    await expect(page).toHaveURL(/\/home/, { timeout: 10000 });
    
    // Logout
    await page.goto('/');
    // Clear any auth state
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();

    // Now test the duplicate registration
    // Step 1: Navigate to Login Screen
    await expect(page.locator('h1:has-text("Visual Programming Application")')).toBeVisible();

    // Step 2: Verify Login Screen is displayed
    await expect(page.locator('input[id="email"]')).toBeVisible();

    // Step 3: Click Register button
    await page.click('button:has-text("Don\'t have an account? Register")');

    // Step 4: Verify registration form is displayed
    await expect(page.locator('button:has-text("Register")')).toBeVisible();

    // Step 5: Enter existing email
    await page.fill('input[id="email"]', 'existinguser@example.com');

    // Step 6: Enter password
    await page.fill('input[id="password"]', 'SecurePass123!');

    // Step 7: Complete any additional required registration fields (none)

    // Step 8: Submit registration form
    await page.click('button:has-text("Register")');

    // Step 9: Verify registration fails
    // Wait for error message
    await page.waitForTimeout(1000);

    // Step 10: Verify error message "Email already registered" is displayed
    const errorMessage = page.locator('text=/Email already registered/i');
    await expect(errorMessage).toBeVisible();

    // Step 11: Verify user remains on registration form
    await expect(page.locator('button:has-text("Register")')).toBeVisible();
    await expect(page).not.toHaveURL(/\/home/);

    // Step 12: Verify user is not logged in
    // Should still be on login/register screen
    await expect(page.locator('h1:has-text("Visual Programming Application")')).toBeVisible();

    // Step 13: Verify user is not redirected to Home Screen
    await expect(page).not.toHaveURL(/\/home/);
  });

  test('REG-003: Register User - Negative Case - Invalid Email Format', async ({ page }) => {
    // Step 1: Navigate to Login Screen (already done in beforeEach)
    // Step 2: Verify Login Screen is displayed
    await expect(page.locator('input[id="email"]')).toBeVisible();

    // Step 3: Click Register button
    await page.click('button:has-text("Don\'t have an account? Register")');

    // Step 4: Verify registration form is displayed
    await expect(page.locator('button:has-text("Register")')).toBeVisible();

    // Step 5: Enter invalid email
    await page.fill('input[id="email"]', 'invalid-email');

    // Step 6: Enter password
    await page.fill('input[id="password"]', 'SecurePass123!');

    // Step 7: Complete any additional required registration fields (none)

    // Step 8: Submit registration form
    await page.click('button:has-text("Register")');

    // Step 9: Verify registration fails
    await page.waitForTimeout(1000);

    // Step 10: Verify error message "Invalid email format" is displayed
    const errorMessage = page.locator('text=/Invalid email format/i');
    await expect(errorMessage).toBeVisible();

    // Step 11: Verify user remains on registration form
    await expect(page.locator('button:has-text("Register")')).toBeVisible();

    // Step 12: Verify user is not logged in
    await expect(page.locator('h1:has-text("Visual Programming Application")')).toBeVisible();

    // Step 13: Verify user is not redirected to Home Screen
    await expect(page).not.toHaveURL(/\/home/);
  });

  test('REG-004: Register User - Negative Case - Password Does Not Meet Requirements', async ({ page }) => {
    // Step 1: Navigate to Login Screen (already done in beforeEach)
    // Step 2: Verify Login Screen is displayed
    await expect(page.locator('input[id="email"]')).toBeVisible();

    // Step 3: Click Register button
    await page.click('button:has-text("Don\'t have an account? Register")');

    // Step 4: Verify registration form is displayed
    await expect(page.locator('button:has-text("Register")')).toBeVisible();

    // Step 5: Enter email
    await page.fill('input[id="email"]', 'newuser2@example.com');

    // Step 6: Enter weak password
    await page.fill('input[id="password"]', 'weak');

    // Step 7: Complete any additional required registration fields (none)

    // Step 8: Submit registration form
    await page.click('button:has-text("Register")');

    // Step 9: Verify registration fails
    await page.waitForTimeout(1000);

    // Step 10: Verify error message "Password does not meet requirements" is displayed
    const errorMessage = page.locator('text=/Password does not meet requirements/i');
    await expect(errorMessage).toBeVisible();

    // Step 11: Verify user remains on registration form
    await expect(page.locator('button:has-text("Register")')).toBeVisible();

    // Step 12: Verify user is not logged in
    await expect(page.locator('h1:has-text("Visual Programming Application")')).toBeVisible();

    // Step 13: Verify user is not redirected to Home Screen
    await expect(page).not.toHaveURL(/\/home/);
  });

  test('REG-005: Register User - Negative Case - Empty Email Field', async ({ page }) => {
    // Step 1: Navigate to Login Screen (already done in beforeEach)
    // Step 2: Verify Login Screen is displayed
    await expect(page.locator('input[id="email"]')).toBeVisible();

    // Step 3: Click Register button
    await page.click('button:has-text("Don\'t have an account? Register")');

    // Step 4: Verify registration form is displayed
    await expect(page.locator('button:has-text("Register")')).toBeVisible();

    // Step 5: Leave email input field empty
    await page.fill('input[id="email"]', '');

    // Step 6: Enter password
    await page.fill('input[id="password"]', 'SecurePass123!');

    // Step 7: Complete any additional required registration fields (none)

    // Step 8: Attempt to submit registration form
    // HTML5 validation should prevent submission, but try clicking anyway
    await page.click('button:has-text("Register")');

    // Step 9: Verify form validation prevents submission OR registration fails with appropriate error
    // HTML5 validation might show a browser tooltip, or we might get an error message
    await page.waitForTimeout(500);

    // Step 10: Verify error message is displayed indicating email is required or invalid
    // Check for either HTML5 validation (which might not be visible to Playwright) or error message
    const emailInput = page.locator('input[id="email"]');
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBe(true);

    // Also check for any error messages
    const errorMessage = page.locator('text=/email.*required|email.*invalid/i');
    const hasErrorMessage = await errorMessage.isVisible().catch(() => false);
    if (hasErrorMessage) {
      await expect(errorMessage).toBeVisible();
    }

    // Step 11: Verify user remains on registration form
    await expect(page.locator('button:has-text("Register")')).toBeVisible();

    // Step 12: Verify user is not logged in
    await expect(page.locator('h1:has-text("Visual Programming Application")')).toBeVisible();
  });

  test('REG-006: Register User - Negative Case - Empty Password Field', async ({ page }) => {
    // Step 1: Navigate to Login Screen (already done in beforeEach)
    // Step 2: Verify Login Screen is displayed
    await expect(page.locator('input[id="email"]')).toBeVisible();

    // Step 3: Click Register button
    await page.click('button:has-text("Don\'t have an account? Register")');

    // Step 4: Verify registration form is displayed
    await expect(page.locator('button:has-text("Register")')).toBeVisible();

    // Step 5: Enter email
    await page.fill('input[id="email"]', 'newuser3@example.com');

    // Step 6: Leave password input field empty
    await page.fill('input[id="password"]', '');

    // Step 7: Complete any additional required registration fields (none)

    // Step 8: Attempt to submit registration form
    await page.click('button:has-text("Register")');

    // Step 9: Verify form validation prevents submission OR registration fails with appropriate error
    await page.waitForTimeout(500);

    // Step 10: Verify error message is displayed indicating password is required
    const passwordInput = page.locator('input[id="password"]');
    const isInvalid = await passwordInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBe(true);

    // Also check for any error messages
    const errorMessage = page.locator('text=/password.*required/i');
    const hasErrorMessage = await errorMessage.isVisible().catch(() => false);
    if (hasErrorMessage) {
      await expect(errorMessage).toBeVisible();
    }

    // Step 11: Verify user remains on registration form
    await expect(page.locator('button:has-text("Register")')).toBeVisible();

    // Step 12: Verify user is not logged in
    await expect(page.locator('h1:has-text("Visual Programming Application")')).toBeVisible();
  });
});
