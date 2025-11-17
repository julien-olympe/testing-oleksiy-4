import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import type { Function as FunctionType } from '../../types';
import './ProjectTab.css';

interface ProjectTabProps {
  projectId: string;
  functions: FunctionType[];
  onDataChange: () => void;
  onError: (error: string) => void;
}

export const ProjectTab: React.FC<ProjectTabProps> = ({
  projectId,
  functions,
  onDataChange,
  onError,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const navigate = useNavigate();

  const handleFunctionDoubleClick = (functionId: string) => {
    navigate(`/functions/${functionId}`);
  };

  const handleRenameStart = (func: FunctionType) => {
    setEditingId(func.id);
    setEditingName(func.name);
  };

  const handleRenameSave = async (functionId: string) => {
    if (!editingName.trim()) {
      setEditingId(null);
      return;
    }

    try {
      await apiService.updateFunction(functionId, editingName.trim());
      onDataChange();
      setEditingId(null);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response: { data: { error: { message: string } } } };
        onError(axiosError.response?.data?.error?.message || 'Failed to rename function');
      } else {
        onError('Failed to rename function');
      }
    }
  };

  const handleRenameCancel = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleDelete = async (functionId: string) => {
    if (!window.confirm('Are you sure you want to delete this function?')) {
      return;
    }

    try {
      await apiService.deleteFunction(functionId);
      onDataChange();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response: { data: { error: { message: string } } } };
        onError(axiosError.response?.data?.error?.message || 'Failed to delete function');
      } else {
        onError('Failed to delete function');
      }
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', 'Function');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const brickType = e.dataTransfer.getData('text/plain');

    if (brickType === 'Function') {
      try {
        await apiService.createFunction(projectId);
        onDataChange();
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosError = err as { response: { data: { error: { message: string } } } };
          onError(axiosError.response?.data?.error?.message || 'Failed to create function');
        } else {
          onError('Failed to create function');
        }
      }
    }
  };

  const filteredBricks = ['Function'].filter((brick) =>
    brick.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="project-tab">
      <div className="project-tab-sidebar">
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
        className="function-list-area"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="function-grid">
          {functions.map((func) => (
            <div
              key={func.id}
              className="function-card"
              onDoubleClick={() => handleFunctionDoubleClick(func.id)}
            >
              {editingId === func.id ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => handleRenameSave(func.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleRenameSave(func.id);
                    } else if (e.key === 'Escape') {
                      handleRenameCancel();
                    }
                  }}
                  autoFocus
                  className="function-name-input"
                />
              ) : (
                <>
                  <div className="function-name">{func.name}</div>
                  <div className="function-actions">
                    <button
                      className="function-action-button"
                      onClick={() => handleRenameStart(func)}
                      title="Rename"
                    >
                      ✏️
                    </button>
                    <button
                      className="function-action-button"
                      onClick={() => handleDelete(func.id)}
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
  );
};
