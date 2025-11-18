# 2. General Description

## System Environment and Context

The application is a standalone web application that operates in a browser environment. It requires user authentication to access functionality. Users must register and log in before they can create or access projects.

The system maintains user isolation: each user sees only their own projects by default. Projects can be shared with other registered users through the permissions system.

The application stores data persistently, including user accounts, projects, functions, database instances, and brick configurations. All data is user-specific and access-controlled.

## Conceptual Model

The system follows a hierarchical structure:

1. **Authentication Layer**: Users register and log in to establish their identity and session.

2. **Home Screen**: After login, users see their projects. This is the main entry point for project management operations.

3. **Project Editor**: When a project is opened, users can manage functions, permissions, and databases within that project context.

4. **Function Editor**: When a function is opened, users can build visual programming logic by adding and connecting bricks.

The high-level flow is:
- User logs in → Home Screen displays user's projects
- User double-clicks project → Project Editor opens
- User double-clicks function → Function Editor opens
- User executes function → Console displays results

Navigation between screens is achieved through double-click actions on projects and functions, and through the settings icon that provides logout functionality.

## User Characteristics

The system supports two types of users:

**Regular Users**: Users who frequently use the application to create and manage multiple projects and functions. They are familiar with the visual programming interface and brick-based logic construction.

**Occasional Users**: Users who use the application infrequently. They will need to re-familiarize themselves with the interface and brick operations.

All users have varying levels of technical experience. The visual programming interface is designed to be intuitive, but users must understand the concept of connecting inputs and outputs between bricks to create valid logic.

Users must be able to:
- Use a mouse or touch interface for drag-and-drop operations
- Understand basic programming concepts (data flow, inputs/outputs)
- Navigate tabbed interfaces
- Enter text for project names, function names, and database instance values

## Main Development Constraints

The system must be developed using the following technology stack:

- **Package Manager**: npm
- **Runtime**: Node.js
- **Build Tool**: Vite
- **Containerization**: Docker
- **Development Tool**: Nodemon
- **Language**: TypeScript
- **Backend Framework**: Fastify
- **Frontend Framework**: React
- **Database**: PostgreSQL
- **Testing Framework**: Jest
- **End-to-End Testing**: Playwright

**Important Constraint**: The system must NOT use Prisma as an ORM or database tool. Database interactions must be implemented using alternative methods compatible with the specified stack.

The application must be responsive and function correctly in modern web browsers. The visual programming interface requires a library suitable for drag-and-drop operations and connection line rendering.

## Working Assumptions

The following assumptions are made about the operating environment:

1. **Browser Compatibility**: Users have modern web browsers (Chrome, Firefox, Safari, Edge) with JavaScript enabled and support for HTML5 features.

2. **Internet Connection**: The application requires an active internet connection to communicate with the backend server and database.

3. **Screen Resolution**: Users have displays with sufficient resolution to view the visual programming interface. The minimum recommended resolution is 1280x720 pixels.

4. **Input Devices**: Users have access to a mouse or touch interface capable of drag-and-drop operations and precise clicking for connecting brick inputs and outputs.

5. **User Registration**: All users who will be granted project permissions must be registered in the system before they can be added to a project's permission list.

6. **Database Availability**: The PostgreSQL database is available and accessible when the application is running. Connection failures are handled gracefully with appropriate error messages.

7. **Session Management**: User sessions are maintained securely. Sessions expire after a period of inactivity, requiring users to log in again.

8. **Data Persistence**: All user data, projects, functions, and database instances are persisted in the database and remain available across sessions.
