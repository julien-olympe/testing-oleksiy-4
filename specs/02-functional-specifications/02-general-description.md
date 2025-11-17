# Chapter 2 - General Description

## System Environment / Context

The application is a web-based visual programming platform that operates in a client-server architecture. The system runs in a web browser environment and communicates with a backend server through HTTP-based APIs.

The application provides user authentication services, project management capabilities, and visual programming functionality. Users interact with the system through a web browser, where they authenticate, manage projects, configure database instances, and create functions using visual brick-based programming.

The system maintains user accounts, project data, function definitions, database types, database instances, and permission relationships in a persistent database. All user actions are processed by the backend server, which validates permissions, executes business logic, and persists data changes.

The application operates as a single-page web application where users navigate between different screens (Login, Home, Project Editor, Function Editor) without full page reloads. The system provides real-time persistence, automatically saving changes as users interact with the interface.

## Conceptual Model

The system implements the following main functional areas:

**Authentication**: Users register accounts and authenticate to access the system. Authentication establishes user identity and enables access to user-specific resources. The system maintains user accounts with email addresses and authentication credentials.

**Project Management**: Users create, rename, and delete projects. Projects serve as containers for functions and database instances. Each project belongs to the user who created it, and access to projects is controlled through permission management.

**Visual Function Editor**: Users create functions by assembling visual bricks on a grid-based canvas. Bricks represent operations and have inputs and outputs that connect to form executable logic. The function editor provides drag-and-drop functionality, visual linking between bricks, parameter configuration, and execution capabilities.

**Database Management**: The system manages database types and their instances. Database types define data structures with properties. Database instances are concrete records that store actual property values. Users create instances, edit property values, and instances are automatically saved when modified.

**Permission Management**: Project owners grant access to projects by adding other registered users. The system maintains permission relationships that determine which users can view and work with specific projects.

**Function Execution**: Users execute assembled function logic by clicking the RUN button. The system validates brick connections and parameter configurations, executes the logic flow, and displays results in the console.

## User Characteristics

The system supports two primary user types:

**Regular Developers**: Users with programming experience who understand data flow, function composition, and logic execution. These users are comfortable with visual programming concepts and can effectively assemble complex logic using bricks.

**Occasional Users**: Users with basic computer knowledge who can navigate web interfaces, use drag-and-drop interactions, and understand simple data relationships. These users can create projects, manage database instances, and assemble basic function logic with guidance.

Both user types require the ability to:
- Use a web browser
- Understand basic drag-and-drop interactions
- Navigate tabbed interfaces
- Enter text in input fields
- Click buttons and links

The system does not require users to have knowledge of traditional programming languages, syntax, or command-line interfaces.

## Main Development Constraints

The system must be developed using the following technology stack:

**Frontend Technologies**:
- React: JavaScript library for building user interfaces
- TypeScript: Typed superset of JavaScript for type safety
- Vite: Build tool and development server

**Backend Technologies**:
- Node.js: JavaScript runtime environment
- Fastify: Web framework for Node.js
- TypeScript: For backend type safety

**Database**:
- PostgreSQL: Relational database management system

**Development Tools**:
- npm: Package manager for Node.js dependencies
- Docker: Containerization platform for deployment and development environments
- nodemon: Development tool that automatically restarts the Node.js application when file changes are detected

**Testing Frameworks**:
- Jest: JavaScript testing framework
- Playwright: End-to-end testing framework for web applications

All code must be written in TypeScript. The application must run in Docker containers. The development environment must use nodemon for automatic server restarts during development.

## Working Assumptions

The following assumptions apply to the system:

1. Users have access to a modern web browser that supports JavaScript, drag-and-drop functionality, and modern web standards.

2. Users have stable internet connectivity when using the application, as the system requires communication with the backend server.

3. The backend server and database are available and operational when users access the application.

4. User email addresses are unique and serve as identifiers for user accounts and permission management.

5. The "default database" type exists in the system with a string property and is available to all users.

6. All registered users can be granted permissions to projects, regardless of who created the project.

7. Changes made in the function editor are automatically persisted without requiring explicit save actions.

8. Database instance property values are automatically saved when users input or modify values in input fields.

9. The visual programming library used for the function editor supports grid-based placement, drag-and-drop, and visual linking between components.

10. Console output from function execution is accessible to users through the browser's developer console or an integrated console view.

11. The system maintains session state for authenticated users, allowing navigation between screens without re-authentication.

12. Project and function names can be modified by users who have appropriate permissions.

13. Bricks in the function editor are validated before execution, and invalid configurations prevent execution.

14. The search functionality in brick lists filters available bricks based on user input.
