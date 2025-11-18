# Registration Negative Test

## Test Name
User Registration - Error Cases

## Description
This test verifies that the registration system properly handles invalid inputs and error conditions. It tests email format validation, duplicate email detection, and password requirement validation.

## Prerequisites
1. Application is running and accessible at the configured base URL
2. Database is accessible
3. A test user with email `existing-user@example.com` already exists in the system (created before test)
4. Browser automation environment is set up with Playwright

## Test Steps

### Test Case 1: Invalid Email Format

**Step 1.1: Navigate to Login Screen**
- Action: Open browser and navigate to base URL
- Expected State: Login Screen is displayed
- Assertions:
  - Verify registration form is visible

**Step 1.2: Enter Invalid Email Format**
- Action: Fill registration form with:
  - Email: `invalid-email-format` (missing @ and domain)
  - Password: `TestPassword123!`
- Expected State: Form fields are filled
- Assertions:
  - Verify email input contains entered value

**Step 1.3: Submit Registration**
- Action: Click the "Register" button
- Expected State: Registration is rejected
- Assertions:
  - Verify error message is displayed: "Invalid email format"
  - Verify user remains on Login Screen
  - Verify registration form is not cleared (or is cleared but error is shown)

### Test Case 2: Duplicate Email

**Step 2.1: Enter Existing Email**
- Action: Fill registration form with:
  - Email: `existing-user@example.com` (already exists in database)
  - Password: `TestPassword123!`
- Expected State: Form fields are filled
- Assertions:
  - Verify email input contains entered email

**Step 2.2: Submit Registration**
- Action: Click the "Register" button
- Expected State: Registration is rejected
- Assertions:
  - Verify error message is displayed: "Email already registered"
  - Verify user remains on Login Screen

### Test Case 3: Password Too Short

**Step 3.1: Enter Short Password**
- Action: Fill registration form with:
  - Email: `test-user-short-pwd-${timestamp}@example.com`
  - Password: `Short1!` (less than 8 characters)
- Expected State: Form fields are filled
- Assertions:
  - Verify password input contains entered value

**Step 3.2: Submit Registration**
- Action: Click the "Register" button
- Expected State: Registration is rejected
- Assertions:
  - Verify error message is displayed: "Invalid password format" or "Password must be at least 8 characters"
  - Verify user remains on Login Screen

### Test Case 4: Empty Email

**Step 4.1: Enter Empty Email**
- Action: Fill registration form with:
  - Email: `` (empty)
  - Password: `TestPassword123!`
- Expected State: Email field is empty
- Assertions:
  - Verify email input is empty

**Step 4.2: Submit Registration**
- Action: Click the "Register" button
- Expected State: Registration is rejected
- Assertions:
  - Verify error message is displayed: "Email is required" or "Invalid email format"
  - Verify user remains on Login Screen

### Test Case 5: Empty Password

**Step 5.1: Enter Empty Password**
- Action: Fill registration form with:
  - Email: `test-user-empty-pwd-${timestamp}@example.com`
  - Password: `` (empty)
- Expected State: Password field is empty
- Assertions:
  - Verify password input is empty

**Step 5.2: Submit Registration**
- Action: Click the "Register" button
- Expected State: Registration is rejected
- Assertions:
  - Verify error message is displayed: "Password is required" or "Invalid password format"
  - Verify user remains on Login Screen

## Expected Results
1. Invalid email format is rejected with appropriate error message
2. Duplicate email is rejected with "Email already registered" message
3. Password that is too short is rejected with password format error
4. Empty email is rejected with validation error
5. Empty password is rejected with validation error
6. User remains on Login Screen for all error cases
7. Error messages are displayed and visible to user

## Assertions
1. Error messages match specifications exactly:
   - "Invalid email format" for invalid email format
   - "Email already registered" for duplicate email
   - "Invalid password format" for invalid password
2. User is not redirected away from Login Screen on errors
3. Registration form remains accessible after errors
4. Error messages are user-friendly and actionable
5. No user account is created for any error case

## Error Scenarios
All test cases in this file are error scenarios. Each test case verifies a specific error condition:
- Invalid email format validation
- Duplicate email detection
- Password length validation
- Required field validation (empty email)
- Required field validation (empty password)
