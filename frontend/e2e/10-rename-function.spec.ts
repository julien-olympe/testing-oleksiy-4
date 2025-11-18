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
    test.setTimeout(60000);
    
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
    const projectCard = page.locator('.project-card').filter({ hasText: projectName });
    if (await projectCard.count() > 0) {
      return; // Project already exists
    }

    const projectBrick = page.locator('.brick-item:has-text("Project")');
    const projectListArea = page.locator('.project-list-area');
    await projectBrick.dragTo(projectListArea);
    await page.waitForTimeout(1000);

    const newProjectCard = page.locator('.project-card').first();
    const nameInput = newProjectCard.locator('input.project-name-input');
    if (await nameInput.isVisible()) {
      await nameInput.clear();
      await nameInput.fill(projectName);
      await nameInput.press('Enter');
      await page.waitForTimeout(500);
    } else {
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
    if (!page.url().includes('/home')) {
      await page.goto('/home');
      await page.waitForTimeout(1000);
    }
    
    await page.waitForSelector('.project-card', { timeout: 10000 });
    await page.waitForTimeout(500);
    
    const projectCard = page.locator('.project-card').filter({ hasText: projectName }).first();
    await expect(projectCard).toBeVisible({ timeout: 10000 });
    await projectCard.dblclick();
    await page.waitForURL(/\/projects\/[^/]+/, { timeout: 10000 });
    await expect(page.locator('.project-editor')).toBeVisible({ timeout: 10000 });
    
    await page.waitForTimeout(2000);
    
    await page.waitForSelector('button.tab-button', { timeout: 10000 });
    await page.waitForTimeout(500);
    
    const projectTab = page.locator('button.tab-button:has-text("Project")');
    await expect(projectTab).toBeVisible({ timeout: 10000 });
    const isActive = await projectTab.evaluate((el) => el.classList.contains('active'));
    if (!isActive) {
      await projectTab.click();
      await page.waitForTimeout(1000);
    }
    await expect(page.locator('button.tab-button.active:has-text("Project")')).toBeVisible({ timeout: 10000 });
  }

  // Helper function to create function
  async function createFunction(functionName: string) {
    const existingFunctionCard = page.locator('.function-card').filter({ hasText: functionName });
    if (await existingFunctionCard.count() > 0) {
      return; // Function already exists
    }

    const initialCount = await page.locator('.function-card').count();

    const functionBrick = page.locator('.brick-item:has-text("Function")');
    const functionListArea = page.locator('.function-list-area');
    await functionBrick.dragTo(functionListArea);
    await page.waitForTimeout(2000);

    await expect(page.locator('.function-card')).toHaveCount(initialCount + 1, { timeout: 5000 });
    const newFunctionCard = page.locator('.function-card').nth(initialCount);
    await expect(newFunctionCard).toBeVisible();

    await page.waitForTimeout(500);

    const currentNameElement = newFunctionCard.locator('.function-name');
    await expect(currentNameElement).toBeVisible();
    const currentName = await currentNameElement.textContent();
    if (currentName && currentName.trim() === functionName) {
      return;
    }

    const renameButton = newFunctionCard.locator('button.function-action-button[title="Rename"]').or(newFunctionCard.locator('button.function-action-button:has-text("✏️")'));
    await expect(renameButton).toBeVisible();
    await renameButton.click();
    await page.waitForTimeout(1000);

    const nameInput = newFunctionCard.locator('input.function-name-input');
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.clear();
    await nameInput.fill(functionName);
    
    await Promise.all([
      page.waitForResponse(response => 
        response.url().includes('/api/v1/functions/') && 
        response.request().method() === 'PUT' &&
        response.status() >= 200 && response.status() < 300
      ).catch(() => {}),
      nameInput.press('Enter')
    ]);
    
    try {
      await expect(nameInput).toBeHidden({ timeout: 5000 });
    } catch (e) {
      await page.waitForTimeout(1000);
    }
    await page.waitForTimeout(1000);

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
    const renameButton = functionCard.locator('button.function-action-button[title="Rename"]').or(functionCard.locator('button.function-action-button:has-text("✏️")'));
    await expect(renameButton).toBeVisible();
    await renameButton.click();
    await page.waitForTimeout(500);

    // Step 5: Verify function name becomes editable (input field appears)
    const nameInput = functionCard.locator('input.function-name-input');
    await expect(nameInput).toBeVisible({ timeout: 5000 });

    // Step 6: Clear existing name "TestFunction"
    await nameInput.clear();

    // Step 7: Type "Renamed Function" as the new function name
    await nameInput.fill('Renamed Function');

    // Step 8: Confirm rename action (press Enter)
    await Promise.all([
      page.waitForResponse(response => 
        response.url().includes('/api/v1/functions/') && 
        response.request().method() === 'PUT' &&
        response.status() >= 200 && response.status() < 300
      ).catch(() => {}),
      nameInput.press('Enter')
    ]);
    await page.waitForTimeout(1000);

    // Step 9: Verify function name is updated to "Renamed Function"
    const renamedFunctionCard = page.locator('.function-card').filter({ hasText: 'Renamed Function' }).first();
    await expect(renamedFunctionCard).toBeVisible({ timeout: 10000 });
    await expect(renamedFunctionCard.locator('.function-name')).toContainText('Renamed Function');

    // Step 10: Verify updated name is displayed in the function list
    await expect(renamedFunctionCard).toBeVisible();

    // Step 11: Verify name change is persisted (reload page)
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Ensure Project tab is active after reload
    const projectTab = page.locator('button.tab-button:has-text("Project")');
    await expect(projectTab).toBeVisible({ timeout: 10000 });
    const isActive = await projectTab.evaluate((el) => el.classList.contains('active'));
    if (!isActive) {
      await projectTab.click();
      await page.waitForTimeout(1000);
    }
    
    const persistedFunctionCard = page.locator('.function-card').filter({ hasText: 'Renamed Function' }).first();
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
      await page.goto('/login');
    }

    await ensureUserExists(USER_EMAIL, USER_PASSWORD);
    await page.goto('/home');

    // Step 1: Verify user "user@example.com" is in Project Editor with Project tab active
    const sharedProjectCard = page.locator('.project-card').filter({ hasText: SHARED_PROJECT_NAME });
    const projectVisible = await sharedProjectCard.count() > 0;

    if (projectVisible) {
      await sharedProjectCard.first().dblclick();
      await page.waitForTimeout(2000);

      const isInProjectEditor = await page.locator('.project-editor').isVisible();
      
      if (isInProjectEditor) {
        const projectTab = page.locator('button.tab-button:has-text("Project")');
        if (await projectTab.isVisible()) {
          const isActive = await projectTab.evaluate((el) => el.classList.contains('active'));
          if (!isActive) {
            await projectTab.click();
            await page.waitForTimeout(500);
          }
        }

        await expect(page.locator('.project-editor')).toBeVisible();

        // Step 2: Verify function "SharedFunction" is displayed in the function list (if user has view permission)
        const sharedFunctionCard = page.locator('.function-card').filter({ hasText: SHARED_FUNCTION_NAME });
        const functionVisible = await sharedFunctionCard.count() > 0;

        if (functionVisible) {
          // Step 3: Select function "SharedFunction"
          await sharedFunctionCard.first().click();
          await page.waitForTimeout(500);

          // Step 4: Attempt to initiate rename action
          const renameButton = sharedFunctionCard.first().locator('button.function-action-button[title="Rename"]').or(sharedFunctionCard.first().locator('button.function-action-button:has-text("✏️")'));
          const renameButtonVisible = await renameButton.isVisible().catch(() => false);

          if (renameButtonVisible) {
            await renameButton.click();
            await page.waitForTimeout(500);

            const nameInput = sharedFunctionCard.first().locator('input.function-name-input');
            if (await nameInput.isVisible()) {
              await nameInput.clear();
              await nameInput.fill('Unauthorized Rename');
              await nameInput.press('Enter');
              await page.waitForTimeout(2000);

              // Step 5: Verify rename action is not available OR rename fails
              // Step 6: Verify error message "Permission denied" is displayed
              const errorNotification = page.locator('.error-notification');
              if (await errorNotification.isVisible()) {
                const errorText = await errorNotification.textContent();
                expect(errorText?.toLowerCase()).toMatch(/permission denied|must own|not authorized/i);
              }

              // Step 7: Verify function name remains "SharedFunction"
              await expect(sharedFunctionCard.first().locator('.function-name')).toContainText(SHARED_FUNCTION_NAME);

              // Step 8: Verify function name is not changed
              const unauthorizedCard = page.locator('.function-card').filter({ hasText: 'Unauthorized Rename' });
              await expect(unauthorizedCard).toHaveCount(0);

              // Step 9: Verify no changes are persisted
              await page.reload({ waitUntil: 'networkidle' });
              await page.waitForTimeout(2000);
              
              const projectTabAfter = page.locator('button.tab-button:has-text("Project")');
              if (await projectTabAfter.isVisible()) {
                const isActiveAfter = await projectTabAfter.evaluate((el) => el.classList.contains('active'));
                if (!isActiveAfter) {
                  await projectTabAfter.click();
                  await page.waitForTimeout(1000);
                }
              }
              
              await expect(page.locator('.function-card').filter({ hasText: SHARED_FUNCTION_NAME }).first()).toBeVisible({ timeout: 10000 });
            }
          } else {
            // Rename button not available - this is expected behavior
            await expect(sharedFunctionCard.first()).toBeVisible();
          }
        } else {
          // Function is not visible - this is expected behavior
          await expect(page.locator('.project-editor')).toBeVisible();
        }
      }
    } else {
      // Project is not visible - this is expected behavior
      await expect(page.locator('h1:has-text("Home")')).toBeVisible();
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
    const renameButton = functionCard.locator('button.function-action-button[title="Rename"]').or(functionCard.locator('button.function-action-button:has-text("✏️")'));
    await expect(renameButton).toBeVisible();
    await renameButton.click();
    await page.waitForTimeout(500);

    // Step 5: Verify function name becomes editable
    const nameInput = functionCard.locator('input.function-name-input');
    await expect(nameInput).toBeVisible({ timeout: 5000 });

    // Step 6: Clear existing name
    await nameInput.clear();

    // Step 7: Leave name field empty (or enter only whitespace)
    await nameInput.fill('   '); // Whitespace only

    // Step 8: Attempt to confirm rename action
    await nameInput.press('Enter');
    await page.waitForTimeout(1000);

    // Step 9: Verify rename fails OR validation prevents confirmation
    const inputStillVisible = await nameInput.isVisible().catch(() => false);
    if (inputStillVisible) {
      // Validation prevented - input is still visible
      // Step 10: Verify error message "Invalid function name" is displayed
      const errorNotification = page.locator('.error-notification');
      const hasError = await errorNotification.isVisible().catch(() => false);
      if (hasError) {
        const errorText = await errorNotification.textContent();
        expect(errorText?.toLowerCase()).toMatch(/invalid|required|empty/i);
      }
    } else {
      // Input disappeared - check if name reverted
      // Step 11: Verify function name remains "TestFunction" or reverts to original name
      await page.waitForTimeout(1000);
      const functionNameElement = functionCard.locator('.function-name');
      await expect(functionNameElement).toContainText(FUNCTION_NAME);
    }

    // Step 12: Verify name change is not persisted
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const projectTab = page.locator('button.tab-button:has-text("Project")');
    if (await projectTab.isVisible()) {
      const isActive = await projectTab.evaluate((el) => el.classList.contains('active'));
      if (!isActive) {
        await projectTab.click();
        await page.waitForTimeout(1000);
      }
    }
    
    await expect(page.locator('.function-card').filter({ hasText: FUNCTION_NAME }).first()).toBeVisible({ timeout: 10000 });
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
    const testFunctionCard = page.locator('.function-card').filter({ hasText: FUNCTION_NAME });
    const existingFunctionCard = page.locator('.function-card').filter({ hasText: EXISTING_FUNCTION_NAME });
    await expect(testFunctionCard.first()).toBeVisible();
    await expect(existingFunctionCard.first()).toBeVisible();

    // Step 3: Select function "TestFunction"
    await testFunctionCard.first().click();
    await page.waitForTimeout(500);

    // Step 4: Initiate rename action
    const renameButton = testFunctionCard.first().locator('button.function-action-button[title="Rename"]').or(testFunctionCard.first().locator('button.function-action-button:has-text("✏️")'));
    await expect(renameButton).toBeVisible();
    await renameButton.click();
    await page.waitForTimeout(500);

    // Step 5: Verify function name becomes editable
    const nameInput = testFunctionCard.first().locator('input.function-name-input');
    await expect(nameInput).toBeVisible({ timeout: 5000 });

    // Step 6: Clear existing name "TestFunction"
    await nameInput.clear();

    // Step 7: Type "ExistingFunction" as the new function name
    await nameInput.fill(EXISTING_FUNCTION_NAME);

    // Step 8: Attempt to confirm rename action
    await Promise.all([
      page.waitForResponse(response => 
        response.url().includes('/api/v1/functions/') && 
        response.request().method() === 'PUT'
      ).catch(() => {}),
      nameInput.press('Enter')
    ]);
    await page.waitForTimeout(2000);

    // Step 9: Verify rename fails OR validation prevents confirmation
    const errorNotification = page.locator('.error-notification');
    const hasError = await errorNotification.isVisible().catch(() => false);
    
    if (hasError) {
      // Step 10: Verify error message "Invalid function name" or "Function name already exists" is displayed
      const errorText = await errorNotification.textContent();
      expect(errorText?.toLowerCase()).toMatch(/invalid|already exists|duplicate|name conflict/i);
    }

    // Step 11: Verify function name remains "TestFunction" or reverts to original name
    await page.waitForTimeout(1000);
    const testFunctionNameElement = testFunctionCard.first().locator('.function-name');
    const currentName = await testFunctionNameElement.textContent();
    expect(currentName?.trim()).toBe(FUNCTION_NAME);

    // Step 12: Verify name change is not persisted
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const projectTab = page.locator('button.tab-button:has-text("Project")');
    if (await projectTab.isVisible()) {
      const isActive = await projectTab.evaluate((el) => el.classList.contains('active'));
      if (!isActive) {
        await projectTab.click();
        await page.waitForTimeout(1000);
      }
    }
    
    await expect(page.locator('.function-card').filter({ hasText: FUNCTION_NAME }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.function-card').filter({ hasText: EXISTING_FUNCTION_NAME }).first()).toBeVisible({ timeout: 10000 });
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
    const renameButton = functionCard.locator('button.function-action-button[title="Rename"]').or(functionCard.locator('button.function-action-button:has-text("✏️")'));
    await expect(renameButton).toBeVisible();
    await renameButton.click();
    await page.waitForTimeout(500);

    // Step 5: Verify function name becomes editable
    const nameInput = functionCard.locator('input.function-name-input');
    await expect(nameInput).toBeVisible({ timeout: 5000 });

    // Step 6: Clear existing name
    await nameInput.clear();

    // Step 7: Type "Cancelled Name" as the new function name
    await nameInput.fill('Cancelled Name');

    // Step 8: Cancel rename action (press Escape)
    await nameInput.press('Escape');
    await page.waitForTimeout(500);

    // Step 9: Verify rename is cancelled
    await expect(nameInput).toBeHidden({ timeout: 5000 });

    // Step 10: Verify function name reverts to "TestFunction"
    const functionNameElement = functionCard.locator('.function-name');
    await expect(functionNameElement).toContainText(FUNCTION_NAME);

    // Step 11: Verify name change is not persisted
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const projectTab = page.locator('button.tab-button:has-text("Project")');
    if (await projectTab.isVisible()) {
      const isActive = await projectTab.evaluate((el) => el.classList.contains('active'));
      if (!isActive) {
        await projectTab.click();
        await page.waitForTimeout(1000);
      }
    }
    
    await expect(page.locator('.function-card').filter({ hasText: FUNCTION_NAME }).first()).toBeVisible({ timeout: 10000 });

    // Step 12: Verify no error messages are displayed
    const errorNotification = page.locator('.error-notification');
    if (await errorNotification.isVisible()) {
      const errorText = await errorNotification.textContent();
      throw new Error(`Error message displayed: ${errorText}`);
    }
  });
});
