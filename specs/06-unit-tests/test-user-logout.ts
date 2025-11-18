# User Logout Unit Test Specification

## Test File: `user-logout.test.ts`

### Purpose
Test the user logout functionality, including successful logout and edge cases.

### Functions/APIs Being Tested
- `POST /api/auth/logout` endpoint (if implemented server-side)
- Logout service/function
- Session invalidation
- Token clearing

### Test Cases

#### Test Case 1: Successful User Logout
**Test Name**: `should successfully logout user when authenticated`

**Description**: Verifies that a logged-in user can successfully log out.

**Setup**:
- Mock authentication middleware to return valid user
- Mock request with valid JWT token in headers
- Mock session invalidation (if server-side sessions exist)

**Inputs**:
```typescript
Headers: {
  authorization: 'Bearer valid_jwt_token'
}
```

**Actions**:
1. Call logout endpoint with valid authentication token
2. Verify user is authenticated
3. Verify session is invalidated (if applicable)
4. Verify response indicates successful logout

**Expected Outputs**:
- HTTP status: 200 (OK)
- Response body: `{ message: "Logged out successfully" }`
- Token cleared from client (handled client-side, not server-side for JWT)

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(200);
expect(reply.send).toHaveBeenCalledWith({ message: "Logged out successfully" });
```

**Error Conditions**: None (positive test case)

---

#### Test Case 2: Logout Without Authentication Token
**Test Name**: `should return error when logout is attempted without authentication token`

**Description**: Verifies that logout fails when no authentication token is provided.

**Setup**:
- Mock request without authorization header
- Mock authentication middleware to reject request

**Inputs**:
```typescript
Headers: {}
```

**Actions**:
1. Call logout endpoint without authentication token
2. Verify authentication middleware rejects request
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 401 (Unauthorized)
- Response body: `{ error: "Unauthorized" }` or `{ error: "Authentication required" }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(401);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.stringContaining('Unauthorized')
}));
```

**Error Conditions**: Missing authentication

---

#### Test Case 3: Logout with Invalid Token
**Test Name**: `should return error when logout is attempted with invalid token`

**Description**: Verifies that logout fails when authentication token is invalid.

**Setup**:
- Mock request with invalid JWT token
- Mock JWT verification to fail

**Inputs**:
```typescript
Headers: {
  authorization: 'Bearer invalid_token'
}
```

**Actions**:
1. Call logout endpoint with invalid token
2. Verify JWT verification fails
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 401 (Unauthorized)
- Response body: `{ error: "Invalid token" }` or `{ error: "Unauthorized" }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(401);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.any(String)
}));
```

**Error Conditions**: Invalid authentication token

---

#### Test Case 4: Logout with Expired Token
**Test Name**: `should return error when logout is attempted with expired token`

**Description**: Verifies that logout fails when authentication token has expired.

**Setup**:
- Mock request with expired JWT token
- Mock JWT verification to throw expiration error

**Inputs**:
```typescript
Headers: {
  authorization: 'Bearer expired_token'
}
```

**Actions**:
1. Call logout endpoint with expired token
2. Verify JWT verification detects expiration
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 401 (Unauthorized)
- Response body: `{ error: "Token expired" }` or `{ error: "Unauthorized" }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(401);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.any(String)
}));
```

**Error Conditions**: Expired authentication token

---

#### Test Case 5: Logout Multiple Times
**Test Name**: `should successfully logout even if called multiple times`

**Description**: Verifies that logout can be called multiple times without errors (idempotent operation).

**Setup**:
- Mock authentication middleware
- Mock request with valid token

**Inputs**:
```typescript
Headers: {
  authorization: 'Bearer valid_jwt_token'
}
```

**Actions**:
1. Call logout endpoint first time (should succeed)
2. Call logout endpoint second time (should also succeed)
3. Verify both calls return success

**Expected Outputs**:
- HTTP status: 200 (OK) for both calls
- Response body: `{ message: "Logged out successfully" }` for both calls

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(200);
expect(reply.send).toHaveBeenCalledWith({ message: "Logged out successfully" });
// Verify it can be called multiple times
expect(reply.status).toHaveBeenCalledTimes(2);
```

**Error Conditions**: None (idempotent operation)

---

#### Test Case 6: Logout with Malformed Authorization Header
**Test Name**: `should return error when authorization header is malformed`

**Description**: Verifies that logout fails when authorization header format is incorrect.

**Setup**:
- Mock request with malformed authorization header

**Inputs**:
```typescript
Headers: {
  authorization: 'InvalidFormat token'
}
```

**Actions**:
1. Call logout endpoint with malformed authorization header
2. Verify header parsing fails
3. Verify error response is returned

**Expected Outputs**:
- HTTP status: 401 (Unauthorized)
- Response body: `{ error: "Invalid authorization header" }` or `{ error: "Unauthorized" }`

**Assertions**:
```typescript
expect(reply.status).toHaveBeenCalledWith(401);
expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
  error: expect.any(String)
}));
```

**Error Conditions**: Malformed authorization header

---

### Mock Setup Requirements

```typescript
// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn((payload, secret, options) => 'mock_jwt_token'),
  verify: jest.fn((token, secret) => {
    if (token === 'valid_jwt_token') {
      return { userId: 'user-uuid', email: 'user@example.com' };
    }
    throw new Error('Invalid token');
  }),
}));

// Mock request/reply
const createMockRequest = (headers = {}) => ({
  headers: {
    authorization: 'Bearer valid_jwt_token',
    ...headers,
  },
  body: {},
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
const createValidAuthHeaders = () => ({
  authorization: 'Bearer valid_jwt_token',
});

const createInvalidAuthHeaders = () => ({
  authorization: 'Bearer invalid_token',
});

const createExpiredAuthHeaders = () => ({
  authorization: 'Bearer expired_token',
});
```

### Error Condition Summary
- Missing authentication token
- Invalid token
- Expired token
- Malformed authorization header

### Notes
- Logout is primarily a client-side operation for JWT-based authentication (token is removed from client storage)
- Server-side logout may not be necessary if using stateless JWT tokens
- If server-side sessions exist, logout should invalidate the session
- Logout should be idempotent (can be called multiple times safely)
