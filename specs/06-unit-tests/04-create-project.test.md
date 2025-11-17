# Create Project Test

## Test Name
`create-project.test.ts` - Project Creation Tests

## Description
Comprehensive unit tests for the Create Project use case. Tests project creation via drag-and-drop, default naming, ownership assignment, and display in project list.

## Test Cases

### Test 1: Successful Project Creation
**Test Name**: `should successfully create project when dragging Project brick`

**Description**: Verifies that dragging "Project" brick to project list creates a new project with default name, assigns ownership to authenticated user, and displays it in the list.

**Setup**:
- Mock authenticated user (user ID: valid UUID)
- Mock database connection
- Mock project creation service
- Clear any existing test projects

**Test Steps**:
1. Prepare authenticated user context
2. Simulate drag-and-drop of "Project" brick to project list
3. Call create project API endpoint
4. Verify user authentication
5. Verify project is created with default name (e.g., "New Project" or "Project 1")
6. Verify project owner_id is set to authenticated user ID
7. Verify project is assigned to user
8. Verify project appears in user's project list
9. Verify response indicates success

**Expected Results**:
- Status code: 201 (Created)
- Response contains project ID (UUID)
- Response contains project name (default name)
- Project record exists in database with:
  - `id`: Valid UUID
  - `name`: Default name (e.g., "New Project")
  - `owner_id`: Authenticated user ID
  - `created_at`: Current timestamp
  - `updated_at`: Current timestamp
- Project appears in user's project list
- No errors occur

**Test Data**:
- Authenticated user ID: Valid UUID
- Default project name: "New Project" (or generated name)

**Mocks/Stubs Required**:
- Authentication middleware mock (validates token, returns user ID)
- Database connection mock
- Project creation service mock

**Assertions**:
1. Assert status code is 201
2. Assert response contains project ID
3. Assert response contains project name
4. Assert project record exists in database
5. Assert owner_id matches authenticated user ID
6. Assert created_at and updated_at are set
7. Assert project appears in user's project list

---

### Test 2: Create Project Without Authentication
**Test Name**: `should reject project creation when user is not authenticated`

**Description**: Verifies that project creation fails when user is not authenticated.

**Setup**:
- No authentication token
- Mock authentication middleware to reject

**Test Steps**:
1. Call create project API endpoint without authentication token
2. Verify authentication check fails
3. Verify error response is returned
4. Verify no project is created

**Expected Results**:
- Status code: 401 (Unauthorized)
- Error message: "Authentication required"
- No project record created
- No project added to list

**Test Data**:
- No authentication token

**Mocks/Stubs Required**:
- Authentication middleware mock (rejects)

**Assertions**:
1. Assert status code is 401
2. Assert error message indicates authentication required
3. Assert no project record is created

---

### Test 3: Create Project at Maximum Limit
**Test Name**: `should handle project creation at maximum projects per user limit`

**Description**: Verifies that project creation works correctly when user has reached the maximum projects limit (10,000 projects per user).

**Setup**:
- Mock authenticated user
- Mock database to return 10,000 existing projects for user
- Mock project count query

**Test Steps**:
1. Prepare authenticated user context
2. Verify user has 10,000 projects
3. Attempt to create new project
4. Verify project count check
5. Verify project creation succeeds (or fails with appropriate message if limit enforced)
6. Verify project is created (if limit allows) or error is returned (if limit enforced)

**Expected Results**:
- Either:
  - Status code: 201 (Created) - if limit is not enforced
  - Status code: 400 (Bad Request) - if limit is enforced
- Error message (if limit enforced): "Maximum projects limit reached (10,000)"

**Test Data**:
- Authenticated user ID: Valid UUID
- Existing projects: 10,000

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Project count query mock (returns 10,000)

**Assertions**:
1. Assert appropriate status code based on limit enforcement
2. If limit enforced, assert error message indicates limit reached
3. If limit not enforced, assert project is created

---

### Test 4: Create Project Database Transaction Rollback
**Test Name**: `should rollback transaction when project creation fails`

**Description**: Verifies that database transaction is rolled back if project creation fails after validation.

**Setup**:
- Mock authenticated user
- Mock database connection
- Mock database insert to throw error

**Test Steps**:
1. Prepare authenticated user context
2. Call create project API endpoint
3. Simulate database error during project creation
4. Verify transaction is rolled back
5. Verify no partial data is saved

**Expected Results**:
- Status code: 500 (Internal Server Error)
- Error message: "Failed to create project" or generic error
- No project record created
- Transaction rolled back completely

**Test Data**:
- Authenticated user ID: Valid UUID

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock (throws error on insert)
- Transaction mock

**Assertions**:
1. Assert status code is 500
2. Assert no project record is created
3. Assert transaction was rolled back

---

### Test 5: Create Project Response Time
**Test Name**: `should complete project creation within performance requirements`

**Description**: Verifies that project creation completes within the required response time (< 300ms for POST requests).

**Setup**:
- Mock authenticated user
- Mock fast database operations

**Test Steps**:
1. Prepare authenticated user context
2. Call create project API endpoint
3. Measure response time
4. Verify response time is < 300ms

**Expected Results**:
- Status code: 201 (Created)
- Response time: < 300ms
- Project creation succeeds

**Test Data**:
- Authenticated user ID: Valid UUID

**Mocks/Stubs Required**:
- Authentication middleware mock (with timing)
- Database connection mock (with timing)

**Assertions**:
1. Assert status code is 201
2. Assert response time is < 300ms
3. Assert project creation succeeds

---

### Test 6: Create Project Default Name Generation
**Test Name**: `should generate unique default names for multiple projects`

**Description**: Verifies that default project names are unique when creating multiple projects (e.g., "New Project", "New Project 1", "New Project 2").

**Setup**:
- Mock authenticated user
- Mock database to return existing projects with default names

**Test Steps**:
1. Prepare authenticated user context
2. Create first project - verify name is "New Project"
3. Create second project - verify name is "New Project 1" or unique name
4. Create third project - verify name is "New Project 2" or unique name
5. Verify all projects have unique names

**Expected Results**:
- All projects created successfully
- Each project has unique default name
- Names follow pattern: "New Project", "New Project 1", "New Project 2", etc.

**Test Data**:
- Authenticated user ID: Valid UUID
- Existing projects: 0, then 1, then 2

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Project name generation service mock

**Assertions**:
1. Assert all projects are created
2. Assert each project has unique name
3. Assert names follow expected pattern
