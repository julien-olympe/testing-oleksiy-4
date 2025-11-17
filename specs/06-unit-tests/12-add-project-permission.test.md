# Add Project Permission Test

## Test Name
`add-project-permission.test.ts` - Project Permission Addition Tests

## Description
Comprehensive unit tests for the Add Project Permission use case. Tests email validation, registered user verification, duplicate permission prevention, and permission creation.

## Test Cases

### Test 1: Successful Permission Addition
**Test Name**: `should successfully add project permission for registered user`

**Description**: Verifies that project owner can add permission for a registered user by email, permission is created, and user appears in permissions list.

**Setup**:
- Mock authenticated user (project owner)
- Create test project
- Create target user with email "target@example.com"
- Mock database connection
- Mock user lookup service

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing project (ID: valid UUID)
3. Prepare target user email "target@example.com"
4. Call add project permission API endpoint with email
5. Verify user authentication
6. Verify permission check (user is owner or has permission rights)
7. Verify email format validation
8. Verify user lookup by email finds registered user
9. Verify no existing permission exists
10. Verify permission relationship is created
11. Verify permission is persisted
12. Verify user appears in permissions list
13. Verify response indicates success

**Expected Results**:
- Status code: 201 (Created)
- Response contains permission information
- Permission record exists in database with:
  - `project_id`: Project ID
  - `user_id`: Target user ID
  - `created_at`: Current timestamp
- User appears in project permissions list
- No errors occur

**Test Data**:
- Project ID: Valid UUID
- Owner user ID: Valid UUID
- Target user email: "target@example.com"
- Target user ID: Valid UUID

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Project permission check mock (returns owner)
- User lookup service mock
- Permission creation service mock

**Assertions**:
1. Assert status code is 201
2. Assert response contains permission information
3. Assert permission record exists in database
4. Assert project_id matches project ID
5. Assert user_id matches target user ID
6. Assert created_at timestamp is set
7. Assert user appears in permissions list

---

### Test 2: Add Permission User Not Found
**Test Name**: `should reject permission addition when user email does not exist`

**Description**: Verifies that adding permission fails when email does not correspond to a registered user.

**Setup**:
- Mock authenticated user (project owner)
- Create test project
- Mock user lookup to return no user

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing project
3. Prepare non-existent user email "nonexistent@example.com"
4. Call add project permission API endpoint
5. Verify user lookup returns no user
6. Verify error response is returned
7. Verify no permission is created

**Expected Results**:
- Status code: 404 (Not Found) or 400 (Bad Request)
- Error message: "User not found"
- No permission record created

**Test Data**:
- Project ID: Valid UUID
- Non-existent email: "nonexistent@example.com"

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Project permission check mock
- User lookup service mock (returns no user)

**Assertions**:
1. Assert status code is 404 or 400
2. Assert error message is "User not found"
3. Assert no permission record is created

---

### Test 3: Add Permission Duplicate
**Test Name**: `should reject permission addition when user already has permission`

**Description**: Verifies that adding permission fails when user already has permission for the project (composite primary key constraint).

**Setup**:
- Mock authenticated user (project owner)
- Create test project
- Create target user
- Create existing permission for target user
- Mock permission lookup

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing project
3. Prepare target user with existing permission
4. Call add project permission API endpoint
5. Verify existing permission is detected
6. Verify error response is returned
7. Verify no duplicate permission is created

**Expected Results**:
- Status code: 400 (Bad Request) or 409 (Conflict)
- Error message: "User already has permission"
- No duplicate permission record created
- Existing permission remains unchanged

**Test Data**:
- Project ID: Valid UUID
- Target user email: "target@example.com"
- Existing permission: Already exists

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Project permission check mock
- User lookup service mock
- Permission lookup mock (returns existing permission)

**Assertions**:
1. Assert status code is 400 or 409
2. Assert error message is "User already has permission"
3. Assert no duplicate permission is created
4. Assert existing permission remains unchanged

---

### Test 4: Add Permission Invalid Email Format
**Test Name**: `should reject permission addition when email format is invalid`

**Description**: Verifies that adding permission fails when email format is invalid.

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing project
3. Prepare invalid email formats:
   - "invalid-email" (no @)
   - "@example.com" (no local part)
   - "user@" (no domain)
   - "user@.com" (invalid domain)
4. For each invalid email, call add permission API endpoint
5. Verify email format validation fails
6. Verify error response is returned

**Expected Results**:
- Status code: 400 (Bad Request)
- Error message: "Invalid email format"
- No permission record created

**Test Data**:
- Project ID: Valid UUID
- Invalid emails: ["invalid-email", "@example.com", "user@", "user@.com"]

**Mocks/Stubs Required**:
- Authentication middleware mock
- Email validation function

**Assertions**:
1. Assert status code is 400 for each invalid email
2. Assert error message is "Invalid email format"
3. Assert no permission record is created

---

### Test 5: Add Permission Permission Denied
**Test Name**: `should reject permission addition when user is not owner`

**Description**: Verifies that adding permission fails when user is not the project owner and does not have permission rights.

**Setup**:
- Mock authenticated user (no permission)
- Create test project owned by different user
- Mock permission check to return false

**Test Steps**:
1. Prepare authenticated user context (no permission)
2. Prepare existing project owned by different user
3. Call add project permission API endpoint
4. Verify permission check fails
5. Verify error response is returned
6. Verify no permission is created

**Expected Results**:
- Status code: 403 (Forbidden)
- Error message: "Permission denied"
- No permission record created

**Test Data**:
- Project ID: Valid UUID
- Owner user ID: Different UUID
- Authenticated user ID: Different UUID (no permission)
- Target user email: "target@example.com"

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Project permission check mock (returns no permission)

**Assertions**:
1. Assert status code is 403
2. Assert error message is "Permission denied"
3. Assert no permission record is created

---

### Test 6: Add Permission Non-Existent Project
**Test Name**: `should reject permission addition when project does not exist`

**Description**: Verifies that adding permission fails when project ID does not exist.

**Setup**:
- Mock authenticated user
- Mock database query to return no project

**Test Steps**:
1. Prepare authenticated user context
2. Prepare non-existent project ID
3. Call add project permission API endpoint
4. Verify project lookup returns no project
5. Verify error response is returned

**Expected Results**:
- Status code: 404 (Not Found)
- Error message: "Project not found"
- No permission record created

**Test Data**:
- Project ID: Valid UUID (but non-existent)
- Target user email: "target@example.com"

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock (returns no project)

**Assertions**:
1. Assert status code is 404
2. Assert error message is "Project not found"
3. Assert no permission record is created

---

### Test 7: Add Permission Response Time
**Test Name**: `should complete permission addition within performance requirements`

**Description**: Verifies that adding permission completes within the required response time (< 300ms for POST requests).

**Setup**:
- Mock authenticated user (project owner)
- Create test project
- Create target user
- Mock fast database operations

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing project
3. Prepare target user email
4. Call add project permission API endpoint
5. Measure response time
6. Verify response time is < 300ms

**Expected Results**:
- Status code: 201 (Created)
- Response time: < 300ms
- Permission addition succeeds

**Test Data**:
- Project ID: Valid UUID
- Target user email: "target@example.com"

**Mocks/Stubs Required**:
- Authentication middleware mock (with timing)
- Database connection mock (with timing)

**Assertions**:
1. Assert status code is 201
2. Assert response time is < 300ms
3. Assert permission addition succeeds
