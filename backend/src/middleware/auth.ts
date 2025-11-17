import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthUtils, TokenBlacklist } from '../utils/auth';
import { AuthenticationError } from '../utils/errors';

export interface AuthenticatedRequest extends FastifyRequest {
  userId?: string;
  userEmail?: string;
}

export async function authenticate(
  request: AuthenticatedRequest,
  _reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Authentication required');
  }

  const token = authHeader.substring(7);

  // Check if token is blacklisted
  if (TokenBlacklist.has(token)) {
    throw new AuthenticationError('Token has been revoked', 'TOKEN_BLACKLISTED');
  }

  try {
    const payload = AuthUtils.verifyAccessToken(token);
    request.userId = payload.userId;
    request.userEmail = payload.email;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Token expired') {
        throw new AuthenticationError('Token expired', 'EXPIRED_TOKEN');
      }
      if (error.message === 'Invalid token') {
        throw new AuthenticationError('Invalid or expired token', 'INVALID_TOKEN');
      }
    }
    throw new AuthenticationError('Invalid or expired token', 'INVALID_TOKEN');
  }
}
