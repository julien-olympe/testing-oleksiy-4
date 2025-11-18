# Login Positive Test

## Test Name
User Login - Successful Login

## Description
This test verifies that a registered user can successfully log in to the system by providing valid email and password. Upon successful authentication, the user session is established and the user is redirected to the Home Screen.

## Prerequisites
1. Application is running and accessible at the configured base URL
2. Database is accessible
3. A test user with email `test-user-${timestamp}@example.com` and password `TestPassword123!` exists in the system (created before test or via registration)
4. Browser automation environment is set up with Playwright

## Test Steps

**Step 1: Navigate to Login Screen**
- Action: Open browser and navigate to base URL
- Expected State: Login Screen is displayed
- Assertions:
  - Verify URL contains `/login` or is root URL showing login form
  - Verify login form is visible (email input, password input, Login button)
  - Verify registration form is also visible

**Step 2: Fill Login Form**
- Action: Fill login form with valid credentials:
  - Email: `test-user-${timestamp}@example.com`
  - Password: `TestPassword123!`
- Expected State: Form fields are filled with entered values
- Assertions:
  - Verify email input contains entered email
  - Verify password input is masked (type="password")

**Step 3: Submit Login**
- Action: Click the "Login" button
- Expected State: Login is processed and user is authenticated
- Assertions:
  - Wait for navigation to Home Screen
  - Verify URL changes to Home Screen URL (contains `/home` or root shows projects)
  - Verify navigation completes successfully

**Step 4: Verify Home Screen Display**
- Action: Wait for Home Screen to fully load
- Expected State: Home Screen displays with all components
- Assertions:
  - Verify Home Screen is displayed
  - Verify settings icon (round icon) is visible in top-right corner
  - Verify search bar is visible on left side
  - Verify brick list is visible on left side showing "Project" brick
  - Verify project list area is visible in center/right side
  - Verify user is authenticated (session is established)

**Step 5: Verify User Session**
- Action: Click settings icon in top-right corner
- Expected State: Settings menu is displayed
- Assertions:
  - Verify settings dropdown menu is displayed
  - Verify user name or email is displayed in menu
  - Verify "Logout" option is visible in menu

## Expected Results
1. Login form accepts valid email and password
2. Login submission succeeds
3. User is authenticated and session is established
4. User is redirected to Home Screen
5. Home Screen displays correctly with all components
6. User session persists (verified by settings menu showing user info)
7. User can access authenticated features

## Assertions
1. Login form is displayed and functional
2. Email and password inputs accept and mask input correctly
3. Login button triggers authentication process
4. Authentication succeeds with valid credentials
5. Navigation to Home Screen occurs after successful login
6. Home Screen displays all required components
7. User session is established (JWT token is stored)
8. Settings menu shows authenticated user information

## Error Scenarios
This is a positive test case. Error scenarios are covered in `login-negative.md`.
