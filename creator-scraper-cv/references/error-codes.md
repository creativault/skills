# Error Codes

## Error Code Table

| Code | HTTP | Description | Action |
|------|------|-------------|--------|
| 40001 | 400 | Invalid parameters | Check JSON format, field names, value ranges |
| 40101 | 401 | Invalid API Key | Verify `CV_API_KEY` environment variable |
| 40102 | 401 | API Key expired | Contact admin to renew or regenerate |
| 40103 | 401 | API Key revoked | Contact admin |
| 40104 | 401 | Missing X-User-Identity | Verify `CV_USER_IDENTITY` environment variable |
| 40201 | 402 | Insufficient credits | Top up or upgrade plan |
| 40301 | 403 | No permission for endpoint | Check API Key scopes |
| 42901 | 429 | Rate limit exceeded | Script auto-retries; wait for Retry-After header |
| 42902 | 402 | Daily quota exhausted | Wait until UTC 00:00 reset or upgrade plan |
| 50001 | 500 | Server error | Record request_id, contact support |

## Export-Specific Errors

| Scenario | HTTP | Description |
|----------|------|-------------|
| Unsupported format (e.g., `feishu_doc`) | 400 | Format not yet supported |
| Task not found or not owned by tenant | 404 | Task not found |
| Task has no data to export | 404 | No data available for export |
| OSS upload / DB insert / signing failed | 500 | Export failed |

## Video Script Audit Errors

| code | HTTP | Description | Action |
|------|------|-------------|--------|
| 40001 | 200 | Audit task not found (invalid `task_id`) | Verify the task UUID; ensure it was submitted by the same tenant |
| 40002 | 200 | Audit task not completed yet (`status ≠ completed`) | Continue polling via `/tasks/status`; do not retry `result` immediately |
| 40003 | 200 | Audit result missing (cleaned up) | Resubmit the video; old task results are not recoverable |

## Media Upload Errors

| code | HTTP | Description | Action |
|------|------|-------------|--------|
| 40001 | 200 | Unsupported file format or file too large | Check extension (mp4/mov/avi/mkv/webm) and size (≤ 500MB) |

> 40002 is a business state, not a hard failure. Treat it as "keep polling" rather than triggering retry/backoff.
> Submit-time `40201` (insufficient credits) follows the global rule — only this code confirms a credits shortage.

## Troubleshooting

### Environment variables not set

```
Error: CV_API_KEY environment variable is not set
```

**Fix**: Set environment variables and restart terminal/IDE.

### API Key format

Valid format: `cv_live_` prefix + random string, e.g., `cv_live_Y8nil_BsKAbITdqj...`

### Rate limiting

- Default limit: 60 requests/minute (per tenant)
- Script auto-retries up to 3 times on 429
- `Retry-After` response header indicates wait time in seconds

### Daily quota

- Resets at UTC 00:00 daily
- `meta.quota_remaining` shows remaining daily API request count, not credits
- `-1` means unlimited
- Do not display a credits warning based on `quota_remaining`

### Insufficient credits

- Only error code `40201` confirms insufficient credits
- `meta.credits_remaining` is the actual OpenAPI credits balance when present
- A successful response must never be converted into an insufficient-credits warning

### Collection task timeout

- Collection tasks are async, typically 5~30 minutes
- Recommended poll interval: 60 seconds
- Status `timeout` means the task timed out; try resubmitting

### Permission denied

API Key `scopes` field controls endpoint access:
- `["*"]` — full access
- `["collection:submit"]` — link/username collection only
- `["collection:keyword-submit"]` — keyword collection only
- `["collection:export"]` — export only
- `["file:download"]` — file download only
