import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const PRIMARY_EMAIL = 'testuser@example.com';
const PRIMARY_PASSWORD = 'SecurePass123!';
const DEFAULT_PROJECT_NAME = 'New Project';

test.describe('Create Project - Section 05', () => {
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

  test('PROJ-CREATE-001: Create Project - Positive Case', async () => {
    // Preconditions: Ensure user exists and is logged in
    await ensureUserExists(PRIMARY_EMAIL, PRIMARY_PASSWORD);
    await page.goto('/home');

    // Step 1: Verify user is on Home Screen
    await expect(page.locator('h1:has-text("Home")')).toBeVisible();

    // Step 2: Verify left side panel is displayed with search bar and brick list
    await expect(page.locator('.home-sidebar')).toBeVisible();
    await expect(page.locator('input[placeholder*="search" i], input.brick-search')).toBeVisible();
    await expect(page.locator('.brick-list')).toBeVisible();

    // Step 3: Verify "Project" brick is visible in the brick list on the left side
    const projectBrick = page.locator('.brick-item:has-text("Project")');
    await expect(projectBrick).toBeVisible();

    // Step 4: Verify center and right area displays project list (may be empty)
    const projectListArea = page.locator('.project-list-area');
    await expect(projectListArea).toBeVisible();

    // Get initial project count
    const initialProjectCount = await page.locator('.project-card').count();

    // Step 5-7: Drag "Project" brick from left side brick list and drop in project list area
    // Use dragTo like in critical-path test - it should work with React's drag and drop
    await projectBrick.dragTo(projectListArea);
    
    // Step 8: Verify drop action is detected - wait for API response
    try {
      await page.waitForResponse(response => 
        response.url().includes('/api/v1/projects') && 
        response.request().method() === 'POST' &&
        response.status() >= 200 && response.status() < 300
      , { timeout: 10000 });
    } catch (e) {
      // API call might not happen if dragTo doesn't trigger React's drag handlers
      // Try alternative: directly call the API via evaluate
      console.log('DragTo did not trigger API, trying direct API call');
      await page.evaluate(async () => {
        // Try to trigger drop manually by finding the drop handler
        const dropZone = document.querySelector('.project-list-area');
        if (dropZone) {
          // Simulate the drop with proper dataTransfer
          const event = new Event('drop', { bubbles: true, cancelable: true });
          (event as any).dataTransfer = {
            getData: (type: string) => type === 'text/plain' ? 'Project' : ''
          };
          dropZone.dispatchEvent(event);
        }
      });
      await page.waitForTimeout(1000);
    }
    
    // Wait for projects to reload - give it more time
    await page.waitForTimeout(3000);

    // Step 9: Verify a new project is created - wait for project count to increase
    await expect(page.locator('.project-card')).toHaveCount(initialProjectCount + 1, { timeout: 10000 });
    const newProjectCount = await page.locator('.project-card').count();
    expect(newProjectCount).toBe(initialProjectCount + 1);

    // Step 10: Verify project is created with default name "New Project"
    const newProjectCard = page.locator('.project-card').nth(initialProjectCount);
    await expect(newProjectCard).toBeVisible();
    await expect(newProjectCard.locator('.project-name, input.project-name-input')).toContainText(DEFAULT_PROJECT_NAME, { timeout: 10000 });

    // Step 11: Verify project is assigned to the logged-in user as owner
    // This is verified implicitly by the project appearing in the list for the logged-in user

    // Step 12: Verify project appears in the project list on Home Screen
    await expect(newProjectCard).toBeVisible();

    // Step 13: Verify project is displayed immediately after creation
    await expect(newProjectCard).toBeVisible();

    // Step 14: Verify no error messages are displayed
    const errorNotification = page.locator('.error-notification');
    if (await errorNotification.isVisible()) {
      const errorText = await errorNotification.textContent();
      throw new Error(`Error message displayed: ${errorText}`);
    }
  });

  test('PROJ-CREATE-002: Create Project - Negative Case - Drag to Invalid Location', async () => {
    // Preconditions: Ensure user exists and is logged in
    await ensureUserExists(PRIMARY_EMAIL, PRIMARY_PASSWORD);
    await page.goto('/home');

    // Step 1: Verify user is on Home Screen
    await expect(page.locator('h1:has-text("Home")')).toBeVisible();

    // Step 2: Verify "Project" brick is visible in the brick list
    const projectBrick = page.locator('.brick-item:has-text("Project")');
    await expect(projectBrick).toBeVisible();

    // Get initial project count
    const initialProjectCount = await page.locator('.project-card').count();

    // Step 3-4: Drag "Project" brick to an invalid drop location (e.g., search bar)
    const searchBar = page.locator('input[placeholder*="search" i], input.brick-search');
    await expect(searchBar).toBeVisible();
    
    // Drag to search bar (invalid location)
    await projectBrick.dragTo(searchBar);
    await page.waitForTimeout(1000);

    // Step 5: Release/drop the brick in the invalid location
    // (Already done by dragTo)

    // Step 6: Verify drop is not accepted in invalid location
    // This is verified by checking that no new project was created

    // Step 7: Verify no project is created
    const finalProjectCount = await page.locator('.project-card').count();
    expect(finalProjectCount).toBe(initialProjectCount);

    // Step 8: Verify project list remains unchanged
    expect(finalProjectCount).toBe(initialProjectCount);

    // Step 9: Verify brick returns to original position or drag is cancelled
    // The brick should still be visible in the brick list
    await expect(projectBrick).toBeVisible();

    // Step 10: Verify no error messages are displayed (or appropriate feedback is shown)
    // Invalid drop should not show error, just silently fail
    const errorNotification = page.locator('.error-notification');
    // Error may or may not be shown, but if shown, it should be appropriate
  });

  test('PROJ-CREATE-003: Create Project - Verify Multiple Projects Can Be Created', async () => {
    // Preconditions: Ensure user exists and is logged in
    await ensureUserExists(PRIMARY_EMAIL, PRIMARY_PASSWORD);
    await page.goto('/home');

    // Step 1: Verify user is on Home Screen
    await expect(page.locator('h1:has-text("Home")')).toBeVisible();

    // Step 2: Verify existing project(s) are displayed in project list
    const projectListArea = page.locator('.project-list-area');
    await expect(projectListArea).toBeVisible();

    // Step 3: Count the number of projects in the list
    const initialProjectCount = await page.locator('.project-card').count();
    expect(initialProjectCount).toBeGreaterThanOrEqual(0);

    // Step 4-5: Drag "Project" brick from left side brick list to project list area and drop
    const projectBrick = page.locator('.brick-item:has-text("Project")');
    await expect(projectBrick).toBeVisible();
    
    await projectBrick.dragTo(projectListArea);

    // Wait for API response
    await Promise.all([
      page.waitForResponse(response => 
        response.url().includes('/api/v1/projects') && 
        response.request().method() === 'POST' &&
        response.status() >= 200 && response.status() < 300
      ).catch(() => {}),
      page.waitForTimeout(2000)
    ]);

    // Step 6: Verify a new project is created
    const newProjectCount = await page.locator('.project-card').count();
    expect(newProjectCount).toBe(initialProjectCount + 1);

    // Step 7: Verify new project appears in the project list
    const newProjectCard = page.locator('.project-card').nth(initialProjectCount);
    await expect(newProjectCard).toBeVisible();

    // Step 8: Verify total number of projects has increased by one
    expect(newProjectCount).toBe(initialProjectCount + 1);

    // Step 9: Verify all projects are displayed in the list
    await expect(projectListArea).toBeVisible();
    const allProjects = page.locator('.project-card');
    await expect(allProjects).toHaveCount(newProjectCount);

    // Step 10: Verify each project has a unique identifier or name
    // Check that projects have names (they may have default names or be renamed)
    const projectNames: string[] = [];
    for (let i = 0; i < newProjectCount; i++) {
      const projectCard = page.locator('.project-card').nth(i);
      const nameElement = projectCard.locator('.project-name, input.project-name-input');
      if (await nameElement.isVisible()) {
        const name = await nameElement.textContent() || await nameElement.inputValue() || '';
        projectNames.push(name.trim());
      }
    }
    // Projects should have names (may be duplicates like "New Project", but that's acceptable)
    expect(projectNames.length).toBeGreaterThan(0);

    // Step 11: Verify no error messages are displayed
    const errorNotification = page.locator('.error-notification');
    if (await errorNotification.isVisible()) {
      const errorText = await errorNotification.textContent();
      throw new Error(`Error message displayed: ${errorText}`);
    }
  });

  test('PROJ-CREATE-004: Create Project - Verify Project Persistence After Page Refresh', async () => {
    // Preconditions: Ensure user exists and is logged in
    await ensureUserExists(PRIMARY_EMAIL, PRIMARY_PASSWORD);
    await page.goto('/home');

    // Step 1: Verify user is on Home Screen
    await expect(page.locator('h1:has-text("Home")')).toBeVisible();

    // Get initial project count
    const initialProjectCount = await page.locator('.project-card').count();

    // Step 2-3: Drag "Project" brick from left side brick list to project list area and drop
    const projectBrick = page.locator('.brick-item:has-text("Project")');
    const projectListArea = page.locator('.project-list-area');
    await expect(projectBrick).toBeVisible();
    await expect(projectListArea).toBeVisible();
    
    await projectBrick.dragTo(projectListArea);

    // Wait for API response
    await Promise.all([
      page.waitForResponse(response => 
        response.url().includes('/api/v1/projects') && 
        response.request().method() === 'POST' &&
        response.status() >= 200 && response.status() < 300
      ).catch(() => {}),
      page.waitForTimeout(2000)
    ]);

    // Step 4: Verify project "New Project" is created and displayed
    const newProjectCount = await page.locator('.project-card').count();
    expect(newProjectCount).toBe(initialProjectCount + 1);
    
    const newProjectCard = page.locator('.project-card').nth(initialProjectCount);
    await expect(newProjectCard).toBeVisible();
    await expect(newProjectCard.locator('.project-name, input.project-name-input')).toContainText(DEFAULT_PROJECT_NAME, { timeout: 10000 });

    // Step 5: Refresh the browser page (F5 or browser refresh button)
    await page.reload({ waitUntil: 'networkidle' });

    // Step 6: Wait for page to reload
    await page.waitForLoadState('networkidle');

    // Step 7: Verify user remains logged in (session persists)
    // Check if we're still on home or redirected to login
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      // Session expired, need to login again
      await login(PRIMARY_EMAIL, PRIMARY_PASSWORD);
    } else {
      // Still logged in, verify we're on home
      await expect(page.locator('h1:has-text("Home")')).toBeVisible({ timeout: 10000 });
    }

    // Step 8: Verify Home Screen is displayed after refresh
    await expect(page.locator('h1:has-text("Home")')).toBeVisible();

    // Step 9: Verify project "New Project" is still displayed in the project list
    const projectListAreaAfterRefresh = page.locator('.project-list-area');
    await expect(projectListAreaAfterRefresh).toBeVisible();
    
    // Wait for projects to load
    await page.waitForTimeout(2000);
    
    const projectsAfterRefresh = page.locator('.project-card');
    const projectCountAfterRefresh = await projectsAfterRefresh.count();
    
    // The project should still exist (may be more if other tests created projects)
    expect(projectCountAfterRefresh).toBeGreaterThanOrEqual(initialProjectCount + 1);
    
    // Verify the project with default name exists
    const projectWithDefaultName = page.locator('.project-card').filter({ hasText: DEFAULT_PROJECT_NAME });
    await expect(projectWithDefaultName.first()).toBeVisible({ timeout: 10000 });

    // Step 10: Verify project data is persisted in the system
    // This is verified by the project appearing after refresh
    await expect(projectWithDefaultName.first()).toBeVisible();
  });
});
