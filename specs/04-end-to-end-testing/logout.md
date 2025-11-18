# Logout Test

## Test Name
User Logout

## Description
This test verifies that a logged-in user can successfully log out from the system. Upon logout, the user session is terminated and the user is redirected to the Login Screen.

## Prerequisites
1. Application is running and accessible at the configured base URL
2. Database is accessible
3. A test user with email `test-user-${timestamp}@example.com` and password `TestPassword123!` exists in the system
4. User is logged in and authenticated (session is established)
5. Browser automation environment is set up with Playwright

## Test Steps

**Step 1: Login to System**
- Action: Navigate to Login Screen and log in with test user credentials
- Expected State: User is authenticated and on Home Screen
- Assertions:
  - Verify user is on Home Screen
  - Verify settings icon is visible in top-right corner
  - Verify user session is established

**Step 2: Access Settings Menu**
- Action: Click the round settings icon in the top-right corner
- Expected State: Settings menu is displayed
- Assertions:
  - Verify settings dropdown menu is displayed
  - Verify user name or email is displayed in menu
  - Verify "Logout" option is visible in menu

**Step 3: Click Logout Option**
- Action: Click the "Logout" option in the settings menu
- Expected State: Logout process is initiated
- Assertions:
  - Wait for logout to complete (navigation to Login Screen)

**Step 4: Verify Redirect to Login Screen**
- Action: Wait for navigation to complete
- Expected State: User is redirected to Login Screen
- Assertions:
  - Verify URL changes to Login Screen URL (contains `/login` or is root URL showing login form)
  - Verify Login Screen is displayed
  - Verify login form is visible

**Step 5: Verify Session is Terminated**
- Action: Attempt to access Home Screen directly (navigate to Home Screen URL)
- Expected State: User is redirected back to Login Screen or access is denied
- Assertions:
  - Verify user cannot access authenticated pages
  - Verify user is redirected to Login Screen if attempting to access protected routes
  - Verify session data is cleared (cookies/localStorage)

**Step 6: Verify User Can Login Again**
- Action: Fill login form with same credentials and submit
- Expected State: User can log in again successfully
- Assertions:
  - Verify login succeeds
  - Verify user is redirected to Home Screen
  - Verify new session is established

## Expected Results
1. Settings menu displays user information and logout option
2. Logout option is clickable and functional
3. Logout process completes successfully
4. User is redirected to Login Screen
5. User session is terminated (session data is cleared)
6. User cannot access authenticated pages after logout
7. User can log in again after logout

## Assertions
1. Settings icon is visible and clickable
2. Settings menu displays correctly with user info and logout option
3. Logout option triggers logout process
4. Navigation to Login Screen occurs after logout
5. Session is invalidated (JWT token is removed or invalidated)
6. Protected routes are inaccessible after logout
7. User can successfully log in again after logout

## Error Scenarios
According to specifications, logout always succeeds if user is authenticated. No error conditions are expected for logout. However, if logout fails:
- Error should be logged but user should still be redirected to Login Screen
- Session should be cleared even if server-side logout fails
