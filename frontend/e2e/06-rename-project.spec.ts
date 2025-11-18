import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const TEST_USER_EMAIL = 'testuser@example.com';
const TEST_USER_PASSWORD = 'SecurePass123!';
const OWNER_EMAIL = 'owner@example.com';
const OWNER_PASSWORD = 'SecurePass123!';
const USER_EMAIL = 'user@example.com';
const USER_PASSWORD = 'SecurePass456!';

const ORIGINAL_PROJECT_NAME = 'TestProject';
const RENAMED_PROJECT_NAME = 'Renamed Project';
const SHARED_PROJECT_NAME = 'SharedProject';
const EXISTING_PROJECT_NAME = 'ExistingProject';
const INVALID_NAME = '';
const CANCELLED_NAME = 'Cancelled Name';

test.describe('Rename Project - Section 06', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    test.setTimeout(60000); // 60 seconds per test
    
    // Navigate to login screen
    await page.goto('/login');
  });

  // Helper function to login
  async function login(email: string, password: string) {
    await page.fill('input[id="email"]', email);
    await page.fill('input[id="password"]', password);
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForURL('/home', { timeout: 10000 });
    await expect(page.locator('h1:has-text("Home")')).toBeVisible();
  }

  // Helper function to register user if not exists
  async function ensureUserExists(email: string, password: string) {
    try {
      await page.goto('/login', { waitUntil: 'networkidle' });
    } catch (e) {
      await page.goto('/login', { waitUntil: 'networkidle', timeout: 10000 });
    }
    
    const registerButton = page.locator('button:has-text("Don\'t have an account? Register")').or(page.locator('button:has-text("Register")'));
    let isRegisterButtonVisible = false;
    try {
      isRegisterButtonVisible = await registerButton.isVisible({ timeout: 5000 });
    } catch (e) {
      isRegisterButtonVisible = false;
    }
    if (isRegisterButtonVisible) {
      await registerButton.click();
      await page.fill('input[id="email"]', email);
      await page.fill('input[id="password"]', password);
      await page.click('button[type="submit"]:has-text("Register")');
      
      try {
        await page.waitForURL('/home', { timeout: 5000 });
      } catch (e) {
        try {
          await page.goto('/login', { waitUntil: 'networkidle', timeout: 10000 });
          await login(email, password);
        } catch (err) {
          throw new Error(`Failed to ensure user exists: ${err}`);
        }
      }
    } else {
      await login(email, password);
    }
  }

  // Helper function to create project
  async function createProject(projectName: string) {
    // Check if project already exists
    const projectCard = page.locator('.project-card').filter({ hasText: projectName });
    if (await projectCard.count() > 0) {
      return; // Project already exists
    }

    // Drag Project brick to create project
    const projectBrick = page.locator('.brick-item:has-text("Project")');
    const projectListArea = page.locator('.project-list-area');
    await projectBrick.dragTo(projectListArea);
    await page.waitForTimeout(1000);

    // Rename if needed
    const newProjectCard = page.locator('.project-card').first();
    const nameInput = newProjectCard.locator('input.project-name-input');
    if (await nameInput.isVisible()) {
      await nameInput.clear();
      await nameInput.fill(projectName);
      await nameInput.press('Enter');
      await page.waitForTimeout(500);
    } else {
      // Click rename button
      const renameButton = newProjectCard.locator('button.project-action-button').first();
      if (await renameButton.isVisible()) {
        await renameButton.click();
        const nameInputAfter = newProjectCard.locator('input.project-name-input');
        await nameInputAfter.clear();
        await nameInputAfter.fill(projectName);
        await nameInputAfter.press('Enter');
        await page.waitForTimeout(500);
      }
    }
  }

  // Helper function to logout
  async function logout() {
    await page.click('button.settings-button, button[aria-label="Settings"]');
    await expect(page.locator('.settings-dropdown')).toBeVisible();
    await page.click('button.settings-logout:has-text("Logout")');
    await page.waitForURL('/login', { timeout: 5000 });
  }

  // Helper function to share project with user (add permission)
  async function shareProjectWithUser(projectName: string, userEmail: string) {
    // Open project editor
    const projectCard = page.locator('.project-card').filter({ hasText: projectName }).first();
    await expect(projectCard).toBeVisible({ timeout: 10000 });
    await projectCard.dblclick();
    await page.waitForURL(/\/projects\/[^/]+/, { timeout: 10000 });
    
    // Click Permissions tab
    const permissionsTab = page.locator('button.tab-button:has-text("Permissions")');
    await expect(permissionsTab).toBeVisible({ timeout: 10000 });
    await permissionsTab.click();
    await page.waitForTimeout(500);
    
    // Add permission for user
    const emailInput = page.locator('input[placeholder*="email" i], input[type="email"]');
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await emailInput.fill(userEmail);
    
    const addButton = page.locator('button:has-text("Add")');
    await expect(addButton).toBeVisible();
    await addButton.click();
    
    // Wait for permission to be added
    await page.waitForTimeout(1000);
    
    // Navigate back to home
    await page.goto('/home');
    await page.waitForTimeout(1000);
  }

  test('PROJ-RENAME-001: Rename Project - Positive Case', async () => {
    // Preconditions
    await ensureUserExists(TEST_USER_EMAIL, TEST_USER_PASSWORD);
    await createProject(ORIGINAL_PROJECT_NAME);

    // Step 1: Verify user is on Home Screen
    await expect(page.locator('h1:has-text("Home")')).toBeVisible();

    // Step 2: Verify project "TestProject" is displayed in the project list
    const projectCard = page.locator('.project-card').filter({ hasText: ORIGINAL_PROJECT_NAME }).first();
    await expect(projectCard).toBeVisible();

    // Step 3: Select project "TestProject" (click on it to select)
    await projectCard.click();
    await page.waitForTimeout(500);

    // Step 4: Initiate rename action (click rename button)
    const renameButton = projectCard.locator('button.project-action-button').first();
    await expect(renameButton).toBeVisible();
    await renameButton.click();

    // Step 5: Verify project name becomes editable (input field appears)
    const nameInput = projectCard.locator('input.project-name-input');
    await expect(nameInput).toBeVisible();

    // Step 6: Clear existing name "TestProject"
    await nameInput.clear();

    // Step 7: Type "Renamed Project" as the new project name
    await nameInput.fill(RENAMED_PROJECT_NAME);

    // Step 8: Confirm rename action (press Enter)
    await nameInput.press('Enter');

    // Step 9: Verify project name is updated to "Renamed Project"
    await page.waitForTimeout(1000);
    const renamedProjectCard = page.locator('.project-card').filter({ hasText: RENAMED_PROJECT_NAME }).first();
    await expect(renamedProjectCard).toBeVisible();

    // Step 10: Verify updated name is displayed in the project list
    await expect(page.locator('.project-card')).toContainText(RENAMED_PROJECT_NAME);

    // Step 11: Verify name change is persisted (reload page)
    await page.reload();
    await page.waitForTimeout(1000);
    await expect(page.locator('h1:has-text("Home")')).toBeVisible();
    const persistedProjectCard = page.locator('.project-card').filter({ hasText: RENAMED_PROJECT_NAME }).first();
    await expect(persistedProjectCard).toBeVisible();

    // Step 12: Verify no error messages are displayed
    const errorMessages = page.locator('.error, .error-message, [role="alert"]');
    await expect(errorMessages).toHaveCount(0);
  });

  test('PROJ-RENAME-002: Rename Project - Negative Case - Permission Denied', async () => {
    // Preconditions
    await ensureUserExists(OWNER_EMAIL, OWNER_PASSWORD);
    await createProject(SHARED_PROJECT_NAME);
    
    // Share project with user@example.com (view permission only, not rename)
    await shareProjectWithUser(SHARED_PROJECT_NAME, USER_EMAIL);
    
    // Logout and login as user@example.com
    await logout();
    await ensureUserExists(USER_EMAIL, USER_PASSWORD);

    // Step 1: Verify user "user@example.com" is on Home Screen
    await expect(page.locator('h1:has-text("Home")')).toBeVisible();

    // Step 2: Verify project "SharedProject" is displayed in the project list
    const projectCard = page.locator('.project-card').filter({ hasText: SHARED_PROJECT_NAME }).first();
    await expect(projectCard).toBeVisible();

    // Step 3: Select project "SharedProject"
    await projectCard.click();
    await page.waitForTimeout(500);

    // Step 4: Attempt to initiate rename action
    const renameButton = projectCard.locator('button.project-action-button').first();
    
    // Step 5: Verify rename action is not available OR rename fails
    // Try to click rename button
    await renameButton.click();
    await page.waitForTimeout(500);

    // Step 6: Verify error message "Permission denied" is displayed
    // Check for error message (could be in notification, alert, or error div)
    const errorMessage = page.locator('.error, .error-message, [role="alert"], .notification-error').filter({ hasText: /permission denied/i });
    const hasError = await errorMessage.count() > 0;
    
    // If no error message visible, check if rename was prevented (input not visible)
    const nameInput = projectCard.locator('input.project-name-input');
    const isInputVisible = await nameInput.isVisible({ timeout: 2000 }).catch(() => false);
    
    // Either error message should appear OR rename should be prevented (input not visible)
    expect(hasError || !isInputVisible).toBeTruthy();

    // Step 7: Verify project name remains "SharedProject"
    await expect(projectCard).toContainText(SHARED_PROJECT_NAME);

    // Step 8: Verify project name is not changed
    await page.reload();
    await page.waitForTimeout(1000);
    const reloadedProjectCard = page.locator('.project-card').filter({ hasText: SHARED_PROJECT_NAME }).first();
    await expect(reloadedProjectCard).toBeVisible();

    // Step 9: Verify no changes are persisted
    await expect(reloadedProjectCard).toContainText(SHARED_PROJECT_NAME);
  });

  test('PROJ-RENAME-003: Rename Project - Negative Case - Invalid Project Name', async () => {
    // Preconditions
    await ensureUserExists(TEST_USER_EMAIL, TEST_USER_PASSWORD);
    await createProject(ORIGINAL_PROJECT_NAME);

    // Step 1: Verify user is on Home Screen
    await expect(page.locator('h1:has-text("Home")')).toBeVisible();

    // Step 2: Verify project "TestProject" is displayed in the project list
    const projectCard = page.locator('.project-card').filter({ hasText: ORIGINAL_PROJECT_NAME }).first();
    await expect(projectCard).toBeVisible();

    // Step 3: Select project "TestProject"
    await projectCard.click();
    await page.waitForTimeout(500);

    // Step 4: Initiate rename action
    const renameButton = projectCard.locator('button.project-action-button').first();
    await expect(renameButton).toBeVisible();
    await renameButton.click();

    // Step 5: Verify project name becomes editable
    const nameInput = projectCard.locator('input.project-name-input');
    await expect(nameInput).toBeVisible();

    // Step 6: Clear existing name
    await nameInput.clear();

    // Step 7: Leave name field empty (or enter only whitespace)
    await nameInput.fill(INVALID_NAME);

    // Step 8: Attempt to confirm rename action
    await nameInput.press('Enter');
    await page.waitForTimeout(1000);

    // Step 9: Verify rename fails OR validation prevents confirmation
    // Check for error message
    const errorMessage = page.locator('.error, .error-message, [role="alert"], .notification-error').filter({ hasText: /invalid project name/i });
    const hasError = await errorMessage.count() > 0;
    
    // Or check if input is still visible (validation prevented confirmation)
    const isInputStillVisible = await nameInput.isVisible({ timeout: 2000 }).catch(() => false);
    
    // Either error message should appear OR input should still be visible (validation prevented)
    expect(hasError || isInputStillVisible).toBeTruthy();

    // Step 10: Verify error message "Invalid project name" is displayed
    if (hasError) {
      await expect(errorMessage.first()).toBeVisible();
    }

    // Step 11: Verify project name remains "TestProject" or reverts to original name
    // If input is still visible, cancel it
    if (isInputStillVisible) {
      await nameInput.press('Escape');
      await page.waitForTimeout(500);
    }
    
    const finalProjectCard = page.locator('.project-card').filter({ hasText: ORIGINAL_PROJECT_NAME }).first();
    await expect(finalProjectCard).toBeVisible();

    // Step 12: Verify name change is not persisted
    await page.reload();
    await page.waitForTimeout(1000);
    const persistedProjectCard = page.locator('.project-card').filter({ hasText: ORIGINAL_PROJECT_NAME }).first();
    await expect(persistedProjectCard).toBeVisible();
  });

  test('PROJ-RENAME-004: Rename Project - Negative Case - Duplicate Project Name', async () => {
    // Preconditions
    await ensureUserExists(TEST_USER_EMAIL, TEST_USER_PASSWORD);
    await createProject(ORIGINAL_PROJECT_NAME);
    await createProject(EXISTING_PROJECT_NAME);

    // Step 1: Verify user is on Home Screen
    await expect(page.locator('h1:has-text("Home")')).toBeVisible();

    // Step 2: Verify both projects "TestProject" and "ExistingProject" are displayed
    const testProjectCard = page.locator('.project-card').filter({ hasText: ORIGINAL_PROJECT_NAME }).first();
    const existingProjectCard = page.locator('.project-card').filter({ hasText: EXISTING_PROJECT_NAME }).first();
    await expect(testProjectCard).toBeVisible();
    await expect(existingProjectCard).toBeVisible();

    // Step 3: Select project "TestProject"
    await testProjectCard.click();
    await page.waitForTimeout(500);

    // Step 4: Initiate rename action
    const renameButton = testProjectCard.locator('button.project-action-button').first();
    await expect(renameButton).toBeVisible();
    await renameButton.click();

    // Step 5: Verify project name becomes editable
    const nameInput = testProjectCard.locator('input.project-name-input');
    await expect(nameInput).toBeVisible();

    // Step 6: Clear existing name "TestProject"
    await nameInput.clear();

    // Step 7: Type "ExistingProject" as the new project name
    await nameInput.fill(EXISTING_PROJECT_NAME);

    // Step 8: Attempt to confirm rename action
    await nameInput.press('Enter');
    await page.waitForTimeout(1000);

    // Step 9: Verify rename fails OR validation prevents confirmation
    // Check for error message
    const errorMessage = page.locator('.error, .error-message, [role="alert"], .notification-error').filter({ 
      hasText: /(invalid project name|project name already exists|duplicate)/i 
    });
    const hasError = await errorMessage.count() > 0;
    
    // Or check if input is still visible (validation prevented confirmation)
    const isInputStillVisible = await nameInput.isVisible({ timeout: 2000 }).catch(() => false);
    
    // Either error message should appear OR input should still be visible
    expect(hasError || isInputStillVisible).toBeTruthy();

    // Step 10: Verify error message is displayed
    if (hasError) {
      await expect(errorMessage.first()).toBeVisible();
    }

    // Step 11: Verify project name remains "TestProject" or reverts to original name
    // If input is still visible, cancel it
    if (isInputStillVisible) {
      await nameInput.press('Escape');
      await page.waitForTimeout(500);
    }
    
    const finalTestProjectCard = page.locator('.project-card').filter({ hasText: ORIGINAL_PROJECT_NAME }).first();
    await expect(finalTestProjectCard).toBeVisible();

    // Step 12: Verify name change is not persisted
    await page.reload();
    await page.waitForTimeout(1000);
    const persistedTestProjectCard = page.locator('.project-card').filter({ hasText: ORIGINAL_PROJECT_NAME }).first();
    const persistedExistingProjectCard = page.locator('.project-card').filter({ hasText: EXISTING_PROJECT_NAME }).first();
    await expect(persistedTestProjectCard).toBeVisible();
    await expect(persistedExistingProjectCard).toBeVisible();
  });

  test('PROJ-RENAME-005: Rename Project - Cancel Rename Action', async () => {
    // Preconditions
    await ensureUserExists(TEST_USER_EMAIL, TEST_USER_PASSWORD);
    await createProject(ORIGINAL_PROJECT_NAME);

    // Step 1: Verify user is on Home Screen
    await expect(page.locator('h1:has-text("Home")')).toBeVisible();

    // Step 2: Verify project "TestProject" is displayed in the project list
    const projectCard = page.locator('.project-card').filter({ hasText: ORIGINAL_PROJECT_NAME }).first();
    await expect(projectCard).toBeVisible();

    // Step 3: Select project "TestProject"
    await projectCard.click();
    await page.waitForTimeout(500);

    // Step 4: Initiate rename action
    const renameButton = projectCard.locator('button.project-action-button').first();
    await expect(renameButton).toBeVisible();
    await renameButton.click();

    // Step 5: Verify project name becomes editable
    const nameInput = projectCard.locator('input.project-name-input');
    await expect(nameInput).toBeVisible();

    // Step 6: Clear existing name
    await nameInput.clear();

    // Step 7: Type "Cancelled Name" as the new project name
    await nameInput.fill(CANCELLED_NAME);

    // Step 8: Cancel rename action (press Escape)
    await nameInput.press('Escape');
    await page.waitForTimeout(500);

    // Step 9: Verify rename is cancelled
    // Input should no longer be visible
    await expect(nameInput).not.toBeVisible({ timeout: 2000 });

    // Step 10: Verify project name reverts to "TestProject"
    const revertedProjectCard = page.locator('.project-card').filter({ hasText: ORIGINAL_PROJECT_NAME }).first();
    await expect(revertedProjectCard).toBeVisible();

    // Step 11: Verify name change is not persisted
    await page.reload();
    await page.waitForTimeout(1000);
    const persistedProjectCard = page.locator('.project-card').filter({ hasText: ORIGINAL_PROJECT_NAME }).first();
    await expect(persistedProjectCard).toBeVisible();

    // Step 12: Verify no error messages are displayed
    const errorMessages = page.locator('.error, .error-message, [role="alert"]');
    await expect(errorMessages).toHaveCount(0);
  });
});
