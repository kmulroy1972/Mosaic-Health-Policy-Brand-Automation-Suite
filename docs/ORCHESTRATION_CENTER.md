# Scheduling and Orchestration Center

**Last Updated:** 2025-01-27  
**Status:** ✅ Phase 95 Complete

## Durable Functions Workflow Orchestrator

**Location:** `packages/backend-functions/src/orchestration/center.ts`

Implements workflow orchestrator for timed jobs via Durable Functions.

## Supported Workflows

### Report Generation

- Scheduled report generation
- Multi-step report assembly
- Notification on completion

### Compliance Scan

- Periodic compliance scanning
- Batch document processing
- Violation aggregation

### Data Sync

- Cross-system data synchronization
- Incremental updates
- Conflict resolution

### Audit Evidence

- Scheduled evidence collection
- Artifact generation
- Pack assembly

## Endpoints

### POST `/api/orchestration/workflow`

Create a new workflow.

**Request:**

```json
{
  "workflowType": "report_generation",
  "schedule": "0 0 2 * * *",
  "parameters": {
    "reportType": "compliance",
    "tenantId": "tenant-123"
  }
}
```

### GET `/api/orchestration/workflow?workflowId=...`

Get workflow status.

**Response:**

```json
{
  "workflowId": "workflow-123",
  "status": "running",
  "progress": 45,
  "startedAt": "2025-01-27T12:00:00.000Z"
}
```

## Workflow Status

- **pending** - Workflow created, not started
- **running** - Currently executing
- **completed** - Successfully finished
- **failed** - Execution failed

## Implementation Status

⚠️ **Durable Functions Integration Pending**

Current implementation:

- Workflow orchestration framework
- Status tracking structure
- Schedule support

**TODO:**

- Integrate Durable Functions SDK
- Implement workflow activities
- Add retry logic
- Build workflow monitoring dashboard
- Schedule recurring workflows
