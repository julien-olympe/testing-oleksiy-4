# End-to-End Testing Rules

## General Rules for All Test Cases

### 1. Test Structure
- All test cases must follow a consistent structure with the following sections:
  - **Test ID**: Unique identifier for the test case
  - **Test Name**: Descriptive name of the test scenario
  - **Test Type**: Positive, Negative, or Critical Path
  - **Preconditions**: Required system state before test execution
  - **Test Data**: Specific data values used in the test
  - **Test Steps**: Detailed, sequential steps with no room for interpretation
  - **Expected Results**: Exact expected outcomes for each step
  - **Postconditions**: System state after test execution
  - **Related Use Cases**: Reference to functional requirements

### 2. Test Data Requirements
- Use specific, realistic test data values (e.g., email addresses, names, property values)
- Test data must be clearly defined and consistent across related test cases
- Invalid test data must be explicitly defined for negative test cases
- Test data should include edge cases (empty strings, special characters, maximum length)

### 3. Step Detail Requirements
- Each step must be atomic and unambiguous
- Steps must include exact UI element descriptions (button names, field labels, menu items)
- Steps must specify exact user actions (click, double-click, drag, drop, type, select)
- Steps must include exact input values when applicable
- Steps must specify exact locations (e.g., "top-right corner", "left panel", "center canvas")

### 4. Expected Results Requirements
- Expected results must be specific and verifiable
- Expected results must include exact UI states, messages, and behaviors
- Expected results must specify error messages verbatim when applicable
- Expected results must include visual confirmation requirements (e.g., "brick appears on canvas", "connection line is visible")

### 5. Precondition Requirements
- Preconditions must specify exact system state (e.g., "User is logged in", "Project exists with name 'TestProject'")
- Preconditions must specify user roles and permissions when applicable
- Preconditions must specify existing data (projects, functions, instances) when required
- Preconditions must specify browser state (e.g., "Browser console is open")

### 6. Postcondition Requirements
- Postconditions must specify exact system state after test execution
- Postconditions must specify data persistence requirements
- Postconditions must specify UI state (e.g., "User remains on Home Screen", "Function Editor is closed")

### 7. Validation Requirements
- All test cases must validate both functional behavior and UI state
- Test cases must verify data persistence when applicable
- Test cases must verify error handling and error messages
- Test cases must verify permission checks when applicable

### 8. Test Isolation
- Each test case must be independently executable
- Test cases must not depend on execution order
- Test data must be unique to avoid conflicts between parallel test executions
- Test cases must clean up created data or specify cleanup requirements

### 9. Coverage Requirements
- All functional requirements from Chapter 3 must be covered
- All user journeys from Chapter 4 must be testable
- Both positive and negative test cases must be provided for each use case (except critical path)
- Edge cases must be covered (empty inputs, invalid formats, boundary values)

### 10. Naming Conventions
- Test files must be numbered sequentially (01-, 02-, etc.)
- Test files must use descriptive names (e.g., "02-register-user.md", "03-login-user.md")
- Test IDs within files must be unique and sequential
- Test names must clearly indicate the scenario being tested

### 11. Consistency Requirements
- All test cases must align with functional specifications
- UI element names must match specifications exactly
- Error messages must match specifications exactly
- Navigation flows must match screen specifications

### 12. Execution Requirements
- Test steps must be executable by automated testing tools (e.g., Playwright)
- Test steps must use standard web interaction patterns
- Test steps must account for timing (e.g., "wait for element to appear", "wait for auto-save")
- Test steps must specify when to verify results (immediately after action, after navigation, etc.)

### 13. Documentation Requirements
- Each test case must reference related use cases from functional requirements
- Each test case must specify which screen(s) are involved
- Each test case must document any assumptions or special conditions
- Test cases must be detailed enough for test-driven development without additional interpretation

### 14. Error Handling
- Negative test cases must specify exact error message text
- Negative test cases must verify that invalid actions do not persist data
- Negative test cases must verify that UI returns to valid state after error
- Error messages must be verified for exact wording and location

### 15. Auto-Persistence Requirements
- Test cases must account for automatic persistence (no save buttons)
- Test cases must verify that changes are persisted immediately
- Test cases must not include save button clicks unless explicitly required
- Test cases must verify persistence by refreshing or navigating away and back
