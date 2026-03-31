---
name: creator-scraper-cv
description: |
  Creativault creator data collection skill. Search and collect creator/influencer data
  from TikTok, YouTube, and Instagram. Supports multi-dimensional search, batch collection
  by links/usernames/keywords, task tracking, and data export (xlsx/csv/html).
  Use when: creator search, influencer scraping, KOL search, KOL analytics, social media
  data extraction, TikTok scraper, YouTube scraper, Instagram scraper, influencer discovery,
  达人采集, KOL 搜索, 网红数据, 达人分析, 达人搜索, 社交媒体数据.
compatibility: Node.js 20.6+
metadata:
  author: creativault
  version: "1.1.0"
---

# Creativault Creator Data Collection

## Prerequisites

Set the following environment variables:

- `CV_API_KEY` — Creativault Open API Key (obtain from admin dashboard)
- `CV_USER_IDENTITY` — Operator email address
- `CV_API_BASE_URL` (optional) — API base URL, defaults to `https://dev01-creativault-business.tec-develop.cn`

**Linux / macOS**:

```bash
export CV_API_KEY=cv_live_your_key_here
export CV_USER_IDENTITY=your_email@example.com
```

**Windows PowerShell**:

```powershell
$env:CV_API_KEY = "cv_live_your_key_here"
$env:CV_USER_IDENTITY = "your_email@example.com"
```

## Capabilities

| Capability | Script | Mode |
|------------|--------|------|
| Search creators | `scripts/search_creators.mjs` | Sync, real-time |
| Submit collection task | `scripts/submit_collection_task.mjs` | Async, returns task_id |
| Submit keyword collection | `scripts/submit_keyword_task.mjs` | Async, returns task_id |
| Check task status | `scripts/get_task_status.mjs` | Sync, single query |
| Poll task status | `scripts/poll_task_status.mjs` | Auto-poll every 60s |
| Get collection data | `scripts/get_task_data.mjs` | Sync, paginated |
| Export task data (server) | `scripts/export_task_data.mjs` | Returns file download URL |
| Export to local CSV | `scripts/export_to_csv.mjs` | Pipe input, incremental append |
| Get file download URL | `scripts/get_download_url.mjs` | Sync |

All scripts accept a JSON string as command-line argument. Results are output as JSON to stdout.

**Language**: Always respond to the user in the same language they use. If the user writes in Chinese, respond in Chinese. If in English, respond in English.

## Choosing the Right Approach

Before executing, determine the best approach based on user intent:

| User Intent | Approach | Response Time |
|-------------|----------|---------------|
| "Search/find creators" with filters (keyword, country, followers) | `search_creators.mjs` | Instant (~1s) |
| "Collect/scrape data" for specific creators (links or usernames) | `submit_collection_task.mjs` → poll → get data | 5~30 minutes |
| "Find creators by keyword" and collect detailed data | `submit_keyword_task.mjs` → poll → get data | 5~30 minutes |

**Decision rules:**
- If the user gives filter conditions (keyword, country, follower count) → use **search** first. It returns results instantly.
- If the user gives specific profile links or usernames → use **collection** (async).
- If search results satisfy the user's needs → no need to submit a collection task.
- Only use collection when the user explicitly needs detailed/enriched data for specific creators.
- **After any collection task completes, ALWAYS call `export_task_data.mjs` to generate a downloadable file (default xlsx) and present the download link to the user. Do NOT just call `get_task_data.mjs` and show raw JSON.**

## Output Formatting

When presenting search or collection results to the user, format them as a readable table:

```
| # | Nickname | Username | Followers | Avg Views | Engagement | Country | Profile |
|---|----------|----------|-----------|-----------|------------|---------|---------|
| 1 | Creator1 | @user1   | 150,000   | 45,000    | 6.5%       | US      | [link]  |
```

**Formatting rules:**
- Format large numbers with commas (e.g., 150,000)
- Show engagement_rate as percentage (e.g., 0.065 → 6.5%)
- Make profile_url a clickable link
- Show top 10 results by default, ask user if they want more
- After showing results, proactively ask: "Would you like to export these results to CSV/Excel?"

## Quota Awareness

Every API response includes `meta.quota_remaining`. Monitor this value:
- If `quota_remaining` < 50: warn the user that quota is running low
- If `quota_remaining` < 10: strongly recommend the user to conserve quota
- If `quota_remaining` = 0 or error 42902: inform the user that daily quota is exhausted (resets at UTC 00:00)

## Workflows

### Workflow 1: Search Creators (instant)

```bash
node {baseDir}/scripts/search_creators.mjs '{"platform":"tiktok","keyword":"beauty","country_code":"US","followers_cnt_gte":10000,"size":20}'
```

### Workflow 2: Search + Export (instant)

```bash
# Search and export to local CSV in one pipeline
node {baseDir}/scripts/search_creators.mjs '{"platform":"tiktok","keyword":"beauty","country_code":"US","size":50}' | node {baseDir}/scripts/export_to_csv.mjs '{"output":"creators.csv"}'

# Append page 2 to the same file
node {baseDir}/scripts/search_creators.mjs '{"platform":"tiktok","keyword":"beauty","country_code":"US","size":50,"page":2}' | node {baseDir}/scripts/export_to_csv.mjs '{"output":"creators.csv"}'
```

### Workflow 3: Batch Collection (async, 5~30 min)

> **Important**: Collection tasks are async and take 5~30 minutes. You MUST poll for completion before fetching data.

**Step 1** — Submit task:

```bash
node {baseDir}/scripts/submit_collection_task.mjs '{"task_type":"LINK_BATCH","platform":"tiktok","values":["https://www.tiktok.com/@creator1","https://www.tiktok.com/@creator2"],"task_name":"Q1 collection"}'
```

**Step 2** — Poll until completed (auto-polls every 60s):

```bash
node {baseDir}/scripts/poll_task_status.mjs '{"task_id":"task_xxx"}'
```

After submitting, inform the user: "Collection task submitted. This typically takes 5~30 minutes. I'll monitor the progress for you."

**Step 3** — After task is completed, **ALWAYS export the data as a file first**, then show the download link to the user. Only use `get_task_data.mjs` if the user explicitly asks for raw JSON data.

```bash
# PREFERRED: Export as file and give user the download link
node {baseDir}/scripts/export_task_data.mjs '{"task_id":"task_xxx","format":"xlsx"}'

# Only if user explicitly requests raw JSON:
node {baseDir}/scripts/get_task_data.mjs '{"task_id":"task_xxx","page":1,"size":50}'
```

> **Rule**: When a collection task completes, the default action is to call `export_task_data.mjs` with `format:"xlsx"` and present the `file_url` download link to the user. Do NOT just call `get_task_data.mjs` and dump raw JSON — users want a downloadable file.

### Workflow 4: Keyword Collection (async)

```bash
# Step 1: Submit
node {baseDir}/scripts/submit_keyword_task.mjs '{"platform":"tiktok","keywords":["beauty tips","skincare routine"]}'

# Step 2: Poll
node {baseDir}/scripts/poll_task_status.mjs '{"task_id":"task_xxx"}'

# Step 3: ALWAYS export as file after completion
node {baseDir}/scripts/export_task_data.mjs '{"task_id":"task_xxx","format":"xlsx"}'
```

## Script Parameters

### search_creators.mjs

`platform` is required. All other parameters are optional filters.

| Parameter | Type | Description |
|-----------|------|-------------|
| `platform` | string | **Required**. `tiktok` / `youtube` / `instagram` |
| `keyword` | string | Search keyword |
| `country_code` | string | Country code, comma-separated (e.g., `US,CA`) |
| `gender` | string | Gender filter |
| `has_email` | boolean | Has email contact |
| `followers_cnt_gte` | integer | Followers ≥ |
| `followers_cnt_lte` | integer | Followers ≤ |
| `page` | integer | Page number, default 1 |
| `size` | integer | Page size, default 50, max 100 |
| `sort_field` | string | Sort field (e.g., `followers_cnt`) |
| `sort_order` | string | `asc` / `desc` (default `desc`) |

Platform-specific parameters: see [Platform Parameters Reference](references/platform-params.md).

### submit_collection_task.mjs

| Parameter | Type | Description |
|-----------|------|-------------|
| `task_type` | string | **Required**. `LINK_BATCH` (links) / `FILE_UPLOAD` (usernames) |
| `platform` | string | **Required**. `tiktok` / `youtube` / `instagram` |
| `values` | string[] | **Required**. Links or usernames, max 500 |
| `task_name` | string | Task name |
| `webhook_url` | string | Completion callback URL (HTTPS) |

### submit_keyword_task.mjs

| Parameter | Type | Description |
|-----------|------|-------------|
| `platform` | string | **Required**. `tiktok` / `youtube` / `instagram` |
| `keywords` | string[] | **Required**. Keyword list, max 10 |
| `task_name` | string | Task name |
| `webhook_url` | string | Completion callback URL (HTTPS) |

### poll_task_status.mjs

| Parameter | Type | Description |
|-----------|------|-------------|
| `task_id` | string | **Required**. Task ID |
| `interval` | integer | Poll interval in seconds, default 60 |
| `max_attempts` | integer | Max poll attempts, default 45 (~45 min) |

### get_task_status.mjs

| Parameter | Type | Description |
|-----------|------|-------------|
| `task_id` | string | **Required**. Task ID |

### get_task_data.mjs

| Parameter | Type | Description |
|-----------|------|-------------|
| `task_id` | string | **Required**. Task ID |
| `page` | integer | Page number, default 1 |
| `size` | integer | Page size, default 20, max 100 |

### export_task_data.mjs

Exports task data to file (server-side), uploads to OSS, returns download URL. Repeated calls with same task_id + format return cached file.

| Parameter | Type | Description |
|-----------|------|-------------|
| `task_id` | string | **Required**. Task ID (must be completed) |
| `format` | string | **Required**. `xlsx` / `csv` / `html` |

### export_to_csv.mjs

Pipe JSON from search or collection results to export as local CSV file. Supports incremental append.

| Parameter | Type | Description |
|-----------|------|-------------|
| `output` | string | Output file path, default `output.csv` |
| `mode` | string | `append` (default) / `overwrite` |

### get_download_url.mjs

| Parameter | Type | Description |
|-----------|------|-------------|
| `file_id` | string | File ID (either file_id or file_name required) |
| `file_name` | string | File name (either file_id or file_name required) |

## Error Handling

| Code | HTTP | Description | Action |
|------|------|-------------|--------|
| 40001 | 400 | Invalid parameters | Check parameter format and values |
| 40101 | 401 | Invalid API Key | Check CV_API_KEY env variable |
| 40102 | 401 | API Key expired | Contact admin to renew |
| 40103 | 401 | API Key revoked | Contact admin |
| 40104 | 401 | Missing user identity | Check CV_USER_IDENTITY env variable |
| 40201 | 402 | Insufficient credits | Top up or upgrade plan |
| 40301 | 403 | No permission for this endpoint | Check API Key scopes |
| 42901 | 429 | Rate limit exceeded | Auto-retry after Retry-After seconds |
| 42902 | 402 | Daily quota exhausted | Wait until UTC 00:00 or upgrade plan |
| 50001 | 500 | Server error | Report request_id to support |

## References

- [API Reference](references/api-reference.md) — Full request/response field documentation
- [Platform Parameters](references/platform-params.md) — TikTok/YouTube/Instagram specific filters
- [Error Codes](references/error-codes.md) — Complete error code list and troubleshooting

## Changelog

### v1.1.0
- Added server-side export (xlsx/csv/html) via `export_task_data.mjs`
- Added auto-retry on 429 rate limit in API client
- Added quota awareness guidance
- Added output formatting guidance for agents
- Added smart workflow selection (search vs collection)
- Unified all script logs and SKILL.md to English

### v1.0.0
- Initial release: search, collection, polling, local CSV export
