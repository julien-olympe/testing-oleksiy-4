# User Registration Unit Test Specification

## Test File: `user-registration.test.ts`

### Purpose
Test the user registration functionality, including successful registration, validation errors, and edge cases.

### Functions/APIs Being Tested
- `POST /api/auth/register` endpoint
- User registration service/function
- Email validation
- Password validation
- Database user creation

### Test Cases

#### Test Case 1: Successful User Registration
**Test Name**: `should create a new user account when valid email and password are provided`

**Description**: Verifies that a new user can successfully register with valid credentials.

**Setup**:
- Mock database connection pool
- Mock bcrypt hash function to return hashed password
- Mock database query to return empty result (email doesn't exist)
- Mock database INSERT query to return new user record

**Inputs**:
```typescript
{
  email: 'newuser@example.com',
  password: 'SecurePass123!'
}
```

**Actions**:
1. Call registration endpoint with valid email and password
2. Verify email format validation passes
3. Verify email uniqueness check (email doesn't exist)
4. Verify password is hashed using bcrypt
5. Verify user record is created in database
6. Verify response indicates success

**Expected Outputs**:
- HTTP status: 201 (Created) or 200 (OK)
- Response body: `{ message: "User registered successfully" }` or user object (without password)
- User record created in database with:
  - `id`: UUID
  - `email`: 'newuser@example.com'
  - `password_hash`: Hashed password (not plain text)
  - `created_at`: Timestamp
  - `updated_at`: Timestamp

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT'),
  expect.arrayContaining(['newuser@example.com'])
);
expect(bcrypt.hash).toHaveBeenCalledWith('SecurePass123!', 10);
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('INSERT'),
  expect.arrayContaining([expect.any(String), 'newuser@example.com', expect.any(String)])
);
expect(reply.status).toHaveBeenCalledWith(201);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  message: expect.stringContaining('success')
}));
```

**Error Conditions**: None (positive test case)

---

#### Test Case 2: Registration with Duplicate Email
**Test Name**: `should return error when email already exists in database`

**Description**: Verifies that registration fails when the email is already registered.

**Setup**:
- Mock database connection pool
- Mock database query to return existing user (email exists)

**Inputs**:
```typescript
{
  email: 'existing@example.com',
  password: 'SecurePass123!'
}
```

**Actions**:
1. Call registration endpoint with existing email
2. Verify email uniqueness check finds existing user
3. Verify user creation is not attempted
4. Verify error response is returned

**Expected Outputs**:
- HTTP status: 400 (Bad Request) or 409 (Conflict)
- Response body: `{ error: "Email already registered" }`
- No new user record created

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT'),
  expect.arrayContaining(['existing@example.com'])
);
expect(bcrypt.hash).not.toHaveBeenCalled();
expect(reply.status).toHaveBeenCalledWith(400);
expect(reply.send).toHaveBeenCalledWith({ error: "Email already registered" });
```

**Error Conditions**: Email already exists

---

#### Test Case 3: Registration with Invalid Email Format
**Test Name**: `should return error when email format is invalid`

**Description**: Verifies that registration fails when email format is invalid.

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
1. Call registration endpoint with invalid email format
2. Verify email format validation fails
3. Verify database query is not executed
4. Verify error response is returned

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "Invalid email format" }`
- No database queries executed

**Assertions**:
```typescript
expect(mockQuery).not.toHaveBeenCalled();
expect(reply.status).toHaveBeenCalledWith(400);
expect(reply.send).toHaveBeenCalledWith({ error: "Invalid email format" });
```

**Error Conditions**: Invalid email format

---

#### Test Case 4: Registration with Missing Email
**Test Name**: `should return error when email is missing`

**Description**: Verifies that registration fails when email field is missing.

**Setup**:
- Mock database connection pool

**Inputs**:
```typescript
{
  password: 'SecurePass123!'
}
```

**Actions**:
1. Call registration endpoint without email field
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

#### Test Case 5: Registration with Missing Password
**Test Name**: `should return error when password is missing`

**Description**: Verifies that registration fails when password field is missing.

**Setup**:
- Mock database connection pool

**Inputs**:
```typescript
{
  email: 'user@example.com'
}
```

**Actions**:
1. Call registration endpoint without password field
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

#### Test Case 6: Registration with Invalid Password Format
**Test Name**: `should return error when password does not meet requirements`

**Description**: Verifies that registration fails when password doesn't meet minimum requirements (minimum 8 characters).

**Setup**:
- Mock database connection pool
- Mock email validation to pass

**Inputs**:
```typescript
{
  email: 'user@example.com',
  password: 'short'
}
```

**Actions**:
1. Call registration endpoint with password less than 8 characters
2. Verify password validation fails
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "Invalid password format" }` or `{ error: "Password must be at least 8 characters" }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(400);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.stringContaining('password')
}));
```

**Error Conditions**: Password doesn't meet requirements

---

#### Test Case 7: Registration with Empty Email String
**Test Name**: `should return error when email is empty string`

**Description**: Verifies that registration fails when email is an empty string.

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
1. Call registration endpoint with empty email string
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

#### Test Case 8: Registration with Empty Password String
**Test Name**: `should return error when password is empty string`

**Description**: Verifies that registration fails when password is an empty string.

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
1. Call registration endpoint with empty password string
2. Verify validation detects empty password
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 400 (Bad Request)
- Response body: `{ error: "Password is required" }` or `{ error: "Invalid password format" }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(400);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.stringContaining('password')
}));
```

**Error Conditions**: Empty string validation

---

#### Test Case 9: Registration with Null Email
**Test Name**: `should return error when email is null`

**Description**: Verifies that registration fails when email is null.

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
1. Call registration endpoint with null email
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

#### Test Case 10: Registration with Null Password
**Test Name**: `should return error when password is null`

**Description**: Verifies that registration fails when password is null.

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
1. Call registration endpoint with null password
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

#### Test Case 11: Registration with Maximum Length Email
**Test Name**: `should create user when email is at maximum length (255 characters)`

**Description**: Verifies that registration succeeds with email at database maximum length.

**Setup**:
- Mock database connection pool
- Mock bcrypt hash function
- Mock database queries

**Inputs**:
```typescript
{
  email: 'a'.repeat(240) + '@example.com', // 255 characters total
  password: 'SecurePass123!'
}
```

**Actions**:
1. Call registration endpoint with maximum length email
2. Verify email validation passes
3. Verify user is created successfully

**Expected Outputs**:
- HTTP status: 201 (Created)
- User record created with maximum length email

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(201);
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('INSERT'),
  expect.arrayContaining([expect.any(String), expect.stringMatching(/^.{240}@example\.com$/), expect.any(String)])
);
```

**Error Conditions**: None (positive test case)

---

#### Test Case 12: Registration with Database Error
**Test Name**: `should return error when database operation fails`

**Description**: Verifies that registration handles database errors gracefully.

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
1. Call registration endpoint with valid credentials
2. Simulate database error (connection failure, constraint violation, etc.)
3. Verify error is caught and handled
4. Verify appropriate error response is returned

**Expected Outputs**:
- HTTP status: 500 (Internal Server Error)
- Response body: `{ error: "Registration failed" }` or generic error message (not exposing internal details)

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

### Mock Setup Requirements

```typescript
// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn((password, rounds) => Promise.resolve('hashed_password')),
  compare: jest.fn((password, hash) => Promise.resolve(true)),
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
const createValidRegistrationData = () => ({
  email: 'test@example.com',
  password: 'SecurePass123!',
});

const createExistingUser = () => ({
  id: 'user-uuid',
  email: 'existing@example.com',
  password_hash: 'hashed_password',
  created_at: new Date('2024-01-01T00:00:00Z'),
  updated_at: new Date('2024-01-01T00:00:00Z'),
});
```

### Error Condition Summary
- Duplicate email
- Invalid email format
- Missing email
- Missing password
- Invalid password format
- Empty email string
- Empty password string
- Null email
- Null password
- Database errors
- Maximum length boundary (email at 255 characters)
