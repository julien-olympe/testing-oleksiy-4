import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { SettingsMenu } from '../common/SettingsMenu';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorNotification } from '../common/ErrorNotification';
import { ProjectTab } from './ProjectTab';
import { PermissionsTab } from './PermissionsTab';
import { DatabaseTab } from './DatabaseTab';
import type { ProjectEditorData } from '../../types';
import './ProjectEditor.css';

type TabType = 'project' | 'permissions' | 'database';

export const ProjectEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ProjectEditorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('project');

  useEffect(() => {
    if (id) {
      loadEditorData();
    }
  }, [id]);

  const loadEditorData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const editorData = await apiService.getProjectEditor(id);
      setData(editorData);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response: { status: number; data: { error: { message: string } } } };
        const status = axiosError.response?.status;
        const errorMessage = axiosError.response?.data?.error?.message || 'Failed to load project editor';
        
        // Navigate away on authorization/authentication errors
        if (status === 401 || status === 403) {
          navigate('/home');
          return;
        }
        
        setError(errorMessage);
      } else {
        setError('Failed to load project editor');
      }
      setData(null); // Ensure data is cleared on error
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/home');
  };

  if (loading) {
    return (
      <div className="project-editor">
        <div className="project-editor-header">
          <button className="back-button" onClick={handleBack}>← Back</button>
          <h1>Project Editor</h1>
          <SettingsMenu />
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="project-editor">
        <div className="project-editor-header">
          <button className="back-button" onClick={handleBack}>← Back</button>
          <h1>Project Editor</h1>
          <SettingsMenu />
        </div>
        <div className="error-message">Project not found</div>
      </div>
    );
  }

  return (
    <div className="project-editor">
      <div className="project-editor-header">
        <button className="back-button" onClick={handleBack}>← Back</button>
        <h1>{data.project.name}</h1>
        <SettingsMenu />
      </div>
      <div className="project-editor-tabs">
        <button
          className={`tab-button ${activeTab === 'project' ? 'active' : ''}`}
          onClick={() => setActiveTab('project')}
        >
          Project
        </button>
        <button
          className={`tab-button ${activeTab === 'permissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('permissions')}
        >
          Permissions
        </button>
        <button
          className={`tab-button ${activeTab === 'database' ? 'active' : ''}`}
          onClick={() => setActiveTab('database')}
        >
          Database
        </button>
      </div>
      <div className="project-editor-content">
        {activeTab === 'project' && (
          <ProjectTab
            projectId={id!}
            functions={data.functions}
            onDataChange={loadEditorData}
            onError={setError}
          />
        )}
        {activeTab === 'permissions' && (
          <PermissionsTab
            projectId={id!}
            permissions={data.permissions}
            onDataChange={loadEditorData}
            onError={setError}
          />
        )}
        {activeTab === 'database' && (
          <DatabaseTab
            projectId={id!}
            databases={data.databases}
            onDataChange={loadEditorData}
            onError={setError}
          />
        )}
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
