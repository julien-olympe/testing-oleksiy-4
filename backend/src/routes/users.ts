import { FastifyInstance } from 'fastify';
import { prisma } from '../db/client';
import { NotFoundError } from '../utils/errors';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

export async function userRoutes(fastify: FastifyInstance): Promise<void> {
  // GET /api/v1/users/me
  fastify.get(
    '/me',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest, reply) => {
      const userId = request.userId!;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new NotFoundError('User');
      }

      reply.send({
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt.toISOString(),
        },
      });
    }
  );
}
