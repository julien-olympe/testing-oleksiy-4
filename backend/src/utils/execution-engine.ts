import { prisma } from '../db/client';
import { BusinessLogicError } from './errors';

interface BrickOutput {
  [outputName: string]: unknown;
}

interface ExecutionResult {
  brickId: string;
  brickType: string;
  output: BrickOutput;
}

interface ExecutionContext {
  brickOutputs: Map<string, BrickOutput>;
  consoleOutput: string[];
}

export class ExecutionEngine {
  private static readonly EXECUTION_TIMEOUT = 2000; // 2 seconds

  static async executeFunction(functionId: string): Promise<{
    functionId: string;
    status: string;
    duration: number;
    results: ExecutionResult[];
    consoleOutput: string[];
  }> {
    const startTime = Date.now();

    // Load function with bricks and connections
    const func = await prisma.function.findUnique({
      where: { id: functionId },
      include: {
        bricks: {
          include: {
            connectionsFrom: true,
            connectionsTo: true,
          },
        },
      },
    });

    if (!func || func.bricks.length === 0) {
      throw new BusinessLogicError('EXECUTION_FAILED', 'Function has no bricks to execute');
    }

    // Validate function structure
    this.validateFunction(func.bricks);

    // Build execution graph and get topological order
    const executionOrder = this.getTopologicalOrder(func.bricks);

    // Execute bricks in order
    const context: ExecutionContext = {
      brickOutputs: new Map(),
      consoleOutput: [],
    };

    const results: ExecutionResult[] = [];

    for (const brickId of executionOrder) {
      const brick = func.bricks.find((b) => b.id === brickId);
      if (!brick) continue;

      const timeoutPromise = new Promise<ExecutionResult>((_, reject) => {
        setTimeout(() => reject(new Error('Execution timeout')), this.EXECUTION_TIMEOUT);
      });

      const executionPromise = this.executeBrick(brick, context, func.projectId);

      try {
        const result = await Promise.race([executionPromise, timeoutPromise]);
        results.push(result);
        context.brickOutputs.set(brickId, result.output);
      } catch (error) {
        if (error instanceof Error && error.message === 'Execution timeout') {
          throw new BusinessLogicError(
            'EXECUTION_FAILED',
            `Execution timeout after ${this.EXECUTION_TIMEOUT}ms`,
            { brickId, brickType: brick.type }
          );
        }
        throw error;
      }
    }

    const duration = Date.now() - startTime;

    return {
      functionId,
      status: 'success',
      duration,
      results,
      consoleOutput: context.consoleOutput,
    };
  }

  private static validateFunction(bricks: Array<{ id: string; type: string; configuration: unknown }>): void {
    // Check for required inputs
    for (const brick of bricks) {
      if (brick.type === 'ListInstancesByDB') {
        const config = brick.configuration as { databaseName?: string };
        if (!config || !config.databaseName || typeof config.databaseName !== 'string') {
          throw new BusinessLogicError('MISSING_REQUIRED_INPUTS', 'Missing required inputs', {
            brickId: brick.id,
            brickType: brick.type,
            missingInputs: ['databaseName'],
          });
        }
      }
    }

    // Check for circular dependencies (handled in topological sort)
    // Additional validation can be added here
  }

  private static getTopologicalOrder(
    bricks: Array<{
      id: string;
      connectionsFrom: Array<{ toBrickId: string }>;
      connectionsTo: Array<{ fromBrickId: string }>;
    }>
  ): string[] {
    const inDegree = new Map<string, number>();
    const graph = new Map<string, string[]>();

    // Initialize
    for (const brick of bricks) {
      inDegree.set(brick.id, 0);
      graph.set(brick.id, []);
    }

    // Build graph and calculate in-degrees
    for (const brick of bricks) {
      for (const connection of brick.connectionsFrom) {
        const toBrickId = connection.toBrickId;
        if (graph.has(toBrickId)) {
          graph.get(brick.id)!.push(toBrickId);
          inDegree.set(toBrickId, (inDegree.get(toBrickId) || 0) + 1);
        }
      }
    }

    // Topological sort using Kahn's algorithm
    const queue: string[] = [];
    for (const [brickId, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(brickId);
      }
    }

    const result: string[] = [];

    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current);

      for (const neighbor of graph.get(current) || []) {
        const newDegree = (inDegree.get(neighbor) || 0) - 1;
        inDegree.set(neighbor, newDegree);
        if (newDegree === 0) {
          queue.push(neighbor);
        }
      }
    }

    // Check for cycles
    if (result.length !== bricks.length) {
      throw new BusinessLogicError('INVALID_BRICK_CONNECTIONS', 'Circular dependency detected', {
        issues: ['Function contains circular dependencies'],
      });
    }

    return result;
  }

  private static async executeBrick(
    brick: {
      id: string;
      type: string;
      configuration: unknown;
      connectionsTo: Array<{ fromBrickId: string; fromOutputName: string; toInputName: string }>;
    },
    context: ExecutionContext,
    projectId: string
  ): Promise<ExecutionResult> {
    switch (brick.type) {
      case 'ListInstancesByDB':
        return this.executeListInstancesByDB(brick, context, projectId);
      case 'GetFirstInstance':
        return this.executeGetFirstInstance(brick, context);
      case 'LogInstanceProps':
        return this.executeLogInstanceProps(brick, context);
      default:
        throw new BusinessLogicError('EXECUTION_FAILED', `Unknown brick type: ${brick.type}`, {
          brickId: brick.id,
          brickType: brick.type,
        });
    }
  }

  private static async executeListInstancesByDB(
    brick: { id: string; configuration: unknown },
    _context: ExecutionContext,
    projectId: string
  ): Promise<ExecutionResult> {
    const config = brick.configuration as { databaseName?: string };
    const databaseName = config?.databaseName;

    if (!databaseName) {
      throw new BusinessLogicError('MISSING_REQUIRED_INPUTS', 'Missing required inputs', {
        brickId: brick.id,
        brickType: 'ListInstancesByDB',
        missingInputs: ['databaseName'],
      });
    }

    // Find database (check project databases and default database)
    let database = await prisma.database.findFirst({
      where: {
        name: databaseName,
        projectId,
      },
      include: {
        properties: true,
        instances: {
          include: {
            values: {
              include: {
                property: true,
              },
            },
          },
        },
      },
    });

    // If not found in project, check default database
    if (!database) {
      database = await prisma.database.findFirst({
        where: {
          name: databaseName,
          projectId: '00000000-0000-0000-0000-000000000000', // System project ID
        },
        include: {
          properties: true,
          instances: {
            include: {
              values: {
                include: {
                  property: true,
                },
              },
            },
          },
        },
      });
    }

    if (!database) {
      throw new BusinessLogicError('EXECUTION_FAILED', `Database not found: ${databaseName}`, {
        brickId: brick.id,
        brickType: 'ListInstancesByDB',
      });
    }

    const list = database.instances.map((instance) => {
      const values: Record<string, string> = {};
      for (const value of instance.values) {
        values[value.property.name] = value.value;
      }
      return {
        id: instance.id,
        values,
      };
    });

    return {
      brickId: brick.id,
      brickType: 'ListInstancesByDB',
      output: {
        list,
      },
    };
  }

  private static executeGetFirstInstance(
    brick: {
      id: string;
      connectionsTo: Array<{ fromBrickId: string; fromOutputName: string; toInputName: string }>;
    },
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    // Find input connection
    const inputConnection = brick.connectionsTo.find((c) => c.toInputName === 'List');
    if (!inputConnection) {
      throw new BusinessLogicError('MISSING_REQUIRED_INPUTS', 'Missing required inputs', {
        brickId: brick.id,
        brickType: 'GetFirstInstance',
        missingInputs: ['List'],
      });
    }

    const sourceOutput = context.brickOutputs.get(inputConnection.fromBrickId);
    if (!sourceOutput) {
      throw new BusinessLogicError('EXECUTION_FAILED', 'Source brick output not found', {
        brickId: brick.id,
        brickType: 'GetFirstInstance',
      });
    }

    const list = sourceOutput[inputConnection.fromOutputName] as Array<{ id: string; values: Record<string, string> }> | undefined;

    if (!Array.isArray(list) || list.length === 0) {
      throw new BusinessLogicError('EXECUTION_FAILED', 'List is empty, cannot get first instance', {
        brickId: brick.id,
        brickType: 'GetFirstInstance',
      });
    }

    return Promise.resolve({
      brickId: brick.id,
      brickType: 'GetFirstInstance',
      output: {
        instance: list[0],
      },
    });
  }

  private static executeLogInstanceProps(
    brick: {
      id: string;
      connectionsTo: Array<{ fromBrickId: string; fromOutputName: string; toInputName: string }>;
    },
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    // Find input connection
    const inputConnection = brick.connectionsTo.find((c) => c.toInputName === 'Object');
    if (!inputConnection) {
      throw new BusinessLogicError('MISSING_REQUIRED_INPUTS', 'Missing required inputs', {
        brickId: brick.id,
        brickType: 'LogInstanceProps',
        missingInputs: ['Instance'],
      });
    }

    const sourceOutput = context.brickOutputs.get(inputConnection.fromBrickId);
    if (!sourceOutput) {
      throw new BusinessLogicError('EXECUTION_FAILED', 'Source brick output not found', {
        brickId: brick.id,
        brickType: 'LogInstanceProps',
      });
    }

    const instance = sourceOutput[inputConnection.fromOutputName] as { id: string; values: Record<string, string> } | undefined;

    if (!instance) {
      throw new BusinessLogicError('EXECUTION_FAILED', 'Instance not found in input', {
        brickId: brick.id,
        brickType: 'LogInstanceProps',
      });
    }

    const logMessage = `Instance properties: ${JSON.stringify(instance)}`;
    context.consoleOutput.push(logMessage);

    return Promise.resolve({
      brickId: brick.id,
      brickType: 'LogInstanceProps',
      output: {
        value: 'Logged to console',
      },
    });
  }
}
