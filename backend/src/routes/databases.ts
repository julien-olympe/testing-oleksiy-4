import { FastifyInstance } from 'fastify';
import { prisma } from '../db/client';
import { validateUUID } from '../utils/validation';
import { ValidationError, NotFoundError } from '../utils/errors';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { checkProjectAccess } from '../utils/permissions';

interface UpdateInstanceBody {
  propertyId: string;
  value: string;
}

export async function databaseRoutes(fastify: FastifyInstance): Promise<void> {
  // GET /api/v1/projects/:id/databases
  fastify.get(
    '/projects/:projectId/databases',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest, reply) => {
      const userId = request.userId!;
      const projectId = (request.params as { projectId: string }).projectId;

      validateUUID(projectId, 'projectId');

      await checkProjectAccess(userId, projectId);

      // Get project databases and default database
      const [projectDatabases, defaultDatabase] = await Promise.all([
        prisma.database.findMany({
          where: { projectId },
          include: { properties: true },
        }),
        prisma.database.findFirst({
          where: {
            name: 'default database',
            projectId: '00000000-0000-0000-0000-000000000000', // System project ID
          },
          include: { properties: true },
        }),
      ]);

      const databases = defaultDatabase ? [defaultDatabase, ...projectDatabases] : projectDatabases;

      reply.send({
        databases: databases.map((d) => ({
          id: d.id,
          name: d.name,
          projectId: d.projectId,
          properties: d.properties.map((p) => ({
            id: p.id,
            name: p.name,
            type: p.type,
          })),
        })),
      });
    }
  );

  // GET /api/v1/projects/:id/databases/:databaseId/instances
  fastify.get(
    '/projects/:projectId/databases/:databaseId/instances',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest, reply) => {
      const userId = request.userId!;
      const projectId = (request.params as { projectId: string }).projectId;
      const databaseId = (request.params as { databaseId: string }).databaseId;

      validateUUID(projectId, 'projectId');
      validateUUID(databaseId, 'databaseId');

      await checkProjectAccess(userId, projectId);

      const database = await prisma.database.findUnique({
        where: { id: databaseId },
      });

      if (!database) {
        throw new NotFoundError('Database');
      }

      const instances = await prisma.databaseInstance.findMany({
        where: { databaseId },
        include: {
          values: {
            include: {
              property: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      reply.send({
        instances: instances.map((i) => ({
          id: i.id,
          databaseId: i.databaseId,
          values: i.values.map((v) => ({
            propertyId: v.propertyId,
            propertyName: v.property.name,
            value: v.value,
          })),
          createdAt: i.createdAt.toISOString(),
          updatedAt: i.updatedAt.toISOString(),
        })),
      });
    }
  );

  // POST /api/v1/projects/:id/databases/:databaseId/instances
  fastify.post(
    '/projects/:projectId/databases/:databaseId/instances',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest, reply) => {
      const userId = request.userId!;
      const projectId = (request.params as { projectId: string }).projectId;
      const databaseId = (request.params as { databaseId: string }).databaseId;

      validateUUID(projectId, 'projectId');
      validateUUID(databaseId, 'databaseId');

      await checkProjectAccess(userId, projectId);

      const database = await prisma.database.findUnique({
        where: { id: databaseId },
        include: { properties: true },
      });

      if (!database) {
        throw new NotFoundError('Database');
      }

      const instance = await prisma.$transaction(async (tx) => {
        const newInstance = await tx.databaseInstance.create({
          data: { databaseId },
        });

        // Create empty values for all properties
        await Promise.all(
          database.properties.map((property) =>
            tx.databaseInstanceValue.create({
              data: {
                instanceId: newInstance.id,
                propertyId: property.id,
                value: '',
              },
            })
          )
        );

        const instanceWithValues = await tx.databaseInstance.findUnique({
          where: { id: newInstance.id },
          include: {
            values: {
              include: {
                property: true,
              },
            },
          },
        });

        return instanceWithValues!;
      });

      reply.status(201).send({
        instance: {
          id: instance.id,
          databaseId: instance.databaseId,
          values: instance.values.map((v) => ({
            propertyId: v.propertyId,
            propertyName: v.property.name,
            value: v.value,
          })),
          createdAt: instance.createdAt.toISOString(),
          updatedAt: instance.updatedAt.toISOString(),
        },
      });
    }
  );

  // PUT /api/v1/projects/:id/databases/:databaseId/instances/:instanceId
  fastify.put<{ Body: UpdateInstanceBody }>(
    '/projects/:projectId/databases/:databaseId/instances/:instanceId',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest, reply) => {
      const userId = request.userId!;
      const projectId = (request.params as { projectId: string }).projectId;
      const databaseId = (request.params as { databaseId: string }).databaseId;
      const instanceId = (request.params as { instanceId: string }).instanceId;
      const { propertyId, value } = request.body as { propertyId: string; value: string };

      validateUUID(projectId, 'projectId');
      validateUUID(databaseId, 'databaseId');
      validateUUID(instanceId, 'instanceId');
      validateUUID(propertyId, 'propertyId');

      if (value === undefined || value === null) {
        throw new ValidationError('Required field is missing', {
          field: 'value',
          validationErrors: [
            {
              field: 'value',
              message: 'Value is required',
            },
          ],
        });
      }

      if (typeof value !== 'string' || value.length > 10000) {
        throw new ValidationError('Invalid property value', {
          field: 'value',
          validationErrors: [
            {
              field: 'value',
              message: 'Property value must be a string with max length 10000',
            },
          ],
        });
      }

      await checkProjectAccess(userId, projectId);

      const instance = await prisma.databaseInstance.findUnique({
        where: { id: instanceId },
        include: { database: true },
      });

      if (!instance || instance.databaseId !== databaseId) {
        throw new NotFoundError('Instance');
      }

      const property = await prisma.databaseProperty.findUnique({
        where: { id: propertyId },
      });

      if (!property || property.databaseId !== databaseId) {
        throw new NotFoundError('Property');
      }

      await prisma.databaseInstanceValue.upsert({
        where: {
          instanceId_propertyId: {
            instanceId,
            propertyId,
          },
        },
        update: { value },
        create: {
          instanceId,
          propertyId,
          value,
        },
      });

      const updatedInstance = await prisma.databaseInstance.findUnique({
        where: { id: instanceId },
        include: {
          values: {
            include: {
              property: true,
            },
          },
        },
      });

      reply.send({
        instance: {
          id: updatedInstance!.id,
          databaseId: updatedInstance!.databaseId,
          values: updatedInstance!.values.map((v) => ({
            propertyId: v.propertyId,
            propertyName: v.property.name,
            value: v.value,
          })),
          updatedAt: updatedInstance!.updatedAt.toISOString(),
        },
      });
    }
  );

  // DELETE /api/v1/projects/:id/databases/:databaseId/instances/:instanceId
  fastify.delete(
    '/projects/:projectId/databases/:databaseId/instances/:instanceId',
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest, reply) => {
      const userId = request.userId!;
      const projectId = (request.params as { projectId: string }).projectId;
      const databaseId = (request.params as { databaseId: string }).databaseId;
      const instanceId = (request.params as { instanceId: string }).instanceId;

      validateUUID(projectId, 'projectId');
      validateUUID(databaseId, 'databaseId');
      validateUUID(instanceId, 'instanceId');

      await checkProjectAccess(userId, projectId);

      const instance = await prisma.databaseInstance.findUnique({
        where: { id: instanceId },
      });

      if (!instance || instance.databaseId !== databaseId) {
        throw new NotFoundError('Instance');
      }

      await prisma.databaseInstance.delete({
        where: { id: instanceId },
      });

      reply.send({ message: 'Instance deleted successfully' });
    }
  );
}
