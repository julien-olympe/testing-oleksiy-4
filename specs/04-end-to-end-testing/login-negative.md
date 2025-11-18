# Login Negative Test

## Test Name
User Login - Error Cases

## Description
This test verifies that the login system properly handles invalid credentials and error conditions. It tests incorrect password, non-existent user, and invalid email format scenarios.

## Prerequisites
1. Application is running and accessible at the configured base URL
2. Database is accessible
3. A test user with email `existing-user@example.com` and password `CorrectPassword123!` exists in the system (created before test)
4. Browser automation environment is set up with Playwright

## Test Steps

### Test Case 1: Incorrect Password

**Step 1.1: Navigate to Login Screen**
- Action: Open browser and navigate to base URL
- Expected State: Login Screen is displayed
- Assertions:
  - Verify login form is visible

**Step 1.2: Enter Valid Email with Incorrect Password**
- Action: Fill login form with:
  - Email: `existing-user@example.com`
  - Password: `WrongPassword123!` (incorrect password)
- Expected State: Form fields are filled
- Assertions:
  - Verify email input contains entered email
  - Verify password input is masked

**Step 1.3: Submit Login**
- Action: Click the "Login" button
- Expected State: Login is rejected
- Assertions:
  - Verify error message is displayed: "Invalid email or password"
  - Verify user remains on Login Screen
  - Verify login form is not cleared (or password is cleared but email remains)

### Test Case 2: Non-Existent User

**Step 2.1: Enter Non-Existent Email**
- Action: Fill login form with:
  - Email: `nonexistent-user-${timestamp}@example.com` (does not exist in database)
  - Password: `AnyPassword123!`
- Expected State: Form fields are filled
- Assertions:
  - Verify email input contains entered email

**Step 2.2: Submit Login**
- Action: Click the "Login" button
- Expected State: Login is rejected
- Assertions:
  - Verify error message is displayed: "Invalid email or password" or "User not found"
  - Verify user remains on Login Screen

### Test Case 3: Invalid Email Format

**Step 3.1: Enter Invalid Email Format**
- Action: Fill login form with:
  - Email: `invalid-email-format` (missing @ and domain)
  - Password: `AnyPassword123!`
- Expected State: Form fields are filled
- Assertions:
  - Verify email input contains entered value

**Step 3.2: Submit Login**
- Action: Click the "Login" button
- Expected State: Login is rejected
- Assertions:
  - Verify error message is displayed: "Invalid email format"
  - Verify user remains on Login Screen

### Test Case 4: Empty Email

**Step 4.1: Enter Empty Email**
- Action: Fill login form with:
  - Email: `` (empty)
  - Password: `AnyPassword123!`
- Expected State: Email field is empty
- Assertions:
  - Verify email input is empty

**Step 4.2: Submit Login**
- Action: Click the "Login" button
- Expected State: Login is rejected
- Assertions:
  - Verify error message is displayed: "Email is required" or "Invalid email format"
  - Verify user remains on Login Screen

### Test Case 5: Empty Password

**Step 5.1: Enter Empty Password**
- Action: Fill login form with:
  - Email: `existing-user@example.com`
  - Password: `` (empty)
- Expected State: Password field is empty
- Assertions:
  - Verify password input is empty

**Step 5.2: Submit Login**
- Action: Click the "Login" button
- Expected State: Login is rejected
- Assertions:
  - Verify error message is displayed: "Password is required" or "Invalid email or password"
  - Verify user remains on Login Screen

## Expected Results
1. Incorrect password is rejected with "Invalid email or password" message
2. Non-existent user is rejected with "Invalid email or password" or "User not found" message
3. Invalid email format is rejected with "Invalid email format" message
4. Empty email is rejected with validation error
5. Empty password is rejected with validation error
6. User remains on Login Screen for all error cases
7. Error messages are displayed and visible to user
8. No user session is established for any error case

## Assertions
1. Error messages match specifications exactly:
   - "Invalid email or password" for incorrect credentials
   - "Invalid email format" for invalid email format
   - Appropriate messages for empty fields
2. User is not redirected away from Login Screen on errors
3. Login form remains accessible after errors
4. Error messages are user-friendly
5. No authentication occurs for any error case
6. No session is established for any error case

## Error Scenarios
All test cases in this file are error scenarios. Each test case verifies a specific error condition:
- Incorrect password handling
- Non-existent user handling
- Invalid email format validation
- Required field validation (empty email)
- Required field validation (empty password)
