import { CosmosClient, Database, Container } from '@azure/cosmos';
import type { InvocationContext } from '@azure/functions';

/**
 * Cosmos DB connection and client management
 */

let cosmosClient: CosmosClient | null = null;
let database: Database | null = null;

/**
 * Get or create Cosmos DB client
 */
export function getCosmosClient(): CosmosClient {
  if (cosmosClient) {
    return cosmosClient;
  }

  const endpoint = process.env.COSMOS_ENDPOINT;
  const key = process.env.COSMOS_KEY;

  if (!endpoint || !key) {
    throw new Error(
      'Cosmos DB not configured. Set COSMOS_ENDPOINT and COSMOS_KEY environment variables.'
    );
  }

  cosmosClient = new CosmosClient({
    endpoint,
    key
  });

  return cosmosClient;
}

/**
 * Get or create database reference
 */
export async function getDatabase(context?: InvocationContext): Promise<Database> {
  if (database) {
    return database;
  }

  const client = getCosmosClient();
  const databaseName = process.env.COSMOS_DATABASE_NAME || 'mhp-brand-db';

  try {
    const { database: db } = await client.databases.createIfNotExists({
      id: databaseName
    });
    database = db;

    if (context) {
      context.log(`Cosmos DB database '${databaseName}' connected`);
    }

    return database;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (context) {
      context.error(`Failed to connect to Cosmos DB: ${errorMessage}`);
    }
    throw new Error(`Failed to connect to Cosmos DB: ${errorMessage}`);
  }
}

/**
 * Get or create container reference
 */
export async function getContainer(
  containerName: string,
  partitionKey: string = '/id',
  context?: InvocationContext
): Promise<Container> {
  const db = await getDatabase(context);

  try {
    const { container } = await db.containers.createIfNotExists({
      id: containerName,
      partitionKey: {
        paths: [partitionKey]
      }
    });

    if (context) {
      context.log(`Cosmos DB container '${containerName}' ready`);
    }

    return container;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (context) {
      context.error(`Failed to create/get container '${containerName}': ${errorMessage}`);
    }
    throw new Error(`Failed to create/get container '${containerName}': ${errorMessage}`);
  }
}

/**
 * Initialize Cosmos DB containers
 */
export async function initializeContainers(context?: InvocationContext): Promise<void> {
  try {
    // Create containers for each data model
    await getContainer('auditLogs', '/tenantId', context);
    await getContainer('templates', '/tenantId', context);
    await getContainer('userPreferences', '/tenantId', context);

    if (context) {
      context.log('Cosmos DB containers initialized');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (context) {
      context.error(`Failed to initialize Cosmos DB containers: ${errorMessage}`);
    }
    throw error;
  }
}
