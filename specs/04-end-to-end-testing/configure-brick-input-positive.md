# Configure Brick Input Positive Test

## Test Name
Configure Brick Input - Successful Configuration

## Description
This test verifies that a user can successfully set the value of a brick input that requires configuration. For "List instances by DB name" brick, the user selects a database name from a dropdown list of available databases.

## Prerequisites
1. Application is running and accessible at the configured base URL
2. Database is accessible
3. User is logged in and authenticated
4. User is in Function Editor for a test function
5. "List instances by DB name" brick is added to the grid panel
6. Project has at least one database available (default database)
7. Browser automation environment is set up with Playwright

## Test Steps

**Step 1: Verify Function Editor Display**
- Action: Wait for Function Editor to fully load
- Expected State: Function Editor displays with brick in grid panel
- Assertions:
  - Verify "List instances by DB name" brick is visible in grid panel
  - Verify brick displays input "Name of DB"
  - Verify input "Name of DB" is visible and clickable

**Step 2: Click on "Name of DB" Input**
- Action: Click on the "Name of DB" input of the "List instances by DB name" brick
- Expected State: Database selection dropdown is displayed
- Assertions:
  - Wait for dropdown to appear
  - Verify dropdown list is visible
  - Verify dropdown shows available databases

**Step 3: Verify Available Databases in Dropdown**
- Action: Verify dropdown list contents
- Expected State: Dropdown shows available databases
- Assertions:
  - Verify dropdown shows "default database"
  - Verify dropdown may show additional databases if they exist
  - Verify database names are displayed correctly

**Step 4: Select "default database"**
- Action: Select "default database" from the dropdown list
- Expected State: Database is selected and input is configured
- Assertions:
  - Wait for selection to be applied
  - Verify "Name of DB" input displays "default database" or shows selected value
  - Verify dropdown is closed
  - Verify input appears configured (visual indication may be present)

**Step 5: Verify Configuration Persistence**
- Action: Refresh page or navigate away and back to Function Editor
- Expected State: Configuration persists after page refresh
- Assertions:
  - Verify "Name of DB" input still shows "default database" after refresh
  - Verify configuration is persisted in database
  - Verify brick configuration is maintained

**Step 6: Change Configuration (If Applicable)**
- Action: Click on "Name of DB" input again and select a different database (if multiple databases exist)
- Expected State: Configuration is updated
- Assertions:
  - Verify dropdown appears again
  - Verify different database can be selected
  - Verify input displays new selected database
  - Verify configuration is updated in database

## Expected Results
1. "Name of DB" input is clickable and accessible
2. Clicking input displays database selection dropdown
3. Dropdown shows available databases (including "default database")
4. Database can be selected from dropdown
5. Selected database is displayed in input
6. Configuration is persisted in database
7. Configuration persists after page refresh
8. Configuration can be changed if needed

## Assertions
1. Brick input is visible and clickable
2. Clicking input displays dropdown correctly
3. Dropdown shows available databases
4. Database selection works correctly
5. Selected database is displayed in input
6. Configuration is saved in database
7. Configuration persists after page refresh
8. Configuration can be updated

## Error Scenarios
This is a positive test case. Error scenarios are covered in `configure-brick-input-negative.md`.
