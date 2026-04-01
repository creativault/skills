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
- `CV_API_BASE_URL` (optional) — API base URL, defaults to `http://api.creativault.vip`

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

### Service Level Selection

Users may not know what S1/S2/S3 means. The agent MUST ask the user to confirm the service level before executing a search. Never auto-select silently.

**Service level reference (show to user when asking):**

| 等级 | 名称 | 返回内容 | 积分/条 |
|------|------|----------|---------|
| S1 | 纯名单筛选 | 基础信息（用户名、昵称、头像、粉丝数、主页链接） | 1 |
| S2 | 精准触达 | S1 + 国家、性别、互动率、平均播放、带货类目、邮箱标识、语言 | 3 |
| S3 | 深度画像 | S2 + 受众女性比例、受众国家分布、受众语言分布 | 4 |

**Rules:**
- If user does NOT specify a service level → show the table above and ask: "请选择服务等级：S1（基础名单，1积分/条）、S2（精准触达，3积分/条）、S3（深度画像，4积分/条）？"
- If user explicitly says "S1"/"S2"/"S3" or "深度画像"/"精准触达"/"名单" → use as specified, no need to ask again
- If user has already chosen a level in the current conversation → reuse that level for subsequent searches unless they say otherwise
- **ALWAYS show the service level and credits consumed in the stats section after search results**
- After showing results, display: "本次使用 S2（精准触达）等级，消耗 60 积分，剩余配额 xxx"

## Output Formatting

展示搜索或采集结果时，使用以下分区格式。字段要展示齐全，表格要对齐整齐。

### TikTok 输出模板

```
✅ 搜索成功！找到 N 个 [国家] [平台] [关键词]达人

📊 采集结果

| #   | 用户名      | 昵称        | 粉丝数  | 获赞数   | 平均播放 | 互动率  | 国家 | 主页链接          |
| --- | ----------- | ----------- | ------- | -------- | -------- | ------- | ---- | ----------------- |
| 1   | username1   | Nickname1   | 33.1K   | 95.5万   | 1.2万    | 6.50%   | US   | [查看][link1]     |
| 2   | username2   | Nickname2   | 59.2K   | 146.0万  | 3.8万    | 3.75%   | US   | [查看][link2]     |

[link1]: https://www.tiktok.com/@username1
[link2]: https://www.tiktok.com/@username2

📈 统计信息
• 总匹配数：12,652 个达人
• 服务等级：S2（精准触达）
• 本次消耗：60 积分
• 剩余配额：992 次
• 请求ID：xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### YouTube 输出模板

```
| #   | 用户名      | 频道名      | 订阅数  | 总观看    | 平均播放 | 互动率  | 国家 | 频道链接          |
| --- | ----------- | ----------- | ------- | --------- | -------- | ------- | ---- | ----------------- |
| 1   | username1   | Channel1    | 120K    | 5,200万   | 8.5万    | 4.20%   | US   | [查看][link1]     |
```

### Instagram 输出模板

```
| #   | 用户名      | 昵称        | 粉丝数  | 帖子数   | 平均播放 | 互动率  | 国家 | 主页链接          |
| --- | ----------- | ----------- | ------- | -------- | -------- | ------- | ---- | ----------------- |
| 1   | username1   | Nickname1   | 85.3K   | 342      | 2.1万    | 5.30%   | US   | [查看][link1]     |
```

### 格式规则

- **分区结构**：用 emoji 标题分隔不同区域（✅ 搜索结果、📊 采集结果、📈 统计信息）
- **字段齐全**：展示 API 返回的所有核心字段，不省略
- **表格对齐**：每列用固定宽度对齐，分隔线用 `---` 填充，确保列宽一致
- **链接处理**：表格内用 `[查看][linkN]` 引用式链接，在表格下方定义完整 URL，避免撑坏表格
- **数字格式**：
  - 粉丝/播放等数值：≥1万 用 K（如 33.1K）、≥100万 用 M（如 1.2M）；<1万 用逗号分隔（如 3,911）
  - 获赞/总观看等大数值：用万/亿简写（如 95.5万、5.2亿）
  - 互动率：转为百分比，保留两位小数（如 0.065 → 6.50%）
- **统计信息**：单独列出总匹配数、服务等级、本次消耗积分、剩余配额、请求 ID，用无序列表展示
- **默认展示 5~10 条**，超过时询问用户是否需要更多
- 展示结果后主动询问："需要导出完整数据到 CSV/Excel 吗？"

## Quota Awareness

Every API response includes `meta.quota_remaining` and search responses include `meta.credits_consumed`. Monitor these values:
- `credits_consumed` shows how many credits were deducted for the current request (varies by `service_level`: S1=1/record, S2=3/record, S3=4/record)
- If `quota_remaining` < 50: warn the user that quota is running low
- If `quota_remaining` < 10: strongly recommend the user to conserve quota
- If `quota_remaining` = 0 or error 42902: inform the user that daily quota is exhausted (resets at UTC 00:00)
- When using S2/S3 service levels, remind the user that credits are consumed faster

## Workflows

### Workflow 1: Search Creators (instant)

```bash
node {baseDir}/scripts/search_creators.mjs '{"platform":"tiktok","keyword":"beauty","country_code":"US","followers_cnt_gte":10000,"size":20,"service_level":"S2"}'
```

### Workflow 2: Search + Export (instant)

```bash
# Search and export to local CSV in one pipeline
node {baseDir}/scripts/search_creators.mjs '{"platform":"tiktok","keyword":"beauty","country_code":"US","size":50,"service_level":"S2"}' | node {baseDir}/scripts/export_to_csv.mjs '{"output":"creators.csv"}'

# Append page 2 to the same file
node {baseDir}/scripts/search_creators.mjs '{"platform":"tiktok","keyword":"beauty","country_code":"US","size":50,"page":2,"service_level":"S2"}' | node {baseDir}/scripts/export_to_csv.mjs '{"output":"creators.csv"}'
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
| `service_level` | string | Service level: `S1` (list only) / `S2` (precise reach) / `S3` (deep profile). Default `S1`. Different levels return different fields and consume different credits per record |

#### Service Level Details

| Level | Name | Included Fields | Credits/Record |
|-------|------|----------------|----------------|
| S1 | List only | uid, username, nickname, avatar_url, profile_url, followers_count, likes_count, has_showcase, last_video_publish_date | 1 |
| S2 | Precise reach | S1 + country_code, gender, engagement_rate, avg_views, product_categories, has_email, language | 3 |
| S3 | Deep profile | S2 + audience female ratio, audience country distribution, audience language distribution | 4 |

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
