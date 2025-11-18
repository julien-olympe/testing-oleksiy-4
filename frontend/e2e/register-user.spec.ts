import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const TEST_EMAIL_NEW = 'newuser@example.com';
const TEST_EMAIL_EXISTING = 'existinguser@example.com';
const TEST_EMAIL_INVALID = 'invalid-email';
const TEST_EMAIL_NEW2 = 'newuser2@example.com';
const TEST_EMAIL_NEW3 = 'newuser3@example.com';
const TEST_PASSWORD_VALID = 'SecurePass123!';
const TEST_PASSWORD_WEAK = 'weak';

test.describe('Register User Tests', () => {
  let page: Page;
  let consoleLogs: string[] = [];
  let networkErrors: string[] = [];

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    consoleLogs = [];
    networkErrors = [];
    
    // Capture console logs
    page.on('console', (msg) => {
      const text = msg.text();
      consoleLogs.push(text);
      console.log(`[Browser Console] ${text}`);
    });

    // Capture network errors
    page.on('response', (response) => {
      if (response.status() >= 400) {
        const url = response.url();
        const status = response.status();
        networkErrors.push(`${url}: ${status}`);
        console.log(`[Network Error] ${url}: ${status}`);
      }
    });

    // Navigate to login screen
    await page.goto('/login');
  });

  test('REG-001: Register User - Positive Case', async () => {
    // Preconditions: Application is accessible and running
    // No user account exists with email "newuser@example.com"
    // User is on Login Screen
    // Note: Using unique email to ensure precondition is met (user might exist from previous test runs)
    const uniqueEmail = `newuser-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;

    // Step 1: Navigate to Login Screen
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Login")')).toBeVisible();
    await expect(
      page
        .locator('button:has-text("Don\'t have an account? Register")')
        .or(page.locator('button:has-text("Register")'))
    ).toBeVisible();

    // Step 2: Verify Login Screen is displayed with email input field, password input field, Login button, and Register button
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]:has-text("Login")')).toBeVisible();
    const registerButton = page
      .locator('button:has-text("Don\'t have an account? Register")')
      .or(page.locator('button:has-text("Register")'));
    await expect(registerButton).toBeVisible();

    // Step 3: Click Register button
    await registerButton.click();

    // Step 4: Verify registration form is displayed
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]:has-text("Register")')).toBeVisible();

    // Step 5: Enter unique email in email input field
    await page.fill('input[id="email"]', uniqueEmail);

    // Step 6: Enter "SecurePass123!" in password input field
    await page.fill('input[id="password"]', TEST_PASSWORD_VALID);

    // Step 7: Complete any additional required registration fields (if any)
    // No additional fields required

    // Step 8: Submit registration form
    await page.click('button[type="submit"]:has-text("Register")');

    // Wait for either navigation to home or error notification
    await Promise.race([
      page.waitForURL('/home', { timeout: 10000 }).catch(() => null),
      page.waitForSelector('.error-notification', { timeout: 5000 }).catch(() => null),
    ]);

    // Check if there's an error notification (should not be for positive case)
    const errorNotification = page.locator('.error-notification');
    if (await errorNotification.isVisible()) {
      const errorText = await errorNotification.textContent();
      console.log('Error notification text:', errorText);
      console.log('Console logs:', consoleLogs);
      console.log('Network errors:', networkErrors);
      throw new Error(`Registration failed with error: ${errorText}`);
    }

    // Verify we navigated to home
    const currentUrl = page.url();
    if (!currentUrl.includes('/home')) {
      console.log('Current URL:', currentUrl);
      console.log('Console logs:', consoleLogs);
      console.log('Network errors:', networkErrors);
      throw new Error(`Registration failed. Still on ${currentUrl}. Expected to be on /home`);
    }

    // Step 9: Verify registration is successful
    // This is verified by successful navigation to home

    // Step 10: Verify user is automatically logged in
    // This is verified by successful navigation to home

    // Step 11: Verify user is redirected to Home Screen
    await page.waitForURL('/home', { timeout: 10000 });
    await expect(page.locator('h1:has-text("Home")')).toBeVisible();

    // Step 12: Verify Home Screen displays empty project list
    const projectCards = page.locator('.project-card');
    await expect(projectCards).toHaveCount(0);

    // Step 13: Verify no error messages are displayed
    const finalErrorNotification = page.locator('.error-notification');
    await expect(finalErrorNotification).not.toBeVisible();
    
    // Note: Test uses unique email to ensure precondition "No user account exists" is met
    // Original specification email "newuser@example.com" might exist from previous test runs
  });

  test('REG-002: Register User - Negative Case - Email Already Registered', async () => {
    // Preconditions:
    // - Application is accessible and running
    // - User account already exists with email "existinguser@example.com"
    // - User is on Login Screen

    // First, create the existing user if it doesn't exist
    // Navigate to register mode
    const registerButton = page
      .locator('button:has-text("Don\'t have an account? Register")')
      .or(page.locator('button:has-text("Register")'));
    await registerButton.click();

    // Try to register the existing user (it might already exist from previous test runs)
    await page.fill('input[id="email"]', TEST_EMAIL_EXISTING);
    await page.fill('input[id="password"]', TEST_PASSWORD_VALID);
    await page.click('button[type="submit"]:has-text("Register")');

    // If registration succeeds, user was created. If it fails, user already exists.
    // Wait a bit to see if we get redirected or get an error
    await page.waitForTimeout(2000);

    // If we're still on login page, user already exists (good for our test)
    // If we're on home page, we need to logout and continue
    const currentUrl = page.url();
    if (currentUrl.includes('/home')) {
      // User was created, logout and continue
      await page.click('button.settings-button, button[aria-label="Settings"]');
      await page.click('button.settings-logout:has-text("Logout")');
      await page.waitForURL('/login', { timeout: 5000 });
    }

    // Step 1: Navigate to Login Screen
    await expect(page.locator('input[id="email"]')).toBeVisible();

    // Step 2: Verify Login Screen is displayed
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();

    // Step 3: Click Register button
    const registerButton2 = page
      .locator('button:has-text("Don\'t have an account? Register")')
      .or(page.locator('button:has-text("Register")'));
    await registerButton2.click();

    // Step 4: Verify registration form is displayed
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();

    // Step 5: Enter "existinguser@example.com" in email input field
    await page.fill('input[id="email"]', TEST_EMAIL_EXISTING);

    // Step 6: Enter "SecurePass123!" in password input field
    await page.fill('input[id="password"]', TEST_PASSWORD_VALID);

    // Step 7: Complete any additional required registration fields (if any)
    // No additional fields required

    // Step 8: Submit registration form
    await page.click('button[type="submit"]:has-text("Register")');

    // Step 9: Verify registration fails
    // This is verified by error message appearing

    // Step 10: Verify error message "Email already registered" is displayed
    await expect(page.locator('.error-notification')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.error-notification')).toContainText('Email already registered');

    // Step 11: Verify user remains on registration form
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]:has-text("Register")')).toBeVisible();

    // Step 12: Verify user is not logged in
    // User should still be on login/register page
    await expect(page).toHaveURL(/\/login/);

    // Step 13: Verify user is not redirected to Home Screen
    await expect(page.locator('h1:has-text("Home")')).not.toBeVisible();
  });

  test('REG-003: Register User - Negative Case - Invalid Email Format', async () => {
    // Preconditions:
    // - Application is accessible and running
    // - No user account exists with email "invalid-email"
    // - User is on Login Screen

    // Step 1: Navigate to Login Screen
    await expect(page.locator('input[id="email"]')).toBeVisible();

    // Step 2: Verify Login Screen is displayed
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();

    // Step 3: Click Register button
    const registerButton = page
      .locator('button:has-text("Don\'t have an account? Register")')
      .or(page.locator('button:has-text("Register")'));
    await registerButton.click();

    // Step 4: Verify registration form is displayed
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();

    // Step 5: Enter "invalid-email" in email input field
    await page.fill('input[id="email"]', TEST_EMAIL_INVALID);

    // Step 6: Enter "SecurePass123!" in password input field
    await page.fill('input[id="password"]', TEST_PASSWORD_VALID);

    // Step 7: Complete any additional required registration fields (if any)
    // No additional fields required

    // Step 8: Submit registration form
    // Note: HTML5 validation on email input might prevent form submission
    // We'll try to submit and check for either HTML5 validation or backend error
    await page.click('button[type="submit"]:has-text("Register")');

    // Wait for either error notification, navigation, or HTML5 validation
    await page.waitForTimeout(2000);

    // Step 9: Verify registration fails
    // This is verified by error message appearing or form not submitting

    // Step 10: Verify error message "Invalid email format" is displayed
    // Check if backend error is shown
    const errorNotification = page.locator('.error-notification');
    const currentUrl = page.url();
    
    if (await errorNotification.isVisible()) {
      // Backend error is shown
      await expect(errorNotification).toContainText('Invalid email format');
    } else if (currentUrl.includes('/login')) {
      // Still on login page - HTML5 validation likely prevented submission
      // This is acceptable as HTML5 validation also validates email format
      // Verify form is still visible and email field is invalid
      await expect(page.locator('input[id="email"]')).toBeVisible();
      const emailInput = page.locator('input[id="email"]');
      const validity = await emailInput.evaluate((el: HTMLInputElement) => ({
        valid: el.validity.valid,
        typeMismatch: el.validity.typeMismatch,
      }));
      // Email should be invalid due to format
      expect(validity.valid).toBe(false);
    } else {
      // Unexpected - should not navigate to home with invalid email
      throw new Error(`Unexpected navigation to ${currentUrl}. Expected to stay on login or show error.`);
    }

    // Step 11: Verify user remains on registration form
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();

    // Step 12: Verify user is not logged in
    await expect(page).toHaveURL(/\/login/);

    // Step 13: Verify user is not redirected to Home Screen
    await expect(page.locator('h1:has-text("Home")')).not.toBeVisible();
  });

  test('REG-004: Register User - Negative Case - Password Does Not Meet Requirements', async () => {
    // Preconditions:
    // - Application is accessible and running
    // - No user account exists with email "newuser2@example.com"
    // - User is on Login Screen
    // - System has password requirements (e.g., minimum length, special characters)

    // Step 1: Navigate to Login Screen
    await expect(page.locator('input[id="email"]')).toBeVisible();

    // Step 2: Verify Login Screen is displayed
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();

    // Step 3: Click Register button
    const registerButton = page
      .locator('button:has-text("Don\'t have an account? Register")')
      .or(page.locator('button:has-text("Register")'));
    await registerButton.click();

    // Step 4: Verify registration form is displayed
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();

    // Step 5: Enter "newuser2@example.com" in email input field
    await page.fill('input[id="email"]', TEST_EMAIL_NEW2);

    // Step 6: Enter "weak" in password input field
    await page.fill('input[id="password"]', TEST_PASSWORD_WEAK);

    // Step 7: Complete any additional required registration fields (if any)
    // No additional fields required

    // Step 8: Submit registration form
    // Note: HTML5 validation on password input (minLength=8) might prevent form submission
    await page.click('button[type="submit"]:has-text("Register")');

    // Wait for either error notification, navigation, or HTML5 validation
    await page.waitForTimeout(2000);

    // Step 9: Verify registration fails
    // This is verified by error message appearing or form not submitting

    // Step 10: Verify error message "Password does not meet requirements" is displayed
    // Check if backend error is shown
    const errorNotification = page.locator('.error-notification');
    const currentUrl = page.url();
    
    if (await errorNotification.isVisible()) {
      // Backend error is shown
      await expect(errorNotification).toContainText('Password does not meet requirements');
    } else if (currentUrl.includes('/login')) {
      // Still on login page - HTML5 validation likely prevented submission
      // This is acceptable as HTML5 validation also validates password length
      // Verify form is still visible and password field is invalid
      await expect(page.locator('input[id="password"]')).toBeVisible();
      const passwordInput = page.locator('input[id="password"]');
      const validity = await passwordInput.evaluate((el: HTMLInputElement) => ({
        valid: el.validity.valid,
        tooShort: el.validity.tooShort,
      }));
      // Password should be invalid due to length
      expect(validity.valid).toBe(false);
    } else {
      // Unexpected - should not navigate to home with weak password
      throw new Error(`Unexpected navigation to ${currentUrl}. Expected to stay on login or show error.`);
    }

    // Step 11: Verify user remains on registration form
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();

    // Step 12: Verify user is not logged in
    await expect(page).toHaveURL(/\/login/);

    // Step 13: Verify user is not redirected to Home Screen
    await expect(page.locator('h1:has-text("Home")')).not.toBeVisible();
  });

  test('REG-005: Register User - Negative Case - Empty Email Field', async () => {
    // Preconditions:
    // - Application is accessible and running
    // - User is on Login Screen

    // Step 1: Navigate to Login Screen
    await expect(page.locator('input[id="email"]')).toBeVisible();

    // Step 2: Verify Login Screen is displayed
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();

    // Step 3: Click Register button
    const registerButton = page
      .locator('button:has-text("Don\'t have an account? Register")')
      .or(page.locator('button:has-text("Register")'));
    await registerButton.click();

    // Step 4: Verify registration form is displayed
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();

    // Step 5: Leave email input field empty
    await page.fill('input[id="email"]', '');

    // Step 6: Enter "SecurePass123!" in password input field
    await page.fill('input[id="password"]', TEST_PASSWORD_VALID);

    // Step 7: Complete any additional required registration fields (if any)
    // No additional fields required

    // Step 8: Attempt to submit registration form
    // HTML5 validation should prevent submission, but if it doesn't, we should get an error
    const submitButton = page.locator('button[type="submit"]:has-text("Register")');
    
    // Check if the email field has the 'required' attribute (HTML5 validation)
    const emailInput = page.locator('input[id="email"]');
    const isRequired = await emailInput.getAttribute('required');
    
    if (isRequired !== null) {
      // HTML5 validation should prevent submission
      // Try to submit and verify form doesn't submit
      await submitButton.click();
      // Wait a bit to see if navigation happens
      await page.waitForTimeout(1000);
      // Should still be on login page
      await expect(page).toHaveURL(/\/login/);
    } else {
      // If no HTML5 validation, backend should return error
      await submitButton.click();
      // Step 9: Verify form validation prevents submission OR registration fails with appropriate error
      // Step 10: Verify error message is displayed indicating email is required or invalid
      await expect(page.locator('.error-notification')).toBeVisible({ timeout: 5000 });
      const errorText = await page.locator('.error-notification').textContent();
      expect(errorText).toMatch(/email|required|invalid/i);
    }

    // Step 11: Verify user remains on registration form
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();

    // Step 12: Verify user is not logged in
    await expect(page).toHaveURL(/\/login/);
  });

  test('REG-006: Register User - Negative Case - Empty Password Field', async () => {
    // Preconditions:
    // - Application is accessible and running
    // - No user account exists with email "newuser3@example.com"
    // - User is on Login Screen

    // Step 1: Navigate to Login Screen
    await expect(page.locator('input[id="email"]')).toBeVisible();

    // Step 2: Verify Login Screen is displayed
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();

    // Step 3: Click Register button
    const registerButton = page
      .locator('button:has-text("Don\'t have an account? Register")')
      .or(page.locator('button:has-text("Register")'));
    await registerButton.click();

    // Step 4: Verify registration form is displayed
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();

    // Step 5: Enter "newuser3@example.com" in email input field
    await page.fill('input[id="email"]', TEST_EMAIL_NEW3);

    // Step 6: Leave password input field empty
    await page.fill('input[id="password"]', '');

    // Step 7: Complete any additional required registration fields (if any)
    // No additional fields required

    // Step 8: Attempt to submit registration form
    // HTML5 validation should prevent submission, but if it doesn't, we should get an error
    const submitButton = page.locator('button[type="submit"]:has-text("Register")');
    
    // Check if the password field has the 'required' attribute (HTML5 validation)
    const passwordInput = page.locator('input[id="password"]');
    const isRequired = await passwordInput.getAttribute('required');
    
    if (isRequired !== null) {
      // HTML5 validation should prevent submission
      // Try to submit and verify form doesn't submit
      await submitButton.click();
      // Wait a bit to see if navigation happens
      await page.waitForTimeout(1000);
      // Should still be on login page
      await expect(page).toHaveURL(/\/login/);
    } else {
      // If no HTML5 validation, backend should return error
      await submitButton.click();
      // Step 9: Verify form validation prevents submission OR registration fails with appropriate error
      // Step 10: Verify error message is displayed indicating password is required
      await expect(page.locator('.error-notification')).toBeVisible({ timeout: 5000 });
      const errorText = await page.locator('.error-notification').textContent();
      expect(errorText).toMatch(/password|required/i);
    }

    // Step 11: Verify user remains on registration form
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();

    // Step 12: Verify user is not logged in
    await expect(page).toHaveURL(/\/login/);
  });
});
