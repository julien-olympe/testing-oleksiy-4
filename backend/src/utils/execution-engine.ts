import { prisma } from '../db/client';
import { BusinessLogicError } from './errors';
import { Prisma } from '@prisma/client';

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
    
    // Debug: Log raw configuration from database
    if (func && func.bricks.length > 0) {
      console.log(`[ExecutionEngine] Raw configurations from database:`);
      for (const brick of func.bricks) {
        console.log(`[ExecutionEngine] Brick ${brick.id} (${brick.type}):`, JSON.stringify(brick.configuration));
        console.log(`[ExecutionEngine] Configuration type:`, typeof brick.configuration);
        console.log(`[ExecutionEngine] Configuration is array:`, Array.isArray(brick.configuration));
      }
    }

    if (!func || func.bricks.length === 0) {
      throw new BusinessLogicError('EXECUTION_FAILED', 'Function has no bricks to execute');
    }

    // Normalize configurations (ensure they're always plain objects, not null, arrays, or other types)
    for (const brick of func.bricks) {
      // Handle Prisma JsonValue type - ensure it's a plain object
      // Prisma returns JsonValue which can be JsonObject, JsonArray, string, number, boolean, or null
      if (!brick.configuration || typeof brick.configuration !== 'object' || Array.isArray(brick.configuration)) {
        // If it's null, undefined, or not an object, set to empty object
        brick.configuration = {} as Prisma.JsonObject;
      } else {
        // Prisma already returns JsonObject as a plain object, so we can use it directly
        // But we'll ensure it's properly typed as JsonObject
        // No need to JSON.parse(JSON.stringify()) as it's already a plain object from Prisma
        brick.configuration = brick.configuration as Prisma.JsonObject;
      }
      // Log configuration for debugging
      console.log(`[ExecutionEngine] Normalized configuration for brick ${brick.id} (${brick.type}):`, JSON.stringify(brick.configuration));
      console.log(`[ExecutionEngine] Configuration keys:`, Object.keys(brick.configuration as Prisma.JsonObject));
    }

    // Log loaded function data for debugging
    console.log(`[ExecutionEngine] Loaded function: ${func.id} with ${func.bricks.length} bricks`);
    for (const brick of func.bricks) {
      console.log(`[ExecutionEngine] Brick ${brick.id} (${brick.type}):`);
      console.log(`  - connectionsFrom: ${brick.connectionsFrom.length}`);
      console.log(`  - connectionsTo: ${brick.connectionsTo.length}`);
      console.log(`  - configuration:`, JSON.stringify(brick.configuration));
      if (brick.connectionsTo.length > 0) {
        console.log(`  - connectionsTo details:`, JSON.stringify(brick.connectionsTo.map(c => ({
          fromBrickId: c.fromBrickId,
          fromOutputName: c.fromOutputName,
          toInputName: c.toInputName,
        }))));
      }
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

  private static validateFunction(bricks: Array<{ id: string; type: string; configuration: Prisma.JsonValue }>): void {
    // Check for required inputs
    for (const brick of bricks) {
      if (brick.type === 'ListInstancesByDB') {
        console.log(`[ExecutionEngine] Validating ListInstancesByDB brick: ${brick.id}`);
        console.log(`[ExecutionEngine] Configuration:`, JSON.stringify(brick.configuration));
        console.log(`[ExecutionEngine] Configuration type:`, typeof brick.configuration);
        console.log(`[ExecutionEngine] Configuration is array:`, Array.isArray(brick.configuration));
        
        // Ensure configuration is a plain object
        if (!brick.configuration || typeof brick.configuration !== 'object' || Array.isArray(brick.configuration)) {
          console.log(`[ExecutionEngine] ListInstancesByDB validation failed - configuration is not a valid object`);
          throw new BusinessLogicError('MISSING_REQUIRED_INPUTS', 'Missing required inputs', {
            brickId: brick.id,
            brickType: brick.type,
            missingInputs: ['databaseName'],
            reason: 'Configuration is not a valid object',
            configuration: brick.configuration,
            configurationType: typeof brick.configuration,
          });
        }
        
        // Convert to plain object to ensure proper property access
        // After normalization, configuration should be Prisma.JsonObject
        const config = brick.configuration as Prisma.JsonObject;
        const databaseName = config.databaseName;
        
        console.log(`[ExecutionEngine] databaseName value:`, databaseName);
        console.log(`[ExecutionEngine] databaseName type:`, typeof databaseName);
        console.log(`[ExecutionEngine] Configuration keys:`, Object.keys(config));
        
        // Handle case where databaseName might be a JsonValue (string, number, etc.)
        const databaseNameStr = typeof databaseName === 'string' ? databaseName : 
                                databaseName !== null && databaseName !== undefined ? String(databaseName) : null;
        
        if (!databaseNameStr || databaseNameStr.trim() === '') {
          console.log(`[ExecutionEngine] ListInstancesByDB validation failed - databaseName is missing or empty`);
          console.log(`[ExecutionEngine] Full configuration object:`, JSON.stringify(config, null, 2));
          throw new BusinessLogicError('MISSING_REQUIRED_INPUTS', 'Missing required inputs', {
            brickId: brick.id,
            brickType: brick.type,
            missingInputs: ['databaseName'],
            reason: `databaseName is ${databaseName === undefined ? 'undefined' : databaseName === null ? 'null' : `'${String(databaseName)}' (type: ${typeof databaseName})`}`,
            configuration: brick.configuration,
            configKeys: Object.keys(config),
            fullConfig: config,
          });
        }
        console.log(`[ExecutionEngine] ListInstancesByDB validation passed - databaseName: ${databaseNameStr}`);
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
      configuration: Prisma.JsonValue;
      connectionsTo: Array<{ fromBrickId: string; fromOutputName: string; toInputName: string }>;
    },
    context: ExecutionContext,
    projectId: string
  ): Promise<ExecutionResult> {
    // Log brick execution details for debugging
    console.log(`[ExecutionEngine] Executing brick: ${brick.type} (${brick.id})`);
    console.log(`[ExecutionEngine] Configuration:`, JSON.stringify(brick.configuration));
    console.log(`[ExecutionEngine] ConnectionsTo:`, JSON.stringify(brick.connectionsTo));
    
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
    brick: { id: string; configuration: Prisma.JsonValue },
    _context: ExecutionContext,
    projectId: string
  ): Promise<ExecutionResult> {
    // Configuration should already be normalized to a plain object by executeFunction
    // After normalization, it should be Prisma.JsonObject
    if (!brick.configuration || typeof brick.configuration !== 'object' || Array.isArray(brick.configuration)) {
      throw new BusinessLogicError('MISSING_REQUIRED_INPUTS', 'Missing required inputs', {
        brickId: brick.id,
        brickType: 'ListInstancesByDB',
        missingInputs: ['databaseName'],
        reason: 'Configuration is not a valid object',
      });
    }
    const config = brick.configuration as Prisma.JsonObject;
    const databaseNameValue = config.databaseName;
    // Handle case where databaseName might be a JsonValue (string, number, etc.)
    const databaseName = typeof databaseNameValue === 'string' ? databaseNameValue : 
                        databaseNameValue !== null && databaseNameValue !== undefined ? String(databaseNameValue) : undefined;

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
    console.log(`[ExecutionEngine] GetFirstInstance - Looking for 'List' input connection`);
    console.log(`[ExecutionEngine] GetFirstInstance - Available connectionsTo:`, JSON.stringify(brick.connectionsTo));
    const inputConnection = brick.connectionsTo.find((c) => c.toInputName === 'List');
    if (!inputConnection) {
      console.log(`[ExecutionEngine] GetFirstInstance - No 'List' input connection found`);
      throw new BusinessLogicError('MISSING_REQUIRED_INPUTS', 'Missing required inputs', {
        brickId: brick.id,
        brickType: 'GetFirstInstance',
        missingInputs: ['List'],
        availableConnections: brick.connectionsTo.map(c => ({ toInputName: c.toInputName, fromOutputName: c.fromOutputName })),
      });
    }

    const sourceOutput = context.brickOutputs.get(inputConnection.fromBrickId);
    if (!sourceOutput) {
      console.log(`[ExecutionEngine] GetFirstInstance - Source brick output not found for fromBrickId: ${inputConnection.fromBrickId}`);
      console.log(`[ExecutionEngine] GetFirstInstance - Available brick outputs:`, Array.from(context.brickOutputs.keys()));
      throw new BusinessLogicError('EXECUTION_FAILED', 'Source brick output not found', {
        brickId: brick.id,
        brickType: 'GetFirstInstance',
        fromBrickId: inputConnection.fromBrickId,
        availableBrickIds: Array.from(context.brickOutputs.keys()),
      });
    }

    console.log(`[ExecutionEngine] GetFirstInstance - Source output keys:`, Object.keys(sourceOutput));
    console.log(`[ExecutionEngine] GetFirstInstance - Looking for key: ${inputConnection.fromOutputName}`);
    
    // Try to get list from source output using fromOutputName
    // Also try 'list' as fallback (in case connection was created with different output name)
    let list = sourceOutput[inputConnection.fromOutputName] as Array<{ id: string; values: Record<string, string> }> | undefined;
    if (!list && inputConnection.fromOutputName !== 'list') {
      // Try 'list' as fallback
      list = sourceOutput['list'] as Array<{ id: string; values: Record<string, string> }> | undefined;
      if (list) {
        console.log(`[ExecutionEngine] GetFirstInstance - Found list using fallback key 'list'`);
      }
    }

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
        DB: list[0], // Frontend expects output name 'DB'
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
    // Find input connection (frontend uses 'Object' as input name)
    console.log(`[ExecutionEngine] LogInstanceProps - Looking for 'Object' or 'Instance' input connection`);
    console.log(`[ExecutionEngine] LogInstanceProps - Available connectionsTo:`, JSON.stringify(brick.connectionsTo));
    const inputConnection = brick.connectionsTo.find((c) => c.toInputName === 'Object' || c.toInputName === 'Instance');
    if (!inputConnection) {
      console.log(`[ExecutionEngine] LogInstanceProps - No 'Object' or 'Instance' input connection found`);
      throw new BusinessLogicError('MISSING_REQUIRED_INPUTS', 'Missing required inputs', {
        brickId: brick.id,
        brickType: 'LogInstanceProps',
        missingInputs: ['Object'],
        availableConnections: brick.connectionsTo.map(c => ({ toInputName: c.toInputName, fromOutputName: c.fromOutputName })),
      });
    }

    const sourceOutput = context.brickOutputs.get(inputConnection.fromBrickId);
    if (!sourceOutput) {
      console.log(`[ExecutionEngine] LogInstanceProps - Source brick output not found for fromBrickId: ${inputConnection.fromBrickId}`);
      console.log(`[ExecutionEngine] LogInstanceProps - Available brick outputs:`, Array.from(context.brickOutputs.keys()));
      throw new BusinessLogicError('EXECUTION_FAILED', 'Source brick output not found', {
        brickId: brick.id,
        brickType: 'LogInstanceProps',
        fromBrickId: inputConnection.fromBrickId,
        availableBrickIds: Array.from(context.brickOutputs.keys()),
      });
    }

    console.log(`[ExecutionEngine] LogInstanceProps - Source output keys:`, Object.keys(sourceOutput));
    console.log(`[ExecutionEngine] LogInstanceProps - Looking for key: ${inputConnection.fromOutputName}`);
    
    // Try to get instance from source output using fromOutputName
    // Also try 'DB' as fallback (in case connection was created with old output name)
    let instance = sourceOutput[inputConnection.fromOutputName] as { id: string; values: Record<string, string> } | undefined;
    if (!instance && inputConnection.fromOutputName !== 'DB') {
      // Try 'DB' as fallback
      instance = sourceOutput['DB'] as { id: string; values: Record<string, string> } | undefined;
      if (instance) {
        console.log(`[ExecutionEngine] LogInstanceProps - Found instance using fallback key 'DB'`);
      }
    }

    if (!instance) {
      console.log(`[ExecutionEngine] LogInstanceProps - Instance not found. Source output:`, JSON.stringify(sourceOutput));
      console.log(`[ExecutionEngine] LogInstanceProps - fromOutputName: ${inputConnection.fromOutputName}`);
      throw new BusinessLogicError('EXECUTION_FAILED', 'Instance not found in input', {
        brickId: brick.id,
        brickType: 'LogInstanceProps',
        fromOutputName: inputConnection.fromOutputName,
        sourceOutputKeys: Object.keys(sourceOutput),
        sourceOutput: sourceOutput,
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
