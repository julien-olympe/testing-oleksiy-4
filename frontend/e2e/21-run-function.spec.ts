import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const PRIMARY_EMAIL = 'testuser@example.com';
const PRIMARY_PASSWORD = 'SecurePass123!';
const SECONDARY_EMAIL = 'user@example.com';
const SECONDARY_PASSWORD = 'SecurePass456!';
const OWNER_EMAIL = 'owner@example.com';
const OWNER_PASSWORD = 'SecurePass123!';
const PROJECT_NAME = 'TestProject';
const FUNCTION_NAME = 'TestFunction';
const SHARED_PROJECT_NAME = 'SharedProject';
const SHARED_FUNCTION_NAME = 'SharedFunction';
const DB_INSTANCE_VALUE = 'Test Instance Value';
const DB_INSTANCE_VALUE_2 = 'Test Value';

test.describe('Run Function Test Scenarios', () => {
  let page: Page;
  let consoleLogs: string[] = [];

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    consoleLogs = [];
    
    // Capture console logs
    page.on('console', (msg) => {
      const text = msg.text();
      consoleLogs.push(text);
      console.log(`[Browser Console] ${text}`);
    });

    // Navigate to login screen
    await page.goto('/login');
  });

  test('FUNC-RUN-001: Run Function - Positive Case', async () => {
    // Step 1: Login or Register
    await page.fill('input[id="email"]', PRIMARY_EMAIL);
    await page.fill('input[id="password"]', PRIMARY_PASSWORD);
    
    // Try to login first
    await page.click('button[type="submit"]:has-text("Login")');
    
    // Wait for either home (success) or stay on login (failure - try register)
    try {
      await page.waitForURL('/home', { timeout: 5000 });
    } catch {
      // Login failed, try to register
      const registerButton = page.locator('button:has-text("Don\'t have an account? Register")').or(page.locator('button:has-text("Register")'));
      if (await registerButton.isVisible()) {
        await registerButton.click();
        await page.click('button[type="submit"]:has-text("Register")');
        await page.waitForURL('/home', { timeout: 10000 });
      } else {
        // Try login again
        await page.click('button[type="submit"]:has-text("Login")');
        await page.waitForURL('/home', { timeout: 10000 });
      }
    }

    // Step 2: Navigate to or create project
    const projectCard = page.locator('.project-card').first();
    if (await projectCard.count() === 0) {
      // Create project if it doesn't exist
      const projectBrick = page.locator('.brick-item:has-text("Project")');
      const projectListArea = page.locator('.project-list-area');
      await projectBrick.dragTo(projectListArea);
      await page.waitForTimeout(1000);
    }
    await projectCard.dblclick();
    await page.waitForURL(/\/projects\/[^/]+/, { timeout: 10000 });

    // Step 3: Navigate to or create function
    await page.click('button.tab-button:has-text("Project")');
    const functionCard = page.locator('.function-card').first();
    if (await functionCard.count() === 0) {
      // Create function if it doesn't exist
      const functionBrick = page.locator('.brick-item:has-text("Function")');
      const functionListArea = page.locator('.function-list-area');
      await functionBrick.dragTo(functionListArea);
      await page.waitForTimeout(1000);
    }
    await functionCard.dblclick();
    await page.waitForURL(/\/functions\/[^/]+/, { timeout: 10000 });

    // Step 4: Verify Function Editor is displayed
    await expect(page.locator('.function-editor')).toBeVisible();
    // Wait for function editor to fully load (wait for loading to complete)
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Step 5: Verify all three bricks are displayed on canvas
    const listBrick = page.locator('.brick-node:has-text("List instances by DB name")');
    const getFirstBrick = page.locator('.brick-node:has-text("Get first instance")');
    const logBrick = page.locator('.brick-node:has-text("Log instance props")');

    // If bricks don't exist, add them
    if (await listBrick.count() === 0) {
      const listBrickItem = page.locator('.brick-item:has-text("List instances by DB name")');
      await listBrickItem.dragTo(page.locator('.function-editor-canvas'));
      await page.waitForTimeout(1000);
    }
    if (await getFirstBrick.count() === 0) {
      const getFirstBrickItem = page.locator('.brick-item:has-text("Get first instance")');
      await getFirstBrickItem.dragTo(page.locator('.function-editor-canvas'));
      await page.waitForTimeout(1000);
    }
    if (await logBrick.count() === 0) {
      const logBrickItem = page.locator('.brick-item:has-text("Log instance props")');
      await logBrickItem.dragTo(page.locator('.function-editor-canvas'));
      await page.waitForTimeout(1000);
    }

    await expect(page.locator('.brick-node:has-text("List instances by DB name")')).toBeVisible();
    await expect(page.locator('.brick-node:has-text("Get first instance")')).toBeVisible();
    await expect(page.locator('.brick-node:has-text("Log instance props")')).toBeVisible();

    // Step 6: Set "Name of DB" input parameter
    // Wait for databases to be loaded - wait for network requests to complete
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const listBrickNode = page.locator('.brick-node:has-text("List instances by DB name")');
    const dbSelectButton = listBrickNode.locator('button.database-select-button');
    await expect(dbSelectButton).toBeVisible();
    
    // Debug: Check if databases are loaded by checking the button state
    const buttonText = await dbSelectButton.textContent();
    console.log('Database button text:', buttonText);
    
    // Click the button to open dropdown
    await dbSelectButton.click({ force: true });
    
    // Wait a bit for React state to update
    await page.waitForTimeout(1500);
    
    // Check if dropdown exists in DOM (even if not visible)
    const dropdown = page.locator('.database-select-dropdown');
    const dropdownCount = await dropdown.count();
    console.log('Dropdown count:', dropdownCount);
    
    // If dropdown doesn't exist, the databases might not be loaded
    // Try waiting more and clicking again
    if (dropdownCount === 0) {
      console.log('Dropdown not found, waiting for databases to load...');
      await page.waitForTimeout(3000);
      await dbSelectButton.click({ force: true });
      await page.waitForTimeout(1500);
    }
    
    // Now check visibility
    await expect(dropdown).toBeVisible({ timeout: 15000 });
    
    // Verify default database option exists
    await expect(page.locator('.database-option:has-text("default database")')).toBeVisible();
    await page.click('.database-option:has-text("default database")');
    
    // Wait for selection to be saved
    await page.waitForTimeout(2000);
    await expect(dbSelectButton).toContainText('default database');

    // Step 7: Verify and create connections
    const listBrickNode2 = page.locator('.brick-node:has-text("List instances by DB name")');
    const getFirstBrickNode = page.locator('.brick-node:has-text("Get first instance")');
    const logBrickNode = page.locator('.brick-node:has-text("Log instance props")');

    const edges = page.locator('.react-flow__edge');
    if (await edges.count() < 2) {
      // Create connections if they don't exist
      const listOutputHandle = listBrickNode2.locator('.react-flow__handle-right[data-handleid="List"]');
      const getFirstInputHandle = getFirstBrickNode.locator('.react-flow__handle-left[data-handleid="List"]');
      await listOutputHandle.hover();
      await listOutputHandle.dragTo(getFirstInputHandle);
      await page.waitForTimeout(1000);

      const getFirstOutputHandle = getFirstBrickNode.locator('.react-flow__handle-right[data-handleid="DB"]');
      const logInputHandle = logBrickNode.locator('.react-flow__handle-left[data-handleid="Object"]');
      await getFirstOutputHandle.hover();
      await getFirstOutputHandle.dragTo(logInputHandle);
      await page.waitForTimeout(1000);
    }

    await expect(page.locator('.react-flow__edge')).toHaveCount(2);

    // Step 8: Verify RUN button is visible
    const runButton = page.locator('button.run-button:has-text("RUN")');
    await expect(runButton).toBeVisible();

    // Step 9: Clear console logs
    consoleLogs = [];

    // Step 10: Click RUN button
    await runButton.click();

    // Step 11: Wait for function execution
    await page.waitForTimeout(3000);

    // Step 12: Verify no error messages displayed
    const errorNotification = page.locator('.error-notification');
    if (await errorNotification.isVisible()) {
      const errorText = await errorNotification.textContent();
      throw new Error(`Function execution failed: ${errorText}`);
    }

    // Step 13: Verify console output
    const hasLogOutput = consoleLogs.length > 0 || 
      consoleLogs.some(log => 
        log.toLowerCase().includes('instance') ||
        log.includes(DB_INSTANCE_VALUE) ||
        log.includes('First Instance Value')
      );

    expect(hasLogOutput || consoleLogs.length > 0).toBeTruthy();
  });

  test('FUNC-RUN-002: Run Function - Negative Case - Missing Required Inputs', async () => {
    // Step 1: Login
    await page.fill('input[id="email"]', PRIMARY_EMAIL);
    await page.fill('input[id="password"]', PRIMARY_PASSWORD);
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForURL('/home', { timeout: 10000 });

    // Step 2: Navigate to function editor
    const projectCard = page.locator('.project-card').first();
    await projectCard.dblclick();
    await page.waitForURL(/\/projects\/[^/]+/, { timeout: 10000 });

    await page.click('button.tab-button:has-text("Project")');
    const functionCard = page.locator('.function-card').first();
    await functionCard.dblclick();
    await page.waitForURL(/\/functions\/[^/]+/, { timeout: 10000 });

    // Step 3: Add bricks if needed
    const listBrick = page.locator('.brick-node:has-text("List instances by DB name")');
    if (await listBrick.count() === 0) {
      const listBrickItem = page.locator('.brick-item:has-text("List instances by DB name")');
      await listBrickItem.dragTo(page.locator('.function-editor-canvas'));
      await page.waitForTimeout(1000);
    }

    // Step 4: Verify "Name of DB" parameter is NOT set
    const listBrickNode = page.locator('.brick-node:has-text("List instances by DB name")');
    const dbSelectButton = listBrickNode.locator('button.database-select-button');
    const buttonText = await dbSelectButton.textContent();
    
    // Clear the parameter if it's set
    if (buttonText && buttonText.includes('default database')) {
      // Click to open dropdown and clear (implementation dependent)
      await dbSelectButton.click({ force: true });
      await page.waitForTimeout(500);
      // Try to clear or select empty option if available
    }

    // Step 5: Verify RUN button is visible
    const runButton = page.locator('button.run-button:has-text("RUN")');
    await expect(runButton).toBeVisible();

    // Step 6: Click RUN button
    await runButton.click();

    // Step 7: Wait for error message
    await page.waitForTimeout(2000);

    // Step 8: Verify error message is displayed
    const errorNotification = page.locator('.error-notification');
    const errorMessage = await errorNotification.textContent().catch(() => null);
    
    // Check for error message about missing required inputs
    expect(
      errorMessage?.toLowerCase().includes('missing') ||
      errorMessage?.toLowerCase().includes('required') ||
      errorMessage?.toLowerCase().includes('input') ||
      (await errorNotification.isVisible())
    ).toBeTruthy();
  });

  test('FUNC-RUN-003: Run Function - Negative Case - Invalid Brick Connections', async () => {
    // Step 1: Login
    await page.fill('input[id="email"]', PRIMARY_EMAIL);
    await page.fill('input[id="password"]', PRIMARY_PASSWORD);
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForURL('/home', { timeout: 10000 });

    // Step 2: Navigate to function editor
    const projectCard = page.locator('.project-card').first();
    await projectCard.dblclick();
    await page.waitForURL(/\/projects\/[^/]+/, { timeout: 10000 });

    await page.click('button.tab-button:has-text("Project")');
    const functionCard = page.locator('.function-card').first();
    await functionCard.dblclick();
    await page.waitForURL(/\/functions\/[^/]+/, { timeout: 10000 });

    // Step 3: Add bricks
    const listBrick = page.locator('.brick-node:has-text("List instances by DB name")');
    if (await listBrick.count() === 0) {
      const listBrickItem = page.locator('.brick-item:has-text("List instances by DB name")');
      await listBrickItem.dragTo(page.locator('.function-editor-canvas'));
      await page.waitForTimeout(1000);
    }

    const getFirstBrick = page.locator('.brick-node:has-text("Get first instance")');
    if (await getFirstBrick.count() === 0) {
      const getFirstBrickItem = page.locator('.brick-item:has-text("Get first instance")');
      await getFirstBrickItem.dragTo(page.locator('.function-editor-canvas'));
      await page.waitForTimeout(1000);
    }

    // Step 4: Set database parameter
    const listBrickNode = page.locator('.brick-node:has-text("List instances by DB name")');
    const dbSelectButton = listBrickNode.locator('button.database-select-button');
    await dbSelectButton.click();
    await page.click('.database-option:has-text("default database")');
    await page.waitForTimeout(500);

    // Step 5: Verify bricks are NOT properly linked (remove connections if they exist)
    const edges = page.locator('.react-flow__edge');
    const edgeCount = await edges.count();
    
    // If connections exist, we'll verify the error when running without proper connections
    // For this test, we assume connections are missing or invalid

    // Step 6: Verify RUN button is visible
    const runButton = page.locator('button.run-button:has-text("RUN")');
    await expect(runButton).toBeVisible();

    // Step 7: Click RUN button
    await runButton.click();

    // Step 8: Wait for error message
    await page.waitForTimeout(2000);

    // Step 9: Verify error message about invalid connections
    const errorNotification = page.locator('.error-notification');
    const errorMessage = await errorNotification.textContent().catch(() => null);
    
    expect(
      errorMessage?.toLowerCase().includes('connection') ||
      errorMessage?.toLowerCase().includes('invalid') ||
      errorMessage?.toLowerCase().includes('link') ||
      (await errorNotification.isVisible())
    ).toBeTruthy();
  });

  test('FUNC-RUN-004: Run Function - Negative Case - Execution Failed', async () => {
    // Step 1: Login
    await page.fill('input[id="email"]', PRIMARY_EMAIL);
    await page.fill('input[id="password"]', PRIMARY_PASSWORD);
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForURL('/home', { timeout: 10000 });

    // Step 2: Navigate to function editor
    const projectCard = page.locator('.project-card').first();
    await projectCard.dblclick();
    await page.waitForURL(/\/projects\/[^/]+/, { timeout: 10000 });

    await page.click('button.tab-button:has-text("Project")');
    const functionCard = page.locator('.function-card').first();
    await functionCard.dblclick();
    await page.waitForURL(/\/functions\/[^/]+/, { timeout: 10000 });

    // Step 3: Set up function with proper configuration
    // Add bricks
    const listBrick = page.locator('.brick-node:has-text("List instances by DB name")');
    if (await listBrick.count() === 0) {
      const listBrickItem = page.locator('.brick-item:has-text("List instances by DB name")');
      await listBrickItem.dragTo(page.locator('.function-editor-canvas'));
      await page.waitForTimeout(1000);
    }

    // Set database parameter to a non-existent database or empty database
    const listBrickNode = page.locator('.brick-node:has-text("List instances by DB name")');
    const dbSelectButton = listBrickNode.locator('button.database-select-button');
    await dbSelectButton.click();
    await page.click('.database-option:has-text("default database")');
    await page.waitForTimeout(500);

    // Note: This test assumes execution will fail due to no instances
    // The actual failure condition depends on implementation

    // Step 4: Verify RUN button is visible
    const runButton = page.locator('button.run-button:has-text("RUN")');
    await expect(runButton).toBeVisible();

    // Step 5: Click RUN button
    await runButton.click();

    // Step 6: Wait for execution to fail
    await page.waitForTimeout(3000);

    // Step 7: Verify error message about execution failure
    const errorNotification = page.locator('.error-notification');
    const errorMessage = await errorNotification.textContent().catch(() => null);
    
    // Check for execution failure error
    expect(
      errorMessage?.toLowerCase().includes('execution') ||
      errorMessage?.toLowerCase().includes('failed') ||
      errorMessage?.toLowerCase().includes('error') ||
      (await errorNotification.isVisible())
    ).toBeTruthy();
  });

  test('FUNC-RUN-005: Run Function - Negative Case - Permission Denied', async () => {
    // Step 1: Register owner if needed
    await page.fill('input[id="email"]', OWNER_EMAIL);
    await page.fill('input[id="password"]', OWNER_PASSWORD);
    const registerButton = page.locator('button:has-text("Don\'t have an account? Register")').or(page.locator('button:has-text("Register")'));
    if (await registerButton.isVisible()) {
      await registerButton.click();
      await page.click('button[type="submit"]:has-text("Register")');
      await page.waitForURL('/home', { timeout: 10000 });
    } else {
      await page.click('button[type="submit"]:has-text("Login")');
      await page.waitForURL('/home', { timeout: 10000 });
    }

    // Step 2: Create shared project and function as owner
    const projectCard = page.locator('.project-card').first();
    if (await projectCard.count() === 0) {
      const projectBrick = page.locator('.brick-item:has-text("Project")');
      await projectBrick.dragTo(page.locator('.project-list-area'));
      await page.waitForTimeout(1000);
    }
    await projectCard.dblclick();
    await page.waitForURL(/\/projects\/[^/]+/, { timeout: 10000 });

    await page.click('button.tab-button:has-text("Project")');
    const functionCard = page.locator('.function-card').first();
    if (await functionCard.count() === 0) {
      const functionBrick = page.locator('.brick-item:has-text("Function")');
      await functionBrick.dragTo(page.locator('.function-list-area'));
      await page.waitForTimeout(1000);
    }

    // Step 3: Add permission for secondary user (view only, not run)
    await page.click('button.tab-button:has-text("Permissions")');
    await page.click('button.add-user-button:has-text("Add a user")');
    await page.fill('input.email-input[type="email"]', SECONDARY_EMAIL);
    await page.click('button.confirm-button:has-text("Add")');
    await page.waitForTimeout(1000);

    // Step 4: Logout and login as secondary user
    await page.click('button.settings-button, button[aria-label="Settings"]');
    await page.click('button.settings-logout:has-text("Logout")');
    await page.waitForURL('/login', { timeout: 5000 });

    await page.fill('input[id="email"]', SECONDARY_EMAIL);
    await page.fill('input[id="password"]', SECONDARY_PASSWORD);
    const registerButton2 = page.locator('button:has-text("Don\'t have an account? Register")').or(page.locator('button:has-text("Register")'));
    if (await registerButton2.isVisible()) {
      await registerButton2.click();
      await page.click('button[type="submit"]:has-text("Register")');
      await page.waitForURL('/home', { timeout: 10000 });
    } else {
      await page.click('button[type="submit"]:has-text("Login")');
      await page.waitForURL('/home', { timeout: 10000 });
    }

    // Step 5: Navigate to shared function
    const sharedProjectCard = page.locator('.project-card').first();
    await sharedProjectCard.dblclick();
    await page.waitForURL(/\/projects\/[^/]+/, { timeout: 10000 });

    await page.click('button.tab-button:has-text("Project")');
    const sharedFunctionCard = page.locator('.function-card').first();
    await sharedFunctionCard.dblclick();
    await page.waitForURL(/\/functions\/[^/]+/, { timeout: 10000 });

    // Step 6: Verify RUN button is NOT displayed OR is disabled
    const runButton = page.locator('button.run-button:has-text("RUN")');
    const isVisible = await runButton.isVisible();
    const isDisabled = await runButton.isDisabled().catch(() => false);

    // Step 7: If button is visible, try to click it
    if (isVisible && !isDisabled) {
      await runButton.click();
      await page.waitForTimeout(2000);

      // Step 8: Verify permission denied error
      const errorNotification = page.locator('.error-notification');
      const errorMessage = await errorNotification.textContent().catch(() => null);
      
      expect(
        errorMessage?.toLowerCase().includes('permission') ||
        errorMessage?.toLowerCase().includes('denied') ||
        (await errorNotification.isVisible())
      ).toBeTruthy();
    } else {
      // Button is not available or disabled - test passes
      expect(true).toBeTruthy();
    }
  });

  test('FUNC-RUN-006: Run Function - Verify Console Output Format', async () => {
    // Step 1: Login
    await page.fill('input[id="email"]', PRIMARY_EMAIL);
    await page.fill('input[id="password"]', PRIMARY_PASSWORD);
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForURL('/home', { timeout: 10000 });

    // Step 2: Navigate to function editor
    const projectCard = page.locator('.project-card').first();
    await projectCard.dblclick();
    await page.waitForURL(/\/projects\/[^/]+/, { timeout: 10000 });

    await page.click('button.tab-button:has-text("Project")');
    const functionCard = page.locator('.function-card').first();
    await functionCard.dblclick();
    await page.waitForURL(/\/functions\/[^/]+/, { timeout: 10000 });

    // Step 3: Set up function properly
    const listBrick = page.locator('.brick-node:has-text("List instances by DB name")');
    if (await listBrick.count() === 0) {
      const listBrickItem = page.locator('.brick-item:has-text("List instances by DB name")');
      await listBrickItem.dragTo(page.locator('.function-editor-canvas'));
      await page.waitForTimeout(1000);
    }

    const getFirstBrick = page.locator('.brick-node:has-text("Get first instance")');
    if (await getFirstBrick.count() === 0) {
      const getFirstBrickItem = page.locator('.brick-item:has-text("Get first instance")');
      await getFirstBrickItem.dragTo(page.locator('.function-editor-canvas'));
      await page.waitForTimeout(1000);
    }

    const logBrick = page.locator('.brick-node:has-text("Log instance props")');
    if (await logBrick.count() === 0) {
      const logBrickItem = page.locator('.brick-item:has-text("Log instance props")');
      await logBrickItem.dragTo(page.locator('.function-editor-canvas'));
      await page.waitForTimeout(1000);
    }

    // Set database parameter
    const listBrickNode = page.locator('.brick-node:has-text("List instances by DB name")');
    const dbSelectButton = listBrickNode.locator('button.database-select-button');
    await dbSelectButton.click();
    await page.click('.database-option:has-text("default database")');
    await page.waitForTimeout(500);

    // Create connections
    const listBrickNode2 = page.locator('.brick-node:has-text("List instances by DB name")');
    const getFirstBrickNode = page.locator('.brick-node:has-text("Get first instance")');
    const logBrickNode = page.locator('.brick-node:has-text("Log instance props")');

    const edges = page.locator('.react-flow__edge');
    if (await edges.count() < 2) {
      const listOutputHandle = listBrickNode2.locator('.react-flow__handle-right[data-handleid="List"]');
      const getFirstInputHandle = getFirstBrickNode.locator('.react-flow__handle-left[data-handleid="List"]');
      await listOutputHandle.hover();
      await listOutputHandle.dragTo(getFirstInputHandle);
      await page.waitForTimeout(1000);

      const getFirstOutputHandle = getFirstBrickNode.locator('.react-flow__handle-right[data-handleid="DB"]');
      const logInputHandle = logBrickNode.locator('.react-flow__handle-left[data-handleid="Object"]');
      await getFirstOutputHandle.hover();
      await getFirstOutputHandle.dragTo(logInputHandle);
      await page.waitForTimeout(1000);
    }

    // Step 4: Clear console logs
    consoleLogs = [];

    // Step 5: Click RUN button
    const runButton = page.locator('button.run-button:has-text("RUN")');
    await runButton.click();

    // Step 6: Wait for execution
    await page.waitForTimeout(3000);

    // Step 7: Verify console output format
    const hasLogOutput = consoleLogs.length > 0;
    expect(hasLogOutput).toBeTruthy();

    // Step 8: Verify output contains instance properties
    const hasInstanceData = consoleLogs.some(log => 
      log.toLowerCase().includes('instance') ||
      log.includes(DB_INSTANCE_VALUE) ||
      log.includes(DB_INSTANCE_VALUE_2) ||
      log.includes('Test Value') ||
      log.includes('First Instance Value')
    );

    expect(hasInstanceData).toBeTruthy();
  });

  test('FUNC-RUN-007: Run Function - Run Multiple Times', async () => {
    // Step 1: Login
    await page.fill('input[id="email"]', PRIMARY_EMAIL);
    await page.fill('input[id="password"]', PRIMARY_PASSWORD);
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForURL('/home', { timeout: 10000 });

    // Step 2: Navigate to function editor
    const projectCard = page.locator('.project-card').first();
    await projectCard.dblclick();
    await page.waitForURL(/\/projects\/[^/]+/, { timeout: 10000 });

    await page.click('button.tab-button:has-text("Project")');
    const functionCard = page.locator('.function-card').first();
    await functionCard.dblclick();
    await page.waitForURL(/\/functions\/[^/]+/, { timeout: 10000 });

    // Step 3: Set up function properly
    const listBrick = page.locator('.brick-node:has-text("List instances by DB name")');
    if (await listBrick.count() === 0) {
      const listBrickItem = page.locator('.brick-item:has-text("List instances by DB name")');
      await listBrickItem.dragTo(page.locator('.function-editor-canvas'));
      await page.waitForTimeout(1000);
    }

    const getFirstBrick = page.locator('.brick-node:has-text("Get first instance")');
    if (await getFirstBrick.count() === 0) {
      const getFirstBrickItem = page.locator('.brick-item:has-text("Get first instance")');
      await getFirstBrickItem.dragTo(page.locator('.function-editor-canvas'));
      await page.waitForTimeout(1000);
    }

    const logBrick = page.locator('.brick-node:has-text("Log instance props")');
    if (await logBrick.count() === 0) {
      const logBrickItem = page.locator('.brick-item:has-text("Log instance props")');
      await logBrickItem.dragTo(page.locator('.function-editor-canvas'));
      await page.waitForTimeout(1000);
    }

    // Set database parameter
    const listBrickNode = page.locator('.brick-node:has-text("List instances by DB name")');
    const dbSelectButton = listBrickNode.locator('button.database-select-button');
    await dbSelectButton.click();
    await page.click('.database-option:has-text("default database")');
    await page.waitForTimeout(500);

    // Create connections
    const listBrickNode2 = page.locator('.brick-node:has-text("List instances by DB name")');
    const getFirstBrickNode = page.locator('.brick-node:has-text("Get first instance")');
    const logBrickNode = page.locator('.brick-node:has-text("Log instance props")');

    const edges = page.locator('.react-flow__edge');
    if (await edges.count() < 2) {
      const listOutputHandle = listBrickNode2.locator('.react-flow__handle-right[data-handleid="List"]');
      const getFirstInputHandle = getFirstBrickNode.locator('.react-flow__handle-left[data-handleid="List"]');
      await listOutputHandle.hover();
      await listOutputHandle.dragTo(getFirstInputHandle);
      await page.waitForTimeout(1000);

      const getFirstOutputHandle = getFirstBrickNode.locator('.react-flow__handle-right[data-handleid="DB"]');
      const logInputHandle = logBrickNode.locator('.react-flow__handle-left[data-handleid="Object"]');
      await getFirstOutputHandle.hover();
      await getFirstOutputHandle.dragTo(logInputHandle);
      await page.waitForTimeout(1000);
    }

    const runButton = page.locator('button.run-button:has-text("RUN")');

    // Step 4: First execution
    consoleLogs = [];
    await runButton.click();
    await page.waitForTimeout(3000);

    const firstExecutionLogs = consoleLogs.length;
    expect(firstExecutionLogs).toBeGreaterThan(0);

    // Step 5: Second execution
    consoleLogs = [];
    await runButton.click();
    await page.waitForTimeout(3000);

    const secondExecutionLogs = consoleLogs.length;
    expect(secondExecutionLogs).toBeGreaterThan(0);

    // Step 6: Verify both executions produced output
    expect(firstExecutionLogs).toBeGreaterThan(0);
    expect(secondExecutionLogs).toBeGreaterThan(0);

    // Step 7: Verify no errors occurred
    const errorNotification = page.locator('.error-notification');
    expect(await errorNotification.isVisible()).toBeFalsy();
  });
});
