# Smart Gate System — API Integration Specification

**Version:** 1.0  
**Last updated:** 2026-07-01

Specification for the **Smart Gate System** team — payload fields and authentication.

Scope: **truck–container gate entry and exit** events at the facility gate.

---

## Gate Event Record (shared by Pull and Push)

Each record represents **one gate passage** (container entering or leaving the facility).

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `gateReferenceNo` | `string` | ✅ | Unique event reference — **must not be reused** (same container may have many records with different references) |
| `containerNumber` | `string` | ✅ | Container number, e.g. `MSCU1234566` |
| `eventType` | `string` | ✅ | `GateIn` or `GateOut` |
| `eventDate` | `string` (ISO 8601) | ✅ | Date and time of gate passage, e.g. `2026-07-01T09:15:00+07:00` |
| `location` | `string` | ✅ | Gate or facility description, e.g. `Main Gate 1 / Yard A` |
| `vehiclePlateNo` | `string` | ✅ | Truck or trailer license plate |
| `gateName` | `string` | ❌ | Gate name or code |
| `laneNo` | `string` | ❌ | Gate lane number |
| `facilityName` | `string` | ❌ | Facility or terminal name |
| `driverName` | `string` | ❌ | Driver name |
| `driverId` | `string` | ❌ | Driver ID or license number |
| `transportCompany` | `string` | ❌ | Haulier or transport company |
| `sealNo` | `string` | ❌ | Container seal number |
| `bookingNo` | `string` | ❌ | Booking or job reference |
| `remarks` | `string` | ❌ | Additional notes |

### `eventType` values

| Value | Meaning |
| --- | --- |
| `GateIn` | Container enters the facility |
| `GateOut` | Container exits the facility |

---

## 1. Pull — CRTS fetches data from Smart Gate

Smart Gate exposes REST API endpoints for CRTS to call.

### Authentication

```http
Authorization: Bearer {SMART_GATE_API_KEY}
```

### 1.1 Gate event history

```http
GET {SMART_GATE_API_URL}/events?containerNumber=MSCU1234566
Accept: application/json
Authorization: Bearer {SMART_GATE_API_KEY}
```

| Query | Required | Description |
| --- | --- | --- |
| `containerNumber` | ❌ | Filter by container — omit to return all sync-ready records |
| `eventType` | ❌ | Filter by `GateIn` or `GateOut` |
| `vehiclePlateNo` | ❌ | Filter by truck plate |
| `dateFrom` | ❌ | Filter from date (ISO 8601) |
| `dateTo` | ❌ | Filter to date (ISO 8601) |

### Response

Supports a plain array or a payload wrapped in `data`:

```json
{
  "success": true,
  "data": [
    {
      "gateReferenceNo": "GTE-2026-0001",
      "containerNumber": "MSCU1234566",
      "eventType": "GateIn",
      "eventDate": "2026-07-01T08:00:00+07:00",
      "location": "Main Gate 1 / Yard A",
      "vehiclePlateNo": "LA-1234",
      "gateName": "Main Gate 1",
      "laneNo": "Lane 2",
      "facilityName": "Vientiane Terminal",
      "driverName": "Somchai V.",
      "driverId": "DRV-00123",
      "transportCompany": "Lao Freight Co.",
      "sealNo": "SL-987654",
      "bookingNo": "BK-2026-0042",
      "remarks": null
    },
    {
      "gateReferenceNo": "GTE-2026-0015",
      "containerNumber": "MSCU1234566",
      "eventType": "GateOut",
      "eventDate": "2026-07-03T17:30:00+07:00",
      "location": "Main Gate 1 / Exit",
      "vehiclePlateNo": "LA-5678",
      "gateName": "Main Gate 1",
      "laneNo": "Lane 1",
      "facilityName": "Vientiane Terminal",
      "driverName": "Bounmy K.",
      "driverId": "DRV-00456",
      "transportCompany": "Mekong Logistics",
      "sealNo": "SL-987654",
      "bookingNo": null,
      "remarks": "Loaded outbound"
    }
  ]
}
```

### 1.2 Latest gate status per container (recommended)

```http
GET {SMART_GATE_API_URL}/status?containerNumber=MSCU1234566
Accept: application/json
Authorization: Bearer {SMART_GATE_API_KEY}
```

| Query | Required | Description |
| --- | --- | --- |
| `containerNumber` | ❌ | Filter by container — omit to return latest status for all containers |

### Response

```json
{
  "success": true,
  "data": [
    {
      "containerNumber": "MSCU1234566",
      "lastEventType": "GateIn",
      "lastEventDate": "2026-07-01T08:00:00+07:00",
      "location": "Main Gate 1 / Yard A",
      "vehiclePlateNo": "LA-1234",
      "gateReferenceNo": "GTE-2026-0001",
      "onSite": true
    }
  ]
}
```

| Field | Description |
| --- | --- |
| `lastEventType` | Latest gate event: `GateIn` or `GateOut` |
| `lastEventDate` | Date and time of the latest gate event |
| `onSite` | `true` if the container is inside the facility (last event was `GateIn`) |

---

## 2. Push — Smart Gate sends data to CRTS

Smart Gate POSTs to CRTS when a container passes through the gate.

**Endpoint:** `POST {CRTS_BASE_URL}/api/integrations/gate/records`

> **Status:** Enabled on CRTS — Smart Gate POSTs gate events when a container number is present.

### Authentication

```http
Authorization: Bearer {CRTS_INTEGRATION_API_KEY}
X-Idempotency-Key: {gateReferenceNo}
```

| Header | Description |
| --- | --- |
| `Authorization` | API key issued by CRTS for Smart Gate |
| `X-Idempotency-Key` | Recommended: use `gateReferenceNo` to prevent duplicate submissions (optional) |

| HTTP Status | Meaning |
| --- | --- |
| `401` | Invalid API key |
| `503` | CRTS integration key is not configured |

### Request

```http
POST /api/integrations/gate/records
Content-Type: application/json
Authorization: Bearer {CRTS_INTEGRATION_API_KEY}
X-Idempotency-Key: GTE-2026-0100
```

**Single record**

```json
{
  "gateReferenceNo": "GTE-2026-0100",
  "containerNumber": "MSCU1234566",
  "eventType": "GateIn",
  "eventDate": "2026-07-01T09:15:00+07:00",
  "location": "Main Gate 1 / Yard A",
  "vehiclePlateNo": "LA-1234",
  "gateName": "Main Gate 1",
  "laneNo": "Lane 2",
  "facilityName": "Vientiane Terminal",
  "driverName": "Somchai V.",
  "transportCompany": "Lao Freight Co.",
  "sealNo": "SL-987654",
  "remarks": null
}
```

**Batch (optional, max 100 records)**

```json
{
  "records": [
    {
      "gateReferenceNo": "GTE-2026-0100",
      "containerNumber": "MSCU1234566",
      "eventType": "GateIn",
      "eventDate": "2026-07-01T09:15:00+07:00",
      "location": "Main Gate 1 / Yard A",
      "vehiclePlateNo": "LA-1234"
    },
    {
      "gateReferenceNo": "GTE-2026-0101",
      "containerNumber": "HLCU6543210",
      "eventType": "GateOut",
      "eventDate": "2026-07-01T10:00:00+07:00",
      "location": "Main Gate 2 / Exit",
      "vehiclePlateNo": "LA-9012"
    }
  ]
}
```

### Response — Single record

**Success — `201 Created`**

```json
{
  "success": true,
  "message": "Gate event record created",
  "data": {
    "gateReferenceNo": "GTE-2026-0100",
    "containerNumber": "MSCU1234566",
    "status": "created"
  }
}
```

**Skipped — `200 OK`**

```json
{
  "success": true,
  "message": "Gate event record skipped",
  "data": {
    "gateReferenceNo": "GTE-2026-0100",
    "containerNumber": "MSCU1234566",
    "status": "skipped",
    "reason": "already_synced"
  }
}
```

| `reason` | Meaning |
| --- | --- |
| `already_synced` | `gateReferenceNo` already exists in CRTS |
| `container_not_found` | `containerNumber` is not registered in CRTS |

### Response — Batch

**`200 OK`**

```json
{
  "success": true,
  "message": "Gate event records processed",
  "data": {
    "total": 2,
    "created": 1,
    "skipped": 1,
    "failed": 0,
    "items": [
      {
        "gateReferenceNo": "GTE-2026-0100",
        "containerNumber": "MSCU1234566",
        "status": "created"
      },
      {
        "gateReferenceNo": "GTE-2026-0101",
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
      "field": "vehiclePlateNo",
      "message": "Required"
    }
  ]
}
```
