/**
 * Internal Knowledge Graph models
 */

export interface GraphNode {
  id: string;
  type: 'client' | 'policy' | 'theme' | 'funding' | 'document';
  properties: Record<string, unknown>;
}

export interface GraphRelationship {
  id: string;
  from: string; // Node ID
  to: string; // Node ID
  type: 'related_to' | 'funded_by' | 'implements' | 'references';
  properties?: Record<string, unknown>;
}

export interface GraphQuery {
  query: string; // Cypher-style syntax
  parameters?: Record<string, unknown>;
}

export interface GraphQueryResult {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
}
