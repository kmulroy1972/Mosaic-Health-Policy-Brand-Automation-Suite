/**
 * Knowledge Graph Store (Neo4j-like structure using Cosmos DB)
 */

import type { Container } from '@azure/cosmos';
import type { InvocationContext } from '@azure/functions';

import { getContainer } from '../db/connection';

import { GraphNode, GraphRelationship, type GraphQueryResult } from './models';

export class GraphStore {
  private containerName = 'knowledgeGraph';

  private async getContainer(_context?: InvocationContext): Promise<Container> {
    return getContainer(this.containerName);
  }

  async addNode(node: GraphNode, context?: InvocationContext): Promise<void> {
    const container = await this.getContainer(context);
    await container.items.create({
      id: node.id,
      type: node.type,
      ...node.properties,
      _nodeType: 'node'
    });
  }

  async addRelationship(
    relationship: GraphRelationship,
    context?: InvocationContext
  ): Promise<void> {
    const container = await this.getContainer(context);
    await container.items.create({
      id: relationship.id,
      from: relationship.from,
      to: relationship.to,
      relationshipType: relationship.type,
      ...relationship.properties,
      _nodeType: 'relationship'
    });
  }

  async queryGraph(
    query: string,
    parameters?: Record<string, unknown>,
    context?: InvocationContext
  ): Promise<GraphQueryResult> {
    // TODO: Implement Cypher-style query parsing and execution
    // For now, return placeholder structure

    const container = await this.getContainer(context);
    const results: GraphQueryResult = {
      nodes: [],
      relationships: []
    };

    // Simple query examples:
    // "MATCH (n:client)" -> get all client nodes
    // "MATCH (a)-[r]->(b)" -> get relationships

    if (query.includes('MATCH (n:')) {
      // Extract node type from query
      const typeMatch = query.match(/\(n:(\w+)\)/);
      if (typeMatch) {
        const nodeType = typeMatch[1];
        const { resources } = await container.items
          .query({
            query: `SELECT * FROM c WHERE c.type = @type AND c._nodeType = 'node'`,
            parameters: [{ name: '@type', value: nodeType }]
          })
          .fetchAll();

        results.nodes = resources.map(
          (r) =>
            ({
              id: r.id,
              type: r.type,
              properties: r
            }) as GraphNode
        );
      }
    }

    return results;
  }
}

export const graphStore = new GraphStore();
