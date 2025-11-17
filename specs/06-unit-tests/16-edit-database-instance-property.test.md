# Edit Database Instance Property Test

## Test Name
`edit-database-instance-property.test.md` - Database Instance Property Editing Tests

## Description
Comprehensive unit tests for the Edit Database Instance Property use case. Tests permission validation, property value updates, auto-persistence, and validation.

## Test Cases

### Test 1: Successful Property Edit
**Test Name**: `should successfully edit instance property when user has permission`

**Description**: Verifies that user with permission can edit instance property value, value is updated, auto-persisted, and updated_at timestamp is updated.

**Setup**:
- Mock authenticated user (project owner or with permission)
- Create test project
- Create database instance with property value
- Mock database connection
- Mock auto-save mechanism (500ms debounce)

**Test Steps**:
1. Prepare authenticated user context
2. Prepare existing database instance with property value "Old Value"
3. Simulate user input of new value "New Value"
4. Call edit database instance property API endpoint
5. Verify user authentication
6. Verify permission check passes
7. Verify property value validation passes
8. Verify property value is updated in database
9. Verify updated_at timestamp is updated
10. Verify auto-persistence occurs (within 500ms debounce)
11. Verify response indicates success

**Expected Results**:
- Status code: 200 (OK) or 204 (No Content)
- Response indicates success
- Instance value record updated in database:
  - `value`: "New Value"
  - `updated_at`: Updated timestamp
- Auto-persistence occurs within 1 second
- Property value is displayed correctly
- No errors occur

**Test Data**:
- Instance ID: Valid UUID
- Property ID: Valid UUID
- Old value: "Old Value"
- New value: "New Value"
- Project ID: Valid UUID

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Project permission check mock (returns permission)
- Auto-save mechanism mock (500ms debounce)

**Assertions**:
1. Assert status code is 200 or 204
2. Assert property value is updated in database
3. Assert updated_at timestamp is updated
4. Assert auto-persistence occurs
5. Assert property value is displayed correctly

---

### Test 2: Edit Property Permission Denied
**Test Name**: `should reject property edit when user does not have permission`

**Description**: Verifies that property edit fails when user does not have permission to access the project.

**Setup**:
- Mock authenticated user (no permission)
- Create test project owned by different user
- Create database instance
- Mock permission check to return false

**Test Steps**:
1. Prepare authenticated user context (no permission)
2. Prepare existing database instance in project owned by different user
3. Call edit database instance property API endpoint
4. Verify permission check fails
5. Verify error response is returned
6. Verify property value is NOT updated

**Expected Results**:
- Status code: 403 (Forbidden)
- Error message: "Permission denied"
- Property value remains unchanged
- No database update occurs

**Test Data**:
- Instance ID: Valid UUID
- Property ID: Valid UUID
- Project ID: Valid UUID
- Owner user ID: Different UUID
- Authenticated user ID: Different UUID (no permission)
- New value: "New Value"

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Project permission check mock (returns no permission)

**Assertions**:
1. Assert status code is 403
2. Assert error message is "Permission denied"
3. Assert property value is NOT updated
4. Assert updated_at timestamp is NOT changed

---

### Test 3: Edit Property Invalid Value
**Test Name**: `should reject property edit when value is invalid for property type`

**Description**: Verifies that property edit fails when value is invalid for the property type (e.g., string for number property, invalid format).

**Setup**:
- Mock authenticated user (project owner)
- Create database instance with number property
- Mock property type validation

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing database instance with number property
3. Attempt to edit with invalid values:
   - String value for number property: "not-a-number"
   - Invalid format for date property: "invalid-date"
   - Invalid boolean value: "maybe"
4. For each invalid value, call edit property API endpoint
5. Verify property type validation fails
6. Verify error response is returned
7. Verify property value is NOT updated

**Expected Results**:
- Status code: 400 (Bad Request)
- Error message: "Invalid property value"
- Property value remains unchanged

**Test Data**:
- Instance ID: Valid UUID
- Property ID: Valid UUID (number type)
- Invalid values: ["not-a-number", "invalid-date", "maybe"]

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Property type validation mock

**Assertions**:
1. Assert status code is 400 for each invalid value
2. Assert error message is "Invalid property value"
3. Assert property value is NOT updated

---

### Test 4: Edit Property Non-Existent Instance
**Test Name**: `should reject property edit when instance does not exist`

**Description**: Verifies that property edit fails when instance ID does not exist.

**Setup**:
- Mock authenticated user
- Mock database query to return no instance

**Test Steps**:
1. Prepare authenticated user context
2. Prepare non-existent instance ID
3. Call edit database instance property API endpoint
4. Verify instance lookup returns no instance
5. Verify error response is returned

**Expected Results**:
- Status code: 404 (Not Found)
- Error message: "Instance not found"
- No database update occurs

**Test Data**:
- Instance ID: Valid UUID (but non-existent)
- Property ID: Valid UUID
- New value: "New Value"

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock (returns no instance)

**Assertions**:
1. Assert status code is 404
2. Assert error message is "Instance not found"
3. Assert no database update occurs

---

### Test 5: Edit Property Auto-Persistence
**Test Name**: `should auto-persist property value within debounce delay`

**Description**: Verifies that property value is automatically persisted within the debounce delay (500ms) after user input.

**Setup**:
- Mock authenticated user (project owner)
- Create database instance
- Mock auto-save mechanism with 500ms debounce

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing database instance
3. Simulate user input of new value
4. Call edit database instance property API endpoint
5. Verify debounce mechanism is triggered
6. Wait for debounce delay (500ms)
7. Verify auto-persistence occurs
8. Verify value is saved within 1 second of last modification

**Expected Results**:
- Status code: 200 (OK)
- Debounce mechanism is triggered
- Auto-persistence occurs within 500ms debounce
- Value is saved within 1 second
- No explicit save button required

**Test Data**:
- Instance ID: Valid UUID
- Property ID: Valid UUID
- New value: "New Value"

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Auto-save mechanism mock (500ms debounce)

**Assertions**:
1. Assert debounce mechanism is triggered
2. Assert auto-persistence occurs within debounce delay
3. Assert value is saved within 1 second
4. Assert no explicit save is required

---

### Test 6: Edit Property Response Time
**Test Name**: `should complete property edit within performance requirements`

**Description**: Verifies that property edit completes within the required response time (< 250ms for PUT requests).

**Setup**:
- Mock authenticated user (project owner)
- Create database instance
- Mock fast database operations

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing database instance
3. Call edit database instance property API endpoint
4. Measure response time
5. Verify response time is < 250ms

**Expected Results**:
- Status code: 200 (OK)
- Response time: < 250ms
- Property edit succeeds

**Test Data**:
- Instance ID: Valid UUID
- Property ID: Valid UUID
- New value: "New Value"

**Mocks/Stubs Required**:
- Authentication middleware mock (with timing)
- Database connection mock (with timing)

**Assertions**:
1. Assert status code is 200
2. Assert response time is < 250ms
3. Assert property edit succeeds

---

### Test 7: Edit Property with Null/Empty Value
**Test Name**: `should handle property edit with null or empty value`

**Description**: Verifies that property edit handles null or empty values correctly (depending on property type requirements).

**Setup**:
- Mock authenticated user (project owner)
- Create database instance with string property (allows empty)

**Test Steps**:
1. Prepare authenticated user context (project owner)
2. Prepare existing database instance with string property
3. Attempt to edit with null or empty value:
   - Empty string: ""
   - Null: null
4. For each case, call edit property API endpoint
5. Verify value validation (if required)
6. Verify value is updated (if allowed) or error is returned (if not allowed)

**Expected Results**:
- Either:
  - Status code: 200 (OK) - if empty values are allowed
  - Status code: 400 (Bad Request) - if empty values are not allowed
- Error message (if not allowed): "Property value is required"

**Test Data**:
- Instance ID: Valid UUID
- Property ID: Valid UUID (string type)
- Values: ["", null]

**Mocks/Stubs Required**:
- Authentication middleware mock
- Database connection mock
- Property validation mock

**Assertions**:
1. Assert appropriate status code based on property requirements
2. If not allowed, assert error message indicates value is required
3. If allowed, assert value is updated correctly

---

### Test 8: Edit Property with Invalid UUIDs
**Test Name**: `should reject property edit when IDs are invalid UUIDs`

**Description**: Verifies that property edit fails when instance ID or property ID is not a valid UUID format.

**Test Steps**:
1. Prepare authenticated user context
2. Prepare invalid instance IDs:
   - "invalid-uuid"
   - "123"
3. Prepare invalid property IDs:
   - "invalid-uuid"
   - "123"
4. For each invalid ID combination, call edit property API endpoint
5. Verify UUID validation fails
6. Verify error response is returned

**Expected Results**:
- Status code: 400 (Bad Request)
- Error message: "Invalid instance ID" or "Invalid property ID" or "Invalid UUID format"
- No database query occurs

**Test Data**:
- Invalid instance IDs: ["invalid-uuid", "123"]
- Invalid property IDs: ["invalid-uuid", "123"]
- New value: "New Value"

**Mocks/Stubs Required**:
- Authentication middleware mock
- UUID validation function

**Assertions**:
1. Assert status code is 400 for each invalid ID
2. Assert error message indicates invalid ID
3. Assert no database query is made
