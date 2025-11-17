# External Interface Specifications

## Overview

This document defines all external interfaces required for the visual programming application, including hardware, software, and human interfaces.

## Hardware/Software Interface

### Minimum Requirements

**Web Browser:**
- Modern web browser with ES2020 support
- JavaScript enabled
- Local storage support
- Canvas API support for visual rendering

### Optimal Requirements

**Web Browser:**
- Google Chrome 120.x or later
- Mozilla Firefox 121.x or later
- Microsoft Edge 120.x or later (Chromium-based)

**Hardware:**
- No specific hardware devices required
- Standard desktop, laptop, or tablet with keyboard and mouse/trackpad
- Minimum screen resolution: 1280x720 pixels
- Recommended screen resolution: 1920x1080 pixels or higher

## Software/Software Interface

### Runtime Environment

**Node.js:**
- Version: 20.x LTS (Long Term Support)
- Purpose: Server-side JavaScript runtime for API and backend services
- Package Manager: npm 10.x or later

**PostgreSQL:**
- Version: 16.x
- Purpose: Primary relational database for all persistent data
- Connection: TCP/IP on port 5432
- Authentication: Username/password with SSL support

### Frontend Framework and Libraries

**React:**
- Version: 18.3.1
- Purpose: UI component framework for single-page application
- Features: Hooks, Context API, Concurrent rendering

**TypeScript:**
- Version: 5.5.4
- Purpose: Type-safe JavaScript superset for frontend and backend
- Configuration: Strict mode enabled

**Vite:**
- Version: 5.2.11
- Purpose: Build tool and development server for fast HMR
- Features: ES modules, optimized production builds

**React Flow:**
- Version: 11.11.4
- Purpose: Visual node-based editor for function brick connections
- Features: Drag-and-drop, connection validation, grid snapping

### Backend Framework and Libraries

**Fastify:**
- Version: 4.26.2
- Purpose: High-performance web framework for REST API
- Features: Schema validation, plugin system, async/await support

**TypeScript:**
- Version: 5.5.4
- Purpose: Type-safe JavaScript for backend services
- Configuration: Strict mode enabled

**Prisma:**
- Version: 5.19.1
- Purpose: Type-safe ORM for PostgreSQL database access
- Features: Type-safe queries, migrations, schema management, connection pooling

### Development Tools

**Docker:**
- Version: 24.x or later
- Purpose: Containerization for database and development environment
- Features: Docker Compose for multi-container orchestration

**nodemon:**
- Version: 3.1.0
- Purpose: Automatic server restart on code changes during development
- Configuration: Watch TypeScript and JSON files

**Jest:**
- Version: 29.7.0
- Purpose: Unit testing framework for JavaScript/TypeScript
- Features: Code coverage, mocking, snapshot testing

**Playwright:**
- Version: 1.42.1
- Purpose: End-to-end testing framework for browser automation
- Features: Cross-browser testing, screenshot comparison, network interception

## Human/Software Interface

### RESTful API

**Protocol:**
- HTTP/1.1 and HTTP/2
- HTTPS for all production communications
- JSON request and response bodies
- Content-Type: application/json

**Authentication:**
- JWT tokens in Authorization header: `Bearer <token>`
- Token expiration: 24 hours
- Refresh token mechanism for extended sessions

**API Endpoints Structure:**
- Base URL: `/api/v1`
- Resource-based URLs: `/api/v1/users`, `/api/v1/projects`, `/api/v1/functions`
- HTTP methods: GET (read), POST (create), PUT (update), DELETE (remove)
- Status codes: 200 (success), 201 (created), 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found), 500 (server error)

**Error Response Format:**
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### React Single-Page Application

**Interface Structure:**
- Single-page application with client-side routing
- No full page reloads after initial load

**Menu Structure:**
- Top-right: User settings icon (round button)
  - Dropdown menu: User name, Logout option
- Left sidebar: Context-dependent (brick palette, project list, function list, database list)
- Center area: Main content (project editor, function editor, database editor)
- Header tabs: Project, Permissions, Database (in Project Editor)

**User Interactions:**
- Drag-and-drop: Bricks from palette to editor canvas
- Double-click: Open editors (project, function)
- Click: Select items, navigate tabs, trigger actions
- Keyboard: Enter to confirm, Escape to cancel, Delete to remove selected items

**Visual Feedback:**
- Loading spinners for async operations
- Success notifications for completed actions
- Error messages displayed inline or as toast notifications
- Visual connection lines between brick inputs/outputs
- Grid snapping for brick positioning

**Real-time Persistence:**
- Auto-save on all changes with 500ms debounce
- Visual indicator when changes are being saved
- No explicit save buttons required

### Error Messages

**Format:**
- User-facing: Clear, actionable language without technical jargon
- Developer-facing: Detailed error codes and stack traces in development mode
- Validation errors: Field-specific messages with highlighted input fields

**Categories:**
- Authentication errors: "Invalid email or password"
- Authorization errors: "You don't have permission to access this resource"
- Validation errors: "Project name is required" (field-specific)
- Network errors: "Connection failed. Please check your internet connection."
- Server errors: "An unexpected error occurred. Please try again later."
