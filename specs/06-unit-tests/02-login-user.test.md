# Login User Test

## Test Name
`login-user.test.ts` - User Authentication Tests

## Description
Comprehensive unit tests for the Login use case. Tests credential validation, session creation, authentication token generation, and error handling.

## Test Cases

### Test 1: Successful Login
**Test Name**: `should successfully login with valid credentials`

**Description**: Verifies that a registered user can authenticate with correct email and password, session is created, and user is redirected.

**Setup**:
- Mock database connection
- Create test user with email "user@example.com" and password hash
- Mock bcrypt.compare() to return true for correct password
- Mock JWT token generation
- Mock session creation

**Test Steps**:
1. Prepare login data: email "user@example.com", password "Password123"
2. Call login API endpoint with credentials
3. Verify user lookup by email
4. Verify password comparison using bcrypt.compare()
5. Verify session is created
6. Verify JWT token is generated
7. Verify response indicates success

**Expected Results**:
- Status code: 200 (OK)
- Response contains authentication token
- Response contains user information (ID, email)
- Session is created and associated with user
- No errors occur

**Test Data**:
- Email: "user@example.com"
- Password: "Password123"

**Mocks/Stubs Required**:
- Database connection mock
- bcrypt.compare() mock (returns true)
- JWT token generation mock
- Session storage mock

**Assertions**:
1. Assert status code is 200
2. Assert response contains authentication token
3. Assert response contains user ID
4. Assert session is created
5. Assert token expiration is set (24 hours)

---

### Test 2: Login with Invalid Email
**Test Name**: `should reject login when email does not exist`

**Description**: Verifies that login fails when email is not registered in the system.

**Setup**:
- Mock database connection
- Mock database query to return no user (null/undefined)

**Test Steps**:
1. Prepare login data with non-existent email "nonexistent@example.com"
2. Call login API endpoint
3. Verify user lookup returns no user
4. Verify error response is returned
5. Verify no session is created

**Expected Results**:
- Status code: 401 (Unauthorized)
- Error message: "Invalid email or password" (generic message for security)
- No session created
- No authentication token generated

**Test Data**:
- Email: "nonexistent@example.com"
- Password: "Password123"

**Mocks/Stubs Required**:
- Database connection mock
- Database query mock (returns null/undefined)

**Assertions**:
1. Assert status code is 401
2. Assert error message is "Invalid email or password"
3. Assert no session is created
4. Assert no token is generated

---

### Test 3: Login with Incorrect Password
**Test Name**: `should reject login when password is incorrect`

**Description**: Verifies that login fails when password does not match the stored hash.

**Setup**:
- Mock database connection
- Create test user with email "user@example.com" and password hash
- Mock bcrypt.compare() to return false for incorrect password

**Test Steps**:
1. Prepare login data: email "user@example.com", password "WrongPassword123"
2. Call login API endpoint
3. Verify user lookup succeeds
4. Verify password comparison fails
5. Verify error response is returned
6. Verify no session is created

**Expected Results**:
- Status code: 401 (Unauthorized)
- Error message: "Invalid email or password" (generic message for security)
- No session created
- No authentication token generated

**Test Data**:
- Email: "user@example.com"
- Password: "WrongPassword123"

**Mocks/Stubs Required**:
- Database connection mock
- bcrypt.compare() mock (returns false)

**Assertions**:
1. Assert status code is 401
2. Assert error message is "Invalid email or password"
3. Assert no session is created
4. Assert no token is generated

---

### Test 4: Login with Null/Empty Email
**Test Name**: `should reject login when email is null or empty`

**Description**: Verifies that login fails when email is null, undefined, or empty string.

**Test Steps**:
1. Prepare login data with null/empty email:
   - Email: null
   - Email: undefined
   - Email: "" (empty string)
   - Email: "   " (whitespace only)
2. For each case, call login API endpoint
3. Verify email validation fails
4. Verify error response is returned

**Expected Results**:
- Status code: 400 (Bad Request)
- Error message: "Email is required" or "Invalid email format"
- No session created

**Test Data**:
- Email: null, undefined, "", "   "
- Password: "Password123"

**Mocks/Stubs Required**:
- Database connection mock

**Assertions**:
1. Assert status code is 400
2. Assert error message indicates email is required or invalid
3. Assert no session is created

---

### Test 5: Login with Null/Empty Password
**Test Name**: `should reject login when password is null or empty`

**Description**: Verifies that login fails when password is null, undefined, or empty string.

**Test Steps**:
1. Prepare login data with null/empty password:
   - Password: null
   - Password: undefined
   - Password: "" (empty string)
2. For each case, call login API endpoint
3. Verify password validation fails
4. Verify error response is returned

**Expected Results**:
- Status code: 400 (Bad Request)
- Error message: "Password is required"
- No session created

**Test Data**:
- Email: "user@example.com"
- Password: null, undefined, ""

**Mocks/Stubs Required**:
- Database connection mock

**Assertions**:
1. Assert status code is 400
2. Assert error message indicates password is required
3. Assert no session is created

---

### Test 6: Login Response Time
**Test Name**: `should complete login within performance requirements`

**Description**: Verifies that login completes within the required response time (< 200ms).

**Setup**:
- Mock database connection (fast response)
- Mock bcrypt.compare() (fast response)
- Mock JWT token generation (fast response)

**Test Steps**:
1. Prepare valid login credentials
2. Call login API endpoint
3. Measure response time
4. Verify response time is < 200ms

**Expected Results**:
- Status code: 200 (OK)
- Response time: < 200ms
- Login succeeds

**Test Data**:
- Email: "user@example.com"
- Password: "Password123"

**Mocks/Stubs Required**:
- Database connection mock (with timing)
- bcrypt.compare() mock (with timing)
- JWT token generation mock (with timing)

**Assertions**:
1. Assert status code is 200
2. Assert response time is < 200ms
3. Assert login succeeds

---

### Test 7: Login with Invalid Email Format
**Test Name**: `should reject login when email format is invalid`

**Description**: Verifies that login fails when email format is invalid (before database lookup).

**Test Steps**:
1. Prepare login data with invalid email formats:
   - "invalid-email" (no @)
   - "@example.com" (no local part)
   - "user@" (no domain)
2. For each invalid email, call login API endpoint
3. Verify email format validation fails before database lookup
4. Verify error response is returned

**Expected Results**:
- Status code: 400 (Bad Request)
- Error message: "Invalid email format"
- No database lookup performed
- No session created

**Test Data**:
- Invalid emails: ["invalid-email", "@example.com", "user@"]
- Password: "Password123"

**Mocks/Stubs Required**:
- Email validation function

**Assertions**:
1. Assert status code is 400
2. Assert error message is "Invalid email format"
3. Assert no database query is made
4. Assert no session is created
