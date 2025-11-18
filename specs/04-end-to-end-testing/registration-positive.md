# Registration Positive Test

## Test Name
User Registration - Successful Registration

## Description
This test verifies that a new user can successfully register in the system by providing valid email and password. Upon successful registration, the user account is created and the user is redirected to the Login Screen with a success message.

## Prerequisites
1. Application is running and accessible at the configured base URL
2. Database is accessible
3. No existing user with email `test-user-${timestamp}@example.com` exists
4. Browser automation environment is set up with Playwright

## Test Steps

**Step 1: Navigate to Login Screen**
- Action: Open browser and navigate to base URL
- Expected State: Login Screen is displayed
- Assertions:
  - Verify URL contains `/login` or is root URL showing login form
  - Verify login form is visible (email input, password input, Login button)
  - Verify registration form is visible (email input, password input, Register button)

**Step 2: Fill Registration Form**
- Action: Fill registration form with:
  - Email: `test-user-${timestamp}@example.com` (where timestamp is current timestamp)
  - Password: `TestPassword123!` (meets minimum 8 characters requirement)
- Expected State: Form fields are filled with entered values
- Assertions:
  - Verify email input contains entered email
  - Verify password input is masked (type="password")

**Step 3: Submit Registration**
- Action: Click the "Register" button
- Expected State: Registration is processed and user account is created
- Assertions:
  - Wait for registration to complete (navigation or success message)
  - Verify success message is displayed: "Registration successful" or similar confirmation message
  - Verify user remains on Login Screen (or is redirected to Login Screen)
  - Verify registration form is cleared or reset

**Step 4: Verify User Can Login**
- Action: Fill login form with registered credentials:
  - Email: `test-user-${timestamp}@example.com`
  - Password: `TestPassword123!`
- Expected State: Login form is filled
- Assertions:
  - Verify email input contains entered email
  - Verify password input is masked

**Step 5: Submit Login**
- Action: Click the "Login" button
- Expected State: User is authenticated and redirected to Home Screen
- Assertions:
  - Wait for navigation to Home Screen
  - Verify URL changes to Home Screen URL
  - Verify Home Screen is displayed (project list area is visible)
  - Verify settings icon is visible in top-right corner

## Expected Results
1. Registration form accepts valid email and password
2. Registration submission succeeds
3. Success message is displayed
4. User remains on or is redirected to Login Screen
5. Registered user can successfully log in with the created credentials
6. User is redirected to Home Screen after login

## Assertions
1. Registration form is displayed and functional
2. Email and password inputs accept and mask input correctly
3. Registration button triggers registration process
4. Success message appears after successful registration
5. User account is created in database (verified by successful login)
6. Login with registered credentials succeeds
7. Home Screen is displayed after successful login

## Error Scenarios
This is a positive test case. Error scenarios are covered in `registration-negative.md`.
