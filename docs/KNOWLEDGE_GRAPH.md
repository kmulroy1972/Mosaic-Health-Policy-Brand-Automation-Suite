# Internal Knowledge Graph

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 55 Complete

## Overview

Graph-like structure storing relationships between clients, policies, themes, and funding using Cosmos DB.

## Node Types

- **client** - Client organizations
- **policy** - Policy documents
- **theme** - Policy themes/topics
- **funding** - Funding sources
- **document** - Related documents

## Relationship Types

- **related_to** - General relationship
- **funded_by** - Funding relationships
- **implements** - Implementation relationships
- **references** - Reference relationships

## Endpoint

**POST** `/api/graph/query`

### Request

```json
{
  "query": "MATCH (n:client) RETURN n",
  "parameters": {}
}
```

### Response

```json
{
  "nodes": [
    {
      "id": "client-123",
      "type": "client",
      "properties": {
        "name": "Client Name",
        "industry": "Healthcare"
      }
    }
  ],
  "relationships": [],
  "count": 1
}
```

## Query Syntax

Cypher-style syntax (simplified):

- `MATCH (n:type)` - Find nodes of type
- `MATCH (a)-[r]->(b)` - Find relationships
- `WHERE` - Filter conditions

## Implementation Status

⚠️ **Full Neo4j Migration Pending**

Current implementation:

- Cosmos DB-based graph storage
- Basic query parsing
- Node and relationship storage

**TODO:**

- Full Cypher query parser
- Neo4j integration (if preferred)
- Graph visualization in dashboard
- Relationship traversal algorithms
