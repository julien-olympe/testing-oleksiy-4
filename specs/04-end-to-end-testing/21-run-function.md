# Run Function Test Scenarios

## Test ID: FUNC-RUN-001
## Test Name: Run Function - Positive Case
## Test Type: Positive
## Related Use Cases: Run Function

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Function Editor for function "TestFunction"
- Function "TestFunction" exists in project "TestProject"
- "List instances by DB name" brick exists on canvas
- "Get first instance" brick exists on canvas
- "Log instance props" brick exists on canvas
- Link exists from "List instances by DB name" output "List" to "Get first instance" input "List"
- Link exists from "Get first instance" output "DB" to "Log instance props" input "Object"
- "Name of DB" input parameter on "List instances by DB name" brick is set to "default database"
- At least one database instance exists for "default database" in project "TestProject"
- Browser console is open and visible for log output verification
- User has permission to run the function

### Test Data
- Function Name: "TestFunction"
- Project Name: "TestProject"
- Database Type: "default database"
- Database Instance String Value: "Test Instance Value"

### Test Steps
1. Verify user is in Function Editor
2. Verify all three bricks are displayed on canvas
3. Verify "List instances by DB name" brick has "default database" set as input parameter
4. Verify connection line exists from "List instances by DB name" output "List" to "Get first instance" input "List"
5. Verify connection line exists from "Get first instance" output "DB" to "Log instance props" input "Object"
6. Verify RUN button is visible above the search bar in the left side panel
7. Verify browser console is open and visible
8. Click RUN button
9. Verify function execution starts (no error messages displayed immediately)
10. Verify function logic executes in the correct order:
    - "List instances by DB name" retrieves all instances of "default database"
    - "Get first instance" extracts the first instance from the list
    - "Log instance props" outputs the instance properties to console
11. Verify browser console displays the logged instance properties
12. Verify console output shows the first instance's string property value
13. Verify console output shows the object structure with all properties
14. Verify no execution errors are displayed
15. Verify function execution completes successfully

### Expected Results
- RUN button is visible and clickable
- Function execution starts when RUN button is clicked
- Function logic executes in correct order
- All bricks execute successfully
- Console output is generated
- Instance properties are logged to console
- Console output shows correct instance data
- No execution errors are displayed
- Function execution completes successfully

### Postconditions
- Function execution is completed
- Console output is displayed
- Instance properties are logged
- User remains in Function Editor
- Function can be run again

---

## Test ID: FUNC-RUN-002
## Test Name: Run Function - Negative Case - Missing Required Inputs
## Test Type: Negative
## Related Use Cases: Run Function

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Function Editor for function "TestFunction"
- "List instances by DB name" brick exists on canvas
- "Get first instance" brick exists on canvas
- "Log instance props" brick exists on canvas
- Links are properly configured between bricks
- "Name of DB" input parameter on "List instances by DB name" brick is NOT set (missing required input)
- User has permission to run the function

### Test Data
- Function Name: "TestFunction"
- Brick: "List instances by DB name"
- Input Parameter: "Name of DB" (not set)

### Test Steps
1. Verify user is in Function Editor
2. Verify all three bricks are displayed on canvas
3. Verify "List instances by DB name" brick does NOT have "Name of DB" parameter set
4. Verify links are properly configured
5. Verify RUN button is visible
6. Click RUN button
7. Verify function execution fails OR is prevented
8. Verify error message "Missing required inputs" is displayed
9. Verify function logic does not execute
10. Verify no console output is generated
11. Verify execution is blocked until required inputs are set

### Expected Results
- RUN button is clickable
- Function execution fails or is prevented
- Error message "Missing required inputs" is displayed
- Function logic does not execute
- No console output is generated
- Execution is blocked until required inputs are configured

### Postconditions
- Function execution is blocked
- Error message is displayed
- User remains in Function Editor
- User can set required inputs and try again

---

## Test ID: FUNC-RUN-003
## Test Name: Run Function - Negative Case - Invalid Brick Connections
## Test Type: Negative
## Related Use Cases: Run Function

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Function Editor for function "TestFunction"
- "List instances by DB name" brick exists on canvas
- "Get first instance" brick exists on canvas
- "Log instance props" brick exists on canvas
- Bricks are NOT properly linked (missing links or invalid connections)
- "Name of DB" input parameter on "List instances by DB name" brick is set to "default database"
- User has permission to run the function

### Test Data
- Function Name: "TestFunction"
- Database Type: "default database"

### Test Steps
1. Verify user is in Function Editor
2. Verify all three bricks are displayed on canvas
3. Verify "List instances by DB name" brick has "default database" set as input parameter
4. Verify bricks are NOT properly linked (e.g., missing link between "List instances by DB name" and "Get first instance")
5. Verify RUN button is visible
6. Click RUN button
7. Verify function execution fails OR is prevented
8. Verify error message "Invalid brick connections" is displayed
9. Verify function logic does not execute
10. Verify no console output is generated
11. Verify execution is blocked until connections are fixed

### Expected Results
- RUN button is clickable
- Function execution fails or is prevented
- Error message "Invalid brick connections" is displayed
- Function logic does not execute
- No console output is generated
- Execution is blocked until connections are valid

### Postconditions
- Function execution is blocked
- Error message is displayed
- User remains in Function Editor
- User can fix connections and try again

---

## Test ID: FUNC-RUN-004
## Test Name: Run Function - Negative Case - Execution Failed
## Test Type: Negative
## Related Use Cases: Run Function

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Function Editor for function "TestFunction"
- "List instances by DB name" brick exists on canvas
- "Get first instance" brick exists on canvas
- "Log instance props" brick exists on canvas
- Links are properly configured
- "Name of DB" input parameter on "List instances by DB name" brick is set to "default database"
- No database instances exist for "default database" in project "TestProject" (or other condition that causes execution failure)
- User has permission to run the function

### Test Data
- Function Name: "TestFunction"
- Project Name: "TestProject"
- Database Type: "default database"

### Test Steps
1. Verify user is in Function Editor
2. Verify all three bricks are displayed on canvas
3. Verify "List instances by DB name" brick has "default database" set as input parameter
4. Verify links are properly configured
5. Verify no instances exist for "default database" (or condition that causes failure)
6. Verify RUN button is visible
7. Click RUN button
8. Verify function execution starts
9. Verify function execution fails during execution
10. Verify error message "Execution failed" is displayed
11. Verify error message provides details about the failure (e.g., "No instances found")
12. Verify partial execution may have occurred
13. Verify error is clearly communicated to user

### Expected Results
- RUN button is clickable
- Function execution starts
- Execution fails during runtime
- Error message "Execution failed" is displayed
- Error message provides failure details
- Error is clearly communicated

### Postconditions
- Function execution failed
- Error message is displayed
- User remains in Function Editor
- User can fix issues and try again

---

## Test ID: FUNC-RUN-005
## Test Name: Run Function - Negative Case - Permission Denied
## Test Type: Negative
## Related Use Cases: Run Function

### Preconditions
- Application is accessible and running
- User account exists with email "owner@example.com" and password "SecurePass123!"
- User account exists with email "user@example.com" and password "SecurePass456!"
- Project "SharedProject" exists and belongs to "owner@example.com"
- Function "SharedFunction" exists in project "SharedProject"
- Function is properly configured with bricks and links
- User "user@example.com" has permission to view the function but NOT to run it
- User "user@example.com" is logged in and authenticated
- User "user@example.com" is in Function Editor for function "SharedFunction"

### Test Data
- Function Name: "SharedFunction"
- Project Name: "SharedProject"

### Test Steps
1. Verify user "user@example.com" is in Function Editor
2. Verify function is displayed with bricks and links (if user has view permission)
3. Verify RUN button is NOT displayed OR is disabled (if user lacks permission)
4. If RUN button is visible, attempt to click it
5. If button is clicked, verify execution fails
6. Verify error message "Permission denied" is displayed (if execution is attempted)
7. Verify function does not execute
8. Verify no console output is generated

### Expected Results
- RUN button is not available OR is disabled for users without permission
- Error message "Permission denied" is displayed (if execution is attempted)
- Function does not execute
- Permission restrictions are enforced

### Postconditions
- Function execution is blocked
- User "user@example.com" remains in Function Editor
- Permission restrictions are maintained

---

## Test ID: FUNC-RUN-006
## Test Name: Run Function - Verify Console Output Format
## Test Type: Positive (Verification)
## Related Use Cases: Run Function

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Function Editor for function "TestFunction"
- Function is properly configured with all bricks linked
- "Name of DB" input parameter is set to "default database"
- Database instance exists for "default database" with string property value "Test Value"
- Browser console is open and visible
- User has permission to run the function

### Test Data
- Function Name: "TestFunction"
- Database Type: "default database"
- Instance String Value: "Test Value"

### Test Steps
1. Verify user is in Function Editor
2. Verify function is properly configured
3. Verify browser console is open
4. Clear console output (if possible)
5. Click RUN button
6. Verify function executes successfully
7. Verify console output is generated
8. Verify console output displays instance properties
9. Verify console output shows string property value "Test Value"
10. Verify console output shows object structure
11. Verify output format is readable and clear

### Expected Results
- Function executes successfully
- Console output is generated
- Output displays instance properties correctly
- Output shows correct property values
- Output format is readable
- Output provides useful information

### Postconditions
- Function execution is completed
- Console output is displayed with correct format
- User remains in Function Editor
- Output is accessible for review

---

## Test ID: FUNC-RUN-007
## Test Name: Run Function - Run Multiple Times
## Test Type: Positive
## Related Use Cases: Run Function

### Preconditions
- Application is accessible and running
- User account exists with email "testuser@example.com" and password "SecurePass123!"
- User is logged in and authenticated
- User is in Function Editor for function "TestFunction"
- Function is properly configured with all bricks linked
- "Name of DB" input parameter is set to "default database"
- Database instances exist for "default database"
- Browser console is open and visible
- User has permission to run the function

### Test Data
- Function Name: "TestFunction"
- Database Type: "default database"

### Test Steps
1. Verify user is in Function Editor
2. Verify function is properly configured
3. Click RUN button (first time)
4. Verify function executes successfully
5. Verify console output is generated
6. Wait for execution to complete
7. Click RUN button again (second time)
8. Verify function executes successfully again
9. Verify console output is generated again
10. Verify function can be run multiple times
11. Verify each execution produces output
12. Verify no errors occur from multiple executions

### Expected Results
- Function can be run multiple times
- Each execution is successful
- Each execution produces console output
- No errors occur from multiple executions
- Function execution is repeatable

### Postconditions
- Function has been executed multiple times
- Multiple console outputs are generated
- User remains in Function Editor
- Function can be run again
