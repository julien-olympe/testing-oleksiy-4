import React, { useState, useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import type { Brick, Database, BrickType } from '../../types';
import './BrickNode.css';

interface BrickNodeData {
  brick: Brick;
  databases: Database[];
  onConfigurationChange: (brickId: string, configuration: Record<string, unknown>) => void;
}

export const BrickNode: React.FC<NodeProps<BrickNodeData>> = ({ data }) => {
  const { brick, databases, onConfigurationChange } = data;
  const [showDatabaseSelect, setShowDatabaseSelect] = useState(false);

  const getBrickInfo = (type: BrickType) => {
    switch (type) {
      case 'ListInstancesByDB':
        return {
          label: 'List instances by DB name',
          inputs: [{ name: 'Name of DB', type: 'string' }],
          outputs: [{ name: 'List', type: 'list' }],
        };
      case 'GetFirstInstance':
        return {
          label: 'Get first instance',
          inputs: [{ name: 'List', type: 'list' }],
          outputs: [{ name: 'DB', type: 'object' }],
        };
      case 'LogInstanceProps':
        return {
          label: 'Log instance props',
          inputs: [{ name: 'Object', type: 'object' }],
          outputs: [{ name: 'value', type: 'string' }],
        };
      default:
        return { label: type, inputs: [], outputs: [] };
    }
  };

  const info = getBrickInfo(brick.type);
  const databaseName = (brick.configuration?.databaseName as string) || '';

  const handleDatabaseSelect = useCallback(
    (dbName: string) => {
      // Ensure configuration is always an object (handle null/undefined)
      const currentConfig = brick.configuration && typeof brick.configuration === 'object' ? brick.configuration : {};
      onConfigurationChange(brick.id, { ...currentConfig, databaseName: dbName });
      setShowDatabaseSelect(false);
    },
    [brick, onConfigurationChange]
  );

  return (
    <div className="brick-node">
      <div className="brick-node-header">{info.label}</div>
      
      {/* Inputs */}
      <div className="brick-node-inputs">
        {info.inputs.map((input) => {
          const isDatabaseInput = brick.type === 'ListInstancesByDB' && input.name === 'Name of DB';
          return (
            <div key={input.name} className="brick-input-container">
              <Handle
                type="target"
                position={Position.Left}
                id={input.name}
                className="brick-handle"
              />
              <div className="brick-input-label">
                {input.name}
                {isDatabaseInput && (
                  <button
                    className="database-select-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDatabaseSelect(!showDatabaseSelect);
                    }}
                  >
                    {databaseName || 'Select DB'}
                  </button>
                )}
                {isDatabaseInput && showDatabaseSelect && (
                  <div className="database-select-dropdown">
                    {databases.map((db) => (
                      <button
                        key={db.id}
                        className="database-option"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDatabaseSelect(db.name);
                        }}
                      >
                        {db.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Outputs */}
      <div className="brick-node-outputs">
        {info.outputs.map((output) => (
          <div key={output.name} className="brick-output-container">
            <div className="brick-output-label">{output.name}</div>
            <Handle
              type="source"
              position={Position.Right}
              id={output.name}
              className="brick-handle"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
