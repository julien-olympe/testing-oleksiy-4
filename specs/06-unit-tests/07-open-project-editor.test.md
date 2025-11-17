# Open Project Editor Test

## Test Name
`open-project-editor.test.ts` - Project Editor Opening Tests

## Description
Comprehensive unit tests for the Open Project Editor use case. Tests permission validation, data loading (functions, permissions, instances), and editor display with Project tab active.

## Test Cases

### Test 1: Successful Project Editor Opening
**Test Name**: `should successfully open project editor when user has permission`

**Description**: Verifies that user with permission can open project editor, all data is loaded (functions, permissions, instances), and editor displays with Project tab active.

**Setup**:
- Mock authenticated user (project owner or with permission)
- Create test project with:
  - 3 functions
  - 2 project permissions
  - 5 database instances
- Mock database connection
- Mock data loading services

**Test Steps**:
1. Prepare authenticated user context
2. Prepare existing project with related data
3. Simulate double-click on project
4. Call open project editor API endpoint
5. Verify user authentication
6. Verify permission check passes
7. Verify project data is loaded
8. Verify functions are loaded
9. Verify project permissions are loaded
10. Verify database instances are loaded
11. Verify editor displays with Project tab active
12. Verify response contains all project data

**Expected Results**:
- Status code: 200 (OK)
- Response contains:
  - Project information (id, name, owner_id)
  - Functions list (3 functions)
  - Project permissions list (2 permissions)
  - Database instances list (5 instances)
- Editor displays with Project tab active
- All data is correctly formatted
- No errors occur

**Test Data**:
- Project ID: Valid UUID
- User ID: Valid UUID (owner or with permission)
- Functions: 3
- Permissions: 2
- Instances: 5

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Project permission check mock (returns permission)
- Data loading service mocks

**Assertions**:
1. Assert status code is 200
2. Assert response contains project information
3. Assert response contains functions list
4. Assert response contains permissions list
5. Assert response contains instances list
6. Assert editor displays with Project tab active

---

### Test 2: Open Project Editor Permission Denied
**Test Name**: `should reject opening editor when user does not have permission`

**Description**: Verifies that opening project editor fails when user does not have permission to access the project.

**Setup**:
- Mock authenticated user (no permission)
- Create test project owned by different user
- Mock permission check to return false

**Test Steps**:
1. Prepare authenticated user context (no permission)
2. Prepare existing project owned by different user
3. Call open project editor API endpoint
4. Verify permission check fails
5. Verify error response is returned
6. Verify no data is loaded

**Expected Results**:
- Status code: 403 (Forbidden)
- Error message: "Permission denied"
- No project data returned
- Editor does not open

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
3. Assert no project data is returned
4. Assert editor does not open

---

### Test 3: Open Non-Existent Project Editor
**Test Name**: `should reject opening editor when project does not exist`

**Description**: Verifies that opening project editor fails when project ID does not exist.

**Setup**:
- Mock authenticated user
- Mock database query to return no project

**Test Steps**:
1. Prepare authenticated user context
2. Prepare non-existent project ID
3. Call open project editor API endpoint
4. Verify project lookup returns no project
5. Verify error response is returned

**Expected Results**:
- Status code: 404 (Not Found)
- Error message: "Project not found"
- No data returned

**Test Data**:
- Project ID: Valid UUID (but non-existent)

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock (returns no project)

**Assertions**:
1. Assert status code is 404
2. Assert error message is "Project not found"
3. Assert no data is returned

---

### Test 4: Open Project Editor with Empty Data
**Test Name**: `should successfully open editor when project has no related data`

**Description**: Verifies that project editor opens successfully even when project has no functions, permissions, or instances.

**Setup**:
- Mock authenticated user (project owner)
- Create empty test project (no functions, permissions, instances)

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare empty project
3. Call open project editor API endpoint
4. Verify permission check passes
5. Verify project data is loaded
6. Verify functions list is empty
7. Verify permissions list is empty (except owner)
8. Verify instances list is empty
9. Verify editor displays correctly

**Expected Results**:
- Status code: 200 (OK)
- Response contains:
  - Project information
  - Empty functions list: []
  - Permissions list: [owner] (at minimum)
  - Empty instances list: []
- Editor displays with Project tab active
- No errors occur

**Test Data**:
- Project ID: Valid UUID
- Functions: 0
- Permissions: 1 (owner only)
- Instances: 0

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Project permission check mock

**Assertions**:
1. Assert status code is 200
2. Assert response contains project information
3. Assert functions list is empty array
4. Assert permissions list contains at least owner
5. Assert instances list is empty array
6. Assert editor displays correctly

---

### Test 5: Open Project Editor Response Time
**Test Name**: `should complete opening editor within performance requirements`

**Description**: Verifies that opening project editor completes within the required response time (< 200ms for GET requests).

**Setup**:
- Mock authenticated user (project owner)
- Create test project with related data
- Mock fast database operations

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing project with related data
3. Call open project editor API endpoint
4. Measure response time
5. Verify response time is < 200ms

**Expected Results**:
- Status code: 200 (OK)
- Response time: < 200ms
- Editor opening succeeds

**Test Data**:
- Project ID: Valid UUID
- Related data: Functions, permissions, instances

**Mocks/Stubs Required**:
- Authentication middleware mock (with timing)
- Database connection mock (with timing)

**Assertions**:
1. Assert status code is 200
2. Assert response time is < 200ms
3. Assert editor opening succeeds

---

### Test 6: Open Project Editor with Maximum Functions
**Test Name**: `should handle opening editor when project has maximum functions (100)`

**Description**: Verifies that project editor opens successfully when project has the maximum number of functions (100).

**Setup**:
- Mock authenticated user (project owner)
- Create test project with 100 functions

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare project with 100 functions
3. Call open project editor API endpoint
4. Verify all 100 functions are loaded
5. Verify response time is acceptable
6. Verify editor displays correctly

**Expected Results**:
- Status code: 200 (OK)
- Response contains all 100 functions
- Response time is acceptable (< 200ms with optimization)
- Editor displays correctly

**Test Data**:
- Project ID: Valid UUID
- Functions: 100 (maximum)

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Project permission check mock

**Assertions**:
1. Assert status code is 200
2. Assert response contains exactly 100 functions
3. Assert response time is acceptable
4. Assert editor displays correctly

---

### Test 7: Open Project Editor with Invalid UUID
**Test Name**: `should reject opening editor when project ID is invalid UUID`

**Description**: Verifies that opening project editor fails when project ID is not a valid UUID format.

**Test Steps**:
1. Prepare authenticated user context
2. Prepare invalid project IDs:
   - "invalid-uuid"
   - "123"
   - "not-a-uuid"
   - ""
3. For each invalid ID, call open project editor API endpoint
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
