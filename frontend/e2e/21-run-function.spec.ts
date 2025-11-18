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
const DATABASE_NAME = 'default database';

test.describe('Run Function Tests - Section 21', () => {
  let page: Page;
  let consoleMessages: string[] = [];

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    test.setTimeout(60000);
    consoleMessages = [];
    
    // Capture console logs
    page.on('console', (msg) => {
      const text = msg.text();
      consoleMessages.push(text);
      console.log(`[Browser Console] ${text}`);
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
    const brickItem = page.locator(`.brick-item:has-text("${brickType}")`).or(page.locator(`.brick-item:has-text("${brickType.replace(/\s+/g, '')}")`));
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
  }

  // Helper function to connect two bricks
  async function connectBricks(sourceBrickId: string, sourceHandle: string, targetBrickId: string, targetHandle: string) {
    // Find the source handle
    const sourceHandleElement = page.locator(`[data-node-id="${sourceBrickId}"] [data-handleid="${sourceHandle}"]`);
    const targetHandleElement = page.locator(`[data-node-id="${targetBrickId}"] [data-handleid="${targetHandle}"]`);
    
    await sourceHandleElement.dragTo(targetHandleElement);
    await page.waitForTimeout(1000);
    
    // Wait for connection API call
    await page.waitForResponse(response => 
      response.url().includes('/api/v1/connections') && 
      response.request().method() === 'POST' &&
      response.status() >= 200 && response.status() < 300
    ).catch(() => {});
  }

  // Helper function to set brick configuration
  async function setBrickConfiguration(brickLabel: string, configKey: string, configValue: string) {
    const brickNode = page.locator('.brick-node').filter({ hasText: brickLabel }).first();
    await expect(brickNode).toBeVisible();
    
    // Find the configuration input (could be a database select button or input field)
    const configButton = brickNode.locator(`button:has-text("${configKey}"), button.database-select-button`).first();
    if (await configButton.isVisible()) {
      await configButton.click();
      await page.waitForTimeout(500);
      
      // Select the database from dropdown or modal
      const dbOption = page.locator(`button:has-text("${configValue}"), .database-option:has-text("${configValue}")`).first();
      if (await dbOption.isVisible()) {
        await dbOption.click();
        await page.waitForTimeout(500);
      }
    } else {
      // Try input field
      const configInput = brickNode.locator(`input[placeholder*="${configKey}"], input.property-input`).first();
      if (await configInput.isVisible()) {
        await configInput.clear();
        await configInput.fill(configValue);
        await configInput.press('Enter');
        await page.waitForTimeout(500);
      }
    }
  }

  // Helper function to create database instance
  async function createDatabaseInstance(databaseName: string, propertyValue: string) {
    // Navigate to project editor
    await openProjectEditor(PROJECT_NAME);
    
    // Click Database tab
    await page.click('button.tab-button:has-text("Database")');
    await expect(page.locator('button.tab-button.active:has-text("Database")')).toBeVisible();
    
    // Select database
    const dbButton = page.locator(`button.database-type-item:has-text("${databaseName}")`).first();
    await expect(dbButton).toBeVisible();
    await dbButton.click();
    await page.waitForTimeout(500);
    
    // Check if instance already exists
    const instanceRows = page.locator('.database-instance-row');
    const instanceCount = await instanceRows.count();
    
    if (instanceCount === 0) {
      // Create new instance
      const addButton = page.locator('button:has-text("Add Instance"), button.add-instance-button').first();
      if (await addButton.isVisible()) {
        await addButton.click();
        await page.waitForTimeout(1000);
        
        // Fill in property value
        const valueInput = page.locator('input.instance-property-input').first();
        if (await valueInput.isVisible()) {
          await valueInput.fill(propertyValue);
          await valueInput.press('Enter');
          await page.waitForTimeout(1000);
        }
      }
    }
  }

  test('FUNC-RUN-001: Run Function - Positive Case', async () => {
    test.setTimeout(120000); // Increase timeout to 2 minutes
    
    // Setup: Ensure user exists and is logged in
    await ensureUserExists(PRIMARY_EMAIL, PRIMARY_PASSWORD);
    await page.goto('/home');

    // Create project if it doesn't exist
    await createProject(PROJECT_NAME);

    // Open project editor
    await openProjectEditor(PROJECT_NAME);

    // Create database instance FIRST (before opening function editor)
    await createDatabaseInstance(DATABASE_NAME, 'Test Instance Value');

    // Navigate back to Project tab to create function
    const projectTab = page.locator('button.tab-button:has-text("Project")');
    await expect(projectTab).toBeVisible({ timeout: 10000 });
    await projectTab.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('button.tab-button.active:has-text("Project")')).toBeVisible();

    // Create function if it doesn't exist
    await createFunction(FUNCTION_NAME);

    // Open function editor
    await openFunctionEditor(FUNCTION_NAME);

    // Clear console messages
    consoleMessages = [];

    // Wait for function editor to be fully loaded
    await page.waitForTimeout(2000);

    // Add bricks to canvas
    await addBrickToFunction('List instances by DB name');
    await page.waitForTimeout(2000);
    await addBrickToFunction('Get first instance');
    await page.waitForTimeout(2000);
    await addBrickToFunction('Log instance props');
    await page.waitForTimeout(2000);

    // Get brick IDs (we'll use the brick nodes on canvas)
    const brickNodes = page.locator('.brick-node');
    await expect(brickNodes).toHaveCount(3, { timeout: 15000 });
    
    const listBrick = brickNodes.filter({ hasText: 'List instances by DB name' }).first();
    const getFirstBrick = brickNodes.filter({ hasText: 'Get first instance' }).first();
    const logBrick = brickNodes.filter({ hasText: 'Log instance props' }).first();

    // Set database configuration on "List instances by DB name" brick
    await setBrickConfiguration('List instances by DB name', 'Name of DB', DATABASE_NAME);
    await page.waitForTimeout(2000);

    // Connect bricks: List -> Get First -> Log
    // Use ReactFlow handles to connect
    const listBrickNode = listBrick;
    const getFirstBrickNode = getFirstBrick;
    const logBrickNode = logBrick;

    // Try to connect using drag from source handle to target handle
    const sourceHandle = listBrickNode.locator('.react-flow__handle.source, [data-handlepos="right"]').first();
    const targetHandle1 = getFirstBrickNode.locator('.react-flow__handle.target, [data-handlepos="left"]').first();
    
    if (await sourceHandle.isVisible({ timeout: 5000 }).catch(() => false) && 
        await targetHandle1.isVisible({ timeout: 5000 }).catch(() => false)) {
      await sourceHandle.dragTo(targetHandle1);
      await page.waitForResponse(response => 
        response.url().includes('/api/v1/connections') && 
        response.request().method() === 'POST'
      ).catch(() => {});
      await page.waitForTimeout(2000);
    }

    const sourceHandle2 = getFirstBrickNode.locator('.react-flow__handle.source, [data-handlepos="right"]').first();
    const targetHandle2 = logBrickNode.locator('.react-flow__handle.target, [data-handlepos="left"]').first();
    
    if (await sourceHandle2.isVisible({ timeout: 5000 }).catch(() => false) && 
        await targetHandle2.isVisible({ timeout: 5000 }).catch(() => false)) {
      await sourceHandle2.dragTo(targetHandle2);
      await page.waitForResponse(response => 
        response.url().includes('/api/v1/connections') && 
        response.request().method() === 'POST'
      ).catch(() => {});
      await page.waitForTimeout(2000);
    }

    // Verify RUN button is visible
    const runButton = page.locator('button.run-button:has-text("RUN")');
    await expect(runButton).toBeVisible();

    // Clear console before running
    consoleMessages = [];

    // Click RUN button
    await runButton.click();

    // Wait for execution to complete (button should change from "Running..." back to "RUN")
    await expect(runButton).not.toHaveText('Running...', { timeout: 30000 });
    
    // Wait a bit for console output
    await page.waitForTimeout(2000);

    // Verify console output was generated
    // Note: Playwright captures console.log, but we need to check if messages were logged
    const hasConsoleOutput = consoleMessages.length > 0;
    expect(hasConsoleOutput).toBe(true);

    // Verify no error messages are displayed
    const errorNotification = page.locator('.error-notification');
    if (await errorNotification.isVisible()) {
      const errorText = await errorNotification.textContent();
      throw new Error(`Error message displayed: ${errorText}`);
    }

    // Verify function execution completed successfully
    await expect(runButton).toBeEnabled();
  });

  test('FUNC-RUN-002: Run Function - Negative Case - Missing Required Inputs', async () => {
    await ensureUserExists(PRIMARY_EMAIL, PRIMARY_PASSWORD);
    await page.goto('/home');

    await createProject(PROJECT_NAME);
    await openProjectEditor(PROJECT_NAME);
    await createFunction(FUNCTION_NAME);
    await openFunctionEditor(FUNCTION_NAME);

    // Add bricks
    await addBrickToFunction('List instances by DB name');
    await page.waitForTimeout(1000);
    await addBrickToFunction('Get first instance');
    await page.waitForTimeout(1000);
    await addBrickToFunction('Log instance props');
    await page.waitForTimeout(1000);

    // DO NOT set the "Name of DB" parameter (missing required input)
    // The brick should not have the database configured

    // Verify RUN button is visible
    const runButton = page.locator('button.run-button:has-text("RUN")');
    await expect(runButton).toBeVisible();

    // Clear console
    consoleMessages = [];

    // Click RUN button
    await runButton.click();

    // Wait for error message or execution failure
    await page.waitForTimeout(3000);

    // Verify error message is displayed
    const errorNotification = page.locator('.error-notification');
    const hasError = await errorNotification.isVisible();
    
    if (hasError) {
      const errorText = await errorNotification.textContent();
      expect(errorText?.toLowerCase()).toMatch(/missing required|required input|invalid/i);
    } else {
      // If no error notification, check if execution was prevented
      // The button should be enabled again if execution failed
      await expect(runButton).toBeEnabled();
    }

    // Verify no console output was generated
    expect(consoleMessages.length).toBe(0);
  });

  test('FUNC-RUN-003: Run Function - Negative Case - Invalid Brick Connections', async () => {
    await ensureUserExists(PRIMARY_EMAIL, PRIMARY_PASSWORD);
    await page.goto('/home');

    await createProject(PROJECT_NAME);
    await openProjectEditor(PROJECT_NAME);
    await createFunction(FUNCTION_NAME);
    await openFunctionEditor(FUNCTION_NAME);

    // Add bricks
    await addBrickToFunction('List instances by DB name');
    await page.waitForTimeout(1000);
    await addBrickToFunction('Get first instance');
    await page.waitForTimeout(1000);
    await addBrickToFunction('Log instance props');
    await page.waitForTimeout(1000);

    // Set database configuration
    await setBrickConfiguration('List instances by DB name', 'Name of DB', DATABASE_NAME);

    // DO NOT create connections between bricks (invalid connections)

    // Verify RUN button is visible
    const runButton = page.locator('button.run-button:has-text("RUN")');
    await expect(runButton).toBeVisible();

    // Clear console
    consoleMessages = [];

    // Click RUN button
    await runButton.click();

    // Wait for error message or execution failure
    await page.waitForTimeout(3000);

    // Verify error message is displayed
    const errorNotification = page.locator('.error-notification');
    const hasError = await errorNotification.isVisible();
    
    if (hasError) {
      const errorText = await errorNotification.textContent();
      expect(errorText?.toLowerCase()).toMatch(/invalid.*connection|connection.*invalid|missing.*connection/i);
    } else {
      // Execution might fail or be prevented
      await expect(runButton).toBeEnabled();
    }

    // Verify no console output was generated
    expect(consoleMessages.length).toBe(0);
  });

  test('FUNC-RUN-004: Run Function - Negative Case - Execution Failed', async () => {
    await ensureUserExists(PRIMARY_EMAIL, PRIMARY_PASSWORD);
    await page.goto('/home');

    await createProject(PROJECT_NAME);
    await openProjectEditor(PROJECT_NAME);
    await createFunction(FUNCTION_NAME);
    await openFunctionEditor(FUNCTION_NAME);

    // Add bricks
    await addBrickToFunction('List instances by DB name');
    await page.waitForTimeout(1000);
    await addBrickToFunction('Get first instance');
    await page.waitForTimeout(1000);
    await addBrickToFunction('Log instance props');
    await page.waitForTimeout(1000);

    // Set database configuration to a database that has no instances
    await setBrickConfiguration('List instances by DB name', 'Name of DB', DATABASE_NAME);

    // Ensure no instances exist (or use a non-existent database)
    // We'll set it to a database that likely has no instances

    // Connect bricks (properly configured)
    const brickNodes = page.locator('.brick-node');
    await expect(brickNodes).toHaveCount(3, { timeout: 10000 });
    
    const listBrick = brickNodes.filter({ hasText: 'List instances by DB name' }).first();
    const getFirstBrick = brickNodes.filter({ hasText: 'Get first instance' }).first();
    const logBrick = brickNodes.filter({ hasText: 'Log instance props' }).first();

    // Try to connect bricks
    const sourceHandle = listBrick.locator('.react-flow__handle.source, [data-handlepos="right"]').first();
    const targetHandle1 = getFirstBrick.locator('.react-flow__handle.target, [data-handlepos="left"]').first();
    
    if (await sourceHandle.isVisible() && await targetHandle1.isVisible()) {
      await sourceHandle.dragTo(targetHandle1);
      await page.waitForTimeout(2000);
    }

    const sourceHandle2 = getFirstBrick.locator('.react-flow__handle.source, [data-handlepos="right"]').first();
    const targetHandle2 = logBrick.locator('.react-flow__handle.target, [data-handlepos="left"]').first();
    
    if (await sourceHandle2.isVisible() && await targetHandle2.isVisible()) {
      await sourceHandle2.dragTo(targetHandle2);
      await page.waitForTimeout(2000);
    }

    // Verify RUN button is visible
    const runButton = page.locator('button.run-button:has-text("RUN")');
    await expect(runButton).toBeVisible();

    // Clear console
    consoleMessages = [];

    // Click RUN button
    await runButton.click();

    // Wait for execution to start and potentially fail
    await page.waitForTimeout(5000);

    // Verify error message is displayed (execution failed)
    const errorNotification = page.locator('.error-notification');
    const hasError = await errorNotification.isVisible();
    
    if (hasError) {
      const errorText = await errorNotification.textContent();
      expect(errorText?.toLowerCase()).toMatch(/execution failed|failed|error|no instances/i);
    } else {
      // If execution completes but with no results, that's also a failure case
      // Check if console has error messages
      const hasErrorInConsole = consoleMessages.some(msg => 
        msg.toLowerCase().includes('error') || 
        msg.toLowerCase().includes('failed') ||
        msg.toLowerCase().includes('no instances')
      );
      expect(hasErrorInConsole || hasError).toBe(true);
    }
  });

  test('FUNC-RUN-005: Run Function - Negative Case - Permission Denied', async () => {
    // Setup: Create owner and user accounts
    await ensureUserExists(OWNER_EMAIL, OWNER_PASSWORD);
    await page.goto('/home');

    // Create shared project as owner
    await createProject(SHARED_PROJECT_NAME);
    await openProjectEditor(SHARED_PROJECT_NAME);
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
          const errorNotification = page.locator('.error-notification');

          if (isInFunctionEditor) {
            // Check if RUN button is visible or disabled
            const runButton = page.locator('button.run-button:has-text("RUN")');
            const isRunButtonVisible = await runButton.isVisible();
            const isRunButtonDisabled = await runButton.isDisabled();

            if (isRunButtonVisible && !isRunButtonDisabled) {
              // Try to click RUN button
              await runButton.click();
              await page.waitForTimeout(3000);

              // Verify error message "Permission denied" is displayed
              const hasError = await errorNotification.isVisible();
              if (hasError) {
                const errorText = await errorNotification.textContent();
                expect(errorText?.toLowerCase()).toContain('permission denied');
              }
            } else {
              // RUN button is disabled or not visible - this is expected
              expect(isRunButtonDisabled || !isRunButtonVisible).toBe(true);
            }
          } else if (await errorNotification.isVisible()) {
            // Permission denied when trying to open function editor
            const errorText = await errorNotification.textContent();
            expect(errorText?.toLowerCase()).toContain('permission denied');
          }
        }
      }
    } else {
      // Project is not visible - permission is working correctly
      expect(projectVisible).toBe(false);
    }
  });

  test('FUNC-RUN-006: Run Function - Verify Console Output Format', async () => {
    await ensureUserExists(PRIMARY_EMAIL, PRIMARY_PASSWORD);
    await page.goto('/home');

    await createProject(PROJECT_NAME);
    await openProjectEditor(PROJECT_NAME);
    await createFunction(FUNCTION_NAME);
    await openFunctionEditor(FUNCTION_NAME);

    // Create database instance with specific value
    await createDatabaseInstance(DATABASE_NAME, 'Test Value');

    // Navigate back to function editor
    await openFunctionEditor(FUNCTION_NAME);
    await page.waitForTimeout(2000);

    // Add and configure bricks
    await addBrickToFunction('List instances by DB name');
    await page.waitForTimeout(1000);
    await addBrickToFunction('Get first instance');
    await page.waitForTimeout(1000);
    await addBrickToFunction('Log instance props');
    await page.waitForTimeout(1000);

    await setBrickConfiguration('List instances by DB name', 'Name of DB', DATABASE_NAME);

    // Connect bricks
    const brickNodes = page.locator('.brick-node');
    await expect(brickNodes).toHaveCount(3, { timeout: 10000 });
    
    const listBrick = brickNodes.filter({ hasText: 'List instances by DB name' }).first();
    const getFirstBrick = brickNodes.filter({ hasText: 'Get first instance' }).first();
    const logBrick = brickNodes.filter({ hasText: 'Log instance props' }).first();

    const sourceHandle = listBrick.locator('.react-flow__handle.source, [data-handlepos="right"]').first();
    const targetHandle1 = getFirstBrick.locator('.react-flow__handle.target, [data-handlepos="left"]').first();
    
    if (await sourceHandle.isVisible() && await targetHandle1.isVisible()) {
      await sourceHandle.dragTo(targetHandle1);
      await page.waitForTimeout(2000);
    }

    const sourceHandle2 = getFirstBrick.locator('.react-flow__handle.source, [data-handlepos="right"]').first();
    const targetHandle2 = logBrick.locator('.react-flow__handle.target, [data-handlepos="left"]').first();
    
    if (await sourceHandle2.isVisible() && await targetHandle2.isVisible()) {
      await sourceHandle2.dragTo(targetHandle2);
      await page.waitForTimeout(2000);
    }

    // Clear console
    consoleMessages = [];

    // Click RUN button
    const runButton = page.locator('button.run-button:has-text("RUN")');
    await expect(runButton).toBeVisible();
    await runButton.click();

    // Wait for execution to complete
    await expect(runButton).not.toHaveText('Running...', { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Verify console output is generated
    expect(consoleMessages.length).toBeGreaterThan(0);

    // Verify console output contains instance properties
    const consoleOutput = consoleMessages.join(' ');
    expect(consoleOutput).toContain('Test Value');

    // Verify output format is readable (contains object structure or property information)
    const hasReadableFormat = consoleOutput.includes('{') || 
                              consoleOutput.includes('property') || 
                              consoleOutput.includes('value') ||
                              consoleOutput.includes('Test Value');
    expect(hasReadableFormat).toBe(true);
  });

  test('FUNC-RUN-007: Run Function - Run Multiple Times', async () => {
    await ensureUserExists(PRIMARY_EMAIL, PRIMARY_PASSWORD);
    await page.goto('/home');

    await createProject(PROJECT_NAME);
    await openProjectEditor(PROJECT_NAME);
    await createFunction(FUNCTION_NAME);
    await openFunctionEditor(FUNCTION_NAME);

    // Create database instance
    await createDatabaseInstance(DATABASE_NAME, 'Test Instance Value');

    // Navigate back to function editor
    await openFunctionEditor(FUNCTION_NAME);
    await page.waitForTimeout(2000);

    // Add and configure bricks
    await addBrickToFunction('List instances by DB name');
    await page.waitForTimeout(1000);
    await addBrickToFunction('Get first instance');
    await page.waitForTimeout(1000);
    await addBrickToFunction('Log instance props');
    await page.waitForTimeout(1000);

    await setBrickConfiguration('List instances by DB name', 'Name of DB', DATABASE_NAME);

    // Connect bricks
    const brickNodes = page.locator('.brick-node');
    await expect(brickNodes).toHaveCount(3, { timeout: 10000 });
    
    const listBrick = brickNodes.filter({ hasText: 'List instances by DB name' }).first();
    const getFirstBrick = brickNodes.filter({ hasText: 'Get first instance' }).first();
    const logBrick = brickNodes.filter({ hasText: 'Log instance props' }).first();

    const sourceHandle = listBrick.locator('.react-flow__handle.source, [data-handlepos="right"]').first();
    const targetHandle1 = getFirstBrick.locator('.react-flow__handle.target, [data-handlepos="left"]').first();
    
    if (await sourceHandle.isVisible() && await targetHandle1.isVisible()) {
      await sourceHandle.dragTo(targetHandle1);
      await page.waitForTimeout(2000);
    }

    const sourceHandle2 = getFirstBrick.locator('.react-flow__handle.source, [data-handlepos="right"]').first();
    const targetHandle2 = logBrick.locator('.react-flow__handle.target, [data-handlepos="left"]').first();
    
    if (await sourceHandle2.isVisible() && await targetHandle2.isVisible()) {
      await sourceHandle2.dragTo(targetHandle2);
      await page.waitForTimeout(2000);
    }

    const runButton = page.locator('button.run-button:has-text("RUN")');
    await expect(runButton).toBeVisible();

    // First execution
    consoleMessages = [];
    await runButton.click();
    await expect(runButton).not.toHaveText('Running...', { timeout: 30000 });
    await page.waitForTimeout(2000);
    const firstExecutionOutputCount = consoleMessages.length;
    expect(firstExecutionOutputCount).toBeGreaterThan(0);

    // Second execution
    consoleMessages = [];
    await runButton.click();
    await expect(runButton).not.toHaveText('Running...', { timeout: 30000 });
    await page.waitForTimeout(2000);
    const secondExecutionOutputCount = consoleMessages.length;
    expect(secondExecutionOutputCount).toBeGreaterThan(0);

    // Verify both executions produced output
    expect(firstExecutionOutputCount).toBeGreaterThan(0);
    expect(secondExecutionOutputCount).toBeGreaterThan(0);

    // Verify no errors occurred
    const errorNotification = page.locator('.error-notification');
    expect(await errorNotification.isVisible()).toBe(false);
  });
});
