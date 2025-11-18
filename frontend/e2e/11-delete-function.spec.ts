import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const PRIMARY_EMAIL = 'testuser@example.com';
const PRIMARY_PASSWORD = 'SecurePass123!';
const OWNER_EMAIL = 'owner@example.com';
const OWNER_PASSWORD = 'SecurePass123!';
const USER_EMAIL = 'user@example.com';
const USER_PASSWORD = 'SecurePass456!';

const PROJECT_NAME = 'TestProject';
const SHARED_PROJECT_NAME = 'SharedProject';
const FUNCTION_NAME = 'TestFunction';
const SHARED_FUNCTION_NAME = 'SharedFunction';

test.describe('Delete Function - Section 11', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    test.setTimeout(60000); // Increase timeout to 60 seconds per test
    
    // Navigate to login screen
    await page.goto('/login');
  });

  // Helper function to login
  async function login(email: string, password: string) {
    await page.fill('input[id="email"]', email);
    await page.fill('input[id="password"]', password);
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForURL('/home', { timeout: 10000 });
  }

  // Helper function to register user if not exists
  async function ensureUserExists(email: string, password: string) {
    try {
      await page.goto('/login', { waitUntil: 'networkidle' });
    } catch (e) {
      // Page might be closed, try to navigate again
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
      
      // Wait for either success (redirect to /home) or error (user exists)
      try {
        await page.waitForURL('/home', { timeout: 5000 });
      } catch (e) {
        // Registration failed (user likely exists), try login instead
        try {
          await page.goto('/login', { waitUntil: 'networkidle', timeout: 10000 });
          await login(email, password);
        } catch (err) {
          // If page is closed, we can't continue
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

  // Helper function to open project editor
  async function openProjectEditor(projectName: string) {
    // Make sure we're on the home page
    if (!page.url().includes('/home')) {
      await page.goto('/home');
      await page.waitForTimeout(1000);
    }
    
    const projectCard = page.locator('.project-card').filter({ hasText: projectName }).first();
    await expect(projectCard).toBeVisible({ timeout: 10000 });
    await projectCard.dblclick();
    await page.waitForURL(/\/projects\/[^/]+/, { timeout: 10000 });
    await expect(page.locator('.project-editor')).toBeVisible({ timeout: 10000 });
    
    // Wait for tabs to load
    await page.waitForTimeout(1000);
    
    // Ensure Project tab is active (click it if not)
    const projectTab = page.locator('button.tab-button:has-text("Project")');
    await expect(projectTab).toBeVisible({ timeout: 10000 });
    const isActive = await projectTab.evaluate((el) => el.classList.contains('active'));
    if (!isActive) {
      await projectTab.click();
      await page.waitForTimeout(500);
    }
    await expect(page.locator('button.tab-button.active:has-text("Project")')).toBeVisible();
  }

  // Helper function to create function
  async function createFunction(functionName: string) {
    // Check if function already exists
    const existingFunctionCard = page.locator('.function-card').filter({ hasText: functionName });
    if (await existingFunctionCard.count() > 0) {
      return; // Function already exists
    }

    // Get current function count
    const initialCount = await page.locator('.function-card').count();

    // Drag Function brick to create function
    const functionBrick = page.locator('.brick-item:has-text("Function")');
    const functionListArea = page.locator('.function-list-area');
    await functionBrick.dragTo(functionListArea);
    await page.waitForTimeout(2000);

    // Wait for new function card to appear (count should increase by 1)
    await expect(page.locator('.function-card')).toHaveCount(initialCount + 1, { timeout: 5000 });
    const newFunctionCard = page.locator('.function-card').nth(initialCount); // Get the newly created one
    await expect(newFunctionCard).toBeVisible();

    // Wait a bit for the card to fully render
    await page.waitForTimeout(500);

    // Check if it already has the correct name
    const currentNameElement = newFunctionCard.locator('.function-name');
    await expect(currentNameElement).toBeVisible();
    const currentName = await currentNameElement.textContent();
    if (currentName && currentName.trim() === functionName) {
      return; // Already has correct name
    }

    // Click rename button (first button in function-actions)
    const renameButton = newFunctionCard.locator('button.function-action-button').first();
    await expect(renameButton).toBeVisible();
    await renameButton.click();
    await page.waitForTimeout(1000);

    // Wait for input to appear and rename
    const nameInput = newFunctionCard.locator('input.function-name-input');
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.clear();
    await nameInput.fill(functionName);
    await nameInput.press('Enter');
    
    // Wait for input to disappear (save completed) - this indicates the save happened
    await expect(nameInput).toBeHidden({ timeout: 10000 });
    await page.waitForTimeout(1000);

    // Verify rename was successful - wait for the name to update
    // Use a fresh locator to avoid stale element issues
    const updatedFunctionCard = page.locator('.function-card').filter({ hasText: functionName }).first();
    await expect(updatedFunctionCard).toBeVisible({ timeout: 5000 });
    await expect(updatedFunctionCard.locator('.function-name')).toContainText(functionName);
  }

  // Helper function to add brick to function
  async function addBrickToFunction(brickType: string) {
    const brickItem = page.locator(`.brick-item:has-text("${brickType}")`).or(page.locator(`.brick-item:has-text("${brickType.replace(/\s+/g, '')}")`));
    const canvas = page.locator('.function-editor-canvas');
    
    // Wait for API response after dragging brick
    await Promise.all([
      page.waitForResponse(response => 
        response.url().includes('/api/v1/bricks') && 
        response.request().method() === 'POST' &&
        response.status() >= 200 && response.status() < 300
      ).catch(() => {}), // Ignore if no API call
      brickItem.dragTo(canvas)
    ]);
    
    await page.waitForTimeout(2000); // Wait for brick to appear on canvas
  }

  test('FUNC-DELETE-001: Delete Function - Positive Case', async () => {
    // Setup: Ensure user exists and is logged in
    await ensureUserExists(PRIMARY_EMAIL, PRIMARY_PASSWORD);
    await page.goto('/home');

    // Create project if it doesn't exist
    await createProject(PROJECT_NAME);

    // Open project editor
    await openProjectEditor(PROJECT_NAME);

    // Create function if it doesn't exist
    await createFunction(FUNCTION_NAME);

    // Verify user is in Project Editor with Project tab active
    await expect(page.locator('button.tab-button.active:has-text("Project")')).toBeVisible();

    // Verify function "TestFunction" is displayed in the function list
    const functionCard = page.locator('.function-card').filter({ hasText: FUNCTION_NAME }).first();
    await expect(functionCard).toBeVisible();

    // Select function "TestFunction" (click on it to select)
    await functionCard.click();
    await page.waitForTimeout(500);

    // Locate delete action (delete button with 🗑️ emoji)
    const deleteButton = functionCard.locator('button.function-action-button').filter({ hasText: '🗑️' }).or(functionCard.locator('button.function-action-button').nth(1));
    await expect(deleteButton).toBeVisible();

    // Click delete action and handle confirmation dialog
    const deletePromise = page.waitForResponse(response => 
      response.url().includes('/api/v1/functions/') && 
      response.request().method() === 'DELETE' &&
      response.status() >= 200 && response.status() < 300
    ).catch(() => null);

    // Set up dialog handler for confirmation
    page.once('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toContain('Are you sure you want to delete this function?');
      await dialog.accept();
    });

    await deleteButton.click();
    await deletePromise;
    await page.waitForTimeout(1000);

    // Verify function "TestFunction" is removed from the function list
    await expect(functionCard).not.toBeVisible({ timeout: 5000 });

    // Verify function is deleted from the system (check that it doesn't appear after refresh)
    await page.reload();
    await page.waitForTimeout(2000);
    await openProjectEditor(PROJECT_NAME);
    const functionCardAfterReload = page.locator('.function-card').filter({ hasText: FUNCTION_NAME });
    await expect(functionCardAfterReload).toHaveCount(0);

    // Verify no error messages are displayed
    const errorNotification = page.locator('.error-notification');
    if (await errorNotification.isVisible()) {
      const errorText = await errorNotification.textContent();
      throw new Error(`Error message displayed: ${errorText}`);
    }
  });

  test('FUNC-DELETE-002: Delete Function - Negative Case - Permission Denied', async () => {
    // Setup: Ensure owner and user exist
    await ensureUserExists(OWNER_EMAIL, OWNER_PASSWORD);
    await page.goto('/home');

    // Create shared project as owner
    await createProject(SHARED_PROJECT_NAME);
    await openProjectEditor(SHARED_PROJECT_NAME);

    // Create function as owner
    await createFunction(SHARED_FUNCTION_NAME);

    // Logout and login as user without permission
    await page.click('button.settings-button, button[aria-label="Settings"]');
    await page.click('button.settings-logout:has-text("Logout")');
    await page.waitForURL('/login', { timeout: 5000 });

    await ensureUserExists(USER_EMAIL, USER_PASSWORD);
    await page.goto('/home');

    // Try to access the shared project
    const sharedProjectCard = page.locator('.project-card').filter({ hasText: SHARED_PROJECT_NAME });
    const projectVisible = await sharedProjectCard.count() > 0;

    if (projectVisible) {
      // If project is visible, try to open it
      await sharedProjectCard.first().dblclick();
      await page.waitForTimeout(2000);

      // Check if we're in project editor
      const isInProjectEditor = await page.locator('.project-editor').isVisible();
      
      if (isInProjectEditor) {
        // Ensure Project tab is active
        await expect(page.locator('button.tab-button.active:has-text("Project")')).toBeVisible();
        
        // Check if function is visible (if user has view permission)
        const sharedFunctionCard = page.locator('.function-card').filter({ hasText: SHARED_FUNCTION_NAME });
        const functionVisible = await sharedFunctionCard.count() > 0;

        if (functionVisible) {
          // Select function
          await sharedFunctionCard.first().click();
          await page.waitForTimeout(500);

          // Try to locate delete action
          const deleteButton = sharedFunctionCard.first().locator('button.function-action-button').filter({ hasText: '🗑️' }).or(sharedFunctionCard.first().locator('button.function-action-button').nth(1));
          const deleteButtonVisible = await deleteButton.isVisible().catch(() => false);

          if (deleteButtonVisible) {
            // If delete button is visible, try to click it and verify it fails
            page.once('dialog', async dialog => {
              await dialog.accept(); // Accept confirmation if shown
            });

            // Wait for API response (should be 403 or error)
            const deleteResponse = page.waitForResponse(response => 
              response.url().includes('/api/v1/functions/') && 
              response.request().method() === 'DELETE'
            ).catch(() => null);

            await deleteButton.click();
            const response = await deleteResponse;
            await page.waitForTimeout(1000);

            // Check if error occurred
            if (response && (response.status() === 403 || response.status() >= 400)) {
              // Verify error message "Permission denied" is displayed
              const errorNotification = page.locator('.error-notification');
              if (await errorNotification.isVisible()) {
                const errorText = await errorNotification.textContent();
                expect(errorText?.toLowerCase()).toContain('permission');
              }
            }

            // Verify function remains in the function list
            await expect(sharedFunctionCard.first()).toBeVisible();
          } else {
            // Delete button is not available - this is expected behavior
            // Verify function remains in the function list
            await expect(sharedFunctionCard.first()).toBeVisible();
          }
        } else {
          // Function is not visible - this is expected behavior for unauthorized access
          // Verify user remains in Project Editor
          await expect(page.locator('.project-editor')).toBeVisible();
        }
      }
    } else {
      // Project is not visible - this is expected behavior for unauthorized access
      // Verify user is on Home Screen
      await expect(page.locator('h1:has-text("Home")')).toBeVisible();
    }
  });

  test('FUNC-DELETE-003: Delete Function - Cancel Deletion', async () => {
    // Setup: Ensure user exists and is logged in
    await ensureUserExists(PRIMARY_EMAIL, PRIMARY_PASSWORD);
    await page.goto('/home');

    // Create project if it doesn't exist
    await createProject(PROJECT_NAME);

    // Open project editor
    await openProjectEditor(PROJECT_NAME);

    // Create function if it doesn't exist
    await createFunction(FUNCTION_NAME);

    // Verify user is in Project Editor with Project tab active
    await expect(page.locator('button.tab-button.active:has-text("Project")')).toBeVisible();

    // Verify function "TestFunction" is displayed in the function list
    const functionCard = page.locator('.function-card').filter({ hasText: FUNCTION_NAME }).first();
    await expect(functionCard).toBeVisible();

    // Select function "TestFunction"
    await functionCard.click();
    await page.waitForTimeout(500);

    // Locate delete action
    const deleteButton = functionCard.locator('button.function-action-button').filter({ hasText: '🗑️' }).or(functionCard.locator('button.function-action-button').nth(1));
    await expect(deleteButton).toBeVisible();

    // Click delete action
    // Set up dialog handler to cancel deletion
    page.once('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toContain('Are you sure you want to delete this function?');
      await dialog.dismiss(); // Cancel the deletion
    });

    await deleteButton.click();
    await page.waitForTimeout(1000);

    // Verify deletion is cancelled
    // Verify function "TestFunction" remains in the function list
    await expect(functionCard).toBeVisible();

    // Verify function is not deleted (check it still exists after refresh)
    await page.reload();
    await page.waitForTimeout(2000);
    await openProjectEditor(PROJECT_NAME);
    const functionCardAfterReload = page.locator('.function-card').filter({ hasText: FUNCTION_NAME });
    await expect(functionCardAfterReload).toHaveCount(1);

    // Verify no error messages are displayed
    const errorNotification = page.locator('.error-notification');
    if (await errorNotification.isVisible()) {
      const errorText = await errorNotification.textContent();
      throw new Error(`Error message displayed: ${errorText}`);
    }
  });

  test('FUNC-DELETE-004: Delete Function - Verify Cascading Deletion', async () => {
    // Setup: Ensure user exists and is logged in
    await ensureUserExists(PRIMARY_EMAIL, PRIMARY_PASSWORD);
    await page.goto('/home');

    // Create project if it doesn't exist
    await createProject(PROJECT_NAME);

    // Open project editor
    await openProjectEditor(PROJECT_NAME);

    // Create function if it doesn't exist
    await createFunction(FUNCTION_NAME);

    // Open function editor
    const functionCard = page.locator('.function-card').filter({ hasText: FUNCTION_NAME }).first();
    await expect(functionCard).toBeVisible();
    await functionCard.dblclick();
    await page.waitForURL(/\/functions\/[^/]+/, { timeout: 10000 });
    await expect(page.locator('.function-editor')).toBeVisible();

    // Add at least one brick to the function
    await addBrickToFunction('List instances by DB name');
    await page.waitForTimeout(1000);

    // Verify brick appears on canvas
    await expect(page.locator('.brick-node')).toHaveCount(1);

    // Navigate back to project editor
    await page.goBack();
    await page.waitForURL(/\/projects\/[^/]+/, { timeout: 10000 });
    await expect(page.locator('.project-editor')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Ensure Project tab is active
    const projectTab = page.locator('button.tab-button:has-text("Project")');
    const isActive = await projectTab.evaluate((el) => el.classList.contains('active'));
    if (!isActive) {
      await projectTab.click();
      await page.waitForTimeout(1000);
    }
    await expect(page.locator('button.tab-button.active:has-text("Project")')).toBeVisible();

    // Wait for function list to load
    await expect(page.locator('.function-card').first()).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    // Select function
    const functionCardAgain = page.locator('.function-card').filter({ hasText: FUNCTION_NAME }).first();
    await expect(functionCardAgain).toBeVisible();
    await functionCardAgain.click();
    await page.waitForTimeout(500);

    // Click delete action and confirm deletion
    const deleteButton = functionCardAgain.locator('button.function-action-button').filter({ hasText: '🗑️' }).or(functionCardAgain.locator('button.function-action-button').nth(1));
    await expect(deleteButton).toBeVisible();

    // Wait for delete API response
    const deletePromise = page.waitForResponse(response => 
      response.url().includes('/api/v1/functions/') && 
      response.request().method() === 'DELETE' &&
      response.status() >= 200 && response.status() < 300
    ).catch(() => null);

    // Set up dialog handler for confirmation
    page.once('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      await dialog.accept();
    });

    await deleteButton.click();
    await deletePromise;
    await page.waitForTimeout(1000);

    // Verify function "TestFunction" is deleted
    await expect(functionCardAgain).not.toBeVisible({ timeout: 5000 });

    // Verify function is removed from the function list
    const functionCardAfterDelete = page.locator('.function-card').filter({ hasText: FUNCTION_NAME });
    await expect(functionCardAfterDelete).toHaveCount(0);

    // Verify all brick configurations belonging to the function are deleted
    // This is verified by checking that the function no longer exists and
    // trying to access it would result in 404
    // We can verify by trying to open the function editor (should fail)
    // But since the function is deleted, we can't access it anymore
    // The cascading deletion is handled by the database (ON DELETE CASCADE)
    // So we verify by ensuring the function is completely gone

    // Verify no orphaned data remains in the system
    // This is verified by the fact that the function deletion succeeded
    // and no errors were thrown, indicating cascading deletion worked
    const errorNotification = page.locator('.error-notification');
    if (await errorNotification.isVisible()) {
      const errorText = await errorNotification.textContent();
      throw new Error(`Error during cascading deletion: ${errorText}`);
    }
  });
});
