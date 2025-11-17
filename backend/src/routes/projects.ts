import { FastifyInstance } from 'fastify';
import { prisma } from '../db/client';
import { validateUUID } from '../utils/validation';
import { ValidationError, NotFoundError } from '../utils/errors';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { checkProjectAccess, checkProjectOwnership } from '../utils/permissions';

interface CreateProjectBody {
  name?: string;
}

interface UpdateProjectBody {
  name: string;
}

export async function projectRoutes(fastify: FastifyInstance): Promise<void> {
  // GET /api/v1/projects
  fastify.get(
    '/',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest, reply) => {
      const userId = request.userId!;
      const limit = Math.min(parseInt((request.query as { limit?: string }).limit || '50', 10), 50);
      const offset = Math.max(parseInt((request.query as { offset?: string }).offset || '0', 10), 0);

      if (limit < 1 || limit > 50) {
        throw new ValidationError('Invalid query parameters', {
          validationErrors: [
            {
              field: 'limit',
              message: 'Limit must be between 1 and 50',
            },
          ],
        });
      }

      // Get projects where user is owner or has permission
      const [projects, total] = await Promise.all([
        prisma.project.findMany({
          where: {
            OR: [
              { ownerId: userId },
              {
                permissions: {
                  some: {
                    userId,
                  },
                },
              },
            ],
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        prisma.project.count({
          where: {
            OR: [
              { ownerId: userId },
              {
                permissions: {
                  some: {
                    userId,
                  },
                },
              },
            ],
          },
        }),
      ]);

      reply.send({
        projects: projects.map((p) => ({
          id: p.id,
          name: p.name,
          ownerId: p.ownerId,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        })),
        pagination: {
          limit,
          offset,
          total,
          hasMore: offset + limit < total,
        },
      });
    }
  );

  // POST /api/v1/projects
  fastify.post<{ Body: CreateProjectBody }>(
    '/',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest, reply) => {
      const userId = request.userId!;
      const { name } = request.body;

      const projectName = name || 'New Project';

      if (projectName.length < 1 || projectName.length > 255) {
        throw new ValidationError('Invalid project name', {
          field: 'name',
          validationErrors: [
            {
              field: 'name',
              message: 'Project name must be between 1 and 255 characters',
            },
          ],
        });
      }

      const project = await prisma.project.create({
        data: {
          name: projectName,
          ownerId: userId,
        },
      });

      reply.status(201).send({
        project: {
          id: project.id,
          name: project.name,
          ownerId: project.ownerId,
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
        },
      });
    }
  );

  // GET /api/v1/projects/:id
  fastify.get(
    '/:id',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest, reply) => {
      const userId = request.userId!;
      const projectId = (request.params as { id: string }).id;

      validateUUID(projectId, 'id');

      await checkProjectAccess(userId, projectId);

      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        throw new NotFoundError('Project');
      }

      reply.send({
        project: {
          id: project.id,
          name: project.name,
          ownerId: project.ownerId,
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
        },
      });
    }
  );

  // PUT /api/v1/projects/:id
  fastify.put<{ Body: UpdateProjectBody }>(
    '/:id',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest, reply) => {
      const userId = request.userId!;
      const projectId = (request.params as { id: string }).id;
      const { name } = request.body;

      validateUUID(projectId, 'id');

      if (!name || name.length < 1 || name.length > 255) {
        throw new ValidationError('Invalid project name', {
          field: 'name',
          validationErrors: [
            {
              field: 'name',
              message: 'Project name must be between 1 and 255 characters',
            },
          ],
        });
      }

      await checkProjectAccess(userId, projectId);

      const project = await prisma.project.update({
        where: { id: projectId },
        data: { name },
      });

      reply.send({
        project: {
          id: project.id,
          name: project.name,
          ownerId: project.ownerId,
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
        },
      });
    }
  );

  // DELETE /api/v1/projects/:id
  fastify.delete(
    '/:id',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest, reply) => {
      const userId = request.userId!;
      const projectId = (request.params as { id: string }).id;

      validateUUID(projectId, 'id');

      await checkProjectOwnership(userId, projectId);

      // Delete project (cascade will handle related data)
      await prisma.project.delete({
        where: { id: projectId },
      });

      reply.send({ message: 'Project deleted successfully' });
    }
  );

  // GET /api/v1/projects/:id/editor
  fastify.get(
    '/:id/editor',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest, reply) => {
      const userId = request.userId!;
      const projectId = (request.params as { id: string }).id;

      validateUUID(projectId, 'id');

      await checkProjectAccess(userId, projectId);

      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          functions: {
            include: {
              bricks: {
                include: {
                  connectionsFrom: true,
                  connectionsTo: true,
                },
              },
            },
          },
          databases: {
            include: {
              properties: true,
            },
          },
        },
      });

      if (!project) {
        throw new NotFoundError('Project');
      }

      reply.send({
        project: {
          id: project.id,
          name: project.name,
          ownerId: project.ownerId,
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
        },
        functions: project.functions.map((f) => ({
          id: f.id,
          name: f.name,
          projectId: f.projectId,
          createdAt: f.createdAt.toISOString(),
          updatedAt: f.updatedAt.toISOString(),
        })),
        databases: project.databases.map((d) => ({
          id: d.id,
          name: d.name,
          projectId: d.projectId,
          createdAt: d.createdAt.toISOString(),
          properties: d.properties.map((p) => ({
            id: p.id,
            name: p.name,
            type: p.type,
            createdAt: p.createdAt.toISOString(),
          })),
        })),
      });
    }
  );
}
