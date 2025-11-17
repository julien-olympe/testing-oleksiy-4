# Register User Test

## Test Name
`register-user.test.ts` - User Registration Tests

## Description
Comprehensive unit tests for the Register use case. Tests user account creation, email validation, password requirements, duplicate email handling, and session creation.

## Test Cases

### Test 1: Successful User Registration
**Test Name**: `should successfully register a new user with valid credentials`

**Description**: Verifies that a new user can register with valid email and password, account is created, credentials are stored securely, session is created, and user is redirected.

**Setup**:
- Mock database connection
- Mock password hashing (bcrypt)
- Mock JWT token generation
- Mock session creation
- Clear any existing test users

**Test Steps**:
1. Prepare valid registration data: email "user@example.com", password "Password123"
2. Call register API endpoint with registration data
3. Verify email format validation passes
4. Verify password requirements validation passes (min 8 chars, uppercase, lowercase, number)
5. Verify email uniqueness check (email not already registered)
6. Verify password is hashed with bcrypt (cost factor 12)
7. Verify user record is created in database with correct attributes
8. Verify session is created
9. Verify JWT token is generated
10. Verify response indicates success

**Expected Results**:
- Status code: 201 (Created)
- Response contains user ID (UUID)
- Response contains authentication token
- User record exists in database with:
  - `id`: Valid UUID
  - `email`: "user@example.com"
  - `password_hash`: Bcrypt hash (not plain password)
  - `created_at`: Current timestamp
- Session is created and associated with user
- No errors occur

**Test Data**:
- Email: "user@example.com"
- Password: "Password123"
- Additional fields: None (based on specs)

**Mocks/Stubs Required**:
- Database connection mock
- bcrypt.hash() mock (returns hashed password)
- JWT token generation mock
- Session storage mock

**Assertions**:
1. Assert status code is 201
2. Assert response contains user ID
3. Assert response contains authentication token
4. Assert user record exists in database
5. Assert password is hashed (not plain text)
6. Assert email matches input
7. Assert created_at timestamp is set
8. Assert session is created

---

### Test 2: Registration with Duplicate Email
**Test Name**: `should reject registration when email is already registered`

**Description**: Verifies that registration fails when attempting to register with an email that already exists in the system.

**Setup**:
- Mock database connection
- Create existing user with email "existing@example.com"
- Mock database query to return existing user

**Test Steps**:
1. Prepare registration data with email "existing@example.com"
2. Call register API endpoint
3. Verify email uniqueness check detects existing email
4. Verify user record is NOT created
5. Verify error response is returned

**Expected Results**:
- Status code: 400 (Bad Request)
- Error message: "Email already registered"
- No user record created
- No session created
- No authentication token generated

**Test Data**:
- Email: "existing@example.com" (already exists)
- Password: "Password123"

**Mocks/Stubs Required**:
- Database connection mock
- Database query mock (returns existing user)

**Assertions**:
1. Assert status code is 400
2. Assert error message is "Email already registered"
3. Assert no new user record is created
4. Assert no session is created

---

### Test 3: Registration with Invalid Email Format
**Test Name**: `should reject registration when email format is invalid`

**Description**: Verifies that registration fails when email format is invalid.

**Test Steps**:
1. Prepare registration data with invalid email formats:
   - "invalid-email" (no @)
   - "@example.com" (no local part)
   - "user@" (no domain)
   - "user@.com" (invalid domain)
   - "user @example.com" (space in email)
2. For each invalid email, call register API endpoint
3. Verify email format validation fails
4. Verify user record is NOT created

**Expected Results**:
- Status code: 400 (Bad Request)
- Error message: "Invalid email format"
- No user record created
- No session created

**Test Data**:
- Invalid emails: ["invalid-email", "@example.com", "user@", "user@.com", "user @example.com"]
- Password: "Password123"

**Mocks/Stubs Required**:
- Database connection mock
- Email validation function

**Assertions**:
1. Assert status code is 400 for each invalid email
2. Assert error message is "Invalid email format"
3. Assert no user record is created

---

### Test 4: Registration with Weak Password
**Test Name**: `should reject registration when password does not meet requirements`

**Description**: Verifies that registration fails when password does not meet complexity requirements (minimum 8 characters, at least one uppercase, one lowercase, one number).

**Test Steps**:
1. Prepare registration data with weak passwords:
   - "short" (too short, < 8 chars)
   - "nouppercase123" (no uppercase)
   - "NOLOWERCASE123" (no lowercase)
   - "NoNumbers" (no numbers)
   - "12345678" (no letters)
2. For each weak password, call register API endpoint
3. Verify password validation fails
4. Verify user record is NOT created

**Expected Results**:
- Status code: 400 (Bad Request)
- Error message: "Password does not meet requirements"
- No user record created
- No session created

**Test Data**:
- Email: "user@example.com"
- Weak passwords: ["short", "nouppercase123", "NOLOWERCASE123", "NoNumbers", "12345678"]

**Mocks/Stubs Required**:
- Database connection mock
- Password validation function

**Assertions**:
1. Assert status code is 400 for each weak password
2. Assert error message is "Password does not meet requirements"
3. Assert no user record is created

---

### Test 5: Registration with Null/Empty Email
**Test Name**: `should reject registration when email is null or empty`

**Description**: Verifies that registration fails when email is null, undefined, or empty string.

**Test Steps**:
1. Prepare registration data with null/empty email:
   - Email: null
   - Email: undefined
   - Email: "" (empty string)
   - Email: "   " (whitespace only)
2. For each case, call register API endpoint
3. Verify email validation fails
4. Verify user record is NOT created

**Expected Results**:
- Status code: 400 (Bad Request)
- Error message: "Email is required" or "Invalid email format"
- No user record created

**Test Data**:
- Email: null, undefined, "", "   "
- Password: "Password123"

**Mocks/Stubs Required**:
- Database connection mock

**Assertions**:
1. Assert status code is 400
2. Assert error message indicates email is required or invalid
3. Assert no user record is created

---

### Test 6: Registration with Null/Empty Password
**Test Name**: `should reject registration when password is null or empty`

**Description**: Verifies that registration fails when password is null, undefined, or empty string.

**Test Steps**:
1. Prepare registration data with null/empty password:
   - Password: null
   - Password: undefined
   - Password: "" (empty string)
2. For each case, call register API endpoint
3. Verify password validation fails
4. Verify user record is NOT created

**Expected Results**:
- Status code: 400 (Bad Request)
- Error message: "Password is required" or "Password does not meet requirements"
- No user record created

**Test Data**:
- Email: "user@example.com"
- Password: null, undefined, ""

**Mocks/Stubs Required**:
- Database connection mock

**Assertions**:
1. Assert status code is 400
2. Assert error message indicates password is required or invalid
3. Assert no user record is created

---

### Test 7: Registration with Maximum Length Email
**Test Name**: `should handle registration with maximum length email`

**Description**: Verifies that registration works with email at maximum supported length (boundary testing).

**Test Steps**:
1. Prepare registration data with email at maximum length (typically 254 characters for email standard)
2. Call register API endpoint
3. Verify email validation passes
4. Verify user record is created

**Expected Results**:
- Status code: 201 (Created)
- User record created successfully
- Email stored correctly

**Test Data**:
- Email: "a" * 64 + "@" + "example." + "a" * 63 + ".com" (254 chars total)
- Password: "Password123"

**Mocks/Stubs Required**:
- Database connection mock
- bcrypt.hash() mock
- JWT token generation mock

**Assertions**:
1. Assert status code is 201
2. Assert user record is created
3. Assert email is stored correctly

---

### Test 8: Registration Database Transaction Rollback
**Test Name**: `should rollback transaction when user creation fails after validation`

**Description**: Verifies that database transaction is rolled back if user creation fails after validation passes.

**Setup**:
- Mock database connection
- Mock database insert to throw error after validation

**Test Steps**:
1. Prepare valid registration data
2. Call register API endpoint
3. Simulate database error during user creation
4. Verify transaction is rolled back
5. Verify no partial data is saved

**Expected Results**:
- Status code: 500 (Internal Server Error)
- Error message: "Failed to create project" or generic error
- No user record created
- Transaction rolled back completely

**Test Data**:
- Email: "user@example.com"
- Password: "Password123"

**Mocks/Stubs Required**:
- Database connection mock (throws error on insert)
- Transaction mock

**Assertions**:
1. Assert status code is 500
2. Assert no user record is created
3. Assert transaction was rolled back
