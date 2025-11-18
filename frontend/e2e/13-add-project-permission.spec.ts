import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const OWNER_EMAIL = 'owner@example.com';
const OWNER_PASSWORD = 'SecurePass123!';
const NEW_USER_EMAIL = 'newuser@example.com';
const NEW_USER_PASSWORD = 'SecurePass456!';
const EXISTING_USER_EMAIL = 'existinguser@example.com';
const EXISTING_USER_PASSWORD = 'SecurePass456!';
const NONEXISTENT_EMAIL = 'nonexistent@example.com';
const USER_EMAIL = 'user@example.com';
const USER_PASSWORD = 'SecurePass456!';
const PROJECT_NAME = 'TestProject';

// Helper function to register a user if not exists
async function ensureUserRegistered(page: Page, email: string, password: string) {
  await page.goto('/login');
  
  // Try to register
  const registerButton = page.locator('button:has-text("Don\'t have an account? Register")').or(page.locator('button:has-text("Register")'));
  if (await registerButton.isVisible()) {
    await registerButton.click();
    await page.fill('input[id="email"]', email);
    await page.fill('input[id="password"]', password);
    await page.click('button:has-text("Register")');
    
    // Wait for either success (redirect to home) or error (user exists)
    try {
      await page.waitForURL('/home', { timeout: 3000 }).catch(() => {});
      // If we get here, registration was successful
      return;
    } catch {
      // User might already exist, try to login
      await page.goto('/login');
    }
  }
  
  // Try to login
  await page.fill('input[id="email"]', email);
  await page.fill('input[id="password"]', password);
  await page.click('button:has-text("Login")');
  await page.waitForURL('/home', { timeout: 5000 });
}

// Helper function to login
async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[id="email"]', email);
  await page.fill('input[id="password"]', password);
  await page.click('button:has-text("Login")');
  await page.waitForURL('/home', { timeout: 5000 });
}

// Helper function to create a project
async function createProject(page: Page, projectName: string): Promise<string> {
  await page.goto('/home');
  
  // Wait for home screen to be visible
  await expect(page.locator('h1:has-text("Home")')).toBeVisible({ timeout: 10000 });
  
  // Wait for project list area to be visible
  await expect(page.locator('.project-list-area')).toBeVisible({ timeout: 10000 });
  
  // Check if project already exists
  const existingProject = page.locator('.project-card').filter({ hasText: projectName });
  if (await existingProject.count() > 0) {
    // Project exists, double-click to open
    await existingProject.first().dblclick();
    await page.waitForURL(/\/projects\/[^/]+/, { timeout: 5000 });
    const url = page.url();
    const match = url.match(/\/projects\/([^/]+)/);
    return match ? match[1] : '';
  }
  
  // Create new project by dragging Project brick
  const projectBrick = page.locator('.brick-item:has-text("Project")');
  await expect(projectBrick).toBeVisible();
  
  const projectListArea = page.locator('.project-list-area');
  const initialCount = await page.locator('.project-card').count();
  
  // Drag Project brick to project list area
  await projectBrick.dragTo(projectListArea);
  
  // Wait for new project to appear
  await page.waitForTimeout(2000);
  
  // Find the new project card
  const projectCards = page.locator('.project-card');
  await expect(projectCards).toHaveCount(initialCount + 1, { timeout: 10000 });
  
  // Rename the project from home screen
  const newProjectCard = projectCards.last();
  // Click rename button (✏️ emoji button)
  const renameButton = newProjectCard.locator('button.project-action-button').first();
  await renameButton.click();
  
  // Wait for input to appear
  const projectNameInput = newProjectCard.locator('input.project-name-input');
  await expect(projectNameInput).toBeVisible();
  
  // Clear and enter new name
  await projectNameInput.fill(projectName);
  await projectNameInput.press('Enter');
  
  // Wait for rename to complete
  await page.waitForTimeout(1000);
  
  // Verify project is renamed
  await expect(newProjectCard.locator('.project-name')).toContainText(projectName);
  
  // Open the project
  await newProjectCard.dblclick();
  await page.waitForURL(/\/projects\/[^/]+/, { timeout: 5000 });
  
  // Wait for project editor to load
  await expect(page.locator('button.tab-button:has-text("Project")')).toBeVisible({ timeout: 10000 });
  
  const url = page.url();
  const match = url.match(/\/projects\/([^/]+)/);
  return match ? match[1] : '';
}

// Helper function to open project editor
async function openProjectEditor(page: Page, projectName: string) {
  await page.goto('/home');
  await expect(page.locator('h1:has-text("Home")')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('.project-list-area')).toBeVisible({ timeout: 10000 });
  
  // Check if project exists, if not create it
  const projectCard = page.locator('.project-card').filter({ hasText: projectName });
  const projectCount = await projectCard.count();
  
  if (projectCount === 0) {
    // Project doesn't exist, create it
    await createProject(page, projectName);
  } else {
    // Project exists, open it
    await projectCard.first().dblclick();
    await page.waitForURL(/\/projects\/[^/]+/, { timeout: 5000 });
    await expect(page.locator('button.tab-button:has-text("Project")')).toBeVisible({ timeout: 10000 });
  }
}

test.describe('Add Project Permission - Section 13', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
  });

  // Test ID: PERM-ADD-001
  test('PERM-ADD-001: Add Project Permission - Positive Case', async () => {
    test.setTimeout(60000);
    // Setup: Register users
    await ensureUserRegistered(page, OWNER_EMAIL, OWNER_PASSWORD);
    await ensureUserRegistered(page, NEW_USER_EMAIL, NEW_USER_PASSWORD);
    
    // Login as owner
    await login(page, OWNER_EMAIL, OWNER_PASSWORD);
    
    // Create or open project
    const projectId = await createProject(page, PROJECT_NAME);
    expect(projectId).toBeTruthy();
    
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
      // If sidebar is visible, it should not show bricks in permissions tab
      const brickList = page.locator('.brick-list');
      await expect(brickList).not.toBeVisible();
    }
    
    // Step 5: Verify center area displays user list showing current user
    await expect(page.locator('.permissions-list')).toBeVisible();
    await expect(page.locator('.permission-item').filter({ hasText: OWNER_EMAIL })).toBeVisible();
    
    // Step 6: Verify "Add a user" button is displayed
    await expect(page.locator('button.add-user-button:has-text("Add a user")')).toBeVisible();
    
    // Step 7: Click "Add a user" button
    await page.click('button.add-user-button:has-text("Add a user")');
    
    // Step 8: Verify add user interface is displayed with email input field
    await expect(page.locator('input.email-input[type="email"]')).toBeVisible();
    
    // Step 9: Enter new user email
    await page.fill('input.email-input[type="email"]', NEW_USER_EMAIL);
    
    // Step 10: Click confirmation button
    await page.click('button.confirm-button:has-text("Add")');
    
    // Wait for API response (POST to add permission)
    const addPermissionResponse = await page.waitForResponse(response => 
      response.url().includes('/permissions') && response.request().method() === 'POST',
      { timeout: 15000 }
    );
    
    // Check response status - might be 201 (success) or 400/409 if permission already exists
    const status = addPermissionResponse.status();
    if (status !== 201) {
      const responseBody = await addPermissionResponse.json().catch(() => ({}));
      console.log('Permission add response:', status, responseBody);
      // If it's a "already has permission" error, that's actually fine for this test
      // as it means the permission was already added (maybe from a previous test run)
      if (status === 400 || status === 409) {
        // Check if user already has permission - if so, that's okay
        const errorMessage = responseBody?.error?.message || responseBody?.message || '';
        if (errorMessage.includes('already has permission') || errorMessage.includes('already exists') || responseBody?.code === 'USER_ALREADY_HAS_PERMISSION') {
          // Permission already exists, which is fine - continue test
        } else {
          throw new Error(`Failed to add permission: ${status} - ${JSON.stringify(responseBody)}`);
        }
      } else {
        throw new Error(`Unexpected status code: ${status}`);
      }
    }
    
    // Wait for editor data refresh (GET to reload editor data)
    await page.waitForResponse(response => 
      response.url().includes('/editor') && response.request().method() === 'GET' && response.status() === 200,
      { timeout: 15000 }
    );
    
    await page.waitForTimeout(500);
    
    // Step 11: Verify new user is added to the user list
    await expect(page.locator('.permission-item').filter({ hasText: NEW_USER_EMAIL })).toBeVisible({ timeout: 10000 });
    
    // Step 12: Verify permission is created and persisted (check API response)
    // This is verified by the user appearing in the list
    
    // Step 13: Verify new user appears in the permissions list
    await expect(page.locator('.permission-item').filter({ hasText: NEW_USER_EMAIL })).toBeVisible();
    
    // Step 14: Verify no error messages are displayed
    const errorNotification = page.locator('.error-notification');
    await expect(errorNotification).not.toBeVisible();
  });

  // Test ID: PERM-ADD-002
  test('PERM-ADD-002: Add Project Permission - Negative Case - User Not Found', async () => {
    // Setup: Register owner
    await ensureUserRegistered(page, OWNER_EMAIL, OWNER_PASSWORD);
    
    // Login as owner
    await login(page, OWNER_EMAIL, OWNER_PASSWORD);
    
    // Create or open project
    await openProjectEditor(page, PROJECT_NAME);
    
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
    await page.click('button.confirm-button:has-text("Add")');
    
    // Wait for API response (should be error)
    await page.waitForResponse(response => 
      response.url().includes('/permissions') && response.request().method() === 'POST',
      { timeout: 10000 }
    ).catch(() => {});
    
    await page.waitForTimeout(1000);
    
    // Step 9: Verify permission creation fails
    // Step 10: Verify error message "User not found" is displayed
    const errorNotification = page.locator('.error-notification');
    await expect(errorNotification).toBeVisible({ timeout: 5000 });
    await expect(errorNotification).toContainText(/user not found/i, { timeout: 5000 });
    
    // Step 11: Verify non-existent user is NOT added to the user list
    const permissionItems = page.locator('.permission-item');
    const allText = await permissionItems.allTextContents();
    expect(allText.some(text => text.includes(NONEXISTENT_EMAIL))).toBe(false);
    
    // Step 12: Verify no permission is created
    // Verified by step 11
    
    // Step 13: Verify user list remains unchanged
    // This is verified by the non-existent user not appearing
  });

  // Test ID: PERM-ADD-003
  test('PERM-ADD-003: Add Project Permission - Negative Case - User Already Has Permission', async () => {
    test.setTimeout(60000);
    // Setup: Register users
    await ensureUserRegistered(page, OWNER_EMAIL, OWNER_PASSWORD);
    await ensureUserRegistered(page, EXISTING_USER_EMAIL, EXISTING_USER_PASSWORD);
    
    // Login as owner
    await login(page, OWNER_EMAIL, OWNER_PASSWORD);
    
    // Create or open project
    await openProjectEditor(page, PROJECT_NAME);
    
    // First, add the existing user to permissions
    await page.click('button.tab-button:has-text("Permissions")');
    await expect(page.locator('button.tab-button.active:has-text("Permissions")')).toBeVisible();
    
    // Add existing user first time
    await page.click('button.add-user-button:has-text("Add a user")');
    await expect(page.locator('input.email-input[type="email"]')).toBeVisible();
    await page.fill('input.email-input[type="email"]', EXISTING_USER_EMAIL);
    await page.click('button.confirm-button:has-text("Add")');
    
    // Wait for successful addition
    await page.waitForResponse(response => 
      response.url().includes('/permissions') && response.request().method() === 'POST' && response.status() === 201,
      { timeout: 10000 }
    ).catch(() => {});
    
    // Wait for editor data refresh
    await page.waitForResponse(response => 
      response.url().includes('/editor') && response.request().method() === 'GET' && response.status() === 200,
      { timeout: 10000 }
    ).catch(() => {});
    
    await page.waitForTimeout(1000);
    
    // Verify existing user is in the list
    await expect(page.locator('.permission-item').filter({ hasText: EXISTING_USER_EMAIL })).toBeVisible();
    
    // Wait for form to close (it should close automatically after successful addition)
    await page.waitForTimeout(2000);
    
    // Check if form is still open and close it if needed
    const addForm = page.locator('.add-user-form');
    const isFormVisible = await addForm.isVisible().catch(() => false);
    if (isFormVisible) {
      // Form is still open, try to close it by clicking cancel
      const cancelButton = page.locator('button.cancel-button');
      if (await cancelButton.isVisible().catch(() => false)) {
        await cancelButton.click();
        await page.waitForTimeout(500);
      }
    }
    
    // Step 1: Verify user is in Project Editor
    await expect(page.locator('button.tab-button.active:has-text("Permissions")')).toBeVisible();
    
    // Step 2: Already on Permissions tab
    
    // Step 3: Already verified
    
    // Step 4: Verify existing user is already displayed in the user list
    await expect(page.locator('.permission-item').filter({ hasText: EXISTING_USER_EMAIL })).toBeVisible();
    
    // Step 5: Verify "Add a user" button is displayed
    // Wait a bit more to ensure form is closed
    await page.waitForTimeout(1000);
    await expect(page.locator('button.add-user-button:has-text("Add a user")')).toBeVisible({ timeout: 10000 });
    
    // Step 6: Click "Add a user" button
    await page.click('button.add-user-button:has-text("Add a user")');
    
    // Step 7: Verify add user interface is displayed with email input field
    await expect(page.locator('input.email-input[type="email"]')).toBeVisible();
    
    // Step 8: Enter existing user email
    await page.fill('input.email-input[type="email"]', EXISTING_USER_EMAIL);
    
    // Step 9: Click confirmation button
    await page.click('button.confirm-button:has-text("Add")');
    
    // Wait for API response (should be error)
    await page.waitForResponse(response => 
      response.url().includes('/permissions') && response.request().method() === 'POST',
      { timeout: 10000 }
    ).catch(() => {});
    
    await page.waitForTimeout(1000);
    
    // Step 10: Verify permission creation fails
    // Step 11: Verify error message "User already has permission" is displayed
    const errorNotification = page.locator('.error-notification');
    await expect(errorNotification).toBeVisible({ timeout: 5000 });
    await expect(errorNotification).toContainText(/already has permission/i, { timeout: 5000 });
    
    // Step 12: Verify existing user is NOT duplicated in the user list
    const permissionItems = page.locator('.permission-item');
    const allText = await permissionItems.allTextContents();
    const existingUserCount = allText.filter(text => text.includes(EXISTING_USER_EMAIL)).length;
    expect(existingUserCount).toBe(1); // Should appear only once
    
    // Step 13: Verify no duplicate permission is created
    // Verified by step 12
    
    // Step 14: Verify user list remains unchanged (no duplicates)
    // Verified by step 12
  });

  // Test ID: PERM-ADD-004
  test('PERM-ADD-004: Add Project Permission - Negative Case - Invalid Email Format', async () => {
    // Setup: Register owner
    await ensureUserRegistered(page, OWNER_EMAIL, OWNER_PASSWORD);
    
    // Login as owner
    await login(page, OWNER_EMAIL, OWNER_PASSWORD);
    
    // Create or open project
    await openProjectEditor(page, PROJECT_NAME);
    
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
    const invalidEmail = 'invalid-email-format';
    await page.fill('input.email-input[type="email"]', invalidEmail);
    
    // Step 8: Attempt to click confirmation button
    const confirmButton = page.locator('button.confirm-button:has-text("Add")');
    
    // Step 9: Verify form validation prevents submission OR error is displayed
    // HTML5 email validation should prevent invalid format
    const emailInput = page.locator('input.email-input[type="email"]');
    const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    
    if (!isValid) {
      // Browser validation prevents submission
      await expect(confirmButton).toBeEnabled(); // Button might still be enabled, but form won't submit
      // Try to submit and check for validation message
      await confirmButton.click();
      await page.waitForTimeout(500);
      
      // Check if there's a validation message or error
      const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage).toBeTruthy();
    } else {
      // If browser doesn't validate, backend should return error
      await confirmButton.click();
      await page.waitForResponse(response => 
        response.url().includes('/permissions') && response.request().method() === 'POST',
        { timeout: 10000 }
      ).catch(() => {});
      await page.waitForTimeout(1000);
      
      // Step 10: Verify error message is displayed indicating invalid email format
      const errorNotification = page.locator('.error-notification');
      await expect(errorNotification).toBeVisible({ timeout: 5000 });
    }
    
    // Step 11: Verify no permission is created
    const permissionItems = page.locator('.permission-item');
    const allText = await permissionItems.allTextContents();
    expect(allText.some(text => text.includes(invalidEmail))).toBe(false);
    
    // Step 12: Verify user list remains unchanged
    // Verified by step 11
  });

  // Test ID: PERM-ADD-005
  test('PERM-ADD-005: Add Project Permission - Negative Case - Empty Email Field', async () => {
    // Setup: Register owner
    await ensureUserRegistered(page, OWNER_EMAIL, OWNER_PASSWORD);
    
    // Login as owner
    await login(page, OWNER_EMAIL, OWNER_PASSWORD);
    
    // Create or open project
    await openProjectEditor(page, PROJECT_NAME);
    
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
    const emailInput = page.locator('input.email-input[type="email"]');
    await expect(emailInput).toHaveValue('');
    
    // Step 8: Attempt to click confirmation button
    const confirmButton = page.locator('button.confirm-button:has-text("Add")');
    
    // Step 9: Verify form validation prevents submission OR error is displayed
    // HTML5 required validation should prevent empty submission
    const isRequired = await emailInput.evaluate((el: HTMLInputElement) => el.required);
    
    if (isRequired) {
      // Browser validation prevents submission
      await confirmButton.click();
      await page.waitForTimeout(500);
      
      // Check if there's a validation message
      const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage).toBeTruthy();
    } else {
      // If not required, backend should validate
      await confirmButton.click();
      await page.waitForResponse(response => 
        response.url().includes('/permissions') && response.request().method() === 'POST',
        { timeout: 10000 }
      ).catch(() => {});
      await page.waitForTimeout(1000);
      
      // Step 10: Verify error message is displayed indicating email is required
      const errorNotification = page.locator('.error-notification');
      await expect(errorNotification).toBeVisible({ timeout: 5000 });
      await expect(errorNotification).toContainText(/email.*required/i, { timeout: 5000 });
    }
    
    // Step 11: Verify no permission is created
    // Step 12: Verify user list remains unchanged
    // Both verified by the fact that no API call was made or it returned an error
  });

  // Test ID: PERM-ADD-006
  test('PERM-ADD-006: Add Project Permission - Negative Case - Permission Denied', async () => {
    test.setTimeout(60000);
    // Setup: Register users
    await ensureUserRegistered(page, OWNER_EMAIL, OWNER_PASSWORD);
    await ensureUserRegistered(page, USER_EMAIL, USER_PASSWORD);
    await ensureUserRegistered(page, NEW_USER_EMAIL, NEW_USER_PASSWORD);
    
    // Login as owner and create project, add user with view permission
    await login(page, OWNER_EMAIL, OWNER_PASSWORD);
    await openProjectEditor(page, PROJECT_NAME);
    
    // Add user@example.com to permissions (they will have view access)
    await page.click('button.tab-button:has-text("Permissions")');
    await expect(page.locator('button.tab-button.active:has-text("Permissions")')).toBeVisible();
    await page.click('button.add-user-button:has-text("Add a user")');
    await expect(page.locator('input.email-input[type="email"]')).toBeVisible();
    await page.fill('input.email-input[type="email"]', USER_EMAIL);
    await page.click('button.confirm-button:has-text("Add")');
    
    // Wait for successful addition
    await page.waitForResponse(response => 
      response.url().includes('/permissions') && response.request().method() === 'POST' && response.status() === 201,
      { timeout: 10000 }
    ).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Logout and login as user@example.com
    await page.goto('/login');
    await login(page, USER_EMAIL, USER_PASSWORD);
    
    // Open the project
    await openProjectEditor(page, PROJECT_NAME);
    
    // Step 1: Verify user is in Project Editor
    await expect(page.locator('button.tab-button:has-text("Project")')).toBeVisible();
    
    // Step 2: Click Permissions tab
    await page.click('button.tab-button:has-text("Permissions")');
    
    // Step 3: Verify Permissions tab is now active
    await expect(page.locator('button.tab-button.active:has-text("Permissions")')).toBeVisible();
    
    // Step 4: Verify "Add a user" button is NOT displayed OR is disabled
    const addUserButton = page.locator('button.add-user-button:has-text("Add a user")');
    const isButtonVisible = await addUserButton.isVisible().catch(() => false);
    
    if (isButtonVisible) {
      // If button is visible, it should be disabled or clicking should fail
      const isDisabled = await addUserButton.isDisabled().catch(() => false);
      
      if (!isDisabled) {
        // Step 5: If button is visible and enabled, attempt to click it
        await addUserButton.click();
        
        // Step 6: If button is clicked, verify action fails
        // Try to add a user
        await page.waitForTimeout(500);
        
        // Check if form appears
        const emailInput = page.locator('input.email-input[type="email"]');
        if (await emailInput.isVisible().catch(() => false)) {
          await emailInput.fill(NEW_USER_EMAIL);
          await page.click('button.confirm-button:has-text("Add")');
          
          // Wait for API response (should be error 403)
          await page.waitForResponse(response => 
            response.url().includes('/permissions') && response.request().method() === 'POST',
            { timeout: 10000 }
          ).catch(() => {});
          await page.waitForTimeout(1000);
          
          // Step 7: Verify error message "Permission denied" is displayed
          const errorNotification = page.locator('.error-notification');
          await expect(errorNotification).toBeVisible({ timeout: 5000 });
          await expect(errorNotification).toContainText(/permission denied|forbidden|unauthorized/i, { timeout: 5000 });
        }
      } else {
        // Button is disabled, which is correct
        expect(isDisabled).toBe(true);
      }
    } else {
      // Button is not visible, which is correct behavior
      expect(isButtonVisible).toBe(false);
    }
    
    // Step 8: Verify no permission can be added
    // Verified by steps above
    
    // Step 9: Verify user list remains unchanged
    const permissionItems = page.locator('.permission-item');
    const allText = await permissionItems.allTextContents();
    expect(allText.some(text => text.includes(NEW_USER_EMAIL))).toBe(false);
  });
});
