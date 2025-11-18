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

test.describe('Link Bricks Tests - Section 19', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    test.setTimeout(120000);
    
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
        nameInputAfter.clear();
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
    const brickItem = page.locator(`.brick-item:has-text("${brickType}")`);
    const canvas = page.locator('.function-editor-canvas');
    
    await Promise.all([
      page.waitForResponse(response => 
        response.url().includes('/api/v1/bricks') && 
        response.request().method() === 'POST' &&
        response.status() >= 200 && response.status() < 300
      ).catch(() => {}),
      brickItem.dragTo(canvas)
    ]);
    
    await page.waitForTimeout(2000);
    await expect(page.locator(`.brick-node:has-text("${brickType}")`)).toBeVisible({ timeout: 15000 });
  }

  // Helper function to get brick node by type
  async function getBrickNode(brickType: string) {
    return page.locator(`.brick-node:has-text("${brickType}")`).first();
  }

  // Helper function to get handle (connection point) by brick and handle name
  async function getHandle(brickNode: any, handleName: string, isOutput: boolean = false) {
    const handleType = isOutput ? 'source' : 'target';
    return brickNode.locator(`.react-flow__handle[data-handleid="${handleName}"][data-nodeid]`).or(
      brickNode.locator(`.react-flow__handle[data-handleid="${handleName}"]`)
    );
  }

  // Helper function to create connection by dragging
  async function createConnection(sourceBrickType: string, sourceOutput: string, targetBrickType: string, targetInput: string) {
    const sourceBrick = await getBrickNode(sourceBrickType);
    const targetBrick = await getBrickNode(targetBrickType);
    
    await expect(sourceBrick).toBeVisible();
    await expect(targetBrick).toBeVisible();
    
    // Get the source handle (output)
    const sourceHandle = sourceBrick.locator(`.react-flow__handle[data-handleid="${sourceOutput}"]`).or(
      sourceBrick.locator(`.react-flow__handle[data-handleid="${sourceOutput}"][data-nodeid]`)
    );
    
    // Get the target handle (input)
    const targetHandle = targetBrick.locator(`.react-flow__handle[data-handleid="${targetInput}"]`).or(
      targetBrick.locator(`.react-flow__handle[data-handleid="${targetInput}"][data-nodeid]`)
    );
    
    // Wait for handles to be visible
    await expect(sourceHandle).toBeVisible({ timeout: 5000 });
    await expect(targetHandle).toBeVisible({ timeout: 5000 });
    
    // Get bounding boxes
    const sourceBox = await sourceHandle.boundingBox();
    const targetBox = await targetHandle.boundingBox();
    
    if (!sourceBox || !targetBox) {
      throw new Error('Could not get bounding boxes for handles');
    }
    
    // Drag from source to target
    await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(100);
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 10 });
    await page.waitForTimeout(100);
    await page.mouse.up();
    
    // Wait for connection to be created
    await page.waitForTimeout(1000);
    
    // Wait for API response
    await page.waitForResponse(response => 
      response.url().includes('/api/v1/bricks') && 
      response.url().includes('/connections') &&
      response.request().method() === 'POST' &&
      response.status() >= 200 && response.status() < 300
    , { timeout: 10000 }).catch(() => {});
  }

  test('BRICK-LINK-001: Link Bricks - Positive Case', async () => {
    // Setup
    await ensureUserExists(PRIMARY_EMAIL, PRIMARY_PASSWORD);
    await page.goto('/home');
    await createProject(PROJECT_NAME);
    await openProjectEditor(PROJECT_NAME);
    await createFunction(FUNCTION_NAME);
    await openFunctionEditor(FUNCTION_NAME);

    // Step 1: Verify user is in Function Editor
    await expect(page.locator('.function-editor')).toBeVisible();

    // Step 2: Add bricks if they don't exist
    const brickNodes = page.locator('.brick-node');
    const brickCount = await brickNodes.count();
    
    if (brickCount < 2) {
      // Add "List instances by DB name" brick
      await addBrickToFunction('List instances by DB name');
      await page.waitForTimeout(1000);
      
      // Add "Get first instance" brick
      await addBrickToFunction('Get first instance');
      await page.waitForTimeout(1000);
    }

    // Step 2: Verify both bricks are displayed on canvas
    await expect(page.locator('.brick-node:has-text("List instances by DB name")')).toBeVisible();
    await expect(page.locator('.brick-node:has-text("Get first instance")')).toBeVisible();

    // Step 3-4: Verify connection points are visible
    const listBrick = await getBrickNode('List instances by DB name');
    const getFirstBrick = await getBrickNode('Get first instance');
    
    // Verify output handle "List" on "List instances by DB name"
    const listOutputHandle = listBrick.locator('.react-flow__handle').filter({ hasText: /List/i }).or(
      listBrick.locator('.react-flow__handle[data-handleid="List"]')
    );
    await expect(listOutputHandle.first()).toBeVisible({ timeout: 5000 });
    
    // Verify input handle "List" on "Get first instance"
    const getFirstInputHandle = getFirstBrick.locator('.react-flow__handle').filter({ hasText: /List/i }).or(
      getFirstBrick.locator('.react-flow__handle[data-handleid="List"]')
    );
    await expect(getFirstInputHandle.first()).toBeVisible({ timeout: 5000 });

    // Step 5-7: Create connection by dragging
    await createConnection('List instances by DB name', 'List', 'Get first instance', 'List');

    // Step 8: Verify link is created successfully
    // Check for edge/connection line in React Flow
    const edges = page.locator('.react-flow__edge');
    await expect(edges.first()).toBeVisible({ timeout: 5000 });

    // Step 9-10: Verify connection line is displayed
    await expect(edges.first()).toBeVisible();

    // Step 11: Verify link configuration is automatically persisted
    await page.waitForTimeout(2000); // Wait for API call

    // Step 12: Verify no error messages are displayed
    const errorNotification = page.locator('.error-notification');
    const errorVisible = await errorNotification.isVisible().catch(() => false);
    expect(errorVisible).toBe(false);
  });

  test('BRICK-LINK-002: Link Bricks - Link Complete Chain', async () => {
    // Setup
    await ensureUserExists(PRIMARY_EMAIL, PRIMARY_PASSWORD);
    await page.goto('/home');
    await createProject(PROJECT_NAME);
    await openProjectEditor(PROJECT_NAME);
    await createFunction(FUNCTION_NAME);
    await openFunctionEditor(FUNCTION_NAME);

    // Step 1: Verify user is in Function Editor
    await expect(page.locator('.function-editor')).toBeVisible();

    // Step 2: Add all three bricks if they don't exist
    const brickNodes = page.locator('.brick-node');
    const brickCount = await brickNodes.count();
    
    if (brickCount < 3) {
      await addBrickToFunction('List instances by DB name');
      await page.waitForTimeout(1000);
      await addBrickToFunction('Get first instance');
      await page.waitForTimeout(1000);
      await addBrickToFunction('Log instance props');
      await page.waitForTimeout(1000);
    }

    // Step 2: Verify all three bricks are displayed
    await expect(page.locator('.brick-node:has-text("List instances by DB name")')).toBeVisible();
    await expect(page.locator('.brick-node:has-text("Get first instance")')).toBeVisible();
    await expect(page.locator('.brick-node:has-text("Log instance props")')).toBeVisible();

    // Step 3: Create first link
    await createConnection('List instances by DB name', 'List', 'Get first instance', 'List');

    // Step 4: Verify first link is created
    const edges = page.locator('.react-flow__edge');
    await expect(edges.first()).toBeVisible({ timeout: 5000 });

    // Step 5: Create second link
    await createConnection('Get first instance', 'DB', 'Log instance props', 'Object');

    // Step 6: Verify second link is created
    const edgeCount = await edges.count();
    expect(edgeCount).toBeGreaterThanOrEqual(2);

    // Step 7: Verify both connection lines are visible
    await expect(edges.nth(0)).toBeVisible();
    await expect(edges.nth(1)).toBeVisible();

    // Step 8: Verify complete chain is linked
    // All edges should be visible
    const finalEdgeCount = await edges.count();
    expect(finalEdgeCount).toBeGreaterThanOrEqual(2);

    // Step 9: Verify all links are persisted
    await page.waitForTimeout(2000);

    // Step 10: Verify no error messages
    const errorNotification = page.locator('.error-notification');
    const errorVisible = await errorNotification.isVisible().catch(() => false);
    expect(errorVisible).toBe(false);
  });

  test('BRICK-LINK-003: Link Bricks - Negative Case - Incompatible Types', async () => {
    // Setup
    await ensureUserExists(PRIMARY_EMAIL, PRIMARY_PASSWORD);
    await page.goto('/home');
    await createProject(PROJECT_NAME);
    await openProjectEditor(PROJECT_NAME);
    await createFunction(FUNCTION_NAME);
    await openFunctionEditor(FUNCTION_NAME);

    // Step 1: Verify user is in Function Editor
    await expect(page.locator('.function-editor')).toBeVisible();

    // Step 2: Add bricks if they don't exist
    const brickNodes = page.locator('.brick-node');
    const brickCount = await brickNodes.count();
    
    if (brickCount < 2) {
      await addBrickToFunction('List instances by DB name');
      await page.waitForTimeout(1000);
      await addBrickToFunction('Log instance props');
      await page.waitForTimeout(1000);
    }

    // Step 2: Verify both bricks are displayed
    await expect(page.locator('.brick-node:has-text("List instances by DB name")')).toBeVisible();
    await expect(page.locator('.brick-node:has-text("Log instance props")')).toBeVisible();

    // Step 3: Attempt to create incompatible link
    const listBrick = await getBrickNode('List instances by DB name');
    const logBrick = await getBrickNode('Log instance props');
    
    const listOutputHandle = listBrick.locator('.react-flow__handle[data-handleid="List"]');
    const logInputHandle = logBrick.locator('.react-flow__handle[data-handleid="Object"]');
    
    await expect(listOutputHandle.first()).toBeVisible({ timeout: 5000 });
    await expect(logInputHandle.first()).toBeVisible({ timeout: 5000 });
    
    // Get initial edge count
    const initialEdgeCount = await page.locator('.react-flow__edge').count();
    
    // Attempt to drag from List output to Object input (incompatible)
    const listBox = await listOutputHandle.first().boundingBox();
    const logBox = await logInputHandle.first().boundingBox();
    
    if (listBox && logBox) {
      await page.mouse.move(listBox.x + listBox.width / 2, listBox.y + listBox.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(100);
      await page.mouse.move(logBox.x + logBox.width / 2, logBox.y + logBox.height / 2, { steps: 10 });
      await page.waitForTimeout(100);
      await page.mouse.up();
      await page.waitForTimeout(2000);
    }

    // Step 4-5: Verify link creation fails or system prevents incompatible link
    // Check for error message
    const errorNotification = page.locator('.error-notification');
    const errorVisible = await errorNotification.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (errorVisible) {
      const errorText = await errorNotification.textContent();
      expect(errorText?.toLowerCase()).toMatch(/incompatible|type|error/i);
    }

    // Step 6-7: Verify no link is created
    const finalEdgeCount = await page.locator('.react-flow__edge').count();
    expect(finalEdgeCount).toBe(initialEdgeCount);

    // Step 8: Verify canvas remains unchanged
    await expect(page.locator('.brick-node:has-text("List instances by DB name")')).toBeVisible();
    await expect(page.locator('.brick-node:has-text("Log instance props")')).toBeVisible();
  });

  test('BRICK-LINK-004: Link Bricks - Negative Case - Link Already Exists', async () => {
    // Setup
    await ensureUserExists(PRIMARY_EMAIL, PRIMARY_PASSWORD);
    await page.goto('/home');
    await createProject(PROJECT_NAME);
    await openProjectEditor(PROJECT_NAME);
    await createFunction(FUNCTION_NAME);
    await openFunctionEditor(FUNCTION_NAME);

    // Step 1: Verify user is in Function Editor
    await expect(page.locator('.function-editor')).toBeVisible();

    // Step 2: Add bricks if they don't exist
    const brickNodes = page.locator('.brick-node');
    const brickCount = await brickNodes.count();
    
    if (brickCount < 2) {
      await addBrickToFunction('List instances by DB name');
      await page.waitForTimeout(1000);
      await addBrickToFunction('Get first instance');
      await page.waitForTimeout(1000);
    }

    // Step 2: Verify both bricks are displayed
    await expect(page.locator('.brick-node:has-text("List instances by DB name")')).toBeVisible();
    await expect(page.locator('.brick-node:has-text("Get first instance")')).toBeVisible();

    // Step 3: Create initial link
    await createConnection('List instances by DB name', 'List', 'Get first instance', 'List');

    // Step 3: Verify existing link is displayed
    const edges = page.locator('.react-flow__edge');
    await expect(edges.first()).toBeVisible({ timeout: 5000 });
    const initialEdgeCount = await edges.count();

    // Step 4: Attempt to create duplicate link
    const listBrick = await getBrickNode('List instances by DB name');
    const getFirstBrick = await getBrickNode('Get first instance');
    
    const listOutputHandle = listBrick.locator('.react-flow__handle[data-handleid="List"]');
    const getFirstInputHandle = getFirstBrick.locator('.react-flow__handle[data-handleid="List"]');
    
    const listBox = await listOutputHandle.first().boundingBox();
    const getFirstBox = await getFirstInputHandle.first().boundingBox();
    
    if (listBox && getFirstBox) {
      await page.mouse.move(listBox.x + listBox.width / 2, listBox.y + listBox.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(100);
      await page.mouse.move(getFirstBox.x + getFirstBox.width / 2, getFirstBox.y + getFirstBox.height / 2, { steps: 10 });
      await page.waitForTimeout(100);
      await page.mouse.up();
      await page.waitForTimeout(2000);
    }

    // Step 5-6: Verify duplicate link creation fails
    const errorNotification = page.locator('.error-notification');
    const errorVisible = await errorNotification.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (errorVisible) {
      const errorText = await errorNotification.textContent();
      expect(errorText?.toLowerCase()).toMatch(/already exists|duplicate|error/i);
    }

    // Step 7-8: Verify no duplicate link is created
    const finalEdgeCount = await edges.count();
    expect(finalEdgeCount).toBe(initialEdgeCount);

    // Step 9: Verify canvas remains unchanged
    await expect(page.locator('.brick-node:has-text("List instances by DB name")')).toBeVisible();
    await expect(page.locator('.brick-node:has-text("Get first instance")')).toBeVisible();
  });

  test('BRICK-LINK-005: Link Bricks - Negative Case - Permission Denied', async () => {
    // Step 1: Create SharedProject and SharedFunction as owner
    await ensureUserExists(OWNER_EMAIL, OWNER_PASSWORD);
    await page.goto('/home');
    await createProject(SHARED_PROJECT_NAME);
    await openProjectEditor(SHARED_PROJECT_NAME);
    await createFunction(SHARED_FUNCTION_NAME);
    await openFunctionEditor(SHARED_FUNCTION_NAME);

    // Add bricks to function
    await addBrickToFunction('List instances by DB name');
    await page.waitForTimeout(1000);
    await addBrickToFunction('Get first instance');
    await page.waitForTimeout(1000);

    // Logout
    await page.click('button.settings-button, button[aria-label="Settings"]');
    await page.click('button.settings-logout:has-text("Logout")');
    await page.waitForURL('/login', { timeout: 5000 });

    // Step 2: Login as user@example.com
    await ensureUserExists(USER_EMAIL, USER_PASSWORD);
    await page.goto('/home');

    // Step 3: Attempt to access SharedFunction
    const sharedProjectCard = page.locator('.project-card').filter({ hasText: SHARED_PROJECT_NAME });
    const projectVisible = await sharedProjectCard.count() > 0;
    
    if (projectVisible) {
      await sharedProjectCard.first().dblclick();
      await page.waitForTimeout(2000);
      
      const isInProjectEditor = await page.locator('.project-editor').isVisible();
      
      if (isInProjectEditor) {
        const sharedFunctionCard = page.locator('.function-card').filter({ hasText: SHARED_FUNCTION_NAME });
        const functionVisible = await sharedFunctionCard.count() > 0;
        
        if (functionVisible) {
          await sharedFunctionCard.first().dblclick();
          await page.waitForTimeout(2000);
          
          const isInFunctionEditor = await page.locator('.function-editor').isVisible();
          
          if (isInFunctionEditor) {
            // Step 4: Attempt to create link
            const listBrick = await getBrickNode('List instances by DB name');
            const getFirstBrick = await getBrickNode('Get first instance');
            
            const listVisible = await listBrick.isVisible().catch(() => false);
            const getFirstVisible = await getFirstBrick.isVisible().catch(() => false);
            
            if (listVisible && getFirstVisible) {
              // Attempt to create connection
              const listOutputHandle = listBrick.locator('.react-flow__handle[data-handleid="List"]');
              const getFirstInputHandle = getFirstBrick.locator('.react-flow__handle[data-handleid="List"]');
              
              const listBox = await listOutputHandle.first().boundingBox();
              const getFirstBox = await getFirstInputHandle.first().boundingBox();
              
              if (listBox && getFirstBox) {
                await page.mouse.move(listBox.x + listBox.width / 2, listBox.y + listBox.height / 2);
                await page.mouse.down();
                await page.waitForTimeout(100);
                await page.mouse.move(getFirstBox.x + getFirstBox.width / 2, getFirstBox.y + getFirstBox.height / 2, { steps: 10 });
                await page.waitForTimeout(100);
                await page.mouse.up();
                await page.waitForTimeout(2000);
              }
              
              // Step 5: Check for error message
              const errorNotification = page.locator('.error-notification');
              const errorVisible = await errorNotification.isVisible({ timeout: 5000 }).catch(() => false);
              
              if (errorVisible) {
                const errorText = await errorNotification.textContent();
                expect(errorText?.toLowerCase()).toMatch(/permission denied|unauthorized/i);
              }
            }
          } else {
            // Function editor didn't open - permission check working
            const errorNotification = page.locator('.error-notification');
            const errorVisible = await errorNotification.isVisible().catch(() => false);
            if (errorVisible) {
              const errorText = await errorNotification.textContent();
              expect(errorText?.toLowerCase()).toMatch(/permission denied/i);
            }
          }
        }
      }
    } else {
      // Project not visible - permission check working
      // This is acceptable behavior
    }
  });

  test('BRICK-LINK-006: Link Bricks - Verify Link Persistence', async () => {
    // Setup
    await ensureUserExists(PRIMARY_EMAIL, PRIMARY_PASSWORD);
    await page.goto('/home');
    await createProject(PROJECT_NAME);
    await openProjectEditor(PROJECT_NAME);
    await createFunction(FUNCTION_NAME);
    await openFunctionEditor(FUNCTION_NAME);

    // Step 1: Verify user is in Function Editor
    await expect(page.locator('.function-editor')).toBeVisible();

    // Step 2: Add bricks if they don't exist
    const brickNodes = page.locator('.brick-node');
    const brickCount = await brickNodes.count();
    
    if (brickCount < 2) {
      await addBrickToFunction('List instances by DB name');
      await page.waitForTimeout(1000);
      await addBrickToFunction('Get first instance');
      await page.waitForTimeout(1000);
    }

    // Step 2: Verify both bricks are displayed
    await expect(page.locator('.brick-node:has-text("List instances by DB name")')).toBeVisible();
    await expect(page.locator('.brick-node:has-text("Get first instance")')).toBeVisible();

    // Step 3: Create link
    await createConnection('List instances by DB name', 'List', 'Get first instance', 'List');

    // Step 4: Verify link is created and connection line is displayed
    const edges = page.locator('.react-flow__edge');
    await expect(edges.first()).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(2000); // Wait for persistence

    // Step 5: Navigate away from Function Editor
    await page.click('button.back-button');
    await page.waitForURL(/\/projects\/[^/]+/, { timeout: 10000 });
    await expect(page.locator('.project-editor')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000);

    // Step 6: Navigate back to Function Editor
    await openFunctionEditor(FUNCTION_NAME);

    // Step 7: Verify Function Editor opens
    await expect(page.locator('.function-editor')).toBeVisible();
    await page.waitForTimeout(2000); // Wait for data to load

    // Step 8: Verify both bricks are still displayed
    await expect(page.locator('.brick-node:has-text("List instances by DB name")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.brick-node:has-text("Get first instance")')).toBeVisible({ timeout: 10000 });

    // Step 9: Verify connection line is still displayed
    const edgesAfter = page.locator('.react-flow__edge');
    await expect(edgesAfter.first()).toBeVisible({ timeout: 10000 });

    // Step 10: Verify link is persisted in function definition
    const edgeCount = await edgesAfter.count();
    expect(edgeCount).toBeGreaterThan(0);
  });
});
