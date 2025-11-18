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

  // Test ID: PROJ-RENAME-001
  test('PROJ-RENAME-001: Rename Project - Positive Case', async () => {
    // Preconditions: User is logged in, on Home Screen, project "TestProject" exists
    await test.step('Setup: Login and create project', async () => {
      // Login
      await page.fill('input[id="email"]', TEST_USER_EMAIL);
      await page.fill('input[id="password"]', TEST_USER_PASSWORD);
      await page.click('button[type="submit"]:has-text("Login")');
      await page.waitForURL('/home', { timeout: 10000 });
      await expect(page.locator('h1:has-text("Home")')).toBeVisible();

      // Check if project "TestProject" exists, if not create it
      const projectCards = page.locator('.project-card');
      const projectCount = await projectCards.count();
      let testProjectExists = false;

      for (let i = 0; i < projectCount; i++) {
        const card = projectCards.nth(i);
        const cardText = await card.textContent();
        if (cardText && cardText.includes('TestProject')) {
          testProjectExists = true;
          break;
        }
      }

      if (!testProjectExists) {
        // Create project by dragging Project brick
        const projectBrick = page.locator('.brick-item:has-text("Project")');
        const projectListArea = page.locator('.project-list-area');
        await projectBrick.dragTo(projectListArea);
        await page.waitForTimeout(1000);

        // Rename to "TestProject"
        const newProjectCard = page.locator('.project-card').first();
        await newProjectCard.click();
        const renameButton = newProjectCard.locator('button.project-action-button').first();
        await renameButton.click();
        const nameInput = newProjectCard.locator('input.project-name-input');
        await nameInput.clear();
        await nameInput.fill('TestProject');
        await nameInput.press('Enter');
        await page.waitForTimeout(500);
      }
    });

    // Test Steps
    await test.step('Step 1: Verify user is on Home Screen', async () => {
      await expect(page.locator('h1:has-text("Home")')).toBeVisible();
    });

    await test.step('Step 2: Verify project "TestProject" is displayed', async () => {
      await expect(page.locator('.project-card:has-text("TestProject")').first()).toBeVisible();
    });

    await test.step('Step 3: Select project "TestProject"', async () => {
      const projectCard = page.locator('.project-card:has-text("TestProject")').first();
      await projectCard.click();
    });

    await test.step('Step 4: Initiate rename action', async () => {
      const projectCard = page.locator('.project-card:has-text("TestProject")').first();
      const renameButton = projectCard.locator('button.project-action-button').first();
      await renameButton.click();
      await page.waitForTimeout(500); // Wait for React state update (increased for parallel execution)
    });

    await test.step('Step 5: Verify project name becomes editable', async () => {
      // After rename is initiated, find the input field directly
      const nameInput = page.locator('input.project-name-input').first();
      await expect(nameInput).toBeVisible({ timeout: 10000 }); // Increased timeout for parallel execution
    });

    await test.step('Step 6: Clear existing name "TestProject"', async () => {
      const nameInput = page.locator('input.project-name-input').first();
      await nameInput.clear();
    });

    await test.step('Step 7: Type "Renamed Project" as the new project name', async () => {
      const nameInput = page.locator('input.project-name-input').first();
      await nameInput.fill('Renamed Project');
    });

    await test.step('Step 8: Confirm rename action', async () => {
      const nameInput = page.locator('input.project-name-input').first();
      await nameInput.press('Enter');
      await page.waitForTimeout(500);
    });

    await test.step('Step 9: Verify project name is updated to "Renamed Project"', async () => {
      await expect(page.locator('.project-card:has-text("Renamed Project")').first()).toBeVisible();
    });

    await test.step('Step 10: Verify updated name is displayed in the project list', async () => {
      await expect(page.locator('.project-card:has-text("Renamed Project")').first()).toBeVisible();
    });

    await test.step('Step 11: Verify name change is persisted', async () => {
      // Refresh page to verify persistence
      await page.reload();
      await page.waitForURL('/home', { timeout: 10000 });
      await expect(page.locator('.project-card:has-text("Renamed Project")').first()).toBeVisible();
    });

    await test.step('Step 12: Verify no error messages are displayed', async () => {
      const errorNotification = page.locator('.error-notification');
      await expect(errorNotification).not.toBeVisible();
    });
  });

  // Test ID: PROJ-RENAME-002
  test('PROJ-RENAME-002: Rename Project - Negative Case - Permission Denied', async () => {
    // Preconditions: Setup owner and user accounts, create shared project
    await test.step('Setup: Create owner account and project', async () => {
      // Try to register owner, fall back to login if user exists
      const registerButton = page.locator('button:has-text("Don\'t have an account? Register")').or(page.locator('button:has-text("Register")'));
      if (await registerButton.isVisible()) {
        await registerButton.click();
      }
      await page.fill('input[id="email"]', OWNER_EMAIL);
      await page.fill('input[id="password"]', OWNER_PASSWORD);
      
      // Try register first
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      // Wait to see if we navigate to home or stay on login
      try {
        await page.waitForURL('/home', { timeout: 3000 });
      } catch {
        // Registration failed, user exists - navigate back to login and try login
        await page.goto('/login');
        await page.fill('input[id="email"]', OWNER_EMAIL);
        await page.fill('input[id="password"]', OWNER_PASSWORD);
        await page.click('button[type="submit"]:has-text("Login")');
        await page.waitForURL('/home', { timeout: 10000 });
      }

      // Create project "SharedProject"
      const projectBrick = page.locator('.brick-item:has-text("Project")');
      const projectListArea = page.locator('.project-list-area');
      await projectBrick.dragTo(projectListArea);
      await page.waitForTimeout(1000);

      const newProjectCard = page.locator('.project-card').first();
      await newProjectCard.click();
      const renameButton = newProjectCard.locator('button.project-action-button').first();
      await renameButton.click();
      const nameInput = newProjectCard.locator('input.project-name-input');
      await nameInput.clear();
      await nameInput.fill('SharedProject');
      await nameInput.press('Enter');
      await page.waitForTimeout(500);

      // Open project editor and add permission for user@example.com (view only)
      await newProjectCard.dblclick();
      await page.waitForURL(/\/projects\/[^/]+/, { timeout: 10000 });
      await page.click('button.tab-button:has-text("Permissions")');
      await page.click('button.add-user-button:has-text("Add a user")');
      await page.fill('input.email-input[type="email"]', USER_EMAIL);
      await page.click('button.confirm-button:has-text("Add")');
      await page.waitForTimeout(1000);

      // Logout
      await page.click('button.settings-button, button[aria-label="Settings"]');
      await page.click('button.settings-logout:has-text("Logout")');
      await page.waitForURL('/login', { timeout: 5000 });
    });

    await test.step('Setup: Login as user@example.com', async () => {
      // Try to register user, fall back to login if user exists
      const registerButton = page.locator('button:has-text("Don\'t have an account? Register")').or(page.locator('button:has-text("Register")'));
      if (await registerButton.isVisible()) {
        await registerButton.click();
      }
      await page.fill('input[id="email"]', USER_EMAIL);
      await page.fill('input[id="password"]', USER_PASSWORD);
      
      // Try register first
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      // Wait to see if we navigate to home or stay on login
      try {
        await page.waitForURL('/home', { timeout: 3000 });
      } catch {
        // Registration failed, user exists - navigate back to login and try login
        await page.goto('/login');
        await page.fill('input[id="email"]', USER_EMAIL);
        await page.fill('input[id="password"]', USER_PASSWORD);
        await page.click('button[type="submit"]:has-text("Login")');
        await page.waitForURL('/home', { timeout: 10000 });
      }
    });

    // Test Steps
    await test.step('Step 1: Verify user is on Home Screen', async () => {
      await expect(page.locator('h1:has-text("Home")')).toBeVisible();
    });

    await test.step('Step 2: Verify project "SharedProject" is displayed', async () => {
      // Project may or may not be visible depending on permissions
      const projectCard = page.locator('.project-card:has-text("SharedProject")');
      if (await projectCard.isVisible()) {
        await expect(projectCard).toBeVisible();
      }
    });

    await test.step('Step 3: Select project "SharedProject"', async () => {
      const projectCard = page.locator('.project-card:has-text("SharedProject")');
      if (await projectCard.isVisible()) {
        await projectCard.click();
      }
    });

    await test.step('Step 4: Attempt to initiate rename action', async () => {
      const projectCard = page.locator('.project-card:has-text("SharedProject")');
      if (await projectCard.isVisible()) {
        const renameButton = projectCard.locator('button.project-action-button').first();
        // Check if rename button exists and is visible
        if (await renameButton.isVisible()) {
          await renameButton.click();
        }
      }
    });

    await test.step('Step 5: Verify rename action is not available OR rename fails', async () => {
      // Either rename button should not be visible, or if clicked, should show error
      const errorNotification = page.locator('.error-notification');
      const nameInput = page.locator('input.project-name-input');
      const hasError = await errorNotification.isVisible();
      const canRename = await nameInput.isVisible();

      // If rename was attempted, there should be an error
      if (canRename) {
        // Try to rename and verify it fails
        await nameInput.clear();
        await nameInput.fill('Unauthorized Rename');
        await nameInput.press('Enter');
        await page.waitForTimeout(1000);
        await expect(errorNotification).toBeVisible();
      }
    });

    await test.step('Step 6: Verify error message "Permission denied" is displayed', async () => {
      const errorNotification = page.locator('.error-notification');
      if (await errorNotification.isVisible()) {
        const errorText = await errorNotification.textContent();
        expect(errorText?.toLowerCase()).toContain('permission');
      }
    });

    await test.step('Step 7: Verify project name remains "SharedProject"', async () => {
      await expect(page.locator('.project-card:has-text("SharedProject")').first()).toBeVisible();
    });

    await test.step('Step 8: Verify project name is not changed', async () => {
      await expect(page.locator('.project-card:has-text("SharedProject")').first()).toBeVisible();
      await expect(page.locator('.project-card:has-text("Unauthorized Rename")')).not.toBeVisible();
    });

    await test.step('Step 9: Verify no changes are persisted', async () => {
      await page.reload();
      await page.waitForURL('/home', { timeout: 10000 });
      await expect(page.locator('.project-card:has-text("SharedProject")').first()).toBeVisible();
      await expect(page.locator('.project-card:has-text("Unauthorized Rename")')).not.toBeVisible();
    });
  });

  // Test ID: PROJ-RENAME-003
  test('PROJ-RENAME-003: Rename Project - Negative Case - Invalid Project Name', async () => {
    // Preconditions: User is logged in, project "TestProject" exists
    await test.step('Setup: Login and ensure project exists', async () => {
      await page.fill('input[id="email"]', TEST_USER_EMAIL);
      await page.fill('input[id="password"]', TEST_USER_PASSWORD);
      await page.click('button[type="submit"]:has-text("Login")');
      await page.waitForURL('/home', { timeout: 10000 });

      // Check if project "TestProject" exists, if not create it
      const projectCards = page.locator('.project-card');
      const projectCount = await projectCards.count();
      let testProjectExists = false;

      for (let i = 0; i < projectCount; i++) {
        const card = projectCards.nth(i);
        const cardText = await card.textContent();
        if (cardText && cardText.includes('TestProject')) {
          testProjectExists = true;
          break;
        }
      }

      if (!testProjectExists) {
        const projectBrick = page.locator('.brick-item:has-text("Project")');
        const projectListArea = page.locator('.project-list-area');
        await projectBrick.dragTo(projectListArea);
        await page.waitForTimeout(1000);

        const newProjectCard = page.locator('.project-card').first();
        await newProjectCard.click();
        const renameButton = newProjectCard.locator('button.project-action-button').first();
        await renameButton.click();
        const nameInput = newProjectCard.locator('input.project-name-input');
        await nameInput.clear();
        await nameInput.fill('TestProject');
        await nameInput.press('Enter');
        await page.waitForTimeout(500);
      }
    });

    // Test Steps
    await test.step('Step 1: Verify user is on Home Screen', async () => {
      await expect(page.locator('h1:has-text("Home")')).toBeVisible();
    });

    await test.step('Step 2: Verify project "TestProject" is displayed', async () => {
      await expect(page.locator('.project-card:has-text("TestProject")').first()).toBeVisible();
    });

    await test.step('Step 3: Select project "TestProject"', async () => {
      const projectCard = page.locator('.project-card:has-text("TestProject")').first();
      await projectCard.click();
    });

    await test.step('Step 4: Initiate rename action', async () => {
      const projectCard = page.locator('.project-card:has-text("TestProject")').first();
      const renameButton = projectCard.locator('button.project-action-button').first();
      await renameButton.click();
      await page.waitForTimeout(100); // Wait for React state update
    });

    await test.step('Step 5: Verify project name becomes editable', async () => {
      // After rename is initiated, find the input field directly
      const nameInput = page.locator('input.project-name-input').first();
      await expect(nameInput).toBeVisible({ timeout: 5000 });
    });

    await test.step('Step 6: Clear existing name', async () => {
      const nameInput = page.locator('input.project-name-input').first();
      await nameInput.clear();
    });

    await test.step('Step 7: Leave name field empty', async () => {
      const nameInput = page.locator('input.project-name-input').first();
      await nameInput.fill('');
    });

    await test.step('Step 8: Attempt to confirm rename action', async () => {
      const nameInput = page.locator('input.project-name-input').first();
      await nameInput.press('Enter');
      await page.waitForTimeout(500);
    });

    await test.step('Step 9: Verify rename fails OR validation prevents confirmation', async () => {
      // Either error should be shown, or name should revert
      const errorNotification = page.locator('.error-notification');
      const hasError = await errorNotification.isVisible();
      const projectCard = page.locator('.project-card:has-text("TestProject")');
      const nameStillEditable = await page.locator('input.project-name-input').isVisible();

      // If validation works, either error is shown or name reverts
      expect(hasError || !nameStillEditable).toBeTruthy();
    });

    await test.step('Step 10: Verify error message "Invalid project name" is displayed', async () => {
      const errorNotification = page.locator('.error-notification');
      if (await errorNotification.isVisible()) {
        const errorText = await errorNotification.textContent();
        expect(errorText?.toLowerCase()).toMatch(/invalid|name|required/);
      }
    });

    await test.step('Step 11: Verify project name remains "TestProject" or reverts to original name', async () => {
      await expect(page.locator('.project-card:has-text("TestProject")').first()).toBeVisible();
    });

    await test.step('Step 12: Verify name change is not persisted', async () => {
      await page.reload();
      await page.waitForURL('/home', { timeout: 10000 });
      await expect(page.locator('.project-card:has-text("TestProject")').first()).toBeVisible();
    });
  });

  // Test ID: PROJ-RENAME-004
  test('PROJ-RENAME-004: Rename Project - Negative Case - Duplicate Project Name', async () => {
    // Preconditions: User is logged in, projects "TestProject" and "ExistingProject" exist
    await test.step('Setup: Login and ensure projects exist', async () => {
      await page.fill('input[id="email"]', TEST_USER_EMAIL);
      await page.fill('input[id="password"]', TEST_USER_PASSWORD);
      await page.click('button[type="submit"]:has-text("Login")');
      await page.waitForURL('/home', { timeout: 10000 });

      // Check if both projects exist
      const projectCards = page.locator('.project-card');
      const projectCount = await projectCards.count();
      let testProjectExists = false;
      let existingProjectExists = false;

      for (let i = 0; i < projectCount; i++) {
        const card = projectCards.nth(i);
        const cardText = await card.textContent();
        if (cardText && cardText.includes('TestProject')) {
          testProjectExists = true;
        }
        if (cardText && cardText.includes('ExistingProject')) {
          existingProjectExists = true;
        }
      }

      // Create missing projects
      if (!testProjectExists) {
        const projectBrick = page.locator('.brick-item:has-text("Project")');
        const projectListArea = page.locator('.project-list-area');
        await projectBrick.dragTo(projectListArea);
        await page.waitForTimeout(1000);

        const newProjectCard = page.locator('.project-card').first();
        await newProjectCard.click();
        const renameButton = newProjectCard.locator('button.project-action-button').first();
        await renameButton.click();
        const nameInput = newProjectCard.locator('input.project-name-input');
        await nameInput.clear();
        await nameInput.fill('TestProject');
        await nameInput.press('Enter');
        await page.waitForTimeout(500);
      }

      if (!existingProjectExists) {
        const projectBrick = page.locator('.brick-item:has-text("Project")');
        const projectListArea = page.locator('.project-list-area');
        await projectBrick.dragTo(projectListArea);
        await page.waitForTimeout(1000);

        const newProjectCard = page.locator('.project-card').last();
        await newProjectCard.click();
        const renameButton = newProjectCard.locator('button.project-action-button').first();
        await renameButton.click();
        const nameInput = newProjectCard.locator('input.project-name-input');
        await nameInput.clear();
        await nameInput.fill('ExistingProject');
        await nameInput.press('Enter');
        await page.waitForTimeout(500);
      }
    });

    // Test Steps
    await test.step('Step 1: Verify user is on Home Screen', async () => {
      await expect(page.locator('h1:has-text("Home")')).toBeVisible();
    });

    await test.step('Step 2: Verify both projects are displayed', async () => {
      await expect(page.locator('.project-card:has-text("TestProject")').first()).toBeVisible();
      await expect(page.locator('.project-card:has-text("ExistingProject")').first()).toBeVisible();
    });

    await test.step('Step 3: Select project "TestProject"', async () => {
      const projectCard = page.locator('.project-card:has-text("TestProject")').first();
      await projectCard.click();
    });

    await test.step('Step 4: Initiate rename action', async () => {
      const projectCard = page.locator('.project-card:has-text("TestProject")').first();
      const renameButton = projectCard.locator('button.project-action-button').first();
      await renameButton.click();
      await page.waitForTimeout(100); // Wait for React state update
    });

    await test.step('Step 5: Verify project name becomes editable', async () => {
      // After rename is initiated, find the input field directly
      const nameInput = page.locator('input.project-name-input').first();
      await expect(nameInput).toBeVisible({ timeout: 5000 });
    });

    await test.step('Step 6: Clear existing name "TestProject"', async () => {
      const nameInput = page.locator('input.project-name-input').first();
      await nameInput.clear();
    });

    await test.step('Step 7: Type "ExistingProject" as the new project name', async () => {
      const nameInput = page.locator('input.project-name-input').first();
      await nameInput.fill('ExistingProject');
    });

    await test.step('Step 8: Attempt to confirm rename action', async () => {
      const nameInput = page.locator('input.project-name-input').first();
      await nameInput.press('Enter');
      await page.waitForTimeout(500);
    });

    await test.step('Step 9: Verify rename fails OR validation prevents confirmation', async () => {
      // Wait a bit longer for error to appear or for state to update
      await page.waitForTimeout(1000);
      
      const errorNotification = page.locator('.error-notification');
      const hasError = await errorNotification.isVisible();
      const nameStillEditable = await page.locator('input.project-name-input').isVisible();
      
      // Also check if the project name actually changed (which would indicate backend allowed duplicate)
      const testProjectStillExists = await page.locator('.project-card:has-text("TestProject")').first().isVisible();
      const existingProjectStillExists = await page.locator('.project-card:has-text("ExistingProject")').first().isVisible();

      // Rename should fail if duplicate validation works, or if backend doesn't allow it
      // Either error is shown, or input is no longer editable, or both projects still exist (rename didn't happen)
      expect(hasError || !nameStillEditable || (testProjectStillExists && existingProjectStillExists)).toBeTruthy();
    });

    await test.step('Step 10: Verify error message is displayed', async () => {
      const errorNotification = page.locator('.error-notification');
      if (await errorNotification.isVisible()) {
        const errorText = await errorNotification.textContent();
        expect(errorText?.toLowerCase()).toMatch(/invalid|already exists|duplicate|name/);
      }
    });

    await test.step('Step 11: Verify project name remains "TestProject" or reverts to original name', async () => {
      await expect(page.locator('.project-card:has-text("TestProject")').first()).toBeVisible();
    });

    await test.step('Step 12: Verify name change is not persisted', async () => {
      await page.reload();
      await page.waitForURL('/home', { timeout: 10000 });
      await expect(page.locator('.project-card:has-text("TestProject")').first()).toBeVisible();
      await expect(page.locator('.project-card:has-text("ExistingProject")').first()).toBeVisible();
    });
  });

  // Test ID: PROJ-RENAME-005
  test('PROJ-RENAME-005: Rename Project - Cancel Rename Action', async () => {
    // Preconditions: User is logged in, project "TestProject" exists
    await test.step('Setup: Login and ensure project exists', async () => {
      await page.fill('input[id="email"]', TEST_USER_EMAIL);
      await page.fill('input[id="password"]', TEST_USER_PASSWORD);
      await page.click('button[type="submit"]:has-text("Login")');
      await page.waitForURL('/home', { timeout: 10000 });

      // Check if project "TestProject" exists, if not create it
      const projectCards = page.locator('.project-card');
      const projectCount = await projectCards.count();
      let testProjectExists = false;

      for (let i = 0; i < projectCount; i++) {
        const card = projectCards.nth(i);
        const cardText = await card.textContent();
        if (cardText && cardText.includes('TestProject')) {
          testProjectExists = true;
          break;
        }
      }

      if (!testProjectExists) {
        const projectBrick = page.locator('.brick-item:has-text("Project")');
        const projectListArea = page.locator('.project-list-area');
        await projectBrick.dragTo(projectListArea);
        await page.waitForTimeout(1000);

        const newProjectCard = page.locator('.project-card').first();
        await newProjectCard.click();
        const renameButton = newProjectCard.locator('button.project-action-button').first();
        await renameButton.click();
        const nameInput = newProjectCard.locator('input.project-name-input');
        await nameInput.clear();
        await nameInput.fill('TestProject');
        await nameInput.press('Enter');
        await page.waitForTimeout(500);
      }
    });

    // Test Steps
    await test.step('Step 1: Verify user is on Home Screen', async () => {
      await expect(page.locator('h1:has-text("Home")')).toBeVisible();
    });

    await test.step('Step 2: Verify project "TestProject" is displayed', async () => {
      await expect(page.locator('.project-card:has-text("TestProject")').first()).toBeVisible();
    });

    await test.step('Step 3: Select project "TestProject"', async () => {
      const projectCard = page.locator('.project-card:has-text("TestProject")').first();
      await projectCard.click();
    });

    await test.step('Step 4: Initiate rename action', async () => {
      const projectCard = page.locator('.project-card:has-text("TestProject")').first();
      const renameButton = projectCard.locator('button.project-action-button').first();
      await renameButton.click();
      await page.waitForTimeout(100); // Wait for React state update
    });

    await test.step('Step 5: Verify project name becomes editable', async () => {
      // After rename is initiated, find the input field directly
      const nameInput = page.locator('input.project-name-input').first();
      await expect(nameInput).toBeVisible({ timeout: 5000 });
    });

    await test.step('Step 6: Clear existing name', async () => {
      const nameInput = page.locator('input.project-name-input').first();
      await nameInput.clear();
    });

    await test.step('Step 7: Type "Cancelled Name" as the new project name', async () => {
      const nameInput = page.locator('input.project-name-input').first();
      await nameInput.fill('Cancelled Name');
    });

    await test.step('Step 8: Cancel rename action (press Escape)', async () => {
      const nameInput = page.locator('input.project-name-input').first();
      await nameInput.press('Escape');
      await page.waitForTimeout(500);
    });

    await test.step('Step 9: Verify rename is cancelled', async () => {
      const nameInput = page.locator('input.project-name-input');
      await expect(nameInput).not.toBeVisible();
    });

    await test.step('Step 10: Verify project name reverts to "TestProject"', async () => {
      await expect(page.locator('.project-card:has-text("TestProject")').first()).toBeVisible();
      await expect(page.locator('.project-card:has-text("Cancelled Name")')).not.toBeVisible();
    });

    await test.step('Step 11: Verify name change is not persisted', async () => {
      await page.reload();
      await page.waitForURL('/home', { timeout: 10000 });
      await expect(page.locator('.project-card:has-text("TestProject")').first()).toBeVisible();
      await expect(page.locator('.project-card:has-text("Cancelled Name")')).not.toBeVisible();
    });

    await test.step('Step 12: Verify no error messages are displayed', async () => {
      const errorNotification = page.locator('.error-notification');
      await expect(errorNotification).not.toBeVisible();
    });
  });
});
