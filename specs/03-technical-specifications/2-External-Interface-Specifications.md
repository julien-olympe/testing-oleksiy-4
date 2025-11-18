# External Interface Specifications

## Hardware/Software Interface

### Browser Requirements
The application requires a modern web browser with JavaScript enabled. Minimum supported versions:
- Google Chrome 90 or higher
- Mozilla Firefox 88 or higher
- Apple Safari 14 or higher
- Microsoft Edge 90 or higher

### Optimal Configuration
- Screen resolution: Minimum 1280x720 pixels, optimal 1920x1080 or higher
- JavaScript: Must be enabled
- Cookies: Must be enabled for session management
- Local Storage: Required for client-side state management

### Hardware Peripherals
No specific hardware peripherals are required. The application operates entirely through standard keyboard and mouse/touchpad input.

---

## Software/Software Interface

### Backend Dependencies

**Runtime:**
- Node.js: latest LTS version
- PostgreSQL: latest stable version

**Core Framework:**
- Fastify: latest
- TypeScript: latest

**Development Tools:**
- Nodemon: latest (development server with auto-reload)
- Jest: latest (unit and integration testing)

**Authentication:**
- bcrypt: latest (password hashing with salt rounds: 10)
- jsonwebtoken: latest (JWT token generation and validation)

**Database:**
- pg: latest (PostgreSQL client library, no ORM)

**API Validation:**
- @fastify/type-provider-typebox: latest (TypeBox schema validation for Fastify)
- zod: latest (alternative validation library for request/response schemas)

**Utilities:**
- dotenv: latest (environment variable management)

### Frontend Dependencies

**Core Framework:**
- React: latest
- TypeScript: latest

**Build Tools:**
- Vite: latest (module bundler and development server)

**Visual Programming Editor:**
- React Flow: latest (node-based editor with drag-drop and connection capabilities)
- @dnd-kit/core: latest (modern drag-drop library for React)

**HTTP Client:**
- axios: latest (HTTP requests to backend API)

**State Management:**
- React Context API (built-in) for global state
- React Hooks (useState, useEffect, useContext) for component state

**Testing:**
- Playwright: latest (end-to-end testing)

### Package Manager
- npm: latest (package management for both backend and frontend)

### Containerization
- Docker: latest (containerization for deployment)
- docker-compose: latest (multi-container orchestration)

---

## Human/Software Interface

### UI Layout Structure

**Login Screen:**
- Centered form with email and password input fields
- "Login" button and "Register" link/button
- Error messages displayed below form fields in red text
- Form validation feedback on input blur

**Home Screen:**
- Top-right corner: Circular user icon button (settings menu)
- Left sidebar: Search bar (text input) and brick list (scrollable list of draggable "Project" brick)
- Center area: Grid/list view of user's projects (project cards with name, creation date)
- Drag-drop visual feedback: Highlighted drop zones when dragging "Project" brick
- Project cards: Display project name, double-click to open, context menu for rename/delete

**Settings Menu (Home Screen and Project Editor):**
- Dropdown menu on icon click
- Menu items: User name (display only), "Log out" button
- Menu closes on outside click or item selection

**Project Editor:**
- Top-right corner: Same circular user icon button (settings menu)
- Header: Tab navigation (Project, Permissions, Database tabs)
- Left sidebar: Search bar and brick list (draggable "Function" brick)
- Center area: Content changes based on active tab
  - Project tab: List of functions (function cards, double-click to open, context menu for rename/delete)
  - Permissions tab: List of users with project access, "Add user" button, email input modal
  - Database tab: Left panel (database list), right panel (instance list), "Create instance" button

**Function Editor:**
- Top-right corner: Same circular user icon button (settings menu)
- Left sidebar: Search bar, "RUN" button (above search bar), brick list (scrollable list of available bricks)
- Center panel: React Flow canvas with grid background
- Grid system: Bricks snap to grid cells (e.g., 50x50 pixel cells)
- Brick rendering: Each brick displays as a node with input/output ports
- Connection lines: Draggable edges between output and input ports, visual feedback during connection creation
- Port visualization: Input ports on left side of brick, output ports on right side of brick
- Brick types displayed: "List instances by DB name", "Get first instance", "Log instance props"

### Menu Structure

**Navigation Hierarchy:**
1. Login Screen (entry point)
2. Home Screen (project management)
3. Project Editor (project details, functions, permissions, databases)
4. Function Editor (visual programming canvas)

**Context Menus:**
- Project card: Right-click menu with "Rename", "Delete" options
- Function card: Right-click menu with "Rename", "Delete" options
- Brick node: Right-click menu with "Delete" option
- Connection line: Right-click menu with "Delete" option

### Error Message Formats

**API Error Responses:**
- Format: JSON object with `error` field containing message string
- HTTP status codes: 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 500 (Internal Server Error)
- Example: `{"error": "Invalid email or password"}`

**Client-Side Validation Errors:**
- Display: Red text below input field
- Format: Plain text error message
- Examples: "Email is required", "Password must be at least 8 characters", "Database name cannot be empty"

**Function Execution Errors:**
- Display: Console output (browser console) only
- Format: Error message with brick type and connection details
- Example: "Error in 'List instances by DB name': Database 'default database' not found"

### Console Output Format

**Function Execution Logs:**
- Format: `[Function: <function_name>] <log_message>`
- Example: `[Function: MyFunction] Log instance props: {"string_prop": "Hello World"}`
- Error logs: `[Function: <function_name>] ERROR: <error_message>`

**Development Console:**
- API requests: `[API] <method> <endpoint> - <status_code>`
- Database queries: `[DB] <query_type> - <table_name>`
- Authentication: `[AUTH] <action> - <user_email>`

### Drag-Drop Visual Feedback

**Brick Dragging:**
- Cursor changes to "grabbing" hand icon
- Dragged brick shows semi-transparent preview
- Valid drop zones highlight with green border
- Invalid drop zones show red border or no highlight

**Connection Creation:**
- Mouse cursor shows connection line preview when hovering over output port
- Valid input ports highlight when connection line is near
- Invalid connections show red line preview
- Completed connections render as solid lines between ports

### Connection Line Rendering

**Visual Properties:**
- Line color: Blue (#3b82f6) for valid connections, red (#ef4444) for invalid
- Line width: 2 pixels
- Line style: Bezier curves for smooth connections
- Port markers: Small circles at connection points
- Hover effect: Line thickness increases to 3 pixels on hover

**Connection Validation:**
- Type checking: Output type must match input type. Single input constraint: Each input port accepts only one connection. Invalid connections display with red color and warning icon.
