# Create Function Test

## Test Name
`create-function.test.ts` - Function Creation Tests

## Description
Comprehensive unit tests for the Create Function use case. Tests function creation via drag-and-drop, default naming, project assignment, empty definition creation, and display in function list.

## Test Cases

### Test 1: Successful Function Creation
**Test Name**: `should successfully create function when dragging Function brick`

**Description**: Verifies that dragging "Function" brick to function list creates a new function with default name, assigns to project, creates empty definition, and displays in list.

**Setup**:
- Mock authenticated user (project owner)
- Create test project
- Mock database connection
- Mock function creation service

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing project (ID: valid UUID)
3. Simulate drag-and-drop of "Function" brick to function list
4. Call create function API endpoint
5. Verify user authentication
6. Verify project permission check
7. Verify function is created with default name (e.g., "New Function" or "Function 1")
8. Verify function project_id is set to project ID
9. Verify empty function definition is created (no bricks, no connections)
10. Verify function appears in project's function list
11. Verify response indicates success

**Expected Results**:
- Status code: 201 (Created)
- Response contains function ID (UUID)
- Response contains function name (default name)
- Function record exists in database with:
  - `id`: Valid UUID
  - `name`: Default name (e.g., "New Function")
  - `project_id`: Project ID
  - `created_at`: Current timestamp
  - `updated_at`: Current timestamp
- Function definition is empty (no bricks)
- Function appears in project's function list
- No errors occur

**Test Data**:
- Project ID: Valid UUID
- Default function name: "New Function" (or generated name)

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Project permission check mock (returns permission)
- Function creation service mock

**Assertions**:
1. Assert status code is 201
2. Assert response contains function ID
3. Assert response contains function name
4. Assert function record exists in database
5. Assert project_id matches project ID
6. Assert created_at and updated_at are set
7. Assert function definition is empty
8. Assert function appears in project's function list

---

### Test 2: Create Function Without Authentication
**Test Name**: `should reject function creation when user is not authenticated`

**Description**: Verifies that function creation fails when user is not authenticated.

**Setup**:
- No authentication token
- Mock authentication middleware to reject

**Test Steps**:
1. Call create function API endpoint without authentication token
2. Verify authentication check fails
3. Verify error response is returned
4. Verify no function is created

**Expected Results**:
- Status code: 401 (Unauthorized)
- Error message: "Authentication required"
- No function record created
- No function added to list

**Test Data**:
- Project ID: Valid UUID
- No authentication token

**Mocks/Stubs Required**:
- Authentication middleware mock (rejects)

**Assertions**:
1. Assert status code is 401
2. Assert error message indicates authentication required
3. Assert no function record is created

---

### Test 3: Create Function Permission Denied
**Test Name**: `should reject function creation when user does not have project permission`

**Description**: Verifies that function creation fails when user does not have permission to access the project.

**Setup**:
- Mock authenticated user (no permission)
- Create test project owned by different user
- Mock permission check to return false

**Test Steps**:
1. Prepare authenticated user context (no permission)
2. Prepare existing project owned by different user
3. Call create function API endpoint
4. Verify permission check fails
5. Verify error response is returned
6. Verify no function is created

**Expected Results**:
- Status code: 403 (Forbidden)
- Error message: "Permission denied"
- No function record created

**Test Data**:
- Project ID: Valid UUID
- Authenticated user ID: Different UUID (no permission)

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Project permission check mock (returns no permission)

**Assertions**:
1. Assert status code is 403
2. Assert error message is "Permission denied"
3. Assert no function record is created

---

### Test 4: Create Function at Maximum Limit
**Test Name**: `should handle function creation at maximum functions per project limit`

**Description**: Verifies that function creation works correctly when project has reached the maximum functions limit (100 functions per project).

**Setup**:
- Mock authenticated user (project owner)
- Create test project with 100 existing functions
- Mock function count query

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare project with 100 functions
3. Attempt to create new function
4. Verify function count check
5. Verify function creation succeeds (or fails with appropriate message if limit enforced)
6. Verify function is created (if limit allows) or error is returned (if limit enforced)

**Expected Results**:
- Either:
  - Status code: 201 (Created) - if limit is not enforced
  - Status code: 400 (Bad Request) - if limit is enforced
- Error message (if limit enforced): "Maximum functions limit reached (100)"

**Test Data**:
- Project ID: Valid UUID
- Existing functions: 100

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Function count query mock (returns 100)

**Assertions**:
1. Assert appropriate status code based on limit enforcement
2. If limit enforced, assert error message indicates limit reached
3. If limit not enforced, assert function is created

---

### Test 5: Create Function in Non-Existent Project
**Test Name**: `should reject function creation when project does not exist`

**Description**: Verifies that function creation fails when project ID does not exist.

**Setup**:
- Mock authenticated user
- Mock database query to return no project

**Test Steps**:
1. Prepare authenticated user context
2. Prepare non-existent project ID
3. Call create function API endpoint
4. Verify project lookup returns no project
5. Verify error response is returned

**Expected Results**:
- Status code: 404 (Not Found)
- Error message: "Project not found"
- No function record created

**Test Data**:
- Project ID: Valid UUID (but non-existent)

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock (returns no project)

**Assertions**:
1. Assert status code is 404
2. Assert error message is "Project not found"
3. Assert no function record is created

---

### Test 6: Create Function Database Transaction Rollback
**Test Name**: `should rollback transaction when function creation fails`

**Description**: Verifies that database transaction is rolled back if function creation fails after validation.

**Setup**:
- Mock authenticated user (project owner)
- Create test project
- Mock database insert to throw error

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing project
3. Call create function API endpoint
4. Simulate database error during function creation
5. Verify transaction is rolled back
6. Verify no partial data is saved

**Expected Results**:
- Status code: 500 (Internal Server Error)
- Error message: "Failed to create function" or generic error
- No function record created
- Transaction rolled back completely

**Test Data**:
- Project ID: Valid UUID

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock (throws error on insert)
- Transaction mock

**Assertions**:
1. Assert status code is 500
2. Assert no function record is created
3. Assert transaction was rolled back

---

### Test 7: Create Function Response Time
**Test Name**: `should complete function creation within performance requirements`

**Description**: Verifies that function creation completes within the required response time (< 300ms for POST requests).

**Setup**:
- Mock authenticated user (project owner)
- Create test project
- Mock fast database operations

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing project
3. Call create function API endpoint
4. Measure response time
5. Verify response time is < 300ms

**Expected Results**:
- Status code: 201 (Created)
- Response time: < 300ms
- Function creation succeeds

**Test Data**:
- Project ID: Valid UUID

**Mocks/Stubs Required**:
- Authentication middleware mock (with timing)
- Database connection mock (with timing)

**Assertions**:
1. Assert status code is 201
2. Assert response time is < 300ms
3. Assert function creation succeeds

---

### Test 8: Create Function Default Name Generation
**Test Name**: `should generate unique default names for multiple functions`

**Description**: Verifies that default function names are unique when creating multiple functions in the same project (e.g., "New Function", "New Function 1", "New Function 2").

**Setup**:
- Mock authenticated user (project owner)
- Create test project
- Mock database to return existing functions with default names

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing project
3. Create first function - verify name is "New Function"
4. Create second function - verify name is "New Function 1" or unique name
5. Create third function - verify name is "New Function 2" or unique name
6. Verify all functions have unique names

**Expected Results**:
- All functions created successfully
- Each function has unique default name
- Names follow pattern: "New Function", "New Function 1", "New Function 2", etc.

**Test Data**:
- Project ID: Valid UUID
- Existing functions: 0, then 1, then 2

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Function name generation service mock

**Assertions**:
1. Assert all functions are created
2. Assert each function has unique name
3. Assert names follow expected pattern
