import { FastifyRequest, FastifyReply } from 'fastify';
import { Logger } from '../utils/logger';

const startTimes = new WeakMap<FastifyRequest, number>();

export async function loggingMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  startTimes.set(request, Date.now());
}

export async function loggingResponseHook(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const startTime = startTimes.get(request) || Date.now();
  const duration = Date.now() - startTime;
  const requestId = (request.headers['x-request-id'] as string) || 'unknown';
  const userId = (request as FastifyRequest & { userId?: string }).userId;
  const endpoint = request.url.split('?')[0];
  const method = request.method;

  Logger.info({
    requestId,
    userId,
    endpoint,
    method,
    statusCode: reply.statusCode,
    duration,
    message: `${method} ${endpoint} - ${reply.statusCode}`,
  });
}
