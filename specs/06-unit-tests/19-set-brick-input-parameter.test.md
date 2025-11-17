# Set Brick Input Parameter Test

## Test Name
`set-brick-input-parameter.test.ts` - Brick Input Parameter Configuration Tests

## Description
Comprehensive unit tests for the Set Brick Input Parameter use case. Tests parameter value selection, validation, display on brick, and auto-persistence.

## Test Cases

### Test 1: Successful Parameter Configuration
**Test Name**: `should successfully set brick input parameter when value is valid`

**Description**: Verifies that clicking input parameter, selecting value, validates value, sets parameter, displays on brick, and auto-persists.

**Setup**:
- Mock authenticated user (project owner)
- Create test function with brick: "ListInstancesByDB"
- Mock database connection
- Mock parameter configuration service

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing function with brick "ListInstancesByDB"
3. Simulate clicking input parameter "Name of DB"
4. Display available database options (e.g., "default database")
5. Select value "default database"
6. Call set brick input parameter API endpoint
7. Verify user authentication
8. Verify function permission check
9. Verify parameter value validation passes
10. Verify parameter is set in brick configuration
11. Verify parameter is displayed on brick
12. Verify auto-persistence occurs
13. Verify response indicates success

**Expected Results**:
- Status code: 200 (OK) or 204 (No Content)
- Response indicates success
- Brick configuration updated in database:
  - `configuration`: JSONB updated with parameter value
  - `updated_at`: Updated timestamp
- Parameter is displayed on brick
- Auto-persistence occurs
- No errors occur

**Test Data**:
- Function ID: Valid UUID
- Brick ID: Valid UUID (ListInstancesByDB)
- Input parameter: "Name of DB"
- Parameter value: "default database"

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Function permission check mock (returns permission)
- Parameter configuration service mock

**Assertions**:
1. Assert status code is 200 or 204
2. Assert brick configuration is updated
3. Assert parameter value is set correctly
4. Assert updated_at timestamp is updated
5. Assert parameter is displayed on brick
6. Assert auto-persistence occurs

---

### Test 2: Set Parameter Invalid Value
**Test Name**: `should reject parameter configuration when value is invalid`

**Description**: Verifies that setting parameter fails when value is invalid (not in available options, wrong type, etc.).

**Setup**:
- Mock authenticated user (project owner)
- Create test function with brick "ListInstancesByDB"
- Mock parameter validation

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing function with brick
3. Attempt to set parameter with invalid values:
   - Value not in available options: "non-existent-db"
   - Wrong type: 123 (for string parameter)
   - Empty string: "" (if not allowed)
   - Null: null (if not allowed)
4. For each invalid value, call set parameter API endpoint
5. Verify parameter value validation fails
6. Verify error response is returned
7. Verify parameter is NOT updated

**Expected Results**:
- Status code: 400 (Bad Request)
- Error message: "Invalid parameter value"
- Parameter value remains unchanged
- Brick configuration is NOT updated

**Test Data**:
- Function ID: Valid UUID
- Brick ID: Valid UUID
- Input parameter: "Name of DB"
- Invalid values: ["non-existent-db", 123, "", null]

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Parameter validation mock

**Assertions**:
1. Assert status code is 400 for each invalid value
2. Assert error message is "Invalid parameter value"
3. Assert parameter is NOT updated
4. Assert brick configuration is NOT updated

---

### Test 3: Set Parameter Permission Denied
**Test Name**: `should reject parameter configuration when user does not have function permission`

**Description**: Verifies that setting parameter fails when user does not have permission to access the function's project.

**Setup**:
- Mock authenticated user (no permission)
- Create test function in project owned by different user
- Mock permission check to return false

**Test Steps**:
1. Prepare authenticated user context (no permission)
2. Prepare existing function in project owned by different user
3. Prepare brick with input parameter
4. Call set brick input parameter API endpoint
5. Verify permission check fails
6. Verify error response is returned
7. Verify parameter is NOT updated

**Expected Results**:
- Status code: 403 (Forbidden)
- Error message: "Permission denied"
- Parameter value remains unchanged
- Brick configuration is NOT updated

**Test Data**:
- Function ID: Valid UUID
- Brick ID: Valid UUID
- Input parameter: "Name of DB"
- Parameter value: "default database"
- Owner user ID: Different UUID
- Authenticated user ID: Different UUID (no permission)

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Function permission check mock (returns no permission)

**Assertions**:
1. Assert status code is 403
2. Assert error message is "Permission denied"
3. Assert parameter is NOT updated
4. Assert brick configuration is NOT updated

---

### Test 4: Set Parameter Non-Existent Brick
**Test Name**: `should reject parameter configuration when brick does not exist`

**Description**: Verifies that setting parameter fails when brick ID does not exist.

**Setup**:
- Mock authenticated user (project owner)
- Mock database query to return no brick

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare non-existent brick ID
3. Prepare input parameter name
4. Call set brick input parameter API endpoint
5. Verify brick lookup returns no brick
6. Verify error response is returned

**Expected Results**:
- Status code: 404 (Not Found)
- Error message: "Brick not found"
- No parameter update occurs

**Test Data**:
- Brick ID: Valid UUID (but non-existent)
- Input parameter: "Name of DB"
- Parameter value: "default database"

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock (returns no brick)

**Assertions**:
1. Assert status code is 404
2. Assert error message is "Brick not found"
3. Assert no parameter update occurs

---

### Test 5: Set Parameter Non-Existent Input
**Test Name**: `should reject parameter configuration when input parameter does not exist`

**Description**: Verifies that setting parameter fails when input parameter name does not exist on the brick.

**Setup**:
- Mock authenticated user (project owner)
- Create test function with brick "ListInstancesByDB" (has input "Name of DB")

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing function with brick
3. Attempt to set non-existent input parameter:
   - "NonExistentInput"
   - "InvalidParameter"
4. For each non-existent input, call set parameter API endpoint
5. Verify input parameter validation fails
6. Verify error response is returned

**Expected Results**:
- Status code: 400 (Bad Request)
- Error message: "Input parameter not found" or "Invalid input parameter"
- Parameter is NOT updated

**Test Data**:
- Function ID: Valid UUID
- Brick ID: Valid UUID (ListInstancesByDB)
- Non-existent inputs: ["NonExistentInput", "InvalidParameter"]
- Parameter value: "default database"

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Input parameter validation mock

**Assertions**:
1. Assert status code is 400 for each non-existent input
2. Assert error message indicates input not found
3. Assert parameter is NOT updated

---

### Test 6: Set Parameter Available Options
**Test Name**: `should display available options when clicking input parameter`

**Description**: Verifies that clicking input parameter displays available options (e.g., available databases for "Name of DB" input).

**Setup**:
- Mock authenticated user (project owner)
- Create test function with brick "ListInstancesByDB"
- Mock database type retrieval service

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing function with brick "ListInstancesByDB"
3. Simulate clicking input parameter "Name of DB"
4. Call get available options API endpoint
5. Verify available database types are retrieved
6. Verify "default database" is included in options
7. Verify options are displayed correctly

**Expected Results**:
- Status code: 200 (OK)
- Response contains available options list
- "default database" is included in options
- Options are displayed correctly

**Test Data**:
- Function ID: Valid UUID
- Brick ID: Valid UUID
- Input parameter: "Name of DB"
- Available databases: ["default database"]

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Database type retrieval service mock

**Assertions**:
1. Assert status code is 200
2. Assert response contains available options
3. Assert "default database" is included
4. Assert options are displayed correctly

---

### Test 7: Set Parameter Auto-Persistence
**Test Name**: `should auto-persist parameter configuration within debounce delay`

**Description**: Verifies that parameter configuration is automatically persisted within the debounce delay (500ms).

**Setup**:
- Mock authenticated user (project owner)
- Create test function with brick
- Mock auto-save mechanism with 500ms debounce

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing function with brick
3. Call set brick input parameter API endpoint
4. Verify debounce mechanism is triggered
5. Wait for debounce delay (500ms)
6. Verify auto-persistence occurs
7. Verify parameter is saved within 1 second

**Expected Results**:
- Status code: 200 (OK)
- Debounce mechanism is triggered
- Auto-persistence occurs within 500ms debounce
- Parameter is saved within 1 second
- No explicit save button required

**Test Data**:
- Function ID: Valid UUID
- Brick ID: Valid UUID
- Input parameter: "Name of DB"
- Parameter value: "default database"

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Auto-save mechanism mock (500ms debounce)

**Assertions**:
1. Assert debounce mechanism is triggered
2. Assert auto-persistence occurs within debounce delay
3. Assert parameter is saved within 1 second
4. Assert no explicit save is required

---

### Test 8: Set Parameter Response Time
**Test Name**: `should complete parameter configuration within performance requirements`

**Description**: Verifies that parameter configuration completes within the required response time (< 250ms for PUT requests).

**Setup**:
- Mock authenticated user (project owner)
- Create test function with brick
- Mock fast database operations

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing function with brick
3. Call set brick input parameter API endpoint
4. Measure response time
5. Verify response time is < 250ms

**Expected Results**:
- Status code: 200 (OK)
- Response time: < 250ms
- Parameter configuration succeeds

**Test Data**:
- Function ID: Valid UUID
- Brick ID: Valid UUID
- Input parameter: "Name of DB"
- Parameter value: "default database"

**Mocks/Stubs Required**:
- Authentication middleware mock (with timing)
- Database connection mock (with timing)

**Assertions**:
1. Assert status code is 200
2. Assert response time is < 250ms
3. Assert parameter configuration succeeds

---

### Test 9: Set Parameter Invalid UUID
**Test Name**: `should reject parameter configuration when brick ID is invalid UUID`

**Description**: Verifies that setting parameter fails when brick ID is not a valid UUID format.

**Test Steps**:
1. Prepare authenticated user context
2. Prepare invalid brick IDs:
   - "invalid-uuid"
   - "123"
   - "not-a-uuid"
   - ""
3. For each invalid ID, call set parameter API endpoint
4. Verify UUID validation fails
5. Verify error response is returned

**Expected Results**:
- Status code: 400 (Bad Request)
- Error message: "Invalid brick ID" or "Invalid UUID format"
- No database query occurs

**Test Data**:
- Invalid brick IDs: ["invalid-uuid", "123", "not-a-uuid", ""]
- Input parameter: "Name of DB"
- Parameter value: "default database"

**Mocks/Stubs Required**:
- Authentication middleware mock
- UUID validation function

**Assertions**:
1. Assert status code is 400 for each invalid ID
2. Assert error message indicates invalid ID
3. Assert no database query is made
