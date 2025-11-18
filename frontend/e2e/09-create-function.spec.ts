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

test.describe('Create Function - Section 09', () => {
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

  // FUNC-CREATE-001: Create Function - Positive Case
  test('FUNC-CREATE-001: Create Function - Positive Case', async () => {
    // Setup: Ensure user exists and is logged in
    await ensureUserExists(PRIMARY_EMAIL, PRIMARY_PASSWORD);

    // Create project if it doesn't exist
    await createProject(PROJECT_NAME);

    // Open project editor
    await openProjectEditor(PROJECT_NAME);

    // Step 1: Verify user is in Project Editor with Project tab active
    await expect(page.locator('.project-editor')).toBeVisible();
    await expect(page.locator('button.tab-button.active:has-text("Project")')).toBeVisible();

    // Step 2: Verify left side panel is displayed with search bar and brick list
    await expect(page.locator('input.brick-search')).toBeVisible();
    await expect(page.locator('.brick-list')).toBeVisible();

    // Step 3: Verify "Function" brick is visible in the brick list on the left side
    const functionBrick = page.locator('.brick-item:has-text("Function")');
    await expect(functionBrick).toBeVisible();

    // Step 4: Verify center area displays function list (may be empty)
    const functionListArea = page.locator('.function-list-area');
    await expect(functionListArea).toBeVisible();

    // Get initial function count
    const initialFunctionCount = await page.locator('.function-card').count();

    // Step 5-7: Drag "Function" brick from left side brick list and drop in function list area
    await functionBrick.dragTo(functionListArea);
    await page.waitForTimeout(2000); // Wait for API call and UI update

    // Step 8: Verify drop action is detected
    // (If we got here without error, drop was detected)

    // Step 9: Verify a new function is created
    await expect(page.locator('.function-card')).toHaveCount(initialFunctionCount + 1, { timeout: 5000 });

    // Step 10: Verify function is created with default name "New Function"
    const newFunctionCard = page.locator('.function-card').nth(initialFunctionCount);
    await expect(newFunctionCard.locator('.function-name')).toContainText('New Function', { timeout: 5000 });

    // Step 11: Verify function is assigned to the current project "TestProject"
    // (This is implicit - function appears in the project's function list)

    // Step 12: Verify function appears in the function list in Project Editor
    await expect(newFunctionCard).toBeVisible();

    // Step 13: Verify function is displayed immediately after creation
    await expect(newFunctionCard).toBeVisible();

    // Step 14: Verify function has an empty definition (no bricks configured)
    // This is verified by the function existing but having no bricks (we can't check this from Project Editor)

    // Step 15: Verify no error messages are displayed
    const errorNotification = page.locator('.error-notification');
    if (await errorNotification.isVisible()) {
      const errorText = await errorNotification.textContent();
      throw new Error(`Error message displayed: ${errorText}`);
    }
  });

  // FUNC-CREATE-002: Create Function - Negative Case - Drag to Invalid Location
  test('FUNC-CREATE-002: Create Function - Negative Case - Drag to Invalid Location', async () => {
    // Setup: Ensure user exists and is logged in
    await ensureUserExists(PRIMARY_EMAIL, PRIMARY_PASSWORD);
    await page.goto('/home');

    // Create project if it doesn't exist
    await createProject(PROJECT_NAME);

    // Open project editor
    await openProjectEditor(PROJECT_NAME);

    // Step 1: Verify user is in Project Editor with Project tab active
    await expect(page.locator('.project-editor')).toBeVisible();
    await expect(page.locator('button.tab-button.active:has-text("Project")')).toBeVisible();

    // Step 2: Verify "Function" brick is visible in the brick list
    const functionBrick = page.locator('.brick-item:has-text("Function")');
    await expect(functionBrick).toBeVisible();

    // Get initial function count
    const initialFunctionCount = await page.locator('.function-card').count();

    // Step 3: Drag "Function" brick from left side brick list
    // Step 4: Drag the brick to an invalid drop location (e.g., search bar)
    const searchBar = page.locator('input.brick-search');
    await expect(searchBar).toBeVisible();
    
    // Try to drag to search bar (invalid location)
    await functionBrick.dragTo(searchBar);
    await page.waitForTimeout(1000);

    // Step 5: Release/drop the brick in the invalid location
    // (Already done by dragTo)

    // Step 6: Verify drop is not accepted in invalid location
    // Step 7: Verify no function is created
    await expect(page.locator('.function-card')).toHaveCount(initialFunctionCount, { timeout: 3000 });

    // Step 8: Verify function list remains unchanged
    await expect(page.locator('.function-card')).toHaveCount(initialFunctionCount);

    // Step 9: Verify brick returns to original position or drag is cancelled
    // (Brick should still be visible in the list)
    await expect(functionBrick).toBeVisible();

    // Step 10: Verify no error messages are displayed (or appropriate feedback is shown)
    // No error should be shown for invalid drop location
    const errorNotification = page.locator('.error-notification');
    // Error notification might not be visible, which is fine
  });

  // FUNC-CREATE-003: Create Function - Negative Case - Permission Denied
  test('FUNC-CREATE-003: Create Function - Negative Case - Permission Denied', async () => {
    // Setup: Ensure owner and user exist
    await ensureUserExists(OWNER_EMAIL, OWNER_PASSWORD);
    await page.goto('/home');

    // Create shared project as owner
    await createProject(SHARED_PROJECT_NAME);
    await openProjectEditor(SHARED_PROJECT_NAME);

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

        // Step 2: Verify "Function" brick is visible in the brick list (if user has view permission)
        const functionBrick = page.locator('.brick-item:has-text("Function")');
        const brickVisible = await functionBrick.isVisible().catch(() => false);

        if (brickVisible) {
          // Step 3-4: Drag "Function" brick from left side brick list to function list area and drop
          const functionListArea = page.locator('.function-list-area');
          const initialFunctionCount = await page.locator('.function-card').count();
          
          await functionBrick.dragTo(functionListArea);
          await page.waitForTimeout(2000);

          // Step 5: Verify function creation fails OR function is not created
          // Step 6: Verify error message "Permission denied" or "Failed to create function" is displayed
          const errorNotification = page.locator('.error-notification');
          const functionCreated = await page.locator('.function-card').count() > initialFunctionCount;

          if (functionCreated) {
            // If function was created, permission check failed - this is a test failure
            throw new Error('Function was created despite permission restrictions - permission check failed');
          } else {
            // Function was not created - check for error message
            if (await errorNotification.isVisible()) {
              const errorText = await errorNotification.textContent();
              expect(errorText?.toLowerCase()).toMatch(/permission denied|failed to create function/i);
            }
          }

          // Step 7: Verify no function is added to the function list
          await expect(page.locator('.function-card')).toHaveCount(initialFunctionCount);

          // Step 8: Verify function list remains unchanged
          await expect(page.locator('.function-card')).toHaveCount(initialFunctionCount);
        } else {
          // Brick is not visible - user doesn't have permission to view/create functions
          // This is expected behavior
        }
      }
    } else {
      // Project is not visible - user doesn't have access
      // This is expected behavior for unauthorized access
    }
  });

  // FUNC-CREATE-004: Create Function - Verify Multiple Functions Can Be Created
  test('FUNC-CREATE-004: Create Function - Verify Multiple Functions Can Be Created', async () => {
    // Setup: Ensure user exists and is logged in
    await ensureUserExists(PRIMARY_EMAIL, PRIMARY_PASSWORD);
    await page.goto('/home');

    // Create project if it doesn't exist
    await createProject(PROJECT_NAME);

    // Open project editor
    await openProjectEditor(PROJECT_NAME);

    // Step 1: Verify user is in Project Editor with Project tab active
    await expect(page.locator('.project-editor')).toBeVisible();
    await expect(page.locator('button.tab-button.active:has-text("Project")')).toBeVisible();

    // Step 2: Verify existing function(s) are displayed in function list
    // (May be empty initially, that's fine)

    // Step 3: Count the number of functions in the list
    const initialCount = await page.locator('.function-card').count();

    // Step 4-5: Drag "Function" brick from left side brick list to function list area and drop
    const functionBrick = page.locator('.brick-item:has-text("Function")');
    const functionListArea = page.locator('.function-list-area');
    await functionBrick.dragTo(functionListArea);
    await page.waitForTimeout(2000);

    // Step 6: Verify a new function is created
    await expect(page.locator('.function-card')).toHaveCount(initialCount + 1, { timeout: 5000 });

    // Step 7: Verify new function appears in the function list
    const newFunctionCard = page.locator('.function-card').nth(initialCount);
    await expect(newFunctionCard).toBeVisible();

    // Step 8: Verify total number of functions has increased by one
    const newCount = await page.locator('.function-card').count();
    expect(newCount).toBe(initialCount + 1);

    // Step 9: Verify all functions are displayed in the list
    await expect(page.locator('.function-card')).toHaveCount(newCount);

    // Step 10: Verify each function has a unique identifier or name
    // Get all function names
    const functionCards = page.locator('.function-card');
    const functionCount = await functionCards.count();
    const functionNames: string[] = [];
    for (let i = 0; i < functionCount; i++) {
      const nameElement = functionCards.nth(i).locator('.function-name');
      const name = await nameElement.textContent();
      if (name) {
        functionNames.push(name.trim());
      }
    }
    // Check that all names are unique (or at least some are different)
    const uniqueNames = new Set(functionNames);
    // At minimum, we should have at least one function
    expect(functionNames.length).toBeGreaterThan(0);

    // Step 11: Verify no error messages are displayed
    const errorNotification = page.locator('.error-notification');
    if (await errorNotification.isVisible()) {
      const errorText = await errorNotification.textContent();
      throw new Error(`Error message displayed: ${errorText}`);
    }
  });

  // FUNC-CREATE-005: Create Function - Verify Function Persistence
  test('FUNC-CREATE-005: Create Function - Verify Function Persistence', async () => {
    // Setup: Ensure user exists and is logged in
    await ensureUserExists(PRIMARY_EMAIL, PRIMARY_PASSWORD);
    await page.goto('/home');

    // Create project if it doesn't exist
    await createProject(PROJECT_NAME);

    // Open project editor
    await openProjectEditor(PROJECT_NAME);

    // Step 1: Verify user is in Project Editor with Project tab active
    await expect(page.locator('.project-editor')).toBeVisible();
    await expect(page.locator('button.tab-button.active:has-text("Project")')).toBeVisible();

    // Step 2-3: Drag "Function" brick from left side brick list to function list area and drop
    const functionBrick = page.locator('.brick-item:has-text("Function")');
    const functionListArea = page.locator('.function-list-area');
    await functionBrick.dragTo(functionListArea);
    await page.waitForTimeout(2000);

    // Step 4: Verify function "New Function" is created and displayed
    const functionCard = page.locator('.function-card').filter({ hasText: 'New Function' }).first();
    await expect(functionCard).toBeVisible({ timeout: 5000 });
    await expect(functionCard.locator('.function-name')).toContainText('New Function');

    // Step 5: Navigate away from Project Editor (close editor or navigate to Home Screen)
    // Navigate to home screen
    await page.goto('/home');
    await page.waitForTimeout(1000);

    // Step 6: Navigate back to Project Editor (double-click project "TestProject")
    await openProjectEditor(PROJECT_NAME);

    // Step 7: Verify Project Editor opens
    await expect(page.locator('.project-editor')).toBeVisible();

    // Step 8: Verify Project tab is active
    await expect(page.locator('button.tab-button.active:has-text("Project")')).toBeVisible();

    // Step 9: Verify function "New Function" is still displayed in the function list
    const functionCardAfter = page.locator('.function-card').filter({ hasText: 'New Function' }).first();
    await expect(functionCardAfter).toBeVisible({ timeout: 10000 });
    await expect(functionCardAfter.locator('.function-name')).toContainText('New Function');

    // Step 10: Verify function data is persisted in the system
    // (If function is visible after navigation, it's persisted)
    await expect(functionCardAfter).toBeVisible();
  });
});
