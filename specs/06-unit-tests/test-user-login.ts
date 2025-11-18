# User Login Unit Test Specification

## Test File: `user-login.test.ts`

### Purpose
Test the user login functionality, including successful authentication, invalid credentials, and edge cases.

### Functions/APIs Being Tested
- `POST /api/auth/login` endpoint
- User authentication service/function
- Email validation
- Password verification (bcrypt comparison)
- JWT token generation
- Session creation

### Test Cases

#### Test Case 1: Successful User Login
**Test Name**: `should authenticate user and return JWT token when valid credentials are provided`

**Description**: Verifies that a registered user can successfully log in with valid email and password.

**Setup**:
- Mock database connection pool
- Mock database query to return existing user with hashed password
- Mock bcrypt compare to return true (password matches)
- Mock JWT token generation

**Inputs**:
```typescript
{
  email: 'user@example.com',
  password: 'SecurePass123!'
}
```

**Actions**:
1. Call login endpoint with valid email and password
2. Verify email format validation passes
3. Verify database query finds user by email
4. Verify bcrypt compares password with stored hash
5. Verify JWT token is generated
6. Verify response includes token and user information

**Expected Outputs**:
- HTTP status: 200 (OK)
- Response body: `{ token: "jwt_token_string", user: { id: "user-uuid", email: "user@example.com" } }`
- Token payload includes: user ID, email, issued timestamp, expiration timestamp

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT'),
  expect.arrayContaining(['user@example.com'])
);
expect(bcrypt.compare).toHaveBeenCalledWith('SecurePass123!', 'hashed_password');
expect(jwt.sign).toHaveBeenCalledWith(
  expect.objectContaining({
    userId: 'user-uuid',
    email: 'user@example.com'
  }),
  expect.any(String),
  expect.objectContaining({ expiresIn: '24h' })
);
expect(reply.status).toHaveBeenCalledWith(200);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  token: expect.any(String),
  user: expect.objectContaining({
    id: 'user-uuid',
    email: 'user@example.com'
  })
}));
```

**Error Conditions**: None (positive test case)

---

#### Test Case 2: Login with Invalid Email
**Test Name**: `should return error when email does not exist in database`

**Description**: Verifies that login fails when email is not registered.

**Setup**:
- Mock database connection pool
- Mock database query to return empty result (user not found)

**Inputs**:
```typescript
{
  email: 'nonexistent@example.com',
  password: 'SecurePass123!'
}
```

**Actions**:
1. Call login endpoint with non-existent email
2. Verify database query finds no user
3. Verify password comparison is not attempted
4. Verify error response is returned

**Expected Outputs**:
- HTTP status: 401 (Unauthorized)
- Response body: `{ error: "Invalid email or password" }` (generic message for security)

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT'),
  expect.arrayContaining(['nonexistent@example.com'])
);
expect(bcrypt.compare).not.toHaveBeenCalled();
expect(reply.status).toHaveBeenCalledWith(401);
expect(reply.send).toHaveBeenCalledWith({ error: "Invalid email or password" });
```

**Error Conditions**: User not found

---

#### Test Case 3: Login with Incorrect Password
**Test Name**: `should return error when password is incorrect`

**Description**: Verifies that login fails when password doesn't match stored hash.

**Setup**:
- Mock database connection pool
- Mock database query to return existing user
- Mock bcrypt compare to return false (password doesn't match)

**Inputs**:
```typescript
{
  email: 'user@example.com',
  password: 'WrongPassword123!'
}
```

**Actions**:
1. Call login endpoint with correct email but wrong password
2. Verify database query finds user
3. Verify bcrypt compares password and returns false
4. Verify error response is returned

**Expected Outputs**:
- HTTP status: 401 (Unauthorized)
- Response body: `{ error: "Invalid email or password" }` (generic message for security)

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT'),
  expect.arrayContaining(['user@example.com'])
);
expect(bcrypt.compare).toHaveBeenCalledWith('WrongPassword123!', 'hashed_password');
expect(reply.status).toHaveBeenCalledWith(401);
expect(reply.send).toHaveBeenCalledWith({ error: "Invalid email or password" });
```

**Error Conditions**: Incorrect password

---

#### Test Case 4: Login with Invalid Email Format
**Test Name**: `should return error when email format is invalid`

**Description**: Verifies that login fails when email format is invalid.

**Setup**:
- Mock database connection pool (may not be called if validation happens first)

**Inputs**:
```typescript
{
  email: 'invalid-email',
  password: 'SecurePass123!'
}
```

**Actions**:
1. Call login endpoint with invalid email format
2. Verify email format validation fails
3. Verify database query is not executed
4. Verify error response is returned

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "Invalid email format" }`

**Assertions**:
```typescript
expect(mockQuery).not.toHaveBeenCalled();
expect(reply.status).toHaveBeenCalledWith(400);
expect(reply.send).toHaveBeenCalledWith({ error: "Invalid email format" });
```

**Error Conditions**: Invalid email format

---

#### Test Case 5: Login with Missing Email
**Test Name**: `should return error when email is missing`

**Description**: Verifies that login fails when email field is missing.

**Setup**:
- Mock database connection pool

**Inputs**:
```typescript
{
  password: 'SecurePass123!'
}
```

**Actions**:
1. Call login endpoint without email field
2. Verify validation detects missing email
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "Email is required" }` or similar validation error

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(400);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.stringContaining('email')
}));
```

**Error Conditions**: Missing required field

---

#### Test Case 6: Login with Missing Password
**Test Name**: `should return error when password is missing`

**Description**: Verifies that login fails when password field is missing.

**Setup**:
- Mock database connection pool

**Inputs**:
```typescript
{
  email: 'user@example.com'
}
```

**Actions**:
1. Call login endpoint without password field
2. Verify validation detects missing password
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "Password is required" }` or similar validation error

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(400);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.stringContaining('password')
}));
```

**Error Conditions**: Missing required field

---

#### Test Case 7: Login with Empty Email String
**Test Name**: `should return error when email is empty string`

**Description**: Verifies that login fails when email is an empty string.

**Setup**:
- Mock database connection pool

**Inputs**:
```typescript
{
  email: '',
  password: 'SecurePass123!'
}
```

**Actions**:
1. Call login endpoint with empty email string
2. Verify validation detects empty email
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "Email is required" }` or `{ error: "Invalid email format" }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(400);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.any(String)
}));
```

**Error Conditions**: Empty string validation

---

#### Test Case 8: Login with Empty Password String
**Test Name**: `should return error when password is empty string`

**Description**: Verifies that login fails when password is an empty string.

**Setup**:
- Mock database connection pool

**Inputs**:
```typescript
{
  email: 'user@example.com',
  password: ''
}
```

**Actions**:
1. Call login endpoint with empty password string
2. Verify validation detects empty password
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "Password is required" }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(400);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.stringContaining('password')
}));
```

**Error Conditions**: Empty string validation

---

#### Test Case 9: Login with Null Email
**Test Name**: `should return error when email is null`

**Description**: Verifies that login fails when email is null.

**Setup**:
- Mock database connection pool

**Inputs**:
```typescript
{
  email: null,
  password: 'SecurePass123!'
}
```

**Actions**:
1. Call login endpoint with null email
2. Verify validation detects null email
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "Email is required" }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(400);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.any(String)
}));
```

**Error Conditions**: Null value validation

---

#### Test Case 10: Login with Null Password
**Test Name**: `should return error when password is null`

**Description**: Verifies that login fails when password is null.

**Setup**:
- Mock database connection pool

**Inputs**:
```typescript
{
  email: 'user@example.com',
  password: null
}
```

**Actions**:
1. Call login endpoint with null password
2. Verify validation detects null password
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "Password is required" }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(400);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.stringContaining('password')
}));
```

**Error Conditions**: Null value validation

---

#### Test Case 11: Login with Database Error
**Test Name**: `should return error when database query fails`

**Description**: Verifies that login handles database errors gracefully.

**Setup**:
- Mock database connection pool
- Mock database query to throw error

**Inputs**:
```typescript
{
  email: 'user@example.com',
  password: 'SecurePass123!'
}
```

**Actions**:
1. Call login endpoint with valid credentials
2. Simulate database error (connection failure, query error, etc.)
3. Verify error is caught and handled
4. Verify appropriate error response is returned

**Expected Outputs**:
- HTTP status: 500 (Internal Server Error)
- Response body: `{ error: "Login failed" }` or generic error message (not exposing internal details)

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(500);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.any(String)
}));
expect(reply.send).toHaveBeenCalledWith(expect.not.objectContaining({
  error: expect.stringContaining('SQL')
})); // Should not expose SQL errors
```

**Error Conditions**: Database operation failure

---

#### Test Case 12: Login with JWT Generation Error
**Test Name**: `should return error when JWT token generation fails`

**Description**: Verifies that login handles JWT generation errors gracefully.

**Setup**:
- Mock database connection pool
- Mock database query to return user
- Mock bcrypt compare to return true
- Mock JWT sign to throw error

**Inputs**:
```typescript
{
  email: 'user@example.com',
  password: 'SecurePass123!'
}
```

**Actions**:
1. Call login endpoint with valid credentials
2. Simulate JWT generation error
3. Verify error is caught and handled
4. Verify appropriate error response is returned

**Expected Outputs**:
- HTTP status: 500 (Internal Server Error)
- Response body: `{ error: "Login failed" }` or generic error message

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(500);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.any(String)
}));
```

**Error Conditions**: JWT generation failure

---

### Mock Setup Requirements

```typescript
// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn((password, rounds) => Promise.resolve('hashed_password')),
  compare: jest.fn((password, hash) => Promise.resolve(true)),
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn((payload, secret, options) => 'mock_jwt_token'),
  verify: jest.fn((token, secret) => ({ userId: 'user-uuid', email: 'user@example.com' })),
}));

// Mock PostgreSQL
const mockQuery = jest.fn();
jest.mock('pg', () => ({
  Pool: jest.fn(() => ({
    query: mockQuery,
    connect: jest.fn(),
    end: jest.fn(),
  })),
}));

// Mock request/reply
const createMockRequest = (body) => ({
  body,
  headers: {},
  params: {},
  query: {},
});

const createMockReply = () => ({
  send: jest.fn(),
  status: jest.fn().mockReturnThis(),
  code: jest.fn().mockReturnThis(),
});
```

### Test Data Factories

```typescript
const createValidLoginData = () => ({
  email: 'user@example.com',
  password: 'SecurePass123!',
});

const createMockUser = () => ({
  id: 'user-uuid',
  email: 'user@example.com',
  password_hash: 'hashed_password',
  created_at: new Date('2024-01-01T00:00:00Z'),
  updated_at: new Date('2024-01-01T00:00:00Z'),
});
```

### Error Condition Summary
- User not found (invalid email)
- Incorrect password
- Invalid email format
- Missing email
- Missing password
- Empty email string
- Empty password string
- Null email
- Null password
- Database errors
- JWT generation errors
