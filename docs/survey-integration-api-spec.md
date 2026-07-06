# Container Survey System — API Integration Specification

**Version:** 1.2  
**Last updated:** 2026-07-01

เอกสารสำหรับทีม Container Survey System — กำหนดข้อมูลที่ส่ง/รับ และ Authentication

---

## Survey Record (ใช้ร่วมกันทั้ง 2 เส้น)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `surveyReferenceNo` | `string` | ✅ | หมายเลขอ้างอิงผลตรวจ — **ต้องไม่ซ้ำ** (ตู้เดียวกัน survey หลายครั้งได้ ถ้า reference ต่างกัน) |
| `containerNumber` | `string` | ✅ | หมายเลขตู้ เช่น `MSCU1234566` |
| `surveyDate` | `string` (ISO 8601) | ✅ | วันที่และเวลาตรวจ เช่น `2026-06-15T10:30:00+07:00` |
| `result` | `string` | ✅ | ผลตรวจ: `Pass`, `Conditional Pass`, `Fail` |
| `inspector` | `string` | ❌ | ชื่อหรือรหัสผู้ตรวจ |
| `damageSummary` | `string` | ❌ | สรุปความเสียหาย |
| `reportUrl` | `string` (URL) | ❌ | ลิงก์รายงาน PDF |

---

## 1. Pull — CRTS ดึงข้อมูลจาก Survey

Survey System เปิด API ให้ CRTS เรียก GET

### Authentication

```http
Authorization: Bearer {SURVEY_API_KEY}
```

### Request

```http
GET {SURVEY_API_URL}?containerNumber=MSCU1234566
Accept: application/json
Authorization: Bearer {SURVEY_API_KEY}
```

| Query | Required | Description |
| --- | --- | --- |
| `containerNumber` | ❌ | กรองตามตู้ — ไม่ส่ง = คืนทุก record |

### Response

รองรับ array โดยตรง หรือ wrapped ใน `data`:

```json
{
  "success": true,
  "data": [
    {
      "surveyReferenceNo": "SRV-2026-0001",
      "containerNumber": "MSCU1234566",
      "surveyDate": "2026-06-01T14:00:00+07:00",
      "inspector": "Somchai V.",
      "result": "Pass",
      "damageSummary": "Minor door seal wear",
      "reportUrl": "https://survey.example.com/reports/SRV-2026-0001.pdf"
    },
    {
      "surveyReferenceNo": "SRV-2026-0003",
      "containerNumber": "MSCU1234566",
      "surveyDate": "2026-06-28T16:45:00+07:00",
      "inspector": "Khamla P.",
      "result": "Pass",
      "damageSummary": null,
      "reportUrl": null
    }
  ]
}
```

---

## 2. Push — Survey ส่งข้อมูลมา CRTS *(Phase 2 — ยังไม่เปิดใช้งาน)*

> **Phase 1 ใช้แค่ Pull** (`POST /api/survey/sync` + Survey เปิด GET API)  
> Endpoint ด้านล่างจะเปิดใช้ใน Phase 2 — ปัจจุบัน `POST /api/integrations/survey/records` คืน `503`.

Survey System POST มายัง CRTS เมื่อมีผลตรวจใหม่

**Endpoint:** `POST {CRTS_BASE_URL}/api/integrations/survey/records`

### Authentication

```http
Authorization: Bearer {CRTS_INTEGRATION_API_KEY}
X-Idempotency-Key: {surveyReferenceNo}
```

| Header | Description |
| --- | --- |
| `Authorization` | API Key ที่ CRTS ตั้งค่าใน `CRTS_INTEGRATION_API_KEY` |
| `X-Idempotency-Key` | แนะนำใช้ค่า `surveyReferenceNo` ป้องกันส่งซ้ำ (optional) |

| HTTP Status | ความหมาย |
| --- | --- |
| `401` | API Key ไม่ถูกต้อง |
| `503` | CRTS ยังไม่ได้ตั้งค่า `CRTS_INTEGRATION_API_KEY` |

### Request

```http
POST /api/integrations/survey/records
Content-Type: application/json
Authorization: Bearer {CRTS_INTEGRATION_API_KEY}
X-Idempotency-Key: SRV-2026-0100
```

**Single record**

```json
{
  "surveyReferenceNo": "SRV-2026-0100",
  "containerNumber": "MSCU1234566",
  "surveyDate": "2026-07-01T08:00:00+07:00",
  "inspector": "Vieng X.",
  "result": "Pass",
  "damageSummary": "Surface rust on door hinge",
  "reportUrl": "https://survey.example.com/reports/SRV-2026-0100.pdf"
}
```

**Batch (optional, สูงสุด 100 records)**

```json
{
  "records": [
    {
      "surveyReferenceNo": "SRV-2026-0100",
      "containerNumber": "MSCU1234566",
      "surveyDate": "2026-07-01T08:00:00+07:00",
      "result": "Pass"
    },
    {
      "surveyReferenceNo": "SRV-2026-0101",
      "containerNumber": "HLCU6543210",
      "surveyDate": "2026-07-01T09:30:00+07:00",
      "result": "Fail",
      "damageSummary": "Corner post crack"
    }
  ]
}
```

### Response — Single record

**สำเร็จ — `201 Created`**

```json
{
  "success": true,
  "message": "Survey record created",
  "data": {
    "surveyReferenceNo": "SRV-2026-0100",
    "containerNumber": "MSCU1234566",
    "status": "created"
  }
}
```

**ข้าม — `200 OK`**

```json
{
  "success": true,
  "message": "Survey record skipped",
  "data": {
    "surveyReferenceNo": "SRV-2026-0100",
    "containerNumber": "MSCU1234566",
    "status": "skipped",
    "reason": "already_synced"
  }
}
```

| `reason` | ความหมาย |
| --- | --- |
| `already_synced` | `surveyReferenceNo` มีในระบบแล้ว |
| `container_not_found` | ไม่พบ `containerNumber` ใน Registry |

### Response — Batch

**`200 OK`**

```json
{
  "success": true,
  "message": "Survey records processed",
  "data": {
    "total": 2,
    "created": 1,
    "skipped": 1,
    "failed": 0,
    "items": [
      {
        "surveyReferenceNo": "SRV-2026-0100",
        "containerNumber": "MSCU1234566",
        "status": "created"
      },
      {
        "surveyReferenceNo": "SRV-2026-0101",
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
      "field": "surveyReferenceNo",
      "message": "Required"
    }
  ]
}
```
