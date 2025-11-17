import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { SettingsMenu } from '../common/SettingsMenu';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorNotification } from '../common/ErrorNotification';
import type { Project } from '../../types';
import './HomeScreen.css';

export const HomeScreen: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const projectListRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProjects();
      setProjects(response.projects || []);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response: { data: { error: { message: string } } } };
        setError(axiosError.response?.data?.error?.message || 'Failed to load projects');
      } else {
        setError('Failed to load projects');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProjectDoubleClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handleRenameStart = (project: Project) => {
    setEditingId(project.id);
    setEditingName(project.name);
  };

  const handleRenameSave = async (projectId: string) => {
    if (!editingName.trim()) {
      setEditingId(null);
      return;
    }

    try {
      await apiService.updateProject(projectId, editingName.trim());
      await loadProjects();
      setEditingId(null);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response: { data: { error: { message: string } } } };
        setError(axiosError.response?.data?.error?.message || 'Failed to rename project');
      } else {
        setError('Failed to rename project');
      }
    }
  };

  const handleRenameCancel = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleDelete = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await apiService.deleteProject(projectId);
      await loadProjects();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response: { data: { error: { message: string } } } };
        setError(axiosError.response?.data?.error?.message || 'Failed to delete project');
      } else {
        setError('Failed to delete project');
      }
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', 'Project');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const brickType = e.dataTransfer.getData('text/plain');

    if (brickType === 'Project') {
      try {
        await apiService.createProject();
        await loadProjects();
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosError = err as { response: { data: { error: { message: string } } } };
          setError(axiosError.response?.data?.error?.message || 'Failed to create project');
        } else {
          setError('Failed to create project');
        }
      }
    }
  };

  const filteredBricks = ['Project'].filter((brick) =>
    brick.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="home-screen">
        <div className="home-header">
          <h1>Home</h1>
          <SettingsMenu />
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="home-screen">
      <div className="home-header">
        <h1>Home</h1>
        <SettingsMenu />
      </div>
      <div className="home-content">
        <div className="home-sidebar">
          <input
            type="text"
            placeholder="Search bricks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="brick-search"
          />
          <div className="brick-list">
            {filteredBricks.map((brick) => (
              <div
                key={brick}
                className="brick-item"
                draggable
                onDragStart={handleDragStart}
              >
                {brick}
              </div>
            ))}
          </div>
        </div>
        <div
          className="project-list-area"
          ref={projectListRef}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="project-grid">
            {projects.map((project) => (
              <div
                key={project.id}
                className="project-card"
                onDoubleClick={() => handleProjectDoubleClick(project.id)}
              >
                {editingId === project.id ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => handleRenameSave(project.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRenameSave(project.id);
                      } else if (e.key === 'Escape') {
                        handleRenameCancel();
                      }
                    }}
                    autoFocus
                    className="project-name-input"
                  />
                ) : (
                  <>
                    <div className="project-name">{project.name}</div>
                    <div className="project-actions">
                      <button
                        className="project-action-button"
                        onClick={() => handleRenameStart(project)}
                        title="Rename"
                      >
                        ✏️
                      </button>
                      <button
                        className="project-action-button"
                        onClick={() => handleDelete(project.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      {error && (
        <ErrorNotification
          message={error}
          onClose={() => setError(null)}
        />
      )}
    </div>
  );
};
