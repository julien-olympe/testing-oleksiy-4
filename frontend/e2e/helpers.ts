import type { Page } from '@playwright/test';

const TEST_EMAIL = 'testuser@example.com';
const TEST_PASSWORD = 'SecurePass123!';

export async function ensureTestUser(page: Page): Promise<void> {
  // Navigate to login page
  await page.goto('/login');
  
  // Try to login first
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  
  // Wait a bit to see if login succeeds or fails
  await page.waitForTimeout(2000);
  
  // If we're still on login page, try to register
  if (page.url().includes('/login')) {
    // Check if there's an error message
    const errorVisible = await page.locator('.error-notification').isVisible().catch(() => false);
    
    if (errorVisible) {
      // User doesn't exist, register them
      await page.click('button:has-text("Don\'t have an account? Register")');
      await page.waitForTimeout(500);
      
      await page.fill('input[type="email"]', TEST_EMAIL);
      await page.fill('input[type="password"]', TEST_PASSWORD);
      await page.click('button[type="submit"]');
      
      // Wait for registration and redirect to home
      await page.waitForURL('/home', { timeout: 10000 });
    }
  } else {
    // Login succeeded, we're on home page
    return;
  }
}

export { TEST_EMAIL, TEST_PASSWORD };
