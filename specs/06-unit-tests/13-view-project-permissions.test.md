# View Project Permissions Test

## Test Name
`view-project-permissions.test.ts` - Project Permissions Viewing Tests

## Description
Comprehensive unit tests for the View Project Permissions use case. Tests permission validation, retrieval of users with permissions, and display in permissions list.

## Test Cases

### Test 1: Successful Permissions View
**Test Name**: `should successfully view project permissions when user has permission`

**Description**: Verifies that user with permission can view project permissions, all users with permissions are retrieved, and list is displayed.

**Setup**:
- Mock authenticated user (project owner or with permission)
- Create test project with:
  - Owner user
  - 3 additional users with permissions
- Mock database connection
- Mock permission retrieval service

**Test Steps**:
1. Prepare authenticated user context
2. Prepare existing project with permissions
3. Simulate clicking Permissions tab
4. Call view project permissions API endpoint
5. Verify user authentication
6. Verify permission check passes
7. Verify all users with permissions are retrieved
8. Verify owner is included in list
9. Verify response contains permissions list
10. Verify permissions list is displayed

**Expected Results**:
- Status code: 200 (OK)
- Response contains:
  - Permissions list with user information
  - Each permission includes: user_id, user email, created_at
  - Owner is included in list
- Permissions list is displayed correctly
- No errors occur

**Test Data**:
- Project ID: Valid UUID
- Owner user ID: Valid UUID
- Users with permissions: 3 additional users
- Total permissions: 4 (owner + 3)

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Project permission check mock (returns permission)
- Permission retrieval service mock

**Assertions**:
1. Assert status code is 200
2. Assert response contains permissions list
3. Assert permissions list contains all users with permissions
4. Assert owner is included in list
5. Assert each permission contains user information
6. Assert permissions list is displayed correctly

---

### Test 2: View Permissions Permission Denied
**Test Name**: `should reject viewing permissions when user does not have permission`

**Description**: Verifies that viewing permissions fails when user does not have permission to access the project.

**Setup**:
- Mock authenticated user (no permission)
- Create test project owned by different user
- Mock permission check to return false

**Test Steps**:
1. Prepare authenticated user context (no permission)
2. Prepare existing project owned by different user
3. Call view project permissions API endpoint
4. Verify permission check fails
5. Verify error response is returned
6. Verify no permissions data is returned

**Expected Results**:
- Status code: 403 (Forbidden)
- Error message: "Permission denied"
- No permissions data returned
- Permissions list is not displayed

**Test Data**:
- Project ID: Valid UUID
- Owner user ID: Different UUID
- Authenticated user ID: Different UUID (no permission)

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Project permission check mock (returns no permission)

**Assertions**:
1. Assert status code is 403
2. Assert error message is "Permission denied"
3. Assert no permissions data is returned
4. Assert permissions list is not displayed

---

### Test 3: View Permissions Non-Existent Project
**Test Name**: `should reject viewing permissions when project does not exist`

**Description**: Verifies that viewing permissions fails when project ID does not exist.

**Setup**:
- Mock authenticated user
- Mock database query to return no project

**Test Steps**:
1. Prepare authenticated user context
2. Prepare non-existent project ID
3. Call view project permissions API endpoint
4. Verify project lookup returns no project
5. Verify error response is returned

**Expected Results**:
- Status code: 404 (Not Found)
- Error message: "Project not found"
- No permissions data returned

**Test Data**:
- Project ID: Valid UUID (but non-existent)

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock (returns no project)

**Assertions**:
1. Assert status code is 404
2. Assert error message is "Project not found"
3. Assert no permissions data is returned

---

### Test 4: View Permissions Empty List
**Test Name**: `should successfully view permissions when project has only owner`

**Description**: Verifies that viewing permissions works correctly when project has no additional permissions (only owner).

**Setup**:
- Mock authenticated user (project owner)
- Create test project with only owner (no additional permissions)

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing project with only owner
3. Call view project permissions API endpoint
4. Verify permission check passes
5. Verify permissions list contains only owner
6. Verify permissions list is displayed correctly

**Expected Results**:
- Status code: 200 (OK)
- Response contains:
  - Permissions list with single entry (owner)
  - Owner user information
- Permissions list is displayed correctly
- No errors occur

**Test Data**:
- Project ID: Valid UUID
- Owner user ID: Valid UUID
- Additional permissions: 0

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Project permission check mock

**Assertions**:
1. Assert status code is 200
2. Assert response contains permissions list
3. Assert permissions list contains only owner
4. Assert permissions list is displayed correctly

---

### Test 5: View Permissions Response Time
**Test Name**: `should complete viewing permissions within performance requirements`

**Description**: Verifies that viewing permissions completes within the required response time (< 200ms for GET requests).

**Setup**:
- Mock authenticated user (project owner)
- Create test project with permissions
- Mock fast database operations

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing project with permissions
3. Call view project permissions API endpoint
4. Measure response time
5. Verify response time is < 200ms

**Expected Results**:
- Status code: 200 (OK)
- Response time: < 200ms
- Permissions viewing succeeds

**Test Data**:
- Project ID: Valid UUID
- Permissions: Multiple users

**Mocks/Stubs Required**:
- Authentication middleware mock (with timing)
- Database connection mock (with timing)

**Assertions**:
1. Assert status code is 200
2. Assert response time is < 200ms
3. Assert permissions viewing succeeds

---

### Test 6: View Permissions with Invalid UUID
**Test Name**: `should reject viewing permissions when project ID is invalid UUID`

**Description**: Verifies that viewing permissions fails when project ID is not a valid UUID format.

**Test Steps**:
1. Prepare authenticated user context
2. Prepare invalid project IDs:
   - "invalid-uuid"
   - "123"
   - "not-a-uuid"
   - ""
3. For each invalid ID, call view project permissions API endpoint
4. Verify UUID validation fails
5. Verify error response is returned

**Expected Results**:
- Status code: 400 (Bad Request)
- Error message: "Invalid project ID" or "Invalid UUID format"
- No database query occurs

**Test Data**:
- Invalid project IDs: ["invalid-uuid", "123", "not-a-uuid", ""]

**Mocks/Stubs Required**:
- Authentication middleware mock
- UUID validation function

**Assertions**:
1. Assert status code is 400 for each invalid ID
2. Assert error message indicates invalid ID
3. Assert no database query is made
