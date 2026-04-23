# API Reference

## Protocol

| Item | Description |
|------|-------------|
| Base URL | `https://{host}/openapi/v1/` |
| Protocol | HTTPS |
| Method | All endpoints use **POST** |
| Format | JSON (`Content-Type: application/json`) |
| Auth | `X-API-Key` + `X-User-Identity` headers |
| Encoding | UTF-8 |
| Timestamps | ISO 8601 (e.g., `2026-03-15T10:30:00Z`) |
| Pagination | `page` (starts at 1), `size` (default 50) |

## Response Structure

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "request_id": "req_abc123",
    "page": 1,
    "size": 50,
    "total": 1200,
    "quota_remaining": -1
  }
}
```

`meta.quota_remaining`: remaining daily quota. `-1` means unlimited.
`meta.service_level`: service level used for this search request (`S1`/`S2`/`S3`). Only present in search responses. Default is `S2`.
`meta.credits_consumed`: credits deducted for this request. `0` means no charge.
`meta.total`: total matching records. For search endpoints, only returned when filter conditions > 2 (excluding `page`, `size`, `sort_field`, `sort_order`, `service_level`). Returns `null` when ≤ 2 filters.
`meta.lang`: response translation language (`cn`/`en`). `null` when `lang` param not provided.

## Endpoints

| Endpoint | Path | Description |
|----------|------|-------------|
| Search TikTok creators | `/openapi/v1/creators/tiktok/search` | Multi-dimensional filtering, supports `service_level` (S1/S2/S3) |
| Search YouTube creators | `/openapi/v1/creators/youtube/search` | Multi-dimensional filtering, supports `service_level` (S1/S2/S3) |
| Search Instagram creators | `/openapi/v1/creators/instagram/search` | Multi-dimensional filtering, supports `service_level` (S1/S2/S3) |
| Submit collection task | `/openapi/v1/collection/tasks/submit` | Batch collect by links/usernames |
| Submit keyword collection | `/openapi/v1/collection/tasks/keyword-submit` | Collect by keywords |
| Query task status | `/openapi/v1/collection/tasks/status` | Check collection progress |
| Get task data | `/openapi/v1/collection/tasks/data` | Paginated results |
| Export task data | `/openapi/v1/collection/tasks/export` | Export to xlsx/csv/html file |
| Get file download URL | `/openapi/v1/files/download-url` | Get temporary download URL |
| Find similar creators | `/openapi/v1/creators/lookalike` | Lookalike search by username/URL, auto-resolves platform ID |

## Task Types

| task_type | Description | values content | Max items |
|-----------|-------------|---------------|-----------|
| `LINK_BATCH` | Link collection | Creator profile URLs | 500 |
| `FILE_UPLOAD` | Username collection | Creator usernames | 500 |

## Task Status

| status | Description |
|--------|-------------|
| `processing` | In progress (collecting or importing data) |
| `completed` | Completed |
| `failed` | Failed |
| `timeout` | Timed out |

## Supported Platforms

| Platform | ID | Search | Link Collection | Username Collection | Keyword Collection |
|----------|----|--------|----------------|--------------------|--------------------|
| TikTok | `tiktok` | ✅ | ✅ | ✅ | ✅ |
| YouTube | `youtube` | ✅ | ✅ | ✅ | ✅ |
| Instagram | `instagram` | ✅ | ✅ | ✅ | ✅ |

## Export Formats

| format | Description |
|--------|-------------|
| `xlsx` | Excel file with bold headers, background colors, auto column width |
| `csv` | CSV file, UTF-8 BOM encoding (Excel compatible) |
| `html` | HTML table page, viewable in browser |
| `feishu_doc` | Feishu document (not yet available, returns 400) |

## Export Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `file_id` | string | Unique file identifier (reusable via get_download_url) |
| `file_name` | string | File name |
| `file_url` | string | Authenticated temporary download URL |
| `file_expire_at` | string | URL expiration time (ISO 8601 UTC) |
| `format` | string | Export format |
| `row_count` | integer | Number of data rows |

## Webhook

Pass `webhook_url` when submitting collection tasks for completion notification.

Callback payload:

```json
{
  "event": "collection.completed",
  "task_id": "task_xxx",
  "task_type": "LINK_BATCH",
  "status": "completed",
  "total": 2,
  "completed": 2,
  "failed": 0,
  "timestamp": "2026-03-15T10:45:00Z"
}
```

Signature: `X-Webhook-Signature` header, HMAC-SHA256.
Retry policy: max 3 attempts (10s → 30s → 90s).
