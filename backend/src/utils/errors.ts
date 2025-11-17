export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number,
    public details: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details: Record<string, unknown> = {}) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', code: string = 'AUTHENTICATION_REQUIRED') {
    super(code, message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Permission denied', code: string = 'PERMISSION_DENIED') {
    super(code, message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super('RESOURCE_NOT_FOUND', `${resource} not found`, 404);
  }
}

export class BusinessLogicError extends AppError {
  constructor(code: string, message: string, details: Record<string, unknown> = {}) {
    super(code, message, 400, details);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'An unexpected error occurred') {
    super('INTERNAL_SERVER_ERROR', message, 500);
  }
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details: Record<string, unknown>;
  };
}

export function formatErrorResponse(error: unknown): { statusCode: number; payload: ErrorResponse } {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      payload: {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
    };
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      payload: {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
          details: {},
        },
      },
    };
  }

  return {
    statusCode: 500,
    payload: {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        details: {},
      },
    },
  };
}
