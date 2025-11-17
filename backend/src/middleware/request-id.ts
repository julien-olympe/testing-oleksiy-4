import { FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';

export async function requestIdMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const requestId = (request.headers['x-request-id'] as string) || randomUUID();
  request.headers['x-request-id'] = requestId;
  reply.header('X-Request-ID', requestId);
  (request as FastifyRequest & { requestId: string }).requestId = requestId;
}
