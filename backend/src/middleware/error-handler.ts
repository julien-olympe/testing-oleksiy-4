import { FastifyRequest, FastifyReply, FastifyError, FastifyInstance } from 'fastify';
import { formatErrorResponse, AppError } from '../utils/errors';
import { Logger } from '../utils/logger';

export async function errorHandler(
  this: FastifyInstance,
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const requestId = (request.headers['x-request-id'] as string) || 'unknown';
  const userId = (request as FastifyRequest & { userId?: string }).userId;
  const endpoint = request.url.split('?')[0];
  const method = request.method;

  const { statusCode, payload } = formatErrorResponse(error);

  // Log error
  if (error instanceof AppError) {
    if (statusCode >= 500) {
      Logger.error({
        requestId,
        userId,
        endpoint,
        method,
        statusCode,
        message: error.message,
        context: { code: error.code, details: error.details },
        stackTrace: error.stack || null,
      });
    } else {
      Logger.warn({
        requestId,
        userId,
        endpoint,
        method,
        statusCode,
        message: error.message,
        context: { code: error.code, details: error.details },
      });
    }
  } else {
    Logger.error({
      requestId,
      userId,
      endpoint,
      method,
      statusCode,
      message: error.message || 'An unexpected error occurred',
      context: {},
      stackTrace: error.stack || null,
    });
  }

  reply.status(statusCode).send(payload);
}
