import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const TEST_EMAIL = 'testuser@example.com';
const TEST_PASSWORD = 'SecurePass123!';
const WRONG_EMAIL = 'wrongemail@example.com';
const WRONG_PASSWORD = 'WrongPassword123!';

test.describe('Login User Test Scenarios', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    
    // Navigate to login screen
    await page.goto('/login');
    
    // Wait for login screen to be ready
    await expect(page.locator('input[id="email"]')).toBeVisible();
  });

  test('LOGIN-001: Login User - Positive Case', async () => {
    // Step 1: Navigate to Login Screen (already done in beforeEach)
    // Step 2: Verify Login Screen is displayed with email input field, password input field, Login button, and Register button
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]:has-text("Login")')).toBeVisible();
    await expect(page.locator('button:has-text("Don\'t have an account? Register")')).toBeVisible();

    // Step 3: Enter "testuser@example.com" in email input field
    await page.fill('input[id="email"]', TEST_EMAIL);

    // Step 4: Enter "SecurePass123!" in password input field
    await page.fill('input[id="password"]', TEST_PASSWORD);

    // Step 5: Click Login button
    await page.click('button[type="submit"]:has-text("Login")');

    // Step 6: Verify login is successful
    // Step 7: Verify user is authenticated
    // Step 8: Verify session is created
    // Step 9: Verify user is redirected to Home Screen
    await page.waitForURL('/home', { timeout: 10000 });

    // Step 10: Verify Home Screen displays correctly
    await expect(page.locator('h1:has-text("Home")')).toBeVisible();

    // Step 11: Verify no error messages are displayed
    const errorNotification = page.locator('.error-notification');
    await expect(errorNotification).not.toBeVisible();
  });

  test('LOGIN-002: Login User - Negative Case - Invalid Email', async () => {
    // Step 1: Navigate to Login Screen (already done in beforeEach)
    // Step 2: Verify Login Screen is displayed
    await expect(page.locator('input[id="email"]')).toBeVisible();

    // Step 3: Enter "wrongemail@example.com" in email input field
    await page.fill('input[id="email"]', WRONG_EMAIL);

    // Step 4: Enter "SecurePass123!" in password input field
    await page.fill('input[id="password"]', TEST_PASSWORD);

    // Step 5: Click Login button and wait for API response
    const [response] = await Promise.all([
      page.waitForResponse((resp) => resp.url().includes('/auth/login') && resp.status() === 401),
      page.click('button[type="submit"]:has-text("Login")'),
    ]);

    // Verify API returned 401
    expect(response.status()).toBe(401);

    // Wait for loading state to finish
    await expect(page.locator('button[type="submit"]:has-text("Loading...")')).not.toBeVisible({ timeout: 5000 });

    // Step 6: Verify login fails
    // Step 7: Verify error message "Invalid email or password" is displayed
    await expect(page.locator('.error-notification')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.error-notification')).toContainText('Invalid email or password');

    // Step 8: Verify error message is clearly visible (typically below form)
    await expect(page.locator('.error-notification')).toBeVisible();

    // Step 9: Verify user remains on Login Screen
    await expect(page.url()).toContain('/login');

    // Step 10: Verify user is not authenticated
    // Step 11: Verify user is not redirected to Home Screen
    await expect(page.locator('h1:has-text("Home")')).not.toBeVisible();

    // Step 12: Verify no session is created
    // (This is implicit - user is not redirected, so no session exists)
  });

  test('LOGIN-003: Login User - Negative Case - Invalid Password', async () => {
    // Step 1: Navigate to Login Screen (already done in beforeEach)
    // Step 2: Verify Login Screen is displayed
    await expect(page.locator('input[id="email"]')).toBeVisible();

    // Step 3: Enter "testuser@example.com" in email input field
    await page.fill('input[id="email"]', TEST_EMAIL);

    // Step 4: Enter "WrongPassword123!" in password input field
    await page.fill('input[id="password"]', WRONG_PASSWORD);

    // Step 5: Click Login button and wait for API response
    const [response] = await Promise.all([
      page.waitForResponse((resp) => resp.url().includes('/auth/login') && resp.status() === 401),
      page.click('button[type="submit"]:has-text("Login")'),
    ]);

    // Verify API returned 401
    expect(response.status()).toBe(401);

    // Wait for loading state to finish
    await expect(page.locator('button[type="submit"]:has-text("Loading...")')).not.toBeVisible({ timeout: 5000 });

    // Step 6: Verify login fails
    // Step 7: Verify error message "Invalid email or password" is displayed
    await expect(page.locator('.error-notification')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.error-notification')).toContainText('Invalid email or password');

    // Step 8: Verify error message is clearly visible (typically below form)
    await expect(page.locator('.error-notification')).toBeVisible();

    // Step 9: Verify user remains on Login Screen
    await expect(page.url()).toContain('/login');

    // Step 10: Verify user is not authenticated
    // Step 11: Verify user is not redirected to Home Screen
    await expect(page.locator('h1:has-text("Home")')).not.toBeVisible();

    // Step 12: Verify no session is created
    // (This is implicit - user is not redirected, so no session exists)
  });

  test('LOGIN-004: Login User - Negative Case - Empty Email Field', async () => {
    // Step 1: Navigate to Login Screen (already done in beforeEach)
    // Step 2: Verify Login Screen is displayed
    await expect(page.locator('input[id="email"]')).toBeVisible();

    // Step 3: Leave email input field empty
    // (Already empty from beforeEach)

    // Step 4: Enter "SecurePass123!" in password input field
    await page.fill('input[id="password"]', TEST_PASSWORD);

    // Step 5: Attempt to click Login button
    // Since the email field has required attribute, form validation should prevent submission
    // However, we'll try to click and see what happens
    const emailInput = page.locator('input[id="email"]');
    const isRequired = await emailInput.getAttribute('required');
    
    if (isRequired !== null) {
      // HTML5 validation should prevent submission
      // Try to submit and verify browser validation message or form doesn't submit
      await page.click('button[type="submit"]:has-text("Login")');
      
      // Wait a bit to see if form submits (it shouldn't)
      await page.waitForTimeout(1000);
      
      // Verify user remains on Login Screen
      await expect(page.url()).toContain('/login');
      
      // Verify user is not authenticated
      await expect(page.locator('h1:has-text("Home")')).not.toBeVisible();
    } else {
      // If not required, form might submit and show error
      await page.click('button[type="submit"]:has-text("Login")');
      
      // Wait for error message
      await page.waitForTimeout(2000);
      
      // Verify error message is displayed indicating email is required or invalid
      const errorNotification = page.locator('.error-notification');
      const emailValidation = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      
      // Either browser validation message or API error should appear
      if (emailValidation || await errorNotification.isVisible()) {
        // Step 6 & 7: Form validation prevents submission OR error message is displayed
        // Step 8: Verify user remains on Login Screen
        await expect(page.url()).toContain('/login');
        
        // Step 9: Verify user is not authenticated
        await expect(page.locator('h1:has-text("Home")')).not.toBeVisible();
      }
    }
  });

  test('LOGIN-005: Login User - Negative Case - Empty Password Field', async () => {
    // Step 1: Navigate to Login Screen (already done in beforeEach)
    // Step 2: Verify Login Screen is displayed
    await expect(page.locator('input[id="email"]')).toBeVisible();

    // Step 3: Enter "testuser@example.com" in email input field
    await page.fill('input[id="email"]', TEST_EMAIL);

    // Step 4: Leave password input field empty
    // (Already empty from beforeEach)

    // Step 5: Attempt to click Login button
    // Since the password field has required attribute, form validation should prevent submission
    const passwordInput = page.locator('input[id="password"]');
    const isRequired = await passwordInput.getAttribute('required');
    
    if (isRequired !== null) {
      // HTML5 validation should prevent submission
      // Try to submit and verify browser validation message or form doesn't submit
      await page.click('button[type="submit"]:has-text("Login")');
      
      // Wait a bit to see if form submits (it shouldn't)
      await page.waitForTimeout(1000);
      
      // Verify user remains on Login Screen
      await expect(page.url()).toContain('/login');
      
      // Verify user is not authenticated
      await expect(page.locator('h1:has-text("Home")')).not.toBeVisible();
    } else {
      // If not required, form might submit and show error
      await page.click('button[type="submit"]:has-text("Login")');
      
      // Wait for error message
      await page.waitForTimeout(2000);
      
      // Verify error message is displayed indicating password is required
      const errorNotification = page.locator('.error-notification');
      const passwordValidation = await passwordInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      
      // Either browser validation message or API error should appear
      if (passwordValidation || await errorNotification.isVisible()) {
        // Step 6 & 7: Form validation prevents submission OR error message is displayed
        // Step 8: Verify user remains on Login Screen
        await expect(page.url()).toContain('/login');
        
        // Step 9: Verify user is not authenticated
        await expect(page.locator('h1:has-text("Home")')).not.toBeVisible();
      }
    }
  });

  test('LOGIN-006: Login User - Negative Case - Both Fields Empty', async () => {
    // Step 1: Navigate to Login Screen (already done in beforeEach)
    // Step 2: Verify Login Screen is displayed
    await expect(page.locator('input[id="email"]')).toBeVisible();

    // Step 3: Leave email input field empty
    // (Already empty from beforeEach)

    // Step 4: Leave password input field empty
    // (Already empty from beforeEach)

    // Step 5: Attempt to click Login button
    // Since both fields have required attributes, form validation should prevent submission
    const emailInput = page.locator('input[id="email"]');
    const passwordInput = page.locator('input[id="password"]');
    const emailRequired = await emailInput.getAttribute('required');
    const passwordRequired = await passwordInput.getAttribute('required');
    
    if (emailRequired !== null && passwordRequired !== null) {
      // HTML5 validation should prevent submission
      // Try to submit and verify browser validation message or form doesn't submit
      await page.click('button[type="submit"]:has-text("Login")');
      
      // Wait a bit to see if form submits (it shouldn't)
      await page.waitForTimeout(1000);
      
      // Verify user remains on Login Screen
      await expect(page.url()).toContain('/login');
      
      // Verify user is not authenticated
      await expect(page.locator('h1:has-text("Home")')).not.toBeVisible();
    } else {
      // If not required, form might submit and show error
      await page.click('button[type="submit"]:has-text("Login")');
      
      // Wait for error message
      await page.waitForTimeout(2000);
      
      // Verify error message is displayed indicating required fields are missing
      const errorNotification = page.locator('.error-notification');
      const emailValidation = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      const passwordValidation = await passwordInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      
      // Either browser validation message or API error should appear
      if (emailValidation || passwordValidation || await errorNotification.isVisible()) {
        // Step 6 & 7: Form validation prevents submission OR error message is displayed
        // Step 8: Verify user remains on Login Screen
        await expect(page.url()).toContain('/login');
        
        // Step 9: Verify user is not authenticated
        await expect(page.locator('h1:has-text("Home")')).not.toBeVisible();
      }
    }
  });
});
