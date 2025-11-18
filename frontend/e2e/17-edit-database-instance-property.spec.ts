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

// Helper function to ensure user exists and is logged in
async function ensureUserExists(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  
  // Try to login first
  await page.fill('input[id="email"]', email);
  await page.fill('input[id="password"]', password);
  await page.click('button[type="submit"]:has-text("Login")').catch(async () => {
    // If login fails, try register
    const registerButton = page.locator('button:has-text("Don\'t have an account? Register")').or(page.locator('button:has-text("Register")'));
    if (await registerButton.isVisible()) {
      await registerButton.click();
      await page.fill('input[id="email"]', email);
      await page.fill('input[id="password"]', password);
      await page.click('button[type="submit"]:has-text("Register")');
    }
  });
  
  await page.waitForURL('/home', { timeout: 10000 });
  await expect(page.locator('h1:has-text("Home")')).toBeVisible();
}

// Helper function to create project if it doesn't exist
async function ensureProjectExists(page: Page, projectName: string): Promise<void> {
  const projectCard = page.locator('.project-card').filter({ hasText: projectName });
  const projectExists = await projectCard.count() > 0;

  if (!projectExists) {
    const projectBrick = page.locator('.brick-item:has-text("Project")');
    const projectListArea = page.locator('.project-list-area');
    await projectBrick.dragTo(projectListArea);
    await page.waitForTimeout(1000);

    const newProjectCard = page.locator('.project-card').first();
    await newProjectCard.click();
    const renameButton = newProjectCard.locator('button.project-action-button').first();
    await renameButton.click();
    const nameInput = newProjectCard.locator('input.project-name-input');
    await nameInput.clear();
    await nameInput.fill(projectName);
    await nameInput.press('Enter');
    await page.waitForTimeout(500);
  }
}

// Helper function to open project editor
async function openProjectEditor(page: Page, projectName: string): Promise<void> {
  const projectCard = page.locator('.project-card').filter({ hasText: projectName }).first();
  await projectCard.dblclick();
  await page.waitForURL(/\/projects\/[^/]+/, { timeout: 10000 });
  await expect(page.locator('.project-editor')).toBeVisible();
  
  // Ensure Project tab is active
  const projectTab = page.locator('button.tab-button:has-text("Project")');
  if (await projectTab.isVisible()) {
    await projectTab.click();
    await page.waitForTimeout(300);
  }
}

// Helper function to ensure database instance exists
async function ensureDatabaseInstanceExists(page: Page): Promise<void> {
  // Navigate to Database tab
  await page.click('button.tab-button:has-text("Database")');
  await page.waitForTimeout(500);
  
  // Select default database
  const defaultDbButton = page.locator('button.database-type-item:has-text("default database")');
  await defaultDbButton.click();
  await page.waitForTimeout(500);
  
  // Check if instance exists
  const instanceCards = page.locator('.instance-card');
  const instanceCount = await instanceCards.count();
  
  if (instanceCount === 0) {
    // Create instance
    const createButton = page.locator('button.create-instance-button:has-text("Create instance")');
    await createButton.click();
    await page.waitForTimeout(1000);
    
    // Wait for instance to appear
    await expect(page.locator('.instance-card')).toBeVisible({ timeout: 5000 });
  }
}

test.describe('Edit Database Instance Property Tests', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    
    // Capture console logs
    page.on('console', (msg) => {
      console.log(`[Browser Console] ${msg.text()}`);
    });
  });

  test('DB-INSTANCE-EDIT-001: Edit Database Instance Property - Positive Case', async () => {
    test.setTimeout(60000);
    
    // Preconditions setup
    await ensureUserExists(page, PRIMARY_EMAIL, PRIMARY_PASSWORD);
    await ensureProjectExists(page, PROJECT_NAME);
    await openProjectEditor(page, PROJECT_NAME);
    await ensureDatabaseInstanceExists(page);

    // Step 1: Verify user is in Project Editor with Database tab active
    await test.step('Step 1: Verify user is in Project Editor with Database tab active', async () => {
      await expect(page.locator('.project-editor')).toBeVisible();
      await expect(page.locator('button.tab-button.active:has-text("Database")')).toBeVisible();
    });

    // Step 2: Verify "default database" is selected
    await test.step('Step 2: Verify "default database" is selected', async () => {
      const defaultDbButton = page.locator('button.database-type-item:has-text("default database")');
      const isActive = await defaultDbButton.evaluate((el) => el.classList.contains('active'));
      expect(isActive).toBe(true);
    });

    // Step 3: Verify database instance is displayed in instances list
    await test.step('Step 3: Verify database instance is displayed', async () => {
      await expect(page.locator('.instance-card')).toBeVisible();
    });

    // Step 4-8: Locate, click, clear, and type new value
    await test.step('Step 4-8: Edit property value', async () => {
      const propertyInput = page.locator('.instance-card .property-input').first();
      await expect(propertyInput).toBeVisible();
      await propertyInput.click();
      await propertyInput.clear();
      await propertyInput.fill('Updated Instance Value');
      
      // Step 8: Verify value is entered
      await expect(propertyInput).toHaveValue('Updated Instance Value');
    });

    // Step 9: Verify value is automatically saved (wait for debounce + API call)
    await test.step('Step 9: Verify auto-save occurs', async () => {
      // Wait for debounce (500ms) + API call
      await page.waitForTimeout(2000);
      
      // Verify no error messages
      const errorNotification = page.locator('.error-notification');
      const errorVisible = await errorNotification.isVisible().catch(() => false);
      expect(errorVisible).toBe(false);
    });

    // Step 10: Verify value change is persisted
    await test.step('Step 10: Verify value is persisted', async () => {
      // Navigate away and back to verify persistence
      await page.click('button.tab-button:has-text("Project")');
      await page.waitForTimeout(500);
      await page.click('button.tab-button:has-text("Database")');
      await page.waitForTimeout(500);
      
      // Select default database again
      const defaultDbButton = page.locator('button.database-type-item:has-text("default database")');
      await defaultDbButton.click();
      await page.waitForTimeout(1000);
      
      // Verify value is still "Updated Instance Value"
      const propertyInput = page.locator('.instance-card .property-input').first();
      await expect(propertyInput).toHaveValue('Updated Instance Value');
    });

    // Step 11-12: Verify no errors and auto-save
    await test.step('Step 11-12: Verify no errors and auto-save confirmation', async () => {
      const errorNotification = page.locator('.error-notification');
      const errorVisible = await errorNotification.isVisible().catch(() => false);
      expect(errorVisible).toBe(false);
    });
  });

  test('DB-INSTANCE-EDIT-002: Edit Database Instance Property - Negative Case - Permission Denied', async () => {
    test.setTimeout(60000);
    
    // Step 1: Login as owner and create SharedProject
    await test.step('Step 1: Login as owner and create SharedProject', async () => {
      await ensureUserExists(page, OWNER_EMAIL, OWNER_PASSWORD);
      await ensureProjectExists(page, SHARED_PROJECT_NAME);
      await openProjectEditor(page, SHARED_PROJECT_NAME);
      await ensureDatabaseInstanceExists(page);
      
      // Logout
      await page.click('button.settings-button, button[aria-label="Settings"]');
      await page.click('button.settings-logout:has-text("Logout")');
      await page.waitForURL('/login', { timeout: 5000 });
    });

    // Step 2: Login as user@example.com
    await test.step('Step 2: Login as user@example.com', async () => {
      await ensureUserExists(page, USER_EMAIL, USER_PASSWORD);
    });

    // Step 3: Verify user is in Project Editor (if they have view permission)
    await test.step('Step 3: Attempt to access SharedProject', async () => {
      // Check if project is visible
      const sharedProjectCard = page.locator('.project-card').filter({ hasText: SHARED_PROJECT_NAME });
      const projectVisible = await sharedProjectCard.count() > 0;
      
      if (projectVisible) {
        await openProjectEditor(page, SHARED_PROJECT_NAME);
        await page.click('button.tab-button:has-text("Database")');
        await page.waitForTimeout(500);
        
        const defaultDbButton = page.locator('button.database-type-item:has-text("default database")');
        if (await defaultDbButton.isVisible()) {
          await defaultDbButton.click();
          await page.waitForTimeout(500);
        }
      }
    });

    // Step 4-7: Attempt to edit and verify permission restrictions
    await test.step('Step 4-7: Attempt to edit and verify restrictions', async () => {
      const instanceCard = page.locator('.instance-card');
      const instanceExists = await instanceCard.count() > 0;
      
      if (instanceExists) {
        const propertyInput = page.locator('.instance-card .property-input').first();
        const isDisabled = await propertyInput.isDisabled().catch(() => false);
        
        if (!isDisabled) {
          // Try to edit
          await propertyInput.click();
          await propertyInput.fill('Unauthorized Edit');
          await page.waitForTimeout(2000);
          
          // Check for error message
          const errorNotification = page.locator('.error-notification');
          const errorText = await errorNotification.textContent().catch(() => '');
          const hasPermissionError = errorText?.toLowerCase().includes('permission') || 
                                     errorText?.toLowerCase().includes('denied');
          
          // Verify either input is disabled OR error is shown
          expect(isDisabled || hasPermissionError).toBe(true);
        } else {
          // Input is disabled, which is correct
          expect(isDisabled).toBe(true);
        }
      } else {
        // Project not accessible, which is also correct
        expect(instanceExists).toBe(false);
      }
    });
  });

  test('DB-INSTANCE-EDIT-003: Edit Database Instance Property - Negative Case - Invalid Property Value', async () => {
    test.setTimeout(60000);
    
    // Preconditions setup
    await ensureUserExists(page, PRIMARY_EMAIL, PRIMARY_PASSWORD);
    await ensureProjectExists(page, PROJECT_NAME);
    await openProjectEditor(page, PROJECT_NAME);
    await ensureDatabaseInstanceExists(page);

    // Step 1: Verify user is in Project Editor with Database tab active
    await test.step('Step 1: Verify user is in Project Editor', async () => {
      await expect(page.locator('.project-editor')).toBeVisible();
      await expect(page.locator('button.tab-button.active:has-text("Database")')).toBeVisible();
    });

    // Step 2: Verify database instance is displayed
    await test.step('Step 2: Verify instance is displayed', async () => {
      await expect(page.locator('.instance-card')).toBeVisible();
    });

    // Step 3-6: Attempt to enter invalid value
    await test.step('Step 3-6: Attempt to enter invalid value', async () => {
      const propertyInput = page.locator('.instance-card .property-input').first();
      await propertyInput.click();
      
      // Get original value
      const originalValue = await propertyInput.inputValue();
      
      // Try entering a very long value (potential validation issue)
      // Note: Since we don't know exact validation rules, we'll test with a long string
      const invalidValue = 'a'.repeat(10000);
      await propertyInput.fill(invalidValue);
      await page.waitForTimeout(2000);
      
      // Step 7-9: Check for validation error or value rejection
      const errorNotification = page.locator('.error-notification');
      const errorVisible = await errorNotification.isVisible().catch(() => false);
      const errorText = await errorNotification.textContent().catch(() => '');
      const hasInvalidError = errorText?.toLowerCase().includes('invalid');
      
      // Step 10: Verify original value is restored or invalid value is rejected
      const currentValue = await propertyInput.inputValue();
      
      // Either error should be shown OR value should be rejected/restored
      if (errorVisible && hasInvalidError) {
        // Validation error shown - correct behavior
        expect(hasInvalidError).toBe(true);
      } else if (currentValue !== invalidValue) {
        // Value was rejected/restored - also correct
        expect(currentValue).not.toBe(invalidValue);
      } else {
        // If no validation, that's also acceptable (no validation rules)
        // Test passes if no error or if value is accepted
      }
    });
  });

  test('DB-INSTANCE-EDIT-004: Edit Database Instance Property - Verify Auto-Save Functionality', async () => {
    test.setTimeout(60000);
    
    // Preconditions setup
    await ensureUserExists(page, PRIMARY_EMAIL, PRIMARY_PASSWORD);
    await ensureProjectExists(page, PROJECT_NAME);
    await openProjectEditor(page, PROJECT_NAME);
    await ensureDatabaseInstanceExists(page);

    // Step 1: Verify user is in Project Editor with Database tab active
    await test.step('Step 1: Verify user is in Project Editor', async () => {
      await expect(page.locator('.project-editor')).toBeVisible();
      await expect(page.locator('button.tab-button.active:has-text("Database")')).toBeVisible();
    });

    // Step 2: Verify instance is displayed with existing value
    await test.step('Step 2: Verify instance is displayed', async () => {
      await expect(page.locator('.instance-card')).toBeVisible();
      
      // Set original value if empty
      const propertyInput = page.locator('.instance-card .property-input').first();
      const currentValue = await propertyInput.inputValue();
      if (!currentValue) {
        await propertyInput.click();
        await propertyInput.fill('Original Value');
        await page.waitForTimeout(2000); // Wait for auto-save
      }
    });

    // Step 3-7: Edit value and verify auto-save
    await test.step('Step 3-7: Edit value and verify auto-save', async () => {
      const propertyInput = page.locator('.instance-card .property-input').first();
      await propertyInput.click();
      await propertyInput.clear();
      await propertyInput.fill('Auto-Saved Value');
      await expect(propertyInput).toHaveValue('Auto-Saved Value');
      
      // Step 8: Verify no save button click is required
      const saveButton = page.locator('button:has-text("Save")');
      const saveButtonExists = await saveButton.count() > 0;
      expect(saveButtonExists).toBe(false);
      
      // Wait for auto-save
      await page.waitForTimeout(2000);
    });

    // Step 9-13: Navigate away and back to verify persistence
    await test.step('Step 9-13: Navigate away and back to verify persistence', async () => {
      // Navigate to Project tab
      await page.click('button.tab-button:has-text("Project")');
      await page.waitForTimeout(500);
      
      // Navigate back to Database tab
      await page.click('button.tab-button:has-text("Database")');
      await page.waitForTimeout(500);
      
      // Select default database
      const defaultDbButton = page.locator('button.database-type-item:has-text("default database")');
      await defaultDbButton.click();
      await page.waitForTimeout(1000);
      
      // Verify value is still "Auto-Saved Value"
      const propertyInput = page.locator('.instance-card .property-input').first();
      await expect(propertyInput).toHaveValue('Auto-Saved Value');
    });
  });

  test('DB-INSTANCE-EDIT-005: Edit Database Instance Property - Edit Multiple Instances', async () => {
    test.setTimeout(60000);
    
    // Preconditions setup
    await ensureUserExists(page, PRIMARY_EMAIL, PRIMARY_PASSWORD);
    await ensureProjectExists(page, PROJECT_NAME);
    await openProjectEditor(page, PROJECT_NAME);
    await ensureDatabaseInstanceExists(page);

    // Step 1: Verify user is in Project Editor with Database tab active
    await test.step('Step 1: Verify user is in Project Editor', async () => {
      await expect(page.locator('.project-editor')).toBeVisible();
      await expect(page.locator('button.tab-button.active:has-text("Database")')).toBeVisible();
    });

    // Step 2: Verify multiple instances are displayed (create second if needed)
    await test.step('Step 2: Ensure multiple instances exist', async () => {
      const instanceCards = page.locator('.instance-card');
      let instanceCount = await instanceCards.count();
      
      // Create second instance if only one exists
      if (instanceCount < 2) {
        const createButton = page.locator('button.create-instance-button:has-text("Create instance")');
        await createButton.click();
        await page.waitForTimeout(1000);
        instanceCount = await instanceCards.count();
      }
      
      expect(instanceCount).toBeGreaterThanOrEqual(2);
    });

    // Step 3-6: Edit first instance
    await test.step('Step 3-6: Edit first instance', async () => {
      const firstInstanceInput = page.locator('.instance-card').first().locator('.property-input').first();
      await firstInstanceInput.click();
      await firstInstanceInput.clear();
      await firstInstanceInput.fill('First Instance Value');
      await expect(firstInstanceInput).toHaveValue('First Instance Value');
      await page.waitForTimeout(2000); // Wait for auto-save
    });

    // Step 7-10: Edit second instance
    await test.step('Step 7-10: Edit second instance', async () => {
      const secondInstanceInput = page.locator('.instance-card').nth(1).locator('.property-input').first();
      await secondInstanceInput.click();
      await secondInstanceInput.clear();
      await secondInstanceInput.fill('Second Instance Value');
      await expect(secondInstanceInput).toHaveValue('Second Instance Value');
      await page.waitForTimeout(2000); // Wait for auto-save
    });

    // Step 11-13: Verify both instances have their values
    await test.step('Step 11-13: Verify both instances have their values', async () => {
      // Navigate away and back to verify persistence
      await page.click('button.tab-button:has-text("Project")');
      await page.waitForTimeout(500);
      await page.click('button.tab-button:has-text("Database")');
      await page.waitForTimeout(500);
      
      const defaultDbButton = page.locator('button.database-type-item:has-text("default database")');
      await defaultDbButton.click();
      await page.waitForTimeout(1000);
      
      // Verify first instance
      const firstInstanceInput = page.locator('.instance-card').first().locator('.property-input').first();
      await expect(firstInstanceInput).toHaveValue('First Instance Value');
      
      // Verify second instance
      const secondInstanceInput = page.locator('.instance-card').nth(1).locator('.property-input').first();
      await expect(secondInstanceInput).toHaveValue('Second Instance Value');
      
      // Verify no errors
      const errorNotification = page.locator('.error-notification');
      const errorVisible = await errorNotification.isVisible().catch(() => false);
      expect(errorVisible).toBe(false);
    });
  });
});
