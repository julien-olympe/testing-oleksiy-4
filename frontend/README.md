# Visual Programming Application - Frontend

React 18.3.1 SPA with TypeScript 5.5.4 (strict mode) built with Vite 5.2.11.

## Features

- **Authentication**: JWT token management with refresh token handling
- **Login Screen**: Email/password authentication with registration form
- **Home Screen**: Project list with drag-to-create functionality
- **Project Editor**: Three-tab interface (Project, Permissions, Database)
- **Function Editor**: Visual canvas using React Flow 11.11.4 for brick-based programming

## Technology Stack

- React 18.3.1
- TypeScript 5.5.4 (strict mode)
- Vite 5.2.11
- React Router DOM 6.26.0
- React Flow 11.11.4
- Axios 1.7.7

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/          # Login screen
│   │   ├── home/          # Home screen
│   │   ├── project-editor/ # Project editor with tabs
│   │   ├── function-editor/ # Function editor with React Flow
│   │   └── common/         # Shared components (Loading, Error, Settings)
│   ├── contexts/          # React contexts (Auth)
│   ├── services/          # API service with JWT interceptors
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions (debounce)
│   └── hooks/             # Custom React hooks
├── public/                # Static assets
└── package.json
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Configuration

The application expects the backend API to be running on `http://localhost:8000`. This is configured in `vite.config.ts` with a proxy setup.

## Key Features Implementation

### JWT Token Management
- Tokens stored in localStorage
- Automatic token refresh using httpOnly cookies
- Token refresh on 401 responses
- Automatic logout on refresh failure

### Auto-save
- 500ms debounce for all auto-save operations
- Applied to:
  - Brick position updates
  - Brick configuration changes
  - Database instance property updates

### Drag and Drop
- Project creation: Drag "Project" brick to project list
- Function creation: Drag "Function" brick to function list
- Brick addition: Drag brick types to Function Editor canvas

### React Flow Integration
- Custom brick nodes with input/output handles
- Connection creation by dragging between handles
- Grid-based positioning
- Visual feedback for connections

## Responsive Design

Minimum viewport: 1280x720px

## Error Handling

- Global error notifications
- API error parsing and display
- User-friendly error messages
- Loading states for async operations
