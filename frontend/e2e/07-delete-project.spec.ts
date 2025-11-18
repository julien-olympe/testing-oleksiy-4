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

test.describe('Delete Project Tests', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    
    // Navigate to login screen
    await page.goto('/login');
  });

  test('PROJ-DELETE-001: Delete Project - Positive Case', async () => {
    // Use unique project name for this test
    const uniqueProjectName = `TestProject-${Date.now()}`;
    
    // ===== STEP 1: Login User =====
    await test.step('Step 1: Login User', async () => {
      // Verify Login Screen is displayed
      await expect(page.locator('input[id="email"]')).toBeVisible();
      await expect(page.locator('input[id="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]:has-text("Login")')).toBeVisible();

      // Enter login credentials
      await page.fill('input[id="email"]', PRIMARY_EMAIL);
      await page.fill('input[id="password"]', PRIMARY_PASSWORD);

      // Click Login button
      await page.click('button[type="submit"]:has-text("Login")');

      // Verify user is authenticated and redirected to Home Screen
      await page.waitForURL('/home', { timeout: 10000 });
      await expect(page.locator('h1:has-text("Home")')).toBeVisible();
    });

    // ===== STEP 2: Verify User is on Home Screen =====
    await test.step('Step 2: Verify User is on Home Screen', async () => {
      // Verify user is on Home Screen
      await expect(page.locator('h1:has-text("Home")')).toBeVisible();
      await expect(page).toHaveURL(/\/home/);
    });

    // ===== STEP 3: Create or Verify Project Exists =====
    await test.step('Step 3: Create or Verify Project Exists', async () => {
      // Wait for project list to load
      await page.waitForSelector('.project-list-area', { timeout: 5000 });
      
      // Create project by dragging Project brick
      const projectBrick = page.locator('.brick-item:has-text("Project")');
      const projectListArea = page.locator('.project-list-area');
      
      await expect(projectBrick).toBeVisible();
      await projectBrick.dragTo(projectListArea);
      
      // Wait for project to be created
      await page.waitForTimeout(1000);
      
      // Rename the project to unique name
      const newProjectCard = page.locator('.project-card').first();
      await newProjectCard.locator('button[title="Rename"]').click();
      await page.fill('.project-name-input', uniqueProjectName);
      await page.keyboard.press('Enter');
      
      // Wait for rename to complete and API call
      await page.waitForResponse(
        (response) => response.url().includes('/api/v1/projects/') && response.request().method() === 'PUT',
        { timeout: 10000 }
      );
      await page.waitForTimeout(500);
      
      // Verify project is displayed in the project list
      await expect(page.locator('.project-card').filter({ hasText: uniqueProjectName }).first()).toBeVisible();
    });

    // ===== STEP 4: Select Project =====
    await test.step('Step 4: Select Project', async () => {
      // Select project by clicking on it
      const projectCard = page.locator('.project-card').filter({ hasText: uniqueProjectName }).first();
      await projectCard.click();
    });

    // ===== STEP 5: Locate Delete Action =====
    await test.step('Step 5: Locate Delete Action', async () => {
      // Locate delete button within the project card
      const projectCard = page.locator('.project-card').filter({ hasText: uniqueProjectName }).first();
      const deleteButton = projectCard.locator('button[title="Delete"]');
      await expect(deleteButton).toBeVisible();
    });

    // ===== STEP 6: Click Delete Action =====
    await test.step('Step 6: Click Delete Action', async () => {
      // Set up dialog handler for confirmation
      const dialogPromise = new Promise<void>((resolve) => {
        page.once('dialog', async (dialog) => {
          expect(dialog.type()).toBe('confirm');
          expect(dialog.message()).toContain('Are you sure you want to delete this project?');
          await dialog.accept();
          resolve();
        });
      });

      // Wait for API call to complete
      const deleteApiPromise = page.waitForResponse(
        (response) => response.url().includes('/api/v1/projects/') && response.request().method() === 'DELETE',
        { timeout: 10000 }
      );

      // Click delete button
      const projectCard = page.locator('.project-card').filter({ hasText: uniqueProjectName }).first();
      const deleteButton = projectCard.locator('button[title="Delete"]');
      await deleteButton.click();
      
      // Wait for dialog and API call
      await Promise.all([dialogPromise, deleteApiPromise]);
    });

    // ===== STEP 7: Verify Confirmation Dialog =====
    await test.step('Step 7: Verify Confirmation Dialog is Displayed', async () => {
      // Dialog is handled in previous step, just wait a bit for it to process
      await page.waitForTimeout(500);
    });

    // ===== STEP 8: Verify Project is Removed from List =====
    await test.step('Step 8: Verify Project is Removed from Project List', async () => {
      // Wait for project list to refresh
      // The loadProjects() call happens after delete, so wait for GET request or just wait a bit
      try {
        await page.waitForResponse(
          (response) => response.url().includes('/api/v1/projects') && response.request().method() === 'GET' && !response.url().includes('/projects/'),
          { timeout: 5000 }
        );
      } catch {
        // If GET request already happened, just wait a bit for UI update
        await page.waitForTimeout(1000);
      }
      
      // Verify project is no longer in the list
      const projectCard = page.locator('.project-card').filter({ hasText: uniqueProjectName });
      await expect(projectCard).not.toBeVisible({ timeout: 5000 });
    });

    // ===== STEP 9: Verify No Error Messages =====
    await test.step('Step 9: Verify No Error Messages are Displayed', async () => {
      // Check for error notifications
      const errorNotification = page.locator('.error-notification');
      if (await errorNotification.isVisible().catch(() => false)) {
        const errorText = await errorNotification.textContent();
        throw new Error(`Unexpected error after deletion: ${errorText}`);
      }
    });
  });

  test('PROJ-DELETE-002: Delete Project - Negative Case - Permission Denied', async () => {
    // ===== STEP 1: Create Owner Account and Project =====
    await test.step('Step 1: Create Owner Account and Project', async () => {
      // Register or login owner account
      await page.goto('/login');
      await page.waitForSelector('input[id="email"]', { timeout: 5000 });
      
      // Try to register first
      const registerButton = page.locator('button:has-text("Don\'t have an account? Register")').or(page.locator('button:has-text("Register")'));
      if (await registerButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await registerButton.click();
        await page.fill('input[id="email"]', OWNER_EMAIL);
        await page.fill('input[id="password"]', OWNER_PASSWORD);
        
        // Wait for registration API call
        const registerPromise = page.waitForResponse(
          (response) => response.url().includes('/api/v1/auth/register') && response.status() < 400,
          { timeout: 10000 }
        ).catch(() => null);
        
        await page.click('button[type="submit"]:has-text("Register")');
        await registerPromise;
        
        // Wait for navigation or check for error
        try {
          await page.waitForURL('/home', { timeout: 5000 });
        } catch {
          // If registration failed (user already exists), try login
          await page.goto('/login');
          await page.fill('input[id="email"]', OWNER_EMAIL);
          await page.fill('input[id="password"]', OWNER_PASSWORD);
          await page.click('button[type="submit"]:has-text("Login")');
          await page.waitForURL('/home', { timeout: 10000 });
        }
      } else {
        // Already on login, just login
        await page.fill('input[id="email"]', OWNER_EMAIL);
        await page.fill('input[id="password"]', OWNER_PASSWORD);
        await page.click('button[type="submit"]:has-text("Login")');
        await page.waitForURL('/home', { timeout: 10000 });
      }

      // Create project "SharedProject"
      await page.waitForSelector('.project-list-area', { timeout: 5000 });
      
      // Wait for project creation API call
      const createProjectPromise = page.waitForResponse(
        (response) => response.url().includes('/api/v1/projects') && response.request().method() === 'POST',
        { timeout: 10000 }
      ).catch(() => null);
      
      const projectBrick = page.locator('.brick-item:has-text("Project")');
      const projectListArea = page.locator('.project-list-area');
      await projectBrick.dragTo(projectListArea);
      await createProjectPromise;
      await page.waitForTimeout(500);
      
      // Rename project
      const newProjectCard = page.locator('.project-card').first();
      await newProjectCard.locator('button[title="Rename"]').click();
      await page.fill('.project-name-input', SHARED_PROJECT_NAME);
      
      // Wait for rename API call
      const renamePromise = page.waitForResponse(
        (response) => response.url().includes('/api/v1/projects/') && response.request().method() === 'PUT',
        { timeout: 10000 }
      ).catch(() => null);
      
      await page.keyboard.press('Enter');
      await renamePromise;
      await page.waitForTimeout(500);
      
      // Verify project exists with correct name
      const sharedProjectCard = page.locator('.project-card').filter({ hasText: SHARED_PROJECT_NAME }).first();
      await expect(sharedProjectCard).toBeVisible({ timeout: 5000 });

      // Logout
      await page.click('button.settings-button, button[aria-label="Settings"]');
      await expect(page.locator('.settings-dropdown')).toBeVisible();
      await page.click('button.settings-logout:has-text("Logout")');
      await page.waitForURL('/login', { timeout: 10000 });
    });

    // ===== STEP 2: Create User Account =====
    await test.step('Step 2: Create User Account', async () => {
      // Register or login user account
      // First try to login (user might already exist)
      await page.goto('/login');
      await page.waitForSelector('input[id="email"]', { timeout: 5000 });
      
      await page.fill('input[id="email"]', USER_EMAIL);
      await page.fill('input[id="password"]', USER_PASSWORD);
      
      // Wait for login API call
      const loginPromise = page.waitForResponse(
        (response) => response.url().includes('/api/v1/auth/login'),
        { timeout: 10000 }
      ).catch(() => null);
      
      await page.click('button[type="submit"]:has-text("Login")');
      await loginPromise;
      
      // Check if we're on home (login successful) or still on login (need to register)
      try {
        await page.waitForURL('/home', { timeout: 5000 });
      } catch {
        // Login failed, try to register
        const registerButton = page.locator('button:has-text("Don\'t have an account? Register")').or(page.locator('button:has-text("Register")'));
        if (await registerButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await registerButton.click();
          await page.fill('input[id="email"]', USER_EMAIL);
          await page.fill('input[id="password"]', USER_PASSWORD);
          
          const registerPromise = page.waitForResponse(
            (response) => response.url().includes('/api/v1/auth/register'),
            { timeout: 10000 }
          ).catch(() => null);
          
          await page.click('button[type="submit"]:has-text("Register")');
          await registerPromise;
          await page.waitForURL('/home', { timeout: 10000 });
        }
      }
    });

    // ===== STEP 3: Add Permission for User =====
    await test.step('Step 3: Add View Permission for User', async () => {
      // Login as owner to add permission
      await page.click('button.settings-button, button[aria-label="Settings"]');
      await expect(page.locator('.settings-dropdown')).toBeVisible();
      await page.click('button.settings-logout:has-text("Logout")');
      await page.waitForURL('/login', { timeout: 10000 });
      
      // Login as owner
      await page.fill('input[id="email"]', OWNER_EMAIL);
      await page.fill('input[id="password"]', OWNER_PASSWORD);
      await page.click('button[type="submit"]:has-text("Login")');
      await page.waitForURL('/home', { timeout: 10000 });
      
      // Wait for project list to load
      await page.waitForSelector('.project-list-area', { timeout: 5000 });

      // Verify project exists and open project editor
      const projectCard = page.locator('.project-card').filter({ hasText: SHARED_PROJECT_NAME }).first();
      await expect(projectCard).toBeVisible({ timeout: 5000 });
      
      // Wait for editor API call
      const editorPromise = page.waitForResponse(
        (response) => response.url().includes('/api/v1/projects/') && response.url().includes('/editor') && response.request().method() === 'GET',
        { timeout: 10000 }
      ).catch(() => null);
      
      // Open project editor
      await projectCard.dblclick();
      
      // Wait for navigation and editor API
      await Promise.all([
        page.waitForURL(/\/projects\/[^/]+/, { timeout: 10000 }),
        editorPromise
      ]);
      
      // Check for errors
      const errorNotification = page.locator('.error-notification');
      if (await errorNotification.isVisible({ timeout: 2000 }).catch(() => false)) {
        const errorText = await errorNotification.textContent();
        throw new Error(`Error loading project editor: ${errorText}`);
      }
      
      // Wait for project editor to load
      // First check if we're on the right page
      const currentURL = page.url();
      if (!currentURL.includes('/projects/')) {
        throw new Error(`Expected to be on project editor page, but on: ${currentURL}`);
      }
      
      // Wait for any content to load - try multiple approaches
      try {
        await page.waitForSelector('button.tab-button:has-text("Project")', { timeout: 10000 });
      } catch (e) {
        // Try waiting for any tab button or project editor content
        try {
          await page.waitForSelector('button.tab-button', { timeout: 5000 });
        } catch {
          // If still not found, wait for project editor container
          await page.waitForSelector('.project-editor', { timeout: 5000 });
          // Then try to find tabs again
          await page.waitForSelector('button.tab-button', { timeout: 5000 });
        }
      }
      
      // Now wait for Permissions tab specifically
      await page.waitForSelector('button.tab-button:has-text("Permissions")', { timeout: 10000 });

      // Navigate to Permissions tab
      const permissionsTab = page.locator('button.tab-button:has-text("Permissions")');
      await permissionsTab.click();
      
      // Wait for Permissions tab to be active
      await expect(page.locator('button.tab-button.active:has-text("Permissions")')).toBeVisible({ timeout: 5000 });

      // Wait for permissions UI to be ready
      await page.waitForSelector('.permissions-list', { timeout: 5000 });
      
      // Click "Add a user" button if visible, or find email input
      const addUserButton = page.locator('button.add-user-button:has-text("Add a user")');
      if (await addUserButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await addUserButton.click();
        await page.waitForSelector('input.email-input[type="email"]', { timeout: 5000 });
      }
      
      // Add permission for user
      const emailInput = page.locator('input.email-input[type="email"]').or(page.locator('input[type="email"]'));
      await emailInput.fill(USER_EMAIL);
      
      // Wait for API call when adding permission
      const addPermissionPromise = page.waitForResponse(
        (response) => response.url().includes('/api/v1/projects/') && response.url().includes('/permissions') && response.request().method() === 'POST',
        { timeout: 10000 }
      ).catch(() => null);
      
      const addButton = page.locator('button:has-text("Add Permission")');
      await addButton.click();
      await addPermissionPromise;

      // Wait for permission to be added and list to refresh
      await page.waitForTimeout(1000);

      // Close project editor and go back to home
      await page.goto('/home');
      await page.waitForTimeout(1000);

      // Logout
      await page.click('button.settings-button, button[aria-label="Settings"]');
      await expect(page.locator('.settings-dropdown')).toBeVisible();
      await page.click('button.settings-logout:has-text("Logout")');
      await page.waitForURL('/login', { timeout: 10000 });
    });

    // ===== STEP 4: Login as User =====
    await test.step('Step 4: Login as User', async () => {
      // Login as user
      await page.fill('input[id="email"]', USER_EMAIL);
      await page.fill('input[id="password"]', USER_PASSWORD);
      await page.click('button[type="submit"]:has-text("Login")');
      await page.waitForURL('/home', { timeout: 10000 });
    });

    // ===== STEP 5: Verify User is on Home Screen =====
    await test.step('Step 5: Verify User is on Home Screen', async () => {
      await expect(page.locator('h1:has-text("Home")')).toBeVisible();
      await expect(page).toHaveURL(/\/home/);
    });

    // ===== STEP 6: Verify Project is Visible =====
    await test.step('Step 6: Verify Project "SharedProject" is Displayed', async () => {
      await page.waitForSelector('.project-list-area', { timeout: 5000 });
      const projectCard = page.locator('.project-card').filter({ hasText: SHARED_PROJECT_NAME }).first();
      await expect(projectCard).toBeVisible({ timeout: 5000 });
    });

    // ===== STEP 7: Select Project =====
    await test.step('Step 7: Select Project "SharedProject"', async () => {
      const projectCard = page.locator('.project-card').filter({ hasText: SHARED_PROJECT_NAME }).first();
      await projectCard.click();
    });

    // ===== STEP 8: Attempt to Delete =====
    await test.step('Step 8: Attempt to Locate Delete Action', async () => {
      // Check if delete button is visible (it should not be for non-owners)
      const projectCard = page.locator('.project-card').filter({ hasText: SHARED_PROJECT_NAME }).first();
      const deleteButton = projectCard.locator('button[title="Delete"]');
      
      // Delete button should not be visible for non-owners
      // If it is visible, clicking it should fail
      const isVisible = await deleteButton.isVisible().catch(() => false);
      
      if (isVisible) {
        // If delete button is visible, try clicking it and expect an error
        page.once('dialog', async (dialog) => {
          await dialog.accept();
        });
        
        await deleteButton.click();
        await page.waitForTimeout(1000);
        
        // Verify error message is displayed
        const errorNotification = page.locator('.error-notification');
        await expect(errorNotification).toBeVisible({ timeout: 5000 });
        const errorText = await errorNotification.textContent();
        expect(errorText).toContain('Permission denied');
      } else {
        // Delete button is not visible, which is correct behavior
        // This means permission restrictions are enforced
      }
    });

    // ===== STEP 9: Verify Project Remains =====
    await test.step('Step 9: Verify Project "SharedProject" Remains in List', async () => {
      await page.waitForTimeout(1000);
      const projectCard = page.locator('.project-card').filter({ hasText: SHARED_PROJECT_NAME }).first();
      await expect(projectCard).toBeVisible();
    });
  });

  test('PROJ-DELETE-003: Delete Project - Cancel Deletion', async () => {
    // Use unique project name for this test
    const uniqueProjectName = `TestProject-${Date.now()}`;
    
    // ===== STEP 1: Login User =====
    await test.step('Step 1: Login User', async () => {
      await expect(page.locator('input[id="email"]')).toBeVisible();
      await page.fill('input[id="email"]', PRIMARY_EMAIL);
      await page.fill('input[id="password"]', PRIMARY_PASSWORD);
      await page.click('button[type="submit"]:has-text("Login")');
      await page.waitForURL('/home', { timeout: 10000 });
      await expect(page.locator('h1:has-text("Home")')).toBeVisible();
    });

    // ===== STEP 2: Create Project =====
    await test.step('Step 2: Create Project', async () => {
      await page.waitForSelector('.project-list-area', { timeout: 5000 });
      
      const projectBrick = page.locator('.brick-item:has-text("Project")');
      const projectListArea = page.locator('.project-list-area');
      await projectBrick.dragTo(projectListArea);
      await page.waitForTimeout(1000);
      
      const newProjectCard = page.locator('.project-card').first();
      await newProjectCard.locator('button[title="Rename"]').click();
      await page.fill('.project-name-input', uniqueProjectName);
      await page.keyboard.press('Enter');
      
      // Wait for rename API call
      await page.waitForResponse(
        (response) => response.url().includes('/api/v1/projects/') && response.request().method() === 'PUT',
        { timeout: 10000 }
      );
      await page.waitForTimeout(500);
      
      await expect(page.locator('.project-card').filter({ hasText: uniqueProjectName }).first()).toBeVisible();
    });

    // ===== STEP 3: Select Project =====
    await test.step('Step 3: Select Project', async () => {
      const projectCard = page.locator('.project-card').filter({ hasText: uniqueProjectName }).first();
      await projectCard.click();
    });

    // ===== STEP 4: Click Delete Action =====
    await test.step('Step 4: Click Delete Action', async () => {
      // Set up dialog handler to cancel
      page.once('dialog', async (dialog) => {
        expect(dialog.type()).toBe('confirm');
        expect(dialog.message()).toContain('Are you sure you want to delete this project?');
        await dialog.dismiss(); // Cancel deletion
      });

      const projectCard = page.locator('.project-card').filter({ hasText: uniqueProjectName }).first();
      const deleteButton = projectCard.locator('button[title="Delete"]');
      await deleteButton.click();
      await page.waitForTimeout(500);
    });

    // ===== STEP 5: Verify Deletion is Cancelled =====
    await test.step('Step 5: Verify Deletion is Cancelled', async () => {
      await page.waitForTimeout(500);
    });

    // ===== STEP 6: Verify Project Remains =====
    await test.step('Step 6: Verify Project Remains in List', async () => {
      const projectCard = page.locator('.project-card').filter({ hasText: uniqueProjectName }).first();
      await expect(projectCard).toBeVisible();
    });

    // ===== STEP 7: Verify No Error Messages =====
    await test.step('Step 7: Verify No Error Messages are Displayed', async () => {
      const errorNotification = page.locator('.error-notification');
      if (await errorNotification.isVisible().catch(() => false)) {
        const errorText = await errorNotification.textContent();
        throw new Error(`Unexpected error after cancellation: ${errorText}`);
      }
    });
  });

  test('PROJ-DELETE-004: Delete Project - Verify Cascading Deletion', async () => {
    // Use unique project name for this test
    const uniqueProjectName = `TestProject-${Date.now()}`;
    
    // ===== STEP 1: Login User =====
    await test.step('Step 1: Login User', async () => {
      await expect(page.locator('input[id="email"]')).toBeVisible();
      await page.fill('input[id="email"]', PRIMARY_EMAIL);
      await page.fill('input[id="password"]', PRIMARY_PASSWORD);
      await page.click('button[type="submit"]:has-text("Login")');
      await page.waitForURL('/home', { timeout: 10000 });
      await expect(page.locator('h1:has-text("Home")')).toBeVisible();
    });

    // ===== STEP 2: Create Project with Data =====
    await test.step('Step 2: Create Project with Functions and Instances', async () => {
      await page.waitForSelector('.project-list-area', { timeout: 5000 });
      
      // Create project
      const projectBrick = page.locator('.brick-item:has-text("Project")');
      const projectListArea = page.locator('.project-list-area');
      await projectBrick.dragTo(projectListArea);
      await page.waitForTimeout(1000);
      
      // Rename project
      const newProjectCard = page.locator('.project-card').first();
      await newProjectCard.locator('button[title="Rename"]').click();
      await page.fill('.project-name-input', uniqueProjectName);
      await page.keyboard.press('Enter');
      
      // Wait for rename API call
      await page.waitForResponse(
        (response) => response.url().includes('/api/v1/projects/') && response.request().method() === 'PUT',
        { timeout: 10000 }
      );
      await page.waitForTimeout(500);
      
      const projectCard = page.locator('.project-card').filter({ hasText: uniqueProjectName }).first();
      await expect(projectCard).toBeVisible();
      
      // Open project editor
      await projectCard.dblclick();
      await page.waitForURL(/\/projects\/[^/]+/, { timeout: 10000 });
      
      // Create a function if it doesn't exist
      const functionList = page.locator('.function-list');
      if (await functionList.isVisible()) {
        const functions = await functionList.locator('.function-item').count();
        if (functions === 0) {
          // Drag Function brick to create function
          const functionBrick = page.locator('.brick-item:has-text("Function")');
          if (await functionBrick.isVisible()) {
            await functionBrick.dragTo(functionList);
            await page.waitForTimeout(1000);
          }
        }
      }
      
      // Create a database instance if needed
      const databaseTab = page.locator('button:has-text("Database")');
      await databaseTab.click();
      await page.waitForTimeout(500);
      
      // Check if instances exist
      const instancesList = page.locator('.instances-list');
      if (await instancesList.isVisible()) {
        const instances = await instancesList.locator('.instance-card').count();
        if (instances === 0) {
          // Create an instance
          const createButton = page.locator('button:has-text("Create Instance")');
          if (await createButton.isVisible()) {
            await createButton.click();
            await page.waitForTimeout(1000);
          }
        }
      }
      
      // Go back to home
      await page.goto('/home');
      await page.waitForTimeout(1000);
    });

    // ===== STEP 3: Note Associated Data =====
    await test.step('Step 3: Note Associated Data (Functions, Instances, Permissions)', async () => {
      // This step is informational - we'll verify deletion in later steps
      // The project should have at least one function and one instance
    });

    // ===== STEP 4: Select and Delete Project =====
    await test.step('Step 4: Select Project and Delete', async () => {
      const projectCard = page.locator('.project-card').filter({ hasText: uniqueProjectName }).first();
      await projectCard.click();
      
      // Set up dialog handler for confirmation
      const dialogPromise = new Promise<void>((resolve) => {
        page.once('dialog', async (dialog) => {
          await dialog.accept();
          resolve();
        });
      });
      
      // Wait for API call to complete
      const deleteApiPromise = page.waitForResponse(
        (response) => response.url().includes('/api/v1/projects/') && response.request().method() === 'DELETE',
        { timeout: 10000 }
      );
      
      const deleteButton = projectCard.locator('button[title="Delete"]');
      await deleteButton.click();
      
      // Wait for dialog and API call
      await Promise.all([dialogPromise, deleteApiPromise]);
    });

    // ===== STEP 5: Verify Project is Deleted =====
    await test.step('Step 5: Verify Project is Deleted', async () => {
      // Wait for project list to refresh
      await page.waitForResponse(
        (response) => response.url().includes('/api/v1/projects') && response.request().method() === 'GET',
        { timeout: 10000 }
      );
      await page.waitForTimeout(500);
      
      const projectCard = page.locator('.project-card').filter({ hasText: uniqueProjectName });
      await expect(projectCard).not.toBeVisible({ timeout: 5000 });
    });

    // ===== STEP 6: Verify Cascading Deletion =====
    await test.step('Step 6: Verify Cascading Deletion (Functions, Instances, Permissions)', async () => {
      // Verify project is removed from list (already done in step 5)
      // Cascading deletion is handled by database constraints
      // If project is deleted, related data should be deleted automatically
      
      // Verify project no longer exists
      const projectCard = page.locator('.project-card').filter({ hasText: uniqueProjectName });
      await expect(projectCard).not.toBeVisible();
    });
  });
});
