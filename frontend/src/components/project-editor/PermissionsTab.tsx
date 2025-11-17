import React, { useState } from 'react';
import { apiService } from '../../services/api';
import type { Permission } from '../../types';
import './PermissionsTab.css';

interface PermissionsTabProps {
  projectId: string;
  permissions: Permission[];
  onDataChange: () => void;
  onError: (error: string) => void;
}

export const PermissionsTab: React.FC<PermissionsTabProps> = ({
  projectId,
  permissions = [],
  onDataChange,
  onError,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setLoading(true);
      await apiService.addPermission(projectId, email.trim());
      setEmail('');
      setShowAddForm(false);
      onDataChange();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response: { data: { error: { message: string } } } };
        onError(axiosError.response?.data?.error?.message || 'Failed to add permission');
      } else {
        onError('Failed to add permission');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="permissions-tab">
      <div className="permissions-header">
        <h2>Project Permissions</h2>
        {!showAddForm && (
          <button
            className="add-user-button"
            onClick={() => setShowAddForm(true)}
          >
            Add a user
          </button>
        )}
      </div>
      {showAddForm && (
        <div className="add-user-form">
          <form onSubmit={handleAddUser}>
            <input
              type="email"
              placeholder="Enter user email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="email-input"
            />
            <div className="form-actions">
              <button type="submit" className="confirm-button" disabled={loading}>
                {loading ? 'Adding...' : 'Add'}
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setShowAddForm(false);
                  setEmail('');
                }}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      <div className="permissions-list">
        {permissions.length === 0 ? (
          <div className="empty-state">No users have permissions for this project</div>
        ) : (
          permissions.map((permission) => (
            <div key={permission.userId} className="permission-item">
              {permission.userEmail}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
