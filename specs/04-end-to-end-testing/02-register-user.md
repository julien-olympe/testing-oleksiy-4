# Register User Test Scenarios

## Test ID: REG-001
## Test Name: Register User - Positive Case
## Test Type: Positive
## Related Use Cases: Register

### Preconditions
- Application is accessible and running
- No user account exists with email "newuser@example.com"
- User is on Login Screen

### Test Data
- Email: "newuser@example.com"
- Password: "SecurePass123!"
- Additional required fields (if any): As per registration form requirements

### Test Steps
1. Navigate to Login Screen
2. Verify Login Screen is displayed with email input field, password input field, Login button, and Register button
3. Click Register button
4. Verify registration form is displayed
5. Enter "newuser@example.com" in email input field
6. Enter "SecurePass123!" in password input field
7. Complete any additional required registration fields (if any)
8. Submit registration form
9. Verify registration is successful
10. Verify user is automatically logged in
11. Verify user is redirected to Home Screen
12. Verify Home Screen displays empty project list
13. Verify no error messages are displayed

### Expected Results
- Registration form is displayed after clicking Register button
- User can enter email and password
- Registration submission is successful
- User is automatically authenticated after registration
- User is redirected to Home Screen
- Home Screen displays correctly with empty project list
- No error messages are displayed

### Postconditions
- User account exists with email "newuser@example.com"
- User is logged in and authenticated
- User is on Home Screen
- Session is active

---

## Test ID: REG-002
## Test Name: Register User - Negative Case - Email Already Registered
## Test Type: Negative
## Related Use Cases: Register

### Preconditions
- Application is accessible and running
- User account already exists with email "existinguser@example.com"
- User is on Login Screen

### Test Data
- Email: "existinguser@example.com"
- Password: "SecurePass123!"

### Test Steps
1. Navigate to Login Screen
2. Verify Login Screen is displayed
3. Click Register button
4. Verify registration form is displayed
5. Enter "existinguser@example.com" in email input field
6. Enter "SecurePass123!" in password input field
7. Complete any additional required registration fields (if any)
8. Submit registration form
9. Verify registration fails
10. Verify error message "Email already registered" is displayed
11. Verify user remains on registration form
12. Verify user is not logged in
13. Verify user is not redirected to Home Screen

### Expected Results
- Registration form is displayed
- Error message "Email already registered" is displayed after submission
- Error message is clearly visible (typically below form or near email field)
- User remains on registration form
- User is not authenticated
- User is not redirected

### Postconditions
- No new user account is created
- Existing user account with "existinguser@example.com" remains unchanged
- User is not logged in
- User remains on Login Screen with registration form displayed

---

## Test ID: REG-003
## Test Name: Register User - Negative Case - Invalid Email Format
## Test Type: Negative
## Related Use Cases: Register

### Preconditions
- Application is accessible and running
- No user account exists with email "invalid-email"
- User is on Login Screen

### Test Data
- Email: "invalid-email" (invalid format, missing @ and domain)
- Password: "SecurePass123!"

### Test Steps
1. Navigate to Login Screen
2. Verify Login Screen is displayed
3. Click Register button
4. Verify registration form is displayed
5. Enter "invalid-email" in email input field
6. Enter "SecurePass123!" in password input field
7. Complete any additional required registration fields (if any)
8. Submit registration form
9. Verify registration fails
10. Verify error message "Invalid email format" is displayed
11. Verify user remains on registration form
12. Verify user is not logged in
13. Verify user is not redirected to Home Screen

### Expected Results
- Registration form is displayed
- Error message "Invalid email format" is displayed after submission
- Error message is clearly visible (typically below form or near email field)
- User remains on registration form
- User is not authenticated
- User is not redirected

### Postconditions
- No user account is created
- User is not logged in
- User remains on Login Screen with registration form displayed

---

## Test ID: REG-004
## Test Name: Register User - Negative Case - Password Does Not Meet Requirements
## Test Type: Negative
## Related Use Cases: Register

### Preconditions
- Application is accessible and running
- No user account exists with email "newuser2@example.com"
- User is on Login Screen
- System has password requirements (e.g., minimum length, special characters)

### Test Data
- Email: "newuser2@example.com"
- Password: "weak" (does not meet password requirements)

### Test Steps
1. Navigate to Login Screen
2. Verify Login Screen is displayed
3. Click Register button
4. Verify registration form is displayed
5. Enter "newuser2@example.com" in email input field
6. Enter "weak" in password input field
7. Complete any additional required registration fields (if any)
8. Submit registration form
9. Verify registration fails
10. Verify error message "Password does not meet requirements" is displayed
11. Verify user remains on registration form
12. Verify user is not logged in
13. Verify user is not redirected to Home Screen

### Expected Results
- Registration form is displayed
- Error message "Password does not meet requirements" is displayed after submission
- Error message is clearly visible (typically below form or near password field)
- User remains on registration form
- User is not authenticated
- User is not redirected

### Postconditions
- No user account is created
- User is not logged in
- User remains on Login Screen with registration form displayed

---

## Test ID: REG-005
## Test Name: Register User - Negative Case - Empty Email Field
## Test Type: Negative
## Related Use Cases: Register

### Preconditions
- Application is accessible and running
- User is on Login Screen

### Test Data
- Email: "" (empty)
- Password: "SecurePass123!"

### Test Steps
1. Navigate to Login Screen
2. Verify Login Screen is displayed
3. Click Register button
4. Verify registration form is displayed
5. Leave email input field empty
6. Enter "SecurePass123!" in password input field
7. Complete any additional required registration fields (if any)
8. Attempt to submit registration form
9. Verify form validation prevents submission OR registration fails with appropriate error
10. Verify error message is displayed indicating email is required or invalid
11. Verify user remains on registration form
12. Verify user is not logged in

### Expected Results
- Registration form is displayed
- Form validation prevents submission OR error message is displayed
- Error message indicates email field is required or invalid
- User remains on registration form
- User is not authenticated

### Postconditions
- No user account is created
- User is not logged in
- User remains on Login Screen with registration form displayed

---

## Test ID: REG-006
## Test Name: Register User - Negative Case - Empty Password Field
## Test Type: Negative
## Related Use Cases: Register

### Preconditions
- Application is accessible and running
- No user account exists with email "newuser3@example.com"
- User is on Login Screen

### Test Data
- Email: "newuser3@example.com"
- Password: "" (empty)

### Test Steps
1. Navigate to Login Screen
2. Verify Login Screen is displayed
3. Click Register button
4. Verify registration form is displayed
5. Enter "newuser3@example.com" in email input field
6. Leave password input field empty
7. Complete any additional required registration fields (if any)
8. Attempt to submit registration form
9. Verify form validation prevents submission OR registration fails with appropriate error
10. Verify error message is displayed indicating password is required
11. Verify user remains on registration form
12. Verify user is not logged in

### Expected Results
- Registration form is displayed
- Form validation prevents submission OR error message is displayed
- Error message indicates password field is required
- User remains on registration form
- User is not authenticated

### Postconditions
- No user account is created
- User is not logged in
- User remains on Login Screen with registration form displayed
