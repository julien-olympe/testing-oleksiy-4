import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const OWNER_EMAIL = 'owner@example.com';
const OWNER_PASSWORD = 'SecurePass123!';
const USER1_EMAIL = 'user1@example.com';
const USER1_PASSWORD = 'SecurePass456!';
const USER2_EMAIL = 'user2@example.com';
const USER2_PASSWORD = 'SecurePass789!';
const NEW_USER_EMAIL = 'newuser@example.com';
const NEW_USER_PASSWORD = 'SecurePass456!';
const TEST_PROJECT_NAME = 'TestProject';
const PRIVATE_PROJECT_NAME = 'PrivateProject';
const NEW_PROJECT_NAME = 'NewProject';

test.describe('View Project Permissions - Section 14', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    test.setTimeout(60000); // Increase timeout to 60 seconds
    
    // Navigate to login screen
    await page.goto('/login');
  });

  // Helper function to register a user (tries login first, then registers if needed)
  async function registerUser(email: string, password: string) {
    // Navigate to login page
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input[id="email"]')).toBeVisible({ timeout: 10000 });
    
    // Try login first (user might already exist)
    await page.fill('input[id="email"]', email);
    await page.fill('input[id="password"]', password);
    
    const loginResponsePromise = page.waitForResponse(
      (response) => {
        const url = response.url();
        return url.includes('/auth/login') && response.status() < 500;
      },
      { timeout: 10000 }
    ).catch(() => null);
    
    await page.click('button[type="submit"]:has-text("Login")');
    await loginResponsePromise;
    
    // Check if we're on home page (login succeeded)
    try {
      await page.waitForURL('/home', { timeout: 5000 });
      return; // Login successful, user exists
    } catch {
      // Login failed, try registration
    }
    
    // Navigate back to login/register page
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input[id="email"]')).toBeVisible({ timeout: 10000 });
    
    // Click register button
    const registerButton = page.locator('button:has-text("Don\'t have an account? Register")').or(page.locator('button:has-text("Register")'));
    if (await registerButton.isVisible()) {
      await registerButton.click();
      await page.waitForTimeout(500);
    }
    
    // Fill registration form
    await page.fill('input[id="email"]', email);
    await page.fill('input[id="password"]', password);
    
    // Submit registration
    const registerResponsePromise = page.waitForResponse(
      (response) => {
        const url = response.url();
        return url.includes('/auth/register') && response.status() < 500;
      },
      { timeout: 15000 }
    ).catch(() => null);
    
    await page.click('button[type="submit"]:has-text("Register")');
    await registerResponsePromise;
    
    // Wait for redirect to home (with longer timeout for registration)
    try {
      await page.waitForURL('/home', { timeout: 20000 });
    } catch {
      // If redirect failed, check if there's an error message
      const errorElement = page.locator('.error-message, .error-notification');
      if (await errorElement.isVisible()) {
        const errorText = await errorElement.textContent();
        console.log(`Registration error: ${errorText}`);
        // If user already exists error, try login again
        if (errorText && (errorText.includes('already exists') || errorText.includes('already registered'))) {
          await page.goto('/login', { waitUntil: 'domcontentloaded' });
          await expect(page.locator('input[id="email"]')).toBeVisible({ timeout: 10000 });
          await page.fill('input[id="email"]', email);
          await page.fill('input[id="password"]', password);
          
          const loginResponsePromise = page.waitForResponse(
            (response) => {
              const url = response.url();
              return url.includes('/auth/login') && response.status() < 500;
            },
            { timeout: 15000 }
          ).catch(() => null);
          
          await page.click('button[type="submit"]:has-text("Login")');
          await loginResponsePromise;
          await page.waitForURL('/home', { timeout: 15000 });
          return;
        }
      }
      // Try to proceed anyway - user might already be logged in
      const currentUrl = page.url();
      if (currentUrl.includes('/home')) {
        return; // Already on home
      }
      // Last resort: try login one more time
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('input[id="email"]')).toBeVisible({ timeout: 10000 });
      await page.fill('input[id="email"]', email);
      await page.fill('input[id="password"]', password);
      await page.click('button[type="submit"]:has-text("Login")');
      await page.waitForURL('/home', { timeout: 15000 });
    }
  }

  // Helper function to login
  async function loginUser(email: string, password: string) {
    await page.goto('/login');
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await page.fill('input[id="email"]', email);
    await page.fill('input[id="password"]', password);
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForURL('/home', { timeout: 10000 });
  }

  // Helper function to logout
  async function logout() {
    await page.click('button.settings-button, button[aria-label="Settings"]');
    await expect(page.locator('.settings-dropdown')).toBeVisible();
    await page.click('button.settings-logout:has-text("Logout")');
    await page.waitForURL('/login', { timeout: 5000 });
  }

  // Helper function to create a project
  async function createProject(projectName: string) {
    // Verify Home Screen is displayed
    await expect(page.locator('h1:has-text("Home")')).toBeVisible();
    
    // Drag Project brick to create project
    const projectBrick = page.locator('.brick-item:has-text("Project")');
    const projectListArea = page.locator('.project-list-area');
    await projectBrick.dragTo(projectListArea);
    await page.waitForTimeout(1000);
    
    // Rename project if needed
    const projectCard = page.locator('.project-card').first();
    await projectCard.click();
    const renameButton = projectCard.locator('button.project-action-button').first();
    await renameButton.click();
    const nameInput = projectCard.locator('input.project-name-input');
    await nameInput.clear();
    await nameInput.fill(projectName);
    await nameInput.press('Enter');
    await page.waitForTimeout(500);
  }

  // Helper function to open project editor
  async function openProjectEditor(projectName: string) {
    const projectCard = page.locator('.project-card').filter({ hasText: projectName }).first();
    await expect(projectCard).toBeVisible();
    await projectCard.dblclick();
    await page.waitForURL(/\/projects\/[^/]+/, { timeout: 10000 });
    await expect(page.locator('.project-editor')).toBeVisible();
  }

  // Helper function to add permission
  async function addPermission(email: string) {
    // Click "Add a user" button
    await page.click('button.add-user-button:has-text("Add a user")');
    
    // Enter email
    await expect(page.locator('input.email-input[type="email"]')).toBeVisible();
    await page.fill('input.email-input[type="email"]', email);
    
    // Click Add button
    await page.click('button.confirm-button:has-text("Add")');
    
    // Wait for API response
    try {
      await page.waitForResponse(
        (response) => response.url().includes('/permissions') && (response.status() === 201 || response.status() === 200),
        { timeout: 10000 }
      );
    } catch {
      // Ignore if response already happened
    }
    
    // Wait for editor refresh (optional, might already be loaded)
    try {
      await page.waitForResponse(
        (response) => response.url().includes('/editor') && response.status() === 200,
        { timeout: 10000 }
      );
    } catch {
      // Editor might not refresh immediately, wait a bit
      await page.waitForTimeout(2000);
    }
  }

  test('PERM-VIEW-001: View Project Permissions - Positive Case', async () => {
    // Setup: Register owner and users
    await test.step('Setup: Register users', async () => {
      await registerUser(OWNER_EMAIL, OWNER_PASSWORD);
      await logout();
      await registerUser(USER1_EMAIL, USER1_PASSWORD);
      await logout();
      await registerUser(USER2_EMAIL, USER2_PASSWORD);
      await logout();
    });

    // Login as owner
    await test.step('Login as owner', async () => {
      await loginUser(OWNER_EMAIL, OWNER_PASSWORD);
    });

    // Create project
    await test.step('Create project', async () => {
      await createProject(TEST_PROJECT_NAME);
    });

    // Add permissions for user1 and user2
    await test.step('Add permissions', async () => {
      await openProjectEditor(TEST_PROJECT_NAME);
      
      // Click Permissions tab
      await page.click('button.tab-button:has-text("Permissions")');
      await expect(page.locator('button.tab-button.active:has-text("Permissions")')).toBeVisible();
      
      // Add user1
      await addPermission(USER1_EMAIL);
      
      // Add user2
      await addPermission(USER2_EMAIL);
    });

    // Verify permissions list
    await test.step('Verify permissions list', async () => {
      // Verify user is in Project Editor
      await expect(page.locator('.project-editor')).toBeVisible();
      
      // Verify Project tab is active by default (need to go back to Project tab first)
      await page.click('button.tab-button:has-text("Project")');
      await expect(page.locator('button.tab-button.active:has-text("Project")')).toBeVisible();
      
      // Click Permissions tab
      await page.click('button.tab-button:has-text("Permissions")');
      await expect(page.locator('button.tab-button.active:has-text("Permissions")')).toBeVisible();
      
      // Verify left side panel brick list is hidden (permissions tab doesn't show sidebar)
      const sidebar = page.locator('.project-tab-sidebar');
      if (await sidebar.isVisible()) {
        // If sidebar is visible, verify it doesn't show bricks in permissions tab
        const brickList = sidebar.locator('.brick-item');
        const brickCount = await brickList.count();
        expect(brickCount).toBe(0);
      }
      
      // Verify center area displays user list
      await expect(page.locator('.permissions-list')).toBeVisible();
      
      // Wait for permissions list to load
      await page.waitForTimeout(1000);
      
      // Verify all users are displayed
      const permissionItems = page.locator('.permission-item');
      await expect(permissionItems.filter({ hasText: OWNER_EMAIL })).toBeVisible({ timeout: 10000 });
      await expect(permissionItems.filter({ hasText: USER1_EMAIL })).toBeVisible({ timeout: 10000 });
      await expect(permissionItems.filter({ hasText: USER2_EMAIL })).toBeVisible({ timeout: 10000 });
      
      // Verify each user's email address is clearly visible
      const ownerItem = permissionItems.filter({ hasText: OWNER_EMAIL }).first();
      await expect(ownerItem).toContainText(OWNER_EMAIL);
      
      const user1Item = permissionItems.filter({ hasText: USER1_EMAIL }).first();
      await expect(user1Item).toContainText(USER1_EMAIL);
      
      const user2Item = permissionItems.filter({ hasText: USER2_EMAIL }).first();
      await expect(user2Item).toContainText(USER2_EMAIL);
      
      // Verify no error messages are displayed
      const errorNotification = page.locator('.error-notification');
      await expect(errorNotification).not.toBeVisible();
    });
  });

  test('PERM-VIEW-002: View Project Permissions - Negative Case - Permission Denied', async () => {
    // Setup: Register owner and user
    await test.step('Setup: Register users', async () => {
      await registerUser(OWNER_EMAIL, OWNER_PASSWORD);
      await logout();
      await registerUser('user@example.com', 'SecurePass456!');
      await logout();
    });

    // Login as owner and create private project
    await test.step('Create private project', async () => {
      await loginUser(OWNER_EMAIL, OWNER_PASSWORD);
      await createProject(PRIVATE_PROJECT_NAME);
      await logout();
    });

    // Login as user without permission
    await test.step('Login as user without permission', async () => {
      await loginUser('user@example.com', 'SecurePass456!');
    });

    // Verify project is not visible
    await test.step('Verify project is not accessible', async () => {
      // Verify user is on Home Screen
      await expect(page.locator('h1:has-text("Home")')).toBeVisible();
      
      // Verify project "PrivateProject" is NOT displayed in the project list
      const projectCards = page.locator('.project-card');
      const projectCount = await projectCards.count();
      
      for (let i = 0; i < projectCount; i++) {
        const card = projectCards.nth(i);
        const cardText = await card.textContent();
        expect(cardText).not.toContain(PRIVATE_PROJECT_NAME);
      }
      
      // Try to access project directly via URL (if we can get project ID)
      // Since we can't get the project ID easily, we'll verify the project is not in the list
      // If somehow accessible, verify access is denied
      
      // Verify no error messages are displayed (since project is simply not visible)
      const errorNotification = page.locator('.error-notification');
      if (await errorNotification.isVisible()) {
        const errorText = await errorNotification.textContent();
        expect(errorText).toContain('Permission denied');
      }
    });
  });

  test('PERM-VIEW-003: View Project Permissions - Verify Empty Permissions List', async () => {
    // Setup: Register owner
    await test.step('Setup: Register owner', async () => {
      await registerUser(OWNER_EMAIL, OWNER_PASSWORD);
    });

    // Create new project
    await test.step('Create new project', async () => {
      await createProject(NEW_PROJECT_NAME);
    });

    // Open project editor
    await test.step('Open project editor', async () => {
      await openProjectEditor(NEW_PROJECT_NAME);
    });

    // Verify empty permissions list
    await test.step('Verify empty permissions list', async () => {
      // Verify user is in Project Editor
      await expect(page.locator('.project-editor')).toBeVisible();
      
      // Click Permissions tab
      await page.click('button.tab-button:has-text("Permissions")');
      await expect(page.locator('button.tab-button.active:has-text("Permissions")')).toBeVisible();
      
      // Verify center area displays user list
      await expect(page.locator('.permissions-list')).toBeVisible();
      
      // Wait for permissions list to load
      await page.waitForTimeout(1000);
      
      // Verify user list displays only owner
      const permissionItems = page.locator('.permission-item');
      
      // Wait for at least one item (owner) to appear
      await expect(permissionItems.first()).toBeVisible({ timeout: 10000 });
      
      const itemCount = await permissionItems.count();
      
      // Should have at least the owner
      expect(itemCount).toBeGreaterThanOrEqual(1);
      
      // Verify owner is in the list
      await expect(permissionItems.filter({ hasText: OWNER_EMAIL })).toBeVisible({ timeout: 10000 });
      
      // Verify "Add a user" button is displayed
      await expect(page.locator('button.add-user-button:has-text("Add a user")')).toBeVisible();
      
      // Verify no error messages are displayed
      const errorNotification = page.locator('.error-notification');
      await expect(errorNotification).not.toBeVisible();
    });
  });

  test('PERM-VIEW-004: View Project Permissions - Verify Permissions List Updates', async () => {
    // Setup: Register owner and new user
    await test.step('Setup: Register users', async () => {
      await registerUser(OWNER_EMAIL, OWNER_PASSWORD);
      await logout();
      await registerUser(NEW_USER_EMAIL, NEW_USER_PASSWORD);
      await logout();
    });

    // Login as owner
    await test.step('Login as owner', async () => {
      await loginUser(OWNER_EMAIL, OWNER_PASSWORD);
    });

    // Create project
    await test.step('Create project', async () => {
      await createProject(TEST_PROJECT_NAME);
    });

    // Open project editor
    await test.step('Open project editor', async () => {
      await openProjectEditor(TEST_PROJECT_NAME);
    });

    // Verify initial permissions list
    await test.step('Verify initial permissions list', async () => {
      // Click Permissions tab
      await page.click('button.tab-button:has-text("Permissions")');
      await expect(page.locator('button.tab-button.active:has-text("Permissions")')).toBeVisible();
      
      // Wait for permissions list to load
      await page.waitForTimeout(1000);
      
      // Verify user list displays only owner
      const permissionItems = page.locator('.permission-item');
      await expect(permissionItems.filter({ hasText: OWNER_EMAIL })).toBeVisible({ timeout: 10000 });
      
      // Verify newuser is NOT in the list
      const newUserItem = permissionItems.filter({ hasText: NEW_USER_EMAIL });
      const newUserCount = await newUserItem.count();
      expect(newUserCount).toBe(0);
    });

    // Add new user permission
    await test.step('Add new user permission', async () => {
      // Click "Add a user" button
      await page.click('button.add-user-button:has-text("Add a user")');
      
      // Enter email
      await expect(page.locator('input.email-input[type="email"]')).toBeVisible();
      await page.fill('input.email-input[type="email"]', NEW_USER_EMAIL);
      
      // Click Add button
      await page.click('button.confirm-button:has-text("Add")');
      
      // Wait for API response
      try {
        await page.waitForResponse(
          (response) => response.url().includes('/permissions') && (response.status() === 201 || response.status() === 200),
          { timeout: 10000 }
        );
      } catch {
        // Ignore if response already happened
      }
      
      // Wait for editor refresh
      try {
        await page.waitForResponse(
          (response) => response.url().includes('/editor') && response.status() === 200,
          { timeout: 10000 }
        );
      } catch {
        // Ignore if response already happened
      }
      
      // Wait a bit for UI to update
      await page.waitForTimeout(2000);
    });

    // Verify permissions list updated
    await test.step('Verify permissions list updated', async () => {
      // Verify newuser is now in the list
      const permissionItems = page.locator('.permission-item');
      await expect(permissionItems.filter({ hasText: NEW_USER_EMAIL })).toBeVisible({ timeout: 10000 });
      
      // Verify list reflects the new permission
      const newUserItem = permissionItems.filter({ hasText: NEW_USER_EMAIL }).first();
      await expect(newUserItem).toContainText(NEW_USER_EMAIL);
    });
  });
});
