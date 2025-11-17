# Logout User Test Scenarios

## Test ID: LOGOUT-001
## Test Name: Logout User - Positive Case
## Test Type: Positive
## Related Use Cases: Logout

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is on Home Screen (or any authenticated screen)
- Session is active

### Test Data
- No test data required

### Test Steps
1. Verify user is logged in and on an authenticated screen (e.g., Home Screen)
2. Verify settings icon (round icon) is visible in top-right corner
3. Click settings icon in top-right corner
4. Verify settings menu is displayed
5. Verify settings menu shows user name (e.g., "testuser@example.com" or user's display name)
6. Verify settings menu shows logout option
7. Click logout option
8. Verify logout is successful
9. Verify session is invalidated
10. Verify user data is cleared from session
11. Verify user is redirected to Login Screen
12. Verify Login Screen is displayed correctly
13. Verify user is no longer authenticated

### Expected Results
- Settings icon is visible and clickable
- Settings menu opens when icon is clicked
- Settings menu displays user name and logout option
- Logout option is clickable
- Logout is successful
- Session is terminated
- User is redirected to Login Screen
- Login Screen displays correctly
- User is no longer authenticated
- No error messages are displayed

### Postconditions
- User session is invalidated
- User is logged out
- User is on Login Screen
- User cannot access authenticated features without logging in again
- User data is cleared from session

---

## Test ID: LOGOUT-002
## Test Name: Logout User - Verify Cannot Access Authenticated Features After Logout
## Test Type: Positive (Verification)
## Related Use Cases: Logout

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User was logged in and has logged out
- User is on Login Screen

### Test Data
- No test data required

### Test Steps
1. Verify user is on Login Screen after logout
2. Attempt to navigate to Home Screen by typing URL directly (if applicable) or using browser back button
3. Verify user is redirected back to Login Screen OR access is denied
4. Verify user cannot access Home Screen without authentication
5. Verify user cannot access Project Editor without authentication
6. Verify user cannot access Function Editor without authentication
7. Verify any API calls to authenticated endpoints would fail (if testable)

### Expected Results
- User cannot access authenticated screens without logging in
- User is redirected to Login Screen when attempting to access protected resources
- Authentication is required for all protected features

### Postconditions
- User remains logged out
- User is on Login Screen
- Protected resources are inaccessible
