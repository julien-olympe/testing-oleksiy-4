import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { apiService } from '../../services/api';
import { SettingsMenu } from '../common/SettingsMenu';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorNotification } from '../common/ErrorNotification';
import { BrickNode } from './BrickNode';
import type { FunctionEditorData, BrickType, Database } from '../../types';
import { debounce } from '../../utils/debounce';
import './FunctionEditor.css';

const nodeTypes: NodeTypes = {
  brick: BrickNode,
};

export const FunctionEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<FunctionEditorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [databases, setDatabases] = useState<Database[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onEdgesChangeHandler = useCallback(
    async (changes: any) => {
      onEdgesChange(changes);
      // Handle edge deletion
      changes.forEach((change: any) => {
        if (change.type === 'remove') {
          const edge = edges.find((e) => e.id === change.id);
          if (edge && edge.source && edge.target) {
            apiService.deleteConnection(
              edge.source,
              edge.target,
              edge.sourceHandle || undefined,
              edge.targetHandle || undefined
            ).catch((err) => {
              console.error('Failed to delete connection:', err);
            });
          }
        }
      });
    },
    [edges, onEdgesChange]
  );

  useEffect(() => {
    if (id) {
      loadEditorData();
    }
  }, [id]);

  useEffect(() => {
    if (data) {
      // Load databases for brick configuration
      loadDatabases();
    }
  }, [data]);

  useEffect(() => {
    if (data) {
      // Convert bricks and connections to React Flow nodes and edges
      // This runs when data or databases change
      convertToFlowElements();
    }
  }, [data, databases]);

  const loadEditorData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const editorData = await apiService.getFunctionEditor(id);
      setData(editorData);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response: { data: { error: { message: string } } } };
        setError(axiosError.response?.data?.error?.message || 'Failed to load function editor');
      } else {
        setError('Failed to load function editor');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadDatabases = async () => {
    if (!id || !data) return;

    try {
      // Get project ID from function
      const projectId = data.function.projectId;
      if (projectId) {
        const editorData = await apiService.getProjectEditor(projectId);
        setDatabases(editorData.databases);
      }
    } catch (err) {
      // Silently fail - databases not critical for editor
      console.error('Failed to load databases:', err);
    }
  };

  const convertToFlowElements = () => {
    if (!data) return;

    const flowNodes: Node[] = data.bricks.map((brick) => ({
      id: brick.id,
      type: 'brick',
      position: { x: brick.positionX, y: brick.positionY },
      data: {
        brick,
        databases,
        onConfigurationChange: handleBrickConfigurationChange,
      },
    }));

    const flowEdges: Edge[] = data.connections.map((conn) => ({
      id: conn.id,
      source: conn.fromBrickId,
      target: conn.toBrickId,
      sourceHandle: conn.fromOutputName,
      targetHandle: conn.toInputName,
    }));

    setNodes(flowNodes);
    setEdges(flowEdges);
  };

  const debouncedUpdateBrickPosition = debounce(
    async (brickId: string, positionX: number, positionY: number) => {
      try {
        await apiService.updateBrick(brickId, { positionX, positionY });
      } catch (err) {
        console.error('Failed to update brick position:', err);
      }
    },
    500
  );

  const onNodesChangeHandler = useCallback(
    (changes: any) => {
      onNodesChange(changes);
      // Handle position updates
      changes.forEach((change: any) => {
        if (change.type === 'position' && change.position) {
          const node = nodes.find((n) => n.id === change.id);
          if (node) {
            debouncedUpdateBrickPosition(change.id, change.position.x, change.position.y);
          }
        }
      });
    },
    [nodes, onNodesChange]
  );

  const onConnect = useCallback(
    async (params: Connection) => {
      if (!params.source || !params.target || !params.sourceHandle || !params.targetHandle) {
        return;
      }

      try {
        const connection = await apiService.createConnection(
          params.source,
          params.sourceHandle,
          params.target,
          params.targetHandle
        );

        setEdges((eds) =>
          addEdge(
            {
              id: connection.id,
              source: connection.fromBrickId,
              target: connection.toBrickId,
              sourceHandle: connection.fromOutputName,
              targetHandle: connection.toInputName,
            },
            eds
          )
        );
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosError = err as { response: { data: { error: { message: string } } } };
          setError(axiosError.response?.data?.error?.message || 'Failed to create connection');
        } else {
          setError('Failed to create connection');
        }
      }
    },
    [setEdges]
  );

  const handleBrickConfigurationChange = async (brickId: string, configuration: Record<string, unknown>) => {
    try {
      await apiService.updateBrick(brickId, { configuration });
      // Reload editor data to get updated configuration
      await loadEditorData();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response: { data: { error: { message: string } } } };
        setError(axiosError.response?.data?.error?.message || 'Failed to update brick configuration');
      } else {
        setError('Failed to update brick configuration');
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, brickType: BrickType) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', brickType);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (!id || !data) return;

    const brickType = e.dataTransfer.getData('text/plain') as BrickType;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const positionX = e.clientX - rect.left;
    const positionY = e.clientY - rect.top;

    try {
      if (id) {
        await apiService.createBrick(id, brickType, positionX, positionY);
        await loadEditorData();
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response: { data: { error: { message: string } } } };
        setError(axiosError.response?.data?.error?.message || 'Failed to add brick');
      } else {
        setError('Failed to add brick');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleRun = async () => {
    if (!id) return;

    try {
      setRunning(true);
      const result = await apiService.runFunction(id);
      
      // Log console output to browser console
      result.consoleOutput.forEach((output) => {
        console.log(output);
      });

      // Show success message
      alert(`Function executed successfully! Check console for output.`);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response: { data: { error: { message: string } } } };
        setError(axiosError.response?.data?.error?.message || 'Failed to run function');
      } else {
        setError('Failed to run function');
      }
    } finally {
      setRunning(false);
    }
  };

  const handleBack = () => {
    if (data) {
      navigate(`/projects/${data.function.projectId}`);
    } else {
      navigate('/home');
    }
  };

  const getBrickLabel = (brickType: BrickType): string => {
    switch (brickType) {
      case 'ListInstancesByDB':
        return 'List instances by DB name';
      case 'GetFirstInstance':
        return 'Get first instance';
      case 'LogInstanceProps':
        return 'Log instance props';
      default:
        return brickType;
    }
  };

  const availableBricks: BrickType[] = ['ListInstancesByDB', 'GetFirstInstance', 'LogInstanceProps'];
  const filteredBricks = availableBricks.filter((brick) =>
    getBrickLabel(brick).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="function-editor">
        <div className="function-editor-header">
          <button className="back-button" onClick={handleBack}>← Back</button>
          <h1>Function Editor</h1>
          <SettingsMenu />
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="function-editor">
        <div className="function-editor-header">
          <button className="back-button" onClick={handleBack}>← Back</button>
          <h1>Function Editor</h1>
          <SettingsMenu />
        </div>
        <div className="error-message">Function not found</div>
      </div>
    );
  }

  return (
    <div className="function-editor">
      <div className="function-editor-header">
        <button className="back-button" onClick={handleBack}>← Back</button>
        <h1>{data.function.name}</h1>
        <SettingsMenu />
      </div>
      <div className="function-editor-content">
        <div className="function-editor-sidebar">
          <button
            className="run-button"
            onClick={handleRun}
            disabled={running}
          >
            {running ? 'Running...' : 'RUN'}
          </button>
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
                onDragStart={(e) => handleDragStart(e, brick)}
              >
                {getBrickLabel(brick)}
              </div>
            ))}
          </div>
        </div>
        <div
          className="function-editor-canvas"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChangeHandler}
            onEdgesChange={onEdgesChangeHandler}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
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
