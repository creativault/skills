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
    "quota_remaining": -1,
    "credits_consumed": 150,
    "credits_remaining": 131500
  }
}
```

`meta.quota_remaining`: remaining daily API request quota. It is **not** a credits balance. `-1` means unlimited.
`meta.service_level`: service level used for this search request (`S1`/`S2`/`S3`). Only present in search responses. Default is `S2`. Note: Navos users automatically default to `S3` (handled by `_api_client.mjs`).
`meta.credits_consumed`: credits deducted for this request. `0` means no charge.
`meta.credits_remaining`: actual OpenAPI credits balance. `-1` means unlimited. This field may be absent from non-billed endpoints.
`meta.total`: total matching records. For search endpoints, only returned when filter conditions > 2 (excluding `page`, `size`, `sort_field`, `sort_order`, `service_level`). Returns `null` when ≤ 2 filters.
`meta.lang`: response translation language (`cn`/`en`). `null` when `lang` param not provided.

Never report insufficient credits from `quota_remaining`. Only error code `40201` confirms insufficient credits.

## Endpoints

| Endpoint | Path | Description |
|----------|------|-------------|
| Search TikTok creators | `/openapi/v1/creators/tiktok/search` | Multi-dimensional filtering, supports `service_level` (S1/S2/S3) |
| Search YouTube creators | `/openapi/v1/creators/youtube/search` | Multi-dimensional filtering, supports `service_level` (S1/S2/S3) |
| Search Instagram creators | `/openapi/v1/creators/instagram/search` | Multi-dimensional filtering, supports `service_level` (S1/S2/S3) |
| Natural-language creator search | `/openapi/v1/creators/nl-search` | Single-platform search from one natural-language query |
| Submit collection task | `/openapi/v1/collection/tasks/submit` | Batch collect by links/usernames |
| Submit keyword collection | `/openapi/v1/collection/tasks/keyword-submit` | Collect by keywords |
| Query task status | `/openapi/v1/collection/tasks/status` | Check collection progress |
| Get task data | `/openapi/v1/collection/tasks/data` | Paginated results |
| Export task data | `/openapi/v1/collection/tasks/export` | Export to xlsx/csv/html file |
| Get file download URL | `/openapi/v1/files/download-url` | Get temporary download URL |
| Find similar creators | `/openapi/v1/creators/lookalike` | Lookalike search by username/URL, auto-resolves platform ID |
| Audit creator fake-follower risk | `/openapi/v1/fake-follower-audit/run` | Synchronous creator-level authenticity and engagement-quality audit |
| Search brand video insights | `/openapi/v1/brand-discovery/video-insights/search` | Expand a brand into up to 5 hashtags, search existing videos, and summarize brand content signals |
| Submit video script audit | `/openapi/v1/video-script-audit/tasks/submit` | Async single-video audit, fixed 100 credits/call |
| Query audit task status | `/openapi/v1/video-script-audit/tasks/status` | Poll audit task (recommended interval: 10s) |
| Get audit task result | `/openapi/v1/video-script-audit/tasks/result` | Fetch full 12-dimension audit JSON when status=completed |

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

## Natural-Language Creator Search

Use `POST /openapi/v1/creators/nl-search` for content direction, creator profile, style, scenario, and product-fit descriptions that are difficult to express as exact structured fields.

Request body:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | string | Yes | Natural-language requirement, 1-1000 characters |
| `platform` | string | No | `instagram` (default), `tiktok`, or `youtube`; common aliases are accepted |
| `limit` | integer | No | Result limit, default 20, range 1-100; channel limits still apply |

Do not send `lang`, `service_level`, `debug`, route tuning, pagination, or structured filters. Search one platform per request.

The API Key must have `creator:nl_search` or `creator:*` scope.

Billing is fixed at 15 credits per request, independent of `limit`, returned item count, platform, or recall type. Instagram `scalar_fallback` happens inside the same request and is not billed again. Multi-platform searches require separate requests and therefore cost 15 credits per platform.

Recall behavior:

- Instagram uses vector recall when the query contains content topic, style, or commercial semantics.
- Instagram automatically uses `scalar_fallback` when there is not enough semantic content.
- TikTok and YouTube currently use scalar recall.
- Instagram vector recall does not execute email-availability or update-time constraints. Use structured search when either is mandatory.

Response items contain only `uid`, `username`, `nickname`, `avatar_url`, `profile_url`, `country_code`, `followers_count`, `avg_views`, `engagement_rate`, and `match_score`. `engagement_rate` is a decimal ratio, so `0.0432` means `4.32%`. `match_score` is meaningful only within the same request.

Inspect `meta.recall_type` for `vector`, `scalar`, or `scalar_fallback`. This endpoint has a fixed compact response and does not expose S1/S2/S3 selection or S3 audience fields.

## Fake Follower Audit

Use `POST /openapi/v1/fake-follower-audit/run` to inspect one TikTok, Instagram, or YouTube creator for fake-follower and suspicious-engagement risk.

Provide exactly one target form:

```json
{"profile_url":"https://www.tiktok.com/@creator","lang":"cn"}
```

```json
{"platform":"instagram","platform_user_id":"creator","lang":"en"}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `profile_url` | string | Conditional | Creator profile URL |
| `platform` | string | Conditional | `tiktok` / `instagram` / `youtube` |
| `platform_user_id` | string | Conditional | username / union_user_id / sec_user_id |
| `service_level` | string | No | Defaults to `S1` |
| `lang` | string | No | `cn` / `en`; controls `conclusion`, default `en` |

Response fields include:

- `quality_score`: 0-100, higher means healthier engagement.
- `fake_follower_rate`: decimal estimate; `0.12` means 12%.
- `risk_level`: `low` / `medium` / `high` / `critical`.
- `conclusion`, `abnormal_types`, and `signals`.
- `creator_profile`: nickname, avatar, followers, following, and available audience distributions.
- `partial_result` and `warnings`: degradation caused by insufficient content, comments, or profile data.

The fake-follower rate is an estimate, not a platform-provided follower-by-follower audit. When `partial_result=true`, present the response as partial data and include relevant warnings. Billing is determined by the active backend rule for this endpoint; do not hard-code a credit amount.

## Brand Video Insight Search

Use `POST /openapi/v1/brand-discovery/video-insights/search` when the user wants brand/competitor video insight, such as "find Fenty Beauty related videos", "brand hashtag performance", or "竞品品牌视频洞察".

This endpoint reuses CreatiVault keyword-monitor hashtag expansion logic, but it only searches existing indexed videos. It does not trigger realtime collection. If the user wants fresh collection after seeing no results, ask for confirmation before calling `/openapi/v1/brand-discovery/realtime-mentions`.

Request body:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `brand_name` | string | Yes | Brand or competitor name |
| `platforms` | string[] | No | `tiktok`, `youtube`, `instagram`; defaults to `["tiktok"]` |
| `hashtags` | string[] | No | Manual hashtags, max 5. If provided, auto expansion is skipped |
| `expand_count` | integer | No | Auto-expanded hashtag count, default 5, range 1-5 |
| `limit` | integer | No | Max returned videos, default 20, range 1-50 |
| `per_hashtag_size` | integer | No | Candidate videos per platform and hashtag, default 10, range 1-10 |
| `video_views_cnt_gte` / `video_views_cnt_lte` | integer | No | View-count filters |
| `video_interaction_rate_gte` / `video_interaction_rate_lte` | number | No | Percentage filters, so `3` means 3% |
| `video_publish_date_gte` / `video_publish_date_lte` | string | No | `YYYY-MM-DD` filters |

Example:

```json
{
  "brand_name": "Fenty Beauty",
  "platforms": ["tiktok"],
  "expand_count": 5,
  "video_interaction_rate_gte": 3,
  "limit": 20
}
```

Response `data` includes:

- `keyword_expansion.used_hashtags`: the actual search hashtags.
- `items`: matched videos, each with `matched_hashtag`.
- `summary`: video count, platform distribution, top hashtags, top creators.
- `realtime_collection`: future collection hook, with `triggered=false`.

Important: `/openapi/v1/videos/search` accepts up to 5 hashtags, but multiple hashtags are strict filters. For brand insight, use this endpoint because it searches each expanded hashtag separately and merges results.

## Search Response Fields by Service Level

### TikTok

| Field | Type | Level | Description |
|-------|------|-------|-------------|
| `uid` | string | S1 | Creator unique ID |
| `username` | string | S1 | Username |
| `nickname` | string | S1 | Nickname |
| `avatar_url` | string | S1 | Avatar URL |
| `profile_url` | string | S1 | Profile URL |
| `followers_count` | integer | S1 | Followers count |
| `likes_count` | integer | S1 | Likes count |
| `video_count` | integer | S1 | Total videos |
| `has_showcase` | boolean | S1 | Has showcase/store |
| `has_email` | boolean | S1 | Has email |
| `has_mcn` | boolean | S1 | Has MCN |
| `has_line` | boolean | S1 | Has Line |
| `has_zalo` | boolean | S1 | Has Zalo |
| `last_video_publish_date` | string | S1 | Last video publish date (YYYY-MM-DD) |
| `country_code` | string | S2 | Country/region code |
| `gender` | string | S2 | Gender (translated when `lang` is set) |
| `avg_views` | integer | S2 | Avg views of last 10 videos |
| `engagement_rate` | number | S2 | Avg interaction rate of last 10 videos |
| `views_per_follower` | number | S2 | Views per follower ratio |
| `is_verified` | boolean | S2 | Whether verified |
| `last10_video_views_per_sub` | number | S2 | Last 10 video views per subscriber |
| `last10_med_video_views_cnt` | integer | S2 | Last 10 video views median |
| `last10_med_video_views_per_sub` | number | S2 | Last 10 video views median per subscriber |
| `product_categories` | string[] | S2 | Product categories |
| `industry_categories` | array | S2 | Industry categories (primary/secondary/tertiary) |
| `bio` | string | S2 | Bio / profile description |
| `hashtags` | string[] | S2 | Hashtag list |
| `language` | string | S2 | Language |
| `email` | string | S2 | Email address |
| `link_whatsapp` | string | S2 | WhatsApp link |
| `link_line` | string | S2 | Line link |
| `link_zalo` | string | S2 | Zalo link |
| `mcn` | string | S2 | MCN agency |
| `recent_videos` | array | S2 | Recent videos (up to 3; each item has `cover_url` / `video_url` / `video_title` / `video_type`) |
| `audience_female_rate` | number | S3 | Female audience ratio (percentage, e.g. 78.65 = 78.65%) |
| `audience_country_code_list` | string[] | S3 | Audience country distribution |
| `audience_language_code_list` | string[] | S3 | Audience language distribution |
| `audience_age_id_list` | string[] | S3 | Audience age distribution (translated when `lang` is set) |

### YouTube

| Field | Type | Level | Description |
|-------|------|-------|-------------|
| `uid` | string | S1 | Creator unique ID |
| `username` | string | S1 | Username |
| `nickname` | string | S1 | Channel name |
| `avatar_url` | string | S1 | Avatar URL |
| `channel_url` | string | S1 | Channel URL |
| `has_email` | boolean | S1 | Has email |
| `has_whatsapp` | boolean | S1 | Has WhatsApp |
| `last_video_publish_time` | string | S1 | Last video publish time (ISO 8601) |
| `country_code` | string | S2 | Country/region code |
| `language` | string | S2 | Language |
| `gender` | string | S2 | Gender |
| `bio` | string | S2 | Channel bio / description |
| `followers_count` | integer | S2 | Subscribers count |
| `video_count` | integer | S2 | Video count |
| `view_count` | integer | S2 | Total views |
| `avg_views` | integer | S2 | Avg views of last 10 videos (all) |
| `avg_views_short` | integer | S2 | Avg views of last 10 short videos |
| `avg_views_long` | integer | S2 | Avg views of last 10 long videos |
| `engagement_rate` | number | S2 | Interaction rate of last 10 videos (all) |
| `engagement_rate_short` | number | S2 | Interaction rate of last 10 short videos |
| `engagement_rate_long` | number | S2 | Interaction rate of last 10 long videos |
| `is_verified` | boolean | S2 | Whether verified |
| `last10_video_views_per_sub` | number | S2 | Last 10 video views per subscriber (all) |
| `last10_video_views_per_sub_short` | number | S2 | Last 10 short video views per subscriber |
| `last10_video_views_per_sub_long` | number | S2 | Last 10 long video views per subscriber |
| `last10_med_video_views_cnt` | integer | S2 | Last 10 video views median (all) |
| `last10_med_video_views_cnt_short` | integer | S2 | Last 10 short video views median |
| `last10_med_video_views_cnt_long` | integer | S2 | Last 10 long video views median |
| `last10_med_video_views_per_sub` | number | S2 | Last 10 video views median per subscriber (all) |
| `last10_med_video_views_per_sub_short` | number | S2 | Last 10 short video views median per subscriber |
| `last10_med_video_views_per_sub_long` | number | S2 | Last 10 long video views median per subscriber |
| `industry_categories` | array | S2 | Industry categories (primary/secondary/tertiary) |
| `hashtags` | string[] | S2 | Hashtag list |
| `email` | string | S2 | Email address |
| `whatsapp` | string | S2 | WhatsApp |
| `recent_videos` | array | S2 | Recent videos (up to 3; each item has `cover_url` / `video_url` / `video_title` / `video_type`) |
| `audience_female_rate` | number | S3 | Female audience ratio (percentage) |
| `audience_country_code_list` | string[] | S3 | Audience country distribution |
| `audience_language_list` | string[] | S3 | Audience language distribution |
| `audience_age_list` | string[] | S3 | Audience age distribution (translated when `lang` is set) |

### Instagram

| Field | Type | Level | Description |
|-------|------|-------|-------------|
| `uid` | string | S1 | Creator unique ID |
| `username` | string | S1 | Username |
| `nickname` | string | S1 | Nickname |
| `avatar_url` | string | S1 | Avatar URL |
| `profile_url` | string | S1 | Profile URL |
| `has_email` | boolean | S1 | Has email |
| `has_whatsapp` | boolean | S1 | Has WhatsApp |
| `last_video_publish_time` | string | S1 | Last post/video publish time |
| `country_code` | string | S2 | Country/region code |
| `language` | string | S2 | Language |
| `gender` | string | S2 | Gender (translated when `lang` is set) |
| `bio` | string | S2 | Bio / profile description |
| `followers_count` | integer | S2 | Followers count |
| `video_count` | integer | S2 | Posts/videos count |
| `avg_views` | integer | S2 | Avg views of last 10 videos |
| `engagement_rate` | number | S2 | Avg interaction rate of last 10 videos |
| `is_verified` | boolean | S2 | Whether verified |
| `last10_video_views_per_sub` | number | S2 | Last 10 video views per subscriber |
| `last10_med_video_views_cnt` | integer | S2 | Last 10 video views median |
| `last10_med_video_views_per_sub` | number | S2 | Last 10 video views median per subscriber |
| `industry_categories` | array | S2 | Industry categories (primary/secondary/tertiary) |
| `hashtags` | string[] | S2 | Hashtag list |
| `email` | string | S2 | Email address |
| `link_whatsapp` | string | S2 | WhatsApp |
| `recent_videos` | array | S2 | Recent videos (up to 3; each item has `cover_url` / `video_url` / `video_title` / `video_type`) |
| `audience_female_rate` | number | S3 | Female audience ratio (percentage) |
| `audience_country_code_list` | string[] | S3 | Audience country distribution |
| `audience_language_code_list` | string[] | S3 | Audience language distribution |
| `audience_age_id_list` | string[] | S3 | Audience age distribution (translated when `lang` is set) |

### Lookalike

| Field | Type | Description |
|-------|------|-------------|
| `uid` | string | Creator unique ID |
| `username` | string / null | Username |
| `nickname` | string / null | Nickname |
| `avatar_url` | string / null | Avatar URL |
| `profile_url` | string / null | Profile URL |
| `country_code` | string / null | Country/region code |
| `followers_count` | integer / null | Followers count |
| `avg_views` | integer / null | Avg views of last 10 videos |
| `engagement_rate` | number / null | Avg interaction rate of last 10 videos |
| `match_score` | number / null | Similarity match score |

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

## Video Script Audit

Async single-video audit pipeline with **two ingestion paths**:

| Path | Input | Use case | Creator data dimensions |
|------|-------|----------|------------------------|
| **Path 1 (Social URL)** | `video_url` | Published video analysis | ✅ Lookback creator data (followers, avg views, viral level) |
| **Path 2 (Upload)** | `oss_url` (via `/media/upload`) | Pre-publish self-audit | `creator_metadata.status=not_applicable` |

Submit returns a UUID `task_id`; backend runs the full audit
(download → transcribe → storyboard → viral factor → benchmark → score) in ~3-5 minutes.

### Endpoints

| Endpoint | Path | Body | Notes |
|----------|------|------|-------|
| Upload media | `/openapi/v1/media/upload` | `multipart/form-data: file` | 20 credits/call; returns `oss_url` for path 2 |
| Submit | `/openapi/v1/video-script-audit/tasks/submit` | `{video_url?, oss_url?, brief?, ...}` | Fixed 100 credits/call; `video_url` and `oss_url` are mutually exclusive |
| Status | `/openapi/v1/video-script-audit/tasks/status` | `{task_id}` | Free, but counts toward daily quota |
| Result | `/openapi/v1/video-script-audit/tasks/result` | `{task_id}` | Free; only when status=completed |

### Upload Media Request (Path 2 Step 1)

```http
POST /openapi/v1/media/upload
Content-Type: multipart/form-data
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | file | ✓ | Video file (mp4/mov/avi/mkv/webm, ≤ 500MB) |

**Response**: `{oss_key, oss_url, filename, size_bytes}`. Pass **`oss_url`** (not `oss_key`) as the submit `oss_url`.
`oss_key` is for upload tracking only — submit rejects it.

### Submit Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `video_url` | string | △ | Path 1: Video URL (TikTok video / Instagram Reels / YouTube Shorts only) |
| `oss_url` | string | △ | Path 2: full `oss_url` from `/media/upload`; must be HTTPS under `*.creativault.tech` |
| `brief` | string | × | Customer brief, enables `brief_compliance` audit |
| `user_id` | string | × | Business user id; defaults to `X-User-Identity` |
| `campaign_id` | string | × | Campaign id for archival |
| `audit_mode` | string | × | `high` (default) / `low` |
| `is_benchmark` | boolean | × | Mark as benchmark case (skips benchmark comparison) |
| `enable_benchmark` | boolean | × | Compare against benchmark library |

**Deprecated aliases** (auto-mapped by `video_audit_submit.mjs`, avoid in new code):
`url` → `video_url`, `oss_url_override` → `oss_url`.
`uploaded_oss_key` is **rejected** — it is an OSS key, not a URL; pass `oss_url` instead.

> △ `video_url` and `oss_url`: provide exactly one, not both, not neither.

### Audit Task Status

| status | Description | progress |
|--------|-------------|----------|
| `pending` | Queued | 0 |
| `processing` | Downloading / analyzing / persisting | 50 |
| `completed` | Result available | 100 |
| `failed` | See `error_message` | 0 |

### Result Payload Fields

| Field | Type | Description |
|-------|------|-------------|
| `task_id` | string | Audit task UUID |
| `audit_result.storyboard` | object | Shot list, script structure, content theme, cinematography stats |
| `audit_result.viral_factors` | object | Hook / rhythm / selling-point integration / pain point / conversion / emotional value |
| `audit_result.content_audit` | object | Brief compliance, content standard, common pitfalls, risks, QA baseline |
| `audit_result.benchmark_comparison` | object \| null | Gap analysis vs benchmark library; `null` when `enable_benchmark=false` |
| `audit_result.suggestions` | array | Prioritized improvement actions (`P0`/`P1`/`P2`) |
| `audit_result.scores` | object | Overall + 6 sub-scores (0-10) and `diagnosis_level` |
| `audit_result.confidence` | object | Overall + per-dimension confidence; `requires_human_review` flag |
| `audit_result.creator_metadata` | object | Account background (followers, last10 avg views/interaction) |
| `audit_result.video_metrics` | object | Video metrics (views, likes, interaction rate, viral level) |
| `html_report_url` | string \| null | Public HTML report URL (`https://oss.creativault.tech/video_audit/reports/{ts}_{id}.html`), no auth required. `null` only if HTML generation failed (rare), does not block `audit_result` |

### Audit-Specific Errors

| code | HTTP | Description |
|------|------|-------------|
| 40001 | 200 | Task not found (invalid task_id) |
| 40002 | 200 | Task not completed (status ≠ completed); keep polling |
| 40003 | 200 | Audit result missing (cleaned up); resubmit |

### Billing

- 100 credits charged on `submit` only.
- Status / result calls do not consume credits.
- `meta.credits_consumed=100` only appears in submit success responses.

