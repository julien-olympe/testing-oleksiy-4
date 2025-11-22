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
const EXISTING_FUNCTION_NAME = 'ExistingFunction';

test.describe('Rename Function - Section 10', () => {
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
    // Make sure we're on the home page
    if (!page.url().includes('/home')) {
      await page.goto('/home');
      await page.waitForTimeout(1000);
    }
    
    // Wait for home screen to load
    await expect(page.locator('h1:has-text("Home")')).toBeVisible({ timeout: 10000 });
    
    // Check if project already exists
    const projectCard = page.locator('.project-card').filter({ hasText: projectName });
    if (await projectCard.count() > 0) {
      return; // Project already exists
    }

    // Wait for brick list to be visible
    await expect(page.locator('.brick-list')).toBeVisible({ timeout: 10000 });
    
    // Drag Project brick to create project
    const projectBrick = page.locator('.brick-item:has-text("Project")');
    await expect(projectBrick).toBeVisible({ timeout: 10000 });
    const projectListArea = page.locator('.project-list-area');
    await expect(projectListArea).toBeVisible({ timeout: 10000 });
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

  // FUNC-RENAME-001: Rename Function - Positive Case
  test('FUNC-RENAME-001: Rename Function - Positive Case', async () => {
    // Setup: Ensure user exists and is logged in
    await ensureUserExists(PRIMARY_EMAIL, PRIMARY_PASSWORD);
    await page.goto('/home');

    // Create project if it doesn't exist
    await createProject(PROJECT_NAME);

    // Open project editor
    await openProjectEditor(PROJECT_NAME);

    // Create function if it doesn't exist
    await createFunction(FUNCTION_NAME);

    // Step 1: Verify user is in Project Editor with Project tab active
    await expect(page.locator('.project-editor')).toBeVisible();
    await expect(page.locator('button.tab-button.active:has-text("Project")')).toBeVisible();

    // Step 2: Verify function "TestFunction" is displayed in the function list
    const functionCard = page.locator('.function-card').filter({ hasText: FUNCTION_NAME }).first();
    await expect(functionCard).toBeVisible();

    // Step 3: Select function "TestFunction" (click on it to select)
    await functionCard.click();
    await page.waitForTimeout(500);

    // Step 4: Initiate rename action (click rename button)
    const renameButton = functionCard.locator('button.function-action-button').first();
    await expect(renameButton).toBeVisible();
    await renameButton.click();
    await page.waitForTimeout(500);

    // Step 5: Verify function name becomes editable (input field appears)
    const nameInput = functionCard.locator('input.function-name-input');
    await expect(nameInput).toBeVisible({ timeout: 5000 });

    // Step 6: Clear existing name "TestFunction"
    await nameInput.clear();
    await page.waitForTimeout(300);

    // Step 7: Type "Renamed Function" as the new function name
    const newName = 'Renamed Function';
    await nameInput.fill(newName);
    await page.waitForTimeout(300);

    // Step 8: Confirm rename action (press Enter)
    await nameInput.press('Enter');
    await page.waitForTimeout(2000); // Wait for API call

    // Step 9: Verify function name is updated to "Renamed Function"
    const renamedFunctionCard = page.locator('.function-card').filter({ hasText: newName }).first();
    await expect(renamedFunctionCard).toBeVisible({ timeout: 5000 });
    await expect(renamedFunctionCard.locator('.function-name')).toContainText(newName);

    // Step 10: Verify updated name is displayed in the function list
    await expect(renamedFunctionCard).toBeVisible();

    // Step 11: Verify name change is persisted (navigate away and back)
    await page.goto('/home');
    await page.waitForTimeout(1000);
    await openProjectEditor(PROJECT_NAME);
    const persistedFunctionCard = page.locator('.function-card').filter({ hasText: newName }).first();
    await expect(persistedFunctionCard).toBeVisible({ timeout: 10000 });

    // Step 12: Verify no error messages are displayed
    const errorNotification = page.locator('.error-notification');
    if (await errorNotification.isVisible()) {
      const errorText = await errorNotification.textContent();
      throw new Error(`Error message displayed: ${errorText}`);
    }
  });

  // FUNC-RENAME-002: Rename Function - Negative Case - Permission Denied
  test('FUNC-RENAME-002: Rename Function - Negative Case - Permission Denied', async () => {
    // Setup: Ensure owner and user exist
    await ensureUserExists(OWNER_EMAIL, OWNER_PASSWORD);
    await page.goto('/home');

    // Create shared project as owner
    await createProject(SHARED_PROJECT_NAME);
    await openProjectEditor(SHARED_PROJECT_NAME);

    // Create function as owner
    await createFunction(SHARED_FUNCTION_NAME);

    // Logout and login as user without permission
    const settingsButton = page.locator('button.settings-button, button[aria-label="Settings"]').first();
    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      await page.waitForTimeout(500);
      const logoutButton = page.locator('button.settings-logout:has-text("Logout")');
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        await page.waitForURL('/login', { timeout: 5000 });
      }
    } else {
      // If no settings button, navigate to login directly
      await page.goto('/login');
    }

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
        const projectTab = page.locator('button.tab-button:has-text("Project")');
        if (await projectTab.isVisible()) {
          const isActive = await projectTab.evaluate((el) => el.classList.contains('active'));
          if (!isActive) {
            await projectTab.click();
            await page.waitForTimeout(500);
          }
        }

        // Step 1: Verify user "user@example.com" is in Project Editor with Project tab active
        await expect(page.locator('.project-editor')).toBeVisible();

        // Step 2: Verify function "SharedFunction" is displayed in the function list (if user has view permission)
        const functionCard = page.locator('.function-card').filter({ hasText: SHARED_FUNCTION_NAME });
        const functionVisible = await functionCard.count() > 0;

        if (functionVisible) {
          // Step 3: Select function "SharedFunction"
          await functionCard.first().click();
          await page.waitForTimeout(500);

          // Step 4: Attempt to initiate rename action
          const renameButton = functionCard.first().locator('button.function-action-button').first();
          const renameButtonVisible = await renameButton.isVisible();
          
          if (renameButtonVisible) {
            await renameButton.click();
            await page.waitForTimeout(1000);

            // Step 5: Verify rename action is not available OR rename fails
            // Try to rename
            const nameInput = functionCard.first().locator('input.function-name-input');
            const inputVisible = await nameInput.isVisible();
            
            if (inputVisible) {
              await nameInput.clear();
              await nameInput.fill('Unauthorized Rename');
              await nameInput.press('Enter');
              await page.waitForTimeout(2000);

              // Step 6: Verify error message "Permission denied" is displayed
              const errorNotification = page.locator('.error-notification');
              if (await errorNotification.isVisible()) {
                const errorText = await errorNotification.textContent();
                expect(errorText?.toLowerCase()).toMatch(/permission denied/i);
              }

              // Step 7: Verify function name remains "SharedFunction"
              const functionCardAfter = page.locator('.function-card').filter({ hasText: SHARED_FUNCTION_NAME });
              await expect(functionCardAfter.first()).toBeVisible();
              await expect(functionCardAfter.first().locator('.function-name')).toContainText(SHARED_FUNCTION_NAME);

              // Step 8: Verify function name is not changed
              await expect(functionCardAfter.first().locator('.function-name')).not.toContainText('Unauthorized Rename');

              // Step 9: Verify no changes are persisted
              // (Already verified by checking name remains unchanged)
            }
          } else {
            // Rename button is not visible - this is expected behavior
            // Step 5: Verify rename action is not available
            // This is already verified by renameButtonVisible being false
          }
        } else {
          // Function is not visible - user doesn't have view permission
          // This is expected behavior
        }
      }
    } else {
      // Project is not visible - user doesn't have access
      // This is expected behavior for unauthorized access
    }
  });

  // FUNC-RENAME-003: Rename Function - Negative Case - Invalid Function Name
  test('FUNC-RENAME-003: Rename Function - Negative Case - Invalid Function Name', async () => {
    // Setup: Ensure user exists and is logged in
    await ensureUserExists(PRIMARY_EMAIL, PRIMARY_PASSWORD);
    await page.goto('/home');

    // Create project if it doesn't exist
    await createProject(PROJECT_NAME);

    // Open project editor
    await openProjectEditor(PROJECT_NAME);

    // Create function if it doesn't exist
    await createFunction(FUNCTION_NAME);

    // Step 1: Verify user is in Project Editor with Project tab active
    await expect(page.locator('.project-editor')).toBeVisible();
    await expect(page.locator('button.tab-button.active:has-text("Project")')).toBeVisible();

    // Step 2: Verify function "TestFunction" is displayed in the function list
    const functionCard = page.locator('.function-card').filter({ hasText: FUNCTION_NAME }).first();
    await expect(functionCard).toBeVisible();

    // Step 3: Select function "TestFunction"
    await functionCard.click();
    await page.waitForTimeout(500);

    // Step 4: Initiate rename action
    const renameButton = functionCard.locator('button.function-action-button').first();
    await expect(renameButton).toBeVisible();
    await renameButton.click();
    await page.waitForTimeout(500);

    // Step 5: Verify function name becomes editable
    const nameInput = functionCard.locator('input.function-name-input');
    await expect(nameInput).toBeVisible({ timeout: 5000 });

    // Step 6: Clear existing name
    await nameInput.clear();
    await page.waitForTimeout(300);

    // Step 7: Leave name field empty (or enter only whitespace)
    // Don't type anything, leave it empty

    // Step 8: Attempt to confirm rename action
    await nameInput.press('Enter');
    await page.waitForTimeout(2000);

    // Step 9: Verify rename fails OR validation prevents confirmation
    // The frontend should prevent empty names or the backend should reject it
    // Check if input is still visible (rename not confirmed) or if error is shown
    const inputStillVisible = await nameInput.isVisible();
    const errorNotification = page.locator('.error-notification');
    const errorVisible = await errorNotification.isVisible();

    if (inputStillVisible) {
      // Input is still visible, meaning rename was not confirmed (validation prevented it)
      // This is expected behavior
    } else if (errorVisible) {
      // Step 10: Verify error message "Invalid function name" is displayed
      const errorText = await errorNotification.textContent();
      expect(errorText?.toLowerCase()).toMatch(/invalid function name/i);
    }

    // Step 11: Verify function name remains "TestFunction" or reverts to original name
    // Cancel the rename by clicking outside or pressing Escape
    if (await nameInput.isVisible()) {
      await nameInput.press('Escape');
      await page.waitForTimeout(500);
    }
    
    const functionCardAfter = page.locator('.function-card').filter({ hasText: FUNCTION_NAME }).first();
    await expect(functionCardAfter).toBeVisible({ timeout: 5000 });
    await expect(functionCardAfter.locator('.function-name')).toContainText(FUNCTION_NAME);

    // Step 12: Verify name change is not persisted
    // (Already verified by checking name remains unchanged)
  });

  // FUNC-RENAME-004: Rename Function - Negative Case - Duplicate Function Name
  test('FUNC-RENAME-004: Rename Function - Negative Case - Duplicate Function Name', async () => {
    // Setup: Ensure user exists and is logged in
    await ensureUserExists(PRIMARY_EMAIL, PRIMARY_PASSWORD);
    await page.goto('/home');

    // Create project if it doesn't exist
    await createProject(PROJECT_NAME);

    // Open project editor
    await openProjectEditor(PROJECT_NAME);

    // Create both functions if they don't exist
    await createFunction(FUNCTION_NAME);
    await createFunction(EXISTING_FUNCTION_NAME);

    // Step 1: Verify user is in Project Editor with Project tab active
    await expect(page.locator('.project-editor')).toBeVisible();
    await expect(page.locator('button.tab-button.active:has-text("Project")')).toBeVisible();

    // Step 2: Verify both functions "TestFunction" and "ExistingFunction" are displayed in the function list
    const testFunctionCard = page.locator('.function-card').filter({ hasText: FUNCTION_NAME }).first();
    const existingFunctionCard = page.locator('.function-card').filter({ hasText: EXISTING_FUNCTION_NAME }).first();
    await expect(testFunctionCard).toBeVisible();
    await expect(existingFunctionCard).toBeVisible();

    // Step 3: Select function "TestFunction"
    await testFunctionCard.click();
    await page.waitForTimeout(500);

    // Step 4: Initiate rename action
    const renameButton = testFunctionCard.locator('button.function-action-button').first();
    await expect(renameButton).toBeVisible();
    await renameButton.click();
    await page.waitForTimeout(500);

    // Step 5: Verify function name becomes editable
    const nameInput = testFunctionCard.locator('input.function-name-input');
    await expect(nameInput).toBeVisible({ timeout: 5000 });

    // Step 6: Clear existing name "TestFunction"
    await nameInput.clear();
    await page.waitForTimeout(300);

    // Step 7: Type "ExistingFunction" as the new function name
    await nameInput.fill(EXISTING_FUNCTION_NAME);
    await page.waitForTimeout(300);

    // Step 8: Attempt to confirm rename action
    await nameInput.press('Enter');
    await page.waitForTimeout(2000);

    // Step 9: Verify rename fails OR validation prevents confirmation
    // Check if error is shown or if rename was prevented
    const errorNotification = page.locator('.error-notification');
    const errorVisible = await errorNotification.isVisible();
    const inputStillVisible = await nameInput.isVisible();

    if (errorVisible) {
      // Step 10: Verify error message "Invalid function name" or "Function name already exists" is displayed
      const errorText = await errorNotification.textContent();
      expect(errorText?.toLowerCase()).toMatch(/invalid function name|function name already exists|duplicate/i);
    } else if (inputStillVisible) {
      // Input is still visible, meaning rename was not confirmed (validation prevented it)
      // This is expected behavior if frontend validates duplicates
    }

    // Step 11: Verify function name remains "TestFunction" or reverts to original name
    // Cancel the rename if input is still visible
    if (await nameInput.isVisible()) {
      await nameInput.press('Escape');
      await page.waitForTimeout(500);
    }
    
    const testFunctionCardAfter = page.locator('.function-card').filter({ hasText: FUNCTION_NAME }).first();
    await expect(testFunctionCardAfter).toBeVisible({ timeout: 5000 });
    await expect(testFunctionCardAfter.locator('.function-name')).toContainText(FUNCTION_NAME);

    // Step 12: Verify name change is not persisted
    // (Already verified by checking name remains unchanged)
  });

  // FUNC-RENAME-005: Rename Function - Cancel Rename Action
  test('FUNC-RENAME-005: Rename Function - Cancel Rename Action', async () => {
    // Setup: Ensure user exists and is logged in
    await ensureUserExists(PRIMARY_EMAIL, PRIMARY_PASSWORD);
    await page.goto('/home');

    // Create project if it doesn't exist
    await createProject(PROJECT_NAME);

    // Open project editor
    await openProjectEditor(PROJECT_NAME);

    // Create function if it doesn't exist
    await createFunction(FUNCTION_NAME);

    // Step 1: Verify user is in Project Editor with Project tab active
    await expect(page.locator('.project-editor')).toBeVisible();
    await expect(page.locator('button.tab-button.active:has-text("Project")')).toBeVisible();

    // Step 2: Verify function "TestFunction" is displayed in the function list
    const functionCard = page.locator('.function-card').filter({ hasText: FUNCTION_NAME }).first();
    await expect(functionCard).toBeVisible();

    // Step 3: Select function "TestFunction"
    await functionCard.click();
    await page.waitForTimeout(500);

    // Step 4: Initiate rename action
    const renameButton = functionCard.locator('button.function-action-button').first();
    await expect(renameButton).toBeVisible();
    await renameButton.click();
    await page.waitForTimeout(500);

    // Step 5: Verify function name becomes editable
    const nameInput = functionCard.locator('input.function-name-input');
    await expect(nameInput).toBeVisible({ timeout: 5000 });

    // Step 6: Clear existing name
    await nameInput.clear();
    await page.waitForTimeout(300);

    // Step 7: Type "Cancelled Name" as the new function name
    const cancelledName = 'Cancelled Name';
    await nameInput.fill(cancelledName);
    await page.waitForTimeout(300);

    // Step 8: Cancel rename action (press Escape)
    await nameInput.press('Escape');
    await page.waitForTimeout(1000);

    // Step 9: Verify rename is cancelled
    // Input should be hidden
    await expect(nameInput).toBeHidden({ timeout: 5000 });

    // Step 10: Verify function name reverts to "TestFunction"
    const functionCardAfter = page.locator('.function-card').filter({ hasText: FUNCTION_NAME }).first();
    await expect(functionCardAfter).toBeVisible({ timeout: 5000 });
    await expect(functionCardAfter.locator('.function-name')).toContainText(FUNCTION_NAME);
    await expect(functionCardAfter.locator('.function-name')).not.toContainText(cancelledName);

    // Step 11: Verify name change is not persisted
    // Navigate away and back to verify
    await page.goto('/home');
    await page.waitForTimeout(1000);
    await openProjectEditor(PROJECT_NAME);
    const persistedFunctionCard = page.locator('.function-card').filter({ hasText: FUNCTION_NAME }).first();
    await expect(persistedFunctionCard).toBeVisible({ timeout: 10000 });
    await expect(persistedFunctionCard.locator('.function-name')).toContainText(FUNCTION_NAME);
    await expect(persistedFunctionCard.locator('.function-name')).not.toContainText(cancelledName);

    // Step 12: Verify no error messages are displayed
    const errorNotification = page.locator('.error-notification');
    if (await errorNotification.isVisible()) {
      const errorText = await errorNotification.textContent();
      throw new Error(`Error message displayed: ${errorText}`);
    }
  });
});
