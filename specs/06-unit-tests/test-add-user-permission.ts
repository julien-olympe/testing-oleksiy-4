# Add User Permission Unit Test Specification

## Test File: `add-user-permission.test.ts`

### Purpose
Test the add user permission functionality, including successful addition, validation errors, and edge cases.

### Functions/APIs Being Tested
- `POST /api/projects/:projectId/permissions` endpoint
- Add user permission service/function
- Project ownership verification (only owner can add)
- User registration verification
- Duplicate permission prevention

### Test Cases

#### Test Case 1: Successful Add User Permission
**Test Name**: `should add user to project permissions when project owner provides valid registered user email`

**Description**: Verifies that project owner can add a registered user to project permissions.

**Setup**:
- Mock authentication middleware (project owner)
- Mock database queries to verify project ownership
- Mock database query to verify user exists (registered)
- Mock database INSERT for permission

**Inputs**:
```typescript
Headers: { authorization: 'Bearer valid_jwt_token' }
Params: { projectId: 'project-uuid' }
Body: { email: 'user@example.com' }
```

**Actions**:
1. Verify user is project owner
2. Verify email format is valid
3. Verify user exists (is registered)
4. Verify user doesn't already have permission
5. Create ProjectPermission entry
6. Return success

**Expected Outputs**:
- HTTP status: 201 (Created)
- Response body: `{ message: "User added to project permissions" }`

**Assertions**:
```typescript
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('SELECT.*FROM users'),
  expect.arrayContaining(['user@example.com'])
);
expect(mockQuery).toHaveBeenCalledWith(
  expect.stringContaining('INSERT INTO project_permissions'),
  expect.arrayContaining(['project-uuid', expect.any(String)]) // user_id
);
expect(reply.status).toHaveBeenCalledWith(201);
```

**Error Conditions**: Missing auth, not project owner, user not registered, duplicate permission, invalid email, database errors

---

#### Test Case 2: Add Permission When Not Project Owner
**Test Name**: `should return error when non-owner attempts to add user permission`

**Expected Outputs**: HTTP 403, `{ error: "Only project owner can add users" }`

#### Test Case 3: Add Permission for Unregistered User
**Test Name**: `should return error when email does not belong to registered user`

**Expected Outputs**: HTTP 400, `{ error: "User not registered" }`

#### Test Case 4: Add Duplicate Permission
**Test Name**: `should return error when user already has permission`

**Expected Outputs**: HTTP 400, `{ error: "User already has permissions" }`

#### Test Case 5: Add Permission with Invalid Email
**Test Name**: `should return error when email format is invalid`

**Expected Outputs**: HTTP 400, `{ error: "Invalid email format" }`

#### Test Case 6: Add Permission with Empty Email
**Test Name**: `should return error when email is empty string`

**Expected Outputs**: HTTP 400, `{ error: "Email is required" }`
