# Login User Test Scenarios

## Test ID: LOGIN-001
## Test Name: Login User - Positive Case
## Test Type: Positive
## Related Use Cases: Login

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is on Login Screen
- User is not currently logged in

### Test Data
- Email: "testuser@example.com"
- Password: "SecurePass123!"

### Test Steps
1. Navigate to Login Screen
2. Verify Login Screen is displayed with email input field, password input field, Login button, and Register button
3. Enter "testuser@example.com" in email input field
4. Enter "SecurePass123!" in password input field
5. Click Login button
6. Verify login is successful
7. Verify user is authenticated
8. Verify session is created
9. Verify user is redirected to Home Screen
10. Verify Home Screen displays correctly
11. Verify no error messages are displayed

### Expected Results
- Login Screen is displayed correctly
- User can enter email and password
- Login submission is successful
- User is authenticated after login
- Session is created and active
- User is redirected to Home Screen
- Home Screen displays correctly
- No error messages are displayed

### Postconditions
- User is logged in and authenticated
- Session is active
- User is on Home Screen
- User can access authenticated features

---

## Test ID: LOGIN-002
## Test Name: Login User - Negative Case - Invalid Email
## Test Type: Negative
## Related Use Cases: Login

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is on Login Screen
- User is not currently logged in

### Test Data
- Email: "wrongemail@example.com" (email does not exist in system)
- Password: "SecurePass123!"

### Test Steps
1. Navigate to Login Screen
2. Verify Login Screen is displayed
3. Enter "wrongemail@example.com" in email input field
4. Enter "SecurePass123!" in password input field
5. Click Login button
6. Verify login fails
7. Verify error message "Invalid email or password" is displayed
8. Verify error message is clearly visible (typically below form)
9. Verify user remains on Login Screen
10. Verify user is not authenticated
11. Verify user is not redirected to Home Screen
12. Verify no session is created

### Expected Results
- Login Screen is displayed
- Error message "Invalid email or password" is displayed after submission
- Error message is clearly visible
- User remains on Login Screen
- User is not authenticated
- User is not redirected
- No session is created

### Postconditions
- User is not logged in
- No session is created
- User remains on Login Screen
- User cannot access authenticated features

---

## Test ID: LOGIN-003
## Test Name: Login User - Negative Case - Invalid Password
## Test Type: Negative
## Related Use Cases: Login

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is on Login Screen
- User is not currently logged in

### Test Data
- Email: "testuser@example.com"
- Password: "WrongPassword123!" (incorrect password)

### Test Steps
1. Navigate to Login Screen
2. Verify Login Screen is displayed
3. Enter "testuser@example.com" in email input field
4. Enter "WrongPassword123!" in password input field
5. Click Login button
6. Verify login fails
7. Verify error message "Invalid email or password" is displayed
8. Verify error message is clearly visible (typically below form)
9. Verify user remains on Login Screen
10. Verify user is not authenticated
11. Verify user is not redirected to Home Screen
12. Verify no session is created

### Expected Results
- Login Screen is displayed
- Error message "Invalid email or password" is displayed after submission
- Error message is clearly visible
- User remains on Login Screen
- User is not authenticated
- User is not redirected
- No session is created

### Postconditions
- User is not logged in
- No session is created
- User remains on Login Screen
- User cannot access authenticated features

---

## Test ID: LOGIN-004
## Test Name: Login User - Negative Case - Empty Email Field
## Test Type: Negative
## Related Use Cases: Login

### Preconditions
- Application is accessible and running
- User is on Login Screen
- User is not currently logged in

### Test Data
- Email: "" (empty)
- Password: "SecurePass123!"

### Test Steps
1. Navigate to Login Screen
2. Verify Login Screen is displayed
3. Leave email input field empty
4. Enter "SecurePass123!" in password input field
5. Attempt to click Login button
6. Verify form validation prevents submission OR login fails with appropriate error
7. Verify error message is displayed indicating email is required or invalid
8. Verify user remains on Login Screen
9. Verify user is not authenticated

### Expected Results
- Login Screen is displayed
- Form validation prevents submission OR error message is displayed
- Error message indicates email field is required or invalid
- User remains on Login Screen
- User is not authenticated

### Postconditions
- User is not logged in
- No session is created
- User remains on Login Screen

---

## Test ID: LOGIN-005
## Test Name: Login User - Negative Case - Empty Password Field
## Test Type: Negative
## Related Use Cases: Login

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com"
- User is on Login Screen
- User is not currently logged in

### Test Data
- Email: "testuser@example.com"
- Password: "" (empty)

### Test Steps
1. Navigate to Login Screen
2. Verify Login Screen is displayed
3. Enter "testuser@example.com" in email input field
4. Leave password input field empty
5. Attempt to click Login button
6. Verify form validation prevents submission OR login fails with appropriate error
7. Verify error message is displayed indicating password is required
8. Verify user remains on Login Screen
9. Verify user is not authenticated

### Expected Results
- Login Screen is displayed
- Form validation prevents submission OR error message is displayed
- Error message indicates password field is required
- User remains on Login Screen
- User is not authenticated

### Postconditions
- User is not logged in
- No session is created
- User remains on Login Screen

---

## Test ID: LOGIN-006
## Test Name: Login User - Negative Case - Both Fields Empty
## Test Type: Negative
## Related Use Cases: Login

### Preconditions
- Application is accessible and running
- User is on Login Screen
- User is not currently logged in

### Test Data
- Email: "" (empty)
- Password: "" (empty)

### Test Steps
1. Navigate to Login Screen
2. Verify Login Screen is displayed
3. Leave email input field empty
4. Leave password input field empty
5. Attempt to click Login button
6. Verify form validation prevents submission OR login fails with appropriate error
7. Verify error message is displayed indicating required fields are missing
8. Verify user remains on Login Screen
9. Verify user is not authenticated

### Expected Results
- Login Screen is displayed
- Form validation prevents submission OR error message is displayed
- Error message indicates required fields are missing
- User remains on Login Screen
- User is not authenticated

### Postconditions
- User is not logged in
- No session is created
- User remains on Login Screen
