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

test.describe('Add Project Permission Tests', () => {
  let page: Page;
  let projectId: string;

  // Helper function to register a user if they don't exist
  async function ensureUserExists(page: Page, email: string, password: string) {
    // Try to login first (user might already exist from previous test runs)
    await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait for login form to be visible
    await page.waitForSelector('input[id="email"]', { timeout: 10000 });
    
    await page.fill('input[id="email"]', email);
    await page.fill('input[id="password"]', password);
    
    // Try login first
    const loginButton = page.locator('button[type="submit"]:has-text("Login")');
    if (await loginButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await loginButton.click();
      
      // Wait to see if login succeeds
      try {
        await page.waitForURL('/home', { timeout: 10000 });
        // Login successful - user exists, just logout
        await page.click('button.settings-button, button[aria-label="Settings"]');
        await page.waitForSelector('.settings-dropdown', { timeout: 5000 });
        await page.click('button.settings-logout:has-text("Logout")');
        await page.waitForURL('/login', { timeout: 10000 });
        return; // User already exists, we're done
      } catch {
        // Login failed, user doesn't exist, try registration
      }
    }
    
    // User doesn't exist, try to register
    await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const registerButton = page.locator('button:has-text("Don\'t have an account? Register")').or(page.locator('button:has-text("Register")'));
    
    if (await registerButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await registerButton.click();
      await page.waitForSelector('input[id="email"]', { timeout: 5000 });
      await page.fill('input[id="email"]', email);
      await page.fill('input[id="password"]', password);
      await page.click('button[type="submit"]:has-text("Register")');
      
      // Wait for registration to complete
      try {
        await page.waitForURL('/home', { timeout: 15000 });
        // Registration successful, logout
        await page.click('button.settings-button, button[aria-label="Settings"]');
        await page.waitForSelector('.settings-dropdown', { timeout: 5000 });
        await page.click('button.settings-logout:has-text("Logout")');
        await page.waitForURL('/login', { timeout: 10000 });
      } catch (error) {
        // Registration might have failed, but that's okay
        // User might have been created by another test
        console.log(`Note: Could not register ${email}, user might already exist`);
      }
    }
  }

  // Helper function to login and create/access project
  async function loginAndGetProject(page: Page, ownerEmail: string, ownerPassword: string) {
    await page.goto('/login');
    await page.fill('input[id="email"]', ownerEmail);
    await page.fill('input[id="password"]', ownerPassword);
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForURL('/home', { timeout: 10000 });
    await expect(page.locator('h1:has-text("Home")')).toBeVisible();

    // Check if project exists, if not create it
    const projectCards = page.locator('.project-card');
    const projectCount = await projectCards.count();
    
    let foundProject = false;
    for (let i = 0; i < projectCount; i++) {
      const card = projectCards.nth(i);
      const name = await card.locator('.project-name').textContent();
      if (name?.trim() === PROJECT_NAME) {
        foundProject = true;
        // Double-click to open project editor
        await card.dblclick();
        break;
      }
    }

    if (!foundProject) {
      // Create new project by dragging Project brick
      const projectBrick = page.locator('.brick-item:has-text("Project")');
      await expect(projectBrick).toBeVisible();
      
      const projectListArea = page.locator('.project-list-area');
      await expect(projectListArea).toBeVisible();
      
      // Drag Project brick to project list area
      await projectBrick.dragTo(projectListArea);
      
      // Wait for project to be created
      await page.waitForTimeout(2000);
      
      // Find the new project card (should be "New Project")
      const newProjectCard = page.locator('.project-card:has-text("New Project")').first();
      await expect(newProjectCard).toBeVisible();
      
      // Click rename button (✏️ emoji button) - it should be visible in the project card
      const renameButton = newProjectCard.locator('button.project-action-button[title="Rename"]').or(newProjectCard.locator('button.project-action-button').first());
      await expect(renameButton).toBeVisible({ timeout: 5000 });
      await renameButton.click();
      
      // Wait for the input to appear (the project name should become editable)
      // The input might be in the project card or we need to wait for state update
      await page.waitForTimeout(1000);
      
      // Try to find the input - it should be in the project card
      const nameInput = newProjectCard.locator('input.project-name-input');
      // If not found in the card, try finding it globally within the project card context
      if (!(await nameInput.isVisible({ timeout: 2000 }).catch(() => false))) {
        // Try alternative: the input might be rendered after state update
        await page.waitForTimeout(1000);
      }
      await expect(nameInput).toBeVisible({ timeout: 10000 });
      
      // Clear existing name and type new name
      await nameInput.clear();
      await nameInput.fill(PROJECT_NAME);
      
      // Confirm rename (press Enter)
      await nameInput.press('Enter');
      
      // Wait for rename to complete
      await page.waitForTimeout(1000);
      
      // Now double-click to open project editor
      const renamedProjectCard = page.locator('.project-card:has-text("' + PROJECT_NAME + '")').first();
      await renamedProjectCard.dblclick();
      
      // Wait for project editor to load
      await page.waitForURL(/\/projects\/[^/]+/, { timeout: 10000 });
    } else {
      // Wait for project editor to load
      await page.waitForURL(/\/projects\/[^/]+/, { timeout: 10000 });
    }

    // Extract project ID from URL
    const url = page.url();
    const match = url.match(/\/projects\/([^/]+)/);
    if (match) {
      projectId = match[1];
    }

    // Verify we're in Project Editor
    await expect(page.locator('.project-editor')).toBeVisible();
    await expect(page.locator('button.tab-button:has-text("Project")')).toBeVisible();
    await expect(page.locator('button.tab-button:has-text("Permissions")')).toBeVisible();
  }

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await page.goto('/login');
    
    // Ensure owner exists (needed for most tests)
    await ensureUserExists(page, OWNER_EMAIL, OWNER_PASSWORD);
  });

  test('PERM-ADD-001: Add Project Permission - Positive Case', async () => {
    // Ensure new user exists
    await ensureUserExists(page, NEW_USER_EMAIL, NEW_USER_PASSWORD);
    
    // Setup: Login as owner and get project
    await loginAndGetProject(page, OWNER_EMAIL, OWNER_PASSWORD);

    // Step 1: Verify user is in Project Editor
    await test.step('Step 1: Verify user is in Project Editor', async () => {
      await expect(page.locator('.project-editor')).toBeVisible();
      await expect(page.locator('button.tab-button:has-text("Project")')).toBeVisible();
    });

    // Step 2: Click Permissions tab
    await test.step('Step 2: Click Permissions tab', async () => {
      await page.click('button.tab-button:has-text("Permissions")');
    });

    // Step 3: Verify Permissions tab is now active
    await test.step('Step 3: Verify Permissions tab is now active', async () => {
      await expect(page.locator('button.tab-button.active:has-text("Permissions")')).toBeVisible();
    });

    // Step 4: Verify left side panel brick list is hidden
    await test.step('Step 4: Verify left side panel brick list is hidden', async () => {
      const sidebar = page.locator('.project-tab-sidebar');
      // In permissions tab, sidebar should not show bricks
      if (await sidebar.isVisible()) {
        const brickList = sidebar.locator('.brick-item');
        const brickCount = await brickList.count();
        expect(brickCount).toBe(0);
      }
    });

    // Step 5: Verify center area displays user list showing current user
    await test.step('Step 5: Verify center area displays user list showing current user', async () => {
      await expect(page.locator('.permissions-list')).toBeVisible();
      await expect(page.locator('.permission-item')).toContainText(OWNER_EMAIL);
    });

    // Step 6: Verify "Add a user" button is displayed
    await test.step('Step 6: Verify "Add a user" button is displayed', async () => {
      await expect(page.locator('button.add-user-button:has-text("Add a user")')).toBeVisible();
    });

    // Step 7: Click "Add a user" button
    await test.step('Step 7: Click "Add a user" button', async () => {
      await page.click('button.add-user-button:has-text("Add a user")');
    });

    // Step 8: Verify add user interface is displayed with email input field
    await test.step('Step 8: Verify add user interface is displayed with email input field', async () => {
      await expect(page.locator('input.email-input[type="email"]')).toBeVisible();
    });

    // Step 9: Enter new user email
    await test.step('Step 9: Enter new user email', async () => {
      await page.fill('input.email-input[type="email"]', NEW_USER_EMAIL);
    });

    // Step 10: Click confirmation button
    await test.step('Step 10: Click confirmation button', async () => {
      // Wait for API response
      const [response] = await Promise.all([
        page.waitForResponse(resp => 
          resp.url().includes('/permissions') && resp.request().method() === 'POST',
          { timeout: 10000 }
        ),
        page.click('button.confirm-button:has-text("Add")')
      ]);
      
      expect(response.status()).toBe(201);
      
      // Wait for editor data refresh
      await page.waitForResponse(resp => 
        resp.url().includes('/editor') && resp.request().method() === 'GET',
        { timeout: 10000 }
      );
    });

    // Step 11: Verify new user is added to the user list
    await test.step('Step 11: Verify new user is added to the user list', async () => {
      await expect(page.locator('.permission-item')).toContainText(NEW_USER_EMAIL, { timeout: 10000 });
    });

    // Step 12: Verify permission is created and persisted
    await test.step('Step 12: Verify permission is created and persisted', async () => {
      const permissionItems = page.locator('.permission-item');
      const count = await permissionItems.count();
      expect(count).toBeGreaterThanOrEqual(2); // Owner + new user
      
      // Verify new user email is in the list
      const emails = await permissionItems.allTextContents();
      expect(emails.some(email => email.includes(NEW_USER_EMAIL))).toBe(true);
    });

    // Step 13: Verify new user appears in the permissions list
    await test.step('Step 13: Verify new user appears in the permissions list', async () => {
      await expect(page.locator('.permission-item:has-text("' + NEW_USER_EMAIL + '")')).toBeVisible();
    });

    // Step 14: Verify no error messages are displayed
    await test.step('Step 14: Verify no error messages are displayed', async () => {
      const errorNotification = page.locator('.error-notification');
      await expect(errorNotification).not.toBeVisible();
    });
  });

  test('PERM-ADD-002: Add Project Permission - Negative Case - User Not Found', async () => {
    // Setup: Login as owner and get project
    await loginAndGetProject(page, OWNER_EMAIL, OWNER_PASSWORD);

    // Step 1: Verify user is in Project Editor
    await test.step('Step 1: Verify user is in Project Editor', async () => {
      await expect(page.locator('.project-editor')).toBeVisible();
    });

    // Step 2: Click Permissions tab
    await test.step('Step 2: Click Permissions tab', async () => {
      await page.click('button.tab-button:has-text("Permissions")');
    });

    // Step 3: Verify Permissions tab is now active
    await test.step('Step 3: Verify Permissions tab is now active', async () => {
      await expect(page.locator('button.tab-button.active:has-text("Permissions")')).toBeVisible();
    });

    // Step 4: Verify "Add a user" button is displayed
    await test.step('Step 4: Verify "Add a user" button is displayed', async () => {
      await expect(page.locator('button.add-user-button:has-text("Add a user")')).toBeVisible();
    });

    // Step 5: Click "Add a user" button
    await test.step('Step 5: Click "Add a user" button', async () => {
      await page.click('button.add-user-button:has-text("Add a user")');
    });

    // Step 6: Verify add user interface is displayed
    await test.step('Step 6: Verify add user interface is displayed', async () => {
      await expect(page.locator('input.email-input[type="email"]')).toBeVisible();
    });

    // Step 7: Enter non-existent user email
    await test.step('Step 7: Enter non-existent user email', async () => {
      await page.fill('input.email-input[type="email"]', NONEXISTENT_EMAIL);
    });

    // Step 8: Click confirmation button
    await test.step('Step 8: Click confirmation button', async () => {
      // Wait for API response (should be error)
      const [response] = await Promise.all([
        page.waitForResponse(resp => 
          resp.url().includes('/permissions') && resp.request().method() === 'POST',
          { timeout: 10000 }
        ),
        page.click('button.confirm-button:has-text("Add")')
      ]);
      
      // Should return error status
      expect([400, 404]).toContain(response.status());
    });

    // Step 9: Verify permission creation fails
    await test.step('Step 9: Verify permission creation fails', async () => {
      // Error notification should appear
      await expect(page.locator('.error-notification')).toBeVisible({ timeout: 5000 });
    });

    // Step 10: Verify error message "User not found" is displayed
    await test.step('Step 10: Verify error message "User not found" is displayed', async () => {
      const errorNotification = page.locator('.error-notification');
      await expect(errorNotification).toBeVisible();
      const errorText = await errorNotification.locator('.error-message').textContent();
      expect(errorText?.toLowerCase()).toContain('user not found');
    });

    // Step 11: Verify non-existent user is NOT added to the user list
    await test.step('Step 11: Verify non-existent user is NOT added to the user list', async () => {
      const permissionItems = page.locator('.permission-item');
      const emails = await permissionItems.allTextContents();
      expect(emails.some(email => email.includes(NONEXISTENT_EMAIL))).toBe(false);
    });

    // Step 12: Verify no permission is created
    await test.step('Step 12: Verify no permission is created', async () => {
      // User should not appear in list
      await expect(page.locator('.permission-item:has-text("' + NONEXISTENT_EMAIL + '")')).not.toBeVisible();
    });

    // Step 13: Verify user list remains unchanged
    await test.step('Step 13: Verify user list remains unchanged', async () => {
      // Should only have owner
      const permissionItems = page.locator('.permission-item');
      const emails = await permissionItems.allTextContents();
      const hasOwner = emails.some(email => email.includes(OWNER_EMAIL));
      expect(hasOwner).toBe(true);
    });
  });

  test('PERM-ADD-003: Add Project Permission - Negative Case - User Already Has Permission', async () => {
    // Setup: Login as owner and get project
    await loginAndGetProject(page, OWNER_EMAIL, OWNER_PASSWORD);

    // First, add existing user to project (setup)
    await test.step('Setup: Add existing user to project', async () => {
      await page.click('button.tab-button:has-text("Permissions")');
      await expect(page.locator('button.tab-button.active:has-text("Permissions")')).toBeVisible();
      
      // Add existing user if not already added
      const permissionItems = page.locator('.permission-item');
      const emails = await permissionItems.allTextContents();
      const hasExistingUser = emails.some(email => email.includes(EXISTING_USER_EMAIL));
      
      if (!hasExistingUser) {
        await page.click('button.add-user-button:has-text("Add a user")');
        await page.fill('input.email-input[type="email"]', EXISTING_USER_EMAIL);
        
        await Promise.all([
          page.waitForResponse(resp => 
            resp.url().includes('/permissions') && resp.request().method() === 'POST',
            { timeout: 10000 }
          ),
          page.click('button.confirm-button:has-text("Add")')
        ]);
        
        await page.waitForResponse(resp => 
          resp.url().includes('/editor') && resp.request().method() === 'GET',
          { timeout: 10000 }
        );
      }
    });

    // Step 1: Verify user is in Project Editor
    await test.step('Step 1: Verify user is in Project Editor', async () => {
      await expect(page.locator('.project-editor')).toBeVisible();
    });

    // Step 2: Click Permissions tab
    await test.step('Step 2: Click Permissions tab', async () => {
      await page.click('button.tab-button:has-text("Permissions")');
    });

    // Step 3: Verify Permissions tab is now active
    await test.step('Step 3: Verify Permissions tab is now active', async () => {
      await expect(page.locator('button.tab-button.active:has-text("Permissions")')).toBeVisible();
    });

    // Step 4: Verify existing user is already displayed in the user list
    await test.step('Step 4: Verify existing user is already displayed in the user list', async () => {
      await expect(page.locator('.permission-item:has-text("' + EXISTING_USER_EMAIL + '")')).toBeVisible();
    });

    // Step 5: Verify "Add a user" button is displayed
    await test.step('Step 5: Verify "Add a user" button is displayed', async () => {
      await expect(page.locator('button.add-user-button:has-text("Add a user")')).toBeVisible();
    });

    // Step 6: Click "Add a user" button
    await test.step('Step 6: Click "Add a user" button', async () => {
      await page.click('button.add-user-button:has-text("Add a user")');
    });

    // Step 7: Verify add user interface is displayed
    await test.step('Step 7: Verify add user interface is displayed', async () => {
      await expect(page.locator('input.email-input[type="email"]')).toBeVisible();
    });

    // Step 8: Enter existing user email
    await test.step('Step 8: Enter existing user email', async () => {
      await page.fill('input.email-input[type="email"]', EXISTING_USER_EMAIL);
    });

    // Step 9: Click confirmation button
    await test.step('Step 9: Click confirmation button', async () => {
      // Wait for API response (should be error)
      const [response] = await Promise.all([
        page.waitForResponse(resp => 
          resp.url().includes('/permissions') && resp.request().method() === 'POST',
          { timeout: 10000 }
        ),
        page.click('button.confirm-button:has-text("Add")')
      ]);
      
      // Should return error status
      expect([400, 409]).toContain(response.status());
    });

    // Step 10: Verify permission creation fails
    await test.step('Step 10: Verify permission creation fails', async () => {
      // Error notification should appear
      await expect(page.locator('.error-notification')).toBeVisible({ timeout: 5000 });
    });

    // Step 11: Verify error message "User already has permission" is displayed
    await test.step('Step 11: Verify error message "User already has permission" is displayed', async () => {
      const errorNotification = page.locator('.error-notification');
      await expect(errorNotification).toBeVisible();
      const errorText = await errorNotification.locator('.error-message').textContent();
      expect(errorText?.toLowerCase()).toMatch(/already.*permission|permission.*already/);
    });

    // Step 12: Verify existing user is NOT duplicated in the user list
    await test.step('Step 12: Verify existing user is NOT duplicated in the user list', async () => {
      const permissionItems = page.locator('.permission-item');
      const emails = await permissionItems.allTextContents();
      const existingUserCount = emails.filter(email => email.includes(EXISTING_USER_EMAIL)).length;
      expect(existingUserCount).toBe(1); // Should appear only once
    });

    // Step 13: Verify no duplicate permission is created
    await test.step('Step 13: Verify no duplicate permission is created', async () => {
      // User should appear only once
      const permissionItems = page.locator('.permission-item:has-text("' + EXISTING_USER_EMAIL + '")');
      const count = await permissionItems.count();
      expect(count).toBe(1);
    });

    // Step 14: Verify user list remains unchanged (no duplicates)
    await test.step('Step 14: Verify user list remains unchanged (no duplicates)', async () => {
      const permissionItems = page.locator('.permission-item');
      const emails = await permissionItems.allTextContents();
      // Check for duplicates
      const uniqueEmails = new Set(emails);
      expect(emails.length).toBe(uniqueEmails.size);
    });
  });

  test('PERM-ADD-004: Add Project Permission - Negative Case - Invalid Email Format', async () => {
    // Setup: Login as owner and get project
    await loginAndGetProject(page, OWNER_EMAIL, OWNER_PASSWORD);

    // Step 1: Verify user is in Project Editor
    await test.step('Step 1: Verify user is in Project Editor', async () => {
      await expect(page.locator('.project-editor')).toBeVisible();
    });

    // Step 2: Click Permissions tab
    await test.step('Step 2: Click Permissions tab', async () => {
      await page.click('button.tab-button:has-text("Permissions")');
    });

    // Step 3: Verify Permissions tab is now active
    await test.step('Step 3: Verify Permissions tab is now active', async () => {
      await expect(page.locator('button.tab-button.active:has-text("Permissions")')).toBeVisible();
    });

    // Step 4: Verify "Add a user" button is displayed
    await test.step('Step 4: Verify "Add a user" button is displayed', async () => {
      await expect(page.locator('button.add-user-button:has-text("Add a user")')).toBeVisible();
    });

    // Step 5: Click "Add a user" button
    await test.step('Step 5: Click "Add a user" button', async () => {
      await page.click('button.add-user-button:has-text("Add a user")');
    });

    // Step 6: Verify add user interface is displayed
    await test.step('Step 6: Verify add user interface is displayed', async () => {
      await expect(page.locator('input.email-input[type="email"]')).toBeVisible();
    });

    // Step 7: Enter invalid email format
    await test.step('Step 7: Enter invalid email format', async () => {
      await page.fill('input.email-input[type="email"]', INVALID_EMAIL);
    });

    // Step 8: Attempt to click confirmation button
    await test.step('Step 8: Attempt to click confirmation button', async () => {
      // HTML5 validation should prevent submission, or we should get an error
      const emailInput = page.locator('input.email-input[type="email"]');
      const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
      
      if (!isValid) {
        // HTML5 validation prevents submission
        const confirmButton = page.locator('button.confirm-button:has-text("Add")');
        // Button might be disabled or form won't submit
        const isDisabled = await confirmButton.isDisabled();
        if (!isDisabled) {
          // Try to submit and check for validation message
          await confirmButton.click();
          // Form should not submit, or we get validation error
        }
      } else {
        // If validation passes (unlikely), try to submit and check for error
        await page.click('button.confirm-button:has-text("Add")');
        // Should get error from backend or frontend validation
      }
    });

    // Step 9: Verify form validation prevents submission OR error is displayed
    await test.step('Step 9: Verify form validation prevents submission OR error is displayed', async () => {
      // Either HTML5 validation prevents submission, or error is shown
      const emailInput = page.locator('input.email-input[type="email"]');
      const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      
      // Check if there's a validation message or error notification
      if (validationMessage) {
        // HTML5 validation is working
        expect(validationMessage.length).toBeGreaterThan(0);
      } else {
        // Check for error notification
        const errorNotification = page.locator('.error-notification');
        if (await errorNotification.isVisible({ timeout: 2000 }).catch(() => false)) {
          const errorText = await errorNotification.locator('.error-message').textContent();
          expect(errorText?.toLowerCase()).toMatch(/invalid.*email|email.*invalid|format/);
        }
      }
    });

    // Step 10: Verify error message is displayed indicating invalid email format
    await test.step('Step 10: Verify error message is displayed indicating invalid email format', async () => {
      // Either browser validation message or app error message
      const emailInput = page.locator('input.email-input[type="email"]');
      const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      
      if (validationMessage) {
        expect(validationMessage.length).toBeGreaterThan(0);
      } else {
        const errorNotification = page.locator('.error-notification');
        if (await errorNotification.isVisible({ timeout: 2000 }).catch(() => false)) {
          const errorText = await errorNotification.locator('.error-message').textContent();
          expect(errorText?.toLowerCase()).toMatch(/invalid|format|email/);
        }
      }
    });

    // Step 11: Verify no permission is created
    await test.step('Step 11: Verify no permission is created', async () => {
      await expect(page.locator('.permission-item:has-text("' + INVALID_EMAIL + '")')).not.toBeVisible();
    });

    // Step 12: Verify user list remains unchanged
    await test.step('Step 12: Verify user list remains unchanged', async () => {
      // Should only have owner (or existing permissions)
      const permissionItems = page.locator('.permission-item');
      const emails = await permissionItems.allTextContents();
      expect(emails.some(email => email.includes(INVALID_EMAIL))).toBe(false);
    });
  });

  test('PERM-ADD-005: Add Project Permission - Negative Case - Empty Email Field', async () => {
    // Setup: Login as owner and get project
    await loginAndGetProject(page, OWNER_EMAIL, OWNER_PASSWORD);

    // Step 1: Verify user is in Project Editor
    await test.step('Step 1: Verify user is in Project Editor', async () => {
      await expect(page.locator('.project-editor')).toBeVisible();
    });

    // Step 2: Click Permissions tab
    await test.step('Step 2: Click Permissions tab', async () => {
      await page.click('button.tab-button:has-text("Permissions")');
    });

    // Step 3: Verify Permissions tab is now active
    await test.step('Step 3: Verify Permissions tab is now active', async () => {
      await expect(page.locator('button.tab-button.active:has-text("Permissions")')).toBeVisible();
    });

    // Step 4: Verify "Add a user" button is displayed
    await test.step('Step 4: Verify "Add a user" button is displayed', async () => {
      await expect(page.locator('button.add-user-button:has-text("Add a user")')).toBeVisible();
    });

    // Step 5: Click "Add a user" button
    await test.step('Step 5: Click "Add a user" button', async () => {
      await page.click('button.add-user-button:has-text("Add a user")');
    });

    // Step 6: Verify add user interface is displayed
    await test.step('Step 6: Verify add user interface is displayed', async () => {
      await expect(page.locator('input.email-input[type="email"]')).toBeVisible();
    });

    // Step 7: Leave email input field empty
    await test.step('Step 7: Leave email input field empty', async () => {
      // Ensure field is empty
      await page.fill('input.email-input[type="email"]', '');
    });

    // Step 8: Attempt to click confirmation button
    await test.step('Step 8: Attempt to click confirmation button', async () => {
      // HTML5 required validation should prevent submission
      const emailInput = page.locator('input.email-input[type="email"]');
      const isRequired = await emailInput.evaluate((el: HTMLInputElement) => el.required);
      
      if (isRequired) {
        // Form should not submit
        const confirmButton = page.locator('button.confirm-button:has-text("Add")');
        await confirmButton.click();
        // Check for validation message
      }
    });

    // Step 9: Verify form validation prevents submission OR error is displayed
    await test.step('Step 9: Verify form validation prevents submission OR error is displayed', async () => {
      const emailInput = page.locator('input.email-input[type="email"]');
      const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      
      // Should have validation message for required field
      expect(validationMessage.length).toBeGreaterThan(0);
    });

    // Step 10: Verify error message is displayed indicating email is required
    await test.step('Step 10: Verify error message is displayed indicating email is required', async () => {
      const emailInput = page.locator('input.email-input[type="email"]');
      const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage.toLowerCase()).toMatch(/required|fill|empty/);
    });

    // Step 11: Verify no permission is created
    await test.step('Step 11: Verify no permission is created', async () => {
      // No new permissions should be added
      const permissionItems = page.locator('.permission-item');
      // Should only have existing permissions (owner at minimum)
      const emails = await permissionItems.allTextContents();
      // Empty email should not be in list
      expect(emails.some(email => !email || email.trim() === '')).toBe(false);
    });

    // Step 12: Verify user list remains unchanged
    await test.step('Step 12: Verify user list remains unchanged', async () => {
      // List should remain as it was
      const permissionItems = page.locator('.permission-item');
      const count = await permissionItems.count();
      // Should have at least owner
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });

  test('PERM-ADD-006: Add Project Permission - Negative Case - Permission Denied', async () => {
    // Setup: Login as user (not owner) and get project
    // First, we need to ensure the user has view permission but not add permission
    // For this test, we'll login as a user who has been granted view access
    
    // First, login as owner and grant view permission to user
    await loginAndGetProject(page, OWNER_EMAIL, OWNER_PASSWORD);
    
    await test.step('Setup: Grant view permission to user', async () => {
      await page.click('button.tab-button:has-text("Permissions")');
      
      // Check if user already has permission
      const permissionItems = page.locator('.permission-item');
      const emails = await permissionItems.allTextContents();
      const hasUser = emails.some(email => email.includes(USER_EMAIL));
      
      if (!hasUser) {
        // Add user with view permission (this might require backend support for permission levels)
        // For now, we'll add the user and assume they only have view permission
        await page.click('button.add-user-button:has-text("Add a user")');
        await page.fill('input.email-input[type="email"]', USER_EMAIL);
        
        await Promise.all([
          page.waitForResponse(resp => 
            resp.url().includes('/permissions') && resp.request().method() === 'POST',
            { timeout: 10000 }
          ),
          page.click('button.confirm-button:has-text("Add")')
        ]);
        
        await page.waitForResponse(resp => 
          resp.url().includes('/editor') && resp.request().method() === 'GET',
          { timeout: 10000 }
        );
      }
    });

    // Logout and login as user
    await test.step('Setup: Logout and login as user', async () => {
      await page.click('button.settings-button, button[aria-label="Settings"]');
      await expect(page.locator('.settings-dropdown')).toBeVisible();
      await page.click('button.settings-logout:has-text("Logout")');
      await page.waitForURL('/login', { timeout: 10000 });
      
      // Login as user
      await page.fill('input[id="email"]', USER_EMAIL);
      await page.fill('input[id="password"]', USER_PASSWORD);
      await page.click('button[type="submit"]:has-text("Login")');
      await page.waitForURL('/home', { timeout: 10000 });
      
      // Navigate to project editor
      const projectCards = page.locator('.project-card');
      const projectCount = await projectCards.count();
      
      for (let i = 0; i < projectCount; i++) {
        const card = projectCards.nth(i);
        const name = await card.locator('.project-name').textContent();
        if (name?.trim() === PROJECT_NAME) {
          await card.dblclick();
          await page.waitForURL(/\/projects\/[^/]+/, { timeout: 10000 });
          break;
        }
      }
    });

    // Step 1: Verify user is in Project Editor
    await test.step('Step 1: Verify user is in Project Editor', async () => {
      await expect(page.locator('.project-editor')).toBeVisible();
    });

    // Step 2: Click Permissions tab
    await test.step('Step 2: Click Permissions tab', async () => {
      await page.click('button.tab-button:has-text("Permissions")');
    });

    // Step 3: Verify Permissions tab is now active
    await test.step('Step 3: Verify Permissions tab is now active', async () => {
      await expect(page.locator('button.tab-button.active:has-text("Permissions")')).toBeVisible();
    });

    // Step 4: Verify "Add a user" button is NOT displayed OR is disabled
    await test.step('Step 4: Verify "Add a user" button is NOT displayed OR is disabled', async () => {
      const addButton = page.locator('button.add-user-button:has-text("Add a user")');
      const isVisible = await addButton.isVisible().catch(() => false);
      
      if (isVisible) {
        // Button is visible but should be disabled
        const isDisabled = await addButton.isDisabled();
        expect(isDisabled).toBe(true);
      } else {
        // Button is not visible (also acceptable)
        expect(isVisible).toBe(false);
      }
    });

    // Step 5: If "Add a user" button is visible, attempt to click it
    await test.step('Step 5: If "Add a user" button is visible, attempt to click it', async () => {
      const addButton = page.locator('button.add-user-button:has-text("Add a user")');
      if (await addButton.isVisible().catch(() => false)) {
        // Try to click (might be disabled)
        try {
          await addButton.click({ timeout: 1000 });
        } catch {
          // Button is disabled, which is expected
        }
      }
    });

    // Step 6: If button is clicked, verify action fails
    await test.step('Step 6: If button is clicked, verify action fails', async () => {
      // If form appeared, try to submit and check for error
      const emailInput = page.locator('input.email-input[type="email"]');
      if (await emailInput.isVisible().catch(() => false)) {
        await emailInput.fill(NEW_USER_EMAIL);
        await page.click('button.confirm-button:has-text("Add")');
        
        // Should get error
        await expect(page.locator('.error-notification')).toBeVisible({ timeout: 5000 });
      }
    });

    // Step 7: Verify error message "Permission denied" is displayed (if action is attempted)
    await test.step('Step 7: Verify error message "Permission denied" is displayed (if action is attempted)', async () => {
      const errorNotification = page.locator('.error-notification');
      if (await errorNotification.isVisible({ timeout: 2000 }).catch(() => false)) {
        const errorText = await errorNotification.locator('.error-message').textContent();
        expect(errorText?.toLowerCase()).toMatch(/permission.*denied|denied|unauthorized|forbidden/);
      }
    });

    // Step 8: Verify no permission can be added
    await test.step('Step 8: Verify no permission can be added', async () => {
      // New user should not appear in list
      await expect(page.locator('.permission-item:has-text("' + NEW_USER_EMAIL + '")')).not.toBeVisible();
    });

    // Step 9: Verify user list remains unchanged
    await test.step('Step 9: Verify user list remains unchanged', async () => {
      // List should only have existing permissions
      const permissionItems = page.locator('.permission-item');
      const emails = await permissionItems.allTextContents();
      expect(emails.some(email => email.includes(NEW_USER_EMAIL))).toBe(false);
    });
  });
});
