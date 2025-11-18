import { test, expect, Page } from '@playwright/test';

const TEST_USER_EMAIL = 'testuser@example.com';
const TEST_USER_PASSWORD = 'SecurePass123!';
const OWNER_EMAIL = 'owner@example.com';
const OWNER_PASSWORD = 'SecurePass123!';
const VIEWER_EMAIL = 'user@example.com';
const VIEWER_PASSWORD = 'SecurePass456!';

async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/home', { timeout: 10000 });
}

async function createProject(page: Page, projectName: string): Promise<string> {
  await page.goto('/home');
  await page.click('button:has-text("New Project")');
  await page.fill('input[placeholder*="Project"]', projectName);
  await page.click('button:has-text("Create")');
  await page.waitForTimeout(1000);
  const projectUrl = page.url();
  const projectId = projectUrl.split('/projects/')[1];
  return projectId;
}

async function createFunction(page: Page, projectId: string, functionName: string): Promise<string> {
  await page.goto(`/projects/${projectId}`);
  await page.click('button:has-text("New Function")');
  await page.fill('input[placeholder*="Function"]', functionName);
  await page.click('button:has-text("Create")');
  await page.waitForTimeout(1000);
  const functionUrl = page.url();
  const functionId = functionUrl.split('/functions/')[1];
  return functionId;
}

async function navigateToFunctionEditor(page: Page, functionId: string) {
  await page.goto(`/functions/${functionId}`);
  await page.waitForSelector('.function-editor', { timeout: 10000 });
}

test.describe('BRICK-ADD-001: Add Brick to Function Editor - Positive Case', () => {
  test('should successfully add a brick to the function editor', async ({ page }) => {
    // Login
    await login(page, TEST_USER_EMAIL, TEST_USER_PASSWORD);

    // Create project and function
    const projectId = await createProject(page, 'TestProject');
    const functionId = await createFunction(page, projectId, 'TestFunction');

    // Navigate to function editor
    await navigateToFunctionEditor(page, functionId);

    // Verify user is in Function Editor
    await expect(page.locator('.function-editor')).toBeVisible();
    await expect(page.locator('h1:has-text("TestFunction")')).toBeVisible();

    // Verify left side panel shows search bar and brick list
    await expect(page.locator('.function-editor-sidebar')).toBeVisible();
    await expect(page.locator('input[placeholder*="Search bricks"]')).toBeVisible();
    await expect(page.locator('.brick-list')).toBeVisible();

    // Verify brick list displays "List instances by DB name" brick
    const brickList = page.locator('.brick-list');
    await expect(brickList.locator('text=ListInstancesByDB')).toBeVisible();

    // Verify center canvas is displayed with grid layout
    await expect(page.locator('.function-editor-canvas')).toBeVisible();

    // Drag "List instances by DB name" brick from left side brick list
    const brickItem = brickList.locator('text=ListInstancesByDB').first();
    const canvas = page.locator('.function-editor-canvas');

    // Get initial canvas state
    const initialBrickCount = await page.locator('.react-flow__node').count();

    // Perform drag and drop
    await brickItem.dragTo(canvas, {
      targetPosition: { x: 400, y: 300 },
    });

    // Wait for brick to be added
    await page.waitForTimeout(1000);

    // Verify brick is added to the canvas
    const finalBrickCount = await page.locator('.react-flow__node').count();
    expect(finalBrickCount).toBeGreaterThan(initialBrickCount);

    // Verify brick displays input connection point "Name of DB"
    await expect(page.locator('.brick-node-inputs')).toBeVisible();
    await expect(page.locator('text=Name of DB')).toBeVisible();

    // Verify brick displays output connection point "List"
    await expect(page.locator('.brick-node-outputs')).toBeVisible();
    await expect(page.locator('text=List')).toBeVisible();

    // Verify brick is displayed with its label/name
    await expect(page.locator('text=List instances by DB name')).toBeVisible();

    // Verify no error messages are displayed
    await expect(page.locator('.error-message')).not.toBeVisible();
  });
});

test.describe('BRICK-ADD-002: Add All Available Bricks', () => {
  test('should successfully add all available bricks to the canvas', async ({ page }) => {
    // Login
    await login(page, TEST_USER_EMAIL, TEST_USER_PASSWORD);

    // Create project and function
    const projectId = await createProject(page, 'TestProject');
    const functionId = await createFunction(page, projectId, 'TestFunction');

    // Navigate to function editor
    await navigateToFunctionEditor(page, functionId);

    // Verify brick list displays three bricks
    const brickList = page.locator('.brick-list');
    await expect(brickList.locator('text=ListInstancesByDB')).toBeVisible();
    await expect(brickList.locator('text=GetFirstInstance')).toBeVisible();
    await expect(brickList.locator('text=LogInstanceProps')).toBeVisible();

    const canvas = page.locator('.function-editor-canvas');

    // Drag and drop first brick
    await brickList.locator('text=ListInstancesByDB').first().dragTo(canvas, {
      targetPosition: { x: 200, y: 200 },
    });
    await page.waitForTimeout(1000);

    // Drag and drop second brick
    await brickList.locator('text=GetFirstInstance').first().dragTo(canvas, {
      targetPosition: { x: 400, y: 200 },
    });
    await page.waitForTimeout(1000);

    // Drag and drop third brick
    await brickList.locator('text=LogInstanceProps').first().dragTo(canvas, {
      targetPosition: { x: 600, y: 200 },
    });
    await page.waitForTimeout(1000);

    // Verify all three bricks are displayed on canvas
    const brickNodes = page.locator('.react-flow__node');
    await expect(brickNodes).toHaveCount(3);

    // Verify all bricks display their respective input and output connection points
    await expect(page.locator('text=List instances by DB name')).toBeVisible();
    await expect(page.locator('text=Get first instance')).toBeVisible();
    await expect(page.locator('text=Log instance props')).toBeVisible();

    // Verify no error messages are displayed
    await expect(page.locator('.error-message')).not.toBeVisible();
  });
});

test.describe('BRICK-ADD-003: Drag to Invalid Location', () => {
  test('should not add brick when dropped in invalid location', async ({ page }) => {
    // Login
    await login(page, TEST_USER_EMAIL, TEST_USER_PASSWORD);

    // Create project and function
    const projectId = await createProject(page, 'TestProject');
    const functionId = await createFunction(page, projectId, 'TestFunction');

    // Navigate to function editor
    await navigateToFunctionEditor(page, functionId);

    const brickList = page.locator('.brick-list');
    const brickItem = brickList.locator('text=ListInstancesByDB').first();

    // Get initial brick count
    const initialBrickCount = await page.locator('.react-flow__node').count();

    // Try to drag to invalid locations (search bar, RUN button, settings)
    const searchBar = page.locator('input[placeholder*="Search bricks"]');
    const runButton = page.locator('button:has-text("RUN")');

    // Try dropping on search bar
    await brickItem.dragTo(searchBar);
    await page.waitForTimeout(500);

    // Try dropping on RUN button
    await brickItem.dragTo(runButton);
    await page.waitForTimeout(500);

    // Verify no brick was added
    const finalBrickCount = await page.locator('.react-flow__node').count();
    expect(finalBrickCount).toBe(initialBrickCount);
  });
});

test.describe('BRICK-ADD-004: Invalid Brick Type', () => {
  test('should only allow valid brick types', async ({ page }) => {
    // Login
    await login(page, TEST_USER_EMAIL, TEST_USER_PASSWORD);

    // Create project and function
    const projectId = await createProject(page, 'TestProject');
    const functionId = await createFunction(page, projectId, 'TestFunction');

    // Navigate to function editor
    await navigateToFunctionEditor(page, functionId);

    // Verify only valid bricks are displayed in brick list
    const brickList = page.locator('.brick-list');
    const brickItems = brickList.locator('.brick-item');
    const count = await brickItems.count();
    
    // Should only have the three valid brick types
    expect(count).toBe(3);
    await expect(brickList.locator('text=ListInstancesByDB')).toBeVisible();
    await expect(brickList.locator('text=GetFirstInstance')).toBeVisible();
    await expect(brickList.locator('text=LogInstanceProps')).toBeVisible();
  });
});

test.describe('BRICK-ADD-005: Permission Denied', () => {
  test('should prevent adding brick when user lacks edit permission', async ({ page }) => {
    // First, login as owner and create project/function
    await login(page, OWNER_EMAIL, OWNER_PASSWORD);
    const projectId = await createProject(page, 'SharedProject');
    const functionId = await createFunction(page, projectId, 'SharedFunction');

    // Add viewer permission (view only, no edit)
    await page.goto(`/projects/${projectId}`);
    // Assuming there's a way to add permissions - this might need adjustment based on actual UI
    // For now, we'll test that a user without edit permission cannot add bricks

    // Logout and login as viewer
    await page.click('button:has-text("Logout"), button:has-text("Sign Out")').catch(() => {});
    await page.waitForTimeout(1000);

    // Login as viewer (who should have view but not edit permission)
    await login(page, VIEWER_EMAIL, VIEWER_PASSWORD);

    // Try to navigate to function editor
    await navigateToFunctionEditor(page, functionId);

    // Try to drag a brick
    const brickList = page.locator('.brick-list');
    const brickItem = brickList.locator('text=ListInstancesByDB').first();
    const canvas = page.locator('.function-editor-canvas');

    const initialBrickCount = await page.locator('.react-flow__node').count();

    // Attempt to add brick
    await brickItem.dragTo(canvas, {
      targetPosition: { x: 400, y: 300 },
    });
    await page.waitForTimeout(1000);

    // Verify either brick was not added OR error message is displayed
    const finalBrickCount = await page.locator('.react-flow__node').count();
    const errorVisible = await page.locator('text=/permission denied/i').isVisible().catch(() => false);

    // Either the brick count should not increase OR an error should be shown
    expect(finalBrickCount === initialBrickCount || errorVisible).toBeTruthy();
  });
});

test.describe('BRICK-ADD-006: Verify Brick Persistence', () => {
  test('should persist brick after navigation away and back', async ({ page }) => {
    // Login
    await login(page, TEST_USER_EMAIL, TEST_USER_PASSWORD);

    // Create project and function
    const projectId = await createProject(page, 'TestProject');
    const functionId = await createFunction(page, projectId, 'TestFunction');

    // Navigate to function editor
    await navigateToFunctionEditor(page, functionId);

    // Verify canvas is empty (or get initial state)
    const initialBrickCount = await page.locator('.react-flow__node').count();

    // Add a brick
    const brickList = page.locator('.brick-list');
    const canvas = page.locator('.function-editor-canvas');
    await brickList.locator('text=ListInstancesByDB').first().dragTo(canvas, {
      targetPosition: { x: 400, y: 300 },
    });
    await page.waitForTimeout(2000); // Wait for persistence

    // Verify brick is added
    const afterAddCount = await page.locator('.react-flow__node').count();
    expect(afterAddCount).toBeGreaterThan(initialBrickCount);

    // Navigate away from Function Editor
    await page.click('button:has-text("Back")');
    await page.waitForURL(/\/projects\//, { timeout: 10000 });

    // Navigate back to Function Editor
    await page.goto(`/functions/${functionId}`);
    await page.waitForSelector('.function-editor', { timeout: 10000 });
    await page.waitForTimeout(2000); // Wait for data to load

    // Verify brick is still displayed on canvas
    const afterNavigationCount = await page.locator('.react-flow__node').count();
    expect(afterNavigationCount).toBeGreaterThan(0);
    await expect(page.locator('text=List instances by DB name')).toBeVisible();
  });
});
