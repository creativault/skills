---
name: creator-scraper-cv
description: |
  Creativault creator data collection and outreach skill. Search and collect creator/influencer
  data from TikTok, YouTube, and Instagram. Send outreach emails to discovered creators with
  automatic conversation management, batch sending, and follow-up tracking.
  Supports multi-dimensional search, similar/lookalike creator discovery, batch collection by
  links/usernames/keywords, task tracking, data export (xlsx/csv/html), and email outreach
  (single/batch send, templates, smart timing, metrics).
  Use when: creator search, influencer scraping, KOL search, KOL analytics, social media
  data extraction, TikTok scraper, YouTube scraper, Instagram scraper, influencer discovery,
  similar creators, lookalike, outreach, email outreach, send email to creator, batch email,
  follow-up, 达人采集, KOL 搜索, 网红数据, 达人分析, 达人搜索, 相似达人, 社交媒体数据, 建联, 发邮件, 批量发送.
compatibility: Node.js 20.6+
metadata:
  author: creativault
  version: "1.5.0"
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
| Find similar creators | `scripts/find_lookalike.mjs` | Sync, auto-resolves username/URL |
| Send outreach email | `scripts/outreach_send.mjs` | Async, returns task_id |
| Query outreach task | `scripts/outreach_task.mjs` | Sync or auto-poll |
| Query creator contact | `scripts/outreach_contact.mjs` | Sync |
| Get follow-up todos | `scripts/outreach_todo.mjs` | Sync |
| Get outreach metrics | `scripts/outreach_metrics.mjs` | Sync |
| Get outreach config | `scripts/outreach_config.mjs` | Sync |
| Upload attachment | `scripts/outreach_upload.mjs` | Sync |

All scripts accept a JSON string as command-line argument. Results are output as JSON to stdout.

**Language**: Always respond to the user in the same language they use. If the user writes in Chinese, respond in Chinese. If in English, respond in English.

## Choosing the Right Approach

Before executing, determine the best approach based on user intent:

| User Intent | Approach | Response Time |
|-------------|----------|---------------|
| "Search/find creators" with filters (keyword, country, followers) | `search_creators.mjs` | Instant (~1s) |
| "Find similar/lookalike creators" given a profile link or username | `find_lookalike.mjs` | Instant (~2s) |
| "Collect/scrape data" for specific creators (links or usernames) | `submit_collection_task.mjs` → poll → get data | 5~30 minutes |
| "Find creators by keyword" and collect detailed data | `submit_keyword_task.mjs` → poll → get data | 5~30 minutes |
| "Send email to creator" / "reach out" / "建联" | `outreach_send.mjs` → poll status | 3~10 seconds |
| "Batch send emails" to a list of creators | `outreach_batch_send.mjs` → poll status | 1~5 minutes |
| "Who needs follow-up?" / "待办" | `outreach_todo.mjs` | Instant |
| "How are my campaigns doing?" / "效果" | `outreach_metrics.mjs` | Instant |
| "What did I discuss with X?" / "沟通历史" | `outreach_history.mjs` | Instant |

**Decision rules:**
- If the user gives filter conditions (keyword, country, follower count) → use **search** first. It returns results instantly.
- If the user gives a specific creator link/username and asks for "similar"/"lookalike"/"相似达人" → use **lookalike** directly (no resolve needed).
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
| S2 | 精准触达 | S1 + 国家、性别、互动率、平均播放、均播/粉丝比、认证状态、带货类目、达人领域、bio、hashtags、邮箱标识、语言 | 3 |
| S3 | 深度画像 | S2 + 受众女性比例、受众国家分布、受众语言分布、受众年龄分布 | 4 |

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

### 相似达人输出模板

```
🔍 找到 N 个与 @seed_username 相似的达人

📊 相似达人列表

| #   | 用户名      | 昵称        | 粉丝数  | 平均播放 | 互动率  | 相似度  | 国家 | 主页链接          |
| --- | ----------- | ----------- | ------- | -------- | ------- | ------ | ---- | ----------------- |
| 1   | username1   | Nickname1   | 120K    | 3.8万    | 7.20%   | 85.0%  | US   | [查看][link1]     |
| 2   | username2   | Nickname2   | 95.5K   | 2.1万    | 5.50%   | 78.3%  | US   | [查看][link2]     |

[link1]: https://www.tiktok.com/@username1
[link2]: https://www.tiktok.com/@username2

📈 统计信息
• 种子达人：@seed_username（平台ID：7123456789）
• 结果总数：N 个相似达人
• 本次消耗：10 积分
• 剩余配额：xxx 次
• 请求ID：xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
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
- **总匹配数展示规则**：API 的 `meta.total` 仅在筛选条件 > 2 个时返回数值，≤ 2 个筛选条件时返回 null。当 total 为 null 时，统计信息中不展示"总匹配数"这一行，避免显示"总匹配数：null"
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

### Workflow 5: Find Similar/Lookalike Creators (instant)

When the user provides a creator profile link or username and asks for similar creators, call `find_lookalike.mjs` directly — the API internally resolves username/URL to platform ID, no separate resolve step needed.

**By username + platform:**

```bash
node {baseDir}/scripts/find_lookalike.mjs '{"username":"creator_demo","platform":"tiktok","limit":10}'
```

**By profile URL (auto-detects platform):**

```bash
node {baseDir}/scripts/find_lookalike.mjs '{"profile_url":"https://www.tiktok.com/@creator_demo","limit":10}'
```

**By username only (auto-searches all platforms):**

```bash
node {baseDir}/scripts/find_lookalike.mjs '{"username":"creator_demo","limit":10}'
```

**Cross-platform search**: Set `target_platform` different from the seed creator's platform to find similar creators on another platform (e.g., find YouTube creators similar to a TikTok creator).

Optional filters: `target_region`, `target_language`, `follower_min`, `follower_max`, `avg_views_min`, `avg_views_max`, `female_rate_min`, `lang`, `service_level`.

**Decision rules for lookalike:**
- If user gives a profile URL → pass it as `profile_url`, the API auto-parses platform and username
- If user gives a username + platform → pass both
- If user gives only a username → pass just `username`, the API searches all three platforms
- If API returns error 40401 → inform user the creator is not in the database

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
| `service_level` | string | Service level: `S1` (list only) / `S2` (precise reach) / `S3` (deep profile). Default `S2`. Different levels return different fields and consume different credits per record |
| `lang` | string | Response language: `cn` (Chinese) / `en` (English). Translates code values like country_code, gender, audience_age_id_list, etc. |

**Platform-specific category parameters:**

All platforms use the same format: **level-3 category IDs** (8-digit codes). The skill automatically converts user input to the correct format.

All platforms use the **`industry`** parameter for category filtering.

**Supported input formats** (all platforms):
- **Level-3 category IDs** (8-digit codes): `25009001,24001001` (Skincare + Mobile Phones)
- **Level-1 category IDs** (2-digit codes): `25` (expands to all Beauty & Personal Care subcategories)
- **Chinese category names**: `美妆,科技数码` (auto-converts to IDs)
- **English category names**: `Skincare,Mobile Phones` (auto-converts to IDs)
- **Common English aliases**: `Fashion`, `Beauty`, `Sports`, `Tech`, `Food`, `Gaming`, `Travel` (auto-converts to IDs)
- **Comma-separated mixed input**: `Fashion,Beauty` (each part resolved independently)

**Common aliases reference:**

| Alias | Maps to | ID |
|-------|---------|-----|
| Fashion / Clothing | Clothing & Fashion | 16 |
| Beauty / Cosmetics | Beauty & Personal Care | 25 |
| Sports / Fitness / Outdoor | Outdoor & Sports | 12 |
| Tech / Technology / Electronics | Technology & Electronics | 24 |
| Food / Cooking | Food & Beverages | 26 |
| Gaming / Games / Esports | Games | 19 |
| Travel / Lifestyle | Travel & Lifestyle | 15 |

See [Industry Categories Reference](references/industry-categories.md) for complete mapping.

**Category Input Examples:**

```bash
# All platforms: use "industry" parameter, auto-converted to level-3 IDs
node scripts/search_creators.mjs '{"platform":"tiktok","industry":"Fashion"}'
node scripts/search_creators.mjs '{"platform":"tiktok","industry":"美妆"}'
node scripts/search_creators.mjs '{"platform":"tiktok","industry":"Skincare"}'
node scripts/search_creators.mjs '{"platform":"youtube","industry":"25"}'
node scripts/search_creators.mjs '{"platform":"instagram","industry":"25009001"}'
node scripts/search_creators.mjs '{"platform":"tiktok","industry":"Fashion,Beauty"}'
```

#### Service Level Details

| Level | Name | Included Fields | Credits/Record |
|-------|------|----------------|----------------|
| S1 | List only | uid, username, nickname, avatar_url, profile_url, followers_count, likes_count, video_count, has_showcase, has_email, has_mcn, has_line, has_zalo, last_video_publish_date | 1 |
| S2 | Precise reach | S1 + country_code, gender, engagement_rate, avg_views, views_per_follower, is_verified, last10_video_views_per_sub, last10_med_video_views_cnt, last10_med_video_views_per_sub, product_categories, industry_categories, bio, hashtags, email, contact fields, mcn, language | 3 |
| S3 | Deep profile | S2 + audience_female_rate (percentage), audience_country_code_list, audience_language_code_list, audience_age_id_list | 4 |

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

### find_lookalike.mjs

Find similar/lookalike creators. Supports username, profile URL, or cross-platform search. The API internally resolves username/URL to platform ID.

| Parameter | Type | Description |
|-----------|------|-------------|
| `username` | string | Creator username (without `@`), either this or `profile_url` required |
| `platform` | string | Creator platform: `tiktok` / `youtube` / `instagram`. Optional — if omitted, searches all platforms |
| `profile_url` | string | Creator profile URL (auto-detects platform), either this or `username` required |
| `target_platform` | string | Target search platform. If omitted, same as seed creator's platform |
| `target_region` | string | Target country code, `all` for no filter |
| `target_language` | string | Target language code, `all` for no filter |
| `limit` | integer | Number of results, default 20, max 50 |
| `follower_min` | integer | Minimum followers |
| `follower_max` | integer | Maximum followers |
| `avg_views_min` | integer | Minimum average views |
| `avg_views_max` | integer | Maximum average views |
| `female_rate_min` | number | Minimum female audience ratio (0~100) |
| `lang` | string | Response language: `cn` / `en` |
| `service_level` | string | Service level, default `S1` |

Returns: `items` array with `uid`, `username`, `nickname`, `avatar_url`, `profile_url`, `country_code`, `followers_count`, `avg_views`, `engagement_rate`, `match_score`.

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
- [Industry Categories](references/industry-categories.md) — Industry category tree with Chinese/English mapping (for `industry` param)
- [Country Codes](references/country-codes.md) — ISO country codes with Chinese/English names and region shortcuts
- [Language Codes](references/language-codes.md) — ISO language codes with Chinese/English names
- [Error Codes](references/error-codes.md) — Complete error code list and troubleshooting

## Changelog

### v1.5.0
- Aligned with API v1.5
- All platforms: added `is_verified`(S2), `last10_video_views_per_sub`(S2), `last10_med_video_views_cnt`(S2), `last10_med_video_views_per_sub`(S2)
- YouTube: added short/long variants (`last10_video_views_per_sub_short/long`, `last10_med_video_views_cnt_short/long`, `last10_med_video_views_per_sub_short/long`)
- TikTok search: `industry_category_levels_list` parameter unified to `industry` (same as YouTube/Instagram)
- `lang` parameter now also translates `audience_age_id_list`

### v1.4.0
- Aligned with API v1.4: added `bio`, `industry_categories`, `hashtags` to S2 for all three platforms
- TikTok: added `video_count`(S1), `views_per_follower`(S2), `audience_age_id_list`(S3)
- YouTube: added `bio`(S2), `audience_female_rate`(S3)
- Instagram: added `gender`(S2), `bio`(S2), `industry_categories`(S2), `hashtags`(S2), `audience_age_id_list`(S3)
- `audience_female_rate` now returns percentage value (e.g., 78.65 = 78.65%)
- `gender` and `audience_age_id_list` support `lang` i18n translation
- `lang` parameter available on all search endpoints and lookalike

### v1.3.0
- Updated all three platform search response fields per v1.4 API doc
- TikTok: added `video_count`(S1), `views_per_follower`(S2), `bio`(S2), `industry_categories`(S2), `hashtags`(S2), `audience_age_id_list`(S3), contact fields
- YouTube: added `bio`(S2), `industry_categories`(S2), `hashtags`(S2), `audience_female_rate`(S3)
- Instagram: added `gender`(S2), `bio`(S2), `industry_categories`(S2), `hashtags`(S2), `audience_age_id_list`(S3)
- Added `lang` parameter support for i18n (cn/en) on all search and lookalike endpoints
- `audience_female_rate` now returns percentage value (e.g., 78.65 = 78.65%)
- Removed `resolve_creator.mjs` — lookalike API now auto-resolves username/URL internally
- Simplified `find_lookalike.mjs` to accept `username`/`profile_url` directly (no more `seed_platform_id`)
- Simplified Workflow 5 to single-step lookalike call

### v1.2.0
- Added similar/lookalike creator discovery via `find_lookalike.mjs`
- Search API now defaults to S2 (precise reach) service level
- `meta.total` only returned when filter conditions > 2; output formatting hides total when null
- Added cross-platform lookalike search support
- Added Workflow 5 for lookalike creator discovery

### v1.1.0
- Added server-side export (xlsx/csv/html) via `export_task_data.mjs`
- Added auto-retry on 429 rate limit in API client
- Added quota awareness guidance
- Added output formatting guidance for agents
- Added smart workflow selection (search vs collection)
- Unified all script logs and SKILL.md to English

### v1.0.0
- Initial release: search, collection, polling, local CSV export

---

## Outreach (Email Outreach)

Send outreach emails to creators discovered via search. 7 scripts covering the full outreach workflow.

### ⚠️ Architecture Principle

**Skill = 纯 HTTP 客户端，不做任何业务逻辑处理。**

- Skill 脚本只负责组装 JSON 参数并调用 OpenAPI 接口
- 所有业务逻辑（创建提报、创建达人记录、查找活跃会话、判断新建/回复）由 OpenAPI 接口内部完成
- Skill 不需要知道 submission_id、influencer_id 等内部概念
- 搜索后发送时，Skill 应将搜索结果中的 `uid` 和 `platform` 传给 outreach_send（OpenAPI 内部会根据 uid 从 Holo 查完整达人数据，自动创建与 web 端一致的提报达人记录）

### Outreach Capabilities

| Capability | Script | Mode |
|------------|--------|------|
| Send email (single/batch) | `scripts/outreach_send.mjs` | Async, returns task_id |
| Query task (status+result) | `scripts/outreach_task.mjs` | Sync or auto-poll |
| Query creator contact info | `scripts/outreach_contact.mjs` | Sync |
| Get follow-up todo list | `scripts/outreach_todo.mjs` | Sync |
| Get outreach metrics | `scripts/outreach_metrics.mjs` | Sync |
| Get config (channels+templates) | `scripts/outreach_config.mjs` | Sync |
| Upload attachment | `scripts/outreach_upload.mjs` | Sync |

### Outreach Workflow: Search → Send → Track

```bash
# Step 1: Search creators with email
node {baseDir}/scripts/search_creators.mjs '{"platform":"tiktok","keyword":"beauty","has_email":true,"service_level":"S2"}'

# Step 2: Check available channels and templates
node {baseDir}/scripts/outreach_config.mjs '{}'

# Step 3: Batch send (recipients format compatible with search results)
node {baseDir}/scripts/outreach_send.mjs '{"recipients":[{"email":"c1@x.com","nickname":"Creator1"},{"email":"c2@x.com","nickname":"Creator2"}],"template_id":123}'

# Step 4: Poll until complete (auto-poll mode)
node {baseDir}/scripts/outreach_task.mjs '{"task_id":"batch_xxx","poll":true,"include_result":true}'

# Step 5: Check follow-up todos after a few days
node {baseDir}/scripts/outreach_todo.mjs '{"overdue_hours":48}'

# Step 6: View creator's contact info + history + AI summary
node {baseDir}/scripts/outreach_contact.mjs '{"email":"c1@x.com"}'

# Step 7: Reply (system auto-detects existing conversation)
node {baseDir}/scripts/outreach_send.mjs '{"to":"c1@x.com","body_html":"<p>Thanks!</p>"}'

# Step 8: Check overall metrics
node {baseDir}/scripts/outreach_metrics.mjs '{"date_from":"2025-05-01","group_by":"week"}'
```

### Outreach Script Parameters

#### outreach_send.mjs

`to` and `recipients` are mutually exclusive — pass exactly one.

| Parameter | Type | Description |
|-----------|------|-------------|
| `to` | string | Creator email (single send) |
| `uid` | string | **Required for single send**. Creator platform UID (from search result's `uid` field, OpenAPI auto-fetches full data) |
| `nickname` | string | Creator nickname (optional, for session display) |
| `platform` | string | Creator platform: tiktok/youtube/instagram (recommended) |
| `recipients` | object[] | Array of `{email, uid, nickname, platform}` (batch send) |
| `subject` | string | Email subject |
| `body_html` | string | HTML body (supports `{{creator_name}}` variables) |
| `body_text` | string | Plain text body |
| `channel` | string | `ses` (default) / `gmail` / `outlook` |
| `template_id` | integer | Template ID (overrides subject/body) |
| `send_mode` | string | `immediate` (default) / `smart` (timezone-optimized) |
| `force_new` | boolean | Force new conversation (default false) |
| `attachment_ids` | string[] | Attachment IDs from upload |

#### outreach_task.mjs

| Parameter | Type | Description |
|-----------|------|-------------|
| `task_id` | string | **Required**. Task ID from send |
| `include_result` | boolean | Attach per-recipient results when completed (default false) |
| `result_filter` | string | Filter results: `all` / `sent` / `failed` |
| `poll` | boolean | Auto-poll until terminal status (default false) |
| `poll_interval` | integer | Poll interval seconds (default 5) |
| `poll_max_attempts` | integer | Max poll attempts (default 60) |

#### outreach_contact.mjs

| Parameter | Type | Description |
|-----------|------|-------------|
| `email` | string | **Required**. Creator email |
| `include_history` | boolean | Include message history (default true) |
| `include_summary` | boolean | Include AI summary (default true) |

#### outreach_todo.mjs

| Parameter | Type | Description |
|-----------|------|-------------|
| `overdue_hours` | integer | Overdue threshold in hours (default 24) |
| `include_unread` | boolean | Include unread conversations (default true) |
| `include_overdue` | boolean | Include overdue conversations (default true) |

#### outreach_metrics.mjs

| Parameter | Type | Description |
|-----------|------|-------------|
| `date_from` | string | Start date YYYY-MM-DD (default: last 7 days) |
| `date_to` | string | End date YYYY-MM-DD |
| `group_by` | string | Group by: `day` / `week` / `month` |

#### outreach_config.mjs

| Parameter | Type | Description |
|-----------|------|-------------|
| `include_templates` | boolean | Include template list (default true) |
| `template_page` | integer | Template pagination page (default 1) |
| `template_size` | integer | Templates per page (default 20) |

#### outreach_upload.mjs

| Parameter | Type | Description |
|-----------|------|-------------|
| `file_path` | string | **Required**. Local file path (max 10MB) |

### Outreach Credits

| Action | Credits |
|--------|---------|
| Send single email | 1 |
| Batch send (per recipient) | 1 |
| All query endpoints | 0 (free) |

### Outreach Decision Rules

- "Send email" / "reach out" / "建联" → `outreach_send.mjs` with `to`
- User has a list from search → `outreach_send.mjs` with `recipients`
- After any send → `outreach_task.mjs` with `poll:true` to confirm delivery
- "Who needs follow-up?" / "待办" → `outreach_todo.mjs`
- "What did I discuss with X?" / "沟通历史" → `outreach_contact.mjs`
- "How are campaigns doing?" / "效果" → `outreach_metrics.mjs`
- First time / "what channels?" / "what templates?" → `outreach_config.mjs`
- Template variables: `{{creator_name}}`, `{{creator_email}}`, `{{platform}}`
- When sending after search/lookalike results, ALWAYS pass `creator_uid` (the `uid` field from search results) and `platform` to outreach_send (OpenAPI will auto-fetch full creator data from Holo to populate the submission, matching web frontend quality)

### ⚠️ Send Confirmation (MANDATORY)

**邮件发送是高风险操作，每次发送前必须获得用户明确确认。**

**[禁止]** 用户说"帮我发邮件"后直接执行发送脚本。

**[必须]** 在执行 `outreach_send.mjs` 之前，向用户展示以下确认摘要并等待明确同意：

```
📧 发送确认

• 收件人：{email 或 N 个收件人列表}
• 主题：{subject}
• 渠道：{channel}
• 模式：{send_mode}
• 正文预览：{前 100 字符...}

确认发送吗？(Y/N)
```

**规则：**
1. 单笔发送：展示收件人邮箱、主题、正文预览，等待用户确认
2. 批量发送：展示收件人数量、收件人列表（≤5 个全部展示，>5 个展示前 5 个 + "...及其他 N 个"）、主题、正文预览，等待用户确认
3. 用户说"确认"/"发送"/"是"/"Y"/"好的"/"发吧" → 执行发送
4. 用户说"取消"/"不发"/"修改"/"N" → 不执行，询问修改意见
5. 回复已有会话也需要确认（展示回复内容预览）
6. 唯一例外：用户在同一句话中明确说"直接发送不用确认"时可跳过

