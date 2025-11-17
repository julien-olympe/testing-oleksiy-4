import { test, expect } from '@playwright/test';

const PRIMARY_USER_EMAIL = 'testuser@example.com';
const PRIMARY_USER_PASSWORD = 'SecurePass123!';
const SECONDARY_USER_EMAIL = 'testuser2@example.com';
const SECONDARY_USER_PASSWORD = 'SecurePass456!';
const PROJECT_NAME = 'My Test Project';
const FIRST_INSTANCE_VALUE = 'First Instance Value';
const SECOND_INSTANCE_VALUE = 'Second Instance Value';

test.describe('Critical Path E2E Test - Complete Happy Path', () => {
  let consoleLogs: string[] = [];

  test.beforeEach(async ({ page }) => {
    consoleLogs = [];
    
    // Capture console logs
    page.on('console', (msg) => {
      const text = msg.text();
      consoleLogs.push(text);
      console.log(`[Browser Console] ${text}`);
    });

    // Navigate to login screen
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('CP-001: Complete Happy Path - User Registration to Function Execution', async ({ page }) => {
    // Step 1: Register Primary User
    await test.step('Step 1: Register Primary User', async () => {
      // Verify Login Screen is displayed
      await expect(page.locator('h1.login-title')).toContainText('Visual Programming Application');
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button:has-text("Login")')).toBeVisible();
      await expect(page.locator('button:has-text("Register")')).toBeVisible();

      // Click Register button
      await page.click('button:has-text("Don\'t have an account? Register")');
      await page.waitForTimeout(500);

      // Enter registration details
      await page.fill('input[type="email"]', PRIMARY_USER_EMAIL);
      await page.fill('input[type="password"]', PRIMARY_USER_PASSWORD);
      
      // Submit registration form
      await page.click('button[type="submit"]:has-text("Register")');
      
      // Wait for either redirect to home OR error message to appear
      await Promise.race([
        page.waitForURL('**/home', { timeout: 10000 }).catch(() => null),
        page.waitForSelector('.error-notification, [class*="ErrorNotification"]', { timeout: 10000, state: 'visible' }).catch(() => null),
        page.waitForTimeout(3000)
      ]);
      
      // Check current state
      const currentUrl = page.url();
      const isOnHome = currentUrl.includes('/home');
      const hasError = await page.locator('.error-notification, [class*="ErrorNotification"]').isVisible().catch(() => false);
      
      if (!isOnHome && hasError) {
        // Registration failed (user might already exist), try logging in instead
        await page.goto('/login');
        await page.waitForLoadState('networkidle');
        await page.fill('input[type="email"]', PRIMARY_USER_EMAIL);
        await page.fill('input[type="password"]', PRIMARY_USER_PASSWORD);
        await page.click('button[type="submit"]:has-text("Login")');
        await page.waitForURL('**/home', { timeout: 10000 });
        await page.waitForLoadState('networkidle');
      } else if (!isOnHome) {
        // Still waiting for redirect, try one more time
        await page.waitForURL('**/home', { timeout: 5000 }).catch(() => {
          // If still not redirected, assume we need to login
          return page.goto('/login').then(() => {
            page.fill('input[type="email"]', PRIMARY_USER_EMAIL);
            page.fill('input[type="password"]', PRIMARY_USER_PASSWORD);
            page.click('button[type="submit"]:has-text("Login")');
            return page.waitForURL('**/home', { timeout: 10000 });
          });
        });
        await page.waitForLoadState('networkidle');
      }
      
      // Verify user is on Home Screen with empty project list
      await expect(page.locator('h1:has-text("Home")')).toBeVisible();
      // Project list area should exist
      await expect(page.locator('.project-list-area')).toBeAttached();
    });

    // Step 2: Register Secondary User
    await test.step('Step 2: Register Secondary User', async () => {
      // Click settings icon
      await page.click('button[aria-label="Settings"]');
      await page.waitForTimeout(300);
      
      // Verify settings menu is displayed
      await expect(page.locator('.settings-dropdown')).toBeVisible();
      await expect(page.locator('.settings-user-name')).toContainText(PRIMARY_USER_EMAIL);
      await expect(page.locator('button:has-text("Logout")')).toBeVisible();
      
      // Click logout
      await page.click('button:has-text("Logout")');
      await page.waitForURL('**/login', { timeout: 10000 });
      await page.waitForLoadState('networkidle');
      
      // Click Register button
      await page.click('button:has-text("Don\'t have an account? Register")');
      await page.waitForTimeout(500);
      
      // Enter secondary user details
      await page.fill('input[type="email"]', SECONDARY_USER_EMAIL);
      await page.fill('input[type="password"]', SECONDARY_USER_PASSWORD);
      
      // Submit registration
      await page.click('button[type="submit"]:has-text("Register")');
      
      // Wait for either redirect to home OR error message to appear
      await Promise.race([
        page.waitForURL('**/home', { timeout: 10000 }).catch(() => null),
        page.waitForSelector('.error-notification', { timeout: 10000, state: 'visible' }).catch(() => null),
        page.waitForTimeout(3000)
      ]);
      
      // Check current state
      const currentUrl2 = page.url();
      const isOnHome2 = currentUrl2.includes('/home');
      const hasError2 = await page.locator('.error-notification').isVisible().catch(() => false);
      
      if (!isOnHome2 && hasError2) {
        // Registration failed (user might already exist), try logging in instead
        await page.goto('/login');
        await page.waitForLoadState('networkidle');
        await page.fill('input[type="email"]', SECONDARY_USER_EMAIL);
        await page.fill('input[type="password"]', SECONDARY_USER_PASSWORD);
        await page.click('button[type="submit"]:has-text("Login")');
        await page.waitForURL('**/home', { timeout: 10000 });
        await page.waitForLoadState('networkidle');
      } else if (!isOnHome2) {
        // Still waiting for redirect
        await page.waitForURL('**/home', { timeout: 5000 }).catch(() => {
          return page.goto('/login').then(() => {
            page.fill('input[type="email"]', SECONDARY_USER_EMAIL);
            page.fill('input[type="password"]', SECONDARY_USER_PASSWORD);
            page.click('button[type="submit"]:has-text("Login")');
            return page.waitForURL('**/home', { timeout: 10000 });
          });
        });
        await page.waitForLoadState('networkidle');
      }
      
      // Verify on Home Screen
      await expect(page.locator('h1:has-text("Home")')).toBeVisible();
    });

    // Step 3: Login Primary User
    await test.step('Step 3: Login Primary User', async () => {
      // Click settings and logout
      await page.click('button[aria-label="Settings"]');
      await page.waitForTimeout(300);
      await page.click('button:has-text("Logout")');
      await page.waitForURL('**/login', { timeout: 10000 });
      await page.waitForLoadState('networkidle');
      
      // Enter login credentials
      await page.fill('input[type="email"]', PRIMARY_USER_EMAIL);
      await page.fill('input[type="password"]', PRIMARY_USER_PASSWORD);
      
      // Click Login button
      await page.click('button[type="submit"]:has-text("Login")');
      
      // Wait for redirect
      await page.waitForURL('**/home', { timeout: 10000 });
      await page.waitForLoadState('networkidle');
      
      // Verify on Home Screen
      await expect(page.locator('h1:has-text("Home")')).toBeVisible();
      // Project list area should exist (may be hidden when empty)
      await expect(page.locator('.project-list-area')).toBeAttached();
    });

    // Step 4: Create Project
    await test.step('Step 4: Create Project', async () => {
      // Verify Home Screen elements
      await expect(page.locator('.home-sidebar')).toBeVisible();
      await expect(page.locator('.brick-search')).toBeVisible();
      await expect(page.locator('.brick-list')).toBeVisible();
      await expect(page.locator('.brick-item:has-text("Project")')).toBeVisible();
      await expect(page.locator('.project-list-area')).toBeVisible();
      
      // Drag and drop Project brick
      const projectBrick = page.locator('.brick-item:has-text("Project")');
      const projectListArea = page.locator('.project-list-area');
      
      // Get initial project count
      const initialCount = await page.locator('.project-card').count();
      
      await projectBrick.dragTo(projectListArea);
      await page.waitForTimeout(1000);
      
      // Verify project is created - check that count increased
      await expect(page.locator('.project-card')).toHaveCount(initialCount + 1, { timeout: 5000 });
      // Verify at least one "New Project" exists (use first() to avoid strict mode violation)
      await expect(page.locator('.project-name:has-text("New Project")').first()).toBeVisible({ timeout: 5000 });
    });

    // Step 5: Rename Project
    await test.step('Step 5: Rename Project', async () => {
      // Find the project card
      const projectCard = page.locator('.project-card').first();
      
      // Click rename button (✏️)
      await projectCard.locator('button[title="Rename"]').click();
      await page.waitForTimeout(300);
      
      // Verify input is visible and editable
      const nameInput = projectCard.locator('input.project-name-input');
      await expect(nameInput).toBeVisible();
      await expect(nameInput).toBeFocused();
      
      // Clear and type new name
      await nameInput.clear();
      await nameInput.fill(PROJECT_NAME);
      await nameInput.press('Enter');
      await page.waitForTimeout(500);
      
      // Verify project name is updated (check within the same project card to avoid strict mode violation)
      await expect(projectCard.locator(`.project-name:has-text("${PROJECT_NAME}")`)).toBeVisible({ timeout: 5000 });
    });

    // Step 6: Open Project Editor
    await test.step('Step 6: Open Project Editor', async () => {
      // Double-click on project
      const projectCard = page.locator('.project-card').first();
      await projectCard.dblclick();
      
      // Wait for Project Editor to load
      await page.waitForURL('**/projects/**', { timeout: 10000 });
      await page.waitForLoadState('networkidle');
      
      // Verify Project Editor is displayed
      await expect(page.locator('h1')).toContainText(PROJECT_NAME);
      await expect(page.locator('button:has-text("Project")')).toBeVisible();
      await expect(page.locator('button:has-text("Permissions")')).toBeVisible();
      await expect(page.locator('button:has-text("Database")')).toBeVisible();
      
      // Verify Project tab is active
      await expect(page.locator('button.tab-button.active:has-text("Project")')).toBeVisible();
      
      // Verify left side panel with brick list
      await expect(page.locator('.brick-search')).toBeVisible();
      await expect(page.locator('.brick-item:has-text("Function")')).toBeVisible();
    });

    // Step 7: Add Project Permission
    await test.step('Step 7: Add Project Permission', async () => {
      // Click Permissions tab
      await page.click('button:has-text("Permissions")');
      await page.waitForTimeout(500);
      
      // Verify Permissions tab is active
      await expect(page.locator('button.tab-button.active:has-text("Permissions")')).toBeVisible();
      
      // Wait for permissions tab content to be visible
      await expect(page.locator('.permissions-tab')).toBeVisible({ timeout: 5000 });
      
      // Click "Add a user" button
      await page.click('button:has-text("Add a user")');
      await page.waitForTimeout(300);
      
      // Enter secondary user email
      const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]').last();
      await expect(emailInput).toBeVisible();
      await emailInput.fill(SECONDARY_USER_EMAIL);
      
      // Wait for API response after submitting
      const postResponsePromise = page.waitForResponse(response => 
        response.url().includes('/permissions') && response.request().method() === 'POST'
      );
      
      await emailInput.press('Enter');
      
      // Wait for POST response and check if it succeeded
      const postResponse = await postResponsePromise;
      if (postResponse.status() !== 201) {
        // If failed, check for error notification
        const errorNotification = page.locator('.error-notification, [class*="ErrorNotification"]');
        if (await errorNotification.isVisible().catch(() => false)) {
          const errorText = await errorNotification.textContent();
          throw new Error(`Failed to add permission: ${errorText} (Status: ${postResponse.status()})`);
        }
        throw new Error(`Failed to add permission: Status ${postResponse.status()}`);
      }
      
      // Wait for permissions list to refresh (GET request after onDataChange)
      await page.waitForResponse(response => 
        response.url().includes('/projects/') && response.url().includes('/editor') && response.request().method() === 'GET'
      );
      await page.waitForTimeout(1000);
      
      // Verify secondary user is added (check in permission-item to be more specific)
      await expect(page.locator('.permission-item').filter({ hasText: SECONDARY_USER_EMAIL })).toBeVisible({ timeout: 10000 });
    });

    // Step 8: Create Database Instances
    await test.step('Step 8: Create Database Instances', async () => {
      // Click Database tab
      await page.click('button:has-text("Database")');
      await page.waitForTimeout(500);
      
      // Verify Database tab is active
      await expect(page.locator('button.tab-button.active:has-text("Database")')).toBeVisible();
      
      // Verify "default database" is visible in the database type list (button)
      await expect(page.locator('button.database-type-item:has-text("default database")')).toBeVisible();
      
      // Wait for instance creation API response
      const createInstanceResponsePromise = page.waitForResponse(response => 
        response.url().includes('/instances') && response.request().method() === 'POST'
      );
      
      // Click "Create instance" button
      await page.click('button:has-text("Create instance")');
      await createInstanceResponsePromise;
      
      // Wait for editor data refresh
      await page.waitForResponse(response => 
        response.url().includes('/projects/') && response.url().includes('/editor') && response.request().method() === 'GET'
      );
      await page.waitForTimeout(500);
      
      // Find and fill first instance value (filter out email input from permissions tab)
      const instanceInputs = page.locator('.database-tab input[type="text"].property-input');
      const firstInput = instanceInputs.first();
      await expect(firstInput).toBeVisible({ timeout: 5000 });
      await firstInput.fill(FIRST_INSTANCE_VALUE);
      await firstInput.blur();
      
      // Wait for debounced update (debounce is 500ms, wait a bit longer)
      await page.waitForTimeout(1000);
      
      // Create second instance
      const createSecondInstanceResponsePromise = page.waitForResponse(response => 
        response.url().includes('/instances') && response.request().method() === 'POST'
      );
      await page.click('button:has-text("Create instance")');
      await createSecondInstanceResponsePromise;
      
      // Wait for editor data refresh
      await page.waitForResponse(response => 
        response.url().includes('/projects/') && response.url().includes('/editor') && response.request().method() === 'GET'
      );
      await page.waitForTimeout(500);
      
      // Fill second instance value
      const secondInput = instanceInputs.nth(1);
      await expect(secondInput).toBeVisible({ timeout: 5000 });
      await secondInput.fill(SECOND_INSTANCE_VALUE);
      await secondInput.blur();
      
      // Wait for debounced update (debounce is 500ms, wait a bit longer)
      await page.waitForTimeout(1000);
      
      // Re-query inputs after data refresh to ensure we have the latest elements
      const allInstanceInputs = page.locator('.database-tab input[type="text"].property-input');
      await expect(allInstanceInputs).toHaveCount(2, { timeout: 5000 });
      
      // Verify both instances exist by checking input values
      const firstInputValue = await allInstanceInputs.first().inputValue();
      const secondInputValue = await allInstanceInputs.nth(1).inputValue();
      expect(firstInputValue).toBe(FIRST_INSTANCE_VALUE);
      expect(secondInputValue).toBe(SECOND_INSTANCE_VALUE);
    });

    // Step 9: Create Function
    await test.step('Step 9: Create Function', async () => {
      // Click Project tab
      await page.click('button:has-text("Project")');
      await page.waitForTimeout(500);
      
      // Verify Project tab is active
      await expect(page.locator('button.tab-button.active:has-text("Project")')).toBeVisible();
      
      // Verify Function brick is visible
      await expect(page.locator('.brick-item:has-text("Function")')).toBeVisible();
      
      // Drag and drop Function brick
      const functionBrick = page.locator('.brick-item:has-text("Function")');
      const functionListArea = page.locator('.function-list-area, .center-area').first();
      
      await functionBrick.dragTo(functionListArea);
      await page.waitForTimeout(1000);
      
      // Verify function is created
      await expect(page.locator('.function-item, .function-card')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=New Function')).toBeVisible();
    });

    // Step 10: Open Function Editor
    await test.step('Step 10: Open Function Editor', async () => {
      // Double-click on function
      const functionItem = page.locator('.function-item, .function-card').first();
      await functionItem.dblclick();
      
      // Wait for Function Editor to load
      await page.waitForURL('**/functions/**', { timeout: 10000 });
      await page.waitForLoadState('networkidle');
      
      // Verify Function Editor is displayed
      await expect(page.locator('button[aria-label="Settings"]')).toBeVisible();
      await expect(page.locator('.brick-search')).toBeVisible();
      
      // Verify RUN button is visible
      await expect(page.locator('button:has-text("RUN"), button:has-text("Run")')).toBeVisible();
      
      // Verify brick list shows required bricks
      await expect(page.locator('text=List instances by DB name')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=Get first instance')).toBeVisible();
      await expect(page.locator('text=Log instance props')).toBeVisible();
    });

    // Step 11: Add Bricks to Function Editor
    await test.step('Step 11: Add Bricks to Function Editor', async () => {
      // Get the React Flow canvas
      const canvas = page.locator('.react-flow, [class*="react-flow"]').first();
      await expect(canvas).toBeVisible();
      
      // Drag "List instances by DB name" brick
      const listBrick = page.locator('.brick-item:has-text("List instances by DB name")');
      await listBrick.dragTo(canvas, { targetPosition: { x: 200, y: 200 } });
      await page.waitForTimeout(1000);
      
      // Drag "Get first instance" brick
      const getFirstBrick = page.locator('.brick-item:has-text("Get first instance")');
      await getFirstBrick.dragTo(canvas, { targetPosition: { x: 400, y: 200 } });
      await page.waitForTimeout(1000);
      
      // Drag "Log instance props" brick
      const logBrick = page.locator('.brick-item:has-text("Log instance props")');
      await logBrick.dragTo(canvas, { targetPosition: { x: 600, y: 200 } });
      await page.waitForTimeout(1000);
      
      // Verify all bricks are on canvas (check for React Flow nodes)
      const nodes = page.locator('.react-flow__node');
      await expect(nodes).toHaveCount(3, { timeout: 5000 });
    });

    // Step 12: Set Brick Input Parameter
    await test.step('Step 12: Set Brick Input Parameter', async () => {
      // Find the "List instances by DB name" node
      const listNode = page.locator('.react-flow__node').first();
      
      // Click on the input parameter (look for input handle or parameter area)
      const inputHandle = listNode.locator('[data-handleid*="input"], .react-flow__handle-left, [class*="input"]').first();
      await inputHandle.click({ force: true });
      await page.waitForTimeout(500);
      
      // Look for dropdown or selection interface
      const dropdown = page.locator('select, [role="combobox"], .dropdown, [class*="select"]').first();
      if (await dropdown.isVisible().catch(() => false)) {
        await dropdown.selectOption('default database');
      } else {
        // Try clicking on the node to open configuration
        await listNode.click();
        await page.waitForTimeout(500);
        
        // Look for database selection in a modal or panel
        const dbOption = page.locator('text=default database').first();
        if (await dbOption.isVisible().catch(() => false)) {
          await dbOption.click();
        }
      }
      
      await page.waitForTimeout(500);
    });

    // Step 13: Link Bricks
    await test.step('Step 13: Link Bricks', async () => {
      // Get all nodes
      const nodes = page.locator('.react-flow__node');
      const listNode = nodes.first();
      const getFirstNode = nodes.nth(1);
      const logNode = nodes.nth(2);
      
      // Find output handle of "List instances by DB name" (right side)
      const listOutput = listNode.locator('.react-flow__handle-right, [data-handleid*="output"], [data-handleid*="List"]').first();
      
      // Find input handle of "Get first instance" (left side)
      const getFirstInput = getFirstNode.locator('.react-flow__handle-left, [data-handleid*="input"], [data-handleid*="List"]').first();
      
      // Drag from output to input
      await listOutput.dragTo(getFirstInput);
      await page.waitForTimeout(1000);
      
      // Find output handle of "Get first instance"
      const getFirstOutput = getFirstNode.locator('.react-flow__handle-right, [data-handleid*="output"], [data-handleid*="DB"]').first();
      
      // Find input handle of "Log instance props"
      const logInput = logNode.locator('.react-flow__handle-left, [data-handleid*="input"], [data-handleid*="Object"]').first();
      
      // Drag from output to input
      await getFirstOutput.dragTo(logInput);
      await page.waitForTimeout(1000);
      
      // Verify connections exist (check for edges)
      const edges = page.locator('.react-flow__edge');
      await expect(edges).toHaveCount(2, { timeout: 5000 });
    });

    // Step 14: Run Function
    await test.step('Step 14: Run Function', async () => {
      // Clear previous console logs
      consoleLogs = [];
      
      // Click RUN button
      const runButton = page.locator('button:has-text("RUN"), button:has-text("Run")').first();
      await runButton.click();
      
      // Wait for execution
      await page.waitForTimeout(3000);
      
      // Check console logs for the instance value
      const hasFirstInstanceValue = consoleLogs.some(log => 
        log.includes(FIRST_INSTANCE_VALUE) || 
        JSON.stringify(log).includes(FIRST_INSTANCE_VALUE)
      );
      
      // Also check page for any execution results
      const executionResult = page.locator('text=' + FIRST_INSTANCE_VALUE);
      const resultVisible = await executionResult.isVisible().catch(() => false);
      
      // Verify execution completed (either in console or on page)
      expect(hasFirstInstanceValue || resultVisible).toBeTruthy();
    });
  });
});
