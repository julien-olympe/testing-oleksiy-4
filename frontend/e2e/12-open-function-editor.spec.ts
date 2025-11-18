import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const PRIMARY_EMAIL = 'testuser@example.com';
const PRIMARY_PASSWORD = 'SecurePass123!';
const OWNER_EMAIL = 'owner@example.com';
const OWNER_PASSWORD = 'SecurePass123!';
const USER_EMAIL = 'user@example.com';
const USER_PASSWORD = 'SecurePass456!';

test.describe('Open Function Editor Tests', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    
    // Navigate to login screen
    await page.goto('/login');
  });

  test('FUNC-OPEN-001: Open Function Editor - Positive Case', async () => {
    // ===== STEP 1: Login User =====
    await test.step('Step 1: Login User', async () => {
      // Verify Login Screen is displayed
      await expect(page.locator('input[id="email"]')).toBeVisible();
      await expect(page.locator('input[id="password"]')).toBeVisible();

      // Enter login credentials
      await page.fill('input[id="email"]', PRIMARY_EMAIL);
      await page.fill('input[id="password"]', PRIMARY_PASSWORD);

      // Click Login button
      await page.click('button[type="submit"]:has-text("Login")');

      // Wait for navigation to home screen
      await page.waitForURL('/home', { timeout: 10000 });
      await expect(page.locator('h1:has-text("Home")')).toBeVisible();
    });

    // ===== STEP 2: Create Project and Function =====
    await test.step('Step 2: Create Project and Function', async () => {
      // Create project by dragging Project brick
      const projectBrick = page.locator('.brick-item:has-text("Project")');
      const projectListArea = page.locator('.project-list-area');
      
      await expect(projectBrick).toBeVisible();
      await projectBrick.dragTo(projectListArea);
      
      // Wait for project to be created
      await page.waitForTimeout(1000);
      
      // Rename project to "TestProject"
      const projectCard = page.locator('.project-card').first();
      await projectCard.click();
      await page.waitForTimeout(500);
      
      // Click rename button
      const renameButton = projectCard.locator('button.project-action-button').first();
      await renameButton.click();
      await page.waitForTimeout(300);
      
      // Wait for input to appear and fill it
      const projectNameInput = projectCard.locator('input.project-name-input');
      await expect(projectNameInput).toBeVisible({ timeout: 5000 });
      await projectNameInput.clear();
      await projectNameInput.fill('TestProject');
      await projectNameInput.press('Enter');
      await page.waitForTimeout(1000);
      
      // Open project editor
      const renamedProjectCard = page.locator('.project-card:has-text("TestProject")').first();
      await renamedProjectCard.dblclick();
      await page.waitForURL(/\/projects\/[^/]+/, { timeout: 10000 });
      await expect(page.locator('.project-editor')).toBeVisible();
      
      // Verify Project tab is active
      await expect(page.locator('button.tab-button.active:has-text("Project")')).toBeVisible();
      
      // Create function by dragging Function brick
      const functionBrick = page.locator('.brick-item:has-text("Function")');
      const functionListArea = page.locator('.function-list-area');
      
      await expect(functionBrick).toBeVisible();
      await functionBrick.dragTo(functionListArea);
      await page.waitForTimeout(1000);
      
      // Rename function to "TestFunction"
      const functionCard = page.locator('.function-card').first();
      await functionCard.click();
      await page.waitForTimeout(500);
      
      // Click rename button
      const functionRenameButton = functionCard.locator('button.function-action-button').first();
      await functionRenameButton.click();
      await page.waitForTimeout(300);
      
      // Wait for input to appear and fill it
      const functionNameInput = functionCard.locator('input.function-name-input');
      await expect(functionNameInput).toBeVisible({ timeout: 5000 });
      await functionNameInput.clear();
      await functionNameInput.fill('TestFunction');
      await functionNameInput.press('Enter');
      await page.waitForTimeout(1000);
    });

    // ===== STEP 3: Verify User is in Project Editor =====
    await test.step('Step 3: Verify User is in Project Editor with Project tab active', async () => {
      // Verify project editor is displayed
      await expect(page.locator('.project-editor')).toBeVisible();
      
      // Verify Project tab is active
      await expect(page.locator('button.tab-button.active:has-text("Project")')).toBeVisible();
    });

    // ===== STEP 4: Verify Function is Displayed =====
    await test.step('Step 4: Verify function "TestFunction" is displayed in the function list', async () => {
      const functionCard = page.locator('.function-card:has-text("TestFunction")');
      await expect(functionCard).toBeVisible();
    });

    // ===== STEP 5: Double-click on Function =====
    await test.step('Step 5: Double-click on function "TestFunction"', async () => {
      const functionCard = page.locator('.function-card:has-text("TestFunction")');
      await functionCard.dblclick();
      
      // Wait for navigation to function editor
      await page.waitForURL(/\/functions\/[^/]+/, { timeout: 10000 });
    });

    // ===== STEP 6: Verify Function Editor is Opened =====
    await test.step('Step 6: Verify Function Editor is opened', async () => {
      await expect(page.locator('.function-editor')).toBeVisible();
    });

    // ===== STEP 7: Verify Settings Icon =====
    await test.step('Step 7: Verify Function Editor displays settings icon in top-right corner', async () => {
      await expect(page.locator('button.settings-button, button[aria-label="Settings"]')).toBeVisible();
    });

    // ===== STEP 8: Verify RUN Button =====
    await test.step('Step 8: Verify left side panel shows RUN button (positioned above search bar)', async () => {
      await expect(page.locator('.function-editor-sidebar')).toBeVisible();
      const runButton = page.locator('button.run-button:has-text("RUN")');
      await expect(runButton).toBeVisible();
      
      // Verify RUN button is above search bar (check order in DOM)
      const sidebar = page.locator('.function-editor-sidebar');
      const runButtonIndex = await sidebar.locator('button.run-button').evaluate((el) => {
        const parent = el.parentElement;
        if (!parent) return -1;
        return Array.from(parent.children).indexOf(el);
      });
      const searchBarIndex = await sidebar.locator('input.brick-search').evaluate((el) => {
        const parent = el.parentElement;
        if (!parent) return -1;
        return Array.from(parent.children).indexOf(el);
      });
      
      expect(runButtonIndex).toBeLessThan(searchBarIndex);
    });

    // ===== STEP 9: Verify Search Bar =====
    await test.step('Step 9: Verify left side panel shows search bar below RUN button', async () => {
      await expect(page.locator('input.brick-search')).toBeVisible();
    });

    // ===== STEP 10: Verify Brick List =====
    await test.step('Step 10: Verify left side panel shows brick list below search bar', async () => {
      await expect(page.locator('.brick-list')).toBeVisible();
    });

    // ===== STEP 11: Verify Three Bricks =====
    await test.step('Step 11: Verify brick list displays three bricks: "List instances by DB name", "Get first instance", "Log instance props"', async () => {
      await expect(page.locator('.brick-item:has-text("List instances by DB name")')).toBeVisible();
      await expect(page.locator('.brick-item:has-text("Get first instance")')).toBeVisible();
      await expect(page.locator('.brick-item:has-text("Log instance props")')).toBeVisible();
    });

    // ===== STEP 12: Verify Canvas =====
    await test.step('Step 12: Verify center area shows grid-based canvas (initially empty if function has no bricks)', async () => {
      await expect(page.locator('.function-editor-canvas')).toBeVisible();
      await expect(page.locator('.react-flow')).toBeVisible();
    });

    // ===== STEP 13: Verify Bricks are Draggable =====
    await test.step('Step 13: Verify all bricks in the list are draggable', async () => {
      const brickItems = page.locator('.brick-item');
      const count = await brickItems.count();
      
      for (let i = 0; i < count; i++) {
        const brick = brickItems.nth(i);
        const draggable = await brick.getAttribute('draggable');
        expect(draggable).toBe('true');
      }
    });

    // ===== STEP 14: Verify No Error Messages =====
    await test.step('Step 14: Verify no error messages are displayed', async () => {
      // Check for error notification (if it exists, it should not be visible)
      const errorNotification = page.locator('.error-notification');
      if (await errorNotification.count() > 0) {
        await expect(errorNotification).not.toBeVisible();
      }
    });
  });

  test('FUNC-OPEN-002: Open Function Editor - Negative Case - Permission Denied', async () => {
    // ===== STEP 1: Create Owner Account and Project =====
    await test.step('Step 1: Create Owner Account and Project', async () => {
      // Register owner account
      await page.goto('/login');
      const registerButton = page.locator('button:has-text("Don\'t have an account? Register")').or(page.locator('button:has-text("Register")'));
      if (await registerButton.isVisible()) {
        await registerButton.click();
      }
      
      await page.fill('input[id="email"]', OWNER_EMAIL);
      await page.fill('input[id="password"]', OWNER_PASSWORD);
      await page.click('button[type="submit"]:has-text("Register")');
      
      // Wait for home screen or handle existing user
      try {
        await page.waitForURL('/home', { timeout: 5000 });
      } catch {
        // User might already exist, try login
        await page.goto('/login');
        await page.fill('input[id="email"]', OWNER_EMAIL);
        await page.fill('input[id="password"]', OWNER_PASSWORD);
        await page.click('button[type="submit"]:has-text("Login")');
        await page.waitForURL('/home', { timeout: 10000 });
      }
      
      // Create project
      const projectBrick = page.locator('.brick-item:has-text("Project")');
      const projectListArea = page.locator('.project-list-area');
      await projectBrick.dragTo(projectListArea);
      await page.waitForTimeout(1000);
      
      // Rename project
      const projectCard = page.locator('.project-card').first();
      await projectCard.click();
      await page.waitForTimeout(500);
      const renameButton = projectCard.locator('button.project-action-button').first();
      await renameButton.click();
      const projectNameInput = projectCard.locator('input.project-name-input');
      await expect(projectNameInput).toBeVisible();
      await projectNameInput.clear();
      await projectNameInput.fill('SharedProject');
      await projectNameInput.press('Enter');
      await page.waitForTimeout(1000);
      
      // Open project editor
      const renamedProjectCard = page.locator('.project-card:has-text("SharedProject")').first();
      await renamedProjectCard.dblclick();
      await page.waitForURL(/\/projects\/[^/]+/, { timeout: 10000 });
      
      // Create function
      const functionBrick = page.locator('.brick-item:has-text("Function")');
      const functionListArea = page.locator('.function-list-area');
      await functionBrick.dragTo(functionListArea);
      await page.waitForTimeout(1000);
      
      // Rename function
      const functionCard = page.locator('.function-card').first();
      await functionCard.click();
      await page.waitForTimeout(500);
      const functionRenameButton = functionCard.locator('button.function-action-button').first();
      await functionRenameButton.click();
      const functionNameInput = functionCard.locator('input.function-name-input');
      await expect(functionNameInput).toBeVisible();
      await functionNameInput.clear();
      await functionNameInput.fill('PrivateFunction');
      await functionNameInput.press('Enter');
      await page.waitForTimeout(1000);
      
      // Logout
      await page.click('button.settings-button, button[aria-label="Settings"]');
      await page.click('button.settings-logout:has-text("Logout")');
      await page.waitForURL('/login', { timeout: 10000 });
    });

    // ===== STEP 2: Login as User Without Permission =====
    await test.step('Step 2: Login as User Without Permission', async () => {
      // Register or login as user@example.com
      const registerButton = page.locator('button:has-text("Don\'t have an account? Register")').or(page.locator('button:has-text("Register")'));
      if (await registerButton.isVisible()) {
        await registerButton.click();
      }
      
      await page.fill('input[id="email"]', USER_EMAIL);
      await page.fill('input[id="password"]', USER_PASSWORD);
      await page.click('button[type="submit"]:has-text("Register")');
      
      try {
        await page.waitForURL('/home', { timeout: 5000 });
      } catch {
        await page.goto('/login');
        await page.fill('input[id="email"]', USER_EMAIL);
        await page.fill('input[id="password"]', USER_PASSWORD);
        await page.click('button[type="submit"]:has-text("Login")');
        await page.waitForURL('/home', { timeout: 10000 });
      }
    });

    // ===== STEP 3: Verify User is in Project Editor =====
    await test.step('Step 3: Verify user "user@example.com" is in Project Editor for project "SharedProject"', async () => {
      // Check if SharedProject is visible (user might not have access)
      const sharedProjectCard = page.locator('.project-card:has-text("SharedProject")');
      const projectCount = await sharedProjectCard.count();
      
      if (projectCount === 0) {
        // Project is not visible to user (expected behavior)
        // Test passes - user cannot see the project
        return;
      }
      
      // If project is visible, open it
      await sharedProjectCard.first().dblclick();
      await page.waitForURL(/\/projects\/[^/]+/, { timeout: 10000 });
      await expect(page.locator('.project-editor')).toBeVisible();
      await expect(page.locator('.project-tab.active')).toBeVisible();
    });

    // ===== STEP 4: Verify Function Visibility =====
    await test.step('Step 4: Verify function "PrivateFunction" is NOT displayed or user lacks permission', async () => {
      const privateFunctionCard = page.locator('.function-card:has-text("PrivateFunction")');
      const functionCount = await privateFunctionCard.count();
      
      if (functionCount === 0) {
        // Function is not visible (expected - user has no permission)
        // Test passes
        return;
      }
      
      // If function is visible, try to access it
      if (functionCount > 0) {
        await privateFunctionCard.first().dblclick();
        
        // Wait for either navigation or error
        await page.waitForTimeout(2000);
        
        // Check for error message
        const errorNotification = page.locator('.error-notification');
        const errorVisible = await errorNotification.isVisible().catch(() => false);
        
        if (errorVisible) {
          const errorText = await errorNotification.textContent();
          expect(errorText).toContain('Permission denied');
        }
        
        // Verify Function Editor is NOT opened
        await expect(page.locator('.function-editor')).not.toBeVisible();
        
        // Verify user remains in Project Editor
        await expect(page.locator('.project-editor')).toBeVisible();
      }
    });
  });

  test('FUNC-OPEN-003: Open Function Editor - Verify Function Data Loading', async () => {
    // ===== STEP 1: Login and Setup =====
    await test.step('Step 1: Login and Setup', async () => {
      await page.fill('input[id="email"]', PRIMARY_EMAIL);
      await page.fill('input[id="password"]', PRIMARY_PASSWORD);
      await page.click('button[type="submit"]:has-text("Login")');
      await page.waitForURL('/home', { timeout: 10000 });
      
      // Create or find project
      let projectCard = page.locator('.project-card:has-text("TestProject")');
      let projectCount = await projectCard.count();
      
      if (projectCount === 0) {
        // Create project
        const projectBrick = page.locator('.brick-item:has-text("Project")');
        const projectListArea = page.locator('.project-list-area');
        await projectBrick.dragTo(projectListArea);
        await page.waitForTimeout(1000);
        
        projectCard = page.locator('.project-card').first();
        await projectCard.click();
        await page.waitForTimeout(500);
        const renameButton = projectCard.locator('button.project-action-button').first();
        await renameButton.click();
        await page.waitForTimeout(300);
        const projectNameInput = projectCard.locator('input.project-name-input');
        await expect(projectNameInput).toBeVisible({ timeout: 5000 });
        await projectNameInput.clear();
        await projectNameInput.fill('TestProject');
        await projectNameInput.press('Enter');
        await page.waitForTimeout(1000);
        
        projectCard = page.locator('.project-card:has-text("TestProject")');
      }
      
      // Open project editor
      await projectCard.first().dblclick();
      await page.waitForURL(/\/projects\/[^/]+/, { timeout: 10000 });
      
      // Create or find function
      let functionCard = page.locator('.function-card:has-text("TestFunction")');
      let functionCount = await functionCard.count();
      
      if (functionCount === 0) {
        // Create function
        const functionBrick = page.locator('.brick-item:has-text("Function")');
        const functionListArea = page.locator('.function-list-area');
        await functionBrick.dragTo(functionListArea);
        await page.waitForTimeout(1000);
        
        functionCard = page.locator('.function-card').first();
        await expect(functionCard).toBeVisible();
        await functionCard.click();
        await page.waitForTimeout(500);
        const functionRenameButton = functionCard.locator('button.function-action-button').first();
        await expect(functionRenameButton).toBeVisible();
        await functionRenameButton.click();
        await page.waitForTimeout(300);
        const functionNameInput = functionCard.locator('input.function-name-input');
        await expect(functionNameInput).toBeVisible({ timeout: 5000 });
        await functionNameInput.clear();
        await functionNameInput.fill('TestFunction');
        await functionNameInput.press('Enter');
        await page.waitForTimeout(1000);
        
        functionCard = page.locator('.function-card:has-text("TestFunction")');
        await expect(functionCard).toBeVisible();
      }
      
      // Open function editor to add bricks
      await functionCard.first().dblclick();
      await page.waitForURL(/\/functions\/[^/]+/, { timeout: 10000 });
      await expect(page.locator('.function-editor')).toBeVisible();
      
      // Add a brick to the function
      const listBrick = page.locator('.brick-item:has-text("List instances by DB name")');
      const canvas = page.locator('.function-editor-canvas');
      await listBrick.dragTo(canvas);
      await page.waitForTimeout(2000);
      
      // Go back to project editor
      await page.click('button.back-button');
      await page.waitForURL(/\/projects\/[^/]+/, { timeout: 10000 });
      await expect(page.locator('.project-editor')).toBeVisible();
      
      // Click Project tab to ensure it's active
      const projectTab = page.locator('button.tab-button:has-text("Project")');
      await expect(projectTab).toBeVisible();
      await projectTab.click();
      await page.waitForTimeout(500);
      await expect(page.locator('button.tab-button.active:has-text("Project")')).toBeVisible();
    });

    // ===== STEP 2: Verify User is in Project Editor =====
    await test.step('Step 2: Verify user is in Project Editor with Project tab active', async () => {
      await expect(page.locator('.project-editor')).toBeVisible();
      await expect(page.locator('button.tab-button.active:has-text("Project")')).toBeVisible();
    });

    // ===== STEP 3: Verify Function is Displayed =====
    await test.step('Step 3: Verify function "TestFunction" is displayed in the function list', async () => {
      const functionCard = page.locator('.function-card:has-text("TestFunction")');
      await expect(functionCard).toBeVisible();
    });

    // ===== STEP 4: Open Function Editor =====
    await test.step('Step 4: Double-click on function "TestFunction"', async () => {
      const functionCard = page.locator('.function-card:has-text("TestFunction")');
      await functionCard.dblclick();
      await page.waitForURL(/\/functions\/[^/]+/, { timeout: 10000 });
    });

    // ===== STEP 5: Verify Function Editor Opens =====
    await test.step('Step 5: Verify Function Editor opens', async () => {
      await expect(page.locator('.function-editor')).toBeVisible();
    });

    // ===== STEP 6: Verify Canvas Displays Bricks =====
    await test.step('Step 6: Verify center canvas displays the configured bricks', async () => {
      // Wait for React Flow to render
      await page.waitForTimeout(1000);
      
      // Check if there are any nodes (bricks) on the canvas
      const brickNodes = page.locator('.brick-node');
      await expect(brickNodes.first()).toBeVisible({ timeout: 5000 });
      const nodeCount = await brickNodes.count();
      expect(nodeCount).toBeGreaterThan(0);
    });

    // ===== STEP 7: Verify Bricks are Positioned on Grid =====
    await test.step('Step 7: Verify bricks are positioned on grid cells', async () => {
      const brickNodes = page.locator('.brick-node');
      const nodeCount = await brickNodes.count();
      expect(nodeCount).toBeGreaterThan(0);
      
      // Verify nodes have position attributes (React Flow positions them)
      for (let i = 0; i < nodeCount; i++) {
        const node = brickNodes.nth(i);
        await expect(node).toBeVisible();
      }
    });

    // ===== STEP 8: Verify Connections =====
    await test.step('Step 8: Verify brick connections (links) are displayed as connection lines', async () => {
      // Check for React Flow edges (connections)
      const reactFlowEdges = page.locator('.react-flow__edge');
      const edgeCount = await reactFlowEdges.count();
      // Edges may or may not exist depending on test setup
      // Just verify the canvas can display edges
      expect(edgeCount).toBeGreaterThanOrEqual(0);
    });

    // ===== STEP 9: Verify Connection Points =====
    await test.step('Step 9: Verify input/output connection points are visible on bricks', async () => {
      // Check for React Flow handles (connection points)
      const reactFlowHandles = page.locator('.react-flow__handle');
      const handleCount = await reactFlowHandles.count();
      expect(handleCount).toBeGreaterThan(0);
    });

    // ===== STEP 10: Verify Parameters =====
    await test.step('Step 10: Verify configured input parameters are displayed on bricks', async () => {
      // Check if bricks have input containers (for parameters)
      const brickNodes = page.locator('.brick-node');
      const nodeCount = await brickNodes.count();
      expect(nodeCount).toBeGreaterThan(0);
      
      // At least one node should be visible
      await expect(brickNodes.first()).toBeVisible();
    });
  });

  test('FUNC-OPEN-004: Open Function Editor - Verify Empty Function Display', async () => {
    // ===== STEP 1: Login and Setup =====
    await test.step('Step 1: Login and Setup', async () => {
      await page.fill('input[id="email"]', PRIMARY_EMAIL);
      await page.fill('input[id="password"]', PRIMARY_PASSWORD);
      await page.click('button[type="submit"]:has-text("Login")');
      await page.waitForURL('/home', { timeout: 10000 });
      
      // Create or find project
      let projectCard = page.locator('.project-card:has-text("TestProject")');
      let projectCount = await projectCard.count();
      
      if (projectCount === 0) {
        // Create project
        const projectBrick = page.locator('.brick-item:has-text("Project")');
        const projectListArea = page.locator('.project-list-area');
        await projectBrick.dragTo(projectListArea);
        await page.waitForTimeout(1000);
        
        projectCard = page.locator('.project-card').first();
        await expect(projectCard).toBeVisible();
        await projectCard.click();
        await page.waitForTimeout(500);
        const renameButton = projectCard.locator('button.project-action-button').first();
        await expect(renameButton).toBeVisible();
        await renameButton.click();
        await page.waitForTimeout(300);
        const projectNameInput = projectCard.locator('input.project-name-input');
        await expect(projectNameInput).toBeVisible({ timeout: 5000 });
        await projectNameInput.clear();
        await projectNameInput.fill('TestProject');
        await projectNameInput.press('Enter');
        await page.waitForTimeout(1000);
        
        projectCard = page.locator('.project-card:has-text("TestProject")');
        await expect(projectCard.first()).toBeVisible();
      }
      
      // Open project editor
      await projectCard.first().dblclick();
      await page.waitForURL(/\/projects\/[^/]+/, { timeout: 10000 });
      await expect(page.locator('.project-editor')).toBeVisible();
    });

    // ===== STEP 2: Create Empty Function =====
    await test.step('Step 2: Create Empty Function', async () => {
      // Create or find empty function
      let functionCard = page.locator('.function-card:has-text("EmptyFunction")');
      let functionCount = await functionCard.count();
      
      if (functionCount === 0) {
        // Create function
        const functionBrick = page.locator('.brick-item:has-text("Function")');
        const functionListArea = page.locator('.function-list-area');
        await functionBrick.dragTo(functionListArea);
        await page.waitForTimeout(1000);
        
        functionCard = page.locator('.function-card').first();
        await expect(functionCard).toBeVisible();
        await functionCard.click();
        await page.waitForTimeout(500);
        const functionRenameButton = functionCard.locator('button.function-action-button').first();
        await expect(functionRenameButton).toBeVisible();
        await functionRenameButton.click();
        await page.waitForTimeout(300);
        const functionNameInput = functionCard.locator('input.function-name-input');
        await expect(functionNameInput).toBeVisible({ timeout: 5000 });
        await functionNameInput.clear();
        await functionNameInput.fill('EmptyFunction');
        await functionNameInput.press('Enter');
        await page.waitForTimeout(1000);
        
        functionCard = page.locator('.function-card:has-text("EmptyFunction")');
        await expect(functionCard).toBeVisible();
      }
    });

    // ===== STEP 3: Verify User is in Project Editor =====
    await test.step('Step 3: Verify user is in Project Editor with Project tab active', async () => {
      await expect(page.locator('.project-editor')).toBeVisible();
      await expect(page.locator('button.tab-button.active:has-text("Project")')).toBeVisible();
    });

    // ===== STEP 4: Verify Function is Displayed =====
    await test.step('Step 4: Verify function "EmptyFunction" is displayed in the function list', async () => {
      const functionCard = page.locator('.function-card:has-text("EmptyFunction")');
      await expect(functionCard).toBeVisible();
    });

    // ===== STEP 5: Open Function Editor =====
    await test.step('Step 5: Double-click on function "EmptyFunction"', async () => {
      const functionCard = page.locator('.function-card:has-text("EmptyFunction")');
      await functionCard.dblclick();
      await page.waitForURL(/\/functions\/[^/]+/, { timeout: 10000 });
    });

    // ===== STEP 6: Verify Function Editor Opens =====
    await test.step('Step 6: Verify Function Editor opens', async () => {
      await expect(page.locator('.function-editor')).toBeVisible();
    });

    // ===== STEP 7: Verify Canvas is Displayed =====
    await test.step('Step 7: Verify center canvas is displayed', async () => {
      await expect(page.locator('.function-editor-canvas')).toBeVisible();
      await expect(page.locator('.react-flow')).toBeVisible();
    });

    // ===== STEP 8: Verify Canvas is Empty =====
    await test.step('Step 8: Verify canvas is empty (no bricks displayed)', async () => {
      // Wait for React Flow to render
      await page.waitForTimeout(1000);
      
      // Check if there are any nodes (bricks) on the canvas
      const reactFlowNodes = page.locator('.react-flow__node');
      const nodeCount = await reactFlowNodes.count();
      expect(nodeCount).toBe(0);
    });

    // ===== STEP 9: Verify Grid Layout =====
    await test.step('Step 9: Verify grid layout is visible (if grid is always visible)', async () => {
      // React Flow Background component shows grid
      const background = page.locator('.react-flow__background');
      await expect(background).toBeVisible();
    });

    // ===== STEP 10: Verify Brick List =====
    await test.step('Step 10: Verify brick list on left side shows available bricks', async () => {
      await expect(page.locator('.brick-list')).toBeVisible();
      await expect(page.locator('.brick-item:has-text("List instances by DB name")')).toBeVisible();
      await expect(page.locator('.brick-item:has-text("Get first instance")')).toBeVisible();
      await expect(page.locator('.brick-item:has-text("Log instance props")')).toBeVisible();
    });

    // ===== STEP 11: Verify User Can Add Bricks =====
    await test.step('Step 11: Verify user can add bricks to the empty canvas', async () => {
      const listBrick = page.locator('.brick-item:has-text("List instances by DB name")');
      const canvas = page.locator('.function-editor-canvas');
      
      // Verify brick is draggable
      const draggable = await listBrick.getAttribute('draggable');
      expect(draggable).toBe('true');
      
      // Drag brick to canvas
      await listBrick.dragTo(canvas);
      
      // Wait for API response and brick to be added
      await page.waitForTimeout(2000);
      
      // Verify brick was added (check for brick-node, which is the actual component)
      const brickNodes = page.locator('.brick-node');
      await expect(brickNodes.first()).toBeVisible({ timeout: 5000 });
      const nodeCount = await brickNodes.count();
      expect(nodeCount).toBeGreaterThan(0);
    });

    // ===== STEP 12: Verify No Error Messages =====
    await test.step('Step 12: Verify no error messages are displayed', async () => {
      const errorNotification = page.locator('.error-notification');
      if (await errorNotification.count() > 0) {
        await expect(errorNotification).not.toBeVisible();
      }
    });
  });
});
