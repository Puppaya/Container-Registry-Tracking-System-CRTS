# Container Management System — API Integration Specification

**Version:** 1.1  
**Last updated:** 2026-07-01

Specification for the **Container Management System** team — payload fields and authentication.

Scope: **in-yard container location** and **relocation events** within the yard.

---

## Yard Movement Record (shared by Pull and Push)

Each record represents **one relocation or location update** inside the yard.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `movementReferenceNo` | `string` | ✅ | Unique event reference — **must not be reused** (same container may have many records with different references) |
| `containerNumber` | `string` | ✅ | Container number, e.g. `MSCU1234566` |
| `eventDate` | `string` (ISO 8601) | ✅ | Date and time of the move, e.g. `2026-07-01T14:30:00+07:00` |
| `currentLocation` | `string` | ✅ | Human-readable location, e.g. `Yard A / Block 3 / Row 2 / Tier 1` |
| `yardName` | `string` | ❌ | Yard or facility name |
| `block` | `string` | ❌ | Block / zone |
| `row` | `string` | ❌ | Row |
| `tier` | `string` | ❌ | Tier / level |
| `spotCode` | `string` | ❌ | Spot or slot code |
| `previousLocation` | `string` | ❌ | Previous location before the move |
| `operator` | `string` | ❌ | Operator name or ID |
| `equipmentId` | `string` | ❌ | Equipment used (reach stacker, hostler, etc.) |
| `remarks` | `string` | ❌ | Additional notes |

---

## Current Location Record (for location snapshot API)

Used by `GET /locations` to return the latest known position per container.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `containerNumber` | `string` | ✅ | Container number |
| `currentLocation` | `string` | ✅ | Latest location in the yard |
| `yardName` | `string` | ❌ | Yard or facility name |
| `block` | `string` | ❌ | Block / zone |
| `row` | `string` | ❌ | Row |
| `tier` | `string` | ❌ | Tier / level |
| `spotCode` | `string` | ❌ | Spot or slot code |
| `lastUpdated` | `string` (ISO 8601) | ✅ | When the location was last updated |
| `movementReferenceNo` | `string` | ❌ | Reference of the movement that produced this location |

---

## 1. Pull — CRTS fetches data from Container Management

Container Management exposes REST API endpoints for CRTS to call.

### Authentication

```http
Authorization: Bearer {YARD_API_KEY}
```

### 1.1 Movement history

```http
GET {YARD_API_URL}/movements?containerNumber=MSCU1234566
Accept: application/json
Authorization: Bearer {YARD_API_KEY}
```

| Query | Required | Description |
| --- | --- | --- |
| `containerNumber` | ❌ | Filter by container — omit to return all sync-ready records |
| `dateFrom` | ❌ | Filter from date (ISO 8601) |
| `dateTo` | ❌ | Filter to date (ISO 8601) |

### Response

Supports a plain array or a payload wrapped in `data`:

```json
{
  "success": true,
  "data": [
    {
      "movementReferenceNo": "YRD-2026-0001",
      "containerNumber": "MSCU1234566",
      "eventDate": "2026-07-01T08:15:00+07:00",
      "currentLocation": "Yard A / Block 1 / Row 4 / Tier 2",
      "yardName": "Yard A",
      "block": "1",
      "row": "4",
      "tier": "2",
      "spotCode": "A-1-4-2",
      "previousLocation": "Yard A / Block 1 / Row 1 / Tier 1",
      "operator": "Hostler Team 1",
      "equipmentId": "RS-07",
      "remarks": null
    },
    {
      "movementReferenceNo": "YRD-2026-0005",
      "containerNumber": "MSCU1234566",
      "eventDate": "2026-07-01T14:30:00+07:00",
      "currentLocation": "Yard A / Block 3 / Row 2 / Tier 1",
      "yardName": "Yard A",
      "block": "3",
      "row": "2",
      "tier": "1",
      "spotCode": "A-3-2-1",
      "previousLocation": "Yard A / Block 1 / Row 4 / Tier 2",
      "operator": "Hostler Team 2",
      "equipmentId": "RS-03",
      "remarks": "Stack reconfiguration"
    }
  ]
}
```

### 1.2 Current locations (recommended)

```http
GET {YARD_API_URL}/locations?containerNumber=MSCU1234566
Accept: application/json
Authorization: Bearer {YARD_API_KEY}
```

| Query | Required | Description |
| --- | --- | --- |
| `containerNumber` | ❌ | Filter by container — omit to return latest locations for all containers in the yard |

### Response

```json
{
  "success": true,
  "data": [
    {
      "containerNumber": "MSCU1234566",
      "currentLocation": "Yard A / Block 3 / Row 2 / Tier 1",
      "yardName": "Yard A",
      "block": "3",
      "row": "2",
      "tier": "1",
      "spotCode": "A-3-2-1",
      "lastUpdated": "2026-07-01T14:30:00+07:00",
      "movementReferenceNo": "YRD-2026-0005"
    }
  ]
}
```

---

## 2. Push — Container Management sends data to CRTS

Container Management POSTs to CRTS when a container is relocated within the yard.

**Endpoint:** `POST {CRTS_BASE_URL}/api/integrations/yard/records`

> **Status:** Planned on the CRTS side — uses the same Yard Movement Record payload above.

### Authentication

```http
Authorization: Bearer {CRTS_INTEGRATION_API_KEY}
X-Idempotency-Key: {movementReferenceNo}
```

| Header | Description |
| --- | --- |
| `Authorization` | API key issued by CRTS for Container Management |
| `X-Idempotency-Key` | Recommended: use `movementReferenceNo` to prevent duplicate submissions (optional) |

| HTTP Status | Meaning |
| --- | --- |
| `401` | Invalid API key |
| `503` | CRTS integration key is not configured |

### Request

```http
POST /api/integrations/yard/records
Content-Type: application/json
Authorization: Bearer {CRTS_INTEGRATION_API_KEY}
X-Idempotency-Key: YRD-2026-0100
```

**Single record**

```json
{
  "movementReferenceNo": "YRD-2026-0100",
  "containerNumber": "MSCU1234566",
  "eventDate": "2026-07-01T16:00:00+07:00",
  "currentLocation": "Yard B / Block 2 / Row 1 / Tier 1",
  "yardName": "Yard B",
  "block": "2",
  "row": "1",
  "tier": "1",
  "spotCode": "B-2-1-1",
  "previousLocation": "Yard A / Block 3 / Row 2 / Tier 1",
  "operator": "Hostler Team 3",
  "equipmentId": "RS-01"
}
```

**Batch (optional, max 100 records)**

```json
{
  "records": [
    {
      "movementReferenceNo": "YRD-2026-0100",
      "containerNumber": "MSCU1234566",
      "eventDate": "2026-07-01T16:00:00+07:00",
      "currentLocation": "Yard B / Block 2 / Row 1 / Tier 1"
    },
    {
      "movementReferenceNo": "YRD-2026-0101",
      "containerNumber": "HLCU6543210",
      "eventDate": "2026-07-01T16:05:00+07:00",
      "currentLocation": "Yard A / Block 5 / Row 3 / Tier 2"
    }
  ]
}
```

### Response — Single record

**Success — `201 Created`**

```json
{
  "success": true,
  "message": "Yard movement record created",
  "data": {
    "movementReferenceNo": "YRD-2026-0100",
    "containerNumber": "MSCU1234566",
    "status": "created"
  }
}
```

**Skipped — `200 OK`**

```json
{
  "success": true,
  "message": "Yard movement record skipped",
  "data": {
    "movementReferenceNo": "YRD-2026-0100",
    "containerNumber": "MSCU1234566",
    "status": "skipped",
    "reason": "already_synced"
  }
}
```

| `reason` | Meaning |
| --- | --- |
| `already_synced` | `movementReferenceNo` already exists in CRTS |
| `container_not_found` | `containerNumber` is not registered in CRTS |

### Response — Batch

**`200 OK`**

```json
{
  "success": true,
  "message": "Yard movement records processed",
  "data": {
    "total": 2,
    "created": 1,
    "skipped": 1,
    "failed": 0,
    "items": [
      {
        "movementReferenceNo": "YRD-2026-0100",
        "containerNumber": "MSCU1234566",
        "status": "created"
      },
      {
        "movementReferenceNo": "YRD-2026-0101",
        "containerNumber": "HLCU6543210",
        "status": "skipped",
        "reason": "already_synced"
      }
    ]
  }
}
```

### Validation Error — `422 Unprocessable Entity`

```json
{
  "success": false,
  "message": "Validation Failed",
  "errors": [
    {
      "field": "currentLocation",
      "message": "Required"
    }
  ]
}
```
