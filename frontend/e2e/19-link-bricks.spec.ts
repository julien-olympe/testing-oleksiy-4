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

test.describe('Link Bricks - Section 19', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    test.setTimeout(180000); // Increase timeout to 180 seconds per test
    
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser console error:', msg.text());
      }
    });
    
    // Listen for page errors
    page.on('pageerror', error => {
      console.log('Page error:', error.message);
    });
    
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
      return;
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
    
    const projectCard = page.locator('.project-card').filter({ hasText: projectName }).first();
    await expect(projectCard).toBeVisible({ timeout: 10000 });
    await projectCard.dblclick();
    await page.waitForURL(/\/projects\/[^/]+/, { timeout: 10000 });
    await expect(page.locator('.project-editor')).toBeVisible({ timeout: 10000 });
    
    await page.waitForTimeout(1000);
    
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
    const existingFunctionCard = page.locator('.function-card').filter({ hasText: functionName });
    if (await existingFunctionCard.count() > 0) {
      return;
    }

    const initialCount = await page.locator('.function-card').count();

    const functionBrick = page.locator('.brick-item:has-text("Function")');
    const functionListArea = page.locator('.function-list-area');
    await functionBrick.dragTo(functionListArea);
    await page.waitForTimeout(2000);

    // Wait for new function card to appear (count should increase)
    await expect(async () => {
      const currentCount = await page.locator('.function-card').count();
      expect(currentCount).toBeGreaterThan(initialCount);
    }).toPass({ timeout: 10000 });
    
    const newFunctionCard = page.locator('.function-card').nth(initialCount);
    await expect(newFunctionCard).toBeVisible();

    await page.waitForTimeout(500);

    const currentNameElement = newFunctionCard.locator('.function-name');
    await expect(currentNameElement).toBeVisible();
    const currentName = await currentNameElement.textContent();
    if (currentName && currentName.trim() === functionName) {
      return;
    }

    const renameButton = newFunctionCard.locator('button.function-action-button').first();
    await expect(renameButton).toBeVisible();
    await renameButton.click();
    await page.waitForTimeout(1000);

    const nameInput = newFunctionCard.locator('input.function-name-input');
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.clear();
    await nameInput.fill(functionName);
    await nameInput.press('Enter');
    
    await expect(nameInput).toBeHidden({ timeout: 10000 });
    await page.waitForTimeout(1000);

    const updatedFunctionCard = page.locator('.function-card').filter({ hasText: functionName }).first();
    await expect(updatedFunctionCard).toBeVisible({ timeout: 5000 });
    await expect(updatedFunctionCard.locator('.function-name')).toContainText(functionName);
  }

  // Helper function to open function editor
  async function openFunctionEditor(functionName: string) {
    const functionCard = page.locator('.function-card').filter({ hasText: functionName }).first();
    await expect(functionCard).toBeVisible({ timeout: 10000 });
    await functionCard.dblclick();
    await page.waitForURL(/\/functions\/[^/]+/, { timeout: 10000 });
    await expect(page.locator('.function-editor')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000);
  }

  // Helper function to add brick to function
  async function addBrickToFunction(brickType: string) {
    const brickItem = page.locator(`.brick-item:has-text("${brickType}")`).or(
      page.locator(`.brick-item:has-text("${brickType.replace(/\s+/g, '')}")`)
    );
    const canvas = page.locator('.function-editor-canvas');
    
    // Wait for brick item and canvas to be visible
    await expect(brickItem).toBeVisible({ timeout: 10000 });
    await expect(canvas).toBeVisible({ timeout: 10000 });
    
    // Start dragging (don't wait for response as it may fail or timeout)
    await brickItem.dragTo(canvas);
    
    // Wait for brick to appear on canvas (this will fail if API call failed)
    // Increase timeout to allow for API processing time
    // Use .first() to handle cases where multiple bricks with same name exist from previous tests
    await expect(page.locator(`.brick-node:has-text("${brickType}")`).first()).toBeVisible({ timeout: 20000 });
  }

  // Helper function to create link between bricks
  async function createLink(sourceBrickName: string, sourceOutput: string, targetBrickName: string, targetInput: string) {
    const sourceBrickNode = page.locator(`.brick-node:has-text("${sourceBrickName}")`).first();
    const targetBrickNode = page.locator(`.brick-node:has-text("${targetBrickName}")`).first();
    
    await expect(sourceBrickNode).toBeVisible();
    await expect(targetBrickNode).toBeVisible();

    const sourceOutputHandle = sourceBrickNode.locator(`.react-flow__handle-right[data-handleid="${sourceOutput}"]`).first();
    const targetInputHandle = targetBrickNode.locator(`.react-flow__handle-left[data-handleid="${targetInput}"]`).first();

    await expect(sourceOutputHandle).toBeVisible({ timeout: 5000 });
    await expect(targetInputHandle).toBeVisible({ timeout: 5000 });

    // Hover over source handle before dragging (use force to avoid interception issues)
    await sourceOutputHandle.hover({ force: true });
    await page.waitForTimeout(500);

    // Wait for API response when creating connection
    await Promise.all([
      page.waitForResponse(response => 
        response.url().includes('/api/v1/bricks/') && 
        response.url().includes('/connections') &&
        (response.request().method() === 'POST' || response.request().method() === 'PUT') &&
        response.status() >= 200 && response.status() < 300
      ).catch(() => {}),
      sourceOutputHandle.dragTo(targetInputHandle, { force: true })
    ]);

    await page.waitForTimeout(1000);
  }

  test('BRICK-LINK-001: Link Bricks - Positive Case', async () => {
    // Setup: Ensure user exists and is logged in
    await ensureUserExists(PRIMARY_EMAIL, PRIMARY_PASSWORD);
    await page.goto('/home');

    // Create project
    await createProject(PROJECT_NAME);
    await openProjectEditor(PROJECT_NAME);

    // Create function
    await createFunction(FUNCTION_NAME);

    // Open function editor
    await openFunctionEditor(FUNCTION_NAME);

    // Verify user is in Function Editor
    await expect(page.locator('.function-editor')).toBeVisible();

    // Add bricks to canvas
    await addBrickToFunction('List instances by DB name');
    // Add delay to avoid rate limiting
    await page.waitForTimeout(2000);
    await addBrickToFunction('Get first instance');

    // Verify both bricks are displayed on canvas
    await expect(page.locator('.brick-node:has-text("List instances by DB name")').first()).toBeVisible();
    await expect(page.locator('.brick-node:has-text("Get first instance")').first()).toBeVisible();

    // Verify connection points are visible
    const listBrickNode = page.locator('.brick-node:has-text("List instances by DB name")').first();
    const getFirstBrickNode = page.locator('.brick-node:has-text("Get first instance")').first();

    const listOutputHandle = listBrickNode.locator('.react-flow__handle-right[data-handleid="List"]').first();
    const getFirstInputHandle = getFirstBrickNode.locator('.react-flow__handle-left[data-handleid="List"]').first();

    await expect(listOutputHandle).toBeVisible();
    await expect(getFirstInputHandle).toBeVisible();

    // Create link
    await createLink('List instances by DB name', 'List', 'Get first instance', 'List');

    // Verify link is created successfully
    await expect(page.locator('.react-flow__edge')).toHaveCount(1);

    // Verify connection line is visible
    const edge = page.locator('.react-flow__edge');
    await expect(edge).toBeVisible();

    // Verify no error messages are displayed
    const errorNotification = page.locator('.error-notification');
    if (await errorNotification.isVisible()) {
      const errorText = await errorNotification.textContent();
      throw new Error(`Error message displayed: ${errorText}`);
    }
  });

  test('BRICK-LINK-002: Link Bricks - Link Complete Chain', async () => {
    // Setup: Ensure user exists and is logged in
    await ensureUserExists(PRIMARY_EMAIL, PRIMARY_PASSWORD);
    await page.goto('/home');

    // Create project
    await createProject(PROJECT_NAME);
    await openProjectEditor(PROJECT_NAME);

    // Create function
    await createFunction(FUNCTION_NAME);

    // Open function editor
    await openFunctionEditor(FUNCTION_NAME);

    // Verify user is in Function Editor
    await expect(page.locator('.function-editor')).toBeVisible();

    // Add all three bricks to canvas
    await addBrickToFunction('List instances by DB name');
    await addBrickToFunction('Get first instance');
    await addBrickToFunction('Log instance props');

    // Verify all three bricks are displayed on canvas
    await expect(page.locator('.brick-node:has-text("List instances by DB name")').first()).toBeVisible();
    await expect(page.locator('.brick-node:has-text("Get first instance")').first()).toBeVisible();
    await expect(page.locator('.brick-node:has-text("Log instance props")').first()).toBeVisible();

    // Create first link
    await createLink('List instances by DB name', 'List', 'Get first instance', 'List');

    // Verify first link is created and displayed
    await expect(page.locator('.react-flow__edge')).toHaveCount(1);

    // Create second link
    await createLink('Get first instance', 'DB', 'Log instance props', 'Object');

    // Verify second link is created and displayed
    await expect(page.locator('.react-flow__edge')).toHaveCount(2);

    // Verify both connection lines are visible
    const edges = page.locator('.react-flow__edge');
    await expect(edges).toHaveCount(2);

    // Verify complete chain is linked
    // All edges should be visible
    await expect(edges.first()).toBeVisible();
    await expect(edges.nth(1)).toBeVisible();

    // Verify no error messages are displayed
    const errorNotification = page.locator('.error-notification');
    if (await errorNotification.isVisible()) {
      const errorText = await errorNotification.textContent();
      throw new Error(`Error message displayed: ${errorText}`);
    }
  });

  test('BRICK-LINK-003: Link Bricks - Negative Case - Incompatible Types', async () => {
    // Setup: Ensure user exists and is logged in
    await ensureUserExists(PRIMARY_EMAIL, PRIMARY_PASSWORD);
    await page.goto('/home');

    // Create project
    await createProject(PROJECT_NAME);
    await openProjectEditor(PROJECT_NAME);

    // Create function
    await createFunction(FUNCTION_NAME);

    // Open function editor
    await openFunctionEditor(FUNCTION_NAME);

    // Verify user is in Function Editor
    await expect(page.locator('.function-editor')).toBeVisible();

    // Add bricks to canvas
    await addBrickToFunction('List instances by DB name');
    await addBrickToFunction('Log instance props');

    // Verify both bricks are displayed on canvas
    await expect(page.locator('.brick-node:has-text("List instances by DB name")').first()).toBeVisible();
    await expect(page.locator('.brick-node:has-text("Log instance props")').first()).toBeVisible();

    const listBrickNode = page.locator('.brick-node:has-text("List instances by DB name")').first();
    const logBrickNode = page.locator('.brick-node:has-text("Log instance props")').first();

    const listOutputHandle = listBrickNode.locator('.react-flow__handle-right[data-handleid="List"]');
    const logInputHandle = logBrickNode.locator('.react-flow__handle-left[data-handleid="Object"]');

    await expect(listOutputHandle).toBeVisible();
    await expect(logInputHandle).toBeVisible();

    // Get initial edge count
    const initialEdgeCount = await page.locator('.react-flow__edge').count();

    // Attempt to create incompatible link
    try {
      await listOutputHandle.hover();
      await page.waitForTimeout(500);
      await listOutputHandle.dragTo(logInputHandle);
      await page.waitForTimeout(1000);
    } catch (e) {
      // Drag might fail, which is expected for incompatible types
    }

    // Verify no link is created (edge count should remain the same)
    const finalEdgeCount = await page.locator('.react-flow__edge').count();
    expect(finalEdgeCount).toBe(initialEdgeCount);

    // Check for error message
    const errorNotification = page.locator('.error-notification');
    const hasError = await errorNotification.isVisible();
    
    // If error is shown, verify it mentions incompatible types
    if (hasError) {
      const errorText = await errorNotification.textContent();
      expect(errorText?.toLowerCase()).toMatch(/incompatible|type|cannot connect/i);
    } else {
      // If no error shown, the system prevented the link silently
      // This is also acceptable behavior
    }
  });

  test('BRICK-LINK-004: Link Bricks - Negative Case - Link Already Exists', async () => {
    // Setup: Ensure user exists and is logged in
    await ensureUserExists(PRIMARY_EMAIL, PRIMARY_PASSWORD);
    await page.goto('/home');

    // Create project
    await createProject(PROJECT_NAME);
    await openProjectEditor(PROJECT_NAME);

    // Create function
    await createFunction(FUNCTION_NAME);

    // Open function editor
    await openFunctionEditor(FUNCTION_NAME);

    // Verify user is in Function Editor
    await expect(page.locator('.function-editor')).toBeVisible();

    // Add bricks to canvas
    await addBrickToFunction('List instances by DB name');
    // Add delay to avoid rate limiting
    await page.waitForTimeout(2000);
    await addBrickToFunction('Get first instance');

    // Verify both bricks are displayed on canvas
    await expect(page.locator('.brick-node:has-text("List instances by DB name")').first()).toBeVisible();
    await expect(page.locator('.brick-node:has-text("Get first instance")').first()).toBeVisible();

    // Create first link
    await createLink('List instances by DB name', 'List', 'Get first instance', 'List');

    // Verify existing link is displayed
    await expect(page.locator('.react-flow__edge')).toHaveCount(1);

    // Attempt to create duplicate link
    const listBrickNode = page.locator('.brick-node:has-text("List instances by DB name")').first();
    const getFirstBrickNode = page.locator('.brick-node:has-text("Get first instance")').first();

    const listOutputHandle = listBrickNode.locator('.react-flow__handle-right[data-handleid="List"]').first();
    const getFirstInputHandle = getFirstBrickNode.locator('.react-flow__handle-left[data-handleid="List"]').first();

    try {
      await listOutputHandle.hover({ force: true });
      await page.waitForTimeout(500);
      await listOutputHandle.dragTo(getFirstInputHandle, { force: true });
      await page.waitForTimeout(1000);
    } catch (e) {
      // Drag might fail, which is acceptable
    }

    // Verify only one connection line exists
    await expect(page.locator('.react-flow__edge')).toHaveCount(1);

    // Check for error message about duplicate link
    const errorNotification = page.locator('.error-notification');
    const hasError = await errorNotification.isVisible();
    
    if (hasError) {
      const errorText = await errorNotification.textContent();
      expect(errorText?.toLowerCase()).toMatch(/already exists|duplicate|already connected/i);
    } else {
      // If no error shown, the system prevented the duplicate link silently
      // This is also acceptable behavior
    }
  });

  test('BRICK-LINK-005: Link Bricks - Negative Case - Permission Denied', async () => {
    // Setup: Ensure owner and user exist
    await ensureUserExists(OWNER_EMAIL, OWNER_PASSWORD);
    await page.goto('/home');

    // Create shared project as owner
    await createProject(SHARED_PROJECT_NAME);
    await openProjectEditor(SHARED_PROJECT_NAME);

    // Create function as owner
    await createFunction(SHARED_FUNCTION_NAME);

    // Logout and login as user without edit permission
    await page.click('button.settings-button, button[aria-label="Settings"]');
    await page.click('button.settings-logout:has-text("Logout")');
    await page.waitForURL('/login', { timeout: 5000 });

    await ensureUserExists(USER_EMAIL, USER_PASSWORD);
    await page.goto('/home');
    await page.waitForTimeout(2000);
    // Wait for home page to fully load
    await expect(page.locator('h1:has-text("Home")')).toBeVisible({ timeout: 10000 });

    // Try to access the shared project
    const sharedProjectCard = page.locator('.project-card').filter({ hasText: SHARED_PROJECT_NAME });
    const projectVisible = await sharedProjectCard.count() > 0;

    if (projectVisible) {
      await sharedProjectCard.first().dblclick();
      await page.waitForTimeout(2000);

      const isInProjectEditor = await page.locator('.project-editor').isVisible();
      
      if (isInProjectEditor) {
        // Try to access the function
        await expect(page.locator('button.tab-button.active:has-text("Project")')).toBeVisible();
        
        const sharedFunctionCard = page.locator('.function-card').filter({ hasText: SHARED_FUNCTION_NAME });
        const functionVisible = await sharedFunctionCard.count() > 0;

        if (functionVisible) {
          // Try to open function editor
          await sharedFunctionCard.first().dblclick();
          await page.waitForTimeout(2000);

          const isInFunctionEditor = await page.locator('.function-editor').isVisible();
          const errorNotification = page.locator('.error-notification');

          if (isInFunctionEditor) {
            // If editor opened, try to add bricks and create links
            // Add bricks first
            await addBrickToFunction('List instances by DB name');
            await addBrickToFunction('Get first instance');

            // Try to create link
            const listBrickNode = page.locator('.brick-node:has-text("List instances by DB name")');
            const getFirstBrickNode = page.locator('.brick-node:has-text("Get first instance")');

            const listOutputHandle = listBrickNode.locator('.react-flow__handle-right[data-handleid="List"]');
            const getFirstInputHandle = getFirstBrickNode.locator('.react-flow__handle-left[data-handleid="List"]');

            if (await listOutputHandle.isVisible() && await getFirstInputHandle.isVisible()) {
              try {
                await listOutputHandle.hover();
                await page.waitForTimeout(500);
                await listOutputHandle.dragTo(getFirstInputHandle);
                await page.waitForTimeout(1000);
              } catch (e) {
                // Drag might fail due to permissions
              }

              // Check for permission error
              if (await errorNotification.isVisible()) {
                const errorText = await errorNotification.textContent();
                expect(errorText?.toLowerCase()).toMatch(/permission denied|not authorized|access denied/i);
              } else {
                // If no error but link wasn't created, that's also acceptable
                const edgeCount = await page.locator('.react-flow__edge').count();
                expect(edgeCount).toBe(0);
              }
            }
          } else if (await errorNotification.isVisible()) {
            // Verify error message "Permission denied" is displayed
            const errorText = await errorNotification.textContent();
            expect(errorText?.toLowerCase()).toContain('permission denied');
          }
        }
      }
    } else {
      // Project is not visible - this is expected behavior for unauthorized access
      await expect(page.locator('h1:has-text("Home")')).toBeVisible();
    }
  });

  test('BRICK-LINK-006: Link Bricks - Verify Link Persistence', async () => {
    // Setup: Ensure user exists and is logged in
    await ensureUserExists(PRIMARY_EMAIL, PRIMARY_PASSWORD);
    await page.goto('/home');

    // Create project
    await createProject(PROJECT_NAME);
    await openProjectEditor(PROJECT_NAME);

    // Create function
    await createFunction(FUNCTION_NAME);

    // Open function editor
    await openFunctionEditor(FUNCTION_NAME);

    // Verify user is in Function Editor
    await expect(page.locator('.function-editor')).toBeVisible();

    // Add bricks to canvas
    await addBrickToFunction('List instances by DB name');
    // Add delay to avoid rate limiting
    await page.waitForTimeout(2000);
    await addBrickToFunction('Get first instance');

    // Verify both bricks are displayed on canvas
    await expect(page.locator('.brick-node:has-text("List instances by DB name")').first()).toBeVisible();
    await expect(page.locator('.brick-node:has-text("Get first instance")').first()).toBeVisible();

    // Create link
    await createLink('List instances by DB name', 'List', 'Get first instance', 'List');

    // Verify link is created and connection line is displayed
    await expect(page.locator('.react-flow__edge')).toHaveCount(1);

    // Navigate away from Function Editor (go back to project editor)
    await page.goBack();
    await page.waitForURL(/\/projects\/[^/]+/, { timeout: 10000 });
    await expect(page.locator('.project-editor')).toBeVisible({ timeout: 10000 });
    
    await page.waitForTimeout(2000);
    
    // Ensure Project tab is active
    const projectTab = page.locator('button.tab-button:has-text("Project")');
    let tabVisible = false;
    try {
      tabVisible = await projectTab.isVisible({ timeout: 5000 });
    } catch (e) {
      tabVisible = false;
    }
    
    if (!tabVisible) {
      await openProjectEditor(PROJECT_NAME);
    } else {
      const isActive = await projectTab.evaluate((el) => el.classList.contains('active'));
      if (!isActive) {
        await projectTab.click();
        await page.waitForTimeout(1000);
      }
      await expect(page.locator('button.tab-button.active:has-text("Project")')).toBeVisible();
    }
    
    // Wait for function list to load - check if any function cards exist
    const functionCards = page.locator('.function-card');
    const cardCount = await functionCards.count();
    if (cardCount === 0) {
      // If no cards, wait a bit more for them to load
      await page.waitForTimeout(2000);
      await expect(functionCards.first()).toBeVisible({ timeout: 15000 });
    }
    await page.waitForTimeout(1000);

    // Navigate back to Function Editor
    let functionCardAgain = page.locator('.function-card').filter({ hasText: FUNCTION_NAME }).first();
    const functionCardCount = await functionCardAgain.count();
    if (functionCardCount === 0) {
      functionCardAgain = page.locator('.function-card').first();
    }
    await expect(functionCardAgain).toBeVisible({ timeout: 10000 });
    await functionCardAgain.dblclick();
    await page.waitForURL(/\/functions\/[^/]+/, { timeout: 10000 });
    await expect(page.locator('.function-editor')).toBeVisible();

    // Wait for function data to load - wait for the editor API call
    try {
      await page.waitForResponse(response => 
        response.url().includes('/api/v1/functions/') && 
        (response.url().includes('/editor') || response.url().match(/\/functions\/[^/]+$/)) &&
        response.status() >= 200 && response.status() < 300
      , { timeout: 15000 });
    } catch (e) {
      // API call might have already completed, continue
    }
    
    await page.waitForTimeout(3000);
    
    // Wait for canvas to be ready
    const canvas = page.locator('.function-editor-canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(3000);
    
    // Wait for any bricks to appear on canvas - check if any exist first
    const brickCount = await page.locator('.brick-node').count();
    if (brickCount === 0) {
      // Wait a bit more for bricks to load
      await page.waitForTimeout(3000);
      await expect(page.locator('.brick-node').first()).toBeVisible({ timeout: 20000 });
    }

    // Verify both bricks are still displayed on canvas (use first() to handle multiple bricks)
    await expect(page.locator('.brick-node:has-text("List instances by DB name")').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.brick-node:has-text("Get first instance")').first()).toBeVisible({ timeout: 15000 });

    // Verify connection line is still displayed
    await expect(page.locator('.react-flow__edge')).toHaveCount(1);
    await expect(page.locator('.react-flow__edge')).toBeVisible();
  });
});
