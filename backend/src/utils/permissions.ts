import { prisma } from '../db/client';
import { AuthorizationError, NotFoundError } from './errors';

export async function checkProjectAccess(
  userId: string,
  projectId: string
): Promise<{ project: { ownerId: string } }> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project) {
    throw new NotFoundError('Project');
  }

  // Check if user is owner
  if (project.ownerId === userId) {
    return { project };
  }

  // Check if user has permission
  const permission = await prisma.projectPermission.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });

  if (!permission) {
    throw new AuthorizationError('You do not have permission to access this project');
  }

  return { project };
}

export async function checkProjectOwnership(userId: string, projectId: string): Promise<void> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project) {
    throw new NotFoundError('Project');
  }

  if (project.ownerId !== userId) {
    throw new AuthorizationError('You must own this project to perform this action');
  }
}
