# CRTS API Reference

Base URL: `/api`  
Authentication: Session cookie (`nuxt-auth-utils`) — all endpoints except login require an active session.

## Response Format

**Success**

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

**Error**

```json
{
  "success": false,
  "message": "Validation Failed",
  "errors": []
}
```

## Roles

| Role | Description |
| --- | --- |
| `Administrator` | Full access including user management and container deletion |
| `RegistryOfficer` | Create/update containers, events, documents, survey sync |
| `SurveyTeam` | Read-only registry access |
| `Management` | Dashboard, reports (with Administrator) |

---

## Authentication

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/auth/login` | Public | Sign in with email/password |
| POST | `/auth/logout` | Session | End session |
| GET | `/auth/me` | Session | Current user profile |

---

## Users (Administrator only)

| Method | Path | Description |
| --- | --- | --- |
| GET | `/users` | List users (paginated) |
| POST | `/users` | Create user |
| PATCH | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |

---

## Containers

**Read access:** Administrator, RegistryOfficer, SurveyTeam, Management  
**Write access:** Administrator, RegistryOfficer

| Method | Path | RBAC | Description |
| --- | --- | --- | --- |
| GET | `/containers` | Read | Paginated list with filters |
| POST | `/containers` | Write | Register container (auto Registration event + QR) |
| GET | `/containers/search?q=` | Read | Quick search (prefix, max 10 results) |
| GET | `/containers/by-qr?code=` | Read | Lookup by QR scan content |
| GET | `/containers/:id` | Read | Single container |
| PUT | `/containers/:id` | Write | Update container fields |
| DELETE | `/containers/:id` | Administrator | Hard delete container |
| PATCH | `/containers/:id/status` | Write | Activate/deactivate (StatusChange event) |
| GET | `/containers/:id/profile` | Read | Aggregated profile (survey, events, docs) |
| GET | `/containers/:id/timeline` | Read | Lifecycle event timeline |
| POST | `/containers/:id/events` | Write | Add manual lifecycle event |

### List query parameters

| Param | Type | Description |
| --- | --- | --- |
| `page` | number | Page number (default 1) |
| `pageSize` | number | Items per page |
| `search` | string | Container number, owner, ISO type, manufacturer, QR |
| `status` | `Active` \| `Inactive` \| `all` | Filter by status |
| `owner` | string | Owner contains |
| `isoType` | string | Exact ISO type |
| `containerCategory` | string | Category filter |
| `containerSize` | string | Size filter |
| `surveyStatus` | `surveyed` \| `not_surveyed` \| `pass` \| `conditional` \| `all` | Survey coverage |
| `registrationDateFrom` | ISO date | Registration range start |
| `registrationDateTo` | ISO date | Registration range end |

---

## Surveys

| Method | Path | RBAC | Description |
| --- | --- | --- | --- |
| GET | `/containers/:id/surveys` | Read | Survey history for container |
| POST | `/survey/sync` | Write | Pull surveys from external Survey API (or mock) |

**Inbound push (Phase 2 — not enabled):**

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/integrations/survey/records` | — | Returns `503` until push integration is enabled |

See [survey-integration-api-spec.md](./survey-integration-api-spec.md) for pull payload and auth details.

**Container Management integration (yard location / relocation):**

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/integrations/yard/records` | Bearer `CRTS_INTEGRATION_API_KEY` | Receive yard movement records (planned) |

External provider API (Container Management → CRTS pull): see [container-management-integration-api-spec.md](./container-management-integration-api-spec.md).

**Smart Gate integration (gate in / gate out):**

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/integrations/gate/records` | Bearer `CRTS_INTEGRATION_API_KEY` | Receive gate event records from Smart Gate (push) |

External provider API (Smart Gate → CRTS pull): see [smart-gate-integration-api-spec.md](./smart-gate-integration-api-spec.md).

**Sync body (optional):**

```json
{
  "containerId": 1,
  "containerNumber": "MSCU1234567"
}
```

---

## Documents

| Method | Path | RBAC | Description |
| --- | --- | --- | --- |
| GET | `/containers/:id/documents` | Read | List documents |
| POST | `/containers/:id/documents` | Write | Upload (multipart) |
| GET | `/containers/:id/documents/:documentId/download` | Read | Download file |
| GET | `/containers/:id/documents/:documentId/preview` | Read | Preview image inline (png, jpg, gif, webp) |
| DELETE | `/containers/:id/documents/:documentId` | Write | Delete document |

**Document types:** Survey Report, Certificate, Photo, Other

---

## Dashboard

| Method | Path | RBAC | Description |
| --- | --- | --- | --- |
| GET | `/dashboard/summary` | Read | KPIs, status breakdown, registration trend |
| GET | `/dashboard/recent-activities` | Read | Latest lifecycle events (default 15) |

**Performance target:** summary + activities combined should respond in under 3 seconds.

---

## Reports

**Access:** Administrator, Management

| Method | Path | Export formats | Description |
| --- | --- | --- | --- |
| GET | `/reports/registry` | JSON, XLSX, PDF | Container registry |
| GET | `/reports/lifecycle` | JSON, XLSX, PDF | Lifecycle events |
| GET | `/reports/survey-coverage` | JSON, XLSX | Survey coverage |
| GET | `/reports/status-summary` | JSON, XLSX, PDF | Status summary |

**Common query parameters:**

| Param | Description |
| --- | --- |
| `format` | `json` (default), `xlsx`, `pdf` |
| `dateFrom` | Report start date |
| `dateTo` | Report end date |
| `status` | Filter by container status (registry report) |

---

## Timeline APIs

| Method | Path | RBAC | Description |
| --- | --- | --- | --- |
| GET | `/containers/:id/timeline` | Read | Container lifecycle timeline (optional filters) |
| POST | `/containers/:id/events` | Write | Record manual lifecycle event |

**Timeline query parameters:** `eventType`, `dateFrom`, `dateTo`

---

## Lifecycle APIs

| Method | Path | RBAC | Description |
| --- | --- | --- | --- |
| GET | `/lifecycle/events` | Read | Paginated lifecycle events across all containers |
| GET | `/lifecycle/summary` | Read | Event counts by type (optional `containerId`) |

**Lifecycle list query parameters:**

| Param | Description |
| --- | --- |
| `page` | Page number (default 1) |
| `pageSize` | Items per page (default 20, max 100) |
| `search` | Container number, description, or actor |
| `eventType` | Filter by event type |
| `containerId` | Filter by container |
| `dateFrom` | Event date range start |
| `dateTo` | Event date range end |

**Event types:** Registration, Survey, Repair, Maintenance, Relocation, GateIn, GateOut, StatusChange

---

## Movement Tracking APIs

| Method | Path | RBAC | Description |
| --- | --- | --- | --- |
| GET | `/movements` | Read | Paginated Gate In/Out and Relocation events |
| GET | `/movements/summary` | Read | Movement counts (optional `containerId`) |
| GET | `/movements/track?q=` | Read | Track container by number — latest + recent movements |
| GET | `/containers/:id/movements` | Read | Movement history for one container |
| POST | `/containers/:id/movements` | Write | Record Gate In, Gate Out, or Relocation |

**Movement list query parameters:**

| Param | Description |
| --- | --- |
| `page` | Page number (default 1) |
| `pageSize` | Items per page (default 20, max 100) |
| `search` | Container number, location/details, or actor |
| `movementType` | `GateIn`, `GateOut`, `Relocation`, or `all` |
| `containerId` | Filter by container |
| `owner` | Filter by container owner |
| `dateFrom` | Movement date range start |
| `dateTo` | Movement date range end |

---

## Survey Inspection APIs

| Method | Path | RBAC | Description |
| --- | --- | --- | --- |
| GET | `/survey/inspections` | Read | Paginated survey inspection records |
| GET | `/survey/inspections/summary` | Read | Pass/conditional/fail summary (optional `containerId`) |
| GET | `/survey/inspections/:id` | Read | Single inspection record (`mock-*` IDs supported) |
| POST | `/survey/sync` | Write | Sync surveys from external system or mock adapter |

When no survey data exists in the database, inspection list endpoints return **mock sample records** with `meta.dataSource: "mock"` and `isMock: true` on each item.

**Inspection list query parameters:** `page`, `pageSize`, `search`, `result` (`pass`/`conditional`/`fail`/`all`), `containerId`, `dateFrom`, `dateTo`

---

## Audit Logging

Critical operations emit structured logs with the `AUDIT` tag:

| Action | Trigger |
| --- | --- |
| `container.create` | POST `/containers` |
| `container.update` | PUT `/containers/:id` |
| `container.delete` | DELETE `/containers/:id` |
| `container.status_change` | PATCH `/containers/:id/status` |
| `container.event.create` | POST `/containers/:id/events` |
| `document.upload` | POST `/containers/:id/documents` |
| `document.delete` | DELETE documents |
| `survey.sync` | POST `/survey/sync` |

Each entry is persisted to `tb_audit_log` and emitted to console with the `AUDIT` tag.

### Audit Logs API (Administrator only)

| Method | Path | Description |
| --- | --- | --- |
| GET | `/audit-logs` | Paginated audit log list |
| GET | `/audit-logs/:id` | Single audit log entry |

**List query parameters:**

| Param | Description |
| --- | --- |
| `page` | Page number (default 1) |
| `pageSize` | Items per page (default 20, max 100) |
| `search` | Search actor, action, or entity ID |
| `action` | Filter by action code |
| `entityType` | Filter by entity type |
| `dateFrom` | Created date range start |
| `dateTo` | Created date range end |

---

## Performance

| Endpoint | Target |
| --- | --- |
| `GET /containers`, `GET /containers/search` | < 2 seconds |
| `GET /dashboard/*` | < 3 seconds |

Slow requests exceeding these thresholds are logged with `[SLOW:search]` or `[SLOW:dashboard]` in the API middleware.

---

## Development Only

| Method | Path | Description |
| --- | --- | --- |
| GET | `/test-infra` | Infrastructure test endpoint (disabled in production) |

Query flags: `?error=true`, `?validate=true`, `?flaky=true`, `?rbac=true`

---

## Environment Variables

See `.env.example` for database, storage, survey API, integration API key, and session configuration.
