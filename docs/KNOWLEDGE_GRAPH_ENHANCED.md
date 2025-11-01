# Knowledge Graph Enhancement

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 85 Complete

## Neo4j/Azure Cosmos Graph Connector

**Location:** `packages/backend-functions/src/knowledge/graph.ts`

Enhanced knowledge graph for brand-concept relationships using graph database technology.

## Endpoint

**POST** `/api/knowledge/query`

### Request

```json
{
  "query": "MATCH (b:Brand)-[r:RELATED_TO]->(c:Concept) RETURN b, r, c",
  "parameters": {
    "brandName": "Mosaic"
  }
}
```

### Response

```json
{
  "nodes": [
    {
      "id": "node-1",
      "labels": ["Brand", "Concept"],
      "properties": {
        "name": "Mosaic Brand",
        "type": "BrandGuideline"
      }
    }
  ],
  "relationships": [
    {
      "id": "rel-1",
      "type": "RELATED_TO",
      "startNode": "node-1",
      "endNode": "node-2",
      "properties": {
        "strength": 0.85
      }
    }
  ],
  "metadata": {
    "queryTime": 50,
    "resultsCount": 2
  }
}
```

## Graph Structure

### Node Types

- **Brand** - Brand guidelines and assets
- **Concept** - Policy concepts and themes
- **Client** - Client organizations
- **Funding** - Funding opportunities
- **Legislation** - Policy legislation

### Relationship Types

- **RELATED_TO** - General relationships
- **IMPLEMENTS** - Implementation relationships
- **FUNDED_BY** - Funding relationships
- **REFERENCES** - Reference relationships

## Query Languages

- **Cypher** - Neo4j query language
- **Gremlin** - Cosmos DB graph queries
- **GraphQL** - Graph query language (future)

## Implementation Status

⚠️ **Neo4j / Cosmos Graph Integration Pending**

Current implementation:

- Knowledge graph query framework
- Node and relationship models
- Query parameter support

**TODO:**

- Integrate Neo4j driver or Cosmos DB Gremlin API
- Build graph ingestion pipeline
- Create graph visualization
- Add graph traversal algorithms
