# Edge Cases Tests

## Test Name
`edge-cases.test.ts` - Edge Case and Boundary Testing

## Description
Comprehensive unit tests for edge cases, boundary conditions, invalid inputs, and abnormal scenarios. Covers empty inputs, null values, invalid data types, boundary values, invalid UUIDs, non-existent resources, duplicate data, and constraint violations.

## Test Cases

### Test 1: Empty Inputs
**Test Name**: `should handle empty input strings correctly`

**Description**: Verifies that system handles empty input strings correctly for all input fields (email, password, names, etc.).

**Test Steps**:
1. Test empty email: ""
2. Test empty password: ""
3. Test empty project name: ""
4. Test empty function name: ""
5. Test empty property value: ""
6. For each empty input, verify validation fails or empty value is handled appropriately

**Expected Results**:
- Empty email: 400 (Bad Request), "Email is required"
- Empty password: 400 (Bad Request), "Password is required"
- Empty project name: 400 (Bad Request), "Invalid project name"
- Empty function name: 400 (Bad Request), "Invalid function name"
- Empty property value: Depends on property type requirements

**Test Data**:
- Empty strings: ["", "   "]

**Mocks/Stubs Required**:
- Validation service mock

**Assertions**:
1. Assert appropriate status codes for empty inputs
2. Assert error messages indicate required/invalid
3. Assert no data is created/updated with empty inputs

---

### Test 2: Null Values
**Test Name**: `should handle null values correctly`

**Description**: Verifies that system handles null values correctly for all fields.

**Test Steps**:
1. Test null email: null
2. Test null password: null
3. Test null project ID: null
4. Test null function ID: null
5. Test null property value: null
6. For each null value, verify validation fails or null is handled appropriately

**Expected Results**:
- Null email: 400 (Bad Request), "Email is required"
- Null password: 400 (Bad Request), "Password is required"
- Null IDs: 400 (Bad Request), "Invalid ID" or "ID is required"
- Null property value: Depends on property type requirements

**Test Data**:
- Null values: [null, undefined]

**Mocks/Stubs Required**:
- Validation service mock

**Assertions**:
1. Assert appropriate status codes for null values
2. Assert error messages indicate required/invalid
3. Assert no data is created/updated with null values

---

### Test 3: Invalid Data Types
**Test Name**: `should reject invalid data types`

**Description**: Verifies that system rejects invalid data types for all fields.

**Test Steps**:
1. Test number for email: 123
2. Test boolean for password: true
3. Test array for project name: []
4. Test object for function name: {}
5. Test string for number property: "not-a-number"
6. For each invalid type, verify validation fails

**Expected Results**:
- Invalid types: 400 (Bad Request), "Invalid data type" or type-specific error
- No data is created/updated with invalid types

**Test Data**:
- Invalid types: [123, true, [], {}, "not-a-number"]

**Mocks/Stubs Required**:
- Type validation mock

**Assertions**:
1. Assert appropriate status codes for invalid types
2. Assert error messages indicate invalid type
3. Assert no data is created/updated with invalid types

---

### Test 4: Boundary Values - String Lengths
**Test Name**: `should handle boundary values for string lengths`

**Description**: Verifies that system handles minimum and maximum string lengths correctly.

**Test Steps**:
1. Test minimum length strings: 1 character
2. Test maximum length strings: 254 characters (email), 255 characters (names)
3. Test strings exceeding maximum: 256+ characters
4. Test strings below minimum: 0 characters (empty)
5. For each boundary, verify validation passes or fails appropriately

**Expected Results**:
- Minimum length: Validation passes (if >= 1) or fails (if < 1)
- Maximum length: Validation passes (if <= max) or fails (if > max)
- Exceeding maximum: 400 (Bad Request), "Value exceeds maximum length"
- Below minimum: 400 (Bad Request), "Value below minimum length"

**Test Data**:
- Minimum: 1 character
- Maximum: 254-255 characters
- Exceeding: 256+ characters

**Mocks/Stubs Required**:
- Length validation mock

**Assertions**:
1. Assert minimum length validation works
2. Assert maximum length validation works
3. Assert exceeding maximum is rejected
4. Assert below minimum is rejected

---

### Test 5: Boundary Values - Numbers
**Test Name**: `should handle boundary values for numeric fields`

**Description**: Verifies that system handles minimum and maximum numeric values correctly.

**Test Steps**:
1. Test minimum numbers: 0, 1
2. Test maximum numbers: 10,000 (projects), 100 (functions), 50 (bricks)
3. Test numbers exceeding maximum: 10,001, 101, 51
4. Test negative numbers: -1, -100
5. For each boundary, verify validation passes or fails appropriately

**Expected Results**:
- Minimum numbers: Validation passes (if >= min) or fails (if < min)
- Maximum numbers: Validation passes (if <= max) or fails (if > max)
- Exceeding maximum: 400 (Bad Request), "Value exceeds maximum"
- Negative numbers: 400 (Bad Request), "Value must be positive"

**Test Data**:
- Minimum: 0, 1
- Maximum: 10,000, 100, 50
- Exceeding: 10,001, 101, 51
- Negative: -1, -100

**Mocks/Stubs Required**:
- Number validation mock

**Assertions**:
1. Assert minimum number validation works
2. Assert maximum number validation works
3. Assert exceeding maximum is rejected
4. Assert negative numbers are rejected (if applicable)

---

### Test 6: Invalid UUIDs
**Test Name**: `should reject invalid UUID formats`

**Description**: Verifies that system rejects invalid UUID formats for all ID fields.

**Test Steps**:
1. Test invalid UUID formats:
   - "invalid-uuid"
   - "123"
   - "not-a-uuid"
   - "123e4567-e89b-12d3-a456-426614174000" (invalid version)
   - ""
   - "123e4567-e89b-12d3-a456" (incomplete)
2. For each invalid UUID, verify validation fails

**Expected Results**:
- Invalid UUIDs: 400 (Bad Request), "Invalid UUID format" or "Invalid ID"
- No database queries are made with invalid UUIDs

**Test Data**:
- Invalid UUIDs: ["invalid-uuid", "123", "not-a-uuid", "", "123e4567-e89b-12d3-a456"]

**Mocks/Stubs Required**:
- UUID validation mock

**Assertions**:
1. Assert all invalid UUID formats are rejected
2. Assert error messages indicate invalid UUID
3. Assert no database queries are made

---

### Test 7: Non-Existent Resources
**Test Name**: `should handle non-existent resources correctly`

**Description**: Verifies that system handles requests for non-existent resources correctly (404 errors).

**Test Steps**:
1. Test non-existent user ID
2. Test non-existent project ID
3. Test non-existent function ID
4. Test non-existent brick ID
5. Test non-existent database type ID
6. Test non-existent instance ID
7. For each non-existent resource, verify 404 error is returned

**Expected Results**:
- Non-existent resources: 404 (Not Found), "Resource not found"
- No data is returned
- No operations are performed

**Test Data**:
- Non-existent IDs: Valid UUID format but not in database

**Mocks/Stubs Required**:
- Database connection mock (returns no resource)

**Assertions**:
1. Assert all non-existent resources return 404
2. Assert error messages indicate resource not found
3. Assert no data is returned
4. Assert no operations are performed

---

### Test 8: Duplicate Data
**Test Name**: `should prevent duplicate data creation`

**Description**: Verifies that system prevents duplicate data creation (unique constraints).

**Test Steps**:
1. Test duplicate email registration
2. Test duplicate project permission
3. Test duplicate brick connection
4. Test duplicate database instance (if applicable)
5. For each duplicate, verify unique constraint violation

**Expected Results**:
- Duplicate email: 400 (Bad Request), "Email already registered"
- Duplicate permission: 400 (Bad Request) or 409 (Conflict), "User already has permission"
- Duplicate connection: 400 (Bad Request) or 409 (Conflict), "Link already exists"
- Duplicate data: Appropriate error based on constraint

**Test Data**:
- Existing data: Already in database
- Duplicate data: Same as existing

**Mocks/Stubs Required**:
- Database connection mock (returns existing data)
- Unique constraint validation mock

**Assertions**:
1. Assert duplicate email is rejected
2. Assert duplicate permission is rejected
3. Assert duplicate connection is rejected
4. Assert appropriate error messages

---

### Test 9: Constraint Violations
**Test Name**: `should handle database constraint violations correctly`

**Description**: Verifies that system handles database constraint violations correctly (foreign keys, unique constraints, check constraints).

**Test Steps**:
1. Test foreign key violation: Reference non-existent parent
2. Test unique constraint violation: Duplicate unique value
3. Test check constraint violation: Value outside allowed range
4. Test cascade delete: Delete parent with children
5. For each constraint violation, verify appropriate error

**Expected Results**:
- Foreign key violation: 400 (Bad Request) or 404 (Not Found), "Referenced resource not found"
- Unique constraint violation: 400 (Bad Request) or 409 (Conflict), "Duplicate value"
- Check constraint violation: 400 (Bad Request), "Value outside allowed range"
- Cascade delete: Deletes children or prevents deletion based on constraint

**Test Data**:
- Invalid references: Non-existent parent IDs
- Duplicate values: Existing unique values
- Invalid ranges: Values outside constraints

**Mocks/Stubs Required**:
- Database connection mock (throws constraint violations)
- Constraint validation mock

**Assertions**:
1. Assert foreign key violations are handled
2. Assert unique constraint violations are handled
3. Assert check constraint violations are handled
4. Assert cascade deletes work correctly

---

### Test 10: Transaction Rollbacks
**Test Name**: `should rollback transactions on errors`

**Description**: Verifies that database transactions are rolled back correctly when errors occur.

**Test Steps**:
1. Test multi-step operation with error in middle
2. Test concurrent modification conflicts
3. Test deadlock scenarios
4. For each scenario, verify transaction rollback

**Expected Results**:
- Errors trigger transaction rollback
- No partial data is saved
- System returns to consistent state
- Appropriate error is returned

**Test Data**:
- Multi-step operations: Create project with functions
- Concurrent modifications: Simultaneous updates
- Deadlocks: Lock conflicts

**Mocks/Stubs Required**:
- Transaction mock
- Database connection mock (throws errors)

**Assertions**:
1. Assert transactions are rolled back on errors
2. Assert no partial data is saved
3. Assert system returns to consistent state
4. Assert appropriate errors are returned

---

### Test 11: Authentication Failures
**Test Name**: `should handle authentication failures correctly`

**Description**: Verifies that system handles authentication failures correctly.

**Test Steps**:
1. Test invalid token
2. Test expired token
3. Test missing token
4. Test token for non-existent user
5. For each failure, verify 401 error is returned

**Expected Results**:
- Invalid token: 401 (Unauthorized), "Invalid token"
- Expired token: 401 (Unauthorized), "Token expired"
- Missing token: 401 (Unauthorized), "Authentication required"
- Non-existent user: 401 (Unauthorized), "Invalid token"

**Test Data**:
- Invalid tokens: Various invalid formats
- Expired tokens: Tokens past expiration
- Missing tokens: No token provided

**Mocks/Stubs Required**:
- Token validation mock

**Assertions**:
1. Assert all authentication failures return 401
2. Assert error messages indicate authentication issue
3. Assert no operations are performed

---

### Test 12: Authorization Failures
**Test Name**: `should handle authorization failures correctly`

**Description**: Verifies that system handles authorization failures correctly (permission denied).

**Test Steps**:
1. Test access to other user's project
2. Test access to project without permission
3. Test modification without ownership
4. Test deletion without permission
5. For each failure, verify 403 error is returned

**Expected Results**:
- Authorization failures: 403 (Forbidden), "Permission denied"
- No data is returned
- No operations are performed

**Test Data**:
- Resources owned by different users
- Resources without permissions

**Mocks/Stubs Required**:
- Permission check mock (returns no permission)

**Assertions**:
1. Assert all authorization failures return 403
2. Assert error messages indicate permission denied
3. Assert no data is returned
4. Assert no operations are performed
