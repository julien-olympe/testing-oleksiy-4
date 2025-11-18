import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { debounce } from '../../utils/debounce';
import type { Database } from '../../types';
import './DatabaseTab.css';

interface DatabaseTabProps {
  projectId: string;
  databases: Database[];
  onDataChange: () => void;
  onError: (error: string) => void;
}

export const DatabaseTab: React.FC<DatabaseTabProps> = ({
  projectId,
  databases,
  onDataChange,
  onError,
}) => {
  const [selectedDatabaseId, setSelectedDatabaseId] = useState<string | null>(
    databases.length > 0 ? databases[0].id : null
  );
  
  // Local state for input values to provide immediate feedback
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  const selectedDatabase = databases.find((db) => db.id === selectedDatabaseId);
  
  // Initialize input values from database when databases change
  useEffect(() => {
    const values: Record<string, string> = {};
    databases.forEach((db) => {
      db.instances.forEach((instance) => {
        instance.values.forEach((value) => {
          const key = `${instance.id}-${value.propertyId}`;
          values[key] = value.value;
        });
      });
    });
    setInputValues(values);
  }, [databases]);

  const handleCreateInstance = async () => {
    if (!selectedDatabaseId) return;

    try {
      await apiService.createDatabaseInstance(projectId, selectedDatabaseId);
      onDataChange();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response: { data: { error: { message: string } } } };
        onError(axiosError.response?.data?.error?.message || 'Failed to create instance');
      } else {
        onError('Failed to create instance');
      }
    }
  };

  const debouncedUpdateValue = debounce(
    async (instanceId: string, propertyId: string, value: string) => {
      if (!selectedDatabaseId) return;

      try {
        await apiService.updateDatabaseInstance(
          projectId,
          selectedDatabaseId,
          instanceId,
          propertyId,
          value
        );
        onDataChange();
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosError = err as { 
            response?: { 
              data?: { 
                error?: { message?: string } 
              } 
            } 
          };
          const errorMessage = axiosError.response?.data?.error?.message;
          if (errorMessage) {
            onError(errorMessage);
          } else {
            onError('Failed to update instance');
          }
        } else {
          onError('Failed to update instance');
        }
      }
    },
    500
  );

  const handleValueChange = (instanceId: string, propertyId: string, value: string) => {
    // Update local state immediately for responsive UI
    const key = `${instanceId}-${propertyId}`;
    setInputValues((prev) => ({ ...prev, [key]: value }));
    // Debounce the API call
    debouncedUpdateValue(instanceId, propertyId, value);
  };
  
  const getInputValue = (instanceId: string, propertyId: string, defaultValue: string): string => {
    const key = `${instanceId}-${propertyId}`;
    return inputValues[key] !== undefined ? inputValues[key] : defaultValue;
  };

  return (
    <div className="database-tab">
      <div className="database-sidebar">
        <h3>Database Types</h3>
        <div className="database-type-list">
          {databases.map((database) => (
            <button
              key={database.id}
              className={`database-type-item ${
                selectedDatabaseId === database.id ? 'active' : ''
              }`}
              onClick={() => setSelectedDatabaseId(database.id)}
            >
              {database.name}
            </button>
          ))}
        </div>
      </div>
      <div className="database-content">
        {selectedDatabase ? (
          <>
            <div className="database-header">
              <h3>{selectedDatabase.name} Instances</h3>
              <button
                className="create-instance-button"
                onClick={handleCreateInstance}
              >
                Create instance
              </button>
            </div>
            <div className="instances-list">
              {selectedDatabase.instances.length === 0 ? (
                <div className="empty-state">No instances created yet</div>
              ) : (
                selectedDatabase.instances.map((instance) => (
                  <div key={instance.id} className="instance-card">
                    <div className="instance-id">Instance: {instance.id.slice(0, 8)}...</div>
                    {instance.values.map((value) => (
                      <div key={value.propertyId} className="instance-property">
                        <label>{value.propertyName}:</label>
                        <input
                          type="text"
                          value={getInputValue(instance.id, value.propertyId, value.value)}
                          onChange={(e) =>
                            handleValueChange(instance.id, value.propertyId, e.target.value)
                          }
                          className="property-input"
                        />
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="empty-state">Select a database type</div>
        )}
      </div>
    </div>
  );
};
