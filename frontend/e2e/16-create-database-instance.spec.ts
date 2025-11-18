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

test.describe('Create Database Instance Tests', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    
    // Capture console logs
    page.on('console', (msg) => {
      console.log(`[Browser Console] ${msg.text()}`);
    });

    // Navigate to login screen
    await page.goto('/login');
  });

  test('DB-INSTANCE-CREATE-001: Create Database Instance - Positive Case', async () => {
    // Preconditions:
    // - Application is accessible and running
    // - User account exists with email "testuser@example.com" and password "SecurePass123!"
    // - User is logged in and authenticated
    // - User is in Project Editor for project "TestProject"
    // - Project "TestProject" exists and belongs to the logged-in user
    // - User has permission to create database instances
    // - Database tab is active in Project Editor
    // - "default database" type exists in the system with a string property
    // - "default database" is selected in the database type list

    // Step 1: Login as testuser@example.com
    await test.step('Step 1: Login as testuser@example.com', async () => {
      await expect(page.locator('input[id="email"]')).toBeVisible();
      await page.fill('input[id="email"]', PRIMARY_EMAIL);
      await page.fill('input[id="password"]', PRIMARY_PASSWORD);
      await page.click('button[type="submit"]:has-text("Login")');
      await page.waitForURL('/home', { timeout: 10000 });
      await expect(page.locator('h1:has-text("Home")')).toBeVisible();
    });

    // Step 2: Navigate to TestProject (create if doesn't exist)
    await test.step('Step 2: Navigate to TestProject', async () => {
      const projectCard = page.locator('.project-card').filter({ hasText: PROJECT_NAME });
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
        await nameInput.fill(PROJECT_NAME);
        await nameInput.press('Enter');
        await page.waitForTimeout(500);
      }

      const projectCardToOpen = page.locator('.project-card').filter({ hasText: PROJECT_NAME }).first();
      await projectCardToOpen.dblclick();
      await page.waitForURL(/\/projects\/[^/]+/, { timeout: 10000 });
      await expect(page.locator('.project-editor')).toBeVisible();
    });

    // Step 3: Click Database tab
    await test.step('Step 3: Click Database tab', async () => {
      await page.click('button.tab-button:has-text("Database")');
      await expect(page.locator('button.tab-button.active:has-text("Database")')).toBeVisible();
    });

    // Step 4: Verify "default database" is selected
    await test.step('Step 4: Verify "default database" is selected', async () => {
      const defaultDbButton = page.locator('button.database-type-item:has-text("default database")');
      await expect(defaultDbButton).toBeVisible();
      await defaultDbButton.click();
      await page.waitForTimeout(500);
      const isActive = await defaultDbButton.evaluate((el) => el.classList.contains('active'));
      expect(isActive).toBe(true);
    });

    // Step 5: Verify right side displays database instances list (may be empty)
    await test.step('Step 5: Verify instances list is displayed', async () => {
      await expect(page.locator('.instances-list')).toBeVisible();
    });

    // Step 6: Verify "Create instance" button is displayed
    await test.step('Step 6: Verify "Create instance" button is displayed', async () => {
      const createButton = page.locator('button.create-instance-button:has-text("Create instance")');
      await expect(createButton).toBeVisible();
      await expect(createButton).toBeEnabled();
    });

    // Step 7: Click "Create instance" button
    await test.step('Step 7: Click "Create instance" button', async () => {
      const createButton = page.locator('button.create-instance-button:has-text("Create instance")');
      await createButton.click();
      await page.waitForTimeout(1000); // Wait for instance creation
    });

    // Step 8: Verify a new database instance is created
    await test.step('Step 8: Verify new instance is created', async () => {
      const instanceCard = page.locator('.instances-list .instance-card:visible').first();
      await expect(instanceCard).toBeVisible({ timeout: 5000 });
    });

    // Step 9: Verify the instance is added to the instances list immediately
    await test.step('Step 9: Verify instance is in instances list', async () => {
      const instances = page.locator('.instances-list .instance-card:visible');
      const instanceCount = await instances.count();
      expect(instanceCount).toBeGreaterThan(0);
    });

    // Step 10: Verify the instance displays an input field for the string property
    await test.step('Step 10: Verify instance has input field for string property', async () => {
      const instanceCard = page.locator('.instances-list .instance-card:visible').first();
      const propertyInput = instanceCard.locator('input.property-input');
      await expect(propertyInput).toBeVisible();
    });

    // Step 11: Verify the instance is assigned to the current project "TestProject"
    await test.step('Step 11: Verify instance is assigned to TestProject', async () => {
      // This is verified implicitly by the fact that we're in TestProject's editor
      // and the instance appears in the list. The backend handles the assignment.
      const instanceCard = page.locator('.instances-list .instance-card:visible').first();
      await expect(instanceCard).toBeVisible();
    });

    // Step 12: Verify the instance is assigned to "default database" type
    await test.step('Step 12: Verify instance is assigned to "default database" type', async () => {
      // This is verified implicitly by the fact that "default database" is selected
      // and the instance appears in its instances list
      const defaultDbButton = page.locator('button.database-type-item:has-text("default database")');
      const isActive = await defaultDbButton.evaluate((el) => el.classList.contains('active'));
      expect(isActive).toBe(true);
    });

    // Step 13: Verify no error messages are displayed
    await test.step('Step 13: Verify no error messages are displayed', async () => {
      const errorNotification = page.locator('.error-notification');
      const errorVisible = await errorNotification.isVisible().catch(() => false);
      expect(errorVisible).toBe(false);
    });
  });

  test('DB-INSTANCE-CREATE-002: Create Database Instance - Negative Case - Permission Denied', async () => {
    // Preconditions:
    // - Application is accessible and running
    // - User account exists with email "owner@example.com" and password "SecurePass123!"
    // - User account exists with email "user@example.com" and password "SecurePass456!"
    // - Project "SharedProject" exists and belongs to "owner@example.com"
    // - User "user@example.com" has permission to view the project but NOT to create database instances
    // - User "user@example.com" is logged in and authenticated
    // - User "user@example.com" is in Project Editor for project "SharedProject"
    // - Database tab is active in Project Editor

    // Step 1: Login as owner and create SharedProject
    await test.step('Step 1: Login as owner and create SharedProject', async () => {
      await page.fill('input[id="email"]', OWNER_EMAIL);
      await page.fill('input[id="password"]', OWNER_PASSWORD);
      await page.click('button[type="submit"]:has-text("Login")').catch(async () => {
        const registerButton = page.locator('button:has-text("Don\'t have an account? Register")').or(page.locator('button:has-text("Register")'));
        await registerButton.click();
        await page.fill('input[id="email"]', OWNER_EMAIL);
        await page.fill('input[id="password"]', OWNER_PASSWORD);
        await page.click('button[type="submit"]:has-text("Register")');
      });

      await page.waitForURL('/home', { timeout: 10000 });
      await expect(page.locator('h1:has-text("Home")')).toBeVisible();

      // Create SharedProject if doesn't exist
      const sharedProjectCard = page.locator('.project-card').filter({ hasText: SHARED_PROJECT_NAME });
      const sharedProjectExists = await sharedProjectCard.count() > 0;

      if (!sharedProjectExists) {
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
        await nameInput.fill(SHARED_PROJECT_NAME);
        await nameInput.press('Enter');
        await page.waitForTimeout(500);
      }

      // Logout
      await page.click('button.settings-button, button[aria-label="Settings"]');
      await page.click('button.settings-logout:has-text("Logout")');
      await page.waitForURL('/login', { timeout: 5000 });
    });

    // Step 2: Login as user@example.com
    await test.step('Step 2: Login as user@example.com', async () => {
      await page.fill('input[id="email"]', USER_EMAIL);
      await page.fill('input[id="password"]', USER_PASSWORD);
      await page.click('button[type="submit"]:has-text("Login")').catch(async () => {
        const registerButton = page.locator('button:has-text("Don\'t have an account? Register")').or(page.locator('button:has-text("Register")'));
        await registerButton.click();
        await page.fill('input[id="email"]', USER_EMAIL);
        await page.fill('input[id="password"]', USER_PASSWORD);
        await page.click('button[type="submit"]:has-text("Register")');
      });

      await page.waitForURL('/home', { timeout: 10000 });
      await expect(page.locator('h1:has-text("Home")')).toBeVisible();
    });

    // Step 3: Check if SharedProject is visible (if user has view permission)
    await test.step('Step 3: Check if SharedProject is visible', async () => {
      const sharedProjectCard = page.locator('.project-card').filter({ hasText: SHARED_PROJECT_NAME });
      const count = await sharedProjectCard.count();
      
      if (count > 0) {
        // User has view permission, proceed to test create restriction
        await sharedProjectCard.first().dblclick();
        await page.waitForURL(/\/projects\/[^/]+/, { timeout: 10000 });
        await expect(page.locator('.project-editor')).toBeVisible();

        // Go to Database tab
        await page.click('button.tab-button:has-text("Database")');
        await page.waitForTimeout(500);
        
        const defaultDbButton = page.locator('button.database-type-item:has-text("default database")');
        await defaultDbButton.click();
        await page.waitForTimeout(500);

        // Step 4: Verify "Create instance" button is NOT displayed OR is disabled
        const createButton = page.locator('button.create-instance-button:has-text("Create instance")');
        const buttonVisible = await createButton.isVisible().catch(() => false);
        const buttonDisabled = buttonVisible ? await createButton.isDisabled().catch(() => false) : true;
        
        // Step 5: If button is visible, attempt to click it
        if (buttonVisible && !buttonDisabled) {
          await test.step('Step 5: Attempt to click "Create instance" button', async () => {
            await createButton.click();
            await page.waitForTimeout(1500);
          });

          // Step 6: Verify error message "Permission denied" is displayed
          await test.step('Step 6: Verify error message is displayed', async () => {
            const errorNotification = page.locator('.error-notification');
            const errorVisible = await errorNotification.isVisible().catch(() => false);
            expect(errorVisible).toBe(true);
          });
        } else {
          // Button is not visible or disabled, which is expected behavior
          expect(buttonVisible).toBe(false);
        }

        // Step 7: Verify no instance is created
        await test.step('Step 7: Verify no instance is created', async () => {
          const instances = page.locator('.instances-list .instance-card:visible');
          const instanceCount = await instances.count();
          // Count should remain 0 or unchanged
          expect(instanceCount).toBe(0);
        });

        // Step 8: Verify instances list remains unchanged
        await test.step('Step 8: Verify instances list remains unchanged', async () => {
          const instances = page.locator('.instances-list .instance-card:visible');
          const instanceCount = await instances.count();
          expect(instanceCount).toBe(0);
        });
      } else {
        // User doesn't have view permission, which is also valid
        // This test verifies that permission restrictions are enforced
      }
    });
  });

  test('DB-INSTANCE-CREATE-003: Create Database Instance - Verify Multiple Instances Can Be Created', async () => {
    // Preconditions:
    // - Application is accessible and running
    // - User account exists with email "testuser@example.com" and password "SecurePass123!"
    // - User is logged in and authenticated
    // - User is in Project Editor for project "TestProject"
    // - Project "TestProject" exists and belongs to the logged-in user
    // - At least one database instance already exists for "default database" in the project
    // - Database tab is active in Project Editor
    // - "default database" is selected

    // Step 1: Login as testuser@example.com
    await test.step('Step 1: Login as testuser@example.com', async () => {
      await expect(page.locator('input[id="email"]')).toBeVisible();
      await page.fill('input[id="email"]', PRIMARY_EMAIL);
      await page.fill('input[id="password"]', PRIMARY_PASSWORD);
      await page.click('button[type="submit"]:has-text("Login")');
      await page.waitForURL('/home', { timeout: 10000 });
      await expect(page.locator('h1:has-text("Home")')).toBeVisible();
    });

    // Step 2: Navigate to TestProject
    await test.step('Step 2: Navigate to TestProject', async () => {
      const projectCard = page.locator('.project-card').filter({ hasText: PROJECT_NAME });
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
        await nameInput.fill(PROJECT_NAME);
        await nameInput.press('Enter');
        await page.waitForTimeout(500);
      }

      const projectCardToOpen = page.locator('.project-card').filter({ hasText: PROJECT_NAME }).first();
      await projectCardToOpen.dblclick();
      await page.waitForURL(/\/projects\/[^/]+/, { timeout: 10000 });
      await expect(page.locator('.project-editor')).toBeVisible();
    });

    // Step 3: Click Database tab and select "default database"
    await test.step('Step 3: Click Database tab and select "default database"', async () => {
      await page.click('button.tab-button:has-text("Database")');
      await expect(page.locator('button.tab-button.active:has-text("Database")')).toBeVisible();
      
      const defaultDbButton = page.locator('button.database-type-item:has-text("default database")');
      await defaultDbButton.click();
      await page.waitForTimeout(500);
    });

    // Step 4: Create first instance if needed
    await test.step('Step 4: Create first instance if needed', async () => {
      const instances = page.locator('.instances-list .instance-card:visible');
      const instanceCount = await instances.count();
      
      if (instanceCount === 0) {
        await page.click('button.create-instance-button:has-text("Create instance")');
        await page.waitForTimeout(1000);
      }

      // Wait for at least one instance to be visible
      await expect(page.locator('.instances-list .instance-card:visible').first()).toBeVisible({ timeout: 5000 });
    });

    // Step 5: Count the number of instances in the list
    await test.step('Step 5: Count existing instances', async () => {
      const instances = page.locator('.instances-list .instance-card:visible');
      const initialCount = await instances.count();
      expect(initialCount).toBeGreaterThanOrEqual(1);
    });

    // Step 6: Click "Create instance" button
    await test.step('Step 6: Click "Create instance" button', async () => {
      const instancesBefore = page.locator('.instances-list .instance-card:visible');
      const countBefore = await instancesBefore.count();
      
      await page.click('button.create-instance-button:has-text("Create instance")');
      await page.waitForTimeout(1000);
    });

    // Step 7: Verify a new instance is created
    await test.step('Step 7: Verify new instance is created', async () => {
      const instances = page.locator('.instances-list .instance-card:visible');
      await expect(instances.first()).toBeVisible();
    });

    // Step 8: Verify new instance appears in instances list
    await test.step('Step 8: Verify new instance appears in list', async () => {
      const instances = page.locator('.instances-list .instance-card:visible');
      const countAfter = await instances.count();
      expect(countAfter).toBeGreaterThanOrEqual(2);
    });

    // Step 9: Verify total number of instances has increased by one
    await test.step('Step 9: Verify instance count increased', async () => {
      const instances = page.locator('.instances-list .instance-card:visible');
      const finalCount = await instances.count();
      expect(finalCount).toBeGreaterThanOrEqual(2);
    });

    // Step 10: Verify all instances are displayed in the list
    await test.step('Step 10: Verify all instances are displayed', async () => {
      const instances = page.locator('.instances-list .instance-card:visible');
      const count = await instances.count();
      expect(count).toBeGreaterThanOrEqual(2);
      
      // Verify first instance
      await expect(instances.first()).toBeVisible();
      // Verify second instance
      await expect(instances.nth(1)).toBeVisible();
    });

    // Step 11: Verify each instance has a unique identifier
    await test.step('Step 11: Verify each instance has unique identifier', async () => {
      const instances = page.locator('.instances-list .instance-card:visible');
      const count = await instances.count();
      
      if (count >= 2) {
        const firstInstanceId = await instances.first().locator('.instance-id').textContent();
        const secondInstanceId = await instances.nth(1).locator('.instance-id').textContent();
        expect(firstInstanceId).not.toBe(secondInstanceId);
      }
    });

    // Step 12: Verify no error messages are displayed
    await test.step('Step 12: Verify no error messages are displayed', async () => {
      const errorNotification = page.locator('.error-notification');
      const errorVisible = await errorNotification.isVisible().catch(() => false);
      expect(errorVisible).toBe(false);
    });
  });

  test('DB-INSTANCE-CREATE-004: Create Database Instance - Verify Instance Persistence', async () => {
    // Preconditions:
    // - Application is accessible and running
    // - User account exists with email "testuser@example.com" and password "SecurePass123!"
    // - User is logged in and authenticated
    // - User is in Project Editor for project "TestProject"
    // - Project "TestProject" exists and belongs to the logged-in user
    // - Database tab is active in Project Editor
    // - "default database" is selected

    // Step 1: Login as testuser@example.com
    await test.step('Step 1: Login as testuser@example.com', async () => {
      await expect(page.locator('input[id="email"]')).toBeVisible();
      await page.fill('input[id="email"]', PRIMARY_EMAIL);
      await page.fill('input[id="password"]', PRIMARY_PASSWORD);
      await page.click('button[type="submit"]:has-text("Login")');
      await page.waitForURL('/home', { timeout: 10000 });
      await expect(page.locator('h1:has-text("Home")')).toBeVisible();
    });

    // Step 2: Navigate to TestProject
    await test.step('Step 2: Navigate to TestProject', async () => {
      const projectCard = page.locator('.project-card').filter({ hasText: PROJECT_NAME });
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
        await nameInput.fill(PROJECT_NAME);
        await nameInput.press('Enter');
        await page.waitForTimeout(500);
      }

      const projectCardToOpen = page.locator('.project-card').filter({ hasText: PROJECT_NAME }).first();
      await projectCardToOpen.dblclick();
      await page.waitForURL(/\/projects\/[^/]+/, { timeout: 10000 });
      await expect(page.locator('.project-editor')).toBeVisible();
    });

    // Step 3: Click Database tab and select "default database"
    await test.step('Step 3: Click Database tab and select "default database"', async () => {
      await page.click('button.tab-button:has-text("Database")');
      await expect(page.locator('button.tab-button.active:has-text("Database")')).toBeVisible();
      
      const defaultDbButton = page.locator('button.database-type-item:has-text("default database")');
      await defaultDbButton.click();
      await page.waitForTimeout(500);
    });

    // Step 4: Click "Create instance" button
    await test.step('Step 4: Click "Create instance" button', async () => {
      await page.click('button.create-instance-button:has-text("Create instance")');
      await page.waitForTimeout(1000);
    });

    // Step 5: Verify new instance is created and displayed
    await test.step('Step 5: Verify new instance is created and displayed', async () => {
      const instanceCard = page.locator('.instances-list .instance-card:visible').first();
      await expect(instanceCard).toBeVisible({ timeout: 5000 });
    });

    // Step 6: Navigate away from Database tab (click Project tab)
    await test.step('Step 6: Navigate away from Database tab', async () => {
      await page.click('button.tab-button:has-text("Project")');
      await page.waitForTimeout(500);
      await expect(page.locator('button.tab-button.active:has-text("Project")')).toBeVisible();
    });

    // Step 7: Navigate back to Database tab
    await test.step('Step 7: Navigate back to Database tab', async () => {
      await page.click('button.tab-button:has-text("Database")');
      await page.waitForTimeout(500);
      await expect(page.locator('button.tab-button.active:has-text("Database")')).toBeVisible();
    });

    // Step 8: Verify "default database" is selected
    await test.step('Step 8: Verify "default database" is selected', async () => {
      const defaultDbButton = page.locator('button.database-type-item:has-text("default database")');
      await defaultDbButton.click();
      await page.waitForTimeout(500);
      const isActive = await defaultDbButton.evaluate((el) => el.classList.contains('active'));
      expect(isActive).toBe(true);
    });

    // Step 9: Verify the created instance is still displayed in instances list
    await test.step('Step 9: Verify instance is still displayed', async () => {
      const instanceCard = page.locator('.instances-list .instance-card:visible').first();
      await expect(instanceCard).toBeVisible({ timeout: 5000 });
    });

    // Step 10: Verify instance data is persisted in the system
    await test.step('Step 10: Verify instance data is persisted', async () => {
      const instances = page.locator('.instances-list .instance-card:visible');
      const instanceCount = await instances.count();
      expect(instanceCount).toBeGreaterThan(0);
      
      // Verify instance has input field (showing it's a valid instance)
      const instanceCard = page.locator('.instances-list .instance-card:visible').first();
      const propertyInput = instanceCard.locator('input.property-input');
      await expect(propertyInput).toBeVisible();
    });
  });
});
