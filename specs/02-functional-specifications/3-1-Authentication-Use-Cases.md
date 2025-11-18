# 3-1. Authentication Use Cases

## Use Case: User Registration

**Description**: A new user creates an account in the system by providing registration information. Upon successful registration, the user account is created and stored in the database.

**Actors Involved**: Unregistered user (prospective system user)

**Inputs and Their Sources**:
- Email address: User enters in registration form
- Password: User enters in registration form (exact format requirements to be defined in technical specifications)
- Any additional registration fields: User enters in registration form

**Processing/Actions**:
1. System displays registration form on Login Screen
2. User enters email address and password
3. User submits registration form
4. System validates email format
5. System checks if email already exists in database
6. If email exists, system displays error message
7. If email does not exist, system validates password requirements
8. If password invalid, system displays error message
9. If password valid, system creates user account in database
10. System stores user credentials securely (hashed password)
11. System redirects user to Login Screen with success message

**Outputs**:
- Success: User account created, redirect to Login Screen with confirmation message
- Error: "Email already registered" message displayed if email exists
- Error: "Invalid password format" message displayed if password does not meet requirements
- Error: "Invalid email format" message displayed if email format is invalid

## Use Case: User Login

**Description**: A registered user authenticates to the system by providing their email and password. Upon successful authentication, the user session is established and the user is redirected to the Home Screen.

**Actors Involved**: Registered user

**Inputs and Their Sources**:
- Email address: User enters in login form
- Password: User enters in login form

**Processing/Actions**:
1. System displays login form on Login Screen
2. User enters email address and password
3. User submits login form
4. System validates email format
5. System queries database for user with matching email
6. If user not found, system displays error message
7. If user found, system verifies password against stored hash
8. If password incorrect, system displays error message
9. If password correct, system creates user session
10. System stores session information
11. System redirects user to Home Screen

**Outputs**:
- Success: User session established, redirect to Home Screen showing user's projects
- Error: "Invalid email or password" message displayed if credentials are incorrect
- Error: "Invalid email format" message displayed if email format is invalid
- Error: "User not found" message displayed if email does not exist in database

## Use Case: User Logout

**Description**: A logged-in user terminates their session and returns to the Login Screen. All session data is cleared.

**Actors Involved**: Logged-in user

**Inputs and Their Sources**:
- Logout action: User clicks logout option in settings menu (accessed via round icon in top-right corner)

**Processing/Actions**:
1. User clicks round settings icon in top-right corner of any screen
2. System displays settings menu showing user name and logout option
3. User clicks logout option
4. System invalidates user session
5. System clears session data
6. System redirects user to Login Screen

**Outputs**:
- Success: Session terminated, redirect to Login Screen
- No error conditions: Logout always succeeds if user is authenticated
