---
name: video-script-session-audit
description: |
  CreatiVault video script Session audit skill. Use when the user needs a multi-material,
  multi-stage audit session with Client Brief, Script Brief, video material, brief parsing,
  Script QC, video analysis, content audit, enhancement, stage status, or a Session result.
  Calls the video-script-session-audit OpenAPI endpoints through local scripts. Supports URL
  material import for Google Docs/Drive briefs and supported Google Drive/social video URLs.
  Use when: video script Session audit, Content Audit Session, Client Brief audit, Script Brief,
  Script QC, dialogue comparison, script_line_comparison, staged video audit, brief-to-video audit,
  视频脚本 Session 审核, Content Audit Session, Client Brief, Script Brief, 脚本质检, 台词对比,
  分阶段视频审核, Brief 与视频审核, 视频内容审核 Session.
compatibility: Node.js 20.6+
metadata:
  layer: audit
  parent: creator-scraper-cv
---

# Video Script Session Audit

## Capability

This skill exposes a Session-based video script content audit through five OpenAPI endpoints:

```text
create Session
import material
execute one audit stage
query one or all stage statuses
get the Session result
```

The Session can contain three material forms:

| Material | Request form | Purpose |
|---|---|---|
| Client Brief | `material_type=brief`, `parameters.doc_type=client` | Business requirements and audit context |
| Script Brief | `material_type=brief`, `parameters.doc_type=script` | Script or dialogue source text |
| Video | `material_type=video` | Video analysis input |

The API uses `session_id` as the Session identifier. The request body never supplies `user_id`; the server derives the business identity from the API key tenant context.

## API Endpoints

```text
POST /openapi/v1/content-strategy/video-script-session-audit/sessions/create
POST /openapi/v1/content-strategy/video-script-session-audit/sessions/materials/import
POST /openapi/v1/content-strategy/video-script-session-audit/sessions/stages/execute
POST /openapi/v1/content-strategy/video-script-session-audit/sessions/stages/status
POST /openapi/v1/content-strategy/video-script-session-audit/sessions/result
```

All scripts use `CV_API_KEY`, `CV_USER_IDENTITY`, and the shared `_api_client.mjs` module.

## Stage Actions

`stage_execute` accepts only these actions:

| Action | Required input | Stage |
|---|---|---|
| `parse_brief` | completed Client Brief | `brief_parse` |
| `script_qc` | completed Client Brief and Script Brief | `script_qc` |
| `analyze_video` | completed Client Brief, Brief parse, and Video preprocessing | `video_analysis` |
| `run_audit` | usable Brief parse and Video analysis results | `content_audit` |
| `run_enhancement` | configured enhancement code in `parameters.code` | `enhancement` |

`script_line_comparison` is an enhancement code. It reads a completed Script Brief and completed video analysis; it is not a separate endpoint.

## Material Rules

- Brief URLs may be Google Docs/Drive URLs or publicly accessible HTTPS document/OSS URLs; downstream validation accepts supported Brief document types such as PDF, DOCX, and TXT.
- Video URLs may be Google Drive URLs, publicly accessible HTTPS video/OSS URLs, or URLs supported by the existing social video downloader.
- The Session API v1 does not accept multipart files, local paths, or `oss_key` values. When using the 6.15 media upload flow, pass its publicly accessible `oss_url`, not the `oss_key`.
- A successful material import means that material registration and processing have started. It does not mean processing is complete or durably queued.
- Use the status endpoint and the material stage (`brief_upload`, `brief_upload_script`, or `video_upload`) before starting dependent stages.

## Status Rules

Supported stages:

```text
brief_upload
brief_upload_script
brief_parse
script_qc
video_upload
video_analysis
content_audit
enhancement
```

Supported statuses are `pending`, `queued`, `processing`, `completed`, and `failed`. `pending` can mean that no record exists yet; it does not prove that a task was submitted. A stage result is usable only after its status is `completed`. On `failed`, surface the returned error message and retry the relevant operation only after correcting its input.

## Result Rules

The Session result is a stable result projection, not the complete eight-stage status aggregate. Check `stage_status` for all eight final statuses, including `brief_upload_script`, `script_qc`, and `enhancement`; `data.stages` in the result may omit those stages, and `data.briefs` may be empty. Read a specific Enhancement from `enhancement.data.enhancements` in the stage-status response by its `code`. Empty result fields do not mean that the audit passed or failed. Do not invent missing output or expose internal ORM fields, OSS keys, private URLs, file paths, or video slice/frame internals.

### Result Parsing

Use the stage-status response to decide whether a result is ready, then read the stage's `result_data`. The Session result is useful for the stable final projection, but stage status is the source of truth for stage completion and for results that are not projected there.

| Stage | Result location | How to interpret |
|---|---|---|
| `brief_parse` | `stage_status.data.result_data` or `result.data.brief_parse.result_data` | Structured Client Brief. Common fields include `brand`, `product`, `business_goal`, `campaign_goal`, `target_audience`, `selling_points`, `must_say`, `must_show`, `dont_say`, `dont_show`, `content_structure`, `creative_requirements`, and `compliance_requirements`. Treat empty or `uncertain_fields` entries as missing requirements, not as approval. |
| `script_qc` | `stage_status.data.result_data` | Script QC payload. Preserve the complete object because model output fields are extensible. `brief_parsed` and `script_text` are input/context echoes; do not present them as QC findings. Prefer explicit QC findings, scores, risks, and suggestions returned by the payload. |
| `video_analysis` | `stage_status.data.result_data` or `result.data.stages.video_analysis.result_data` | Usually wrapped as `call1_analysis`. Read the wrapper before extracting timeline, storyboard, audio/transcript, visual, shot, and evidence fields. Do not expose frame or slice URLs. |
| `content_audit` | `stage_status.data.result_data` or `result.data.report.result_data` | Final audit report. Use `overall_verdict` (`pass`, `conditional_pass`, `fail`, or `manual_review`), `overall_score` when present, `findings`, `revision_plan`, `overall_direction`, and `script_execution_alignment`. A `conditional_pass` means revision work remains; it is not a full pass. |
| `enhancement` | `stage_status.data.enhancements[]` | Select the item whose `code` equals the requested `parameters.code`, then read its `result_data`. Do not assume the Enhancement appears in `Session Result.data.stages`. |

Recommended presentation order: overall verdict and score, material/stage completion summary, key findings and evidence-safe timestamps, prioritized revision plan, then Enhancement output. Never use a missing field as a pass/fail signal. For a failed stage, report its `error_message` and do not parse `result_data` as a successful result.

## Script Index

| Script | Purpose |
|---|---|
| `video_script_session_audit_create.mjs` | Create a Session |
| `video_script_session_audit_material_import.mjs` | Import a Client Brief, Script Brief, or Video URL |
| `video_script_session_audit_stage_execute.mjs` | Submit one stage action |
| `video_script_session_audit_stage_status.mjs` | Query one or all stage statuses |
| `video_script_session_audit_result.mjs` | Fetch the Session result |
| `video_script_session_audit_poll.mjs` | Poll one stage until a terminal status |
