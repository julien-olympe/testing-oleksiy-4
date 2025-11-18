import { queryOne } from '../db/client';
import { AuthorizationError, NotFoundError } from './errors';

interface ProjectRow {
  owner_id: string;
}

interface PermissionRow {
  project_id: string;
  user_id: string;
}

export async function checkProjectAccess(
  userId: string,
  projectId: string
): Promise<{ project: { ownerId: string } }> {
  const project = await queryOne<ProjectRow>(
    'SELECT owner_id FROM projects WHERE id = $1',
    [projectId]
  );

  if (!project) {
    throw new NotFoundError('Project');
  }

  // Check if user is owner
  if (project.owner_id === userId) {
    return { project: { ownerId: project.owner_id } };
  }

  // Check if user has permission
  const permission = await queryOne<PermissionRow>(
    'SELECT project_id, user_id FROM project_permissions WHERE project_id = $1 AND user_id = $2',
    [projectId, userId]
  );

  if (!permission) {
    throw new AuthorizationError('You do not have permission to access this project');
  }

  return { project: { ownerId: project.owner_id } };
}

export async function checkProjectOwnership(userId: string, projectId: string): Promise<void> {
  const project = await queryOne<ProjectRow>(
    'SELECT owner_id FROM projects WHERE id = $1',
    [projectId]
  );

  if (!project) {
    throw new NotFoundError('Project');
  }

  if (project.owner_id !== userId) {
    throw new AuthorizationError('You must own this project to perform this action');
  }
}
