# Open Function Editor Test

## Test Name
`open-function-editor.test.ts` - Function Editor Opening Tests

## Description
Comprehensive unit tests for the Open Function Editor use case. Tests permission validation, function data loading (bricks, connections), and editor display with visual representation.

## Test Cases

### Test 1: Successful Function Editor Opening
**Test Name**: `should successfully open function editor when user has permission`

**Description**: Verifies that user with permission can open function editor, all function data is loaded (bricks, connections), and editor displays with visual representation.

**Setup**:
- Mock authenticated user (project owner or with permission)
- Create test function with:
  - 5 bricks (various types)
  - 10 brick connections
- Mock database connection
- Mock data loading services

**Test Steps**:
1. Prepare authenticated user context
2. Prepare existing function with related data
3. Simulate double-click on function
4. Call open function editor API endpoint
5. Verify user authentication
6. Verify permission check passes
7. Verify function data is loaded
8. Verify bricks are loaded with positions and configurations
9. Verify brick connections are loaded
10. Verify editor displays with visual representation
11. Verify RUN button is visible
12. Verify response contains all function data

**Expected Results**:
- Status code: 200 (OK)
- Response contains:
  - Function information (id, name, project_id)
  - Bricks list (5 bricks with positions, types, configurations)
  - Brick connections list (10 connections with from/to references)
- Editor displays with visual representation
- Grid layout is available
- RUN button is visible
- All data is correctly formatted
- No errors occur

**Test Data**:
- Function ID: Valid UUID
- User ID: Valid UUID (owner or with permission)
- Bricks: 5 (various types)
- Connections: 10

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Project permission check mock (returns permission)
- Data loading service mocks

**Assertions**:
1. Assert status code is 200
2. Assert response contains function information
3. Assert response contains bricks list with all properties
4. Assert response contains connections list
5. Assert editor displays with visual representation
6. Assert RUN button is visible

---

### Test 2: Open Function Editor Permission Denied
**Test Name**: `should reject opening editor when user does not have permission`

**Description**: Verifies that opening function editor fails when user does not have permission to access the project.

**Setup**:
- Mock authenticated user (no permission)
- Create test function in project owned by different user
- Mock permission check to return false

**Test Steps**:
1. Prepare authenticated user context (no permission)
2. Prepare existing function in project owned by different user
3. Call open function editor API endpoint
4. Verify permission check fails
5. Verify error response is returned
6. Verify no data is loaded

**Expected Results**:
- Status code: 403 (Forbidden)
- Error message: "Permission denied"
- No function data returned
- Editor does not open

**Test Data**:
- Function ID: Valid UUID
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
3. Assert no function data is returned
4. Assert editor does not open

---

### Test 3: Open Non-Existent Function Editor
**Test Name**: `should reject opening editor when function does not exist`

**Description**: Verifies that opening function editor fails when function ID does not exist.

**Setup**:
- Mock authenticated user
- Mock database query to return no function

**Test Steps**:
1. Prepare authenticated user context
2. Prepare non-existent function ID
3. Call open function editor API endpoint
4. Verify function lookup returns no function
5. Verify error response is returned

**Expected Results**:
- Status code: 404 (Not Found)
- Error message: "Function not found"
- No data returned

**Test Data**:
- Function ID: Valid UUID (but non-existent)

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock (returns no function)

**Assertions**:
1. Assert status code is 404
2. Assert error message is "Function not found"
3. Assert no data is returned

---

### Test 4: Open Function Editor with Empty Function
**Test Name**: `should successfully open editor when function has no bricks`

**Description**: Verifies that function editor opens successfully even when function has no bricks or connections.

**Setup**:
- Mock authenticated user (project owner)
- Create empty test function (no bricks, no connections)

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare empty function
3. Call open function editor API endpoint
4. Verify permission check passes
5. Verify function data is loaded
6. Verify bricks list is empty
7. Verify connections list is empty
8. Verify editor displays correctly

**Expected Results**:
- Status code: 200 (OK)
- Response contains:
  - Function information
  - Empty bricks list: []
  - Empty connections list: []
- Editor displays with empty canvas
- RUN button is visible
- No errors occur

**Test Data**:
- Function ID: Valid UUID
- Bricks: 0
- Connections: 0

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Project permission check mock

**Assertions**:
1. Assert status code is 200
2. Assert response contains function information
3. Assert bricks list is empty array
4. Assert connections list is empty array
5. Assert editor displays correctly

---

### Test 5: Open Function Editor with Maximum Bricks
**Test Name**: `should handle opening editor when function has maximum bricks (50)`

**Description**: Verifies that function editor opens successfully when function has the maximum number of bricks (50).

**Setup**:
- Mock authenticated user (project owner)
- Create test function with 50 bricks

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare function with 50 bricks
3. Call open function editor API endpoint
4. Verify all 50 bricks are loaded
5. Verify response time is acceptable
6. Verify editor displays correctly

**Expected Results**:
- Status code: 200 (OK)
- Response contains all 50 bricks
- Response time is acceptable (< 200ms with optimization)
- Editor displays correctly

**Test Data**:
- Function ID: Valid UUID
- Bricks: 50 (maximum)

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Project permission check mock

**Assertions**:
1. Assert status code is 200
2. Assert response contains exactly 50 bricks
3. Assert response time is acceptable
4. Assert editor displays correctly

---

### Test 6: Open Function Editor Response Time
**Test Name**: `should complete opening editor within performance requirements`

**Description**: Verifies that opening function editor completes within the required response time (< 200ms for GET requests).

**Setup**:
- Mock authenticated user (project owner)
- Create test function with related data
- Mock fast database operations

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing function with related data
3. Call open function editor API endpoint
4. Measure response time
5. Verify response time is < 200ms

**Expected Results**:
- Status code: 200 (OK)
- Response time: < 200ms
- Editor opening succeeds

**Test Data**:
- Function ID: Valid UUID
- Related data: Bricks, connections

**Mocks/Stubs Required**:
- Authentication middleware mock (with timing)
- Database connection mock (with timing)

**Assertions**:
1. Assert status code is 200
2. Assert response time is < 200ms
3. Assert editor opening succeeds

---

### Test 7: Open Function Editor with Invalid UUID
**Test Name**: `should reject opening editor when function ID is invalid UUID`

**Description**: Verifies that opening function editor fails when function ID is not a valid UUID format.

**Test Steps**:
1. Prepare authenticated user context
2. Prepare invalid function IDs:
   - "invalid-uuid"
   - "123"
   - "not-a-uuid"
   - ""
3. For each invalid ID, call open function editor API endpoint
4. Verify UUID validation fails
5. Verify error response is returned

**Expected Results**:
- Status code: 400 (Bad Request)
- Error message: "Invalid function ID" or "Invalid UUID format"
- No database query occurs

**Test Data**:
- Invalid function IDs: ["invalid-uuid", "123", "not-a-uuid", ""]

**Mocks/Stubs Required**:
- Authentication middleware mock
- UUID validation function

**Assertions**:
1. Assert status code is 400 for each invalid ID
2. Assert error message indicates invalid ID
3. Assert no database query is made
