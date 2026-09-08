# Video Script Session Audit API Guide

## Common Request Headers

```http
X-API-Key: <api_key>
X-User-Identity: <user_identity>
Content-Type: application/json
```

Do not send `user_id`. The API derives the business identity from the authenticated tenant.

## Create Session

```bash
node scripts/video_script_session_audit_create.mjs '{"audit_category":"ecommerce","name":"Product audit"}'
```

Request fields:

| Field | Required | Description |
|---|---|---|
| `audit_category` | yes | Audit industry, for example `ecommerce` or `game` |
| `name` | no | Human-readable Session name |

The response returns `data.session_id`. Save it for all other Session endpoints.

## Import Material

Use `video_script_session_audit_material_import.mjs` with one of these request shapes.

Client Brief:

```bash
node scripts/video_script_session_audit_material_import.mjs '{"session_id":"<uuid>","material_type":"brief","source_url":"https://docs.google.com/document/d/<id>","parameters":{"doc_type":"client"}}'
```

Script Brief:

```bash
node scripts/video_script_session_audit_material_import.mjs '{"session_id":"<uuid>","material_type":"brief","source_url":"https://drive.google.com/file/d/<id>/view","parameters":{"doc_type":"script"}}'
```

Video URL:

```bash
node scripts/video_script_session_audit_material_import.mjs '{"session_id":"<uuid>","material_type":"video","source_url":"https://www.tiktok.com/@creator/video/<id>"}'
```

The response returns `material_id`, `material_type`, and `status`. Material import is asynchronous. Query `brief_upload`, `brief_upload_script`, or `video_upload` as appropriate. Brief imports accept Google Docs/Drive URLs or publicly accessible HTTPS document/OSS URLs (supported PDF, DOCX, and TXT content). Video imports accept Google Drive URLs, publicly accessible HTTPS video/OSS URLs, or supported social-video URLs. v1 does not accept local file paths, multipart bodies, or `oss_key` values; use a public `oss_url` when a media upload flow provides both `oss_key` and `oss_url`.

## Execute Stage

```bash
node scripts/video_script_session_audit_stage_execute.mjs '{"session_id":"<uuid>","action":"parse_brief"}'
node scripts/video_script_session_audit_stage_execute.mjs '{"session_id":"<uuid>","action":"script_qc"}'
node scripts/video_script_session_audit_stage_execute.mjs '{"session_id":"<uuid>","action":"analyze_video"}'
node scripts/video_script_session_audit_stage_execute.mjs '{"session_id":"<uuid>","action":"run_audit"}'
node scripts/video_script_session_audit_stage_execute.mjs '{"session_id":"<uuid>","action":"run_enhancement","parameters":{"code":"script_line_comparison"}}'
```

The response returns a normalized `task_id` and current `status`. The accepted actions are `parse_brief`, `script_qc`, `analyze_video`, `run_audit`, and `run_enhancement`. `run_enhancement` requires a configured `parameters.code`.

## Query Stage Status

Single stage:

```bash
node scripts/video_script_session_audit_stage_status.mjs '{"session_id":"<uuid>","stage":"video_analysis"}'
```

All stages:

```bash
node scripts/video_script_session_audit_stage_status.mjs '{"session_id":"<uuid>"}'
```

The supported stages are `brief_upload`, `brief_upload_script`, `brief_parse`, `script_qc`, `video_upload`, `video_analysis`, `content_audit`, and `enhancement`. A missing `stage` requests the aggregate view. `pending` means no completed stage record is currently available; it does not prove that submission occurred.

## Poll a Stage

```bash
node scripts/video_script_session_audit_poll.mjs '{"session_id":"<uuid>","stage":"video_analysis"}'
node scripts/video_script_session_audit_poll.mjs '{"session_id":"<uuid>","stage":"video_analysis","interval":10,"max_attempts":60}'
```

The poll script writes progress logs to stderr and the terminal response to stdout. It exits with code `0` for `completed`, and code `1` for `failed` or timeout.

## Get Session Result

```bash
node scripts/video_script_session_audit_result.mjs '{"session_id":"<uuid>"}'
```

The result endpoint returns a stable result projection, not the complete eight-stage status aggregate. Use the stage-status endpoint as the source of truth for all eight statuses, including `brief_upload_script`, `script_qc`, and `enhancement`; the result may omit those stages and may return an empty `briefs` array. Read a specific Enhancement from `enhancement.data.enhancements` in the stage-status response by its `code`. Do not interpret null fields as an audit verdict.

## Parse Results

After a stage reaches `completed`, read its `result_data`:

- `brief_parse`: structured Client Brief fields such as `brand`, `product`, `business_goal`, `target_audience`, `selling_points`, `must_say`, `must_show`, `dont_say`, `dont_show`, and `compliance_requirements`.
- `script_qc`: preserve the full returned object. Its schema is extensible; `brief_parsed` and `script_text` are context echoes, not QC conclusions. Present explicit findings, risks, scores, and suggestions when returned.
- `video_analysis`: normally read the `call1_analysis` wrapper for timeline, storyboard, transcript/audio, visual, shot, and evidence-safe fields. Do not expose frame or slice URLs.
- `content_audit`: read `overall_verdict`, `overall_score` when present, `findings`, `revision_plan`, `overall_direction`, and `script_execution_alignment`. `conditional_pass` means revisions remain.
- `enhancement`: select `data.enhancements[]` by the requested `code`, then read that item's `result_data`; do not expect it in the Session Result stage map.

Present the final report in this order: verdict/score, completed stages, key findings, prioritized revision plan, and enhancement output. A missing field is not a pass/fail decision.

## Local File Preparation

The Session API does not accept local paths or multipart bodies. For a local DOCX or video, first use an available upload/object-storage flow to obtain a publicly accessible HTTPS `oss_url`, then pass that URL as `source_url`. Do not pass the returned `oss_key` directly.

## Rate Limits

A request may return `42901` while the tenant or an asynchronous operation is inside its rate-limit window. Preserve the Session and task identifiers, wait before retrying, and avoid parallel polling or duplicate stage submissions. Treat `42902` as daily quota exhaustion rather than a transient retry.

## Enhancement: script_line_comparison

Use a Script Brief with `parameters.doc_type=script`. The enhancement reads the Script Brief source and completed video analysis. Its `code` is passed inside `parameters` on the stage execute endpoint. The enhancement status is aggregated under `enhancement`; inspect the matching enhancement code in the returned data before presenting its result.

## Errors

- `40001`: invalid request or unsupported action/material combination.
- `40004`: unsupported or unsafe material URL.
- `40101`: invalid API key or Session is not owned by the current tenant.
- `40301`: missing endpoint scope.
- `40201`: insufficient credits.
- `42901` / `42902`: rate limit or daily quota exhausted.
- `50001`: server error.

A successful HTTP status query may still contain `data.status="failed"`. Surface its `error_message`; do not treat the outer `success` value as proof that the asynchronous stage succeeded.
