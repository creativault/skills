# Video Script Session Audit API Reference

## Endpoints

| Endpoint | Path | Purpose |
|---|---|---|
| Create Session | `/openapi/v1/content-strategy/video-script-session-audit/sessions/create` | Create a Session |
| Import material | `/openapi/v1/content-strategy/video-script-session-audit/sessions/materials/import` | Register a Brief or Video URL |
| Execute stage | `/openapi/v1/content-strategy/video-script-session-audit/sessions/stages/execute` | Submit one stage action |
| Stage status | `/openapi/v1/content-strategy/video-script-session-audit/sessions/stages/status` | Query one or all stage statuses |
| Session result | `/openapi/v1/content-strategy/video-script-session-audit/sessions/result` | Get the aggregate result |

All endpoints use POST JSON and the common `X-API-Key` and `X-User-Identity` headers. Do not send `user_id`; it is derived by the API from the tenant context.

## Create Session

```json
{"audit_category":"ecommerce","name":"Product audit"}
```

`audit_category` is required. `name` is optional. The response returns `data.session_id`.

## Import Material

```json
{
  "session_id":"<uuid>",
  "material_type":"brief",
  "source_url":"https://docs.google.com/document/d/<id>",
  "parameters":{"doc_type":"client"}
}
```

`material_type=brief` requires `parameters.doc_type` to be `client` or `script`. `client` is the Client Brief and is reported by stage `brief_upload`; `script` is the Script Brief and is reported by `brief_upload_script`.

```json
{
  "session_id":"<uuid>",
  "material_type":"video",
  "source_url":"https://www.tiktok.com/@creator/video/<id>"
}
```

Video imports are reported by `video_upload`. Brief URLs may be Google Docs/Drive URLs or publicly accessible HTTPS document/OSS URLs. Video URLs may be Google Drive URLs, publicly accessible HTTPS video/OSS URLs, or supported social-video URLs. v1 does not accept multipart files, local paths, or `oss_key` values; use a public `oss_url` when a separate upload flow returns both fields.

A successful import means registration and processing have started. It does not mean processing is complete or durably queued.

## Execute Stage

Request shape:

```json
{"session_id":"<uuid>","action":"<action>","parameters":{}}
```

Allowed actions:

| Action | Requirements | Result stage |
|---|---|---|
| `parse_brief` | Client Brief is complete | `brief_parse` |
| `script_qc` | Client Brief and Script Brief are complete | `script_qc` |
| `analyze_video` | Brief parse and video preprocessing are complete | `video_analysis` |
| `run_audit` | Brief parse and video analysis are available | `content_audit` |
| `run_enhancement` | `parameters.code` is configured | `enhancement` |

Every successful stage submission returns a normalized `task_id` and `status`. `script_line_comparison` is an enhancement code requiring a completed Script Brief and completed video analysis.

## Stage Status

Request:

```json
{"session_id":"<uuid>","stage":"video_analysis"}
```

Omit `stage` for the aggregate view. Supported stages are:

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

A stage status of `pending` can mean that no record exists yet. It is not proof that an asynchronous task was submitted. Only `completed` means that the stage result is ready; `failed` requires reading `error_message`.

## Session Result

```json
{"session_id":"<uuid>"}
```

The result is a stable Session result projection, not the complete eight-stage status aggregate. Use `stages/status` as the source of truth for all eight statuses; the result may omit `brief_upload_script`, `script_qc`, and `enhancement`, and `briefs` may be empty. Read a specific Enhancement from `enhancement.data.enhancements` in the stage-status response by `code`. Empty fields do not imply pass or fail. Do not expose internal ORM fields, OSS keys, private URLs, file paths, or internal video slice/frame data.

## Result Parsing Contract

After `status=completed`, parse the stage's `result_data`:

| Stage | Stable fields and interpretation |
|---|---|
| `brief_parse` | Structured Brief fields: `brand`, `product`, `business_goal`, `campaign_goal`, `target_audience`, `selling_points`, `must_say`, `must_show`, `dont_say`, `dont_show`, `content_structure`, `creative_requirements`, and `compliance_requirements`. |
| `script_qc` | Extensible Script QC object. Keep the full payload and surface explicit findings, scores, risks, and suggestions. `brief_parsed` and `script_text` are context echoes, not findings. |
| `video_analysis` | Usually wrapped under `call1_analysis`; use it for timeline, storyboard, transcript/audio, visual, shot, and evidence-safe analysis fields. Never expose frame/slice URLs. |
| `content_audit` | Read `overall_verdict`, `overall_score` when present, `findings`, `revision_plan`, `overall_direction`, and `script_execution_alignment`. `conditional_pass` means revision work remains. |
| `enhancement` | Find the requested `code` in `stage_status.data.enhancements[]`, then read that item's `result_data`. |

Use `stages/status` for completion and stage-specific results; use `sessions/result` for the stable final projection. Recommended presentation: verdict/score, stage summary, key findings, prioritized revisions, then Enhancement output. Missing fields are not approval signals.

Local DOCX and video files cannot be sent directly to this API. Upload them through an available object-storage flow first, then pass the resulting public HTTPS `oss_url` as `source_url`; never pass `oss_key` directly. On `42901`, preserve identifiers and wait before retrying without duplicate submissions. `42902` indicates daily quota exhaustion.
