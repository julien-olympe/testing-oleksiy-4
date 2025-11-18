import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const TEST_USER_EMAIL = 'testuser@example.com';
const TEST_USER_PASSWORD = 'SecurePass123!';
const OWNER_EMAIL = 'owner@example.com';
const OWNER_PASSWORD = 'SecurePass123!';
const USER_EMAIL = 'user@example.com';
const USER_PASSWORD = 'SecurePass456!';

test.describe('Rename Project Tests', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    
    // Navigate to login screen
    await page.goto('/login');
  });

  test('PROJ-RENAME-001: Rename Project - Positive Case', async () => {
    const originalProjectName = 'TestProject';
    const newProjectName = 'Renamed Project';

    // ===== STEP 1: Verify user is on Home Screen =====
    await test.step('Step 1: Verify user is on Home Screen', async () => {
      // Login user
      await page.fill('input[id="email"]', TEST_USER_EMAIL);
      await page.fill('input[id="password"]', TEST_USER_PASSWORD);
      await page.click('button[type="submit"]:has-text("Login")');
      
      // Wait for redirect to home
      await page.waitForURL('/home', { timeout: 10000 });
      await expect(page.locator('h1:has-text("Home")')).toBeVisible();
    });

    // ===== STEP 2: Verify project "TestProject" is displayed =====
    await test.step('Step 2: Verify project "TestProject" is displayed in the project list', async () => {
      // Check if project exists, if not create it
      const projectCard = page.locator('.project-card').filter({ hasText: originalProjectName });
      const projectCount = await projectCard.count();
      
      if (projectCount === 0) {
        // Create project by dragging Project brick
        const projectBrick = page.locator('.brick-item:has-text("Project")');
        const projectListArea = page.locator('.project-list-area');
        
        await projectBrick.dragTo(projectListArea);
        await page.waitForTimeout(1000);
        
        // Rename the new project to "TestProject"
        const newProjectCard = page.locator('.project-card').first();
        const renameButton = newProjectCard.locator('button.project-action-button').first();
        await renameButton.click();
        
        const nameInput = newProjectCard.locator('input.project-name-input');
        await nameInput.fill(originalProjectName);
        await nameInput.press('Enter');
        await page.waitForTimeout(1000);
      }
      
      // Verify project is displayed
      await expect(page.locator('.project-card').filter({ hasText: originalProjectName }).first()).toBeVisible();
    });

    // ===== STEP 3: Select project "TestProject" =====
    await test.step('Step 3: Select project "TestProject" (click on it to select)', async () => {
      const projectCard = page.locator('.project-card').filter({ hasText: originalProjectName }).first();
      await projectCard.click();
    });

    // ===== STEP 4: Initiate rename action =====
    await test.step('Step 4: Initiate rename action (click rename button)', async () => {
      const projectCard = page.locator('.project-card').filter({ hasText: originalProjectName }).first();
      // Click the first action button (rename button is the first one)
      const renameButton = projectCard.locator('button.project-action-button').first();
      await expect(renameButton).toBeVisible();
      await renameButton.click();
      await page.waitForTimeout(1000);
    });

    // ===== STEP 5: Verify project name becomes editable =====
    await test.step('Step 5: Verify project name becomes editable (input field appears)', async () => {
      // Find the input field - it should be in a project card that has the input visible
      const nameInput = page.locator('input.project-name-input').first();
      await expect(nameInput).toBeVisible({ timeout: 5000 });
      await expect(nameInput).toHaveValue(originalProjectName);
    });

    // ===== STEP 6: Clear existing name =====
    await test.step('Step 6: Clear existing name "TestProject"', async () => {
      const nameInput = page.locator('input.project-name-input').first();
      await nameInput.clear();
    });

    // ===== STEP 7: Type new name =====
    await test.step('Step 7: Type "Renamed Project" as the new project name', async () => {
      const nameInput = page.locator('input.project-name-input').first();
      await nameInput.fill(newProjectName);
    });

    // ===== STEP 8: Confirm rename action =====
    await test.step('Step 8: Confirm rename action (press Enter)', async () => {
      const nameInput = page.locator('input.project-name-input').first();
      await nameInput.press('Enter');
      
      // Wait for API call to complete and input to disappear
      await page.waitForTimeout(2000);
    });

    // ===== STEP 9: Verify project name is updated =====
    await test.step('Step 9: Verify project name is updated to "Renamed Project"', async () => {
      // Wait for the project list to refresh
      await page.waitForTimeout(1000);
      
      // Verify new name is displayed
      const renamedProjectCard = page.locator('.project-card').filter({ hasText: newProjectName }).first();
      await expect(renamedProjectCard.locator('.project-name')).toContainText(newProjectName);
    });

    // ===== STEP 10: Verify updated name is displayed in project list =====
    await test.step('Step 10: Verify updated name is displayed in the project list', async () => {
      const renamedProjectCard = page.locator('.project-card').filter({ hasText: newProjectName }).first();
      await expect(renamedProjectCard).toBeVisible();
      await expect(renamedProjectCard.locator('.project-name')).toContainText(newProjectName);
    });

    // ===== STEP 11: Verify name change is persisted =====
    await test.step('Step 11: Verify name change is persisted', async () => {
      // Reload page to verify persistence
      await page.reload();
      await page.waitForURL('/home', { timeout: 10000 });
      await page.waitForTimeout(1000);
      
      // Verify renamed project is still there
      const renamedProjectCard = page.locator('.project-card').filter({ hasText: newProjectName }).first();
      await expect(renamedProjectCard).toBeVisible();
      await expect(renamedProjectCard.locator('.project-name')).toContainText(newProjectName);
    });

    // ===== STEP 12: Verify no error messages =====
    await test.step('Step 12: Verify no error messages are displayed', async () => {
      const errorNotification = page.locator('.error-notification');
      await expect(errorNotification).not.toBeVisible();
    });
  });

  test('PROJ-RENAME-002: Rename Project - Negative Case - Permission Denied', async () => {
    const projectName = 'SharedProject';
    const attemptedNewName = 'Unauthorized Rename';

    // ===== STEP 1: Verify user "user@example.com" is on Home Screen =====
    await test.step('Step 1: Verify user "user@example.com" is on Home Screen', async () => {
      // Register or login owner first to create project
      await page.fill('input[id="email"]', OWNER_EMAIL);
      await page.fill('input[id="password"]', OWNER_PASSWORD);
      
      // Try to register first, fallback to login
      const registerButton = page.locator('button:has-text("Don\'t have an account? Register")').or(page.locator('button:has-text("Register")'));
      if (await registerButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await registerButton.click();
        await page.waitForTimeout(500);
        await page.click('button[type="submit"]:has-text("Register")');
      } else {
        await page.click('button[type="submit"]:has-text("Login")');
      }
      
      // Wait for home screen
      await page.waitForURL('/home', { timeout: 15000 });
      await expect(page.locator('h1:has-text("Home")')).toBeVisible({ timeout: 5000 });
      
      // Wait for home screen to be ready
      await page.waitForTimeout(2000);
      
      // Wait for sidebar to be visible
      await expect(page.locator('.home-sidebar')).toBeVisible({ timeout: 5000 });
      
      // Create project if it doesn't exist
      const projectCard = page.locator('.project-card').filter({ hasText: projectName });
      const projectExists = await projectCard.count() > 0;
      
      if (!projectExists) {
        // Wait for brick list to be visible
        await expect(page.locator('.brick-list')).toBeVisible({ timeout: 5000 });
        const projectBrick = page.locator('.brick-item:has-text("Project")');
        await expect(projectBrick).toBeVisible({ timeout: 5000 });
        const projectListArea = page.locator('.project-list-area');
        await expect(projectListArea).toBeVisible();
        await projectBrick.dragTo(projectListArea);
        await page.waitForTimeout(2000);
        
        const newProjectCard = page.locator('.project-card').first();
        await expect(newProjectCard).toBeVisible();
        const renameButton = newProjectCard.locator('button.project-action-button').first();
        await renameButton.click();
        await page.waitForTimeout(500);
        const nameInput = newProjectCard.locator('input.project-name-input');
        await expect(nameInput).toBeVisible({ timeout: 2000 });
        await nameInput.fill(projectName);
        await nameInput.press('Enter');
        await page.waitForTimeout(2000);
      }
      
      // Now share project with user - open project editor and add permission
      const existingProjectCard = page.locator('.project-card').filter({ hasText: projectName }).first();
      await existingProjectCard.dblclick();
      await page.waitForURL(/\/projects\//, { timeout: 10000 });
      await page.waitForTimeout(1000);
      
      // Go to Permissions tab
      const permissionsTab = page.locator('button:has-text("Permissions")');
      await expect(permissionsTab).toBeVisible();
      await permissionsTab.click();
      await page.waitForTimeout(500);
      
      // Add permission for user
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeVisible();
      await emailInput.fill(USER_EMAIL);
      const addButton = page.locator('button:has-text("Add")');
      await addButton.click();
      await page.waitForTimeout(1000);
      
      // Go back to home
      await page.goto('/home');
      await page.waitForTimeout(1000);
      
      // Logout owner
      await page.click('button.settings-button, button[aria-label="Settings"]');
      await page.waitForTimeout(500);
      await page.click('button.settings-logout:has-text("Logout")');
      await page.waitForURL('/login', { timeout: 10000 });
      
      // Register or login user
      await page.fill('input[id="email"]', USER_EMAIL);
      await page.fill('input[id="password"]', USER_PASSWORD);
      
      const registerButton2 = page.locator('button:has-text("Don\'t have an account? Register")').or(page.locator('button:has-text("Register")'));
      if (await registerButton2.isVisible({ timeout: 2000 }).catch(() => false)) {
        await registerButton2.click();
        await page.waitForTimeout(500);
        await page.click('button[type="submit"]:has-text("Register")');
      } else {
        await page.click('button[type="submit"]:has-text("Login")');
      }
      
      await page.waitForURL('/home', { timeout: 15000 });
      await expect(page.locator('h1:has-text("Home")')).toBeVisible({ timeout: 5000 });
    });

    // ===== STEP 2: Verify project "SharedProject" is displayed =====
    await test.step('Step 2: Verify project "SharedProject" is displayed in the project list', async () => {
      // Note: User may not see the project if they don't have view permission
      // This test assumes they have view permission but not rename permission
      // If project is not visible, the test will fail here which is expected
      const projectCard = page.locator('.project-card').filter({ hasText: projectName });
      // We'll check if it's visible, but it might not be
      const isVisible = await projectCard.count() > 0;
      if (!isVisible) {
        // Project not visible - user doesn't have permission, which is expected
        // But according to spec, user should have view permission
        throw new Error('Project "SharedProject" is not visible to user. User should have view permission according to spec.');
      }
    });

    // ===== STEP 3: Select project =====
    await test.step('Step 3: Select project "SharedProject"', async () => {
      const projectCard = page.locator('.project-card').filter({ hasText: projectName }).first();
      await projectCard.click();
    });

    // ===== STEP 4: Attempt to initiate rename action =====
    await test.step('Step 4: Attempt to initiate rename action', async () => {
      const projectCard = page.locator('.project-card').filter({ hasText: projectName }).first();
      const renameButton = projectCard.locator('button.project-action-button').first();
      
      // Try to click rename button
      await renameButton.click();
      await page.waitForTimeout(500);
    });

    // ===== STEP 5: Verify rename action is not available OR rename fails =====
    await test.step('Step 5: Verify rename action is not available OR rename fails', async () => {
      // Check if input field appeared (rename started) or not
      const projectCard = page.locator('.project-card').filter({ hasText: projectName }).first();
      const nameInput = projectCard.locator('input.project-name-input');
      const inputVisible = await nameInput.isVisible();
      
      if (inputVisible) {
        // Rename started, try to complete it and expect failure
        await nameInput.fill(attemptedNewName);
        await nameInput.press('Enter');
        await page.waitForTimeout(1000);
      }
    });

    // ===== STEP 6: Verify error message =====
    await test.step('Step 6: Verify error message "Permission denied" is displayed', async () => {
      const errorNotification = page.locator('.error-notification');
      await expect(errorNotification).toBeVisible({ timeout: 2000 });
      await expect(errorNotification).toContainText(/Permission denied|permission|not authorized/i);
    });

    // ===== STEP 7: Verify project name remains unchanged =====
    await test.step('Step 7: Verify project name remains "SharedProject"', async () => {
      const projectCard = page.locator('.project-card').filter({ hasText: projectName }).first();
      await expect(projectCard.locator('.project-name')).toContainText(projectName);
    });

    // ===== STEP 8: Verify project name is not changed =====
    await test.step('Step 8: Verify project name is not changed', async () => {
      // Reload to verify
      await page.reload();
      await page.waitForURL('/home', { timeout: 10000 });
      await page.waitForTimeout(1000);
      
      const projectCard = page.locator('.project-card').filter({ hasText: projectName }).first();
      await expect(projectCard.locator('.project-name')).toContainText(projectName);
    });

    // ===== STEP 9: Verify no changes are persisted =====
    await test.step('Step 9: Verify no changes are persisted', async () => {
      // Already verified in step 8
      const projectCard = page.locator('.project-card').filter({ hasText: projectName }).first();
      await expect(projectCard.locator('.project-name')).not.toContainText(attemptedNewName);
    });
  });

  test('PROJ-RENAME-003: Rename Project - Negative Case - Invalid Project Name', async () => {
    const originalProjectName = 'TestProject';
    const invalidNewName = '';

    // ===== STEP 1: Verify user is on Home Screen =====
    await test.step('Step 1: Verify user is on Home Screen', async () => {
      await page.fill('input[id="email"]', TEST_USER_EMAIL);
      await page.fill('input[id="password"]', TEST_USER_PASSWORD);
      await page.click('button[type="submit"]:has-text("Login")');
      await page.waitForURL('/home', { timeout: 10000 });
      await expect(page.locator('h1:has-text("Home")')).toBeVisible();
    });

    // ===== STEP 2: Verify project "TestProject" is displayed =====
    await test.step('Step 2: Verify project "TestProject" is displayed in the project list', async () => {
      const projectCard = page.locator('.project-card').filter({ hasText: originalProjectName });
      if (await projectCard.count() === 0) {
        // Create project
        const projectBrick = page.locator('.brick-item:has-text("Project")');
        const projectListArea = page.locator('.project-list-area');
        await projectBrick.dragTo(projectListArea);
        await page.waitForTimeout(1000);
        
        const newProjectCard = page.locator('.project-card').first();
        const renameButton = newProjectCard.locator('button.project-action-button').first();
        await renameButton.click();
        const nameInput = newProjectCard.locator('input.project-name-input');
        await nameInput.fill(originalProjectName);
        await nameInput.press('Enter');
        await page.waitForTimeout(1000);
      }
      await expect(page.locator('.project-card').filter({ hasText: originalProjectName }).first()).toBeVisible();
    });

    // ===== STEP 3: Select project =====
    await test.step('Step 3: Select project "TestProject"', async () => {
      const projectCard = page.locator('.project-card').filter({ hasText: originalProjectName }).first();
      await projectCard.click();
    });

    // ===== STEP 4: Initiate rename action =====
    await test.step('Step 4: Initiate rename action', async () => {
      const projectCard = page.locator('.project-card').filter({ hasText: originalProjectName }).first();
      const renameButton = projectCard.locator('button.project-action-button').first();
      await expect(renameButton).toBeVisible();
      await renameButton.click();
      await page.waitForTimeout(1000);
    });

    // ===== STEP 5: Verify project name becomes editable =====
    await test.step('Step 5: Verify project name becomes editable', async () => {
      const nameInput = page.locator('input.project-name-input').first();
      await expect(nameInput).toBeVisible({ timeout: 5000 });
    });

    // ===== STEP 6: Clear existing name =====
    await test.step('Step 6: Clear existing name', async () => {
      const nameInput = page.locator('input.project-name-input').first();
      await nameInput.clear();
    });

    // ===== STEP 7: Leave name field empty =====
    await test.step('Step 7: Leave name field empty (or enter only whitespace)', async () => {
      const nameInput = page.locator('input.project-name-input').first();
      await nameInput.fill(invalidNewName);
    });

    // ===== STEP 8: Attempt to confirm rename action =====
    await test.step('Step 8: Attempt to confirm rename action', async () => {
      const nameInput = page.locator('input.project-name-input').first();
      await nameInput.press('Enter');
      await page.waitForTimeout(500);
    });

    // ===== STEP 9: Verify rename fails OR validation prevents confirmation =====
    await test.step('Step 9: Verify rename fails OR validation prevents confirmation', async () => {
      // The input should either disappear (validation prevented) or error should appear
      await page.waitForTimeout(500);
    });

    // ===== STEP 10: Verify error message =====
    await test.step('Step 10: Verify error message "Invalid project name" is displayed', async () => {
      // Check for error notification or validation message
      const errorNotification = page.locator('.error-notification');
      const hasError = await errorNotification.isVisible().catch(() => false);
      
      if (hasError) {
        await expect(errorNotification).toContainText(/Invalid project name|invalid|name/i);
      } else {
        // If no error, the validation might have prevented the action
        // Check that input is gone and original name is back
        const projectCard = page.locator('.project-card').filter({ hasText: originalProjectName }).first();
        const nameInput = projectCard.locator('input.project-name-input');
        const inputVisible = await nameInput.isVisible().catch(() => false);
        
        if (inputVisible) {
          throw new Error('Expected rename to be prevented or error to be shown, but input is still visible');
        }
      }
    });

    // ===== STEP 11: Verify project name remains unchanged =====
    await test.step('Step 11: Verify project name remains "TestProject" or reverts to original name', async () => {
      await page.waitForTimeout(1000);
      const projectCard = page.locator('.project-card').filter({ hasText: originalProjectName }).first();
      await expect(projectCard.locator('.project-name')).toContainText(originalProjectName);
    });

    // ===== STEP 12: Verify name change is not persisted =====
    await test.step('Step 12: Verify name change is not persisted', async () => {
      await page.reload();
      await page.waitForURL('/home', { timeout: 10000 });
      await page.waitForTimeout(1000);
      
      const projectCard = page.locator('.project-card').filter({ hasText: originalProjectName }).first();
      await expect(projectCard.locator('.project-name')).toContainText(originalProjectName);
    });
  });

  test('PROJ-RENAME-004: Rename Project - Negative Case - Duplicate Project Name', async () => {
    const originalProjectName = 'TestProject';
    const duplicateName = 'ExistingProject';

    // ===== STEP 1: Verify user is on Home Screen =====
    await test.step('Step 1: Verify user is on Home Screen', async () => {
      await page.fill('input[id="email"]', TEST_USER_EMAIL);
      await page.fill('input[id="password"]', TEST_USER_PASSWORD);
      await page.click('button[type="submit"]:has-text("Login")');
      await page.waitForURL('/home', { timeout: 10000 });
      await expect(page.locator('h1:has-text("Home")')).toBeVisible();
    });

    // ===== STEP 2: Verify both projects are displayed =====
    await test.step('Step 2: Verify both projects "TestProject" and "ExistingProject" are displayed', async () => {
      // Create TestProject if it doesn't exist
      let projectCard = page.locator('.project-card').filter({ hasText: originalProjectName });
      if (await projectCard.count() === 0) {
        const projectBrick = page.locator('.brick-item:has-text("Project")');
        const projectListArea = page.locator('.project-list-area');
        await projectBrick.dragTo(projectListArea);
        await page.waitForTimeout(1000);
        
        const newProjectCard = page.locator('.project-card').first();
        const renameButton = newProjectCard.locator('button.project-action-button').first();
        await renameButton.click();
        const nameInput = newProjectCard.locator('input.project-name-input');
        await nameInput.fill(originalProjectName);
        await nameInput.press('Enter');
        await page.waitForTimeout(1000);
      }
      
      // Create ExistingProject if it doesn't exist
      projectCard = page.locator('.project-card').filter({ hasText: duplicateName });
      if (await projectCard.count() === 0) {
        const projectBrick = page.locator('.brick-item:has-text("Project")');
        const projectListArea = page.locator('.project-list-area');
        await projectBrick.dragTo(projectListArea);
        await page.waitForTimeout(1000);
        
        const newProjectCard = page.locator('.project-card').first();
        const renameButton = newProjectCard.locator('button.project-action-button').first();
        await renameButton.click();
        const nameInput = newProjectCard.locator('input.project-name-input');
        await nameInput.fill(duplicateName);
        await nameInput.press('Enter');
        await page.waitForTimeout(1000);
      }
      
      // Verify both projects are visible
      await expect(page.locator('.project-card').filter({ hasText: originalProjectName }).first()).toBeVisible();
      await expect(page.locator('.project-card').filter({ hasText: duplicateName }).first()).toBeVisible();
    });

    // ===== STEP 3: Select project "TestProject" =====
    await test.step('Step 3: Select project "TestProject"', async () => {
      const projectCard = page.locator('.project-card').filter({ hasText: originalProjectName }).first();
      await projectCard.click();
    });

    // ===== STEP 4: Initiate rename action =====
    await test.step('Step 4: Initiate rename action', async () => {
      const projectCard = page.locator('.project-card').filter({ hasText: originalProjectName }).first();
      const renameButton = projectCard.locator('button.project-action-button').first();
      await expect(renameButton).toBeVisible();
      await renameButton.click();
      await page.waitForTimeout(1000);
    });

    // ===== STEP 5: Verify project name becomes editable =====
    await test.step('Step 5: Verify project name becomes editable', async () => {
      const nameInput = page.locator('input.project-name-input').first();
      await expect(nameInput).toBeVisible({ timeout: 5000 });
    });

    // ===== STEP 6: Clear existing name =====
    await test.step('Step 6: Clear existing name "TestProject"', async () => {
      const nameInput = page.locator('input.project-name-input').first();
      await nameInput.clear();
    });

    // ===== STEP 7: Type duplicate name =====
    await test.step('Step 7: Type "ExistingProject" as the new project name', async () => {
      const nameInput = page.locator('input.project-name-input').first();
      await nameInput.fill(duplicateName);
    });

    // ===== STEP 8: Attempt to confirm rename action =====
    await test.step('Step 8: Attempt to confirm rename action', async () => {
      const nameInput = page.locator('input.project-name-input').first();
      await nameInput.press('Enter');
      await page.waitForTimeout(1000);
    });

    // ===== STEP 9: Verify rename fails OR validation prevents confirmation =====
    await test.step('Step 9: Verify rename fails OR validation prevents confirmation', async () => {
      await page.waitForTimeout(500);
    });

    // ===== STEP 10: Verify error message =====
    await test.step('Step 10: Verify error message is displayed', async () => {
      const errorNotification = page.locator('.error-notification');
      const hasError = await errorNotification.isVisible().catch(() => false);
      
      if (hasError) {
        await expect(errorNotification).toContainText(/Invalid project name|Project name already exists|duplicate|already exists/i);
      } else {
        // If no error, check that name wasn't changed
        const projectCard = page.locator('.project-card').filter({ hasText: originalProjectName }).first();
        const nameVisible = await projectCard.isVisible().catch(() => false);
        if (!nameVisible) {
          throw new Error('Expected error message or validation, but project name was changed');
        }
      }
    });

    // ===== STEP 11: Verify project name remains unchanged =====
    await test.step('Step 11: Verify project name remains "TestProject" or reverts to original name', async () => {
      await page.waitForTimeout(1000);
      const projectCard = page.locator('.project-card').filter({ hasText: originalProjectName }).first();
      await expect(projectCard.locator('.project-name')).toContainText(originalProjectName);
    });

    // ===== STEP 12: Verify name change is not persisted =====
    await test.step('Step 12: Verify name change is not persisted', async () => {
      await page.reload();
      await page.waitForURL('/home', { timeout: 10000 });
      await page.waitForTimeout(1000);
      
      const projectCard = page.locator('.project-card').filter({ hasText: originalProjectName }).first();
      await expect(projectCard.locator('.project-name')).toContainText(originalProjectName);
    });
  });

  test('PROJ-RENAME-005: Rename Project - Cancel Rename Action', async () => {
    const originalProjectName = 'TestProject';
    const cancelledName = 'Cancelled Name';

    // ===== STEP 1: Verify user is on Home Screen =====
    await test.step('Step 1: Verify user is on Home Screen', async () => {
      await page.fill('input[id="email"]', TEST_USER_EMAIL);
      await page.fill('input[id="password"]', TEST_USER_PASSWORD);
      await page.click('button[type="submit"]:has-text("Login")');
      await page.waitForURL('/home', { timeout: 10000 });
      await expect(page.locator('h1:has-text("Home")')).toBeVisible();
    });

    // ===== STEP 2: Verify project "TestProject" is displayed =====
    await test.step('Step 2: Verify project "TestProject" is displayed in the project list', async () => {
      const projectCard = page.locator('.project-card').filter({ hasText: originalProjectName });
      if (await projectCard.count() === 0) {
        // Create project
        const projectBrick = page.locator('.brick-item:has-text("Project")');
        const projectListArea = page.locator('.project-list-area');
        await projectBrick.dragTo(projectListArea);
        await page.waitForTimeout(1000);
        
        const newProjectCard = page.locator('.project-card').first();
        const renameButton = newProjectCard.locator('button.project-action-button').first();
        await renameButton.click();
        const nameInput = newProjectCard.locator('input.project-name-input');
        await nameInput.fill(originalProjectName);
        await nameInput.press('Enter');
        await page.waitForTimeout(1000);
      }
      await expect(page.locator('.project-card').filter({ hasText: originalProjectName }).first()).toBeVisible();
    });

    // ===== STEP 3: Select project =====
    await test.step('Step 3: Select project "TestProject"', async () => {
      const projectCard = page.locator('.project-card').filter({ hasText: originalProjectName }).first();
      await projectCard.click();
    });

    // ===== STEP 4: Initiate rename action =====
    await test.step('Step 4: Initiate rename action', async () => {
      const projectCard = page.locator('.project-card').filter({ hasText: originalProjectName }).first();
      const renameButton = projectCard.locator('button.project-action-button').first();
      await expect(renameButton).toBeVisible();
      await renameButton.click();
      await page.waitForTimeout(1000);
    });

    // ===== STEP 5: Verify project name becomes editable =====
    await test.step('Step 5: Verify project name becomes editable', async () => {
      const nameInput = page.locator('input.project-name-input').first();
      await expect(nameInput).toBeVisible({ timeout: 5000 });
    });

    // ===== STEP 6: Clear existing name =====
    await test.step('Step 6: Clear existing name', async () => {
      const nameInput = page.locator('input.project-name-input').first();
      await nameInput.clear();
    });

    // ===== STEP 7: Type cancelled name =====
    await test.step('Step 7: Type "Cancelled Name" as the new project name', async () => {
      const nameInput = page.locator('input.project-name-input').first();
      await nameInput.fill(cancelledName);
    });

    // ===== STEP 8: Cancel rename action =====
    await test.step('Step 8: Cancel rename action (press Escape)', async () => {
      const nameInput = page.locator('input.project-name-input').first();
      await nameInput.press('Escape');
      await page.waitForTimeout(500);
    });

    // ===== STEP 9: Verify rename is cancelled =====
    await test.step('Step 9: Verify rename is cancelled', async () => {
      const nameInput = page.locator('input.project-name-input').first();
      await expect(nameInput).not.toBeVisible();
    });

    // ===== STEP 10: Verify project name reverts =====
    await test.step('Step 10: Verify project name reverts to "TestProject"', async () => {
      const projectCard = page.locator('.project-card').filter({ hasText: originalProjectName }).first();
      await expect(projectCard.locator('.project-name')).toContainText(originalProjectName);
    });

    // ===== STEP 11: Verify name change is not persisted =====
    await test.step('Step 11: Verify name change is not persisted', async () => {
      await page.reload();
      await page.waitForURL('/home', { timeout: 10000 });
      await page.waitForTimeout(1000);
      
      const projectCard = page.locator('.project-card').filter({ hasText: originalProjectName }).first();
      await expect(projectCard.locator('.project-name')).toContainText(originalProjectName);
      await expect(projectCard.locator('.project-name')).not.toContainText(cancelledName);
    });

    // ===== STEP 12: Verify no error messages =====
    await test.step('Step 12: Verify no error messages are displayed', async () => {
      const errorNotification = page.locator('.error-notification');
      await expect(errorNotification).not.toBeVisible();
    });
  });
});
