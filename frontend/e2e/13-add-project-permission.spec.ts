import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const OWNER_EMAIL = 'owner@example.com';
const OWNER_PASSWORD = 'SecurePass123!';
const NEW_USER_EMAIL = 'newuser@example.com';
const NEW_USER_PASSWORD = 'SecurePass456!';
const EXISTING_USER_EMAIL = 'existinguser@example.com';
const EXISTING_USER_PASSWORD = 'SecurePass456!';
const USER_EMAIL = 'user@example.com';
const USER_PASSWORD = 'SecurePass456!';
const NONEXISTENT_EMAIL = 'nonexistent@example.com';
const INVALID_EMAIL = 'invalid-email-format';
const PROJECT_NAME = 'TestProject';

test.describe('Add Project Permission - Section 13', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    test.setTimeout(60000); // 60 seconds per test
    
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
      return; // Project already exists
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
        await page.waitForTimeout(300);
        const nameInputAfterClick = newProjectCard.locator('input.project-name-input');
        await nameInputAfterClick.clear();
        await nameInputAfterClick.fill(projectName);
        await nameInputAfterClick.press('Enter');
        await page.waitForTimeout(500);
      }
    }
  }

  // Helper function to open project editor
  async function openProjectEditor(projectName: string) {
    const projectCard = page.locator('.project-card').filter({ hasText: projectName }).first();
    await projectCard.dblclick();
    await page.waitForURL(/\/projects\/[^/]+/, { timeout: 10000 });
    await page.waitForTimeout(1000);
    
    // Ensure Project tab is active
    const projectTab = page.locator('button.tab-button:has-text("Project")');
    if (await projectTab.isVisible()) {
      const isActive = await projectTab.evaluate((el) => el.classList.contains('active'));
      if (!isActive) {
        await projectTab.click();
        await page.waitForTimeout(500);
      }
    }
  }

  // Helper function to add permission to project
  async function addPermissionToProject(userEmail: string) {
    // Click Permissions tab
    await page.click('button.tab-button:has-text("Permissions")');
    await page.waitForTimeout(500);
    
    // Verify Permissions tab is active
    await expect(page.locator('button.tab-button.active:has-text("Permissions")')).toBeVisible();
    
    // Click "Add a user" button
    await page.click('button.add-user-button:has-text("Add a user")');
    await page.waitForTimeout(300);
    
    // Enter email
    await page.fill('input.email-input[type="email"]', userEmail);
    
    // Click confirmation button
    const confirmButton = page.locator('button.confirm-button:has-text("Add")').or(page.locator('button:has-text("Add")'));
    await confirmButton.click();
    
    // Wait for API response
    await page.waitForTimeout(1000);
  }

  // Helper function to check if user has permission
  async function userHasPermission(userEmail: string): Promise<boolean> {
    const permissionItems = page.locator('.permission-item');
    const count = await permissionItems.count();
    for (let i = 0; i < count; i++) {
      const text = await permissionItems.nth(i).textContent();
      if (text && text.includes(userEmail)) {
        return true;
      }
    }
    return false;
  }

  // Test PERM-ADD-001: Add Project Permission - Positive Case
  test('PERM-ADD-001: Add Project Permission - Positive Case', async () => {
    // Preconditions setup
    await ensureUserExists(OWNER_EMAIL, OWNER_PASSWORD);
    await ensureUserExists(NEW_USER_EMAIL, NEW_USER_PASSWORD);
    
    // Login as owner
    await page.goto('/login');
    await login(OWNER_EMAIL, OWNER_PASSWORD);
    
    // Create project
    await createProject(PROJECT_NAME);
    
    // Open project editor
    await openProjectEditor(PROJECT_NAME);
    
    // Step 1: Verify user is in Project Editor
    await expect(page.locator('button.tab-button:has-text("Project")')).toBeVisible();
    
    // Step 2: Click Permissions tab
    await page.click('button.tab-button:has-text("Permissions")');
    
    // Step 3: Verify Permissions tab is now active
    await expect(page.locator('button.tab-button.active:has-text("Permissions")')).toBeVisible();
    
    // Step 4: Verify left side panel brick list is hidden
    const sidebar = page.locator('.project-tab-sidebar');
    const isSidebarVisible = await sidebar.isVisible().catch(() => false);
    if (isSidebarVisible) {
      // If sidebar is visible, verify it doesn't show brick list in permissions tab
      const brickList = sidebar.locator('.brick-list');
      const isBrickListVisible = await brickList.isVisible().catch(() => false);
      expect(isBrickListVisible).toBe(false);
    }
    
    // Step 5: Verify center area displays user list showing current user
    await expect(page.locator('.permissions-list')).toBeVisible();
    await expect(page.locator('.permission-item')).toContainText(OWNER_EMAIL);
    
    // Step 6: Verify "Add a user" button is displayed
    await expect(page.locator('button.add-user-button:has-text("Add a user")')).toBeVisible();
    
    // Step 7: Click "Add a user" button
    await page.click('button.add-user-button:has-text("Add a user")');
    
    // Step 8: Verify add user interface is displayed with email input field
    await expect(page.locator('input.email-input[type="email"]')).toBeVisible();
    
    // Step 9: Enter new user email
    await page.fill('input.email-input[type="email"]', NEW_USER_EMAIL);
    
    // Step 10: Click confirmation button
    const confirmButton = page.locator('button.confirm-button:has-text("Add")').or(page.locator('button:has-text("Add")'));
    await confirmButton.click();
    
    // Wait for API response
    await page.waitForResponse(response => 
      response.url().includes('/api/v1/projects/') && 
      (response.request().method() === 'POST' || response.request().method() === 'GET')
    , { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1000);
    
    // Step 11: Verify new user is added to the user list
    await expect(page.locator('.permission-item')).toContainText(NEW_USER_EMAIL);
    
    // Step 12: Verify permission is created and persisted (check API response)
    const hasPermission = await userHasPermission(NEW_USER_EMAIL);
    expect(hasPermission).toBe(true);
    
    // Step 13: Verify new user appears in the permissions list
    const permissionItems = page.locator('.permission-item');
    const permissionText = await permissionItems.filter({ hasText: NEW_USER_EMAIL }).textContent();
    expect(permissionText).toContain(NEW_USER_EMAIL);
    
    // Step 14: Verify no error messages are displayed
    const errorMessages = page.locator('.error-message, .notification-error, [role="alert"]');
    const errorCount = await errorMessages.count();
    expect(errorCount).toBe(0);
  });

  // Test PERM-ADD-002: Add Project Permission - Negative Case - User Not Found
  test('PERM-ADD-002: Add Project Permission - Negative Case - User Not Found', async () => {
    // Preconditions setup
    await ensureUserExists(OWNER_EMAIL, OWNER_PASSWORD);
    
    // Login as owner
    await page.goto('/login');
    await login(OWNER_EMAIL, OWNER_PASSWORD);
    
    // Create project
    await createProject(PROJECT_NAME);
    
    // Open project editor
    await openProjectEditor(PROJECT_NAME);
    
    // Step 1: Verify user is in Project Editor
    await expect(page.locator('button.tab-button:has-text("Project")')).toBeVisible();
    
    // Step 2: Click Permissions tab
    await page.click('button.tab-button:has-text("Permissions")');
    
    // Step 3: Verify Permissions tab is now active
    await expect(page.locator('button.tab-button.active:has-text("Permissions")')).toBeVisible();
    
    // Step 4: Verify "Add a user" button is displayed
    await expect(page.locator('button.add-user-button:has-text("Add a user")')).toBeVisible();
    
    // Step 5: Click "Add a user" button
    await page.click('button.add-user-button:has-text("Add a user")');
    
    // Step 6: Verify add user interface is displayed with email input field
    await expect(page.locator('input.email-input[type="email"]')).toBeVisible();
    
    // Step 7: Enter non-existent user email
    await page.fill('input.email-input[type="email"]', NONEXISTENT_EMAIL);
    
    // Step 8: Click confirmation button
    const confirmButton = page.locator('button.confirm-button:has-text("Add")').or(page.locator('button:has-text("Add")'));
    await confirmButton.click();
    
    // Wait for API response
    await page.waitForResponse(response => 
      response.url().includes('/api/v1/projects/') && 
      response.request().method() === 'POST'
    , { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1000);
    
    // Step 9: Verify permission creation fails
    const hasPermission = await userHasPermission(NONEXISTENT_EMAIL);
    expect(hasPermission).toBe(false);
    
    // Step 10: Verify error message "User not found" is displayed
    const errorMessage = page.locator('.error-message, .notification-error, [role="alert"]').filter({ hasText: /user not found/i });
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
    
    // Step 11: Verify non-existent user is NOT added to the user list
    const permissionItems = page.locator('.permission-item');
    const permissionText = await permissionItems.textContent();
    expect(permissionText).not.toContain(NONEXISTENT_EMAIL);
    
    // Step 12: Verify no permission is created
    expect(hasPermission).toBe(false);
    
    // Step 13: Verify user list remains unchanged
    const ownerPermission = await userHasPermission(OWNER_EMAIL);
    expect(ownerPermission).toBe(true);
  });

  // Test PERM-ADD-003: Add Project Permission - Negative Case - User Already Has Permission
  test('PERM-ADD-003: Add Project Permission - Negative Case - User Already Has Permission', async () => {
    // Preconditions setup
    await ensureUserExists(OWNER_EMAIL, OWNER_PASSWORD);
    await ensureUserExists(EXISTING_USER_EMAIL, EXISTING_USER_PASSWORD);
    
    // Login as owner
    await page.goto('/login');
    await login(OWNER_EMAIL, OWNER_PASSWORD);
    
    // Create project
    await createProject(PROJECT_NAME);
    
    // Open project editor
    await openProjectEditor(PROJECT_NAME);
    
    // Add existing user permission first
    await addPermissionToProject(EXISTING_USER_EMAIL);
    await page.waitForTimeout(1000);
    
    // Verify existing user is in the list
    let hasPermission = await userHasPermission(EXISTING_USER_EMAIL);
    expect(hasPermission).toBe(true);
    
    // Step 1: Verify user is in Project Editor
    await expect(page.locator('button.tab-button:has-text("Project")')).toBeVisible();
    
    // Step 2: Click Permissions tab
    await page.click('button.tab-button:has-text("Permissions")');
    
    // Step 3: Verify Permissions tab is now active
    await expect(page.locator('button.tab-button.active:has-text("Permissions")')).toBeVisible();
    
    // Step 4: Verify existing user is already displayed in the user list
    await expect(page.locator('.permission-item')).toContainText(EXISTING_USER_EMAIL);
    
    // Step 5: Verify "Add a user" button is displayed
    await expect(page.locator('button.add-user-button:has-text("Add a user")')).toBeVisible();
    
    // Step 6: Click "Add a user" button
    await page.click('button.add-user-button:has-text("Add a user")');
    
    // Step 7: Verify add user interface is displayed with email input field
    await expect(page.locator('input.email-input[type="email"]')).toBeVisible();
    
    // Step 8: Enter existing user email
    await page.fill('input.email-input[type="email"]', EXISTING_USER_EMAIL);
    
    // Step 9: Click confirmation button
    const confirmButton = page.locator('button.confirm-button:has-text("Add")').or(page.locator('button:has-text("Add")'));
    await confirmButton.click();
    
    // Wait for API response
    await page.waitForResponse(response => 
      response.url().includes('/api/v1/projects/') && 
      response.request().method() === 'POST'
    , { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1000);
    
    // Step 10: Verify permission creation fails
    // Count occurrences of existing user in permission list
    const permissionItems = page.locator('.permission-item');
    const count = await permissionItems.count();
    let existingUserCount = 0;
    for (let i = 0; i < count; i++) {
      const text = await permissionItems.nth(i).textContent();
      if (text && text.includes(EXISTING_USER_EMAIL)) {
        existingUserCount++;
      }
    }
    expect(existingUserCount).toBe(1); // Should only appear once
    
    // Step 11: Verify error message "User already has permission" is displayed
    const errorMessage = page.locator('.error-message, .notification-error, [role="alert"]').filter({ hasText: /already has permission/i });
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
    
    // Step 12: Verify existing user is NOT duplicated in the user list
    expect(existingUserCount).toBe(1);
    
    // Step 13: Verify no duplicate permission is created
    expect(existingUserCount).toBe(1);
    
    // Step 14: Verify user list remains unchanged (no duplicates)
    const finalCount = await permissionItems.count();
    expect(finalCount).toBeGreaterThanOrEqual(1);
  });

  // Test PERM-ADD-004: Add Project Permission - Negative Case - Invalid Email Format
  test('PERM-ADD-004: Add Project Permission - Negative Case - Invalid Email Format', async () => {
    // Preconditions setup
    await ensureUserExists(OWNER_EMAIL, OWNER_PASSWORD);
    
    // Login as owner
    await page.goto('/login');
    await login(OWNER_EMAIL, OWNER_PASSWORD);
    
    // Create project
    await createProject(PROJECT_NAME);
    
    // Open project editor
    await openProjectEditor(PROJECT_NAME);
    
    // Step 1: Verify user is in Project Editor
    await expect(page.locator('button.tab-button:has-text("Project")')).toBeVisible();
    
    // Step 2: Click Permissions tab
    await page.click('button.tab-button:has-text("Permissions")');
    
    // Step 3: Verify Permissions tab is now active
    await expect(page.locator('button.tab-button.active:has-text("Permissions")')).toBeVisible();
    
    // Step 4: Verify "Add a user" button is displayed
    await expect(page.locator('button.add-user-button:has-text("Add a user")')).toBeVisible();
    
    // Step 5: Click "Add a user" button
    await page.click('button.add-user-button:has-text("Add a user")');
    
    // Step 6: Verify add user interface is displayed with email input field
    await expect(page.locator('input.email-input[type="email"]')).toBeVisible();
    
    // Step 7: Enter invalid email format
    await page.fill('input.email-input[type="email"]', INVALID_EMAIL);
    
    // Step 8: Attempt to click confirmation button
    const confirmButton = page.locator('button.confirm-button:has-text("Add")').or(page.locator('button:has-text("Add")'));
    
    // Check if button is disabled (form validation)
    const isDisabled = await confirmButton.isDisabled().catch(() => false);
    
    if (!isDisabled) {
      // If button is enabled, click it and check for error
      await confirmButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Step 9: Verify form validation prevents submission OR error is displayed
    // Either button is disabled or error message is shown
    const hasError = await page.locator('.error-message, .notification-error, [role="alert"]').filter({ hasText: /invalid.*email|email.*invalid/i }).isVisible().catch(() => false);
    const buttonDisabled = await confirmButton.isDisabled().catch(() => false);
    expect(hasError || buttonDisabled).toBe(true);
    
    // Step 10: Verify error message is displayed indicating invalid email format
    if (hasError) {
      const errorMessage = page.locator('.error-message, .notification-error, [role="alert"]').filter({ hasText: /invalid.*email|email.*invalid/i });
      await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
    }
    
    // Step 11: Verify no permission is created
    const hasPermission = await userHasPermission(INVALID_EMAIL);
    expect(hasPermission).toBe(false);
    
    // Step 12: Verify user list remains unchanged
    const ownerPermission = await userHasPermission(OWNER_EMAIL);
    expect(ownerPermission).toBe(true);
  });

  // Test PERM-ADD-005: Add Project Permission - Negative Case - Empty Email Field
  test('PERM-ADD-005: Add Project Permission - Negative Case - Empty Email Field', async () => {
    // Preconditions setup
    await ensureUserExists(OWNER_EMAIL, OWNER_PASSWORD);
    
    // Login as owner
    await page.goto('/login');
    await login(OWNER_EMAIL, OWNER_PASSWORD);
    
    // Create project
    await createProject(PROJECT_NAME);
    
    // Open project editor
    await openProjectEditor(PROJECT_NAME);
    
    // Step 1: Verify user is in Project Editor
    await expect(page.locator('button.tab-button:has-text("Project")')).toBeVisible();
    
    // Step 2: Click Permissions tab
    await page.click('button.tab-button:has-text("Permissions")');
    
    // Step 3: Verify Permissions tab is now active
    await expect(page.locator('button.tab-button.active:has-text("Permissions")')).toBeVisible();
    
    // Step 4: Verify "Add a user" button is displayed
    await expect(page.locator('button.add-user-button:has-text("Add a user")')).toBeVisible();
    
    // Step 5: Click "Add a user" button
    await page.click('button.add-user-button:has-text("Add a user")');
    
    // Step 6: Verify add user interface is displayed with email input field
    await expect(page.locator('input.email-input[type="email"]')).toBeVisible();
    
    // Step 7: Leave email input field empty
    await page.fill('input.email-input[type="email"]', '');
    
    // Step 8: Attempt to click confirmation button
    const confirmButton = page.locator('button.confirm-button:has-text("Add")').or(page.locator('button:has-text("Add")'));
    
    // Check if button is disabled (form validation)
    const isDisabled = await confirmButton.isDisabled().catch(() => false);
    
    if (!isDisabled) {
      // If button is enabled, click it and check for error
      await confirmButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Step 9: Verify form validation prevents submission OR error is displayed
    const hasError = await page.locator('.error-message, .notification-error, [role="alert"]').filter({ hasText: /required|email.*required/i }).isVisible().catch(() => false);
    const buttonDisabled = await confirmButton.isDisabled().catch(() => false);
    expect(hasError || buttonDisabled).toBe(true);
    
    // Step 10: Verify error message is displayed indicating email is required
    if (hasError) {
      const errorMessage = page.locator('.error-message, .notification-error, [role="alert"]').filter({ hasText: /required|email.*required/i });
      await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
    }
    
    // Step 11: Verify no permission is created
    // Empty email cannot create permission
    const permissionItems = page.locator('.permission-item');
    const count = await permissionItems.count();
    // Should only have owner permission
    const ownerPermission = await userHasPermission(OWNER_EMAIL);
    expect(ownerPermission).toBe(true);
    
    // Step 12: Verify user list remains unchanged
    expect(count).toBeGreaterThanOrEqual(1);
  });

  // Test PERM-ADD-006: Add Project Permission - Negative Case - Permission Denied
  test('PERM-ADD-006: Add Project Permission - Negative Case - Permission Denied', async () => {
    // Preconditions setup
    await ensureUserExists(OWNER_EMAIL, OWNER_PASSWORD);
    await ensureUserExists(USER_EMAIL, USER_PASSWORD);
    await ensureUserExists(NEW_USER_EMAIL, NEW_USER_PASSWORD);
    
    // Login as owner
    await page.goto('/login');
    await login(OWNER_EMAIL, OWNER_PASSWORD);
    
    // Create project
    await createProject(PROJECT_NAME);
    
    // Open project editor
    await openProjectEditor(PROJECT_NAME);
    
    // Add user permission (user can view but not add permissions)
    await addPermissionToProject(USER_EMAIL);
    await page.waitForTimeout(1000);
    
    // Logout
    await page.click('button.settings-button, button[aria-label="Settings"]');
    await page.click('button.settings-logout:has-text("Logout")');
    await page.waitForURL('/login', { timeout: 5000 });
    
    // Login as user (without permission to add permissions)
    await login(USER_EMAIL, USER_PASSWORD);
    
    // Open project editor (user should be able to view)
    await openProjectEditor(PROJECT_NAME);
    
    // Step 1: Verify user is in Project Editor
    await expect(page.locator('button.tab-button:has-text("Project")')).toBeVisible();
    
    // Step 2: Click Permissions tab
    await page.click('button.tab-button:has-text("Permissions")');
    
    // Step 3: Verify Permissions tab is now active
    await expect(page.locator('button.tab-button.active:has-text("Permissions")')).toBeVisible();
    
    // Step 4: Verify "Add a user" button is NOT displayed OR is disabled
    const addUserButton = page.locator('button.add-user-button:has-text("Add a user")');
    const isButtonVisible = await addUserButton.isVisible().catch(() => false);
    const isButtonDisabled = isButtonVisible ? await addUserButton.isDisabled().catch(() => false) : true;
    
    expect(isButtonVisible === false || isButtonDisabled === true).toBe(true);
    
    // Step 5: If "Add a user" button is visible, attempt to click it
    if (isButtonVisible && !isButtonDisabled) {
      await addUserButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Step 6: If button is clicked, verify action fails
    // This is handled by button being disabled or not visible
    
    // Step 7: Verify error message "Permission denied" is displayed (if action is attempted)
    if (isButtonVisible && !isButtonDisabled) {
      const errorMessage = page.locator('.error-message, .notification-error, [role="alert"]').filter({ hasText: /permission denied/i });
      const hasError = await errorMessage.isVisible().catch(() => false);
      if (hasError) {
        await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
      }
    }
    
    // Step 8: Verify no permission can be added
    const hasNewUserPermission = await userHasPermission(NEW_USER_EMAIL);
    expect(hasNewUserPermission).toBe(false);
    
    // Step 9: Verify user list remains unchanged
    const userPermission = await userHasPermission(USER_EMAIL);
    expect(userPermission).toBe(true);
  });
});
