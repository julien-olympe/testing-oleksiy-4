// User types
export interface User {
  id: string;
  email: string;
  createdAt: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}

export interface RefreshResponse {
  token: string;
  expiresIn: number;
}

// Project types
export interface Project {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectEditorData {
  project: Project;
  functions: Function[];
  permissions: Permission[];
  databases: Database[];
}

// Function types
export interface Function {
  id: string;
  name: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FunctionEditorData {
  function: Function;
  bricks: Brick[];
  connections: Connection[];
}

// Brick types
export type BrickType = 'ListInstancesByDB' | 'GetFirstInstance' | 'LogInstanceProps';

export interface Brick {
  id: string;
  functionId: string;
  type: BrickType;
  positionX: number;
  positionY: number;
  configuration: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Connection {
  id: string;
  fromBrickId: string;
  fromOutputName: string;
  toBrickId: string;
  toInputName: string;
  createdAt: string;
}

// Permission types
export interface Permission {
  userId: string;
  userEmail: string;
  createdAt: string;
}

// Database types
export interface DatabaseProperty {
  id: string;
  name: string;
  type: string;
}

export interface DatabaseInstanceValue {
  propertyId: string;
  propertyName: string;
  value: string;
}

export interface DatabaseInstance {
  id: string;
  databaseId: string;
  values: DatabaseInstanceValue[];
  createdAt: string;
  updatedAt: string;
}

export interface Database {
  id: string;
  name: string;
  projectId: string;
  properties: DatabaseProperty[];
  instances: DatabaseInstance[];
}

// Execution types
export interface ExecutionResult {
  functionId: string;
  status: 'success' | 'error';
  duration: number;
  results: BrickExecutionResult[];
  consoleOutput: string[];
}

export interface BrickExecutionResult {
  brickId: string;
  brickType: string;
  output: Record<string, unknown>;
}

// Error types
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    validationErrors?: Array<{
      field: string;
      message: string;
    }>;
  };
}

// Pagination types
export interface Pagination {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
}

export interface PaginatedResponse {
  pagination: Pagination;
}

export interface ProjectsResponse extends PaginatedResponse {
  projects: Project[];
}
