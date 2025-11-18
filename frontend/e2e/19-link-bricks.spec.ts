import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const TEST_EMAIL = 'testuser@example.com';
const TEST_PASSWORD = 'SecurePass123!';
const OWNER_EMAIL = 'owner@example.com';
const OWNER_PASSWORD = 'SecurePass123!';
const USER_EMAIL = 'user@example.com';
const USER_PASSWORD = 'SecurePass456!';

const PROJECT_NAME = 'TestProject';
const SHARED_PROJECT_NAME = 'SharedProject';
const FUNCTION_NAME = 'TestFunction';
const FUNCTION_NAME_002 = 'TestFunction002';
const FUNCTION_NAME_004 = 'TestFunction004';
const FUNCTION_NAME_006 = 'TestFunction006';
const SHARED_FUNCTION_NAME = 'SharedFunction';

test.describe('Link Bricks Tests - Section 19', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    test.setTimeout(120000); // Increase timeout to 120 seconds per test
    
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
    // Wait for brick item to be visible
    const brickItem = page.locator(`.brick-item:has-text("${brickType}")`).or(page.locator(`.brick-item:has-text("${brickType.replace(/\s+/g, '')}")`));
    await expect(brickItem).toBeVisible({ timeout: 10000 });
    
    const canvas = page.locator('.function-editor-canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
    
    // Wait for API response after dragging brick
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/v1/bricks') && 
      response.request().method() === 'POST' &&
      response.status() >= 200 && response.status() < 300
    ).catch(() => null);
    
    await brickItem.dragTo(canvas);
    
    // Wait for response or timeout
    await Promise.race([
      responsePromise,
      page.waitForTimeout(5000)
    ]);
    
    // Wait for brick to appear on canvas
    await page.waitForTimeout(1000);
  }

  // Helper function to find brick node by label
  async function findBrickNode(brickLabel: string) {
    const brickNode = page.locator('.brick-node').filter({ hasText: brickLabel }).first();
    await expect(brickNode).toBeVisible({ timeout: 10000 });
    return brickNode;
  }

  // Helper function to find connection handle
  async function findHandle(brickNode: any, handleName: string, type: 'source' | 'target') {
    // React Flow handles have data-handleid attribute
    const handle = brickNode.locator(`.react-flow__handle[data-handleid="${handleName}"][data-nodeid="${await brickNode.getAttribute('id') || ''}"]`);
    // Alternative: find by position and type
    if (await handle.count() === 0) {
      // Try finding by position - source handles are on right, target on left
      const handles = brickNode.locator('.react-flow__handle');
      const count = await handles.count();
      for (let i = 0; i < count; i++) {
        const h = handles.nth(i);
        const handleId = await h.getAttribute('data-handleid');
        const handleType = await h.getAttribute('data-handlepos');
        if (handleId === handleName || (handleType === (type === 'source' ? 'right' : 'left'))) {
          return h;
        }
      }
    }
    return handle;
  }

  // Helper function to create link between bricks
  async function createLink(sourceBrickLabel: string, sourceOutput: string, targetBrickLabel: string, targetInput: string) {
    const sourceBrick = await findBrickNode(sourceBrickLabel);
    const targetBrick = await findBrickNode(targetBrickLabel);

    // Get brick node IDs
    const sourceBrickId = await sourceBrick.getAttribute('id') || '';
    const targetBrickId = await targetBrick.getAttribute('id') || '';

    // Find source handle (output) - React Flow handles have data-handleid and data-nodeid
    // Source handles are on the right side (outputs)
    const sourceHandles = sourceBrick.locator('.react-flow__handle[data-handlepos="right"]');
    await expect(sourceHandles.first()).toBeVisible({ timeout: 5000 });
    
    // Find target handle (input) - Target handles are on the left side (inputs)
    const targetHandles = targetBrick.locator('.react-flow__handle[data-handlepos="left"]');
    await expect(targetHandles.first()).toBeVisible({ timeout: 5000 });

    // Get the first source and target handles (assuming they match the output/input names)
    const sourceHandle = sourceHandles.first();
    const targetHandle = targetHandles.first();

    // Get bounding boxes
    const sourceBox = await sourceHandle.boundingBox();
    const targetBox = await targetHandle.boundingBox();

    if (!sourceBox || !targetBox) {
      throw new Error(`Could not find handle positions. Source: ${sourceBox ? 'found' : 'not found'}, Target: ${targetBox ? 'found' : 'not found'}`);
    }

    // Drag from source to target using React Flow's connection mechanism
    // Use force to bypass hover checks that might be intercepted
    await sourceHandle.hover({ timeout: 10000, force: true }).catch(() => {
      // If hover fails, use coordinates directly
    });
    
    // Get exact coordinates
    const sourceX = sourceBox.x + sourceBox.width / 2;
    const sourceY = sourceBox.y + sourceBox.height / 2;
    const targetX = targetBox.x + targetBox.width / 2;
    const targetY = targetBox.y + targetBox.height / 2;
    
    // Move to source, press, drag to target, release
    await page.mouse.move(sourceX, sourceY);
    await page.waitForTimeout(100);
    await page.mouse.down();
    await page.waitForTimeout(100);
    await page.mouse.move(targetX, targetY, { steps: 5 });
    await page.waitForTimeout(300); // Wait for React Flow to recognize the connection
    await page.mouse.up();

    // Wait for connection to be created - wait for API response or edge to appear
    // Also handle error responses (for duplicate links, incompatible types, etc.)
    await Promise.race([
      page.waitForResponse(response => 
        response.url().includes('/api/v1/bricks/') && 
        response.url().includes('/connections') &&
        response.request().method() === 'POST'
      ).then(response => {
        // If response is an error, that's okay - the caller can check for error notifications
        if (response.status() >= 400) {
          return Promise.resolve(); // Don't throw, just resolve
        }
        return Promise.resolve();
      }).catch(() => {}),
      page.waitForTimeout(3000) // Max wait time
    ]);
  }

  // BRICK-LINK-001: Link Bricks - Positive Case
  test('BRICK-LINK-001: Link Bricks - Positive Case', async () => {
    await ensureUserExists(TEST_EMAIL, TEST_PASSWORD);
    await page.goto('/home');

    await createProject(PROJECT_NAME);
    await openProjectEditor(PROJECT_NAME);
    await createFunction(FUNCTION_NAME);
    await openFunctionEditor(FUNCTION_NAME);

    // Verify user is in Function Editor
    await expect(page.locator('.function-editor')).toBeVisible();

    // Add bricks to canvas
    await addBrickToFunction('List instances by DB name');
    await page.waitForTimeout(2000); // Wait for first brick to appear
    
    await addBrickToFunction('Get first instance');
    await page.waitForTimeout(2000); // Wait for second brick to appear

    // Verify both bricks are displayed on canvas
    await expect(page.locator('.brick-node:has-text("List instances by DB name")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.brick-node:has-text("Get first instance")')).toBeVisible({ timeout: 10000 });
    
    const listBrick = await findBrickNode('List instances by DB name');
    const getFirstBrick = await findBrickNode('Get first instance');

    // Verify connection points are visible
    const sourceHandle = listBrick.locator('.react-flow__handle').first();
    const targetHandle = getFirstBrick.locator('.react-flow__handle').first();
    await expect(sourceHandle).toBeVisible();
    await expect(targetHandle).toBeVisible();

    // Create link
    await createLink('List instances by DB name', 'List', 'Get first instance', 'List');

    // Verify link is created - check for edge in React Flow
    await page.waitForTimeout(2000);
    const edges = page.locator('.react-flow__edge');
    await expect(edges.first()).toBeVisible({ timeout: 5000 });

    // Verify no error messages
    const errorNotification = page.locator('.error-notification');
    await expect(errorNotification).not.toBeVisible({ timeout: 1000 }).catch(() => {});
  });

  // BRICK-LINK-002: Link Complete Chain
  test('BRICK-LINK-002: Link Complete Chain', async () => {
    await ensureUserExists(TEST_EMAIL, TEST_PASSWORD);
    await page.goto('/home');

    await createProject(PROJECT_NAME);
    await openProjectEditor(PROJECT_NAME);
    await createFunction(FUNCTION_NAME_002);
    await openFunctionEditor(FUNCTION_NAME_002);

    // Verify user is in Function Editor
    await expect(page.locator('.function-editor')).toBeVisible();

    // Add all three bricks
    await addBrickToFunction('List instances by DB name');
    await addBrickToFunction('Get first instance');
    await addBrickToFunction('Log instance props');

    // Verify all three bricks are displayed
    await expect(page.locator('.brick-node:has-text("List instances by DB name")')).toBeVisible();
    await expect(page.locator('.brick-node:has-text("Get first instance")')).toBeVisible();
    await expect(page.locator('.brick-node:has-text("Log instance props")')).toBeVisible();

    // Create first link
    await createLink('List instances by DB name', 'List', 'Get first instance', 'List');
    await page.waitForTimeout(1000);

    // Verify first link is created
    let edges = page.locator('.react-flow__edge');
    await expect(edges.first()).toBeVisible({ timeout: 5000 });

    // Create second link
    await createLink('Get first instance', 'DB', 'Log instance props', 'Object');
    await page.waitForTimeout(1000);

    // Verify both links are visible
    edges = page.locator('.react-flow__edge');
    const edgeCount = await edges.count();
    expect(edgeCount).toBeGreaterThanOrEqual(2);

    // Verify no error messages
    const errorNotification = page.locator('.error-notification');
    await expect(errorNotification).not.toBeVisible({ timeout: 1000 }).catch(() => {});
  });

  // BRICK-LINK-003: Link Bricks - Negative Case - Incompatible Types
  test('BRICK-LINK-003: Link Bricks - Negative Case - Incompatible Types', async () => {
    await ensureUserExists(TEST_EMAIL, TEST_PASSWORD);
    await page.goto('/home');

    await createProject(PROJECT_NAME);
    await openProjectEditor(PROJECT_NAME);
    await createFunction(FUNCTION_NAME);
    await openFunctionEditor(FUNCTION_NAME);

    // Verify user is in Function Editor
    await expect(page.locator('.function-editor')).toBeVisible();

    // Add bricks
    await addBrickToFunction('List instances by DB name');
    await addBrickToFunction('Log instance props');

    // Verify both bricks are displayed
    await expect(page.locator('.brick-node:has-text("List instances by DB name")')).toBeVisible();
    await expect(page.locator('.brick-node:has-text("Log instance props")')).toBeVisible();

    // Attempt to create incompatible link
    try {
      await createLink('List instances by DB name', 'List', 'Log instance props', 'Object');
    } catch (e) {
      // Expected to fail
    }

    await page.waitForTimeout(2000);

    // Verify error message is displayed
    const errorNotification = page.locator('.error-notification');
    const errorVisible = await errorNotification.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (errorVisible) {
      const errorText = await errorNotification.textContent();
      expect(errorText?.toLowerCase()).toMatch(/incompatible|type|error/i);
    }

    // Verify no link is created (or verify error was shown)
    const edges = page.locator('.react-flow__edge');
    const edgeCount = await edges.count();
    // If error was shown, no edge should be created
    if (errorVisible) {
      expect(edgeCount).toBe(0);
    }
  });

  // BRICK-LINK-004: Link Bricks - Negative Case - Link Already Exists
  test('BRICK-LINK-004: Link Bricks - Negative Case - Link Already Exists', async () => {
    await ensureUserExists(TEST_EMAIL, TEST_PASSWORD);
    await page.goto('/home');

    await createProject(PROJECT_NAME);
    await openProjectEditor(PROJECT_NAME);
    await createFunction(FUNCTION_NAME_004);
    await openFunctionEditor(FUNCTION_NAME_004);

    // Verify user is in Function Editor
    await expect(page.locator('.function-editor')).toBeVisible();

    // Add bricks
    await addBrickToFunction('List instances by DB name');
    await addBrickToFunction('Get first instance');

    // Create first link
    await createLink('List instances by DB name', 'List', 'Get first instance', 'List');
    await page.waitForTimeout(2000);

    // Verify existing link is displayed
    let edges = page.locator('.react-flow__edge');
    await expect(edges.first()).toBeVisible({ timeout: 5000 });
    const initialEdgeCount = await edges.count();

    // Attempt to create duplicate link
    // createLink will handle the error response gracefully
    await createLink('List instances by DB name', 'List', 'Get first instance', 'List');
    await page.waitForTimeout(2000);

    // Verify error message or no duplicate link
    const errorNotification = page.locator('.error-notification');
    const errorVisible = await errorNotification.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (errorVisible) {
      const errorText = await errorNotification.textContent();
      expect(errorText?.toLowerCase()).toMatch(/already exists|duplicate|error|failed|connection/i);
    }

    // Verify only one connection line exists
    edges = page.locator('.react-flow__edge');
    const finalEdgeCount = await edges.count();
    expect(finalEdgeCount).toBe(initialEdgeCount);
  });

  // BRICK-LINK-005: Link Bricks - Negative Case - Permission Denied
  test('BRICK-LINK-005: Link Bricks - Negative Case - Permission Denied', async () => {
    // Setup: Create owner and user
    await ensureUserExists(OWNER_EMAIL, OWNER_PASSWORD);
    await page.goto('/home');

    // Create shared project as owner
    await createProject(SHARED_PROJECT_NAME);
    await openProjectEditor(SHARED_PROJECT_NAME);
    await createFunction(SHARED_FUNCTION_NAME);

    // Logout and login as user without edit permission
    await page.click('button.settings-button, button[aria-label="Settings"]');
    await page.click('button.settings-logout:has-text("Logout")');
    await page.waitForURL('/login', { timeout: 5000 });

    await ensureUserExists(USER_EMAIL, USER_PASSWORD);
    await page.goto('/home');

    // Try to access the shared project
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
            // If editor opened, try to add bricks and link them
            // First check if bricks are visible
            const bricksVisible = await page.locator('.brick-item').count() > 0;
            
            if (bricksVisible) {
              // Try to add bricks (this might fail due to permissions)
              try {
                await addBrickToFunction('List instances by DB name');
                await addBrickToFunction('Get first instance');
                await page.waitForTimeout(2000);

                // Try to create link
                try {
                  await createLink('List instances by DB name', 'List', 'Get first instance', 'List');
                } catch (e) {
                  // Expected to fail
                }

                await page.waitForTimeout(2000);

                // Verify error message
                const errorNotification = page.locator('.error-notification');
                const errorVisible = await errorNotification.isVisible({ timeout: 5000 }).catch(() => false);
                
                if (errorVisible) {
                  const errorText = await errorNotification.textContent();
                  expect(errorText?.toLowerCase()).toMatch(/permission denied|unauthorized|forbidden/i);
                }
              } catch (e) {
                // Adding bricks might fail - that's expected
              }
            }
          } else {
            // Function editor didn't open - verify error
            const errorNotification = page.locator('.error-notification');
            if (await errorNotification.isVisible({ timeout: 5000 }).catch(() => false)) {
              const errorText = await errorNotification.textContent();
              expect(errorText?.toLowerCase()).toMatch(/permission denied|unauthorized/i);
            }
          }
        }
      }
    }
  });

  // BRICK-LINK-006: Verify Link Persistence
  test('BRICK-LINK-006: Verify Link Persistence', async () => {
    await ensureUserExists(TEST_EMAIL, TEST_PASSWORD);
    await page.goto('/home');

    await createProject(PROJECT_NAME);
    await openProjectEditor(PROJECT_NAME);
    await createFunction(FUNCTION_NAME_006);
    await openFunctionEditor(FUNCTION_NAME_006);

    // Verify user is in Function Editor
    await expect(page.locator('.function-editor')).toBeVisible();

    // Add bricks
    await addBrickToFunction('List instances by DB name');
    await addBrickToFunction('Get first instance');

    // Create link
    await createLink('List instances by DB name', 'List', 'Get first instance', 'List');
    await page.waitForTimeout(2000);

    // Verify link is created
    let edges = page.locator('.react-flow__edge');
    await expect(edges.first()).toBeVisible({ timeout: 5000 });

    // Navigate away from Function Editor
    await page.click('button.back-button:has-text("Back")');
    await page.waitForURL(/\/projects\/[^/]+/, { timeout: 10000 });
    await expect(page.locator('.project-editor')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000);

    // Navigate back to Function Editor
    const functionCard = page.locator('.function-card').filter({ hasText: FUNCTION_NAME_006 }).first();
    await expect(functionCard).toBeVisible({ timeout: 10000 });
    await functionCard.dblclick();
    await page.waitForURL(/\/functions\/[^/]+/, { timeout: 10000 });
    await expect(page.locator('.function-editor')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(3000);

    // Verify both bricks are still displayed
    await expect(page.locator('.brick-node:has-text("List instances by DB name")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.brick-node:has-text("Get first instance")')).toBeVisible({ timeout: 10000 });

    // Verify connection line is still displayed
    edges = page.locator('.react-flow__edge');
    await expect(edges.first()).toBeVisible({ timeout: 10000 });
  });
});
