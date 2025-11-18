import { FastifyInstance } from 'fastify';
import { queryOne } from '../db/client';
import { NotFoundError } from '../utils/errors';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

interface UserRow {
  id: string;
  email: string;
  created_at: Date;
}

export async function userRoutes(fastify: FastifyInstance): Promise<void> {
  // GET /api/v1/users/me
  fastify.get(
    '/me',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest, reply) => {
      const userId = request.userId!;

      const user = await queryOne<UserRow>(
        'SELECT id, email, created_at FROM users WHERE id = $1',
        [userId]
      );

      if (!user) {
        throw new NotFoundError('User');
      }

      reply.send({
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.created_at.toISOString(),
        },
      });
    }
  );
}
