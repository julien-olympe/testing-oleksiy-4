# Add Brick to Function Editor Test

## Test Name
`add-brick-to-function-editor.test.ts` - Brick Addition Tests

## Description
Comprehensive unit tests for the Add Brick to Function Editor use case. Tests drag-and-drop detection, grid position determination, brick instance creation, display with inputs/outputs, and auto-persistence.

## Test Cases

### Test 1: Successful Brick Addition
**Test Name**: `should successfully add brick when dragging to function editor canvas`

**Description**: Verifies that dragging a brick to the function editor canvas creates a brick instance, determines grid position, displays with inputs/outputs, and auto-persists.

**Setup**:
- Mock authenticated user (project owner)
- Create test function
- Mock database connection
- Mock brick creation service
- Mock grid position calculation

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing function (ID: valid UUID)
3. Prepare brick type: "ListInstancesByDB"
4. Simulate drag-and-drop of brick to canvas at position (100, 200)
5. Call add brick to function editor API endpoint
6. Verify user authentication
7. Verify function permission check
8. Verify brick type is valid
9. Verify grid position is calculated (e.g., grid cell (5, 10))
10. Verify brick instance is created
11. Verify brick is displayed with inputs/outputs
12. Verify auto-persistence occurs
13. Verify response indicates success

**Expected Results**:
- Status code: 201 (Created)
- Response contains brick ID (UUID)
- Brick record exists in database with:
  - `id`: Valid UUID
  - `function_id`: Function ID
  - `type`: "ListInstancesByDB"
  - `position_x`: Grid X coordinate (e.g., 5)
  - `position_y`: Grid Y coordinate (e.g., 10)
  - `configuration`: JSONB with brick-specific settings
  - `created_at`: Current timestamp
  - `updated_at`: Current timestamp
- Brick is displayed on canvas with inputs/outputs
- Auto-persistence occurs
- No errors occur

**Test Data**:
- Function ID: Valid UUID
- Brick type: "ListInstancesByDB"
- Drop position: (100, 200) pixels
- Grid position: (5, 10) cells

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Function permission check mock (returns permission)
- Grid position calculation mock
- Brick creation service mock

**Assertions**:
1. Assert status code is 201
2. Assert response contains brick ID
3. Assert brick record exists in database
4. Assert function_id matches function ID
5. Assert type matches brick type
6. Assert position_x and position_y are set correctly
7. Assert configuration is set
8. Assert created_at and updated_at are set
9. Assert brick is displayed with inputs/outputs
10. Assert auto-persistence occurs

---

### Test 2: Add Brick Invalid Brick Type
**Test Name**: `should reject brick addition when brick type is invalid`

**Description**: Verifies that adding brick fails when brick type is not a valid type.

**Setup**:
- Mock authenticated user (project owner)
- Create test function
- Mock brick type validation

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing function
3. Prepare invalid brick types:
   - "InvalidBrick"
   - "UnknownType"
   - ""
   - null
4. For each invalid type, call add brick API endpoint
5. Verify brick type validation fails
6. Verify error response is returned
7. Verify no brick is created

**Expected Results**:
- Status code: 400 (Bad Request)
- Error message: "Invalid brick type"
- No brick record created

**Test Data**:
- Function ID: Valid UUID
- Invalid brick types: ["InvalidBrick", "UnknownType", "", null]

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Brick type validation mock

**Assertions**:
1. Assert status code is 400 for each invalid type
2. Assert error message is "Invalid brick type"
3. Assert no brick record is created

---

### Test 3: Add Brick Permission Denied
**Test Name**: `should reject brick addition when user does not have function permission`

**Description**: Verifies that adding brick fails when user does not have permission to access the function's project.

**Setup**:
- Mock authenticated user (no permission)
- Create test function in project owned by different user
- Mock permission check to return false

**Test Steps**:
1. Prepare authenticated user context (no permission)
2. Prepare existing function in project owned by different user
3. Prepare valid brick type
4. Call add brick API endpoint
5. Verify permission check fails
6. Verify error response is returned
7. Verify no brick is created

**Expected Results**:
- Status code: 403 (Forbidden)
- Error message: "Permission denied"
- No brick record created

**Test Data**:
- Function ID: Valid UUID
- Brick type: "ListInstancesByDB"
- Owner user ID: Different UUID
- Authenticated user ID: Different UUID (no permission)

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Function permission check mock (returns no permission)

**Assertions**:
1. Assert status code is 403
2. Assert error message is "Permission denied"
3. Assert no brick record is created

---

### Test 4: Add Brick at Maximum Limit
**Test Name**: `should handle brick addition at maximum bricks per function limit`

**Description**: Verifies that brick addition works correctly when function has reached the maximum bricks limit (50 bricks per function).

**Setup**:
- Mock authenticated user (project owner)
- Create test function with 50 existing bricks
- Mock brick count query

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare function with 50 bricks
3. Attempt to add new brick
4. Verify brick count check
5. Verify brick addition succeeds (or fails with appropriate message if limit enforced)
6. Verify brick is added (if limit allows) or error is returned (if limit enforced)

**Expected Results**:
- Either:
  - Status code: 201 (Created) - if limit is not enforced
  - Status code: 400 (Bad Request) - if limit is enforced
- Error message (if limit enforced): "Maximum bricks limit reached (50)"

**Test Data**:
- Function ID: Valid UUID
- Existing bricks: 50
- Brick type: "ListInstancesByDB"

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Brick count query mock (returns 50)

**Assertions**:
1. Assert appropriate status code based on limit enforcement
2. If limit enforced, assert error message indicates limit reached
3. If limit not enforced, assert brick is added

---

### Test 5: Add Brick Grid Position Calculation
**Test Name**: `should calculate correct grid position from pixel coordinates`

**Description**: Verifies that grid position is correctly calculated from pixel drop coordinates.

**Setup**:
- Mock authenticated user (project owner)
- Create test function
- Mock grid position calculation service

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing function
3. Prepare brick type
4. Simulate drop at various pixel positions:
   - (0, 0) → grid (0, 0)
   - (50, 100) → grid (2, 5) (assuming 25px grid cell size)
   - (100, 200) → grid (4, 10)
5. For each position, call add brick API endpoint
6. Verify grid position is calculated correctly
7. Verify brick is created at correct grid position

**Expected Results**:
- Status code: 201 (Created)
- Grid position is calculated correctly from pixel coordinates
- Brick is created at correct grid position

**Test Data**:
- Function ID: Valid UUID
- Brick type: "ListInstancesByDB"
- Drop positions: [(0, 0), (50, 100), (100, 200)]
- Grid cell size: 25px (example)

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Grid position calculation mock

**Assertions**:
1. Assert status code is 201 for each position
2. Assert grid position is calculated correctly
3. Assert brick is created at correct grid position

---

### Test 6: Add Brick with Inputs/Outputs
**Test Name**: `should create brick with correct inputs and outputs based on type`

**Description**: Verifies that brick is created with correct inputs and outputs based on brick type.

**Setup**:
- Mock authenticated user (project owner)
- Create test function
- Mock brick type definitions

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing function
3. Test each brick type:
   - "ListInstancesByDB": Input "Name of DB", Output "List"
   - "GetFirstInstance": Input "List", Output "DB"
   - "LogInstanceProps": Input "Object", Output "value"
4. For each brick type, call add brick API endpoint
5. Verify brick is created with correct inputs/outputs
6. Verify inputs/outputs are displayed correctly

**Expected Results**:
- Status code: 201 (Created)
- Each brick type has correct inputs/outputs:
   - "ListInstancesByDB": Input "Name of DB", Output "List"
   - "GetFirstInstance": Input "List", Output "DB"
   - "LogInstanceProps": Input "Object", Output "value"
- Inputs/outputs are displayed correctly

**Test Data**:
- Function ID: Valid UUID
- Brick types: ["ListInstancesByDB", "GetFirstInstance", "LogInstanceProps"]

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Brick type definition mock

**Assertions**:
1. Assert status code is 201 for each brick type
2. Assert each brick has correct inputs
3. Assert each brick has correct outputs
4. Assert inputs/outputs are displayed correctly

---

### Test 7: Add Brick Auto-Persistence
**Test Name**: `should auto-persist brick addition within debounce delay`

**Description**: Verifies that brick addition is automatically persisted within the debounce delay (500ms).

**Setup**:
- Mock authenticated user (project owner)
- Create test function
- Mock auto-save mechanism with 500ms debounce

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing function
3. Call add brick API endpoint
4. Verify debounce mechanism is triggered
5. Wait for debounce delay (500ms)
6. Verify auto-persistence occurs
7. Verify brick is saved within 1 second

**Expected Results**:
- Status code: 201 (Created)
- Debounce mechanism is triggered
- Auto-persistence occurs within 500ms debounce
- Brick is saved within 1 second
- No explicit save button required

**Test Data**:
- Function ID: Valid UUID
- Brick type: "ListInstancesByDB"

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Auto-save mechanism mock (500ms debounce)

**Assertions**:
1. Assert debounce mechanism is triggered
2. Assert auto-persistence occurs within debounce delay
3. Assert brick is saved within 1 second
4. Assert no explicit save is required

---

### Test 8: Add Brick Response Time
**Test Name**: `should complete brick addition within performance requirements`

**Description**: Verifies that brick addition completes within the required response time (< 300ms for POST requests).

**Setup**:
- Mock authenticated user (project owner)
- Create test function
- Mock fast database operations

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing function
3. Call add brick API endpoint
4. Measure response time
5. Verify response time is < 300ms

**Expected Results**:
- Status code: 201 (Created)
- Response time: < 300ms
- Brick addition succeeds

**Test Data**:
- Function ID: Valid UUID
- Brick type: "ListInstancesByDB"

**Mocks/Stubs Required**:
- Authentication middleware mock (with timing)
- Database connection mock (with timing)

**Assertions**:
1. Assert status code is 201
2. Assert response time is < 300ms
3. Assert brick addition succeeds

---

### Test 9: Add Brick Non-Existent Function
**Test Name**: `should reject brick addition when function does not exist`

**Description**: Verifies that adding brick fails when function ID does not exist.

**Setup**:
- Mock authenticated user
- Mock database query to return no function

**Test Steps**:
1. Prepare authenticated user context
2. Prepare non-existent function ID
3. Prepare valid brick type
4. Call add brick API endpoint
5. Verify function lookup returns no function
6. Verify error response is returned

**Expected Results**:
- Status code: 404 (Not Found)
- Error message: "Function not found"
- No brick record created

**Test Data**:
- Function ID: Valid UUID (but non-existent)
- Brick type: "ListInstancesByDB"

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock (returns no function)

**Assertions**:
1. Assert status code is 404
2. Assert error message is "Function not found"
3. Assert no brick record is created

---

### Test 10: Add Brick with Invalid UUID
**Test Name**: `should reject brick addition when function ID is invalid UUID`

**Description**: Verifies that adding brick fails when function ID is not a valid UUID format.

**Test Steps**:
1. Prepare authenticated user context
2. Prepare invalid function IDs:
   - "invalid-uuid"
   - "123"
   - "not-a-uuid"
   - ""
3. For each invalid ID, call add brick API endpoint
4. Verify UUID validation fails
5. Verify error response is returned

**Expected Results**:
- Status code: 400 (Bad Request)
- Error message: "Invalid function ID" or "Invalid UUID format"
- No database query occurs

**Test Data**:
- Invalid function IDs: ["invalid-uuid", "123", "not-a-uuid", ""]
- Brick type: "ListInstancesByDB"

**Mocks/Stubs Required**:
- Authentication middleware mock
- UUID validation function

**Assertions**:
1. Assert status code is 400 for each invalid ID
2. Assert error message indicates invalid ID
3. Assert no database query is made
